import { ObtenerRutaLogos } from './accesoCarpetas';
import { enviarCorreos } from './settingsMail';
import pool from '../database';
import path from 'path'
import { DateTime } from 'luxon';
import { BuscarFaltas } from '../controlador/reportes/reportesFaltasControlador';
import { ConvertirImagenBase64 } from './ImagenCodificacion';
import { io } from '../server';
import {
    fechaHora
} from '../libs/settingsMail';


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


export const faltasSemanal = async function () {
    const date = new Date(); // Fecha actual
    const hora = date.getHours();
    const dia = date.getDay();
    // Crear una copia del objeto Date antes de modificarlo
    const dateAntes = new Date(date);
    dateAntes.setDate(dateAntes.getDate() - 8);

    const dataActual = new Date(date);
    dataActual.setDate(dataActual.getDate() - 1);


    const fechaDiaActual = dataActual.toJSON().split("T")[0]; // Fecha actual
    const fechaSemanaAntes = dateAntes.toJSON().split("T")[0]; // 

    const PARAMETRO_SEMANAL = await pool.query(
        `
        SELECT * FROM ep_detalle_parametro WHERE id_parametro = 20
        `);

    const diasSemana = [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado"
    ];

    if (PARAMETRO_SEMANAL.rowCount != 0) {
        console.log("ver Parametro semanal: ", PARAMETRO_SEMANAL.rows[0].descripcion);
        if ('Si' === PARAMETRO_SEMANAL.rows[0].descripcion) {
            const PARAMETRO_DIA_SEMANAL = await pool.query(
                `
                SELECT * FROM ep_detalle_parametro WHERE id_parametro = 22                `);

            if (diasSemana[dia] === PARAMETRO_DIA_SEMANAL.rows[0].descripcion) {
                const PARAMETRO_HORA = await pool.query(
                    `
                SELECT * FROM ep_detalle_parametro WHERE id_parametro = 21
                `);

                console.log("ver Parametro hora: ", PARAMETRO_HORA.rows[0].descripcion)

                if (PARAMETRO_HORA.rowCount != 0) {
                    if (hora === parseInt(PARAMETRO_HORA.rows[0].descripcion)) {
                        faltas(fechaSemanaAntes, fechaDiaActual, true);
                        faltasDepartamentos(fechaSemanaAntes, fechaDiaActual, true);
                    }
                }
            }
        }
    }
}

export const faltasDiarios = async function () {
    const date = new Date();
    const hora = date.getHours();
    const fecha = date.toJSON().split("T")[0];
    const PARAMETRO_DIARIO = await pool.query(
        `
        SELECT * FROM ep_detalle_parametro WHERE id_parametro = 17
        `);

    if (PARAMETRO_DIARIO.rowCount != 0) {
        console.log("ver Parametro semanal: ", PARAMETRO_DIARIO.rows[0].descripcion);
        if ('Si' === PARAMETRO_DIARIO.rows[0].descripcion) {
            console.log("ver fecha de envio individual: ", fecha)
            const PARAMETRO_HORA = await pool.query(
                `
            SELECT * FROM ep_detalle_parametro WHERE id_parametro = 18
            `);

            console.log("ver Parametro hora: ", PARAMETRO_HORA.rows[0].descripcion)

            if (PARAMETRO_HORA.rowCount != 0) {
                if (hora === parseInt(PARAMETRO_HORA.rows[0].descripcion)) {
                    faltas(fecha, fecha, false);
                    faltasDepartamentos(fecha, fecha, false);
                    faltasIndividual(fecha, fecha);
                }
            }
        }
    }
    console.log("formato de hora:", hora);

    const PARAMETRO_HORA_INDIVIDUAL = await pool.query(
        `SELECT * FROM ep_detalle_parametro WHERE id_parametro = 40`
    );
    
    if (PARAMETRO_HORA_INDIVIDUAL.rowCount != 0) {
        if (hora === parseInt(PARAMETRO_HORA_INDIVIDUAL.rows[0].descripcion)) {
            faltasIndividual(fecha, fecha); 
        }
    }
}

