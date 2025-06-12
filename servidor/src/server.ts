require('dotenv').config();
import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';

// RUTAS IMPORTADAS
import indexRutas from './rutas/indexRutas';

// EMPRESA
import PROVINCIA_RUTA from './rutas/configuracion/localizacion/catProvinciaRutas';
import CIUDAD_RUTAS from './rutas/configuracion/localizacion/ciudadesRutas';
import EMPRESA_RUTAS from './rutas/configuracion/parametrizacion/catEmpresaRutas';
import MENSAJES_NOTIFICACIONES_RUTAS from './rutas/notificaciones/mensajesNotificacionesRutas';
import DOCUMENTOS_RUTAS from './rutas/documentos/documentosRutas';
import PARAMETROS_RUTAS from './rutas/configuracion/parametrizacion/parametrosRutas';
import ROLES_RUTAS from './rutas/configuracion/parametrizacion/catRolesRutas';
import ROL_PERMISOS_RUTAS from './rutas/configuracion/parametrizacion/catRolPermisosRutas';
import FERIADOS_RUTA from './rutas/horarios/catFeriadosRuta';
import CIUDAD_FERIADOS_RUTAS from './rutas/horarios/ciudadFeriadoRutas';
import REGIMEN_RUTA from './rutas/configuracion/parametrizacion/catRegimenRuta';
import SUCURSAL_RUTAS from './rutas/configuracion/localizacion/sucursalRutas';
import DEPARTAMENTO_RUTA from './rutas/configuracion/localizacion/catDepartamentoRutas';
import AUTORIZA_DEPARTAMENTO_RUTAS from './rutas/configuracion/localizacion/autorizaDepartamentoRutas';
import RELOJES_RUTA from './rutas/timbres/catRelojesRuta';
import MODALIDAD_LABORAL_RUTAS from './rutas/configuracion/parametrizacion/catModalidadLaboralRutas';
import TIPO_CARGOS_RUTAS from './rutas/configuracion/parametrizacion/catTiposCargosRutas';
import NACIONALIDADES_RUTAS from './rutas/empleado/empleadoRegistro/nacionalidadRutas';
import NIVEL_TITULO_RUTAS from './rutas/empleado/nivelTitulo/nivelTituloRutas';
import TITULO_RUTAS from './rutas/empleado/nivelTitulo/catTituloRutas';
import TIPO_VACUNAS_RUTAS from './rutas/empleado/empleadoVacuna/catVacunasRutas';
import DISCAPACIDADES_RUTAS from './rutas/empleado/empleadoDiscapacidad/catDiscapacidadRutas';
import HORARIO_RUTA from './rutas/horarios/catHorarioRutas';
import DETALLE_CATALOGO_HORARIO_RUTAS from './rutas/horarios/detalleCatHorarioRutas';
import PLANIFICACION_HORARIA_RUTAS from './rutas/horarios/catPlanificacionHorariaRutas';

