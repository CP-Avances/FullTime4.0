"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const catDiscapacidadControlador_1 = __importDefault(require("../../controlador/catalogos/catDiscapacidadControlador"));
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
class DiscapacidadRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA LISTAR TIPOS DE DISCAPACIDAD   **USADO
        this.router.get('/', verificarToken_1.TokenValidation, catDiscapacidadControlador_1.default.ListarDiscapacidad);
        // METODO PARA REGISTRAR UN TIPO DE DISCAPACIDDA   **USADO
        this.router.post('/crearDiscapacidad', verificarToken_1.TokenValidation, catDiscapacidadControlador_1.default.CrearDiscapacidad);
        // METODO PARA EDITAR UN TIPO DE DISCAPACIDAD    **USADO
        this.router.put('/', verificarToken_1.TokenValidation, catDiscapacidadControlador_1.default.EditarDiscapacidad);
        // METODO PARA ELIMINAR UN TIPO DE DISCAPACIDAD    **USADO
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catDiscapacidadControlador_1.default.EliminarRegistro);
        // METODO PARA LEER DATOS DE PLANTILLA   **USADO
        this.router.post('/upload/revision', [verificarToken_1.TokenValidation, upload.single('uploads')], catDiscapacidadControlador_1.default.RevisarDatos);
        // METODO PARA GUARDAR DATOS DE PLANTILLA   **USADO
        this.router.post('/cargar_plantilla/', verificarToken_1.TokenValidation, catDiscapacidadControlador_1.default.CargarPlantilla);
    }
}
const DISCAPACIDADES_RUTAS = new DiscapacidadRutas();
exports.default = DISCAPACIDADES_RUTAS.router;
