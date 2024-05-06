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
exports.ObtenerRutaLeerPlantillas = exports.ObtenerRutaPlatilla = exports.ObtenerRutaContrato = exports.ObtenerRutaLogos = exports.ObtenerRutaBirthday = exports.ObtenerRutaDocumento = exports.ObtenerRutaHorarios = exports.ObtenerRutaPermisos = exports.ObtenerRutaVacuna = exports.ObtenerRutaUsuario = void 0;
const database_1 = __importDefault(require("../database"));
const path_1 = __importDefault(require("path"));
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
