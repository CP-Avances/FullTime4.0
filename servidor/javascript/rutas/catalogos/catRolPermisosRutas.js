"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catRolPermisosControlador_1 = __importDefault(require("../../controlador/catalogos/catRolPermisosControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
class RolPermisosRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', verificarToken_1.TokenValidation, catRolPermisosControlador_1.default.list);
        this.router.get('/:id', verificarToken_1.TokenValidation, catRolPermisosControlador_1.default.getOne);
        this.router.post('/', verificarToken_1.TokenValidation, catRolPermisosControlador_1.default.create);
        this.router.post('/denegado/', verificarToken_1.TokenValidation, catRolPermisosControlador_1.default.createPermisoDenegado);
        this.router.get('/denegado/:id', verificarToken_1.TokenValidation, catRolPermisosControlador_1.default.getPermisosUsuario);
        // MENU ENLISTAR
        this.router.get('/menu', verificarToken_1.TokenValidation, catRolPermisosControlador_1.default.ListarMenuRoles);
    }
}
const rolPermisosRutas = new RolPermisosRutas();
exports.default = rolPermisosRutas.router;
