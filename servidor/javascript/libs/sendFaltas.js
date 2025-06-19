"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstructurarDatosPDF = exports.FormatearHora = exports.FormatearFecha = exports.SumarRegistros = exports.PresentarUsuarios = exports.BuscarCorreos = exports.LeerCorreoGeneral = exports.faltasDepartamentos = exports.faltasDiarios = exports.faltasSemanal = exports.faltasIndividual = exports.faltasDiariosIndividual = void 0;
const catEmpresaControlador_1 = require("../controlador/configuracion/parametrizacion/catEmpresaControlador");
const accesoCarpetas_1 = require("./accesoCarpetas");
const settingsMail_1 = require("./settingsMail");
const reportesFaltasControlador_1 = require("../controlador/reportes/reportesFaltasControlador");
const pdf_1 = require("./pdf");
const settingsMail_2 = require("../libs/settingsMail");
const luxon_1 = require("luxon");
const server_1 = require("../server");
const database_1 = __importDefault(require("../database"));
const path_1 = __importDefault(require("path"));
/** ************************************************************************************************* **
 ** **      METODOS PARA ENVIO DE NOTIIFCACIONES AUTOMATICAS DIARIAS DE FALTAS POR EMPLEADO        ** **
 ** ************************************************************************************************* **/
// METODO DE ENVIO DE NOTIFICACIONES DE FALTAS POR EMPLEADO
const faltasDiariosIndividual = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const fecha = luxon_1.DateTime.now().toFormat('yyyy-MM-dd');
        console.log("ver fecha: ", fecha);
        (0, exports.faltasIndividual)(fecha, fecha);
    });
};
exports.faltasDiariosIndividual = faltasDiariosIndividual;
// METODO DE ENVIO DE NOTIFICACION DE FALTA INDIVIDUAL
const faltasIndividual = function (desde, hasta) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("ejecutando reporte de faltas individuales");
        let informacion = yield database_1.default.query(`
            SELECT * FROM configuracion_notificaciones_usuarios AS ig
            WHERE ig.estado = $1
            ORDER BY ig.name_suc ASC
        `, [1]).then((result) => { return result.rows; });
        let arreglo_procesar = [];
        informacion.forEach((obj) => {
            var _a;
            arreglo_procesar.push({
                id: (_a = obj.id) !== null && _a !== void 0 ? _a : obj.id_empleado, // VERIFICA SI obj.id existe, SI NO, TOMA obj.id_empleado
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
                faltas_notificacion: obj.faltas_notificacion,
                faltas_mail: obj.faltas_mail,
            });
        });
        let seleccionados = [{ nombre: 'Empleados' }];
        seleccionados[0].empleados = arreglo_procesar;
        let datos = seleccionados;
        let n = yield Promise.all(datos.map((suc) => __awaiter(this, void 0, void 0, function* () {
            suc.empleados = yield Promise.all(suc.empleados.map((o) => __awaiter(this, void 0, void 0, function* () {
                o.faltas = yield (0, reportesFaltasControlador_1.BuscarFaltas)(desde, hasta, o.id);
                return o;
            })));
            return suc;
        })));
        let nuevo = n.map((e) => {
            e.empleados = e.empleados.filter((a) => { return a.faltas.length > 0; });
            return e;
        }).filter(e => { return e.empleados.length > 0; });
        if (nuevo.length != 0) {
            let arregloEmpleados = nuevo[0].empleados;
            let separador = path_1.default.sep;
            // OBTENER RUTAS
            const ruta_logo = (0, accesoCarpetas_1.ObtenerRutaLogos)();
            // OBTENER FECHA Y HORA
            const FORMATO_FECHA = yield database_1.default.query(`
                SELECT * FROM ep_detalle_parametro WHERE id_parametro = 1
            `);
            const FORMATO_HORA = yield database_1.default.query(`
                SELECT * FROM ep_detalle_parametro WHERE id_parametro = 2
            `);
            let formato_fecha = FORMATO_FECHA.rows[0].descripcion;
            let formato_hora = FORMATO_HORA.rows[0].descripcion;
            let idioma_fechas = 'es';
            let dia_completo = 'dddd';
            const file_name = yield database_1.default.query(`
               SELECT nombre, logo FROM e_empresa 
            `)
                .then((result) => {
                return result.rows[0];
            });
            const fecha = (0, exports.FormatearFecha)(luxon_1.DateTime.now().toISO(), formato_fecha, dia_completo, idioma_fechas);
            const hora_reporte = (0, exports.FormatearHora)(luxon_1.DateTime.now().toFormat('HH:mm:ss'), formato_hora);
            // VERIFICAR HORA DE ENVIO
            const Empre = yield database_1.default.query(`
                SELECT  
                    s.id_empresa, ce.correo AS correo_empresa, ce.puerto, ce.password_correo, ce.servidor, 
                    ce.pie_firma, ce.cabecera_firma  
                FROM  
                    e_sucursales AS s, e_empresa AS ce 
                WHERE  s.id_empresa = ce.id
            `);
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
                arregloEmpleados.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                    console.log('ver item ', item);
                    console.log("ver nombre de todos los empleados: ", item.nombre + ' ' + item.apellido);
                    if (item.faltas_mail) {
                        console.log("ver nombre de los enviado correo: ", item.nombre + ' ' + item.apellido);
                        let data = {
                            to: item.correo,
                            from: Empre.rows[0].correo_empresa,
                            subject: 'NOTIFICACIÓN DE FALTA',
                            html: `
                                <body style="font-family: Arial, sans-serif; font-size: 12px; color: rgb(11, 22, 121); line-height: 1.5;">
 
                                    <div style="text-align: center; margin: 0; padding: 0;">
                                        <img src="cid:cabeceraf"
                                            alt="Encabezado"
                                            style="display: block; width: 100%; height: auto; margin: 0; padding: 0; border: 0;" />
                                    </div>

                                    <hr style="border: none; border-top: 1px solid #aaa; margin: 20px 0;" />

                                    <p>
                                        El presente correo es para informarle que se ha registrado una inasistencia.<br>  
                                    </p>
                                    
                                    <p>
                                        <strong>Empresa:</strong> ${file_name.nombre}<br>
                                        <strong>Asunto:</strong> NOTIFICACIÓN DE FALTA<br>
                                        <strong>Colaborador:</strong> ${item.nombre + ' ' + item.apellido}<br>
                                        <strong>Cargo:</strong> ${item.cargo}<br> 
                                        <strong>Departamento:</strong>${item.departamento}<br>
                                        <strong>Fecha de envío:</strong> ${fecha}<br> 
                                        <strong>Hora de envío:</strong> ${hora_reporte}<br>       
                                        <strong>Notificación:</strong><br>
                                        Queremos informarle que el sistema ha registrado su inasistencia.<br>  
                                        <strong>Fecha:</strong> ${fecha} <br>       
                                        <strong>Observaciones:</strong> Sin registro de marcaciones.<br>
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
                            `,
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
                        var corr = (0, settingsMail_1.enviarCorreos)(Empre.rows[0].servidor, parseInt(Empre.rows[0].puerto), Empre.rows[0].correo_empresa, Empre.rows[0].password_correo);
                        corr.sendMail(data, function (error, info) {
                            if (error) {
                                corr.close();
                                console.log('Email error: ' + error);
                                return 'error';
                            }
                            else {
                                corr.close();
                                console.log('Email sent: ' + info.response);
                                return 'ok';
                            }
                        });
                    }
                    else {
                        console.log("faltas_email es false");
                    }
                    if (item.faltas_notificacion) {
                        var tiempoN = (0, settingsMail_2.fechaHora)();
                        let create_at = tiempoN.fecha_formato + ' ' + tiempoN.hora;
                        // MENSAJE NOTIFICACION
                        let mensaje = '';
                        mensaje = item.faltas[0].fecha + '//Falta registrada. No se ha reportado asistencia en el horario correspondiente.';
                        console.log('mensajes ', mensaje);
                        const response = yield database_1.default.query(`
                            INSERT INTO ecm_realtime_timbres (fecha_hora, id_empleado_envia, id_empleado_recibe, descripcion, 
                            tipo, mensaje) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
                        `, [create_at, 0, item.id, 'NOTIFICACIÓN DE FALTA', 101, mensaje]);
                        if (response.rows.length != 0) {
                            console.log("se inserto notificación");
                        }
                        ;
                        let x = response.rows[0];
                        let data_llega = {
                            id: x.id,
                            create_at: x.fecha_hora,
                            id_send_empl: 0,
                            id_receives_empl: x.id_empleado_recibe,
                            visto: false,
                            descripcion: x.mensaje,
                            mensaje: x.descripcion,
                            tipo: 101,
                            usuario: 'PLATAFORMA WEB'
                        };
                        server_1.io.emit('recibir_aviso', data_llega);
                    }
                }));
            }
            else {
                console.log("no hay empleados con faltas. ");
            }
        }
        else {
            console.log("no hay faltas individuales. ");
        }
    });
};
exports.faltasIndividual = faltasIndividual;
/** *************************************************************************************************** **
 ** **      METODOS PARA ENVIO DE NOTIIFCACIONES AUTOMATICAS SEMANAL DE FALTAS POR DEPARTAMENTOS     ** **
 ** *************************************************************************************************** **/
