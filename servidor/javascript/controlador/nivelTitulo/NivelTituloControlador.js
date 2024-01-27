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
exports.NIVEL_TITULO_CONTROLADOR = void 0;
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
const database_1 = __importDefault(require("../../database"));
const xlsx_1 = __importDefault(require("xlsx"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const builder = require('xmlbuilder');
class NivelTituloControlador {
    // METODO PARA LISTAR NIVELES DE TITULO PROFESIONAL
    ListarNivel(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const titulo = yield database_1.default.query(`
      SELECT * FROM nivel_titulo ORDER BY nombre ASC
      `);
            if (titulo.rowCount > 0) {
                return res.jsonp(titulo.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTROS
    EliminarNivelTitulo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield database_1.default.query(`
      DELETE FROM nivel_titulo WHERE id = $1
      `, [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    // METODO PARA REGISTRAR NIVEL DE TITULO
    CrearNivel(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.body;
            console.log('nombre ingresado: ', nombre);
            const response = yield database_1.default.query(`
      INSERT INTO nivel_titulo (nombre) VALUES ($1) RETURNING *
      `, [nombre]);
            const [nivel] = response.rows;
            if (nivel) {
                return res.status(200).jsonp(nivel);
            }
            else {
                return res.status(404).jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA ACTUALIZAR REGISTRO DE NIVEL DE TITULO
    ActualizarNivelTitulo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, id } = req.body;
            yield database_1.default.query(`
      UPDATE nivel_titulo SET nombre = $1 WHERE id = $2
      `, [nombre, id]);
            res.jsonp({ message: 'Registro actualizado.' });
        });
    }
    // METODO PARA BUSCAR TITULO POR SU NOMBRE
    ObtenerNivelNombre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.params;
            const unNivelTitulo = yield database_1.default.query(`
      SELECT * FROM nivel_titulo WHERE nombre = $1
      `, [nombre]);
            if (unNivelTitulo.rowCount > 0) {
                return res.jsonp(unNivelTitulo.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado' });
            }
        });
    }
    getOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const unNivelTitulo = yield database_1.default.query('SELECT * FROM nivel_titulo WHERE id = $1', [id]);
            if (unNivelTitulo.rowCount > 0) {
                return res.jsonp(unNivelTitulo.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado' });
            }
        });
    }
    // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR
    RevisarDatos(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
            let separador = path_1.default.sep;
            let ruta = (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)() + separador + documento;
            const workbook = xlsx_1.default.readFile(ruta);
            const sheet_name_list = workbook.SheetNames;
            const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            let data = {
                nombre: '',
                observacion: ''
            };
            var listNivelesProfesionales = [];
            var duplicados = [];
            console.log('plantilla: ', plantilla);
            // LECTURA DE LOS DATOS DE LA PLANTILLA
            plantilla.forEach((dato, indice, array) => __awaiter(this, void 0, void 0, function* () {
                var { nombre } = dato;
                data.nombre = dato.nombre;
                if (data.nombre != undefined && data.nombre != '' && data.nombre != null) {
                    //Validar primero que exista la ciudad en la tabla ciudades
                    const existe_nivelProfecional = yield database_1.default.query('SELECT nombre FROM nivel_titulo WHERE UPPER(nombre) = UPPER($1)', [data.nombre]);
                    if (existe_nivelProfecional.rowCount == 0) {
                        data.nombre = nombre;
                        if (duplicados.find((p) => p.nombre.toLowerCase() === data.nombre.toLowerCase()) == undefined) {
                            data.observacion = 'ok';
                            duplicados.push(dato);
                        }
                        listNivelesProfesionales.push(data);
                    }
                    else {
                        data.nombre = nombre;
                        data.observacion = 'Ya existe en el sistema';
                        listNivelesProfesionales.push(data);
                    }
                }
                else {
                    data.nombre = 'No registrado';
                    data.observacion = 'Nivel no registrado';
                    listNivelesProfesionales.push(data);
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
            setTimeout(() => {
                listNivelesProfesionales.forEach((item) => {
                    if (item.observacion == undefined || item.observacion == null || item.observacion == '') {
                        item.observacion = 'Registro duplicado';
                    }
                });
                return res.jsonp({ message: 'correcto', data: listNivelesProfesionales });
            }, 1500);
        });
    }
}
exports.NIVEL_TITULO_CONTROLADOR = new NivelTituloControlador();
exports.default = exports.NIVEL_TITULO_CONTROLADOR;
