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
exports.NIVEL_TITULO_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../database"));
const builder = require('xmlbuilder');
class NivelTituloControlador {
    // METODO PARA LISTAR NIVELES DE TITULO PROFESIONAL
    ListarNivel(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const titulo = yield database_1.default.query(`
      SELECT * FROM nivel_titulo ORDER BY nombre ASC
      `);
            if (titulo.rowCount > 0) {
                return res.jsonp(titulo.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTROS
    EliminarNivelTitulo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield database_1.default.query(`
      DELETE FROM nivel_titulo WHERE id = $1
      `, [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    // METODO PARA REGISTRAR NIVEL DE TITULO
    CrearNivel(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.body;
            const response = yield database_1.default.query(`
      INSERT INTO nivel_titulo (nombre) VALUES ($1) RETURNING *
      `, [nombre]);
            const [nivel] = response.rows;
            if (nivel) {
                return res.status(200).jsonp(nivel);
            }
            else {
                return res.status(404).jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA ACTUALIZAR REGISTRO DE NIVEL DE TITULO
    ActualizarNivelTitulo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, id } = req.body;
            yield database_1.default.query(`
      UPDATE nivel_titulo SET nombre = $1 WHERE id = $2
      `, [nombre, id]);
            res.jsonp({ message: 'Registro actualizado.' });
        });
    }
    // METODO PARA BUSCAR TITULO POR SU NOMBRE
    ObtenerNivelNombre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.params;
            const unNivelTitulo = yield database_1.default.query(`
      SELECT * FROM nivel_titulo WHERE nombre = $1
      `, [nombre]);
            if (unNivelTitulo.rowCount > 0) {
                return res.jsonp(unNivelTitulo.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado' });
            }
        });
    }
    getOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const unNivelTitulo = yield database_1.default.query('SELECT * FROM nivel_titulo WHERE id = $1', [id]);
            if (unNivelTitulo.rowCount > 0) {
                return res.jsonp(unNivelTitulo.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado' });
            }
        });
    }
}
exports.NIVEL_TITULO_CONTROLADOR = new NivelTituloControlador();
exports.default = exports.NIVEL_TITULO_CONTROLADOR;
