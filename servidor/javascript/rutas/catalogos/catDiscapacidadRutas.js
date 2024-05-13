"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catDiscapacidadControlador_1 = __importDefault(require("../../controlador/catalogos/catDiscapacidadControlador"));
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
class DiscapacidadRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', verificarToken_1.TokenValidation, catDiscapacidadControlador_1.default.listaDiscapacidad);
        this.router.post('/crearDiscapacidad', verificarToken_1.TokenValidation, catDiscapacidadControlador_1.default.CrearDiscapacidad);
        this.router.put('/', verificarToken_1.TokenValidation, catDiscapacidadControlador_1.default.EditarDiscapacidad);
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catDiscapacidadControlador_1.default.eliminarRegistro);
    }
}
const DISCAPACIDADES_RUTAS = new DiscapacidadRutas();
exports.default = DISCAPACIDADES_RUTAS.router;
