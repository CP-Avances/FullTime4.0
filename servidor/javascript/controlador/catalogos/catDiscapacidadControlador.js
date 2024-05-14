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
exports.DISCAPACIDADCONTROLADOR = void 0;
const database_1 = __importDefault(require("../../database"));
class DiscapacidadControlador {
    // METODO PARA LISTAR TIPO DE DISCAPACIDAD
    ListarDiscapacidad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const DISCAPACIDAD = yield database_1.default.query(`
                SELECT * FROM e_cat_discapacidad ORDER BY nombre ASC
                `);
                if (DISCAPACIDAD.rowCount > 0) {
                    return res.jsonp(DISCAPACIDAD.rows);
                }
                else {
                    return res.status(404).jsonp({ text: 'No se encuentran registros.' });
                }
            }
            catch (error) {
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    // METODO PARA REGISTRAR UN TIPO DE DISCAPACIDAD
    CrearDiscapacidad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { discapacidad } = req.body;
                var VERIFICAR_DISCAPACIDAD = yield database_1.default.query(`
                SELECT * FROM e_cat_discapacidad WHERE UPPER(nombre) = $1
                `, [discapacidad.toUpperCase()]);
                if (VERIFICAR_DISCAPACIDAD.rows[0] == undefined || VERIFICAR_DISCAPACIDAD.rows[0] == '') {
                    const discapacidadInsertar = discapacidad.charAt(0).toUpperCase() + discapacidad.slice(1).toLowerCase();
                    const response = yield database_1.default.query(`
                    INSERT INTO e_cat_discapacidad (nombre) VALUES ($1) RETURNING *
                    `, [discapacidadInsertar]);
                    const [discapacidadInsertada] = response.rows;
                    if (discapacidadInsertada) {
                        return res.status(200).jsonp({ message: 'Registro guardado.', status: '200' });
                    }
                    else {
                        return res.status(404).jsonp({ message: 'Ups!!! algo salio mal.', status: '400' });
                    }
                }
                else {
                    return res.jsonp({ message: 'Tipo discapacidad registrada ya existe en el sistema.', status: '300' });
                }
            }
            catch (error) {
                return res.status(500).jsonp({ message: 'error', status: '500' });
            }
        });
    }
    // METODO PARA EDITAR UN TIPO DE DISCAPACIDAD
    EditarDiscapacidad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, nombre } = req.body;
                const nombreConFormato = nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();
                const response = yield database_1.default.query(`
                UPDATE e_cat_discapacidad SET nombre = $2
                WHERE id = $1 RETURNING *
                `, [id, nombreConFormato]);
                const [discapacidadEditada] = response.rows;
                if (discapacidadEditada) {
                    return res.status(200).jsonp({ message: 'Registro actualizado.', status: '200' });
                }
                else {
                    return res.status(404).jsonp({ message: 'Ups!!! algo salio mal.', status: '400' });
                }
            }
            catch (error) {
                return res.status(500).jsonp({ message: 'error', status: '500' });
            }
        });
    }
    // METODO PARA ELIMINAR UN TIPO DE DISCAPACIDAD
    eliminarRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                yield database_1.default.query(`
                DELETE FROM e_cat_discapacidad WHERE id = $1
                `, [id]);
                res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
}
exports.DISCAPACIDADCONTROLADOR = new DiscapacidadControlador();
exports.default = exports.DISCAPACIDADCONTROLADOR;
