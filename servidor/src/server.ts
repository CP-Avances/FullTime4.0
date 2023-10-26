require('dotenv').config();
import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';

// rutas importadas
import indexRutas from './rutas/indexRutas';
import ROLES_RUTAS from './rutas/catalogos/catRolesRutas';
import EMPLEADO_RUTAS from './rutas/empleado/empleadoRegistro/empleadoRutas';
import LOGIN_RUTA from './rutas/login/loginRuta';
import DISCAPACIDAD_RUTAS from './rutas/empleado/empleadoDiscapacidad/discapacidadRutas';
import TITULO_RUTAS from './rutas/catalogos/catTituloRutas';
import REGIMEN_RUTA from './rutas/catalogos/catRegimenRuta';
import FERIADOS_RUTA from './rutas/catalogos/catFeriadosRuta';
import TIPO_COMIDAS_RUTA from './rutas/catalogos/catTipoComidasRuta';
import RELOJES_RUTA from './rutas/catalogos/catRelojesRuta';
import PROVINCIA_RUTA from './rutas/catalogos/catProvinciaRutas';
import DEPARTAMENTO_RUTA from './rutas/catalogos/catDepartamentoRutas';
import PROCESO_RUTA from './rutas/catalogos/catProcesoRutas';
import HORARIO_RUTA from './rutas/catalogos/catHorarioRutas';
import USUARIO_RUTA from './rutas/usuarios/usuarioRutas';
import HORAS_EXTRAS_RUTAS from './rutas/catalogos/catHorasExtrasRutas';
import ROL_PERMISOS_RUTAS from './rutas/catalogos/catRolPermisosRutas';
import TIPO_PERMISOS_RUTAS from './rutas/catalogos/catTipoPermisosRutas';
import CIUDAD_RUTAS from './rutas/ciudades/ciudadesRutas';
import CIUDAD_FERIADOS_RUTAS from './rutas/ciudadFeriado/ciudadFeriadoRutas';
import CONTRATO_EMPLEADO_RUTAS from './rutas/empleado/empleadoContrato/contratoEmpleadoRutas';
import EMPLEADO_CARGO_RUTAS from './rutas/empleado/empleadoCargos/emplCargosRutas';
import PLAN_COMIDAS_RUTAS from './rutas/planComidas/planComidasRutas';
import EMPRESA_RUTAS from './rutas/catalogos/catEmpresaRutas';
import SUCURSAL_RUTAS from './rutas/sucursal/sucursalRutas';
import NACIONALIDADES_RUTAS from './rutas/nacionalidad/nacionalidadRutas';
import NIVEL_TITULO_RUTAS from './rutas/nivelTitulo/nivelTituloRutas';
import PERIODO_VACACION__RUTAS from './rutas/empleado/empleadoPeriodoVacacion/periodoVacacionRutas';
import VACACIONES__RUTAS from './rutas/vacaciones/vacacionesRutas';
import EMPLEADO_PROCESO_RUTAS from './rutas/empleado/empleadoProcesos/empleProcesosRutas';
import AUTORIZA_DEPARTAMENTO_RUTAS from './rutas/autorizaDepartamento/autorizaDepartamentoRutas';
import EMPLEADO_HORARIOS_RUTAS from './rutas/horarios/empleadoHorarios/empleadoHorariosRutas';
import PERMISOS_RUTAS from './rutas/permisos/permisosRutas';
import DETALLE_CATALOGO_HORARIO_RUTAS from './rutas/horarios/detalleCatHorario/detalleCatHorarioRutas';
import AUTORIZACIONES_RUTAS from './rutas/autorizaciones/autorizacionesRutas';
import PLANTILLA_RUTAS from './rutas/descargarPlantilla/plantillaRutas';
import NOTIFICACION_TIEMPO_REAL_RUTAS from './rutas/notificaciones/notificacionesRutas';
import DOCUMENTOS_RUTAS from './rutas/documentos/documentosRutas';
import HORA_EXTRA_PEDIDA_RUTAS from './rutas/horaExtra/horaExtraRutas';
import BIRTHDAY_RUTAS from './rutas/birthday/birthdayRutas';
import KARDEX_VACACION_RUTAS from './rutas/reportes/kardexVacacionesRutas';
import ASISTENCIA_RUTAS from './rutas/reportes/asistenciaRutas';
import CARGA_MULTIPLE_RUTAS from './rutas/cargaMultiple/cargaMultipleRutas';
import REPORTES_RUTAS from './rutas/reportes/reportesRutas';
import PLAN_HORAS_EXTRAS_RUTAS from './rutas/planHoraExtra/planHoraExtraRutas';
import DATOS_GENERALES_RUTAS from './rutas/datosGenerales/datosGeneralesRutas';
import TIMBRES_RUTAS from './rutas/timbres/timbresRutas';
import PLAN_GENERAL_RUTAS from './rutas/planGeneral/planGeneralRutas';
import REPORTE_HORA_EXTRA_RUTAS from './rutas/reportes/reporteHoraExtraRutas';
import GRAFICAS_RUTAS from './rutas/graficas/graficasRutas';
import ALIMENTACION_RUTAS from './rutas/reportes/alimentacionRutas';
import REPORTES_A_RUTAS from './rutas/reportes/reportesAsistenciaRutas';
import FUNCIONES_RUTAS from './rutas/funciones/funcionRutas';
import ACCION_PERSONAL_RUTAS from './rutas/accionPersonal/accionPersonalRutas';
import NOTIFICACION_RUTAS from './rutas/reportes/reportesNotificacionRutas';
import LICENCIAS_RUTAS from './utils/licencias';
import RELOJ_VIRTUAL_RUTAS from './utils/reloj_virtual';
import VACUNA_RUTAS from './rutas/empleado/empleadoVacuna/vacunasRutas';
import VACUNAS_REPORTE_RUTAS from './rutas/reportes/reporteVacunasRutas';
import SALIDAS_ANTICIPADAS_RUTAS from './rutas/reportes/salidasAntesRutas';
import REPORTES_ATRASOS_RUTAS from './rutas/reportes/reportesAtrasosRutas';
import AUDITORIA_RUTAS from './rutas/auditoria/auditoriaRutas';
import VACACIONES_REPORTES_RUTAS from './rutas/reportes/solicitudVacacionesRutas';
import PARAMETROS_RUTAS from './rutas/parametrosGenerales/parametrosRutas';
import UBICACION_RUTAS from './rutas/empleado/empleadoUbicacion/emplUbicacionRutas';
import ASISTENCIA_USUARIOS_RUTAS from './rutas/asistencia/asistenciaRutas';

