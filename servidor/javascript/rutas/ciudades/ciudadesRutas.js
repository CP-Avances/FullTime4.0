"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../libs/verificarToken");
const ciudadControlador_1 = __importDefault(require("../../controlador/ciudad/ciudadControlador"));
class CiudadRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // BUSCAR INFORMACION DE LA CIUDAD
        this.router.get('/informacion-ciudad/:id_ciudad', verificarToken_1.TokenValidation, ciudadControlador_1.default.ListarInformacionCiudad);
        // BUSQUEDA DE LISTA DE CIUDADES
        this.router.get('/listaCiudad', verificarToken_1.TokenValidation, ciudadControlador_1.default.ListarCiudades);
        // LISTAR CIUDADES POR PROVINCIA
        this.router.get('/ciudad-provincia/:id_provincia', verificarToken_1.TokenValidation, ciudadControlador_1.default.ListarCiudadesProvincia);
        // REGISTRAR CIUDAD
        this.router.post('/', verificarToken_1.TokenValidation, ciudadControlador_1.default.CrearCiudad);
        // LISTAR NOMBRE DE CIUDADES-PROVINCIA
        this.router.get('/', verificarToken_1.TokenValidation, ciudadControlador_1.default.ListarNombreCiudad);
        // METODO PARA ELIMINAR REGISTRO
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, ciudadControlador_1.default.EliminarCiudad);
        // METODO PARA CREAR ARCHIVO XML
        this.router.post('/xmlDownload/', verificarToken_1.TokenValidation, ciudadControlador_1.default.FileXML);
        // METODO PARA DESCARGAR ARCHIVO XML
        this.router.get('/download/:nameXML', ciudadControlador_1.default.downloadXML);
        // METODO PARA BUSCAR DATOS DE UNA CIUDAD
        this.router.get('/:id', verificarToken_1.TokenValidation, ciudadControlador_1.default.ConsultarUnaCiudad);
    }
}
const CIUDAD_RUTAS = new CiudadRutas();
exports.default = CIUDAD_RUTAS.router;
