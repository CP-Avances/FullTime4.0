"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const verificarHoraExtra_1 = require("../../libs/Modulos/verificarHoraExtra");
const verificarToken_1 = require("../../libs/verificarToken");
const express_1 = require("express");
const horaExtraControlador_1 = __importDefault(require("../../controlador/horaExtra/horaExtraControlador"));
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './horasExtras',
});
class HorasExtrasPedidasRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.ListarHorasExtrasPedidas);
        this.router.get('/pedidos_autorizados', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.ListarHorasExtrasPedidasAutorizadas);
        this.router.get('/observaciones', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.ListarHorasExtrasPedidasObservacion);
        this.router.get('/datosSolicitud/:id_emple_hora', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.ObtenerSolicitudHoraExtra);
        this.router.get('/datosAutorizacion/:id_hora', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.ObtenerAutorizacionHoraExtra);
        this.router.get('/horario-empleado/:id_cargo', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.ObtenerHorarioEmpleado);
        this.router.get('/listar/solicitudes', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.ListarPedidosHE);
        this.router.get('/solicitudes/autorizadas', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.ListarPedidosHEAutorizadas);
        this.router.get('/listar/solicitudes/empleado/:id_empleado', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.ListarPedidosHE_Empleado);
        this.router.get('/solicitudes/autorizadas/empleado/:id_empleado', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.ListarPedidosHEAutorizadas_Empleado);
        // REPORTE CRITERIOS DE BUSQUEDA MÚLTIPLES
        this.router.put('/horas-planificadas/:desde/:hasta', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.ReporteVacacionesMultiple);
        /** ************************************************************************************************* **
         ** **                         METODO DE MANEJO DE HORAS EXTRAS                                    ** **
         ** ************************************************************************************************* **/
        // CREAR REGISTRO DE HORAS EXTRAS
        this.router.post('/', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.CrearHoraExtraPedida);
        // ELIMINAR REGISTRO DE HORAS EXTRAS
        this.router.delete('/eliminar/:id_hora_extra/:documento', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.EliminarHoraExtra);
        // EDITAR REGISTRO DE HORA EXTRA
        this.router.put('/:id/solicitud', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.EditarHoraExtra);
        // BUSCAR LISTA DE HORAS EXTRAS DE UN USUARIO
        this.router.get('/lista/:id_user', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.ObtenerListaHora);
        // EDITAR TIEMPO AUTORIZADO DE SOLICITUD
        this.router.put('/tiempo-autorizado/:id_hora', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.TiempoAutorizado);
        // EDITAR ESTADO DE LA SOLIICTUD
        this.router.put('/:id/estado', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.ActualizarEstado);
        // EDITAR OBSERVACION DE SOLICITUD DE HORAS EXTRAS
        this.router.put('/observacion/:id', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.ActualizarObservacion);
        // BUSCAR DATOS DE UNA SOLICITUD DE HORA EXTRA POR SU ID
        this.router.get('/:id', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.ObtenerUnaSolicitudHE);
        // GUARDAR DOCUMENTO DE RESPALDO DE HORAS EXTRAS
        this.router.put('/:id/documento/:nombre', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation, multipartMiddleware], horaExtraControlador_1.default.GuardarDocumentoHoras);
        // BUSQUEDA DE RESPALDOS DE HORAS EXTRAS
        this.router.get('/documentos/:docs', horaExtraControlador_1.default.ObtenerDocumento);
        // ELIMINAR DOCUMENTO DE RESPALDO DE HORAS EXTRAS
        this.router.put('/eliminar-documento', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation, multipartMiddleware], horaExtraControlador_1.default.EliminarDocumentoHoras);
        // ELIMINAR DOCUMENTO DE RESPALDO DE HORAS EXTRAS MOVIL
        this.router.delete('/eliminar-documento-movil/:documento', horaExtraControlador_1.default.EliminarArchivoMovil);
        // ELIMINAR DOCUMENTO DE RESPALDO DE HORAS EXTRAS WEB
        this.router.delete('/eliminar-documento-web/:documento', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.EliminarArchivoMovil);
        // METODO PARA CREAR ARCHIVO XML
        this.router.post('/xmlDownload/', verificarToken_1.TokenValidation, horaExtraControlador_1.default.FileXML);
        // METODO PARA DESCARGAR ARCHIVO XML
        this.router.get('/download/:nameXML', horaExtraControlador_1.default.downloadXML);
        /** ************************************************************************************************** **
         ** **                         METODO PARA ENVIO DE NOTIFICACIONES                                  ** **
         ** ************************************************************************************************** **/
        // METODO DE ENVIO DE CORREO DESDE APLICACION WEB
        this.router.post('/mail-noti/', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.SendMailNotifiHoraExtra);
        // METODO DE ENVIO DE CORREO DESDE APLICACION WEB
        this.router.post('/mail-noti-horas-extras-movil/:id_empresa', horaExtraControlador_1.default.EnviarCorreoHoraExtraMovil);
        // GUARDAR DOCUMENTO DE RESPALDO DE HORAS EXTRAS MOVIL
        this.router.put('/:id/documento-movil/:nombre', [multipartMiddleware], horaExtraControlador_1.default.GuardarDocumentoHoras);
    }
}
const HORA_EXTRA_PEDIDA_RUTA = new HorasExtrasPedidasRutas();
exports.default = HORA_EXTRA_PEDIDA_RUTA.router;
