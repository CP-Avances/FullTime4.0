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
exports.PROCESOS_CONTROLADOR = void 0;
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
const auditoriaControlador_1 = __importDefault(require("../../reportes/auditoriaControlador"));
const database_1 = __importDefault(require("../../../database"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const exceljs_1 = __importDefault(require("exceljs"));
class ProcesoControlador {
    // METODO PARA BUSCAR LISTA DE PROCESOS
    ListarProcesos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const SIN_PROCESO_SUPERIOR = yield database_1.default.query(`
      SELECT p.id, p.nombre, p.proceso_padre AS proc_padre FROM map_cat_procesos AS p 
      WHERE p.proceso_padre IS NULL 
      ORDER BY p.nombre ASC
      `);
            const CON_PROCESO_SUPERIOR = yield database_1.default.query(`
      SELECT p.id, p.nombre, nom_p.nombre AS proc_padre 
      FROM map_cat_procesos AS p, nombreprocesos AS nom_p 
      WHERE p.proceso_padre = nom_p.id 
      ORDER BY p.nombre ASC
      `);
            SIN_PROCESO_SUPERIOR.rows.forEach((obj) => {
                CON_PROCESO_SUPERIOR.rows.push(obj);
            });
            res.jsonp(CON_PROCESO_SUPERIOR.rows);
        });
    }
    getOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const unaProvincia = yield database_1.default.query(`
      SELECT * FROM map_cat_procesos WHERE id = $1
      `, [id]);
            if (unaProvincia.rowCount != 0) {
                return res.jsonp(unaProvincia.rows);
            }
            res.status(404).jsonp({ text: 'El proceso no ha sido encontrado.' });
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, proc_padre, user_name, ip, ip_local } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                yield database_1.default.query(`
        INSERT INTO map_cat_procesos (nombre, proceso_padre) VALUES ($1, $2)
        `, [nombre, proc_padre]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'map_cat_procesos',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{"nombre": "${nombre}", "proc_padre": "${proc_padre}"}`,
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.jsonp({ message: 'El departamento ha sido guardado en éxito' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'Error al guardar el departamento' });
            }
        });
    }
    getIdByNombre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.params;
            const unIdProceso = yield database_1.default.query(`
      SELECT id FROM map_cat_procesos WHERE nombre = $1
      `, [nombre]);
            if (unIdProceso != null) {
                return res.jsonp(unIdProceso.rows);
            }
            res.status(404).jsonp({ text: 'Registro no encontrado.' });
        });
    }
    ActualizarProceso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, proc_padre, id, user_name, ip, ip_local } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const proceso = yield database_1.default.query('SELECT * FROM map_cat_procesos WHERE id = $1', [id]);
                const [datosOriginales] = proceso.rows;
                if (!datosOriginales) {
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_cat_procesos',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al actualizar el registro con id: ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'error' });
                }
                yield database_1.default.query(`
        UPDATE map_cat_procesos SET nombre = $1, proceso_padre = $2 WHERE id = $3
        `, [nombre, proc_padre, id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'map_cat_procesos',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: `{"nombre": "${nombre}", "proc_padre": "${proc_padre}"}`,
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'El proceso actualizado exitosamente' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    // METODO PARA ELIMINA PROCESOS   **USADO
    EliminarProceso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { user_name, ip, ip_local } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const proceso = yield database_1.default.query(`
        SELECT * FROM map_cat_procesos WHERE id = $1
        `, [id]);
                const [datosOriginales] = proceso.rows;
                if (!datosOriginales) {
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_cat_procesos',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al eliminar el registro con id: ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                yield database_1.default.query(`
        DELETE FROM map_cat_procesos WHERE id = $1
        `, [id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'map_cat_procesos',
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
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.jsonp({ message: 'error' });
            }
            ;
        });
    }
    // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR    **USADO
    RevisarDatos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
                let separador = path_1.default.sep;
                let ruta = (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)() + separador + documento;
                const workbook = new exceljs_1.default.Workbook();
                yield workbook.xlsx.readFile(ruta);
                let verificador = (0, accesoCarpetas_1.ObtenerIndicePlantilla)(workbook, 'PROCESOS');
                if (verificador === false) {
                    return res.jsonp({ message: 'no_existe', data: undefined });
                }
                else {
                    const sheet_name_list = workbook.worksheets.map(sheet => sheet.name);
                    const plantilla = workbook.getWorksheet(sheet_name_list[verificador]);
                    let data = {
                        fila: '',
                        proceso: '',
                        proceso_padre: '',
                        observacion: ''
                    };
                    var listaProcesos = [];
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
                        if (!headers['ITEM'] || !headers['DESCRIPCION'] || !headers['PROCESO_PADRE']) {
                            return res.jsonp({ message: 'Cabeceras faltantes', data: undefined });
                        }
                        // LECTURA DE LOS DATOS DE LA PLANTILLA
                        plantilla.eachRow((row, rowNumber) => {
                            var _a, _b;
                            // SALTAR LA FILA DE LAS CABECERAS
                            if (rowNumber === 1)
                                return;
                            // LEER LOS DATOS SEGUN LAS COLUMNAS ENCONTRADAS
                            const ITEM = row.getCell(headers['ITEM']).value;
                            const PROCESO = (_a = row.getCell(headers['DESCRIPCION']).value) === null || _a === void 0 ? void 0 : _a.toString().trim();
                            const PROCESO_PADRE = (_b = row.getCell(headers['PROCESO_PADRE']).value) === null || _b === void 0 ? void 0 : _b.toString().trim();
                            // VERIFICAR QUE EL REGISTO NO TENGA DATOS VACIOS
                            if ((ITEM != undefined && ITEM != '') &&
                                (PROCESO != undefined && PROCESO != '') &&
                                (PROCESO_PADRE != undefined && PROCESO_PADRE != '')) {
                                data.fila = ITEM;
                                data.proceso = PROCESO;
                                data.proceso_padre = PROCESO_PADRE;
                                data.observacion = 'no registrado';
                                //USAMOS TRIM PARA ELIMINAR LOS ESPACIOS AL INICIO Y AL FINAL EN BLANCO.
                                data.proceso = data.proceso.trim();
                                listaProcesos.push(data);
                            }
                            else {
                                data.fila = ITEM;
                                data.proceso = PROCESO;
                                data.proceso_padre = PROCESO_PADRE;
                                data.observacion = 'no registrado';
                                if (data.fila == '' || data.fila == undefined) {
                                    data.fila = 'error';
                                    mensaje = 'error';
                                }
                                if (PROCESO == undefined) {
                                    data.proceso = 'No registrado';
                                    data.observacion = 'Proceso ' + data.observacion;
                                }
                                if (PROCESO_PADRE == undefined) {
                                    data.proceso_padre = 'No registrado';
                                }
                                //USAMOS TRIM PARA ELIMINAR LOS ESPACIOS AL INICIO Y AL FINAL EN BLANCO.
                                data.proceso = data.proceso.trim();
                                listaProcesos.push(data);
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
                    listaProcesos.forEach((item, index) => __awaiter(this, void 0, void 0, function* () {
                        if (item.observacion == 'no registrado') {
                            const VERIFICAR_PROCESO = yield database_1.default.query(`
                    SELECT * FROM map_cat_procesos 
                    WHERE UPPER(nombre) = UPPER($1)
                    `, [item.proceso]);
                            if (VERIFICAR_PROCESO.rowCount === 0) {
                                if (item.proceso.toUpperCase() !== item.proceso_padre.toUpperCase()) {
                                    const VERIFICAR_PROCESO_PADRE = yield database_1.default.query(`
                        SELECT * FROM map_cat_procesos 
                        WHERE UPPER(nombre) = UPPER($1)
                        `, [item.proceso_padre]);
                                    var existe_proceso_padre = false;
                                    if (VERIFICAR_PROCESO_PADRE.rowCount !== 0) {
                                        existe_proceso_padre = true;
                                        const procesoPadre = VERIFICAR_PROCESO_PADRE.rows[0].proceso_padre;
                                        if (procesoPadre == item.proceso) {
                                            item.observacion = 'No se puede registrar este proceso con su proceso padre porque no se pueden cruzar los mismo procesos';
                                        }
                                    }
                                    else {
                                        existe_proceso_padre = false;
                                    }
                                    if (item.observacion == 'no registrado') {
                                        // DISCRIMINACION DE ELEMENTOS IGUALES
                                        if (duplicados.find((p) => (p.proceso.toLowerCase() === item.proceso.toLowerCase())
                                        //|| (p.proceso.toLowerCase() === item.proceso_padre.toLowerCase() && p.proceso.toLowerCase() === item.proceso_padre.toLowerCase())
                                        ) == undefined) {
                                            duplicados.push(item);
                                        }
                                        else {
                                            item.observacion = '1';
                                        }
                                        if (item.observacion == 'no registrado') {
                                            const cruzado = listaProcesos.slice(0, index).find((p) => (p.proceso.toLowerCase() === item.proceso_padre.toLowerCase() &&
                                                p.proceso_padre.toLowerCase() === item.proceso.toLowerCase() &&
                                                p.observacion === 'no registrado' && item.observacion === 'no registrado'));
                                            if (cruzado) {
                                                item.observacion = 'Registro cruzado';
                                            }
                                            else {
                                                if (existe_proceso_padre == false) {
                                                    if (item.proceso_padre != 'No registrado') {
                                                        const hayCoincidencia = listaProcesos.some((obj, otroIndex) => otroIndex !== index && item.proceso_padre === obj.proceso);
                                                        if (!hayCoincidencia) {
                                                            item.observacion = 'Proceso padre no existe en el archivo como proceso.';
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                else {
                                    item.observacion = 'No se puede registrar proceso y proceso padre iguales';
                                }
                            }
                            else {
                                item.observacion = 'Ya existe el proceso en el sistema';
                            }
                        }
                    }));
                    setTimeout(() => {
                        listaProcesos.sort((a, b) => {
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
                        listaProcesos.forEach((item) => __awaiter(this, void 0, void 0, function* () {
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
                            listaProcesos = undefined;
                        }
                        return res.jsonp({ message: mensaje, data: listaProcesos });
                    }, 1000);
                }
            }
            catch (error) {
                return res.status(500).jsonp({ message: 'Error con el servidor método RevisarDatos.', status: '500' });
            }
        });
    }
    // REGISTRAR PLANTILLA TIPO VACUNA    **USADO 
    CargarPlantilla(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { plantilla, user_name, ip, ip_local } = req.body;
            let error = false;
            for (const item of plantilla) {
                const { proceso } = item;
                try {
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    const response = yield database_1.default.query(`
          INSERT INTO map_cat_procesos (nombre, proceso_padre) VALUES ($1, $2) RETURNING *
          `, [proceso, null]);
                    const [procesos] = response.rows;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_cat_procesos',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: JSON.stringify(procesos),
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
            for (const data of plantilla) {
                const { proceso, proceso_padre } = data;
                if (proceso_padre != 'No registrado') {
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    const select = yield database_1.default.query(`
          SELECT id FROM map_cat_procesos WHERE UPPER(nombre) = UPPER($1)
          `, [proceso_padre]);
                    const [res] = select.rows;
                    if (select.rowCount > 0) {
                        console.log('select.rowCount: ', select.rows[0].id);
                        const response = yield database_1.default.query(`
            UPDATE map_cat_procesos SET proceso_padre = $1 WHERE UPPER(nombre) = UPPER($2)
            `, [select.rows[0].id, proceso]);
                        const [procesos] = response.rows;
                        // AUDITORIA
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'map_cat_procesos',
                            usuario: user_name,
                            accion: 'I',
                            datosOriginales: '',
                            datosNuevos: JSON.stringify(procesos),
                            ip: ip,
                            ip_local: ip_local,
                            observacion: null
                        });
                    }
                    else {
                        const respo = yield database_1.default.query(`
              INSERT INTO map_cat_procesos (nombre, proceso_padre) VALUES ($1, $2) RETURNING *
              `, [proceso_padre, null]);
                        const [proce] = respo.rows;
                        // AUDITORIA
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'map_cat_procesos',
                            usuario: user_name,
                            accion: 'I',
                            datosOriginales: '',
                            datosNuevos: JSON.stringify(proce),
                            ip: ip,
                            ip_local: ip_local,
                            observacion: null
                        });
                        const response = yield database_1.default.query(`
              UPDATE map_cat_procesos SET proceso_padre = $1 WHERE UPPER(nombre) = UPPER($2)
              `, [respo.rows[0].id, proceso]);
                        const [procesos] = response.rows;
                        // AUDITORIA
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'map_cat_procesos',
                            usuario: user_name,
                            accion: 'I',
                            datosOriginales: '',
                            datosNuevos: JSON.stringify(procesos),
                            ip: ip,
                            ip_local: ip_local,
                            observacion: null
                        });
                    }
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_cat_procesos',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: JSON.stringify(res),
                        ip: ip,
                        ip_local: ip_local,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                }
            }
            if (error) {
                return res.status(500).jsonp({ message: 'error' });
            }
            return res.status(200).jsonp({ message: 'ok' });
        });
    }
}
exports.PROCESOS_CONTROLADOR = new ProcesoControlador();
exports.default = exports.PROCESOS_CONTROLADOR;
