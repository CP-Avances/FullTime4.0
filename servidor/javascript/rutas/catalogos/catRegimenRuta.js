"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const catRegimenControlador_1 = __importDefault(require("../../controlador/catalogos/catRegimenControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
const express_1 = require("express");
class RegimenRuta {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        /** ** ******************************************************************************************* **
         ** **                            CONSULTA DE REGIMEN LABORAL                                   ** **
         ** ** ******************************************************************************************* **/
        // LISTAR REGISTROS DE REGIMEN LABORAL
        this.router.get('/', verificarToken_1.TokenValidation, catRegimenControlador_1.default.ListarRegimen);
        // REGISTRAR REGIMEN LABORAL
        this.router.post('/', verificarToken_1.TokenValidation, catRegimenControlador_1.default.CrearRegimen);
        // ACTUALIZAR REGISTRO DE REGIMEN LABORAL
        this.router.put('/', verificarToken_1.TokenValidation, catRegimenControlador_1.default.ActualizarRegimen);
        // LISTAR DESCRIPCION DE REGIMEN LABORAL
        this.router.get('/descripcion', verificarToken_1.TokenValidation, catRegimenControlador_1.default.ListarNombresRegimen);
        // BUSCAR DATOS DE UN REGIMEN LABORAL
        this.router.get('/:id', verificarToken_1.TokenValidation, catRegimenControlador_1.default.ListarUnRegimen);
        // ELIMINAR REGISTRO DE REGIMEN LABORAL
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catRegimenControlador_1.default.EliminarRegistros);
        // BUSCAR REGIMEN LABORAL POR ID DE PAIS
        this.router.get('/pais-regimen/:nombre', verificarToken_1.TokenValidation, catRegimenControlador_1.default.ListarRegimenPais);
        // METODO PARA CREAR ARCHIVO XML
        this.router.post('/xmlDownload/', verificarToken_1.TokenValidation, catRegimenControlador_1.default.FileXML);
        /** ** ******************************************************************************************* **
         ** **                           CONSULTA PERIODO DE VACACIONES                                 ** **
         ** ** ******************************************************************************************* **/
        // REGISTRAR PERIODO DE VACACIONES
        this.router.post('/periodo-vacaciones', verificarToken_1.TokenValidation, catRegimenControlador_1.default.CrearPeriodo);
        // ACTUALIZAR PERIODO DE VACACIONES
        this.router.put('/periodo-vacaciones', verificarToken_1.TokenValidation, catRegimenControlador_1.default.ActualizarPeriodo);
        // BUSCAR DATOS DE UN REGIMEN LABORAL
        this.router.get('/periodo-vacaciones/:id', verificarToken_1.TokenValidation, catRegimenControlador_1.default.ListarUnPeriodo);
        // ELIMINAR REGISTRO PERIODO DE VACACIONES
        this.router.delete('/periodo-vacaciones/eliminar/:id', verificarToken_1.TokenValidation, catRegimenControlador_1.default.EliminarPeriodo);
        /** ** ******************************************************************************************* **
         ** **                          CONSULTA REGISTRO DE ANTIGUEDAD                                 ** **
         ** ** ******************************************************************************************* **/
        // REGISTRAR ANTIGUEDAD DE VACACIONES
        this.router.post('/antiguedad-vacaciones', verificarToken_1.TokenValidation, catRegimenControlador_1.default.CrearAntiguedad);
        // ACTUALIZAR ANTIGUEDAD DE VACACIONES
        this.router.put('/antiguedad-vacaciones', verificarToken_1.TokenValidation, catRegimenControlador_1.default.ActualizarAntiguedad);
        // BUSCAR DATOS DE UN REGIMEN LABORAL
        this.router.get('/antiguedad-vacaciones/:id', verificarToken_1.TokenValidation, catRegimenControlador_1.default.ListarAntiguedad);
        // ELIMINAR REGISTRO ANTIGUEDAD DE VACACIONES
        this.router.delete('/antiguedad-vacaciones/eliminar/:id', verificarToken_1.TokenValidation, catRegimenControlador_1.default.EliminarAntiguedad);
        this.router.get('/download/:nameXML', catRegimenControlador_1.default.downloadXML);
        this.router.get('/sucursal-regimen/:id', verificarToken_1.TokenValidation, catRegimenControlador_1.default.ListarRegimenSucursal);
    }
}
const REGIMEN_RUTA = new RegimenRuta();
exports.default = REGIMEN_RUTA.router;
