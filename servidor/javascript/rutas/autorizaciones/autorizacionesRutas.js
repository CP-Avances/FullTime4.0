"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const autorizacionesControlador_1 = __importDefault(require("../../controlador/autorizaciones/autorizacionesControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
class DepartamentoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/by-permiso/:id_permiso', verificarToken_1.TokenValidation, autorizacionesControlador_1.default.ObtenerAutorizacionPermiso);
        this.router.get('/', verificarToken_1.TokenValidation, autorizacionesControlador_1.default.ListarAutorizaciones);
        this.router.get('/by-vacacion/:id_vacacion', verificarToken_1.TokenValidation, autorizacionesControlador_1.default.ObtenerAutorizacionByVacacion);
        this.router.get('/by-hora-extra/:id_hora_extra', autorizacionesControlador_1.default.ObtenerAutorizacionByHoraExtra);
        this.router.post('/', verificarToken_1.TokenValidation, autorizacionesControlador_1.default.CrearAutorizacion);
        this.router.put('/estado-permiso/multiple', verificarToken_1.TokenValidation, autorizacionesControlador_1.default.ActualizarEstadoAutorizacionPermiso);
        this.router.put('/:id_plan_hora_extra/estado-plan-hora-extra', verificarToken_1.TokenValidation, autorizacionesControlador_1.default.ActualizarEstadoPlanificacion);
        // ACTUALIZAR ESTADO DE APROBACION DE SOLICITUDES
        this.router.put('/:id/estado-aprobacion', verificarToken_1.TokenValidation, autorizacionesControlador_1.default.ActualizarEstadoSolicitudes);
    }
}
const AUTORIZA_DEPARTAMENTO_RUTAS = new DepartamentoRutas();
exports.default = AUTORIZA_DEPARTAMENTO_RUTAS.router;
