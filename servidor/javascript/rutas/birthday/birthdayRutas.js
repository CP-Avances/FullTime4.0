"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const verificarToken_1 = require("../../libs/verificarToken");
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const birthdayControlador_1 = __importDefault(require("../../controlador/birthday/birthdayControlador"));
// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO
const ObtenerRuta = function () {
    var ruta = '';
    let separador = path_1.default.sep;
    for (var i = 0; i < __dirname.split(separador).length - 3; i++) {
        if (ruta === '') {
            ruta = __dirname.split(separador)[i];
        }
        else {
            ruta = ruta + separador + __dirname.split(separador)[i];
        }
    }
    return ruta + separador + 'cumpleanios';
};
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, ObtenerRuta());
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = (0, multer_1.default)({ storage: storage });
class BirthdayRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA CONSULTAR MENSAJE DE CUMPLEAÑOS
        this.router.get('/:id_empresa', verificarToken_1.TokenValidation, birthdayControlador_1.default.MensajeEmpresa);
        // METODO PARA REGISTRAR MENSAJE DE CUMPLEAÑOS
        this.router.post('/', verificarToken_1.TokenValidation, birthdayControlador_1.default.CrearMensajeBirthday);
        // METODO PARA SUBIR IMAGEN DE CUMPLEAÑOS   --**VERIFICADO
        this.router.put('/:id_empresa/uploadImage', [verificarToken_1.TokenValidation, upload.single('uploads')], birthdayControlador_1.default.CrearImagenEmpleado);
        // METODO PARA DESCARGAR IMAGEN DE CUMPLEAÑOS
        this.router.get('/img/:imagen', birthdayControlador_1.default.getImagen);
        // METODO PARA ACTUALIZAR MENSAJE DE CUMPLEAÑOS
        this.router.put('/editar/:id_mensaje', verificarToken_1.TokenValidation, birthdayControlador_1.default.EditarMensajeBirthday);
    }
}
const BIRTHDAY_RUTAS = new BirthdayRutas();
exports.default = BIRTHDAY_RUTAS.router;
