"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const catModalidadLaboralControlador_1 = __importDefault(require("../../../controlador/configuracion/parametrizacion/catModalidadLaboralControlador"));
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
const verificarToken_1 = require("../../../libs/verificarToken");
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
class ModalidaLaboralRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA LISTAR REGISTROS DE MODALIDAD LABORAL   ** USADO
        this.router.get('/', verificarToken_1.TokenValidation, catModalidadLaboralControlador_1.default.ListaModalidadLaboral);
        // METODO PARA REGISTRAR MODALIDAD LABORAL     **USADO
        this.router.post('/crearModalidad', verificarToken_1.TokenValidation, catModalidadLaboralControlador_1.default.CrearModalidadLaboral);
        // METODO PARA EDITAR MODALIDAD LABORAL   **USADO
        this.router.put('/', verificarToken_1.TokenValidation, catModalidadLaboralControlador_1.default.EditarModalidadLaboral);
        // METODO PARA ELIMINAR REGISTRO   **USADO
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catModalidadLaboralControlador_1.default.EliminarRegistro);
        // METODO PARA LEER DATOS DE PLANTILLA    **USADO
        this.router.post('/upload/revision', [verificarToken_1.TokenValidation, upload.single('uploads')], catModalidadLaboralControlador_1.default.VerfificarPlantillaModalidadLaboral);
        // METODO PARA GUARDAR DATOS DE PLANTILLA   **USADO
        this.router.post('/cargar_plantilla/', verificarToken_1.TokenValidation, catModalidadLaboralControlador_1.default.CargarPlantilla);
    }
}
const MODALIDAD_LABORAL_RUTAS = new ModalidaLaboralRutas();
exports.default = MODALIDAD_LABORAL_RUTAS.router;
