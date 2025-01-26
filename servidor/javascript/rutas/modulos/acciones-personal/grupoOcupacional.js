"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const grupoOcupacionalControlador_1 = __importDefault(require("../../../controlador/modulos/acciones-personal/grupoOcupacionalControlador"));
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
class GrupoOcupacionalRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA CONSULTAR GRUPO OCUPACIONAL
        this.router.get('/', verificarToken_1.TokenValidation, grupoOcupacionalControlador_1.default.listaGrupoOcupacional);
        this.router.post('/', verificarToken_1.TokenValidation, grupoOcupacionalControlador_1.default.IngresarGrupoOcupacional);
        this.router.put('/update', verificarToken_1.TokenValidation, grupoOcupacionalControlador_1.default.EditarGrupoOcupacional);
        this.router.delete('/delete', verificarToken_1.TokenValidation, grupoOcupacionalControlador_1.default.EliminarGrupoOcupacional);
    }
}
const GRUPO_OCUPACIONAL_RUTAS = new GrupoOcupacionalRutas();
exports.default = GRUPO_OCUPACIONAL_RUTAS.router;
