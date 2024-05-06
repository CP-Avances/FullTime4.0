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
exports.tiposCargosControlador = void 0;
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = __importDefault(require("../../database"));
const xlsx_1 = __importDefault(require("xlsx"));
class TiposCargosControlador {
    listaTipoCargos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const TIPO_CARGO = yield database_1.default.query(`
                SELECT * FROM e_cat_tipo_cargo ORDER BY cargo ASC
                `);
                if (TIPO_CARGO.rowCount > 0) {
                    return res.jsonp(TIPO_CARGO.rows);
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
    CrearCargo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cargo = req.params.cargo;
                yield database_1.default.query(`
                INSERT INTO e_cat_tipo_cargo (descripcion) VALUES ($1)
                `, [cargo]);
                res.jsonp({ message: 'Registro guardado.' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    eliminarRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                console.log('id: ', id);
                yield database_1.default.query(`
                DELETE FROM e_cat_tipo_cargo WHERE id = $1
                `, [id]);
                res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    /** Lectura de los datos de la platilla Modalidad_cargo */
    VerfificarPlantillaTipoCargos(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
                let separador = path_1.default.sep;
                let ruta = (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)() + separador + documento;
                const workbook = xlsx_1.default.readFile(ruta);
                const sheet_name_list = workbook.SheetNames;
                const plantilla_cargo = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[1]]);
                let data = {
                    fila: '',
                    tipo_cargo: '',
                    observacion: ''
                };
                var listCargos = [];
                var duplicados = [];
                var mensaje = 'correcto';
                // LECTURA DE LOS DATOS DE LA PLANTILLA
                plantilla_cargo.forEach((dato, indice, array) => __awaiter(this, void 0, void 0, function* () {
                    var { item, cargo } = dato;
                    //Verificar que el registo no tenga datos vacios
                    if ((item != undefined && item != '') &&
                        (cargo != undefined && cargo != '')) {
                        data.fila = item;
                        data.tipo_cargo = cargo;
                        data.observacion = 'no registrado';
                        listCargos.push(data);
                    }
                    else {
                        data.fila = item;
                        data.tipo_cargo = cargo;
                        data.observacion = 'no registrado';
                        if (data.fila == '' || data.fila == undefined) {
                            data.fila = 'error';
                            mensaje = 'error';
                        }
                        if (data.tipo_cargo == undefined) {
                            data.tipo_cargo = 'No registrado';
                            data.observacion = 'Cargo ' + data.observacion;
                        }
                        listCargos.push(data);
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
                listCargos.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                    if (item.observacion == 'no registrado') {
                        var VERIFICAR_CARGOS = yield database_1.default.query(`
                        SELECT * FROM e_cat_tipo_cargo WHERE UPPER(cargo) = $1
                        `, [item.tipo_cargo.toUpperCase()]);
                        if (VERIFICAR_CARGOS.rows[0] == undefined || VERIFICAR_CARGOS.rows[0] == '') {
                            item.observacion = 'ok';
                        }
                        else {
                            item.observacion = 'Ya existe en el sistema';
                        }
                        // Discriminación de elementos iguales
                        if (duplicados.find((p) => p.tipo_cargo.toLowerCase() === item.tipo_cargo.toLowerCase()) == undefined) {
                            duplicados.push(item);
                        }
                        else {
                            item.observacion = '1';
                        }
                    }
                }));
                setTimeout(() => {
                    listCargos.sort((a, b) => {
                        // Compara los números de los objetos
                        if (a.fila < b.fila) {
                            return -1;
                        }
                        if (a.fila > b.fila) {
                            return 1;
                        }
                        return 0; // Son iguales
                    });
                    var filaDuplicada = 0;
                    listCargos.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                        if (item.observacion == '1') {
                            item.observacion = 'Registro duplicado';
                        }
                        //Valida si los datos de la columna N son numeros.
                        if (typeof item.fila === 'number' && !isNaN(item.fila)) {
                            //Condicion para validar si en la numeracion existe un numero que se repite dara error.
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
                        listCargos = undefined;
                    }
                    return res.jsonp({ message: mensaje, data: listCargos });
                }, 1000);
            }
            catch (error) {
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    /** Registrar plantilla Modalidad_cargo **/
    CargarPlantilla(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const plantilla = req.body;
                console.log('datos Tipo Cargos: ', plantilla);
                var contador = 1;
                var respuesta;
                plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                    // Datos que se guardaran de la plantilla ingresada
                    const { item, tipo_cargo, observacion } = data;
                    const cargo = tipo_cargo.charAt(0).toUpperCase() + tipo_cargo.slice(1).toLowerCase();
                    // Registro de los datos de contratos
                    const response = yield database_1.default.query(`
                    INSERT INTO e_cat_tipo_cargo (cargo) VALUES ($1) RETURNING *
                    `, [cargo]);
                    const [cargos] = response.rows;
                    if (contador === plantilla.length) {
                        if (cargos) {
                            return respuesta = res.status(200).jsonp({ message: 'ok' });
                        }
                        else {
                            return respuesta = res.status(404).jsonp({ message: 'error' });
                        }
                    }
                    contador = contador + 1;
                }));
            }
            catch (error) {
                return res.status(500).jsonp({ message: error });
            }
        });
    }
}
exports.tiposCargosControlador = new TiposCargosControlador();
exports.default = exports.tiposCargosControlador;
