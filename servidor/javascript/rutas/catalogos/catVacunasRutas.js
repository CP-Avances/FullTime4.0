"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const catVacunasControlador_1 = __importDefault(require("../../controlador/catalogos/catVacunasControlador"));
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
const verificarToken_1 = require("../../libs/verificarToken");
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)());
    },
    filename: function (req, file, cb) {
        let documento = file.originalname;
        cb(null, documento);
    }
});
const upload = (0, multer_1.default)({ storage: storage });
class VacunasRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA CREAR TIPO VACUNAS
        this.router.post('/crearVacuna', verificarToken_1.TokenValidation, catVacunasControlador_1.default.CrearVacuna);
        // METODO PARA LISTAR TIPO VACUNAS
        this.router.get('/', verificarToken_1.TokenValidation, catVacunasControlador_1.default.ListaVacuna);
        // METODO PARA EDITAR TIPO VACUNAS
        this.router.put('/', verificarToken_1.TokenValidation, catVacunasControlador_1.default.EditarVacuna);
        // METODO PARA ELIMINAR REGISTRO
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catVacunasControlador_1.default.EliminarRegistro);
        // METODO PARA LEER DATOS DE PLANTILLA
        this.router.post('/upload/revision', [verificarToken_1.TokenValidation, upload.single('uploads')], catVacunasControlador_1.default.RevisarDatos);
        // METODO PARA GUARDAR DATOS DE PLANTILLA
        this.router.post('/cargar_plantilla/', verificarToken_1.TokenValidation, catVacunasControlador_1.default.CargarPlantilla);
    }
}
const TIPO_VACUNAS_RUTAS = new VacunasRutas();
exports.default = TIPO_VACUNAS_RUTAS.router;
