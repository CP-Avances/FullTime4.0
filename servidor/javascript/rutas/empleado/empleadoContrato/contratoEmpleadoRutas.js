"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../../libs/verificarToken");
const contratoEmpleadoControlador_1 = __importDefault(require("../../../controlador/empleado/empleadoContrato/contratoEmpleadoControlador"));
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './contratos',
});
class DepartamentoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        /** ******************************************************************************************** **
         ** **                      MANEJO DE DATOS DE CONTRATO DEL USUARIO                           ** **
         ** ******************************************************************************************** **/
        // REGISTRAR DATOS DE CONTRATO
        this.router.post('/', verificarToken_1.TokenValidation, contratoEmpleadoControlador_1.default.CrearContrato);
        // GUARDAR DOCUMENTO 
        this.router.put('/:id/documento/:nombre', [verificarToken_1.TokenValidation, multipartMiddleware], contratoEmpleadoControlador_1.default.GuardarDocumentoContrato);
        // MOSTRAR DOCUMENTO CARGADO EN EL SISTEMA
        this.router.get('/documentos/:docs', contratoEmpleadoControlador_1.default.ObtenerDocumento);
        // METODO PARA BUSCAR CONTRATOS POR ID DE EMPLEADO
        this.router.get('/contrato-empleado/:id_empleado', verificarToken_1.TokenValidation, contratoEmpleadoControlador_1.default.BuscarContratoEmpleado);
        // EDITAR DATOS DE CONTRATO
        this.router.put('/:id/actualizar', verificarToken_1.TokenValidation, contratoEmpleadoControlador_1.default.EditarContrato);
        // ELIMINAR DOCUMENTO DE CONTRATO BASE DE DATOS - SERVIDOR
        this.router.put('/eliminar_contrato/base_servidor', [verificarToken_1.TokenValidation], contratoEmpleadoControlador_1.default.EliminarDocumento);
        // ELIMINAR DOCUMENTO DE CONTRATOS DEL SERVIDOR
        this.router.put('/eliminar_contrato/servidor', [verificarToken_1.TokenValidation], contratoEmpleadoControlador_1.default.EliminarDocumentoServidor);
        // METODO PARA BUSCAR ID ACTUAL DE CONTRATO
        this.router.get('/contratoActual/:id_empleado', verificarToken_1.TokenValidation, contratoEmpleadoControlador_1.default.EncontrarIdContratoActual);
        // METODO PARA BUSCAR DATOS DE CONTRATO POR ID
        this.router.get('/contrato/:id', verificarToken_1.TokenValidation, contratoEmpleadoControlador_1.default.EncontrarDatosUltimoContrato);
        // METODO PARA BUSCAR FECHAS DE CONTRATOS    --**VERIFICADO
        this.router.post('/buscarFecha', verificarToken_1.TokenValidation, contratoEmpleadoControlador_1.default.EncontrarFechaContrato);
        /** ********************************************************************************************* **
         ** **            METODOS PARA SER USADOS EN LA TABLA MODAL_TRABAJO O TIPO DE CONTRATOS        ** **
         ** ********************************************************************************************* **/
        // REGISTRAR MODALIDAD DE TRABAJO
        this.router.post('/modalidad/trabajo', verificarToken_1.TokenValidation, contratoEmpleadoControlador_1.default.CrearTipoContrato);
        // BUSCAR LISTA DE MODALIDAD DE TRABAJO
        this.router.get('/modalidad/trabajo', verificarToken_1.TokenValidation, contratoEmpleadoControlador_1.default.ListarTiposContratos);
        this.router.get('/', verificarToken_1.TokenValidation, contratoEmpleadoControlador_1.default.ListarContratos);
        this.router.get('/:id/get', verificarToken_1.TokenValidation, contratoEmpleadoControlador_1.default.ObtenerUnContrato);
        this.router.get('/:id_empleado', verificarToken_1.TokenValidation, contratoEmpleadoControlador_1.default.EncontrarIdContrato);
        this.router.put('/editar/editarDocumento/:id', verificarToken_1.TokenValidation, contratoEmpleadoControlador_1.default.EditarDocumento);
        this.router.post('/buscarFecha/contrato', verificarToken_1.TokenValidation, contratoEmpleadoControlador_1.default.EncontrarFechaContratoId);
    }
}
const CONTRATO_EMPLEADO_RUTAS = new DepartamentoRutas();
exports.default = CONTRATO_EMPLEADO_RUTAS.router;
