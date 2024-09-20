"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const parametrizacionControlador_1 = __importDefault(require("../../controlador/parametrizacion/parametrizacionControlador"));
class ParametrizacionRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/:id', parametrizacionControlador_1.default.ObtenerParametrizacion);
    }
}
const PARAMETRIZACION_RUTAS = new ParametrizacionRutas();
exports.default = PARAMETRIZACION_RUTAS.router;
