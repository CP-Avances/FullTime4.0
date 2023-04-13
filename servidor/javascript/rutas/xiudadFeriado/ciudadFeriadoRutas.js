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
        this.router = express_1.Router();
        this.configuracion();
    }
    configuracion() {
        this.router.post('/insertar', verificarToken_1.TokenValidation, ciudadFeriadoControlador_1.default.AsignarCiudadFeriado);
        this.router.post('/buscar', verificarToken_1.TokenValidation, ciudadFeriadoControlador_1.default.ObtenerIdCiudades);
        this.router.get('/:nombre', verificarToken_1.TokenValidation, ciudadFeriadoControlador_1.default.FiltrarCiudadesProvincia);
        this.router.get('/nombresCiudades/:idferiado', verificarToken_1.TokenValidation, ciudadFeriadoControlador_1.default.EncontrarCiudadesFeriado);
        this.router.put('/', verificarToken_1.TokenValidation, ciudadFeriadoControlador_1.default.ActualizarCiudadFeriado);
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, ciudadFeriadoControlador_1.default.EliminarCiudadFeriado);
        this.router.get('/ciudad/:id_ciudad', verificarToken_1.TokenValidation, ciudadFeriadoControlador_1.default.ObtenerFeriadosCiudad);
    }
}
const CIUDAD_FERIADOS_RUTAS = new CiudadRutas();
exports.default = CIUDAD_FERIADOS_RUTAS.router;
