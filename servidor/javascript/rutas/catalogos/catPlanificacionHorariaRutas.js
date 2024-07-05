"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const verificarToken_1 = require("../../libs/verificarToken");
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const catPlanificacionHorariaControlador_1 = __importDefault(require("../../controlador/catalogos/catPlanificacionHorariaControlador"));
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
class PlanificacionHorariaRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // VERIFICAR DATOS DE LA PLANIFICACION HORARIA
        this.router.post('/verificarDatos', [verificarToken_1.TokenValidation, upload.single('uploads')], catPlanificacionHorariaControlador_1.default.VerificarDatosPlanificacionHoraria);
        // CARGAR PLANIFICACION HORARIA
        this.router.post('/registrarPlanificacion', [verificarToken_1.TokenValidation, upload.single('uploads')], catPlanificacionHorariaControlador_1.default.RegistrarPlanificacionHoraria);
    }
}
const PLANIFICACION_HORARIA_RUTAS = new PlanificacionHorariaRutas();
exports.default = PLANIFICACION_HORARIA_RUTAS.router;
