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
        this.router.get('/horasExtrasReales', verificarToken_1.TokenValidation, reportesControlador_1.default.ListarDatosContractoA);
        this.router.get('/horasExtrasReales/:empleado_id', verificarToken_1.TokenValidation, reportesControlador_1.default.ListarDatosCargoA);
        this.router.post('/horasExtrasReales/entradaSalida/:id_empleado', verificarToken_1.TokenValidation, reportesControlador_1.default.ListarEntradaSalidaEmpleado);
        this.router.post('/horasExtrasReales/listaPedidos/:id_usua_solicita', verificarToken_1.TokenValidation, reportesControlador_1.default.ListarPedidosEmpleado);
        this.router.post('/horasExtrasReales/entradaSalida/total/timbres', verificarToken_1.TokenValidation, reportesControlador_1.default.ListarEntradaSalidaTodos);
        this.router.post('/horasExtrasReales/listaPedidos/total/solicitudes', verificarToken_1.TokenValidation, reportesControlador_1.default.ListarPedidosTodos);
        this.router.post('/reporteTimbres/listaTimbres/:id_empleado', verificarToken_1.TokenValidation, reportesControlador_1.default.ListarTimbres);
        this.router.get('/reportePermisos/horarios/:id_empleado', verificarToken_1.TokenValidation, reportesControlador_1.default.ListarPermisoHorarioEmpleado);
        this.router.get('/reportePermisos/planificacion/:id_empleado', verificarToken_1.TokenValidation, reportesControlador_1.default.ListarPermisoPlanificaEmpleado);
        this.router.get('/reportePermisos/autorizaciones/:id_empleado', verificarToken_1.TokenValidation, reportesControlador_1.default.ListarPermisoAutorizaEmpleado);
        this.router.post('/reporteAtrasos/horarios/:id_empleado', verificarToken_1.TokenValidation, reportesControlador_1.default.ListarAtrasosHorarioEmpleado);
        this.router.post('/reporteAtrasos/planificacion/:id_empleado', verificarToken_1.TokenValidation, reportesControlador_1.default.ListarAtrasosPlanificaEmpleado);
        this.router.post('/reporteEntradaSalida/horarios/:id_empleado', verificarToken_1.TokenValidation, reportesControlador_1.default.ListarEntradaSalidaHorarioEmpleado);
        this.router.post('/reporteEntradaSalida/planificacion/:id_empleado', verificarToken_1.TokenValidation, reportesControlador_1.default.ListarEntradaSalidaPlanificaEmpleado);
        this.router.post('/reportePermisos/fechas/horarios/:id_empleado', verificarToken_1.TokenValidation, reportesControlador_1.default.ListarPermisoHorarioEmpleadoFechas);
        this.router.post('/reportePermisos/fechas/planificacion/:id_empleado', verificarToken_1.TokenValidation, reportesControlador_1.default.ListarPermisoPlanificaEmpleadoFechas);
        this.router.post('/reporteTimbres/buscarPlan/:id_empleado', verificarToken_1.TokenValidation, reportesControlador_1.default.BuscarPlan);
    }
}
const REPORTES_RUTAS = new CiudadRutas();
exports.default = REPORTES_RUTAS.router;
