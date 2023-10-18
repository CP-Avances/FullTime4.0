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
exports.ObtenerRutaPlatilla = exports.ObtenerRutaContrato = exports.ObtenerRutaLogos = exports.ObtenerRutaBirthday = exports.ObtenerRutaDocumento = exports.ObtenerRutaHorarios = exports.ObtenerRutaPermisos = exports.ObtenerRutaVacuna = exports.ObtenerRutaUsuario = void 0;
const database_1 = __importDefault(require("../database"));
const path_1 = __importDefault(require("path"));
// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO DE IMAGENES DE USUARIO
const ObtenerRutaUsuario = function (id) {
    return __awaiter(this, void 0, void 0, function* () {
        var ruta = '';
        let separador = path_1.default.sep;
        const usuario = yield database_1.default.query(`
        SELECT codigo, cedula FROM empleados WHERE id = $1
        `, [id]);
        console.log('ruta instalacion ', __dirname);
        for (var i = 0; i < __dirname.split(separador).length - 2; i++) {
            if (ruta === '') {
                ruta = __dirname.split(separador)[i];
            }
            else {
                ruta = ruta + separador + __dirname.split(separador)[i];
            }
        }
        console.log('ver ruta imagen libs ', ruta + separador + 'imagenesEmpleados' + separador + usuario.rows[0].codigo + '_' + usuario.rows[0].cedula);
        return ruta + separador + 'imagenesEmpleados' + separador + usuario.rows[0].codigo + '_' + usuario.rows[0].cedula;
    });
};
exports.ObtenerRutaUsuario = ObtenerRutaUsuario;
// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO DE CARNET VACUNAS
const ObtenerRutaVacuna = function (id) {
    return __awaiter(this, void 0, void 0, function* () {
        var ruta = '';
        let separador = path_1.default.sep;
        console.log('ruta instalacion ', __dirname);
        const usuario = yield database_1.default.query(`
        SELECT codigo, cedula FROM empleados WHERE id = $1
        `, [id]);
        for (var i = 0; i < __dirname.split(separador).length - 2; i++) {
            if (ruta === '') {
                ruta = __dirname.split(separador)[i];
            }
            else {
                ruta = ruta + separador + __dirname.split(separador)[i];
            }
        }
        console.log('ver ruta imagen libs ', ruta + separador + 'carnetVacuna' + separador + usuario.rows[0].codigo + '_' + usuario.rows[0].cedula);
        return ruta + separador + 'carnetVacuna' + separador + usuario.rows[0].codigo + '_' + usuario.rows[0].cedula;
    });
};
exports.ObtenerRutaVacuna = ObtenerRutaVacuna;
// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO DE PERMISOS
const ObtenerRutaPermisos = function (codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        var ruta = '';
        let separador = path_1.default.sep;
        const usuario = yield database_1.default.query(`
        SELECT cedula FROM empleados WHERE codigo = $1
        `, [codigo]);
        console.log('ruta instalacion ', __dirname);
        for (var i = 0; i < __dirname.split(separador).length - 2; i++) {
            if (ruta === '') {
                ruta = __dirname.split(separador)[i];
            }
            else {
                ruta = ruta + separador + __dirname.split(separador)[i];
            }
        }
        console.log('ver ruta imagen libs ', ruta + separador + 'permisos' + separador + codigo + '_' + usuario.rows[0].cedula);
        return ruta + separador + 'permisos' + separador + codigo + '_' + usuario.rows[0].cedula;
    });
};
exports.ObtenerRutaPermisos = ObtenerRutaPermisos;
const ObtenerRutaHorarios = function () {
    var ruta = '';
    let separador = path_1.default.sep;
    for (var i = 0; i < __dirname.split(separador).length - 2; i++) {
        if (ruta === '') {
            ruta = __dirname.split(separador)[i];
        }
        else {
            ruta = ruta + separador + __dirname.split(separador)[i];
        }
    }
    return ruta + separador + 'horarios';
};
exports.ObtenerRutaHorarios = ObtenerRutaHorarios;
// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO
const ObtenerRutaDocumento = function () {
    var ruta = '';
    let separador = path_1.default.sep;
    for (var i = 0; i < __dirname.split(separador).length - 2; i++) {
        if (ruta === '') {
            ruta = __dirname.split(separador)[i];
        }
        else {
            ruta = ruta + separador + __dirname.split(separador)[i];
        }
    }
    return ruta + separador + 'documentacion';
};
exports.ObtenerRutaDocumento = ObtenerRutaDocumento;
// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO DE IMAGENES DE CUMPLEANIO
const ObtenerRutaBirthday = function () {
    var ruta = '';
    let separador = path_1.default.sep;
    for (var i = 0; i < __dirname.split(separador).length - 2; i++) {
        if (ruta === '') {
            ruta = __dirname.split(separador)[i];
        }
        else {
            ruta = ruta + separador + __dirname.split(separador)[i];
        }
    }
    return ruta + separador + 'cumpleanios';
};
exports.ObtenerRutaBirthday = ObtenerRutaBirthday;
// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO DE LOGOS DE EMPRESA
const ObtenerRutaLogos = function () {
    var ruta = '';
    let separador = path_1.default.sep;
    for (var i = 0; i < __dirname.split(separador).length - 2; i++) {
        if (ruta === '') {
            ruta = __dirname.split(separador)[i];
        }
        else {
            ruta = ruta + separador + __dirname.split(separador)[i];
        }
    }
    return ruta + separador + 'logos';
};
exports.ObtenerRutaLogos = ObtenerRutaLogos;
// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO DE CONTRATOS DEL USUARIO
const ObtenerRutaContrato = function (id) {
    return __awaiter(this, void 0, void 0, function* () {
        var ruta = '';
        let separador = path_1.default.sep;
        const usuario = yield database_1.default.query(`
        SELECT codigo, cedula FROM empleados WHERE id = $1
        `, [id]);
        for (var i = 0; i < __dirname.split(separador).length - 2; i++) {
            if (ruta === '') {
                ruta = __dirname.split(separador)[i];
            }
            else {
                ruta = ruta + separador + __dirname.split(separador)[i];
            }
        }
        return ruta + separador + 'contratos' + separador + usuario.rows[0].codigo + '_' + usuario.rows[0].cedula;
    });
};
exports.ObtenerRutaContrato = ObtenerRutaContrato;
// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO
const ObtenerRutaPlatilla = function () {
    var ruta = '';
    let separador = path_1.default.sep;
    for (var i = 0; i < __dirname.split(separador).length - 2; i++) {
        if (ruta === '') {
            ruta = __dirname.split(separador)[i];
        }
        else {
            ruta = ruta + separador + __dirname.split(separador)[i];
        }
    }
    return ruta + separador + 'plantillasRegistro';
};
exports.ObtenerRutaPlatilla = ObtenerRutaPlatilla;
