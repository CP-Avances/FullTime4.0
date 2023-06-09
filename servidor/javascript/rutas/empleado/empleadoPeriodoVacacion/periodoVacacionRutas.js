"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../../libs/verificarToken");
const periodoVacacionControlador_1 = __importDefault(require("../../../controlador/empleado/empleadoPeriodoVacacion/periodoVacacionControlador"));
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './plantillas',
});
class DepartamentoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA BUSCAR PERIODO DE VACACIONES
        this.router.get('/buscar/:id_empleado', verificarToken_1.TokenValidation, periodoVacacionControlador_1.default.EncontrarIdPerVacaciones);
        this.router.get('/', verificarToken_1.TokenValidation, periodoVacacionControlador_1.default.ListarPerVacaciones);
        this.router.get('/infoPeriodo/:codigo', verificarToken_1.TokenValidation, periodoVacacionControlador_1.default.EncontrarPerVacaciones);
        this.router.post('/', verificarToken_1.TokenValidation, periodoVacacionControlador_1.default.CrearPerVacaciones);
        this.router.put('/', verificarToken_1.TokenValidation, periodoVacacionControlador_1.default.ActualizarPeriodo);
        // Verificar datos de la plantilla de de periodo de vacaciones antes de subir al sistema
        this.router.post('/cargarPeriodo/upload', [verificarToken_1.TokenValidation, multipartMiddleware], periodoVacacionControlador_1.default.CargarPeriodoVacaciones);
        this.router.post('/cargarPeriodo/verificarDatos/upload', [verificarToken_1.TokenValidation, multipartMiddleware], periodoVacacionControlador_1.default.VerificarDatos);
        this.router.post('/cargarPeriodo/verificarPlantilla/upload', [verificarToken_1.TokenValidation, multipartMiddleware], periodoVacacionControlador_1.default.VerificarPlantilla);
    }
}
const PERIODO_VACACION__RUTAS = new DepartamentoRutas();
exports.default = PERIODO_VACACION__RUTAS.router;
