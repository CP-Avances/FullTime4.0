"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
// RUTAS IMPORTADAS
const indexRutas_1 = __importDefault(require("./rutas/indexRutas"));
// EMPRESA
const catProvinciaRutas_1 = __importDefault(require("./rutas/configuracion/localizacion/catProvinciaRutas"));
const ciudadesRutas_1 = __importDefault(require("./rutas/configuracion/localizacion/ciudadesRutas"));
const catEmpresaRutas_1 = __importDefault(require("./rutas/configuracion/parametrizacion/catEmpresaRutas"));
const birthdayRutas_1 = __importDefault(require("./rutas/notificaciones/birthdayRutas"));
const documentosRutas_1 = __importDefault(require("./rutas/documentos/documentosRutas"));
const parametrosRutas_1 = __importDefault(require("./rutas/configuracion/parametrizacion/parametrosRutas"));
const catRolesRutas_1 = __importDefault(require("./rutas/configuracion/parametrizacion/catRolesRutas"));
const catRolPermisosRutas_1 = __importDefault(require("./rutas/configuracion/parametrizacion/catRolPermisosRutas"));
const catFeriadosRuta_1 = __importDefault(require("./rutas/horarios/catFeriadosRuta"));
const ciudadFeriadoRutas_1 = __importDefault(require("./rutas/horarios/ciudadFeriadoRutas"));
const catRegimenRuta_1 = __importDefault(require("./rutas/configuracion/parametrizacion/catRegimenRuta"));
const sucursalRutas_1 = __importDefault(require("./rutas/configuracion/localizacion/sucursalRutas"));
const catDepartamentoRutas_1 = __importDefault(require("./rutas/configuracion/localizacion/catDepartamentoRutas"));
const autorizaDepartamentoRutas_1 = __importDefault(require("./rutas/configuracion/localizacion/autorizaDepartamentoRutas"));
const catRelojesRuta_1 = __importDefault(require("./rutas/timbres/catRelojesRuta"));
const catModalidadLaboralRutas_1 = __importDefault(require("./rutas/configuracion/parametrizacion/catModalidadLaboralRutas"));
const catTiposCargosRutas_1 = __importDefault(require("./rutas/configuracion/parametrizacion/catTiposCargosRutas"));
const nacionalidadRutas_1 = __importDefault(require("./rutas/empleado/empleadoRegistro/nacionalidadRutas"));
const nivelTituloRutas_1 = __importDefault(require("./rutas/empleado/nivelTitulo/nivelTituloRutas"));
const catTituloRutas_1 = __importDefault(require("./rutas/empleado/nivelTitulo/catTituloRutas"));
const catVacunasRutas_1 = __importDefault(require("./rutas/empleado/empleadoVacuna/catVacunasRutas"));
const catDiscapacidadRutas_1 = __importDefault(require("./rutas/empleado/empleadoDiscapacidad/catDiscapacidadRutas"));
const catHorarioRutas_1 = __importDefault(require("./rutas/horarios/catHorarioRutas"));
const detalleCatHorarioRutas_1 = __importDefault(require("./rutas/horarios/detalleCatHorarioRutas"));
const catPlanificacionHorariaRutas_1 = __importDefault(require("./rutas/horarios/catPlanificacionHorariaRutas"));
//EMPLEADOS
const loginRuta_1 = __importDefault(require("./rutas/login/loginRuta"));
const empleadoRutas_1 = __importDefault(require("./rutas/empleado/empleadoRegistro/empleadoRutas"));
const usuarioRutas_1 = __importDefault(require("./rutas/empleado/usuarios/usuarioRutas"));
const discapacidadRutas_1 = __importDefault(require("./rutas/empleado/empleadoDiscapacidad/discapacidadRutas"));
const vacunasRutas_1 = __importDefault(require("./rutas/empleado/empleadoVacuna/vacunasRutas"));
const contratoEmpleadoRutas_1 = __importDefault(require("./rutas/empleado/empleadoContrato/contratoEmpleadoRutas"));
const emplCargosRutas_1 = __importDefault(require("./rutas/empleado/empleadoCargos/emplCargosRutas"));
const empleadoHorariosRutas_1 = __importDefault(require("./rutas/horarios/empleadoHorariosRutas"));
const planGeneralRutas_1 = __importDefault(require("./rutas/horarios/planGeneralRutas"));
const timbresRutas_1 = __importDefault(require("./rutas/timbres/timbresRutas"));
const plantillaRutas_1 = __importDefault(require("./rutas/documentos/plantillaRutas"));
const datosGeneralesRutas_1 = __importDefault(require("./rutas/datosGenerales/datosGeneralesRutas"));
const graficasRutas_1 = __importDefault(require("./rutas/graficas/graficasRutas"));
const licencias_1 = __importDefault(require("./utils/licencias"));
const funcionRutas_1 = __importDefault(require("./rutas/funciones/funcionRutas"));
// CON MODULOS
const notificacionesRutas_1 = __importDefault(require("./rutas/notificaciones/notificacionesRutas"));
const autorizacionesRutas_1 = __importDefault(require("./rutas/autorizaciones/autorizacionesRutas"));
// MODULO PERMISO
const catTipoPermisosRutas_1 = __importDefault(require("./rutas/modulos/permisos/catTipoPermisosRutas"));
const permisosRutas_1 = __importDefault(require("./rutas/modulos/permisos/permisosRutas"));
// MODULO VACACIONES
const periodoVacacionRutas_1 = __importDefault(require("./rutas/modulos/vacaciones/periodoVacacionRutas"));
const vacacionesRutas_1 = __importDefault(require("./rutas/modulos/vacaciones/vacacionesRutas"));
const kardexVacacionesRutas_1 = __importDefault(require("./rutas/reportes/kardexVacacionesRutas"));
// MODULO HORAS EXTRA
const catHorasExtrasRutas_1 = __importDefault(require("./rutas/modulos/horas-extras/catHorasExtrasRutas"));
const horaExtraRutas_1 = __importDefault(require("./rutas/modulos/horas-extras/horaExtraRutas"));
const planHoraExtraRutas_1 = __importDefault(require("./rutas/modulos/horas-extras/planHoraExtraRutas"));
// MODULO ALIMENTACION
const catTipoComidasRuta_1 = __importDefault(require("./rutas/modulos/alimentacion/catTipoComidasRuta"));
const planComidasRutas_1 = __importDefault(require("./rutas/modulos/alimentacion/planComidasRutas"));
const alimentacionRutas_1 = __importDefault(require("./rutas/reportes/alimentacionRutas"));
// MODULO ACCIONES DE PERSONAL
const catProcesoRutas_1 = __importDefault(require("./rutas/modulos/acciones-personal/catProcesoRutas"));
const empleProcesosRutas_1 = __importDefault(require("./rutas/modulos/acciones-personal/empleProcesosRutas"));
const accionPersonalRutas_1 = __importDefault(require("./rutas/modulos/acciones-personal/accionPersonalRutas"));
// MODULO GEOLOCALIZACION
const emplUbicacionRutas_1 = __importDefault(require("./rutas/modulos/geolocalizacion/emplUbicacionRutas"));
// MODULO RELOJ VIRTUAL
const reloj_virtual_1 = __importDefault(require("./utils/reloj_virtual"));
// REPORTES
const asistenciaRutas_1 = __importDefault(require("./rutas/reportes/asistenciaRutas"));
const reportesRutas_1 = __importDefault(require("./rutas/reportes/reportesRutas"));
const reportesAsistenciaRutas_1 = __importDefault(require("./rutas/reportes/reportesAsistenciaRutas"));
const reporteVacunasRutas_1 = __importDefault(require("./rutas/reportes/reporteVacunasRutas"));
const reportesFaltasRutas_1 = __importDefault(require("./rutas/reportes/reportesFaltasRutas"));
const reportesAtrasosRutas_1 = __importDefault(require("./rutas/reportes/reportesAtrasosRutas"));
const reportesTiempoLaboradoRutas_1 = __importDefault(require("./rutas/reportes/reportesTiempoLaboradoRutas"));
const salidasAntesRutas_1 = __importDefault(require("./rutas/reportes/salidasAntesRutas"));
const reportesTimbresMrlRutas_1 = __importDefault(require("./rutas/reportes/reportesTimbresMrlRutas"));
const reportesNotificacionRutas_1 = __importDefault(require("./rutas/reportes/reportesNotificacionRutas"));
const auditoriaRutas_1 = __importDefault(require("./rutas/reportes/auditoriaRutas"));
const solicitudVacacionesRutas_1 = __importDefault(require("./rutas/reportes/solicitudVacacionesRutas"));
const reporteHoraExtraRutas_1 = __importDefault(require("./rutas/reportes/reporteHoraExtraRutas"));
const http_1 = require("http");
var io;
class Servidor {
    constructor() {
        this.app = (0, express_1.default)();
        this.app.use((0, cors_1.default)());
        this.configuracion();
        this.rutas();
        this.server = (0, http_1.createServer)(this.app);
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
        const ruta = 'server';
        this.app.use(`/${ruta}`, indexRutas_1.default);
        this.app.use(`/${ruta}/login`, loginRuta_1.default);
        // EMPRESA
        this.app.use(`/${ruta}/parametrizacion`, parametrosRutas_1.default);
        this.app.use(`/${ruta}/empresas`, catEmpresaRutas_1.default);
        this.app.use(`/${ruta}/provincia`, catProvinciaRutas_1.default);
        this.app.use(`/${ruta}/ciudades`, ciudadesRutas_1.default);
        this.app.use(`/${ruta}/nacionalidades`, nacionalidadRutas_1.default);
        this.app.use(`/${ruta}/sucursales`, sucursalRutas_1.default);
        this.app.use(`/${ruta}/feriados`, catFeriadosRuta_1.default);
        this.app.use(`/${ruta}/ciudadFeriados`, ciudadFeriadoRutas_1.default);
        this.app.use(`/${ruta}/regimenLaboral`, catRegimenRuta_1.default);
        this.app.use(`/${ruta}/departamento`, catDepartamentoRutas_1.default);
        this.app.use(`/${ruta}/autorizaDepartamento`, autorizaDepartamentoRutas_1.default);
        this.app.use(`/${ruta}/nivel-titulo`, nivelTituloRutas_1.default);
        this.app.use(`/${ruta}/titulo`, catTituloRutas_1.default);
        this.app.use(`/${ruta}/horario`, catHorarioRutas_1.default);
        this.app.use(`/${ruta}/detalleHorario`, detalleCatHorarioRutas_1.default);
        this.app.use(`/${ruta}/planificacionHoraria`, catPlanificacionHorariaRutas_1.default);
        this.app.use(`/${ruta}/rol`, catRolesRutas_1.default);
        this.app.use(`/${ruta}/rolPermisos`, catRolPermisosRutas_1.default);
        this.app.use(`/${ruta}/relojes`, catRelojesRuta_1.default);
        this.app.use(`/${ruta}/modalidadLaboral`, catModalidadLaboralRutas_1.default);
        this.app.use(`/${ruta}/tipoCargos`, catTiposCargosRutas_1.default);
        this.app.use(`/${ruta}/discapacidades`, catDiscapacidadRutas_1.default);
        this.app.use(`/${ruta}/vacunasTipos`, catVacunasRutas_1.default);
        this.app.use(`/${ruta}/archivosCargados`, documentosRutas_1.default);
        this.app.use(`/${ruta}/birthday`, birthdayRutas_1.default);
        // EMPLEADOS
        this.app.use(`/${ruta}/empleado`, empleadoRutas_1.default);
        this.app.use(`/${ruta}/usuarios`, usuarioRutas_1.default);
        this.app.use(`/${ruta}/discapacidad`, discapacidadRutas_1.default);
        this.app.use(`/${ruta}/contratoEmpleado`, contratoEmpleadoRutas_1.default);
        this.app.use(`/${ruta}/empleadoCargos`, emplCargosRutas_1.default);
        this.app.use(`/${ruta}/empleadoHorario`, empleadoHorariosRutas_1.default);
        this.app.use(`/${ruta}/vacunas`, vacunasRutas_1.default);
        this.app.use(`/${ruta}/timbres`, timbresRutas_1.default);
        this.app.use(`/${ruta}/planificacion_general`, planGeneralRutas_1.default);
        this.app.use(`/${ruta}/plantillaD`, plantillaRutas_1.default);
        this.app.use(`/${ruta}/generalidades`, datosGeneralesRutas_1.default);
        this.app.use(`/${ruta}/notificacionSistema`, reportesNotificacionRutas_1.default);
        this.app.use(`/${ruta}/metricas`, graficasRutas_1.default);
        // CON MODULOS
        this.app.use(`/${ruta}/autorizaciones`, autorizacionesRutas_1.default);
        this.app.use(`/${ruta}/noti-real-time`, notificacionesRutas_1.default);
        // MODULO PERMISOS
        this.app.use(`/${ruta}/empleadoPermiso`, permisosRutas_1.default);
        this.app.use(`/${ruta}/tipoPermisos`, catTipoPermisosRutas_1.default);
        // MODULO VACACIONES
        this.app.use(`/${ruta}/perVacacion`, periodoVacacionRutas_1.default);
        this.app.use(`/${ruta}/vacaciones`, vacacionesRutas_1.default);
        // MODULO HORAS EXTRAS
        this.app.use(`/${ruta}/horas-extras-pedidas`, horaExtraRutas_1.default);
        this.app.use(`/${ruta}/horasExtras`, catHorasExtrasRutas_1.default);
        this.app.use(`/${ruta}/planificacionHoraExtra`, planHoraExtraRutas_1.default);
        // MODULO GEOLOCALIZACION
        this.app.use(`/${ruta}/ubicacion`, emplUbicacionRutas_1.default);
        // MODULO ACCIONES DE PERSONAL
        this.app.use(`/${ruta}/proceso`, catProcesoRutas_1.default);
        this.app.use(`/${ruta}/empleadoProcesos`, empleProcesosRutas_1.default);
        this.app.use(`/${ruta}/accionPersonal`, accionPersonalRutas_1.default);
        // MODULO ALIMENTACION
        this.app.use(`/${ruta}/tipoComidas`, catTipoComidasRuta_1.default);
        this.app.use(`/${ruta}/planComidas`, planComidasRutas_1.default);
        this.app.use(`/${ruta}/alimentacion`, alimentacionRutas_1.default);
        // MODULO RELOJ VIRTUAL
        this.app.use(`/${ruta}/reloj-virtual`, reloj_virtual_1.default);
        // REPORTES
        this.app.use(`/${ruta}/asistencia`, asistenciaRutas_1.default);
        this.app.use(`/${ruta}/reportes/vacacion`, kardexVacacionesRutas_1.default);
        this.app.use(`/${ruta}/reportes/hora-extra`, reporteHoraExtraRutas_1.default);
        this.app.use(`/${ruta}/reporte`, reportesRutas_1.default);
        this.app.use(`/${ruta}/reporte-faltas/`, reportesFaltasRutas_1.default);
        this.app.use(`/${ruta}/reportes-asistencias/`, reportesAsistenciaRutas_1.default);
        this.app.use(`/${ruta}/reporte-salidas-antes/`, salidasAntesRutas_1.default);
        this.app.use(`/${ruta}/reporte-atrasos/`, reportesAtrasosRutas_1.default);
        this.app.use(`/${ruta}/reporte-tiempo-laborado/`, reportesTiempoLaboradoRutas_1.default);
        this.app.use(`/${ruta}/reporte-timbres-mrl/`, reportesTimbresMrlRutas_1.default);
        this.app.use(`/${ruta}/reportes-auditoria`, auditoriaRutas_1.default);
        this.app.use(`/${ruta}/empleado-vacunas-multiples`, reporteVacunasRutas_1.default);
        this.app.use(`/${ruta}/empleado-vacaciones-solicitudes`, solicitudVacacionesRutas_1.default);
        // FUNCIONES
        this.app.use(`/${ruta}/administracion`, funcionRutas_1.default);
        // LICENCIAS
        this.app.use(`/${ruta}/licencias`, licencias_1.default);
    }
    start() {
        this.app.set('trust proxy', true);
        this.server.listen(this.app.get('puerto'), () => {
            console.log('Servidor en el puerto', this.app.get('puerto'));
        });
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            next();
        });
        io.on('connection', (socket) => {
            console.log('Conexion con el socket ', this.app.get('puerto'));
            socket.on("nueva_notificacion", (data) => {
                let data_llega = {
                    id: data.id,
                    id_send_empl: data.id_empleado_envia,
                    id_receives_empl: data.id_empleado_recibe,
                    id_receives_depa: data.id_departamento_recibe,
                    estado: data.estado,
                    create_at: data.fecha_hora,
                    id_permiso: data.id_permiso,
                    id_vacaciones: data.id_vacaciones,
                    id_hora_extra: data.id_hora_extra,
                    mensaje: data.mensaje,
                    tipo: data.tipo,
                    usuario: data.usuario
                };
                //console.log('server', data_llega);
                socket.broadcast.emit('recibir_notificacion', data_llega);
                socket.emit('recibir_notificacion', data_llega);
            });
            socket.on("nuevo_aviso", (data) => {
                let data_llega = {
                    id: data.id,
                    create_at: data.fecha_hora,
                    id_send_empl: data.id_empleado_envia,
                    id_receives_empl: data.id_empleado_recibe,
                    visto: data.visto,
                    descripcion: data.descripcion,
                    mensaje: data.mensaje,
                    id_timbre: data.id_timbre,
                    tipo: data.tipo,
                    usuario: data.usuario
                };
                socket.broadcast.emit('recibir_aviso', data_llega);
                socket.emit('recibir_aviso', data_llega);
            });
        });
    }
}
const SERVIDOR = new Servidor();
SERVIDOR.start();
const sendBirthday_1 = require("./libs/sendBirthday");
const DesactivarEmpleado_1 = require("./libs/DesactivarEmpleado");
const sendAtraso_1 = require("./libs/sendAtraso");
const sendAtrasoDepartamento_1 = require("./libs/sendAtrasoDepartamento");
/** **************************************************************************************************** **
 ** **             TAREAS QUE SE EJECUTAN CONTINUAMENTE - PROCESOS AUTOMATICOS                        ** **
 ** **************************************************************************************************** **/
// METODO PARA INACTIVAR USUARIOS AL FIN DE SU CONTRATO
(0, DesactivarEmpleado_1.DesactivarFinContratoEmpleado)();
(0, sendAtraso_1.atrasos)();
(0, sendAtrasoDepartamento_1.atrasosDepartamentos)();
// LLAMA AL MEODO DE CUMPLEAÑOS
(0, sendBirthday_1.cumpleanios)();
// LLAMA AL METODO DE AVISOS DE VACACIONES
//beforeFiveDays();
//beforeTwoDays();
// LLAMA AL METODO DE VERIFICACION PARA CREAR UN NUEVO PERIDO DE VACACIONES SI SE ACABA EL ANTERIOR
//Peri_Vacacion_Automatico();
//RegistrarAsistenciaByTimbres();
// ----------// conteoPermisos();
//generarTimbres('1', '2023-11-01', '2023-11-02');
