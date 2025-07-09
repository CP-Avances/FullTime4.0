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
const auditoriaControlador_1 = __importDefault(require("../../reportes/auditoriaControlador"));
const settingsMail_1 = require("../../../libs/settingsMail");
const database_1 = __importDefault(require("../../../database"));
class PeriodoVacacionControlador {
    // METODO PARA CREAR PERIODO DE VACACIONES   **USADO
    CrearPerVacaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { observacion, fecha_inicio, fecha_final, fecha_carga, fecha_actualizacion, dias_vacacion, dias_usados_vacacion, dias_antiguedad, dias_usados_antiguedad, dias_perdido, fecha_perdida, id_empleado, estado, user_name, ip, ip_local, fecha_acreditar, transferido, dias_iniciales, dias_cargados, tomar_antiguedad, observacion_antiguedad } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query("BEGIN");
                const datosNuevos = yield database_1.default.query(`
          INSERT INTO mv_periodo_vacacion (observacion, fecha_inicio, fecha_final, fecha_desde, fecha_ultima_actualizacion, 
            dias_vacacion, usados_dias_vacacion, dias_antiguedad, usados_antiguedad, dias_perdidos, 
            fecha_inicio_perdida, id_empleado, estado, fecha_acreditar_vacaciones, creado_manual, saldo_transferido,
            dias_iniciales, dias_cargados, tomar_antiguedad, observacion_antiguedad)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) RETURNING *
        `, [observacion, fecha_inicio, fecha_final, fecha_carga, fecha_actualizacion, dias_vacacion,
                    dias_usados_vacacion, dias_antiguedad, dias_usados_antiguedad, dias_perdido, fecha_perdida,
                    id_empleado, estado, fecha_acreditar, true, transferido, dias_iniciales, dias_cargados,
                    tomar_antiguedad, observacion_antiguedad]);
                const [periodo] = datosNuevos.rows;
                const fechaInicioN = yield (0, settingsMail_1.FormatearFecha2)(fecha_inicio, 'ddd');
                const fechaFinalN = yield (0, settingsMail_1.FormatearFecha2)(fecha_final, 'ddd');
                periodo.fecha_inicio = fechaInicioN;
                periodo.fecha_final = fechaFinalN;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: "mv_periodo_vacacion",
                    usuario: user_name,
                    accion: "I",
                    datosOriginales: "",
                    datosNuevos: JSON.stringify(periodo),
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null,
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query("COMMIT");
                res.jsonp({ message: "Registro guardado." });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query("ROLLBACK");
                res.status(500).jsonp({ message: "Error al guardar período de vacación." });
            }
        });
    }
    // METODO PARA ACTUALIZAR PERIODO DE VACACIONES    **USADO
    ActualizarPeriodo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { observacion, fecha_inicio, fecha_final, fecha_carga, fecha_actualizacion, dias_vacacion, dias_usados_vacacion, dias_antiguedad, dias_usados_antiguedad, dias_perdido, fecha_perdida, estado, user_name, ip, ip_local, fecha_acreditar, transferido, dias_iniciales, dias_cargados, tomar_antiguedad, observacion_antiguedad, id } = req.body;
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
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al actualizar período de vacaciones con id: ${id}`,
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query("COMMIT");
                    return res.status(404).jsonp({ message: "Error al actualizar período de vacaciones." });
                }
                const periodoNuevo = yield database_1.default.query(`
        UPDATE mv_periodo_vacacion SET observacion = $1, fecha_inicio = $2, fecha_final = $3 ,
            fecha_desde = $4, fecha_ultima_actualizacion = $5, dias_vacacion = $6, usados_dias_vacacion = $7,
            dias_antiguedad = $8, usados_antiguedad = $9, dias_perdidos = $10, fecha_inicio_perdida = $11,
            estado = $12, fecha_acreditar_vacaciones = $13, saldo_transferido = $14, dias_iniciales = $15,
            dias_cargados = $16, tomar_antiguedad = $17, observacion_antiguedad = $18  
        WHERE id = $19 RETURNING *
        `, [observacion, fecha_inicio, fecha_final, fecha_carga, fecha_actualizacion, dias_vacacion,
                    dias_usados_vacacion, dias_antiguedad, dias_usados_antiguedad, dias_perdido, fecha_perdida,
                    estado, fecha_acreditar, transferido, dias_iniciales, dias_cargados, tomar_antiguedad,
                    observacion_antiguedad, id]);
                const [datosNuevos] = periodoNuevo.rows;
                const fechaInicioN = yield (0, settingsMail_1.FormatearFecha2)(fecha_inicio, 'ddd');
                const fechaFinalN = yield (0, settingsMail_1.FormatearFecha2)(fecha_final, 'ddd');
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
                    ip: ip,
                    ip_local: ip_local,
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
    // METODO PARA BUSCAR DATOS DE PERIODO DE VACACION    **USADO
    EncontrarPerVacaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const PERIODO_VACACIONES = yield database_1.default.query(`
        SELECT * FROM mv_periodo_vacacion AS p WHERE p.id_empleado = $1 ORDER BY id ASC
      `, [id_empleado]);
            if (PERIODO_VACACIONES.rowCount != 0) {
                return res.jsonp(PERIODO_VACACIONES.rows);
            }
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        });
    }
    // METODO PARA BUSCAR ID DE PERIODO DE VACACIONES   **USADO
    EncontrarIdPerVacaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const VACACIONES = yield database_1.default.query(`
      SELECT pv.id
      FROM mv_periodo_vacacion AS pv
      WHERE pv.estado = true AND pv.id_empleado = $1;
      `, [id_empleado]);
            if (VACACIONES.rowCount != 0) {
                return res.jsonp(VACACIONES.rows);
            }
            res.status(404).jsonp({ text: 'Registro no encontrado' });
        });
    }
}
const PERIODO_VACACION_CONTROLADOR = new PeriodoVacacionControlador();
exports.default = PERIODO_VACACION_CONTROLADOR;
