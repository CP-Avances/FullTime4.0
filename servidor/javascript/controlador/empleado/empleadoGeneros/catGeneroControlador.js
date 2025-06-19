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
exports.GENERO_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../../database"));
const auditoriaControlador_1 = __importDefault(require("../../reportes/auditoriaControlador"));
class GeneroControlador {
    // LISTA DE GENEROS
    ListarGeneros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const GENEROS = yield database_1.default.query(`
      SELECT * FROM e_genero  ORDER BY genero ASC
      `);
            if (GENEROS.rowCount != 0) {
                return res.jsonp(GENEROS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA BUSCAR TITULO POR SU NOMBRE   **USADO
    ObtenerGenero(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { genero } = req.params;
            const unGenero = yield database_1.default.query(`
      SELECT * FROM e_genero WHERE UPPER(genero) = $1
      `, [genero]);
            if (unGenero.rowCount != 0) {
                return res.jsonp(unGenero.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // METODO PARA REGISTRAR NIVEL DE TITULO   **USADO
    CrearGenero(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { genero, user_name, ip, ip_local } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
        INSERT INTO e_genero (genero) VALUES ($1) RETURNING *
        `, [genero]);
                const [nivel] = response.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'e_genero',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(nivel),
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (nivel) {
                    return res.status(200).jsonp(nivel);
                }
                else {
                    return res.status(404).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                console.log('error genero ', error);
                return res.status(500).jsonp({ message: 'Error al registrar el genero.' });
            }
        });
    }
    ActualizarGenero(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { genero, id, user_name, ip, ip_local } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const rol = yield database_1.default.query(`SELECT * FROM e_genero WHERE id = $1`, [id]);
                const [datosOriginales] = rol.rows;
                if (!datosOriginales) {
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'e_genero',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al actualizar el genero con id ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Error al actualizar el registro.' });
                }
                const datosNuevos = yield database_1.default.query(`
        UPDATE e_genero SET genero = $1 WHERE id = $2 RETURNING *
        `, [genero, id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'e_genero',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(datosNuevos.rows[0]),
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                // FINALIZAR TRANSACCION
                console.log("ver el error: ", error);
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al actualizar el registro.' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTROS   **USADO
    EliminarGenero(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_name, ip, ip_local } = req.body;
                const id = req.params.id;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // OBTENER DATOSORIGINALES
                const consulta = yield database_1.default.query(`SELECT * FROM e_genero WHERE id = $1`, [id]);
                const [datosOriginales] = consulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'e_genero',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al eliminar el genero con id ${id}. No existe el registro en la base de datos.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                yield database_1.default.query(`
        DELETE FROM e_genero WHERE id = $1
        `, [id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'e_genero',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
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
}
exports.GENERO_CONTROLADOR = new GeneroControlador();
exports.default = exports.GENERO_CONTROLADOR;
