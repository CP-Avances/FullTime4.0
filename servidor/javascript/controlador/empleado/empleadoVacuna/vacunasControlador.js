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
const auditoriaControlador_1 = __importDefault(require("../../reportes/auditoriaControlador"));
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
const luxon_1 = require("luxon");
const settingsMail_1 = require("../../../libs/settingsMail");
const database_1 = __importDefault(require("../../../database"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class VacunasControlador {
    // LISTAR REGISTROS DE VACUNACION DEL EMPLEADO POR SU ID   **USADO
    ListarUnRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const VACUNA = yield database_1.default.query(`
            SELECT ev.id, ev.id_empleado, ev.id_vacuna, ev.carnet, ev.fecha, tv.nombre, ev.descripcion
            FROM eu_empleado_vacunas AS ev, e_cat_vacuna AS tv 
            WHERE ev.id_vacuna = tv.id AND ev.id_empleado = $1
            ORDER BY ev.id DESC
            `, [id_empleado]);
            if (VACUNA.rowCount != 0) {
                return res.jsonp(VACUNA.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // LISTAR REGISTRO TIPO DE VACUNA    **USADO
    ListarTipoVacuna(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const VACUNA = yield database_1.default.query(`
            SELECT * FROM e_cat_vacuna
            `);
            if (VACUNA.rowCount != 0) {
                return res.jsonp(VACUNA.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // METODO PARA BUSCAR VACUNA POR FECHA Y TIPO   **USADO
    BuscarVacunaFechaTipo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado, id_vacuna, fecha } = req.body;
            const VACUNA = yield database_1.default.query(`
            SELECT * FROM eu_empleado_vacunas WHERE fecha = $1 AND id_vacuna = $2 AND id_empleado = $3
            `, [fecha, id_vacuna, id_empleado]);
            if (VACUNA.rowCount != 0) {
                return res.jsonp(VACUNA.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // CREAR REGISTRO DE VACUNACION    **USADO
    CrearRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado, descripcion, fecha, id_tipo_vacuna, user_name, ip, subir_documento } = req.body;
            // CREAR CARPETA DE VACUNAS
            let verificar_vacunas = 0;
            if (subir_documento === true) {
                // RUTA DE LA CARPETA VACUNAS DEL USUARIO
                const carpetaVacunas = yield (0, accesoCarpetas_1.ObtenerRutaVacuna)(id_empleado);
                fs_1.default.access(carpetaVacunas, fs_1.default.constants.F_OK, (err) => {
                    if (err) {
                        // METODO MKDIR PARA CREAR LA CARPETA
                        fs_1.default.mkdir(carpetaVacunas, { recursive: true }, (err) => {
                            if (err) {
                                verificar_vacunas = 1;
                            }
                            else {
                                verificar_vacunas = 0;
                            }
                        });
                    }
                    else {
                        verificar_vacunas = 0;
                    }
                });
            }
            if (verificar_vacunas === 0) {
                try {
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    const usuario = yield database_1.default.query(`
                    SELECT id FROM eu_usuarios WHERE id_empleado = $1
                    `, [id_empleado]);
                    const id_usuario = usuario.rows[0].id;
                    const response = yield database_1.default.query(`
                    INSERT INTO eu_empleado_vacunas (id_empleado, descripcion, fecha, id_vacuna, id_usuario) 
                    VALUES ($1, $2, $3, $4, $5) RETURNING *
                    `, [id_empleado, descripcion, fecha, id_tipo_vacuna, id_usuario]);
                    const [vacuna] = response.rows;
                    const fechaF = yield (0, settingsMail_1.FormatearFecha2)(luxon_1.DateTime.fromJSDate(vacuna.fecha).toFormat("yyyy-MM-dd HH:mm:ss"), 'ddd');
                    vacuna.fecha = fechaF;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_empleado_vacunas',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: JSON.stringify(vacuna),
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
            }
            else {
                return res.jsonp({ message: 'error_carpeta' });
            }
        });
    }
    // REGISTRO DE CERTIFICADO O CARNET DE VACUNACION    **USADO
    GuardarDocumento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // FECHA DEL SISTEMA
                const fecha = luxon_1.DateTime.now();
                const anio = fecha.toFormat('yyyy');
                const mes = fecha.toFormat('MM');
                const dia = fecha.toFormat('dd');
                const { user_name, ip } = req.body;
                let id = req.params.id;
                let id_empleado = req.params.id_empleado;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
                SELECT codigo FROM eu_empleados WHERE id = $1
                `, [id_empleado]);
                const [vacuna] = response.rows;
                let documento = vacuna.codigo + '_' + anio + '_' + mes + '_' + dia + '_' + ((_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname);
                // CONSULTAR DATOSORIGINALES
                const vacuna1 = yield database_1.default.query(`
                SELECT * FROM eu_empleado_vacunas WHERE id = $1
                `, [id]);
                const [datosOriginales] = vacuna1.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_empleado_vacunas',
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
                const datosNuevos = yield database_1.default.query(`
                UPDATE eu_empleado_vacunas SET carnet = $2 WHERE id = $1 RETURNING *
                `, [id, documento]);
                const fechaO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha, 'ddd');
                const fechaN = yield (0, settingsMail_1.FormatearFecha2)(datosNuevos.rows[0].fecha, 'ddd');
                datosOriginales.fecha = fechaO;
                datosNuevos.rows[0].fecha = fechaN;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_empleado_vacunas',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(datosNuevos.rows[0]),
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
    // ACTUALIZAR REGISTRO DE VACUNACION   **USADO
    ActualizarRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { id_empleado, descripcion, fecha, id_tipo_vacuna, user_name, ip, subir_documento } = req.body;
            // CREAR CARPETA DE VACUNAS
            let verificar_vacunas = 0;
            if (subir_documento === true) {
                // RUTA DE LA CARPETA VACUNAS DEL USUARIO
                const carpetaVacunas = yield (0, accesoCarpetas_1.ObtenerRutaVacuna)(id_empleado);
                fs_1.default.access(carpetaVacunas, fs_1.default.constants.F_OK, (err) => {
                    if (err) {
                        // METODO MKDIR PARA CREAR LA CARPETA
                        fs_1.default.mkdir(carpetaVacunas, { recursive: true }, (err) => {
                            if (err) {
                                verificar_vacunas = 1;
                            }
                            else {
                                verificar_vacunas = 0;
                            }
                        });
                    }
                    else {
                        verificar_vacunas = 0;
                    }
                });
            }
            if (verificar_vacunas === 0) {
                try {
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    // CONSULTAR DATOSORIGINALES
                    const vacuna = yield database_1.default.query(`
                    SELECT * FROM eu_empleado_vacunas WHERE id = $1
                    `, [id]);
                    const [datosOriginales] = vacuna.rows;
                    if (!datosOriginales) {
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'eu_empleado_vacunas',
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
                    const datosNuevos = yield database_1.default.query(`
                    UPDATE eu_empleado_vacunas SET id_empleado = $1, descripcion = $2, fecha = $3, id_vacuna = $4 
                    WHERE id = $5 RETURNING *
                    `, [id_empleado, descripcion, fecha, id_tipo_vacuna, id]);
                    const fechaO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha, 'ddd');
                    const fechaN = yield (0, settingsMail_1.FormatearFecha2)(datosNuevos.rows[0].fecha, 'ddd');
                    datosOriginales.fecha = fechaO;
                    datosNuevos.rows[0].fecha = fechaN;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_empleado_vacunas',
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
            }
            else {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // ELIMINAR DOCUMENTO CARNET DE VACUNACION DEL SERVIDOR    **USADO
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
    // ELIMINAR DOCUMENTO CARNET DE VACUNACION    **USADO
    EliminarDocumento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let separador = path_1.default.sep;
                let { documento, id, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const vacunaconsulta = yield database_1.default.query(`SELECT * FROM eu_empleado_vacunas WHERE id = $1`, [id]);
                const [datosOriginales] = vacunaconsulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_empleado_vacunas',
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
                UPDATE eu_empleado_vacunas SET carnet = null WHERE id = $1 RETURNING *
                `, [id]);
                const [vacuna] = response.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_empleado_vacunas',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(vacuna),
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
    // ELIMINAR REGISTRO DE VACUNACION   **USADO
    EliminarRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let separador = path_1.default.sep;
                const { user_name, ip } = req.body;
                const { id, documento } = req.params;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const vacunaconsulta = yield database_1.default.query(`SELECT * FROM eu_empleado_vacunas WHERE id = $1`, [id]);
                const [datosOriginales] = vacunaconsulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_empleado_vacunas',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar vacuna con id: ${id}. No se encontro registro.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                const response = yield database_1.default.query(`
                DELETE FROM eu_empleado_vacunas WHERE id = $1 RETURNING *
                `, [id]);
                const [vacuna] = response.rows;
                const fechaO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha, 'ddd');
                datosOriginales.fecha = fechaO;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_empleado_vacunas',
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
            SELECT ev.id, ev.id_empleado, ev.id_vacuna, ev.carnet, ev.fecha, tv.nombre, ev.descripcion
            FROM eu_empleado_vacunas AS ev, e_cat_vacuna AS tv 
            WHERE ev.id_vacuna = tv.id
            ORDER BY ev.id DESC
            `);
            if (VACUNA.rowCount != 0) {
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
