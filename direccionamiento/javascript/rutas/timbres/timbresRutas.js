"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const timbresControlador_1 = __importDefault(require("../../controlador/timbres/timbresControlador"));
class TimbresRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/ver/timbres', timbresControlador_1.default.ObtenerTimbres);
    }
}
const TIMBRES_RUTAS = new TimbresRutas();
exports.default = TIMBRES_RUTAS.router;
