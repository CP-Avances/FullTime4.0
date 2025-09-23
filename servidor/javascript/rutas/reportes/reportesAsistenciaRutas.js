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
        // METODO PARA CONSULTAR LISTA DE TIMBRES DEL USUARIO    **USADO    
        this.router.post('/timbres/:desde/:hasta', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.ReporteTimbresMultiple);
        // METODO DE BUSQUEDA DE TIMBRES DE TIMBRE VIRTUAL      **USADO      
        this.router.post('/timbres-sistema/:desde/:hasta', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.ReporteTimbreSistema);
        // METODO DE BUSQUEDA DE TIMBRES DEL RELOJ VIRTUAL    **USADO 
        this.router.post('/timbres-reloj-virtual/:desde/:hasta', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.ReporteTimbreRelojVirtual);
        // METODO DE BUSQUEDA DE TIMBRES HORARIO ABIERTO    **USADO  
        this.router.post('/timbres-horario-abierto/:desde/:hasta', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.ReporteTimbreHorarioAbierto);
        // METODO DE BUSQUEDA DE TIMBRES INCOMPLETOS      **USADO    
        this.router.post('/timbres-incompletos/:desde/:hasta', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.ReporteTimbresIncompletos);
    }
}
const REPORTES_A_RUTAS = new ReportesAsistenciasRutas();
exports.default = REPORTES_A_RUTAS.router;