export const faltas = async function (desde: any, hasta: any, semanal: any) {
    // VERIFICAR HORA DE ENVIO
    console.log("ejecutando reporte de faltas ")
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
            o.faltas = await BuscarFaltas(desde, hasta, o.id);
            return o;
        }));
        return suc;
    }));

    let nuevo = n.map((e: any) => {
        e.empleados = e.empleados.filter((a: any) => { return a.faltas.length > 0 })
        return e
    }).filter(e => { return e.empleados.length > 0 })

    //console.log("ver datos del reporte general: ", nuevo)

    if (nuevo.length != 0) {
        const pdfMake = await ImportarPDF();

        // DEFINIR INFORMACIÓN
        const resultado = await EstructurarDatosPDF(nuevo);
        resultado.map((obj: any) => {
            return obj;
        });

        const today = DateTime.now().toFormat('yyyy-MM-dd');

        const file_name = await pool.query(
            `
           SELECT nombre, logo FROM e_empresa 
           `
        )
            .then((result: any) => {
                return result.rows[0];
            });

        let separador = path.sep;

        let ruta = ObtenerRutaLogos() + separador + file_name.logo;

        const codificado = await ConvertirImagenBase64(ruta);

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

        let dia_abreviado: string = 'ddd';
        let dia_completo: string = 'dddd'

        let periodo = 'FECHA: ' + FormatearFecha(DateTime.now().toISO(), formato_fecha, dia_completo, idioma_fechas);
        let asunto = 'REPORTE DIARIO DE FALTAS';

        if (semanal == true) {
            periodo = 'PERIODO DEL: ' + desde + " AL " + hasta;
            asunto = 'REPORTE SEMANAL DE FALTAS';
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
                { text: `FALTAS - USUARIOS ACTIVOS`, bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
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
                itemsTableInfoTotal: { fontSize: 9, bold: true, alignment: 'center', fillColor: s_color },
                itemsTableTotal: { fontSize: 8, bold: true, alignment: 'right', fillColor: '#E3E3E3' },
                itemsTableCentradoTotal: { fontSize: 8, bold: true, alignment: 'center', fillColor: '#E3E3E3' },
                tableMargin: { margin: [0, 0, 0, 0] },
                tableMarginCabecera: { margin: [0, 15, 0, 0] },
                tableMarginCabeceraEmpleado: { margin: [0, 10, 0, 0] },
                tableMarginCabeceraTotal: { margin: [0, 20, 0, 0] },
            }
        }



        // Crear el PDF y obtener el buffer de manera asíncrona
        const pdfDocGenerator = pdfMake.createPdf(definicionDocumento);
        // Obtener el buffer del PDF generado
        const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
            pdfDocGenerator.getBuffer((buffer: any) => {
                if (buffer) {
                    resolve(Buffer.from(buffer));
                } else {
                    reject(new Error('Error al generar el buffer del PDF'));
                }
            });
        });

        // OBTENER RUTAS
        const ruta_logo = ObtenerRutaLogos();
        // OBTENER FECHA Y HORA
        const fecha = FormatearFecha(DateTime.now().toISO(), formato_fecha, dia_completo, idioma_fechas)
        const hora_reporte = FormatearHora(DateTime.now().toFormat('HH:mm:ss'), formato_hora);
        //PARAMETRO DE CORREO
        let id_parametro_correo = 19;

        if (semanal) {
            id_parametro_correo = 23;
        }

        const PARAMETRO_CORREO = await pool.query(
            `
            SELECT * FROM ep_detalle_parametro WHERE id_parametro = $1
            `, [id_parametro_correo]
        );

        if (PARAMETRO_CORREO.rowCount != 0) {
            const correos = PARAMETRO_CORREO.rows;
            correos.forEach(async (itemCorreo: any) => {
                const correo = itemCorreo.descripcion
                console.log("ver correo de reporte general: ", correo)
                const EMPLEADOS = await pool.query(
                    `
                                        SELECT da.nombre, da.apellido, da.correo, da.fecha_nacimiento, da.name_cargo, s.id_empresa, 
                                            ce.correo AS correo_empresa, ce.puerto, ce.password_correo, ce.servidor, 
                                            ce.pie_firma, ce.cabecera_firma  
                                        FROM configuracion_notificaciones_usuarios AS da, e_sucursales AS s, e_empresa AS ce 
                                        WHERE da.correo = $1 AND da.id_suc = s.id
                                            AND da.estado = 1 AND s.id_empresa = ce.id 
                                        `
                    , [correo]);

                if (EMPLEADOS.rowCount != 0) {

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
                        to: correo,
                        from: EMPLEADOS.rows[0].correo_empresa,
                        subject: asunto,
                        html:
                            `
                                        <body>
                                            <div style="text-align: center;">
                                                <img width="100%" height="100%" src="cid:cabeceraf"/>
                                            </div>
                                            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                                                Mediante el presente correo se adjunta el reporte de faltas.<br>  
                                            </p>
                                            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;" >
                                            <b>Empresa:</b> ${file_name.nombre}<br>
                                            <b>Asunto:</b> ${asunto} <br>
                                            <b>Fecha de envío:</b> ${fecha} <br> 
                                            <b>Hora de envío:</b> ${hora_reporte} <br>
                                            <b>Correo dirigido a:</b> <br> 
                                            ${usuarios} <br><br>                
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
                                path: `${ruta_logo}${separador}${EMPLEADOS.rows[0].cabecera_firma}`,
                                cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                            },
                            {
                                filename: 'pie_firma.jpg',
                                path: `${ruta_logo}${separador}${EMPLEADOS.rows[0].pie_firma}`,
                                cid: 'pief' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                            },
                            {
                                filename: 'Faltas.pdf', // Nombre del archivo adjunto
                                content: pdfBuffer, // El buffer generado por pdfmake
                                //contentType: 'application/pdf' // T

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
            })
        } else {
            console.log("no se encontro correo")
        }
    } else {
        console.log("no hay faltas")
    }
}


export const faltasDepartamentos = async function (desde: any, hasta: any, semanal: any) {

    console.log("ejecutando reporte de faltas de departamento")
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
            `).then((result: any) => { return result.rows });

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
                o.faltas = await BuscarFaltas(desde, hasta, o.id);
                return o;
            }));
            return suc;
        }));

        let nuevo = n.map((e: any) => {
            e.empleados = e.empleados.filter((a: any) => { return a.faltas.length > 0 })
            return e
        }).filter(e => { return e.empleados.length > 0 })

        if (nuevo.length != 0) {
            const pdfMake = await ImportarPDF();

            // DEFINIR INFORMACIÓN
            const resultado = await EstructurarDatosPDF(nuevo);
            resultado.map((obj: any) => {
                return obj;
            });

            const today = DateTime.now().toFormat('yyyy-MM-dd');

            const file_name = await pool.query(
                `
                       SELECT nombre, logo FROM e_empresa 
                    `
            )
                .then((result: any) => {
                    return result.rows[0];
                });

            let separador = path.sep;

            let ruta = ObtenerRutaLogos() + separador + file_name.logo;

            const codificado = await ConvertirImagenBase64(ruta);

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

            let dia_abreviado: string = 'ddd';
            let dia_completo: string = 'dddd'

            let periodo = 'FECHA: ' + FormatearFecha(DateTime.now().toISO(), formato_fecha, dia_completo, idioma_fechas);
            let asunto = 'REPORTE DIARIO DE FALTAS DEL DEPARTAMENTO DE ' + departamento;

            if (semanal == true) {
                periodo = 'PERIODO DEL: ' + desde + " AL " + hasta;
                asunto = 'REPORTE SEMANAL DE FALTAS DEL DEPARTAMENTO DE ' + departamento;
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
                    { text: `FALTAS - USUARIOS ACTIVOS`, bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
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
                    itemsTableInfoTotal: { fontSize: 9, bold: true, alignment: 'center', fillColor: s_color },
                    itemsTableTotal: { fontSize: 8, bold: true, alignment: 'right', fillColor: '#E3E3E3' },
                    itemsTableCentradoTotal: { fontSize: 8, bold: true, alignment: 'center', fillColor: '#E3E3E3' },
                    tableMargin: { margin: [0, 0, 0, 0] },
                    tableMarginCabecera: { margin: [0, 15, 0, 0] },
                    tableMarginCabeceraEmpleado: { margin: [0, 10, 0, 0] },
                    tableMarginCabeceraTotal: { margin: [0, 20, 0, 0] },
                }
            }

            // Crear el PDF y obtener el buffer de manera asíncrona
            const pdfDocGenerator = pdfMake.createPdf(definicionDocumento);
            // Obtener el buffer del PDF generado
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
            // VERIFICAR HORA DE ENVIO

            const EMPLEADOS = await pool.query(
                `
                                        SELECT da.nombre, da.apellido, da.correo, da.fecha_nacimiento, da.name_cargo, s.id_empresa, 
                                            ce.correo AS correo_empresa, ce.puerto, ce.password_correo, ce.servidor, 
                                            ce.pie_firma, ce.cabecera_firma  
                                        FROM configuracion_notificaciones_usuarios AS da, e_sucursales AS s, e_empresa AS ce 
                                        WHERE da.id_suc = s.id
                                            AND da.estado = 1 AND s.id_empresa = ce.id AND da.jefe = true AND da.name_dep = $1 AND da.id_suc = $2
                                `
                , [departamento, depa.id_sucursal]);

            if (EMPLEADOS.rowCount != 0) {
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
                    html:
                        `
                                        <body>
                                            <div style="text-align: center;">
                                                <img width="100%" height="100%" src="cid:cabeceraf"/>
                                            </div>
                                            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                                                Mediante el presente correo se adjunta el reporte de faltas.<br>  
                                            </p>
                                            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;" >
                                            <b>Empresa:</b> ${file_name.nombre}<br>
                                            <b>Asunto:</b> ${asunto}<br>
                                            <b>Departamento:</b> ${departamento}<br> 
                                            <b>Fecha de envío:</b> ${fecha} <br> 
                                            <b>Hora de envío:</b> ${hora_reporte} <br><br> 
                                            <b>Correo dirigido a:</b> <br>
                                            ${usuarios} <br><br>                
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
                            path: `${ruta_logo}${separador}${EMPLEADOS.rows[0].cabecera_firma}`,
                            cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                        },
                        {
                            filename: 'pie_firma.jpg',
                            path: `${ruta_logo}${separador}${EMPLEADOS.rows[0].pie_firma}`,
                            cid: 'pief' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                        },
                        {
                            filename: 'Faltas-Departamento.pdf', // Nombre del archivo adjunto
                            content: pdfBuffer, // El buffer generado por pdfmake
                            //contentType: 'application/pdf' // T

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
        }
    })
}

export const faltasIndividual = async function (desde: any, hasta: any) {

    console.log("ejecutando reporte de faltas individuales")

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
            app_habilita: obj.app_habilita,
            web_habilita: obj.web_habilita,
            comunicado_mail: obj.comunicado_mail,
            comunicado_noti: obj.comunicado_notificacion,
            faltas_notificacion: obj.faltas_notificacion,
            faltas_mail: obj.faltas_mail,

        })
    })

    let seleccionados: any = [{ nombre: 'Empleados' }];
    seleccionados[0].empleados = arreglo_procesar;
    let datos: any[] = seleccionados;

    let n: Array<any> = await Promise.all(datos.map(async (suc: any) => {
        suc.empleados = await Promise.all(suc.empleados.map(async (o: any) => {
            o.faltas = await BuscarFaltas(desde, hasta, o.id);
            return o;
        }));
        return suc;
    }));

    let nuevo = n.map((e: any) => {
        e.empleados = e.empleados.filter((a: any) => { return a.faltas.length > 0 })
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

        if (arregloEmpleados.length != 0) {
            arregloEmpleados.forEach(async (item: any) => {
                console.log("ver nombre de todos los empleados: ", item.nombre + ' '+ item.apellido)

                if (item.faltas_mail) {
                    console.log("ver nombre de los enviado correo: ", item.nombre + ' '+ item.apellido)

                    let dateTimeHorario = DateTime.fromSQL(item.faltas[0].fecha_hora_horario);
                    let isoStringHorario = dateTimeHorario.toISO();

                    let fechaHora = ''
                    if (isoStringHorario) {
                        let horaHorario = FormatearHora(DateTime.fromISO(isoStringHorario).toFormat('HH:mm:ss'), formato_hora);
                        fechaHora = FormatearFecha(isoStringHorario, formato_fecha, dia_completo, idioma_fechas) + ' ' + horaHorario;
                    }

                    const dateTimeTimbre = DateTime.fromSQL(item.faltas[0].fecha_hora_timbre);
                    const isoStringTimbre = dateTimeTimbre.toISO();

                    let fechaTimbre = ''
                    if (isoStringTimbre) {
                        let horaTimbre = FormatearHora(DateTime.fromISO(isoStringTimbre).toFormat('HH:mm:ss'), formato_hora);
                        fechaTimbre = FormatearFecha(isoStringTimbre, formato_fecha, dia_completo, idioma_fechas) + ' ' + horaTimbre;

                    }

                    let data = {
                        to: item.correo,
                        from: Empre.rows[0].correo_empresa,
                        subject: 'NOTIFICACIÓN DE FALTA',
                        html:
                            `
                                            <body>
                                                <div style="text-align: center;">
                                                    <img width="100%" height="100%" src="cid:cabeceraf"/>
                                                </div>
                                                <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                                                    El presente correo es para informarle que se ha registrado una inasistencia.<br>  
                                                </p>
                                                <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;" >
                                                <b>Empresa:</b> ${file_name.nombre}<br>
                                                <b>Asunto:</b> NOTIFICACIÓN DE FALTA <br>
                                                <b>Colaborador:</b> ${item.nombre + ' ' + item.apellido} <br>
                                                <b>Cargo:</b> ${item.cargo} <br> 
                                                <b>Departamento:</b>${item.departamento}<br>
                                                <b>Fecha de envío:</b> ${fecha} <br> 
                                                <b>Hora de envío:</b> ${hora_reporte} <br>       
                                                <b>Notificación:</b><br>
                                                    Queremos informarle que el sistema ha registrado su inasistencia.<br>  
                                                <b>Fecha:</b> ${fecha} <br>       
                                                <b>Observaciones:</b> Sin registro de marcaciones.<br>
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
                } else {
                    console.log("ver nombre sin correo: ", item.nombre + ' '+ item.apellido)
                }

                if (item.faltas_notificacion) {
                    var tiempoN = fechaHora();
                    let create_at = tiempoN.fecha_formato + ' ' + tiempoN.hora;

                    const response = await pool.query(
                        `
                        INSERT INTO ecm_realtime_timbres (fecha_hora, id_empleado_envia, id_empleado_recibe, descripcion, 
                        tipo, mensaje) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
                        `
                        , [create_at, 1, item.id, 'NOTIFICACIÓN DE FALTA', 6, 'No se registro timbres en su marcación.']);

                    if (response.rows.length != 0) {
                        console.log("se inserto notificación")
                    };

                    let x = response.rows[0]

                    let data_llega = {
                        id: x.id,
                        create_at: x.fecha_hora,
                        id_send_empl: 1,
                        id_receives_empl: x.id_empleado_recibe,
                        visto: false,
                        descripcion: x.mensaje,
                        mensaje: x.descripcion,
                        tipo: 6,
                        usuario: 'PLATAFORMA WEB'
                    }

                    io.emit('recibir_aviso', data_llega);


                }
            })
        } else {
            console.log("no hay empleados con faltas. ")
        }

    } else {
        console.log("no hay faltas individuales. ")
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
    datos.rows.forEach((obj: any) => {
        nombres = nombres + obj.nombre + ' ' + obj.apellido + ' - ' + obj.name_cargo + '<br>';
    })
    var usuarios = nombres
    return usuarios;
}

