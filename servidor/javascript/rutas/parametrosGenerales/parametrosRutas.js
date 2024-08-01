"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const parametrosControlador_1 = __importDefault(require("../../controlador/parametrosGenerales/parametrosControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
class ParametrosRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // BUSCAR LISTA DE PARAMETROS  **USADO
        this.router.get('/', verificarToken_1.TokenValidation, parametrosControlador_1.default.ListarParametros);
        // METODO PARA ACTUALIZAR PARAMETRO  **USADO
        this.router.put('/actual-tipo', verificarToken_1.TokenValidation, parametrosControlador_1.default.ActualizarTipoParametro);
        // METODO PARA VER DATOS DE UN PARAMETRO **USADO
        this.router.get('/ver-parametro/:id', verificarToken_1.TokenValidation, parametrosControlador_1.default.ListarUnParametro);
        // METODO PARA BUSCAR DETALLES DE PARAMETRO
        this.router.get('/:id', verificarToken_1.TokenValidation, parametrosControlador_1.default.VerDetalleParametro);
        // METODO PARA ELIMINAR DETALLE DE PARAMETRO  **USADO
        this.router.delete('/eliminar-detalle/:id', verificarToken_1.TokenValidation, parametrosControlador_1.default.EliminarDetalleParametro);
        // METODO PARA REGISTRAR DETALLE DE PARAMETRO  **USADO
        this.router.post('/detalle', verificarToken_1.TokenValidation, parametrosControlador_1.default.IngresarDetalleParametro);
        // METODO PARA ACTUALIZAR DETALLE DE PARAMETRO **USADO
        this.router.put('/actual-detalle', verificarToken_1.TokenValidation, parametrosControlador_1.default.ActualizarDetalleParametro);
        // METODO PARA COMPARAR COORDENADAS   **USADO
        this.router.post('/coordenadas', verificarToken_1.TokenValidation, parametrosControlador_1.default.CompararCoordenadas);
    }
}
const PARAMETROS_RUTAS = new ParametrosRutas();
exports.default = PARAMETROS_RUTAS.router;