// METODO DE ENVIO DE REPORTE DE FALTAS SEMANALES
const faltasSemanal = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const date = luxon_1.DateTime.now(); // FECHA ACTUAL
        const fecha = date.toFormat('yyyy-MM-dd'); // FECHA ACTUAL
        const fechaSemanaAntes = date.minus({ week: 1 }).toFormat('yyyy-MM-dd'); // FECHA HACE UNA SEMANA
        console.log("ver fecha: ", fecha, fechaSemanaAntes);
        (0, exports.faltasDepartamentos)(fechaSemanaAntes, fecha, true);
    });
};
exports.faltasSemanal = faltasSemanal;
/** *************************************************************************************************** **
 ** **      METODOS PARA ENVIO DE NOTIIFCACIONES AUTOMATICAS DIARIAS DE FALTAS POR DEPARTAMENTOS     ** **
 ** *************************************************************************************************** **/
// METODO DE ENVIO DE REPORTE DE ATRASOS DIARIOS
const faltasDiarios = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const fecha = luxon_1.DateTime.now().toFormat('yyyy-MM-dd');
        console.log("ver fecha: ", fecha);
        (0, exports.faltasDepartamentos)(fecha, fecha, false);
    });
};
exports.faltasDiarios = faltasDiarios;
// METODO PARA CONSTRUIR REPORTE DE FALTAS
const faltasDepartamentos = function (desde, hasta, semanal) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("ejecutando reporte de faltas de departamento");
        let informacion = yield database_1.default.query(`
            SELECT * FROM configuracion_notificaciones_usuarios AS ig
            WHERE ig.estado = $1
            ORDER BY ig.name_suc ASC
        `, [1]).then((result) => { return result.rows; });
        let departamentos = yield database_1.default.query(`
            SELECT * FROM ed_departamentos
        `).then((result) => { return result.rows; });
        departamentos.forEach((depa) => __awaiter(this, void 0, void 0, function* () {
            let departamento = depa.nombre;
            let gerencia = [];
            gerencia = informacion.filter((item) => item.name_dep === departamento && item.id_suc === depa.id_sucursal);
            let arreglo_procesar = [];
            gerencia.forEach((obj) => {
                var _a;
                arreglo_procesar.push({
                    id: (_a = obj.id) !== null && _a !== void 0 ? _a : obj.id_empleado, // VERIFICA SI obj.id existe, SI NO, TOMA obj.id_empleado
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
                });
            });
            let seleccionados = [{ nombre: 'Empleados' }];
            seleccionados[0].empleados = arreglo_procesar;
            let datos = seleccionados;
            let n = yield Promise.all(datos.map((suc) => __awaiter(this, void 0, void 0, function* () {
                suc.empleados = yield Promise.all(suc.empleados.map((o) => __awaiter(this, void 0, void 0, function* () {
                    o.faltas = yield (0, reportesFaltasControlador_1.BuscarFaltas)(desde, hasta, o.id);
                    return o;
                })));
                return suc;
            })));
            let nuevo = n.map((e) => {
                e.empleados = e.empleados.filter((a) => { return a.faltas.length > 0; });
                return e;
            }).filter(e => { return e.empleados.length > 0; });
            if (nuevo.length != 0) {
                const pdfMake = yield (0, pdf_1.ImportarPDF)();
                // DEFINIR INFORMACION
                const resultado = yield (0, exports.EstructurarDatosPDF)(nuevo);
                resultado.map((obj) => {
                    return obj;
                });
                const today = luxon_1.DateTime.now().toFormat('yyyy-MM-dd');
                let separador = path_1.default.sep;
                const imagenEmpresa = yield catEmpresaControlador_1.EMPRESA_CONTROLADOR.ObtenerImagenEmpresa();
                const codificado = imagenEmpresa.imagen;
                let logo = 'data:image/jpeg;base64,' + codificado;
                const EMPRESA = yield database_1.default.query(`
               SELECT * FROM e_empresa 
               `);
                let p_color = EMPRESA.rows[0].color_principal;
                let s_color = EMPRESA.rows[0].color_secundario;
                let frase = EMPRESA.rows[0].marca_agua;
                let nombre = EMPRESA.rows[0].nombre;
                const FORMATO_FECHA = yield database_1.default.query(`
                SELECT * FROM ep_detalle_parametro WHERE id_parametro = 1
                `);
                const FORMATO_HORA = yield database_1.default.query(`
                SELECT * FROM ep_detalle_parametro WHERE id_parametro = 2
                `);
                let formato_fecha = FORMATO_FECHA.rows[0].descripcion;
                let formato_hora = FORMATO_HORA.rows[0].descripcion;
                let idioma_fechas = 'es';
                let dia_completo = 'dddd';
                let periodo = 'FECHA: ' + (0, exports.FormatearFecha)(luxon_1.DateTime.now().toISO(), formato_fecha, dia_completo, idioma_fechas);
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
                    footer: function (currentPage, pageCount, fecha) {
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
                        itemsTableInfo: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: s_color },
                        itemsTableInfoEmpleado: { fontSize: 9, margin: [0, -1, 0, -2], fillColor: '#E3E3E3' },
                        itemsTableCentrado: { fontSize: 8, alignment: 'center' },
                        itemsTableCentradoTotal: { fontSize: 8, bold: true, alignment: 'center', fillColor: '#E3E3E3' },
                        tableMargin: { margin: [0, 0, 0, 0] },
                        tableMarginCabecera: { margin: [0, 15, 0, 0] },
                        tableMarginCabeceraEmpleado: { margin: [0, 10, 0, 0] },
                    }
                };
                // CREAR EL PDF Y OBTENER EL BUFFER DE MANERA ASINCRONA
                const pdfDocGenerator = pdfMake.createPdf(definicionDocumento);
                // OBTENER EL BUFFER DEL PDF GENERADO
                const pdfBuffer = yield new Promise((resolve, reject) => {
                    pdfDocGenerator.getBuffer((buffer) => {
                        if (buffer) {
                            resolve(Buffer.from(buffer));
                        }
                        else {
                            reject(new Error('Error al generar el buffer del PDF.'));
                        }
                    });
                });
                const ruta_logo = (0, accesoCarpetas_1.ObtenerRutaLogos)();
                // OBTENER FECHA Y HORA
                const fecha = (0, exports.FormatearFecha)(luxon_1.DateTime.now().toISO(), formato_fecha, dia_completo, idioma_fechas);
                const hora_reporte = (0, exports.FormatearHora)(luxon_1.DateTime.now().toFormat('HH:mm:ss'), formato_hora);
                // VERIFICAR HORA DE ENVIO
                const EMPLEADOS = yield database_1.default.query(`
                    SELECT 
                        da.nombre, da.apellido, da.correo, da.fecha_nacimiento, da.name_cargo, s.id_empresa, 
                        ce.correo AS correo_empresa, ce.puerto, ce.password_correo, ce.servidor, 
                        ce.pie_firma, ce.cabecera_firma  
                    FROM 
                        configuracion_notificaciones_usuarios AS da, e_sucursales AS s, e_empresa AS ce 
                    WHERE 
                        da.id_suc = s.id
                        AND da.estado = 1 
                        AND s.id_empresa = ce.id 
                        AND da.jefe = true 
                        AND da.name_dep = $1 
                        AND da.id_suc = $2
                `, [departamento, depa.id_sucursal]);
                if (EMPLEADOS.rowCount != 0) {
                    var general = yield (0, exports.LeerCorreoGeneral)(semanal);
                    var correos = (0, exports.BuscarCorreos)(EMPLEADOS);
                    console.log('correos de jefes de departamento de ' + departamento + ' de la sucursal con id: ' + depa.id_sucursal, correos);
                    var usuarios = (0, exports.PresentarUsuarios)(EMPLEADOS);
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
                        html: `
                            <body style="font-family: Arial, sans-serif; font-size: 12px; color: rgb(11, 22, 121); line-height: 1.5;">
                                
                                <div style="text-align: center; margin: 0; padding: 0;">
                                    <img src="cid:cabeceraf" 
                                        alt="Encabezado"
                                        style="display: block; width: 100%; height: auto; margin: 0; padding: 0; border: 0;" />
                                </div>

                                <hr style="border: none; border-top: 1px solid #aaa; margin: 20px 0;" />

                                <p>
                                    Mediante el presente correo se adjunta el reporte de faltas.<br>  
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
                        `,
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
                    var corr = (0, settingsMail_1.enviarCorreos)(EMPLEADOS.rows[0].servidor, parseInt(EMPLEADOS.rows[0].puerto), EMPLEADOS.rows[0].correo_empresa, EMPLEADOS.rows[0].password_correo);
                    corr.sendMail(data, function (error, info) {
                        if (error) {
                            corr.close();
                            console.log('Email error: ' + error);
                            return 'error';
                        }
                        else {
                            corr.close();
                            console.log('Email sent: ' + info.response);
                            return 'ok';
                        }
                    });
                }
            }
            else {
                console.log("no existen registros para el departamento: ", departamento);
            }
        }));
    });
};
exports.faltasDepartamentos = faltasDepartamentos;
/** *************************************************************************************************** **
 ** **                    METODOS PARA LEER CORREOS DE PARAMETROS Y DE USUARIOS                      ** **
 ** *************************************************************************************************** **/