import { createServer, Server } from 'http';

var io: any;

class Servidor {

    public app: Application;
    public server: Server;

    constructor() {
        this.app = express();
        this.configuracion();
        this.rutas();
        //this.server = require("http").createServer(this.app);
        this.server = createServer(this.app);
        this.app.use(cors());
        io = require('socket.io')(this.server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            }
        });

    }
    configuracion(): void {
        this.app.set('puerto', process.env.PORT || 3001);
        this.app.use(morgan('dev'));
        this.app.use(cors());
        //this.app.use(express.json());
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ limit: '50mb', extended: true }));
        this.app.use(express.raw({ type: 'image/*', limit: '2Mb' }));
        this.app.set('trust proxy', true);
        this.app.get('/', (req, res) => {
            res.status(200).json({
                status: 'success'
            });
        });
    }

    rutas(): void {
        this.app.use('/', indexRutas);
        this.app.use('/rol', ROLES_RUTAS);
        this.app.use('/login', LOGIN_RUTA);

        // PARÁMETROS GENERALES
        this.app.use('/parametrizacion', PARAMETROS_RUTAS);

        // COORDENADAS DE UBICACIONES
        this.app.use('/ubicacion', UBICACION_RUTAS);

        // Empleado
        this.app.use('/empleado', EMPLEADO_RUTAS);
        this.app.use('/contratoEmpleado', CONTRATO_EMPLEADO_RUTAS);
        this.app.use('/empleadoCargos', EMPLEADO_CARGO_RUTAS);
        this.app.use('/perVacacion', PERIODO_VACACION__RUTAS);
        this.app.use('/vacaciones', VACACIONES__RUTAS);
        this.app.use('/horas-extras-pedidas', HORA_EXTRA_PEDIDA_RUTAS); // acceso controlado por ModuloHoraExtraValidation
        this.app.use('/empleadoProcesos', EMPLEADO_PROCESO_RUTAS);

        // Autorizaciones
        this.app.use('/autorizaDepartamento', AUTORIZA_DEPARTAMENTO_RUTAS);

        // Permisos
        this.app.use('/empleadoPermiso', PERMISOS_RUTAS); // acceso controlado por ModuloPermisosValidation

        // Almuerzo
        this.app.use('/planComidas', PLAN_COMIDAS_RUTAS);

        // Horarios
        this.app.use('/empleadoHorario', EMPLEADO_HORARIOS_RUTAS);
        this.app.use('/detalleHorario', DETALLE_CATALOGO_HORARIO_RUTAS);

        // ASISTENCIA
        this.app.use('/asistencia-usuarios', ASISTENCIA_USUARIOS_RUTAS);

        // Enrolados
        this.app.use('/relojes', RELOJES_RUTA);

        //Redireccionamiento a páginas que contienen catálogos
        this.app.use('/titulo', TITULO_RUTAS);
        this.app.use('/discapacidad', DISCAPACIDAD_RUTAS);
        this.app.use('/empresas', EMPRESA_RUTAS);
        this.app.use('/regimenLaboral', REGIMEN_RUTA);
        this.app.use('/feriados', FERIADOS_RUTA);
        this.app.use('/tipoComidas', TIPO_COMIDAS_RUTA);
        this.app.use('/provincia', PROVINCIA_RUTA);
        this.app.use('/departamento', DEPARTAMENTO_RUTA);
        this.app.use('/proceso', PROCESO_RUTA);
        this.app.use('/horario', HORARIO_RUTA);
        this.app.use('/usuarios', USUARIO_RUTA);
        this.app.use('/horasExtras', HORAS_EXTRAS_RUTAS); // acceso controlado por ModuloHoraExtraValidation
        this.app.use('/rolPermisos', ROL_PERMISOS_RUTAS);
        this.app.use('/tipoPermisos', TIPO_PERMISOS_RUTAS);
        this.app.use('/ciudades', CIUDAD_RUTAS);
        this.app.use('/ciudadFeriados', CIUDAD_FERIADOS_RUTAS);
        this.app.use('/sucursales', SUCURSAL_RUTAS);
        this.app.use('/nacionalidades', NACIONALIDADES_RUTAS);
        this.app.use('/nivel-titulo', NIVEL_TITULO_RUTAS);
        this.app.use('/autorizaciones', AUTORIZACIONES_RUTAS);
        this.app.use('/noti-real-time', NOTIFICACION_TIEMPO_REAL_RUTAS);

        // Timbres
        this.app.use('/timbres', TIMBRES_RUTAS);
        this.app.use('/planificacion_general', PLAN_GENERAL_RUTAS);

        // Plantillas
        this.app.use('/plantillaD', PLANTILLA_RUTAS);

        // Documentos
        this.app.use('/archivosCargados', DOCUMENTOS_RUTAS);

        // Mensaje de cumpleaños empresas
        this.app.use('/birthday', BIRTHDAY_RUTAS);

        // Asistencia
        this.app.use('/asistencia', ASISTENCIA_RUTAS);

        // Reportes
        this.app.use('/reportes/vacacion', KARDEX_VACACION_RUTAS);
        this.app.use('/reportes/hora-extra', REPORTE_HORA_EXTRA_RUTAS); //acceso controlado por
        this.app.use('/reporte', REPORTES_RUTAS);
        this.app.use('/reportes-asistencias/', REPORTES_A_RUTAS);
        this.app.use('/reporte-salidas-antes/', SALIDAS_ANTICIPADAS_RUTAS);
        this.app.use('/reporte-atrasos/', REPORTES_ATRASOS_RUTAS);

        // REPORTES DE AUDITORIA
        this.app.use('/reportes-auditoria', AUDITORIA_RUTAS);

        // REPORTE MÚLTIPLE DE VACUNAS
        this.app.use('/empleado-vacunas-multiples', VACUNAS_REPORTE_RUTAS);

        // REPORTE SOLICITUD DE VACACIONES
        this.app.use('/empleado-vacaciones-solicitudes', VACACIONES_REPORTES_RUTAS);

        // Modulo Alimentación
        this.app.use('/alimentacion', ALIMENTACION_RUTAS); // acceso controlado por ModuloAlimentacionValidation

        // HORAS EXTRAS
        this.app.use('/planificacionHoraExtra', PLAN_HORAS_EXTRAS_RUTAS); // acceso controlado por ModuloHoraExtraValidation

        // CARGA MULTIPLE
        this.app.use('/cargaMultiple', CARGA_MULTIPLE_RUTAS);

        // DATOS GENERALES QUE COMPARTEN VARIOS ARCHIVOS
        this.app.use('/generalidades', DATOS_GENERALES_RUTAS);

        // GRAFICAS PARA MOSTRAR EN EL HOME
        this.app.use('/metricas', GRAFICAS_RUTAS);

        // FUNCIONES
        this.app.use('/administracion', FUNCIONES_RUTAS);

        // ACCIONES DE PERSONAL
        this.app.use('/accionPersonal', ACCION_PERSONAL_RUTAS); // Falta ========== acceso controlado por ModuloAccionesPersonalValidation

        // LICENCIAS
        this.app.use('/licencias', LICENCIAS_RUTAS);

        // APP RELOJ VIRTUAL
        this.app.use('/reloj-virtual', RELOJ_VIRTUAL_RUTAS);

        // NOTIFICACIONES
        this.app.use('/notificacionSistema', NOTIFICACION_RUTAS);

        // VACUNACIÓN
        this.app.use('/vacunas', VACUNA_RUTAS)

    }

    start(): void {

        this.server.listen(this.app.get('puerto'), () => {
            console.log('Servidor en el puerto', this.app.get('puerto'));

        });

        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            next();
        })
        io.on('connection', (socket: any) => {
            console.log('Connected client on port %s.', this.app.get('puerto'));

            socket.on("nueva_notificacion", (data: any) => {
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
                }
                console.log('server', data_llega);
                socket.broadcast.emit('recibir_notificacion', data_llega);
                socket.emit('recibir_notificacion', data_llega);
            });

            socket.on("nuevo_aviso", (data: any) => {
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
                }
                console.log('server aviso .......', data_llega);
                socket.broadcast.emit('recibir_aviso', data_llega);
                socket.emit('recibir_aviso', data_llega);
            });
        });

    }
}

const SERVIDOR = new Servidor();
SERVIDOR.start();

import { cumpleanios } from './libs/sendBirthday';

import { beforeFiveDays, beforeTwoDays, Peri_Vacacion_Automatico } from './libs/avisoVacaciones';
import { RegistrarAsistenciaByTimbres } from './libs/ContarHoras';
import { NotificacionTimbreAutomatica } from './libs/NotiTimbres'
import { NotificacionSinTimbres } from './libs/SinTimbres'
import { DesactivarFinContratoEmpleado } from './libs/DesactivarEmpleado'

// LLAMA AL MEODO DE CUMPLEAÑOS
cumpleanios();



// llama al metodo de avisos de vacaciones
beforeFiveDays();
beforeTwoDays();
// llama al metodo de verificacion para crear un nuevo perido de vacaciones si se acaba el anterior
Peri_Vacacion_Automatico();

RegistrarAsistenciaByTimbres();

// ----------// conteoPermisos();

NotificacionTimbreAutomatica();

NotificacionSinTimbres();

DesactivarFinContratoEmpleado();