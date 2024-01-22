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
exports.TITULO_CONTROLADOR = void 0;
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
const database_1 = __importDefault(require("../../database"));
const fs_1 = __importDefault(require("fs"));
const builder = require('xmlbuilder');
const xlsx_1 = __importDefault(require("xlsx"));
const path_1 = __importDefault(require("path"));
class TituloControlador {
    // METODO PARA LISTAR TITULOS
    ListarTitulos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const titulo = yield database_1.default.query(`
      SELECT ct.id, ct.nombre, nt.nombre as nivel 
      FROM cg_titulos AS ct, nivel_titulo AS nt 
      WHERE ct.id_nivel = nt.id 
      ORDER BY ct.nombre ASC
      `);
            res.jsonp(titulo.rows);
        });
    }
    // METODO PARA ELIMINAR REGISTROS
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield database_1.default.query(`
      DELETE FROM cg_titulos WHERE id = $1
      `, [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    // METODO PARA ACTUALIZAR REGISTRO
    ActualizarTitulo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, id_nivel, id } = req.body;
            yield database_1.default.query(`
      UPDATE cg_titulos SET nombre = $1, id_nivel = $2 WHERE id = $3
      `, [nombre, id_nivel, id]);
            res.jsonp({ message: 'Registro actualizado.' });
        });
    }
    getOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const unTitulo = yield database_1.default.query('SELECT * FROM cg_titulos WHERE id = $1', [id]);
            if (unTitulo.rowCount > 0) {
                return res.jsonp(unTitulo.rows);
            }
            res.status(404).jsonp({ text: 'El empleado no ha sido encontrado' });
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, id_nivel } = req.body;
            yield database_1.default.query('INSERT INTO cg_titulos ( nombre, id_nivel ) VALUES ($1, $2)', [nombre, id_nivel]);
            console.log(req.body);
            res.jsonp({ message: 'Título guardado' });
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
                titulo: '',
                nivel: '',
                observacion: ''
            };
            var listTitulosProfesionales = [];
            var duplicados = [];
            console.log('plantilla: ', plantilla);
            // LECTURA DE LOS DATOS DE LA PLANTILLA
            plantilla.forEach((dato, indice, array) => __awaiter(this, void 0, void 0, function* () {
                var { nombre, nivel } = dato;
                //Validar primero que exista niveles en la tabla niveles
                const existe_nivel = yield database_1.default.query('SELECT id FROM nivel_titulo WHERE UPPER(nombre) = UPPER($1)', [nivel]);
                var id_nivel = existe_nivel.rows[0];
                if (id_nivel != undefined && id_nivel != '') {
                    // VERIFICACIÓN SI LA SUCURSAL NO ESTE REGISTRADA EN EL SISTEMA
                    const VERIFICAR_Titulos = yield database_1.default.query('SELECT * FROM cg_titulos ' +
                        'WHERE nombre = $1 AND id_nivel = $2', [nombre, id_nivel.id]);
                    if (VERIFICAR_Titulos.rowCount == 0) {
                        if (nombre != null && nombre != undefined && nombre != '') {
                            console.log('nombre valido: ', nombre);
                            data.titulo = nombre;
                            if (nivel != null && nivel != undefined && nivel != '') {
                                data.nivel = nivel;
                                if (duplicados.find((p) => p.nombre === dato.nombre && p.nivel === dato.nivel) == undefined) {
                                    data.observacion = 'ok';
                                    duplicados.push(dato);
                                }
                            }
                            else {
                                data.nivel = 'No registrado';
                                data.observacion = 'Nivel no registrado';
                            }
                        }
                        else {
                            console.log('nombre valido: ', nombre);
                            data.titulo = 'No registrado';
                            if (nivel != null && nivel != undefined && nivel != '') {
                                data.nivel = nivel;
                                data.observacion = 'Titulo no registrado';
                            }
                            else {
                                data.nivel = 'No registrado';
                                data.observacion = 'Titulo y Nivel no registrado';
                            }
                        }
                        listTitulosProfesionales.push(data);
                    }
                    else {
                        data.titulo = nombre;
                        data.nivel = nivel;
                        data.observacion = 'Ya esta registrado en base';
                        listTitulosProfesionales.push(data);
                    }
                }
                else {
                    data.titulo = nombre;
                    if (nivel != '' && nivel != undefined) {
                        data.nivel = nivel;
                    }
                    else {
                        data.nivel = 'No registrado';
                    }
                    data.observacion = 'No existe el nivel';
                    listTitulosProfesionales.push(data);
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
                listTitulosProfesionales.forEach((item) => {
                    if (item.observacion == undefined || item.observacion == null || item.observacion == '') {
                        item.observacion = 'Registro duplicado';
                    }
                });
                return res.jsonp({ message: 'correcto', data: listTitulosProfesionales });
            }, 1500);
        });
    }
}
exports.TITULO_CONTROLADOR = new TituloControlador();
exports.default = exports.TITULO_CONTROLADOR;
