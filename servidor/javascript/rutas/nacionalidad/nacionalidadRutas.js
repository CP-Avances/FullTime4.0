"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const verificarToken_1 = require("../../libs/verificarToken");
const express_1 = require("express");
const nacionalidadControlador_1 = __importDefault(require("../../controlador/nacionalidad/nacionalidadControlador"));
class NacionalidadRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA LISTAR NACIONALIDADES   **USADO
        this.router.get('/', verificarToken_1.TokenValidation, nacionalidadControlador_1.default.ListarNacionalidades);
    }
}
const nacionalidadRutas = new NacionalidadRutas();
exports.default = nacionalidadRutas.router;
