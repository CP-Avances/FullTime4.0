"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catRelojesControlador_1 = __importDefault(require("../../controlador/catalogos/catRelojesControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
const multipart = require('connect-multiparty');
const multipartMiddlewarePlantilla = multipart({
    uploadDir: './plantillas',
});
class RelojesRuta {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA BUSCAR DISPOSITIVOS
        this.router.get('/', verificarToken_1.TokenValidation, catRelojesControlador_1.default.ListarRelojes);
        // METODO PARA ELIMINAR REGISTROS
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catRelojesControlador_1.default.EliminarRegistros);
        // METODO PARA CREAR ARCHIVO XML
        this.router.post('/xmlDownload/', verificarToken_1.TokenValidation, catRelojesControlador_1.default.FileXML);
        // METODO PARA DESCARGAR ARCHIVO XML
        this.router.get('/download/:nameXML', catRelojesControlador_1.default.downloadXML);
        // METODO PARA REGISTRAR DISPOSITIVO
        this.router.post('/', verificarToken_1.TokenValidation, catRelojesControlador_1.default.CrearRelojes);
        // METODO PARA VER DATOS DE UN DISPOSITIVO
        this.router.get('/:id', verificarToken_1.TokenValidation, catRelojesControlador_1.default.ListarUnReloj);
        // METODO PARA ACTUALIZAR REGISTRO
        this.router.put('/', verificarToken_1.TokenValidation, catRelojesControlador_1.default.ActualizarReloj);
        // METODO PARA BUSCAR DATOS GENERALES DE DISPOSITIVOS
        this.router.get('/datosReloj/:id', verificarToken_1.TokenValidation, catRelojesControlador_1.default.ListarDatosUnReloj);
        // METODO PARA CREAR ARCHIVO XML REGISTRAR DISPOSITIVOS
        this.router.post('/xmlDownloadIdDispositivos/', verificarToken_1.TokenValidation, catRelojesControlador_1.default.FileXMLDispositivos);
        // METODO PARA DESCARGAR ARCHIVO XML
        this.router.get('/downloadIdDispositivos/:nameXML', catRelojesControlador_1.default.downloadXMLIdDispositivos);
        this.router.post('/plantillaExcel/', [verificarToken_1.TokenValidation, multipartMiddlewarePlantilla], catRelojesControlador_1.default.CargaPlantillaRelojes);
        // METODO para verificar datos de plantilla antes de subirlos
        this.router.post('/verificar_datos/plantillaExcel/', [verificarToken_1.TokenValidation, multipartMiddlewarePlantilla], catRelojesControlador_1.default.VerificarDatos);
        this.router.post('/verificar_plantilla/plantillaExcel/', [verificarToken_1.TokenValidation, multipartMiddlewarePlantilla], catRelojesControlador_1.default.VerificarPlantilla);
        this.router.post('/plantillaExcel/', [verificarToken_1.TokenValidation, multipartMiddlewarePlantilla], catRelojesControlador_1.default.CargaPlantillaRelojes);
    }
}
const RELOJES_RUTA = new RelojesRuta();
exports.default = RELOJES_RUTA.router;
