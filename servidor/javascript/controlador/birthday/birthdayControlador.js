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
const moment_1 = __importDefault(require("moment"));
const database_1 = __importDefault(require("../../database"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class BirthdayControlador {
    // METODO PARA CONSULTAR MENSAJE DE CUMPLEANIOS
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
    // METODO PARA REGISTRAR MENSAJE DE CUMPLEANIOS
    CrearMensajeBirthday(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empresa, titulo, link, mensaje } = req.body;
            yield database_1.default.query(`
            INSERT INTO e_message_birthday (id_empresa, asunto, mensaje, link) VALUES ($1, $2, $3, $4)
            `, [id_empresa, titulo, mensaje, link]);
            const oneMessage = yield database_1.default.query(`
            SELECT id FROM e_message_birthday WHERE id_empresa = $1
            `, [id_empresa]);
            const idMessageGuardado = oneMessage.rows[0].id;
            res.jsonp([{ message: 'Registro guardado.', id: idMessageGuardado }]);
        });
    }
    // METODO PARA CARGAR MENSAJE DE CUMPLEANIOS    --**VERIFICADO
    CrearImagenEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // FECHA DEL SISTEMA
            var fecha = (0, moment_1.default)();
            var anio = fecha.format('YYYY');
            var mes = fecha.format('MM');
            var dia = fecha.format('DD');
            let imagen = anio + '_' + mes + '_' + dia + '_' + ((_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname);
            let id = req.params.id_empresa;
            let separador = path_1.default.sep;
            const unEmpleado = yield database_1.default.query(`
            SELECT * FROM e_message_birthday WHERE id = $1
            `, [id]);
            if (unEmpleado.rowCount != 0) {
                unEmpleado.rows.map((obj) => __awaiter(this, void 0, void 0, function* () {
                    if (obj.img != null) {
                        try {
                            let ruta = (0, accesoCarpetas_1.ObtenerRutaBirthday)() + separador + obj.img;
                            // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                            fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                                if (err) {
                                }
                                else {
                                    // ELIMINAR DEL SERVIDOR
                                    fs_1.default.unlinkSync(ruta);
                                }
                            });
                            yield database_1.default.query(`
                            UPDATE e_message_birthday SET imagen = $2 WHERE id = $1
                            `, [id, imagen]);
                            res.jsonp({ message: 'Imagen actualizada.' });
                        }
                        catch (error) {
                            yield database_1.default.query(`
                            UPDATE e_message_birthday SET imagen = $2 WHERE id = $1
                            `, [id, imagen]);
                            res.jsonp({ message: 'Imagen actualizada.' });
                        }
                    }
                    else {
                        yield database_1.default.query(`
                        UPDATE e_message_birthday SET imagen = $2 WHERE id = $1
                        `, [id, imagen]);
                        res.jsonp({ message: 'Imagen actualizada.' });
                    }
                }));
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
            const { titulo, mensaje, link } = req.body;
            const { id_mensaje } = req.params;
            yield database_1.default.query(`
            UPDATE e_message_birthday SET asunto = $1, mensaje = $2, link = $3 WHERE id = $4
            `, [titulo, mensaje, link, id_mensaje]);
            res.jsonp({ message: 'Mensaje de cumpleaños actualizado.' });
        });
    }
}
exports.BIRTHDAY_CONTROLADOR = new BirthdayControlador();
exports.default = exports.BIRTHDAY_CONTROLADOR;
