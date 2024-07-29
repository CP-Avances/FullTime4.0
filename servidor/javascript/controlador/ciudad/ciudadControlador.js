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
const auditoriaControlador_1 = __importDefault(require("../auditoria/auditoriaControlador"));
const database_1 = __importDefault(require("../../database"));
class CiudadControlador {
    // BUSCAR DATOS RELACIONADOS A LA CIUDAD   **USADO
    ListarInformacionCiudad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_ciudad } = req.params;
            const CIUDAD = yield database_1.default.query(`
            SELECT p.continente, p.nombre AS pais, p.id AS id_pais, pro.nombre AS provincia
            FROM e_cat_paises AS p, e_provincias AS pro, e_ciudades AS c
            WHERE c.id = $1 AND c.id_provincia = pro.id AND p.id = pro.id_pais
            `, [id_ciudad]);
            if (CIUDAD.rowCount != 0) {
                return res.jsonp(CIUDAD.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // BUSCAR LISTA DE CIUDADES
    ListarCiudades(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const CIUDAD = yield database_1.default.query(`
            SELECT * FROM e_ciudades
            `);
            if (CIUDAD.rowCount != 0) {
                return res.jsonp(CIUDAD.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // BUSCAR LISTA DE CIUDADES PROVINCIA   **USADO
    ListarCiudadesProvincia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_provincia } = req.params;
            const CIUDAD = yield database_1.default.query(`
            SELECT * FROM e_ciudades WHERE id_provincia = $1
            `, [id_provincia]);
            if (CIUDAD.rowCount != 0) {
                return res.jsonp(CIUDAD.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // REGISTRAR CIUDAD   **USADO
    CrearCiudad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_provincia, descripcion, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const datosNuevos = yield database_1.default.query(`
                INSERT INTO e_ciudades (id_provincia, descripcion) VALUES ($1, $2) RETURNING *
                `, [id_provincia, descripcion]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'e_ciudades',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(datosNuevos.rows[0]),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.jsonp({ message: 'Registro guardado.' });
            }
            catch (error) {
                // FINALIZAR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'Error al guardar el registro.' });
            }
        });
    }
    // METODO PARA LISTAR NOMBRE DE CIUDADES - PROVINCIAS   **USADO
    ListarNombreCiudad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const CIUDAD = yield database_1.default.query(`
            SELECT c.id, c.descripcion AS nombre, p.nombre AS provincia, p.id AS id_prov
            FROM e_ciudades c, e_provincias p
            WHERE c.id_provincia = p.id
            ORDER BY provincia, nombre ASC
            `);
            if (CIUDAD.rowCount != 0) {
                return res.jsonp(CIUDAD.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTRO  **USADO
    EliminarCiudad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_name, ip } = req.body;
                const id = req.params.id;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOS ORIGINALES
                const ciudad = yield database_1.default.query(`SELECT * FROM e_ciudades WHERE id = $1`, [id]);
                const [datosOriginales] = ciudad.rows;
                if (!datosOriginales) {
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'e_ciudades',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar la ciudad con id ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Error al eliminar el registro.' });
                }
                yield database_1.default.query(`
                DELETE FROM e_ciudades WHERE id = $1
                `, [id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'e_ciudades',
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
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA CONSULTAR DATOS DE UNA CIUDAD
    ConsultarUnaCiudad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const CIUDAD = yield database_1.default.query(`
            SELECT * FROM e_ciudades WHERE id = $1
            `, [id]);
            if (CIUDAD.rowCount != 0) {
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
