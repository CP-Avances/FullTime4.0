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
exports.EstructurarDatosPDF = exports.FormatearHora = exports.FormatearFecha = exports.MinutosAHorasMinutosSegundos = exports.SegundosAMinutosConDecimales = exports.SumarRegistros = exports.PresentarUsuarios = exports.BuscarCorreos = exports.LeerCorreoGeneral = exports.atrasosDepartamentos = exports.atrasosDiarios = exports.atrasosSemanal = exports.atrasosIndividual = exports.atrasosDiariosIndividual = void 0;
const catEmpresaControlador_1 = require("../controlador/configuracion/parametrizacion/catEmpresaControlador");
const accesoCarpetas_1 = require("./accesoCarpetas");
const settingsMail_1 = require("./settingsMail");
const reportesAtrasosControlador_1 = require("../controlador/reportes/reportesAtrasosControlador");
const pdf_1 = require("./pdf");
const settingsMail_2 = require("../libs/settingsMail");
const luxon_1 = require("luxon");
const server_1 = require("../server");
const database_1 = __importDefault(require("../database"));
const path_1 = __importDefault(require("path"));
/** ************************************************************************************************* **
 ** **     METODOS PARA ENVIO DE NOTIIFCACIONES AUTOMATICAS DIARIAS DE ATRASOS POR EMPLEADO        ** **
 ** ************************************************************************************************* **/
