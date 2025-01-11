"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.FormatearHora = exports.FormatearFecha = exports.atrasosIndividual = exports.ImportarPDF = void 0;
const accesoCarpetas_1 = require("./accesoCarpetas");
const settingsMail_1 = require("./settingsMail");
const database_1 = __importDefault(require("../database"));
const path_1 = __importDefault(require("path"));
const luxon_1 = require("luxon");
const reportesAtrasosControlador_1 = require("../controlador/reportes/reportesAtrasosControlador");
// METODO PARA ENVIAR LISTA DE ATRASOS A UNA HORA DETERMINADA 
/** ********************************************************************************* **
   ** **                     IMPORTAR SCRIPT DE ARCHIVOS DE PDF                      ** **
   ** ********************************************************************************* **/
const ImportarPDF = function () {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const pdfMake = yield Promise.resolve().then(() => __importStar(require('../assets/build/pdfmake.js')));
        // @ts-ignore
        const pdfFonts = yield Promise.resolve().then(() => __importStar(require('../assets/build/vfs_fonts.js')));
        pdfMake.default.vfs = pdfFonts.default.pdfMake.vfs;
        return pdfMake.default;
    });
};
exports.ImportarPDF = ImportarPDF;
const atrasosIndividual = function () {
    return __awaiter(this, void 0, void 0, function* () {
        //setInterval(async () => {
        const date = new Date();
        const hora = date.getHours();
        const minutos = date.getMinutes();
        const PARAMETRO_HORA = yield database_1.default.query(`
            SELECT * FROM ep_detalle_parametro WHERE id_parametro = 11
            `);
        if (PARAMETRO_HORA.rowCount != 0) {
            console.log("ver Parametro hora: ", PARAMETRO_HORA.rows[0].descripcion);
            if (hora === parseInt(PARAMETRO_HORA.rows[0].descripcion)) {
                console.log("ejecutando reporte de atrasos individuales");
                let informacion = yield database_1.default.query(`
            SELECT * FROM informacion_general AS ig
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
                    });
                });
                let seleccionados = [{ nombre: 'Empleados' }];
                seleccionados[0].empleados = arreglo_procesar;
                let datos = seleccionados;
                let n = yield Promise.all(datos.map((suc) => __awaiter(this, void 0, void 0, function* () {
                    suc.empleados = yield Promise.all(suc.empleados.map((o) => __awaiter(this, void 0, void 0, function* () {
                        o.atrasos = yield (0, reportesAtrasosControlador_1.BuscarAtrasos)('2024/12/01', '2024/12/28', o.id);
                        return o;
                    })));
                    return suc;
                })));
                let nuevo = n.map((e) => {
                    e.empleados = e.empleados.filter((a) => { return a.atrasos.length > 0; });
                    return e;
                }).filter(e => { return e.empleados.length > 0; });
                // ARREGLO DE EMPLEADOS
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
                let dia_abreviado = 'ddd';
                let dia_completo = 'dddd';
                const file_name = yield database_1.default.query(`
           SELECT nombre, logo FROM e_empresa 
           `)
                    .then((result) => {
                    return result.rows[0];
                });
                const fecha = (0, exports.FormatearFecha)(luxon_1.DateTime.now().toISO(), formato_fecha, dia_completo, idioma_fechas);
                const hora_reporte = (0, exports.FormatearHora)(luxon_1.DateTime.now().toFormat('HH:mm:ss'), formato_hora);
                console.log('ejecutandose hora ', hora, ' minuto ', minutos, 'fecha ', fecha);
                // VERIFICAR HORA DE ENVIO
                const Empre = yield database_1.default.query(`
                                SELECT  s.id_empresa, ce.correo AS correo_empresa, ce.puerto, ce.password_correo, ce.servidor, 
                                    ce.pie_firma, ce.cabecera_firma  
                                FROM  e_sucursales AS s, e_empresa AS ce 
                                WHERE  s.id_empresa = ce.id `);
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
                arregloEmpleados.forEach((item) => {
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
                                        <b>Tolerancia:</b> ${item.atrasos[0].tolerancia} <br>
                                        </p>
                                        <p style="font-family: Arial; font-size:12px; line-height: 1em;">
                                        <b>Este correo es generado automáticamente. Por favor no responda a este mensaje.</b><br>
                                        </p>
                                        <img src="cid:pief" width="100%" height="100%"/>
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
                });
            }
        }
    });
};
exports.atrasosIndividual = atrasosIndividual;
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
const FormatearHora = function (hora, formato) {
    const horaLuxon = luxon_1.DateTime.fromFormat(hora, 'HH:mm:ss');
    let valor = horaLuxon.toFormat(formato);
    return valor;
};
exports.FormatearHora = FormatearHora;
