"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ciudadFeriadoControlador_1 = __importDefault(require("../../controlador/ciudadFeriado/ciudadFeriadoControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
class CiudadRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA BUSCAR CIUDADES - PROVINCIA POR NOMBRE  **USADO
        this.router.get('/:nombre', verificarToken_1.TokenValidation, ciudadFeriadoControlador_1.default.FiltrarCiudadesProvincia);
        // METODO PARA BUSCAR NOMBRES DE CIUDADES   **USADO
        this.router.get('/nombresCiudades/:idferiado', verificarToken_1.TokenValidation, ciudadFeriadoControlador_1.default.EncontrarCiudadesFeriado);
        // METODO PARA ELIMINAR REGISTRO    **USADO
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, ciudadFeriadoControlador_1.default.EliminarCiudadFeriado);
        // METODO PARA BUSCAR ID DE CIUDADES    **USADO
        this.router.post('/buscar', verificarToken_1.TokenValidation, ciudadFeriadoControlador_1.default.ObtenerIdCiudades);
        // METODO PARA REGISTRAR ASIGNACION DE CIUDADES    **USADO
        this.router.post('/insertar', verificarToken_1.TokenValidation, ciudadFeriadoControlador_1.default.AsignarCiudadFeriado);
        // METODO PARA ACTUALIZAR REGISTRO    **USADO
        this.router.put('/', verificarToken_1.TokenValidation, ciudadFeriadoControlador_1.default.ActualizarCiudadFeriado);
        this.router.get('/ciudad/:id_ciudad', verificarToken_1.TokenValidation, ciudadFeriadoControlador_1.default.ObtenerFeriadosCiudad);
    }
}
const CIUDAD_FERIADOS_RUTAS = new CiudadRutas();
exports.default = CIUDAD_FERIADOS_RUTAS.router;
