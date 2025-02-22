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
exports.GRADO_CONTROLADOR = void 0;
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
const auditoriaControlador_1 = __importDefault(require("../../reportes/auditoriaControlador"));
const database_1 = __importDefault(require("../../../database"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const exceljs_1 = __importDefault(require("exceljs"));
class GradoControlador {
    // METODO PARA BUSCAR LISTA DE GRADOS **USADO 
    listaGrados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const GRADOS = yield database_1.default.query(`
        SELECT g.id, g.descripcion FROM map_cat_grado AS g
        ORDER BY g.id DESC
        `);
                res.jsonp(GRADOS.rows);
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'Error al optener los grados' });
            }
        });
    }
    // METODO PARA BUSCAR EL GRADO POR EL ID DEL EMPLEADO **USADO 
    GradoByEmple(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            console.log('req.params: ', req.params);
            const EMPLEADO_GRADO = yield database_1.default.query(`
      SELECT eg.id, eg.id_grado, eg.estado, cg.descripcion AS grado 
      FROM map_empleado_grado AS eg, map_cat_grado AS cg
      WHERE eg.id_empleado = $1 AND eg.id_grado = cg.id
      `, [id_empleado]);
            if (EMPLEADO_GRADO.rowCount != 0) {
                return res.status(200).jsonp({ grados: EMPLEADO_GRADO.rows, text: 'correcto', status: 200 });
            }
            res.status(404).jsonp({ grados: undefined, text: 'Registro no encontrado.', status: 400 });
        });
    }
    // METODO PARA INSERTAR EL GRADO **USADO 
    IngresarGrados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { grado, user_name, ip, ip_local } = req.body;
            try {
                const GRADOS = yield database_1.default.query(`
          SELECT g.id, g.descripcion FROM map_cat_grado AS g
          WHERE UPPER(g.descripcion) = UPPER($1)
          `, [grado]);
                if (GRADOS.rows[0] != '' && GRADOS.rows[0] != null, GRADOS.rows[0] != undefined) {
                    res.jsonp({ message: 'Ya existe un grado con ese nombre', codigo: 300 });
                }
                else {
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    yield database_1.default.query(`
            INSERT INTO map_cat_grado (descripcion) VALUES ($1)
            `, [grado]);
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_cat_procesos',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: `{"descripcion": "${grado}"}`,
                        ip: ip,
                        ip_local: ip_local,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    res.jsonp({ message: 'El grado ha sido guardado con éxito', codigo: 200 });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'Error al guardar el grado' });
            }
        });
    }
    // METODO PARA EDITAR EL GRADO **USADO 
    EditarGrados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_grado, grado, user_name, ip, ip_local } = req.body;
            try {
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                yield database_1.default.query(`
            UPDATE map_cat_grado SET descripcion = $2 WHERE id = $1
          `, [id_grado, grado]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'map_cat_procesos',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{"id": "${id_grado}"}, {"descripcion": "${grado}"}`,
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.status(200).jsonp({ message: 'El grado ha actualizado con éxito', codigo: 200 });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'Error al actualizar el grado' });
            }
        });
    }
    // METODO PARA ELIMINAR EL GRADO **USADO 
    EliminarGrados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_grado, user_name, ip, ip_local } = req.body;
            console.log('datos a enviar: ', req.body);
            try {
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                yield database_1.default.query(`
            DELETE FROM map_cat_grado WHERE id = $1
          `, [id_grado]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'map_cat_procesos',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{"id": "${id_grado}"}`,
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.status(200).jsonp({ message: 'El grado se ha eliminado con éxito', codigo: 200 });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'Error al eliminar el grado' });
            }
        });
    }
    // METODO PARA ELIMINAR EL GRADO POR EMPLEADO **USADO 
    EliminarEmpleGrado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_name, ip, ip_local } = req.body;
                const id = req.params.id;
                console.log('id: ', id);
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const proceso = yield database_1.default.query('SELECT * FROM map_empleado_grado WHERE id = $1', [id]);
                const [datosOriginales] = proceso.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_empleado_grado',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al eliminar proceso con id: ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                yield database_1.default.query(`
        DELETE FROM map_empleado_grado WHERE id = $1
        `, [id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'map_empleado_grado',
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
                return res.status(200).jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al eliminar registro.' });
            }
        });
    }
    // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR  **USADO
    RevisarDatos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
                let separador = path_1.default.sep;
                let ruta = (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)() + separador + documento;
                const workbook = new exceljs_1.default.Workbook();
                yield workbook.xlsx.readFile(ruta);
                let verificador = (0, accesoCarpetas_1.ObtenerIndicePlantilla)(workbook, 'GRADO');
                if (verificador === false) {
                    return res.jsonp({ message: 'no_existe', data: undefined });
                }
                else {
                    const sheet_name_list = workbook.worksheets.map(sheet => sheet.name);
                    const plantilla = workbook.getWorksheet(sheet_name_list[verificador]);
                    let data = {
                        fila: '',
                        descripcion: '',
                        observacion: ''
                    };
                    var listaGrados = [];
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
                        if (!headers['ITEM'] || !headers['DESCRIPCION']) {
                            return res.jsonp({ message: 'Cabeceras faltantes', data: undefined });
                        }
                        // LECTURA DE LOS DATOS DE LA PLANTILLA
                        plantilla.eachRow((row, rowNumber) => {
                            var _a;
                            // SALTAR LA FILA DE LAS CABECERAS
                            if (rowNumber === 1)
                                return;
                            // LEER LOS DATOS SEGUN LAS COLUMNAS ENCONTRADAS
                            const ITEM = row.getCell(headers['ITEM']).value;
                            const DESCRIPCION = (_a = row.getCell(headers['DESCRIPCION']).value) === null || _a === void 0 ? void 0 : _a.toString().trim();
                            // VERIFICAR QUE EL REGISTO NO TENGA DATOS VACIOS
                            if ((ITEM != undefined && ITEM != '') &&
                                (DESCRIPCION != undefined && DESCRIPCION != '')) {
                                data.fila = ITEM;
                                data.descripcion = DESCRIPCION;
                                data.observacion = 'no registrado';
                                //USAMOS TRIM PARA ELIMINAR LOS ESPACIOS AL INICIO Y AL FINAL EN BLANCO.
                                data.descripcion = data.descripcion.trim();
                                listaGrados.push(data);
                            }
                            else {
                                data.fila = ITEM;
                                data.descripcion = DESCRIPCION;
                                data.observacion = 'no registrado';
                                if (data.fila == '' || data.fila == undefined) {
                                    data.fila = 'error';
                                    mensaje = 'error';
                                }
                                if (DESCRIPCION == undefined) {
                                    data.descripcion = 'No registrado';
                                    data.observacion = 'Grado ' + data.observacion;
                                }
                                //USAMOS TRIM PARA ELIMINAR LOS ESPACIOS AL INICIO Y AL FINAL EN BLANCO.
                                data.descripcion = data.descripcion.trim();
                                listaGrados.push(data);
                            }
                            data = {};
                        });
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
                    // VALIDACINES DE LOS DATOS DE LA PLANTILLA
                    listaGrados.forEach((item, index) => __awaiter(this, void 0, void 0, function* () {
                        if (item.observacion == 'no registrado') {
                            const VERIFICAR_PROCESO = yield database_1.default.query(`
                        SELECT g.id, g.descripcion FROM map_cat_grado AS g
                        WHERE UPPER(g.descripcion) = UPPER($1)
                      `, [item.descripcion]);
                            if (VERIFICAR_PROCESO.rowCount === 0) {
                                // DISCRIMINACION DE ELEMENTOS IGUALES
                                if (duplicados.find((p) => (p.descripcion.toLowerCase() === item.descripcion.toLowerCase())
                                //|| (p.proceso.toLowerCase() === item.proceso_padre.toLowerCase() && p.proceso.toLowerCase() === item.proceso_padre.toLowerCase())
                                ) == undefined) {
                                    duplicados.push(item);
                                }
                                else {
                                    item.observacion = '1';
                                }
                            }
                            else {
                                item.observacion = 'Ya existe el grado en el sistema';
                            }
                        }
                    }));
                    setTimeout(() => {
                        listaGrados.sort((a, b) => {
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
                        listaGrados.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                            if (item.observacion == '1') {
                                item.observacion = 'Registro duplicado';
                            }
                            else if (item.observacion == 'no registrado') {
                                item.observacion = 'ok';
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
                            listaGrados = undefined;
                        }
                        return res.jsonp({ message: mensaje, data: listaGrados });
                    }, 1000);
                }
            }
            catch (error) {
                return res.status(500).jsonp({ message: 'Error con el servidor método RevisarDatos.', status: '500' });
            }
        });
    }
    // REGISTRAR PLANTILLA GRADO   **USADO 
    CargarPlantilla(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { plantilla, user_name, ip, ip_local } = req.body;
            let error = false;
            for (const item of plantilla) {
                const { descripcion } = item;
                try {
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    const response = yield database_1.default.query(`
          INSERT INTO map_cat_grado (descripcion) VALUES ($1) RETURNING *
          `, [descripcion]);
                    const [gradoIn] = response.rows;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_cat_grado',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: JSON.stringify(gradoIn),
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
    // REGISTRAR PROCESOS POR MEDIO DE INTERFAZ
    RegistrarGrados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_grado, listaUsuarios, user_name, ip, ip_local } = req.body;
            let error = false;
            try {
                for (const item of listaUsuarios) {
                    const { id_empleado } = item;
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    const response = yield database_1.default.query(`
            SELECT * FROM map_empleado_grado WHERE id_grado = $1 and id_empleado = $2
           `, [id_grado, id_empleado]);
                    const [grados] = response.rows;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_empleado_grado',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: JSON.stringify(grados),
                        ip: ip,
                        ip_local: ip_local,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    console.log('grados: ', grados);
                    if (grados == undefined || grados == '' || grados == null) {
                        // INICIAR TRANSACCION
                        yield database_1.default.query('BEGIN');
                        const response = yield database_1.default.query(`
            SELECT * FROM map_empleado_grado WHERE id_empleado = $1 and estado = true
           `, [id_empleado]);
                        const [grado_activo] = response.rows;
                        // AUDITORIA
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'map_empleado_grado',
                            usuario: user_name,
                            accion: 'I',
                            datosOriginales: '',
                            datosNuevos: JSON.stringify(grado_activo),
                            ip: ip,
                            ip_local: ip_local,
                            observacion: null
                        });
                        // FINALIZAR TRANSACCION
                        yield database_1.default.query('COMMIT');
                        console.log('grado_activo: ', grado_activo);
                        if (grado_activo == undefined || grado_activo == '' || grado_activo == null) {
                            // INICIAR TRANSACCION
                            yield database_1.default.query('BEGIN');
                            const responsee = yield database_1.default.query(`
              INSERT INTO map_empleado_grado (id_empleado, id_grado, estado) VALUES ($1, $2, $3) RETURNING *
              `, [id_empleado, id_grado, true]);
                            const [grado_insert] = responsee.rows;
                            // AUDITORIA
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'map_empleado_grado',
                                usuario: user_name,
                                accion: 'I',
                                datosOriginales: '',
                                datosNuevos: JSON.stringify(grado_insert),
                                ip: ip,
                                ip_local: ip_local,
                                observacion: null
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                        }
                        else {
                            // INICIAR TRANSACCION
                            yield database_1.default.query('BEGIN');
                            const grado_update = yield database_1.default.query(`
              UPDATE map_empleado_grado SET estado = false WHERE id = $1
              `, [grado_activo.id]);
                            const [grado_UPD] = grado_update.rows;
                            // AUDITORIA
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'map_empleado_grado',
                                usuario: user_name,
                                accion: 'I',
                                datosOriginales: '',
                                datosNuevos: JSON.stringify(grado_UPD),
                                ip: ip,
                                ip_local: ip_local,
                                observacion: null
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                            // INICIAR TRANSACCION
                            yield database_1.default.query('BEGIN');
                            const response = yield database_1.default.query(`
               INSERT INTO map_empleado_grado (id_empleado, id_grado, estado) VALUES ($1, $2, $3) RETURNING *
              `, [id_empleado, id_grado, true]);
                            const [nuevo_grado] = response.rows;
                            // AUDITORIA
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'map_empleado_grado',
                                usuario: user_name,
                                accion: 'I',
                                datosOriginales: '',
                                datosNuevos: JSON.stringify(nuevo_grado),
                                ip: ip,
                                ip_local: ip_local,
                                observacion: null
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                        }
                    }
                    else {
                        console.log('proceso: ', grados.estado);
                        if (grados.estado == false) {
                            // INICIAR TRANSACCION
                            yield database_1.default.query('BEGIN');
                            const response = yield database_1.default.query(`
            SELECT * FROM map_empleado_grado WHERE id_empleado = $1 and estado = true
           `, [id_empleado]);
                            const [grado_activo1] = response.rows;
                            // AUDITORIA
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'map_empleado_grado',
                                usuario: user_name,
                                accion: 'I',
                                datosOriginales: '',
                                datosNuevos: JSON.stringify(grado_activo1),
                                ip: ip,
                                ip_local: ip_local,
                                observacion: null
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                            // INICIAR TRANSACCION
                            yield database_1.default.query('BEGIN');
                            const proceso_update = yield database_1.default.query(`
              UPDATE map_empleado_grado SET estado = true WHERE id = $1
              `, [grados.id]);
                            const [grado_UPD] = proceso_update.rows;
                            // AUDITORIA
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'map_empleado_grado',
                                usuario: user_name,
                                accion: 'I',
                                datosOriginales: '',
                                datosNuevos: JSON.stringify(grado_UPD),
                                ip: ip,
                                ip_local: ip_local,
                                observacion: null
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                            // INICIAR TRANSACCION
                            yield database_1.default.query('BEGIN');
                            const proceso_update1 = yield database_1.default.query(`
              UPDATE map_empleado_grado SET estado = false WHERE id = $1
              `, [grado_activo1.id]);
                            const [grado_UPD1] = proceso_update1.rows;
                            // AUDITORIA
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'map_empleado_grado',
                                usuario: user_name,
                                accion: 'I',
                                datosOriginales: '',
                                datosNuevos: JSON.stringify(grado_UPD1),
                                ip: ip,
                                ip_local: ip_local,
                                observacion: null
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                        }
                    }
                }
                return res.status(200).jsonp({ message: 'Registro de grados' });
            }
            catch (_a) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                error = true;
                if (error) {
                    return res.status(500).jsonp({ message: 'error' });
                }
            }
        });
    }
    // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DE EMPLEADOS PROCESOS DENTRO DEL SISTEMA - MENSAJE DE CADA ERROR **USADO
    RevisarPantillaEmpleadoGrado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
                let separador = path_1.default.sep;
                let ruta = (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)() + separador + documento;
                const workbook = new exceljs_1.default.Workbook();
                yield workbook.xlsx.readFile(ruta);
                let verificador = (0, accesoCarpetas_1.ObtenerIndicePlantilla)(workbook, 'EMPLEADO_GRADO');
                if (verificador === false) {
                    return res.jsonp({ message: 'no_existe', data: undefined });
                }
                else {
                    const sheet_name_list = workbook.worksheets.map(sheet => sheet.name);
                    const plantilla = workbook.getWorksheet(sheet_name_list[verificador]);
                    let data = {
                        fila: '',
                        nombre: '',
                        apellido: '',
                        cedula: '',
                        grado: '',
                        observacion: ''
                    };
                    var listaGrados = [];
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
                        if (!headers['ITEM'] || !headers['NOMBRE'] || !headers['APELLIDO'] ||
                            !headers['CEDULA'] || !headers['GRADO']) {
                            return res.jsonp({ message: 'Cabeceras faltantes', data: undefined });
                        }
                        // LECTURA DE LOS DATOS DE LA PLANTILLA
                        plantilla.eachRow((row, rowNumber) => {
                            var _a, _b, _c, _d;
                            // SALTAR LA FILA DE LAS CABECERAS
                            if (rowNumber === 1)
                                return;
                            // LEER LOS DATOS SEGUN LAS COLUMNAS ENCONTRADAS
                            const ITEM = row.getCell(headers['ITEM']).value;
                            const NOMBRE = (_a = row.getCell(headers['NOMBRE']).value) === null || _a === void 0 ? void 0 : _a.toString().trim();
                            const APELLIDO = (_b = row.getCell(headers['APELLIDO']).value) === null || _b === void 0 ? void 0 : _b.toString().trim();
                            const CEDULA = (_c = row.getCell(headers['CEDULA']).value) === null || _c === void 0 ? void 0 : _c.toString().trim();
                            const GRADO = (_d = row.getCell(headers['GRADO']).value) === null || _d === void 0 ? void 0 : _d.toString().trim();
                            // VERIFICAR QUE EL REGISTO NO TENGA DATOS VACIOS
                            if ((ITEM != undefined && ITEM != '') &&
                                (NOMBRE != undefined && NOMBRE != '') &&
                                (APELLIDO != undefined && APELLIDO != '') &&
                                (CEDULA != undefined && CEDULA != '') &&
                                (GRADO != undefined && GRADO != '')) {
                                data.fila = ITEM;
                                data.nombre = NOMBRE;
                                data.apellido = APELLIDO;
                                data.cedula = CEDULA;
                                data.grado = GRADO;
                                data.observacion = 'no registrado';
                                listaGrados.push(data);
                            }
                            else {
                                data.fila = ITEM;
                                data.nombre = NOMBRE;
                                data.apellido = APELLIDO;
                                data.cedula = CEDULA;
                                data.grado = GRADO;
                                data.observacion = 'no registrado';
                                if (data.fila == '' || data.fila == undefined) {
                                    data.fila = 'error';
                                    mensaje = 'error';
                                }
                                if (NOMBRE == undefined) {
                                    data.nombre = '-';
                                }
                                if (APELLIDO == undefined) {
                                    data.apellido = '-';
                                }
                                if (CEDULA == undefined) {
                                    data.cedula = 'No registrado';
                                    data.observacion = 'Cedula ' + data.observacion;
                                }
                                if (GRADO == undefined) {
                                    data.grado = 'No registrado';
                                    data.observacion = 'Proceso ' + data.observacion;
                                }
                                listaGrados.push(data);
                            }
                            data = {};
                        });
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
                    // VALIDACINES DE LOS DATOS DE LA PLANTILLA
                    listaGrados.forEach((item, index) => __awaiter(this, void 0, void 0, function* () {
                        if (item.observacion == 'no registrado') {
                            const VERIFICAR_IDEMPLEADO = yield database_1.default.query(`
              SELECT id FROM eu_empleados WHERE cedula = $1
              `, [item.cedula.trim()]);
                            if (VERIFICAR_IDEMPLEADO.rows[0] != undefined) {
                                let id_empleado = VERIFICAR_IDEMPLEADO.rows[0].id;
                                const VERIFICAR_IDGRADO = yield database_1.default.query(`
                SELECT id FROM map_cat_grado WHERE UPPER(descripcion) = UPPER($1)
                `, [item.grado.trim()]);
                                if (VERIFICAR_IDGRADO.rows[0] != undefined) {
                                    let id_grado = VERIFICAR_IDGRADO.rows[0].id;
                                    const response = yield database_1.default.query(`
                   SELECT * FROM map_empleado_grado WHERE id_grado = $1 and id_empleado = $2 and estado = true
                  `, [id_grado, id_empleado]);
                                    const [grado_emple] = response.rows;
                                    console.log('grado_emple: ', grado_emple);
                                    if (grado_emple != undefined && grado_emple != '' && grado_emple != null) {
                                        item.observacion = 'Ya existe un registro activo con este usuario y grado';
                                    }
                                    else {
                                        if (item.observacion == 'no registrado') {
                                            // DISCRIMINACION DE ELEMENTOS IGUALES
                                            if (duplicados.find((p) => (p.cedula.trim() === item.cedula.trim())) == undefined) {
                                                duplicados.push(item);
                                            }
                                            else {
                                                item.observacion = '1';
                                            }
                                        }
                                    }
                                }
                                else {
                                    item.observacion = 'Proceso ingresado no esta registrado en el sistema';
                                }
                            }
                            else {
                                item.observacion = 'La cedula ingresada no esta registrada en el sistema';
                            }
                        }
                    }));
                    setTimeout(() => {
                        listaGrados.sort((a, b) => {
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
                        listaGrados.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                            if (item.observacion == '1') {
                                item.observacion = 'Registro duplicado';
                            }
                            else if (item.observacion == 'no registrado') {
                                item.observacion = 'ok';
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
                            listaGrados = undefined;
                        }
                        return res.jsonp({ message: mensaje, data: listaGrados });
                    }, 1000);
                }
            }
            catch (error) {
                return res.status(500).jsonp({ message: 'Error con el servidor método RevisarDatos.', status: '500' });
            }
        });
    }
    // METODO PARA REGISTRAR EMPLEADOS PROCESO POR MEDIO DE PLANTILLA
    RegistrarEmpleadoGrado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { plantilla, user_name, ip, ip_local } = req.body;
            let error = false;
            try {
                for (const item of plantilla) {
                    const { cedula, grado } = item;
                    yield database_1.default.query('BEGIN');
                    const VERIFICAR_IDGRADO = yield database_1.default.query(`
          SELECT id FROM map_cat_grado WHERE UPPER(descripcion) = UPPER($1)
          `, [grado]);
                    console.log('VERIFICAR_IDGRADO.rows[0].id: ', VERIFICAR_IDGRADO.rows[0].id);
                    const id_grado = VERIFICAR_IDGRADO.rows[0].id;
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    yield database_1.default.query('BEGIN');
                    const VERIFICAR_IDEMPLEADO = yield database_1.default.query(`
          SELECT id FROM eu_empleados WHERE cedula = $1
          `, [cedula.trim()]);
                    const id_empleado = VERIFICAR_IDEMPLEADO.rows[0].id;
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    const response = yield database_1.default.query(`
            SELECT * FROM map_empleado_grado WHERE id_grado = $1 and id_empleado = $2
           `, [id_grado, id_empleado]);
                    const [grados] = response.rows;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_empleado_grado',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: JSON.stringify(grados),
                        ip: ip,
                        ip_local: ip_local,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    if (grados == undefined || grados == '' || grados == null) {
                        // INICIAR TRANSACCION
                        yield database_1.default.query('BEGIN');
                        const response = yield database_1.default.query(`
            SELECT * FROM map_empleado_grado WHERE id_empleado = $1 and estado = true
           `, [id_empleado]);
                        const [grado_activo] = response.rows;
                        // AUDITORIA
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'map_empleado_grado',
                            usuario: user_name,
                            accion: 'I',
                            datosOriginales: '',
                            datosNuevos: JSON.stringify(grado_activo),
                            ip: ip,
                            ip_local: ip_local,
                            observacion: null
                        });
                        // FINALIZAR TRANSACCION
                        yield database_1.default.query('COMMIT');
                        if (grado_activo == undefined || grado_activo == '' || grado_activo == null) {
                            // INICIAR TRANSACCION
                            yield database_1.default.query('BEGIN');
                            const responsee = yield database_1.default.query(`
              INSERT INTO map_empleado_grado (id_grado, id_empleado, estado) VALUES ($1, $2, $3) RETURNING *
              `, [id_grado, id_empleado, true]);
                            const [grado_insert] = responsee.rows;
                            // AUDITORIA
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'map_empleado_grado',
                                usuario: user_name,
                                accion: 'I',
                                datosOriginales: '',
                                datosNuevos: JSON.stringify(grado_insert),
                                ip: ip,
                                ip_local: ip_local,
                                observacion: null
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                        }
                        else {
                            // INICIAR TRANSACCION
                            yield database_1.default.query('BEGIN');
                            const grado_update = yield database_1.default.query(`
              UPDATE map_empleado_grado SET estado = false WHERE id = $1
              `, [grado_activo.id]);
                            const [grado_UPD] = grado_update.rows;
                            // AUDITORIA
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'map_empleado_grado',
                                usuario: user_name,
                                accion: 'I',
                                datosOriginales: '',
                                datosNuevos: JSON.stringify(grado_UPD),
                                ip: ip,
                                ip_local: ip_local,
                                observacion: null
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                            // INICIAR TRANSACCION
                            yield database_1.default.query('BEGIN');
                            const response = yield database_1.default.query(`
               INSERT INTO map_empleado_grado (id_grado, id_empleado, estado) VALUES ($1, $2, $3) RETURNING *
              `, [id_grado, id_empleado, true]);
                            const [nuevo_proceso] = response.rows;
                            // AUDITORIA
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'map_empleado_grado',
                                usuario: user_name,
                                accion: 'I',
                                datosOriginales: '',
                                datosNuevos: JSON.stringify(nuevo_proceso),
                                ip: ip,
                                ip_local: ip_local,
                                observacion: null
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                        }
                    }
                    else {
                        console.log('proceso: ', grados.estado);
                        if (grados.estado == false) {
                            // INICIAR TRANSACCION
                            yield database_1.default.query('BEGIN');
                            const response = yield database_1.default.query(`
                SELECT * FROM map_empleado_grado WHERE id_empleado = $1 and estado = true
              `, [id_empleado]);
                            const [grado_activo1] = response.rows;
                            // AUDITORIA
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'map_empleado_grado',
                                usuario: user_name,
                                accion: 'I',
                                datosOriginales: '',
                                datosNuevos: JSON.stringify(grado_activo1),
                                ip: ip,
                                ip_local: ip_local,
                                observacion: null
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                            // INICIAR TRANSACCION
                            yield database_1.default.query('BEGIN');
                            const grado_update = yield database_1.default.query(`
              UPDATE map_empleado_grado SET estado = true WHERE id = $1
              `, [grados.id]);
                            const [grados_UPD] = grado_update.rows;
                            // AUDITORIA
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'map_empleado_procesos',
                                usuario: user_name,
                                accion: 'I',
                                datosOriginales: '',
                                datosNuevos: JSON.stringify(grados_UPD),
                                ip: ip,
                                ip_local: ip_local,
                                observacion: null
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                            // INICIAR TRANSACCION
                            yield database_1.default.query('BEGIN');
                            const grados_update1 = yield database_1.default.query(`
              UPDATE map_empleado_procesos SET estado = false WHERE id = $1
              `, [grado_activo1.id]);
                            const [proceso_UPD1] = grado_update.rows;
                            // AUDITORIA
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'map_empleado_procesos',
                                usuario: user_name,
                                accion: 'I',
                                datosOriginales: '',
                                datosNuevos: JSON.stringify(proceso_UPD1),
                                ip: ip,
                                ip_local: ip_local,
                                observacion: null
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                        }
                    }
                }
                return res.status(200).jsonp({ message: 'Registro de grados' });
            }
            catch (_a) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                error = true;
                if (error) {
                    return res.status(500).jsonp({ message: 'error' });
                }
            }
        });
    }
}
exports.GRADO_CONTROLADOR = new GradoControlador();
exports.default = exports.GRADO_CONTROLADOR;
