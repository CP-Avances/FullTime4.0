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
const auditoriaControlador_1 = __importDefault(require("../auditoria/auditoriaControlador"));
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
const moment_1 = __importDefault(require("moment"));
const database_1 = __importDefault(require("../../database"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class BirthdayControlador {
    // METODO PARA CONSULTAR MENSAJE DE CUMPLEANIOS    **USADO
    MensajeEmpresa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empresa } = req.params;
            const DAY = yield database_1.default.query(`
            SELECT * FROM e_message_birthday WHERE id_empresa = $1
            `, [id_empresa]);
            if (DAY.rowCount != 0) {
                return res.jsonp(DAY.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA REGISTRAR MENSAJE DE CUMPLEANIOS    **USADO
    CrearMensajeBirthday(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empresa, titulo, link, mensaje, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
                INSERT INTO e_message_birthday (id_empresa, asunto, mensaje, link) VALUES ($1, $2, $3, $4) RETURNING *
                `, [id_empresa, titulo, mensaje, link]);
                const [cumpleanios] = response.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'e_message_birthday',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{id_empresa: ${id_empresa}, titulo: ${titulo}, mensaje: ${mensaje}, url: ${link}}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp([{ message: 'Registro guardado.', id: cumpleanios.id }]);
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ text: 'Error al guardar el registro.' });
            }
        });
    }
    // METODO PARA CARGAR MENSAJE DE CUMPLEANIOS    **USADO
    CrearImagenCumpleanios(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
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
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const cumpleanios = yield database_1.default.query(`
                SELECT * FROM e_message_birthday WHERE id = $1
                `, [id]);
                if (cumpleanios.rowCount != 0) {
                    if (cumpleanios.rows[0].imagen != null) {
                        let ruta = (0, accesoCarpetas_1.ObtenerRutaBirthday)() + separador + cumpleanios.rows[0].imagen;
                        // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                        fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                            if (!err) {
                                // ELIMINAR DEL SERVIDOR
                                fs_1.default.unlinkSync(ruta);
                            }
                        });
                    }
                    yield database_1.default.query(`
                    UPDATE e_message_birthday SET imagen = $2 WHERE id = $1
                    `, [id, imagen]);
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'e_message_birthday',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: JSON.stringify(cumpleanios.rows[0]),
                        datosNuevos: `{id: ${id}, img: ${imagen}}`,
                        ip,
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
    // METODO PARA ACTUALIZAR MENSAJE DE CUMPLEAÑOS   **USADO
    EditarMensajeBirthday(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { titulo, mensaje, link, user_name, ip } = req.body;
                const { id } = req.params;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`SELECT * FROM e_message_birthday WHERE id = $1`, [id]);
                const [datos] = response.rows;
                if (!datos) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'e_message_birthday',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar el mensaje de cumpleaños, no se encuentra el registro con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'No se encuentra el registro.' });
                }
                yield database_1.default.query(`
                UPDATE e_message_birthday SET asunto = $1, mensaje = $2, link = $3 WHERE id = $4
                `, [titulo, mensaje, link, id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'e_message_birthday',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datos),
                    datosNuevos: JSON.stringify({ titulo, mensaje, link }),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
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
