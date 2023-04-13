"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const birthdayControlador_1 = __importDefault(require("../../controlador/birthday/birthdayControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './cumpleanios',
});
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
        // METODO PARA SUBIR IMAGEN DE CUMPLEAÑOS
        this.router.put('/:id_empresa/uploadImage', [verificarToken_1.TokenValidation, multipartMiddleware], birthdayControlador_1.default.CrearImagenEmpleado);
        // METODO PARA DESCARGAR IMAGEN DE CUMPLEAÑOS
        this.router.get('/img/:imagen', birthdayControlador_1.default.getImagen);
        // METODO PARA ACTUALIZAR MENSAJE DE CUMPLEAÑOS
        this.router.put('/editar/:id_mensaje', verificarToken_1.TokenValidation, birthdayControlador_1.default.EditarMensajeBirthday);
    }
}
const BIRTHDAY_RUTAS = new BirthdayRutas();
exports.default = BIRTHDAY_RUTAS.router;
