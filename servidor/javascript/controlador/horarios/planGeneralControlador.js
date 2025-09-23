"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.PLAN_GENERAL_CONTROLADOR = void 0;
const auditoriaControlador_1 = __importDefault(require("../reportes/auditoriaControlador"));
const settingsMail_1 = require("../../libs/settingsMail");
const luxon_1 = require("luxon");
const database_1 = __importDefault(require("../../database"));
const copyStream = __importStar(require("pg-copy-streams"));
class PlanGeneralControlador {
    constructor() {
        // METODO PARA CREAR PLAN GENERAL POR LOTES  **USADO
        this.CrearPlanificacionPorLotes = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { parte, user_name, ip, ip_local } = req.body;
            // VALIDACION DEL INPUT
            if (!Array.isArray(parte) || parte.length === 0) {
                return res.status(400).json({ message: 'El campo "parte" debe ser un array y no estar vacío.' });
            }
            const client = yield database_1.default.connect(); // CONECTAR AL CLIENTE
            try {
                yield client.query('BEGIN'); // INICIAR UNA TRANSACCION
                // CREAR UN FLUJO DE DATOS PARA EL COPY USANDO PG-COPY-STREAMS, DESDE UN FLUJO DE ENTRADA EN FORMATO csv
                const stream = client.query(copyStream.from(`COPY eu_asistencia_general (
                    fecha_hora_horario, tolerancia, estado_timbre, id_detalle_horario,
                    fecha_horario, id_empleado_cargo, tipo_accion, id_empleado,
                    id_horario, tipo_dia, salida_otro_dia, minutos_antes,
                    minutos_despues, estado_origen, minutos_alimentacion
                ) FROM STDIN WITH (FORMAT csv, DELIMITER '\t')`));
                // ESCRIBIR LOS DATOS EN EL FLUJO COPY
                for (const p of parte) {
                    const row = [
                        p.fec_hora_horario,
                        p.tolerancia,
                        p.estado_timbre,
                        p.id_det_horario,
                        p.fec_horario,
                        p.id_empl_cargo,
                        p.tipo_entr_salida,
                        p.id_empleado,
                        p.id_horario,
                        p.tipo_dia,
                        p.salida_otro_dia,
                        p.min_antes,
                        p.min_despues,
                        p.estado_origen,
                        p.min_alimentacion
                    ].join('\t'); // FORMATEAR LA FILA CON TABULADORES
                    stream.write(`${row}\n`); // ESCRIBIR LA FILA EN EL FLUJO
                }
                stream.end(); // FINALIZAR EL FLUJO
                // ESPERAR A QUE EL COPY TERMINE
                yield new Promise((resolve, reject) => {
                    stream.on('finish', resolve); // ESPERAR LA FINALIZACION DEL COPY
                    stream.on('error', reject); // MANEJAR POSIBLES ERRORES
                });
                // REALIZAR LA INSERCION EN AUDITORIA DESPUES DE COMPLETAR LA INSERCION MASIVA
                const auditoria = parte.map((p) => ({
                    tabla: 'eu_asistencia_general',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(p),
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                }));
                yield auditoriaControlador_1.default.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);
                yield client.query('COMMIT'); // FINALIZAR LA TRANSACCION
                res.status(200).json({ message: 'OK', totalResults: parte.length });
            }
            catch (error) {
                yield client.query('ROLLBACK'); // REVERTIR LA TRANSACCIÓN EN CASO DE ERROR
                console.error("Detalles del error:", {
                    message: error.message,
                    stack: error.stack,
                    code: error.code,
                    detail: error.detail
                });
                res.status(500).json({ message: 'Error al procesar la parte', error: error.message });
            }
            finally {
                client.release(); // LIBERAR EL CLIENTE
            }
        });
        // METOOD PARA BUSCAR ID POR FECHAS PLAN GENERAL MULTIPLE    **USADO
        this.BuscarFechasMultiples = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { listaEliminar } = req.body;
            let resultados = []; // ARRAY PARA ALMACENAR TODOS LOS OBJETOS DE LOS RESULTADOS
            for (const item of listaEliminar) {
                const FECHAS = yield database_1.default.query(`
                    SELECT id FROM eu_asistencia_general 
                    WHERE (fecha_horario BETWEEN $1 AND $2) AND id_horario = $3 AND id_empleado = $4
                `, [item.fec_inicio, item.fec_final, item.id_horario, item.id_empleado]);
                // CONCATENA LOS RESULTADOS OBTENIDOS EN CADA ITERACIÓN
                resultados = resultados.concat(FECHAS.rows); // `rows` CONTIENE LOS REGISTROS DEVUELTOS POR LA CONSULTA
            }
            // SI NO SE ENCONTRO NINGUN RESULTADO EN NINGUNA CONSULTA
            if (resultados.length === 0) {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
            else {
                return res.jsonp(resultados); // DEVUELVE UN ÚNICO ARRAY CON TODOS LOS RESULTADOS CONCATENADOS
            }
        });
    }
    // METODO PARA REGISTRAR PLAN GENERAL          **USADO
    CrearPlanificacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let errores = 0;
            let ocurrioError = false;
            let mensajeError = '';
            let codigoError = 0;
            const { user_name, ip, plan_general, ip_local } = req.body;
            for (let i = 0; i < plan_general.length; i++) {
                try {
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    const result = yield database_1.default.query(`
                    INSERT INTO eu_asistencia_general (fecha_hora_horario, tolerancia, estado_timbre, id_detalle_horario,
                        fecha_horario, id_empleado_cargo, tipo_accion, id_empleado, id_horario, tipo_dia, salida_otro_dia,
                        minutos_antes, minutos_despues, estado_origen, minutos_alimentacion) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *
                    `, [
                        plan_general[i].fec_hora_horario, plan_general[i].tolerancia, plan_general[i].estado_timbre,
                        plan_general[i].id_det_horario, plan_general[i].fec_horario, plan_general[i].id_empl_cargo,
                        plan_general[i].tipo_entr_salida, plan_general[i].id_empleado, plan_general[i].id_horario, plan_general[i].tipo_dia,
                        plan_general[i].salida_otro_dia, plan_general[i].min_antes, plan_general[i].min_despues, plan_general[i].estado_origen,
                        plan_general[i].min_alimentacion
                    ]);
                    const [plan] = result.rows;
                    const fecha_hora_horario1 = yield (0, settingsMail_1.FormatearHora)(plan_general[i].fec_hora_horario.split(' ')[1]);
                    const fecha_hora_horario = yield (0, settingsMail_1.FormatearFecha2)(plan_general[i].fec_hora_horario, 'ddd');
                    const fecha_horario = yield (0, settingsMail_1.FormatearFecha2)(plan_general[i].fec_horario, 'ddd');
                    plan.fecha_hora_horario = `${fecha_hora_horario} ${fecha_hora_horario1}`;
                    plan.fecha_horario = fecha_horario;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_asistencia_general',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: JSON.stringify(plan),
                        ip: ip,
                        ip_local: ip_local,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                }
                catch (error) {
                    console.log("ver error: ", error);
                    console.error("Detalles del error:", {
                        message: error.message,
                        stack: error.stack, // Para ver dónde ocurre el error
                        code: error.code, // Código de error (si lo hay)
                        detail: error.detail // Información adicional de la BD (si la hay)
                    });
                    yield database_1.default.query('ROLLBACK');
                    ocurrioError = true;
                    mensajeError = error.message;
                    codigoError = 500;
                    errores++;
                    break;
                }
            }
            if (ocurrioError) {
                return res.status(codigoError).jsonp({ message: mensajeError });
            }
            else {
                if (errores > 0) {
                    return res.status(200).jsonp({ message: 'error' });
                }
                else {
                    return res.status(200).jsonp({ message: 'OK' });
                }
            }
        });
    }
    // METODO PARA BUSCAR ID POR FECHAS PLAN GENERAL   **USADO
    BuscarFechas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fec_inicio, fec_final, id_horario, id_empleado } = req.body;
            const FECHAS = yield database_1.default.query(`
                SELECT id FROM eu_asistencia_general 
                WHERE (fecha_horario BETWEEN $1 AND $2) AND id_horario = $3 AND id_empleado = $4
            `, [fec_inicio, fec_final, id_horario, id_empleado]);
            if (FECHAS.rowCount != 0) {
                return res.jsonp(FECHAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTROS    **USADO
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("ENTRA AL METODO ELIMINAR AHORITA SIENDO REVISADO");
            var errores = 0;
            let ocurrioError = false;
            let mensajeError = '';
            let codigoError = 0;
            // CONTADORES INICIAN EN CERO (0)
            errores = 0;
            const { user_name, ip, id_plan, ip_local } = req.body;
            console.log("ver req body eliminar: ", req.body);
            for (const plan of id_plan) {
                try {
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    // CONSULTAR DATOS ORIGINALES
                    const consulta = yield database_1.default.query(`SELECT * FROM eu_asistencia_general WHERE id = $1`, [plan]);
                    const [datosOriginales] = consulta.rows;
                    if (!datosOriginales) {
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'eu_asistencia_general',
                            usuario: user_name,
                            accion: 'D',
                            datosOriginales: '',
                            datosNuevos: '',
                            ip: ip,
                            ip_local: ip_local,
                            observacion: `Error al eliminar el registro con id ${plan}. Registro no encontrado.`
                        });
                        // FINALIZAR TRANSACCION
                        yield database_1.default.query('COMMIT');
                        return res.status(404).jsonp({ message: 'error' });
                    }
                    yield database_1.default.query(`
                    DELETE FROM eu_asistencia_general WHERE id = $1
                    `, [plan]);
                    const fecha_hora_horario1 = yield (0, settingsMail_1.FormatearHora)(datosOriginales.fecha_hora_horario.toLocaleString().split(' ')[1]);
                    const fecha_hora_horario = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_hora_horario, 'ddd');
                    const fecha_horario = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_horario, 'ddd');
                    datosOriginales.fecha_horario = fecha_horario;
                    datosOriginales.fecha_hora_horario = `${fecha_hora_horario} ${fecha_hora_horario1}`;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_asistencia_general',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: JSON.stringify(datosOriginales),
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                }
                catch (error) {
                    console.log("ver error eliminar: ", error);
                    // REVERTIR TRANSACCION
                    yield database_1.default.query('ROLLBACK');
                    errores++;
                    ocurrioError = true;
                    mensajeError = error;
                    codigoError = 500;
                    break;
                }
            }
            if (ocurrioError) {
                return res.status(500).jsonp({ message: mensajeError });
            }
            else {
                if (errores > 0) {
                    return res.status(200).jsonp({ message: 'error' });
                }
                else {
                    return res.status(200).jsonp({ message: 'OK' });
                }
            }
        });
    }
    // METODO PARA ELIMINAR REGISTROS MULTIPLES  **USADO
    EliminarRegistrosMultiples(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_name, ip, id_plan, ip_local } = req.body;
            // INICIAR TRANSACCIÓN
            try {
                if (!Array.isArray(id_plan) || id_plan.length === 0) {
                    return res.status(400).jsonp({ message: 'Debe proporcionar un array de IDs válido.' });
                }
                yield database_1.default.query('BEGIN');
                const consulta = yield database_1.default.query(`SELECT * FROM eu_asistencia_general WHERE id = ANY($1)`, [id_plan]);
                const datosOriginales = consulta.rows;
                const idsEncontrados = datosOriginales.map((row) => row.id);
                const idsNoEncontrados = id_plan.filter((id) => !idsEncontrados.includes(id));
                if (idsEncontrados.length === 0) {
                    const auditoria = idsNoEncontrados.map((id) => ({
                        tabla: 'eu_asistencia_general',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al eliminar registro con id ${id}`
                    }));
                    yield auditoriaControlador_1.default.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Ningún registro encontrado para eliminar.', idsNoEncontrados: id_plan });
                }
                else {
                    if (idsNoEncontrados.length != 0) {
                        const auditoria = idsNoEncontrados.map((id) => ({
                            tabla: 'eu_asistencia_general',
                            usuario: user_name,
                            accion: 'D',
                            datosOriginales: '',
                            datosNuevos: '',
                            ip: ip,
                            ip_local: ip_local,
                            observacion: `Error al eliminar registro con id ${id}`
                        }));
                        yield auditoriaControlador_1.default.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);
                    }
                    const result = yield database_1.default.query(`DELETE FROM eu_asistencia_general WHERE id = ANY($1::int[])`, [id_plan]);
                    if (result.rowCount === 0) {
                        console.log("No se eliminaron registros con los IDs proporcionados.");
                    }
                    yield database_1.default.query('COMMIT');
                    yield Promise.all(datosOriginales.map((item) => __awaiter(this, void 0, void 0, function* () {
                        item.fecha_horario = yield (0, settingsMail_1.FormatearFechaPlanificacion)(item.fecha_horario.toString(), 'ddd');
                        item.fecha_hora_horario = (yield (0, settingsMail_1.FormatearFechaPlanificacion)(item.fecha_hora_horario.toString(), 'ddd')) + ' ' + luxon_1.DateTime.fromJSDate(new Date(item.fecha_hora_horario)).toFormat('HH:mm:ss');
                        ;
                    })));
                    const auditoria = datosOriginales.map((item) => {
                        return {
                            tabla: 'eu_asistencia_general',
                            usuario: user_name,
                            accion: 'D',
                            datosOriginales: JSON.stringify(item),
                            datosNuevos: '',
                            ip: ip,
                            ip_local: ip_local,
                            observacion: null,
                        };
                    });
                    yield auditoriaControlador_1.default.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);
                    yield database_1.default.query('COMMIT');
                    return res.jsonp({ message: 'OK' });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA LISTAR LAS PLANIFICACIONES QUE TIENE REGISTRADAS EL USUARIO   **USADO
    ListarPlanificacionHoraria(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fecha_inicio, fecha_final, id_empleado } = req.body;
                const HORARIO = yield database_1.default.query("SELECT id_e, codigo_e, nombre_e, anio, mes, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 1 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 1 THEN codigo_dia end,', ') ELSE '-' END AS dia1, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 2 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 2 THEN codigo_dia end,', ') ELSE '-' END AS dia2, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 3 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 3 THEN codigo_dia end,', ') ELSE '-' END AS dia3, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 4 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 4 THEN codigo_dia end,', ') ELSE '-' END AS dia4, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 5 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 5 THEN codigo_dia end,', ') ELSE '-' END AS dia5, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 6 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 6 THEN codigo_dia end,', ') ELSE '-' END AS dia6, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 7 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 7 THEN codigo_dia end,', ') ELSE '-' END AS dia7, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 8 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 8 THEN codigo_dia end,', ') ELSE '-' END AS dia8, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 9 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 9 THEN codigo_dia end,', ') ELSE '-' END AS dia9, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 10 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 10 THEN codigo_dia end,', ') ELSE '-' END AS dia10, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 11 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 11 THEN codigo_dia end,', ') ELSE '-' END AS dia11, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 12 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 12 THEN codigo_dia end,', ') ELSE '-' END AS dia12, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 13 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 13 THEN codigo_dia end,', ') ELSE '-' END AS dia13, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 14 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 14 THEN codigo_dia end,', ') ELSE '-' END AS dia14, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 15 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 15 THEN codigo_dia end,', ') ELSE '-' END AS dia15, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 16 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 16 THEN codigo_dia end,', ') ELSE '-' END AS dia16, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 17 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 17 THEN codigo_dia end,', ') ELSE '-' END AS dia17, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 18 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 18 THEN codigo_dia end,', ') ELSE '-' END AS dia18, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 19 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 19 THEN codigo_dia end,', ') ELSE '-' END AS dia19, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 20 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 20 THEN codigo_dia end,', ') ELSE '-' END AS dia20, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 21 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 21 THEN codigo_dia end,', ') ELSE '-' END AS dia21, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 22 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 22 THEN codigo_dia end,', ') ELSE '-' END AS dia22, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 23 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 23 THEN codigo_dia end,', ') ELSE '-' END AS dia23, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 24 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 24 THEN codigo_dia end,', ') ELSE '-' END AS dia24, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 25 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 25 THEN codigo_dia end,', ') ELSE '-' END AS dia25, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 26 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 26 THEN codigo_dia end,', ') ELSE '-' END AS dia26, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 27 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 27 THEN codigo_dia end,', ') ELSE '-' END AS dia27, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 28 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 28 THEN codigo_dia end,', ') ELSE '-' END AS dia28, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 29 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 29 THEN codigo_dia end,', ') ELSE '-' END AS dia29, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 30 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 30 THEN codigo_dia end,', ') ELSE '-' END AS dia30, " +
                    "CASE WHEN STRING_AGG(CASE WHEN dia = 31 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 31 THEN codigo_dia end,', ') ELSE '-' END AS dia31 " +
                    "FROM ( " +
                    "SELECT p_g.id_empleado AS id_e, empleado.codigo AS codigo_e, CONCAT(empleado.apellido, ' ', empleado.nombre) AS nombre_e, EXTRACT('year' FROM fecha_horario) AS anio, EXTRACT('month' FROM fecha_horario) AS mes, " +
                    "EXTRACT('day' FROM fecha_horario) AS dia, " +
                    "CASE WHEN ((tipo_dia = 'L' OR tipo_dia = 'FD') AND (NOT estado_origen = 'HL' AND NOT estado_origen = 'HFD')) THEN tipo_dia ELSE horario.codigo END AS codigo_dia " +
                    "FROM eu_asistencia_general p_g " +
                    "INNER JOIN eu_empleados empleado ON empleado.id = p_g.id_empleado AND p_g.id_empleado IN (" + id_empleado + ") " +
                    "INNER JOIN eh_cat_horarios horario ON horario.id = p_g.id_horario " +
                    "WHERE fecha_horario BETWEEN $1 AND $2 " +
                    "GROUP BY id_e, codigo_e, nombre_e, anio, mes, dia, codigo_dia, p_g.id_horario " +
                    "ORDER BY p_g.id_empleado, anio, mes , dia, p_g.id_horario " +
                    ") AS datos " +
                    "GROUP BY id_e, codigo_e, nombre_e, anio, mes " +
                    "ORDER BY 4,5,1", [fecha_inicio, fecha_final]);
                if (HORARIO.rowCount != 0) {
                    return res.jsonp({ message: 'OK', data: HORARIO.rows });
                }
                else {
                    return res.jsonp({ message: 'vacio', data: HORARIO.rows });
                }
            }
            catch (error) {
                return res.jsonp({ message: 'error', error: error });
            }
        });
    }
    // METODO PARA LISTAR DETALLE DE HORARIOS POR USUARIOS              **USADO
    ListarDetalleHorarios(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fecha_inicio, fecha_final, id_empleado } = req.body;
                const HORARIO = yield database_1.default.query("SELECT horario.codigo AS codigo_dia, horario.nombre AS nombre, " +
                    "dh.hora, dh.tipo_accion, dh.id_horario, dh.id AS detalle " +
                    "FROM eu_asistencia_general p_g " +
                    "INNER JOIN eu_empleados empleado ON empleado.id = p_g.id_empleado AND p_g.id_empleado IN (" + id_empleado + ") " +
                    "INNER JOIN eh_cat_horarios horario ON horario.id = p_g.id_horario " +
                    "INNER JOIN eh_detalle_horarios dh ON dh.id = p_g.id_detalle_horario " +
                    "WHERE fecha_horario BETWEEN $1 AND $2 " +
                    "GROUP BY codigo_dia, tipo_dia, horario.nombre, dh.id_horario, dh.hora, dh.tipo_accion, dh.id " +
                    "ORDER BY dh.id_horario, dh.hora ASC", [fecha_inicio, fecha_final]);
                if (HORARIO.rowCount != 0) {
                    return res.jsonp({ message: 'OK', data: HORARIO.rows });
                }
                else {
                    return res.jsonp({ message: 'vacio' });
                }
            }
            catch (error) {
                return res.jsonp({ message: 'error', error: error });
            }
        });
    }
    // METODO PARA LISTAR LAS PLANIFICACIONES QUE TIENE REGISTRADAS EL USUARIO  **USADO
    ListarHorariosUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fecha_inicio, fecha_final, id_empleado } = req.body;
                const HORARIO = yield database_1.default.query("SELECT p_g.id_horario, horario.codigo  AS codigo_horario " +
                    "FROM eu_asistencia_general p_g " +
                    "INNER JOIN eu_empleados empleado ON empleado.id = p_g.id_empleado AND p_g.id_empleado IN (" + id_empleado + ") " +
                    "INNER JOIN eh_cat_horarios horario ON horario.id = p_g.id_horario " +
                    "WHERE fecha_horario BETWEEN $1 AND $2 " +
                    "GROUP BY codigo_horario, p_g.id_horario", [fecha_inicio, fecha_final]);
                if (HORARIO.rowCount != 0) {
                    return res.jsonp({ message: 'OK', data: HORARIO.rows });
                }
                else {
                    return res.jsonp({ message: 'vacio', data: HORARIO.rows });
                }
            }
            catch (error) {
                return res.jsonp({ message: 'error', error: error });
            }
        });
    }
    // METODO PARA BUSCAR ASISTENCIAS   **USADO
    BuscarAsistencia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { identificacion, codigo, inicio, fin, nombre, apellido } = req.body;
                let ids = [];
                if (codigo !== '' && codigo !== null) {
                    const empleado = yield BuscarEmpleadoPorParametro('codigo', codigo);
                    if (empleado.rowCount > 0) {
                        ids = empleado.rows.map(row => row.id);
                    }
                }
                else {
                    let empleado;
                    if (identificacion !== '' && identificacion !== null) {
                        empleado = yield BuscarEmpleadoPorParametro('identificacion', identificacion);
                    }
                    else if (nombre !== '' && apellido !== '' && nombre !== null && apellido !== null) {
                        empleado = yield BuscarEmpleadoPorParametro('nombre_apellido', { nombre, apellido });
                    }
                    else if (apellido !== '' && apellido !== null) {
                        empleado = yield BuscarEmpleadoPorParametro('apellido', apellido);
                    }
                    else if (nombre !== '' && nombre !== null) {
                        empleado = yield BuscarEmpleadoPorParametro('nombre', nombre);
                    }
                    if (empleado && empleado.rowCount > 0) {
                        ids = empleado.rows.map(row => row.id);
                    }
                }
                if (ids.length > 0) {
                    const ASISTENCIA = yield database_1.default.query(`
                        SELECT p_g.*, p_g.fecha_hora_horario::time AS hora_horario, p_g.fecha_hora_horario::date AS fecha_horarios,
                            p_g.fecha_hora_timbre::date AS fecha_timbre, p_g.fecha_hora_timbre::time AS hora_timbre,
                            empleado.identificacion, empleado.nombre, empleado.apellido, empleado.id AS id_empleado, empleado.codigo
                        FROM eu_asistencia_general p_g
                        INNER JOIN eu_empleados empleado on empleado.id = p_g.id_empleado AND p_g.id_empleado = ANY($3)
                        WHERE p_g.fecha_horario BETWEEN $1 AND $2
                        ORDER BY p_g.fecha_hora_horario ASC
                    `, [inicio, fin, ids]);
                    if (ASISTENCIA.rowCount === 0) {
                        return res.status(404).jsonp({ message: 'vacio' });
                    }
                    else {
                        return res.jsonp({ message: 'OK', respuesta: ASISTENCIA.rows });
                    }
                }
                else {
                    return res.status(404).jsonp({ message: 'vacio' });
                }
            }
            catch (error) {
                return res.status(500).jsonp({ message: 'Error interno del servidor' });
            }
        });
    }
    // METODO PARA ACTUALIZAR ASISTENCIA MANUAL   **USADO
    ActualizarManual(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { codigo, fecha, id, accion, id_timbre, user_name, ip, ip_local } = req.body;
                const ASIGNADO = yield database_1.default.query(`
                    SELECT * FROM fnbuscarregistroasignado ($1, $2);
                `, [fecha, codigo]);
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOS ORIGINALES
                const consulta = yield database_1.default.query(`SELECT * FROM eu_asistencia_general WHERE id = $1`, [id]);
                const [datosOriginales] = consulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_asistencia_general',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al actualizar el registro con id ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'error' });
                }
                const PLAN = yield database_1.default.query(`
                    UPDATE eu_asistencia_general SET fecha_hora_timbre = $1, estado_timbre = 'R' WHERE id = $2 RETURNING *
                `, [fecha, id]);
                var fecha_hora_horario1 = yield (0, settingsMail_1.FormatearHora)(datosOriginales.fecha_hora_horario.toLocaleString().split(' ')[1]);
                var fecha_hora_horario = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_hora_horario, 'ddd');
                var fecha_horario = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_horario, 'ddd');
                var fecha_hora_timbre1 = yield (0, settingsMail_1.FormatearHora)(datosOriginales.fecha_hora_timbre.toLocaleString().split(' ')[1]);
                var fecha_hora_timbre = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_hora_timbre, 'ddd');
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_asistencia_general',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: `id: ${datosOriginales.id}, id_empleado: ${datosOriginales.id_empleado}, 
                                id_empleado_cargo: ${datosOriginales.id_empleado_cargo}, id_horario: ${datosOriginales.id_horario},
                                id_detalle_horario: ${datosOriginales.id_detalle_horario}, fecha_horario: ${fecha_horario}, 
                                fecha_hora_horario: ${fecha_hora_horario + ' ' + fecha_hora_horario1}, 
                                fecha_hora_timbre: ${fecha_hora_timbre + ' ' + fecha_hora_timbre1}, 
                                estado_timbre: ${datosOriginales.estado_timbre}, tipo_accion: ${datosOriginales.tipo_accion}, 
                                tipo_dia: ${datosOriginales.tipo_dia}, salida_otro_dia: ${datosOriginales.salida_otro_dia}, 
                                tolerancia: ${datosOriginales.tolerancia}, minutos_antes: ${datosOriginales.minutos_antes}, 
                                minutos_despues: ${datosOriginales.minutos_despues}, estado_origen: ${datosOriginales.estado_origen},
                                minutos_alimentacion: ${datosOriginales.minutos_alimentacion}`,
                    datosNuevos: `id: ${datosOriginales.id}, id_empleado: ${datosOriginales.id_empleado}, 
                            id_empleado_cargo: ${datosOriginales.id_empleado_cargo}, id_horario: ${datosOriginales.id_horario}, 
                            id_detalle_horario: ${datosOriginales.id_detalle_horario}, fecha_horario: ${fecha_horario}, 
                            fecha_hora_horario: ${fecha_hora_horario + ' ' + fecha_hora_horario1}, fecha_hora_timbre: ${fecha}, 
                            estado_timbre: ${datosOriginales.estado_timbre}, tipo_accion: ${datosOriginales.tipo_accion}, 
                            tipo_dia: ${datosOriginales.tipo_dia}, salida_otro_dia: ${datosOriginales.salida_otro_dia}, 
                            tolerancia: ${datosOriginales.tolerancia}, minutos_antes: ${datosOriginales.minutos_antes}, 
                            minutos_despues: ${datosOriginales.minutos_despues}, estado_origen: ${datosOriginales.estado_origen}, 
                            minutos_alimentacion: ${datosOriginales.minutos_alimentacion}`, ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                if (PLAN.rowCount != 0) {
                    const TIMBRE = yield database_1.default.query(`
                        UPDATE eu_timbres SET accion = $1 WHERE id = $2
                    `, [accion, id_timbre]);
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'timbres',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: JSON.stringify(TIMBRE.rows),
                        ip: ip,
                        ip_local: ip_local,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.jsonp({ message: 'OK', respuesta: PLAN.rows });
                }
                else {
                    // REVERTIR TRANSACCION
                    yield database_1.default.query('ROLLBACK');
                    res.status(404).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.jsonp({ message: 'error', error: error });
            }
        });
    }
}
// METODO PARA BUSCAR DATOS DE EMPLEADOS    **USADO
function BuscarEmpleadoPorParametro(parametro, valor) {
    return __awaiter(this, void 0, void 0, function* () {
        let query = '';
        let queryParams = [];
        switch (parametro) {
            case 'identificacion':
                query = 'SELECT id FROM eu_empleados WHERE identificacion = $1';
                queryParams = [valor];
                break;
            case 'nombre':
            case 'apellido':
                if (typeof valor === 'string') {
                    query = `SELECT id FROM eu_empleados WHERE UPPER(${parametro}) ilike $1`;
                    queryParams = [`%${valor.toUpperCase()}%`];
                }
                break;
            case 'codigo':
                query = 'SELECT id FROM eu_empleados WHERE codigo = $1';
                queryParams = [valor];
                break;
            case 'nombre_apellido':
                if (typeof valor !== 'string' && valor.nombre && valor.apellido) {
                    query = `SELECT id FROM eu_empleados WHERE UPPER(nombre) ilike $1 AND UPPER(apellido) ilike $2`;
                    queryParams = [`%${valor.nombre.toUpperCase()}%`, `%${valor.apellido.toUpperCase()}%`];
                }
                break;
        }
        return yield database_1.default.query(query, queryParams);
    });
}
exports.PLAN_GENERAL_CONTROLADOR = new PlanGeneralControlador();
exports.default = exports.PLAN_GENERAL_CONTROLADOR;
