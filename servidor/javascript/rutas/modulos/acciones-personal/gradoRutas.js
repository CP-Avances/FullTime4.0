"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gradoControlador_1 = __importDefault(require("../../../controlador/modulos/acciones-personal/gradoControlador"));
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
const verificarToken_1 = require("../../../libs/verificarToken");
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
class GradoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA CONSULTAR GRADOS
        this.router.get('/', verificarToken_1.TokenValidation, gradoControlador_1.default.listaGrados);
        this.router.post('/', verificarToken_1.TokenValidation, gradoControlador_1.default.IngresarGrados);
        this.router.put('/update', verificarToken_1.TokenValidation, gradoControlador_1.default.EditarGrados);
        this.router.delete('/delete', verificarToken_1.TokenValidation, gradoControlador_1.default.EliminarGrados);
        // METODO PARA LEER DATOS DE PLANTILLA    **USADO
        this.router.post('/upload/revision', [verificarToken_1.TokenValidation, upload.single('uploads')], gradoControlador_1.default.RevisarDatos);
        // METODO PARA GUARDAR DATOS DE PLANTILLA    **USADO
        //this.router.post('/cargar_plantilla', TokenValidation, GRADO_CONTROLADOR.CargarPlantilla);
    }
}
const GRADO_RUTAS = new GradoRutas();
exports.default = GRADO_RUTAS.router;
