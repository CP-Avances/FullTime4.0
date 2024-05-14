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
const auditoriaControlador_1 = __importDefault(require("../auditoria/auditoriaControlador"));
const database_1 = __importDefault(require("../../database"));
const xlsx_1 = __importDefault(require("xlsx"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
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
            try {
                const { user_name, ip } = req.body;
                const id = req.params.id;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // OBTENER DATOSORIGINALES
                const consulta = yield database_1.default.query('SELECT * FROM nivel_titulo WHERE id = $1', [id]);
                const [datosOriginales] = consulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'nivel_titulo',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar el registro con id ${id}. No existe el registro en la base de datos.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                yield database_1.default.query(`
        DELETE FROM nivel_titulo WHERE id = $1
        `, [id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'nivel_titulo',
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
                return res.status(500).jsonp({ message: 'Error al eliminar el registro.' });
            }
        });
    }
    // METODO PARA REGISTRAR NIVEL DE TITULO
    CrearNivel(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
        INSERT INTO nivel_titulo (nombre) VALUES ($1) RETURNING *
        `, [nombre]);
                const [nivel] = response.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'nivel_titulo',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{nombre: ${nombre}}`,
                    ip: ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (nivel) {
                    return res.status(200).jsonp(nivel);
                }
                else {
                    return res.status(404).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                console.log(error);
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al registrar el nivel de título.' });
            }
        });
    }
    // METODO PARA ACTUALIZAR REGISTRO DE NIVEL DE TITULO
    ActualizarNivelTitulo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, id, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // OBTENER DATOSORIGINALES
                const consulta = yield database_1.default.query('SELECT * FROM nivel_titulo WHERE id = $1', [id]);
                const [datosOriginales] = consulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'nivel_titulo',
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
                yield database_1.default.query(`
        UPDATE nivel_titulo SET nombre = $1 WHERE id = $2
        `, [nombre, id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'nivel_titulo',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: `{"nombre": "${nombre}"}`,
                    ip,
                    observacion: ''
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al actualizar el registro.' });
            }
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
                fila: '',
                nombre: '',
                observacion: ''
            };
            var listNivelesProfesionales = [];
            var duplicados = [];
            var mensaje = 'correcto';
            // LECTURA DE LOS DATOS DE LA PLANTILLA
            plantilla.forEach((dato, indice, array) => __awaiter(this, void 0, void 0, function* () {
                var { item, nombre } = dato;
                data.fila = dato.item;
                data.nombre = dato.nombre;
                if ((data.fila != undefined && data.fila != '') &&
                    (data.nombre != undefined && data.nombre != '' && data.nombre != null)) {
                    //Validar primero que exista la ciudad en la tabla ciudades
                    const existe_nivelProfecional = yield database_1.default.query('SELECT nombre FROM nivel_titulo WHERE UPPER(nombre) = UPPER($1)', [data.nombre]);
                    if (existe_nivelProfecional.rowCount == 0) {
                        data.fila = item;
                        data.nombre = nombre;
                        if (duplicados.find((p) => p.nombre.toLowerCase() === data.nombre.toLowerCase()) == undefined) {
                            data.observacion = 'ok';
                            duplicados.push(dato);
                        }
                        listNivelesProfesionales.push(data);
                    }
                    else {
                        data.fila = item;
                        data.nombre = nombre;
                        data.observacion = 'Ya existe en el sistema';
                        listNivelesProfesionales.push(data);
                    }
                }
                else {
                    data.fila = item;
                    data.nombre = 'No registrado';
                    data.observacion = 'Nivel no registrado';
                    if (data.fila == '' || data.fila == undefined) {
                        data.fila = 'error';
                        mensaje = 'error';
                    }
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
                listNivelesProfesionales.sort((a, b) => {
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
                listNivelesProfesionales.forEach((item) => {
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
                    listNivelesProfesionales = undefined;
                }
                return res.jsonp({ message: mensaje, data: listNivelesProfesionales });
            }, 1500);
        });
    }
}
exports.NIVEL_TITULO_CONTROLADOR = new NivelTituloControlador();
exports.default = exports.NIVEL_TITULO_CONTROLADOR;
