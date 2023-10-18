"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catProcesoControlador_1 = __importDefault(require("../../controlador/catalogos/catProcesoControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
class ProcesoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', verificarToken_1.TokenValidation, catProcesoControlador_1.default.list);
        this.router.get('/busqueda/:nombre', verificarToken_1.TokenValidation, catProcesoControlador_1.default.getIdByNombre);
        this.router.get('/:id', verificarToken_1.TokenValidation, catProcesoControlador_1.default.getOne);
        this.router.post('/', verificarToken_1.TokenValidation, catProcesoControlador_1.default.create);
        this.router.put('/', verificarToken_1.TokenValidation, catProcesoControlador_1.default.ActualizarProceso);
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catProcesoControlador_1.default.EliminarProceso);
    }
}
const PROCESO_RUTAS = new ProcesoRutas();
exports.default = PROCESO_RUTAS.router;
