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
        // METODO PARA ELIMINAR NOTIFICACIONES DE AVISOS  --**VERIFICADO
        this.router.put('/eliminar-multiples/avisos', verificarToken_1.TokenValidation, timbresControlador_1.default.EliminarMultiplesAvisos);
        // METODO PARA BUSCAR TIMBRES (ASISTENCIA)   **USADO
        this.router.post('/buscar/timbres-asistencia', verificarToken_1.TokenValidation, timbresControlador_1.default.BuscarTimbresAsistencia);
        // METODO PARA BUSCAR MARCACIONES   **USADO
        this.router.get('/', verificarToken_1.TokenValidation, timbresControlador_1.default.ObtenerTimbres);
        // METODO PARA BUSCAR EL TIMBRE DE EMPLEADO POR FECHA   **USADO
        this.router.get('/timbresfechaemple', verificarToken_1.TokenValidation, timbresControlador_1.default.ObtenertimbreFechaEmple);
        // METODO PARA REGISTRAR TIMBRES PERSONALES    **USADO
        this.router.post('/', verificarToken_1.TokenValidation, timbresControlador_1.default.CrearTimbreWeb);
        // METODO PARA REGISTRAR TIMBRE ADMINISTRADOR    **USADO
        this.router.post('/admin/', verificarToken_1.TokenValidation, timbresControlador_1.default.CrearTimbreWebAdmin);
        // METODO PARA ACTUALIZAR EL TIMBRE DEL EMPLEADO    **USADO
        this.router.put('/timbre/editar', verificarToken_1.TokenValidation, timbresControlador_1.default.EditarTimbreEmpleadoFecha);
        // METODO PARA BUSCAR TIMBRES - PLANIFICACION HORARIA   **USADO
        this.router.post('/buscar/timbres-planificacion', verificarToken_1.TokenValidation, timbresControlador_1.default.BuscarTimbresPlanificacion);
        // METODO PARA REGISTRAR OPCIONES DE MARCACION   **USADO
        this.router.post('/opciones-timbre', verificarToken_1.TokenValidation, timbresControlador_1.default.IngresarOpcionTimbre);
        // METODO PARA ACTUALIZAR OPCIONES DE MARCACION   **USADO
        this.router.put('/actualizar-opciones-timbre', verificarToken_1.TokenValidation, timbresControlador_1.default.ActualizarOpcionTimbre);
        // METODO PARA BUSCAR OPCIONES DE MARCACION   **USADO
        this.router.post('/listar-opciones-timbre', verificarToken_1.TokenValidation, timbresControlador_1.default.BuscarOpcionesTimbre);
        // METODO PARA BUSCAR OPCIONES DE MARCACION DE MULTIPLES USUARIOS  **USADO
        this.router.post('/listar-varias-opciones-timbre', verificarToken_1.TokenValidation, timbresControlador_1.default.BuscarMultipleOpcionesTimbre);
        // METODO PARA ELIMINAR REGISTRO   **USADO
        this.router.delete('/eliminar-opcion-marcacion', verificarToken_1.TokenValidation, timbresControlador_1.default.EliminarRegistros);
        // METODO PARA REGISTRAR OPCIONES DE MARCACION   **USADO
        this.router.post('/opciones-timbre-web', verificarToken_1.TokenValidation, timbresControlador_1.default.IngresarOpcionTimbreWeb);
        // METODO PARA ACTUALIZAR OPCIONES DE MARCACION   **USADO
        this.router.put('/actualizar-opciones-timbre-web', verificarToken_1.TokenValidation, timbresControlador_1.default.ActualizarOpcionTimbreWeb);
        // METODO PARA BUSCAR OPCIONES DE MARCACION DE  USUARIOS  **USADO
        this.router.post('/listar-varias-opciones-timbre-web', verificarToken_1.TokenValidation, timbresControlador_1.default.BuscarMultipleOpcionesTimbreWeb);
        // METODO PARA BUSCAR OPCIONES DE MARCACION DE MULTIPLES USUARIOS  **USADO
        this.router.post('/listar-varias-opciones-timbre-web-multiple', verificarToken_1.TokenValidation, timbresControlador_1.default.BuscarMultipleOpcionesTimbreWebMultiple);
        // METODO PARA ELIMINAR REGISTRO   **USADO
        this.router.delete('/eliminar-opcion-marcacion-web', verificarToken_1.TokenValidation, timbresControlador_1.default.EliminarRegistrosWeb);
        // METODO DE BUSQUEDA DE AVISOS GENERALES
        this.router.get('/avisos-generales/:id_empleado', verificarToken_1.TokenValidation, timbresControlador_1.default.ObtenerAvisosColaborador);
        // RUTA DE BUSQUEDA DE UNA NOTIFICACION ESPECIFICA
        this.router.get('/aviso-individual/:id', verificarToken_1.TokenValidation, timbresControlador_1.default.ObtenerUnAviso);
        this.router.post('/emitir-aviso', verificarToken_1.TokenValidation, timbresControlador_1.default.emitirAvisoPrueba);
        this.router.get('/noti-timbres/avisos/:id_empleado', verificarToken_1.TokenValidation, timbresControlador_1.default.ObtenerAvisosTimbresEmpleado);
        this.router.put('/noti-timbres/vista/:id_noti_timbre', verificarToken_1.TokenValidation, timbresControlador_1.default.ActualizarVista);
        // METODO PARA BUSCAR TIMBRES DEL USUARIO   **USADO
        this.router.get('/ver/timbres/:id', verificarToken_1.TokenValidation, timbresControlador_1.default.ObtenerTimbresEmpleado);
        //------------------------ METODOS PARA APP MOVIL ---------------------------------------------------------------
        this.router.post('/timbre', verificarToken_1.TokenValidation, timbresControlador_1.default.crearTimbre);
        this.router.post('/timbreSinConexion', verificarToken_1.TokenValidation, timbresControlador_1.default.crearTimbreDesconectado);
        this.router.post('/timbre/admin', verificarToken_1.TokenValidation, timbresControlador_1.default.crearTimbreJustificadoAdmin);
        this.router.post('/filtroTimbre', verificarToken_1.TokenValidation, timbresControlador_1.default.FiltrarTimbre);
        this.router.get('/timbreEmpleado/:idUsuario', verificarToken_1.TokenValidation, timbresControlador_1.default.getTimbreByCodigo);
    }
}
const TIMBRES_RUTAS = new TimbresRutas();
exports.default = TIMBRES_RUTAS.router;
