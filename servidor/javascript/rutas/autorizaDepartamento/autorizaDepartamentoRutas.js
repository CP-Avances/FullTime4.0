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
        // METODO DE BUSQUEDA DE USUARIO QUE AUTORIZA
        this.router.get('/autoriza/:id_empleado', autorizaDepartamentoControlador_1.default.EncontrarAutorizacionUsuario);
        // METODO PARA REGISTRAR AUTORIZA
        this.router.post('/', autorizaDepartamentoControlador_1.default.CrearAutorizaDepartamento);
        // METODO PARA ACTUALIZAR REGISTRO
        this.router.put('/', autorizaDepartamentoControlador_1.default.ActualizarAutorizaDepartamento);
        // METODO PARA ELIMINAR REGISTROS
        this.router.delete('/eliminar/:id', autorizaDepartamentoControlador_1.default.EliminarAutorizacionDepartamento);
        this.router.get('/', autorizaDepartamentoControlador_1.default.ListarAutorizaDepartamento);
        this.router.get('/empleadosAutorizan/:id_depar', autorizaDepartamentoControlador_1.default.ObtenerQuienesAutorizan);
    }
}
const AUTORIZA_DEPARTAMENTO_RUTAS = new DepartamentoRutas();
exports.default = AUTORIZA_DEPARTAMENTO_RUTAS.router;
