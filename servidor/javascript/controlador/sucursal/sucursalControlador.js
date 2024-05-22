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
const auditoriaControlador_1 = __importDefault(require("../auditoria/auditoriaControlador"));
const database_1 = __importDefault(require("../../database"));
const xlsx_1 = __importDefault(require("xlsx"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class SucursalControlador {
    // BUSCAR SUCURSALES POR EL NOMBRE
    BuscarNombreSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.body;
            const SUCURSAL = yield database_1.default.query(`
      SELECT * FROM e_sucursales WHERE UPPER(nombre) = $1
      `, [nombre]);
            if (SUCURSAL.rowCount > 0) {
                return res.jsonp(SUCURSAL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // GUARDAR REGISTRO DE SUCURSAL
    CrearSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, id_ciudad, id_empresa, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
        INSERT INTO e_sucursales (nombre, id_ciudad, id_empresa) VALUES ($1, $2, $3) RETURNING *
        `, [nombre, id_ciudad, id_empresa]);
                const [sucursal] = response.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'e_sucursales',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(sucursal),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (sucursal) {
                    return res.status(200).jsonp(sucursal);
                }
                else {
                    return res.status(404).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // ACTUALIZAR REGISTRO DE ESTABLECIMIENTO
    ActualizarSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, id_ciudad, id, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const consulta = yield database_1.default.query('SELECT * FROM e_sucursales WHERE id = $1', [id]);
                const [datosOriginales] = consulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'e_sucursales',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar el registro con id: ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                yield database_1.default.query(`
        UPDATE e_sucursales SET nombre = $1, id_ciudad = $2 WHERE id = $3
        `, [nombre, id_ciudad, id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'e_sucursales',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: `{ "nombre": "${nombre}", "id_ciudad": "${id_ciudad}" }`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // BUSCAR SUCURSAL POR ID DE EMPRESA
    ObtenerSucursalEmpresa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empresa } = req.params;
            const SUCURSAL = yield database_1.default.query(`
      SELECT * FROM e_sucursales WHERE id_empresa = $1
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
      FROM e_sucursales s, e_ciudades c, e_empresa ce
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
            try {
                const { user_name, ip } = req.body;
                const id = req.params.id;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const consulta = yield database_1.default.query('SELECT * FROM e_sucursales WHERE id = $1', [id]);
                const [datosOriginales] = consulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'e_sucursales',
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
        DELETE FROM e_sucursales WHERE id = $1
        `, [id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'e_sucursales',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: '',
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA BUSCAR DATOS DE UNA SUCURSAL
    ObtenerUnaSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const SUCURSAL = yield database_1.default.query(`
      SELECT s.id, s.nombre, s.id_ciudad, c.descripcion, s.id_empresa, ce.nombre AS nomempresa
      FROM e_sucursales s, e_ciudades c, e_empresa ce
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
            const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[3]]);
            let data = {
                fila: '',
                nom_sucursal: '',
                ciudad: '',
                observacion: ''
            };
            var mensaje = 'correcto';
            var listSucursales = [];
            var duplicados = [];
            // LECTURA DE LOS DATOS DE LA PLANTILLA
            plantilla.forEach((dato, indice, array) => __awaiter(this, void 0, void 0, function* () {
                var { item, nombre, ciudad } = dato;
                data.fila = dato.item;
                data.nom_sucursal = dato.nombre;
                data.ciudad = dato.ciudad;
                if ((data.fila != undefined && data.fila != '') &&
                    (data.nom_sucursal != undefined && data.nom_sucursal != '') &&
                    (data.ciudad != undefined && data.ciudad != '')) {
                    //Validar primero que exista la ciudad en la tabla ciudades
                    const existe_ciudad = yield database_1.default.query(`
          SELECT id FROM e_ciudades WHERE UPPER(descripcion) = UPPER($1)
          `, [ciudad]);
                    var id_ciudad = existe_ciudad.rows[0];
                    if (id_ciudad != undefined && id_ciudad != '') {
                        // VERIFICACIÓN SI LA SUCURSAL NO ESTE REGISTRADA EN EL SISTEMA
                        const VERIFICAR_SUCURSAL = yield database_1.default.query(`
            SELECT * FROM e_sucursales 
            WHERE UPPER(nombre) = UPPER($1) AND id_ciudad = $2
            `, [nombre, id_ciudad.id]);
                        if (VERIFICAR_SUCURSAL.rowCount === 0) {
                            data.fila = item;
                            data.nom_sucursal = nombre;
                            data.ciudad = ciudad;
                            // Discriminación de elementos iguales
                            if (duplicados.find((p) => p.nombre.toLowerCase() === dato.nombre.toLowerCase() &&
                                p.ciudad.toLowerCase() === dato.ciudad.toLowerCase()) == undefined) {
                                data.observacion = 'ok';
                                duplicados.push(dato);
                            }
                            listSucursales.push(data);
                        }
                        else {
                            data.fila = item;
                            data.nom_sucursal = nombre;
                            data.ciudad = ciudad;
                            data.observacion = 'Ya existe en el sistema';
                            listSucursales.push(data);
                        }
                    }
                    else {
                        data.fila = item;
                        data.nom_sucursal = dato.nombre;
                        data.ciudad = dato.ciudad;
                        if (data.ciudad == '' || data.ciudad == undefined) {
                            data.ciudad = 'No registrado';
                        }
                        data.observacion = 'Ciudad no existe en el sistema';
                        listSucursales.push(data);
                    }
                }
                else {
                    data.fila = item;
                    data.nom_sucursal = dato.nombre;
                    data.ciudad = dato.ciudad;
                    if (data.fila == '' || data.fila == undefined) {
                        data.fila = 'error';
                        mensaje = 'error';
                    }
                    if (data.nom_sucursal == '' || data.nom_sucursal == undefined) {
                        data.nom_sucursal = 'No registrado';
                        data.observacion = 'Sucursal no registrada';
                    }
                    if (data.ciudad == '' || data.ciudad == undefined) {
                        data.ciudad = 'No registrado';
                        data.observacion = 'Ciudad no registrada';
                    }
                    if ((data.nom_sucursal == '' || data.nom_sucursal == undefined) && (data.ciudad == '' || data.ciudad == undefined)) {
                        data.observacion = 'Sucursal y ciudad no registrado';
                    }
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
                listSucursales.sort((a, b) => {
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
                listSucursales.forEach((item) => {
                    if (item.observacion == undefined || item.observacion == null || item.observacion == '') {
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
                });
                if (mensaje == 'error') {
                    listSucursales = undefined;
                }
                return res.jsonp({ message: mensaje, data: listSucursales });
            }, 1500);
        });
    }
}
exports.SUCURSAL_CONTROLADOR = new SucursalControlador();
exports.default = exports.SUCURSAL_CONTROLADOR;