//EMPLEADOS
import LOGIN_RUTA from './rutas/login/loginRuta';
import EMPLEADO_RUTAS from './rutas/empleado/empleadoRegistro/empleadoRutas';
import USUARIO_RUTA from './rutas/empleado/usuarios/usuarioRutas';
import DISCAPACIDAD_RUTAS from './rutas/empleado/empleadoDiscapacidad/discapacidadRutas';
import VACUNA_RUTAS from './rutas/empleado/empleadoVacuna/vacunasRutas';
import CONTRATO_EMPLEADO_RUTAS from './rutas/empleado/empleadoContrato/contratoEmpleadoRutas';
import EMPLEADO_CARGO_RUTAS from './rutas/empleado/empleadoCargos/emplCargosRutas';
import EMPLEADO_HORARIOS_RUTAS from './rutas/horarios/empleadoHorariosRutas';
import PLAN_GENERAL_RUTAS from './rutas/horarios/planGeneralRutas';
import TIMBRES_RUTAS from './rutas/timbres/timbresRutas';
import PLANTILLA_RUTAS from './rutas/documentos/plantillaRutas';
import DATOS_GENERALES_RUTAS from './rutas/datosGenerales/datosGeneralesRutas';
import GRAFICAS_RUTAS from './rutas/graficas/graficasRutas';
import LICENCIAS_RUTAS from './utils/licencias';
import GENERO_RUTAS from './rutas/empleado/generos/catGeneroRutas'
import ESTADO_CIVIL_RUTAS from './rutas/empleado/estadoCivil/catEstadoCivilRutas'
// CON MODULOS
import NOTIFICACION_TIEMPO_REAL_RUTAS from './rutas/notificaciones/notificacionesRutas';
import AUTORIZACIONES_RUTAS from './rutas/autorizaciones/autorizacionesRutas';
// MODULO PERMISO
import TIPO_PERMISOS_RUTAS from './rutas/modulos/permisos/catTipoPermisosRutas';
import PERMISOS_RUTAS from './rutas/modulos/permisos/permisosRutas';
// MODULO VACACIONES
import PERIODO_VACACION__RUTAS from './rutas/modulos/vacaciones/periodoVacacionRutas';
import VACACIONES__RUTAS from './rutas/modulos/vacaciones/vacacionesRutas';
import KARDEX_VACACION_RUTAS from './rutas/reportes/kardexVacacionesRutas';
// MODULO HORAS EXTRA
import HORAS_EXTRAS_RUTAS from './rutas/modulos/horas-extras/catHorasExtrasRutas';
import HORA_EXTRA_PEDIDA_RUTAS from './rutas/modulos/horas-extras/horaExtraRutas';
import PLAN_HORAS_EXTRAS_RUTAS from './rutas/modulos/horas-extras/planHoraExtraRutas';
// MODULO ALIMENTACION
import TIPO_COMIDAS_RUTA from './rutas/modulos/alimentacion/catTipoComidasRuta';
import PLAN_COMIDAS_RUTAS from './rutas/modulos/alimentacion/planComidasRutas';
import ALIMENTACION_RUTAS from './rutas/reportes/alimentacionRutas';
// MODULO ACCIONES DE PERSONAL
import PROCESO_RUTA from './rutas/modulos/acciones-personal/catProcesoRutas';
import EMPLEADO_PROCESO_RUTAS from './rutas/modulos/acciones-personal/empleProcesosRutas';
import ACCION_PERSONAL_RUTAS from './rutas/modulos/acciones-personal/accionPersonalRutas';
import GRADO_RUTAS from './rutas/modulos/acciones-personal/gradoRutas';
import GRUPO_OCUPACIONAL_RUTAS from './rutas/modulos/acciones-personal/grupoOcupacional';

// MODULO GEOLOCALIZACION
import UBICACION_RUTAS from './rutas/modulos/geolocalizacion/emplUbicacionRutas';
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
import AUDITORIA_RUTAS from './rutas/reportes/auditoriaRutas';
import VACACIONES_REPORTES_RUTAS from './rutas/reportes/solicitudVacacionesRutas';
import REPORTE_HORA_EXTRA_RUTAS from './rutas/reportes/reporteHoraExtraRutas';

import { createServer, Server } from 'http';
import { Server as SocketIOServer } from 'socket.io';

//var io: any;
class Servidor {

    public app: Application;
    public server: Server;
    public io: SocketIOServer;

