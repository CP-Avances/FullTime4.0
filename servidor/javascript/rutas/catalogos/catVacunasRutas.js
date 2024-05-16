"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const catVacunasControlador_1 = __importDefault(require("../../controlador/catalogos/catVacunasControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
const express_1 = require("express");
class VacunasRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA LISTAR TIPO VACUNAS
        this.router.get('/', verificarToken_1.TokenValidation, catVacunasControlador_1.default.ListaVacuna);
        // METODO PARA CREAR TIPO VACUNAS
        this.router.post('/crearVacunas', verificarToken_1.TokenValidation, catVacunasControlador_1.default.CrearVacuna);
        // METODO PARA EDITAR TIPO VACUNAS
        this.router.put('/', verificarToken_1.TokenValidation, catVacunasControlador_1.default.EditarVacuna);
        // METODO PARA ELIMINAR REGISTRO
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catVacunasControlador_1.default.EliminarRegistro);
    }
}
const TIPO_VACUNAS_RUTAS = new VacunasRutas();
exports.default = TIPO_VACUNAS_RUTAS.router;
