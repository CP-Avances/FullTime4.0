"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catTituloControlador_1 = __importDefault(require("../../controlador/catalogos/catTituloControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
class TituloRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA LISTAR TITULOS
        this.router.get('/', verificarToken_1.TokenValidation, catTituloControlador_1.default.ListarTitulos);
        // METODO PARA ELIMINAR REGISTRO
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catTituloControlador_1.default.EliminarRegistros);
        // METODO PARA ACTUALIZAR REGISTRO DE TITULO
        this.router.put('/', verificarToken_1.TokenValidation, catTituloControlador_1.default.ActualizarTitulo);
        this.router.get('/:id', verificarToken_1.TokenValidation, catTituloControlador_1.default.getOne);
        this.router.post('/', verificarToken_1.TokenValidation, catTituloControlador_1.default.create);
    }
}
const TITULO_RUTAS = new TituloRutas();
exports.default = TITULO_RUTAS.router;
