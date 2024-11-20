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
exports.BuscarHora = exports.BuscarFecha = exports.FormatearHora = exports.FormatearFechaBase = exports.FormatearFecha2 = exports.FormatearFecha = exports.dia_completo = exports.dia_abreviado = exports.fechaHora = exports.enviarCorreos = exports.enviarMail = exports.Credenciales = exports.puerto = exports.servidor = exports.cabecera_firma = exports.pie_firma = exports.logo_ = exports.nombre = exports.email = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const database_1 = __importDefault(require("../database"));
const luxon_1 = require("luxon");
exports.email = process.env.EMAIL || '';
let pass = process.env.PASSWORD || '';
exports.nombre = process.env.NOMBRE || '';
exports.logo_ = process.env.LOGO || '';
exports.pie_firma = process.env.PIEF || '';
exports.cabecera_firma = process.env.CABECERA || '';
exports.servidor = process.env.SERVIDOR || '';
exports.puerto = process.env.PUERTO || '';
const Credenciales = function (id_empresa_1) {
    return __awaiter(this, arguments, void 0, function* (id_empresa, correo = process.env.EMAIL, password = process.env.PASSWORD, empresa = process.env.NOMBRE, img = process.env.LOGO, img_pie = process.env.PIEF, img_cabecera = process.env.CABECERA, port = process.env.PUERTO, host = process.env.SERVIDOR) {
        let credenciales = [];
        credenciales = yield DatosCorreo(id_empresa);
        return credenciales.message;
    });
};
exports.Credenciales = Credenciales;
function DatosCorreo(id_empresa) {
    return __awaiter(this, void 0, void 0, function* () {
        let credenciales = yield database_1.default.query(`
    SELECT correo, password_correo, nombre, logo, pie_firma, cabecera_firma, servidor, puerto
    FROM e_empresa 
    WHERE id = $1
    `, [id_empresa])
            .then(result => {
            return result.rows;
        });
        console.log('correo... ', credenciales);
        if (credenciales.length === 0) {
            return { message: 'error' };
        }
        else {
            exports.email = credenciales[0].correo;
            pass = credenciales[0].password_correo;
            exports.nombre = credenciales[0].nombre;
            exports.logo_ = credenciales[0].logo;
            exports.pie_firma = credenciales[0].pie_firma;
            exports.cabecera_firma = credenciales[0].cabecera_firma;
            exports.servidor = credenciales[0].servidor;
            exports.puerto = credenciales[0].puerto;
            if (exports.cabecera_firma === null || exports.cabecera_firma === '') {
                exports.cabecera_firma = 'cabecera_firma.png';
            }
            if (exports.pie_firma === null || exports.pie_firma === '') {
                exports.pie_firma = 'pie_firma.png';
            }
            return { message: 'ok' };
        }
    });
}
const enviarMail = function (servidor, puerto) {
    var seguridad = false;
    if (puerto === 465) {
        seguridad = true;
    }
    else {
        seguridad = false;
    }
    const transporter = nodemailer_1.default.createTransport({
        //pool: true,
        host: servidor,
        port: puerto,
        secure: seguridad,
        auth: {
            user: exports.email,
            pass: pass
        },
    });
    return transporter;
};
exports.enviarMail = enviarMail;
const enviarCorreos = function (servidor, puerto, email, pass) {
    var seguridad = false;
    if (puerto === 465) {
        seguridad = true;
    }
    else {
        seguridad = false;
    }
    const transporter = nodemailer_1.default.createTransport({
        pool: true,
        //maxConnections: 2,
        maxMessages: Infinity,
        //rateLimit: 14, // 14 emails/second max
        //rateDelta: 1000,
        host: servidor,
        port: puerto,
        secure: seguridad,
        auth: {
            user: email,
            pass: pass
        },
    });
    return transporter;
};
exports.enviarCorreos = enviarCorreos;
const fechaHora = function () {
    const f = luxon_1.DateTime.now();
    // OBTENER EL DIA DE LA SEMANA EN ESPAÑOL Y CAPITALIZAR LA PRIMERA LETRA
    const dia = f.setLocale('es').toFormat('cccc').charAt(0).toUpperCase() + f.setLocale('es').toFormat('cccc').slice(1);
    const tiempo = {
        fecha_formato: f.toFormat('yyyy-MM-dd'),
        fecha: f.toFormat('dd/MM/yyyy'),
        hora: f.toFormat('HH:mm:ss'),
        dia: dia
    };
    return tiempo;
};
exports.fechaHora = fechaHora;
exports.dia_abreviado = 'ddd';
exports.dia_completo = 'dddd';
const FormatearFecha = function (fecha, dia) {
    return __awaiter(this, void 0, void 0, function* () {
        const formato = yield (0, exports.BuscarFecha)();
        console.log('formato ', formato.fecha);
        console.log(' fecha ', fecha);
        console.log("dia", dia);
        const fechaLuxon = luxon_1.DateTime.fromISO(fecha);
        console.log("ver fechaLuxon", fechaLuxon);
        let diaFormateado = '';
        /*.setLocale('es').toFormat(dia).charAt(0).toUpperCase() +
          fechaLuxon.setLocale('es').toFormat(dia).slice(1);*/
        if (dia == "dddd") {
            diaFormateado = fechaLuxon.toFormat("EEEE", { locale: 'es' });
            diaFormateado = diaFormateado.replace('.', '');
            // Asegúrate de que la primera letra esté en mayúscula
            diaFormateado = diaFormateado.charAt(0).toUpperCase() + diaFormateado.slice(1);
        }
        else {
            diaFormateado = fechaLuxon.toFormat("EEE", { locale: 'es' });
            diaFormateado = diaFormateado.replace('.', '');
            // Asegúrate de que la primera letra esté en mayúscula
            diaFormateado = diaFormateado.charAt(0).toUpperCase() + diaFormateado.slice(1);
        }
        const fechaFormateada = fechaLuxon.toFormat(formato.fecha);
        const valor = `${diaFormateado}, ${fechaFormateada}`;
        console.log(' fecha.. ', fechaFormateada);
        return valor;
    });
};
exports.FormatearFecha = FormatearFecha;
const FormatearFecha2 = function (fecha, dia) {
    return __awaiter(this, void 0, void 0, function* () {
        const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
        const regexSinHora = /^\d{4}-\d{2}-\d{2}/;
        const formato = yield (0, exports.BuscarFecha)();
        if (!regex.test(fecha) && !regexSinHora.test(fecha)) {
            console;
            const date = new Date(fecha);
            // Obtener las partes de la fecha y formatearlas con dos dígitos
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const day = String(date.getUTCDate()).padStart(2, '0');
            const hours = String(date.getUTCHours()).padStart(2, '0');
            const minutes = String(date.getUTCMinutes()).padStart(2, '0');
            const seconds = String(date.getUTCSeconds()).padStart(2, '0');
            // Devolver la fecha formateada
            fecha = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }
        const fechaObj = luxon_1.DateTime.fromSQL(fecha); // Utiliza fromSQL para una cadena en formato 'YYYY-MM-DD HH:mm:ss'  console.log("ver fechaObj", fechaObj )
        // Formatear el día
        if (dia == "ddd") {
            let diaFormateado = fechaObj.toFormat("EEE", { locale: 'es' });
            // Limpia el día formateado de puntos no deseados
            diaFormateado = diaFormateado.replace('.', '');
            // Asegúrate de que la primera letra esté en mayúscula
            diaFormateado = diaFormateado.charAt(0).toUpperCase() + diaFormateado.slice(1);
            // Formatear la fecha
            const fechaFormateada = fechaObj.toFormat(formato.fecha);
            let valor = `${diaFormateado}, ${fechaFormateada}`;
            return valor;
        }
        else if (dia == "dddd") {
            let diaFormateado = fechaObj.toFormat("EEEE", { locale: 'es' });
            // Limpia el día formateado de puntos no deseados
            diaFormateado = diaFormateado.replace('.', '');
            // Asegúrate de que la primera letra esté en mayúscula
            diaFormateado = diaFormateado.charAt(0).toUpperCase() + diaFormateado.slice(1);
            // Formatear la fecha
            const fechaFormateada = fechaObj.toFormat(formato.fecha);
            let valor = `${diaFormateado}, ${fechaFormateada}`;
            return valor;
        }
    });
};
exports.FormatearFecha2 = FormatearFecha2;
const FormatearFechaBase = function (fecha, dia) {
    return __awaiter(this, void 0, void 0, function* () {
        const formato = yield (0, exports.BuscarFecha)();
        const fechaISO = transformDate(fecha); // CONVERTIR A ISO USANDO transformDate
        const fechaLuxon = luxon_1.DateTime.fromISO(fechaISO);
        // FORMATEAR EL DIA DE LA SEMANA Y LIMPIAR LOS PUNTOS
        let diaFormateado = fechaLuxon.setLocale('es').toFormat(dia).replace('.', '');
        // PRIMERA LETRA EN MAYUSCULA
        diaFormateado = diaFormateado.charAt(0).toUpperCase() + diaFormateado.slice(1);
        // FORMATEA LA FECHA SEGUN EL FORMATO OBTENIDO
        const fechaFormateada = fechaLuxon.toFormat(formato.fecha);
        const valor = `${diaFormateado}, ${fechaFormateada}`;
        return valor;
    });
};
exports.FormatearFechaBase = FormatearFechaBase;
// FUNCION TRANSFORMDATE USANDO LUXON PARA AJUSTAR ZONAS HORARIAS Y FORMATO
function transformDate(date) {
    const f = date.toString();
    let fechaSinZona = f.split(' (')[0]; // ELIMINAR LA ZONA HORARIA Y EL TEXTO ADICIONAL
    const partesFecha = fechaSinZona.split(' ');
    const mesTexto = partesFecha[1]; // MES EN FORMATO DE TEXTO ("DEC")
    const meses = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const numeroMes = meses.indexOf(mesTexto) + 1; // CONVERTIR MES A NUMERO (1-12)
    const fechaFormateada = `${partesFecha[3]}-${('0' + numeroMes).slice(-2)}-${partesFecha[2]}T${partesFecha[4]}`;
    const fechaLuxon = luxon_1.DateTime.fromISO(fechaFormateada, { zone: 'utc' });
    // AJUSTA LA ZONA HORARIA
    const zonaHoraria = partesFecha[5]; // "GMT-0500"
    const offset = parseInt(zonaHoraria.replace('GMT', ''));
    const fechaConZona = fechaLuxon.plus({ hours: offset });
    // DEVUELVE LA FECHA EN FORMATO ISO 8601 UTC
    return fechaConZona.toUTC().toISO();
}
const FormatearHora = function (hora) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("ver hora: ", hora);
        const formato = yield (0, exports.BuscarHora)(); // Obtenemos el formato deseado desde la función
        const horaConSegundos = hora.length === 5 ? `${hora}:00` : hora;
        const horaFormateada = horaConSegundos.length === 7 ? `0${horaConSegundos}` : horaConSegundos;
        const valor = luxon_1.DateTime.fromFormat(horaFormateada, 'HH:mm:ss').toFormat(formato.hora);
        return valor;
    });
};
exports.FormatearHora = FormatearHora;
// METODO PARA BUSCAR PARAMETRO FECHA (1)
const BuscarFecha = function () {
    return __awaiter(this, void 0, void 0, function* () {
        return {
            fecha: yield database_1.default.query(`
      SELECT descripcion FROM ep_detalle_parametro WHERE id_parametro = 1
      `).then(result => {
                if (result.rowCount != 0) {
                    return result.rows[0].descripcion;
                }
                else {
                    return 'DD/MM/YYYY';
                }
            })
        };
    });
};
exports.BuscarFecha = BuscarFecha;
// METODO PARA BUSCAR PARAMETRO HORA (2)
const BuscarHora = function () {
    return __awaiter(this, void 0, void 0, function* () {
        return {
            hora: yield database_1.default.query(`
      SELECT descripcion FROM ep_detalle_parametro WHERE id_parametro = 2
      `).then(result => {
                if (result.rowCount != 0) {
                    return result.rows[0].descripcion;
                }
                else {
                    return 'HH:mm:ss';
                }
            })
        };
    });
};
exports.BuscarHora = BuscarHora;
