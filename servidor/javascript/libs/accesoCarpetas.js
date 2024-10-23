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
exports.ObtenerIndicePlantilla = exports.ObtenerRutaLicencia = exports.ObtenerRutaLeerPlantillas = exports.ObtenerRutaPlatilla = exports.ObtenerRutaLogos = exports.ObtenerRutaBirthday = exports.ObtenerRutaDocumento = exports.ObtenerRutaHorarios = exports.ObtenerRutaContrato = exports.ObtenerRutaHorasExtra = exports.ObtenerRutaHorasExtraGeneral = exports.ObtenerRutaHorasExtraIdEmpleado = exports.ObtenerRutaPermisosGeneral = exports.ObtenerRutaPermisosIdEmpleado = exports.ObtenerRutaPermisos = exports.ObtenerRutaVacuna = exports.ObtenerRutaUsuario = exports.ObtenerRuta = void 0;
const database_1 = __importDefault(require("../database"));
const path_1 = __importDefault(require("path"));
// METODO PARA OBTENER RUTAS ORIGINALES
const ObtenerRuta = function (codigo, cedula, directorio) {
    return __awaiter(this, void 0, void 0, function* () {
        let ruta = '';
        let separador = path_1.default.sep;
        ruta = path_1.default.join(__dirname, `..${separador}..`);
        return `${ruta}${separador}${directorio}${separador}${codigo}_${cedula}`;
    });
};
exports.ObtenerRuta = ObtenerRuta;
// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO DE IMAGENES DE USUARIO
const ObtenerRutaUsuario = function (id) {
    return __awaiter(this, void 0, void 0, function* () {
        let ruta = '';
        let separador = path_1.default.sep;
        const usuario = yield database_1.default.query(`
        SELECT codigo, cedula FROM eu_empleados WHERE id = $1
        `, [id]);
        ruta = path_1.default.join(__dirname, `..${separador}..`);
        return ruta + separador + 'imagenesEmpleados' + separador + usuario.rows[0].codigo + '_' + usuario.rows[0].cedula;
    });
};
exports.ObtenerRutaUsuario = ObtenerRutaUsuario;
// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO DE CARNET VACUNAS
const ObtenerRutaVacuna = function (id) {
    return __awaiter(this, void 0, void 0, function* () {
        let ruta = '';
        let separador = path_1.default.sep;
        const usuario = yield database_1.default.query(`
        SELECT codigo, cedula FROM eu_empleados WHERE id = $1
        `, [id]);
        ruta = path_1.default.join(__dirname, `..${separador}..`);
        return ruta + separador + 'carnetVacuna' + separador + usuario.rows[0].codigo + '_' + usuario.rows[0].cedula;
    });
};
exports.ObtenerRutaVacuna = ObtenerRutaVacuna;
// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO DE PERMISOS
const ObtenerRutaPermisos = function (codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        let ruta = '';
        let separador = path_1.default.sep;
        const usuario = yield database_1.default.query(`
        SELECT cedula FROM eu_empleados WHERE codigo = $1
        `, [codigo]);
        ruta = path_1.default.join(__dirname, `..${separador}..`);
        return ruta + separador + 'permisos' + separador + codigo + '_' + usuario.rows[0].cedula;
    });
};
exports.ObtenerRutaPermisos = ObtenerRutaPermisos;
const ObtenerRutaPermisosIdEmpleado = function (id_empleado) {
    return __awaiter(this, void 0, void 0, function* () {
        let ruta = '';
        let separador = path_1.default.sep;
        const usuario = yield database_1.default.query(`
        SELECT codigo, cedula FROM eu_empleados WHERE id = $1
        `, [id_empleado]);
        ruta = path_1.default.join(__dirname, `..${separador}..`);
        const codigo = usuario.rows[0].codigo;
        const carpetaPermisos = `${ruta}${separador}permisos${separador}${codigo}_${usuario.rows[0].cedula}`;
        return { carpetaPermisos, codigo };
    });
};
exports.ObtenerRutaPermisosIdEmpleado = ObtenerRutaPermisosIdEmpleado;
// METODO PARA OBTENER RUTA CARPETA DE PERMISOS GENERAL
const ObtenerRutaPermisosGeneral = function () {
    return __awaiter(this, void 0, void 0, function* () {
        let ruta = '';
        let separador = path_1.default.sep;
        ruta = path_1.default.join(__dirname, `..${separador}..`);
        return ruta + separador + 'permisos';
    });
};
exports.ObtenerRutaPermisosGeneral = ObtenerRutaPermisosGeneral;
// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO DE HORAS EXTRA
const ObtenerRutaHorasExtraIdEmpleado = function (id_empleado) {
    return __awaiter(this, void 0, void 0, function* () {
        let ruta = '';
        let separador = path_1.default.sep;
        const usuario = yield database_1.default.query(`
        SELECT codigo, cedula FROM eu_empleados WHERE id = $1
        `, [id_empleado]);
        ruta = path_1.default.join(__dirname, `..${separador}..`);
        const codigo = usuario.rows[0].codigo;
        const carpetaHorasExtra = `${ruta}${separador}horasExtra${separador}${codigo}_${usuario.rows[0].cedula}`;
        return { carpetaHorasExtra, codigo };
    });
};
exports.ObtenerRutaHorasExtraIdEmpleado = ObtenerRutaHorasExtraIdEmpleado;
// METODO PARA OBTENER RUTA CARPETA DE HORAS EXTRA GENERAL
let ruta = '';
const ObtenerRutaHorasExtraGeneral = function () {
    return __awaiter(this, void 0, void 0, function* () {
        let separador = path_1.default.sep;
        ruta = path_1.default.join(__dirname, `..${separador}..`);
        return ruta + separador + 'horasExtras';
    });
};
exports.ObtenerRutaHorasExtraGeneral = ObtenerRutaHorasExtraGeneral;
const ObtenerRutaHorasExtra = function (codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        let ruta = '';
        let separador = path_1.default.sep;
        const usuario = yield database_1.default.query(`
        SELECT cedula FROM eu_empleados WHERE codigo = $1
        `, [codigo]);
        ruta = path_1.default.join(__dirname, `..${separador}..`);
        return ruta + separador + 'horasExtras' + separador + codigo + '_' + usuario.rows[0].cedula;
    });
};
exports.ObtenerRutaHorasExtra = ObtenerRutaHorasExtra;
// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO DE CONTRATOS DEL USUARIO
const ObtenerRutaContrato = function (id) {
    return __awaiter(this, void 0, void 0, function* () {
        let ruta = '';
        let separador = path_1.default.sep;
        const usuario = yield database_1.default.query(`
        SELECT codigo, cedula FROM eu_empleados WHERE id = $1
        `, [id]);
        ruta = path_1.default.join(__dirname, `..${separador}..`);
        return ruta + separador + 'contratos' + separador + usuario.rows[0].codigo + '_' + usuario.rows[0].cedula;
    });
};
exports.ObtenerRutaContrato = ObtenerRutaContrato;
const ObtenerRutaHorarios = function () {
    let ruta = '';
    let separador = path_1.default.sep;
    ruta = path_1.default.join(__dirname, `..${separador}..`);
    return ruta + separador + 'horarios';
};
exports.ObtenerRutaHorarios = ObtenerRutaHorarios;
// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO
const ObtenerRutaDocumento = function () {
    let ruta = '';
    let separador = path_1.default.sep;
    ruta = path_1.default.join(__dirname, `..${separador}..`);
    return ruta + separador + 'documentacion';
};
exports.ObtenerRutaDocumento = ObtenerRutaDocumento;
// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO DE IMAGENES DE CUMPLEANIO
const ObtenerRutaBirthday = function () {
    let ruta = '';
    let separador = path_1.default.sep;
    ruta = path_1.default.join(__dirname, `..${separador}..`);
    return ruta + separador + 'cumpleanios';
};
exports.ObtenerRutaBirthday = ObtenerRutaBirthday;
// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO DE LOGOS DE EMPRESA
const ObtenerRutaLogos = function () {
    let ruta = '';
    let separador = path_1.default.sep;
    ruta = path_1.default.join(__dirname, `..${separador}..`);
    return ruta + separador + 'logos';
};
exports.ObtenerRutaLogos = ObtenerRutaLogos;
// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO
const ObtenerRutaPlatilla = function () {
    let ruta = '';
    let separador = path_1.default.sep;
    ruta = path_1.default.join(__dirname, `..${separador}..`);
    return ruta + separador + 'plantillasRegistro';
};
exports.ObtenerRutaPlatilla = ObtenerRutaPlatilla;
// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO DE ARCHIVOS DE DATOS
const ObtenerRutaLeerPlantillas = function () {
    let ruta = '';
    let separador = path_1.default.sep;
    ruta = path_1.default.join(__dirname, `..${separador}..`);
    return ruta + separador + 'leerPlantillas';
};
exports.ObtenerRutaLeerPlantillas = ObtenerRutaLeerPlantillas;
// METODO DE BUSQUEDA DE ARCHIVO LICENCIA
const ObtenerRutaLicencia = function () {
    let ruta = '';
    let separador = path_1.default.sep;
    ruta = path_1.default.join(__dirname, `..${separador}..`);
    return ruta + separador + 'licencia.conf.json';
};
exports.ObtenerRutaLicencia = ObtenerRutaLicencia;
// METODO PARA OBTENER POSICION DE PLANTILLA
const ObtenerIndicePlantilla = function (libroExcel, hoja) {
    const sheet_name_list = libroExcel.SheetNames;
    let indice = 0;
    let verificador = 0;
    for (var i = 0; i < sheet_name_list.length; i++) {
        if ((sheet_name_list[i]).toUpperCase() === hoja) {
            indice = i;
            verificador = 1;
            break;
        }
    }
    if (verificador === 1) {
        return indice;
    }
    else {
        return false;
    }
};
exports.ObtenerIndicePlantilla = ObtenerIndicePlantilla;
