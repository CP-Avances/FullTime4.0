import { BuscarSalidasAnticipadas } from '../controlador/reportes/salidaAntesControlador';
import { EMPRESA_CONTROLADOR } from '../controlador/configuracion/parametrizacion/catEmpresaControlador';
import { ObtenerRutaLogos } from './accesoCarpetas';
import { enviarCorreos } from './settingsMail';
import { ImportarPDF } from './pdf';
import { fechaHora } from '../libs/settingsMail';
import { DateTime } from 'luxon';
import { io } from '../server';
import pool from '../database';
import path from 'path'

/** ********************************************************************************************************* **
 ** **     METODOS PARA ENVIO DE NOTIIFCACIONES AUTOMATICAS DIARIAS DE SALIDAS ANTICIPADAS POR EMPLEADO    ** **
 ** ********************************************************************************************************* **/

// METODO DE ENVIO DE NOTIFICACIONES DE SALIDAS ANTICIPADAS POR EMPLEADO
export const salidasADiariosIndividual = async function () {
    const fecha = DateTime.now().toFormat('yyyy-MM-dd');
    console.log("ver fecha: ", fecha);
    salidasAnticipadasIndividual(fecha, fecha);
}

// METODO DE ENVIO DE NOTIFICACION DE SALIDAS ANTICIPADAS INDIVIDUAL
export const salidasAnticipadasIndividual = async function (desde: any, hasta: any) {
    const date = new Date();
    const hora = date.getHours();
    const minutos = date.getMinutes();
    console.log("ejecutando reporte de salidas anticipadas individuales")
    let informacion = await pool.query(
        `
            SELECT * FROM configuracion_notificaciones_usuarios AS ig
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
            identificacion: obj.identificacion,
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
            salidas_anticipadas_notificacion: obj.salidas_anticipadas_notificacion,
            salidas_anticipadas_mail: obj.salidas_anticipadas_mail
        })
    })

    let seleccionados: any = [{ nombre: 'Empleados' }];
    seleccionados[0].empleados = arreglo_procesar;
    let datos: any[] = seleccionados;

    let n: Array<any> = await Promise.all(datos.map(async (suc: any) => {
        suc.empleados = await Promise.all(suc.empleados.map(async (o: any) => {
            o.salidas = await BuscarSalidasAnticipadas(desde, hasta, o.id);
            return o;
        }));
        return suc;
    }));

    let nuevo = n.map((e: any) => {
        e.empleados = e.empleados.filter((a: any) => { return a.salidas.length > 0 })
        return e
    }).filter(e => { return e.empleados.length > 0 })

    if (nuevo.length != 0) {
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
                SELECT  
                    s.id_empresa, ce.correo AS correo_empresa, ce.puerto, ce.password_correo, ce.servidor, 
                    ce.pie_firma, ce.cabecera_firma  
                FROM  
                    e_sucursales AS s, e_empresa AS ce 
                WHERE  
                    s.id_empresa = ce.id
            `
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

        if (arregloEmpleados.length != 0) {
            arregloEmpleados.forEach(async (item: any) => {
                const minutos = SegundosAMinutosConDecimales(Number(item.salidas[0].diferencia))
                const tiempo = MinutosAHorasMinutosSegundos(minutos);
                if (item.salidas_anticipadas_mail) {
                    let dateTimeHorario = DateTime.fromSQL(item.salidas[0].fecha_hora_horario);
                    let isoStringHorario = dateTimeHorario.toISO();

                    let fechaHora = ''
                    if (isoStringHorario) {
                        let horaHorario = FormatearHora(DateTime.fromISO(isoStringHorario).toFormat('HH:mm:ss'), formato_hora);
                        fechaHora = FormatearFecha(isoStringHorario, formato_fecha, dia_completo, idioma_fechas) + ' ' + horaHorario;
                    }

                    const dateTimeTimbre = DateTime.fromSQL(item.salidas[0].fecha_hora_timbre);
                    const isoStringTimbre = dateTimeTimbre.toISO();

                    let fechaTimbre = ''
                    if (isoStringTimbre) {
                        let horaTimbre = FormatearHora(DateTime.fromISO(isoStringTimbre).toFormat('HH:mm:ss'), formato_hora);
                        fechaTimbre = FormatearFecha(isoStringTimbre, formato_fecha, dia_completo, idioma_fechas) + ' ' + horaTimbre;
                    }

                    let data = {
                        to: item.correo,
                        from: Empre.rows[0].correo_empresa,
                        subject: 'NOTIFICACIÓN DE SALIDAS ANTICIPADAS',
                        html:
                            `
                                <body style="font-family: Arial, sans-serif; font-size: 12px; color: rgb(11, 22, 121); line-height: 1.5;">
    
                                    <div style="text-align: center; margin: 0; padding: 0;">
                                        <img src="cid:cabeceraf" 
                                            alt="Encabezado"
                                            style="display: block; width: 100%; height: auto; margin: 0; padding: 0; border: 0;" />
                                    </div>
                                    
                                    <hr style="border: none; border-top: 1px solid #aaa; margin: 20px 0;" />

                                    <p>
                                        El presente correo es para informarle que se ha registrado una salida anticipada en su marcación.<br>  
                                    </p>
                                            
                                    <p>
                                        <strong>Empresa:</strong> ${file_name.nombre}<br>
                                        <strong>Asunto:</strong> NOTIFICACIÓN DE SALIDAS ANTICIPADAS <br>
                                        <strong>Colaborador:</strong> ${item.nombre + ' ' + item.apellido} <br>
                                        <strong>Cargo:</strong> ${item.cargo} <br> 
                                        <strong>Departamento:</strong>${item.departamento}<br>
                                        <strong>Fecha de envío:</strong> ${fecha} <br> 
                                        <strong>Hora de envío:</strong> ${hora_reporte} <br>       
                                        <strong>Notificación:</strong><br>
                                        Queremos informarle que el sistema ha registrado una salida anticipada.<br>        
                                        <strong>Horario:</strong> ${fechaHora} <br>
                                        <strong>Timbre:</strong> ${fechaTimbre} <br>
                                        <strong>Tiempo total de salida anticipada:</strong> ${tiempo} <br>
                                    </p>

                                    <hr style="border: none; border-top: 1px solid #aaa; margin: 20px 0;" />

                                    <p style="color: #555; font-style: italic; font-size: 11px;">
                                        <strong>Este correo ha sido generado automáticamente. Por favor, no responda a este mensaje.</strong>
                                    </p>
                                    
                                    <div style="text-align: center; margin: 0; padding: 0;">
                                        <img src="cid:pief" alt="Pie de página"
                                            style="display: block; width: 100%; height: auto; margin: 0; padding: 0; border: 0;" />
                                    </div>

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
                }

                if (item.salidas_anticipadas_notificacion) {
                    var tiempoN = fechaHora();
                    let create_at = tiempoN.fecha_formato + ' ' + tiempoN.hora;
                    // MENSAJE NOTIFICACION
                    let mensaje = '';
                    mensaje = item.salidas[0].fecha_hora_horario + '//' + item.salidas[0].fecha_hora_timbre + '//' + tiempo + '//Salida realizada fuera del horario establecido.';
                    console.log('mensajes ', mensaje)
                    const response = await pool.query(
                        `
                            INSERT INTO ecm_realtime_timbres (fecha_hora, id_empleado_envia, id_empleado_recibe, descripcion, 
                            tipo, mensaje) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
                        `
                        , [create_at, 0, item.id, 'NOTIFICACIÓN DE SALIDAS ANTICIPADAS', 102, mensaje]);

                    if (response.rows.length != 0) {
                        console.log("se inserto notificación")
                    };

                    let x = response.rows[0]

                    let data_llega = {
                        id: x.id,
                        create_at: x.fecha_hora,
                        id_send_empl: 0,
                        id_receives_empl: x.id_empleado_recibe,
                        visto: false,
                        descripcion: x.descripcion,
                        mensaje: x.mensaje,
                        tipo: 102,
                        usuario: 'PLATAFORMA WEB'
                    }

                    io.emit('recibir_aviso', data_llega);
                }
            })
        } else {
            console.log("no hay empleados con salidas anticipadas")
        }

    } else {
        console.log("no existen datos individuales")
    }
}

/** *************************************************************************************************************** **
 ** **     METODOS PARA ENVIO DE NOTIIFCACIONES AUTOMATICAS SEMANAL DE SALIDAS ANTICIPADAS POR DEPARTAMENTOS     ** **
 ** *************************************************************************************************************** **/

// METODO DE ENVIO DE REPORTE DE SALIDAS ANTICIPADAS SEMANALES
export const salidasAnticipadasSemanal = async function () {
    const date = DateTime.now(); // FECHA ACTUAL
    const fecha = date.toFormat('yyyy-MM-dd'); // FECHA ACTUAL
    const fechaSemanaAntes = date.minus({ week: 1 }).toFormat('yyyy-MM-dd'); // FECHA HACE UNA SEMANA
    console.log("ver fecha: ", fecha, fechaSemanaAntes);
    salidasAnticipadasDepartamentos(fechaSemanaAntes, fecha, true);
}


/** ************************************************************************************************************ **
 ** **     METODOS PARA ENVIO DE NOTIIFCACIONES AUTOMATICAS DIARIAS DE SALIDAS ANTICIPADAS POR DEPARTAMENTOS     ** 
 ** ************************************************************************************************************ **/

// METODO DE ENVIO DE REPORTE DE SALIDAS ANTICIPADAS DIARIOS
export const salidasAnticipadasDiarios = async function () {
    const fecha = DateTime.now().toFormat('yyyy-MM-dd');
    console.log("ver fecha: ", fecha);
    salidasAnticipadasDepartamentos(fecha, fecha, false);

}

// METODO PARA CONSTRUIR REPORTE DE SALIDAS ANTICIPADAS
export const salidasAnticipadasDepartamentos = async function (desde: any, hasta: any, semanal: any) {
    const date = new Date();
    const hora = date.getHours();
    const minutos = date.getMinutes();
    console.log("ejecutando reporte de salidas anticipadas de departamento")
    let informacion = await pool.query(
        `
            SELECT * FROM configuracion_notificaciones_usuarios AS ig
            WHERE ig.estado = $1
            ORDER BY ig.name_suc ASC
        `
        , [1]
    ).then((result: any) => { return result.rows });

    let departamentos = await pool.query(
        `
            SELECT * FROM ed_departamentos
        `
    ).then((result: any) => { return result.rows });

    departamentos.forEach(async (depa: any) => {
        let departamento = depa.nombre;

        let gerencia = []
        gerencia = informacion.filter((item: any) => item.name_dep === departamento && item.id_suc === depa.id_sucursal);

        let arreglo_procesar: any = [];
        gerencia.forEach((obj: any) => {
            arreglo_procesar.push({
                id: obj.id ?? obj.id_empleado, // VERIFICA SI obj.id existe, SI NO, TOMA obj.id_empleado
                nombre: obj.nombre,
                apellido: obj.apellido,
                codigo: obj.codigo,
                identificacion: obj.identificacion,
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
            })
        })

        let seleccionados: any = [{ nombre: 'Empleados' }];
        seleccionados[0].empleados = arreglo_procesar;
        let datos: any[] = seleccionados;

        let n: Array<any> = await Promise.all(datos.map(async (suc: any) => {
            suc.empleados = await Promise.all(suc.empleados.map(async (o: any) => {
                o.salidas = await BuscarSalidasAnticipadas(desde, hasta, o.id);
                return o;
            }));
            return suc;
        }));

        let nuevo = n.map((e: any) => {
            e.empleados = e.empleados.filter((a: any) => { return a.salidas.length > 0 })
            return e
        }).filter(e => { return e.empleados.length > 0 })

        if (nuevo.length != 0) {
            const pdfMake = await ImportarPDF();

            // DEFINIR INFORMACION
            const resultado = await EstructurarDatosPDF(nuevo);
            resultado.map((obj: any) => {
                return obj;
            });

            let separador = path.sep;

            const imagenEmpresa = await EMPRESA_CONTROLADOR.ObtenerImagenEmpresa();

            const codificado = imagenEmpresa.imagen;

            let logo = 'data:image/jpeg;base64,' + codificado;

            const EMPRESA = await pool.query(
                `
               SELECT * FROM e_empresa 
               `
            );

            let p_color = EMPRESA.rows[0].color_principal;
            let s_color = EMPRESA.rows[0].color_secundario;
            let frase = EMPRESA.rows[0].marca_agua;
            let nombre = EMPRESA.rows[0].nombre;

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
            let dia_completo: string = 'dddd'

            let periodo = 'FECHA: ' + FormatearFecha(DateTime.now().toISO(), formato_fecha, dia_completo, idioma_fechas);
            let asunto = 'REPORTE DIARIO DE SALIDAS ANTICIPADAS DEL DEPARTAMENTO DE ' + departamento;

            if (semanal == true) {
                periodo = 'PERIODO DEL: ' + desde + " AL " + hasta;
                asunto = 'REPORTE SEMANAL DE SALIDAS ANTICIPADAS DEL DEPARTAMENTO DE ' + departamento;
            }

            let definicionDocumento = {
                pageSize: 'A4',
                pageOrientation: 'portrait',
                pageMargins: [40, 50, 40, 50],
                watermark: { text: frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
                footer: function (currentPage: any, pageCount: any, fecha: any) {
                    const f = new Date();
                    const fechaFormateada = f.toISOString().split('T')[0];
                    const time = f.toTimeString().split(' ')[0];
                    return {
                        margin: 10,
                        columns: [
                            { text: `Fecha: ${fechaFormateada} Hora: ${time}`, opacity: 0.3 },
                            {
                                text: [
                                    {
                                        text: `© Pag ${currentPage} de ${pageCount}`,
                                        alignment: 'right',
                                        opacity: 0.3
                                    }
                                ],
                            }
                        ],
                        fontSize: 10
                    };
                },
                content: [
                    { image: logo, width: 100, margin: [10, -25, 0, 5] },
                    { text: nombre.toUpperCase(), bold: true, fontSize: 14, alignment: 'center', margin: [0, 0, 0, 5] },
                    { text: asunto, bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
                    { text: periodo, bold: true, fontSize: 11, alignment: 'center', margin: [0, 0, 0, 0] },
                    ...resultado
                ],
                styles: {
                    derecha: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: s_color, alignment: 'left' },
                    tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: p_color },
                    tableHeaderSecundario: { fontSize: 8, bold: true, alignment: 'center', fillColor: s_color },
                    centrado: { fontSize: 8, bold: true, alignment: 'center', fillColor: p_color, margin: [0, 5, 0, 0] },
                    itemsTableInfo: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: s_color },
                    itemsTableInfoEmpleado: { fontSize: 9, margin: [0, -1, 0, -2], fillColor: '#E3E3E3' },
                    itemsTableCentrado: { fontSize: 8, alignment: 'center' },
                    itemsTableDerecha: { fontSize: 8, alignment: 'right' },
                    tableMargin: { margin: [0, 0, 0, 0] },
                    tableMarginCabecera: { margin: [0, 15, 0, 0] },
                    tableMarginCabeceraEmpleado: { margin: [0, 10, 0, 0] },
                }
            }

            // CREAR EL PDF Y OBTENER EL BUFFER DE MANERA ASINCRONA
            const pdfDocGenerator = pdfMake.createPdf(definicionDocumento);
            // OBTENER EL BUFFER DEL PDF GENERADO
            const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
                pdfDocGenerator.getBuffer((buffer: any) => {
                    if (buffer) {
                        resolve(Buffer.from(buffer));
                    } else {
                        reject(new Error('Error al generar el buffer del PDF'));
                    }
                });
            });

            const ruta_logo = ObtenerRutaLogos();
            // OBTENER FECHA Y HORA
            const fecha = FormatearFecha(DateTime.now().toISO(), formato_fecha, dia_completo, idioma_fechas)
            const hora_reporte = FormatearHora(DateTime.now().toFormat('HH:mm:ss'), formato_hora);
            console.log('ejecutandose hora ', hora, ' minuto ', minutos, 'fecha ', fecha)
            // VERIFICAR HORA DE ENVIO
            const EMPLEADOS = await pool.query(
                `
                    SELECT 
                        da.nombre, da.apellido, da.correo, da.fecha_nacimiento, da.name_cargo, s.id_empresa, 
                        ce.correo AS correo_empresa, ce.puerto, ce.password_correo, ce.servidor, 
                        ce.pie_firma, ce.cabecera_firma  
                    FROM 
                        configuracion_notificaciones_usuarios AS da, e_sucursales AS s, e_empresa AS ce 
                    WHERE 
                        da.id_suc = s.id
                        AND da.estado = 1 AND s.id_empresa = ce.id AND da.jefe = true AND da.name_dep = $1 AND da.id_suc = $2
                `
                , [departamento, depa.id_sucursal]);

            if (EMPLEADOS.rowCount != 0) {
                var general = await LeerCorreoGeneral(semanal);
                var correos = BuscarCorreos(EMPLEADOS);
                console.log('correos de jefes de departamento de ' + departamento + ' de la sucursal con id: ' + depa.id_sucursal, correos)
                var usuarios = PresentarUsuarios(EMPLEADOS);

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
                    subject: asunto,
                    bcc: general,
                    html:
                        `
                            <body style="font-family: Arial, sans-serif; font-size: 12px; color: rgb(11, 22, 121); line-height: 1.5;">
 
                                <div style="text-align: center; margin: 0; padding: 0;">
                                    <img src="cid:cabeceraf"
                                        alt="Encabezado"
                                        style="display: block; width: 100%; height: auto; margin: 0; padding: 0; border: 0;" />
                                </div>

                                <hr style="border: none; border-top: 1px solid #aaa; margin: 20px 0;" />

                                <p>
                                    Mediante el presente correo se adjunta el reporte de salidas anticipadas.
                                </p>
                                            
                                <p>
                                    <strong>Empresa:</strong> ${imagenEmpresa.nom_empresa}<br>
                                    <strong>Asunto:</strong> ${asunto}<br>
                                    <strong>Departamento:</strong> ${departamento}<br> 
                                    <strong>Fecha de envío:</strong> ${fecha} <br> 
                                    <strong>Hora de envío:</strong> ${hora_reporte} <br>
                                    <strong>Dirigido a:</strong> Coordinadores y Jefes Departamentales               
                                </p>
                                ${usuarios}                 
                                            
                                <hr style="border: none; border-top: 1px solid #aaa; margin: 20px 0;" />

                                <p style="color: #555; font-style: italic; font-size: 11px;">
                                    <strong>Este correo ha sido generado automáticamente. Por favor, no responda a este mensaje.</strong>
                                </p>

                                <div style="text-align: center; margin: 0; padding: 0;">
                                    <img src="cid:pief" alt="Pie de página"
                                        style="display: block; width: 100%; height: auto; margin: 0; padding: 0; border: 0;" />
                                </div>

                            </body>
                        `
                    ,
                    attachments: [
                        {
                            filename: 'cabecera_firma.jpg',
                            path: `${ruta_logo}${separador}${EMPLEADOS.rows[0].cabecera_firma}`,
                            cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                        },
                        {
                            filename: 'pie_firma.jpg',
                            path: `${ruta_logo}${separador}${EMPLEADOS.rows[0].pie_firma}`,
                            cid: 'pief' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                        },
                        {
                            filename: `${asunto}.pdf`, // NOMBRE DEL ARCHIVO ADJUNTO
                            content: pdfBuffer, // EL BUFFER GENERADO POR PDFMAKE

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



        } else {
            console.log("no existen registros para el departamento: ", departamento)
        }
    })

}


/** *************************************************************************************************** **
 ** **                    METODOS PARA LEER CORREOS DE PARAMETROS Y DE USUARIOS                      ** **
 ** *************************************************************************************************** **/

// METODOD PARA LEER CORREOS DEL PARAMETRO GENERAL
export const LeerCorreoGeneral = async function (semanal: any) {
    // PARAMETRO DE CORREO GENERAL DE REPORTE DE SALIDAS ANTICIPADAS DIARIOS ---> 28
    let id_parametro_correo = 28;

    if (semanal) {
        // PARAMETRO DE CORREO GENERAL DE REPORTE DE SALIDAS ANTICIPADAS DIARIOS ---> 32
        id_parametro_correo = 32;
    }

    const PARAMETRO_CORREO = await pool.query(
        `
            SELECT * FROM ep_detalle_parametro WHERE id_parametro = $1
        `
        , [id_parametro_correo]
    );
    var correo = '';

    if (PARAMETRO_CORREO.rowCount != 0) {

        PARAMETRO_CORREO.rows.forEach((obj: any) => {
            if (correo === '') {
                correo = obj.descripcion;
            } else {
                correo = correo + ', ' + obj.descripcion;
            }
        })
        return correo;

    } else {
        return '';
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
// METODO PARA PRESENTAR INFORMACION DEL MENSAJE
export const PresentarUsuarios = function (datos: any) {
    let usuarios =
        `
            <p style="margin: 0; font-weight: bold;">Destinatarios:</p>
            <ul style="margin: 2px 0 0 18px; padding: 0;">
        `;

    datos.rows.forEach((obj: any) => {
        usuarios += `<li style="margin: 0;">${obj.nombre} ${obj.apellido} - ${obj.name_cargo}</li>`;
    });

    usuarios += `
            </ul>
    `;

    return usuarios;
}


/** *************************************************************************************************** **
 ** **                                    METODOS PARA REALIZAR CALCULOS                             ** **
 ** *************************************************************************************************** **/

// METODO PARA SUMAR VALORES
export const SumarRegistros = function (array: any[]) {
    let valor = 0;
    for (let i = 0; i < array.length; i++) {
        valor = valor + array[i];
    }
    return valor;
}

// METODO PARA TRANSFORMAR SEGUNDOS - MINUTOS
export const SegundosAMinutosConDecimales = function (segundos: number) {
    return Number((segundos / 60).toFixed(2));
}

// METODO PARA TRANSFORMAR MINUTOS A HORAS
export const MinutosAHorasMinutosSegundos = function (minutos: number) {
    let seconds = minutos * 60;
    let hour: string | number = Math.floor(seconds / 3600);
    hour = (hour < 10) ? '0' + hour : hour;
    let minute: string | number = Math.floor((seconds / 60) % 60);
    minute = (minute < 10) ? '0' + minute : minute;
    let second: string | number = Number((seconds % 60).toFixed(0));
    second = (second < 10) ? '0' + second : second;
    return `${hour}:${minute}:${second}`;
}


/** *************************************************************************************************** **
 ** **                        METODOS PARA DAR FORMATO A LAS FECHAS Y HORAS                           ** **
 ** *************************************************************************************************** **/

// METOOD PARA FORMATEAR FECHAS
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

// METODO PARA FORMATEAR HORAS
export const FormatearHora = function (hora: string, formato: string) {
    const horaLuxon = DateTime.fromFormat(hora, 'HH:mm:ss');
    let valor = horaLuxon.toFormat(formato);
    return valor;
}


/** *************************************************************************************************** **
 ** **                             METODOS PARA DAR ESTRUCTURAR EL PDF                               ** **
 ** *************************************************************************************************** **/

// METODO PARA ESTRUCTURAR DATOS DE PDF
export const EstructurarDatosPDF = async function (data: any[]): Promise<Array<any>> {
    let formato_fecha: string = 'dd/MM/yyyy';
    let formato_hora: string = 'HH:mm:ss';
    let idioma_fechas: string = 'es';
    let dia_abreviado: string = 'ddd';

    let totalTiempoEmpleado: number = 0;
    let totalTiempo = 0;
    let general: any = [];
    let n: any = []
    let c = 0;

    data.forEach((selec: any) => {
        // CONTAR REGISTROS
        let arr_reg = selec.empleados.map((o: any) => { return o.salidas.length });
        let reg = SumarRegistros(arr_reg);
        // CONTAR MINUTOS DE ATRASOS
        totalTiempo = 0;
        selec.empleados.forEach((o: any) => {
            o.salidas.map((a: any) => {
                const minutos = SegundosAMinutosConDecimales(Number(a.diferencia));
                totalTiempo += Number(minutos);
            })
        })
        // NOMBRE DE CABECERAS DEL REPORTE DE ACUERDO CON EL FILTRO DE BUSQUEDA
        let descripcion = '';
        let establecimiento = 'SUCURSAL: ' + selec.sucursal;
        let opcion = selec.nombre;

        descripcion = 'LISTA EMPLEADOS';
        establecimiento = '';

        // DATOS DE RESUMEN GENERAL
        let informacion = {
            sucursal: selec.sucursal,
            nombre: opcion,
            formato_general: MinutosAHorasMinutosSegundos(Number(totalTiempo.toFixed(2))),
            formato_decimal: totalTiempo.toFixed(2),
        }
        general.push(informacion);
        // CABECERA PRINCIPAL
        n.push({
            style: 'tableMarginCabecera',
            table: {
                widths: ['*', '*', '*'],
                headerRows: 1,
                body: [
                    [
                        {
                            border: [true, true, false, true],
                            bold: true,
                            text: descripcion,
                            style: 'itemsTableInfo',
                        },
                        {
                            border: [false, true, false, true],
                            bold: true,
                            text: establecimiento,
                            style: 'itemsTableInfo',
                        },
                        {
                            border: [false, true, true, true],
                            text: 'N° Registros: ' + reg,
                            style: 'derecha',
                        },
                    ],
                ],
            },
        });
        // PRESENTACION DE LA INFORMACION
        selec.empleados.forEach((empl: any) => {
            n.push({
                style: 'tableMarginCabeceraEmpleado',
                table: {
                    widths: ['*', 'auto', 'auto'],
                    headerRows: 2,
                    body: [
                        [
                            {
                                border: [true, true, false, false],
                                text: 'C.C.: ' + empl.identificacion,
                                style: 'itemsTableInfoEmpleado',
                            },
                            {
                                border: [true, true, false, false],
                                text: 'EMPLEADO: ' + empl.apellido + ' ' + empl.nombre,
                                style: 'itemsTableInfoEmpleado',
                            },
                            {
                                border: [true, true, true, false],
                                text: 'COD: ' + empl.codigo,
                                style: 'itemsTableInfoEmpleado',
                            },
                        ],
                        [
                            {
                                border: [true, false, true, false],
                                text: 'RÉGIMEN LABORAL ' + empl.regimen,
                                style: 'itemsTableInfoEmpleado'
                            },
                            {
                                border: [true, false, false, false],
                                text: 'DEPARTAMENTO: ' + empl.departamento,
                                style: 'itemsTableInfoEmpleado'
                            },
                            {
                                border: [true, false, true, false],
                                text: 'CARGO: ' + empl.cargo,
                                style: 'itemsTableInfoEmpleado'
                            }
                        ]
                    ],
                },
            });
            // ENCERAR VARIABLES
            c = 0;
            totalTiempoEmpleado = 0;
            n.push({
                style: 'tableMargin',
                table: {
                    widths: ['auto', '*', 'auto', '*', 'auto', 'auto', 'auto'],
                    headerRows: 2,
                    body: [
                        [
                            { rowSpan: 2, text: 'N°', style: 'centrado' },
                            { rowSpan: 1, colSpan: 2, text: 'HORARIO', style: 'tableHeader' },
                            {},
                            { rowSpan: 1, colSpan: 2, text: 'TIMBRE', style: 'tableHeaderSecundario' },
                            {},

                            { rowSpan: 2, colSpan: 2, text: 'SALIDA ANTICIPADA', style: 'centrado' },
                            {}
                        ],
                        [
                            {},
                            { rowSpan: 1, text: 'FECHA', style: 'tableHeader' },
                            { rowSpan: 1, text: 'HORA', style: 'tableHeader' },
                            { rowSpan: 1, text: 'FECHA', style: 'tableHeaderSecundario' },
                            { rowSpan: 1, text: 'HORA', style: 'tableHeaderSecundario' },
                            {}, {},
                        ],
                        ...empl.salidas.map((usu: any) => {
                            // FORMATEAR FECHAS
                            const fechaHorario = FormatearFecha(usu.fecha_hora_horario.split(' ')[0], formato_fecha, dia_abreviado, idioma_fechas);
                            const fechaTimbre = FormatearFecha(usu.fecha_hora_timbre.split(' ')[0], formato_fecha, dia_abreviado, idioma_fechas);
                            const horaHorario = FormatearHora(usu.fecha_hora_horario.split(' ')[1], formato_hora);
                            const horaTimbre = FormatearHora(usu.fecha_hora_timbre.split(' ')[1], formato_hora);
                            // CONTABILIZAR MINUTOS
                            const minutos = SegundosAMinutosConDecimales(usu.diferencia);
                            const tiempo = MinutosAHorasMinutosSegundos(minutos);
                            totalTiempoEmpleado += Number(minutos);
                            c = c + 1
                            return [
                                { style: 'itemsTableCentrado', text: c },
                                { style: 'itemsTableCentrado', text: fechaHorario },
                                { style: 'itemsTableCentrado', text: horaHorario },
                                { style: 'itemsTableCentrado', text: fechaTimbre },
                                { style: 'itemsTableCentrado', text: horaTimbre },
                                { style: 'itemsTableCentrado', text: tiempo },
                                { style: 'itemsTableDerecha', text: minutos.toFixed(2) },
                            ];
                        }),
                    ],
                },
                layout: {
                    fillColor: function (rowIndex: any) {
                        return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
                    }
                }
            });
        })
    })
    // RESUMEN TOTALES DE REGISTROS
    return n;
}











