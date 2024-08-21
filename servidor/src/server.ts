require('dotenv').config();
import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';

// RUTAS IMPORTADAS
import indexRutas from './rutas/indexRutas';

// EMPRESA
import PROVINCIA_RUTA from './rutas/catalogos/catProvinciaRutas';
import CIUDAD_RUTAS from './rutas/ciudades/ciudadesRutas';
import EMPRESA_RUTAS from './rutas/catalogos/catEmpresaRutas';
import BIRTHDAY_RUTAS from './rutas/birthday/birthdayRutas';
import DOCUMENTOS_RUTAS from './rutas/documentos/documentosRutas';
import PARAMETROS_RUTAS from './rutas/parametrosGenerales/parametrosRutas';
import ROLES_RUTAS from './rutas/catalogos/catRolesRutas';
import ROL_PERMISOS_RUTAS from './rutas/catalogos/catRolPermisosRutas';
import FERIADOS_RUTA from './rutas/catalogos/catFeriadosRuta';
import CIUDAD_FERIADOS_RUTAS from './rutas/ciudadFeriado/ciudadFeriadoRutas';
import REGIMEN_RUTA from './rutas/catalogos/catRegimenRuta';
import SUCURSAL_RUTAS from './rutas/sucursal/sucursalRutas';
import DEPARTAMENTO_RUTA from './rutas/catalogos/catDepartamentoRutas';
import AUTORIZA_DEPARTAMENTO_RUTAS from './rutas/autorizaDepartamento/autorizaDepartamentoRutas';
import RELOJES_RUTA from './rutas/catalogos/catRelojesRuta';
import MODALIDAD_LABORAL_RUTAS from './rutas/catalogos/catModalidadLaboralRutas';
import TIPO_CARGOS_RUTAS from './rutas/catalogos/catTiposCargosRutas';
import NACIONALIDADES_RUTAS from './rutas/nacionalidad/nacionalidadRutas';
import NIVEL_TITULO_RUTAS from './rutas/nivelTitulo/nivelTituloRutas';
import TITULO_RUTAS from './rutas/catalogos/catTituloRutas';
import TIPO_VACUNAS_RUTAS from './rutas/catalogos/catVacunasRutas';
import DISCAPACIDADES_RUTAS from './rutas/catalogos/catDiscapacidadRutas';
import HORARIO_RUTA from './rutas/catalogos/catHorarioRutas';
import DETALLE_CATALOGO_HORARIO_RUTAS from './rutas/horarios/detalleCatHorario/detalleCatHorarioRutas';
import PLANIFICACION_HORARIA_RUTAS from './rutas/catalogos/catPlanificacionHorariaRutas';