    constructor() {
        this.app = express();
        this.app.use(cors());
        this.configuracion();
        this.rutas();
        this.server = createServer(this.app);
        /*
        this.io = require('socket.io')(this.server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            }
        });
*/
        this.io = new SocketIOServer(this.server, {
            cors: {
                origin: '*', // Permitir todas las conexiones (ajustar según necesidades)
                methods: ['GET', 'POST'],
            },
        });
        this.io.on('connection', (socket: any) => {
            console.log('Cliente conectado:', socket.id);

            socket.on("connect_error", (err: any) => {
                console.log("Error de conexión:", err.message);
            });

            // Verifica la conexión
            socket.on('disconnect', () => {
                console.log('Cliente desconectado:', socket.id);
            });
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
        const ruta: any = 'server';

        this.app.use(`/${ruta}`, indexRutas);
        this.app.use(`/${ruta}/login`, LOGIN_RUTA);

        // EMPRESA
        this.app.use(`/${ruta}/parametrizacion`, PARAMETROS_RUTAS);
        this.app.use(`/${ruta}/empresas`, EMPRESA_RUTAS);
        this.app.use(`/${ruta}/provincia`, PROVINCIA_RUTA);
        this.app.use(`/${ruta}/ciudades`, CIUDAD_RUTAS);
        this.app.use(`/${ruta}/nacionalidades`, NACIONALIDADES_RUTAS);
        this.app.use(`/${ruta}/sucursales`, SUCURSAL_RUTAS);
        this.app.use(`/${ruta}/feriados`, FERIADOS_RUTA);
        this.app.use(`/${ruta}/ciudadFeriados`, CIUDAD_FERIADOS_RUTAS);
        this.app.use(`/${ruta}/regimenLaboral`, REGIMEN_RUTA);
        this.app.use(`/${ruta}/departamento`, DEPARTAMENTO_RUTA);
        this.app.use(`/${ruta}/autorizaDepartamento`, AUTORIZA_DEPARTAMENTO_RUTAS);
        this.app.use(`/${ruta}/nivel-titulo`, NIVEL_TITULO_RUTAS);
        this.app.use(`/${ruta}/titulo`, TITULO_RUTAS);
        this.app.use(`/${ruta}/horario`, HORARIO_RUTA);
        this.app.use(`/${ruta}/detalleHorario`, DETALLE_CATALOGO_HORARIO_RUTAS);
        this.app.use(`/${ruta}/planificacionHoraria`, PLANIFICACION_HORARIA_RUTAS);
        this.app.use(`/${ruta}/rol`, ROLES_RUTAS);
        this.app.use(`/${ruta}/rolPermisos`, ROL_PERMISOS_RUTAS);
        this.app.use(`/${ruta}/relojes`, RELOJES_RUTA);
        this.app.use(`/${ruta}/modalidadLaboral`, MODALIDAD_LABORAL_RUTAS);
        this.app.use(`/${ruta}/tipoCargos`, TIPO_CARGOS_RUTAS);
        this.app.use(`/${ruta}/discapacidades`, DISCAPACIDADES_RUTAS);
        this.app.use(`/${ruta}/vacunasTipos`, TIPO_VACUNAS_RUTAS);
        this.app.use(`/${ruta}/archivosCargados`, DOCUMENTOS_RUTAS);
        this.app.use(`/${ruta}/mensajes_notificaciones`, MENSAJES_NOTIFICACIONES_RUTAS);
        // EMPLEADOS
        this.app.use(`/${ruta}/empleado`, EMPLEADO_RUTAS);
        this.app.use(`/${ruta}/usuarios`, USUARIO_RUTA);
        this.app.use(`/${ruta}/discapacidad`, DISCAPACIDAD_RUTAS);
        this.app.use(`/${ruta}/contratoEmpleado`, CONTRATO_EMPLEADO_RUTAS);
        this.app.use(`/${ruta}/empleadoCargos`, EMPLEADO_CARGO_RUTAS);
        this.app.use(`/${ruta}/empleadoHorario`, EMPLEADO_HORARIOS_RUTAS);
        this.app.use(`/${ruta}/vacunas`, VACUNA_RUTAS);
        this.app.use(`/${ruta}/timbres`, TIMBRES_RUTAS);
        this.app.use(`/${ruta}/planificacion_general`, PLAN_GENERAL_RUTAS);
        this.app.use(`/${ruta}/plantillaD`, PLANTILLA_RUTAS);
        this.app.use(`/${ruta}/generalidades`, DATOS_GENERALES_RUTAS);
        this.app.use(`/${ruta}/notificacionSistema`, NOTIFICACION_RUTAS);
        this.app.use(`/${ruta}/metricas`, GRAFICAS_RUTAS);
        this.app.use(`/${ruta}/generos`, GENERO_RUTAS);
        this.app.use(`/${ruta}/estado-civil`, ESTADO_CIVIL_RUTAS);

        // CON MODULOS
        this.app.use(`/${ruta}/autorizaciones`, AUTORIZACIONES_RUTAS);
        this.app.use(`/${ruta}/noti-real-time`, NOTIFICACION_TIEMPO_REAL_RUTAS);
        // MODULO PERMISOS
        this.app.use(`/${ruta}/empleadoPermiso`, PERMISOS_RUTAS);
        this.app.use(`/${ruta}/tipoPermisos`, TIPO_PERMISOS_RUTAS);
        // MODULO VACACIONES
        this.app.use(`/${ruta}/perVacacion`, PERIODO_VACACION__RUTAS);
        this.app.use(`/${ruta}/vacaciones`, VACACIONES__RUTAS);
        // MODULO HORAS EXTRAS
        this.app.use(`/${ruta}/horas-extras-pedidas`, HORA_EXTRA_PEDIDA_RUTAS);
        this.app.use(`/${ruta}/horasExtras`, HORAS_EXTRAS_RUTAS);
        this.app.use(`/${ruta}/planificacionHoraExtra`, PLAN_HORAS_EXTRAS_RUTAS);
        // MODULO GEOLOCALIZACION
        this.app.use(`/${ruta}/ubicacion`, UBICACION_RUTAS);
        // MODULO ACCIONES DE PERSONAL
        this.app.use(`/${ruta}/proceso`, PROCESO_RUTA);
        this.app.use(`/${ruta}/empleadoProcesos`, EMPLEADO_PROCESO_RUTAS);
        this.app.use(`/${ruta}/accionPersonal`, ACCION_PERSONAL_RUTAS);
        this.app.use(`/${ruta}/grado`, GRADO_RUTAS);
        this.app.use(`/${ruta}/grupoOcupacional`, GRUPO_OCUPACIONAL_RUTAS);

        // MODULO ALIMENTACION
        this.app.use(`/${ruta}/tipoComidas`, TIPO_COMIDAS_RUTA);
        this.app.use(`/${ruta}/planComidas`, PLAN_COMIDAS_RUTAS);
        this.app.use(`/${ruta}/alimentacion`, ALIMENTACION_RUTAS);
        // MODULO RELOJ VIRTUAL
        this.app.use(`/${ruta}/reloj-virtual`, RELOJ_VIRTUAL_RUTAS);
        // REPORTES
        this.app.use(`/${ruta}/asistencia`, ASISTENCIA_RUTAS);
        this.app.use(`/${ruta}/reportes/vacacion`, KARDEX_VACACION_RUTAS);
        this.app.use(`/${ruta}/reportes/hora-extra`, REPORTE_HORA_EXTRA_RUTAS);
        this.app.use(`/${ruta}/reporte`, REPORTES_RUTAS);
        this.app.use(`/${ruta}/reporte-faltas/`, FALTAS_RUTAS);
        this.app.use(`/${ruta}/reportes-asistencias/`, REPORTES_A_RUTAS);
        this.app.use(`/${ruta}/reporte-salidas-antes/`, SALIDAS_ANTICIPADAS_RUTAS);
        this.app.use(`/${ruta}/reporte-atrasos/`, REPORTES_ATRASOS_RUTAS);
        this.app.use(`/${ruta}/reporte-tiempo-laborado/`, REPORTES_TIEMPO_LABORADO_RUTAS);
        this.app.use(`/${ruta}/reporte-timbres-mrl/`, REPORTES_TIMBRES_MRL_RUTAS);
        this.app.use(`/${ruta}/reportes-auditoria`, AUDITORIA_RUTAS);
        this.app.use(`/${ruta}/empleado-vacunas-multiples`, VACUNAS_REPORTE_RUTAS);
        this.app.use(`/${ruta}/empleado-vacaciones-solicitudes`, VACACIONES_REPORTES_RUTAS);
        // LICENCIAS
        this.app.use(`/${ruta}/licencias`, LICENCIAS_RUTAS);
    }



    start(): void {
        this.app.set('trust proxy', true);
        this.server.listen(this.app.get('puerto'), () => {
            console.log('Servidor en el puerto', this.app.get('puerto'));
        });
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            next();
        })


        this.io.on('connection', (socket: any) => {
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
                //console.log('server', data_llega);
                socket.broadcast.emit('recibir_notificacion', data_llega);
                socket.emit('recibir_notificacion', data_llega);
            });

            socket.on("nuevo_aviso", (data: any) => {
                console.log('Datos recibidos en "nuevo_aviso":', data);

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
                socket.broadcast.emit('recibir_aviso', data_llega);
                socket.emit('recibir_aviso', data_llega);
            });
        });
    }
}

