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
exports.DISCAPACIDAD_CONTROLADOR = void 0;
const auditoriaControlador_1 = __importDefault(require("../../auditoria/auditoriaControlador"));
const database_1 = __importDefault(require("../../../database"));
class DiscapacidadControlador {
    // METODO PARA BUSCAR DATOS DISCAPACIDAD USUARIO
    BuscarDiscapacidadUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const unaDiscapacidad = yield database_1.default.query(`
      SELECT cd.id_empleado, cd.carn_conadis, cd.porcentaje, cd.tipo, td.nombre AS nom_tipo
      FROM cg_discapacidades cd, tipo_discapacidad td, empleados e
      WHERE cd.id_empleado = e.id AND cd.tipo = td.id AND cd.id_empleado = $1
      `, [id_empleado]);
            if (unaDiscapacidad.rowCount > 0) {
                return res.jsonp(unaDiscapacidad.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    // METODO PARA REGISTRAR DISCAPACIDAD
    RegistrarDiscapacidad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empleado, carn_conadis, porcentaje, tipo, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                yield database_1.default.query(`
        INSERT INTO cg_discapacidades (id_empleado, carn_conadis, porcentaje, tipo) 
        VALUES ($1, $2, $3, $4)
        `, [id_empleado, carn_conadis, porcentaje, tipo]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'cg_discapacidades',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{id_empleado: ${id_empleado}, carn_conadis: ${carn_conadis}, porcentaje: ${porcentaje}, tipo: ${tipo}}`,
                    ip, observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.jsonp({ message: 'Discapacidad guardada' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'Error al guardar discapacidad.' });
            }
        });
    }
    // METODO PARA ACTUALIZAR DATOS DE REGISTRO
    ActualizarDiscapacidad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id_empleado = req.params.id_empleado;
                const { carn_conadis, porcentaje, tipo, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const discapacidad = yield database_1.default.query('SELECT * FROM cg_discapacidades WHERE id_empleado = $1', [id_empleado]);
                const [datosOriginales] = discapacidad.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'cg_discapacidades',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar discapacidad con id_empleado: ${id_empleado}`
                    });
                }
                yield database_1.default.query(`
        UPDATE cg_discapacidades SET carn_conadis = $1, porcentaje = $2, tipo = $3 
        WHERE id_empleado = $4
        `, [carn_conadis, porcentaje, tipo, id_empleado]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'cg_discapacidades',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: `{carn_conadis: ${carn_conadis}, porcentaje: ${porcentaje}, tipo: ${tipo}}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al actualizar registro.' });
            }
        });
    }
    EliminarDiscapacidad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_name, ip } = req.body;
                const id_empleado = req.params.id_empleado;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const discapacidad = yield database_1.default.query('SELECT * FROM cg_discapacidades WHERE id_empleado = $1', [id_empleado]);
                const [datosOriginales] = discapacidad.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'cg_discapacidades',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar discapacidad con id_empleado: ${id_empleado}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                yield database_1.default.query(`
        DELETE FROM cg_discapacidades WHERE id_empleado = $1
        `, [id_empleado]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'cg_discapacidades',
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
                return res.status(500).jsonp({ message: 'Error al eliminar registro.' });
            }
        });
    }
    /** *************************************************************************************** **
     ** **                METODO PARA MANEJO DE DATOS DE TIPO DISCAPACIDAD                   ** **
     ** *************************************************************************************** **/
    // METODO PARA CREAR TIPO DE DISCAPACIDAD
    RegistrarTipo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
        INSERT INTO tipo_discapacidad (nombre) VALUES ($1) RETURNING *
        `, [nombre]);
                const [tipo] = response.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'tipo_discapacidad',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{nombre: ${nombre}}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (tipo) {
                    return res.status(200).jsonp(tipo);
                }
                else {
                    return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al guardar registro.' });
            }
        });
    }
    // METODO PARA LISTAR TIPOS DE DISCAPACIDAD
    ListarTipo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const TIPO_DISCAPACIDAD = yield database_1.default.query(`
      SELECT * FROM tipo_discapacidad
      `);
            if (TIPO_DISCAPACIDAD.rowCount > 0) {
                return res.jsonp(TIPO_DISCAPACIDAD.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const DISCAPACIDAD = yield database_1.default.query('SELECT * FROM cg_discapacidades');
            if (DISCAPACIDAD.rowCount > 0) {
                return res.jsonp(DISCAPACIDAD.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Discapacidad no encontrada' });
            }
        });
    }
    /* TIPO DISCAPACIDAD */
    ObtenerUnTipoD(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const TIPO_DISCAPACIDAD = yield database_1.default.query('SELECT * FROM tipo_discapacidad WHERE id = $1', [id]);
            if (TIPO_DISCAPACIDAD.rowCount > 0) {
                return res.jsonp(TIPO_DISCAPACIDAD.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado' });
            }
        });
    }
    ActualizarTipoD(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params;
                const { nombre, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const tipoDiscapacidad = yield database_1.default.query('SELECT * FROM tipo_discapacidad WHERE id = $1', [id]);
                const [datosOriginales] = tipoDiscapacidad.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'tipo_discapacidad',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar tipo de discapacidad con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                yield database_1.default.query('UPDATE tipo_discapacidad SET nombre = $1 WHERE id = $2', [nombre, id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'tipo_discapacidad',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: `{nombre: ${nombre}}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Tipo de Discapacidad actualizado exitosamente' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al actualizar registro.' });
            }
        });
    }
}
exports.DISCAPACIDAD_CONTROLADOR = new DiscapacidadControlador();
exports.default = exports.DISCAPACIDAD_CONTROLADOR;
