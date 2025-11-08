"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gradoControlador_1 = __importDefault(require("../../../controlador/modulos/acciones-personal/gradoControlador"));
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
class GradoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO DE CONSULTA DE GRADOS   **USADO
        this.router.get('/', verificarToken_1.TokenValidation, gradoControlador_1.default.ListaGrados);
        // METODO PARA OBTENER GRADO DEL USUARIO   **USADO
        this.router.get('/infoGrado/:id_empleado', verificarToken_1.TokenValidation, gradoControlador_1.default.GradoByEmple);
        // METODO PARA INGRESAR REGISTRO  **USADO
        this.router.post('/', verificarToken_1.TokenValidation, gradoControlador_1.default.IngresarGrados);
        // METODO PARA EDITAR REGISTRO  **USADO
        this.router.put('/update', verificarToken_1.TokenValidation, gradoControlador_1.default.EditarGrados);
        // METODO PARA ElIMINAR REGISTRO  **USADO
        this.router.delete('/delete', verificarToken_1.TokenValidation, gradoControlador_1.default.EliminarGrados);
        // METODO PARA ELIMINAR EL GRADO POR EMPLEADO **USADO
        this.router.delete('/deleteGradoEmple/:id', verificarToken_1.TokenValidation, gradoControlador_1.default.EliminarEmpleGrado);
        // METODO PARA LEER DATOS DE PLANTILLA    **USADO
        this.router.post('/upload/revision', [verificarToken_1.TokenValidation, upload.single('uploads')], gradoControlador_1.default.RevisarDatos);
        // METODO PARA GUARDAR DATOS DE PLANTILLA    **USADO
        this.router.post('/cargar_plantilla', verificarToken_1.TokenValidation, gradoControlador_1.default.CargarPlantilla);
        // METODO PARA GUARDAR PROCESOS MACIVOS POR INTERFAZ  **USADO
        this.router.post('/registrarGrados', verificarToken_1.TokenValidation, gradoControlador_1.default.RegistrarGrados);
        // METODO PARA LEER DATOS DE PLANTILLA    **USADO
        this.router.post('/upload/revision_empleadoGrado', [verificarToken_1.TokenValidation, upload.single('uploads')], gradoControlador_1.default.RevisarPantillaEmpleadoGrado);
        // METODO PARA GUARDAR DATOS DE PLANTILLA   **USADO
        this.router.post('/cargar_plantilla/registro_empleadoGrado', verificarToken_1.TokenValidation, gradoControlador_1.default.RegistrarEmpleadoGrado);
        // METODO PARA ACTUALIZAR EL GRADO   **USADO
        this.router.post('/actualizacionGrado', verificarToken_1.TokenValidation, gradoControlador_1.default.EditarRegistroGradoEmple);
        // METODO PARA ELIMINAR GRUPOS DE MANERA MULTIPLE   **USADO
        this.router.post('/eliminarGradoMultiple', verificarToken_1.TokenValidation, gradoControlador_1.default.EliminarGradoMultiple);
    }
}
const GRADO_RUTAS = new GradoRutas();
exports.default = GRADO_RUTAS.router;
