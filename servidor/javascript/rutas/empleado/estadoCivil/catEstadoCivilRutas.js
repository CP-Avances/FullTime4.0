"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catEstadoCivilControlador_1 = __importDefault(require("../../../controlador/empleado/empleadoEstadoCivil/catEstadoCivilControlador"));
const verificarToken_1 = require("../../../libs/verificarToken");
class EstadoCivilRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', verificarToken_1.TokenValidation, catEstadoCivilControlador_1.default.ListarEstadosCivil);
        // METODO PARA BUSCAR GENERO   **USADO
        this.router.get('/buscar/:estado', verificarToken_1.TokenValidation, catEstadoCivilControlador_1.default.ObtenerEstadoCivil);
        // METODO PARA CREAR GENERO   **USADO
        this.router.post('/', verificarToken_1.TokenValidation, catEstadoCivilControlador_1.default.CrearEstadoCivil);
        // METODO PARA EDITAR GENERO   **USADO
        this.router.put('/', verificarToken_1.TokenValidation, catEstadoCivilControlador_1.default.ActualizarEstadoCivil);
        // METODO PARA ELIMINAR REGISTROS   **USADO
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catEstadoCivilControlador_1.default.EliminarEstadoCivil);
    }
}
const ESTADO_CIVIL_RUTAS = new EstadoCivilRutas();
exports.default = ESTADO_CIVIL_RUTAS.router;
