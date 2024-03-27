"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
// rutas importadas
const indexRutas_1 = __importDefault(require("./rutas/indexRutas"));
const catRolesRutas_1 = __importDefault(require("./rutas/catalogos/catRolesRutas"));
const empleadoRutas_1 = __importDefault(require("./rutas/empleado/empleadoRegistro/empleadoRutas"));
const loginRuta_1 = __importDefault(require("./rutas/login/loginRuta"));
const discapacidadRutas_1 = __importDefault(require("./rutas/empleado/empleadoDiscapacidad/discapacidadRutas"));
const catTituloRutas_1 = __importDefault(require("./rutas/catalogos/catTituloRutas"));
const catRegimenRuta_1 = __importDefault(require("./rutas/catalogos/catRegimenRuta"));
const catFeriadosRuta_1 = __importDefault(require("./rutas/catalogos/catFeriadosRuta"));
const catTipoComidasRuta_1 = __importDefault(require("./rutas/catalogos/catTipoComidasRuta"));
const catRelojesRuta_1 = __importDefault(require("./rutas/catalogos/catRelojesRuta"));
const catProvinciaRutas_1 = __importDefault(require("./rutas/catalogos/catProvinciaRutas"));
const catDepartamentoRutas_1 = __importDefault(require("./rutas/catalogos/catDepartamentoRutas"));
const catProcesoRutas_1 = __importDefault(require("./rutas/catalogos/catProcesoRutas"));
const catHorarioRutas_1 = __importDefault(require("./rutas/catalogos/catHorarioRutas"));
const catPlanificacionHorariaRutas_1 = __importDefault(require("./rutas/catalogos/catPlanificacionHorariaRutas"));
const usuarioRutas_1 = __importDefault(require("./rutas/usuarios/usuarioRutas"));
const catHorasExtrasRutas_1 = __importDefault(require("./rutas/catalogos/catHorasExtrasRutas"));
const catRolPermisosRutas_1 = __importDefault(require("./rutas/catalogos/catRolPermisosRutas"));
const catTipoPermisosRutas_1 = __importDefault(require("./rutas/catalogos/catTipoPermisosRutas"));
const ciudadesRutas_1 = __importDefault(require("./rutas/ciudades/ciudadesRutas"));
const ciudadFeriadoRutas_1 = __importDefault(require("./rutas/ciudadFeriado/ciudadFeriadoRutas"));
const contratoEmpleadoRutas_1 = __importDefault(require("./rutas/empleado/empleadoContrato/contratoEmpleadoRutas"));
const emplCargosRutas_1 = __importDefault(require("./rutas/empleado/empleadoCargos/emplCargosRutas"));
const planComidasRutas_1 = __importDefault(require("./rutas/planComidas/planComidasRutas"));
const catEmpresaRutas_1 = __importDefault(require("./rutas/catalogos/catEmpresaRutas"));
const sucursalRutas_1 = __importDefault(require("./rutas/sucursal/sucursalRutas"));
const nacionalidadRutas_1 = __importDefault(require("./rutas/nacionalidad/nacionalidadRutas"));
const nivelTituloRutas_1 = __importDefault(require("./rutas/nivelTitulo/nivelTituloRutas"));
const periodoVacacionRutas_1 = __importDefault(require("./rutas/empleado/empleadoPeriodoVacacion/periodoVacacionRutas"));
const vacacionesRutas_1 = __importDefault(require("./rutas/vacaciones/vacacionesRutas"));
const empleProcesosRutas_1 = __importDefault(require("./rutas/empleado/empleadoProcesos/empleProcesosRutas"));
const autorizaDepartamentoRutas_1 = __importDefault(require("./rutas/autorizaDepartamento/autorizaDepartamentoRutas"));
const empleadoHorariosRutas_1 = __importDefault(require("./rutas/horarios/empleadoHorarios/empleadoHorariosRutas"));
const permisosRutas_1 = __importDefault(require("./rutas/permisos/permisosRutas"));
const detalleCatHorarioRutas_1 = __importDefault(require("./rutas/horarios/detalleCatHorario/detalleCatHorarioRutas"));
const autorizacionesRutas_1 = __importDefault(require("./rutas/autorizaciones/autorizacionesRutas"));
const plantillaRutas_1 = __importDefault(require("./rutas/descargarPlantilla/plantillaRutas"));
const notificacionesRutas_1 = __importDefault(require("./rutas/notificaciones/notificacionesRutas"));
const documentosRutas_1 = __importDefault(require("./rutas/documentos/documentosRutas"));
const horaExtraRutas_1 = __importDefault(require("./rutas/horaExtra/horaExtraRutas"));
const birthdayRutas_1 = __importDefault(require("./rutas/birthday/birthdayRutas"));
const kardexVacacionesRutas_1 = __importDefault(require("./rutas/reportes/kardexVacacionesRutas"));
const asistenciaRutas_1 = __importDefault(require("./rutas/reportes/asistenciaRutas"));
const cargaMultipleRutas_1 = __importDefault(require("./rutas/cargaMultiple/cargaMultipleRutas"));
const reportesRutas_1 = __importDefault(require("./rutas/reportes/reportesRutas"));
const planHoraExtraRutas_1 = __importDefault(require("./rutas/planHoraExtra/planHoraExtraRutas"));
const datosGeneralesRutas_1 = __importDefault(require("./rutas/datosGenerales/datosGeneralesRutas"));
const timbresRutas_1 = __importDefault(require("./rutas/timbres/timbresRutas"));
const planGeneralRutas_1 = __importDefault(require("./rutas/planGeneral/planGeneralRutas"));
const reporteHoraExtraRutas_1 = __importDefault(require("./rutas/reportes/reporteHoraExtraRutas"));
const graficasRutas_1 = __importDefault(require("./rutas/graficas/graficasRutas"));
const alimentacionRutas_1 = __importDefault(require("./rutas/reportes/alimentacionRutas"));
const reportesAsistenciaRutas_1 = __importDefault(require("./rutas/reportes/reportesAsistenciaRutas"));
const funcionRutas_1 = __importDefault(require("./rutas/funciones/funcionRutas"));
const accionPersonalRutas_1 = __importDefault(require("./rutas/accionPersonal/accionPersonalRutas"));
const reportesNotificacionRutas_1 = __importDefault(require("./rutas/reportes/reportesNotificacionRutas"));
const licencias_1 = __importDefault(require("./utils/licencias"));
const reloj_virtual_1 = __importDefault(require("./utils/reloj_virtual"));
const vacunasRutas_1 = __importDefault(require("./rutas/empleado/empleadoVacuna/vacunasRutas"));
const reporteVacunasRutas_1 = __importDefault(require("./rutas/reportes/reporteVacunasRutas"));
const salidasAntesRutas_1 = __importDefault(require("./rutas/reportes/salidasAntesRutas"));
const reportesAtrasosRutas_1 = __importDefault(require("./rutas/reportes/reportesAtrasosRutas"));
const reportesTiempoLaboradoRutas_1 = __importDefault(require("./rutas/reportes/reportesTiempoLaboradoRutas"));
const reportesTimbresMrlRutas_1 = __importDefault(require("./rutas/reportes/reportesTimbresMrlRutas"));
const reportesFaltasRutas_1 = __importDefault(require("./rutas/reportes/reportesFaltasRutas"));
const auditoriaRutas_1 = __importDefault(require("./rutas/auditoria/auditoriaRutas"));
const solicitudVacacionesRutas_1 = __importDefault(require("./rutas/reportes/solicitudVacacionesRutas"));
const parametrosRutas_1 = __importDefault(require("./rutas/parametrosGenerales/parametrosRutas"));
const emplUbicacionRutas_1 = __importDefault(require("./rutas/empleado/empleadoUbicacion/emplUbicacionRutas"));
const http_1 = require("http");
var io;
class Servidor {
    constructor() {
        this.app = (0, express_1.default)();
        this.configuracion();
        this.rutas();
        // this.server = require("http").createServer();
        this.server = (0, http_1.createServer)(this.app);
        this.app.use((0, cors_1.default)());
        io = require('socket.io')(this.server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            }
        });
    }
    configuracion() {
        this.app.set('puerto', process.env.PORT || 3001);
        this.app.use((0, morgan_1.default)('dev'));
        this.app.use((0, cors_1.default)());
        //this.app.use(express.json());
        this.app.use(express_1.default.json({ limit: '50mb' }));
        this.app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
        this.app.use(express_1.default.raw({ type: 'image/*', limit: '2Mb' }));
        this.app.set('trust proxy', true);
        this.app.get('/', (req, res) => {
            res.status(200).json({
                status: 'success'
            });
        });
    }
    rutas() {
        this.app.use('/', indexRutas_1.default);
        this.app.use('/rol', catRolesRutas_1.default);
        this.app.use('/login', loginRuta_1.default);
        // PARÁMETROS GENERALES
        this.app.use('/parametrizacion', parametrosRutas_1.default);
        // COORDENADAS DE UBICACIONES
        this.app.use('/ubicacion', emplUbicacionRutas_1.default);
        // Empleado
        this.app.use('/empleado', empleadoRutas_1.default);
        this.app.use('/contratoEmpleado', contratoEmpleadoRutas_1.default);
        this.app.use('/empleadoCargos', emplCargosRutas_1.default);
        this.app.use('/perVacacion', periodoVacacionRutas_1.default);
        this.app.use('/vacaciones', vacacionesRutas_1.default);
        this.app.use('/horas-extras-pedidas', horaExtraRutas_1.default); // acceso controlado por ModuloHoraExtraValidation
        this.app.use('/empleadoProcesos', empleProcesosRutas_1.default);
        // Autorizaciones
        this.app.use('/autorizaDepartamento', autorizaDepartamentoRutas_1.default);
        // Permisos
        this.app.use('/empleadoPermiso', permisosRutas_1.default); // acceso controlado por ModuloPermisosValidation
        // Almuerzo
        this.app.use('/planComidas', planComidasRutas_1.default);
        // Horarios
        this.app.use('/empleadoHorario', empleadoHorariosRutas_1.default);
        this.app.use('/detalleHorario', detalleCatHorarioRutas_1.default);
        // Enrolados
        this.app.use('/relojes', catRelojesRuta_1.default);
        //Redireccionamiento a páginas que contienen catálogos
        this.app.use('/titulo', catTituloRutas_1.default);
        this.app.use('/discapacidad', discapacidadRutas_1.default);
        this.app.use('/empresas', catEmpresaRutas_1.default);
        this.app.use('/regimenLaboral', catRegimenRuta_1.default);
        this.app.use('/feriados', catFeriadosRuta_1.default);
        this.app.use('/tipoComidas', catTipoComidasRuta_1.default);
        this.app.use('/provincia', catProvinciaRutas_1.default);
        this.app.use('/departamento', catDepartamentoRutas_1.default);
        this.app.use('/proceso', catProcesoRutas_1.default);
        this.app.use('/horario', catHorarioRutas_1.default);
        this.app.use('/planificacionHoraria', catPlanificacionHorariaRutas_1.default);
        this.app.use('/usuarios', usuarioRutas_1.default);
        this.app.use('/horasExtras', catHorasExtrasRutas_1.default); // acceso controlado por ModuloHoraExtraValidation
        this.app.use('/rolPermisos', catRolPermisosRutas_1.default);
        this.app.use('/tipoPermisos', catTipoPermisosRutas_1.default);
        this.app.use('/ciudades', ciudadesRutas_1.default);
        this.app.use('/ciudadFeriados', ciudadFeriadoRutas_1.default);
        this.app.use('/sucursales', sucursalRutas_1.default);
        this.app.use('/nacionalidades', nacionalidadRutas_1.default);
        this.app.use('/nivel-titulo', nivelTituloRutas_1.default);
        this.app.use('/autorizaciones', autorizacionesRutas_1.default);
        this.app.use('/noti-real-time', notificacionesRutas_1.default);
        // Timbres
        this.app.use('/timbres', timbresRutas_1.default);
        this.app.use('/planificacion_general', planGeneralRutas_1.default);
        // Plantillas
        this.app.use('/plantillaD', plantillaRutas_1.default);
        // Documentos
        this.app.use('/archivosCargados', documentosRutas_1.default);
        // Mensaje de cumpleaños empresas
        this.app.use('/birthday', birthdayRutas_1.default);
        // Asistencia
        this.app.use('/asistencia', asistenciaRutas_1.default);
        // Reportes
        this.app.use('/reportes/vacacion', kardexVacacionesRutas_1.default);
        this.app.use('/reportes/hora-extra', reporteHoraExtraRutas_1.default); //acceso controlado por
        this.app.use('/reporte', reportesRutas_1.default);
        this.app.use('/reporte-faltas/', reportesFaltasRutas_1.default);
        this.app.use('/reportes-asistencias/', reportesAsistenciaRutas_1.default);
        this.app.use('/reporte-salidas-antes/', salidasAntesRutas_1.default);
        this.app.use('/reporte-atrasos/', reportesAtrasosRutas_1.default);
        this.app.use('/reporte-tiempo-laborado/', reportesTiempoLaboradoRutas_1.default);
        this.app.use('/reporte-timbres-mrl/', reportesTimbresMrlRutas_1.default);
        // REPORTES DE AUDITORIA
        this.app.use('/reportes-auditoria', auditoriaRutas_1.default);
        // REPORTE MÚLTIPLE DE VACUNAS
        this.app.use('/empleado-vacunas-multiples', reporteVacunasRutas_1.default);
        // REPORTE SOLICITUD DE VACACIONES
        this.app.use('/empleado-vacaciones-solicitudes', solicitudVacacionesRutas_1.default);
        // Modulo Alimentación
        this.app.use('/alimentacion', alimentacionRutas_1.default); // acceso controlado por ModuloAlimentacionValidation
        // HORAS EXTRAS
        this.app.use('/planificacionHoraExtra', planHoraExtraRutas_1.default); // acceso controlado por ModuloHoraExtraValidation
        // CARGA MULTIPLE
        this.app.use('/cargaMultiple', cargaMultipleRutas_1.default);
        // DATOS GENERALES QUE COMPARTEN VARIOS ARCHIVOS
        this.app.use('/generalidades', datosGeneralesRutas_1.default);
        // GRAFICAS PARA MOSTRAR EN EL HOME
        this.app.use('/metricas', graficasRutas_1.default);
        // FUNCIONES
        this.app.use('/administracion', funcionRutas_1.default);
        // ACCIONES DE PERSONAL
        this.app.use('/accionPersonal', accionPersonalRutas_1.default); // Falta ========== acceso controlado por ModuloAccionesPersonalValidation
        // LICENCIAS
        this.app.use('/licencias', licencias_1.default);
        // APP RELOJ VIRTUAL
        this.app.use('/reloj-virtual', reloj_virtual_1.default);
        // NOTIFICACIONES
        this.app.use('/notificacionSistema', reportesNotificacionRutas_1.default);
        // VACUNACIÓN
        this.app.use('/vacunas', vacunasRutas_1.default);
    }
    start() {
        this.server.listen(this.app.get('puerto'), () => {
            console.log('Servidor en el puerto', this.app.get('puerto'));
        });
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            next();
        });
        io.on('connection', (socket) => {
            console.log('Connected client on port %s.', this.app.get('puerto'));
            socket.on("nueva_notificacion", (data) => {
                let data_llega = {
                    id: data.id,
                    id_send_empl: data.id_send_empl,
                    id_receives_empl: data.id_receives_empl,
                    id_receives_depa: data.id_receives_depa,
                    estado: data.estado,
                    create_at: data.create_at,
                    id_permiso: data.id_permiso,
                    id_vacaciones: data.id_vacaciones,
                    id_hora_extra: data.id_hora_extra,
                    mensaje: data.mensaje,
                    tipo: data.tipo,
                    usuario: data.usuario
                };
                console.log('server', data_llega);
                socket.broadcast.emit('recibir_notificacion', data_llega);
                socket.emit('recibir_notificacion', data_llega);
            });
            socket.on("nuevo_aviso", (data) => {
                let data_llega = {
                    id: data.id,
                    create_at: data.create_at,
                    id_send_empl: data.id_send_empl,
                    id_receives_empl: data.id_receives_empl,
                    visto: data.visto,
                    descripcion: data.descripcion,
                    id_timbre: data.id_timbre,
                    tipo: data.tipo,
                    usuario: data.usuario
                };
                console.log('server aviso .......', data_llega);
                socket.broadcast.emit('recibir_aviso', data_llega);
                socket.emit('recibir_aviso', data_llega);
            });
        });
    }
}
const SERVIDOR = new Servidor();
SERVIDOR.start();
const sendBirthday_1 = require("./libs/sendBirthday");
const avisoVacaciones_1 = require("./libs/avisoVacaciones");
const ContarHoras_1 = require("./libs/ContarHoras");
const NotiTimbres_1 = require("./libs/NotiTimbres");
const SinTimbres_1 = require("./libs/SinTimbres");
const DesactivarEmpleado_1 = require("./libs/DesactivarEmpleado");
// LLAMA AL MEODO DE CUMPLEAÑOS
(0, sendBirthday_1.cumpleanios)();
// llama al metodo de avisos de vacaciones
(0, avisoVacaciones_1.beforeFiveDays)();
(0, avisoVacaciones_1.beforeTwoDays)();
// llama al metodo de verificacion para crear un nuevo perido de vacaciones si se acaba el anterior
(0, avisoVacaciones_1.Peri_Vacacion_Automatico)();
(0, ContarHoras_1.RegistrarAsistenciaByTimbres)();
// ----------// conteoPermisos();
(0, NotiTimbres_1.NotificacionTimbreAutomatica)();
(0, SinTimbres_1.NotificacionSinTimbres)();
(0, DesactivarEmpleado_1.DesactivarFinContratoEmpleado)();
//generarTimbres('35', '2023-11-01', '2023-11-02');
