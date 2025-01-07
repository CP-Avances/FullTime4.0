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


export const atrasos = async function () {
    let separador = path.sep;
    setInterval(async () => {

        // OBTENER LOGO



        // BUSCAR TODOS Lo

        const today = DateTime.now().toFormat('yyyy-MM-dd');
        let informacion = await pool.query(
            `
            SELECT * FROM informacion_general AS ig
            WHERE ig.estado = $1
            ORDER BY ig.name_suc ASC
            `
            , [1]
        ).then((result: any) => { return result.rows });

        let departamentos = await pool.query(
            `
            SELECT * FROM ed_departamentos
            `
            , [1]
        ).then((result: any) => { return result.rows });

        let listaSinDuplicados: string[] = Array.from(new Set(departamentos));



        listaSinDuplicados.forEach(async (departamento: any) => {
            let gerencia = []
            gerencia = informacion.filter((item: any) => item.name_dep === departamento);

            let arreglo_procesar: any = [];
            gerencia.forEach((obj: any) => {
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
                    o.atrasos = await BuscarAtrasos(today, today, o.id);
                    return o;
                }));
                return suc;
            }));

            let nuevo = n.map((e: any) => {
                e.empleados = e.empleados.filter((a: any) => { return a.atrasos.length > 0 })
                return e
            }).filter(e => { return e.empleados.length > 0 })

            let resultadoDepartamento = await EstructurarDatosPDF(nuevo);
            resultadoDepartamento.map((obj: any) => {
                return obj;
            });

            let definicionDocumento = docDefinition(resultadoDepartamento)

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
            const date = new Date();
            const hora = date.getHours();
            const minutos = date.getMinutes();
            const fecha = date.toJSON().slice(4).split("T")[0];
            console.log('ejecutandose hora ', hora, ' minuto ', minutos, 'fecha ', fecha)
            // VERIFICAR HORA DE ENVIO
            const PARAMETRO_HORA = await pool.query(
                `
                SELECT * FROM ep_detalle_parametro WHERE id_parametro = 40
                `
            );

            if (PARAMETRO_HORA.rowCount != 0) {
                console.log("ver Parametro hora: ", PARAMETRO_HORA.rows[0].descripcion)
                if (hora === parseInt(PARAMETRO_HORA.rows[0].descripcion)) {

                    const PARAMETRO_CORREO = await pool.query(
                        `
                        SELECT * FROM ep_detalle_parametro WHERE id_parametro = 44
                        `
                    );

                    if (PARAMETRO_CORREO.rowCount != 0) {
                        //const correo = PARAMETRO_CORREO.rows[0].descripcion;
                        console.log("ver Parametro correo: ", PARAMETRO_CORREO.rows[0].descripcion)

                        const EMPLEADOS = await pool.query(
                            `
                                    SELECT da.nombre, da.apellido, da.correo, da.fecha_nacimiento, s.id_empresa, 
                                        ce.correo AS correo_empresa, ce.puerto, ce.password_correo, ce.servidor, 
                                        ce.pie_firma, ce.cabecera_firma  
                                    FROM informacion_general AS da, e_sucursales AS s, e_empresa AS ce 
                                    WHERE da.id_suc = s.id
                                        AND da.estado = 1 AND s.id_empresa = ce.id AND da.jefe = true AND da.name_dep = $1
                                    `
                            , [departamento]);

                        if (EMPLEADOS.rowCount != 0) {
                            var correos = BuscarCorreos(EMPLEADOS);
                            console.log('correos ', correos)
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
                                subject: 'Notificación de atraso',
                                html:
                                    `
                                    <body>
                                        <div style="text-align: center;">
                                            <img width="100%" height="100%" src="cid:cabeceraf"/>
                                        </div>
                                        <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                                            Este es un correo electrónico para informar atrasos <br>  
                                        </p>
                                        <div style="text-align: center;">
                                        <p style="font-family:Cambria, Cochin, Georgia, Times, 'Times New Roman', serif; color:rgb(11, 22, 121); font-size:18px;">
                                            <b> <i> ${usuarios} </i> </b>
                                        </p>
                                        </div>
                                        <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 2em;">  
                                        mensaje de atrasos
                                        </p>
                                       
                                        <br>                       
                                        <p style="font-family: Arial; font-size:12px; line-height: 1em;">
                                            <b>Gracias por la atención</b><br>
                                            <b>Saludos cordiales,</b> <br><br>
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
                                        filename: 'Atrasos.pdf', // Nombre del archivo adjunto
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
                        console.log("no se encontro correo")
                    }
                } else {
                    console.log("la hora no es igual ")

                }
            }


        })

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
                o.atrasos = await BuscarAtrasos(today, today, o.id);
                return o;
            }));
            return suc;
        }));

        let nuevo = n.map((e: any) => {
            e.empleados = e.empleados.filter((a: any) => { return a.atrasos.length > 0 })
            return e
        }).filter(e => { return e.empleados.length > 0 })



        const pdfMake = await ImportarPDF();

        // DEFINIR INFORMACIÓN
        const resultado = await EstructurarDatosPDF(nuevo);
        resultado.map((obj: any) => {
            return obj;
        });

        let definicionDocumento = docDefinition(resultado)

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
        const date = new Date();
        const hora = date.getHours();
        const minutos = date.getMinutes();
        const fecha = date.toJSON().slice(4).split("T")[0];
        console.log('ejecutandose hora ', hora, ' minuto ', minutos, 'fecha ', fecha)
        // VERIFICAR HORA DE ENVIO
        const PARAMETRO_HORA = await pool.query(
            `
            SELECT * FROM ep_detalle_parametro WHERE id_parametro = 40
            `
        );

        if (PARAMETRO_HORA.rowCount != 0) {
            console.log("ver Parametro hora: ", PARAMETRO_HORA.rows[0].descripcion)
            if (hora === parseInt(PARAMETRO_HORA.rows[0].descripcion)) {

                const PARAMETRO_CORREO = await pool.query(
                    `
                    SELECT * FROM ep_detalle_parametro WHERE id_parametro = 44
                    `
                );


                if (PARAMETRO_CORREO.rowCount != 0) {
                    const correo = PARAMETRO_CORREO.rows[0].descripcion;
                    console.log("ver Parametro correo: ", PARAMETRO_CORREO.rows[0].descripcion)

                    const EMPLEADOS = await pool.query(
                        `
                                SELECT da.nombre, da.apellido, da.correo, da.fecha_nacimiento, s.id_empresa, 
                                    ce.correo AS correo_empresa, ce.puerto, ce.password_correo, ce.servidor, 
                                    ce.pie_firma, ce.cabecera_firma  
                                FROM informacion_general AS da, e_sucursales AS s, e_empresa AS ce 
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
                            subject: 'Notificación de atraso',
                            html:
                                `
                                <body>
                                    <div style="text-align: center;">
                                        <img width="100%" height="100%" src="cid:cabeceraf"/>
                                    </div>
                                    <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                                        Este es un correo electrónico para informar atrasos <br>  
                                    </p>
                                    <div style="text-align: center;">
                                    <p style="font-family:Cambria, Cochin, Georgia, Times, 'Times New Roman', serif; color:rgb(11, 22, 121); font-size:18px;">
                                        <b> <i> ${usuarios} </i> </b>
                                    </p>
                                    </div>
                                    <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 2em;">  
                                    mensaje de atrasos
                                    </p>
                                   
                                    <br>                       
                                    <p style="font-family: Arial; font-size:12px; line-height: 1em;">
                                        <b>Gracias por la atención</b><br>
                                        <b>Saludos cordiales,</b> <br><br>
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
                                    filename: 'Atrasos.pdf', // Nombre del archivo adjunto
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
                    console.log("no se encontro correo")
                }
            } else {
                console.log("la hora no es igual ")

            }
        }
    }, 60000);
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

export const docDefinition = async function (datos: any) {
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

    return {
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
            { text: `ATRASOS - USUARIOS ACTIVOS`, bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
            { text: 'FECHA: ' + today, bold: true, fontSize: 11, alignment: 'center', margin: [0, 0, 0, 0] },
            ...datos
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
};



// METODO PARA PRESENTAR INFORMACION DEL MENSAJE
export const PresentarUsuarios = function (datos: any) {
    var nombres: string = '';
    datos.rows.forEach((obj: any) => {
        nombres = nombres + obj.nombre + ' ' + obj.apellido + '<br>';
    })

    var mensaje = '¡TE DESEAMOS FELIZ CUMPLEAÑOS!';

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

export const EstructurarDatosPDF = async function (data: any[]): Promise<Array<any>> {
    let formato_fecha: string = 'dd/MM/yyyy';
    let formato_hora: string = 'HH:mm:ss';
    let idioma_fechas: string = 'es';

    let dia_abreviado: string = 'ddd';
    let dia_completo: string = 'dddd';

    let totalTiempoEmpleado: number = 0;
    let totalTiempo = 0;
    let resumen = '';
    let general: any = [];
    let n: any = []
    let c = 0;
    let toleranciaP = '';

    const PARAMETRO_TOLERANCIA = await pool.query(
        `
        SELECT * FROM ep_detalle_parametro WHERE id_parametro = 3
        `
    );


    if (PARAMETRO_TOLERANCIA.rowCount != 0) {
        toleranciaP = PARAMETRO_TOLERANCIA.rows[0].descripcion;
    }
    data.forEach((selec: any) => {
        // CONTAR REGISTROS
        let arr_reg = selec.empleados.map((o: any) => { return o.atrasos.length });
        let reg = SumarRegistros(arr_reg);
        // CONTAR MINUTOS DE ATRASOS
        totalTiempo = 0;
        selec.empleados.forEach((o: any) => {
            o.atrasos.map((a: any) => {
                const minutos_ = SegundosAMinutosConDecimales(Number(a.diferencia));
                totalTiempo += Number(minutos_);
                return totalTiempo;
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
                                text: 'C.C.: ' + empl.cedula,
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
                    widths: ['auto', 'auto', 'auto', 'auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                    headerRows: 2,
                    body: [
                        [
                            { rowSpan: 2, text: 'N°', style: 'centrado' },
                            { rowSpan: 1, colSpan: 2, text: 'HORARIO', style: 'tableHeader' },
                            {},
                            { rowSpan: 1, colSpan: 2, text: 'TIMBRE', style: 'tableHeaderSecundario' },
                            {},
                            { rowSpan: 2, text: 'TIPO PERMISO', style: 'centrado' },
                            { rowSpan: 2, text: 'DESDE', style: 'centrado' },
                            { rowSpan: 2, text: 'HASTA', style: 'centrado' },
                            { rowSpan: 2, colSpan: 2, text: 'PERMISO', style: 'centrado' },
                            {},
                            { rowSpan: 2, text: 'TOLERANCIA', style: 'centrado' },
                            { rowSpan: 2, colSpan: 2, text: 'ATRASO', style: 'centrado' },
                            {}
                        ],
                        [
                            {},
                            { rowSpan: 1, text: 'FECHA', style: 'tableHeader' },
                            { rowSpan: 1, text: 'HORA', style: 'tableHeader' },
                            { rowSpan: 1, text: 'FECHA', style: 'tableHeaderSecundario' },
                            { rowSpan: 1, text: 'HORA', style: 'tableHeaderSecundario' },
                            {}, {}, {}, {},
                            {},
                            {},
                            {},
                            {},
                        ],
                        ...empl.atrasos.map((usu: any) => {
                            // FORMATEAR FECHAS
                            const fechaHorario = FormatearFecha(usu.fecha_hora_horario.split(' ')[0], formato_fecha, dia_abreviado, idioma_fechas);
                            const fechaTimbre = FormatearFecha(usu.fecha_hora_timbre.split(' ')[0], formato_fecha, dia_abreviado, idioma_fechas);
                            console.log('hora formato', formato_hora)
                            const horaHorario = FormatearHora(usu.fecha_hora_horario.split(' ')[1], formato_hora);
                            console.log('hora ', horaHorario)
                            const horaTimbre = FormatearHora(usu.fecha_hora_timbre.split(' ')[1], formato_hora);
                            var tolerancia = '00:00:00';


                            if (toleranciaP !== '1') {
                                tolerancia = MinutosAHorasMinutosSegundos(Number(usu.tolerancia));
                            }
                            const minutos = SegundosAMinutosConDecimales(Number(usu.diferencia));
                            const tiempo = MinutosAHorasMinutosSegundos(minutos);
                            totalTiempoEmpleado += Number(minutos);
                            c = c + 1
                            return [
                                { style: 'itemsTableCentrado', text: c },
                                { style: 'itemsTableCentrado', text: fechaHorario },
                                { style: 'itemsTableCentrado', text: horaHorario },
                                { style: 'itemsTableCentrado', text: fechaTimbre },
                                { style: 'itemsTableCentrado', text: horaTimbre },
                                {}, {}, {}, {}, {},
                                { style: 'itemsTableCentrado', text: tolerancia },
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



export const SumarRegistros = function (array: any[]) {
    let valor = 0;
    for (let i = 0; i < array.length; i++) {
        valor = valor + array[i];
    }
    return valor;
}

export const SegundosAMinutosConDecimales = function (segundos: number) {
    return Number((segundos / 60).toFixed(2));
}

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



export const FormatearFecha = function (fecha: string, formato: string, dia: string, idioma: string): string {
    let valor: string;
    console.log('ingresa fecha ', fecha)
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
    //console.log('hora ', hora, ' formato ', formato)
    const horaLuxon = DateTime.fromFormat(hora, 'HH:mm:ss');
    let valor = horaLuxon.toFormat(formato);;
    return valor;
}



