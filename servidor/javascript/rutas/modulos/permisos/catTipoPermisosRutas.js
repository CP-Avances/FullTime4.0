"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catTipoPermisosControlador_1 = __importDefault(require("../../../controlador/modulos/permisos/catTipoPermisosControlador"));
const verificarToken_1 = require("../../../libs/verificarToken");
class TipoPermisosRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA BUSCAR TIPOS DE PERMISOS
        this.router.get('/', verificarToken_1.TokenValidation, catTipoPermisosControlador_1.default.Listar);
        // METODO PARA ELIMINAR REGISTROS
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catTipoPermisosControlador_1.default.EliminarRegistros);
        // METODO PARA BUSCAR DATOS DE UN TIPO DE PERMISO
        this.router.get('/:id', verificarToken_1.TokenValidation, catTipoPermisosControlador_1.default.BuscarUnTipoPermiso);
        // METODO PARA REGISTRAR TIPO DE PERMISO
        this.router.post('/', verificarToken_1.TokenValidation, catTipoPermisosControlador_1.default.Crear);
        // METODO PARA EDITAR REGISTRO
        this.router.put('/editar/:id', verificarToken_1.TokenValidation, catTipoPermisosControlador_1.default.Editar);
        // METODO PARA LISTAR TIPO DE PERMISOS DE ACUERDO AL ROL
        this.router.get('/acceso/:acce_empleado', verificarToken_1.TokenValidation, catTipoPermisosControlador_1.default.ListarTipoPermisoRol);
    }
}
const TIPO_PERMISOS_RUTAS = new TipoPermisosRutas();
exports.default = TIPO_PERMISOS_RUTAS.router;
