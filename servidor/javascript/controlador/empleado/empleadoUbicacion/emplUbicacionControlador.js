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
exports.UBICACION_CONTROLADOR = void 0;
const auditoriaControlador_1 = __importDefault(require("../../auditoria/auditoriaControlador"));
const database_1 = __importDefault(require("../../../database"));
class UbicacionControlador {
    /** ************************************************************************************************ **
     ** **        REGISTRO TABLA CATALOGO DE UBICACIONES - COORDENADAS (cat_ubicaciones)               ** **
     ** ************************************************************************************************ **/
    // CREAR REGISTRO DE COORDENADAS GENERALES DE UBICACION    **USADO
    RegistrarCoordenadas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { latitud, longitud, descripcion, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
                INSERT INTO mg_cat_ubicaciones (latitud, longitud, descripcion)
                VALUES ($1, $2, $3) RETURNING *
                `, [latitud, longitud, descripcion]);
                const [coordenadas] = response.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'mg_cat_ubicaciones',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{latitud: ${latitud}, longitud: ${longitud}, descripcion: ${descripcion}}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (coordenadas) {
                    return res.status(200).jsonp({ message: 'OK', respuesta: coordenadas });
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
    // ACTUALIZAR REGISTRO DE COORDENADAS GENERALES DE UBICACION   **USADO
    ActualizarCoordenadas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { latitud, longitud, descripcion, id, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const coordenada = yield database_1.default.query(`SELECT * FROM mg_cat_ubicaciones WHERE id = $1`, [id]);
                const [datosOriginales] = coordenada.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'mg_cat_ubicaciones',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar coordenada con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Error al actualizar coordenada' });
                }
                yield database_1.default.query(`
                UPDATE mg_cat_ubicaciones SET latitud = $1, longitud = $2, descripcion = $3
                WHERE id = $4
                `, [latitud, longitud, descripcion, id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'mg_cat_ubicaciones',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: `{latitud: ${latitud}, longitud: ${longitud}, descripcion: ${descripcion}}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro guardado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al guardar registro.' });
            }
        });
    }
    // LISTAR TODOS LOS REGISTROS DE COORDENADAS GENERALES DE UBICACION    **USADO
    ListarCoordenadas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const UBICACIONES = yield database_1.default.query(`
            SELECT * FROM mg_cat_ubicaciones
            `);
            if (UBICACIONES.rowCount != 0) {
                return res.jsonp(UBICACIONES.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // LISTAR TODOS LOS REGISTROS DE COORDENADAS GENERALES DE UBICACION CON EXCEPCIONES     **USADO
    ListarCoordenadasDefinidas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const UBICACIONES = yield database_1.default.query(`
            SELECT * FROM mg_cat_ubicaciones WHERE NOT id = $1
            `, [id]);
            if (UBICACIONES.rowCount != 0) {
                return res.jsonp(UBICACIONES.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // METODO PARA LISTAR DATOS DE UNA UBICACION ESPECIFICA  **USADO
    ListarUnaCoordenada(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const UBICACIONES = yield database_1.default.query(`
            SELECT * FROM mg_cat_ubicaciones WHERE id = $1
            `, [id]);
            if (UBICACIONES.rowCount != 0) {
                return res.jsonp(UBICACIONES.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // ELIMINAR REGISTRO DE COORDENADAS GENERALES DE UBICACION      **USADO
    EliminarCoordenadas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_name, ip } = req.body;
                const { id } = req.params;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const coordenada = yield database_1.default.query(`SELECT * FROM mg_cat_ubicaciones WHERE id = $1`, [id]);
                const [datosOriginales] = coordenada.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'mg_cat_ubicaciones',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar coordenada con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                yield database_1.default.query(`
                DELETE FROM mg_cat_ubicaciones WHERE id = $1
                `, [id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'mg_cat_ubicaciones',
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
            catch (_a) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.jsonp({ message: 'false' });
            }
        });
    }
    /** **************************************************************************************** **
     ** **        COORDENADAS DE UBICACION ASIGNADAS A UN USUARIO (empleado_ubicacion)            ** **
     ** **************************************************************************************** **/
    // LISTAR REGISTROS DE COORDENADAS GENERALES DE UBICACION DE UN USUARIO    **USADO
    ListarRegistroUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empl } = req.params;
            const UBICACIONES = yield database_1.default.query(`
            SELECT eu.id AS id_emplu, e.codigo, eu.id_ubicacion, eu.id_empleado, cu.latitud, cu.longitud, 
                cu.descripcion 
            FROM mg_empleado_ubicacion AS eu, mg_cat_ubicaciones AS cu, eu_empleados AS e 
            WHERE eu.id_ubicacion = cu.id AND eu.id_empleado = $1 AND e.id = eu.id_empleado
            `, [id_empl]);
            if (UBICACIONES.rowCount != 0) {
                return res.jsonp(UBICACIONES.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // ASIGNAR COORDENADAS GENERALES DE UBICACION A LOS USUARIOS    **USADO
    RegistrarCoordenadasUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empl, id_ubicacion, user_name, ip } = req.body;
                console.log('ubicacion ', req.body);
                const existe = yield database_1.default.query(`
                SELECT * FROM mg_empleado_ubicacion WHERE id_empleado = $1 AND id_ubicacion = $2
                `, [id_empl, id_ubicacion]);
                console.log(' existe ', existe.rows);
                if (existe.rowCount != 0) {
                    res.jsonp({ message: 'error' });
                }
                else {
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    yield database_1.default.query(`
                    INSERT INTO mg_empleado_ubicacion (id_empleado, id_ubicacion) 
                    VALUES ($1, $2)
                    `, [id_empl, id_ubicacion]);
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'mg_empleado_ubicacion',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: `id_empleado: ${id_empl}, id_ubicacion: ${id_ubicacion}}`,
                        ip,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    res.jsonp({ message: 'Registro guardado.' });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'Error al guardar registro.' });
            }
        });
    }
    // LISTAR REGISTROS DE COORDENADAS GENERALES DE UNA UBICACION   **USADO
    ListarRegistroUsuarioU(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id_ubicacion = req.params.id_ubicacion;
            const UBICACIONES = yield database_1.default.query(`
            SELECT eu.id AS id_emplu, e.codigo, eu.id_ubicacion, eu.id_empleado, cu.latitud, cu.longitud, 
                cu.descripcion, e.nombre, e.apellido 
            FROM mg_empleado_ubicacion AS eu, mg_cat_ubicaciones AS cu, eu_empleados AS e 
            WHERE eu.id_ubicacion = cu.id AND e.id = eu.id_empleado AND cu.id = $1
            `, [id_ubicacion]);
            if (UBICACIONES.rowCount != 0) {
                return res.jsonp(UBICACIONES.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // ELIMINAR REGISTRO DE COORDENADAS GENERALES DE UBICACION    **USADO
    EliminarCoordenadasUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_name, ip } = req.body;
                const { id } = req.params;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const ubicacion = yield database_1.default.query(`SELECT * FROM mg_empleado_ubicacion WHERE id = $1`, [id]);
                const [datosOriginales] = ubicacion.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'mg_empleado_ubicacion',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar ubicación con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                yield database_1.default.query(`
                DELETE FROM mg_empleado_ubicacion WHERE id = $1
                `, [id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'mg_empleado_ubicacion',
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
}
exports.UBICACION_CONTROLADOR = new UbicacionControlador();
exports.default = exports.UBICACION_CONTROLADOR;