// METODOD PARA LEER CORREOS DEL PARAMETRO GENERAL
const LeerCorreoGeneral = function (semanal) {
    return __awaiter(this, void 0, void 0, function* () {
        // PARAMETRO DE CORREO GENERAL DE REPORTE DE FALTAS DIARIAS ---> 19
        let id_parametro_correo = 19;
        if (semanal) {
            // PARAMETRO DE CORREO GENERAL DE REPORTE DE FALTAS SEMANAL ---> 23
            id_parametro_correo = 23;
        }
        const PARAMETRO_CORREO = yield database_1.default.query(`
            SELECT * FROM ep_detalle_parametro WHERE id_parametro = $1
        `, [id_parametro_correo]);
        var correo = '';
        if (PARAMETRO_CORREO.rowCount != 0) {
            PARAMETRO_CORREO.rows.forEach((obj) => {
                if (correo === '') {
                    correo = obj.descripcion;
                }
                else {
                    correo = correo + ', ' + obj.descripcion;
                }
            });
            return correo;
        }
        else {
            return '';
        }
    });
};
exports.LeerCorreoGeneral = LeerCorreoGeneral;
// FUNCION PARA BUSCAR CORREOS
const BuscarCorreos = function (datos) {
    var correos = '';
    datos.rows.forEach((obj) => {
        if (correos === '') {
            correos = obj.correo;
        }
        else {
            correos = correos + ', ' + obj.correo;
        }
    });
    return correos;
};
exports.BuscarCorreos = BuscarCorreos;
// METODO PARA PRESENTAR INFORMACION DEL MENSAJE
// METODO PARA PRESENTAR INFORMACION DEL MENSAJE
const PresentarUsuarios = function (datos) {
    let usuarios = `
            <p style="margin: 0; font-weight: bold;">Destinatarios:</p>
            <ul style="margin: 2px 0 0 18px; padding: 0;">
        `;
    datos.rows.forEach((obj) => {
        usuarios += `<li style="margin: 0;">${obj.nombre} ${obj.apellido} - ${obj.name_cargo}</li>`;
    });
    usuarios += `
            </ul>
    `;
    return usuarios;
};
exports.PresentarUsuarios = PresentarUsuarios;
/** *************************************************************************************************** **
 ** **                                    METODOS PARA REALIZAR CALCULOS                              ** **
 ** *************************************************************************************************** **/
