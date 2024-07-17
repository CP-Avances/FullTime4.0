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
exports.horaExtraPedidasControlador = void 0;
const settingsMail_1 = require("../../libs/settingsMail");
const auditoriaControlador_1 = __importDefault(require("../auditoria/auditoriaControlador"));
const database_1 = __importDefault(require("../../database"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class HorasExtrasPedidasControlador {
    // verificar uso de estado
    ListarHorasExtrasPedidas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const HORAS_EXTRAS_PEDIDAS = yield database_1.default.query(`
      SELECT h.id, h.fecha_inicio, h.fecha_final, h.estado, h.fecha_solicita, h.descripcion, h.horas_solicitud, 
        h.tiempo_autorizado, e.id AS id_usua_solicita, h.id_empleado_cargo, e.nombre, e.apellido, 
        (e.nombre || \' \' || e.apellido) AS fullname, contrato.id AS id_contrato, da.id_departamento, da.codigo, 
        depa.nombre AS depa_nombre 
      FROM mhe_solicitud_hora_extra AS h, eu_empleados AS e, eu_empleado_contratos As contrato, eu_empleado_cargos AS cargo,
        datos_actuales_empleado AS da, ed_departamentos AS depa 
      WHERE h.id_empleado_solicita = e.id AND 
        da.id_contrato = contrato.id AND depa.id = da.id_departamento AND (h.estado = 1 OR h.estado = 2) AND 
        contrato.id = cargo.id_contrato AND cargo.id = h.id_empleado_cargo AND h.observacion = false 
      ORDER BY id DESC
      `);
            if (HORAS_EXTRAS_PEDIDAS.rowCount != 0) {
                return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // verificar si se requiere uso de estado
    ListarHorasExtrasPedidasObservacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const HORAS_EXTRAS_PEDIDAS = yield database_1.default.query(`
      SELECT h.id, h.fecha_inicio, h.fecha_final, h.estado, h.fecha_solicita, h.descripcion, h.horas_solicitud, 
        h.tiempo_autorizado, e.id AS id_usua_solicita, h.id_empleado_cargo, e.nombre, e.apellido,
        (e.nombre || \' \' || e.apellido) AS fullname, contrato.id AS id_contrato, da.id_departamento, da.codigo, 
        depa.nombre AS depa_nombre 
      FROM mhe_solicitud_hora_extra AS h, eu_empleados AS e, eu_empleado_contratos As contrato, eu_empleado_cargos AS cargo, 
        datos_actuales_empleado AS da, ed_departamentos AS depa 
      WHERE h.id_empleado_solicita = e.id AND (h.estado = 1 OR h.estado = 2) AND contrato.id = cargo.id_contrato 
        AND cargo.id = h.id_empleado_cargo AND h.observacion = true AND da.id_contrato = e.id AND depa.id = da.id_departamento
      ORDER BY id DESC
      `);
            if (HORAS_EXTRAS_PEDIDAS.rowCount != 0) {
                return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // verificar si se requiere estado
    ListarHorasExtrasPedidasAutorizadas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const HORAS_EXTRAS_PEDIDAS = yield database_1.default.query(`
      SELECT h.id, h.fecha_inicio, h.fecha_final, h.estado, h.fecha_solicita, h.descripcion, h.horas_solicitud, 
        h.tiempo_autorizado, e.id AS id_usua_solicita, h.id_empleado_cargo, e.nombre, e.apellido, 
        (e.nombre || \' \' || e.apellido) AS fullname, contrato.id AS id_contrato, da.codigo, depa.nombre AS depa_nombre 
      FROM mhe_solicitud_hora_extra AS h, eu_empleados AS e, eu_empleado_contratos As contrato, eu_empleado_cargos AS cargo, 
        datos_actuales_empleado AS da, ed_departamentos AS depa 
      WHERE h.id_empleado_solicita = e.id AND (h.estado = 3 OR h.estado = 4) AND contrato.id = cargo.id_contrato 
        AND cargo.id = h.id_empleado_cargo AND da.id_contrato = e.id AND depa.id = da.id_departamento 
      ORDER BY id DESC
      `);
            if (HORAS_EXTRAS_PEDIDAS.rowCount != 0) {
                return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    ObtenerSolicitudHoraExtra(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_emple_hora;
            const SOLICITUD = yield database_1.default.query(`
      SELECT * FROM VistaSolicitudHoraExtra WHERE id_emple_hora = $1
      `, [id]);
            if (SOLICITUD.rowCount != 0) {
                return res.json(SOLICITUD.rows);
            }
            else {
                return res.status(404).json({ text: 'No se encuentran registros.' });
            }
        });
    }
    ObtenerAutorizacionHoraExtra(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_hora;
            const SOLICITUD = yield database_1.default.query(`
      SELECT a.id AS id_autorizacion, a.id_autoriza_estado AS empleado_estado, hp.id AS hora_extra 
      FROM ecm_autorizaciones AS a, mhe_solicitud_hora_extra AS hp 
      WHERE hp.id = a.id_hora_extra AND hp.id = $1
      `, [id]);
            if (SOLICITUD.rowCount != 0) {
                return res.json(SOLICITUD.rows);
            }
            else {
                return res.status(404).json({ text: 'No se encuentran registros.' });
            }
        });
    }
    ListarPedidosHE(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const HORAS_EXTRAS_PEDIDAS = yield database_1.default.query(`
      SELECT e.id AS id_empleado, e.nombre, e.apellido, e.codigo, ph.id AS id_solicitud, ph.fecha_inicio::date AS fec_inicio, 
        ph.fecha_final::date AS fec_final, ph.descripcion, ph.horas_solicitud, ph.fecha_inicio::time AS hora_inicio, 
        ph.fecha_final::time AS hora_final
      FROM mhe_solicitud_hora_extra AS ph, eu_empleados AS e 
      WHERE e.id = ph.id_empleado_solicita 
      ORDER BY e.nombre ASC, ph.fecha_inicio ASC
      `);
            if (HORAS_EXTRAS_PEDIDAS.rowCount != 0) {
                return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    ListarPedidosHEAutorizadas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const HORAS_EXTRAS_PEDIDAS = yield database_1.default.query(`
      SELECT e.id AS id_empleado, e.nombre, e.apellido, e.codigo, ph.id AS id_solicitud, ph.fecha_inicio::date AS fec_inicio, 
        ph.fecha_final::date AS fec_final, ph.descripcion, ph.tiempo_autorizado, ph.fecha_inicio::time AS hora_inicio, 
        ph.fecha_final::time AS hora_final, a.estado, a.id_autoriza_estado 
      FROM mhe_solicitud_hora_extra AS ph, eu_empleados AS e, ecm_autorizaciones AS a 
      WHERE e.id = ph.id_empleado_solicita AND a.id_hora_extra = ph.id AND a.estado = 3 
      ORDER BY e.nombre ASC, ph.fecha_inicio ASC
      `);
            if (HORAS_EXTRAS_PEDIDAS.rowCount != 0) {
                return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    ListarPedidosHE_Empleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const HORAS_EXTRAS_PEDIDAS = yield database_1.default.query(`
      SELECT e.id AS id_empleado, e.nombre, e.apellido, e.codigo, ph.id AS id_solicitud, ph.fecha_inicio::date AS fec_inicio,
        ph.fecha_final::date AS fec_final, ph.descripcion, ph.horas_solicitud, ph.fecha_inicio::time AS hora_inicio, 
        ph.fecha_final::time AS hora_fin 
      FROM mhe_solicitud_hora_extra AS ph, eu_empleados AS e 
      WHERE e.id = ph.id_empleado_solicita AND e.id = $1 
      ORDER BY e.nombre ASC, ph.fecha_inicio ASC
      `, [id_empleado]);
            if (HORAS_EXTRAS_PEDIDAS.rowCount != 0) {
                return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    ListarPedidosHEAutorizadas_Empleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const HORAS_EXTRAS_PEDIDAS = yield database_1.default.query(`
      SELECT e.id AS id_empleado, e.nombre, e.apellido, e.codigo, ph.id AS id_solicitud, ph.fecha_inicio::date fec_inicio,
        ph.fecha_final::date fec_final, ph.descripcion, ph.tiempo_autorizado, ph.fecha_inicio::time hora_inicio, 
        ph.fecha_final::time hora_final, a.estado, a.id_autoriza_estado 
      FROM mhe_solicitud_hora_extra AS ph, eu_empleados AS e, ecm_autorizaciones AS a 
      WHERE e.id = ph.id_empleado_solicita AND a.id_hora_extra = ph.id AND a.estado = 3 AND e.id = $1
      ORDER BY e.nombre ASC, ph.fecha_inicio ASC
      `, [id_empleado]);
            if (HORAS_EXTRAS_PEDIDAS.rowCount != 0) {
                HORAS_EXTRAS_PEDIDAS.rows.map((obj) => {
                    if (obj.id_autoriza_estado != null && obj.id_autoriza_estado != '' && obj.estado != 1) {
                        var autorizaciones = obj.id_autoriza_estado.split(',');
                        let empleado_id = autorizaciones[autorizaciones.length - 2].split('_')[0];
                        obj.autoriza = parseInt(empleado_id);
                    }
                });
                return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    /** ******************************************************************************* *
     **       REPORTE PARA VER INFORMACIÓN DE PLANIFICACIÓN DE HORAS EXTRAS             *
     ** ******************************************************************************* */
    ReporteVacacionesMultiple(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('datos recibidos', req.body);
            let datos = req.body;
            let { desde, hasta } = req.params;
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.departamentos = yield Promise.all(obj.departamentos.map((ele) => __awaiter(this, void 0, void 0, function* () {
                    ele.empleado = yield Promise.all(ele.empleado.map((o) => __awaiter(this, void 0, void 0, function* () {
                        o.horaE = yield BuscarHorasExtras(o.id, desde, hasta);
                        console.log('Vacaciones: ', o);
                        return o;
                    })));
                    return ele;
                })));
                return obj;
            })));
            let nuevo = n.map((obj) => {
                obj.departamentos = obj.departamentos.map((e) => {
                    e.empleado = e.empleado.filter((v) => { return v.vacaciones.length > 0; });
                    return e;
                }).filter((e) => { return e.empleado.length > 0; });
                return obj;
            }).filter(obj => { return obj.departamentos.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No se ha encontrado registro de planificaciones.' });
            return res.status(200).jsonp(nuevo);
        });
    }
    /** ************************************************************************************************* **
     ** **                       METODO PARA MANEJO DE HORAS EXTRAS                                    ** **
     ** ************************************************************************************************* **/
    // CREACIÓN DE HORAS EXTRAS
    CrearHoraExtraPedida(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empl_cargo, id_usua_solicita, fec_inicio, fec_final, fec_solicita, num_hora, descripcion, estado, observacion, tipo_funcion, depa_user_loggin, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
        INSERT INTO mhe_solicitud_hora_extra (id_empleado_cargo, id_empleado_solicita, fecha_inicio, fecha_final, 
          fecha_solicita, horas_solicitud, descripcion, estado, observacion, tipo_funcion) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
        `, [id_empl_cargo, id_usua_solicita, fec_inicio, fec_final, fec_solicita, num_hora, descripcion,
                    estado, observacion, tipo_funcion]);
                const [objetoHoraExtra] = response.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'mhe_solicitud_hora_extra',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(objetoHoraExtra),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (!objetoHoraExtra)
                    return res.status(404).jsonp({ message: 'Solicitud no registrada.' });
                const hora_extra = objetoHoraExtra;
                return res.status(200).jsonp(hora_extra);
            }
            catch (error) {
                // REVERTIR TRNASACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500)
                    .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
            }
        });
    }
    // METODO PARA EDITAR HORA EXTRA
    EditarHoraExtra(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { fec_inicio, fec_final, num_hora, descripcion, estado, tipo_funcion, depa_user_loggin, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const datosOriginales = yield database_1.default.query(`SELECT * FROM mhe_solicitud_hora_extra WHERE id = $1`, [id]);
                const [objetoHoraExtraOriginal] = datosOriginales.rows;
                if (!objetoHoraExtraOriginal) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'mhe_solicitud_hora_extra',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar hora extra con id ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'error' });
                }
                const response = yield database_1.default.query(`
          UPDATE mhe_solicitud_hora_extra SET fecha_inicio = $1, fecha_final = $2, horas_solicitud = $3, descripcion = $4, 
            estado = $5, tipo_funcion = $6 
          WHERE id = $7 RETURNING *
        `, [fec_inicio, fec_final, num_hora, descripcion, estado, tipo_funcion, id]);
                const [objetoHoraExtra] = response.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'mhe_solicitud_hora_extra',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(objetoHoraExtraOriginal),
                    datosNuevos: JSON.stringify(objetoHoraExtra),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.status(200).jsonp(objetoHoraExtra);
            }
            catch (error) {
                // REVERTIR TRNASACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // ELIMINAR REGISTRO DE HORAS EXTRAS
    EliminarHoraExtra(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_hora_extra, documento } = req.params;
                const { user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES REALTIME_NOTI
                const datosOriginalesRealTime = yield database_1.default.query('SELECT * FROM ecm_realtime_notificacion WHERE id_hora_extra = $1', [id_hora_extra]);
                const [objetoRealTime] = datosOriginalesRealTime.rows;
                if (!objetoRealTime) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ecm_realtime_notificacion',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar registro de ecm_realtime_notificacion con id_hora_extra ${id_hora_extra}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'error' });
                }
                yield database_1.default.query(`
        DELETE FROM ecm_realtime_notificacion WHERE id_hora_extra = $1
        `, [id_hora_extra]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ecm_realtime_notificacion',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(objetoRealTime),
                    datosNuevos: '',
                    ip,
                    observacion: null
                });
                // CONSULTAR DATOSORIGINALES AUTORIZACIONES
                const datosOriginalesAutorizaciones = yield database_1.default.query('SELECT * FROM ecm_autorizaciones WHERE id_hora_extra = $1', [id_hora_extra]);
                const [objetoAutorizaciones] = datosOriginalesAutorizaciones.rows;
                if (!objetoAutorizaciones) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ecm_autorizaciones',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar registro de ecm_autorizaciones con id_hora_extra ${id_hora_extra}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'error' });
                }
                yield database_1.default.query(`
        DELETE FROM ecm_autorizaciones WHERE id_hora_extra = $1
        `, [id_hora_extra]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ecm_autorizaciones',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(objetoAutorizaciones),
                    datosNuevos: '',
                    ip,
                    observacion: null
                });
                // CONSULTAR DATOS ORIGINALES SOLICITUD DE HORA EXTRA
                const datosOriginalesHoraExtra = yield database_1.default.query(`SELECT * FROM mhe_solicitud_hora_extra WHERE id = $1`, [id_hora_extra]);
                const [objetoHoraExtraOriginal] = datosOriginalesHoraExtra.rows;
                if (!objetoHoraExtraOriginal) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'mhe_solicitud_hora_extra',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar registro de mhe_solicitud_hora_extra con id ${id_hora_extra}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'error' });
                }
                const response = yield database_1.default.query(`
        DELETE FROM mhe_solicitud_hora_extra WHERE id = $1 RETURNING *
        `, [id_hora_extra]);
                const [objetoHoraExtra] = response.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'mhe_solicitud_hora_extra',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(objetoHoraExtraOriginal),
                    datosNuevos: '',
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (documento != 'null' && documento != '' && documento != null) {
                    let filePath = `servidor\\horasExtras\\${documento}`;
                    let direccionCompleta = __dirname.split("servidor")[0] + filePath;
                    // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                    fs_1.default.access(direccionCompleta, fs_1.default.constants.F_OK, (err) => {
                        if (err) {
                        }
                        else {
                            // ELIMINAR DEL SERVIDOR
                            fs_1.default.unlinkSync(direccionCompleta);
                        }
                    });
                }
                if (objetoHoraExtra) {
                    return res.status(200).jsonp(objetoHoraExtra);
                }
                else {
                    return res.status(404).jsonp({ message: 'Solicitud no eliminada.' });
                }
            }
            catch (error) {
                // REVERTIR TRNASACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // BUSCAR REGISTROS DE HORAS EXTRAS DE UN USUARIO
    ObtenerListaHora(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_user } = req.params;
            const HORAS_EXTRAS_PEDIDAS = yield database_1.default.query(`
      SELECT * FROM mhe_solicitud_hora_extra WHERE id_empleado_solicita = $1 ORDER BY id DESC
      `, [id_user]);
            if (HORAS_EXTRAS_PEDIDAS.rowCount != 0) {
                return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se han encontrado registros.' });
            }
        });
    }
    // EDITAR TIEMPO DE AUTORIZACION
    TiempoAutorizado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id_hora = parseInt(req.params.id_hora);
                const { hora, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const datosOriginales = yield database_1.default.query(`SELECT * FROM mhe_solicitud_hora_extra WHERE id = $1`, [id_hora]);
                const [objetoHoraExtraOriginal] = datosOriginales.rows;
                if (!objetoHoraExtraOriginal) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'mhe_solicitud_hora_extra',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar hora extra con id ${id_hora}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'error' });
                }
                const response = yield database_1.default.query(`
        UPDATE mhe_solicitud_hora_extra SET tiempo_autorizado = $2 WHERE id = $1 RETURNING *
        `, [id_hora, hora]);
                const [horaExtra] = response.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'mhe_solicitud_hora_extra',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(objetoHoraExtraOriginal),
                    datosNuevos: `{ tiempo_autorizado: ${hora} }`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (!horaExtra) {
                    return res.status(400)
                        .jsonp({ message: 'Upps!!! algo salio mal. Solicitud de hora extra no ingresada.' });
                }
                else {
                    return res.status(200).jsonp(horaExtra);
                }
            }
            catch (error) {
                // REVERTIR TRNASACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500)
                    .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
            }
        });
    }
    // EDITAR ESTADO DE LA SOLICITUD DE HORA EXTRA
    ActualizarEstado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { estado, usser_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const datosOriginales = yield database_1.default.query(`SELECT * FROM mhe_solicitud_hora_extra WHERE id = $1`, [id]);
                const [objetoHoraExtraOriginal] = datosOriginales.rows;
                if (!objetoHoraExtraOriginal) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'mhe_solicitud_hora_extra',
                        usuario: usser_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar hora extra con id ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'error' });
                }
                const response = yield database_1.default.query(`
          UPDATE mhe_solicitud_hora_extra SET estado = $1 WHERE id = $2 RETURNING *
        `, [estado, id]);
                const [horaExtra] = response.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'mhe_solicitud_hora_extra',
                    usuario: usser_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(objetoHoraExtraOriginal),
                    datosNuevos: `{ estado: ${estado} }`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (!horaExtra) {
                    return res.status(400)
                        .jsonp({ message: 'Upps!!! algo salio mal. Solicitud de hora extra no ingresada.' });
                }
                else {
                    return res.status(200).jsonp(horaExtra);
                }
            }
            catch (error) {
                // REVERTIR TRNASACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500)
                    .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
            }
        });
    }
    // EDITAR ESTADO DE OBSERVACION DE SOLICITUD DE HORA EXTRA
    ActualizarObservacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { observacion, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const datosOriginales = yield database_1.default.query(`SELECT * FROM mhe_solicitud_hora_extra WHERE id = $1`, [id]);
                const [objetoHoraExtraOriginal] = datosOriginales.rows;
                if (!objetoHoraExtraOriginal) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'mhe_solicitud_hora_extra',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar hora extra con id ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'error' });
                }
                const response = yield database_1.default.query(`
      UPDATE mhe_solicitud_hora_extra SET observacion = $1 WHERE id = $2 RETURNING *
      `, [observacion, id]);
                const [horaExtra] = response.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'mhe_solicitud_hora_extra',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(objetoHoraExtraOriginal),
                    datosNuevos: `{ observacion: ${observacion} }`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (!horaExtra) {
                    return res.status(400)
                        .jsonp({ message: 'Upps!!! algo salio mal. Solicitud de hora extra no ingresada.' });
                }
                else {
                    return res.status(200).jsonp(horaExtra);
                }
            }
            catch (error) {
                // REVERTIR TRNASACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500)
                    .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
            }
        });
    }
    // BUSCAR DATOS DE UNA SOLICITUD DE HORA EXTRA POR SU ID
    ObtenerUnaSolicitudHE(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const HORAS_EXTRAS_PEDIDAS = yield database_1.default.query(`
      SELECT h.id_empleado_cargo, h.id_empleado_solicita, h.fecha_inicio, h.fecha_final, h.fecha_solicita, 
        h.descripcion, h.estado, h.tipo_funcion, h.horas_solicitud, h.id, h.tiempo_autorizado,
        (e.nombre || ' ' || e.apellido) AS fullname, e.cedula     
      FROM mhe_solicitud_hora_extra AS h, eu_empleados AS e 
      WHERE h.id = $1 AND e.id = h.id_empleado_solicita
      `, [id]);
            if (HORAS_EXTRAS_PEDIDAS.rowCount != 0) {
                return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // REGISTRAR DOCUMENTO DE RESPALDO DE HORAS EXTRAS 
    GuardarDocumentoHoras(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let list = req.files;
                let doc = list.uploads[0].path.split("\\")[1];
                let { nombre } = req.params;
                let id = req.params.id;
                const { user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const datosOriginales = yield database_1.default.query(`SELECT * FROM mhe_solicitud_hora_extra WHERE id = $1`, [id]);
                const [objetoHoraExtraOriginal] = datosOriginales.rows;
                if (!objetoHoraExtraOriginal) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'mhe_solicitud_hora_extra',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar hora extra con id ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'error' });
                }
                yield database_1.default.query(`
        UPDATE mhe_solicitud_hora_extra SET documento = $2, docu_nombre = $3 WHERE id = $1
        `, [id, doc, nombre]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'mhe_solicitud_hora_extra',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(objetoHoraExtraOriginal),
                    datosNuevos: `{ documento: ${doc}, docu_nombre: ${nombre} }`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Documento Actualizado' });
            }
            catch (error) {
                // REVERTIR TRNASACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // ELIMINAR DOCUMENTO DE RESPALDO DE HORAS EXTRAS 
    EliminarDocumentoHoras(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { documento, id, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const datosOriginales = yield database_1.default.query(`SELECT * FROM mhe_solicitud_hora_extra WHERE id = $1`, [id]);
                const [objetoHoraExtraOriginal] = datosOriginales.rows;
                if (!objetoHoraExtraOriginal) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'mhe_solicitud_hora_extra',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar hora extra con id ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'error' });
                }
                yield database_1.default.query(`
        UPDATE mhe_solicitud_hora_extra SET documento = null, docu_nombre = null WHERE id = $1
        `, [id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'mhe_solicitud_hora_extra',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(objetoHoraExtraOriginal),
                    datosNuevos: `{ documento: null, docu_nombre: null }`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (documento != 'null' && documento != '' && documento != null) {
                    let filePath = `servidor\\horasExtras\\${documento}`;
                    let direccionCompleta = __dirname.split("servidor")[0] + filePath;
                    // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                    fs_1.default.access(direccionCompleta, fs_1.default.constants.F_OK, (err) => {
                        if (err) {
                        }
                        else {
                            // ELIMINAR DEL SERVIDOR
                            fs_1.default.unlinkSync(direccionCompleta);
                        }
                    });
                }
                return res.jsonp({ message: 'Documento Actualizado' });
            }
            catch (error) {
                // REVERTIR TRNASACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // ELIMINAR DOCUMENTO DE PERMISO DESDE APLICACION MOVIL
    EliminarArchivoMovil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { documento } = req.params;
            if (documento != 'null' && documento != '' && documento != null) {
                let filePath = `servidor\\horasExtras\\${documento}`;
                let direccionCompleta = __dirname.split("servidor")[0] + filePath;
                // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                fs_1.default.access(direccionCompleta, fs_1.default.constants.F_OK, (err) => {
                    if (err) {
                    }
                    else {
                        // ELIMINAR DEL SERVIDOR
                        fs_1.default.unlinkSync(direccionCompleta);
                    }
                });
            }
            res.jsonp({ message: 'ok' });
        });
    }
    // BUSQUEDA DE DOCUMENTO HORAS EXTRAS
    ObtenerDocumento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const docs = req.params.docs;
            let filePath = `servidor\\horasExtras\\${docs}`;
            res.sendFile(__dirname.split("servidor")[0] + filePath);
        });
    }
    /** ************************************************************************************************* **
     ** **          METODO PARA ENVÍO DE CORREO ELECTRÓNICO DE SOLICITUDES DE HORAS EXTRAS                **
     ** ************************************************************************************************* **/
    // METODO PARA ENVIAR CORREOS DESDE APLICACIÓN WEB
    SendMailNotifiHoraExtra(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var tiempo = (0, settingsMail_1.fechaHora)();
            var fecha = yield (0, settingsMail_1.FormatearFecha)(tiempo.fecha_formato, settingsMail_1.dia_completo);
            var hora = yield (0, settingsMail_1.FormatearHora)(tiempo.hora);
            const path_folder = path_1.default.resolve('logos');
            var datos = yield (0, settingsMail_1.Credenciales)(req.id_empresa);
            if (datos === 'ok') {
                const { id_empl_contrato, solicitud, desde, hasta, num_horas, observacion, estado_h, correo, solicitado_por, h_inicio, h_final, id, asunto, proceso, tipo_solicitud } = req.body;
                const correoInfoPideHoraExtra = yield database_1.default.query(`
        SELECT e.correo, e.nombre, e.apellido, e.cedula, 
          ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo, tc.cargo AS tipo_cargo, 
          d.nombre AS departamento 
        FROM eu_empleado_contratos AS ecn, eu_empleados AS e, eu_empleado_cargos AS ecr, e_cat_tipo_cargo AS tc, 
          ed_departamentos AS d 
        WHERE ecn.id = $1 AND ecn.id_empleado = e.id AND 
          (SELECT MAX(cargo_id) AS cargo FROM datos_empleado_cargo WHERE empl_id = e.id) = ecr.id 
          AND tc.id = ecr.id_tipo_cargo AND d.id = ecr.id_departamento 
        ORDER BY cargo DESC
        `, [id_empl_contrato]);
                console.log(correoInfoPideHoraExtra.rows);
                var url = `${process.env.URL_DOMAIN}/ver-hora-extra`;
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
                El presente correo es para informar que se ha ${proceso} la siguiente solicitud de realización de horas extras: <br>  
            </p>
            <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Empresa:</b> ${settingsMail_1.nombre} <br>   
              <b>Asunto:</b> ${asunto} <br> 
              <b>Colaborador que envía:</b> ${correoInfoPideHoraExtra.rows[0].nombre} ${correoInfoPideHoraExtra.rows[0].apellido} <br>
              <b>Número de Cédula:</b> ${correoInfoPideHoraExtra.rows[0].cedula} <br>
              <b>Cargo:</b> ${correoInfoPideHoraExtra.rows[0].tipo_cargo} <br>
              <b>Departamento:</b> ${correoInfoPideHoraExtra.rows[0].departamento} <br>
              <b>Generado mediante:</b> Aplicación Web <br>
              <b>Fecha de envío:</b> ${fecha} <br> 
              <b>Hora de envío:</b> ${hora} <br><br> 
            </p>
            <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Motivo:</b> Solicitud de Horas Extras <br>   
              <b>Fecha de Solicitud:</b> ${solicitud} <br> 
              <b>Desde:</b> ${desde} <br>
              <b>Hasta:</b> ${hasta} <br>
              <b>Horario:</b> ${h_inicio} a ${h_final} <br>
              <b>Observación:</b> ${observacion} <br>
              <b>Num. horas solicitadas:</b> ${num_horas} <br>
              <b>Estado:</b> ${estado_h} <br><br>
              <b>${tipo_solicitud}:</b> ${solicitado_por} <br><br>
              <a href="${url}/${id}">Dar clic en el siguiente enlace para revisar solicitud de realización de hora extra.</a> <br><br>                         
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
                res.jsonp({ message: 'Ups!!! algo salio mal. No fue posible enviar correo electrónico.' });
            }
        });
    }
    // METODO DE ENVÍO DE CORREO ELECTRÓNICO MEDIANTE APLICACIÓN MÓVIL
    EnviarCorreoHoraExtraMovil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var tiempo = (0, settingsMail_1.fechaHora)();
            var fecha = yield (0, settingsMail_1.FormatearFecha)(tiempo.fecha_formato, settingsMail_1.dia_completo);
            var hora = yield (0, settingsMail_1.FormatearHora)(tiempo.hora);
            const path_folder = path_1.default.resolve('logos');
            var datos = yield (0, settingsMail_1.Credenciales)(parseInt(req.params.id_empresa));
            if (datos === 'ok') {
                const { id_empl_contrato, solicitud, desde, hasta, num_horas, observacion, estado_h, correo, solicitado_por, h_inicio, h_final, asunto, proceso, tipo_solicitud } = req.body;
                const correoInfoPideHoraExtra = yield database_1.default.query(`
        SELECT e.correo, e.nombre, e.apellido, e.cedula, 
          ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo, tc.cargo AS tipo_cargo, 
          d.nombre AS departamento 
        FROM eu_empleado_contratos AS ecn, eu_empleados AS e, eu_empleado_cargos AS ecr, e_cat_tipo_cargo AS tc, 
          ed_departamentos AS d 
        WHERE ecn.id = $1 AND ecn.id_empleado = e.id AND 
          (SELECT MAX(cargo_id) AS cargo FROM datos_empleado_cargo WHERE empl_id = e.id) = ecr.id 
          AND tc.id = ecr.id_tipo_cargo AND d.id = ecr.id_departamento 
        ORDER BY cargo DESC
        `, [id_empl_contrato]);
                console.log(correoInfoPideHoraExtra.rows);
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
              El presente correo es para informar que se ha ${proceso} la siguiente solicitud de realización de horas extras: <br>  
            </p>
            <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Empresa:</b> ${settingsMail_1.nombre} <br>   
              <b>Asunto:</b> ${asunto} <br> 
              <b>Colaborador que envía:</b> ${correoInfoPideHoraExtra.rows[0].nombre} ${correoInfoPideHoraExtra.rows[0].apellido} <br>
              <b>Número de Cédula:</b> ${correoInfoPideHoraExtra.rows[0].cedula} <br>
              <b>Cargo:</b> ${correoInfoPideHoraExtra.rows[0].tipo_cargo} <br>
              <b>Departamento:</b> ${correoInfoPideHoraExtra.rows[0].departamento} <br>
              <b>Generado mediante:</b> Aplicación Móvil <br>
              <b>Fecha de envío:</b> ${fecha} <br> 
              <b>Hora de envío:</b> ${hora} <br><br> 
            </p>
            <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Motivo:</b> ${observacion} <br>   
              <b>Fecha de Solicitud:</b> ${solicitud} <br> 
              <b>Desde:</b> ${desde} <br>
              <b>Hasta:</b> ${hasta} <br>
              <b>Horario:</b> ${h_inicio} a ${h_final} <br>
              <b>Num. horas solicitadas:</b> ${num_horas} <br>
              <b>Estado:</b> ${estado_h} <br><br>
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
                res.jsonp({ message: 'Ups!!! algo salio mal. No fue posible enviar correo electrónico.' });
            }
        });
    }
}
exports.horaExtraPedidasControlador = new HorasExtrasPedidasControlador();
exports.default = exports.horaExtraPedidasControlador;
const BuscarHorasExtras = function (id, desde, hasta) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query(`
    SELECT p.fecha_desde, p.fecha_hasta, p.hora_inicio, p.hora_fin, p.descripcion, 
      p.horas_totales, e.nombre AS planifica_nombre, e.apellido AS planifica_apellido 
    FROM mhe_detalle_plan_hora_extra AS p, mhe_empleado_plan_hora_extra AS pe, eu_empleados AS e 
    WHERE p.id = pe.id_detalle_plan AND e.id = p.id_empleado_planifica AND pe.id_empleado_realiza = $1 AND 
      p.fecha_desde BETWEEN $2 AND $3
    `, [id, desde, hasta])
            .then(res => {
            return res.rows;
        });
    });
};
