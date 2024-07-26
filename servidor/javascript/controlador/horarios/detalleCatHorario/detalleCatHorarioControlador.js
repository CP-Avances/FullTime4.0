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
exports.DETALLE_CATALOGO_HORARIO_CONTROLADOR = void 0;
const auditoriaControlador_1 = __importDefault(require("../../auditoria/auditoriaControlador"));
const database_1 = __importDefault(require("../../../database"));
const settingsMail_1 = require("../../../libs/settingsMail");
class DetalleCatalogoHorarioControlador {
    // METODO PARA BUSCAR DETALLE DE UN HORARIO   --**VERIFICADO
    ListarUnDetalleHorario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_horario } = req.params;
            const HORARIO = yield database_1.default.query(`
            SELECT dh.*, cg.minutos_comida
            FROM eh_detalle_horarios AS dh, eh_cat_horarios AS cg
            WHERE dh.id_horario = cg.id AND dh.id_horario = $1
            ORDER BY orden ASC
            `, [id_horario])
                .then((result) => {
                if (result.rowCount === 0)
                    return [];
                return result.rows.map((o) => {
                    switch (o.tipo_accion) {
                        case 'E':
                            o.tipo_accion_show = 'Entrada';
                            o.tipo_accion = 'E';
                            break;
                        case 'I/A':
                            o.tipo_accion_show = 'Inicio alimentación';
                            o.tipo_accion = 'I/A';
                            break;
                        case 'F/A':
                            o.tipo_accion_show = 'Fin alimentación';
                            o.tipo_accion = 'F/A';
                            break;
                        case 'S':
                            o.tipo_accion_show = 'Salida';
                            o.tipo_accion = 'S';
                            break;
                        default:
                            o.tipo_accion_show = 'Desconocido';
                            o.tipo_accion = 'D';
                            break;
                    }
                    return o;
                });
            });
            if (HORARIO.length > 0) {
                return res.jsonp(HORARIO);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTRO
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // OBTENER DATOSORIGINALES
                const consulta = yield database_1.default.query('SELECT * FROM eh_detalle_horarios WHERE id = $1', [id]);
                const [datosOriginales] = consulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eh_detalle_horarios',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar registro con id ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'No se encuentra el registro.' });
                }
                yield database_1.default.query(`
                DELETE FROM eh_detalle_horarios WHERE id = $1
                `, [id]);
                const horadetalle = yield (0, settingsMail_1.FormatearHora)(datosOriginales.hora);
                datosOriginales.hora = horadetalle;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eh_detalle_horarios',
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
    // METODO PARA REGISTRAR DETALLES
    CrearDetalleHorarios(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { orden, hora, minu_espera, id_horario, tipo_accion, segundo_dia, tercer_dia, min_antes, min_despues, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const registro = yield database_1.default.query(`
                INSERT INTO eh_detalle_horarios (orden, hora, tolerancia, id_horario, tipo_accion, segundo_dia, tercer_dia, 
                    minutos_antes, minutos_despues) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
                `, [orden, hora, minu_espera, id_horario, tipo_accion, segundo_dia, tercer_dia, min_antes, min_despues]);
                const [datosNuevos] = registro.rows;
                const horadetalle = yield (0, settingsMail_1.FormatearHora)(hora);
                datosNuevos.hora = horadetalle;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eh_detalle_horarios',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(datosNuevos),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.jsonp({ message: 'Registro guardado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'Error al guardar registro.' });
            }
        });
    }
    // METODO PARA ACTUALIZAR DETALLE DE HORARIO
    ActualizarDetalleHorarios(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { orden, hora, minu_espera, id_horario, tipo_accion, segundo_dia, tercer_dia, min_antes, min_despues, id, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // OBTENER DATOSORIGINALES
                const consulta = yield database_1.default.query('SELECT * FROM eh_detalle_horarios WHERE id = $1', [id]);
                const [datosOriginales] = consulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eh_detalle_horarios',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar registro con id ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'No se encuentra el registro.' });
                }
                const actualizacion = yield database_1.default.query(`
                UPDATE eh_detalle_horarios SET orden = $1, hora = $2, tolerancia = $3, id_horario = $4,
                    tipo_accion = $5, segundo_dia = $6, tercer_dia = $7, minutos_antes = $8, minutos_despues= $9 
                WHERE id = $10 RETURNING *
                `, [orden, hora, minu_espera, id_horario, tipo_accion, segundo_dia, tercer_dia, min_antes, min_despues, id]);
                const [datosNuevos] = actualizacion.rows;
                const horadetalle = yield (0, settingsMail_1.FormatearHora)(hora);
                const horadetalleO = yield (0, settingsMail_1.FormatearHora)(datosOriginales.hora);
                datosNuevos.hora = horadetalle;
                datosOriginales.hora = horadetalleO;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eh_detalle_horarios',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(datosNuevos),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al actualizar registro.' });
            }
        });
    }
    ListarDetalleHorarios(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const HORARIO = yield database_1.default.query(`
            SELECT * FROM eh_detalle_horarios
            ORDER BY id_horario ASC, orden ASC
            `);
            if (HORARIO.rowCount != 0) {
                const detallesHorarios = HORARIO.rows.map((detalle) => {
                    switch (detalle.tipo_accion) {
                        case 'E':
                            detalle.tipo_accion_show = 'Entrada';
                            break;
                        case 'I/A':
                            detalle.tipo_accion_show = 'Inicio alimentación';
                            break;
                        case 'F/A':
                            detalle.tipo_accion_show = 'Fin alimentación';
                            break;
                        case 'S':
                            detalle.tipo_accion_show = 'Salida';
                            break;
                        default:
                            detalle.tipo_accion_show = 'Desconocido';
                            break;
                    }
                    return detalle;
                });
                return res.jsonp(detallesHorarios);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
}
exports.DETALLE_CATALOGO_HORARIO_CONTROLADOR = new DetalleCatalogoHorarioControlador();
exports.default = exports.DETALLE_CATALOGO_HORARIO_CONTROLADOR;
