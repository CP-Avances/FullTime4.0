"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catVacunasControlador_1 = __importDefault(require("../../controlador/catalogos/catVacunasControlador"));
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
class VacunasRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', verificarToken_1.TokenValidation, catVacunasControlador_1.default.listaVacuna);
        this.router.post('/crearVacunas', verificarToken_1.TokenValidation, catVacunasControlador_1.default.CrearVacuna);
        this.router.put('/', verificarToken_1.TokenValidation, catVacunasControlador_1.default.EditarVacuna);
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catVacunasControlador_1.default.eliminarRegistro);
    }
}
const VACUNAS_RUTAS = new VacunasRutas();
exports.default = VACUNAS_RUTAS.router;
