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
exports.TIPO_VACUNAS_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../database"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const xlsx_1 = __importDefault(require("xlsx"));
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
class VacunaControlador {
    // METODO PARA LISTAR TIPO VACUNAS
    ListaVacuna(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const VACUNA = yield database_1.default.query(`
                SELECT * FROM e_cat_vacuna ORDER BY nombre ASC
                `);
                if (VACUNA.rowCount > 0) {
                    return res.jsonp(VACUNA.rows);
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
    // METODO PARA REGISTRAR TIPO VACUNA
    CrearVacuna(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { vacuna } = req.body;
                var VERIFICAR_VACUNA = yield database_1.default.query(`
                SELECT * FROM e_cat_vacuna WHERE UPPER(nombre) = $1
                `, [vacuna.toUpperCase()]);
                if (VERIFICAR_VACUNA.rows[0] == undefined || VERIFICAR_VACUNA.rows[0] == '') {
                    const vacunaInsertar = vacuna.charAt(0).toUpperCase() + vacuna.slice(1).toLowerCase();
                    const response = yield database_1.default.query(`
                    INSERT INTO e_cat_vacuna (nombre) VALUES ($1) RETURNING *
                    `, [vacunaInsertar]);
                    const [vacunaInsertada] = response.rows;
                    if (vacunaInsertada) {
                        return res.status(200).jsonp({ message: 'Registro guardado.', status: '200' });
                    }
                    else {
                        return res.status(404).jsonp({ message: 'No se pudo guardar', status: '400' });
                    }
                }
                else {
                    return res.jsonp({ message: 'Tipo vacuna ya existe en el sistema.', status: '300' });
                }
            }
            catch (error) {
                return res.status(500).jsonp({ message: 'error', status: '500' });
            }
        });
    }
    // METODO PARA EDITAR VACUNA
    EditarVacuna(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, nombre } = req.body;
                var VERIFICAR_VACUNA = yield database_1.default.query(`
                SELECT * FROM e_cat_vacuna WHERE UPPER(nombre) = $1 AND NOT id = $2
                `, [nombre.toUpperCase(), id]);
                if (VERIFICAR_VACUNA.rows[0] == undefined || VERIFICAR_VACUNA.rows[0] == '') {
                    const vacunaEditar = nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();
                    const response = yield database_1.default.query(`
                UPDATE e_cat_vacuna SET nombre = $2
                WHERE id = $1 RETURNING *
                `, [id, vacunaEditar]);
                    const [vacunaInsertada] = response.rows;
                    if (vacunaInsertada) {
                        return res.status(200).jsonp({ message: 'Registro editado.', status: '200' });
                    }
                    else {
                        return res.status(404).jsonp({ message: 'Ups!!! algo salio mal.', status: '400' });
                    }
                }
                else {
                    return res.jsonp({ message: 'Tipo vacuna ya existe en el sistema.', status: '300' });
                }
            }
            catch (error) {
                return res.status(500).jsonp({ message: 'error', status: '500' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTRO
    EliminarRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                yield database_1.default.query(`
                DELETE FROM e_cat_vacuna WHERE id = $1
                `, [id]);
                res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
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
                const sheet_name_list = workbook.SheetNames;
                const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[1]]);
                let data = {
                    fila: '',
                    vacuna: '',
                    observacion: ''
                };
                var listaVacunas = [];
                var duplicados = [];
                var mensaje = 'correcto';
                // LECTURA DE LOS DATOS DE LA PLANTILLA
                plantilla.forEach((dato, indice, array) => __awaiter(this, void 0, void 0, function* () {
                    var { item, vacuna } = dato;
                    // VERIFICAR QUE EL REGISTO NO TENGA DATOS VACIOS
                    if ((item != undefined && item != '') &&
                        (vacuna != undefined && vacuna != '')) {
                        data.fila = item;
                        data.vacuna = vacuna;
                        data.observacion = 'no registrada';
                        listaVacunas.push(data);
                    }
                    else {
                        data.fila = item;
                        data.vacuna = vacuna;
                        data.observacion = 'no registrada';
                        if (data.fila == '' || data.fila == undefined) {
                            data.fila = 'error';
                            mensaje = 'error';
                        }
                        if (vacuna == undefined) {
                            data.vacuna = 'No registrado';
                            data.observacion = 'Vacuna ' + data.observacion;
                        }
                        listaVacunas.push(data);
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
                listaVacunas.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                    if (item.observacion == 'no registrada') {
                        var VERIFICAR_VACUNA = yield database_1.default.query(`
                            SELECT * FROM e_cat_vacuna WHERE UPPER(nombre) = $1
                            `, [item.vacuna.toUpperCase()]);
                        if (VERIFICAR_VACUNA.rows[0] == undefined || VERIFICAR_VACUNA.rows[0] == '') {
                            item.observacion = 'ok';
                        }
                        else {
                            item.observacion = 'Ya existe en el sistema';
                        }
                        // Discriminación de elementos iguales
                        if (duplicados.find((p) => p.vacuna.toLowerCase() === item.vacuna.toLowerCase()) == undefined) {
                            duplicados.push(item);
                        }
                        else {
                            item.observacion = '1';
                        }
                    }
                }));
                setTimeout(() => {
                    listaVacunas.sort((a, b) => {
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
                    listaVacunas.forEach((item) => __awaiter(this, void 0, void 0, function* () {
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
                        listaVacunas = undefined;
                    }
                    return res.jsonp({ message: mensaje, data: listaVacunas });
                }, 1000);
            }
            catch (error) {
                return res.status(500).jsonp({ message: 'Error con el servidor metodo RevisarDatos', status: '500' });
            }
        });
    }
    // REGISTRAR PLANTILLA MODALIDAD_CARGO 
    CargarPlantilla(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const plantilla = req.body;
                console.log('datos vacunas: ', plantilla);
                var contador = 1;
                var respuesta;
                plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                    // DATOS QUE SE GUARDARAN DE LA PLANTILLA INGRESADA
                    const { item, vacuna, observacion } = data;
                    const vacu = vacuna.charAt(0).toUpperCase() + vacuna.slice(1).toLowerCase();
                    // REGISTRO DE LOS DATOS DE MODLAIDAD LABORAL
                    const response = yield database_1.default.query(`
                        INSERT INTO e_cat_vacuna (nombre) VALUES ($1) RETURNING *
                        `, [vacu]);
                    const [vacuna_emp] = response.rows;
                    if (contador === plantilla.length) {
                        if (vacuna_emp) {
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
                return res.status(500).jsonp({ message: 'Error con el servidor metodo CargarPlantilla', status: '500' });
            }
        });
    }
}
exports.TIPO_VACUNAS_CONTROLADOR = new VacunaControlador();
exports.default = exports.TIPO_VACUNAS_CONTROLADOR;
