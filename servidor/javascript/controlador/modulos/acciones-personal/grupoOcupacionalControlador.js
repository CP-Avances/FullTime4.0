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
exports.GRUPO_OCUPACIONAL_CONTROLADOR = void 0;
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
const auditoriaControlador_1 = __importDefault(require("../../reportes/auditoriaControlador"));
const database_1 = __importDefault(require("../../../database"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const exceljs_1 = __importDefault(require("exceljs"));
class GrupoOcupacionalControlador {
    // METODO PARA BUSCAR LISTA DE GRUPO OCUPACIONAL **USADO
    listaGrupoOcupacional(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const GRUPO_OCUPACIONAL = yield database_1.default.query(`
        SELECT gp.id, gp.descripcion, gp.numero_partida FROM map_cat_grupo_ocupacional AS gp 
        ORDER BY gp.id DESC
        `);
                res.jsonp(GRUPO_OCUPACIONAL.rows);
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'Error al optener los grupos ocupacionales' });
            }
        });
    }
    // METODO PARA INSERTAR EL GRUPO OCUPACIONAL **USADO
    IngresarGrupoOcupacional(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { grupo, numero_partida, user_name, ip, ip_local } = req.body;
            try {
                const GRUPO = yield database_1.default.query(`
          SELECT gp.id, gp.descripcion, gp.numero_partida FROM map_cat_grupo_ocupacional AS gp
          WHERE UPPER(gp.descripcion) = UPPER($1)
          `, [grupo]);
                if (GRUPO.rows[0] != '' && GRUPO.rows[0] != null, GRUPO.rows[0] != undefined) {
                    res.jsonp({ message: 'Ya existe un grupo ocupacional con ese nombre', codigo: 300 });
                }
                else {
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    const response = yield database_1.default.query(`
            INSERT INTO map_cat_grupo_ocupacional (descripcion, numero_partida) VALUES ($1, $2) RETURNING * 
            `, [grupo, numero_partida]);
                    const [grupo_ocupacional] = response.rows;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_cat_grupo_ocupacional',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: JSON.stringify(grupo_ocupacional),
                        ip: ip,
                        ip_local: ip_local,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    res.jsonp({ message: 'El grupo ocupacional ha sido guardado con éxito', codigo: 200 });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'Error al guardar el grupo ocupacional' });
            }
        });
    }
    // METODO PARA EDITAR EL GRUPO OCUPACIONAL  **USADO
    EditarGrupoOcupacional(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_grupo, grupo, numero_partida, user_name, ip, ip_local } = req.body;
            try {
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                yield database_1.default.query(`
            UPDATE map_cat_grupo_ocupacional SET descripcion = $2, numero_partida = $3 WHERE id = $1
          `, [id_grupo, grupo, numero_partida]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'map_cat_procesos',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{"id": "${id_grupo}"}, {"descripcion": "${grupo}"}, {"numero_partida": "${numero_partida}"}`,
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.status(200).jsonp({ message: 'El grupo ocupacional se ha actualizado con éxito', codigo: 200 });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'Error al actualizar el grupo ocupacional' });
            }
        });
    }
    // METODO PARA ELIMINAR EL GRUPO OCUPACIONAL  **USADO
    EliminarGrupoOcupacional(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_grupo, user_name, ip, ip_local } = req.body;
            try {
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                yield database_1.default.query(`
            DELETE FROM map_cat_grupo_ocupacional WHERE id = $1
          `, [id_grupo]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'map_cat_grupo_ocupacional',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{"id": "${id_grupo}"}`,
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.status(200).jsonp({ message: 'El grado se ha eliminado con éxito', codigo: 200 });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'Error al eliminar el grado' });
            }
        });
    }
    // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR  **USADO
    RevisarDatos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
                let separador = path_1.default.sep;
                let ruta = (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)() + separador + documento;
                const workbook = new exceljs_1.default.Workbook();
                yield workbook.xlsx.readFile(ruta);
                let verificador = (0, accesoCarpetas_1.ObtenerIndicePlantilla)(workbook, 'GRUPO_OCUPACIONAL');
                if (verificador === false) {
                    return res.jsonp({ message: 'no_existe', data: undefined });
                }
                else {
                    const sheet_name_list = workbook.worksheets.map(sheet => sheet.name);
                    const plantilla = workbook.getWorksheet(sheet_name_list[verificador]);
                    let data = {
                        fila: '',
                        descripcion: '',
                        numero_partida: '',
                        observacion: ''
                    };
                    var listaGrupoOcupacional = [];
                    var duplicados = [];
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
                        if (!headers['ITEM'] || !headers['DESCRIPCION'] || !headers['NUMERO_PARTIDA']) {
                            return res.jsonp({ message: 'Cabeceras faltantes', data: undefined });
                        }
                        // LECTURA DE LOS DATOS DE LA PLANTILLA
                        plantilla.eachRow((row, rowNumber) => {
                            var _a, _b;
                            // SALTAR LA FILA DE LAS CABECERAS
                            if (rowNumber === 1)
                                return;
                            // LEER LOS DATOS SEGUN LAS COLUMNAS ENCONTRADAS
                            const ITEM = row.getCell(headers['ITEM']).value;
                            const DESCRIPCION = (_a = row.getCell(headers['DESCRIPCION']).value) === null || _a === void 0 ? void 0 : _a.toString().trim();
                            const NUMERO_PARTIDA = (_b = row.getCell(headers['NUMERO_PARTIDA']).value) === null || _b === void 0 ? void 0 : _b.toString().trim();
                            // VERIFICAR QUE EL REGISTO NO TENGA DATOS VACIOS
                            if ((ITEM != undefined && ITEM != '') &&
                                (DESCRIPCION != undefined && DESCRIPCION != '') &&
                                (NUMERO_PARTIDA != undefined && NUMERO_PARTIDA != '')) {
                                data.fila = ITEM;
                                data.descripcion = DESCRIPCION;
                                data.numero_partida = NUMERO_PARTIDA;
                                data.observacion = 'no registrado';
                                //USAMOS TRIM PARA ELIMINAR LOS ESPACIOS AL INICIO Y AL FINAL EN BLANCO.
                                data.descripcion = data.descripcion.trim();
                                data.numero_partida = data.numero_partida.trim();
                                listaGrupoOcupacional.push(data);
                            }
                            else {
                                data.fila = ITEM;
                                data.descripcion = DESCRIPCION;
                                data.numero_partida = NUMERO_PARTIDA;
                                data.observacion = 'no registrado';
                                if (data.fila == '' || data.fila == undefined) {
                                    data.fila = 'error';
                                    mensaje = 'error';
                                }
                                if (DESCRIPCION == undefined) {
                                    data.descripcion = 'No registrado';
                                    data.observacion = 'Grado ' + data.observacion;
                                }
                                if (DESCRIPCION == undefined) {
                                    data.descripcion = '-';
                                }
                                //USAMOS TRIM PARA ELIMINAR LOS ESPACIOS AL INICIO Y AL FINAL EN BLANCO.
                                data.descripcion = data.descripcion.trim();
                                data.numero_partida = data.numero_partida.trim();
                                listaGrupoOcupacional.push(data);
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
                    listaGrupoOcupacional.forEach((item, index) => __awaiter(this, void 0, void 0, function* () {
                        if (item.observacion == 'no registrado') {
                            const VERIFICAR_PROCESO = yield database_1.default.query(`
                SELECT gp.id, gp.descripcion, gp.numero_partida FROM map_cat_grupo_ocupacional gp
                WHERE UPPER(gp.descripcion) = UPPER($1)
             `, [item.descripcion]);
                            if (VERIFICAR_PROCESO.rowCount === 0) {
                                // DISCRIMINACION DE ELEMENTOS IGUALES
                                if (duplicados.find((p) => (p.descripcion.toLowerCase() === item.descripcion.toLowerCase())
                                //|| (p.proceso.toLowerCase() === item.proceso_padre.toLowerCase() && p.proceso.toLowerCase() === item.proceso_padre.toLowerCase())
                                ) == undefined) {
                                    duplicados.push(item);
                                }
                                else {
                                    item.observacion = '1';
                                }
                            }
                            else {
                                item.observacion = 'Ya existe el en el sistema';
                            }
                        }
                    }));
                    setTimeout(() => {
                        listaGrupoOcupacional.sort((a, b) => {
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
                        listaGrupoOcupacional.forEach((item) => __awaiter(this, void 0, void 0, function* () {
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
                            listaGrupoOcupacional = undefined;
                        }
                        return res.jsonp({ message: mensaje, data: listaGrupoOcupacional });
                    }, 1000);
                }
            }
            catch (error) {
                return res.status(500).jsonp({ message: 'Error con el servidor método RevisarDatos.', status: '500' });
            }
        });
    }
    // REGISTRAR PLANTILLA GRADO   **USADO 
    CargarPlantilla(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { plantilla, user_name, ip, ip_local } = req.body;
            let error = false;
            for (const item of plantilla) {
                const { descripcion, numero_partida } = item;
                let num_partida;
                if (numero_partida == '-') {
                    num_partida = null;
                }
                else {
                    num_partida = numero_partida;
                }
                try {
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    const response = yield database_1.default.query(`
            INSERT INTO map_cat_grupo_ocupacional (descripcion, numero_partida) VALUES ($1, $2) RETURNING *
            `, [descripcion, num_partida]);
                    const [grupoOcu] = response.rows;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_cat_grupo_ocupacional',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: JSON.stringify(grupoOcu),
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
}
exports.GRUPO_OCUPACIONAL_CONTROLADOR = new GrupoOcupacionalControlador();
exports.default = exports.GRUPO_OCUPACIONAL_CONTROLADOR;
