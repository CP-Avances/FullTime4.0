"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catGeneroControlador_1 = __importDefault(require("../../../controlador/empleado/empleadoGeneros/catGeneroControlador"));
const verificarToken_1 = require("../../../libs/verificarToken");
class GeneroRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA LISTAR TITULOS   ** USADO
        this.router.get('/', verificarToken_1.TokenValidation, catGeneroControlador_1.default.ListarGeneros);
        // METODO PARA BUSCAR GENERO   **USADO
        this.router.get('/buscar/:genero', verificarToken_1.TokenValidation, catGeneroControlador_1.default.ObtenerGenero);
        // METODO PARA CREAR GENERO   **USADO
        this.router.post('/', verificarToken_1.TokenValidation, catGeneroControlador_1.default.CrearGenero);
        // METODO PARA EDITAR GENERO   **USADO
        this.router.put('/', verificarToken_1.TokenValidation, catGeneroControlador_1.default.ActualizarGenero);
    }
}
const GENERO_RUTAS = new GeneroRutas();
exports.default = GENERO_RUTAS.router;
