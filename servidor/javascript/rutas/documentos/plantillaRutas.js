"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const plantillaControlador_1 = __importDefault(require("../../controlador/documentos/plantillaControlador"));
class PlantillaRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/documento/:docs', plantillaControlador_1.default.DescargarPlantilla);
    }
}
const PLANTILLA_RUTAS = new PlantillaRutas();
exports.default = PLANTILLA_RUTAS.router;
