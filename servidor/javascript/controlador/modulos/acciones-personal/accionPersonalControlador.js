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
exports.ACCION_PERSONAL_CONTROLADOR = void 0;
const auditoriaControlador_1 = __importDefault(require("../../reportes/auditoriaControlador"));
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
const ImagenCodificacion_1 = require("../../../libs/ImagenCodificacion");
const accesoCarpetas_2 = require("../../../libs/accesoCarpetas");
const database_1 = __importDefault(require("../../../database"));
const path_1 = __importDefault(require("path"));
const exceljs_1 = __importDefault(require("exceljs"));
const fs_1 = __importDefault(require("fs"));
class AccionPersonalControlador {
    // METODO PARA LISTAR DETALLES TIPOS DE ACCION DE PERSONAL   **USADO
    ListarTipoAccionPersonal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ACCION = yield database_1.default.query(`
                SELECT 
                    dtap.id, dtap.id_tipo_accion_personal, dtap.descripcion, dtap.base_legal, 
                    tap.descripcion AS nombre 
                FROM 
                    map_detalle_tipo_accion_personal AS dtap, 
                    map_tipo_accion_personal AS tap 
                WHERE 
                    tap.id = dtap.id_tipo_accion_personal
            `);
            if (ACCION.rowCount != 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA REGISTRAR DETALLE DE TIPOS DE ACCIONES DE PERSONAL   **USADO
    CrearTipoAccionPersonal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_tipo, descripcion, base_legal, user_name, ip, ip_local } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
                    INSERT INTO map_detalle_tipo_accion_personal 
                        (id_tipo_accion_personal, descripcion, base_legal) 
                        VALUES($1, $2, $3) RETURNING*
                `, [id_tipo, descripcion, base_legal]);
                const [datos] = response.rows;
                if (datos) {
                    // INSERTAR REGISTRO DE AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_detalle_tipo_accion_personal',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: `
                            {
                            "id_tipo": "${id_tipo}", "descripcion": "${descripcion}", "base_legal": "${base_legal}",                      
                            }
                        `,
                        ip: ip,
                        ip_local: ip_local,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(200).jsonp(datos);
                }
                else {
                    yield database_1.default.query('ROLLBACK');
                    return res.status(500).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // METODO DE ACTUALIZACION DEL DETALLE DE LA ACCION DE PERSONAL    **USADO
    ActualizarTipoAccionPersonal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_tipo, descripcion, base_legal, id, user_name, ip, ip_local } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOS ANTES DE ACTUALIZAR PARA PODER REALIZAR EL REGISTRO EN AUDITORIA
                const response = yield database_1.default.query(`
                SELECT * FROM map_detalle_tipo_accion_personal WHERE id = $1
                `, [id]);
                const [datos] = response.rows;
                if (!datos) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_detalle_tipo_accion_personal',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al actualizar el registro con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'error' });
                }
                yield database_1.default.query(`
                    UPDATE map_detalle_tipo_accion_personal SET id_tipo_accion_personal = $1, descripcion = $2, base_legal = $3 
                    WHERE id = $4
                `, [id_tipo, descripcion, base_legal, id]);
                // INSERTAR REGISTRO DE AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'map_detalle_tipo_accion_personal',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datos),
                    datosNuevos: `
                    {
                        "id_tipo": "${id_tipo}", "descripcion": "${descripcion}", "base_legal": "${base_legal}"
                    }
                    `,
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.status(200).jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTROS DE DETALLES DE TIPO DE ACCION DE PERSONAL  *USADO
    EliminarTipoAccionPersonal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { user_name, ip, ip_local } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOS ANTES DE ELIMINAR PARA PODER REALIZAR EL REGISTRO EN AUDITORIA
                const response = yield database_1.default.query(`
                    SELECT * FROM map_detalle_tipo_accion_personal WHERE id = $1
                `, [id]);
                const [datos] = response.rows;
                if (!datos) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_detalle_tipo_accion_personal',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al eliminar el registro con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'error' });
                }
                yield database_1.default.query(`
                    DELETE FROM map_detalle_tipo_accion_personal WHERE id = $1
                `, [id]);
                // INSERTAR REGISTRO DE AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'map_detalle_tipo_accion_personal',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(datos),
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.status(200).jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA ELIMINAR LOS TIPOS DE ACCION PERSONAL DE MANERA MULTIPLE   **USADO
    EliminarTipoAccionMultiple(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { listaEliminar, user_name, ip, ip_local } = req.body;
            let error = false;
            var count = 0;
            var count_no = 0;
            var list_tipoAccionPersonal = [];
            try {
                for (const item of listaEliminar) {
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    const resultado = yield database_1.default.query(`
                        SELECT id FROM map_detalle_tipo_accion_personal WHERE id = $1
                    `, [item.id]);
                    const [existe_datos] = resultado.rows;
                    if (!existe_datos) {
                        // AUDITORIA
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'map_detalle_tipo_accion_personal',
                            usuario: user_name,
                            accion: 'D',
                            datosOriginales: '',
                            datosNuevos: '',
                            ip: ip,
                            ip_local: ip_local,
                            observacion: `Error al eliminar el detalle de tipo de accion personal con id: ${item.id}. Registro no encontrado.`
                        });
                    }
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    if (existe_datos) {
                        // INICIAR TRANSACCION
                        yield database_1.default.query('BEGIN');
                        const resultado = yield database_1.default.query(`
                            SELECT id FROM map_documento_accion_personal WHERE id_detalle_tipo_accion = $1
                        `, [item.id]);
                        const [existe_detalle] = resultado.rows;
                        // FINALIZAR TRANSACCION
                        yield database_1.default.query('COMMIT');
                        if (!existe_detalle) {
                            // INICIAR TRANSACCION
                            yield database_1.default.query('BEGIN');
                            const res = yield database_1.default.query(`
                                DELETE FROM map_detalle_tipo_accion_personal WHERE id = $1
                            `, [item.id]);
                            // AUDITORIA
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'map_detalle_tipo_accion_personal',
                                usuario: user_name,
                                accion: 'D',
                                datosOriginales: '',
                                datosNuevos: JSON.stringify(existe_datos),
                                ip: ip,
                                ip_local: ip_local,
                                observacion: null
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                            count += 1;
                        }
                        else {
                            list_tipoAccionPersonal.push(item.nombre);
                            count_no += 1;
                        }
                    }
                }
                var meCount = "registro eliminado";
                if (count > 1) {
                    meCount = "registros eliminados";
                }
                return res.status(200).jsonp({ message: count.toString() + ' ' + meCount + ' con éxito.', ms2: 'Existen datos relacionados con ', codigo: 200, eliminados: count, relacionados: count_no, listaNoEliminados: list_tipoAccionPersonal });
            }
            catch (err) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                error = true;
                if (error) {
                    if (err.table == 'map_cat_procesos' || err.table == 'map_empleado_procesos') {
                        if (count <= 1) {
                            return res.status(300).jsonp({
                                message: 'Se ha eliminado ' + count + ' registro.', ms2: 'Existen datos relacionados con ', eliminados: count,
                                relacionados: count_no, listaNoEliminados: list_tipoAccionPersonal
                            });
                        }
                        else if (count > 1) {
                            return res.status(300).jsonp({
                                message: 'Se han eliminado ' + count + ' registros.', ms2: 'Existen datos relacionados con ', eliminados: count,
                                relacionados: count_no, listaNoEliminados: list_tipoAccionPersonal
                            });
                        }
                    }
                    else {
                        return res.status(500).jsonp({ message: 'No se puedo completar la operacion' });
                    }
                }
            }
        });
    }
    // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR    **USADO
    RevisarDatos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
                let separador = path_1.default.sep;
                let ruta = (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)() + separador + documento;
                const workbook = new exceljs_1.default.Workbook();
                yield workbook.xlsx.readFile(ruta);
                let verificador = (0, accesoCarpetas_1.ObtenerIndicePlantilla)(workbook, 'DETALLE_TIPO_ACCION_PERSONAL');
                if (verificador === false) {
                    return res.jsonp({ message: 'no_existe', data: undefined });
                }
                else {
                    const sheet_name_list = workbook.worksheets.map(sheet => sheet.name);
                    const plantilla = workbook.getWorksheet(sheet_name_list[verificador]);
                    let data = {
                        fila: '',
                        tipo_accion_personal: '',
                        descripcion: '',
                        base_legal: '',
                        observacion: ''
                    };
                    var listaAccionPersonal = [];
                    var mensaje = 'correcto';
                    if (plantilla) {
                        // SUPONIENDO QUE LA PRIMERA FILA SON LAS CABECERAS
                        const headerRow = plantilla.getRow(1);
                        const headers = {};
                        // CREAR UN MAPA CON LAS CABECERAS Y SUS POSICIONES, ASEGURANDO QUE LAS CLAVES ESTEN EN MAYUSCULAS
                        headerRow.eachCell((cell, colNumber) => {
                            headers[cell.value.toString().toUpperCase()] = colNumber;
                        });
                        // VERIFICA SI LAS CABECERAS ESENCIALES ESTAN PRESENTES
                        if (!headers['ITEM'] || !headers['TIPO_ACCION_PERSONAL'] || !headers['DESCRIPCION'] || !headers['BASE_LEGAL']) {
                            return res.jsonp({ message: 'Cabeceras faltantes', data: undefined });
                        }
                        // LECTURA DE LOS DATOS DE LA PLANTILLA
                        plantilla.eachRow((row, rowNumber) => {
                            var _a, _b, _c;
                            // SALTAR LA FILA DE LAS CABECERAS
                            if (rowNumber === 1)
                                return;
                            // LEER LOS DATOS SEGUN LAS COLUMNAS ENCONTRADAS
                            const ITEM = row.getCell(headers['ITEM']).value;
                            const TIPO_ACCION_PERSONAL = (_a = row.getCell(headers['TIPO_ACCION_PERSONAL']).value) === null || _a === void 0 ? void 0 : _a.toString().trim();
                            const DESCRIPCION = (_b = row.getCell(headers['DESCRIPCION']).value) === null || _b === void 0 ? void 0 : _b.toString().trim();
                            const BASE_LEGAL = (_c = row.getCell(headers['BASE_LEGAL']).value) === null || _c === void 0 ? void 0 : _c.toString().trim();
                            // VERIFICAR QUE EL REGISTO NO TENGA DATOS VACIOS
                            if ((ITEM != undefined && ITEM != '') &&
                                (TIPO_ACCION_PERSONAL != undefined && TIPO_ACCION_PERSONAL != '') &&
                                (DESCRIPCION != undefined && DESCRIPCION != '') &&
                                (BASE_LEGAL != undefined && BASE_LEGAL != '')) {
                                data.fila = ITEM;
                                data.tipo_accion_personal = TIPO_ACCION_PERSONAL;
                                data.descripcion = DESCRIPCION;
                                data.base_legal = BASE_LEGAL;
                                data.observacion = 'no registrado';
                                listaAccionPersonal.push(data);
                            }
                            else {
                                data.fila = ITEM;
                                data.tipo_accion_personal = TIPO_ACCION_PERSONAL;
                                data.descripcion = DESCRIPCION;
                                data.base_legal = BASE_LEGAL;
                                data.observacion = 'no registrado';
                                if (data.fila == '' || data.fila == undefined) {
                                    data.fila = 'error';
                                    mensaje = 'error';
                                }
                                if (TIPO_ACCION_PERSONAL == undefined) {
                                    data.tipo_accion_personal = 'No registrado';
                                    data.observacion = 'Tipo de acción de personal ' + data.observacion;
                                }
                                if (DESCRIPCION == undefined) {
                                    data.descripcion = 'No registrado';
                                    data.observacion = 'Descripción ' + data.observacion;
                                }
                                if (BASE_LEGAL == undefined) {
                                    data.base_legal = '-';
                                }
                                listaAccionPersonal.push(data);
                            }
                            data = {};
                        });
                    }
                    // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                    fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                        if (err) {
                        }
                        else {
                            // ELIMINAR DEL SERVIDOR
                            fs_1.default.unlinkSync(ruta);
                        }
                    });
                    // VALIDACINES DE LOS DATOS DE LA PLANTILLA
                    listaAccionPersonal.forEach((item, index) => __awaiter(this, void 0, void 0, function* () {
                        if (item.observacion == 'no registrado') {
                            const VERIFICAR_TIPO_ACCION = yield database_1.default.query(`
                                SELECT * FROM map_tipo_accion_personal 
                                WHERE UPPER(descripcion) = UPPER($1)
                            `, [item.tipo_accion_personal]);
                            if (VERIFICAR_TIPO_ACCION.rowCount === 0) {
                                item.observacion = 'No existe el tipo de acción de personal en el sistema';
                            }
                        }
                    }));
                    setTimeout(() => {
                        listaAccionPersonal.sort((a, b) => {
                            // COMPARA LOS NUMEROS DE LOS OBJETOS
                            if (a.fila < b.fila) {
                                return -1;
                            }
                            if (a.fila > b.fila) {
                                return 1;
                            }
                            return 0; // SON IGUALES
                        });
                        var filaDuplicada = 0;
                        listaAccionPersonal.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                            if (item.observacion == '1') {
                                item.observacion = 'Registro duplicado';
                            }
                            else if (item.observacion == 'no registrado') {
                                item.observacion = 'ok';
                            }
                            // VALIDA SI LOS DATOS DE LA COLUMNA N SON NUMEROS.
                            if (typeof item.fila === 'number' && !isNaN(item.fila)) {
                                // CONDICION PARA VALIDAR SI EN LA NUMERACION EXISTE UN NUMERO QUE SE REPITE DARA ERROR.
                                if (item.fila == filaDuplicada) {
                                    mensaje = 'error';
                                }
                            }
                            else {
                                return mensaje = 'error';
                            }
                            filaDuplicada = item.fila;
                        }));
                        if (mensaje == 'error') {
                            listaAccionPersonal = undefined;
                        }
                        return res.jsonp({ message: mensaje, data: listaAccionPersonal });
                    }, 1000);
                }
            }
            catch (error) {
                return res.status(500).jsonp({ message: 'Error con el servidor método RevisarDatos.', status: '500' });
            }
        });
    }
    // REGISTRAR PLANTILLA TIPO VACUNA    **USADO 
    CargarPlantilla(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { plantilla, user_name, ip, ip_local } = req.body;
            let error = false;
            for (const item of plantilla) {
                const { tipo_accion_personal, descripcion, base_legal } = item;
                try {
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    const response = yield database_1.default.query(`
                        SELECT * FROM map_tipo_accion_personal 
                         WHERE UPPER(descripcion) = UPPER($1)
                    `, [tipo_accion_personal]);
                    const [tipo_acciones] = response.rows;
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    const response_accion = yield database_1.default.query(`
                        INSERT INTO map_detalle_tipo_accion_personal (id_tipo_accion_personal, descripcion, base_legal) VALUES ($1, $2, $3) RETURNING *
                    `, [response.rows[0].id, descripcion, base_legal]);
                    const [detalleAccion] = response_accion.rows;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_detalle_tipo_accion_personal',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: JSON.stringify(detalleAccion),
                        ip: ip,
                        ip_local: ip_local,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_tipo_accion_personal',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: JSON.stringify(tipo_acciones),
                        ip: ip,
                        ip_local: ip_local,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                }
                catch (error) {
                    // REVERTIR TRANSACCION
                    yield database_1.default.query('ROLLBACK');
                    error = true;
                }
            }
            if (error) {
                return res.status(500).jsonp({ message: 'error' });
            }
            return res.status(200).jsonp({ message: 'ok' });
        });
    }
    /**  *************************************************************************************** **
     **  **                      TABLA DE TIPOS DE ACCION DE PERSONAL                         ** **
     **  *************************************************************************************** **/
    // METODO PARA CONSULTAR TIPOS DE ACCION PERSONAL   **USADO
    ListarTipoAccion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ACCION = yield database_1.default.query(`
                SELECT * FROM map_tipo_accion_personal
            `);
            if (ACCION.rowCount != 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA REGISTRAR UNA ACCION DE PERSONAL   **USADO
    CrearTipoAccion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { descripcion, user_name, ip, ip_local } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
                    INSERT INTO map_tipo_accion_personal (descripcion) VALUES ($1) RETURNING *
                `, [descripcion]);
                const [datos] = response.rows;
                if (datos) {
                    // INSERTAR REGISTRO DE AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_tipo_accion_personal',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: `{"descripcion": "${descripcion}"}`,
                        ip: ip,
                        ip_local: ip_local,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(200).jsonp(datos);
                }
                else {
                    yield database_1.default.query('ROLLBACK');
                    return res.status(300).jsonp({ message: 'error, no se insertaron los datos' });
                }
            }
            catch (error) {
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    // METODO PARA BUSCAR UN DETALLE DE TIPO DE ACCION DE PERSONAL POR ID    **USADO
    EncontrarTipoAccionPersonalId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const ACCION = yield database_1.default.query(`
                SELECT dtap.id, dtap.id_tipo_accion_personal, dtap.descripcion, dtap.base_legal, tap.descripcion AS nombre 
                FROM map_detalle_tipo_accion_personal AS dtap, map_tipo_accion_personal AS tap 
                WHERE dtap.id = $1 AND tap.id = dtap.id_tipo_accion_personal
            `, [id]);
            if (ACCION.rowCount != 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA BUSCAR DATOS DEL DETALLE DE ACCION DE PERSONAL PARA EDICION   **USADO
    ListarTipoAccionEdicion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const ACCION = yield database_1.default.query(`
            SELECT * FROM map_detalle_tipo_accion_personal WHERE NOT id_tipo_accion_personal = $1
            `, [id]);
            if (ACCION.rowCount != 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // VER LOGO DE MINISTERIO TRABAJO     **USADO
    verLogoMinisterio(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const file_name = 'ministerio_trabajo.png';
            let separador = path_1.default.sep;
            let ruta = (0, accesoCarpetas_2.ObtenerRutaLogos)() + separador + file_name;
            const codificado = yield (0, ImagenCodificacion_1.ConvertirImagenBase64)(ruta);
            if (codificado === 0) {
                res.send({ imagen: 0 });
            }
            else {
                res.send({ imagen: codificado });
            }
        });
    }
    /**  *************************************************************************************** **
     **  **                      TABLA DE DOCUMENTOS DE ACCION DE PERSONAL                    ** **
     **  *************************************************************************************** **/
    // METODO PARA INGRESAR DATOS EN LA TABLA SOLICITUD ACCION PERSONAL   **USADO
    CrearPedidoAccionPersonal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { formulario1, formulario2, formulario3, formulario4, formulario5, formulario6, user_name, ip, ip_local, proceso } = req.body;
                let datosNuevos = req.body;
                const fechaActual = new Date();
                let id_empleado_negativa = null;
                let id_empleado_comunicacion = null;
                let id_empleado_comunica_cargo = null;
                if (formulario5.firma_negativa != '' && formulario5.firma_negativa != null) {
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    const response = yield database_1.default.query(`
                        SELECT * FROM eu_empleados WHERE
                        ((UPPER (apellido) || \' \' || UPPER (nombre)) = $1 OR 
                         (UPPER (nombre) || \' \' || UPPER (apellido)) = $1)
                    `, [formulario5.firma_negativa.trim().toUpperCase()]);
                    console.log('id_empleado_negativa: ', response.rows);
                    id_empleado_negativa = response.rows[0].id;
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                }
                if (formulario6.firma_Resp_Notificacion != '' && formulario6.firma_Resp_Notificacion != null) {
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    const response = yield database_1.default.query(`
                        SELECT * FROM informacion_general WHERE
                        ((UPPER (apellido) || \' \' || UPPER (nombre)) = $1 OR (UPPER (nombre) || \' \' || UPPER (apellido)) = $1)
                    `, [formulario6.firma_Resp_Notificacion.trim().toUpperCase()]);
                    id_empleado_comunicacion = response.rows[0].id;
                    id_empleado_comunica_cargo = response.rows[0].id_cargo_;
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                }
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response_accion = yield database_1.default.query(`
                INSERT INTO map_documento_accion_personal (
                    numero_accion_personal, fecha_elaboracion, hora_elaboracion, id_empleado_personal, fecha_rige_desde, 
                    fecha_rige_hasta, id_tipo_accion_personal, id_detalle_tipo_accion, detalle_otro, especificacion, 
                    declaracion_jurada, adicion_base_legal, observacion, id_proceso_actual, id_nivel_gestion_actual, 
                    id_unidad_administrativa, id_sucursal_actual, id_lugar_trabajo_actual, id_tipo_cargo_actual, 
                    id_grupo_ocupacional_actual, id_grado_actual, remuneracion_actual, partida_individual_actual, 
                    id_proceso_propuesto, id_sucursal_propuesta, id_nivel_gestion_propuesto,
                    id_unidad_adminsitrativa_propuesta, id_lugar_trabajo_propuesto, id_tipo_cargo_propuesto, 
                    id_grupo_ocupacional_propuesto, id_grado_propuesto, remuneracion_propuesta, 
                    partida_individual_propuesta, lugar_posesion, fecha_posesion, numero_acta_final, fecha_acta_final,
                    id_empleado_director, id_tipo_cargo_director, id_empleado_autoridad_delegado, 
                    id_tipo_cargo_autoridad_delegado, id_empleado_testigo, fecha_testigo, id_empleado_elaboracion, 
                    id_tipo_cargo_elaboracion, id_empleado_revision, id_tipo_cargo_revision, id_empleado_control, 
                    id_tipo_cargo_control, comunicacion_electronica, fecha_comunicacion, hora_comunicacion, 
                    medio_comunicacion, id_empleado_comunicacion, id_tipo_cargo_comunicacion, fecha_registro, 
                    fecha_actualizacion, proceso, id_vacacion, abreviatura_director, abreviatura_delegado, 
                    abreviatura_testigo, abreviatura_elaboracion, abreviatura_revision, abreviatura_control, 
                    abreviatura_comunicacion, abreviatura_empleado) 
                VALUES(
                    $1, $2, $3, $4, $5, 
                    $6, $7, $8, $9, $10, 
                    $11, $12, $13, $14, $15, 
                    $16, $17, $18, $19, 
                    $20, $21, $22, $23, 
                    $24, $25, $26, 
                    $27, $28, $29, 
                    $30, $31, $32, 
                    $33, $34, $35, $36, $37,
                    $38, $39, $40, 
                    $41, $42, $43, $44, 
                    $45, $46, $47, $48,
                    $49, $50, $51, $52, 
                    $53, $54, $55, $56,
                    $57, $58, $59, $60, $61, 
                    $62, $63, $64, $65,
                    $66, $67
                    ) RETURNING *
                `, [formulario1.numero_accion_personal, formulario1.fecha_elaboracion, formulario1.hora_elaboracion,
                    formulario1.id_empleado_personal, formulario1.fecha_rige_desde,
                    formulario1.fecha_rige_hasta, formulario2.id_tipo_accion_personal, formulario2.id_detalle_accion,
                    formulario2.detalle_otro, formulario2.especificacion,
                    formulario2.declaracion_jurada, formulario2.adicion_base_legal, formulario2.observacion,
                    formulario3.id_proceso_actual, formulario3.id_nivel_gestion_actual,
                    formulario3.id_unidad_administrativa, formulario3.id_sucursal_actual,
                    formulario3.id_lugar_trabajo_actual, formulario3.id_tipo_cargo_actual,
                    formulario3.id_grupo_ocupacional_actual, formulario3.id_grado_actual, formulario3.remuneracion_actual,
                    formulario3.partida_individual_actual,
                    formulario3.id_proceso_propuesto, formulario3.id_sucursal_propuesta, formulario3.id_nivel_gestion_propuesto,
                    formulario3.id_unidad_administrativa_propuesta, formulario3.id_lugar_trabajo_propuesto,
                    formulario3.id_tipo_cargo_propuesto,
                    formulario3.id_grupo_ocupacional_propuesto, formulario3.id_grado_propuesto,
                    formulario3.remuneracion_propuesta,
                    formulario3.partida_individual_propuesta, formulario4.lugar_posesion, formulario4.fecha_posesion,
                    formulario4.actaFinal, formulario4.fechaActa,
                    formulario5.firma_talentoHumano, formulario5.cargo_talentoHumano, formulario5.firma_delegado,
                    formulario5.cargo_delegado, id_empleado_negativa, formulario5.fecha_negativa,
                    formulario5.firma_RespElaboracion,
                    formulario5.cargo_RespElaboracion, formulario5.firma_RespRevision, formulario5.cargo_RespRevision,
                    formulario5.firma_RespRegistro_control,
                    formulario5.cargo_RespRegistro_control, formulario6.ComunicacionElect, formulario6.fechaComunicacion,
                    formulario6.horaComunicado,
                    formulario6.medioComunicacionForm, id_empleado_comunicacion, id_empleado_comunica_cargo, fechaActual,
                    null, proceso, null, formulario5.abrevia_talentoHunamo, formulario5.abrevia_delegado,
                    formulario5.abrevia_negativa, formulario5.abrevia_RespElaboracion, formulario5.abrevia_RespRevision,
                    formulario5.abrevia_RespRegistro_control,
                    formulario6.abrevCForm, formulario5.abrevia_servidorPublico
                ]);
                delete datosNuevos.user_name;
                delete datosNuevos.ip;
                // INSERTAR REGISTRO DE AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'map_documento_accion_personal',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{id: ${response_accion.rows[0].id}, numero_accion_personal: ${response_accion.rows[0].numero_accion_personal}, fecha_elaboracion: ${response_accion.rows[0].fecha_elaboracion}, 
                    hora_elaboracion: ${response_accion.rows[0].hora_elaboracion}, id_empleado_personal: ${response_accion.rows[0].id_empleado_personal}, fecha_rige_desde: ${response_accion.rows[0].fecha_rige_desde}, 
                    fecha_rige_hasta: ${response_accion.rows[0].fecha_rige_hasta}, id_tipo_accion_personal: ${response_accion.rows[0].id_tipo_accion_personal}, id_detalle_tipo_accion: ${response_accion.rows[0].id_detalle_tipo_accion}, detalle_otro: ${response_accion.rows[0].detalle_otro}, 
                    especificacion: ${response_accion.rows[0].especificacion}, declaracion_jurada: ${response_accion.rows[0].declaracion_jurada}, adicion_base_legal: ${response_accion.rows[0].adicion_base_legal}, observacion: ${response_accion.rows[0].observacion}, 
                    id_proceso_actual: ${response_accion.rows[0].id_proceso_actual}, id_nivel_gestion_actual: ${response_accion.rows[0].id_nivel_gestion_actual}, id_unidad_administrativa: ${response_accion.rows[0].id_unidad_administrativa}, id_sucursal_actual: ${response_accion.rows[0].id_sucursal_actual}, 
                    id_lugar_trabajo_actual: ${response_accion.rows[0].lugar_trabajo_actual}, id_tipo_cargo_actual: ${response_accion.rows[0].id_tipo_cargo_actual}, id_grupo_ocupacional_actual: ${response_accion.rows[0].id_grupo_ocupacional_actual}, 
                    id_grado_actual: ${response_accion.rows[0].id_grado_actual}, remuneracion_actual: ${response_accion.rows[0].remuneracion_actual}, partida_individual_actual: ${response_accion.rows[0].partida_individual_actual}, 
                    id_proceso_propuesto: ${response_accion.rows[0].id_proceso_propuesto}, id_sucursal_propuesta: ${response_accion.rows[0].id_sucursal_propuesta}, id_nivel_gestion_propuesto: ${response_accion.rows[0].id_nivel_gestion_propuesto}, id_unidad_adminsitrativa_propuesta: ${response_accion.rows[0].id_unidad_administrativa_propuesta}, 
                    id_lugar_trabajo_propuesto: ${response_accion.rows[0].id_lugar_trabajo_propuesto},id_tipo_cargo_propuesto: ${response_accion.rows[0].id_tipo_cargo_propuesto}, id_grupo_ocupacional_propuesto: ${response_accion.rows[0].id_grupo_ocupacional_propuesto}, id_grado_propuesto: ${response_accion.rows[0].id_grado_propuesto}, 
                    remuneracion_propuesta: ${response_accion.rows[0].remuneracion_propuesta}, partida_individual_propuesta: ${response_accion.rows[0].partida_individual_propuesta}, lugar_posesion: ${response_accion.rows[0].lugar_posesion}, fecha_posesion: ${response_accion.rows[0].fecha_posesion}, numero_acta_final: ${response_accion.rows[0].numero_acta_final}, fecha_acta_final: ${response_accion.rows[0].fecha_acta_final},
                    id_empleado_director: ${response_accion.rows[0].id_empleado_director}, id_tipo_cargo_director: ${response_accion.rows[0].id_tipo_cargo_director}, id_empleado_autoridad_delegado: ${response_accion.rows[0].id_empleado_autoridad_delegado}, id_tipo_cargo_autoridad_delegado: ${response_accion.rows[0].id_tipo_cargo_autoridad_delegado}, 
                    id_empleado_testigo: ${response_accion.rows[0].id_empleado_testigo}, fecha_testigo: ${response_accion.rows[0].fecha_testigo}, id_empleado_elaboracion: ${response_accion.rows[0].id_empleado_elaboracion}, id_tipo_cargo_elaboracion: ${response_accion.rows[0].id_tipo_cargo_elaboracion}, id_empleado_revision: ${response_accion.rows[0].id_empleado_revision}, 
                    id_tipo_cargo_revisio: ${response_accion.rows[0].id_tipo_cargo_revisio}n, id_empleado_control: ${response_accion.rows[0].id_empleado_control}, id_tipo_cargo_control: ${response_accion.rows[0].id_tipo_cargo_control}, comunicacion_electronica: ${response_accion.rows[0].comunicacion_electronica},
                    fecha_comunicacion: ${response_accion.rows[0].fecha_comunicacion}, hora_comunicacion: ${response_accion.rows[0].hora_comunicacion}, medio_comunicacion: ${response_accion.rows[0].medio_comunicacion}, id_empleado_comunicacion: ${response_accion.rows[0].id_empleado_comunicacion}, id_tipo_cargo_comunicacion: ${response_accion.rows[0].id_tipo_cargo_comunicacion}, 
                    fecha_registro: ${response_accion.rows[0].fecha_registro}, fecha_actualizacion: ${response_accion.rows[0].fecha_actualizacion}, proceso: ${response_accion.rows[0].proceso}, id_vacacion: ${response_accion.rows[0].id_vacacion}, 
                    abreviatura_director: ${response_accion.rows[0].abreviatura_director}, abreviatura_delegado: ${response_accion.rows[0].abreviatura_delegado}, abreviatura_testigo: ${response_accion.rows[0].abreviatura_testigo}, abreviatura_elaboracion: ${response_accion.rows[0].abreviatura_elaboracion}, abreviatura_revision: ${response_accion.rows[0].abreviatura_revision}, 
                    abreviatura_control: ${response_accion.rows[0].abreviatura_control}, abreviatura_comunicacion: ${response_accion.rows[0].abreviatura_comunicacion}, abreviatura_empleado: ${response_accion.rows[0].abreviatura_empleado}}`,
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro realizado con éxito.' });
            }
            catch (error) {
                console.log('response_accion: ', error);
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    // METODO DE ACTUALIZACION DE DATOS DEL DOCUMENTO DE ACCION PERSONAL   **USADO
    ActualizarPedidoAccionPersonal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, formulario1, formulario2, formulario3, formulario4, formulario5, formulario6, user_name, ip, ip_local } = req.body;
                let datosNuevos = req.body;
                const fechaActualizacion = new Date();
                let id_empleado_negativa = null;
                let id_empleado_comunicacion = null;
                let id_empleado_comunica_cargo = null;
                if (formulario5.firma_negativa != '' && formulario5.firma_negativa != null) {
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    const response = yield database_1.default.query(`
                        SELECT * FROM eu_empleados WHERE
                        ((UPPER (apellido) || \' \' || UPPER (nombre)) = $1 OR 
                         (UPPER (nombre) || \' \' || UPPER (apellido)) = $1)
                    `, [formulario5.firma_negativa.trim().toUpperCase()]);
                    id_empleado_negativa = response.rows[0].id;
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                }
                if (formulario6.firma_Resp_Notificacion != '' && formulario6.firma_Resp_Notificacion != null) {
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    const response = yield database_1.default.query(`
                        SELECT * FROM informacion_general WHERE
                        ((UPPER (apellido) || \' \' || UPPER (nombre)) = $1) OR 
                        ((UPPER (nombre) || \' \' || UPPER (apellido)) = $1)
                    `, [formulario6.firma_Resp_Notificacion.trim().toUpperCase()]);
                    id_empleado_comunicacion = response.rows[0].id;
                    id_empleado_comunica_cargo = response.rows[0].id_cargo_;
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                }
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOS ANTES DE ACTUALIZAR PARA PODER REALIZAR EL REGISTRO EN AUDITORIA
                const response = yield database_1.default.query(`
                SELECT * FROM map_documento_accion_personal WHERE id = $1
                `, [id]);
                const [datos] = response.rows;
                if (!datos) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_documento_accion_personal',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al actualizar el registro con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'error' });
                }
                yield database_1.default.query(`
                UPDATE map_documento_accion_personal SET 
                    numero_accion_personal = $1, fecha_elaboracion = $2, id_empleado_personal = $3, fecha_rige_desde = $4,
                    fecha_rige_hasta = $5, id_tipo_accion_personal = $6, id_detalle_tipo_accion = $7, detalle_otro = $8, 
                    especificacion = $9, declaracion_jurada = $10, adicion_base_legal = $11, observacion = $12, 
                    id_proceso_actual = $13, id_nivel_gestion_actual = $14, id_unidad_administrativa = $15, 
                    id_sucursal_actual = $16, id_lugar_trabajo_actual = $17, id_tipo_cargo_actual = $18, 
                    id_grupo_ocupacional_actual = $19, id_grado_actual = $20, remuneracion_actual = $21, 
                    partida_individual_actual = $22, id_proceso_propuesto = $23, id_sucursal_propuesta = $24, 
                    id_nivel_gestion_propuesto = $25, id_unidad_adminsitrativa_propuesta = $26, 
                    id_lugar_trabajo_propuesto = $27, id_tipo_cargo_propuesto = $28, id_grupo_ocupacional_propuesto = $29, 
                    id_grado_propuesto = $30, remuneracion_propuesta = $31, partida_individual_propuesta = $32, 
                    lugar_posesion = $33, fecha_posesion = $34, numero_acta_final = $35, fecha_acta_final = $36, 
                    id_empleado_director = $37, id_tipo_cargo_director = $38, id_empleado_autoridad_delegado = $39, 
                    id_tipo_cargo_autoridad_delegado = $40, id_empleado_testigo = $41, fecha_testigo = $42, 
                    id_empleado_elaboracion = $43, id_tipo_cargo_elaboracion = $44, id_empleado_revision = $45, 
                    id_tipo_cargo_revision = $46, id_empleado_control = $47, id_tipo_cargo_control = $48, 
                    comunicacion_electronica = $49, fecha_comunicacion = $50, hora_comunicacion = $51, 
                    medio_comunicacion = $52, id_empleado_comunicacion = $53, id_tipo_cargo_comunicacion = $54, 
                    fecha_actualizacion = $55, proceso = $56, id_vacacion = $57, abreviatura_director = $58, 
                    abreviatura_delegado = $59, abreviatura_testigo = $60, abreviatura_elaboracion = $61, 
                    abreviatura_revision = $62, abreviatura_control = $63, abreviatura_comunicacion = $64, 
                    abreviatura_empleado = $65
                WHERE id = $66
                `, [formulario1.numero_accion_personal, formulario1.fecha_elaboracion, formulario1.id_empleado_personal,
                    formulario1.fecha_rige_desde, formulario1.fecha_rige_hasta,
                    formulario2.id_tipo_accion_personal, formulario2.id_detalle_accion, formulario2.detalle_otro,
                    formulario2.especificacion, formulario2.declaracion_jurada, formulario2.adicion_base_legal,
                    formulario2.observacion,
                    formulario3.id_proceso_actual, formulario3.id_nivel_gestion_actual, formulario3.id_unidad_administrativa,
                    formulario3.id_sucursal_actual, formulario3.id_lugar_trabajo_actual, formulario3.id_tipo_cargo_actual,
                    formulario3.id_grupo_ocupacional_actual, formulario3.id_grado_actual, formulario3.remuneracion_actual,
                    formulario3.partida_individual_actual, formulario3.id_proceso_propuesto, formulario3.id_sucursal_propuesta,
                    formulario3.id_nivel_gestion_propuesto, formulario3.id_unidad_administrativa_propuesta, formulario3.id_lugar_trabajo_propuesto,
                    formulario3.id_tipo_cargo_propuesto, formulario3.id_grupo_ocupacional_propuesto,
                    formulario3.id_grado_propuesto, formulario3.remuneracion_propuesta,
                    formulario3.partida_individual_propuesta,
                    formulario4.lugar_posesion, formulario4.fecha_posesion, formulario4.actaFinal, formulario4.fechaActa,
                    formulario5.firma_talentoHumano, formulario5.cargo_talentoHumano, formulario5.firma_delegado,
                    formulario5.cargo_delegado, id_empleado_negativa, formulario5.fecha_negativa,
                    formulario5.firma_RespElaboracion, formulario5.cargo_RespElaboracion, formulario5.firma_RespRevision,
                    formulario5.cargo_RespRevision, formulario5.firma_RespRegistro_control,
                    formulario5.cargo_RespRegistro_control,
                    formulario6.ComunicacionElect, formulario6.fechaComunicacion, formulario6.horaComunicado,
                    formulario6.medioComunicacionForm, id_empleado_comunicacion,
                    id_empleado_comunica_cargo, fechaActualizacion, null, null, formulario5.abrevia_talentoHunamo,
                    formulario5.abrevia_delegado, formulario5.abrevia_negativa,
                    formulario5.abrevia_RespElaboracion, formulario5.abrevia_RespRevision,
                    formulario5.abrevia_RespRegistro_control, formulario6.abrevCForm, formulario5.abrevia_servidorPublico,
                    id
                ]);
                // INSERTAR REGISTRO DE AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'map_solicitud_accion_personal',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: `{id: ${datos.id}, numero_accion_personal: ${datos.numero_accion_personal}, fecha_elaboracion: ${datos.fecha_elaboracion}, 
                    hora_elaboracion: ${datos.hora_elaboracion}, id_empleado_personal: ${datos.id_empleado_personal}, fecha_rige_desde: ${datos.fecha_rige_desde}, 
                    fecha_rige_hasta: ${datos.fecha_rige_hasta}, id_tipo_accion_personal: ${datos.id_tipo_accion_personal}, id_detalle_tipo_accion: ${datos.id_detalle_tipo_accion}, detalle_otro: ${datos.detalle_otro}, 
                    especificacion: ${datos.especificacion}, declaracion_jurada: ${datos.declaracion_jurada}, adicion_base_legal: ${datos.adicion_base_legal}, observacion: ${datos.observacion}, 
                    id_proceso_actual: ${datos.id_proceso_actual}, id_nivel_gestion_actual: ${datos.id_nivel_gestion_actual}, id_unidad_administrativa: ${datos.id_unidad_administrativa}, id_sucursal_actual: ${datos.id_sucursal_actual}, 
                    id_lugar_trabajo_actual: ${datos.lugar_trabajo_actual}, id_tipo_cargo_actual: ${datos.id_tipo_cargo_actual}, id_grupo_ocupacional_actual: ${datos.id_grupo_ocupacional_actual}, 
                    id_grado_actual: ${datos.id_grado_actual}, remuneracion_actual: ${datos.remuneracion_actual}, partida_individual_actual: ${datos.partida_individual_actual}, 
                    id_proceso_propuesto: ${datos.id_proceso_propuesto}, id_sucursal_propuesta: ${datos.id_sucursal_propuesta}, id_nivel_gestion_propuesto: ${datos.id_nivel_gestion_propuesto}, id_unidad_adminsitrativa_propuesta: ${datos.id_unidad_administrativa_propuesta}, 
                    id_lugar_trabajo_propuesto: ${datos.id_lugar_trabajo_propuesto},id_tipo_cargo_propuesto: ${datos.id_tipo_cargo_propuesto}, id_grupo_ocupacional_propuesto: ${datos.id_grupo_ocupacional_propuesto}, id_grado_propuesto: ${datos.id_grado_propuesto}, 
                    remuneracion_propuesta: ${datos.remuneracion_propuesta}, partida_individual_propuesta: ${datos.partida_individual_propuesta}, lugar_posesion: ${datos.lugar_posesion}, fecha_posesion: ${datos.fecha_posesion}, numero_acta_final: ${datos.numero_acta_final}, fecha_acta_final: ${datos.fecha_acta_final},
                    id_empleado_director: ${datos.id_empleado_director}, id_tipo_cargo_director: ${datos.id_tipo_cargo_director}, id_empleado_autoridad_delegado: ${datos.id_empleado_autoridad_delegado}, id_tipo_cargo_autoridad_delegado: ${datos.id_tipo_cargo_autoridad_delegado}, 
                    id_empleado_testigo: ${datos.id_empleado_testigo}, fecha_testigo: ${datos.fecha_testigo}, id_empleado_elaboracion: ${datos.id_empleado_elaboracion}, id_tipo_cargo_elaboracion: ${datos.id_tipo_cargo_elaboracion}, id_empleado_revision: ${datos.id_empleado_revision}, 
                    id_tipo_cargo_revisio: ${datos.id_tipo_cargo_revisio}n, id_empleado_control: ${datos.id_empleado_control}, id_tipo_cargo_control: ${datos.id_tipo_cargo_control}, comunicacion_electronica: ${datos.comunicacion_electronica},
                    fecha_comunicacion: ${datos.fecha_comunicacion}, hora_comunicacion: ${datos.hora_comunicacion}, medio_comunicacion: ${datos.medio_comunicacion}, id_empleado_comunicacion: ${datos.id_empleado_comunicacion}, id_tipo_cargo_comunicacion: ${datos.id_tipo_cargo_comunicacion}, 
                    fecha_registro: ${datos.fecha_registro}, fecha_actualizacion: ${datos.fecha_actualizacion}, proceso: ${datos.proceso}, id_vacacion: ${datos.id_vacacion}, 
                    abreviatura_director: ${datos.abreviatura_director}, abreviatura_delegado: ${datos.abreviatura_delegado}, abreviatura_testigo: ${datos.abreviatura_testigo}, abreviatura_elaboracion: ${datos.abreviatura_elaboracion}, abreviatura_revision: ${datos.abreviatura_revision}, 
                    abreviatura_control: ${datos.abreviatura_control}, abreviatura_comunicacion: ${datos.abreviatura_comunicacion}, abreviatura_empleado: ${datos.abreviatura_empleado}}`,
                    datosNuevos: `{id: ${id}, numero_accion_personal: ${formulario1.numero_accion_personal}, fecha_elaboracion: ${formulario1.fecha_elaboracion}, 
                    hora_elaboracion: ${formulario1.hora_elaboracion}, id_empleado_personal: ${formulario1.id_empleado_personal}, fecha_rige_desde: ${formulario1.fecha_rige_desde}, fecha_rige_hasta: ${formulario1.fecha_rige_hasta}, 
                    id_tipo_accion_personal: ${formulario2.id_tipo_accion_personal}, id_detalle_tipo_accion: ${formulario2.id_detalle_tipo_accion}, detalle_otro: ${formulario2.detalle_otro}, 
                    especificacion: ${formulario2.especificacion}, declaracion_jurada: ${formulario2.declaracion_jurada}, adicion_base_legal: ${formulario2.adicion_base_legal}, observacion: ${formulario2.observacion}, 
                    id_proceso_actual: ${formulario3.id_proceso_actual}, id_nivel_gestion_actual: ${formulario3.id_nivel_gestion_actual}, id_unidad_administrativa: ${formulario3.id_unidad_administrativa}, id_sucursal_actual: ${formulario3.id_sucursal_actual}, 
                    id_lugar_trabajo_actual: ${formulario3.lugar_trabajo_actual}, id_tipo_cargo_actual: ${formulario3.id_tipo_cargo_actual}, id_grupo_ocupacional_actual: ${formulario3.id_grupo_ocupacional_actual}, 
                    id_grado_actual: ${formulario3.id_grado_actual}, remuneracion_actual: ${formulario3.remuneracion_actual}, partida_individual_actual: ${formulario3.partida_individual_actual}, 
                    id_proceso_propuesto: ${formulario3.id_proceso_propuesto}, id_sucursal_propuesta: ${formulario3.id_sucursal_propuesta}, id_nivel_gestion_propuesto: ${formulario3.id_nivel_gestion_propuesto}, id_unidad_adminsitrativa_propuesta: ${formulario3.id_unidad_administrativa_propuesta}, 
                    id_lugar_trabajo_propuesto: ${formulario3.id_lugar_trabajo_propuesto},id_tipo_cargo_propuesto: ${formulario3.id_tipo_cargo_propuesto}, id_grupo_ocupacional_propuesto: ${formulario3.id_grupo_ocupacional_propuesto}, id_grado_propuesto: ${formulario3.id_grado_propuesto}, 
                    remuneracion_propuesta: ${formulario3.remuneracion_propuesta}, partida_individual_propuesta: ${formulario3.partida_individual_propuesta}, lugar_posesion: ${formulario4.lugar_posesion}, fecha_posesion: ${formulario4.fecha_posesion}, numero_acta_final: ${formulario4.numero_acta_final}, fecha_acta_final: ${formulario4.fecha_acta_final},
                    id_empleado_director: ${formulario5.id_empleado_director}, id_tipo_cargo_director: ${formulario5.id_tipo_cargo_director}, id_empleado_autoridad_delegado: ${formulario5.id_empleado_autoridad_delegado}, id_tipo_cargo_autoridad_delegado: ${formulario5.id_tipo_cargo_autoridad_delegado}, 
                    id_empleado_testigo: ${id_empleado_negativa}, fecha_testigo: ${formulario5.fecha_negativa}, id_empleado_elaboracion: ${formulario5.id_empleado_elaboracion}, id_tipo_cargo_elaboracion: ${formulario5.id_tipo_cargo_elaboracion}, id_empleado_revision: ${formulario5.id_empleado_revision}, 
                    id_tipo_cargo_revisio: ${formulario5.id_tipo_cargo_revisio}n, id_empleado_control: ${formulario5.id_empleado_control}, id_tipo_cargo_control: ${formulario6.id_tipo_cargo_control}, comunicacion_electronica: ${formulario6.comunicacion_electronica},
                    fecha_comunicacion: ${formulario6.fecha_comunicacion}, hora_comunicacion: ${formulario6.hora_comunicacion}, medio_comunicacion: ${formulario6.medio_comunicacion}, id_empleado_comunicacion: ${formulario6.id_empleado_comunicacion}, id_tipo_cargo_comunicacion: ${formulario6.id_tipo_cargo_comunicacion}, 
                    fecha_registro: ${datos.fecha_registro}, fecha_actualizacion: ${fechaActualizacion}, proceso: ${null}, id_vacacion: ${null}, 
                    abreviatura_director: ${formulario5.abreviatura_director}, abreviatura_delegado: ${formulario5.abreviatura_delegado}, abreviatura_testigo: ${formulario5.abreviatura_testigo}, abreviatura_elaboracion: ${formulario5.abreviatura_elaboracion}, abreviatura_revision: ${formulario5.abreviatura_revision}, 
                    abreviatura_control: ${formulario5.abreviatura_control}, abreviatura_comunicacion: ${formulario6.abreviatura_comunicacion}, abreviatura_empleado: ${formulario5.abreviatura_empleado}}`,
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                console.log('error ', error);
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    // METODO DE BUSQUEDA DE DATOS DE DOCUMENTOS DE ACCION DE PERSONAL    **USADO
    EncontrarPedidoAccion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const ACCION = yield database_1.default.query(`
            SELECT 
                    ap.id, 
					ap.numero_accion_personal, 
					ap.fecha_elaboracion, 
                    ap.hora_elaboracion,
                    ap.id_empleado_personal,
                    CONCAT(inf.nombre, ' ', inf.apellido) AS nombres, 
                    ap.fecha_rige_desde, ap.fecha_rige_hasta, 
                    ap.id_tipo_accion_personal, 
					tp.descripcion AS accion_personal, 
                    ap.id_detalle_tipo_accion, dtp.descripcion, ap.detalle_otro,
                    ap.especificacion, ap.declaracion_jurada, ap.adicion_base_legal, 
                    ap.observacion, ap.id_proceso_actual, ps.nombre AS proceso_actual,
                    inf.identificacion As cedula_empleado,
                    -- NIVEL DE GESTION ACTUAL
                    ap.id_nivel_gestion_actual,
                    (SELECT nombre FROM ed_departamentos WHERE id = ap.id_nivel_gestion_actual) AS nivel_gestion_actual,
                    -- UNIDAD ADMINISTRATIVA ACTUAL
                    ap.id_unidad_administrativa,
                    (SELECT nombre FROM ed_departamentos WHERE id = ap.id_unidad_administrativa) AS unidad_administrativa,
                    -- SUCURSAL ACTUAL
                    ap.id_sucursal_actual,
                    (SELECT nombre FROM e_sucursales WHERE id = ap.id_sucursal_actual) AS sucursal_actual,
                    -- TRABAJO ACTUAL
                    ap.id_lugar_trabajo_actual,
                    (SELECT descripcion FROM e_ciudades WHERE id = ap.id_lugar_trabajo_actual) AS lugar_trabajo_actual,

                    ap.id_tipo_cargo_actual, inf.name_cargo AS cargo_actual,
                    -- GRUPO OCUPACIONAL ACTUAL
                    ap.id_grupo_ocupacional_actual,
                    (SELECT descripcion FROM map_cat_grupo_ocupacional WHERE id = ap.id_grupo_ocupacional_actual) AS grupo_ocupacional_actual,
                    -- GRADO ACTUAL
                    ap.id_grado_actual,
                    (SELECT descripcion FROM map_cat_grado WHERE id = ap.id_grado_actual) AS grado_actual,
                    ap.remuneracion_actual, ap.partida_individual_actual,
                    -- PROCESO PROPUESTO
                    ap.id_proceso_propuesto,
                    (SELECT nombre FROM map_cat_procesos WHERE id = ap.id_proceso_propuesto) AS proceso_propuesto,
                    -- NIVEL DE GESTIO PROPUESTA
                    ap.id_nivel_gestion_propuesto,
                    (SELECT nombre FROM ed_departamentos WHERE id = ap.id_nivel_gestion_propuesto) AS nivel_gestion_propuesto,
                    -- UNIDAD ADMINISTRATIVA PROPUESTA
                    ap.id_unidad_adminsitrativa_propuesta,
                    (SELECT nombre FROM ed_departamentos WHERE id = ap.id_unidad_adminsitrativa_propuesta) AS unidad_administrativa_propuesta,
                    -- SUCURSAL PROPUESTA
                    ap.id_sucursal_propuesta,
                    (SELECT nombre FROM e_sucursales WHERE id = ap.id_sucursal_propuesta) AS sucursal_propuesto,
                    -- LUGAR DE TRABAJO PROPUESTA
                    ap.id_lugar_trabajo_propuesto,
                    (SELECT descripcion FROM e_ciudades WHERE id = ap.id_lugar_trabajo_propuesto) AS lugar_trabajo_propuesto,
                    -- CARGO PROPUESTO
                    ap.id_tipo_cargo_propuesto,
                    (SELECT cargo FROM e_cat_tipo_cargo WHERE id = ap.id_tipo_cargo_propuesto) AS cargo_propuesto,
                    -- GRUPO OCUPACIONAL PROPUESTO
                    ap.id_grupo_ocupacional_propuesto,
                    (SELECT descripcion FROM map_cat_grupo_ocupacional WHERE id = ap.id_grupo_ocupacional_propuesto) AS grupo_ocupacional_propuesto,
                    -- GRADO PROPUESTO
                    ap.id_grado_propuesto,
                    (SELECT descripcion FROM map_cat_grado WHERE id = ap.id_grado_propuesto) AS grado_propuesto,
                
                    ap.remuneracion_propuesta, ap.partida_individual_propuesta,

                    -- POSESION DEL PUESTO
                    ap.lugar_posesion,
                    (SELECT descripcion FROM e_ciudades WHERE id = ap.lugar_posesion) AS descripcion_lugar_posesion,
                    ap.fecha_posesion, ap.numero_acta_final, ap.fecha_acta_final,

                    ap.id_empleado_director,
                    (SELECT CONCAT(nombre, ' ', apellido) FROM informacion_general WHERE id = ap.id_empleado_director) AS empleado_director,
                    ap.id_tipo_cargo_director,
                    (SELECT cargo FROM e_cat_tipo_cargo WHERE id = ap.id_tipo_cargo_director) AS cargo_director,

                    ap.id_empleado_autoridad_delegado,
                    (SELECT CONCAT(nombre, ' ', apellido) FROM informacion_general WHERE id = ap.id_empleado_autoridad_delegado) AS empleado_autoridad_delegado,
                    ap.id_tipo_cargo_autoridad_delegado,
                    (SELECT cargo FROM e_cat_tipo_cargo WHERE id = ap.id_tipo_cargo_autoridad_delegado) AS cargo_autoridad_delegado,

                    ap.id_empleado_testigo,
                    (SELECT CONCAT(nombre, ' ', apellido) FROM informacion_general WHERE id = ap.id_empleado_testigo) AS empleado_testigo,
                    ap.fecha_testigo,

                    ap.id_empleado_elaboracion,
                    (SELECT CONCAT(nombre, ' ', apellido) FROM informacion_general WHERE id = ap.id_empleado_elaboracion) AS empleado_elaboracion,
                    ap.id_tipo_cargo_elaboracion,
                    (SELECT cargo FROM e_cat_tipo_cargo WHERE id = ap.id_tipo_cargo_elaboracion) AS tipo_cargo_elaboracion,

                    ap.id_empleado_revision,
                    (SELECT CONCAT(nombre, ' ', apellido) FROM informacion_general WHERE id = ap.id_empleado_revision) AS empleado_revision,
                    ap.id_tipo_cargo_revision,
                    (SELECT cargo FROM e_cat_tipo_cargo WHERE id = ap.id_tipo_cargo_revision) AS tipo_cargo_revision,

                    ap.id_empleado_control,
                    (SELECT CONCAT(nombre, ' ', apellido) FROM informacion_general WHERE id = ap.id_empleado_control) AS empleado_control,
                    ap.id_tipo_cargo_control,
                    (SELECT cargo FROM e_cat_tipo_cargo WHERE id = ap.id_tipo_cargo_control) AS tipo_cargo_control,

                    ap.comunicacion_electronica, ap.fecha_comunicacion, ap.hora_comunicacion, 
                    ap.medio_comunicacion, ap.id_empleado_comunicacion,
                    (SELECT CONCAT(nombre, ' ', apellido) FROM informacion_general WHERE id = ap.id_empleado_comunicacion) AS empleado_comunicacion,
                    ap.id_tipo_cargo_comunicacion,
                    (SELECT cargo FROM e_cat_tipo_cargo WHERE id = ap.id_tipo_cargo_comunicacion) AS cargo_comunicacion,

                    ap.fecha_registro, ap.fecha_actualizacion, ap.proceso, ap.id_vacacion,
                    ap.abreviatura_director, ap.abreviatura_delegado, ap.abreviatura_testigo, ap.abreviatura_elaboracion, ap.abreviatura_revision,
                    ap.abreviatura_control, ap.abreviatura_comunicacion, ap.abreviatura_empleado

                FROM map_documento_accion_personal AS ap
                    INNER JOIN informacion_general AS inf ON inf.id = ap.id_empleado_personal
                    INNER JOIN map_tipo_accion_personal AS tp ON tp.id = ap.id_tipo_accion_personal
                    INNER JOIN map_detalle_tipo_accion_personal AS dtp ON dtp.id = ap.id_detalle_tipo_accion
                    INNER JOIN map_cat_procesos AS ps ON ps.id = ap.id_proceso_actual

                WHERE ap.id = $1`, [id]);
            if (ACCION.rowCount != 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    // METODO PARA BUSCAR PEDIDOS DE ACCION DE PERSONAL  **USADO
    ListarPedidoAccion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ACCION = yield database_1.default.query(`
            SELECT 
                ap.id, 
                ap.numero_accion_personal, 
                ap.fecha_elaboracion, 
                CONCAT(inf.nombre, ' ', inf.apellido) AS nombres, 
                ap.fecha_rige_desde, ap.fecha_rige_hasta, 
                ap.id_tipo_accion_personal, 
                tp.descripcion AS accion_personal, 
                ap.id_detalle_tipo_accion, 
                dtp.descripcion, 
                ap.proceso, 
                ap.id_vacacion
            FROM map_documento_accion_personal AS ap
                INNER JOIN informacion_general AS inf ON inf.id = ap.id_empleado_personal
                INNER JOIN map_tipo_accion_personal AS tp ON tp.id = ap.id_tipo_accion_personal
                INNER JOIN map_detalle_tipo_accion_personal AS dtp ON dtp.id = ap.id_detalle_tipo_accion
            `);
            if (ACCION.rowCount != 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    // CONSULTAS GENERACION DE PDF
    EncontrarDatosEmpleados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const EMPLEADO = yield database_1.default.query(`
            SELECT d.id, d.nombre, d.apellido, d.identificacion, d.codigo, d.id_cargo, 
                ec.sueldo, d.name_cargo AS cargo, d.name_dep AS departamento 
            FROM informacion_general AS d, eu_empleado_cargos AS ec
            WHERE d.id_cargo = ec.id AND d.id = $1
            `, [id]);
            if (EMPLEADO.rowCount != 0) {
                return res.jsonp(EMPLEADO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    EncontrarDatosCiudades(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const CIUDAD = yield database_1.default.query(`
            SELECT * FROM e_ciudades where id = $1
            `, [id]);
            if (CIUDAD.rowCount != 0) {
                return res.json(CIUDAD.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    EncontrarProcesosRecursivos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const ACCION = yield database_1.default.query(`
            WITH RECURSIVE procesos AS 
            ( 
            SELECT id, nombre, proceso_padre, 1 AS numero FROM map_cat_procesos WHERE id = $1 
            UNION ALL 
            SELECT cg.id, cg.nombre, cg.proceso_padre, procesos.numero + 1 AS numero FROM map_cat_procesos cg 
            JOIN procesos ON cg.id = procesos.proceso_padre 
            ) 
            SELECT UPPER(nombre) AS nombre, numero FROM procesos ORDER BY numero DESC
            `, [id]);
            if (ACCION.rowCount != 0) {
                return res.jsonp(ACCION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
}
exports.ACCION_PERSONAL_CONTROLADOR = new AccionPersonalControlador();
exports.default = exports.ACCION_PERSONAL_CONTROLADOR;
