"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const catTipoComidasControlador_1 = __importDefault(require("../../../controlador/modulos/alimentacion/catTipoComidasControlador"));
const verificarToken_1 = require("../../../libs/verificarToken");
const express_1 = require("express");
class TipoComidasRuta {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', verificarToken_1.TokenValidation, catTipoComidasControlador_1.default.ListarTipoComidas);
        // METODO PARA LISTAR TIPOS DE COMIDAS Y SU DETALLE      **USADO
        this.router.get('/listar-detalle', verificarToken_1.TokenValidation, catTipoComidasControlador_1.default.ListarDetallesComida);
        this.router.get('/:id', verificarToken_1.TokenValidation, catTipoComidasControlador_1.default.ListarUnTipoComida);
        this.router.get('/buscar/menu/:id', verificarToken_1.TokenValidation, catTipoComidasControlador_1.default.VerUnMenu);
        this.router.post('/', verificarToken_1.TokenValidation, catTipoComidasControlador_1.default.CrearTipoComidas);
        this.router.put('/', verificarToken_1.TokenValidation, catTipoComidasControlador_1.default.ActualizarComida);
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catTipoComidasControlador_1.default.EliminarRegistros);
        // this.router.get('/registro/ultimo', TokenValidation, TIPO_COMIDAS_CONTROLADOR.VerUltimoRegistro);
        // Consultar datos de tabla detalle_comida
        this.router.post('/detalle/menu', verificarToken_1.TokenValidation, catTipoComidasControlador_1.default.CrearDetalleMenu);
        this.router.get('/detalle/menu/:id', verificarToken_1.TokenValidation, catTipoComidasControlador_1.default.VerUnDetalleMenu);
        this.router.put('/detalle/menu', verificarToken_1.TokenValidation, catTipoComidasControlador_1.default.ActualizarDetalleMenu);
        this.router.delete('/detalle/menu/eliminar/:id', verificarToken_1.TokenValidation, catTipoComidasControlador_1.default.EliminarDetalle);
    }
}
const TIPO_COMIDAS_RUTA = new TipoComidasRuta();
exports.default = TIPO_COMIDAS_RUTA.router;