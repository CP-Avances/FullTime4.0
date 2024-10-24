"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../../libs/verificarToken");
const empleProcesoControlador_1 = __importDefault(require("../../../controlador/modulos/acciones-personal/empleProcesoControlador"));
class DepartamentoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA OBTENER PROCESOS DEL USUARIO   **USADO
        this.router.get('/infoProceso/:id_empleado', verificarToken_1.TokenValidation, empleProcesoControlador_1.default.BuscarProcesoUsuario);
        this.router.post('/', verificarToken_1.TokenValidation, empleProcesoControlador_1.default.CrearEmpleProcesos);
        this.router.put('/', verificarToken_1.TokenValidation, empleProcesoControlador_1.default.ActualizarProcesoEmpleado);
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, empleProcesoControlador_1.default.EliminarRegistros);
    }
}
const EMPLEADO_PROCESO_RUTAS = new DepartamentoRutas();
exports.default = EMPLEADO_PROCESO_RUTAS.router;