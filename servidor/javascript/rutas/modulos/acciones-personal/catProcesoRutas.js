"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const catProcesoControlador_1 = __importDefault(require("../../../controlador/modulos/acciones-personal/catProcesoControlador"));
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
class ProcesoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO DE CONSULTA DE PROCESOS    **USADO
        this.router.get('/', verificarToken_1.TokenValidation, catProcesoControlador_1.default.ListarProcesos);
        // METODO PARA REGISTRAR UN PROCESO   **USADO
        this.router.post('/', verificarToken_1.TokenValidation, catProcesoControlador_1.default.RegistrarProceso);
        // METODO PARA ELIMINAR REGISTRO   **USADO
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catProcesoControlador_1.default.EliminarProceso);
        // METODO PARA OBTENER EL ID DEL PROCESO SUPERIOR   **USADO
        this.router.get('/busqueda/:nombre', verificarToken_1.TokenValidation, catProcesoControlador_1.default.ObtenerIdByNombre);
        // METODO PARA ACTUALIZAR UN PROCESO    **USADO
        this.router.put('/', verificarToken_1.TokenValidation, catProcesoControlador_1.default.ActualizarProceso);
        // METODO PARA LEER DATOS DE PLANTILLA    **USADO
        this.router.post('/upload/revision', [verificarToken_1.TokenValidation, upload.single('uploads')], catProcesoControlador_1.default.RevisarDatos);
        // METODO PARA GUARDAR DATOS DE PLANTILLA    **USADO
        this.router.post('/cargar_plantilla', verificarToken_1.TokenValidation, catProcesoControlador_1.default.CargarPlantilla);
        // METODO DE REGISTRO DE EMPLEADO - PROCESOS    **USADO
        this.router.post('/registrarProcesos', verificarToken_1.TokenValidation, catProcesoControlador_1.default.RegistrarProcesos);
        // METODO PARA ACTUALIZAR EL PROCESO   **USADO
        this.router.post('/actualizacionProceso', verificarToken_1.TokenValidation, catProcesoControlador_1.default.EditarRegistroProcesoEmple);
        // METODO PARA LEER DATOS DE PLANTILLA    **USADO
        this.router.post('/upload/revision_empleadoProceso', [verificarToken_1.TokenValidation, upload.single('uploads')], catProcesoControlador_1.default.RevisarPantillaEmpleadoProce);
        // METODO PARA GUARDAR DATOS DE PLANTILLA   **USADO
        this.router.post('/cargar_plantilla/registro_empleadoProceso', verificarToken_1.TokenValidation, catProcesoControlador_1.default.RegistrarEmpleadoProceso);
        // METODO PARA ELIMINAR PROCESOS DE MANERA MULTIPLE   **USADO
        this.router.post('/eliminarProcesoMultiple', verificarToken_1.TokenValidation, catProcesoControlador_1.default.EliminarProcesoMultiple);
        this.router.get('/:id', verificarToken_1.TokenValidation, catProcesoControlador_1.default.getOne);
    }
}
const PROCESO_RUTAS = new ProcesoRutas();
exports.default = PROCESO_RUTAS.router;
