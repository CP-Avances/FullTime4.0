import { ObtenerRutaBirthday, ObtenerRutaLogos } from './accesoCarpetas';
import { enviarCorreos } from './settingsMail';
import pool from '../database';
import path from 'path'
import { DateTime } from 'luxon';
import { BuscarAtrasos } from '../controlador/reportes/reportesAtrasosControlador';
import { ConvertirImagenBase64 } from './ImagenCodificacion';


// METODO PARA ENVIAR LISTA DE ATRASOS A UNA HORA DETERMINADA 

/** ********************************************************************************* **
   ** **                     IMPORTAR SCRIPT DE ARCHIVOS DE PDF                      ** **
   ** ********************************************************************************* **/


export const ImportarPDF = async function () {
    // @ts-ignore
    const pdfMake = await import('../assets/build/pdfmake.js');
    // @ts-ignore
    const pdfFonts = await import('../assets/build/vfs_fonts.js');
    pdfMake.default.vfs = pdfFonts.default.pdfMake.vfs;
    return pdfMake.default;
}


export const atrasosIndividual = async function () {
    //setInterval(async () => {

    const date = new Date();
    const hora = date.getHours();
    const minutos = date.getMinutes();
    const PARAMETRO_HORA = await pool.query(
        `
            SELECT * FROM ep_detalle_parametro WHERE id_parametro = 11
            `
    );

    if (PARAMETRO_HORA.rowCount != 0) {
        console.log("ver Parametro hora: ", PARAMETRO_HORA.rows[0].descripcion)
        if (hora === parseInt(PARAMETRO_HORA.rows[0].descripcion)) {
            console.log("ejecutando reporte de atrasos individuales")
            let informacion = await pool.query(
                `
            SELECT * FROM informacion_general AS ig
            WHERE ig.estado = $1
            ORDER BY ig.name_suc ASC
            `
                , [1]
            ).then((result: any) => { return result.rows });


            let arreglo_procesar: any = [];
            informacion.forEach((obj: any) => {
                arreglo_procesar.push({
                    id: obj.id ?? obj.id_empleado, // VERIFICA SI obj.id existe, SI NO, TOMA obj.id_empleado
                    nombre: obj.nombre,
                    apellido: obj.apellido,
                    codigo: obj.codigo,
                    cedula: obj.cedula,
                    correo: obj.correo,
                    genero: obj.genero,
                    id_cargo: obj.id_cargo,
                    id_contrato: obj.id_contrato,
                    sucursal: obj.name_suc,
                    id_suc: obj.id_suc,
                    id_regimen: obj.id_regimen,
                    id_depa: obj.id_depa,
                    id_cargo_: obj.id_cargo_, // TIPO DE CARGO
                    ciudad: obj.ciudad,
                    regimen: obj.name_regimen,
                    departamento: obj.name_dep,
                    cargo: obj.name_cargo,
                    hora_trabaja: obj.hora_trabaja,
                    rol: obj.name_rol,
                    userid: obj.userid,
                    app_habilita: obj.app_habilita,
                    web_habilita: obj.web_habilita,
                    comunicado_mail: obj.comunicado_mail,
                    comunicado_noti: obj.comunicado_notificacion
                })
            })

            let seleccionados: any = [{ nombre: 'Empleados' }];
            seleccionados[0].empleados = arreglo_procesar;
            let datos: any[] = seleccionados;

            let n: Array<any> = await Promise.all(datos.map(async (suc: any) => {
                suc.empleados = await Promise.all(suc.empleados.map(async (o: any) => {
                    o.atrasos = await BuscarAtrasos('2024/12/01', '2024/12/28', o.id);
                    return o;
                }));
                return suc;
            }));

            let nuevo = n.map((e: any) => {
                e.empleados = e.empleados.filter((a: any) => { return a.atrasos.length > 0 })
                return e
            }).filter(e => { return e.empleados.length > 0 })

            // ARREGLO DE EMPLEADOS
            let arregloEmpleados = nuevo[0].empleados;
            let separador = path.sep;
            // OBTENER RUTAS
            const ruta_logo = ObtenerRutaLogos();
            // OBTENER FECHA Y HORA

            const FORMATO_FECHA = await pool.query(
                `
            SELECT * FROM ep_detalle_parametro WHERE id_parametro = 1
            `
            );
            const FORMATO_HORA = await pool.query(
                `
            SELECT * FROM ep_detalle_parametro WHERE id_parametro = 2
            `
            );

            let formato_fecha: string = FORMATO_FECHA.rows[0].descripcion;
            let formato_hora: string = FORMATO_HORA.rows[0].descripcion;
            let idioma_fechas: string = 'es';
            let dia_abreviado: string = 'ddd';
            let dia_completo: string = 'dddd'

            const file_name = await pool.query(
                `
           SELECT nombre, logo FROM e_empresa 
           `
            )
                .then((result: any) => {
                    return result.rows[0];
                });

            const fecha = FormatearFecha(DateTime.now().toISO(), formato_fecha, dia_completo, idioma_fechas)
            const hora_reporte = FormatearHora(DateTime.now().toFormat('HH:mm:ss'), formato_hora);
            console.log('ejecutandose hora ', hora, ' minuto ', minutos, 'fecha ', fecha)
            // VERIFICAR HORA DE ENVIO

            const Empre = await pool.query(
                `
                                SELECT  s.id_empresa, ce.correo AS correo_empresa, ce.puerto, ce.password_correo, ce.servidor, 
                                    ce.pie_firma, ce.cabecera_firma  
                                FROM  e_sucursales AS s, e_empresa AS ce 
                                WHERE  s.id_empresa = ce.id `
            );




            // LEER IMAGEN DE CORREO CONFIGURADA - CABECERA
            if (Empre.rows[0].cabecera_firma === null || Empre.rows[0].cabecera_firma === '') {
                // IMAGEN POR DEFECTO
                Empre.rows[0].cabecera_firma = 'cabecera_firma.png';
            }

            // LEER IMAGEN DE CORREO CONFIGURADA - PIE DE FIRMA
            if (Empre.rows[0].pie_firma === null || Empre.rows[0].pie_firma === '') {
                // IMAGEN POR DEFECTO
                Empre.rows[0].pie_firma = 'pie_firma.png';
            }



            /// for each
            arregloEmpleados.forEach((item: any) => {
                let dateTimeHorario = DateTime.fromSQL(item.atrasos[0].fecha_hora_horario);
                let isoStringHorario = dateTimeHorario.toISO();

                let fechaHora = ''
                if (isoStringHorario) {
                    let horaHorario = FormatearHora(DateTime.fromISO(isoStringHorario).toFormat('HH:mm:ss'), formato_hora);
                    fechaHora = FormatearFecha(isoStringHorario, formato_fecha, dia_completo, idioma_fechas) + ' ' + horaHorario;
                }

                const dateTimeTimbre = DateTime.fromSQL(item.atrasos[0].fecha_hora_timbre);
                const isoStringTimbre = dateTimeTimbre.toISO();

                let fechaTimbre = ''
                if (isoStringTimbre) {
                    let horaTimbre = FormatearHora(DateTime.fromISO(isoStringTimbre).toFormat('HH:mm:ss'), formato_hora);
                    fechaTimbre = FormatearFecha(isoStringTimbre, formato_fecha, dia_completo, idioma_fechas) + ' ' + horaTimbre;

                }

                let data = {
                    to: item.correo,
                    from: Empre.rows[0].correo_empresa,
                    subject: 'NOTIFICACIÓN DE ATRASO',
                    html:
                        `
                                    <body>
                                        <div style="text-align: center;">
                                            <img width="100%" height="100%" src="cid:cabeceraf"/>
                                        </div>
                                        <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                                            El presente correo es para informarle que se ha registrado un atraso en su marcación.<br>  
                                        </p>
                                        <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;" >
                                        <b>Empresa:</b> ${file_name.nombre}<br>
                                        <b>Asunto:</b> NOTIFICACIÓN DE ATRASO <br>
                                        <b>Colaborador:</b> ${item.nombre + ' ' + item.apellido} <br>
                                        <b>Cargo:</b> ${item.cargo} <br> 
                                        <b>Departamento:</b>${item.departamento}<br>
                                        <b>Fecha de envío:</b> ${fecha} <br> 
                                        <b>Hora de envío:</b> ${hora_reporte} <br>       
                                        <b>Notificación:</b><br>
                                            Queremos informarle que el sistema ha registrado un atraso correspondiente a su marcación de entrada.<br>  
                                        <b>Fecha:</b> ${fecha} <br>       
                                        <b>Horario:</b> ${fechaHora} <br>
                                        <b>Timbre:</b> ${fechaTimbre} <br>
                                        <b>tolerancia:</b> ${item.atrasos[0].tolerancia} <br>
                                        </p>
                                        <p style="font-family: Arial; font-size:12px; line-height: 1em;">
                                        <b>Este correo es generado automáticamente. Por favor no responda a este mensaje.</b><br>
                                        </p>
                                        <img src="cid:pief" width="100%" height="100%"/>
                                    </body>
                                    `
                    ,
                    attachments: [
                        {
                            filename: 'cabecera_firma.jpg',
                            path: `${ruta_logo}${separador}${Empre.rows[0].cabecera_firma}`,
                            cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                        },
                        {
                            filename: 'pie_firma.jpg',
                            path: `${ruta_logo}${separador}${Empre.rows[0].pie_firma}`,
                            cid: 'pief' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                        }
                    ]
                };

                var corr = enviarCorreos(Empre.rows[0].servidor, parseInt(Empre.rows[0].puerto), Empre.rows[0].correo_empresa, Empre.rows[0].password_correo);
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
            })
        }
    }
}

export const FormatearFecha = function (fecha: string, formato: string, dia: string, idioma: string): string {
    let valor: string;
    // PARSEAR LA FECHA CON LUXON
    const fechaLuxon = DateTime.fromISO(fecha).setLocale(idioma);
    // MANEJAR EL FORMATO PARA EL DIA
    if (dia === 'ddd') {
        const diaAbreviado = fechaLuxon.toFormat('EEE').charAt(0).toUpperCase() +
            fechaLuxon.toFormat('EEE').slice(1);
        valor = diaAbreviado + '. ' + fechaLuxon.toFormat(formato);
    }
    else if (dia === 'no') {
        valor = fechaLuxon.toFormat(formato);
    }
    else {
        const diaCompleto = fechaLuxon.toFormat('EEEE').charAt(0).toUpperCase() +
            fechaLuxon.toFormat('EEEE').slice(1);
        valor = diaCompleto + '. ' + fechaLuxon.toFormat(formato);
    }
    return valor;
}

export const FormatearHora = function (hora: string, formato: string) {
    const horaLuxon = DateTime.fromFormat(hora, 'HH:mm:ss');
    let valor = horaLuxon.toFormat(formato);
    return valor;
}



