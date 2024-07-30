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
exports.CIUDAD_FERIADO_CONTROLADOR = void 0;
const auditoriaControlador_1 = __importDefault(require("../auditoria/auditoriaControlador"));
const database_1 = __importDefault(require("../../database"));
class CiudadFeriadoControlador {
    // METODO PARA BUSCAR CIUDADES - PROVINCIA POR NOMBRE  **USADO
    FiltrarCiudadesProvincia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.params;
            const CIUDAD_FERIADO = yield database_1.default.query(`
            SELECT c.id, c.descripcion, p.nombre, p.id AS id_prov
            FROM e_ciudades c, e_provincias p 
            WHERE c.id_provincia = p.id AND p.nombre = $1
            `, [nombre]);
            if (CIUDAD_FERIADO.rowCount != 0) {
                return res.jsonp(CIUDAD_FERIADO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    // METODO PARA BUSCAR NOMBRES DE CIUDADES    **USADO
    EncontrarCiudadesFeriado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { idferiado } = req.params;
            const CIUDAD_FERIADO = yield database_1.default.query(`
            SELECT fe.id AS idferiado, fe.descripcion AS nombreferiado, cfe.id AS idciudad_asignada,
                c.id AS idciudad, c.descripcion AS nombreciudad
            FROM ef_cat_feriados fe, ef_ciudad_feriado cfe, e_ciudades c
            WHERE fe.id = cfe.id_feriado AND c.id = cfe.id_ciudad AND fe.id = $1
            `, [idferiado]);
            if (CIUDAD_FERIADO.rowCount != 0) {
                return res.jsonp(CIUDAD_FERIADO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTRO    **USADO
    EliminarCiudadFeriado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_name, ip } = req.body;
                const id = req.params.id;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOS ORIGINALES
                const ciudad = yield database_1.default.query(`SELECT * FROM ef_ciudad_feriado WHERE id = $1`, [id]);
                const [datosOriginales] = ciudad.rows;
                if (!datosOriginales) {
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ef_ciudad_feriado',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar la ciudad con id ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Error al eliminar el registro.' });
                }
                yield database_1.default.query(`
                DELETE FROM ef_ciudad_feriado WHERE id = $1
                `, [id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ef_ciudad_feriado',
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
                return res.status(500).jsonp({ message: 'Error al eliminar el registro.' });
            }
        });
    }
    // METODO PARA BUSCAR ID DE CIUDADES   **USADO
    ObtenerIdCiudades(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_feriado, id_ciudad } = req.body;
            const CIUDAD_FERIADO = yield database_1.default.query(`
            SELECT * FROM ef_ciudad_feriado WHERE id_feriado = $1 AND id_ciudad = $2
            `, [id_feriado, id_ciudad]);
            if (CIUDAD_FERIADO.rowCount != 0) {
                return res.jsonp(CIUDAD_FERIADO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    // METODO PARA ASIGNAR CIUDADES A FERIADO   **USADO
    AsignarCiudadFeriado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_feriado, id_ciudad, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
                INSERT INTO ef_ciudad_feriado (id_feriado, id_ciudad) VALUES ($1, $2) RETURNING *
                `, [id_feriado, id_ciudad]);
                const [feriado] = response.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ef_ciudad_feriado',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(feriado),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (feriado) {
                    return res.status(200).jsonp({ message: 'OK', reloj: feriado });
                }
                else {
                    return res.status(404).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA ACTUALIZAR REGISTRO    **USADO
    ActualizarCiudadFeriado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_feriado, id_ciudad, id, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOS ORIGINALES
                const ciudad = yield database_1.default.query(`SELECT * FROM ef_ciudad_feriado WHERE id = $1`, [id]);
                const [datosOriginales] = ciudad.rows;
                if (!datosOriginales) {
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ef_ciudad_feriado',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar la ciudad con id ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Error al actualizar el registro.' });
                }
                const actualizacion = yield database_1.default.query(`
                UPDATE ef_ciudad_feriado SET id_feriado = $1, id_ciudad = $2 WHERE id = $3 RETURNING *
                `, [id_feriado, id_ciudad, id]);
                const [datosNuevos] = actualizacion.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ef_ciudad_feriado',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(datosNuevos),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                // FINALIZAR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al actualizar el registro.' });
            }
        });
    }
    ObtenerFeriadosCiudad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id_ciudad = req.params.id_ciudad;
            const CIUDAD_FERIADO = yield database_1.default.query(`
            SELECT * FROM ef_ciudad_feriado WHERE id_ciudad = $1
            `, [id_ciudad]);
            if (CIUDAD_FERIADO.rowCount != 0) {
                return res.jsonp(CIUDAD_FERIADO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
}
exports.CIUDAD_FERIADO_CONTROLADOR = new CiudadFeriadoControlador();
exports.default = exports.CIUDAD_FERIADO_CONTROLADOR;
