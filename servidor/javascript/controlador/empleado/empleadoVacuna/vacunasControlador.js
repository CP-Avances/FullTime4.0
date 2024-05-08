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
exports.VACUNAS_CONTROLADOR = void 0;
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
const auditoriaControlador_1 = __importDefault(require("../../auditoria/auditoriaControlador"));
const database_1 = __importDefault(require("../../../database"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const moment_1 = __importDefault(require("moment"));
class VacunasControlador {
    // LISTAR REGISTROS DE VACUNACIÓN DEL EMPLEADO POR SU ID
    ListarUnRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const VACUNA = yield database_1.default.query(`
            SELECT ev.id, ev.id_empleado, ev.id_tipo_vacuna, ev.carnet, ev.fecha, 
            tv.nombre, ev.descripcion
            FROM empl_vacunas AS ev, tipo_vacuna AS tv 
            WHERE ev.id_tipo_vacuna = tv.id AND ev.id_empleado = $1
            ORDER BY ev.id DESC
            `, [id_empleado]);
            if (VACUNA.rowCount > 0) {
                return res.jsonp(VACUNA.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // LISTAR REGISTRO TIPO DE VACUNA
    ListarTipoVacuna(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const VACUNA = yield database_1.default.query(`
            SELECT * FROM tipo_vacuna
            `);
            if (VACUNA.rowCount > 0) {
                return res.jsonp(VACUNA.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // CREAR REGISTRO DE VACUNACION
    CrearRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empleado, descripcion, fecha, id_tipo_vacuna, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
                INSERT INTO empl_vacunas (id_empleado, descripcion, fecha, id_tipo_vacuna) 
                VALUES ($1, $2, $3, $4) RETURNING *
                `, [id_empleado, descripcion, fecha, id_tipo_vacuna]);
                const [vacuna] = response.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'empl_vacunas',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{id_empleado: ${id_empleado}, descripcion: ${descripcion}, fecha: ${fecha}, id_tipo_vacuna: ${id_tipo_vacuna}}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION|
                yield database_1.default.query('COMMIT');
                if (vacuna) {
                    return res.status(200).jsonp(vacuna);
                }
                else {
                    return res.status(404).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al guardar registro.' });
            }
        });
    }
    // REGISTRO DE CERTIFICADO O CARNET DE VACUNACION
    GuardarDocumento(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // FECHA DEL SISTEMA
                var fecha = (0, moment_1.default)();
                var anio = fecha.format('YYYY');
                var mes = fecha.format('MM');
                var dia = fecha.format('DD');
                // TODO ANALIZAR COMO OBTENER USER_NAME, IP DESDE EL FRONT
                const { user_name, ip } = req.body;
                let id = req.params.id;
                let id_empleado = req.params.id_empleado;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
                SELECT codigo FROM empleados WHERE id = $1
                `, [id_empleado]);
                const [vacuna] = response.rows;
                let documento = vacuna.codigo + '_' + anio + '_' + mes + '_' + dia + '_' + ((_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname);
                // CONSULTAR DATOSORIGINALES
                const vacuna1 = yield database_1.default.query('SELECT * FROM empl_vacunas WHERE id = $1', [id]);
                const [datosOriginales] = vacuna1.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'empl_vacunas',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al guardar documento de vacuna con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                yield database_1.default.query(`
                UPDATE empl_vacunas SET carnet = $2 WHERE id = $1
                `, [id, documento]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'empl_vacunas',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: `{carnet: ${documento}}`,
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
    // ACTUALIZAR REGISTRO DE VACUNACION
    ActualizarRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { id_empleado, descripcion, fecha, id_tipo_vacuna, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const vacuna = yield database_1.default.query('SELECT * FROM empl_vacunas WHERE id = $1', [id]);
                const [datosOriginales] = vacuna.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'empl_vacunas',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar vacuna con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                yield database_1.default.query(`
                UPDATE empl_vacunas SET id_empleado = $1, descripcion = $2, fecha = $3, 
                id_tipo_vacuna = $4 WHERE id = $5
                `, [id_empleado, descripcion, fecha, id_tipo_vacuna, id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'empl_vacunas',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: `{id_empleado: ${id_empleado}, descripcion: ${descripcion}, fecha: ${fecha}, id_tipo_vacuna: ${id_tipo_vacuna}}`,
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
    // ELIMINAR DOCUMENTO CARNET DE VACUNACION DEL SERVIDOR
    EliminarDocumentoServidor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { documento, id } = req.body;
            let separador = path_1.default.sep;
            if (documento != 'null' && documento != '' && documento != null) {
                let ruta = (yield (0, accesoCarpetas_1.ObtenerRutaVacuna)(id)) + separador + documento;
                // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                    if (err) {
                    }
                    else {
                        // ELIMINAR DEL SERVIDOR
                        fs_1.default.unlinkSync(ruta);
                    }
                });
            }
            res.jsonp({ message: 'Documento actualizado.' });
        });
    }
    // ELIMINAR DOCUMENTO CARNET DE VACUNACION
    EliminarDocumento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let separador = path_1.default.sep;
                let { documento, id, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const vacunaconsulta = yield database_1.default.query('SELECT * FROM empl_vacunas WHERE id = $1', [id]);
                const [datosOriginales] = vacunaconsulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'empl_vacunas',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar documento de vacuna con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                const response = yield database_1.default.query(`
                UPDATE empl_vacunas SET carnet = null WHERE id = $1 RETURNING *
                `, [id]);
                const [vacuna] = response.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'empl_vacunas',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: `{carnet: null}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (documento != 'null' && documento != '' && documento != null) {
                    let ruta = (yield (0, accesoCarpetas_1.ObtenerRutaVacuna)(vacuna.id_empleado)) + separador + documento;
                    // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                    fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                        if (err) {
                        }
                        else {
                            // ELIMINAR DEL SERVIDOR
                            fs_1.default.unlinkSync(ruta);
                        }
                    });
                }
                return res.jsonp({ message: 'Documento eliminado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al eliminar documento.' });
            }
        });
    }
    // ELIMINAR REGISTRO DE VACUNACION
    EliminarRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let separador = path_1.default.sep;
                // TODO ANALIZAR COMO OBTENER USER_NAME, IP DESDE EL FRONT
                const { user_name, ip } = req.body;
                const { id, documento } = req.params;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const vacunaconsulta = yield database_1.default.query('SELECT * FROM empl_vacunas WHERE id = $1', [id]);
                const [datosOriginales] = vacunaconsulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'empl_vacunas',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar vacuna con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                const response = yield database_1.default.query(`
                DELETE FROM empl_vacunas WHERE id = $1 RETURNING *
                `, [id]);
                const [vacuna] = response.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'empl_vacunas',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: '',
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (documento != 'null' && documento != '' && documento != null) {
                    let ruta = (yield (0, accesoCarpetas_1.ObtenerRutaVacuna)(vacuna.id_empleado)) + separador + documento;
                    // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                    fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                        if (err) {
                        }
                        else {
                            // ELIMINAR DEL SERVIDOR
                            fs_1.default.unlinkSync(ruta);
                        }
                    });
                }
                return res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al eliminar registro.' });
            }
        });
    }
    // CREAR REGISTRO DE TIPO DE VACUNA
    CrearTipoVacuna(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
                INSERT INTO tipo_vacuna (nombre) VALUES ($1) RETURNING *
                `, [nombre]);
                const [vacunas] = response.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'tipo_vacuna',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{nombre: ${nombre}}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (vacunas) {
                    return res.status(200).jsonp(vacunas);
                }
                else {
                    return res.status(404).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al guardar registro.' });
            }
        });
    }
    // OBTENER CERTIFICADO DE VACUNACION
    ObtenerDocumento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const docs = req.params.docs;
            const id = req.params.id;
            // TRATAMIENTO DE RUTAS
            let separador = path_1.default.sep;
            let ruta = (yield (0, accesoCarpetas_1.ObtenerRutaVacuna)(id)) + separador + docs;
            fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                if (err) {
                }
                else {
                    res.sendFile(path_1.default.resolve(ruta));
                }
            });
        });
    }
    // LISTAR TODOS LOS REGISTROS DE VACUNACIÓN
    ListarRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const VACUNA = yield database_1.default.query(`
            SELECT ev.id, ev.id_empleado, ev.id_tipo_vacuna, ev.carnet, ev.fecha, 
            tv.nombre, ev.descripcion
            FROM empl_vacunas AS ev, tipo_vacuna AS tv 
            WHERE ev.id_tipo_vacuna = tv.id
            ORDER BY ev.id DESC
            `);
            if (VACUNA.rowCount > 0) {
                return res.jsonp(VACUNA.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
}
exports.VACUNAS_CONTROLADOR = new VacunasControlador();
exports.default = exports.VACUNAS_CONTROLADOR;
