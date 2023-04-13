import { enviarCorreos } from './settingsMail';
import pool from '../database';
import path from 'path'

// METODO PARA ENVIAR LOS CUMPLEAÑOS A UNA HORA DETERMINADA, VERIFICANDO A CADA HORA HASTA QUE 
// SEAN LAS 12 PM Y SE ENVIE EL CORREO

export const cumpleanios = function () {
    setInterval(async () => {

        const path_folder = path.resolve('logos')
        const path_folder_ = path.resolve('cumpleanios')
        const date = new Date();
        const hora = date.getHours();
        const minutos = date.getMinutes();
        const fecha = date.toJSON().slice(4).split("T")[0];
        console.log('datos h ', hora, ' minutos .. ', minutos)

        //if (hora === 17 && minutos === 6) {
        if (hora === 15 && minutos === 0) {
            const felizCumple = await pool.query(
                `
                SELECT da.nombre, da.apellido, da.correo, da.fec_nacimiento, s.id_empresa, 
                ce.correo AS correo_empresa, ce.puerto, ce.password_correo, ce.servidor, 
                ce.pie_firma, ce.cabecera_firma, m.titulo, m.mensaje, m.img, m.url  
                FROM datos_actuales_empleado AS da, sucursales AS s, message_birthday AS m,
                cg_empresa AS ce 
                WHERE CAST(da.fec_nacimiento AS VARCHAR) LIKE '%' || $1 AND da.id_sucursal = s.id
                `
                , [fecha]);

            if (felizCumple.rowCount > 0) {

                var correos = BuscarCorreos(felizCumple);

                var usuarios = PresentarUsuarios(felizCumple);

                console.log('ver infor correos', correos)

                // ENVIAR MAIL A TODOS LOS QUE NACIERON EN LA FECHA SELECCIONADA

                let message_url =
                    `<p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;"></p>`;
                if (felizCumple.rows[0].url != null) {
                    message_url = `<p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; text-align: center;">
                    <a style="background-color: #199319; color: white; padding: 15px 15px 15px 15px; text-decoration: none;" href="${felizCumple.rows[0].url}">¡ VER FELICITACIONES !</a></p>`
                }

                if (felizCumple.rows[0].cabecera_firma === null || felizCumple.rows[0].cabecera_firma === '') {
                    felizCumple.rows[0].cabecera_firma = 'cabecera_firma.png';
                }

                if (felizCumple.rows[0].pie_firma === null || felizCumple.rows[0].pie_firma === '') {
                    felizCumple.rows[0].pie_firma = 'pie_firma.png';
                }

                let data = {
                    to: correos,
                    from: felizCumple.rows[0].correo_empresa,
                    subject: felizCumple.rows[0].titulo,
                    html:
                        `
                            <body>
                                <div style="text-align: center;">
                                    <img width="25%" height="25%" src="cid:cabeceraf"/>
                                </div>
                                <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                                    Este es un correo electrónico para desearle un Feliz Cumpleaños. <br>  
                                </p>
                                <div style="text-align: center;">
                                    <p style="font-family:Cambria, Cochin, Georgia, Times, 'Times New Roman', serif; color:rgb(11, 22, 121); font-size:18px;">
                                        <b> <i> ${usuarios} </i> </b>
                                    </p>
                                </div>
                                <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 2em;">  
                                    ${felizCumple.rows[0].mensaje} <br><br>
                                    ${message_url} <br>
                                </p>
                                <div style="text-align: center;">
                                    <img src="cid:cumple"/> <br><br>
                                </div>
                                <br>                       
                                <p style="font-family: Arial; font-size:12px; line-height: 1em;">
                                    <b>Gracias por la atención</b><br>
                                    <b>Saludos cordiales,</b> <br><br>
                                </p>
                                <img src="cid:pief" width="50%" height="50%"/>
                            </body>
                        `,
                    attachments: [
                        {
                            filename: 'cabecera_firma.jpg',
                            path: `${path_folder}/${felizCumple.rows[0].cabecera_firma}`,
                            cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                        },
                        {
                            filename: 'pie_firma.jpg',
                            path: `${path_folder}/${felizCumple.rows[0].pie_firma}`,
                            cid: 'pief' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                        },
                        {
                            filename: 'birthday1.jpg',
                            path: `${path_folder_}/${felizCumple.rows[0].img}`,
                            cid: 'cumple' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                        }
                    ]
                };

                var corr = enviarCorreos(felizCumple.rows[0].servidor, parseInt(felizCumple.rows[0].puerto), felizCumple.rows[0].correo_empresa, felizCumple.rows[0].password_correo);
                corr.sendMail(data, function (error: any, info: any) {
                    if (error) {
                        corr.close();
                        console.log('Email error: ' + error);
                        return 'error';
                    } else {
                        corr.close();
                        console.log('Email sent: ' + info.response);
                        return 'ok';
                    }
                });

            }
        }
    }, 3600000);
    // }, 60000);

}


export const BuscarCorreos = function (datos: any) {
    var correos: string = '';
    datos.rows.forEach((obj: any) => {
        if (correos === '') {
            correos = obj.correo;
        } else {
            correos = correos + ', ' + obj.correo;
        }
    })
    return correos;
}

export const PresentarUsuarios = function (datos: any) {
    var nombres: string = '';
    datos.rows.forEach((obj: any) => {
        nombres = nombres + obj.nombre + ' ' + obj.apellido + '<br>';
    })

    var mensaje = '¡ TE DESEAMOS UN FELIZ CUMPLEAÑOS !';

    if (datos.rowCount > 1) {
        mensaje = '¡ LES DESEAMOS UN FELIZ CUMPLEAÑOS !'
    }

    var usuarios =
        `
        <h3 style="font-family: Arial; text-align: center;">${mensaje}</h3>
            <div style="text-align: center;"> 
             ${nombres}
            </div>
        `
    return usuarios;
}

