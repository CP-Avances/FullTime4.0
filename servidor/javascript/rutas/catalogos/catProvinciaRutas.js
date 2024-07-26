"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catProvinciaControlador_1 = __importDefault(require("../../controlador/catalogos/catProvinciaControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
class ProvinciaRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // LISTAR PAISES DE ACUERDO AL CONTINENTE  **USADO
        this.router.get('/pais/:continente', verificarToken_1.TokenValidation, catProvinciaControlador_1.default.ListarPaises);
        // LISTAR CONTINENTES   **USADO
        this.router.get('/continentes', verificarToken_1.TokenValidation, catProvinciaControlador_1.default.ListarContinentes);
        // BUSCAR PROVINCIAS POR PAIS  **USADO
        this.router.get('/:id_pais', verificarToken_1.TokenValidation, catProvinciaControlador_1.default.BuscarProvinciaPais);
        // METODO PARA BUSCAR PROVINCIAS  **USADO
        this.router.get('/', verificarToken_1.TokenValidation, catProvinciaControlador_1.default.ListarProvincia);
        // METODO PARA ELIMINAR REGISTROS  **USADO
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catProvinciaControlador_1.default.EliminarProvincia);
        // METODO PARA REGISTRAR PROVINCIA  **USADO
        this.router.post('/', verificarToken_1.TokenValidation, catProvinciaControlador_1.default.CrearProvincia);
        // METODO PARA BUSCAR DATOS DE UNA PROVINCIA
        this.router.get('/buscar/:id', verificarToken_1.TokenValidation, catProvinciaControlador_1.default.ObtenerProvincia);
        // METODO PARA BUSCAR DATOS DE UN PAIS
        this.router.get('/buscar/pais/:id', verificarToken_1.TokenValidation, catProvinciaControlador_1.default.ObtenerPais);
    }
}
const PROVINCIA_RUTAS = new ProvinciaRutas();
exports.default = PROVINCIA_RUTAS.router;