//EMPLEADOS
import LOGIN_RUTA from './rutas/login/loginRuta';
import EMPLEADO_RUTAS from './rutas/empleado/empleadoRegistro/empleadoRutas';
import USUARIO_RUTA from './rutas/usuarios/usuarioRutas';
import DISCAPACIDAD_RUTAS from './rutas/empleado/empleadoDiscapacidad/discapacidadRutas';
import VACUNA_RUTAS from './rutas/empleado/empleadoVacuna/vacunasRutas';
import CONTRATO_EMPLEADO_RUTAS from './rutas/empleado/empleadoContrato/contratoEmpleadoRutas';
import EMPLEADO_CARGO_RUTAS from './rutas/empleado/empleadoCargos/emplCargosRutas';
import EMPLEADO_HORARIOS_RUTAS from './rutas/horarios/empleadoHorarios/empleadoHorariosRutas';
import PLAN_GENERAL_RUTAS from './rutas/planGeneral/planGeneralRutas';
import TIMBRES_RUTAS from './rutas/timbres/timbresRutas';
import PLANTILLA_RUTAS from './rutas/descargarPlantilla/plantillaRutas';
import DATOS_GENERALES_RUTAS from './rutas/datosGenerales/datosGeneralesRutas';
import GRAFICAS_RUTAS from './rutas/graficas/graficasRutas';
import LICENCIAS_RUTAS from './utils/licencias';
import FUNCIONES_RUTAS from './rutas/funciones/funcionRutas';
// CON MODULOS
import NOTIFICACION_TIEMPO_REAL_RUTAS from './rutas/notificaciones/notificacionesRutas';
import AUTORIZACIONES_RUTAS from './rutas/autorizaciones/autorizacionesRutas';
// MODULO PERMISO
import TIPO_PERMISOS_RUTAS from './rutas/catalogos/catTipoPermisosRutas';
import PERMISOS_RUTAS from './rutas/permisos/permisosRutas';
// MODULO VACACIONES
import PERIODO_VACACION__RUTAS from './rutas/empleado/empleadoPeriodoVacacion/periodoVacacionRutas';
import VACACIONES__RUTAS from './rutas/vacaciones/vacacionesRutas';
import KARDEX_VACACION_RUTAS from './rutas/reportes/kardexVacacionesRutas';
// MODULO HORAS EXTRA
import HORAS_EXTRAS_RUTAS from './rutas/catalogos/catHorasExtrasRutas';
import HORA_EXTRA_PEDIDA_RUTAS from './rutas/horaExtra/horaExtraRutas';
import PLAN_HORAS_EXTRAS_RUTAS from './rutas/planHoraExtra/planHoraExtraRutas';
// MODULO ALIMENTACION
import TIPO_COMIDAS_RUTA from './rutas/catalogos/catTipoComidasRuta';
import PLAN_COMIDAS_RUTAS from './rutas/planComidas/planComidasRutas';
import ALIMENTACION_RUTAS from './rutas/reportes/alimentacionRutas';
// MODULO ACCIONES DE PERSONAL
import PROCESO_RUTA from './rutas/catalogos/catProcesoRutas';
import EMPLEADO_PROCESO_RUTAS from './rutas/empleado/empleadoProcesos/empleProcesosRutas';
import ACCION_PERSONAL_RUTAS from './rutas/accionPersonal/accionPersonalRutas';
// MODULO GEOLOCALIZACION
import UBICACION_RUTAS from './rutas/empleado/empleadoUbicacion/emplUbicacionRutas';
// MODULO RELOJ VIRTUAL
import RELOJ_VIRTUAL_RUTAS from './utils/reloj_virtual';
// REPORTES
import ASISTENCIA_RUTAS from './rutas/reportes/asistenciaRutas';
import REPORTES_RUTAS from './rutas/reportes/reportesRutas';
import REPORTES_A_RUTAS from './rutas/reportes/reportesAsistenciaRutas';
import VACUNAS_REPORTE_RUTAS from './rutas/reportes/reporteVacunasRutas';
import FALTAS_RUTAS from './rutas/reportes/reportesFaltasRutas';
import REPORTES_ATRASOS_RUTAS from './rutas/reportes/reportesAtrasosRutas';
import REPORTES_TIEMPO_LABORADO_RUTAS from './rutas/reportes/reportesTiempoLaboradoRutas';
import SALIDAS_ANTICIPADAS_RUTAS from './rutas/reportes/salidasAntesRutas';
import REPORTES_TIMBRES_MRL_RUTAS from './rutas/reportes/reportesTimbresMrlRutas';
import NOTIFICACION_RUTAS from './rutas/reportes/reportesNotificacionRutas';
import AUDITORIA_RUTAS from './rutas/auditoria/auditoriaRutas';
import VACACIONES_REPORTES_RUTAS from './rutas/reportes/solicitudVacacionesRutas';
import REPORTE_HORA_EXTRA_RUTAS from './rutas/reportes/reporteHoraExtraRutas';

import { createServer, Server } from 'http';

var io: any;

class Servidor {

    public app: Application;
    public server: Server;

