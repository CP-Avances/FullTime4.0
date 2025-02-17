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
        // METODO PARA LEER DATOS DE PLANTILLA    **USADO
        this.router.post('/upload/revision', [verificarToken_1.TokenValidation, upload.single('uploads')], grupoOcupacionalControlador_1.default.RevisarDatos);
        // METODO PARA GUARDAR DATOS DE PLANTILLA    **USADO
        this.router.post('/cargar_plantilla', verificarToken_1.TokenValidation, grupoOcupacionalControlador_1.default.CargarPlantilla);
        // METODO PARA GUARDAR GRUPO MACIVOS POR INTERFAZ
        this.router.post('/registrarGrupo', verificarToken_1.TokenValidation, grupoOcupacionalControlador_1.default.RegistrarGrupo);
        // METODO PARA LEER DATOS DE PLANTILLA    **USADO
        this.router.post('/upload/revision_empleadoGrupoOcupacional', [verificarToken_1.TokenValidation, upload.single('uploads')], grupoOcupacionalControlador_1.default.RevisarPantillaEmpleadoGrupoOcu);
        // METODO PARA GUARDAR DATOS DE PLANTILLA   **USADO
        this.router.post('/cargar_plantilla/registro_empleadoGrupoOcupacional', verificarToken_1.TokenValidation, grupoOcupacionalControlador_1.default.RegistrarEmpleadoGrupoOcu);
    }
}
const GRUPO_OCUPACIONAL_RUTAS = new GrupoOcupacionalRutas();
exports.default = GRUPO_OCUPACIONAL_RUTAS.router;
