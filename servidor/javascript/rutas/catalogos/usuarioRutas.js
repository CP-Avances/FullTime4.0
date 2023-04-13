"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usuarioControlador_1 = require("../../controlador/Catalogos/usuarioControlador");
class UsuarioRutas {
    constructor() {
        this.router = express_1.Router();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', usuarioControlador_1.USUARIO_CONTROLADOR.list);
        this.router.post('/', usuarioControlador_1.USUARIO_CONTROLADOR.create);
        this.router.get('/busqueda/:usuario', usuarioControlador_1.USUARIO_CONTROLADOR.getIdByUsuario);
    }
}
const USUARIO_RUTA = new UsuarioRutas();
exports.default = USUARIO_RUTA.router;
