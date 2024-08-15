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
exports.PLAN_COMIDAS_CONTROLADOR = void 0;
const settingsMail_1 = require("../../libs/settingsMail");
const auditoriaControlador_1 = __importDefault(require("../auditoria/auditoriaControlador"));
const builder = require('xmlbuilder');
const database_1 = __importDefault(require("../../database"));
const path_1 = __importDefault(require("path"));
class PlanComidasControlador {
    // CONSULTA DE SOLICITUDES DE SERVICIO DE ALIMENTACIÓN CON ESTADO PENDIENTE
    EncontrarSolicitaComidaNull(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const PLAN_COMIDAS = yield database_1.default.query(`
      SELECT e.apellido, e.nombre, e.cedula, e.codigo, sc.aprobada, sc.id, sc.id_empleado, sc.fecha, sc.observacion, 
        sc.fecha_comida, sc.hora_inicio, sc.hora_fin, sc.aprobada, sc.verificar, ctc.id AS id_menu, 
        ctc.nombre AS nombre_menu, tc.id AS id_servicio, tc.nombre AS nombre_servicio, dm.id AS id_detalle, dm.valor, 
        dm.nombre AS nombre_plato, dm.observacion AS observa_menu, sc.extra 
      FROM ma_solicitud_comida AS sc, ma_horario_comidas AS ctc, ma_cat_comidas AS tc, ma_detalle_comida AS dm, 
        eu_empleados AS e 
      WHERE ctc.id_comida = tc.id AND sc.verificar = \'NO\' AND e.id = sc.id_empleado AND 
        ctc.id = dm.id_horario_comida AND sc.id_detalle_comida = dm.id AND sc.fecha_comida >= current_date 
      ORDER BY sc.fecha_comida DESC
      `);
            if (PLAN_COMIDAS.rowCount != 0) {
                return res.jsonp(PLAN_COMIDAS.rows);
            }
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        });
    }
    // CONSULTA DE SOLICITUDES DE SERVICIO DE ALIMENTACIÓN CON ESTADO AUTORIZADO O NEGADO
    EncontrarSolicitaComidaAprobada(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const PLAN_COMIDAS = yield database_1.default.query(`
      SELECT e.apellido, e.nombre, e.cedula, e.codigo, sc.aprobada, sc.id, sc.id_empleado, sc.fecha, sc.observacion, 
        sc.fecha_comida, sc.hora_inicio, sc.hora_fin, sc.aprobada, sc.verificar, ctc.id AS id_menu, 
        ctc.nombre AS nombre_menu, tc.id AS id_servicio, tc.nombre AS nombre_servicio, dm.id AS id_detalle, dm.valor, 
        dm.nombre AS nombre_plato, dm.observacion AS observa_menu, sc.extra 
      FROM ma_solicitud_comida AS sc, ma_horario_comidas AS ctc, ma_cat_comidas AS tc, ma_detalle_comida AS dm, 
        eu_empleados AS e 
      WHERE ctc.id_comida = tc.id AND (sc.aprobada = true OR sc.aprobada = false) AND e.id = sc.id_empleado 
        AND ctc.id = dm.id_horario_comida AND sc.id_detalle_comida = dm.id AND sc.fecha_comida >= current_date 
      ORDER BY sc.fecha_comida DESC
      `);
            if (PLAN_COMIDAS.rowCount != 0) {
                return res.jsonp(PLAN_COMIDAS.rows);
            }
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        });
    }
    // CONSULTA DE SOLICITUDES DE SERVICIO DE ALIMENTACIÓN CON ESTADO EXPIRADO
    EncontrarSolicitaComidaExpirada(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const PLAN_COMIDAS = yield database_1.default.query(`
      SELECT e.apellido, e.nombre, e.cedula, e.codigo, sc.aprobada, sc.id, sc.id_empleado, sc.fecha, sc.observacion, 
        sc.fecha_comida, sc.hora_inicio, sc.hora_fin, sc.aprobada, sc.verificar, ctc.id AS id_menu, 
        ctc.nombre AS nombre_menu, tc.id AS id_servicio, tc.nombre AS nombre_servicio, dm.id AS id_detalle, dm.valor, 
        dm.nombre AS nombre_plato, dm.observacion AS observa_menu, sc.extra 
      FROM ma_solicitud_comida AS sc, ma_horario_comidas AS ctc, ma_cat_comidas AS tc, ma_detalle_comida AS dm, 
        eu_empleados AS e 
      WHERE ctc.id_comida = tc.id AND e.id = sc.id_empleado AND ctc.id = dm.id_horario_comida AND sc.id_detalle_comida = dm.id 
        AND sc.fecha_comida < current_date 
      ORDER BY sc.fecha_comida DESC
      `);
            if (PLAN_COMIDAS.rowCount != 0) {
                return res.jsonp(PLAN_COMIDAS.rows);
            }
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        });
    }
    BuscarSolEmpleadoFechasActualizar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, id_empleado, fecha, hora_inicio, hora_fin } = req.body;
            const PLAN_COMIDAS = yield database_1.default.query(`
      SELECT * FROM ma_solicitud_comida 
      WHERE NOT id = $1 AND id_empleado = $2 AND fecha_comida = $3 
        AND ($4 BETWEEN hora_inicio AND hora_fin OR $5 BETWEEN hora_inicio AND hora_fin)
      `, [id, id_empleado, fecha, hora_inicio, hora_fin]);
            if (PLAN_COMIDAS.rowCount != 0) {
                return res.jsonp(PLAN_COMIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA CONSULTAR SOLICITUD DE COMIDAS POR ID DE EMPLEADO     **USADO
    EncontrarSolicitaComidaIdEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const PLAN_COMIDAS = yield database_1.default.query(`
      SELECT sc.verificar, sc.aprobada, sc.id, sc.id_empleado, sc.fecha, sc.observacion, sc.fecha_comida, sc.hora_inicio, 
        sc.hora_fin, ctc.id AS id_menu, ctc.nombre AS nombre_menu, tc.id AS id_servicio, tc.nombre AS nombre_servicio, 
        dm.id AS id_detalle, dm.valor, dm.nombre AS nombre_plato, dm.observacion AS observa_menu, sc.extra 
      FROM ma_solicitud_comida AS sc, ma_horario_comidas AS ctc, ma_cat_comidas AS tc, ma_detalle_comida AS dm 
      WHERE sc.id_empleado = $1 AND ctc.id_comida = tc.id AND ctc.id = dm.id_horario_comida AND sc.id_detalle_comida = dm.id 
      ORDER BY sc.fecha_comida DESC
      `, [id_empleado]);
            if (PLAN_COMIDAS.rowCount != 0) {
                return res.jsonp(PLAN_COMIDAS.rows);
            }
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        });
    }
    // CONSULTA PARA BUSCAR TODAS LAS PLANIFICACIONES DE COMIDAS
    ListarPlanComidas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const PLAN_COMIDAS = yield database_1.default.query(`
      SELECT pc.id, pc.fecha, pc.observacion, pc.fecha_inicio, pc.fecha_final, pc.hora_inicio, pc.hora_fin, 
        ctc.id AS id_menu, ctc.nombre AS nombre_menu, tc.id AS id_servicio, tc.nombre AS nombre_servicio, 
        dm.id AS id_detalle, dm.valor, dm.nombre AS nombre_plato, dm.observacion AS observa_menu, pc.extra 
      FROM ma_detalle_plan_comida AS pc, ma_horario_comidas AS ctc, ma_cat_comidas AS tc, ma_detalle_comida AS dm 
      WHERE ctc.id_comida = tc.id AND ctc.id = dm.id_horario_comida AND pc.id_detalle_comida = dm.id 
      ORDER BY pc.fecha_inicio DESC
      `);
            if (PLAN_COMIDAS.rowCount != 0) {
                return res.jsonp(PLAN_COMIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // CONSULTA PARA CREAR UNA PLANIFICACIÓN
    CrearPlanComidas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fecha, id_comida, observacion, fec_comida, hora_inicio, hora_fin, extra, fec_inicio, fec_final, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
        INSERT INTO ma_detalle_plan_comida (fecha, id_comida, observacion, fecha_comida, hora_inicio, hora_fin, extra, 
          fecha_inicio, fecha_final) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
        `, [fecha, id_comida, observacion, fec_comida, hora_inicio, hora_fin, extra, fec_inicio, fec_final]);
                const [planAlimentacion] = response.rows;
                console.log("fecha: ", fec_inicio);
                const fechaHora = yield (0, settingsMail_1.FormatearHora)(fec_inicio.split('T')[1]);
                console.log("fecha: ", fechaHora);
                const fechaTimbre = yield (0, settingsMail_1.FormatearFecha2)(fec_inicio.toLocaleString(), 'ddd');
                console.log("fecha: ", fechaTimbre);
                console.log(fec_inicio);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ma_detalle_plan_comida',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(planAlimentacion),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (!planAlimentacion) {
                    return res.status(404).jsonp({ message: 'error' });
                }
                else {
                    return res.status(200).jsonp({ message: 'ok', info: planAlimentacion });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
            }
        });
    }
    // METODO PARA CONSULTAR DATOS DE ALIMENTACION CONSUMIDOS    **USADO
    EncontrarPlanComidaEmpleadoConsumido(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_plan_comida, id_empleado } = req.body;
            const PLAN_COMIDAS = yield database_1.default.query(`
      SELECT * FROM ma_empleado_plan_comida_general 
      WHERE id_detalle_plan = $1 AND consumido = true AND id_empleado = $2
      `, [id_plan_comida, id_empleado]);
            if (PLAN_COMIDAS.rowCount != 0) {
                return res.jsonp(PLAN_COMIDAS.rows);
            }
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        });
    }
    // BUSQUEDA DE PLANIFICACIONES POR EMPLEADO Y FECHA 
    BuscarPlanComidaEmpleadoFechas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, fecha_inicio, fecha_fin, hora_inicio, hora_fin } = req.body;
            const PLAN_COMIDAS = yield database_1.default.query(`
      SELECT * FROM ma_empleado_plan_comida_general 
      WHERE id_empleado = $1 AND fecha BETWEEN $2 AND $3
      `, [id, fecha_inicio, fecha_fin]);
            if (PLAN_COMIDAS.rowCount != 0) {
                return res.jsonp(PLAN_COMIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // CONSULTA PARA BUSCAR DATOS DE EMPLEADO Y FECHAS DE PLANIFICACIÓN SIN INCLUIR LA QUE SERA ACTUALIZADA
    ActualizarPlanComidaEmpleadoFechas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, fecha_inicio, fecha_fin, id_plan_comida } = req.body;
            const PLAN_COMIDAS = yield database_1.default.query(`
      SELECT * FROM ma_empleado_plan_comida_general WHERE NOT id_detalle_plan = $4 
        AND id_empleado = $1 AND fecha BETWEEN $2 AND $3
      `, [id, fecha_inicio, fecha_fin, id_plan_comida]);
            if (PLAN_COMIDAS.rowCount != 0) {
                return res.jsonp(PLAN_COMIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // CONSULTA PARA BUSCAR DATOS DE EMPLEADO Y FECHAS DE PLANIFICACIÓN-SOLICITUD SIN INCLUIR LA QUE SERA ACTUALIZADA
    ActualizarSolComidaEmpleadoFechas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, fecha_inicio, fecha_fin, id_sol_comida } = req.body;
            const PLAN_COMIDAS = yield database_1.default.query(`
      SELECT * FROM ma_empleado_plan_comida_general 
      WHERE NOT id_solicitud_comida = $4 AND id_empleado = $1 AND fecha BETWEEN $2 AND $3
      `, [id, fecha_inicio, fecha_fin, id_sol_comida]);
            if (PLAN_COMIDAS.rowCount != 0) {
                return res.jsonp(PLAN_COMIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    /** TABLA TIPO COMIDAS */
    ListarTipoComidas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const PLAN_COMIDAS = yield database_1.default.query(`
      SELECT * FROM ma_cat_comidas
      `);
            if (PLAN_COMIDAS.rowCount != 0) {
                return res.jsonp(PLAN_COMIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    CrearTipoComidas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
        INSERT INTO ma_cat_comidas (nombre) VALUES ($1) RETURNING *
        `, [nombre]);
                const [tipo] = response.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ma_cat_comidas',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(tipo),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (tipo) {
                    return res.status(200).jsonp(tipo);
                }
                else {
                    return res.status(404).jsonp({ message: "error" });
                }
                ;
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    /** **************************************************************************************************** **
     ** **                          METODOS DE CREACION DE SOLICITUD DE COMIDAS                           ** **
     ** **************************************************************************************************** **/
    // CONSULTA PARA REGISTRAR DATOS DE SOLICITUD DE COMIDA
    CrearSolicitaComida(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empleado, fecha, id_comida, observacion, fec_comida, hora_inicio, hora_fin, extra, verificar, id_departamento, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
        INSERT INTO ma_solicitud_comida (id_empleado, fecha, id_comida, observacion, fecha_comida,
          hora_inicio, hora_fin, extra, verificar) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
        `, [id_empleado, fecha, id_comida, observacion, fec_comida, hora_inicio, hora_fin, extra, verificar]);
                const [objetoAlimento] = response.rows;
                var fechaN = yield (0, settingsMail_1.FormatearFecha2)(fecha, 'ddd');
                var fechaComidaN = yield (0, settingsMail_1.FormatearFecha2)(fec_comida, 'ddd');
                var horaInicioN = yield (0, settingsMail_1.FormatearHora)(hora_inicio);
                var horaFinN = yield (0, settingsMail_1.FormatearHora)(hora_fin);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ma_solicitud_comida',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{id_empleado: ${id_empleado}, id_detalle_comida: ${id_comida}, fecha: ${fechaN}, fecha_comida: ${fechaComidaN}, hora_inicio: ${horaInicioN}, hora_fin: ${horaFinN}, observacion: ${observacion}, extra: ${extra}, verificar: ${verificar}} `,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (!objetoAlimento)
                    return res.status(404).jsonp({ message: 'Solicitud no registrada.' });
                const alimento = objetoAlimento;
                return res.status(200).jsonp(alimento);
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
            }
        });
    }
    // METODO DE ACTUALIZACIÓN DE SERVICIO DE ALIMENTACION
    ActualizarSolicitaComida(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empleado, fecha, id_comida, observacion, fec_comida, hora_inicio, hora_fin, extra, id, id_departamento, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const planComida = yield database_1.default.query('SELECT * FROM ma_solicitud_comida WHERE id = $1', [id]);
                const [datosOriginales] = planComida.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ma_solicitud_comida',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar solicitud de comidas con id: ${id}. Registro no encontrado`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado' });
                }
                const response = yield database_1.default.query(`
        UPDATE ma_solicitud_comida SET id_empleado = $1, fecha = $2, id_comida = $3, 
          observacion = $4, fecha_comida = $5, hora_inicio = $6, hora_fin = $7, extra = $8 
        WHERE id = $9 RETURNING *
        `, [id_empleado, fecha, id_comida, observacion, fec_comida, hora_inicio, hora_fin, extra, id]);
                const [objetoAlimento] = response.rows;
                var fechaN = yield (0, settingsMail_1.FormatearFecha2)(fecha, 'ddd');
                var fechaComidaN = yield (0, settingsMail_1.FormatearFecha2)(fec_comida, 'ddd');
                var horaInicioN = yield (0, settingsMail_1.FormatearHora)(hora_inicio);
                var horaFinN = yield (0, settingsMail_1.FormatearHora)(hora_fin);
                var fechaO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha, 'ddd');
                var fechaComidaO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_comida, 'ddd');
                var horaInicioO = yield (0, settingsMail_1.FormatearHora)(datosOriginales.hora_inicio);
                var horaFinO = yield (0, settingsMail_1.FormatearHora)(datosOriginales.hora_fin);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ma_solicitud_comida',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: `{id_empleado: ${datosOriginales.id_empleado}, id_detalle_comida: ${datosOriginales.id_detalle_comida}, fecha: ${fechaO}, fecha_comida: ${fechaComidaO}, hora_inicio: ${horaInicioO}, hora_fin: ${horaFinO}, observacion: ${datosOriginales.observacion}, extra: ${datosOriginales.extra}, verificar: ${datosOriginales.verificar}} `,
                    datosNuevos: `{id_empleado: ${id_empleado}, id_detalle_comida: ${id_comida}, fecha: ${fechaN}, fecha_comida: ${fechaComidaN}, hora_inicio: ${horaInicioN}, hora_fin: ${horaFinN}, observacion: ${observacion}, extra: ${extra}}} `,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (!objetoAlimento)
                    return res.status(404).jsonp({ message: 'Solicitud no registrada.' });
                const alimento = objetoAlimento;
                return res.status(200).jsonp(alimento);
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // ELIMINAR REGISTRO DE SOLIICTUD DE COMIDA
    EliminarSolicitudComida(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_name, ip } = req.body;
                const id = req.params.id;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const planComida = yield database_1.default.query('SELECT * FROM ma_solicitud_comida WHERE id = $1', [id]);
                const [datosOriginales] = planComida.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ma_solicitud_comida',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar solicitud de comidas con id: ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado' });
                }
                const response = yield database_1.default.query(`
        DELETE FROM ma_solicitud_comida WHERE id = $1 RETURNING *
        `, [id]);
                const [alimentacion] = response.rows;
                var fechaO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha, 'ddd');
                var fechaComidaO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_comida, 'ddd');
                var horaInicioO = yield (0, settingsMail_1.FormatearHora)(datosOriginales.hora_inicio);
                var horaFinO = yield (0, settingsMail_1.FormatearHora)(datosOriginales.hora_fin);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ma_solicitud_comida',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: `{id_empleado: ${datosOriginales.id_empleado}, id_detalle_comida: ${datosOriginales.id_detalle_comida}, fecha: ${fechaO}, fecha_comida: ${fechaComidaO}, hora_inicio: ${horaInicioO}, hora_fin: ${horaFinO}, observacion: ${datosOriginales.observacion}, extra: ${datosOriginales.extra}, verificar: ${datosOriginales.verificar}} `,
                    datosNuevos: '',
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (alimentacion) {
                    return res.status(200).jsonp(alimentacion);
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
    // METODO PARA ACTUALIZAR ESTADO DE SOLICITUD DE ALIMENTACION
    AprobarSolicitaComida(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { aprobada, verificar, id, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const planComida = yield database_1.default.query('SELECT * FROM ma_solicitud_comida WHERE id = $1', [id]);
                const [datosOriginales] = planComida.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ma_solicitud_comida',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar estado de solicitud de comidas con id: ${id}. Registro no encontrado`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado' });
                }
                const response = yield database_1.default.query(`
        UPDATE ma_solicitud_comida SET aprobada = $1, verificar = $2 WHERE id = $3 RETURNING *
        `, [aprobada, verificar, id]);
                const [objetoAlimento] = response.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ma_solicitud_comida',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(objetoAlimento),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (objetoAlimento) {
                    return res.status(200).jsonp(objetoAlimento);
                }
                else {
                    return res.status(404).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    //  CREAR REGISTRO DE ALIMENTOS APROBADOS POR EMPLEADO
    CrearComidaAprobada(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empleado, id_sol_comida, fecha, hora_inicio, hora_fin, consumido, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
        INSERT INTO ma_empleado_plan_comida_general (id_empleado, id_solicitud_comida, fecha,
          hora_inicio, hora_fin, consumido) 
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `, [id_empleado, id_sol_comida, fecha, hora_inicio, hora_fin, consumido]);
                const [objetoAlimento] = response.rows;
                var fechaN = yield (0, settingsMail_1.FormatearFecha2)(fecha, 'ddd');
                var horaInicio = yield (0, settingsMail_1.FormatearHora)(hora_inicio);
                var horaFin = yield (0, settingsMail_1.FormatearHora)(hora_fin);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ma_empleado_plan_comida_general',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `id_empleado: ${id_empleado}, id_detalle_plan: null, id_solicitud_comida: ${id_sol_comida}, fecha: ${fechaN}, hora_inicio: ${horaInicio}, hora_fin: ${horaFin}, ticket: null, consumido: ${consumido}}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (objetoAlimento) {
                    return res.status(200).jsonp(objetoAlimento);
                }
                else {
                    return res.status(404).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // ELIMINAR ALIMENTACION APROBADA
    EliminarComidaAprobada(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const fecha = req.params.fecha;
                const id_empleado = req.params.id_empleado;
                const { user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const planComida = yield database_1.default.query(`
        SELECT * FROM ma_empleado_plan_comida_general WHERE id_solicitud_comida = $1 AND fecha = $2 AND id_empleado = $3
        `, [id, fecha, id_empleado]);
                const [datosOriginales] = planComida.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ma_empleado_plan_comida_general',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar registro de planificación de comidas con id: ${id}. Registro no encontrado`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado' });
                }
                const response = yield database_1.default.query(`
        DELETE FROM ma_empleado_plan_comida_general 
        WHERE id_solicitud_comida = $1 AND fecha = $2 AND id_empleado = $3
        RETURNING *
        `, [id, fecha, id_empleado]);
                const [objetoAlimento] = response.rows;
                var fechaN = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha, 'ddd');
                var horaInicio = yield (0, settingsMail_1.FormatearHora)(datosOriginales.hora_inicio);
                var horaFin = yield (0, settingsMail_1.FormatearHora)(datosOriginales.hora_fin);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ma_empleado_plan_comida_general',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: `{codigo: ${datosOriginales.codigo}, id_empleado: ${datosOriginales.id_empleado}, id_detalle_plan: ${datosOriginales.id_detalle_plan}, id_solicitud_comida: ${datosOriginales.id_solicitud_comida}, fecha: ${fechaN}, hora_inicio: ${horaInicio}, hora_fin: ${horaFin}, ticket: ${datosOriginales.ticket}, consumido: ${datosOriginales.consumido}}`,
                    datosNuevos: '',
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (objetoAlimento) {
                    return res.status(200).jsonp(objetoAlimento);
                }
                else {
                    return res.status(404).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // ELIMINAR REGISTRO DE ALIMENTACION
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_name, ip } = req.body;
                const id = req.params.id;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const planComida = yield database_1.default.query('SELECT * FROM ma_detalle_plan_comida WHERE id = $1', [id]);
                const [datosOriginales] = planComida.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ma_detalle_plan_comida',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar registro de planificación de comidas con id: ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado' });
                }
                yield database_1.default.query(`
        DELETE FROM ma_detalle_plan_comida WHERE id = $1
        `, [id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ma_detalle_plan_comida',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: '',
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // ELIMINAR PLANIFICACION DE UN USUARIO ESPECIFICO    **USADO
    EliminarPlanComidaEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_name, ip } = req.body;
                const id = req.params.id;
                const id_empleado = req.params.id_empleado;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const planComida = yield database_1.default.query(`
        SELECT * FROM ma_empleado_plan_comida_general WHERE id_detalle_plan = $1 AND id_empleado = $2
        `, [id, id_empleado]);
                const [datosOriginales] = planComida.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ma_empleado_plan_comida_general',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar registro de planificación de comidas con id: ${id}. Registro no encontrado`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado' });
                }
                yield database_1.default.query(`
        DELETE FROM ma_empleado_plan_comida_general WHERE id_detalle_plan = $1 AND id_empleado = $2
        `, [id, id_empleado]);
                var fechaN = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha, 'ddd');
                var horaInicio = yield (0, settingsMail_1.FormatearHora)(datosOriginales.hora_inicio);
                var horaFin = yield (0, settingsMail_1.FormatearHora)(datosOriginales.hora_fin);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ma_empleado_plan_comida_general',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: `{codigo: ${datosOriginales.codigo}, id_empleado: ${datosOriginales.id_empleado}, id_detalle_plan: ${datosOriginales.id_detalle_plan}, id_solicitud_comida: ${datosOriginales.id_solicitud_comida}, fecha: ${fechaN}, hora_inicio: ${horaInicio}, hora_fin: ${horaFin}, ticket: ${datosOriginales.ticket}, consumido: ${datosOriginales.consumido}}`,
                    datosNuevos: '',
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // BUSQUEDA DE PLANIFICCAIONES DE ALIMENTACION POR ID DE PLANIFICACION
    EncontrarPlanComidaIdPlan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const PLAN_COMIDAS = yield database_1.default.query(`
      SELECT DISTINCT pc.id, pce.id_empleado, pc.fecha, pc.observacion, pc.fecha_inicio, pc.fecha_final, pc.hora_inicio, 
        pc.hora_fin, (e.nombre || ' ' || e.apellido) AS nombre, e.codigo, e.cedula, e.correo, ctc.id AS id_menu, 
        ctc.nombre AS nombre_menu, tc.id AS id_servicio, tc.nombre AS nombre_servicio, dm.id AS id_detalle, dm.valor, 
        dm.nombre AS nombre_plato, dm.observacion AS observa_menu, pc.extra 
      FROM ma_detalle_plan_comida AS pc, ma_empleado_plan_comida_general AS pce, ma_horario_comidas AS ctc, 
        ma_cat_comidas AS tc, ma_detalle_comida AS dm, eu_empleados AS e 
      WHERE pc.id = $1 AND ctc.id_comida = tc.id AND ctc.id = dm.id_horario_comida AND pc.id_detalle_comida = dm.id 
        AND pc.id = pce.id_detalle_plan AND e.id = pce.id_empleado 
      ORDER BY pc.fecha_inicio DESC
      `, [id]);
            if (PLAN_COMIDAS.rowCount != 0) {
                return res.jsonp(PLAN_COMIDAS.rows);
            }
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        });
    }
    // CREAR PLANIFICACIÓN POR EMPLEADO
    CrearPlanEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empleado, id_plan_comida, fecha, hora_inicio, hora_fin, consumido, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('COMMIT');
                const response = yield database_1.default.query(`
        INSERT INTO ma_empleado_plan_comida_general (id_empleado, id_detalle_plan, fecha, 
          hora_inicio, hora_fin, consumido) 
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `, [id_empleado, id_plan_comida, fecha, hora_inicio, hora_fin, consumido]);
                const [planAlimentacion] = response.rows;
                var fechaN = yield (0, settingsMail_1.FormatearFecha2)(fecha, 'ddd');
                var horaInicio = yield (0, settingsMail_1.FormatearHora)(hora_inicio);
                var horaFin = yield (0, settingsMail_1.FormatearHora)(hora_fin);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ma_empleado_plan_comida_general',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `id_empleado: ${id_empleado}, id_detalle_plan: ${id_plan_comida}, id_solicitud_comida: null, fecha: ${fechaN}, hora_inicio: ${horaInicio}, hora_fin: ${horaFin}, ticket: null, consumido: ${consumido}}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.jsonp({ message: 'Planificación del almuerzo ha sido guardada con éxito' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA BUSCAR DATOS DE PLANIFICACION DE ALIMENTACION POR ID DE USUARIO     **USADO
    EncontrarPlanComidaIdEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const PLAN_COMIDAS = yield database_1.default.query(`
      SELECT DISTINCT pc.id, pce.id_empleado, pc.fecha, pc.observacion, pc.fecha_inicio, pc.fecha_final, pc.hora_inicio, 
        pc.hora_fin, ctc.id AS id_menu, ctc.nombre AS nombre_menu, tc.id AS id_servicio, tc.nombre AS nombre_servicio, 
        dm.id AS id_detalle, dm.valor, dm.nombre AS nombre_plato, dm.observacion AS observa_menu, pc.extra, e.codigo, 
        e.cedula, e.correo, (e.nombre || ' ' || e.apellido) AS nombre
      FROM ma_detalle_plan_comida AS pc, ma_empleado_plan_comida_general AS pce, ma_horario_comidas AS ctc, 
        ma_cat_comidas AS tc, ma_detalle_comida AS dm, eu_empleados AS e 
	    WHERE pce.id_empleado = $1 AND ctc.id_comida = tc.id AND ctc.id = dm.id_horario_comida AND pc.id_detalle_comida = dm.id 
        AND pc.id = pce.id_detalle_plan AND e.id = pce.id_empleado
	    ORDER BY pc.fecha_inicio DESC
      `, [id_empleado]);
            if (PLAN_COMIDAS.rowCount != 0) {
                return res.jsonp(PLAN_COMIDAS.rows);
            }
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        });
    }
    /** ********************************************************************************************** **
     ** *              ENVIO DE NOTIFICACIONES DE SERVICIOS DE ALIMENTACION                          * **
     ** ********************************************************************************************** **/
    // NOTIFICACIONES DE SOLICITUDES Y PLANIFICACION DE SERVICIO DE ALIMENTACION   **USADO
    EnviarNotificacionComidas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { id_empl_envia, id_empl_recive, mensaje, tipo, id_comida, user_name, ip } = req.body;
                var tiempo = (0, settingsMail_1.fechaHora)();
                let create_at = tiempo.fecha_formato + ' ' + tiempo.hora;
                const SERVICIO_SOLICITADO = yield database_1.default.query(`
        SELECT tc.nombre AS servicio, ctc.nombre AS menu, ctc.hora_inicio, ctc.hora_fin, 
          dm.nombre AS comida, dm.valor, dm.observacion 
        FROM ma_cat_comidas AS tc, ma_horario_comidas AS ctc, ma_detalle_comida AS dm 
        WHERE tc.id = ctc.id_comida AND ctc.id = dm.id_horario_comida AND dm.id = $1
        `, [id_comida]);
                let notifica = mensaje + SERVICIO_SOLICITADO.rows[0].servicio;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
        INSERT INTO ecm_realtime_timbres (fecha_hora, id_empleado_envia, id_empleado_recibe, descripcion, tipo) 
        VALUES($1, $2, $3, $4, $5) 
        RETURNING *
        `, [create_at, id_empl_envia, id_empl_recive, notifica, tipo]);
                const [notificiacion] = response.rows;
                const fechaHoraN = yield (0, settingsMail_1.FormatearHora)(create_at.toLocaleString().split(' ')[1]);
                const fechaN = yield (0, settingsMail_1.FormatearFecha2)(create_at.toLocaleString(), 'ddd');
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ecm_realtime_timbres',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `id_empleado_envia: ${id_empl_envia}, id_empleado_recibe: ${id_empl_recive}, fecha_hora: ${fechaN + ' ' + fechaHoraN}, descripcion: ${notifica}, id_timbre: null, visto: null, tipo: ${tipo}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (!notificiacion)
                    return res.status(400).jsonp({ message: 'Notificación no ingresada.' });
                const USUARIO = yield database_1.default.query(`
        SELECT (nombre || ' ' || apellido) AS usuario
        FROM eu_empleados WHERE id = $1
        `, [id_empl_envia]);
                notificiacion.usuario = USUARIO.rows[0].usuario;
                return res.status(200)
                    .jsonp({ message: 'Se ha enviado la respectiva notificación.', respuesta: notificiacion });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    /** ******************************************************************************************** **
     ** *            METODO ENVÍO DE CORREO ELECTRÓNICO DE SOLICITUDES DE ALIMENTACIÓN             * **
     ** ******************************************************************************************** **/
    // ENVIAR CORRE ELECTRÓNICO INDICANDO QUE SE HA REALIZADO UNA SOLICITUD DE COMIDA MEDIANTE APP WEB
    EnviarCorreoComidas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var tiempo = (0, settingsMail_1.fechaHora)();
            var fecha = yield (0, settingsMail_1.FormatearFecha)(tiempo.fecha_formato, settingsMail_1.dia_completo);
            var hora = yield (0, settingsMail_1.FormatearHora)(tiempo.hora);
            const path_folder = path_1.default.resolve('logos');
            var datos = yield (0, settingsMail_1.Credenciales)(req.id_empresa);
            if (datos === 'ok') {
                const { id_usua_solicita, correo, fec_solicitud, id_comida, inicio, final, observacion, extra, solicitado_por, asunto, tipo_solicitud, proceso, estadoc } = req.body;
                var tipo_servicio = 'Extra';
                if (extra === false) {
                    tipo_servicio = 'Normal';
                }
                const EMPLEADO_SOLICITA = yield database_1.default.query(`
        SELECT e.correo, e.nombre, e.apellido, e.cedula, ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo, 
          tc.cargo AS tipo_cargo, d.nombre AS departamento 
        FROM eu_empleados AS e, eu_empleado_cargos AS ecr, e_cat_tipo_cargo AS tc, ed_departamentos AS d 
        WHERE (SELECT id_cargo FROM contrato_cargo_vigente WHERE id_empleado = e.id) = ecr.id 
          AND tc.id = ecr.id_tipo_cargo AND d.id = ecr.id_departamento AND e.id = $1 
        ORDER BY cargo DESC
        `, [id_usua_solicita]);
                const SERVICIO_SOLICITADO = yield database_1.default.query(`
        SELECT tc.nombre AS servicio, ctc.nombre AS menu, ctc.hora_inicio, ctc.hora_fin, 
          dm.nombre AS comida, dm.valor, dm.observacion 
        FROM ma_cat_comidas AS tc, ma_horario_comidas AS ctc, ma_detalle_comida AS dm 
        WHERE tc.id = ctc.id_comida AND ctc.id = dm.id_horario_comida AND dm.id = $1
        `, [id_comida]);
                console.log(EMPLEADO_SOLICITA.rows);
                var url = `${process.env.URL_DOMAIN}/listaSolicitaComida`;
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
              El presente correo es para informar que se ha ${proceso} la siguiente solicitud de servicio de alimentación: <br>  
            </p>
            <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Empresa:</b> ${settingsMail_1.nombre} <br>   
              <b>Asunto:</b> ${asunto} <br> 
              <b>Colaborador que envía:</b> ${EMPLEADO_SOLICITA.rows[0].nombre} ${EMPLEADO_SOLICITA.rows[0].apellido} <br>
              <b>Número de Cédula:</b> ${EMPLEADO_SOLICITA.rows[0].cedula} <br>
              <b>Cargo:</b> ${EMPLEADO_SOLICITA.rows[0].tipo_cargo} <br>
              <b>Departamento:</b> ${EMPLEADO_SOLICITA.rows[0].departamento} <br>
              <b>Generado mediante:</b> Aplicación Web <br>
              <b>Fecha de envío:</b> ${fecha} <br> 
              <b>Hora de envío:</b> ${hora} <br><br> 
            </p>
            <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Motivo:</b> ${observacion} <br>   
              <b>Fecha de Solicitud:</b> ${fec_solicitud} <br> 
              <b>Servicio:</b> ${SERVICIO_SOLICITADO.rows[0].servicio} <br>
              <b>Menú:</b> ${SERVICIO_SOLICITADO.rows[0].menu} - ${SERVICIO_SOLICITADO.rows[0].comida} <br>
              <b>Detalle del servicio:</b> ${SERVICIO_SOLICITADO.rows[0].observacion} <br>
              <b>Servicio desde:</b> ${inicio} <br>
              <b>Servicio hasta:</b> ${final} <br>
              <b>Tipo de servicio:</b> ${tipo_servicio} <br>
              <b>Estado:</b> ${estadoc} <br><br>
              <b>${tipo_solicitud}:</b> ${solicitado_por} <br><br>
              <a href="${url}">Dar clic en el siguiente enlace para revisar solicitud de servicio de alimentación.</a> <br><br>
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
    // METODO DE ENVIO DE CORREO ELECTRÓNICO MEDIANTE APLICACIÓN MÓVIL
    EnviarCorreoComidasMovil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var tiempo = (0, settingsMail_1.fechaHora)();
            var fecha = yield (0, settingsMail_1.FormatearFecha)(tiempo.fecha_formato, settingsMail_1.dia_completo);
            var hora = yield (0, settingsMail_1.FormatearHora)(tiempo.hora);
            const path_folder = path_1.default.resolve('logos');
            var datos = yield (0, settingsMail_1.Credenciales)(parseInt(req.params.id_empresa));
            if (datos === 'ok') {
                const { id_usua_solicita, correo, fec_solicitud, id_comida, inicio, final, observacion, extra, solicitado_por, asunto, tipo_solicitud, proceso, estadoc } = req.body;
                var tipo_servicio = 'Extra';
                if (extra === false) {
                    tipo_servicio = 'Normal';
                }
                const EMPLEADO_SOLICITA = yield database_1.default.query(`
          SELECT e.correo, e.nombre, e.apellido, e.cedula, ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo, 
            tc.cargo AS tipo_cargo, d.nombre AS departamento 
          FROM eu_empleados AS e, eu_empleado_cargos AS ecr, e_cat_tipo_cargo AS tc, ed_departamentos AS d
          WHERE (SELECT id_cargo FROM contrato_cargo_vigente WHERE id_empleado = e.id) = ecr.id 
            AND tc.id = ecr.id_tipo_cargo AND d.id = ecr.id_departamento AND e.id = $1 
          ORDER BY cargo DESC
        `, [id_usua_solicita]);
                const SERVICIO_SOLICITADO = yield database_1.default.query(`
          SELECT tc.nombre AS servicio, ctc.nombre AS menu, ctc.hora_inicio, ctc.hora_fin, dm.nombre AS comida, dm.valor, 
            dm.observacion 
          FROM ma_cat_comidas AS tc, ma_horario_comidas AS ctc, ma_detalle_comida AS dm 
          WHERE tc.id = ctc.id_comida AND ctc.id = dm.id_horario_comida AND dm.id = $1
        `, [id_comida]);
                console.log(EMPLEADO_SOLICITA.rows);
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
              El presente correo es para informar que se ha ${proceso} la siguiente solicitud de servicio de alimentación: <br>  
            </p>
            <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Empresa:</b> ${settingsMail_1.nombre} <br>   
              <b>Asunto:</b> ${asunto} <br> 
              <b>Colaborador que envía:</b> ${EMPLEADO_SOLICITA.rows[0].nombre} ${EMPLEADO_SOLICITA.rows[0].apellido} <br>
              <b>Número de Cédula:</b> ${EMPLEADO_SOLICITA.rows[0].cedula} <br>
              <b>Cargo:</b> ${EMPLEADO_SOLICITA.rows[0].tipo_cargo} <br>
              <b>Departamento:</b> ${EMPLEADO_SOLICITA.rows[0].departamento} <br>
              <b>Generado mediante:</b> Aplicación Móvil <br>
              <b>Fecha de envío:</b> ${fecha} <br> 
              <b>Hora de envío:</b> ${hora} <br><br> 
            </p>
            <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Motivo:</b> ${observacion} <br>   
              <b>Fecha de Solicitud:</b> ${fec_solicitud} <br> 
              <b>Servicio:</b> ${SERVICIO_SOLICITADO.rows[0].servicio} <br>
              <b>Menú:</b> ${SERVICIO_SOLICITADO.rows[0].menu} - ${SERVICIO_SOLICITADO.rows[0].comida} <br>
              <b>Detalle del servicio:</b> ${SERVICIO_SOLICITADO.rows[0].observacion} <br>
              <b>Servicio desde:</b> ${inicio} <br>
              <b>Servicio hasta:</b> ${final} <br>
              <b>Tipo de servicio:</b> ${tipo_servicio} <br>
              <b>Estado:</b> ${estadoc} <br><br>
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
    /** ************************************************************************************************ **
     ** **    METODOS DE ENVIO DE CORREO ELECTRONICO DE PLANIFICACION DE SERVICIOS DE ALIMENTACION    ** **
     ** ************************************************************************************************ **/
    // ENVIAR CORREO ELECTRONICO DE PLANIFICACION DE COMIDA APLICACION WEB  **USADO
    EnviarCorreoPlanComidas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var tiempo = (0, settingsMail_1.fechaHora)();
            var fecha = yield (0, settingsMail_1.FormatearFecha)(tiempo.fecha_formato, settingsMail_1.dia_completo);
            var hora = yield (0, settingsMail_1.FormatearHora)(tiempo.hora);
            const path_folder = path_1.default.resolve('logos');
            var datos = yield (0, settingsMail_1.Credenciales)(req.id_empresa);
            if (datos === 'ok') {
                const { id_envia, desde, hasta, inicio, final, correo, id_comida, observacion, extra, nombres, asunto, tipo_solicitud, proceso } = req.body;
                var tipo_servicio = 'Extra';
                if (extra === false) {
                    tipo_servicio = 'Normal';
                }
                const Envia = yield database_1.default.query(`
        SELECT da.nombre, da.apellido, da.cedula, da.correo, da.name_cargo AS tipo_cargo, 
          da.name_dep AS departamento
        FROM informacion_general AS da
        WHERE da.id = $1
        `, [id_envia]).then((resultado) => { return resultado.rows[0]; });
                const SERVICIO_SOLICITADO = yield database_1.default.query(`
        SELECT tc.nombre AS servicio, ctc.nombre AS menu, ctc.hora_inicio, ctc.hora_fin, dm.nombre AS comida, dm.valor, 
          dm.observacion 
        FROM ma_cat_comidas AS tc, ma_horario_comidas AS ctc, ma_detalle_comida AS dm 
        WHERE tc.id = ctc.id_comida AND ctc.id = dm.id_horario_comida AND dm.id = $1
        `, [id_comida]);
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
              El presente correo es para informar que se ha ${proceso} la siguiente planificación de servicio de alimentación: <br>  
            </p>
            <h3 style="font-family: Arial; text-align: center;">DATOS DEL COLABORADOR QUE ${tipo_solicitud} PLANIFICACIÓN DE ALIMENTACIÓN</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Empresa:</b> ${settingsMail_1.nombre} <br>   
              <b>Asunto:</b> ${asunto} <br> 
              <b>Colaborador que envía:</b> ${Envia.nombre} ${Envia.apellido} <br>
              <b>Número de Cédula:</b> ${Envia.cedula} <br>
              <b>Cargo:</b> ${Envia.tipo_cargo} <br>
              <b>Departamento:</b> ${Envia.departamento} <br>
              <b>Generado mediante:</b> Aplicación Web <br>
              <b>Fecha de envío:</b> ${fecha} <br> 
              <b>Hora de envío:</b> ${hora} <br><br> 
            </p>
            <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA PLANIFICACIÓN</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Motivo:</b> ${observacion} <br>   
              <b>Fecha de Planificación:</b> ${fecha} <br> 
              <b>Desde:</b> ${desde} <br>
              <b>Hasta:</b> ${hasta} <br>
              <b>Horario:</b> ${inicio} a ${final} <br>
              <b>Servicio:</b> ${SERVICIO_SOLICITADO.rows[0].servicio} <br>
              <b>Menú:</b> ${SERVICIO_SOLICITADO.rows[0].menu} - ${SERVICIO_SOLICITADO.rows[0].comida} <br>
              <b>Detalle del servicio:</b> ${SERVICIO_SOLICITADO.rows[0].observacion} <br>
              <b>Servicio desde:</b> ${inicio} <br>
              <b>Servicio hasta:</b> ${final} <br>
              <b>Tipo de servicio:</b> ${tipo_servicio} <br><br>
              <b>Colabores a los cuales se les ha ${proceso} una planificación de servicio de alimentación:</b>
            </p>
            <div style="text-align: center;"> 
            <table border=2 cellpadding=10 cellspacing=0 style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px;">
              <tr>
                <th><h5>COLABORADOR</h5></th> 
                <th><h5>CÉDULA</h5></th> 
              </tr>            
              ${nombres} 
            </table>
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
exports.PLAN_COMIDAS_CONTROLADOR = new PlanComidasControlador();
exports.default = exports.PLAN_COMIDAS_CONTROLADOR;
