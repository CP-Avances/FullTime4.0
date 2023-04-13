"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catEnroladoControlador_1 = __importDefault(require("../../controlador/catalogos/catEnroladoControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
const multipart = require('connect-multiparty');
const multipartMiddlewarePlantilla = multipart({
    uploadDir: './plantillas',
});
class EnroladoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', verificarToken_1.TokenValidation, catEnroladoControlador_1.default.ListarEnrolados);
        this.router.get('/:id', verificarToken_1.TokenValidation, catEnroladoControlador_1.default.ObtenerUnEnrolado);
        this.router.post('/', verificarToken_1.TokenValidation, catEnroladoControlador_1.default.CrearEnrolado);
        this.router.post('/plantillaExcel/', [verificarToken_1.TokenValidation, multipartMiddlewarePlantilla], catEnroladoControlador_1.default.CargaPlantillaEnrolado);
        this.router.get('/busqueda/:id_usuario', verificarToken_1.TokenValidation, catEnroladoControlador_1.default.ObtenerRegistroEnrolado);
        this.router.get('/buscar/ultimoId', verificarToken_1.TokenValidation, catEnroladoControlador_1.default.ObtenerUltimoId);
        this.router.put('/', verificarToken_1.TokenValidation, catEnroladoControlador_1.default.ActualizarEnrolado);
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catEnroladoControlador_1.default.EliminarEnrolado);
        this.router.post('/xmlDownload/', verificarToken_1.TokenValidation, catEnroladoControlador_1.default.FileXML);
        this.router.get('/download/:nameXML', catEnroladoControlador_1.default.downloadXML);
        this.router.get('/cargarDatos/:usuario', verificarToken_1.TokenValidation, catEnroladoControlador_1.default.ObtenerDatosEmpleado);
    }
}
const ENROLADO_RUTAS = new EnroladoRutas();
exports.default = ENROLADO_RUTAS.router;
