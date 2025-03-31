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
                console.log('nombre: ', nombre);
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
          SELECT * FROM map_cat_procesos WHERE UPPER(nombre) = UPPER($1)
         `, [nombre]);
                const [procesos] = response.rows;
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (procesos != undefined || procesos != null) {
                    res.status(300).jsonp({ message: 'Ya existe un proceso con ese nombre' });
                }
                else {
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
                    res.status(200).jsonp({ message: 'El proceso ha sido guardado en éxito' });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'Error al guardar el proceso' });
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
                var { nombre, proc_padre, id, user_name, ip, ip_local } = req.body;
                if (id == proc_padre) {
                    // CONSULTAR DATOS PROCESO PADRE
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    const proce = yield database_1.default.query('SELECT * FROM map_cat_procesos WHERE id = $1', [proc_padre]);
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    if (proce.rows[0].nombre == nombre) {
                        return res.status(300).jsonp({ message: 'Un proceso no puede ser su propio proceso superior. Verifique la selección e intente nuevamente.' });
                    }
                    else {
                        return res.status(300).jsonp({ message: 'No se puede actualizar si el proceso padre es el mismo proceso anterior' });
                    }
                }
                else {
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
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    // CONSULTAR DATOSORIGINALES
                    const proce = yield database_1.default.query('SELECT * FROM map_cat_procesos WHERE UPPER(nombre) = UPPER($1)', [nombre]);
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    if (proce.rowCount > 0) {
                        return res.status(300).jsonp({ message: 'Ya existe un proceso con ese nombre' });
                    }
                    else {
                        if (proc_padre != "") {
                            // INICIAR TRANSACCION
                            yield database_1.default.query('BEGIN');
                            const response = yield database_1.default.query(`
            SELECT * FROM map_cat_procesos WHERE id = $1
           `, [proc_padre]);
                            const [procesos] = response.rows;
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                            if (proc_padre == procesos.id && id == procesos.proceso_padre) {
                                return res.status(300).jsonp({ message: 'No se puede actualizar debido a que se cruza con el proceso ' + procesos.nombre });
                            }
                        }
                        else {
                            proc_padre = null;
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
                        return res.status(200).jsonp({ message: 'El proceso actualizado exitosamente' });
                    }
                }
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
                        if (!headers['ITEM'] || !headers['DESCRIPCION'] || !headers['PROCESO_SUPERIOR']) {
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
                            const PROCESO_PADRE = (_b = row.getCell(headers['PROCESO_SUPERIOR']).value) === null || _b === void 0 ? void 0 : _b.toString().trim();
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
                                            item.observacion = 'Procesos mal definidos';
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
                                                item.observacion = 'Procesos mal definidos (plantilla)';
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
    // REGISTRAR PLANTILLA PROCESOS    **USADO 
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
    // REGISTRAR PROCESOS POR MEDIO DE INTERFAZ
    RegistrarProcesos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_proceso, listaUsuarios, user_name, ip, ip_local } = req.body;
            let error = false;
            try {
                for (const item of listaUsuarios) {
                    const { id_empleado } = item;
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    const response = yield database_1.default.query(`
            SELECT * FROM map_empleado_procesos WHERE id_proceso = $1 and id_empleado = $2
           `, [id_proceso, id_empleado]);
                    const [procesos] = response.rows;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_empleado_procesos',
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
                    if (procesos == undefined || procesos == '' || procesos == null) {
                        // INICIAR TRANSACCION
                        yield database_1.default.query('BEGIN');
                        const response = yield database_1.default.query(`
            SELECT * FROM map_empleado_procesos WHERE id_empleado = $1 and estado = true
           `, [id_empleado]);
                        const [proceso_activo] = response.rows;
                        // AUDITORIA
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'map_empleado_procesos',
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
                        if (proceso_activo == undefined || proceso_activo == '' || proceso_activo == null) {
                            // INICIAR TRANSACCION
                            yield database_1.default.query('BEGIN');
                            const responsee = yield database_1.default.query(`
              INSERT INTO map_empleado_procesos (id_proceso, id_empleado, estado) VALUES ($1, $2, $3) RETURNING *
              `, [id_proceso, id_empleado, true]);
                            const [proceso_insert] = responsee.rows;
                            // AUDITORIA
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'map_empleado_procesos',
                                usuario: user_name,
                                accion: 'I',
                                datosOriginales: '',
                                datosNuevos: JSON.stringify(proceso_insert),
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
                            const proceso_update = yield database_1.default.query(`
              UPDATE map_empleado_procesos SET estado = false WHERE id = $1
              `, [proceso_activo.id]);
                            const [proceso_UPD] = proceso_update.rows;
                            // AUDITORIA
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'map_empleado_procesos',
                                usuario: user_name,
                                accion: 'I',
                                datosOriginales: '',
                                datosNuevos: JSON.stringify(proceso_UPD),
                                ip: ip,
                                ip_local: ip_local,
                                observacion: null
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                            // INICIAR TRANSACCION
                            yield database_1.default.query('BEGIN');
                            const response = yield database_1.default.query(`
               INSERT INTO map_empleado_procesos (id_proceso, id_empleado, estado) VALUES ($1, $2, $3) RETURNING *
              `, [id_proceso, id_empleado, true]);
                            const [nuevo_proceso] = response.rows;
                            // AUDITORIA
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'map_empleado_procesos',
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
                        console.log('proceso: ', procesos.estado);
                        if (procesos.estado == false) {
                            // INICIAR TRANSACCION
                            yield database_1.default.query('BEGIN');
                            const response = yield database_1.default.query(`
                SELECT * FROM map_empleado_procesos WHERE id_empleado = $1 and estado = true
              `, [id_empleado]);
                            const [proceso_activo1] = response.rows;
                            // AUDITORIA
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'map_empleado_procesos',
                                usuario: user_name,
                                accion: 'I',
                                datosOriginales: '',
                                datosNuevos: JSON.stringify(proceso_activo1),
                                ip: ip,
                                ip_local: ip_local,
                                observacion: null
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                            // INICIAR TRANSACCION
                            yield database_1.default.query('BEGIN');
                            const proceso_update = yield database_1.default.query(`
              UPDATE map_empleado_procesos SET estado = true WHERE id = $1
              `, [procesos.id]);
                            const [proceso_UPD] = proceso_update.rows;
                            // AUDITORIA
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'map_empleado_procesos',
                                usuario: user_name,
                                accion: 'I',
                                datosOriginales: '',
                                datosNuevos: JSON.stringify(proceso_UPD),
                                ip: ip,
                                ip_local: ip_local,
                                observacion: null
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                            // INICIAR TRANSACCION
                            yield database_1.default.query('BEGIN');
                            const proceso_update1 = yield database_1.default.query(`
              UPDATE map_empleado_procesos SET estado = false WHERE id = $1
              `, [proceso_activo1.id]);
                            const [proceso_UPD1] = proceso_update.rows;
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
                return res.status(200).jsonp({ message: 'Registro de proceso' });
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
    RevisarPantillaEmpleadoProce(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
                let separador = path_1.default.sep;
                let ruta = (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)() + separador + documento;
                const workbook = new exceljs_1.default.Workbook();
                yield workbook.xlsx.readFile(ruta);
                let verificador = (0, accesoCarpetas_1.ObtenerIndicePlantilla)(workbook, 'EMPLEADO_PROCESOS');
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
                        proceso: '',
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
                        if (!headers['ITEM'] || !headers['NOMBRE'] || !headers['APELLIDO'] || !headers['CEDULA'] || !headers['PROCESOS']) {
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
                            const PROCESOS = (_d = row.getCell(headers['PROCESOS']).value) === null || _d === void 0 ? void 0 : _d.toString().trim();
                            // VERIFICAR QUE EL REGISTO NO TENGA DATOS VACIOS
                            if ((ITEM != undefined && ITEM != '') &&
                                (NOMBRE != undefined && NOMBRE != '') &&
                                (APELLIDO != undefined && APELLIDO != '') &&
                                (CEDULA != undefined && CEDULA != '') &&
                                (PROCESOS != undefined && PROCESOS != '')) {
                                data.fila = ITEM;
                                data.nombre = NOMBRE,
                                    data.apellido = APELLIDO,
                                    data.cedula = CEDULA,
                                    data.proceso = PROCESOS,
                                    data.observacion = 'no registrado';
                                listaProcesos.push(data);
                            }
                            else {
                                data.fila = ITEM;
                                data.nombre = NOMBRE,
                                    data.apellido = APELLIDO,
                                    data.cedula = CEDULA,
                                    data.proceso = PROCESOS,
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
                                if (PROCESOS == undefined) {
                                    data.proceso = 'No registrado';
                                    data.observacion = 'Proceso ' + data.observacion;
                                }
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
                            const VERIFICAR_IDEMPLEADO = yield database_1.default.query(`
              SELECT id FROM eu_empleados WHERE cedula = $1
              `, [item.cedula.trim()]);
                            if (VERIFICAR_IDEMPLEADO.rows[0] != undefined) {
                                let id_empleado = VERIFICAR_IDEMPLEADO.rows[0].id;
                                const VERIFICAR_IDPROCESO = yield database_1.default.query(`
                SELECT id FROM map_cat_procesos WHERE UPPER(nombre) = UPPER($1)
                `, [item.proceso.trim()]);
                                if (VERIFICAR_IDPROCESO.rows[0] != undefined) {
                                    let id_proceso = VERIFICAR_IDPROCESO.rows[0].id;
                                    const response = yield database_1.default.query(`
                   SELECT * FROM map_empleado_procesos WHERE id_proceso = $1 and id_empleado = $2 and estado = true
                  `, [id_proceso, id_empleado]);
                                    const [procesos_emple] = response.rows;
                                    console.log('procesos_emple: ', procesos_emple);
                                    if (procesos_emple != undefined && procesos_emple != '' && procesos_emple != null) {
                                        item.observacion = 'Ya existe un registro activo con este usuario y proceso';
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
    // METODO PARA REGISTRAR EMPLEADOS PROCESO POR MEDIO DE PLANTILLA
    RegistrarEmpleadoProceso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { plantilla, user_name, ip, ip_local } = req.body;
            let error = false;
            console.log('id_empleado: ', plantilla);
            try {
                for (const item of plantilla) {
                    const { cedula, proceso } = item;
                    yield database_1.default.query('BEGIN');
                    const VERIFICAR_IDPROCESO = yield database_1.default.query(`
          SELECT id FROM map_cat_procesos WHERE UPPER(nombre) = UPPER($1)
          `, [proceso]);
                    console.log('VERIFICAR_IDPROCESO.rows[0].id: ', VERIFICAR_IDPROCESO.rows[0].id);
                    const id_proceso = VERIFICAR_IDPROCESO.rows[0].id;
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
            SELECT * FROM map_empleado_procesos WHERE id_proceso = $1 and id_empleado = $2
           `, [id_proceso, id_empleado]);
                    const [procesos] = response.rows;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'map_empleado_procesos',
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
                    if (procesos == undefined || procesos == '' || procesos == null) {
                        // INICIAR TRANSACCION
                        yield database_1.default.query('BEGIN');
                        const response = yield database_1.default.query(`
            SELECT * FROM map_empleado_procesos WHERE id_empleado = $1 and estado = true
           `, [id_empleado]);
                        const [proceso_activo] = response.rows;
                        // AUDITORIA
                        yield auditoriaControlador_1.default.InsertarAuditoria({
                            tabla: 'map_empleado_procesos',
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
                        if (proceso_activo == undefined || proceso_activo == '' || proceso_activo == null) {
                            // INICIAR TRANSACCION
                            yield database_1.default.query('BEGIN');
                            const responsee = yield database_1.default.query(`
              INSERT INTO map_empleado_procesos (id_proceso, id_empleado, estado) VALUES ($1, $2, $3) RETURNING *
              `, [id_proceso, id_empleado, true]);
                            const [proceso_insert] = responsee.rows;
                            // AUDITORIA
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'map_empleado_procesos',
                                usuario: user_name,
                                accion: 'I',
                                datosOriginales: '',
                                datosNuevos: JSON.stringify(proceso_insert),
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
                            const proceso_update = yield database_1.default.query(`
              UPDATE map_empleado_procesos SET estado = false WHERE id = $1
              `, [proceso_activo.id]);
                            const [proceso_UPD] = proceso_update.rows;
                            // AUDITORIA
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'map_empleado_procesos',
                                usuario: user_name,
                                accion: 'I',
                                datosOriginales: '',
                                datosNuevos: JSON.stringify(proceso_UPD),
                                ip: ip,
                                ip_local: ip_local,
                                observacion: null
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                            // INICIAR TRANSACCION
                            yield database_1.default.query('BEGIN');
                            const response = yield database_1.default.query(`
               INSERT INTO map_empleado_procesos (id_proceso, id_empleado, estado) VALUES ($1, $2, $3) RETURNING *
              `, [id_proceso, id_empleado, true]);
                            const [nuevo_proceso] = response.rows;
                            // AUDITORIA
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'map_empleado_procesos',
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
                        console.log('proceso: ', procesos.estado);
                        if (procesos.estado == false) {
                            // INICIAR TRANSACCION
                            yield database_1.default.query('BEGIN');
                            const response = yield database_1.default.query(`
                SELECT * FROM map_empleado_procesos WHERE id_empleado = $1 and estado = true
              `, [id_empleado]);
                            const [proceso_activo1] = response.rows;
                            // AUDITORIA
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'map_empleado_procesos',
                                usuario: user_name,
                                accion: 'I',
                                datosOriginales: '',
                                datosNuevos: JSON.stringify(proceso_activo1),
                                ip: ip,
                                ip_local: ip_local,
                                observacion: null
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                            // INICIAR TRANSACCION
                            yield database_1.default.query('BEGIN');
                            const proceso_update = yield database_1.default.query(`
              UPDATE map_empleado_procesos SET estado = true WHERE id = $1
              `, [procesos.id]);
                            const [proceso_UPD] = proceso_update.rows;
                            // AUDITORIA
                            yield auditoriaControlador_1.default.InsertarAuditoria({
                                tabla: 'map_empleado_procesos',
                                usuario: user_name,
                                accion: 'I',
                                datosOriginales: '',
                                datosNuevos: JSON.stringify(proceso_UPD),
                                ip: ip,
                                ip_local: ip_local,
                                observacion: null
                            });
                            // FINALIZAR TRANSACCION
                            yield database_1.default.query('COMMIT');
                            // INICIAR TRANSACCION
                            yield database_1.default.query('BEGIN');
                            const proceso_update1 = yield database_1.default.query(`
              UPDATE map_empleado_procesos SET estado = false WHERE id = $1
              `, [proceso_activo1.id]);
                            const [proceso_UPD1] = proceso_update.rows;
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
                return res.status(200).jsonp({ message: 'Registro de proceso' });
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
    // METODO PARA EDITAR EL REGISTRO DEL EMPLEADOS PROCESOS
    EditarRegistroProcesoEmple(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empleado, id, id_accion, estado, user_name, ip, ip_local } = req.body;
                if (estado == true) {
                    // CONSULTAR DATOSORIGINALES
                    const proceso = yield database_1.default.query(`
        SELECT * FROM map_empleado_procesos WHERE id_empleado = $1 AND estado = true
        `, [id_empleado]);
                    const [proceso_] = proceso.rows;
                    if (proceso_ != undefined || proceso_ != null) {
                        yield database_1.default.query(`
            UPDATE map_empleado_procesos SET estado = $1 WHERE id = $2
            `, [false, proceso_.id]);
                    }
                    yield database_1.default.query(`
          UPDATE map_empleado_procesos SET id_proceso = $1, estado = $2 WHERE id = $3
          `, [id_accion, estado, id]);
                }
                else {
                    yield database_1.default.query(`
          UPDATE map_empleado_procesos SET id_proceso = $1, estado = $2 WHERE id = $3
          `, [id_accion, estado, id]);
                }
                return res.jsonp({ message: 'El proceso actualizado exitosamente' });
            }
            catch (error) {
                return res.status(500).jsonp({ message: error });
            }
        });
    }
}
exports.PROCESOS_CONTROLADOR = new ProcesoControlador();
exports.default = exports.PROCESOS_CONTROLADOR;
