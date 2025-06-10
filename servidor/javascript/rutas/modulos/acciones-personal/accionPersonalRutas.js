"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const accionPersonalControlador_1 = __importDefault(require("../../../controlador/modulos/acciones-personal/accionPersonalControlador"));
const verificarToken_1 = require("../../../libs/verificarToken");
const express_1 = require("express");
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
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
class DepartamentoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        /** TABLA TIPO_ACCION_PERSONAL */
        this.router.get('/', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.ListarTipoAccionPersonal);
        this.router.post('/', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.CrearTipoAccionPersonal);
        this.router.get('/tipo/accion/:id', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.EncontrarTipoAccionPersonalId);
        this.router.put('/', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.ActualizarTipoAccionPersonal);
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.EliminarTipoAccionPersonal);
        this.router.get('/editar/accion/tipo/:id', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.ListarTipoAccionEdicion);
        // METODO PARA ELIMINAR LOS TIPOS DE ACCION PERSONAL DE MANERA MULTIPLE   **USADO
        this.router.post('/eliminarProcesoMult', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.EliminarTipoAccionMultipleMult);
        /** TABLA TIPO_ACCION */
        this.router.get('/accion/tipo', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.ListarTipoAccion);
        this.router.post('/accion/tipo', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.CrearTipoAccion);
        /** TABLA PEDIDO_ACCION_EMPLEADO */
        this.router.post('/pedido/accion', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.CrearPedidoAccionPersonal);
        this.router.put('/pedido/accion/editar', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.ActualizarPedidoAccionPersonal);
        // VER LOGO DE MINISTERIO TRABAJO
        this.router.get('/logo/ministerio/codificado', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.verLogoMinisterio);
        // CONSULTAS PEDIDOS ACCIONES DE PERSONAL
        this.router.get('/pedidos/accion', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.ListarPedidoAccion);
        this.router.get('/pedidos/datos/:id', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.EncontrarDatosEmpleados);
        this.router.get('/pedidos/ciudad/:id', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.EncontrarDatosCiudades);
        this.router.get('/pedido/informacion/:id', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.EncontrarPedidoAccion);
        this.router.get('/lista/procesos/:id', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.EncontrarProcesosRecursivos);
        // METODO PARA LEER DATOS DE PLANTILLA    **USADO
        this.router.post('/upload/revision', [verificarToken_1.TokenValidation, upload.single('uploads')], accionPersonalControlador_1.default.RevisarDatos);
        // METODO PARA GUARDAR DATOS DE PLANTILLA    **USADO
        this.router.post('/cargar_plantilla', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.CargarPlantilla);
    }
}
const ACCION_PERSONAL_RUTAS = new DepartamentoRutas();
exports.default = ACCION_PERSONAL_RUTAS.router;
