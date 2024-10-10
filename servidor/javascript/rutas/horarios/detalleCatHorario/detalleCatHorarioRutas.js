"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const detalleCatHorarioControlador_1 = __importDefault(require("../../../controlador/horarios/detalleCatHorario/detalleCatHorarioControlador"));
const verificarToken_1 = require("../../../libs/verificarToken");
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './plantillas',
});
class PermisosRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA BUSCAR DETALLES DE UN HORARIO  **USADO
        this.router.get('/:id_horario', verificarToken_1.TokenValidation, detalleCatHorarioControlador_1.default.ListarUnDetalleHorario);
        this.router.get('/todos_horario', verificarToken_1.TokenValidation, detalleCatHorarioControlador_1.default.ListarUnDetalleTodosHorarios);
        // METODO PARA BUSCAR DETALLES DE VARIOS HORARIOS    **USADO
        this.router.post('/lista', verificarToken_1.TokenValidation, detalleCatHorarioControlador_1.default.ListarDetalleHorarios);
        // METODO PARA ELIMINAR REGISTRO   **USADO
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, detalleCatHorarioControlador_1.default.EliminarRegistros);
        // METODO PARA REGISTRAR DETALLES   **USADO
        this.router.post('/', verificarToken_1.TokenValidation, detalleCatHorarioControlador_1.default.CrearDetalleHorarios);
        // METODO PARA ACTUALIZAR REGISTRO    **USADO
        this.router.put('/', verificarToken_1.TokenValidation, detalleCatHorarioControlador_1.default.ActualizarDetalleHorarios);
    }
}
const DETALLE_CATALOGO_HORARIO_RUTAS = new PermisosRutas();
exports.default = DETALLE_CATALOGO_HORARIO_RUTAS.router;
