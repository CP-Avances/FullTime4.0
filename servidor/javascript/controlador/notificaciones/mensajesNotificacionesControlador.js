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
exports.MENSAJES_NOTIFICACIONES_CONTROLADOR = void 0;
const auditoriaControlador_1 = __importDefault(require("../reportes/auditoriaControlador"));
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
const luxon_1 = require("luxon");
const database_1 = __importDefault(require("../../database"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class MensajesNotificacionesControlador {
    // METODO PARA CONSULTAR MENSAJES DE NOTIFICACIONES    **USADO
    MensajeEmpresa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empresa } = req.params;
            const DAY = yield database_1.default.query(`
            SELECT * FROM e_message_notificaciones WHERE id_empresa = $1
            `, [id_empresa]);
            if (DAY.rowCount != 0) {
                return res.jsonp(DAY.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA REGISTRAR MENSAJE DE NOTIFICACIONES    **USADO
    CrearMensajeNotificacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empresa, titulo, link, mensaje, user_name, ip, ip_local, tipo } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
                    INSERT INTO e_message_notificaciones (id_empresa, asunto, mensaje, link, tipo_notificacion) 
                        VALUES ($1, $2, $3, $4, $5) RETURNING *
                `, [id_empresa, titulo, mensaje, link, tipo]);
                const [notificacion] = response.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'e_message_notificaciones',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{id_empresa: ${id_empresa}, titulo: ${titulo}, mensaje: ${mensaje}, url: ${link}, tipo_notificacion: ${tipo}}`,
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp([{ message: 'Registro guardado.', id: notificacion.id }]);
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                console.log('error ', error);
                return res.status(500).jsonp({ text: 'Error al guardar el registro.' });
            }
        });
    }
    // METODO PARA CARGAR IMAGEN DE NOTIFICACION    **USADO
    CrearImagenNotificacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // FECHA DEL SISTEMA
                var fecha = luxon_1.DateTime.now();
                var anio = fecha.toFormat('yyyy');
                var mes = fecha.toFormat('MM');
                var dia = fecha.toFormat('dd');
                let imagen = anio + '_' + mes + '_' + dia + '_' + ((_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname);
                let id = req.params.id_empresa;
                let separador = path_1.default.sep;
                const { user_name, ip, ip_local } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const notificacion = yield database_1.default.query(`
                SELECT * FROM e_message_notificaciones WHERE id = $1
                `, [id]);
                if (notificacion.rowCount != 0) {
                    if (notificacion.rows[0].imagen != null) {
                        let ruta = (0, accesoCarpetas_1.ObtenerRutaMensajeNotificacion)() + separador + notificacion.rows[0].imagen;
                        // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                        fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                            if (!err) {
                                // ELIMINAR DEL SERVIDOR
                                fs_1.default.unlinkSync(ruta);
                            }
                        });
                    }
                    yield database_1.default.query(`
                    UPDATE e_message_notificaciones SET imagen = $2 WHERE id = $1
                    `, [id, imagen]);
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'e_message_notificaciones',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: JSON.stringify(notificacion.rows[0]),
                        datosNuevos: `{id: ${id}, img: ${imagen}}`,
                        ip: ip,
                        ip_local: ip_local,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.jsonp({ message: 'Imagen actualizada.' });
                }
                else {
                    return res.jsonp({ message: 'No se encuentran resultados.' });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al actualizar la imagen.' });
            }
        });
    }
    // METODO PARA VER IMAGENES   **USADO  FRONT
    ObtenerImagen(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const imagen = req.params.imagen;
            let separador = path_1.default.sep;
            let ruta = (0, accesoCarpetas_1.ObtenerRutaMensajeNotificacion)() + separador + imagen;
            fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                if (err) {
                }
                else {
                    res.sendFile(path_1.default.resolve(ruta));
                }
            });
        });
    }
    // METODO PARA ACTUALIZAR MENSAJE DE NOTIFICACIONES   **USADO
    EditarMensajeBirthday(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { titulo, mensaje, link, user_name, ip, ip_local, tipo } = req.body;
                const { id } = req.params;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`SELECT * FROM e_message_notificaciones WHERE id = $1`, [id]);
                const [datos] = response.rows;
                if (!datos) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'e_message_notificaciones',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al actualizar el mensaje de ${tipo}, no se encuentra el registro con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'No se encuentra el registro.' });
                }
                yield database_1.default.query(`
                UPDATE e_message_notificaciones SET asunto = $1, mensaje = $2, link = $3 WHERE id = $4
                `, [titulo, mensaje, link, id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'e_message_notificaciones',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datos),
                    datosNuevos: JSON.stringify({ titulo, mensaje, link }),
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: `Mensaje de ${tipo} actualizado.` });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: `Error al actualizar el mensaje de notificación.` });
            }
        });
    }
}
exports.MENSAJES_NOTIFICACIONES_CONTROLADOR = new MensajesNotificacionesControlador();
exports.default = exports.MENSAJES_NOTIFICACIONES_CONTROLADOR;
