"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const licenciaControlador_1 = __importDefault(require("../../controlador/licencia/licenciaControlador"));
class LicenciaRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.post('/', licenciaControlador_1.default.ObtenerLicencia);
    }
}
const LICENCIA_RUTAS = new LicenciaRutas();
exports.default = LICENCIA_RUTAS.router;
