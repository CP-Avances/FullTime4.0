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
exports.BIRTHDAY_CONTROLADOR = void 0;
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
const auditoriaControlador_1 = __importDefault(require("../auditoria/auditoriaControlador"));
const database_1 = __importDefault(require("../../database"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const moment_1 = __importDefault(require("moment"));
class BirthdayControlador {
    // METODO PARA CONSULTAR MENSAJE DE CUMPLEANIOS
    MensajeEmpresa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empresa } = req.params;
            const DAY = yield database_1.default.query(`
            SELECT * FROM Message_birthday WHERE id_empresa = $1
            `, [id_empresa]);
            if (DAY.rowCount > 0) {
                return res.jsonp(DAY.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA REGISTRAR MENSAJE DE CUMPLEANIOS
    CrearMensajeBirthday(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empresa, titulo, link, mensaje, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                yield database_1.default.query(`
                INSERT INTO message_birthday (id_empresa, titulo, mensaje, url) VALUES ($1, $2, $3, $4)
                `, [id_empresa, titulo, mensaje, link]);
                // AUDITORIA
                auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'message_birthday',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{id_empresa: ${id_empresa}, titulo: ${titulo}, mensaje: ${mensaje}, url: ${link}}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                const oneMessage = yield database_1.default.query(`
                SELECT id FROM message_birthday WHERE id_empresa = $1
                `, [id_empresa]);
                const idMessageGuardado = oneMessage.rows[0].id;
                return res.jsonp([{ message: 'Registro guardado.', id: idMessageGuardado }]);
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ text: 'Error al guardar el registro.' });
            }
        });
    }
    // METODO PARA CARGAR MENSAJE DE CUMPLEANIOS    --**VERIFICADO
    CrearImagenEmpleado(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // FECHA DEL SISTEMA
                var fecha = (0, moment_1.default)();
                var anio = fecha.format('YYYY');
                var mes = fecha.format('MM');
                var dia = fecha.format('DD');
                let imagen = anio + '_' + mes + '_' + dia + '_' + ((_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname);
                let id = req.params.id_empresa;
                let separador = path_1.default.sep;
                const { user_name, ip } = req.body;
                const unEmpleado = yield database_1.default.query(`
                SELECT * FROM message_birthday WHERE id = $1
                `, [id]);
                if (unEmpleado.rowCount > 0) {
                    unEmpleado.rows.map((obj) => __awaiter(this, void 0, void 0, function* () {
                        if (obj.img != null) {
                            let ruta = (0, accesoCarpetas_1.ObtenerRutaBirthday)() + separador + obj.img;
                            // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                            fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                                if (!err) {
                                    // ELIMINAR DEL SERVIDOR
                                    fs_1.default.unlinkSync(ruta);
                                }
                            });
                        }
                        try {
                            // INICIAR TRANSACCION
                            yield database_1.default.query('BEGIN');
                            yield database_1.default.query(`
                            UPDATE message_birthday SET img = $2 WHERE id = $1
                            `, [id, imagen]);
                            // AUDITORIA
                            auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'message_birthday',
                                usuario: user_name,
                                accion: 'U',
                                datosOriginales: JSON.stringify(obj),
                                datosNuevos: `{id: ${id}, img: ${imagen}}`,
                                ip,
                                observacion: null
                            });
                        }
                        catch (error) {
                            // REVERTIR TRANSACCION
                            yield database_1.default.query('ROLLBACK');
                            throw error;
                        }
                    }));
                    return res.jsonp({ message: 'Imagen actualizada.' });
                }
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'message_birthday',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip,
                    observacion: 'Error al actualizar la imagen, no se encuentra el registro.'
                });
                return res.status(404).jsonp({ message: 'No se encuentra el registro.' });
            }
            catch (error) {
                return res.status(500).jsonp({ message: 'Error al actualizar la imagen.' });
            }
        });
    }
    // METODO PARA VER IMAGENES
    getImagen(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const imagen = req.params.imagen;
            let separador = path_1.default.sep;
            let ruta = (0, accesoCarpetas_1.ObtenerRutaBirthday)() + separador + imagen;
            fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                if (err) {
                }
                else {
                    res.sendFile(path_1.default.resolve(ruta));
                }
            });
        });
    }
    EditarMensajeBirthday(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { titulo, mensaje, link, user_name, ip } = req.body;
                const { id_mensaje } = req.params;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`SELECT * FROM message_birthday WHERE id = $1`, [id_mensaje]);
                const [datos] = response.rows;
                if (!datos) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'message_birthday',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar el mensaje de cumpleaños, no se encuentra el registro con id: ${id_mensaje}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'No se encuentra el registro.' });
                }
                yield database_1.default.query(`
                UPDATE message_birthday SET titulo = $1, mensaje = $2, url = $3 WHERE id = $4
                `, [titulo, mensaje, link, id_mensaje]);
                // AUDITORIA
                auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'message_birthday',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datos),
                    datosNuevos: `{titulo: ${titulo}, mensaje: ${mensaje}, url: ${link}}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION|
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Mensaje de cumpleaños actualizado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al actualizar el mensaje de cumpleaños.' });
            }
        });
    }
}
exports.BIRTHDAY_CONTROLADOR = new BirthdayControlador();
exports.default = exports.BIRTHDAY_CONTROLADOR;
