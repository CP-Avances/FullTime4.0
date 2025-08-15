"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../../libs/verificarToken");
const configurarVacaciones_1 = __importDefault(require("../../../controlador/modulos/vacaciones/configurarVacaciones"));
class DepartamentoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA CREAR CONFIGURACION DE VACACIONES   **USADO
        this.router.post('/', verificarToken_1.TokenValidation, configurarVacaciones_1.default.RegistrarConfiguracion);
        // METODO PARA ACTUALIZAR CONFIGURACION DE VACACIONES   **USADO
        this.router.put('/', verificarToken_1.TokenValidation, configurarVacaciones_1.default.ActualizarConfiguracion);
        // METODO PARA CONSULTAR DATOS DE CONFIGURACION DE VACACIONES    **USADO
        this.router.get('/vacaciones-configuracion', verificarToken_1.TokenValidation, configurarVacaciones_1.default.ListarConfiguraciones);
        // METODO PARA BUSCAR PERIODO DE VACACIONES   **USADO
        this.router.get('/buscar-configuracion/:id', verificarToken_1.TokenValidation, configurarVacaciones_1.default.ConsultarUnaConfiguracion);
        // METODO PARA ELIMINAR REGISTROS
        this.router.post('/eliminar-configuracion', verificarToken_1.TokenValidation, configurarVacaciones_1.default.EliminarConfiguracion);
    }
}
const CONFIGURAR_VACACIONES_RUTAS = new DepartamentoRutas();
exports.default = CONFIGURAR_VACACIONES_RUTAS.router;
