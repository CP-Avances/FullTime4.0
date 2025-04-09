"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mensajesNotificacionesControlador_1 = __importDefault(require("../../controlador/notificaciones/mensajesNotificacionesControlador"));
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
const verificarToken_1 = require("../../libs/verificarToken");
const luxon_1 = require("luxon");
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, (0, accesoCarpetas_1.ObtenerRutaMensajeNotificacion)());
    },
    filename: function (req, file, cb) {
        // FECHA DEL SISTEMA
        var fecha = luxon_1.DateTime.now();
        var anio = fecha.toFormat('yyyy');
        var mes = fecha.toFormat('MM');
        var dia = fecha.toFormat('dd');
        let documento = anio + '_' + mes + '_' + dia + '_' + file.originalname;
        cb(null, documento);
    }
});
const upload = (0, multer_1.default)({ storage: storage });
class MensajesNotificacionesRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA CONSULTAR MENSAJE DE CUMPLEAÑOS    **USADO
        this.router.get('/:id_empresa', verificarToken_1.TokenValidation, mensajesNotificacionesControlador_1.default.MensajeEmpresa);
        // METODO PARA REGISTRAR MENSAJE DE CUMPLEAÑOS   **USADO
        this.router.post('/', verificarToken_1.TokenValidation, mensajesNotificacionesControlador_1.default.CrearMensajeNotificacion);
        // METODO PARA SUBIR IMAGEN DE CUMPLEAÑOS   **USADO
        this.router.put('/:id_empresa/uploadImage', [verificarToken_1.TokenValidation, upload.single('uploads')], mensajesNotificacionesControlador_1.default.CrearImagenNotificacion);
        // METODO PARA DESCARGAR IMAGEN DE CUMPLEAÑOS    **USADO FRONT
        this.router.get('/img/:imagen', mensajesNotificacionesControlador_1.default.ObtenerImagen);
        // METODO PARA ACTUALIZAR MENSAJE DE CUMPLEAÑOS   **USADO
        this.router.put('/editar/:id', verificarToken_1.TokenValidation, mensajesNotificacionesControlador_1.default.EditarMensajeBirthday);
    }
}
const MENSAJES_NOTIFICACIONES_RUTAS = new MensajesNotificacionesRutas();
exports.default = MENSAJES_NOTIFICACIONES_RUTAS.router;
