"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const catDiscapacidadControlador_1 = __importDefault(require("../../controlador/catalogos/catDiscapacidadControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
const express_1 = require("express");
class DiscapacidadRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA LISTAR TIPOS DE DISCAPACIDAD
        this.router.get('/', verificarToken_1.TokenValidation, catDiscapacidadControlador_1.default.ListarDiscapacidad);
        // METODO PARA REGISTRAR UN TIPO DE DISCAPACIDDA
        this.router.post('/crearDiscapacidad', verificarToken_1.TokenValidation, catDiscapacidadControlador_1.default.CrearDiscapacidad);
        // METODO PARA EDITAR UN TIPO DE DISCAPACIDAD
        this.router.put('/', verificarToken_1.TokenValidation, catDiscapacidadControlador_1.default.EditarDiscapacidad);
        // METODO PARA ELIMINAR UN TIPO DE DISCAPACIDAD
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catDiscapacidadControlador_1.default.EliminarRegistro);
    }
}
const DISCAPACIDADES_RUTAS = new DiscapacidadRutas();
exports.default = DISCAPACIDADES_RUTAS.router;
