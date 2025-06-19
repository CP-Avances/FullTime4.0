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
const auditoriaControlador_1 = __importDefault(require("../../reportes/auditoriaControlador"));
const database_1 = __importDefault(require("../../../database"));
class EmpleadoProcesoControlador {
    CrearEmpleProcesos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, id_empleado, user_name, ip, ip_local } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                yield database_1.default.query(`
        INSERT INTO map_empleado_procesos (id_proceso, id_empleado) 
        VALUES ($1, $2)
        `, [id, id_empleado]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'map_empleado_procesos',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{id: ${id}, id_empleado: ${id_empleado}}`,
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.jsonp({ message: 'Procesos del empleado guardados con éxito.' });
            }
            catch (error) {
                console.log('error ', error);
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'Error al guardar procesos del empleado.' });
            }
        });
    }
    ActualizarProcesoEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, id_proceso, user_name, ip, ip_local } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const proceso = yield database_1.default.query('SELECT * FROM map_empleado_procesos WHERE id = $1', [id]);
                const [datosOriginales] = proceso.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_empleado_procesos',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al actualizar proceso con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Error al actualizar proceso' });
                }
                const datosNuevos = yield database_1.default.query(`
        UPDATE map_empleado_procesos SET id_proceso = $2 
        WHERE id = $1 RETURNING *
        `, [id, id_proceso]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'map_empleado_procesos',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(datosNuevos.rows[0]),
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Proceso actualizado exitosamente' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                console.log('error ', error);
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al actualizar proceso.' });
            }
        });
    }
    // METODO PARA OBTENER PROCESOS DEL USUARIO   **USADO
    BuscarProcesoUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            console.log('req.params: ', req.params);
            const EMPLEADO_PROCESOS = yield database_1.default.query(`
      SELECT ep.id, ep.id_proceso, ep.estado, cp.nombre AS proceso 
      FROM map_empleado_procesos AS ep, map_cat_procesos AS cp 
      WHERE ep.id_empleado = $1 AND ep.id_proceso = cp.id
      `, [id_empleado]);
            if (EMPLEADO_PROCESOS.rowCount != 0) {
                return res.status(200).jsonp({ procesos: EMPLEADO_PROCESOS.rows, text: 'correcto', status: 200 });
            }
            res.status(404).jsonp({ Procesos: undefined, text: 'Registro no encontrado.', status: 400 });
        });
    }
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_name, ip, ip_local } = req.body;
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
                        ip: ip,
                        ip_local: ip_local,
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
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.status(200).jsonp({ message: 'Registro eliminado.' });
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
