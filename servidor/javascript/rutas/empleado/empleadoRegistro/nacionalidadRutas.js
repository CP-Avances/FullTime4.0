"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nacionalidadControlador_1 = __importDefault(require("../../../controlador/empleado/empleadoRegistro/nacionalidadControlador"));
const verificarToken_1 = require("../../../libs/verificarToken");
const express_1 = require("express");
class NacionalidadRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA LISTAR NACIONALIDAD   **USADO
        this.router.get('/', verificarToken_1.TokenValidation, nacionalidadControlador_1.default.ListarNacionalidades);
        // METODO PARA REGISTRAR NACIONALIDAD   **USADO
        this.router.post('/', verificarToken_1.TokenValidation, nacionalidadControlador_1.default.CrearNacionalidad);
        // METODO PARA ACTUALIZAR REGISTRO DE NACIONALIDAD   **USADO
        this.router.put('/', verificarToken_1.TokenValidation, nacionalidadControlador_1.default.ActualizarNacionalidad);
        // METODO PARA ELIMINAR REGISTROS   **USADO
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, nacionalidadControlador_1.default.EliminarNacionalidad);
    }
}
const nacionalidadRutas = new NacionalidadRutas();
exports.default = nacionalidadRutas.router;