const SERVIDOR = new Servidor();
SERVIDOR.start();

import { beforeFiveDays, beforeTwoDays, Peri_Vacacion_Automatico } from './libs/avisoVacaciones';

import { RegistrarAsistenciaByTimbres } from './libs/ContarHoras';

import { DesactivarFinContratoEmpleado } from './libs/DesactivarEmpleado'


import { atrasosDiarios, atrasosSemanal } from './libs/sendAtraso';
import { aniversario } from './libs/sendAniversario';
import { cumpleanios } from './libs/sendBirthday';
import { faltasDiarios, faltasSemanal } from './libs/sendFaltas';
import { salidasAnticipadasDiarios, salidasAnticipadasSemanal } from './libs/sendSalidasAnticipadas';

import { tareasAutomaticas } from './libs/tareasAutomaticas';

/** **************************************************************************************************** **
 ** **             TAREAS QUE SE EJECUTAN CONTINUAMENTE - PROCESOS AUTOMATICOS                        ** **                    
 ** **************************************************************************************************** **/

// METODO PARA INACTIVAR USUARIOS AL FIN DE SU CONTRATO
DesactivarFinContratoEmpleado();

export const io = SERVIDOR.io;

// INICIO DE TAREAS AUTOMATICAS
(async () => {
    await tareasAutomaticas.IniciarTarea();
})();


//beforeFiveDays();
//beforeTwoDays();

// LLAMA AL METODO DE VERIFICACION PARA CREAR UN NUEVO PERIDO DE VACACIONES SI SE ACABA EL ANTERIOR
//Peri_Vacacion_Automatico();

//RegistrarAsistenciaByTimbres();

// ----------// conteoPermisos();


//generarTimbres('1', '2023-11-01', '2023-11-02');//

