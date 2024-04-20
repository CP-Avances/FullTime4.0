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
exports.modalidaLaboralControlador = void 0;
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
const path_1 = __importDefault(require("path"));
const database_1 = __importDefault(require("../../database"));
const xlsx_1 = __importDefault(require("xlsx"));
const fs_1 = __importDefault(require("fs"));
const builder = require('xmlbuilder');
class ModalidaLaboralControlador {
    /** Lectura de los datos de la platilla Modalidad_cargo */
    VerfificarPlantillaModalidadLaboral(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
            let separador = path_1.default.sep;
            let ruta = (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)() + separador + documento;
            const workbook = xlsx_1.default.readFile(ruta);
            const sheet_name_list = workbook.SheetNames;
            const plantilla_modalidad_laboral = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            //const plantilla_cargo = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[1]]);
            let data = {
                fila: '',
                modalida_laboral: '',
                observacion: ''
            };
            var listModalidad = [];
            var duplicados = [];
            var mensaje = 'correcto';
            // LECTURA DE LOS DATOS DE LA PLANTILLA
            plantilla_modalidad_laboral.forEach((dato, indice, array) => __awaiter(this, void 0, void 0, function* () {
                var { item, modalida_laboral } = dato;
                //Verificar que el registo no tenga datos vacios
                if ((item != undefined && item != '') &&
                    (modalida_laboral != undefined && modalida_laboral != '')) {
                    data.fila = item;
                    data.modalida_laboral = modalida_laboral;
                    data.observacion = 'no registrado';
                    listModalidad.push(data);
                }
                else {
                    data.fila = item;
                    data.modalida_laboral = modalida_laboral;
                    data.observacion = 'no registrado';
                    if (data.fila == '' || data.fila == undefined) {
                        data.fila = 'error';
                        mensaje = 'error';
                    }
                    if (modalida_laboral == undefined) {
                        data.modalida_laboral = 'No registrado';
                        data.observacion = 'Modalidad laboral ' + data.observacion;
                    }
                    listModalidad.push(data);
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
            listModalidad.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                if (item.observacion == 'no registrado') {
                    var VERIFICAR_MODALIDAD = yield database_1.default.query('SELECT * FROM modal_trabajo WHERE UPPER(descripcion) = $1', [item.modalida_laboral.toUpperCase()]);
                    if (VERIFICAR_MODALIDAD.rows[0] == undefined || VERIFICAR_MODALIDAD.rows[0] == '') {
                        item.observacion = 'ok';
                    }
                    else {
                        item.observacion = 'Ya existe en el sistema';
                    }
                    // Discriminación de elementos iguales
                    if (duplicados.find((p) => p.modalida_laboral.toLowerCase() === item.modalida_laboral.toLowerCase()) == undefined) {
                        duplicados.push(item);
                    }
                    else {
                        item.observacion = '1';
                    }
                }
            }));
            setTimeout(() => {
                listModalidad.sort((a, b) => {
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
                listModalidad.forEach((item) => __awaiter(this, void 0, void 0, function* () {
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
                    listModalidad = undefined;
                }
                return res.jsonp({ message: mensaje, data: listModalidad });
            }, 1000);
        });
    }
    /** Registrar plantilla Modalidad_cargo **/
    CargarPlantilla(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.modalidaLaboralControlador = new ModalidaLaboralControlador();
exports.default = exports.modalidaLaboralControlador;
