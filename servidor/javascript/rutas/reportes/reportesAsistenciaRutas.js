"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../libs/verificarToken");
const reportesAsistenciaControlador_1 = __importDefault(require("../../controlador/reportes/reportesAsistenciaControlador"));
class ReportesAsistenciasRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // LISTA DEPARTAMENTOS CON EMPLEADOS ACTIVOS O INACTIVOS
        this.router.get('/datos_generales/:estado', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.DatosGeneralesUsuarios);
        // REPORTES DE TIMBRES MULTIPLE     
        this.router.post('/timbres/:desde/:hasta', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.ReporteTimbresMultiple);
        // REPORTES DE TIMBRES REALIZADOS MEDIANTE EL SISTEMA      
        this.router.post('/timbres-sistema/:desde/:hasta', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.ReporteTimbreSistema);
        // REPORTES DE TIMBRES REALIZADOS MEDIANTE EL RELOJ VIRTUAL   
        this.router.post('/timbres-reloj-virtual/:desde/:hasta', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.ReporteTimbreRelojVirtual);
        // REPORTES DE TIMBRES HORARIO ABIERTO   
        this.router.post('/timbres-horario-abierto/:desde/:hasta', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.ReporteTimbreHorarioAbierto);
        // REPORTES DE TIMBRES INCOMPLETOS     
        this.router.post('/timbres-incompletos/:desde/:hasta', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.ReporteTimbresIncompletos);
    }
}
const REPORTES_A_RUTAS = new ReportesAsistenciasRutas();
exports.default = REPORTES_A_RUTAS.router;
