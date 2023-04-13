"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../libs/verificarToken");
const enroladoRelojControlador_1 = __importDefault(require("../../controlador/enroladoReloj/enroladoRelojControlador"));
class CiudadRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.post('/insertar', verificarToken_1.TokenValidation, enroladoRelojControlador_1.default.AsignarRelojEnrolado);
        this.router.post('/buscar', verificarToken_1.TokenValidation, enroladoRelojControlador_1.default.ObtenerIdReloj);
        this.router.get('/nombresReloj/:enroladoid', verificarToken_1.TokenValidation, enroladoRelojControlador_1.default.EncontrarEnroladosReloj);
        this.router.put('/', verificarToken_1.TokenValidation, enroladoRelojControlador_1.default.ActualizarRelojEnrolado);
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, enroladoRelojControlador_1.default.EliminarRelojEnrolado);
    }
}
const ENROLADO_RELOJ_RUTAS = new CiudadRutas();
exports.default = ENROLADO_RELOJ_RUTAS.router;
