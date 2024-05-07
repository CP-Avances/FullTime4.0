"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catModalidadLaboralControlador_1 = __importDefault(require("../../controlador/catalogos/catModalidadLaboralControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
const multer_1 = __importDefault(require("multer"));
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)());
    },
    filename: function (req, file, cb) {
        // FECHA DEL SISTEMA
        //var fecha = moment();
        //var anio = fecha.format('YYYY');
        //var mes = fecha.format('MM');
        //var dia = fecha.format('DD');
        let documento = file.originalname;
        cb(null, documento);
    }
});
const upload = (0, multer_1.default)({ storage: storage });
class ModalidaLaboralRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', verificarToken_1.TokenValidation, catModalidadLaboralControlador_1.default.listaModalidadLaboral);
        this.router.post('/crearModalidad', verificarToken_1.TokenValidation, catModalidadLaboralControlador_1.default.CrearMadalidadLaboral);
        this.router.put('/', verificarToken_1.TokenValidation, catModalidadLaboralControlador_1.default.EditarModalidadLaboral);
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catModalidadLaboralControlador_1.default.eliminarRegistro);
        this.router.post('/upload/revision', [verificarToken_1.TokenValidation, upload.single('uploads')], catModalidadLaboralControlador_1.default.VerfificarPlantillaModalidadLaboral);
        this.router.post('/cargar_plantilla/', verificarToken_1.TokenValidation, catModalidadLaboralControlador_1.default.CargarPlantilla);
    }
}
const MODALIDAD_LABORAL_RUTAS = new ModalidaLaboralRutas();
exports.default = MODALIDAD_LABORAL_RUTAS.router;
