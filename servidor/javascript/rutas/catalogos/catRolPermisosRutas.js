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
        // METODO PARA ENLISTAR PAGINAS QUE NO SEAN MODULOS  **USADO
        this.router.get('/menu/paginas', verificarToken_1.TokenValidation, catRolPermisosControlador_1.default.ListarMenuRoles);
        // METODO PARA ENLISTAR PAGINAS SEAN MODULOS  **USADO
        this.router.get('/menu/modulos', verificarToken_1.TokenValidation, catRolPermisosControlador_1.default.ListarMenuModulosRoles);
        // METODO PARA ENLISTAR PAGINAS QUE SON MODULOS, CLASIFICANDOLAS POR EL NOMBRE DEL MODULO  **USADO
        this.router.post('/menu/paginasmodulos', verificarToken_1.TokenValidation, catRolPermisosControlador_1.default.ListarModuloPorNombre);
        // METODO PARA BUSCAR SI EXISTEN PAGINAS CON EL ID DEL ROL REGISTRADA CUANDO NO TIENE ACCION  **USADO
        this.router.post('/menu/paginas/ide', verificarToken_1.TokenValidation, catRolPermisosControlador_1.default.ObtenerIdPaginas);
        // METODO PARA BUSCAR LAS PAGINAS POR ID_ROL Y POR SU ACCION  **USADO
        this.router.post('/menu/paginas/ideaccion', verificarToken_1.TokenValidation, catRolPermisosControlador_1.default.ObtenerIdPaginasConAcciones);
        // METODO PARA BUSCAR TODAS LAS PAGINAS QUE TIENE EL ROL  **USADO
        this.router.post('/menu/todaspaginasrol', verificarToken_1.TokenValidation, catRolPermisosControlador_1.default.ObtenerPaginasRol);
        // METODO PARA ASIGNAR FUNCIONES AL ROL  **USADO
        this.router.post('/menu/paginas/insertar', verificarToken_1.TokenValidation, catRolPermisosControlador_1.default.AsignarPaginaRol);
        // METODO PARA ELIMINAR REGISTRO  **USADO
        this.router.post('/menu/paginas/eliminar', verificarToken_1.TokenValidation, catRolPermisosControlador_1.default.EliminarPaginaRol);
        // METODO PARA BUSCAR LAS ACCIONES POR CADA PAGINA  **USADO
        this.router.post('/menu/paginas/acciones', verificarToken_1.TokenValidation, catRolPermisosControlador_1.default.ObtenerAccionesPaginas);
        // METODO PARA ENLISTAR ACCIONES SEGUN LA PAGINA  **USADO
        this.router.post('/menu/paginas/accionesexistentes', verificarToken_1.TokenValidation, catRolPermisosControlador_1.default.ObtenerAccionesPaginasExistentes);
        // METODO PARA OBTENER TODAS LAS ACCIONES  **USADO
        this.router.get('/menu/paginas/acciones/todas', verificarToken_1.TokenValidation, catRolPermisosControlador_1.default.ListarAcciones);
    }
}
const rolPermisosRutas = new RolPermisosRutas();
exports.default = rolPermisosRutas.router;
