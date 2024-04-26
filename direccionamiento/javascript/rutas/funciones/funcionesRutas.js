"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const funcionesControlador_1 = __importDefault(require("../../controlador/funciones/funcionesControlador"));
class FuncionesRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.post('/administracion/funcionalidad', funcionesControlador_1.default.ObtenerFunciones);
    }
}
const FUNCIONES_RUTAS = new FuncionesRutas();
exports.default = FUNCIONES_RUTAS.router;
