"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const accionPersonalControlador_1 = __importDefault(require("../../controlador/accionPersonal/accionPersonalControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
class DepartamentoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        /** TABLA TIPO_ACCION_PERSONAL */
        this.router.get('/', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.ListarTipoAccionPersonal);
        this.router.post('/', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.CrearTipoAccionPersonal);
        this.router.get('/tipo/accion/:id', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.EncontrarTipoAccionPersonalId);
        this.router.put('/', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.ActualizarTipoAccionPersonal);
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.EliminarTipoAccionPersonal);
        this.router.get('/editar/accion/tipo/:id', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.ListarTipoAccionEdicion);
        /** TABLA TIPO_ACCION */
        this.router.get('/accion/tipo', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.ListarTipoAccion);
        this.router.post('/accion/tipo', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.CrearTipoAccion);
        /** TABLA CARGO_PROPUESTO */
        this.router.get('/cargo', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.ListarCargoPropuestos);
        this.router.post('/cargo', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.CrearCargoPropuesto);
        this.router.get('/tipo/cargo', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.EncontrarUltimoCargoP);
        this.router.get('/cargo/:id', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.ListarUnCargoPropuestos);
        /** TABLA CONTEXTO LEGAL */
        this.router.get('/decreto', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.ListarDecretos);
        this.router.get('/decreto/:id', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.ListarUnDecreto);
        this.router.post('/decreto', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.CrearDecreto);
        this.router.get('/tipo/decreto', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.EncontrarUltimoDecreto);
        /** TABLA PEDIDO_ACCION_EMPLEADO */
        this.router.post('/pedido/accion', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.CrearPedidoAccionPersonal);
        this.router.put('/pedido/accion/editar', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.ActualizarPedidoAccionPersonal);
        // VER LOGO DE MINISTERIO TRABAJO
        this.router.get('/logo/ministerio/codificado', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.verLogoMinisterio);
        // CONSULTAS PEDIDOS ACCIONES DE PERSONAL
        this.router.get('/pedidos/accion', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.ListarPedidoAccion);
        this.router.get('/pedidos/datos/:id', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.EncontrarDatosEmpleados);
        this.router.get('/pedidos/ciudad/:id', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.EncontrarDatosCiudades);
        this.router.get('/pedido/informacion/:id', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.EncontrarPedidoAccion);
        this.router.get('/lista/procesos/:id', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.EncontrarProcesosRecursivos);
    }
}
const ACCION_PERSONAL_RUTAS = new DepartamentoRutas();
exports.default = ACCION_PERSONAL_RUTAS.router;
