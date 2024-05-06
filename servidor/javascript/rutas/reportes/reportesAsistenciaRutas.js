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
        // CONSULTA DE INFORMACION GENERAL DEL COLABORADOR CARGOS
        this.router.get(`/informacion-general-cargo/:estado`, verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.DatosGeneralesCargo);
        // REPORTES DE TIMBRES MULTIPLE
        this.router.put('/timbres/:desde/:hasta', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.ReporteTimbresMultiple);
        this.router.put('/timbres-regimen-cargo/:desde/:hasta', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.ReporteTimbresMultipleRegimenCargo);
        // REPORTES DE TIMBRES REALIZADOS MEDIANTE EL SISTEMA 
        this.router.put('/timbres-sistema/:desde/:hasta', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.ReporteTimbreSistema);
        this.router.put('/timbres-sistema-regimen-cargo/:desde/:hasta', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.ReporteTimbreSistemaRegimenCargo);
        // REPORTES DE TIMBRES REALIZADOS MEDIANTE EL RELOJ VIRTUAL 
        this.router.put('/timbres-reloj-virtual/:desde/:hasta', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.ReporteTimbreRelojVirtual);
        this.router.put('/timbres-reloj-virtual-regimen-cargo/:desde/:hasta', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.ReporteTimbreRelojVirtualRegimenCargo);
        // REPORTES DE TIMBRES REALIZADOS MEDIANTE EL RELOJ VIRTUAL 
        this.router.put('/timbres-horario-abierto/:desde/:hasta', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.ReporteTimbreHorarioAbierto);
        this.router.put('/timbres-horario-abierto-regimen-cargo/:desde/:hasta', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.ReporteTimbreHorarioAbiertoRegimenCargo);
        // REPORTES DE TIMBRES DE HORARIO ABIERTO
        this.router.get('/timbres-abiertos', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.ReporteTimbresAbiertos);
        // REPORTES DE TIMBRES INCOMPLETOS
        this.router.put('/timbres-incompletos/:desde/:hasta', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.ReporteTimbresIncompletos);
        this.router.put('/timbres-incompletos-regimen-cargo/:desde/:hasta', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.ReporteTimbresIncompletosRegimenCargo);
    }
}
const REPORTES_A_RUTAS = new ReportesAsistenciasRutas();
exports.default = REPORTES_A_RUTAS.router;
