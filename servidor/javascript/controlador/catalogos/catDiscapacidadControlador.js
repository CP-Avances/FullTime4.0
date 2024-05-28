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
exports.DISCAPACIDADCONTROLADOR = void 0;
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
const auditoriaControlador_1 = __importDefault(require("../auditoria/auditoriaControlador"));
const database_1 = __importDefault(require("../../database"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const xlsx_1 = __importDefault(require("xlsx"));
class DiscapacidadControlador {
    // METODO PARA LISTAR TIPO DE DISCAPACIDAD
    ListarDiscapacidad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const DISCAPACIDAD = yield database_1.default.query(`
                SELECT * FROM e_cat_discapacidad ORDER BY nombre ASC
                `);
                if (DISCAPACIDAD.rowCount > 0) {
                    return res.jsonp(DISCAPACIDAD.rows);
                }
                else {
                    return res.status(404).jsonp({ text: 'No se encuentran registros.' });
                }
            }
            catch (error) {
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    // METODO PARA REGISTRAR UN TIPO DE DISCAPACIDAD
    CrearDiscapacidad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { discapacidad, user_name, ip } = req.body;
                var VERIFICAR_DISCAPACIDAD = yield database_1.default.query(`
                SELECT * FROM e_cat_discapacidad WHERE UPPER(nombre) = $1
                `, [discapacidad.toUpperCase()]);
                if (VERIFICAR_DISCAPACIDAD.rows[0] == undefined || VERIFICAR_DISCAPACIDAD.rows[0] == '') {
                    const discapacidadInsertar = discapacidad.charAt(0).toUpperCase() + discapacidad.slice(1).toLowerCase();
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    const response = yield database_1.default.query(`
                    INSERT INTO e_cat_discapacidad (nombre) VALUES ($1) RETURNING *
                    `, [discapacidadInsertar]);
                    const [discapacidadInsertada] = response.rows;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'e_cat_discapacidad',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: JSON.stringify(discapacidadInsertada),
                        ip,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    if (discapacidadInsertada) {
                        return res.status(200).jsonp({ message: 'Registro guardado.', status: '200' });
                    }
                    else {
                        return res.status(404).jsonp({ message: 'Ups!!! algo salio mal.', status: '400' });
                    }
                }
                else {
                    return res.jsonp({ message: 'Tipo discapacidad ya existe en el sistema.', status: '300' });
                }
            }
            catch (error) {
                // ROLLBACK
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error', status: '500' });
            }
        });
    }
    // METODO PARA EDITAR UN TIPO DE DISCAPACIDAD
    EditarDiscapacidad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, nombre, user_name, ip } = req.body;
                var VERIFICAR_DISCAPACIDAD = yield database_1.default.query(`
                SELECT * FROM e_cat_discapacidad WHERE UPPER(nombre) = $1 AND NOT id = $2
                `, [nombre.toUpperCase(), id]);
                const consulta = yield database_1.default.query('SELECT * FROM e_cat_discapacidad WHERE id = $1', [id]);
                const [datosOriginales] = consulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'e_cat_discapacidad',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar el registro con id ${id}. No existe el registro en la base de datos.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                if (VERIFICAR_DISCAPACIDAD.rows[0] == undefined || VERIFICAR_DISCAPACIDAD.rows[0] == '') {
                    const nombreConFormato = nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    const response = yield database_1.default.query(`
                    UPDATE e_cat_discapacidad SET nombre = $2
                    WHERE id = $1 RETURNING *
                    `, [id, nombreConFormato]);
                    const [discapacidadEditada] = response.rows;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'e_cat_discapacidad',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: JSON.stringify(datosOriginales),
                        datosNuevos: JSON.stringify(discapacidadEditada),
                        ip,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    if (discapacidadEditada) {
                        return res.status(200).jsonp({ message: 'Registro actualizado.', status: '200' });
                    }
                    else {
                        return res.status(404).jsonp({ message: 'Ups!!! algo salio mal.', status: '400' });
                    }
                }
                else {
                    return res.jsonp({ message: 'Tipo discapacidad ya existe en el sistema.', status: '300' });
                }
            }
            catch (error) {
                // ROLLBACK
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error', status: '500' });
            }
        });
    }
    // METODO PARA ELIMINAR UN TIPO DE DISCAPACIDAD
    EliminarRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                //CONSULTAR DATOS DE LA DISCAPACIDAD A ELIMINAR
                const DISCAPACIDAD = yield database_1.default.query(`
                SELECT * FROM e_cat_discapacidad WHERE id = $1
                `, [id]);
                const [datosOriginales] = DISCAPACIDAD.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'e_cat_discapacidad',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar el registro con id: ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                yield database_1.default.query(`
                DELETE FROM e_cat_discapacidad WHERE id = $1
                `, [id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'e_cat_discapacidad',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: '',
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                // ROLLBACK
                yield database_1.default.query('ROLLBACK');
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR
    RevisarDatos(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
                let separador = path_1.default.sep;
                let ruta = (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)() + separador + documento;
                const workbook = xlsx_1.default.readFile(ruta);
                let verificador = (0, accesoCarpetas_1.ObtenerIndicePlantilla)(workbook, 'TIPO_DISCAPACIDAD');
                if (verificador === false) {
                    return res.jsonp({ message: 'no_existe', data: undefined });
                }
                else {
                    const sheet_name_list = workbook.SheetNames;
                    const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[verificador]]);
                    let data = {
                        fila: '',
                        discapacidad: '',
                        observacion: ''
                    };
                    var listaDiscapacidad = [];
                    var duplicados = [];
                    var mensaje = 'correcto';
                    // LECTURA DE LOS DATOS DE LA PLANTILLA
                    plantilla.forEach((dato, indice, array) => __awaiter(this, void 0, void 0, function* () {
                        var { ITEM, DISCAPACIDAD } = dato;
                        // VERIFICAR QUE EL REGISTO NO TENGA DATOS VACIOS
                        if ((ITEM != undefined && ITEM != '') &&
                            (DISCAPACIDAD != undefined && DISCAPACIDAD != '')) {
                            data.fila = ITEM;
                            data.discapacidad = DISCAPACIDAD;
                            data.observacion = 'no registrada';
                            listaDiscapacidad.push(data);
                        }
                        else {
                            data.fila = ITEM;
                            data.discapacidad = DISCAPACIDAD;
                            data.observacion = 'no registrada';
                            if (data.fila == '' || data.fila == undefined) {
                                data.fila = 'error';
                                mensaje = 'error';
                            }
                            if (DISCAPACIDAD == undefined) {
                                data.discapacidad = 'No registrado';
                                data.observacion = 'Discapacidad ' + data.observacion;
                            }
                            listaDiscapacidad.push(data);
                        }
                        data = {};
                    }));
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
                    listaDiscapacidad.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                        if (item.observacion == 'no registrada') {
                            var VERIFICAR_DISCAPACIDAD = yield database_1.default.query(`
                            SELECT * FROM e_cat_discapacidad WHERE UPPER(nombre) = $1
                            `, [item.discapacidad.toUpperCase()]);
                            if (VERIFICAR_DISCAPACIDAD.rows[0] == undefined || VERIFICAR_DISCAPACIDAD.rows[0] == '') {
                                item.observacion = 'ok';
                            }
                            else {
                                item.observacion = 'Ya existe en el sistema';
                            }
                            // Discriminación de elementos iguales
                            if (duplicados.find((p) => p.discapacidad.toLowerCase() === item.discapacidad.toLowerCase()) == undefined) {
                                duplicados.push(item);
                            }
                            else {
                                item.observacion = '1';
                            }
                        }
                    }));
                    setTimeout(() => {
                        listaDiscapacidad.sort((a, b) => {
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
                        listaDiscapacidad.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                            if (item.observacion == '1') {
                                item.observacion = 'Registro duplicado';
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
                            listaDiscapacidad = undefined;
                        }
                        return res.jsonp({ message: mensaje, data: listaDiscapacidad });
                    }, 1000);
                }
            }
            catch (error) {
                return res.status(500).jsonp({ message: 'Error con el servidor metodo revisar datos', status: '500' });
            }
        });
    }
    // REGISTRAR PLANTILLA MODALIDAD_CARGO 
    CargarPlantilla(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { plantilla, user_name, ip } = req.body;
                var contador = 1;
                var respuesta;
                plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                    // DATOS QUE SE GUARDARAN DE LA PLANTILLA INGRESADA
                    const { item, discapacidad, observacion } = data;
                    const disca = discapacidad.charAt(0).toUpperCase() + discapacidad.slice(1).toLowerCase();
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    // REGISTRO DE LOS DATOS DE MODLAIDAD LABORAL
                    const response = yield database_1.default.query(`
                    INSERT INTO e_cat_discapacidad (nombre) VALUES ($1) RETURNING *
                    `, [disca]);
                    const [discapacidad_emp] = response.rows;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'e_cat_discapacidad',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: JSON.stringify(discapacidad_emp),
                        ip,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    if (contador === plantilla.length) {
                        if (discapacidad_emp) {
                            return respuesta = res.status(200).jsonp({ message: 'ok', status: '200' });
                        }
                        else {
                            return respuesta = res.status(404).jsonp({ message: 'error', status: '400' });
                        }
                    }
                    contador = contador + 1;
                }));
            }
            catch (error) {
                // ROLLBACK
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error con el servidor metodo CargarPlantilla', status: '500' });
            }
        });
    }
}
exports.DISCAPACIDADCONTROLADOR = new DiscapacidadControlador();
exports.default = exports.DISCAPACIDADCONTROLADOR;
