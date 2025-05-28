import { ObtenerRutaMensajeNotificacion, ObtenerRutaLogos } from './accesoCarpetas';
import { enviarCorreos } from './settingsMail';
import pool from '../database';
import path from 'path'

// METODO PARA ENVIAR MENSAJES DE CUMPLEANIOS A UNA HORA DETERMINADA 

export const aniversario = async function () {

    // OBTENER RUTAS
    let separador = path.sep;
    const ruta_logo = ObtenerRutaLogos();
    const ruta_aniversario = ObtenerRutaMensajeNotificacion();
    // OBTENER FECHA Y HORA
    const date = new Date();
    const fecha = date.toJSON().split("T")[0];
    console.log('ejecutandose aniversario hora ', fecha)

    const EMPLEADOS = await pool.query(
        `
            SELECT 
                ig.nombre, 
                ig.apellido, 
                ig.correo, 
                ig.codigo,
                ig.id_contrato,
                e.id AS id_empresa,
                e.correo AS correo_empresa, 
                e.puerto, 
                e.password_correo, 
                e.servidor, 
                e.pie_firma, 
                e.cabecera_firma,
                e.nombre AS nombre_empresa,
                mn.asunto, 
                mn.mensaje, 
                mn.imagen, 
                mn.link, 
                c.fecha_ingreso,
                c.fecha_ingreso + INTERVAL '1 year' AS fecha_aniversario
            FROM 
                informacion_general AS ig
            JOIN e_sucursales AS s ON ig.id_suc = s.id
            JOIN e_empresa AS e ON s.id_empresa = e.id
            JOIN eu_empleado_contratos AS c ON c.id = ig.id_contrato
            JOIN e_message_notificaciones AS mn ON mn.tipo_notificacion = 'aniversario'
            WHERE 
                ig.estado = 1
                AND (c.fecha_ingreso + INTERVAL '1 year')::DATE = $1;
        `
        , [fecha]);

    if (EMPLEADOS.rowCount != 0) {

        var correos = BuscarCorreos(EMPLEADOS);
        console.log('correos ', correos)

        var usuarios = PresentarUsuarios(EMPLEADOS);

        // ENVIAR MAIL A TODOS LOS QUE NACIERON EN LA FECHA SELECCIONADA

        let message_url =
            `
                <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;"></p>
            `;
        if (EMPLEADOS.rows[0].link != null && EMPLEADOS.rows[0].link != '') {
            message_url =
                `
                    <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; text-align: center;">
                        <a style="background-color: #199319; color: white; padding: 15px 15px 15px 15px; text-decoration: none;" href="${EMPLEADOS.rows[0].url}">¡ VER FELICITACIONES !</a>
                    </p>
                `
        }

        // LEER IMAGEN DE CORREO CONFIGURADA - CABECERA
        if (EMPLEADOS.rows[0].cabecera_firma === null || EMPLEADOS.rows[0].cabecera_firma === '') {
            // IMAGEN POR DEFECTO
            EMPLEADOS.rows[0].cabecera_firma = 'cabecera_firma.png';
        }

        // LEER IMAGEN DE CORREO CONFIGURADA - PIE DE FIRMA
        if (EMPLEADOS.rows[0].pie_firma === null || EMPLEADOS.rows[0].pie_firma === '') {
            // IMAGEN POR DEFECTO
            EMPLEADOS.rows[0].pie_firma = 'pie_firma.png';
        }

        let data = {
            to: correos,
            from: EMPLEADOS.rows[0].correo_empresa,
            subject: EMPLEADOS.rows[0].asunto,
            html:
                `
                    <body style="font-family: Arial, sans-serif; font-size: 12px; color: rgb(11, 22, 121); line-height: 1.5; margin: 0; padding: 0;">

                        <div style="text-align: center;">
                            <img src="cid:cabeceraf" alt="Encabezado del correo"
                                style="display: block; width: 100%; height: auto; border: 0;" />
                        </div>

                        <hr style="border: none; border-top: 1px solid #aaa; margin: 20px 0;" />

                        <p style="color: rgb(11, 22, 121); font-size: 12px; line-height: 1.5;">
                            Este es un correo electrónico para felicitarte por tu aniversario. <br>  
                        </p>
                        
                        <div style="text-align: center;">
                            <p style="font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif; color: rgb(11, 22, 121); font-size: 18px;">
                                <b><i>${usuarios}</i></b>
                            </p>
                        </div>

                        <p style="color: rgb(11, 22, 121); font-size: 12px; line-height: 2em;">
                            ${EMPLEADOS.rows[0].mensaje}<br><br>
                            ${message_url}<br>
                        </p>
                                            
                        <div style="text-align: center;">
                            <img src="cid:aniversario" alt="Imagen de aniversario"
                                style="max-width: 100%; height: auto;" />
                                <br><br>
                        </div>

                        <hr style="border: none; border-top: 1px solid #aaa; margin: 20px 0;" />

                        <p style="color: #555; font-style: italic; font-size: 11px;">
                            <strong>Este correo ha sido generado automáticamente. Por favor, no responda a este mensaje.</strong>
                        </p>

                        <div style="text-align: center;">
                            <img src="cid:pief" alt="Pie de página del correo"
                                style="display: block; width: 100%; height: auto; border: 0;" />
                        </div>
                    </body>
                `
            ,
            attachments: [
                {
                    filename: 'cabecera_firma',
                    path: `${ruta_logo}${separador}${EMPLEADOS.rows[0].cabecera_firma}`,
                    cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                },
                {
                    filename: 'pie_firma',
                    path: `${ruta_logo}${separador}${EMPLEADOS.rows[0].pie_firma}`,
                    cid: 'pief' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                },
                {
                    filename: 'aniversario',
                    path: `${ruta_aniversario}${separador}${EMPLEADOS.rows[0].imagen}`,
                    cid: 'aniversario' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                }
            ]
        };

        var corr = enviarCorreos(EMPLEADOS.rows[0].servidor, parseInt(EMPLEADOS.rows[0].puerto), EMPLEADOS.rows[0].correo_empresa, EMPLEADOS.rows[0].password_correo);
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


// FUNCION PARA BUSCAR CORREOS
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

// METODO PARA PRESENTAR INFORMACION DEL MENSAJE
export const PresentarUsuarios = function (datos: any) {
    var nombres: string = '';
    var mensaje: string = '';
    datos.rows.forEach((obj: any) => {
        mensaje = '¡TE DESEAMOS FELIZ ANIVERSARIO EN ' + obj.nombre_empresa.toUpperCase() + '!';
        nombres = nombres + obj.nombre + ' ' + obj.apellido + '<br>';
    })

    if (datos.rowCount > 1) {
        mensaje = '¡LES DESEAMOS FELIZ CUMPLEAÑOS!'
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

