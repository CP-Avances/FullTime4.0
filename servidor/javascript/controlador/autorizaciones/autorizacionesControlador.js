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
exports.AUTORIZACION_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../database"));
const settingsMail_1 = require("../../libs/settingsMail");
const path_1 = __importDefault(require("path"));
const auditoriaControlador_1 = __importDefault(require("../auditoria/auditoriaControlador"));
class AutorizacionesControlador {
    // METODO PARA BUSCAR AUTORIZACIONES DE PERMISOS
    ObtenerAutorizacionPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_permiso;
            const AUTORIZACIONES = yield database_1.default.query(`
            SELECT * FROM autorizaciones WHERE id_permiso = $1
            `, [id]);
            if (AUTORIZACIONES.rowCount > 0) {
                return res.jsonp(AUTORIZACIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    ListarAutorizaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const AUTORIZACIONES = yield database_1.default.query('SELECT * FROM autorizaciones ORDER BY id');
            if (AUTORIZACIONES.rowCount > 0) {
                return res.jsonp(AUTORIZACIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    ObtenerAutorizacionByVacacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_vacacion;
            const AUTORIZACIONES = yield database_1.default.query('SELECT * FROM autorizaciones WHERE id_vacacion = $1', [id]);
            if (AUTORIZACIONES.rowCount > 0) {
                return res.jsonp(AUTORIZACIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    ObtenerAutorizacionByHoraExtra(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_hora_extra;
            const AUTORIZACIONES = yield database_1.default.query('SELECT * FROM autorizaciones WHERE id_hora_extra = $1', [id]);
            if (AUTORIZACIONES.rowCount > 0) {
                return res.jsonp(AUTORIZACIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    CrearAutorizacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { orden, estado, id_departamento, id_permiso, id_vacacion, id_hora_extra, id_plan_hora_extra, id_documento, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                yield database_1.default.query('INSERT INTO autorizaciones ( orden, estado, id_departamento, ' +
                    'id_permiso, id_vacacion, id_hora_extra, id_plan_hora_extra, id_documento) ' +
                    'VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [orden, estado, id_departamento, id_permiso, id_vacacion, id_hora_extra,
                    id_plan_hora_extra, id_documento]);
                // REGISTRAR AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'autorizaciones',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `Orden: ${orden}, Estado: ${estado}, Departamento: ${id_departamento}, Permiso: ${id_permiso}, Vacacion: ${id_vacacion}, Hora Extra: ${id_hora_extra}, Plan Hora Extra: ${id_plan_hora_extra}, Documento: ${id_documento}`,
                    ip: ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Autorizacion guardado.' });
            }
            catch (error) {
                // CANCELAR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(404).jsonp({ text: 'error' });
            }
        });
    }
    ActualizarEstadoAutorizacionPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_documento, estado, id_permiso, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOS ANTES DE ACTUALIZAR PARA PODER REGISTRAR AUDITORIA
                const response = yield database_1.default.query('SELECT * FROM autorizaciones WHERE id_permiso = $1', [id_permiso]);
                const [datos] = response.rows;
                if (!datos) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'autorizaciones',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: `Estado: ${estado}, Documento: ${id_documento}`,
                        ip: ip,
                        observacion: `Error al actualizar el registro de autorizaciones con id_permiso: ${id_permiso}`
                    });
                }
                yield database_1.default.query('UPDATE autorizaciones SET estado = $1, id_documento = $2 WHERE id_permiso = $3', [estado, id_documento, id_permiso]);
                // REGISTRAR AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'autorizaciones',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: `Estado: ${datos.estado}, Documento: ${datos.id_documento}`,
                    datosNuevos: `Estado: ${estado}, Documento: ${id_documento}`,
                    ip: ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Autorizacion guardado' });
            }
            catch (error) {
                // CANCELAR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(404).jsonp({ text: 'error' });
            }
        });
    }
    ActualizarEstadoPlanificacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var tiempo = (0, settingsMail_1.fechaHora)();
            var fecha = yield (0, settingsMail_1.FormatearFecha)(tiempo.fecha_formato, settingsMail_1.dia_completo);
            var hora = yield (0, settingsMail_1.FormatearHora)(tiempo.hora);
            const path_folder = path_1.default.resolve('logos');
            var datos = yield (0, settingsMail_1.Credenciales)(parseInt(req.params.id_empresa));
            if (datos === 'ok') {
                try {
                    const id = req.params.id_plan_hora_extra;
                    //const { id_documento, estado, id_hora_extra, id_departamento } = req.body;
                    const { id_documento, estado, user_name, ip } = req.body;
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    // CONSULTAR DATOS ANTES DE ACTUALIZAR PARA PODER REGISTRAR AUDITORIA
                    const response = yield database_1.default.query('SELECT * FROM autorizaciones WHERE id_plan_hora_extra = $1', [id]);
                    const [datos] = response.rows;
                    if (!datos) {
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'autorizaciones',
                            usuario: user_name,
                            accion: 'U',
                            datosOriginales: '',
                            datosNuevos: `Estado: ${estado}, Documento: ${id_documento}`,
                            ip: ip,
                            observacion: `Error al actualizar el registro de autorizaciones con id_plan_hora_extra: ${id}`
                        });
                        // FINALIZAR TRANSACCION
                        yield database_1.default.query('COMMIT');
                        return res.status(404).jsonp({ text: 'error' });
                    }
                    yield database_1.default.query('UPDATE autorizaciones SET estado = $1, id_documento = $2 WHERE id_plan_hora_extra = $3', [estado, id_documento, id]);
                    // REGISTRAR AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'autorizaciones',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: `Estado: ${datos.estado}, Documento: ${datos.id_documento}`,
                        datosNuevos: `Estado: ${estado}, Documento: ${id_documento}`,
                        ip: ip,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.jsonp({ message: 'Autorizacion guardado' });
                    /*const JefeDepartamento = await pool.query('SELECT da.id, cg.id AS id_dep, s.id AS id_suc, cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato, e.id AS empleado, e.nombre, e.cedula, e.correo FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, sucursales AS s, empl_contratos AS ecn, empleados AS e WHERE da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND da.id_departamento = cg.id AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND ecn.id_empleado = e.id', [id_departamento]);
                    const InfoHoraExtraReenviarEstadoEmpleado = await pool.query('SELECT h.descripcion, h.fec_inicio, h.fec_final, h.fec_solicita, h.estado, h.num_hora, h.id, e.id AS empleado, e.correo, e.nombre, e.apellido, e.cedula, ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo, c.hora_extra_mail, c.hora_extra_noti FROM empleados AS e, empl_cargos AS ecr, hora_extr_pedidos AS h, config_noti AS c WHERE h.id = $1 AND h.id_empl_cargo = ecr.id AND e.id = h.id_usua_solicita AND e.id = c.id_empleado ORDER BY cargo DESC LIMIT 1', [id_hora_extra]);
            
                    const estadoAutorizacion = [
                        { id: 1, nombre: 'Pendiente' },
                        { id: 2, nombre: 'Pre-autorizado' },
                        { id: 3, nombre: 'Autorizado' },
                        { id: 4, nombre: 'Negado' },
                    ];
            
                    let nombreEstado = '';
                    estadoAutorizacion.forEach(obj => {
                        if (obj.id === estado) {
                            nombreEstado = obj.nombre
                        }
                    })
            
                    JefeDepartamento.rows.forEach(obj => {
                        var url = `${process.env.URL_DOMAIN}/horaExtraEmpleado`;
                        InfoHoraExtraReenviarEstadoEmpleado.rows.forEach(ele => {
                            let notifi_realtime = {
                                id_send_empl: obj.empleado,
                                id_receives_depa: obj.id_dep,
                                estado: nombreEstado,
                                id_permiso: null,
                                id_vacaciones: null,
                                id_hora_extra: id_hora_extra
                            }
            
                            let data = {
                                from: obj.correo,
                                to: ele.correo,
                                subject: 'Estado de la Autorización de Hora Extra',
                                html: `<p><b>${obj.nombre} ${obj.apellido}</b> jefe/a del departamento de <b>${obj.departamento}</b> con número de
                                cédula ${obj.cedula} a cambiado el estado de la Autorización de su solicitud de hora extra a: <b>${nombreEstado}</b></p>
                                <h4><b>Informacion de las vacaciones</b></h4>
                                <ul>
                                    <li><b>Empleado</b>: ${ele.nombre} ${ele.apellido} </li>
                                    <li><b>Cédula</b>: ${ele.cedula} </li>
                                    <li><b>Sucursal</b>: ${obj.sucursal} </li>
                                    <li><b>Departamento</b>: ${obj.departamento} </li>
                                    </ul>
                                <a href="${url}">Ir a verificar estado hora extra</a>`
                            };
            
                            if (ele.hora_extra_mail === true && ele.hora_extra_noti === true) {
                                 var corr = enviarMail(servidor, parseInt(puerto));
                            corr.sendMail(data, function (error: any, info: any) {
                                if (error) {
                                    console.log('Email error: ' + error);
                                    return res.jsonp({ message: 'error' });
                                } else {
                                    console.log('Email sent: ' + info.response);
                                    return res.jsonp({ message: 'ok' });
                                }
                            });
            
                                res.json({ message: 'Estado de las hora extra actualizado exitosamente', notificacion: true, realtime: [notifi_realtime] });
                            } else if (ele.hora_extra_mail === true && ele.hora_extra_noti === false) {
                                 var corr = enviarMail(servidor, parseInt(puerto));
                            corr.sendMail(data, function (error: any, info: any) {
                                if (error) {
                                    console.log('Email error: ' + error);
                                    return res.jsonp({ message: 'error' });
                                } else {
                                    console.log('Email sent: ' + info.response);
                                    return res.jsonp({ message: 'ok' });
                                }
                            });
            
                                res.json({ message: 'Estado de las hora extra actualizado exitosamente', notificacion: false, realtime: [notifi_realtime] });
                            } else if (ele.hora_extra_mail === false && ele.hora_extra_noti === true) {
                                res.json({ message: 'Estado de las hora extra actualizado exitosamente', notificacion: true, realtime: [notifi_realtime] });
                            } else if (ele.hora_extra_mail === false && ele.hora_extra_noti === false) {
                                res.json({ message: 'Estado de las hora extra actualizado exitosamente', notificacion: false, realtime: [notifi_realtime] });
                            }
            
                        });
                    });*/
                }
                catch (error) {
                    // CANCELAR TRANSACCION
                    yield database_1.default.query('ROLLBACK');
                    return res.status(404).jsonp({ text: 'error' });
                }
            }
            else {
                res.jsonp({ message: 'Ups! algo salio mal!!! No fue posible enviar correo electrónico.' });
            }
            return res.jsonp({ message: 'Autorizacion guardado' });
        });
    }
    /** ***************************************************************************************************** **
     ** **                METODO DE CAMBIO DE ESTADO DE APROBACIONES DE SOLICITUDES                        ** **
     ** ***************************************************************************************************** **/
    // METODO DE APROBACION DE SOLICITUD DE PERMISO
    ActualizarEstadoSolicitudes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { id_documento, estado, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOS ANTES DE ACTUALIZAR PARA PODER REGISTRAR AUDITORIA
                const response = yield database_1.default.query('SELECT * FROM autorizaciones WHERE id = $1', [id]);
                const [datos] = response.rows;
                if (!datos) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'autorizaciones',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: `Estado: ${estado}, Documento: ${id_documento}`,
                        ip: ip,
                        observacion: `Error al actualizar el registro de autorizaciones con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    res.status(404).jsonp({ text: 'error' });
                }
                yield database_1.default.query(`UPDATE autorizaciones SET estado = $1, id_documento = $2 WHERE id = $3`, [estado, id_documento, id]);
                // REGISTRAR AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'autorizaciones',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: `Estado: ${datos.estado}, Documento: ${datos.id_documento}`,
                    datosNuevos: `Estado: ${estado}, Documento: ${id_documento}`,
                    ip: ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro exitoso.' });
            }
            catch (error) {
                // CANCELAR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(404).jsonp({ text: 'error' });
            }
        });
    }
}
exports.AUTORIZACION_CONTROLADOR = new AutorizacionesControlador();
exports.default = exports.AUTORIZACION_CONTROLADOR;
