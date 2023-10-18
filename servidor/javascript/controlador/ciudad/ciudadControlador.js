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
exports.CIUDAD_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../database"));
const builder = require('xmlbuilder');
class CiudadControlador {
    // BUSCAR DATOS RELACIONADOS A LA CIUDAD
    ListarInformacionCiudad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_ciudad } = req.params;
            const CIUDAD = yield database_1.default.query(`
            SELECT p.continente, p.nombre AS pais, p.id AS id_pais, pro.nombre AS provincia
            FROM cg_paises AS p, cg_provincias AS pro, ciudades AS c
            WHERE c.id = $1 AND c.id_provincia = pro.id AND p.id = pro.id_pais
            `, [id_ciudad]);
            if (CIUDAD.rowCount > 0) {
                return res.jsonp(CIUDAD.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    // BUSCAR LISTA DE CIUDADES
    ListarCiudades(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const CIUDAD = yield database_1.default.query(`
            SELECT * FROM ciudades
            `);
            if (CIUDAD.rowCount > 0) {
                return res.jsonp(CIUDAD.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    // BUSCAR LISTA DE CIUDADES PROVINCIA
    ListarCiudadesProvincia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_provincia } = req.params;
            const CIUDAD = yield database_1.default.query(`
            SELECT * FROM ciudades WHERE id_provincia = $1
            `, [id_provincia]);
            if (CIUDAD.rowCount > 0) {
                return res.jsonp(CIUDAD.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    // REGISTRAR CIUDAD
    CrearCiudad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_provincia, descripcion } = req.body;
            yield database_1.default.query(`
            INSERT INTO ciudades (id_provincia, descripcion) VALUES ($1, $2)
            `, [id_provincia, descripcion]);
            res.jsonp({ message: 'Registro guardado.' });
        });
    }
    // METODO PARA LISTAR NOMBRE DE CIUDADES - PROVINCIAS
    ListarNombreCiudad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const CIUDAD = yield database_1.default.query(`
            SELECT c.id, c.descripcion AS nombre, p.nombre AS provincia, p.id AS id_prov
            FROM ciudades c, cg_provincias p
            WHERE c.id_provincia = p.id
            ORDER BY provincia, nombre ASC
            `);
            if (CIUDAD.rowCount > 0) {
                return res.jsonp(CIUDAD.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTRO
    EliminarCiudad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield database_1.default.query(`
            DELETE FROM ciudades WHERE id = $1
            `, [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    // METODO PARA CONSULTAR DATOS DE UNA CIUDAD
    ConsultarUnaCiudad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const CIUDAD = yield database_1.default.query(`
            SELECT * FROM ciudades WHERE id = $1
            `, [id]);
            if (CIUDAD.rowCount > 0) {
                return res.jsonp(CIUDAD.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
}
exports.CIUDAD_CONTROLADOR = new CiudadControlador();
exports.default = exports.CIUDAD_CONTROLADOR;
