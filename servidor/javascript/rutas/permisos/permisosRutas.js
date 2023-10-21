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
const permisosControlador_1 = __importDefault(require("../../controlador/permisos/permisosControlador"));
const verificarPermisos_1 = require("../../libs/Modulos/verificarPermisos");
const verificarToken_1 = require("../../libs/verificarToken");
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const database_1 = __importDefault(require("../../database"));
const moment_1 = __importDefault(require("moment"));
moment_1.default.locale('es');
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        return __awaiter(this, void 0, void 0, function* () {
            let { codigo } = req.params;
            var ruta = yield (0, accesoCarpetas_1.ObtenerRutaPermisos)(codigo);
            cb(null, ruta);
        });
    },
    filename: function (req, file, cb) {
        return __awaiter(this, void 0, void 0, function* () {
            // FECHA DEL SISTEMA
            var fecha = (0, moment_1.default)();
            var anio = fecha.format('YYYY');
            var mes = fecha.format('MM');
            var dia = fecha.format('DD');
            // DATOS DOCUMENTO
            let { id, codigo } = req.params;
            const permiso = yield database_1.default.query(`
            SELECT num_permiso FROM permisos WHERE id = $1
            `, [id]);
            let documento = permiso.rows[0].num_permiso + '_' + codigo + '_' + anio + '_' + mes + '_' + dia + '_' + file.originalname;
            cb(null, documento);
        });
    }
});
const upload = (0, multer_1.default)({ storage: storage });
class PermisosRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA BUSCAR NUMERO DE PERMISO
        this.router.get('/numPermiso/:id_empleado', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.ObtenerNumPermiso);
        // METODO PARA BUSCAR PERMISOS SOLICITADOS 
        this.router.post('/permisos-solicitados-totales', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.BuscarPermisosTotales);
        // METODO PARA BUSCAR PERMISOS SOLICITADOS POR DIAS
        this.router.post('/permisos-solicitados', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.BuscarPermisosDias);
        // METODO PARA BUSCAR PERMISOS SOLICITADOS POR HORAS
        this.router.post('/permisos-solicitados-horas', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.BuscarPermisosHoras);
        // METODO PARA BUSCAR PERMISOS SOLICITADOS ACTUALIZAR
        this.router.post('/permisos-solicitados-totales-editar', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.BuscarPermisosTotalesEditar);
        // METODO PARA BUSCAR PERMISOS SOLICITADOS POR DIAS ACTUALIZAR
        this.router.post('/permisos-solicitados-editar', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.BuscarPermisosDiasEditar);
        // METODO PARA BUSCAR PERMISOS SOLICITADOS POR HORAS ACTUALIZAR
        this.router.post('/permisos-solicitados-horas-editar', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.BuscarPermisosHorasEditar);
        // CREAR PERMISO
        this.router.post('/', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.CrearPermisos);
        // ACTUALIZAR PERMISO
        this.router.put('/:id/permiso-solicitado', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.EditarPermiso);
        // GUARDAR DOCUMENTO DE RESPALDO DE PERMISO
        this.router.put('/:id/archivo/:archivo/validar/:codigo', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation, upload.single('uploads')], permisosControlador_1.default.GuardarDocumentoPermiso);
        // GUARDAR DOCUMENTO DE RESPALDO DE PERMISO APLICACION MOVIL
        this.router.put('/:id/archivo/:archivo/validar/:codigo', upload.single('uploads'), permisosControlador_1.default.GuardarDocumentoPermiso);
        // ELIMINAR DOCUMENTO
        this.router.put('/eliminar-documento', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.EliminarDocumentoPermiso);
        // BUSQUEDA DE PERMISOS POR ID DE EMPLEADO
        this.router.get('/permiso-usuario/:id_empleado', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.ObtenerPermisoEmpleado);
        // BUSCAR INFORMACION DE UN PERMISO
        this.router.get('/informe-un-permiso/:id_permiso', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.InformarUnPermiso);
        // ELIMINAR PERMISO
        this.router.delete('/eliminar/:id_permiso/:doc/verificar/:codigo', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.EliminarPermiso);
        // BUSQUEDA DE RESPALDOS DE PERMISOS
        this.router.get('/documentos/:docs/visualizar/:codigo', permisosControlador_1.default.ObtenerDocumentoPermiso);
        // ENVIAR CORREO MEDIANTE APLICACION WEB
        this.router.post('/mail-noti/', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.EnviarCorreoWeb);
        // ENVIAR CORREO EDICION MEDIANTE APLICACION WEB
        this.router.post('/mail-noti-editar/', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.EnviarCorreoWebEditar);
        // ENVIAR CORREO MEDIANTE APLICACION WEB SOLICITUDES MULTIPLES
        this.router.post('/mail-noti/solicitud-multiple', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.EnviarCorreoWebMultiple);
        this.router.get('/', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.ListarPermisos);
        this.router.get('/lista/', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.ListarEstadosPermisos);
        this.router.get('/lista-autorizados/', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.ListarPermisosAutorizados);
        this.router.get('/:id', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.ObtenerUnPermiso);
        this.router.get('/permiso/editar/:id', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.ObtenerPermisoEditar);
        this.router.get('/permisoContrato/:id_empl_contrato', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.ObtenerPermisoContrato);
        this.router.get('/datosSolicitud/:id_emple_permiso', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.ObtenerDatosSolicitud);
        this.router.get('/datosAutorizacion/:id_permiso', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.ObtenerDatosAutorizacion);
        this.router.post('/fechas_permiso/:codigo', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.ObtenerFechasPermiso);
        this.router.post('/permisos-solicitados/movil', permisosControlador_1.default.BuscarPermisosDias);
        /** ************************************************************************************************** **
         ** **                         METODOS PARA MANEJO DE PERMISOS                                      ** **
         ** ************************************************************************************************** **/
        // ACTUALIZAR ESTADO DEL PERMISO
        this.router.put('/:id/estado', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.ActualizarEstado);
        // BUSCAR INFORMACION DE UN PERMISO
        this.router.get('/un-permiso/:id_permiso', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.ListarUnPermisoInfo);
        // ELIMINAR DOCUMENTO DE PERMISO DESDE APLICACION MOVIL
        this.router.delete('/eliminar-movil/:documento/validar:codigo', permisosControlador_1.default.EliminarPermisoMovil);
        // ENVIAR CORREO MEDIANTE APLICACION MOVIL
        this.router.post('/mail-noti-permiso-movil/:id_empresa', permisosControlador_1.default.EnviarCorreoPermisoMovil);
        // ENVIAR CORREO EDICION MEDIANTE APLICACION MOVIL
        this.router.post('/mail-noti-permiso-editar-movil/:id_empresa', permisosControlador_1.default.EnviarCorreoPermisoEditarMovil);
    }
}
const PERMISOS_RUTAS = new PermisosRutas();
exports.default = PERMISOS_RUTAS.router;
