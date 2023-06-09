"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../libs/verificarToken");
const timbresControlador_1 = __importDefault(require("../../controlador/timbres/timbresControlador"));
class TimbresRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA BUSCAR MARCACIONES
        this.router.get('/', verificarToken_1.TokenValidation, timbresControlador_1.default.ObtenerTimbres);
        // METODO PARA REGISTRAR TIMBRES PERSONALES
        this.router.post('/', verificarToken_1.TokenValidation, timbresControlador_1.default.CrearTimbreWeb);
        // METODO PARA REGISTRAR TIMBRE ADMINISTRADOR
        this.router.post('/admin/', verificarToken_1.TokenValidation, timbresControlador_1.default.CrearTimbreWebAdmin);
        // METODO DE BUSQUEDA DE AVISOS GENERALES
        this.router.get('/avisos-generales/:id_empleado', verificarToken_1.TokenValidation, timbresControlador_1.default.ObtenerAvisosColaborador);
        // RUTA DE BUSQUEDA DE UNA NOTIFICACION ESPECIFICA
        this.router.get('/aviso-individual/:id', verificarToken_1.TokenValidation, timbresControlador_1.default.ObtenerUnAviso);
        this.router.get('/noti-timbres/avisos/:id_empleado', verificarToken_1.TokenValidation, timbresControlador_1.default.ObtenerAvisosTimbresEmpleado);
        this.router.put('/noti-timbres/vista/:id_noti_timbre', verificarToken_1.TokenValidation, timbresControlador_1.default.ActualizarVista);
        this.router.put('/eliminar-multiples/avisos', verificarToken_1.TokenValidation, timbresControlador_1.default.EliminarMultiplesAvisos);
        this.router.get('/ver/timbres/:id', verificarToken_1.TokenValidation, timbresControlador_1.default.ObtenerTimbresEmpleado);
        this.router.get('/ultimo-timbre', verificarToken_1.TokenValidation, timbresControlador_1.default.ObtenerUltimoTimbreEmpleado);
    }
}
const TIMBRES_RUTAS = new TimbresRutas();
exports.default = TIMBRES_RUTAS.router;
