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
const express_1 = require("express");
const verificarToken_1 = require("../../../libs/verificarToken");
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
const vacacionesControlador_1 = __importDefault(require("../../../controlador/modulos/vacaciones/vacacionesControlador"));
const multer_1 = __importDefault(require("multer"));
const luxon_1 = require("luxon");
const database_1 = __importDefault(require("../../../database"));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = req.params.id_empleado;
            var ruta = yield (0, accesoCarpetas_1.ObtenerRutaVacacion)(id);
            cb(null, ruta);
        });
    },
    filename: function (req, file, cb) {
        return __awaiter(this, void 0, void 0, function* () {
            // FECHA DEL SISTEMA
            var fecha = luxon_1.DateTime.now();
            var anio = fecha.toFormat('yyyy');
            var mes = fecha.toFormat('MM');
            var dia = fecha.toFormat('dd');
            // DATOS DOCUMENTO
            let id = req.params.id_empleado;
            const usuario = yield database_1.default.query(`
            SELECT codigo FROM eu_empleados WHERE id = $1
            `, [id]);
            let documento = usuario.rows[0].codigo + '_' + anio + '_' + mes + '_' + dia + '_' + file.originalname;
            cb(null, documento);
        });
    }
});
const upload = (0, multer_1.default)({ storage: storage });
class VacacionesRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        //this.router.get('/', TokenValidation, VACACIONES_CONTROLADOR.ListarVacaciones);
        //METODO PARA LISTAR VACACIONES CONFIGURADAS
        this.router.get('/lista-todas-configuraciones', verificarToken_1.TokenValidation, vacacionesControlador_1.default.ListarVacacionesConfiguradas);
        //this.router.get('/estado-solicitud', TokenValidation, VACACIONES_CONTROLADOR.ListarVacacionesAutorizadas);
        // METODO PARA BUSCAR VACACIONES POR ID DE PERIODO   **USADO
        this.router.get('/:id', verificarToken_1.TokenValidation, vacacionesControlador_1.default.VacacionesIdPeriodo);
        //this.router.post('/fechasFeriado', TokenValidation, VACACIONES_CONTROLADOR.ObtenerFechasFeriado);
        this.router.get('/datosSolicitud/:id_empleado', verificarToken_1.TokenValidation, vacacionesControlador_1.default.ObtenerSolicitudVacaciones);
        this.router.get('/datosAutorizacion/:id_vacaciones', verificarToken_1.TokenValidation, vacacionesControlador_1.default.ObtenerAutorizacionVacaciones);
        this.router.get('/lista-vacacionesfechas/fechas/', verificarToken_1.TokenValidation, vacacionesControlador_1.default.getlistaVacacionesByFechasyCodigo);
        //METODO PARA CONSULTAR DATO DE INCLUUIR FERIADO
        //this.router.get('/datosConfiguracion/:id_configuracion', TokenValidation, VACACIONES_CONTROLADOR.ObtenerParametroIncluirVacacion);
        /** ************************************************************************************************* **
         ** **                          METODOS PARA MANEJO DE VACACIONES                                  ** **
         ** ************************************************************************************************* **/
        // CREAR REGISTRO DE VACACIONES
        this.router.post('/', verificarToken_1.TokenValidation, vacacionesControlador_1.default.CrearVacaciones);
        // EDITAR REGISTRO DE VACACIONES
        this.router.put('/vacacion-solicitada/:id', verificarToken_1.TokenValidation, vacacionesControlador_1.default.EditarSolicitudVacaciones);
        //this.router.put('/:id/vacacion-solicitada', TokenValidation, VACACIONES_CONTROLADOR.EditarVacaciones);
        // BUSQUEDA DE VACACIONES MEDIANTE ID
        //this.router.get('/listar/vacacion/:id', TokenValidation, VACACIONES_CONTROLADOR.ListarVacacionId);
        // ELIMINAR SOLICITUD DE VACACIONES
        this.router.delete('/eliminar/:id_vacacion', verificarToken_1.TokenValidation, vacacionesControlador_1.default.EliminarVacaciones);
        // EDITAR ESTADO DE VACACIONES
        this.router.put('/:id/estado', verificarToken_1.TokenValidation, vacacionesControlador_1.default.ActualizarEstado);
        // BUSCAR DATOS DE VACACIONES POR ID DE VACACION
        //this.router.get('/one/:id', TokenValidation, VACACIONES_CONTROLADOR.ListarUnaVacacion);
        //METODO PARA VERIFICAR VACACIONES MULTIPLES
        this.router.post('/verificar-empleados', verificarToken_1.TokenValidation, vacacionesControlador_1.default.VerificarVacacionesMultiples);
        //METODO PARA BUSCAR SOLICITUD EXISTENTE
        this.router.get('/verificar-solicitud/:id_empleado/:fecha_inicio/:fecha_final', verificarToken_1.TokenValidation, vacacionesControlador_1.default.VerificarExistenciaSolicitud);
        // MÉTODO PARA GUARDAR DOCUMENTO EN VACACIONES
        this.router.put('/:id/documento/:id_empleado', [verificarToken_1.TokenValidation, upload.single('uploads')], vacacionesControlador_1.default.GuardarDocumento);
        /** ************************************************************************************************* **
         ** **                        METODO DE ENVIO DE NOTIFICACIONES                                    ** **
         ** ************************************************************************************************* **/
        // ENVIO DE CORREO DE VACACIONES DESDE APLICACIONES WEB
        this.router.post('/mail-noti/', verificarToken_1.TokenValidation, vacacionesControlador_1.default.EnviarCorreoVacacion);
        // ENVIO DE CORREO DE VACACIONES DESDE APLICACION MOVIL
        this.router.post('/mail-noti-vacacion-movil/:id_empresa', vacacionesControlador_1.default.EnviarCorreoVacacionesMovil);
    }
}
const VACACIONES_RUTAS = new VacacionesRutas();
exports.default = VACACIONES_RUTAS.router;
