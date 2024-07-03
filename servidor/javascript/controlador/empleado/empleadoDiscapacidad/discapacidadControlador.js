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
      SELECT cd.id_empleado, cd.carnet_conadis, cd.porcentaje, cd.id_discapacidad, td.nombre AS nom_tipo
      FROM eu_empleado_discapacidad cd, e_cat_discapacidad td, eu_empleados e
      WHERE cd.id_empleado = e.id AND cd.id_discapacidad = td.id AND cd.id_empleado = $1
      `, [id_empleado]);
            if (unaDiscapacidad.rowCount != 0) {
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
                const usuario = yield database_1.default.query(`
        SELECT id FROM eu_usuarios WHERE id_empleado = $1
        `, [id_empleado]);
                const id_usuario = usuario.rows[0].id;
                const datosNuevos = yield database_1.default.query(`
        INSERT INTO eu_empleado_discapacidad (id_empleado, carnet_conadis, porcentaje, id_discapacidad, id_usuario) 
        VALUES ($1, $2, $3, $4, $5) RETURNING *
        `, [id_empleado, carn_conadis, porcentaje, tipo, id_usuario]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_empleado_discapacidad',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(datosNuevos.rows[0]),
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
                const discapacidad = yield database_1.default.query('SELECT * FROM eu_empleado_discapacidad WHERE id_empleado = $1', [id_empleado]);
                const [datosOriginales] = discapacidad.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_empleado_discapacidad',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar discapacidad con id_empleado: ${id_empleado}`
                    });
                }
                const datosNuevos = yield database_1.default.query(`
        UPDATE eu_empleado_discapacidad SET carnet_conadis = $1, porcentaje = $2, id_discapacidad = $3 
        WHERE id_empleado = $4 RETURNING *
        `, [carn_conadis, porcentaje, tipo, id_empleado]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_empleado_discapacidad',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(datosNuevos.rows[0]),
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
                const discapacidad = yield database_1.default.query('SELECT * FROM eu_empleado_discapacidad WHERE id_empleado = $1', [id_empleado]);
                const [datosOriginales] = discapacidad.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_empleado_discapacidad',
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
        DELETE FROM eu_empleado_discapacidad WHERE id_empleado = $1
        `, [id_empleado]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_empleado_discapacidad',
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
        INSERT INTO e_cat_discapacidad (nombre) VALUES ($1) RETURNING *
        `, [nombre]);
                const [tipo] = response.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'e_cat_discapacidad',
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
      SELECT * FROM e_cat_discapacidad
      `);
            if (TIPO_DISCAPACIDAD.rowCount != 0) {
                return res.jsonp(TIPO_DISCAPACIDAD.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // METODO PARA BUSCAR DISCAPACIDAD POR SU NOMBRE
    BuscarDiscapacidadNombre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.body;
            const TIPO_DISCAPACIDAD = yield database_1.default.query(`
      SELECT * FROM e_cat_discapacidad WHERE UPPER(nombre) = $1
      `, [nombre]);
            if (TIPO_DISCAPACIDAD.rowCount != 0) {
                return res.jsonp(TIPO_DISCAPACIDAD.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const DISCAPACIDAD = yield database_1.default.query(`
      SELECT * FROM eu_empleado_discapacidad
      `);
            if (DISCAPACIDAD.rowCount != 0) {
                return res.jsonp(DISCAPACIDAD.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
}
exports.DISCAPACIDAD_CONTROLADOR = new DiscapacidadControlador();
exports.default = exports.DISCAPACIDAD_CONTROLADOR;
