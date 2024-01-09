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
exports.SUCURSAL_CONTROLADOR = void 0;
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
const database_1 = __importDefault(require("../../database"));
const xlsx_1 = __importDefault(require("xlsx"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const builder = require('xmlbuilder');
class SucursalControlador {
    // BUSCAR SUCURSALES POR EL NOMBRE
    BuscarNombreSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.body;
            const SUCURSAL = yield database_1.default.query(`
      SELECT * FROM sucursales WHERE UPPER(nombre) = $1
      `, [nombre]);
            if (SUCURSAL.rowCount > 0) {
                return res.jsonp(SUCURSAL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    // GUARDAR REGISTRO DE SUCURSAL
    CrearSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, id_ciudad, id_empresa } = req.body;
            const response = yield database_1.default.query(`
      INSERT INTO sucursales (nombre, id_ciudad, id_empresa) VALUES ($1, $2, $3) RETURNING *
      `, [nombre, id_ciudad, id_empresa]);
            const [sucursal] = response.rows;
            if (sucursal) {
                return res.status(200).jsonp(sucursal);
            }
            else {
                return res.status(404).jsonp({ message: 'error' });
            }
        });
    }
    // ACTUALIZAR REGISTRO DE ESTABLECIMIENTO
    ActualizarSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, id_ciudad, id } = req.body;
            yield database_1.default.query(`
      UPDATE sucursales SET nombre = $1, id_ciudad = $2 WHERE id = $3
      `, [nombre, id_ciudad, id]);
            res.jsonp({ message: 'Registro actualizado.' });
        });
    }
    // BUSCAR SUCURSAL POR ID DE EMPRESA
    ObtenerSucursalEmpresa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empresa } = req.params;
            const SUCURSAL = yield database_1.default.query(`
      SELECT * FROM sucursales WHERE id_empresa = $1
      `, [id_empresa]);
            if (SUCURSAL.rowCount > 0) {
                return res.jsonp(SUCURSAL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO DE BUSQUEDA DE SUCURSALES
    ListarSucursales(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const SUCURSAL = yield database_1.default.query(`
      SELECT s.id, s.nombre, s.id_ciudad, c.descripcion, s.id_empresa, ce.nombre AS nomempresa
      FROM sucursales s, ciudades c, cg_empresa ce
      WHERE s.id_ciudad = c.id AND s.id_empresa = ce.id
      ORDER BY s.id
      `);
            if (SUCURSAL.rowCount > 0) {
                return res.jsonp(SUCURSAL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTRO
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield database_1.default.query(`
      DELETE FROM sucursales WHERE id = $1
      `, [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    // METODO PARA BUSCAR DATOS DE UNA SUCURSAL
    ObtenerUnaSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const SUCURSAL = yield database_1.default.query(`
      SELECT s.id, s.nombre, s.id_ciudad, c.descripcion, s.id_empresa, ce.nombre AS nomempresa
      FROM sucursales s, ciudades c, cg_empresa ce
      WHERE s.id_ciudad = c.id AND s.id_empresa = ce.id AND s.id = $1
      `, [id]);
            if (SUCURSAL.rowCount > 0) {
                return res.jsonp(SUCURSAL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
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
                nom_sucursal: '',
                ciudad: '',
                observacion: ''
            };
            var listSucursales = [];
            var duplicados = [];
            console.log('plantilla: ', plantilla);
            // LECTURA DE LOS DATOS DE LA PLANTILLA
            plantilla.forEach((dato, indice, array) => __awaiter(this, void 0, void 0, function* () {
                var { nombre, ciudad } = dato;
                //Validar primero que exista la ciudad en la tabla ciudades
                const existe_ciudad = yield database_1.default.query('SELECT id FROM ciudades WHERE UPPER(descripcion) = UPPER($1)', [ciudad]);
                var id_ciudad = existe_ciudad.rows[0];
                if (id_ciudad != undefined && id_ciudad != '') {
                    console.log('ciudad valida: ', id_ciudad.id);
                    // VERIFICACIÓN SI LA SUCURSAL NO ESTE REGISTRADA EN EL SISTEMA
                    const VERIFICAR_SUCURSAL = yield database_1.default.query('SELECT * FROM sucursales ' +
                        'WHERE nombre = $1 AND id_ciudad = $2', [nombre, id_ciudad.id]);
                    if (VERIFICAR_SUCURSAL.rowCount === 0) {
                        // VERIFICACIÓN DE EXISTENCIA DE REGISTRO DE FECHA
                        if (nombre != undefined && nombre != null && nombre != '') {
                            data.nom_sucursal = nombre;
                            // VERIFICACIÓN DE EXSTENCIA DE REGISTRO DE CIUDAD
                            if (ciudad != undefined && ciudad != null && ciudad != '') {
                                data.ciudad = ciudad;
                                // Discriminación de elementos iguales
                                if (duplicados.find((p) => p.nombre === dato.nombre && p.ciudad === dato.ciudad) == undefined) {
                                    data.observacion = 'ok';
                                    duplicados.push(dato);
                                }
                            }
                            else {
                                data.ciudad = 'No registrado';
                                data.observacion = 'Ciudad no registrada';
                            }
                        }
                        else {
                            data.nom_sucursal = 'No registrado';
                            data.observacion = 'Sucursal no registrada';
                            if (ciudad != undefined && ciudad != null && ciudad != '') {
                                data.ciudad = ciudad;
                            }
                            else {
                                data.ciudad = 'No registrado';
                                data.observacion = 'Ciudad no registrada';
                            }
                        }
                        listSucursales.push(data);
                    }
                    else {
                        data.nom_sucursal = nombre;
                        data.ciudad = ciudad;
                        data.observacion = 'Ya esta registrado en base';
                        listSucursales.push(data);
                    }
                }
                else {
                    data.nom_sucursal = nombre;
                    data.ciudad = ciudad;
                    data.observacion = 'No existe la ciudad';
                    listSucursales.push(data);
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
                listSucursales.forEach((item) => {
                    if (item.observacion == undefined || item.observacion == null || item.observacion == '') {
                        item.observacion = 'Registro duplicado';
                    }
                });
                return res.jsonp({ message: 'correcto', data: listSucursales });
            }, 1500);
        });
    }
}
exports.SUCURSAL_CONTROLADOR = new SucursalControlador();
exports.default = exports.SUCURSAL_CONTROLADOR;
