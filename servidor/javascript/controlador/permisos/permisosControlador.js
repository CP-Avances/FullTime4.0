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
exports.PERMISOS_CONTROLADOR = void 0;
const settingsMail_1 = require("../../libs/settingsMail");
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
const auditoriaControlador_1 = __importDefault(require("../auditoria/auditoriaControlador"));
const fs_1 = __importDefault(require("fs"));
const database_1 = __importDefault(require("../../database"));
const path_1 = __importDefault(require("path"));
const moment_1 = __importDefault(require("moment"));
moment_1.default.locale('es');
class PermisosControlador {
    // METODO PARA BUSCAR NUEMRO DE PERMISO
    ObtenerNumPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const NUMERO_PERMISO = yield database_1.default.query(`
            SELECT MAX(p.numero_permiso) FROM mp_solicitud_permiso AS p
            WHERE p.id_empleado = $1
            `, [id_empleado]);
            if (NUMERO_PERMISO.rowCount != 0) {
                return res.jsonp(NUMERO_PERMISO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' }).end;
            }
        });
    }
    // CONSULTA DE PERMISOS SOLICITADOS POR DIAS
    BuscarPermisosTotales(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fec_inicio, fec_final, id_empleado } = req.body;
                console.log('ingresa ', fec_inicio, ' ', fec_final, ' ', id_empleado);
                const PERMISO = yield database_1.default.query(`
                SELECT id FROM mp_solicitud_permiso 
                WHERE ((fecha_inicio::date BETWEEN $1 AND $2) OR (fecha_final::date BETWEEN $1 AND $2)) 
                    AND id_empleado = $3
                    AND (estado = 2 OR estado = 3 OR estado = 1)
                `, [fec_inicio, fec_final, id_empleado]);
                return res.jsonp(PERMISO.rows);
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // CONSULTA DE PERMISOS SOLICITADOS POR DIAS
    BuscarPermisosDias(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fec_inicio, fec_final, id_empleado } = req.body;
                const PERMISO = yield database_1.default.query(`
                SELECT id FROM mp_solicitud_permiso 
                WHERE ((fecha_inicio::date BETWEEN $1 AND $2) OR (fecha_final::date BETWEEN $1 AND $2)) 
                    AND id_empleado = $3 AND dias_permiso != 0
                    AND (estado = 2 OR estado = 3 OR estado = 1)
                `, [fec_inicio, fec_final, id_empleado]);
                return res.jsonp(PERMISO.rows);
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // CONSULTA DE PERMISOS SOLICITADOS POR DIAS
    BuscarPermisosHoras(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fec_inicio, fec_final, hora_inicio, hora_final, id_empleado } = req.body;
                console.log('ver data ', fec_inicio, fec_final, hora_inicio, hora_final, id_empleado);
                const PERMISO = yield database_1.default.query(`
                SELECT id FROM mp_solicitud_permiso 
                WHERE (($1 BETWEEN fecha_inicio::date AND fecha_final::date) 
                    OR ($2 BETWEEN fecha_inicio::date AND fecha_final::date)) 
                    AND id_empleado = $5 
                    AND dias_permiso = 0
                    AND (($3 BETWEEN hora_salida AND hora_ingreso) OR ($4 BETWEEN hora_salida AND hora_ingreso)) 
                    AND (estado = 2 OR estado = 3 OR estado = 1)
                `, [fec_inicio, fec_final, hora_inicio, hora_final, id_empleado]);
                return res.jsonp(PERMISO.rows);
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // CONSULTA DE PERMISOS SOLICITADOS POR DIAS - ACTUALIZACION
    BuscarPermisosTotalesEditar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fec_inicio, fec_final, id_empleado, id } = req.body;
                const PERMISO = yield database_1.default.query(`
                SELECT id FROM mp_solicitud_permiso 
                WHERE ((fecha_inicio::date BETWEEN $1 AND $2) OR (fecha_final::date BETWEEN $1 AND $2)) 
                    AND id_empleado = $3
                    AND (estado = 2 OR estado = 3 OR estado = 1) AND NOT id = $4
                `, [fec_inicio, fec_final, id_empleado, id]);
                return res.jsonp(PERMISO.rows);
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // CONSULTA DE PERMISOS SOLICITADOS POR DIAS - ACTUALIZACION
    BuscarPermisosDiasEditar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fec_inicio, fec_final, id_empleado, id } = req.body;
                const PERMISO = yield database_1.default.query(`
                SELECT id FROM mp_solicitud_permiso 
                WHERE ((fecha_inicio::date BETWEEN $1 AND $2) OR (fecha_final::date BETWEEN $1 AND $2)) 
                    AND id_empleado = $3 AND dias_permiso != 0
                    AND (estado = 2 OR estado = 3 OR estado = 1) AND NOT id = $4
                `, [fec_inicio, fec_final, id_empleado, id]);
                return res.jsonp(PERMISO.rows);
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // CONSULTA DE PERMISOS SOLICITADOS POR DIAS
    BuscarPermisosHorasEditar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fec_inicio, fec_final, hora_inicio, hora_final, id_empleado, id } = req.body;
                const PERMISO = yield database_1.default.query(`
                SELECT id FROM mp_solicitud_permiso 
                WHERE (($1 BETWEEN fecha_inicio::date AND fecha_final::date) 
                    OR ($2 BETWEEN fecha_inicio::date AND fecha_final::date )) 
                    AND id_empleado = $5 
                    AND dias_permiso = 0
                    AND (($3 BETWEEN hora_salida AND hora_ingreso) OR ($4 BETWEEN hora_salida AND hora_ingreso)) 
                    AND (estado = 2 OR estado = 3 OR estado = 1) AND NOT id = $6
                `, [fec_inicio, fec_final, hora_inicio, hora_final, id_empleado, id]);
                return res.jsonp(PERMISO.rows);
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA CREAR PERMISOS
    CrearPermisos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = req.body;
            const { message, error, permiso } = yield CrearPermiso(data);
            if (error) {
                return res.status(400).jsonp({ message });
            }
            return res.status(200).jsonp({ message, permiso });
        });
    }
    // METODO PARA EDITAR SOLICITUD DE PERMISOS
    EditarPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { descripcion, fec_inicio, fec_final, dia, dia_libre, id_tipo_permiso, hora_numero, num_permiso, hora_salida, hora_ingreso, depa_user_loggin, id_peri_vacacion, fec_edicion, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const consulta = yield database_1.default.query(`SELECT * FROM mp_solicitud_permiso WHERE id = $1`, [id]);
                const [datosOriginales] = consulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'mp_solicitud_permiso',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al intentar actualizar permiso con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Solicitud no registrada.' });
                }
                const response = yield database_1.default.query(`
                UPDATE mp_solicitud_permiso SET descripcion = $1, fecha_inicio = $2, fecha_final = $3, dias_permiso = $4, 
                    dia_libre = $5, id_tipo_permiso = $6, horas_permiso = $7, numero_permiso = $8, hora_salida = $9, 
                    hora_ingreso = $10, id_periodo_vacacion = $11, fecha_edicion = $12
                WHERE id = $13 RETURNING *
                `, [descripcion, fec_inicio, fec_final, dia, dia_libre, id_tipo_permiso, hora_numero, num_permiso,
                    hora_salida, hora_ingreso, id_peri_vacacion, fec_edicion, id]);
                const [objetoPermiso] = response.rows;
                const fechaInicioN = yield (0, settingsMail_1.FormatearFecha2)(fec_inicio, 'ddd');
                const fechaFinalN = yield (0, settingsMail_1.FormatearFecha2)(fec_final, 'ddd');
                const fechaEdicionN = yield (0, settingsMail_1.FormatearFecha2)(fec_edicion, 'ddd');
                const horaSalidaN = yield (0, settingsMail_1.FormatearHora)(hora_salida);
                const horaIngresoN = yield (0, settingsMail_1.FormatearHora)(hora_ingreso);
                const fechaCreacionN = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_creacion, 'ddd');
                const fechaInicioO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_inicio, 'ddd');
                const fechaFinalO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_final, 'ddd');
                const fechaEdicionO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_edicion, 'ddd');
                const horaSalidaO = yield (0, settingsMail_1.FormatearHora)(datosOriginales.hora_salida);
                const horaIngresoO = yield (0, settingsMail_1.FormatearHora)(datosOriginales.hora_ingreso);
                datosOriginales.fecha_edicion = fechaEdicionO;
                datosOriginales.fecha_creacion = fechaCreacionN;
                datosOriginales.fecha_inicio = fechaInicioO;
                datosOriginales.fecha_final = fechaFinalO;
                datosOriginales.hora_salida = horaSalidaO;
                datosOriginales.hora_ingreso = horaIngresoO;
                objetoPermiso.fecha_creacion = fechaCreacionN;
                objetoPermiso.fecha_edicion = fechaEdicionN;
                objetoPermiso.fecha_inicio = fechaInicioN;
                objetoPermiso.fecha_final = fechaFinalN;
                objetoPermiso.hora_salida = horaSalidaN;
                objetoPermiso.hora_ingreso = horaIngresoN;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'mp_solicitud_permiso',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(objetoPermiso),
                    ip, observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (!objetoPermiso)
                    return res.status(404).jsonp({ message: 'Solicitud no registrada.' });
                const permiso = objetoPermiso;
                const JefesDepartamentos = yield database_1.default.query(`
                SELECT n.id_departamento, cg.nombre, n.id_departamento_nivel, n.departamento_nombre_nivel, n.nivel,
                    da.estado, dae.id_contrato, da.id_empleado_cargo, (dae.nombre || ' ' || dae.apellido) as fullname,
                    dae.cedula, dae.correo, c.permiso_mail, c.permiso_notificacion 
                FROM ed_niveles_departamento AS n, ed_autoriza_departamento AS da, datos_actuales_empleado AS dae,
                    eu_configurar_alertas AS c, ed_departamentos AS cg 
                WHERE n.id_departamento = $1
                    AND da.id_departamento = n.id_departamento_nivel
                    AND dae.id_cargo = da.id_empleado_cargo
                    AND dae.id = c.id_empleado
                    AND cg.id = n.id_departamento
                ORDER BY nivel ASC
                `, [depa_user_loggin]).then((result) => { return result.rows; });
                if (JefesDepartamentos.length === 0) {
                    return res.status(200)
                        .jsonp({
                        message: `Revisar configuración de departamento y autorización de solicitudes.`,
                        permiso: permiso
                    });
                }
                else {
                    permiso.EmpleadosSendNotiEmail = JefesDepartamentos;
                    return res.status(200).jsonp({ message: 'ok', permiso });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                console.log('error ', error);
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // REGISTRAR DOCUMENTO DE RESPALDO DE PERMISO  
    GuardarDocumentoPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let datos = req.body;
            const nombreArchivo = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
            datos.nombreArchivo = nombreArchivo;
            const { message, error } = yield RegistrarDocumentoPermiso(datos);
            if (error) {
                return res.status(400).jsonp({ message });
            }
            return res.status(200).jsonp({ message });
        });
    }
    // ELIMINAR DOCUMENTO DE RESPALDO DE PERMISO  
    EliminarDocumentoPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, archivo, codigo, user_name, ip } = req.body;
                console.log('ver data ', id, ' ', archivo, ' ', codigo, ' ', user_name, ' ', ip);
                let separador = path_1.default.sep;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const consulta = yield database_1.default.query(`SELECT * FROM mp_solicitud_permiso WHERE id = $1`, [id]);
                const [datosOriginales] = consulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'mp_solicitud_permiso',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al intentar actualizar permiso con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Solicitud no registrada.' });
                }
                // ACTUALIZAR REGISTRO
                const actualizacion = yield database_1.default.query(`
                UPDATE mp_solicitud_permiso SET documento = null WHERE id = $1 RETURNING *
                `, [id]);
                const [datosNuevos] = actualizacion.rows;
                // AUDITORIA
                const fechaCreacionN = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_creacion, 'ddd');
                const fechaInicioO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_inicio, 'ddd');
                const fechaFinalO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_final, 'ddd');
                const fechaEdicionO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_edicion, 'ddd');
                const horaSalidaO = yield (0, settingsMail_1.FormatearHora)(datosOriginales.hora_salida);
                const horaIngresoO = yield (0, settingsMail_1.FormatearHora)(datosOriginales.hora_ingreso);
                datosOriginales.fecha_creacion = fechaCreacionN;
                datosOriginales.fecha_edicion = fechaEdicionO;
                datosOriginales.fecha_inicio = fechaInicioO;
                datosOriginales.fecha_final = fechaFinalO;
                datosOriginales.hora_salida = horaSalidaO;
                datosOriginales.hora_ingreso = horaIngresoO;
                datosNuevos.fecha_creacion = fechaCreacionN;
                datosNuevos.fecha_edicion = fechaEdicionO;
                datosNuevos.fecha_inicio = fechaInicioO;
                datosNuevos.fecha_final = fechaFinalO;
                datosNuevos.hora_salida = horaSalidaO;
                datosNuevos.hora_ingreso = horaIngresoO;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'mp_solicitud_permiso',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(datosNuevos),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (archivo != 'null' && archivo != '' && archivo != null) {
                    let ruta = (yield (0, accesoCarpetas_1.ObtenerRutaPermisos)(codigo)) + separador + archivo;
                    // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                    fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                        if (err) {
                        }
                        else {
                            // ELIMINAR DEL SERVIDOR
                            fs_1.default.unlinkSync(ruta);
                        }
                    });
                }
                return res.jsonp({ message: 'Documento eliminado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // METODO DE BUSQUEDA DE PERMISOS POR ID DE EMPLEADO
    ObtenerPermisoEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empleado } = req.params;
                const PERMISO = yield database_1.default.query(`
                SELECT p.id, p.fecha_creacion, p.descripcion, p.fecha_inicio, p.fecha_final, p.dias_permiso, 
                    p.horas_permiso, p.legalizado, p.estado, p.dia_libre, p.id_tipo_permiso, p.id_empleado_contrato, 
                    p.id_periodo_vacacion, p.numero_permiso, p.documento, p.hora_salida, p.hora_ingreso, e.codigo, 
                    t.descripcion AS nom_permiso, t.tipo_descuento 
                FROM mp_solicitud_permiso AS p, mp_cat_tipo_permisos AS t, eu_empleados AS e
                WHERE p.id_tipo_permiso = t.id AND p.id_empleado = e.id AND e.id = $1 
                ORDER BY p.numero_permiso DESC
                `, [id_empleado]);
                return res.jsonp(PERMISO.rows);
            }
            catch (error) {
                return res.jsonp(null);
            }
        });
    }
    // METODO PARA OBTENER INFORMACION DE UN PERMISO
    InformarUnPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_permiso;
            const PERMISOS = yield database_1.default.query(`
            SELECT p.*, tp.descripcion AS tipo_permiso, cr.descripcion AS regimen, da.nombre, da.apellido,
                da.cedula, s.nombre AS sucursal, c.descripcion AS ciudad, e.nombre AS empresa, tc.cargo
            FROM mp_solicitud_permiso AS p, mp_cat_tipo_permisos AS tp, eu_empleado_contratos AS ec, 
                ere_cat_regimenes AS cr, datos_actuales_empleado AS da, eu_empleado_cargos AS ce, e_sucursales AS s,
                e_ciudades AS c, e_empresa AS e, e_cat_tipo_cargo AS tc
            WHERE p.id_tipo_permiso = tp.id AND ec.id = p.id_empleado_contrato AND cr.id = ec.id_regimen
                AND da.id = p.id_empleado AND ce.id_contrato = p.id_empleado_contrato
                AND s.id = ce.id_sucursal AND s.id_ciudad = c.id AND s.id_empresa = e.id AND tc.id = ce.id_tipo_cargo
                AND p.id = $1
            `, [id]);
            if (PERMISOS.rowCount != 0) {
                return res.json(PERMISOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA ELIMINAR PERMISO
    EliminarPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_name, ip } = req.body;
                let { id_permiso, doc, codigo } = req.params;
                let separador = path_1.default.sep;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const consulta = yield database_1.default.query(`SELECT * FROM ecm_realtime_notificacion WHERE id_permiso = $1`, [id_permiso]);
                const [datosOriginalesRealTime] = consulta.rows;
                if (!datosOriginalesRealTime) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ecm_realtime_notificacion',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al intentar eliminar permiso con id: ${id_permiso}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Solicitud no registrada.' });
                }
                yield database_1.default.query(`
                DELETE FROM ecm_realtime_notificacion where id_permiso = $1
                `, [id_permiso]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ecm_realtime_notificacion',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(datosOriginalesRealTime),
                    datosNuevos: '',
                    ip,
                    observacion: null
                });
                // CONSULTAR DATOSORIGINALESAUTORIZACIONES
                const consultaAutorizaciones = yield database_1.default.query(`SELECT * FROM ecm_autorizaciones WHERE id_permiso = $1`, [id_permiso]);
                const [datosOriginalesAutorizaciones] = consultaAutorizaciones.rows;
                if (!datosOriginalesAutorizaciones) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ecm_autorizaciones',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al intentar eliminar permiso con id: ${id_permiso}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Solicitud no registrada.' });
                }
                yield database_1.default.query(`
                DELETE FROM ecm_autorizaciones WHERE id_permiso = $1
                `, [id_permiso]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ecm_autorizaciones',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(datosOriginalesAutorizaciones),
                    datosNuevos: '',
                    ip,
                    observacion: null
                });
                // CONSULTAR DATOSORIGINALESPERMISOS
                const consultaPermisos = yield database_1.default.query(`SELECT * FROM mp_solicitud_permiso WHERE id = $1`, [id_permiso]);
                const [datosOriginalesPermisos] = consultaPermisos.rows;
                if (!datosOriginalesPermisos) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'mp_solicitud_permiso',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al intentar eliminar permiso con id: ${id_permiso}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Solicitud no registrada.' });
                }
                const response = yield database_1.default.query(`
                DELETE FROM mp_solicitud_permiso WHERE id = $1 RETURNING *
                `, [id_permiso]);
                const fechaCreacionN = yield (0, settingsMail_1.FormatearFecha2)(datosOriginalesPermisos.fecha_creacion, 'ddd');
                const fechaInicioO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginalesPermisos.fecha_inicio, 'ddd');
                const fechaFinalO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginalesPermisos.fecha_final, 'ddd');
                const fechaEdicionO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginalesPermisos.fecha_edicion, 'ddd');
                const horaSalidaO = yield (0, settingsMail_1.FormatearHora)(datosOriginalesPermisos.hora_salida);
                const horaIngresoO = yield (0, settingsMail_1.FormatearHora)(datosOriginalesPermisos.hora_ingreso);
                datosOriginalesPermisos.fecha_creacion = fechaCreacionN;
                datosOriginalesPermisos.fecha_edicion = fechaEdicionO;
                datosOriginalesPermisos.fecha_inicio = fechaInicioO;
                datosOriginalesPermisos.fecha_final = fechaFinalO;
                datosOriginalesPermisos.hora_salida = horaSalidaO;
                datosOriginalesPermisos.hora_ingreso = horaIngresoO;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'mp_solicitud_permiso',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(datosOriginalesPermisos),
                    datosNuevos: '',
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (doc != 'null' && doc != '' && doc != null) {
                    console.log(id_permiso, doc, ' entra ');
                    let ruta = (yield (0, accesoCarpetas_1.ObtenerRutaPermisos)(codigo)) + separador + doc;
                    // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                    fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                        if (err) {
                        }
                        else {
                            // ELIMINAR DEL SERVIDOR
                            fs_1.default.unlinkSync(ruta);
                        }
                    });
                }
                const [objetoPermiso] = response.rows;
                if (objetoPermiso) {
                    return res.status(200).jsonp(objetoPermiso);
                }
                else {
                    return res.status(404).jsonp({ message: 'Solicitud no eliminada.' });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // BUSQUEDA DE DOCUMENTO PERMISO
    ObtenerDocumentoPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const docs = req.params.docs;
            const { codigo } = req.params;
            // TRATAMIENTO DE RUTAS
            let separador = path_1.default.sep;
            let ruta = (yield (0, accesoCarpetas_1.ObtenerRutaPermisos)(codigo)) + separador + docs;
            fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                if (err) {
                }
                else {
                    res.sendFile(path_1.default.resolve(ruta));
                }
            });
        });
    }
    // METODO PARA CREAR MULTIPLES PERMISOS
    CrearPermisosMultiples(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { permisos } = req.body;
            // copnvertir permisos que esta en json a array
            const permisosArray = JSON.parse(permisos);
            const fecha = (0, moment_1.default)();
            const anio = fecha.format('YYYY');
            const mes = fecha.format('MM');
            const dia = fecha.format('DD');
            let errorPermisos = false;
            const separador = path_1.default.sep;
            const nombreArchivo = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
            const carpetaPermisos = yield (0, accesoCarpetas_1.ObtenerRutaPermisosGeneral)();
            const documentoTemporal = `${carpetaPermisos}${separador}${anio}_${mes}_${dia}_${nombreArchivo}`;
            let permisosCorrectos = [];
            let mensaje = '';
            for (const datos of permisosArray) {
                const { message, error, permiso } = yield CrearPermiso(datos);
                mensaje = message;
                if (error) {
                    console.error('Error al crear permiso:', message);
                    errorPermisos = true;
                    continue;
                }
                if (datos.subir_documento) {
                    try {
                        const carpetaEmpleado = yield (0, accesoCarpetas_1.ObtenerRutaPermisos)(permiso.codigo);
                        const consulta = yield database_1.default.query(`SELECT numero_permiso FROM mp_solicitud_permiso WHERE id = $1`, [permiso.id]);
                        const numeroPermiso = consulta.rows[0].numero_permiso;
                        const documento = `${carpetaEmpleado}${separador}${numeroPermiso}_${permiso.codigo}_${anio}_${mes}_${dia}_${nombreArchivo}`;
                        permiso.nombreArchivo = nombreArchivo;
                        fs_1.default.copyFileSync(documentoTemporal, documento);
                        const { message: messageDoc, error: errorDoc, documento: nombreDocumento } = yield RegistrarDocumentoPermiso(permiso);
                        if (errorDoc) {
                            console.error('Error al registrar documento:', messageDoc);
                            errorPermisos = true;
                            continue;
                        }
                        permiso.documento = nombreDocumento;
                    }
                    catch (error) {
                        console.error('Error al copiar el archivo:', error);
                        errorPermisos = true;
                        continue;
                    }
                }
                const permisoCreado = { datos, permiso };
                permisosCorrectos.push(permisoCreado);
            }
            try {
                if (fs_1.default.existsSync(documentoTemporal)) {
                    fs_1.default.unlinkSync(documentoTemporal);
                }
            }
            catch (error) {
                console.error('Error al eliminar el archivo temporal:', error);
            }
            if (errorPermisos) {
                return res.status(500).jsonp({ message: 'Error al crear permisos.' });
            }
            return res.status(200).jsonp({ message: mensaje, permisos: permisosCorrectos });
        });
    }
    // METODO PARA GUARDAR DOCUMENTOS DE PERMISOS MULTIPLES
    GuardarDocumentosPermisosMultiples(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
            }
            catch (error) {
            }
        });
    }
    /** ********************************************************************************************* **
     ** *         METODO PARA ENVIO DE CORREO ELECTRONICO DE SOLICITUDES DE PERMISOS                * **
     ** ********************************************************************************************* **/
    // METODO PARA ENVIAR CORREO ELECTRONICO DESDE APLICACION WEB
    EnviarCorreoWeb(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var tiempo = (0, settingsMail_1.fechaHora)();
            var fecha = yield (0, settingsMail_1.FormatearFecha)(tiempo.fecha_formato, settingsMail_1.dia_completo);
            var hora = yield (0, settingsMail_1.FormatearHora)(tiempo.hora);
            const path_folder = path_1.default.resolve('logos');
            var datos = yield (0, settingsMail_1.Credenciales)(req.id_empresa);
            if (datos === 'ok') {
                const { id_empl_contrato, id_dep, correo, id_suc, desde, hasta, h_inicio, h_fin, observacion, estado_p, solicitud, tipo_permiso, dias_permiso, horas_permiso, solicitado_por, id, asunto, tipo_solicitud, proceso } = req.body;
                const correoInfoPidePermiso = yield database_1.default.query(`
                SELECT e.id, e.correo, e.nombre, e.apellido, 
                    e.cedula, ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo, tc.cargo AS tipo_cargo, 
                    d.nombre AS departamento 
                FROM eu_empleado_contratos AS ecn, eu_empleados AS e, eu_empleado_cargos AS ecr, e_cat_tipo_cargo AS tc, 
                    ed_departamentos AS d 
                WHERE ecn.id = $1 AND ecn.id_empleado = e.id AND 
                    (SELECT MAX(cargo_id) AS cargo FROM datos_empleado_cargo WHERE empl_id = e.id ) = ecr.id 
                    AND tc.id = ecr.id_tipo_cargo AND d.id = ecr.id_departamento 
                ORDER BY cargo DESC
                `, [id_empl_contrato]);
                var url = `${process.env.URL_DOMAIN}/ver-permiso`;
                let data = {
                    to: correo,
                    from: settingsMail_1.email,
                    subject: asunto,
                    html: `
                    <body>
                        <div style="text-align: center;">
                            <img width="100%" height="100%" src="cid:cabeceraf"/>
                        </div>
                        <br>
                        <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                            El presente correo es para informar que se ha ${proceso} la siguiente solicitud de permiso: <br>  
                        </p>
                        <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
                        <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                            <b>Empresa:</b> ${settingsMail_1.nombre} <br>   
                            <b>Asunto:</b> ${asunto} <br> 
                            <b>Colaborador que envía:</b> ${correoInfoPidePermiso.rows[0].nombre} ${correoInfoPidePermiso.rows[0].apellido} <br>
                            <b>Número de cédula:</b> ${correoInfoPidePermiso.rows[0].cedula} <br>
                            <b>Cargo:</b> ${correoInfoPidePermiso.rows[0].tipo_cargo} <br>
                            <b>Departamento:</b> ${correoInfoPidePermiso.rows[0].departamento} <br>
                            <b>Generado mediante:</b> Aplicación Web <br>
                            <b>Fecha de envío:</b> ${fecha} <br> 
                            <b>Hora de envío:</b> ${hora} <br><br> 
                        </p>
                        <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
                        <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                            <b>Motivo:</b> ${tipo_permiso} <br>   
                            <b>Registro de solicitud:</b> ${solicitud} <br> 
                            <b>Desde:</b> ${desde} ${h_inicio} <br>
                            <b>Hasta:</b> ${hasta} ${h_fin} <br>
                            <b>Observación:</b> ${observacion} <br>
                            <b>Días permiso:</b> ${dias_permiso} <br>
                            <b>Horas permiso:</b> ${horas_permiso} <br>
                            <b>Estado:</b> ${estado_p} <br><br>
                            <b>${tipo_solicitud}:</b> ${solicitado_por} <br><br>
                            <a href="${url}/${id}">Dar clic en el siguiente enlace para revisar solicitud de permiso.</a> <br><br>
                        </p>
                        <p style="font-family: Arial; font-size:12px; line-height: 1em;">
                            <b>Gracias por la atención</b><br>
                            <b>Saludos cordiales,</b> <br><br>
                        </p>
                        <img src="cid:pief" width="100%" height="100%"/>
                    </body>
                    `,
                    attachments: [
                        {
                            filename: 'cabecera_firma.jpg',
                            path: `${path_folder}/${settingsMail_1.cabecera_firma}`,
                            cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                        },
                        {
                            filename: 'pie_firma.jpg',
                            path: `${path_folder}/${settingsMail_1.pie_firma}`,
                            cid: 'pief' //COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                        }
                    ]
                };
                var corr = (0, settingsMail_1.enviarMail)(settingsMail_1.servidor, parseInt(settingsMail_1.puerto));
                corr.sendMail(data, function (error, info) {
                    if (error) {
                        console.log('Email error: ' + error);
                        corr.close();
                        return res.jsonp({ message: 'error' });
                    }
                    else {
                        console.log('Email sent: ' + info.response);
                        corr.close();
                        return res.jsonp({ message: 'ok' });
                    }
                });
            }
            else {
                res.jsonp({ message: 'Ups!!! algo salio mal. No fue posible enviar correo electrónico.' });
            }
        });
    }
    // METODO PARA ENVIAR CORREO ELECTRONICO PARA EDITAR PERMISOS DESDE APLICACION WEB
    EnviarCorreoWebEditar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var tiempo = (0, settingsMail_1.fechaHora)();
            var fecha = yield (0, settingsMail_1.FormatearFecha)(tiempo.fecha_formato, settingsMail_1.dia_completo);
            var hora = yield (0, settingsMail_1.FormatearHora)(tiempo.hora);
            const path_folder = path_1.default.resolve('logos');
            var datos = yield (0, settingsMail_1.Credenciales)(req.id_empresa);
            if (datos === 'ok') {
                const { id_empl_contrato, id_dep, correo, id_suc, desde, hasta, h_inicio, h_fin, observacion, estado_p, solicitud, tipo_permiso, dias_permiso, horas_permiso, solicitado_por, id, asunto, tipo_solicitud, proceso, adesde, ahasta, ah_inicio, ah_fin, aobservacion, aestado_p, asolicitud, atipo_permiso, adias_permiso, ahoras_permiso } = req.body;
                const correoInfoPidePermiso = yield database_1.default.query(`
                SELECT e.id, e.correo, e.nombre, e.apellido, 
                    e.cedula, ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo, tc.cargo AS tipo_cargo, 
                    d.nombre AS departamento 
                FROM eu_empleado_contratos AS ecn, eu_empleados AS e, eu_empleado_cargos AS ecr, e_cat_tipo_cargo AS tc, 
                    ed_departamentos AS d 
                WHERE ecn.id = $1 AND ecn.id_empleado = e.id AND 
                    (SELECT MAX(cargo_id) AS cargo FROM datos_empleado_cargo WHERE empl_id = e.id ) = ecr.id 
                    AND tc.id = ecr.id_tipo_cargo AND d.id = ecr.id_departamento 
                ORDER BY cargo DESC
                `, [id_empl_contrato]);
                var url = `${process.env.URL_DOMAIN}/ver-permiso`;
                let data = {
                    to: correo,
                    from: settingsMail_1.email,
                    subject: asunto,
                    html: `
                    <body>
                         <div style="text-align: center;">
                            <img width="100%" height="100%" src="cid:cabeceraf"/>
                        </div>
                        <br>
                        <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                            El presente correo es para informar que se ha ${proceso} la siguiente solicitud de permiso: <br>  
                        </p>
                        <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
                        <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                            <b>Empresa:</b> ${settingsMail_1.nombre} <br>   
                            <b>Asunto:</b> ${asunto} <br> 
                            <b>Colaborador que envía:</b> ${correoInfoPidePermiso.rows[0].nombre} ${correoInfoPidePermiso.rows[0].apellido} <br>
                            <b>Número de cédula:</b> ${correoInfoPidePermiso.rows[0].cedula} <br>
                            <b>Cargo:</b> ${correoInfoPidePermiso.rows[0].tipo_cargo} <br>
                            <b>Departamento:</b> ${correoInfoPidePermiso.rows[0].departamento} <br>
                            <b>Generado mediante:</b> Aplicación Web <br>
                            <b>Fecha de envío:</b> ${fecha} <br> 
                            <b>Hora de envío:</b> ${hora} <br><br> 
                        </p>
                        <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
                        <table style='width: 100%;'>
                            <tr style='font-family: Arial; font-size:14px;'>
                                <th scope='col' style="text-align: left; border-right: 1px solid #000;">INFORMACIÓN ANTERIOR <br><br></th>
                                <th scope='col' style="text-align: left;">INFORMACIÓN ACTUAL <br><br></th>
                            </tr>
    
                            <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                    <b>Motivo:</b> ${atipo_permiso} <br>     
                                </td>
                                <td style="text-align: left; color:rgb(11, 22, 121);">
                                    <b>Motivo:</b> ${tipo_permiso} <br>
                                </td>
                            </tr>
    
                            <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                    <b>Registro de solicitud:</b> ${asolicitud} <br> 
                                </td>
                                <td style="text-align: left; color:rgb(11, 22, 121);">
                                    <b>Registro de solicitud:</b> ${solicitud} <br> 
                                </td>
                            </tr>
    
                            <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                    <b>Desde:</b> ${adesde} ${ah_inicio} <br> 
                                </td>
                                <td style="text-align: left; color:rgb(11, 22, 121);">
                                    <b>Desde:</b> ${desde} ${h_inicio} <br>  
                                </td>
                            </tr>
    
                            <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                    <b>Hasta:</b> ${ahasta} ${ah_fin} <br>
                                </td>
                                <td style="text-align: left; color:rgb(11, 22, 121);">
                                    <b>Hasta:</b> ${hasta} ${h_fin} <br>  
                                </td>
                            </tr>
    
                            <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                    <b>Observación:</b> ${aobservacion} <br>
                                </td>
                                <td style="text-align: left; color:rgb(11, 22, 121);">
                                    <b>Observación:</b> ${observacion} <br> 
                                </td>
                            </tr>
    
                            <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                    <b>Días permiso:</b> ${adias_permiso} <br>
                                </td>
                                <td style="text-align: left; color:rgb(11, 22, 121);">
                                    <b>Días permiso:</b> ${dias_permiso} <br>
                                </td>
                            </tr>
    
                            <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                    <b>Horas permiso:</b> ${ahoras_permiso} <br>
                                </td>
                                <td style="text-align: left; color:rgb(11, 22, 121);">
                                    <b>Horas permiso:</b> ${horas_permiso} <br>
                                </td>
                            </tr>
    
                            <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                    <b>Estado:</b> ${aestado_p} <br><br>
                                </td>
                                <td style="text-align: left; color:rgb(11, 22, 121);">
                                    <b>Estado:</b> ${estado_p} <br><br>
                                </td>
                            </tr>
                        </table>
                        <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                            <b>${tipo_solicitud}:</b> ${solicitado_por} <br><br>
                            <a href="${url}/${id}">Dar clic en el siguiente enlace para revisar solicitud de permiso.</a> <br><br>
                        </p>
                        <p style="font-family: Arial; font-size:12px; line-height: 1em;">
                            <b>Gracias por la atención</b><br>
                            <b>Saludos cordiales,</b> <br><br>
                        </p>
                        <img src="cid:pief" width="100%" height="100%"/>
                    </body>
                    `,
                    attachments: [
                        {
                            filename: 'cabecera_firma.jpg',
                            path: `${path_folder}/${settingsMail_1.cabecera_firma}`,
                            cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                        },
                        {
                            filename: 'pie_firma.jpg',
                            path: `${path_folder}/${settingsMail_1.pie_firma}`,
                            cid: 'pief' //COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                        }
                    ]
                };
                var corr = (0, settingsMail_1.enviarMail)(settingsMail_1.servidor, parseInt(settingsMail_1.puerto));
                corr.sendMail(data, function (error, info) {
                    if (error) {
                        console.log('Email error: ' + error);
                        corr.close();
                        return res.jsonp({ message: 'error' });
                    }
                    else {
                        console.log('Email sent: ' + info.response);
                        corr.close();
                        return res.jsonp({ message: 'ok' });
                    }
                });
            }
            else {
                res.jsonp({ message: 'Ups!!! algo salio mal. No fue posible enviar correo electrónico.' });
            }
        });
    }
    /** ********************************************************************************************* **
     ** *         METODO PARA ENVIO DE CORREO ELECTRONICO DE SOLICITUDES DE PERMISOS                * **
     ** ********************************************************************************************* **/
    // METODO PARA ENVIAR CORREO ELECTRONICO DESDE APLICACION WEB -- verificar estado
    EnviarCorreoWebMultiple(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const usuarios = req.body.usuarios;
            var razon = '';
            var tiempo = (0, settingsMail_1.fechaHora)();
            var fecha = yield (0, settingsMail_1.FormatearFecha)(tiempo.fecha_formato, settingsMail_1.dia_completo);
            var hora = yield (0, settingsMail_1.FormatearHora)(tiempo.hora);
            const path_folder = path_1.default.resolve('logos');
            var datos = yield (0, settingsMail_1.Credenciales)(req.id_empresa);
            if (datos === 'ok') {
                const { correo, desde, hasta, h_inicio, h_fin, observacion, estado_p, solicitud, tipo_permiso, asunto, tipo_solicitud, proceso, usuario_solicita, tipo } = req.body;
                var tablaHTML = yield generarTablaHTMLWeb(usuarios, tipo);
                if (observacion != '' && observacion != undefined) {
                    razon = observacion;
                }
                else {
                    razon = '...';
                }
                const solicita = yield database_1.default.query(`
                SELECT de.id, (de.nombre ||' '|| de.apellido) AS empleado, de.cedula, tc.cargo AS tipo_cargo, 
                    d.nombre AS departamento     
                FROM datos_actuales_empleado AS de, eu_empleado_cargos AS ec, e_cat_tipo_cargo AS tc, 
                    ed_departamentos AS d 
                WHERE de.id = $1 AND d.id = de.id_departamento AND ec.id = de.id_cargo AND ec.id_tipo_cargo = tc.id
                `, [usuario_solicita]);
                let data = {
                    to: correo,
                    from: settingsMail_1.email,
                    subject: asunto,
                    html: `
                    <body>
                        <div style="text-align: center;">
                             <img width="100%" height="100%" src="cid:cabeceraf"/>
                        </div>
                        <br>
                        <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                            El presente correo es para informar que se ha ${proceso} la siguiente solicitud de permiso: <br>  
                        </p>
                        <h3 style="font-family: Arial; text-align: center;">REGISTRO MULTIPLE DE PERMISO</h3>
                        <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                            <b>Empresa:</b> ${settingsMail_1.nombre} <br>   
                            <b>Asunto:</b> ${asunto} <br> 
                            <b>${tipo_solicitud}:</b> ${solicita.rows[0].empleado} <br>
                            <b>Número de cédula:</b> ${solicita.rows[0].cedula} <br>
                            <b>Cargo:</b> ${solicita.rows[0].tipo_cargo} <br>
                            <b>Departamento:</b> ${solicita.rows[0].departamento} <br>
                            <b>Generado mediante:</b> Aplicación Web <br>
                            <b>Fecha de envío:</b> ${fecha} <br> 
                            <b>Hora de envío:</b> ${hora} <br><br> 
                        </p>
                        <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
                        <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                            <b>Motivo:</b> ${tipo_permiso} <br>   
                            <b>Registro de solicitud:</b> ${solicitud} <br> 
                            <b>Desde:</b> ${desde} ${h_inicio} <br>
                            <b>Hasta:</b> ${hasta} ${h_fin} <br>
                            <b>Observación:</b> ${razon} <br>
                            <b>Estado:</b> ${estado_p} <br><br>
                        </p>
                        <div style="font-family: Arial; font-size:15px; margin: auto; text-align: center;">
                            <h3 style="font-family: Arial; text-align: center;">LISTA DE USUARIOS CON PERMISO</h3>
                            ${tablaHTML}
                            <br><br>
                        </div>
                        <p style="font-family: Arial; font-size:12px; line-height: 1em;">
                            <b>Gracias por la atención</b><br>
                            <b>Saludos cordiales,</b> <br><br>
                        </p>
                        <img src="cid:pief" width="100%" height="100%"/>
                    </body>
                    `,
                    attachments: [
                        {
                            filename: 'cabecera_firma.jpg',
                            path: `${path_folder}/${settingsMail_1.cabecera_firma}`,
                            cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                        },
                        {
                            filename: 'pie_firma.jpg',
                            path: `${path_folder}/${settingsMail_1.pie_firma}`,
                            cid: 'pief' //COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                        }
                    ]
                };
                var corr = (0, settingsMail_1.enviarMail)(settingsMail_1.servidor, parseInt(settingsMail_1.puerto));
                corr.sendMail(data, function (error, info) {
                    if (error) {
                        console.log('Email error: ' + error);
                        corr.close();
                        return res.jsonp({ message: 'error' });
                    }
                    else {
                        console.log('Email sent: ' + info.response);
                        corr.close();
                        return res.jsonp({ message: 'ok' });
                    }
                });
            }
            else {
                res.jsonp({ message: 'Ups!!! algo salio mal. No fue posible enviar correo electrónico.' });
            }
        });
    }
    // verificar estado
    ListarEstadosPermisos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const PERMISOS = yield database_1.default.query(`
            SELECT p.id, p.fecha_creacion, p.descripcion, p.fecha_inicio, p.documento, p.fecha_final, p.estado, 
                p.id_empleado_cargo, e.id AS id_emple_solicita, e.nombre, e.apellido, 
                (e.nombre || \' \' || e.apellido) AS fullname, e.cedula, da.correo, cp.descripcion AS nom_permiso, 
                ec.id AS id_contrato, da.id_departamento AS id_depa, da.codigo, depa.nombre AS depa_nombre 
            FROM mp_solicitud_permiso AS p, eu_empleado_contratos AS ec, eu_empleados AS e, mp_cat_tipo_permisos AS cp, 
                datos_actuales_empleado AS da, ed_departamentos AS depa
            WHERE p.id_empleado_contrato = ec.id AND ec.id_empleado = e.id AND p.id_tipo_permiso = cp.id 
                AND da.id_contrato = ec.id AND depa.id = da.id_departamento AND (p.estado = 1 OR p.estado = 2)
            ORDER BY estado DESC, fecha_creacion DESC
            `);
            if (PERMISOS.rowCount != 0) {
                return res.jsonp(PERMISOS.rows);
            }
            else {
                return res.status(404).jsonp({ message: 'No se encuentran registros.' }).end();
            }
        });
    }
    // verificar estado
    ListarPermisosAutorizados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const PERMISOS = yield database_1.default.query(`
            SELECT p.id, p.fecha_creacion, p.descripcion, p.fecha_inicio, p.documento,  p.fecha_final, p.estado, 
                p.id_empleado_cargo, e.id AS id_emple_solicita, e.nombre, e.apellido, 
                (e.nombre || \' \' || e.apellido) AS fullname, e.cedula, cp.descripcion AS nom_permiso, 
                ec.id AS id_contrato, da.id_departamento AS id_depa, da.codigo, depa.nombre AS depa_nombre 
            FROM mp_solicitud_permiso AS p, eu_empleado_contratos AS ec, eu_empleados AS e, mp_cat_tipo_permisos AS cp, 
                datos_actuales_empleado AS da, ed_departamentos AS depa
            WHERE p.id_empleado_contrato = ec.id AND ec.id_empleado = e.id AND p.id_tipo_permiso = cp.id 
                AND da.id_contrato = ec.id AND depa.id = da.id_departamento AND (p.estado = 3 OR p.estado = 4)
            ORDER BY estado ASC, fecha_creacion DESC
            `);
            if (PERMISOS.rowCount != 0) {
                return res.jsonp(PERMISOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    ObtenerPermisoEditar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const PERMISO = yield database_1.default.query(`
                SELECT p.id, p.fecha_creacion, p.descripcion, p.fecha_inicio, p.fecha_final, p.dias_permiso, 
                    p.horas_permiso, p.legalizado, p.estado, p.dia_libre, p.id_tipo_permiso, p.id_empleado_contrato, 
                    p.id_periodo_vacacion, p.numero_permiso, p.documento, p.hora_salida, p.hora_ingreso, p.id_empleado, 
                    t.descripcion AS nom_permiso
                FROM mp_solicitud_permiso AS p, mp_cat_tipo_permisos AS t
                WHERE p.id_tipo_permiso = t.id AND p.id = $1 
                ORDER BY p.numero_permiso DESC
                `, [id]);
                return res.jsonp(PERMISO.rows);
            }
            catch (error) {
                return res.jsonp(null);
            }
        });
    }
    ObtenerDatosSolicitud(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_emple_permiso;
            console.log('dato id emple permiso: ', id);
            const SOLICITUD = yield database_1.default.query(`
            SELECT * FROM vista_datos_solicitud_permiso WHERE id_emple_permiso = $1
            `, [id]);
            if (SOLICITUD.rowCount != 0) {
                return res.json(SOLICITUD.rows);
            }
            else {
                return res.status(404).json({ text: 'No se encuentran registros.' });
            }
        });
    }
    ObtenerDatosAutorizacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_permiso;
            const SOLICITUD = yield database_1.default.query(`
            SELECT a.id AS id_autorizacion, a.id_autoriza_estado AS empleado_estado, 
                p.id AS permiso_id 
            FROM ecm_autorizaciones AS a, mp_solicitud_permiso AS p 
            WHERE p.id = a.id_permiso AND p.id = $1
            `, [id]);
            if (SOLICITUD.rowCount != 0) {
                return res.json(SOLICITUD.rows);
            }
            else {
                return res.status(404).json({ text: 'No se encuentran registros.' });
            }
        });
    }
    /** ************************************************************************************************* **
     ** **                             METODOS PARA REGISTRO DE PERMISOS                               ** **
     ** ************************************************************************************************* **/
    // ELIMINAR DOCUMENTO DE PERMISO DESDE APLICACION MOVIL
    EliminarPermisoMovil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { documento, codigo } = req.params;
            let separador = path_1.default.sep;
            if (documento != 'null' && documento != '' && documento != null) {
                let ruta = (yield (0, accesoCarpetas_1.ObtenerRutaPermisos)(codigo)) + separador + documento;
                // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                    if (err) {
                    }
                    else {
                        // ELIMINAR DEL SERVIDOR
                        fs_1.default.unlinkSync(ruta);
                    }
                });
            }
            res.jsonp({ message: 'ok' });
        });
    }
    // METODO PARA ACTUALIZAR ESTADO DEL PERMISO
    ActualizarEstado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { estado, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const consulta = yield database_1.default.query(`SELECT estado FROM mp_solicitud_permiso WHERE id = $1`, [id]);
                const [datosOriginales] = consulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'mp_solicitud_permiso',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar estado del permiso con id ${id}`
                    });
                    yield database_1.default.query('ROLLBACK');
                    return res.status(404).jsonp({ message: 'No se encuentran registros' });
                }
                const actualizacion = yield database_1.default.query(`
                UPDATE mp_solicitud_permiso SET estado = $1 WHERE id = $2 RETURNING *
                `, [estado, id]);
                const [datosNuevos] = actualizacion.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'mp_solicitud_permiso',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(datosNuevos),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'ok' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al actualizar estado del permiso' });
            }
        });
    }
    // METODO PARA OBTENER INFORMACION DE UN PERMISO
    ListarUnPermisoInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_permiso;
            const PERMISOS = yield database_1.default.query(`
            SELECT p.id, p.fecha_creacion, p.descripcion, p.fecha_inicio, p.dias_permiso, p.hora_salida, p.hora_ingreso, 
                p.horas_permiso, p.documento, p.fecha_final, p.estado, p.id_empleado_cargo, e.nombre, 
                e.apellido, e.cedula, e.id AS id_empleado, e.codigo, cp.id AS id_tipo_permiso, 
                cp.descripcion AS nom_permiso, ec.id AS id_contrato 
            FROM mp_solicitud_permiso AS p, eu_empleado_contratos AS ec, eu_empleados AS e, mp_cat_tipo_permisos AS cp 
            WHERE p.id = $1 AND p.id_empleado_contrato = ec.id AND ec.id_empleado = e.id 
                AND p.id_tipo_permiso = cp.id
            `, [id]);
            if (PERMISOS.rowCount != 0) {
                return res.json(PERMISOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // ENVIO DE CORREO AL CREAR UN PERMISO MEDIANTE APLICACION MOVIL
    EnviarCorreoPermisoMovil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var tiempo = (0, settingsMail_1.fechaHora)();
            var fecha = yield (0, settingsMail_1.FormatearFecha)(tiempo.fecha_formato, settingsMail_1.dia_completo);
            var hora = yield (0, settingsMail_1.FormatearHora)(tiempo.hora);
            const path_folder = path_1.default.resolve('logos');
            var datos = yield (0, settingsMail_1.Credenciales)(parseInt(req.params.id_empresa));
            if (datos === 'ok') {
                const { id_empl_contrato, id_dep, correo, id_suc, desde, hasta, h_inicio, h_fin, observacion, estado_p, solicitud, tipo_permiso, dias_permiso, horas_permiso, solicitado_por, asunto, tipo_solicitud, proceso } = req.body;
                console.log('req.body: ', req.body);
                const correoInfoPidePermiso = yield database_1.default.query(`
                SELECT e.id, e.correo, e.nombre, e.apellido, e.cedula, ecr.id_departamento, ecr.id_sucursal, 
                    ecr.id AS cargo, tc.cargo AS tipo_cargo, d.nombre AS departamento 
                FROM eu_empleado_contratos AS ecn, eu_empleados AS e, eu_empleado_cargos AS ecr, e_cat_tipo_cargo AS tc, 
                    ed_departamentos AS d 
                WHERE ecn.id = $1 AND ecn.id_empleado = e.id 
                    AND (SELECT MAX(cargo_id) AS cargo FROM datos_empleado_cargo WHERE empl_id = e.id) = ecr.id 
                    AND tc.id = ecr.id_tipo_cargo AND d.id = ecr.id_departamento 
                ORDER BY cargo DESC
                `, [id_empl_contrato]);
                let data = {
                    to: correo,
                    from: settingsMail_1.email,
                    subject: asunto,
                    html: `
                    <body>
                        <div style="text-align: center;">
                            <img width="100%" height="100%" src="cid:cabeceraf"/>
                        </div>
                        <br>
                        <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                            El presente correo es para informar que se ha ${proceso} la siguiente solicitud de permiso: <br>  
                        </p>
                        <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
                        <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                            <b>Empresa:</b> ${settingsMail_1.nombre} <br>   
                            <b>Asunto:</b> ${asunto} <br> 
                            <b>Colaborador que envía:</b> ${correoInfoPidePermiso.rows[0].nombre} ${correoInfoPidePermiso.rows[0].apellido} <br>
                            <b>Número de cédula:</b> ${correoInfoPidePermiso.rows[0].cedula} <br>
                            <b>Cargo:</b> ${correoInfoPidePermiso.rows[0].tipo_cargo} <br>
                            <b>Departamento:</b> ${correoInfoPidePermiso.rows[0].departamento} <br>
                            <b>Generado mediante:</b> Aplicación Móvil <br>
                            <b>Fecha de envío:</b> ${fecha} <br> 
                            <b>Hora de envío:</b> ${hora} <br><br> 
                         </p>
                        <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
                        <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                            <b>Motivo:</b> ${tipo_permiso} <br>   
                            <b>Registro de solicitud:</b> ${solicitud} <br> 
                            <b>Desde:</b> ${desde} ${h_inicio} <br>
                            <b>Hasta:</b> ${hasta} ${h_fin} <br>
                            <b>Observación:</b> ${observacion} <br>
                            <b>Días permiso:</b> ${dias_permiso} <br>
                            <b>Horas permiso:</b> ${horas_permiso} <br>
                            <b>Estado:</b> ${estado_p} <br><br>
                            <b>${tipo_solicitud}:</b> ${solicitado_por} <br><br>
                        </p>
                        <p style="font-family: Arial; font-size:12px; line-height: 1em;">
                            <b>Gracias por la atención</b><br>
                            <b>Saludos cordiales,</b> <br><br>
                        </p>
                        <img src="cid:pief" width="100%" height="100%"/>
                    </body>
                    `,
                    attachments: [
                        {
                            filename: 'cabecera_firma.jpg',
                            path: `${path_folder}/${settingsMail_1.cabecera_firma}`,
                            cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                        },
                        {
                            filename: 'pie_firma.jpg',
                            path: `${path_folder}/${settingsMail_1.pie_firma}`,
                            cid: 'pief' //COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                        }
                    ]
                };
                var corr = (0, settingsMail_1.enviarMail)(settingsMail_1.servidor, parseInt(settingsMail_1.puerto));
                corr.sendMail(data, function (error, info) {
                    if (error) {
                        corr.close();
                        console.log('Email error: ' + error);
                        return res.jsonp({ message: 'error' });
                    }
                    else {
                        corr.close();
                        console.log('Email sent: ' + info.response);
                        return res.jsonp({ message: 'ok' });
                    }
                });
            }
            else {
                res.jsonp({ message: 'Ups!!! algo salio mal. No fue posible enviar correo electrónico.' + datos });
            }
        });
    }
    // ENVIO DE CORREO AL CREAR UN PERMISO MEDIANTE APLICACION MOVIL
    EnviarCorreoPermisoEditarMovil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var tiempo = (0, settingsMail_1.fechaHora)();
            var fecha = yield (0, settingsMail_1.FormatearFecha)(tiempo.fecha_formato, settingsMail_1.dia_completo);
            var hora = yield (0, settingsMail_1.FormatearHora)(tiempo.hora);
            const path_folder = path_1.default.resolve('logos');
            var datos = yield (0, settingsMail_1.Credenciales)(parseInt(req.params.id_empresa));
            console.log('datos: ', datos);
            if (datos === 'ok') {
                const { id_empl_contrato, id_dep, correo, id_suc, desde, hasta, h_inicio, h_fin, observacion, estado_p, solicitud, tipo_permiso, dias_permiso, horas_permiso, solicitado_por, asunto, tipo_solicitud, proceso, adesde, ahasta, ah_inicio, ah_fin, aobservacion, aestado_p, asolicitud, atipo_permiso, adias_permiso, ahoras_permiso } = req.body;
                const correoInfoPidePermiso = yield database_1.default.query(`
                SELECT e.id, e.correo, e.nombre, e.apellido, e.cedula, ecr.id_departamento, ecr.id_sucursal, 
                    ecr.id AS cargo, tc.cargo AS tipo_cargo, d.nombre AS departamento 
                FROM eu_empleado_contratos AS ecn, eu_empleados AS e, eu_empleado_cargos AS ecr, e_cat_tipo_cargo AS tc, 
                    ed_departamentos AS d 
                WHERE ecn.id = $1 AND ecn.id_empleado = e.id 
                    AND (SELECT MAX(cargo_id) AS cargo FROM datos_empleado_cargo WHERE empl_id = e.id) = ecr.id 
                    AND tc.id = ecr.id_tipo_cargo AND d.id = ecr.id_departamento 
                ORDER BY cargo DESC
                `, [id_empl_contrato]);
                let data = {
                    to: correo,
                    from: settingsMail_1.email,
                    subject: asunto,
                    html: `
                     <body>
                        <div style="text-align: center;">
                            <img width="100%" height="100%" src="cid:cabeceraf"/>
                        </div>
                        <br>
                        <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                            El presente correo es para informar que se ha ${proceso} la siguiente solicitud de permiso: <br>  
                        </p>
                        <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
                        <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                            <b>Empresa:</b> ${settingsMail_1.nombre} <br>   
                            <b>Asunto:</b> ${asunto} <br> 
                            <b>Colaborador que envía:</b> ${correoInfoPidePermiso.rows[0].nombre} ${correoInfoPidePermiso.rows[0].apellido} <br>
                            <b>Número de cédula:</b> ${correoInfoPidePermiso.rows[0].cedula} <br>
                            <b>Cargo:</b> ${correoInfoPidePermiso.rows[0].tipo_cargo} <br>
                            <b>Departamento:</b> ${correoInfoPidePermiso.rows[0].departamento} <br>
                            <b>Generado mediante:</b> Aplicación Móvil <br>
                            <b>Fecha de envío:</b> ${fecha} <br> 
                            <b>Hora de envío:</b> ${hora} <br><br> 
                        </p>
                        <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
                        <table style='width: 100%;'>
                            <tr style='font-family: Arial; font-size:14px;'>
                                <th scope='col' style="text-align: left; border-right: 1px solid #000;">INFORMACIÓN ANTERIOR <br><br></th>
                                <th scope='col' style="text-align: left;">INFORMACIÓN ACTUAL <br><br></th>
                            </tr>
 
                            <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                    <b>Motivo:</b> ${atipo_permiso} <br>     
                                </td>
                                <td style="text-align: left; color:rgb(11, 22, 121);">
                                    <b>Motivo:</b> ${tipo_permiso} <br>
                                </td>
                            </tr>
 
                            <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                    <b>Registro de solicitud:</b> ${asolicitud} <br> 
                                </td>
                                <td style="text-align: left; color:rgb(11, 22, 121);">
                                    <b>Registro de solicitud:</b> ${solicitud} <br> 
                                </td>
                            </tr>
 
                            <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                    <b>Desde:</b> ${adesde} ${ah_inicio} <br> 
                                </td>
                                <td style="text-align: left; color:rgb(11, 22, 121);">
                                    <b>Desde:</b> ${desde} ${h_inicio} <br>  
                                </td>
                            </tr>
 
                            <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                    <b>Hasta:</b> ${ahasta} ${ah_fin} <br>
                                </td>
                                <td style="text-align: left; color:rgb(11, 22, 121);">
                                    <b>Hasta:</b> ${hasta} ${h_fin} <br>  
                                </td>
                            </tr>
 
                            <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                    <b>Observación:</b> ${aobservacion} <br>
                                </td>
                                <td style="text-align: left; color:rgb(11, 22, 121);">
                                    <b>Observación:</b> ${observacion} <br> 
                                </td>
                            </tr>
 
                            <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                    <b>Días permiso:</b> ${adias_permiso} <br>
                                </td>
                                <td style="text-align: left; color:rgb(11, 22, 121);">
                                    <b>Días permiso:</b> ${dias_permiso} <br>
                                </td>
                            </tr>
 
                            <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                    <b>Horas permiso:</b> ${ahoras_permiso} <br>
                                </td>
                                <td style="text-align: left; color:rgb(11, 22, 121);">
                                    <b>Horas permiso:</b> ${horas_permiso} <br>
                                </td>
                            </tr>
 
                            <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                    <b>Estado:</b> ${aestado_p} <br><br>
                                </td>
                                <td style="text-align: left; color:rgb(11, 22, 121);">
                                    <b>Estado:</b> ${estado_p} <br><br>
                                </td>
                            </tr>
                        </table>
                        <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                            b>${tipo_solicitud}:</b> ${solicitado_por} <br><br>
                        </p>
                        <p style="font-family: Arial; font-size:12px; line-height: 1em;">
                            b>Gracias por la atención</b><br>
                            <b>Saludos cordiales,</b> <br><br>
                        </p>
                        <img src="cid:pief" width="100%" height="100%"/>
                    </body>
                    `,
                    attachments: [
                        {
                            filename: 'cabecera_firma.jpg',
                            path: `${path_folder}/${settingsMail_1.cabecera_firma}`,
                            cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                        },
                        {
                            filename: 'pie_firma.jpg',
                            path: `${path_folder}/${settingsMail_1.pie_firma}`,
                            cid: 'pief' //COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                        }
                    ]
                };
                var corr = (0, settingsMail_1.enviarMail)(settingsMail_1.servidor, parseInt(settingsMail_1.puerto));
                corr.sendMail(data, function (error, info) {
                    if (error) {
                        corr.close();
                        console.log('Email error: ' + error);
                        return res.jsonp({ message: 'error' });
                    }
                    else {
                        corr.close();
                        console.log('Email sent: ' + info.response);
                        return res.jsonp({ message: 'ok' });
                    }
                });
            }
            else {
                res.jsonp({ message: 'Ups!!! algo salio mal. No fue posible enviar correo electrónico.' + datos });
            }
        });
    }
}
// METODO PARA CREAR TABLA DE USUARIOS
const generarTablaHTMLWeb = function (datos, tipo) {
    return __awaiter(this, void 0, void 0, function* () {
        let tablaHtml = "<table style='border-collapse: collapse; width: 100%;'>";
        if (tipo === 'Dias') {
            tablaHtml += "<tr style='background-color: #f2f2f2; text-align: center; font-size: 14px;'>";
            tablaHtml += "<th scope='col'>Código</th>";
            tablaHtml += "<th scope='col'>Usuario</th>";
            tablaHtml += "<th scope='col'>Cédula</th>";
            tablaHtml += "<th scope='col'>Departamento</th>";
            tablaHtml += "<th scope='col'>Permiso</th>";
            tablaHtml += `<th scope='col'>Días permiso</th>`;
            tablaHtml += "<th scope='col'>Solicitud</th>";
            tablaHtml += "</tr>";
            for (const dato of datos) {
                tablaHtml += "<tr style='text-align: center; font-size: 14px;'>";
                tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.codigo}</td>`;
                tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.empleado}</td>`;
                tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.cedula}</td>`;
                tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.departamento}</td>`;
                tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.id_permiso}</td>`;
                tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.dias_laborables}</td>`;
                tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.estado}</td>`;
                tablaHtml += "<tr>";
            }
        }
        else {
            tablaHtml += "<tr style='background-color: #f2f2f2; text-align: center; font-size: 14px;'>";
            tablaHtml += "<th scope='col'>Código</th>";
            tablaHtml += "<th scope='col'>Usuario</th>";
            tablaHtml += "<th scope='col'>Cédula</th>";
            tablaHtml += "<th scope='col'>Departamento</th>";
            tablaHtml += "<th scope='col'>Permiso</th>";
            tablaHtml += `<th scope='col'>Horas permiso</th>`;
            tablaHtml += "<th scope='col'>Solicitud</th>";
            tablaHtml += "</tr>";
            for (const dato of datos) {
                tablaHtml += "<tr style='text-align: center; font-size: 14px;'>";
                tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.codigo}</td>`;
                tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.empleado}</td>`;
                tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.cedula}</td>`;
                tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.departamento}</td>`;
                tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.id_permiso}</td>`;
                tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.tiempo_solicitado}</td>`;
                tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.estado}</td>`;
                tablaHtml += "<tr>";
            }
        }
        tablaHtml += "</table>";
        return tablaHtml;
    });
};
function CrearPermiso(datos) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { fec_creacion, descripcion, fec_inicio, fec_final, dia, legalizado, dia_libre, id_tipo_permiso, id_empl_contrato, id_peri_vacacion, hora_numero, num_permiso, estado, id_empl_cargo, hora_salida, hora_ingreso, id_empleado, depa_user_loggin, user_name, ip, subir_documento, codigo } = datos;
            let codigoEmpleado = codigo || '';
            if (subir_documento) {
                try {
                    const { carpetaPermisos, codigo } = yield (0, accesoCarpetas_1.ObtenerRutaPermisosIdEmpleado)(id_empleado);
                    codigoEmpleado = codigo;
                    fs_1.default.access(carpetaPermisos, fs_1.default.constants.F_OK, (err) => {
                        if (err) {
                            // METODO MKDIR PARA CREAR LA CARPETA
                            fs_1.default.mkdir(carpetaPermisos, { recursive: true }, (err2) => {
                                if (err2) {
                                    console.log('Error al intentar crear carpeta de permisos.', err2);
                                    throw new Error('Error al intentar crear carpeta de permisos.');
                                }
                            });
                        }
                    });
                }
                catch (error) {
                    throw new Error('Error al intentar acceder a la carpeta de permisos.');
                }
            }
            // INICIAR TRANSACCION
            yield database_1.default.query('BEGIN');
            const response = yield database_1.default.query(`
            INSERT INTO mp_solicitud_permiso (fecha_creacion, descripcion, fecha_inicio, fecha_final, dias_permiso, 
                legalizado, dia_libre, id_tipo_permiso, id_empleado_contrato, id_periodo_vacacion, horas_permiso, 
                numero_permiso, estado, id_empleado_cargo, hora_salida, hora_ingreso, id_empleado) 
            VALUES( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17 ) 
                RETURNING * 
            `, [fec_creacion, descripcion, fec_inicio, fec_final, dia, legalizado, dia_libre,
                id_tipo_permiso, id_empl_contrato, id_peri_vacacion, hora_numero, num_permiso,
                estado, id_empl_cargo, hora_salida, hora_ingreso, id_empleado]);
            const [objetoPermiso] = response.rows;
            const fechaCreacionN = yield (0, settingsMail_1.FormatearFecha2)(fec_creacion, 'ddd');
            const fechaInicioN = yield (0, settingsMail_1.FormatearFecha2)(fec_inicio, 'ddd');
            const fechaFinalN = yield (0, settingsMail_1.FormatearFecha2)(fec_final, 'ddd');
            const horaSalidaN = yield (0, settingsMail_1.FormatearHora)(hora_salida);
            const horaIngresoN = yield (0, settingsMail_1.FormatearHora)(hora_ingreso);
            objetoPermiso.fecha_creacion = fechaCreacionN;
            objetoPermiso.fecha_inicio = fechaInicioN;
            objetoPermiso.fecha_final = fechaFinalN;
            objetoPermiso.hora_salida = horaSalidaN;
            objetoPermiso.hora_ingreso = horaIngresoN;
            objetoPermiso.codigo = codigoEmpleado;
            // AUDITORIA
            yield auditoriaControlador_1.default.InsertarAuditoria({
                tabla: 'mp_solicitud_permiso',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: JSON.stringify(objetoPermiso),
                ip, observacion: null
            });
            // FINALIZAR TRANSACCION
            yield database_1.default.query('COMMIT');
            if (!objetoPermiso)
                return { message: 'Solicitud no registrada.', error: true };
            const permiso = objetoPermiso;
            const JefesDepartamentos = yield database_1.default.query(`
            SELECT n.id_departamento, cg.nombre, n.id_departamento_nivel, n.departamento_nombre_nivel, n.nivel,
                da.estado, dae.id_contrato, da.id_empleado_cargo, (dae.nombre || ' ' || dae.apellido) as fullname,
                dae.cedula, dae.correo, c.permiso_mail, c.permiso_notificacion, dae.id AS id_aprueba 
            FROM ed_niveles_departamento AS n, ed_autoriza_departamento AS da, datos_actuales_empleado AS dae,
                eu_configurar_alertas AS c, ed_departamentos AS cg
            WHERE n.id_departamento = $1
                AND da.id_departamento = n.id_departamento_nivel
                AND dae.id_cargo = da.id_empleado_cargo
                AND dae.id = c.id_empleado
                AND cg.id = n.id_departamento
            ORDER BY nivel ASC
            `, [depa_user_loggin]).then((result) => { return result.rows; });
            if (JefesDepartamentos.length === 0) {
                return { message: 'Revisar configuración de departamento y autorización de solicitudes.', error: false, permiso };
            }
            else {
                permiso.EmpleadosSendNotiEmail = JefesDepartamentos;
                return { message: 'ok', error: false, permiso };
            }
        }
        catch (error) {
            // REVERTIR TRANSACCION
            console.log('Error al crear permiso: ', error);
            yield database_1.default.query('ROLLBACK');
            return { message: 'Error al crear permiso.', error: true };
        }
    });
}
function RegistrarDocumentoPermiso(datos) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id, codigo, nombreArchivo, user_name, ip, eliminar } = datos;
            const fecha = (0, moment_1.default)();
            const anio = fecha.format('YYYY');
            const mes = fecha.format('MM');
            const dia = fecha.format('DD');
            // INICIAR TRANSACCION
            yield database_1.default.query('BEGIN');
            // CONSULTAR DATOSORIGINALES
            const consulta = yield database_1.default.query(`SELECT * FROM mp_solicitud_permiso WHERE id = $1`, [id]);
            const [datosOriginales] = consulta.rows;
            if (!datosOriginales) {
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'mp_solicitud_permiso',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip,
                    observacion: `Error al intentar actualizar permiso con id: ${id}`
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return { message: 'Solicitud no registrada.', error: true };
            }
            const numeroPermiso = consulta.rows[0].numero_permiso;
            const documento = `${numeroPermiso}_${codigo}_${anio}_${mes}_${dia}_${nombreArchivo}`;
            const response = yield database_1.default.query(`
            UPDATE mp_solicitud_permiso SET documento = $1 WHERE id = $2 RETURNING *
            `, [documento, id]);
            const [datosNuevos] = response.rows;
            const fechaCreacionN = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_creacion, 'ddd');
            const fechaInicioO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_inicio, 'ddd');
            const fechaFinalO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_final, 'ddd');
            const fechaEdicionO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_edicion, 'ddd');
            const horaSalidaO = yield (0, settingsMail_1.FormatearHora)(datosOriginales.hora_salida);
            const horaIngresoO = yield (0, settingsMail_1.FormatearHora)(datosOriginales.hora_ingreso);
            datosOriginales.fecha_creacion = fechaCreacionN;
            datosOriginales.fecha_edicion = fechaEdicionO;
            datosOriginales.fecha_inicio = fechaInicioO;
            datosOriginales.fecha_final = fechaFinalO;
            datosOriginales.hora_salida = horaSalidaO;
            datosOriginales.hora_ingreso = horaIngresoO;
            datosNuevos.fecha_creacion = fechaCreacionN;
            datosNuevos.fecha_edicion = fechaEdicionO;
            datosNuevos.fecha_inicio = fechaInicioO;
            datosNuevos.fecha_final = fechaFinalO;
            datosNuevos.hora_salida = horaSalidaO;
            datosNuevos.hora_ingreso = horaIngresoO;
            // AUDITORIA
            yield auditoriaControlador_1.default.InsertarAuditoria({
                tabla: 'mp_solicitud_permiso',
                usuario: user_name,
                accion: 'U',
                datosOriginales: JSON.stringify(datosOriginales),
                datosNuevos: JSON.stringify(datosNuevos),
                ip, observacion: null
            });
            // FINALIZAR TRANSACCION
            yield database_1.default.query('COMMIT');
            if (eliminar === 'true') {
                yield EliminarDocumentoServidor(codigo, datosOriginales.documento);
            }
            return { message: 'Documento actualizado.', error: false, documento };
        }
        catch (error) {
            // REVERTIR TRANSACCION
            console.log('Error al registrar documento del permiso: ', error);
            yield database_1.default.query('ROLLBACK');
            return { message: 'Error al registrar documento del permiso.', error: true };
        }
    });
}
function EliminarDocumentoServidor(codigo, nombreDocumento) {
    return __awaiter(this, void 0, void 0, function* () {
        const carpetaPermisos = yield (0, accesoCarpetas_1.ObtenerRutaPermisos)(codigo);
        const separador = path_1.default.sep;
        const ruta = `${carpetaPermisos}${separador}${nombreDocumento}`;
        fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
            if (err) {
            }
            else {
                fs_1.default.unlinkSync(ruta);
            }
        });
    });
}
exports.PERMISOS_CONTROLADOR = new PermisosControlador();
exports.default = exports.PERMISOS_CONTROLADOR;
