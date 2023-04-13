"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const funcionControlador_1 = __importDefault(require("../../controlador/funciones/funcionControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
class DoumentosRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA LISTAR FUNCIONES DEL SISTEMA
        this.router.get('/funcionalidad', funcionControlador_1.default.ConsultarFunciones);
        this.router.post('/', verificarToken_1.TokenValidation, funcionControlador_1.default.RegistrarFunciones);
        this.router.put('/funcion/:id', verificarToken_1.TokenValidation, funcionControlador_1.default.EditarFunciones);
    }
}
const FUNCIONES_RUTAS = new DoumentosRutas();
exports.default = FUNCIONES_RUTAS.router;
