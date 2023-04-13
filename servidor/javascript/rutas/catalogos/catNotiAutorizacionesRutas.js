"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catNotiAutorizacionesControlador_1 = __importDefault(require("../../controlador/catalogos/catNotiAutorizacionesControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
class NotificacionesAutorizacionesRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', verificarToken_1.TokenValidation, catNotiAutorizacionesControlador_1.default.ListarNotiAutorizaciones);
        this.router.get('/lista/:id_notificacion', verificarToken_1.TokenValidation, catNotiAutorizacionesControlador_1.default.ListarPorNotificacion);
        this.router.get('/:id', verificarToken_1.TokenValidation, catNotiAutorizacionesControlador_1.default.ObtenerUnaNotiAutorizacion);
        this.router.post('/', verificarToken_1.TokenValidation, catNotiAutorizacionesControlador_1.default.CrearNotiAutorizacion);
    }
}
const NOTIFICACIONES_AUTORIZACIONES_RUTA = new NotificacionesAutorizacionesRutas();
exports.default = NOTIFICACIONES_AUTORIZACIONES_RUTA.router;