export const EstructurarDatosPDF = async function (data: any[]): Promise<Array<any>> {
    console.log(" ver datos del reporte de faltas: ", data);
    let totalFaltasEmpleado: number = 0;

    const FORMATO_FECHA = await pool.query(
        `
        SELECT * FROM ep_detalle_parametro WHERE id_parametro = 1
        `
    );

    let formato_fecha: string = FORMATO_FECHA.rows[0].descripcion;
    let idioma_fechas: string = 'es';
    let dia_abreviado: string = 'ddd';
    let general: any = [];
    let n: any = []
    let c = 0;

    data.forEach((selec: any) => {
        // CONTAR REGISTROS
        let arr_reg = selec.empleados.map((o: any) => { return o.faltas.length });
        let reg = SumarRegistros(arr_reg);

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
            faltas: reg
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
            totalFaltasEmpleado = 0;
            n.push({
                style: 'tableMargin',
                table: {
                    widths: ['*', '*'],
                    headerRows: 1,
                    body: [
                        [
                            { text: 'N°', style: 'tableHeader' },
                            { text: 'FECHA', style: 'tableHeader' },
                        ],
                        ...empl.faltas.map((usu: any) => {
                            const fecha = FormatearFecha(usu.fecha_horario, formato_fecha, dia_abreviado, idioma_fechas);
                            totalFaltasEmpleado++;
                            c = c + 1;
                            return [
                                { style: 'itemsTableCentrado', text: c },
                                { style: 'itemsTableCentrado', text: fecha },
                            ];
                        }),
                        [
                            { style: 'itemsTableCentradoTotal', text: 'TOTAL' },
                            { style: 'itemsTableCentradoTotal', text: totalFaltasEmpleado },
                        ],
                    ],
                },
                layout: {
                    fillColor: function (rowIndex: any) {
                        return rowIndex % 2 === 0 ? '#E5E7E9' : null;
                    },
                },
            });
        })
    })
    // RESUMEN TOTALES DE REGISTROS
    return n;
}

export const SumarRegistros = function (array: any[]) {
    let valor = 0;
    for (let i = 0; i < array.length; i++) {
        valor = valor + array[i];
    }
    return valor;
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