// METODO DE ENVIO DE NOTIFICACIONES DE ATRASOS POR EMPLEADO
const atrasosDiariosIndividual = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const fecha = luxon_1.DateTime.now().toFormat('yyyy-MM-dd');
        console.log("ver fecha: ", fecha);
        (0, exports.atrasosIndividual)(fecha, fecha);
    });
};
exports.atrasosDiariosIndividual = atrasosDiariosIndividual;
// METODO DE ENVIO DE NOTIFICACION DE ATRASO INDIVIDUAL
const atrasosIndividual = function (desde, hasta) {
    return __awaiter(this, void 0, void 0, function* () {
        const date = new Date();
        const hora = date.getHours();
        const minutos = date.getMinutes();
        console.log("ejecutando reporte de atrasos individuales");
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
                atrasos_notificacion: obj.atrasos_notificacion,
                atrasos_mail: obj.atrasos_mail
            });
        });
        let seleccionados = [{ nombre: 'Empleados' }];
        seleccionados[0].empleados = arreglo_procesar;
        let datos = seleccionados;
        let n = yield Promise.all(datos.map((suc) => __awaiter(this, void 0, void 0, function* () {
            suc.empleados = yield Promise.all(suc.empleados.map((o) => __awaiter(this, void 0, void 0, function* () {
                o.atrasos = yield (0, reportesAtrasosControlador_1.BuscarAtrasos)(desde, hasta, o.id);
                return o;
            })));
            return suc;
        })));
        let nuevo = n.map((e) => {
            e.empleados = e.empleados.filter((a) => { return a.atrasos.length > 0; });
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
            const imagenEmpresa = yield catEmpresaControlador_1.EMPRESA_CONTROLADOR.ObtenerImagenEmpresa();
            const fecha = (0, exports.FormatearFecha)(luxon_1.DateTime.now().toISO(), formato_fecha, dia_completo, idioma_fechas);
            const hora_reporte = (0, exports.FormatearHora)(luxon_1.DateTime.now().toFormat('HH:mm:ss'), formato_hora);
            console.log('ejecutandose hora ', hora, ' minuto ', minutos, 'fecha ', fecha);
            // VERIFICAR HORA DE ENVIO
            const Empre = yield database_1.default.query(`
                SELECT  
                    s.id_empresa, ce.correo AS correo_empresa, ce.puerto, ce.password_correo, ce.servidor, 
                    ce.pie_firma, ce.cabecera_firma  
                FROM  
                    e_sucursales AS s, e_empresa AS ce 
                WHERE  
                    s.id_empresa = ce.id 
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
                    const minutos = (0, exports.SegundosAMinutosConDecimales)(Number(item.atrasos[0].diferencia));
                    const tiempo = (0, exports.MinutosAHorasMinutosSegundos)(minutos);
                    if (item.atrasos_mail) {
                        let dateTimeHorario = luxon_1.DateTime.fromSQL(item.atrasos[0].fecha_hora_horario);
                        let isoStringHorario = dateTimeHorario.toISO();
                        let fechaHora = '';
                        if (isoStringHorario) {
                            let horaHorario = (0, exports.FormatearHora)(luxon_1.DateTime.fromISO(isoStringHorario).toFormat('HH:mm:ss'), formato_hora);
                            fechaHora = (0, exports.FormatearFecha)(isoStringHorario, formato_fecha, dia_completo, idioma_fechas) + ' ' + horaHorario;
                        }
                        const dateTimeTimbre = luxon_1.DateTime.fromSQL(item.atrasos[0].fecha_hora_timbre);
                        const isoStringTimbre = dateTimeTimbre.toISO();
                        let fechaTimbre = '';
                        if (isoStringTimbre) {
                            let horaTimbre = (0, exports.FormatearHora)(luxon_1.DateTime.fromISO(isoStringTimbre).toFormat('HH:mm:ss'), formato_hora);
                            fechaTimbre = (0, exports.FormatearFecha)(isoStringTimbre, formato_fecha, dia_completo, idioma_fechas) + ' ' + horaTimbre;
                        }
                        let data = {
                            to: item.correo,
                            from: Empre.rows[0].correo_empresa,
                            subject: 'NOTIFICACIÓN DE ATRASO',
                            html: `
                                <body style="font-family: Arial, sans-serif; font-size: 12px; color: rgb(11, 22, 121); line-height: 1.5;">
 
                                    <div style="text-align: center; margin: 0; padding: 0;">
                                        <img src="cid:cabeceraf"
                                            alt="Encabezado"
                                            style="display: block; width: 100%; height: auto; margin: 0; padding: 0; border: 0;" />
                                    </div>

                                    <hr style="border: none; border-top: 1px solid #aaa; margin: 20px 0;" />

                                    <p>
                                        El presente correo es para informarle que se ha registrado un atraso en su marcación.
                                    </p>

                                    <p>
                                        <strong>Empresa:</strong> ${imagenEmpresa.nom_empresa}<br>
                                        <strong>Asunto:</strong> NOTIFICACIÓN DE ATRASO<br>
                                        <strong>Colaborador:</strong> ${item.nombre + ' ' + item.apellido}<br>
                                        <strong>Cargo:</strong> ${item.cargo}<br>
                                        <strong>Departamento:</strong>  ${item.departamento}<br>
                                        <strong>Fecha de envío:</strong> ${fecha}<br>
                                        <strong>Hora de envío:</strong> ${hora_reporte}<br>
                                        <strong>Notificación:</strong><br>
                                            Queremos informarle que el sistema ha registrado un atraso correspondiente a su marcación de entrada.<br>
                                        <strong>Horario:</strong> ${fechaHora}<br>
                                        <strong>Timbre:</strong> ${fechaTimbre}<br>
                                        <strong>Tolerancia:</strong> ${item.atrasos[0].tolerancia} minutos<br>
                                        <strong>Tiempo total de atraso:</strong> ${tiempo} minutos<br>
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
                        console.log("atrasos_email es false");
                    }
                    if (item.atrasos_notificacion) {
                        var tiempoN = (0, settingsMail_2.fechaHora)();
                        let create_at = tiempoN.fecha_formato + ' ' + tiempoN.hora;
                        // MENSAJE NOTIFICACION
                        let mensaje = '';
                        mensaje = item.atrasos[0].fecha_hora_horario + '//' + item.atrasos[0].fecha_hora_timbre + '//' + item.atrasos[0].tolerancia + '//' + tiempo + '//Ha registrado su ingreso fuera del horario establecido.';
                        console.log('mensajes ', mensaje);
                        const response = yield database_1.default.query(`
                        INSERT INTO ecm_realtime_timbres (fecha_hora, id_empleado_envia, id_empleado_recibe, descripcion, 
                        tipo, mensaje) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
                        `, [create_at, 0, item.id, 'NOTIFICACIÓN DE ATRASO', 100, mensaje]);
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
                            descripcion: x.descripcion,
                            mensaje: x.mensaje,
                            tipo: 100,
                            usuario: 'PLATAFORMA WEB'
                        };
                        server_1.io.emit('recibir_aviso', data_llega);
                    }
                }));
            }
            else {
                console.log("no hay empleados con atrasos");
            }
        }
        else {
            console.log("no existen datos individuales");
        }
    });
};
exports.atrasosIndividual = atrasosIndividual;
/** *************************************************************************************************** **
 ** **     METODOS PARA ENVIO DE NOTIIFCACIONES AUTOMATICAS SEMANAL DE ATRASOS POR DEPARTAMENTOS     ** **
 ** *************************************************************************************************** **/