// METODO PARA SUMAR VALORES
const SumarRegistros = function (array) {
    let valor = 0;
    for (let i = 0; i < array.length; i++) {
        valor = valor + array[i];
    }
    return valor;
};
exports.SumarRegistros = SumarRegistros;
/** *************************************************************************************************** **
 ** **                        METODOS PARA DAR FORMATO A LAS FECHAS Y HORAS                          ** **
 ** *************************************************************************************************** **/
// METODO PARA FORMATEAR FECHA
const FormatearFecha = function (fecha, formato, dia, idioma) {
    let valor;
    // PARSEAR LA FECHA CON LUXON
    const fechaLuxon = luxon_1.DateTime.fromISO(fecha).setLocale(idioma);
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
};
exports.FormatearFecha = FormatearFecha;
// METODO PARA FORMATEAR HORA
const FormatearHora = function (hora, formato) {
    const horaLuxon = luxon_1.DateTime.fromFormat(hora, 'HH:mm:ss');
    let valor = horaLuxon.toFormat(formato);
    return valor;
};
exports.FormatearHora = FormatearHora;
/** *************************************************************************************************** **
 ** **                             METODOS PARA DAR ESTRUCTURAR EL PDF                               ** **
 ** *************************************************************************************************** **/
const EstructurarDatosPDF = function (data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        console.log(" ver datos del reporte de faltas: ", data);
        // CONSULTAR FORMATO DE FECHA
        const FORMATO_FECHA = yield database_1.default.query(`
        SELECT * FROM ep_detalle_parametro WHERE id_parametro = 1
        `);
        let totalFaltasEmpleado = 0;
        let formato_fecha = (_a = FORMATO_FECHA.rows[0].descripcion) !== null && _a !== void 0 ? _a : 'dd/MM/yyyy';
        let idioma_fechas = 'es';
        let dia_abreviado = 'ddd';
        let general = [];
        let n = [];
        let c = 0;
        data.forEach((selec) => {
            // CONTAR REGISTROS
            let arr_reg = selec.empleados.map((o) => { return o.faltas.length; });
            let reg = (0, exports.SumarRegistros)(arr_reg);
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
            };
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
            selec.empleados.forEach((empl) => {
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
                            ...empl.faltas.map((usu) => {
                                const fecha = (0, exports.FormatearFecha)(usu.fecha, formato_fecha, dia_abreviado, idioma_fechas);
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
                        fillColor: function (rowIndex) {
                            return rowIndex % 2 === 0 ? '#E5E7E9' : null;
                        },
                    },
                });
            });
        });
        // RESUMEN TOTALES DE REGISTROS
        return n;
    });
};
exports.EstructurarDatosPDF = EstructurarDatosPDF;
