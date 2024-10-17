"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const autorizaDepartamentoControlador_1 = __importDefault(require("../../controlador/autorizaDepartamento/autorizaDepartamentoControlador"));
class DepartamentoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO DE BUSQUEDA DE USUARIO QUE AUTORIZA   **USADO
        this.router.get('/autoriza/:id_empleado', autorizaDepartamentoControlador_1.default.EncontrarAutorizacionEmple);
        // METODO DE BUSQUEDA DE USUARIO QUE AUTORIZA
        this.router.get('/autorizaUsuarioDepa/:id_empleado', autorizaDepartamentoControlador_1.default.EncontrarAutorizacionUsuario);
        // METODO PARA REGISTRAR AUTORIZA
        this.router.post('/', autorizaDepartamentoControlador_1.default.CrearAutorizaDepartamento);
        // METODO PARA ACTUALIZAR REGISTRO
        this.router.put('/actualizar', autorizaDepartamentoControlador_1.default.ActualizarAutorizaDepartamento);
        // METODO PARA ELIMINAR REGISTROS    **USADO
        this.router.delete('/eliminar/:id', autorizaDepartamentoControlador_1.default.EliminarAutorizacionDepartamento);
        // METODO PARA LISTAR USUARIOS QUE APRUEBAN EN UN DEPARTAMENTO   **USADO
        this.router.get('/listaempleadosAutorizan/:id_depa', autorizaDepartamentoControlador_1.default.ObtenerListaEmpleadosAutorizan);
        this.router.get('/listaDepaAutoriza/:id_depar', autorizaDepartamentoControlador_1.default.ObtenerListaAutorizaDepa);
    }
}
const AUTORIZA_DEPARTAMENTO_RUTAS = new DepartamentoRutas();
exports.default = AUTORIZA_DEPARTAMENTO_RUTAS.router;
