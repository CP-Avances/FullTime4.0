"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const nivelTituloControlador_1 = __importDefault(require("../../../controlador/empleado/nivelTitulo/nivelTituloControlador"));
const verificarToken_1 = require("../../../libs/verificarToken");
const multer_1 = __importDefault(require("multer"));
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
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
class NivelTituloRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA BUSCAR LISTA DE NIVELES DE TITULO   **USADO
        this.router.get('/', verificarToken_1.TokenValidation, nivelTituloControlador_1.default.ListarNivel);
        // METODO PARA ELIMINAR REGISTROS   **USADO
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, nivelTituloControlador_1.default.EliminarNivelTitulo);
        // METODO PARA REGISTRAR NIVEL DE TITULO   **USADO
        this.router.post('/', verificarToken_1.TokenValidation, nivelTituloControlador_1.default.CrearNivel);
        // METODO PARA ACTUALIZAR REGISTRO DE NIVEL   **USADO
        this.router.put('/', verificarToken_1.TokenValidation, nivelTituloControlador_1.default.ActualizarNivelTitulo);
        // METODO PARA BUSCAR NIVEL POR SU NOMBRE   **USADO
        this.router.get('/buscar/:nombre', verificarToken_1.TokenValidation, nivelTituloControlador_1.default.ObtenerNivelNombre);
        // METODO PARA VALIDAR DATOS DE PLANTILLA   **USADO
        this.router.post('/upload/revision', [verificarToken_1.TokenValidation, upload.single('uploads')], nivelTituloControlador_1.default.RevisarDatos);
        // METODO PARA REGISTRAR NIVELES DE TITULO DE LA PLANTILLA   **USADO
        this.router.post('/registrarNiveles', verificarToken_1.TokenValidation, nivelTituloControlador_1.default.RegistrarNivelesPlantilla);
    }
}
const NIVEL_TITULO_RUTAS = new NivelTituloRutas();
exports.default = NIVEL_TITULO_RUTAS.router;