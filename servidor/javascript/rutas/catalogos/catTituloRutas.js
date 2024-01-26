"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catTituloControlador_1 = __importDefault(require("../../controlador/catalogos/catTituloControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
const multer_1 = __importDefault(require("multer"));
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
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
class TituloRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA LISTAR TITULOS
        this.router.get('/', verificarToken_1.TokenValidation, catTituloControlador_1.default.ListarTitulos);
        // METODO PARA ELIMINAR REGISTRO
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catTituloControlador_1.default.EliminarRegistros);
        // METODO PARA ACTUALIZAR REGISTRO DE TITULO
        this.router.put('/', verificarToken_1.TokenValidation, catTituloControlador_1.default.ActualizarTitulo);
        this.router.get('/:id', verificarToken_1.TokenValidation, catTituloControlador_1.default.getOne);
        this.router.post('/', verificarToken_1.TokenValidation, catTituloControlador_1.default.create);
        this.router.post('/upload/revision', [verificarToken_1.TokenValidation, upload.single('uploads')], catTituloControlador_1.default.RevisarDatos);
    }
}
const TITULO_RUTAS = new TituloRutas();
exports.default = TITULO_RUTAS.router;
