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
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
const auditoriaControlador_1 = __importDefault(require("../../reportes/auditoriaControlador"));
const exceljs_1 = __importDefault(require("exceljs"));
const database_1 = __importDefault(require("../../../database"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class TituloControlador {
    // METODO PARA LISTAR TITULOS   **USADO
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
    // METODO PARA BUSCAR UN TITULO POR SU NOMBRE    **USADO
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
    // METODO PARA ELIMINAR REGISTROS    **USADO
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_name, ip, ip_local } = req.body;
                const id = req.params.id;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const rol = yield database_1.default.query(`SELECT * FROM et_titulos WHERE id = $1`, [id]);
                const [datosOriginales] = rol.rows;
                if (!datosOriginales) {
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'et_titulos',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
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
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                // FINALIZAR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA ACTUALIZAR REGISTRO   **USADO
    ActualizarTitulo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, id_nivel, id, user_name, ip, ip_local } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const rol = yield database_1.default.query(`SELECT * FROM et_titulos WHERE id = $1`, [id]);
                const [datosOriginales] = rol.rows;
                if (!datosOriginales) {
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'et_titulos',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al actualizar el título con id ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Error al actualizar el registro.' });
                }
                const datosNuevos = yield database_1.default.query(`
        UPDATE et_titulos SET nombre = $1, id_nivel = $2 WHERE id = $3 RETURNING *
        `, [nombre, id_nivel, id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'et_titulos',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(datosNuevos.rows[0]),
                    ip: ip,
                    ip_local: ip_local,
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
    // METODO PARA REGISTRAR TITULO   **USADO
    CrearTitulo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, id_nivel, user_name, ip, ip_local } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const datosNuevos = yield database_1.default.query(`
        INSERT INTO et_titulos (nombre, id_nivel) VALUES ($1, $2) RETURNING *
        `, [nombre, id_nivel]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'et_titulos',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(datosNuevos.rows[0]),
                    ip: ip,
                    ip_local: ip_local,
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
    // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR    **USADO
    RevisarDatos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
            let separador = path_1.default.sep;
            let ruta = (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)() + separador + documento;
            const workbook = new exceljs_1.default.Workbook();
            yield workbook.xlsx.readFile(ruta);
            let verificador = (0, accesoCarpetas_1.ObtenerIndicePlantilla)(workbook, 'TITULOS');
            if (verificador === false) {
                return res.jsonp({ message: 'no_existe', data: undefined });
            }
            else {
                const sheet_name_list = workbook.worksheets.map(sheet => sheet.name);
                const plantilla = workbook.getWorksheet(sheet_name_list[verificador]);
                let data = {
                    fila: '',
                    titulo: '',
                    nivel: '',
                    observacion: ''
                };
                var listTitulosProfesionales = [];
                var duplicados = [];
                var mensaje = 'correcto';
                if (plantilla) {
                    // SUPONIENDO QUE LA PRIMERA FILA SON LAS CABECERAS
                    const headerRow = plantilla.getRow(1);
                    const headers = {};
                    // CREAR UN MAPA CON LAS CABECERAS Y SUS POSICIONES, ASEGURANDO QUE LAS CLAVES ESTEN EN MAYUSCULAS
                    headerRow.eachCell((cell, colNumber) => {
                        headers[cell.value.toString().toUpperCase()] = colNumber;
                    });
                    // VERIFICA SI LAS CABECERAS ESENCIALES ESTAN PRESENTES
                    if (!headers['ITEM'] || !headers['NOMBRE'] || !headers['NIVEL']) {
                        return res.jsonp({ message: 'Cabeceras faltantes', data: undefined });
                    }
                    // LECTURA DE LOS DATOS DE LA PLANTILLA
                    plantilla.eachRow((row, rowNumber) => __awaiter(this, void 0, void 0, function* () {
                        // SALTAR LA FILA DE LAS CABECERAS
                        if (rowNumber === 1)
                            return;
                        // LEER LOS DATOS SEGUN LAS COLUMNAS ENCONTRADAS
                        const ITEM = row.getCell(headers['ITEM']).value;
                        const NOMBRE = row.getCell(headers['NOMBRE']).value;
                        const NIVEL = row.getCell(headers['NIVEL']).value;
                        const dato = {
                            ITEM: ITEM,
                            NOMBRE: NOMBRE,
                            NIVEL: NIVEL,
                        };
                        data.fila = ITEM;
                        data.titulo = NOMBRE;
                        data.nivel = NIVEL;
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
                                    data.fila = ITEM;
                                    data.titulo = NOMBRE;
                                    data.nivel = NIVEL;
                                    if (duplicados.find((p) => p.NOMBRE.toLowerCase() === data.titulo.toLowerCase() &&
                                        p.NIVEL.toLowerCase() === data.nivel.toLowerCase()) == undefined) {
                                        data.observacion = 'ok';
                                        duplicados.push(dato);
                                    }
                                    //USAMOS TRIM PARA ELIMINAR LOS ESPACIOS AL INICIO Y AL FINAL EN BLANCO.
                                    data.titulo = data.titulo.trim();
                                    data.nivel = data.nivel.trim();
                                    listTitulosProfesionales.push(data);
                                }
                                else {
                                    data.fila = ITEM;
                                    data.titulo = NOMBRE;
                                    data.nivel = NIVEL;
                                    data.observacion = 'Ya existe en el sistema';
                                    //USAMOS TRIM PARA ELIMINAR LOS ESPACIOS AL INICIO Y AL FINAL EN BLANCO.
                                    data.titulo = data.titulo.trim();
                                    data.nivel = data.nivel.trim();
                                    listTitulosProfesionales.push(data);
                                }
                            }
                            else {
                                data.fila = ITEM;
                                data.titulo = NOMBRE;
                                data.nivel = NIVEL;
                                if (data.nivel == '' || data.nivel == undefined) {
                                    data.nivel = 'No registrado';
                                    data.observacion = 'Nivel no registrado';
                                }
                                data.observacion = 'Nivel no existe en el sistema';
                                //USAMOS TRIM PARA ELIMINAR LOS ESPACIOS AL INICIO Y AL FINAL EN BLANCO.
                                data.titulo = data.titulo.trim();
                                data.nivel = data.nivel.trim();
                                listTitulosProfesionales.push(data);
                            }
                        }
                        else {
                            data.fila = ITEM;
                            data.titulo = NOMBRE;
                            data.nivel = NIVEL;
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
                            //USAMOS TRIM PARA ELIMINAR LOS ESPACIOS AL INICIO Y AL FINAL EN BLANCO.
                            data.titulo = data.titulo.trim();
                            data.nivel = data.nivel.trim();
                            listTitulosProfesionales.push(data);
                        }
                        data = {};
                    }));
                }
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
    // METODO PARA REGISTRAR LOS TITULOS DE LA PLANTILLA   **USADO
    RegistrarTitulosPlantilla(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { titulos, user_name, ip, ip_local } = req.body;
            let error = false;
            for (const titulo of titulos) {
                const { nombre, id_nivel } = titulo;
                try {
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    const datosNuevos = yield database_1.default.query(`
          INSERT INTO et_titulos (nombre, id_nivel) VALUES ($1, $2) RETURNING *
          `, [nombre, id_nivel]);
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'et_titulos',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: JSON.stringify(datosNuevos.rows[0]),
                        ip: ip,
                        ip_local: ip_local,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                }
                catch (error) {
                    // REVERTIR TRANSACCION
                    yield database_1.default.query('ROLLBACK');
                    error = true;
                }
            }
            if (error) {
                return res.status(500).jsonp({ message: 'error' });
            }
            return res.status(200).jsonp({ message: 'ok' });
        });
    }
}
exports.TITULO_CONTROLADOR = new TituloControlador();
exports.default = exports.TITULO_CONTROLADOR;
