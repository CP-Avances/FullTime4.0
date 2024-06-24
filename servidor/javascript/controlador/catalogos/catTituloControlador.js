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
const auditoriaControlador_1 = __importDefault(require("../auditoria/auditoriaControlador"));
const xlsx_1 = __importDefault(require("xlsx"));
const database_1 = __importDefault(require("../../database"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class TituloControlador {
    // METODO PARA LISTAR TITULOS
    ListarTitulos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const titulo = yield database_1.default.query(`
      SELECT ct.id, ct.nombre, nt.nombre as nivel 
      FROM et_titulos AS ct, et_cat_nivel_titulo AS nt 
      WHERE ct.id_nivel = nt.id 
      ORDER BY ct.nombre ASC
      `);
            res.jsonp(titulo.rows);
        });
    }
    // METODO PARA BUSCAR UN TITULO POR SU NOMBRE
    ObtenerTituloNombre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, nivel } = req.body;
            const TITULO = yield database_1.default.query(`
      SELECT * FROM et_titulos WHERE UPPER(nombre) = $1 AND id_nivel = $2
      `, [nombre, nivel]);
            if (TITULO.rowCount != 0) {
                return res.jsonp(TITULO.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTROS
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_name, ip } = req.body;
                const id = req.params.id;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const rol = yield database_1.default.query('SELECT * FROM et_titulos WHERE id = $1', [id]);
                const [datosOriginales] = rol.rows;
                if (!datosOriginales) {
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'et_titulos',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar el título con id ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Error al eliminar el registro.' });
                }
                yield database_1.default.query(`
        DELETE FROM et_titulos WHERE id = $1
        `, [id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'et_titulos',
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
                // FINALIZAR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                //return res.status(500).jsonp({ message: 'Error al eliminar el registro.' });
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA ACTUALIZAR REGISTRO
    ActualizarTitulo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, id_nivel, id, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const rol = yield database_1.default.query('SELECT * FROM et_titulos WHERE id = $1', [id]);
                const [datosOriginales] = rol.rows;
                if (!datosOriginales) {
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'et_titulos',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar el título con id ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Error al actualizar el registro.' });
                }
                yield database_1.default.query(`
        UPDATE et_titulos SET nombre = $1, id_nivel = $2 WHERE id = $3
        `, [nombre, id_nivel, id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'et_titulos',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: `{nombre: ${nombre}, id_nivel: ${id_nivel}}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                // FINALIZAR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al actualizar el registro.' });
            }
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, id_nivel, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                yield database_1.default.query(`
        INSERT INTO et_titulos (nombre, id_nivel) VALUES ($1, $2)
        `, [nombre, id_nivel]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'et_titulos',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{nombre: ${nombre}, id_nivel: ${id_nivel}}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.jsonp({ message: 'Título guardado' });
            }
            catch (error) {
                // FINALIZAR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'Error al guardar el título.' });
            }
        });
    }
    // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR
    RevisarDatos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
            let separador = path_1.default.sep;
            let ruta = (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)() + separador + documento;
            const workbook = xlsx_1.default.readFile(ruta);
            let verificador = (0, accesoCarpetas_1.ObtenerIndicePlantilla)(workbook, 'TITULOS');
            if (verificador === false) {
                return res.jsonp({ message: 'no_existe', data: undefined });
            }
            else {
                const sheet_name_list = workbook.SheetNames;
                const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[verificador]]);
                let data = {
                    fila: '',
                    titulo: '',
                    nivel: '',
                    observacion: ''
                };
                var listTitulosProfesionales = [];
                var duplicados = [];
                var mensaje = 'correcto';
                // LECTURA DE LOS DATOS DE LA PLANTILLA
                plantilla.forEach((dato) => __awaiter(this, void 0, void 0, function* () {
                    var { NOMBRE, NIVEL } = dato;
                    data.fila = dato.ITEM;
                    data.titulo = dato.NOMBRE;
                    data.nivel = dato.NIVEL;
                    if ((data.fila != undefined && data.fila != '') &&
                        (data.titulo != undefined && data.titulo != '') &&
                        (data.nivel != undefined && data.nivel != '')) {
                        // VALIDAR PRIMERO QUE EXISTA NIVELES EN LA TABLA NIVELES
                        const existe_nivel = yield database_1.default.query(`
            SELECT id FROM et_cat_nivel_titulo WHERE UPPER(nombre) = UPPER($1)
            `, [NIVEL]);
                        var id_nivel = existe_nivel.rows[0];
                        if (id_nivel != undefined && id_nivel != '') {
                            // VERIFICACION SI EL TITULO NO ESTE REGISTRADO EN EL SISTEMA
                            const VERIFICAR_Titulos = yield database_1.default.query(`
              SELECT * FROM et_titulos
              WHERE UPPER(nombre) = UPPER($1) AND id_nivel = $2
              `, [NOMBRE, id_nivel.id]);
                            if (VERIFICAR_Titulos.rowCount == 0) {
                                data.fila = dato.ITEM;
                                data.titulo = dato.NOMBRE;
                                data.nivel = dato.NIVEL;
                                if (duplicados.find((p) => p.NOMBRE.toLowerCase() === dato.NOMBRE.toLowerCase() &&
                                    p.NIVEL.toLowerCase() === dato.NIVEL.toLowerCase()) == undefined) {
                                    data.observacion = 'ok';
                                    duplicados.push(dato);
                                }
                                listTitulosProfesionales.push(data);
                            }
                            else {
                                data.fila = dato.ITEM;
                                data.titulo = NOMBRE;
                                data.nivel = NIVEL;
                                data.observacion = 'Ya existe en el sistema';
                                listTitulosProfesionales.push(data);
                            }
                        }
                        else {
                            data.fila = dato.ITEM;
                            data.titulo = dato.NOMBRE;
                            data.nivel = dato.NIVEL;
                            if (data.nivel == '' || data.nivel == undefined) {
                                data.nivel = 'No registrado';
                                data.observacion = 'Nivel no registrado';
                            }
                            data.observacion = 'Nivel no existe en el sistema';
                            listTitulosProfesionales.push(data);
                        }
                    }
                    else {
                        data.fila = dato.ITEM;
                        data.titulo = dato.NOMBRE;
                        data.nivel = dato.NIVEL;
                        if (data.fila == '' || data.fila == undefined) {
                            data.fila = 'error';
                            mensaje = 'error';
                        }
                        if (data.titulo == '' || data.titulo == undefined) {
                            data.titulo = 'No registrado';
                            data.observacion = 'Título no registrado';
                        }
                        if (data.nivel == '' || data.nivel == undefined) {
                            data.nivel = 'No registrado';
                            data.observacion = 'Nivel no registrado';
                        }
                        if ((data.titulo == '' || data.titulo == undefined) && (data.nivel == '' || data.nivel == undefined)) {
                            data.observacion = 'Título y Nivel no registrado';
                        }
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
                    listTitulosProfesionales.sort((a, b) => {
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
                    listTitulosProfesionales.forEach((item) => {
                        if (item.observacion == undefined || item.observacion == null || item.observacion == '') {
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
                    });
                    if (mensaje == 'error') {
                        listTitulosProfesionales = undefined;
                    }
                    return res.jsonp({ message: mensaje, data: listTitulosProfesionales });
                }, 1500);
            }
        });
    }
}
exports.TITULO_CONTROLADOR = new TituloControlador();
exports.default = exports.TITULO_CONTROLADOR;
