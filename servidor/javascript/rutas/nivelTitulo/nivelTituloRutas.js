"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const nivelTituloControlador_1 = __importDefault(require("../../controlador/nivelTitulo/nivelTituloControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
class NivelTituloRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA BUSCAR LISTA DE NIVELES DE TITULO
        this.router.get('/', verificarToken_1.TokenValidation, nivelTituloControlador_1.default.ListarNivel);
        // METODO PARA ELIMINAR REGISTROS
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, nivelTituloControlador_1.default.EliminarNivelTitulo);
        // METODO PARA REGISTRAR NIVEL DE TITULO
        this.router.post('/', verificarToken_1.TokenValidation, nivelTituloControlador_1.default.CrearNivel);
        // METODO PARA ACTUALIZAR REGISTRO DE NIVEL
        this.router.put('/', verificarToken_1.TokenValidation, nivelTituloControlador_1.default.ActualizarNivelTitulo);
        // METODO PARA BUSCAR NIVEL POR SU NOMBRE
        this.router.get('/buscar/:nombre', verificarToken_1.TokenValidation, nivelTituloControlador_1.default.ObtenerNivelNombre);
        this.router.get('/:id', verificarToken_1.TokenValidation, nivelTituloControlador_1.default.getOne);
    }
}
const NIVEL_TITULO_RUTAS = new NivelTituloRutas();
exports.default = NIVEL_TITULO_RUTAS.router;
