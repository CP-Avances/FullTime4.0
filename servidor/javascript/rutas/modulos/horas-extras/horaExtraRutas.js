"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
const verificarHoraExtra_1 = require("../../../libs/Modulos/verificarHoraExtra");
const verificarToken_1 = require("../../../libs/verificarToken");
const express_1 = require("express");
const horaExtraControlador_1 = __importDefault(require("../../../controlador/modulos/horas-extras/horaExtraControlador"));
const moment_1 = __importDefault(require("moment"));
const multer_1 = __importDefault(require("multer"));
moment_1.default.locale('es');
const storage2 = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        return __awaiter(this, void 0, void 0, function* () {
            const ruta = yield (0, accesoCarpetas_1.ObtenerRutaHorasExtraGeneral)();
            cb(null, ruta);
        });
    },
    filename: function (req, file, cb) {
        return __awaiter(this, void 0, void 0, function* () {
            // FECHA DEL SISTEMA
            const fecha = (0, moment_1.default)();
            const anio = fecha.format('YYYY');
            const mes = fecha.format('MM');
            const dia = fecha.format('DD');
            const documento = `${anio}_${mes}_${dia}_${file.originalname}`;
            console.log('documento', documento);
            cb(null, documento);
        });
    }
});
const upload2 = (0, multer_1.default)({ storage: storage2 });
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
        this.router.post('/', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation, upload2.single('uploads')], horaExtraControlador_1.default.CrearHoraExtraPedida);
        // ELIMINAR REGISTRO DE HORAS EXTRAS
        this.router.delete('/eliminar/:id_hora_extra/:documento', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.EliminarHoraExtra);
        // EDITAR REGISTRO DE HORA EXTRA
        this.router.put('/:id/solicitud', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.EditarHoraExtra);
        // BUSCAR LISTA DE HORAS EXTRAS DE UN USUARIO   **USADO
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
        //------------------------------- Metodos APP MOVIL --------------------------------------------------------
        this.router.get('/horas-extras/lista-horas-extrasfechas', verificarToken_1.TokenValidation, horaExtraControlador_1.default.getlistaHorasExtrasByFechasyCodigo);
        this.router.get('/horas-extras/lista-horas-extras', verificarToken_1.TokenValidation, horaExtraControlador_1.default.getlistaHorasExtrasByCodigo);
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
