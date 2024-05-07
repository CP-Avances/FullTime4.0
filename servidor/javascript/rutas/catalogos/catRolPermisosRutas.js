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
        // MENU ENLISTAR
        this.router.get('/menu/paginas', verificarToken_1.TokenValidation, catRolPermisosControlador_1.default.ListarMenuRoles);
        // MENU ENLISTAR Modulo
        this.router.get('/menu/modulos', verificarToken_1.TokenValidation, catRolPermisosControlador_1.default.ListarMenuModulosRoles);
        //MENU ENLISTAR POR MODULO
        this.router.post('/menu/paginasmodulos', verificarToken_1.TokenValidation, catRolPermisosControlador_1.default.ListarMenuRolesModulos);
        // METODO PARA BUSCAR LAS PAGINAS POR ID_ROL
        this.router.post('/menu/paginas/ide', verificarToken_1.TokenValidation, catRolPermisosControlador_1.default.ObtenerIdPaginas);
        this.router.post('/menu/paginas/ideaccion', verificarToken_1.TokenValidation, catRolPermisosControlador_1.default.ObtenerIdPaginasConAcciones);
        //METODO PARA BUSCAR TODAS LAS PAGINAS QUE TIENE EL ROL
        this.router.post('/menu/todaspaginasrol', verificarToken_1.TokenValidation, catRolPermisosControlador_1.default.ObtenerPaginasRol);
        // METODO PARA REGISTRAR ASIGNACION DE PAGINAS  
        this.router.post('/menu/paginas/insertar', verificarToken_1.TokenValidation, catRolPermisosControlador_1.default.AsignarPaginaRol);
        // METODO PARA ELIMINAR LAS PAGINAS  
        this.router.post('/menu/paginas/eliminar', verificarToken_1.TokenValidation, catRolPermisosControlador_1.default.EliminarPaginaRol);
        this.router.post('/menu/paginas/eliminarsinaccion', verificarToken_1.TokenValidation, catRolPermisosControlador_1.default.EliminarPaginaRolSinAccion);
        // METODO PARA BUSCAR LAS ACCIONES DE LAS PAGINAS
        this.router.post('/menu/paginas/acciones', verificarToken_1.TokenValidation, catRolPermisosControlador_1.default.ObtenerAccionesPaginas);
        this.router.post('/menu/paginas/accionesexistentes', verificarToken_1.TokenValidation, catRolPermisosControlador_1.default.ObtenerAccionesPaginasExistentes);
        // METODO PARA BUSCAR LAS ACCIONES DE LAS PAGINAS
        this.router.post('/menu/paginas/acciones/id', verificarToken_1.TokenValidation, catRolPermisosControlador_1.default.ObtenerAccionPorId);
        // METODO PARA OBTENER TODAS LAS ACCIONES
        this.router.get('/menu/paginas/acciones/todas', verificarToken_1.TokenValidation, catRolPermisosControlador_1.default.ListarAcciones);
    }
}
const rolPermisosRutas = new RolPermisosRutas();
exports.default = rolPermisosRutas.router;