// METODO DE ENVIO DE REPORTE DE ATRASOS SEMANALES
const atrasosSemanal = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const date = luxon_1.DateTime.now(); // FECHA ACTUAL
        const fecha = date.toFormat('yyyy-MM-dd'); // FECHA ACTUAL
        const fechaSemanaAntes = date.minus({ week: 1 }).toFormat('yyyy-MM-dd'); // FECHA HACE UNA SEMANA
        console.log("ver fecha: ", fecha, fechaSemanaAntes);
        (0, exports.atrasosDepartamentos)(fechaSemanaAntes, fecha, true);
    });
};
exports.atrasosSemanal = atrasosSemanal;
/** *************************************************************************************************** **
 ** **     METODOS PARA ENVIO DE NOTIIFCACIONES AUTOMATICAS DIARIAS DE ATRASOS POR DEPARTAMENTOS     ** **
 ** *************************************************************************************************** **/
// METODO DE ENVIO DE REPORTE DE ATRASOS DIARIOS
const atrasosDiarios = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const fecha = luxon_1.DateTime.now().toFormat('yyyy-MM-dd');
        console.log("ver fecha: ", fecha);
        (0, exports.atrasosDepartamentos)(fecha, fecha, false);
    });
};
exports.atrasosDiarios = atrasosDiarios;
// METODO PARA CONSTRUIR REPORTE DE ATRASOS
const atrasosDepartamentos = function (desde, hasta, semanal) {
    return __awaiter(this, void 0, void 0, function* () {
        const date = new Date();
        const hora = date.getHours();
        const minutos = date.getMinutes();
        console.log("ejecutando reporte de atrasos de departamento");
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
                    o.atrasos = yield (0, reportesAtrasosControlador_1.BuscarAtrasos)(desde, hasta, o.id);
                    return o;
                })));
                return suc;
            })));
            let nuevo = n.map((e) => {
                e.empleados = e.empleados.filter((a) => { return a.atrasos.length > 0; });
                return e;
            }).filter(e => { return e.empleados.length > 0; });
            if (nuevo.length != 0) {
                const pdfMake = yield (0, pdf_1.ImportarPDF)();
                // DEFINIR INFORMACIÓN
                const resultado = yield (0, exports.EstructurarDatosPDF)(nuevo);
                resultado.map((obj) => {
                    return obj;
                });
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
                let asunto = 'REPORTE DIARIO DE ATRASOS DEL DEPARTAMENTO DE ' + departamento;
                if (semanal == true) {
                    periodo = 'PERIODO DEL: ' + desde + " AL " + hasta;
                    asunto = 'REPORTE SEMANAL DE ATRASOS DEL DEPARTAMENTO DE ' + departamento;
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
                console.log('ejecutandose hora ', hora, ' minuto ', minutos, 'fecha ', fecha);
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
                        AND da.estado = 1 AND s.id_empresa = ce.id AND da.jefe = true 
                        AND da.name_dep = $1 AND da.id_suc = $2
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
                                    Mediante el presente correo se adjunta el reporte de atrasos.
                                </p>

                                <p>
                                    <strong>Empresa:</strong> ${imagenEmpresa.nom_empresa}<br>
                                    <strong>Asunto:</strong> ${asunto}<br>
                                    <strong>Departamento:</strong> ${departamento}<br>
                                    <strong>Fecha de envío:</strong> ${fecha}<br>
                                    <strong>Hora de envío:</strong> ${hora_reporte}<br>
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
exports.atrasosDepartamentos = atrasosDepartamentos;
/** *************************************************************************************************** **
 ** **                    METODOS PARA LEER CORREOS DE PARAMETROS Y DE USUARIOS                      ** **
 ** *************************************************************************************************** **/
// METODOD PARA LEER CORREOS DEL PARAMETRO GENERAL
const LeerCorreoGeneral = function (semanal) {
    return __awaiter(this, void 0, void 0, function* () {
        // PARAMETRO DE CORREO GENERAL DE REPORTE DE ATRASOS DIARIOS ---> 12
        let id_parametro_correo = 12;
        if (semanal) {
            // PARAMETRO DE CORREO GENERAL DE REPORTE DE ATRASOS DIARIOS ---> 16
            id_parametro_correo = 16;
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
 ** **                                    METODOS PARA REALIZAR CALCULOS                             ** **
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
// METODO PARA TRANSFORMAR SEGUNDOS - MINUTOS
const SegundosAMinutosConDecimales = function (segundos) {
    return Number((segundos / 60).toFixed(2));
};
exports.SegundosAMinutosConDecimales = SegundosAMinutosConDecimales;
// METODO PARA TRANSFORMAR MINUTOS A HORAS
const MinutosAHorasMinutosSegundos = function (minutos) {
    let seconds = minutos * 60;
    let hour = Math.floor(seconds / 3600);
    hour = (hour < 10) ? '0' + hour : hour;
    let minute = Math.floor((seconds / 60) % 60);
    minute = (minute < 10) ? '0' + minute : minute;
    let second = Number((seconds % 60).toFixed(0));
    second = (second < 10) ? '0' + second : second;
    return `${hour}:${minute}:${second}`;
};
exports.MinutosAHorasMinutosSegundos = MinutosAHorasMinutosSegundos;
/** *************************************************************************************************** **
 ** **                        METODOS PARA DAR FORMATO A LAS FECHAS Y HORAS                           ** **
 ** *************************************************************************************************** **/
// METOOD PARA FORMATEAR FECHAS
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
// METODO PARA FORMATEAR HORAS
const FormatearHora = function (hora, formato) {
    const horaLuxon = luxon_1.DateTime.fromFormat(hora, 'HH:mm:ss');
    let valor = horaLuxon.toFormat(formato);
    return valor;
};
exports.FormatearHora = FormatearHora;
/** *************************************************************************************************** **
 ** **                             METODOS PARA DAR ESTRUCTURAR EL PDF                               ** **
 ** *************************************************************************************************** **/
// METODO PARA ESTRUCTURAR DATOS DE PDF
const EstructurarDatosPDF = function (data) {
    return __awaiter(this, void 0, void 0, function* () {
        let formato_fecha = 'dd/MM/yyyy';
        let formato_hora = 'HH:mm:ss';
        let idioma_fechas = 'es';
        let dia_abreviado = 'ddd';
        let totalTiempoEmpleado = 0;
        let totalTiempo = 0;
        let general = [];
        let n = [];
        let c = 0;
        let toleranciaP = '';
        const PARAMETRO_TOLERANCIA = yield database_1.default.query(`
        SELECT * FROM ep_detalle_parametro WHERE id_parametro = 3
        `);
        if (PARAMETRO_TOLERANCIA.rowCount != 0) {
            toleranciaP = PARAMETRO_TOLERANCIA.rows[0].descripcion;
        }
        data.forEach((selec) => {
            // CONTAR REGISTROS
            let arr_reg = selec.empleados.map((o) => { return o.atrasos.length; });
            let reg = (0, exports.SumarRegistros)(arr_reg);
            // CONTAR MINUTOS DE ATRASOS
            totalTiempo = 0;
            selec.empleados.forEach((o) => {
                o.atrasos.map((a) => {
                    const minutos_ = (0, exports.SegundosAMinutosConDecimales)(Number(a.diferencia));
                    totalTiempo += Number(minutos_);
                    return totalTiempo;
                });
            });
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
                formato_general: (0, exports.MinutosAHorasMinutosSegundos)(Number(totalTiempo.toFixed(2))),
                formato_decimal: totalTiempo.toFixed(2),
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
                totalTiempoEmpleado = 0;
                n.push({
                    style: 'tableMargin',
                    table: {
                        widths: ['auto', '*', 'auto', '*', 'auto', 'auto', 'auto', 'auto'],
                        headerRows: 2,
                        body: [
                            [
                                { rowSpan: 2, text: 'N°', style: 'centrado' },
                                { rowSpan: 1, colSpan: 2, text: 'HORARIO', style: 'tableHeader' },
                                {},
                                { rowSpan: 1, colSpan: 2, text: 'TIMBRE', style: 'tableHeaderSecundario' },
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
                                {},
                                {},
                                {},
                            ],
                            ...empl.atrasos.map((usu) => {
                                // FORMATEAR FECHAS
                                const fechaHorario = (0, exports.FormatearFecha)(usu.fecha_hora_horario.split(' ')[0], formato_fecha, dia_abreviado, idioma_fechas);
                                const fechaTimbre = (0, exports.FormatearFecha)(usu.fecha_hora_timbre.split(' ')[0], formato_fecha, dia_abreviado, idioma_fechas);
                                const horaHorario = (0, exports.FormatearHora)(usu.fecha_hora_horario.split(' ')[1], formato_hora);
                                const horaTimbre = (0, exports.FormatearHora)(usu.fecha_hora_timbre.split(' ')[1], formato_hora);
                                var tolerancia = '00:00:00';
                                if (toleranciaP !== '1') {
                                    tolerancia = (0, exports.MinutosAHorasMinutosSegundos)(Number(usu.tolerancia));
                                }
                                const minutos = (0, exports.SegundosAMinutosConDecimales)(Number(usu.diferencia));
                                const tiempo = (0, exports.MinutosAHorasMinutosSegundos)(minutos);
                                totalTiempoEmpleado += Number(minutos);
                                c = c + 1;
                                return [
                                    { style: 'itemsTableCentrado', text: c },
                                    { style: 'itemsTableCentrado', text: fechaHorario },
                                    { style: 'itemsTableCentrado', text: horaHorario },
                                    { style: 'itemsTableCentrado', text: fechaTimbre },
                                    { style: 'itemsTableCentrado', text: horaTimbre },
                                    { style: 'itemsTableCentrado', text: tolerancia },
                                    { style: 'itemsTableCentrado', text: tiempo },
                                    { style: 'itemsTableDerecha', text: minutos.toFixed(2) },
                                ];
                            }),
                        ],
                    },
                    layout: {
                        fillColor: function (rowIndex) {
                            return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
                        }
                    }
                });
            });
        });
        // RESUMEN TOTALES DE REGISTROS
        return n;
    });
};
exports.EstructurarDatosPDF = EstructurarDatosPDF;
