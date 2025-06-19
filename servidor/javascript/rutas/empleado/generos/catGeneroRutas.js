"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../../libs/verificarToken");
const catGeneroControlador_1 = __importDefault(require("../../../controlador/empleado/empleadoGeneros/catGeneroControlador"));
class GeneroRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA LISTAR GENEROS   ** USADO
        this.router.get('/', verificarToken_1.TokenValidation, catGeneroControlador_1.default.ListarGeneros);
        // METODO PARA BUSCAR GENEROS POR SU NOMBRE   **USADO
        this.router.get('/buscar/:genero', verificarToken_1.TokenValidation, catGeneroControlador_1.default.ObtenerGenero);
        // METODO PARA CREAR GENERO   **USADO
        this.router.post('/', verificarToken_1.TokenValidation, catGeneroControlador_1.default.CrearGenero);
        // METODO PARA ACTUALIZAR REGISTRO DE GENERO   **USADO
        this.router.put('/', verificarToken_1.TokenValidation, catGeneroControlador_1.default.ActualizarGenero);
        // METODO PARA ELIMINAR REGISTROS   **USADO
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catGeneroControlador_1.default.EliminarGenero);
    }
}
const GENERO_RUTAS = new GeneroRutas();
exports.default = GENERO_RUTAS.router;
