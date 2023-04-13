"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rolPermisosControlador_1 = __importDefault(require("../../controlador/Catalogos/rolPermisosControlador"));
class RolPermisosRutas {
    constructor() {
        this.router = express_1.Router();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', rolPermisosControlador_1.default.list);
        this.router.get('/:id', rolPermisosControlador_1.default.getOne);
        this.router.post('/', rolPermisosControlador_1.default.create);
        this.router.post('/denegado/', rolPermisosControlador_1.default.createPermisoDenegado);
        this.router.get('/denegado/:id', rolPermisosControlador_1.default.getPermisosUsuario);
    }
}
const rolPermisosRutas = new RolPermisosRutas();
exports.default = rolPermisosRutas.router;
