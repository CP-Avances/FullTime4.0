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
        // METODO PARA LISTAR DETALLES TIPOS DE ACCION DE PERSONAL   **USADO
        this.router.get('/', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.ListarTipoAccionPersonal);
        // METODO PARA REGISTRAR DETALLE DE TIPOS DE ACCIONES DE PERSONAL   **USADO
        this.router.post('/', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.CrearTipoAccionPersonal);
        // METODO DE ACTUALIZACION DEL DETALLE DE LA ACCION DE PERSONAL    **USADO
        this.router.put('/', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.ActualizarTipoAccionPersonal);
        // METODO PARA ELIMINAR REGISTROS DE DETALLES DE TIPO DE ACCION DE PERSONAL  *USADO
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.EliminarTipoAccionPersonal);
        // METODO PARA ELIMINAR LOS TIPOS DE ACCION PERSONAL DE MANERA MULTIPLE   **USADO
        this.router.post('/eliminarMultiple', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.EliminarTipoAccionMultiple);
        // METODO PARA LEER DATOS DE PLANTILLA    **USADO
        this.router.post('/upload/revision', [verificarToken_1.TokenValidation, upload.single('uploads')], accionPersonalControlador_1.default.RevisarDatos);
        // METODO PARA GUARDAR DATOS DE PLANTILLA    **USADO
        this.router.post('/cargar_plantilla', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.CargarPlantilla);
        // METODO PARA CONSULTAR TIPOS DE ACCION PERSONAL   **USADO
        this.router.get('/accion/tipo', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.ListarTipoAccion);
        // METODO PARA REGISTRAR UNA ACCION DE PERSONAL   **USADO
        this.router.post('/accion/tipo', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.CrearTipoAccion);
        // METODO PARA BUSCAR UN DETALLE DE TIPO DE ACCION DE PERSONAL POR ID    **USADO
        this.router.get('/tipo/accion/:id', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.EncontrarTipoAccionPersonalId);
        // METODO PARA BUSCAR DATOS DEL DETALLE DE ACCION DE PERSONAL PARA EDICION   **USADO
        this.router.get('/editar/accion/tipo/:id', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.ListarTipoAccionEdicion);
        // METODO DE REGISTRO DE DOCUMENTO ACCION DE PERSONAL     **USADO
        this.router.post('/pedido/accion', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.CrearPedidoAccionPersonal);
        // METODO DE ACTUALIZACION DE DATOS DEL DOCUMENTO DE ACCION PERSONAL   **USADO
        this.router.put('/pedido/accion/editar', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.ActualizarPedidoAccionPersonal);
        // METODO DE BUSQUEDA DE DATOS DE DOCUMENTOS DE ACCION DE PERSONAL    **USADO
        this.router.get('/pedido/informacion/:id', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.EncontrarPedidoAccion);
        // METODO PARA BUSCAR PEDIDOS DE ACCION DE PERSONAL  **USADO
        this.router.get('/pedidos/accion', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.ListarPedidoAccion);
        // VER LOGO DE MINISTERIO TRABAJO     **USADO
        this.router.get('/logo/ministerio/codificado', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.verLogoMinisterio);
        // METODO PARA BUSCAR LISTA DE PROCESOS   **USADO**
        this.router.get('/lista/procesos/:id', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.EncontrarProcesosRecursivos);
        // METODO PARA BUSCAR UN DOCUMENTO DE ACCION DE PERSONAL    **USADO**
        this.router.get('/pedidos/datos/:id', verificarToken_1.TokenValidation, accionPersonalControlador_1.default.EncontrarDatosEmpleados);
    }
}
const ACCION_PERSONAL_RUTAS = new DepartamentoRutas();
exports.default = ACCION_PERSONAL_RUTAS.router;
