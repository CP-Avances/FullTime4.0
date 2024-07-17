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
const auditoriaControlador_1 = __importDefault(require("../../auditoria/auditoriaControlador"));
const database_1 = __importDefault(require("../../../database"));
const settingsMail_1 = require("../../../libs/settingsMail");
class PeriodoVacacionControlador {
    // METODO PARA BUSCAR ID DE PERIODO DE VACACIONES
    EncontrarIdPerVacaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const VACACIONES = yield database_1.default.query(`
        SELECT pv.id, pv.id_empleado_contrato
        FROM mv_periodo_vacacion AS pv
        WHERE pv.id = (SELECT MAX(pv.id) AS id 
                       FROM mv_periodo_vacacion AS pv 
                       WHERE pv.id_empleado = $1 )
        `, [id_empleado]);
            if (VACACIONES.rowCount != 0) {
                return res.jsonp(VACACIONES.rows);
            }
            res.status(404).jsonp({ text: 'Registro no encontrado' });
        });
    }
    CrearPerVacaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empl_contrato, descripcion, dia_vacacion, dia_antiguedad, estado, fec_inicio, fec_final, dia_perdido, horas_vacaciones, min_vacaciones, id_empleado, user_name, ip, } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query("BEGIN");
                const datosNuevos = yield database_1.default.query(`
          INSERT INTO mv_periodo_vacacion (id_empleado_contrato, descripcion, dia_vacacion,
              dia_antiguedad, estado, fecha_inicio, fecha_final, dia_perdido, horas_vacaciones, minutos_vacaciones, id_empleado)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *
        `, [id_empl_contrato, descripcion, dia_vacacion, dia_antiguedad, estado,
                    fec_inicio, fec_final, dia_perdido, horas_vacaciones, min_vacaciones,
                    id_empleado,]);
                const [periodo] = datosNuevos.rows;
                const fechaInicioN = yield (0, settingsMail_1.FormatearFecha2)(fec_inicio, 'ddd');
                const fechaFinalN = yield (0, settingsMail_1.FormatearFecha2)(fec_final, 'ddd');
                periodo.fecha_inicio = fechaInicioN;
                periodo.fecha_final = fechaFinalN;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: "mv_periodo_vacacion",
                    usuario: user_name,
                    accion: "I",
                    datosOriginales: "",
                    datosNuevos: JSON.stringify(periodo),
                    ip,
                    observacion: null,
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query("COMMIT");
                res.jsonp({ message: "Período de Vacación guardado" });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query("ROLLBACK");
                res.status(500).jsonp({ message: "Error al guardar período de vacación." });
            }
        });
    }
    EncontrarPerVacaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const PERIODO_VACACIONES = yield database_1.default.query(`
        SELECT * FROM mv_periodo_vacacion AS p WHERE p.id_empleado = $1
        `, [id_empleado]);
            if (PERIODO_VACACIONES.rowCount != 0) {
                return res.jsonp(PERIODO_VACACIONES.rows);
            }
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        });
    }
    ActualizarPeriodo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empl_contrato, descripcion, dia_vacacion, dia_antiguedad, estado, fec_inicio, fec_final, dia_perdido, horas_vacaciones, min_vacaciones, id, user_name, ip, } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query("BEGIN");
                // CONSULTAR DATOSORIGINALES
                const periodo = yield database_1.default.query(`SELECT * FROM mv_periodo_vacacion WHERE id = $1`, [id]);
                const [datosOriginales] = periodo.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: "mv_periodo_vacacion",
                        usuario: user_name,
                        accion: "U",
                        datosOriginales: "",
                        datosNuevos: "",
                        ip,
                        observacion: `Error al actualizar período de vacaciones con id: ${id}`,
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query("COMMIT");
                    return res.status(404).jsonp({ message: "Error al actualizar período de vacaciones." });
                }
                const periodoNuevo = yield database_1.default.query(`
        UPDATE mv_periodo_vacacion SET id_empleado_contrato = $1, descripcion = $2, dia_vacacion = $3 ,
            dia_antiguedad = $4, estado = $5, fecha_inicio = $6, fecha_final = $7, dia_perdido = $8, 
            horas_vacaciones = $9, minutos_vacaciones = $10 
        WHERE id = $11 RETURNING *
        `, [id_empl_contrato, descripcion, dia_vacacion, dia_antiguedad, estado,
                    fec_inicio, fec_final, dia_perdido, horas_vacaciones, min_vacaciones, id]);
                const [datosNuevos] = periodoNuevo.rows;
                const fechaInicioN = yield (0, settingsMail_1.FormatearFecha2)(fec_inicio, 'ddd');
                const fechaFinalN = yield (0, settingsMail_1.FormatearFecha2)(fec_final, 'ddd');
                const fechaInicioO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_inicio, 'ddd');
                const fechaFinalO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_final, 'ddd');
                datosOriginales.fecha_inicio = fechaInicioO;
                datosOriginales.fecha_final = fechaFinalO;
                datosNuevos.fecha_inicio = fechaInicioN;
                datosNuevos.fecha_final = fechaFinalN;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: "mv_periodo_vacacion",
                    usuario: user_name,
                    accion: "U",
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(datosNuevos),
                    ip,
                    observacion: null,
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query("COMMIT");
                return res.jsonp({ message: "Registro Actualizado exitosamente" });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                console.log('error ', error);
                yield database_1.default.query("ROLLBACK");
                return res.status(500).jsonp({ message: "Error al actualizar período de vacaciones." });
            }
        });
    }
}
const PERIODO_VACACION_CONTROLADOR = new PeriodoVacacionControlador();
exports.default = PERIODO_VACACION_CONTROLADOR;
