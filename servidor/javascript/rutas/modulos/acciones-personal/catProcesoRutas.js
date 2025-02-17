"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catProcesoControlador_1 = __importDefault(require("../../../controlador/modulos/acciones-personal/catProcesoControlador"));
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
class ProcesoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA CONSULTAR PROCESOS
        this.router.get('/', verificarToken_1.TokenValidation, catProcesoControlador_1.default.ListarProcesos);
        this.router.get('/busqueda/:nombre', verificarToken_1.TokenValidation, catProcesoControlador_1.default.getIdByNombre);
        this.router.get('/:id', verificarToken_1.TokenValidation, catProcesoControlador_1.default.getOne);
        this.router.post('/', verificarToken_1.TokenValidation, catProcesoControlador_1.default.create);
        this.router.put('/', verificarToken_1.TokenValidation, catProcesoControlador_1.default.ActualizarProceso);
        // METODO PARA ELIMINAR REGISTRO   **USADO
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catProcesoControlador_1.default.EliminarProceso);
        // METODO PARA LEER DATOS DE PLANTILLA    **USADO
        this.router.post('/upload/revision', [verificarToken_1.TokenValidation, upload.single('uploads')], catProcesoControlador_1.default.RevisarDatos);
        // METODO PARA GUARDAR DATOS DE PLANTILLA    **USADO
        this.router.post('/cargar_plantilla', verificarToken_1.TokenValidation, catProcesoControlador_1.default.CargarPlantilla);
        // METODO PARA GUARDAR PROCESOS MACIVOS POR INTERFAZ
        this.router.post('/registrarProcesos', verificarToken_1.TokenValidation, catProcesoControlador_1.default.RegistrarProcesos);
        // METODO PARA LEER DATOS DE PLANTILLA    **USADO
        this.router.post('/upload/revision_epleadoProceso', [verificarToken_1.TokenValidation, upload.single('uploads')], catProcesoControlador_1.default.RevisarPantillaEmpleadoProce);
        // METODO PARA GUARDAR DATOS DE PLANTILLA   **USADO
        this.router.post('/cargar_plantilla/registro_epleadoProceso', verificarToken_1.TokenValidation, catProcesoControlador_1.default.RegistrarEmpleadoProceso);
    }
}
const PROCESO_RUTAS = new ProcesoRutas();
exports.default = PROCESO_RUTAS.router;
