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
exports.ACCION_PERSONAL_CONTROLADOR = void 0;
const auditoriaControlador_1 = __importDefault(require("../auditoria/auditoriaControlador"));
const ImagenCodificacion_1 = require("../../libs/ImagenCodificacion");
const database_1 = __importDefault(require("../../database"));
const path_1 = __importDefault(require("path"));
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
const settingsMail_1 = require("../../libs/settingsMail");
class AccionPersonalControlador {
    ListarTipoAccion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ACCION = yield database_1.default.query(`
            SELECT * FROM map_tipo_accion_personal
            `);
            if (ACCION.rowCount != 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    CrearTipoAccion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { descripcion, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
                INSERT INTO map_tipo_accion_personal (descripcion) VALUES($1) RETURNING *
                `, [descripcion]);
                const [datos] = response.rows;
                if (datos) {
                    // INSERTAR REGISTRO DE AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_tipo_accion_personal',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: `{"descripcion": "${descripcion}"}`,
                        ip,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(200).jsonp(datos);
                }
                else {
                    yield database_1.default.query('ROLLBACK');
                    return res.status(500).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    CrearTipoAccionPersonal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_tipo, descripcion, base_legal, tipo_permiso, tipo_vacacion, tipo_situacion_propuesta, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
                INSERT INTO map_detalle_tipo_accion_personal (id_tipo_accion_personal, descripcion, base_legal, tipo_permiso, 
                    tipo_vacacion, tipo_situacion_propuesta) VALUES($1, $2, $3, $4, $5, $6) RETURNING*
                `, [id_tipo, descripcion, base_legal, tipo_permiso, tipo_vacacion, tipo_situacion_propuesta]);
                const [datos] = response.rows;
                if (datos) {
                    // INSERTAR REGISTRO DE AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_detalle_tipo_accion_personal',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: `
                        {
                            "id_tipo": "${id_tipo}", "descripcion": "${descripcion}", "base_legal": "${base_legal}", 
                            "tipo_permiso": "${tipo_permiso}", "tipo_vacacion": "${tipo_vacacion}", 
                            "tipo_situacion_propuesta": "${tipo_situacion_propuesta}"
                        }
                        `,
                        ip,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(200).jsonp(datos);
                }
                else {
                    yield database_1.default.query('ROLLBACK');
                    return res.status(500).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // TABLA CARGO_PROPUESTO
    ListarCargoPropuestos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ACCION = yield database_1.default.query(`
            SELECT * FROM map_cargo_propuesto
            `);
            if (ACCION.rowCount != 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    CrearCargoPropuesto(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { descripcion, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                yield database_1.default.query(`
                INSERT INTO map_cargo_propuesto (descripcion) VALUES($1)
                `, [descripcion]);
                // INSERTAR REGISTRO DE AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'map_cargo_propuesto',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{"descripcion": "${descripcion}"}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro guardado.' });
            }
            catch (error) {
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    EncontrarUltimoCargoP(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ACCION = yield database_1.default.query(`
            SELECT MAX(id) AS id FROM map_cargo_propuesto
            `);
            if (ACCION.rowCount != 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    ListarUnCargoPropuestos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const ACCION = yield database_1.default.query(`
            SELECT * FROM map_cargo_propuesto WHERE id = $1
            `, [id]);
            if (ACCION.rowCount != 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // TABLA CONTEXTO_LEGAL 
    ListarDecretos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ACCION = yield database_1.default.query(`
            SELECT * FROM map_contexto_legal
            `);
            if (ACCION.rowCount != 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    CrearDecreto(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { descripcion, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                yield database_1.default.query(`
                INSERT INTO map_contexto_legal (descripcion) VALUES($1)
                `, [descripcion]);
                // INSERTAR REGISTRO DE AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'map_contexto_legal',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{"descripcion": "${descripcion}"}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro guardado.' });
            }
            catch (error) {
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    EncontrarUltimoDecreto(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ACCION = yield database_1.default.query(`
            SELECT MAX(id) AS id FROM map_contexto_legal
            `);
            if (ACCION.rowCount != 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    ListarUnDecreto(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const ACCION = yield database_1.default.query(`
            SELECT * FROM map_contexto_legal WHERE id = $1
            `, [id]);
            if (ACCION.rowCount != 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // TABLA TIPO_ACCION_PERSONAL 
    ListarTipoAccionPersonal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ACCION = yield database_1.default.query(`
            SELECT dtap.id, dtap.id_tipo_accion_personal, dtap.descripcion, dtap.base_legal,
                dtap.tipo_permiso, dtap.tipo_vacacion, dtap.tipo_situacion_propuesta, tap.descripcion AS nombre 
            FROM map_detalle_tipo_accion_personal AS dtap, map_tipo_accion_personal AS tap 
            WHERE tap.id = dtap.id_tipo_accion_personal
            `);
            if (ACCION.rowCount != 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    ListarTipoAccionEdicion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const ACCION = yield database_1.default.query(`
            SELECT * FROM map_detalle_tipo_accion_personal WHERE NOT id_tipo_accion_personal = $1
            `, [id]);
            if (ACCION.rowCount != 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    EncontrarTipoAccionPersonalId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const ACCION = yield database_1.default.query(`
            SELECT dtap.id, dtap.id_tipo_accion_personal, dtap.descripcion, dtap.base_legal,
                dtap.tipo_permiso, dtap.tipo_vacacion, dtap.tipo_situacion_propuesta, tap.descripcion AS nombre 
            FROM map_detalle_tipo_accion_personal AS dtap, map_tipo_accion_personal AS tap 
            WHERE dtap.id = $1 AND tap.id = dtap.id_tipo_accion_personal
            `, [id]);
            if (ACCION.rowCount != 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    ActualizarTipoAccionPersonal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_tipo, descripcion, base_legal, tipo_permiso, tipo_vacacion, tipo_situacion_propuesta, id, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOS ANTES DE ACTUALIZAR PARA PODER REALIZAR EL REGISTRO EN AUDITORIA
                const response = yield database_1.default.query(`
                SELECT * FROM map_detalle_tipo_accion_personal WHERE id = $1
                `, [id]);
                const [datos] = response.rows;
                if (!datos) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_detalle_tipo_accion_personal',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar el registro con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'error' });
                }
                yield database_1.default.query(`
                UPDATE map_detalle_tipo_accion_personal SET id_tipo_accion_personal = $1, descripcion = $2, base_legal = $3, 
                    tipo_permiso = $4, tipo_vacacion = $5, tipo_situacion_propuesta = $6 WHERE id = $7
                `, [id_tipo, descripcion, base_legal, tipo_permiso, tipo_vacacion, tipo_situacion_propuesta, id]);
                // INSERTAR REGISTRO DE AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'map_detalle_tipo_accion_personal',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datos),
                    datosNuevos: `
                    {
                        "id_tipo": "${id_tipo}", "descripcion": "${descripcion}", "base_legal": "${base_legal}", 
                        "tipo_permiso": "${tipo_permiso}", "tipo_vacacion": "${tipo_vacacion}", 
                        "tipo_situacion_propuesta": "${tipo_situacion_propuesta}"
                    }
                    `,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.status(200).jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    EliminarTipoAccionPersonal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOS ANTES DE ELIMINAR PARA PODER REALIZAR EL REGISTRO EN AUDITORIA
                const response = yield database_1.default.query(`
                SELECT * FROM map_detalle_tipo_accion_personal WHERE id = $1
                `, [id]);
                const [datos] = response.rows;
                if (!datos) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_detalle_tipo_accion_personal',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar el registro con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'error' });
                }
                yield database_1.default.query(`
                DELETE FROM map_detalle_tipo_accion_personal WHERE id = $1
                `, [id]);
                // INSERTAR REGISTRO DE AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'map_detalle_tipo_accion_personal',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(datos),
                    datosNuevos: '',
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.status(200).jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // TABLA SOLICITUD ACCION PERSONAL
    CrearPedidoAccionPersonal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empleado, fec_creacion, fec_rige_desde, fec_rige_hasta, identi_accion_p, num_partida, decre_acue_resol, abrev_empl_uno, firma_empl_uno, abrev_empl_dos, firma_empl_dos, adicion_legal, tipo_accion, cargo_propuesto, proceso_propuesto, num_partida_propuesta, salario_propuesto, id_ciudad, id_empl_responsable, num_partida_individual, act_final_concurso, fec_act_final_concurso, nombre_reemp, puesto_reemp, funciones_reemp, num_accion_reemp, primera_fecha_reemp, posesion_notificacion, descripcion_pose_noti, user_name, ip } = req.body;
                let datosNuevos = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                yield database_1.default.query(`
                INSERT INTO map_solicitud_accion_personal (id_empleado, fecha_creacion, fecha_rige_desde, 
                    fecha_rige_hasta, identificacion_accion_personal, numero_partida_empresa, id_contexto_legal, 
                    titulo_empleado_uno, firma_empleado_uno, titulo_empleado_dos, firma_empleado_dos, adicion_legal, 
                    id_detalle_tipo_accion_personal, id_cargo_propuesto, id_proceso_propuesto, numero_partida_propuesta, 
                    salario_propuesto, id_ciudad, id_empleado_responsable, numero_partida_individual, acta_final_concurso, 
                    fecha_acta_final_concurso, nombre_reemplazo, puesto_reemplazo, funciones_reemplazo, 
                    numero_accion_reemplazo,primera_fecha_reemplazo, posesion_notificacion, 
                    descripcion_posesion_notificacion) 
                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 
                    $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
                `, [id_empleado, fec_creacion, fec_rige_desde, fec_rige_hasta, identi_accion_p, num_partida,
                    decre_acue_resol, abrev_empl_uno, firma_empl_uno, abrev_empl_dos, firma_empl_dos, adicion_legal,
                    tipo_accion, cargo_propuesto, proceso_propuesto, num_partida_propuesta, salario_propuesto, id_ciudad,
                    id_empl_responsable, num_partida_individual, act_final_concurso, fec_act_final_concurso, nombre_reemp,
                    puesto_reemp, funciones_reemp, num_accion_reemp, primera_fecha_reemp, posesion_notificacion,
                    descripcion_pose_noti]);
                delete datosNuevos.user_name;
                delete datosNuevos.ip;
                var fechaCreacionN = yield (0, settingsMail_1.FormatearFecha2)(fec_creacion, 'ddd');
                var fecha_rige_desdeN = yield (0, settingsMail_1.FormatearFecha2)(fec_rige_desde, 'ddd');
                var fecha_rige_hastaN = yield (0, settingsMail_1.FormatearFecha2)(fec_rige_hasta, 'ddd');
                var primera_fecha_reemplazoN = yield (0, settingsMail_1.FormatearFecha2)(primera_fecha_reemp, 'ddd');
                var fecha_acta_final_concurso = yield (0, settingsMail_1.FormatearFecha2)(fec_act_final_concurso, 'ddd');
                // INSERTAR REGISTRO DE AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'map_solicitud_accion_personal',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{id_empleado: ${id_empleado}, fecha_creacion: ${fechaCreacionN}, fecha_rige_desde: ${fecha_rige_desdeN}, 
                    fecha_rige_hasta: ${fecha_rige_hastaN}, identificacion_accion_personal: ${identi_accion_p}, numero_partida_empresa: ${num_partida}, id_contexto_legal: ${decre_acue_resol}, 
                    titulo_empleado_uno: ${abrev_empl_uno}, firma_empleado_uno: ${firma_empl_uno}, titulo_empleado_dos: ${abrev_empl_dos}, firma_empleado_dos: ${firma_empl_dos}, adicion_legal: ${adicion_legal}, 
                    id_detalle_tipo_accion_personal: ${tipo_accion}, id_cargo_propuesto: ${cargo_propuesto}, id_proceso_propuesto: ${proceso_propuesto}, numero_partida_propuesta: ${num_partida_propuesta}, 
                    salario_propuesto: ${salario_propuesto}, id_ciudad: ${id_ciudad}, id_empleado_responsable: ${id_empl_responsable}, numero_partida_individual: ${num_partida_individual}, acta_final_concurso: ${act_final_concurso}, 
                    fecha_acta_final_concurso: ${fecha_acta_final_concurso}, nombre_reemplazo: ${nombre_reemp}, puesto_reemplazo: ${puesto_reemp}, funciones_reemplazo: ${funciones_reemp}, 
                    numero_accion_reemplazo: ${num_accion_reemp},primera_fecha_reemplazo: ${primera_fecha_reemplazoN}, posesion_notificacion: ${posesion_notificacion}, 
                    descripcion_posesion_notificacion: ${descripcion_pose_noti}}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro realizado con éxito.' });
            }
            catch (error) {
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    ActualizarPedidoAccionPersonal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empleado, fec_creacion, fec_rige_desde, fec_rige_hasta, identi_accion_p, num_partida, decre_acue_resol, abrev_empl_uno, firma_empl_uno, abrev_empl_dos, firma_empl_dos, adicion_legal, tipo_accion, cargo_propuesto, proceso_propuesto, num_partida_propuesta, salario_propuesto, id_ciudad, id_empl_responsable, num_partida_individual, act_final_concurso, fec_act_final_concurso, nombre_reemp, puesto_reemp, funciones_reemp, num_accion_reemp, primera_fecha_reemp, posesion_notificacion, descripcion_pose_noti, id, user_name, ip } = req.body;
                let datosNuevos = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOS ANTES DE ACTUALIZAR PARA PODER REALIZAR EL REGISTRO EN AUDITORIA
                const response = yield database_1.default.query(`
                SELECT * FROM map_solicitud_accion_personal WHERE id = $1
                `, [id]);
                const [datos] = response.rows;
                if (!datos) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_solicitud_accion_personal',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar el registro con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'error' });
                }
                yield database_1.default.query(`
                UPDATE map_solicitud_accion_personal SET id_empleado = $1, fecha_creacion = $2, fecha_rige_desde = $3, 
                    fecha_rige_hasta = $4, identificacion_accion_personal = $5, numero_partida_empresa = $6, 
                    id_contexto_legal = $7, titulo_empleado_uno = $8, firma_empleado_uno = $9, titulo_empleado_dos = $10, 
                    firma_empleado_dos = $11, adicion_legal = $12, id_detalle_tipo_accion_personal = $13, 
                    id_cargo_propuesto = $14, id_proceso_propuesto = $15, numero_partida_propuesta = $16, 
                    salario_propuesto = $17, id_ciudad = $18, id_empleado_responsable = $19, numero_partida_individual = $20,
                    acta_final_concurso = $21, fecha_acta_final_concurso = $22, nombre_reemplazo = $23, 
                    puesto_reemplazo = $24, funciones_reemplazo = $25, numero_accion_reemplazo = $26, 
                    primera_fecha_reemplazo = $27, posesion_notificacion = $28, descripcion_posesion_notificacion = $29 
                WHERE id = $30
                `, [id_empleado, fec_creacion, fec_rige_desde, fec_rige_hasta, identi_accion_p, num_partida,
                    decre_acue_resol, abrev_empl_uno, firma_empl_uno, abrev_empl_dos, firma_empl_dos, adicion_legal,
                    tipo_accion, cargo_propuesto, proceso_propuesto, num_partida_propuesta,
                    salario_propuesto, id_ciudad, id_empl_responsable, num_partida_individual, act_final_concurso,
                    fec_act_final_concurso, nombre_reemp, puesto_reemp, funciones_reemp, num_accion_reemp,
                    primera_fecha_reemp, posesion_notificacion, descripcion_pose_noti, id]);
                delete datosNuevos.user_name;
                delete datosNuevos.ip;
                var fechaCreacionN = yield (0, settingsMail_1.FormatearFecha2)(fec_creacion, 'ddd');
                var fecha_rige_desdeN = yield (0, settingsMail_1.FormatearFecha2)(fec_rige_desde, 'ddd');
                var fecha_rige_hastaN = yield (0, settingsMail_1.FormatearFecha2)(fec_rige_hasta, 'ddd');
                var primera_fecha_reemplazoN = yield (0, settingsMail_1.FormatearFecha2)(primera_fecha_reemp, 'ddd');
                var fecha_acta_final_concursoN = yield (0, settingsMail_1.FormatearFecha2)(fec_act_final_concurso, 'ddd');
                var fechaCreacionO = yield (0, settingsMail_1.FormatearFecha2)(datos.fecha_creacion, 'ddd');
                var fecha_rige_desdeO = yield (0, settingsMail_1.FormatearFecha2)(datos.fecha_rige_desde, 'ddd');
                var fecha_rige_hastaO = yield (0, settingsMail_1.FormatearFecha2)(datos.fecha_rige_hasta, 'ddd');
                var primera_fecha_reemplazoO = yield (0, settingsMail_1.FormatearFecha2)(datos.primera_fecha_reemplazo, 'ddd');
                var fecha_acta_final_concursoO = yield (0, settingsMail_1.FormatearFecha2)(datos.fecha_acta_final_concurso, 'ddd');
                // INSERTAR REGISTRO DE AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'map_solicitud_accion_personal',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: `{id_empleado: ${datos.id_empleado}, fecha_creacion: ${fechaCreacionO}, fecha_rige_desde: ${fecha_rige_desdeO}, 
                fecha_rige_hasta: ${fecha_rige_hastaO}, identificacion_accion_personal: ${datos.identificacion_accion_personal}, numero_partida_empresa: ${datos.numero_partida_empresa}, id_contexto_legal: ${datos.id_contexto_legal}, 
                titulo_empleado_uno: ${datos.titulo_empleado_uno}, firma_empleado_uno: ${datos.firma_empleado_uno}, titulo_empleado_dos: ${datos.titulo_empleado_dos}, firma_empleado_dos: ${datos.firma_empleado_dos}, adicion_legal: ${datos.adicion_legal}, 
                id_detalle_tipo_accion_personal: ${datos.id_detalle_tipo_accion_personal}, id_cargo_propuesto: ${datos.id_cargo_propuesto}, id_proceso_propuesto: ${datos.id_proceso_propuesto}, numero_partida_propuesta: ${datos.numero_partida_propuesta}, 
                salario_propuesto: ${datos.salario_propuesto}, id_ciudad: ${datos.id_ciudad}, id_empleado_responsable: ${datos.id_empleado_responsable}, numero_partida_individual: ${datos.numero_partida_individual}, acta_final_concurso: ${datos.acta_final_concurso}, 
                fecha_acta_final_concurso: ${fecha_acta_final_concursoO}, nombre_reemplazo: ${datos.nombre_reemplazo}, puesto_reemplazo: ${datos.puesto_reemplazo}, funciones_reemplazo: ${datos.funciones_reemplazo}, 
                numero_accion_reemplazo: ${datos.numero_accion_reemplazo},primera_fecha_reemplazo: ${primera_fecha_reemplazoO}, posesion_notificacion: ${datos.posesion_notificacion}, 
                descripcion_posesion_notificacion: ${datos.descripcion_posesion_notificacion}}`,
                    datosNuevos: `{id_empleado: ${id_empleado}, fecha_creacion: ${fechaCreacionN}, fecha_rige_desde: ${fecha_rige_desdeN}, 
                fecha_rige_hasta: ${fecha_rige_hastaN}, identificacion_accion_personal: ${identi_accion_p}, numero_partida_empresa: ${num_partida}, id_contexto_legal: ${decre_acue_resol}, 
                titulo_empleado_uno: ${abrev_empl_uno}, firma_empleado_uno: ${firma_empl_uno}, titulo_empleado_dos: ${abrev_empl_dos}, firma_empleado_dos: ${firma_empl_dos}, adicion_legal: ${adicion_legal}, 
                id_detalle_tipo_accion_personal: ${tipo_accion}, id_cargo_propuesto: ${cargo_propuesto}, id_proceso_propuesto: ${proceso_propuesto}, numero_partida_propuesta: ${num_partida_propuesta}, 
                salario_propuesto: ${salario_propuesto}, id_ciudad: ${id_ciudad}, id_empleado_responsable: ${id_empl_responsable}, numero_partida_individual: ${num_partida_individual}, acta_final_concurso: ${act_final_concurso}, 
                fecha_acta_final_concurso: ${fecha_acta_final_concursoN}, nombre_reemplazo: ${nombre_reemp}, puesto_reemplazo: ${puesto_reemp}, funciones_reemplazo: ${funciones_reemp}, 
                numero_accion_reemplazo: ${num_accion_reemp},primera_fecha_reemplazo: ${primera_fecha_reemplazoN}, posesion_notificacion: ${posesion_notificacion}, 
                descripcion_posesion_notificacion: ${descripcion_pose_noti}}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    verLogoMinisterio(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const file_name = 'ministerio_trabajo.png';
            let separador = path_1.default.sep;
            let ruta = (0, accesoCarpetas_1.ObtenerRutaLogos)() + separador + file_name;
            //console.log( 'solo ruta ', ruta)
            const codificado = yield (0, ImagenCodificacion_1.ConvertirImagenBase64)(ruta);
            if (codificado === 0) {
                res.send({ imagen: 0 });
            }
            else {
                res.send({ imagen: codificado });
            }
        });
    }
    // CONSULTAS GENERACIÓN DE PDF
    EncontrarDatosEmpleados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const EMPLEADO = yield database_1.default.query(`
            SELECT d.id, d.nombre, d.apellido, d.cedula, d.codigo, d.id_cargo, 
                ec.sueldo, tc.cargo, cd.nombre AS departamento 
            FROM datos_actuales_empleado AS d, eu_empleado_cargos AS ec, e_cat_tipo_cargo AS tc, ed_departamentos AS cd 
            WHERE d.id_cargo = ec.id AND ec.id_tipo_cargo = tc.id AND ec.id_departamento = cd.id AND d.id = $1
            `, [id]);
            if (EMPLEADO.rowCount != 0) {
                return res.jsonp(EMPLEADO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    EncontrarDatosCiudades(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const CIUDAD = yield database_1.default.query(`
            SELECT * FROM e_ciudades where id = $1
            `, [id]);
            if (CIUDAD.rowCount != 0) {
                return res.json(CIUDAD.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    EncontrarPedidoAccion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const ACCION = yield database_1.default.query(`
            SELECT ap.id, ap.id_empleado, ap.fecha_creacion, ap.fecha_rige_desde, 
                ap.fecha_rige_hasta, ap.identificacion_accion_personal, ap.numero_partida_empresa, ap.id_contexto_legal,
                ap.titulo_empleado_uno, ap.firma_empleado_uno, ap.titulo_empleado_dos, ap.firma_empleado_dos, 
                ap.adicion_legal, ap.id_detalle_tipo_accion_personal, ap.id_cargo_propuesto, ap.id_proceso_propuesto, 
                ap.numero_partida_propuesta, ap.salario_propuesto, ap.id_ciudad, ap.id_empleado_responsable, 
                ap.numero_partida_individual, ap.acta_final_concurso, ap.fecha_acta_final_concurso, ap.nombre_reemplazo, 
                ap.puesto_reemplazo, ap.funciones_reemplazo, ap.numero_accion_reemplazo, ap.primera_fecha_reemplazo, 
                ap.posesion_notificacion, ap.descripcion_posesion_notificacion, tap.base_legal, tap.id_tipo_accion_personal, 
                ta.descripcion AS tipo 
            FROM map_solicitud_accion_personal AS ap, map_detalle_tipo_accion_personal AS tap, map_tipo_accion_personal AS ta 
            WHERE ap.id_detalle_tipo_accion_personal = tap.id AND ap.id = $1 AND ta.id = tap.id_tipo_accion_personal
            `, [id]);
            if (ACCION.rowCount != 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarPedidoAccion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ACCION = yield database_1.default.query(`
            SELECT ap.id, ap.id_empleado, ap.fecha_creacion, ap.fecha_rige_desde,
                ap.fecha_rige_hasta, ap.identificacion_accion_personal, ap.numero_partida_empresa, ap.id_contexto_legal, 
                ap.titulo_empleado_uno, ap.firma_empleado_uno, ap.titulo_empleado_dos, ap.firma_empleado_dos, 
                ap.adicion_legal, ap.id_detalle_tipo_accion_personal, ap.id_cargo_propuesto, ap.id_proceso_propuesto, 
                ap.numero_partida_propuesta, ap.salario_propuesto, ap.id_ciudad, ap.id_empleado_responsable, 
                ap.numero_partida_individual, ap.acta_final_concurso, ap.fecha_acta_final_concurso, ap.nombre_reemplazo, 
                ap.puesto_reemplazo, ap.funciones_reemplazo, ap.numero_accion_reemplazo, ap.primera_fecha_reemplazo, 
                ap.posesion_notificacion, ap.descripcion_posesion_notificacion, tap.base_legal, tap.id_tipo_accion_personal,
                e.codigo, e.cedula, e.nombre, e.apellido 
            FROM map_solicitud_accion_personal AS ap, map_detalle_tipo_accion_personal AS tap, eu_empleados AS e 
            WHERE ap.id_detalle_tipo_accion_personal = tap.id AND e.id = ap.id_empleado
            `);
            if (ACCION.rowCount != 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    EncontrarProcesosRecursivos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const ACCION = yield database_1.default.query(`
            WITH RECURSIVE procesos AS 
            ( 
            SELECT id, nombre, proceso_padre, 1 AS numero FROM map_cat_procesos WHERE id = $1 
            UNION ALL 
            SELECT cg.id, cg.nombre, cg.proceso_padre, procesos.numero + 1 AS numero FROM map_cat_procesos cg 
            JOIN procesos ON cg.id = procesos.proceso_padre 
            ) 
            SELECT UPPER(nombre) AS nombre, numero FROM procesos ORDER BY numero DESC
            `, [id]);
            if (ACCION.rowCount != 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
}
exports.ACCION_PERSONAL_CONTROLADOR = new AccionPersonalControlador();
exports.default = exports.ACCION_PERSONAL_CONTROLADOR;