    constructor() {
        this.app = express();
        this.app.use(cors());
        this.configuracion();
        this.rutas();
        this.server = createServer(this.app);
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
        this.app.use('/server', indexRutas);
        this.app.use('/server/login', LOGIN_RUTA);

        // EMPRESA
        this.app.use('/server/parametrizacion', PARAMETROS_RUTAS);
        this.app.use('/server/empresas', EMPRESA_RUTAS);
        this.app.use('/server/provincia', PROVINCIA_RUTA);
        this.app.use('/server/ciudades', CIUDAD_RUTAS);
        this.app.use('/server/nacionalidades', NACIONALIDADES_RUTAS);
        this.app.use('/server/sucursales', SUCURSAL_RUTAS);
        this.app.use('/server/feriados', FERIADOS_RUTA);
        this.app.use('/server/ciudadFeriados', CIUDAD_FERIADOS_RUTAS);
        this.app.use('/server/regimenLaboral', REGIMEN_RUTA);
        this.app.use('/server/departamento', DEPARTAMENTO_RUTA);
        this.app.use('/server/autorizaDepartamento', AUTORIZA_DEPARTAMENTO_RUTAS);
        this.app.use('/server/nivel-titulo', NIVEL_TITULO_RUTAS);
        this.app.use('/server/titulo', TITULO_RUTAS);
        this.app.use('/server/horario', HORARIO_RUTA);
        this.app.use('/server/detalleHorario', DETALLE_CATALOGO_HORARIO_RUTAS);
        this.app.use('/server/planificacionHoraria', PLANIFICACION_HORARIA_RUTAS);
        this.app.use('/server/rol', ROLES_RUTAS);
        this.app.use('/server/rolPermisos', ROL_PERMISOS_RUTAS);
        this.app.use('/server/relojes', RELOJES_RUTA);
        this.app.use('/server/modalidadLaboral', MODALIDAD_LABORAL_RUTAS);
        this.app.use('/server/tipoCargos', TIPO_CARGOS_RUTAS);
        this.app.use('/server/discapacidades', DISCAPACIDADES_RUTAS);
        this.app.use('/server/vacunasTipos', TIPO_VACUNAS_RUTAS);
        this.app.use('/server/archivosCargados', DOCUMENTOS_RUTAS);
        this.app.use('/server/birthday', BIRTHDAY_RUTAS);
        // EMPLEADOS
        this.app.use('/server/empleado', EMPLEADO_RUTAS);
        this.app.use('/server/usuarios', USUARIO_RUTA);
        this.app.use('/server/discapacidad', DISCAPACIDAD_RUTAS);
        this.app.use('/server/contratoEmpleado', CONTRATO_EMPLEADO_RUTAS);
        this.app.use('/server/empleadoCargos', EMPLEADO_CARGO_RUTAS);
        this.app.use('/server/empleadoHorario', EMPLEADO_HORARIOS_RUTAS);
        this.app.use('/server/vacunas', VACUNA_RUTAS);
        this.app.use('/server/timbres', TIMBRES_RUTAS);
        this.app.use('/server/planificacion_general', PLAN_GENERAL_RUTAS);
        this.app.use('/server/plantillaD', PLANTILLA_RUTAS);
        this.app.use('/server/generalidades', DATOS_GENERALES_RUTAS);
        this.app.use('/server/notificacionSistema', NOTIFICACION_RUTAS);
        this.app.use('/server/metricas', GRAFICAS_RUTAS);
        // CON MODULOS
        this.app.use('/server/autorizaciones', AUTORIZACIONES_RUTAS);
        this.app.use('/server/noti-real-time', NOTIFICACION_TIEMPO_REAL_RUTAS);
        // MODULO PERMISOS
        this.app.use('/server/empleadoPermiso', PERMISOS_RUTAS);
        this.app.use('/server/tipoPermisos', TIPO_PERMISOS_RUTAS);
        // MODULO VACACIONES
        this.app.use('/server/perVacacion', PERIODO_VACACION__RUTAS);
        this.app.use('/server/vacaciones', VACACIONES__RUTAS);
        // MODULO HORAS EXTRAS
        this.app.use('/server/horas-extras-pedidas', HORA_EXTRA_PEDIDA_RUTAS);
        this.app.use('/server/horasExtras', HORAS_EXTRAS_RUTAS);
        this.app.use('/server/planificacionHoraExtra', PLAN_HORAS_EXTRAS_RUTAS);
        // MODULO GEOLOCALIZACION
        this.app.use('/server/ubicacion', UBICACION_RUTAS);
        // MODULO ACCIONES DE PERSONAL
        this.app.use('/server/proceso', PROCESO_RUTA);
        this.app.use('/server/empleadoProcesos', EMPLEADO_PROCESO_RUTAS);
        this.app.use('/server/accionPersonal', ACCION_PERSONAL_RUTAS);
        // MODULO ALIMENTACION
        this.app.use('/server/tipoComidas', TIPO_COMIDAS_RUTA);
        this.app.use('/server/planComidas', PLAN_COMIDAS_RUTAS);
        this.app.use('/server/alimentacion', ALIMENTACION_RUTAS);
        // MODULO RELOJ VIRTUAL
        this.app.use('/server/reloj-virtual', RELOJ_VIRTUAL_RUTAS);
        // REPORTES
        this.app.use('/server/asistencia', ASISTENCIA_RUTAS);
        this.app.use('/server/reportes/vacacion', KARDEX_VACACION_RUTAS);
        this.app.use('/server/reportes/hora-extra', REPORTE_HORA_EXTRA_RUTAS);
        this.app.use('/server/reporte', REPORTES_RUTAS);
        this.app.use('/server/reporte-faltas/', FALTAS_RUTAS);
        this.app.use('/server/reportes-asistencias/', REPORTES_A_RUTAS);
        this.app.use('/server/reporte-salidas-antes/', SALIDAS_ANTICIPADAS_RUTAS);
        this.app.use('/server/reporte-atrasos/', REPORTES_ATRASOS_RUTAS);
        this.app.use('/server/reporte-tiempo-laborado/', REPORTES_TIEMPO_LABORADO_RUTAS);
        this.app.use('/server/reporte-timbres-mrl/', REPORTES_TIMBRES_MRL_RUTAS);
        this.app.use('/server/reportes-auditoria', AUDITORIA_RUTAS);
        this.app.use('/server/empleado-vacunas-multiples', VACUNAS_REPORTE_RUTAS);
        this.app.use('/server/empleado-vacaciones-solicitudes', VACACIONES_REPORTES_RUTAS);
        // FUNCIONES
        this.app.use('/server/administracion', FUNCIONES_RUTAS);
        // LICENCIAS
        this.app.use('/server/licencias', LICENCIAS_RUTAS);
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
            console.log('Conexion con el socket ', this.app.get('puerto'));
            socket.on("nueva_notificacion", (data: any) => {
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
                }
                console.log('server', data_llega);
                socket.broadcast.emit('recibir_notificacion', data_llega);
                socket.emit('recibir_notificacion', data_llega);
            });

            socket.on("nuevo_aviso", (data: any) => {
                console.log('ver aviso .......', data);
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

import { DesactivarFinContratoEmpleado } from './libs/DesactivarEmpleado'

// LLAMA AL MEODO DE CUMPLEAÑOS
cumpleanios();

// LLAMA AL METODO DE AVISOS DE VACACIONES
beforeFiveDays();
beforeTwoDays();

// LLAMA AL METODO DE VERIFICACION PARA CREAR UN NUEVO PERIDO DE VACACIONES SI SE ACABA EL ANTERIOR
Peri_Vacacion_Automatico();

RegistrarAsistenciaByTimbres();

// ----------// conteoPermisos();

DesactivarFinContratoEmpleado();

//generarTimbres('1', '2023-11-01', '2023-11-02');