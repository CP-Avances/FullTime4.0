"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportesControlador_1 = __importDefault(require("../../controlador/reportes/reportesControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
class CiudadRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.post('/horasExtrasReales/entradaSalida/:id_empleado', verificarToken_1.TokenValidation, reportesControlador_1.default.ListarEntradaSalidaEmpleado);
        this.router.post('/horasExtrasReales/listaPedidos/:id_usua_solicita', verificarToken_1.TokenValidation, reportesControlador_1.default.ListarPedidosEmpleado);
        this.router.post('/horasExtrasReales/entradaSalida/total/timbres', verificarToken_1.TokenValidation, reportesControlador_1.default.ListarEntradaSalidaTodos);
        this.router.post('/horasExtrasReales/listaPedidos/total/solicitudes', verificarToken_1.TokenValidation, reportesControlador_1.default.ListarPedidosTodos);
        this.router.get('/reportePermisos/horarios/:codigo', verificarToken_1.TokenValidation, reportesControlador_1.default.ListarPermisoHorarioEmpleado);
    }
}
const REPORTES_RUTAS = new CiudadRutas();
exports.default = REPORTES_RUTAS.router;
