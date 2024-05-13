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
exports.vacunaControlador = void 0;
const database_1 = __importDefault(require("../../database"));
class VacunaControlador {
    listaVacuna(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const VACUNA = yield database_1.default.query(`
                SELECT * FROM e_cat_vacuna ORDER BY nombre ASC
                `);
                if (VACUNA.rowCount > 0) {
                    return res.jsonp(VACUNA.rows);
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
    CrearVacuna(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { vacuna } = req.body;
                var VERIFICAR_VACUNA = yield database_1.default.query(`
                SELECT * FROM e_cat_vacuna WHERE UPPER(nombre) = $1
                `, [vacuna.toUpperCase()]);
                console.log('VERIFICAR_VACUNA: ', VERIFICAR_VACUNA.rows[0]);
                if (VERIFICAR_VACUNA.rows[0] == undefined || VERIFICAR_VACUNA.rows[0] == '') {
                    // Dar formato a la palabra de vacuna
                    const vacunaInsertar = vacuna.charAt(0).toUpperCase() + vacuna.slice(1).toLowerCase();
                    const response = yield database_1.default.query(`
                    INSERT INTO e_cat_vacuna (nombre) VALUES ($1) RETURNING *
                    `, [vacunaInsertar]);
                    const [vacunaInsertada] = response.rows;
                    if (vacunaInsertada) {
                        return res.status(200).jsonp({ message: 'Registro guardado.', status: '200' });
                    }
                    else {
                        return res.status(404).jsonp({ message: 'No se pudo guardar', status: '400' });
                    }
                }
                else {
                    return res.jsonp({ message: 'Ya existe la vacuna ', status: '300' });
                }
            }
            catch (error) {
                return res.status(500).jsonp({ message: 'error', status: '500' });
            }
        });
    }
    EditarVacuna(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, nombre } = req.body;
                console.log('id: ', id, 'nombre: ', nombre);
                // Dar formato a la palabra de vacuna
                const nombreConFormato = nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();
                const response = yield database_1.default.query(`
                UPDATE e_cat_vacuna SET nombre = $2
                WHERE id = $1 RETURNING *
                `, [id, nombreConFormato]);
                const [vacunaEditada] = response.rows;
                if (vacunaEditada) {
                    return res.status(200).jsonp({ message: 'Registro actualizado.', status: '200' });
                }
                else {
                    return res.status(404).jsonp({ message: 'No se pudo actualizar', status: '400' });
                }
            }
            catch (error) {
                return res.status(500).jsonp({ message: 'error', status: '500' });
            }
        });
    }
    eliminarRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                console.log('id: ', id);
                yield database_1.default.query(`
                DELETE FROM e_cat_vacuna WHEREi d = $1
            `, [id]);
                res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
}
exports.vacunaControlador = new VacunaControlador();
exports.default = exports.vacunaControlador;
