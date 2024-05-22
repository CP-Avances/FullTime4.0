"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const funcionControlador_1 = __importDefault(require("../../controlador/funciones/funcionControlador"));
class DoumentosRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA LISTAR FUNCIONES DEL SISTEMA
        this.router.get('/funcionalidad', funcionControlador_1.default.ConsultarFunciones);
    }
}
const FUNCIONES_RUTAS = new DoumentosRutas();
exports.default = FUNCIONES_RUTAS.router;
