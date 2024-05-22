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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = __importDefault(require("../../database"));
const xlsx_1 = __importDefault(require("xlsx"));
class ModalidaLaboralControlador {
    // METODO PARA LISTAR MODALIDAD LABORAL
    ListaModalidadLaboral(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const MODALIDAL_LABORAL = yield database_1.default.query(`
                SELECT * FROM e_cat_modalidad_trabajo ORDER BY descripcion ASC
                `);
                if (MODALIDAL_LABORAL.rowCount > 0) {
                    return res.jsonp(MODALIDAL_LABORAL.rows);
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
    // METODO PARA REGISTRAR MODALIDAD LABORAL
    CrearMadalidadLaboral(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { modalidad } = req.body;
                var VERIFICAR_MODALIDAD = yield database_1.default.query(`
                SELECT * FROM e_cat_modalidad_trabajo WHERE UPPER(descripcion) = $1
                `, [modalidad.toUpperCase()]);
                if (VERIFICAR_MODALIDAD.rows[0] == undefined || VERIFICAR_MODALIDAD.rows[0] == '') {
                    const modali = modalidad.charAt(0).toUpperCase() + modalidad.slice(1).toLowerCase();
                    const response = yield database_1.default.query(`
                    INSERT INTO e_cat_modalidad_trabajo (descripcion) VALUES ($1) RETURNING *
                    `, [modali]);
                    const [modalidadLaboral] = response.rows;
                    if (modalidadLaboral) {
                        return res.status(200).jsonp({ message: 'Registro guardado.', status: '200' });
                    }
                    else {
                        return res.status(404).jsonp({ message: 'No se pudo guardar', status: '400' });
                    }
                }
                else {
                    return res.jsonp({ message: 'Modalidad Laboral ya existe en el sistema.', status: '300' });
                }
            }
            catch (error) {
                return res.status(500).jsonp({ message: 'error', status: '500' });
            }
        });
    }
    // METODO PARA EDITAR MODALIDAD LABORAL
    EditarModalidadLaboral(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, modalidad } = req.body;
                const modali = modalidad.charAt(0).toUpperCase() + modalidad.slice(1).toLowerCase();
                const modalExiste = yield database_1.default.query(`
                SELECT * FROM e_cat_modalidad_trabajo WHERE UPPER(descripcion) = $1
                `, [modali.toUpperCase()]);
                if (modalExiste.rows[0] != undefined && modalExiste.rows[0].descripcion != '' && modalExiste.rows[0].descripcion != null) {
                    return res.status(200).jsonp({ message: 'Modalidad Laboral ya esiste en el sistema.', status: '300' });
                }
                else {
                    const response = yield database_1.default.query(`
                    UPDATE e_cat_modalidad_trabajo SET descripcion = $2
                    WHERE id = $1 RETURNING *
                    `, [id, modali]);
                    const [modalidadLaboral] = response.rows;
                    if (modalidadLaboral) {
                        return res.status(200).jsonp({ message: 'Registro actualizado.', status: '200' });
                    }
                    else {
                        return res.status(404).jsonp({ message: 'Ups!!! algo slaio mal.', status: '400' });
                    }
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
                DELETE FROM e_cat_modalidad_trabajo WHERE id = $1
                `, [id]);
                res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // LECTURA DE LOS DATOS DE LA PLATILLA MODALIDAD_CARGO 
    VerfificarPlantillaModalidadLaboral(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
                let separador = path_1.default.sep;
                let ruta = (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)() + separador + documento;
                const workbook = xlsx_1.default.readFile(ruta);
                const sheet_name_list = workbook.SheetNames;
                const plantilla_modalidad_laboral = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
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
                    // VERIFICAR QUE EL REGISTO NO TENGA DATOS VACIOS
                    if ((item != undefined && item != '') &&
                        (modalida_laboral != undefined && modalida_laboral != '')) {
                        data.fila = item;
                        data.modalida_laboral = modalida_laboral;
                        data.observacion = 'no registrada';
                        listModalidad.push(data);
                    }
                    else {
                        data.fila = item;
                        data.modalida_laboral = modalida_laboral;
                        data.observacion = 'no registrada';
                        if (data.fila == '' || data.fila == undefined) {
                            data.fila = 'error';
                            mensaje = 'error';
                        }
                        if (modalida_laboral == undefined) {
                            data.modalida_laboral = 'No registrado';
                            data.observacion = 'Modalidad Laboral ' + data.observacion;
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
                    if (item.observacion == 'no registrada') {
                        var VERIFICAR_MODALIDAD = yield database_1.default.query(`
                        SELECT * FROM e_cat_modalidad_trabajo WHERE UPPER(descripcion) = $1
                        `, [item.modalida_laboral.toUpperCase()]);
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
                    listModalidad.forEach((item) => __awaiter(this, void 0, void 0, function* () {
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
                        listModalidad = undefined;
                    }
                    return res.jsonp({ message: mensaje, data: listModalidad });
                }, 1000);
            }
            catch (error) {
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    // REGISTRAR PLANTILLA MODALIDAD_CARGO 
    CargarPlantilla(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const plantilla = req.body;
                console.log('datos Modalidad laboral: ', plantilla);
                var contador = 1;
                var respuesta;
                plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                    // DATOS QUE SE GUARDARAN DE LA PLANTILLA INGRESADA
                    const { item, modalida_laboral, observacion } = data;
                    const modalidad = modalida_laboral.charAt(0).toUpperCase() + modalida_laboral.slice(1).toLowerCase();
                    // REGISTRO DE LOS DATOS DE MODLAIDAD LABORAL
                    const response = yield database_1.default.query(`
                    INSERT INTO e_cat_modalidad_trabajo (descripcion) VALUES ($1) RETURNING *
                    `, [modalidad]);
                    const [modalidad_la] = response.rows;
                    if (contador === plantilla.length) {
                        if (modalidad_la) {
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
exports.modalidaLaboralControlador = new ModalidaLaboralControlador();
exports.default = exports.modalidaLaboralControlador;