"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
class AsistenciaRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
    }
}
const ASISTENCIA_RUTAS = new AsistenciaRutas();
exports.default = ASISTENCIA_RUTAS.router;
