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
exports.EMPLEADO_PROCESO_CONTROLADOR = void 0;
const auditoriaControlador_1 = __importDefault(require("../../auditoria/auditoriaControlador"));
const database_1 = __importDefault(require("../../../database"));
class EmpleadoProcesoControlador {
    CrearEmpleProcesos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, id_empleado, id_empl_cargo, fec_inicio, fec_final, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                yield database_1.default.query(`
        INSERT INTO map_empleado_procesos (id_proceso, id_empleado, id_empleado_cargo, fecha_inicio, fecha_final) 
        VALUES ($1, $2, $3, $4, $5)
        `, [id, id_empleado, id_empl_cargo, fec_inicio, fec_final]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'map_empleado_procesos',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{id: ${id}, id_empleado: ${id_empleado}, id_empleado_cargo: ${id_empl_cargo}, fecha_inicio: ${fec_inicio}, fecha_final: ${fec_final}}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.jsonp({ message: 'Procesos del empleado guardados con éxito' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'Error al guardar procesos del empleado.' });
            }
        });
    }
    ActualizarProcesoEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, id_empl_cargo, fec_inicio, fec_final, id_p, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const proceso = yield database_1.default.query('SELECT * FROM map_empleado_procesos WHERE id_p = $1', [id_p]);
                const [datosOriginales] = proceso.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_empleado_procesos',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar proceso con id_p: ${id_p}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Error al actualizar proceso' });
                }
                yield database_1.default.query(`
        UPDATE map_empleado_procesos SET id = $1, id_empleado_cargo = $2, fecha_inicio = $3, fecha_final = $4 
        WHERE id = $5
        `, [id, id_empl_cargo, fec_inicio, fec_final, id_p]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'map_empleado_procesos',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: `{id: ${id}, id_empleado_cargo: ${id_empl_cargo}, fecha_inicio: ${fec_inicio}, fecha_final: ${fec_final}}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Proceso actualizado exitosamente' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al actualizar proceso.' });
            }
        });
    }
    BuscarProcesoUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const HORARIO_CARGO = yield database_1.default.query(`
      SELECT ep.id, ep.id_proceso, ep.id_empleado_cargo, ep.fecha_inicio, ep.fecha_final, cp.nombre AS proceso 
      FROM map_empleado_procesos AS ep, map_cat_procesos AS cp 
      WHERE ep.id_empleado = $1 AND ep.id_proceso = cp.id
      `, [id_empleado]);
            if (HORARIO_CARGO.rowCount > 0) {
                return res.jsonp(HORARIO_CARGO.rows);
            }
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        });
    }
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_name, ip } = req.body;
                const id = req.params.id;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const proceso = yield database_1.default.query('SELECT * FROM map_empleado_procesos WHERE id = $1', [id]);
                const [datosOriginales] = proceso.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_empleado_procesos',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar proceso con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                yield database_1.default.query(`
        DELETE FROM map_empleado_procesos WHERE id = $1
        `, [id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'map_empleado_procesos',
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
                return res.status(500).jsonp({ message: 'Error al eliminar registro.' });
            }
        });
    }
}
exports.EMPLEADO_PROCESO_CONTROLADOR = new EmpleadoProcesoControlador();
exports.default = exports.EMPLEADO_PROCESO_CONTROLADOR;
