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
exports.PROVINCIA_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../database"));
const auditoriaControlador_1 = __importDefault(require("../auditoria/auditoriaControlador"));
class ProvinciaControlador {
    // LISTA DE PAISES DE ACUERDO AL CONTINENTE  **USADO
    ListarPaises(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { continente } = req.params;
            const CONTINENTE = yield database_1.default.query(`
      SELECT * FROM e_cat_paises WHERE continente = $1 ORDER BY nombre ASC
      `, [continente]);
            if (CONTINENTE.rowCount != 0) {
                return res.jsonp(CONTINENTE.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA BUSCAR LISTA DE CONTINENTES  **USADO
    ListarContinentes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const CONTINENTE = yield database_1.default.query(`
      SELECT continente FROM e_cat_paises GROUP BY continente ORDER BY continente ASC
      `);
            if (CONTINENTE.rowCount != 0) {
                return res.jsonp(CONTINENTE.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA BUSCAR PROVINCIAS POR PAIS  **USADO
    BuscarProvinciaPais(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_pais } = req.params;
            const UNA_PROVINCIA = yield database_1.default.query(`
      SELECT * FROM e_provincias WHERE id_pais = $1
      `, [id_pais]);
            if (UNA_PROVINCIA.rowCount != 0) {
                return res.jsonp(UNA_PROVINCIA.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    // METODO PARA BUSCAR PROVINCIAS  **USADO
    ListarProvincia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const PROVINCIA = yield database_1.default.query(`
      SELECT pro.id, pro.nombre, pro.id_pais, pa.nombre AS pais
      FROM e_provincias pro, e_cat_paises pa
      WHERE pro.id_pais = pa.id;
      `);
            if (PROVINCIA.rowCount != 0) {
                return res.jsonp(PROVINCIA.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTROS  **USADO
    EliminarProvincia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_name, ip } = req.body;
                const id = req.params.id;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const provincia = yield database_1.default.query(`SELECT * FROM e_provincias WHERE id = $1`, [id]);
                const [datosOriginales] = provincia.rows;
                if (!datosOriginales) {
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'e_provincias',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        observacion: `Error al eliminar el registro con id: ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                yield database_1.default.query(`
        DELETE FROM e_provincias WHERE id = $1
        `, [id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'e_provincias',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: '',
                    ip: ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.jsonp({ message: "error" });
            }
        });
    }
    // METODO PARA REGISTRAR PROVINCIA   **USADO
    CrearProvincia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, id_pais, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const datosNuevos = yield database_1.default.query(`
        INSERT INTO e_provincias (nombre, id_pais) VALUES ($1, $2) RETURNING *
        `, [nombre, id_pais]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'e_provincias',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(datosNuevos.rows[0]),
                    ip: ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.jsonp({ message: 'Registro guardado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: error });
            }
        });
    }
    // METODO PARA BUSCAR INFORMACION DE UN PAIS
    ObtenerPais(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const PAIS = yield database_1.default.query(`
      SELECT * FROM e_cat_paises WHERE id = $1
      `, [id]);
            if (PAIS.rowCount != 0) {
                return res.jsonp(PAIS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    ObtenerProvincia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const UNA_PROVINCIA = yield database_1.default.query(`
      SELECT * FROM e_provincias WHERE id = $1
      `, [id]);
            if (UNA_PROVINCIA.rowCount != 0) {
                return res.jsonp(UNA_PROVINCIA.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'El registro no ha sido encontrada.' });
            }
        });
    }
}
exports.PROVINCIA_CONTROLADOR = new ProvinciaControlador();
exports.default = exports.PROVINCIA_CONTROLADOR;
