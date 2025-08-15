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
exports.CONFIGURAR_VACACIONES_CONTROLADOR = void 0;
const auditoriaControlador_1 = __importDefault(require("../../reportes/auditoriaControlador"));
const database_1 = __importDefault(require("../../../database"));
class ConfigurarVacacioneControlador {
    // REGISTRAR CONFIGURACION DE VACACIONES  **USADO
    RegistrarConfiguracion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { descripcion, permitir_horas, minimo_horas, minimo_dias, documento, estado, incluir_feriados, user_name, ip, ip_local } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const datosNuevos = yield database_1.default.query(`
                    INSERT INTO mv_configurar_vacaciones 
                        (descripcion, permite_horas, minimo_horas, minimo_dias, documento, estado, incluir_feriados) 
                        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
                `, [descripcion, permitir_horas, minimo_horas, minimo_dias, documento, estado, incluir_feriados]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'mv_configurar_vacaciones',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(datosNuevos.rows[0]),
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.jsonp({ message: 'Registro guardado.', estado: 'OK', id: datosNuevos.rows[0].id });
            }
            catch (error) {
                console.log('error ', error);
                // FINALIZAR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'Error al guardar el registro.' });
            }
        });
    }
    // ACTUALIZAR REGISTRO DE CONFIGURACION DE VACACIONES  **USADO
    ActualizarConfiguracion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { descripcion, permite_horas, minimo_horas, minimo_dias, documento, estado, incluir_feriados, id, user_name, ip, ip_local } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOS ORIGINALES
                const consulta = yield database_1.default.query(`SELECT * FROM mv_configurar_vacaciones WHERE id = $1`, [id]);
                const [datosOriginales] = consulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'mv_configurar_vacaciones',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al actualizar el registro con id: ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                yield database_1.default.query(`
                    UPDATE mv_configurar_vacaciones SET descripcion = $1, permite_horas = $2 
                        minimo_horas = $3, minimo_dias = $4, documento = $5, estado = $6,
                        incluir_feriados = $7    
                    WHERE id = $8
                `, [descripcion, permite_horas, minimo_horas, minimo_dias, documento, estado, incluir_feriados, id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'mv_configurar_vacaciones',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: `{ "descripcion": "${descripcion}", "permite_horas": "${permite_horas}", 
                    "minimo_horas": "${minimo_horas}", "minimo_dias":"${minimo_dias}", "estado":"${estado}", 
                    "documento":"${documento}", "incluir_feriados": "${incluir_feriados}" }`,
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // LISTAR REGISTROS DE CONFIGURACION DE VACACIONES  **USADO
    ListarConfiguraciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const CONFIGURCAION = yield database_1.default.query(`
                SELECT * FROM mv_configurar_vacaciones;
            `);
            if (CONFIGURCAION.rowCount != 0) {
                return res.jsonp(CONFIGURCAION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTRO  **USADO
    EliminarConfiguracion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_name, ip, ip_local } = req.body;
                const id = req.params.id;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOS ORIGINALES
                const CONFIGURAR = yield database_1.default.query(`SELECT * FROM mv_configurar_vacaciones WHERE id = $1`, [id]);
                const [datosOriginales] = CONFIGURAR.rows;
                if (!datosOriginales) {
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'mv_configurar_vacaciones',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al eliminar la configuración con id ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Error al eliminar el registro.' });
                }
                yield database_1.default.query(`
                    DELETE FROM mv_configurar_vacaciones WHERE id = $1
                `, [id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'mv_configurar_vacaciones',
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
                return res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA VER UNA CONFIGURACION DE VACACIONES   **USADO
    ConsultarUnaConfiguracion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const CONFIGURACION = yield database_1.default.query(`
                SELECT * FROM mv_configurar_vacaciones WHERE id = $1
            `, [id]);
            if (CONFIGURACION.rowCount != 0) {
                return res.jsonp(CONFIGURACION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
}
exports.CONFIGURAR_VACACIONES_CONTROLADOR = new ConfigurarVacacioneControlador();
exports.default = exports.CONFIGURAR_VACACIONES_CONTROLADOR;
