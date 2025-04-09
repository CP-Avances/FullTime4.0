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
const auditoriaControlador_1 = __importDefault(require("../../reportes/auditoriaControlador"));
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
const exceljs_1 = __importDefault(require("exceljs"));
const database_1 = __importDefault(require("../../../database"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class SucursalControlador {
    // BUSCAR SUCURSALES POR EL NOMBRE   **USADO
    BuscarNombreSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.body;
            const SUCURSAL = yield database_1.default.query(`
      SELECT * FROM e_sucursales WHERE UPPER(nombre) = $1
      `, [nombre]);
            if (SUCURSAL.rowCount != 0) {
                return res.jsonp(SUCURSAL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // GUARDAR REGISTRO DE SUCURSAL   **USADO
    CrearSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, id_ciudad, id_empresa, user_name, ip, ip_local } = req.body;
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
                    ip: ip,
                    ip_local: ip_local,
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
    // ACTUALIZAR REGISTRO DE ESTABLECIMIENTO  **USADO
    ActualizarSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, id_ciudad, id, user_name, ip, ip_local } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const consulta = yield database_1.default.query(`SELECT * FROM e_sucursales WHERE id = $1`, [id]);
                const [datosOriginales] = consulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'e_sucursales',
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
                    ip: ip,
                    ip_local: ip_local,
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
    // BUSCAR SUCURSAL POR ID DE EMPRESA  **USADO
    ObtenerSucursalEmpresa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empresa } = req.params;
            const SUCURSAL = yield database_1.default.query(`
      SELECT * FROM e_sucursales WHERE id_empresa = $1
      `, [id_empresa]);
            if (SUCURSAL.rowCount != 0) {
                return res.jsonp(SUCURSAL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO DE BUSQUEDA DE SUCURSALES **USADO
    ListarSucursales(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const SUCURSAL = yield database_1.default.query(`
      SELECT s.id, s.nombre, s.id_ciudad, c.descripcion, s.id_empresa, ce.nombre AS nomempresa
      FROM e_sucursales s, e_ciudades c, e_empresa ce
      WHERE s.id_ciudad = c.id AND s.id_empresa = ce.id
      ORDER BY s.id
      `);
            if (SUCURSAL.rowCount != 0) {
                return res.jsonp(SUCURSAL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTRO **USADO
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_name, ip, ip_local } = req.body;
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
                        ip: ip,
                        ip_local: ip_local,
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
        });
    }
    // METODO PARA BUSCAR DATOS DE UNA SUCURSAL  **USADO
    ObtenerUnaSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const SUCURSAL = yield database_1.default.query(`
      SELECT s.id, s.nombre, s.id_ciudad, c.descripcion, s.id_empresa, ce.nombre AS nomempresa
      FROM e_sucursales s, e_ciudades c, e_empresa ce
      WHERE s.id_ciudad = c.id AND s.id_empresa = ce.id AND s.id = $1
      `, [id]);
            if (SUCURSAL.rowCount != 0) {
                return res.jsonp(SUCURSAL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR  **USADO
    RevisarDatos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
            let separador = path_1.default.sep;
            let ruta = (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)() + separador + documento;
            const workbook = new exceljs_1.default.Workbook();
            yield workbook.xlsx.readFile(ruta);
            let verificador = (0, accesoCarpetas_1.ObtenerIndicePlantilla)(workbook, 'SUCURSALES');
            if (verificador === false) {
                return res.jsonp({ message: 'no_existe', data: undefined });
            }
            else {
                const sheet_name_list = workbook.worksheets.map(sheet => sheet.name);
                const plantilla = workbook.getWorksheet(sheet_name_list[verificador]);
                let data = {
                    fila: '',
                    nom_sucursal: '',
                    ciudad: '',
                    observacion: ''
                };
                var mensaje = 'correcto';
                var listSucursales = [];
                var duplicados = [];
                if (plantilla) {
                    // SUPONIENDO QUE LA PRIMERA FILA SON LAS CABECERAS
                    const headerRow = plantilla.getRow(1);
                    const headers = {};
                    // CREAR UN MAPA CON LAS CABECERAS Y SUS POSICIONES, ASEGURANDO QUE LAS CLAVES ESTEN EN MAYUSCULAS
                    headerRow.eachCell((cell, colNumber) => {
                        headers[cell.value.toString().toUpperCase()] = colNumber;
                    });
                    // VERIFICA SI LAS CABECERAS ESENCIALES ESTAN PRESENTES
                    if (!headers['ITEM'] || !headers['NOMBRE'] || !headers['CIUDAD']) {
                        return res.jsonp({ message: 'Cabeceras faltantes', data: undefined });
                    }
                    // LECTURA DE LOS DATOS DE LA PLANTILLA
                    plantilla.eachRow((row, rowNumber) => __awaiter(this, void 0, void 0, function* () {
                        var _a, _b;
                        // SALTAR LA FILA DE LAS CABECERAS
                        if (rowNumber === 1)
                            return;
                        // LEER LOS DATOS SEGUN LAS COLUMNAS ENCONTRADAS
                        const ITEM = row.getCell(headers['ITEM']).value;
                        const NOMBRE = (_a = row.getCell(headers['NOMBRE']).value) === null || _a === void 0 ? void 0 : _a.toString().trim();
                        const CIUDAD = (_b = row.getCell(headers['CIUDAD']).value) === null || _b === void 0 ? void 0 : _b.toString().trim();
                        const dato = {
                            ITEM: ITEM,
                            NOMBRE: NOMBRE,
                            CIUDAD: CIUDAD,
                        };
                        data.fila = ITEM;
                        data.nom_sucursal = NOMBRE;
                        data.ciudad = CIUDAD;
                        console.log('dataaaaaaaaaaaaaa: ', data);
                        if ((data.fila != undefined && data.fila != '') &&
                            (data.nom_sucursal != undefined && data.nom_sucursal != '') &&
                            (data.ciudad != undefined && data.ciudad != '')) {
                            console.log('ingresa undfined');
                            // VALIDAR PRIMERO QUE EXISTA LA CIUDAD EN LA TABLA CIUDADES
                            const existe_ciudad = yield database_1.default.query(`
              SELECT id FROM e_ciudades WHERE UPPER(descripcion) = UPPER($1)
              `, [CIUDAD]);
                            var id_ciudad = existe_ciudad.rows[0];
                            if (id_ciudad != undefined && id_ciudad != '') {
                                // VERIFICACION SI LA SUCURSAL NO ESTE REGISTRADA EN EL SISTEMA
                                const VERIFICAR_SUCURSAL = yield database_1.default.query(`
                SELECT * FROM e_sucursales 
                WHERE UPPER(nombre) = UPPER($1) AND id_ciudad = $2
                `, [NOMBRE, id_ciudad.id]);
                                if (VERIFICAR_SUCURSAL.rowCount === 0) {
                                    data.fila = ITEM;
                                    data.nom_sucursal = NOMBRE;
                                    data.ciudad = CIUDAD;
                                    // DISCRIMINACION DE ELEMENTOS IGUALES
                                    if (duplicados.find((p) => p.NOMBRE.toLowerCase() === data.nom_sucursal.toLowerCase() &&
                                        p.CIUDAD.toLowerCase() === data.ciudad.toLowerCase()) == undefined) {
                                        data.observacion = 'ok';
                                        duplicados.push(dato);
                                    }
                                    //USAMOS TRIM PARA ELIMINAR LOS ESPACIOS AL INICIO Y AL FINAL EN BLANCO.
                                    data.nom_sucursal = data.nom_sucursal.trim();
                                    data.ciudad = data.ciudad.trim();
                                    console.log('dataaa 010101010101: ', data);
                                    listSucursales.push(data);
                                }
                                else {
                                    data.fila = ITEM;
                                    data.nom_sucursal = NOMBRE;
                                    data.ciudad = CIUDAD;
                                    data.observacion = 'Ya existe en el sistema';
                                    //USAMOS TRIM PARA ELIMINAR LOS ESPACIOS AL INICIO Y AL FINAL EN BLANCO.
                                    data.nom_sucursal = data.nom_sucursal.trim();
                                    data.ciudad = data.ciudad.trim();
                                    console.log('dataaa 000000000: ', data);
                                    listSucursales.push(data);
                                }
                            }
                            else {
                                data.fila = ITEM;
                                data.nom_sucursal = NOMBRE;
                                data.ciudad = CIUDAD;
                                if (data.ciudad == '' || data.ciudad == undefined) {
                                    data.ciudad = 'No registrado';
                                }
                                data.observacion = 'Ciudad no existe en el sistema';
                                //USAMOS TRIM PARA ELIMINAR LOS ESPACIOS AL INICIO Y AL FINAL EN BLANCO.
                                data.nom_sucursal = data.nom_sucursal.trim();
                                data.ciudad = data.ciudad.trim();
                                console.log('dataaa 111111111: ', data);
                                listSucursales.push(data);
                            }
                        }
                        else {
                            data.fila = ITEM;
                            data.nom_sucursal = NOMBRE;
                            data.ciudad = CIUDAD;
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
                                data.observacion = 'Sucursal y ciudad no registrada';
                            }
                            //USAMOS TRIM PARA ELIMINAR LOS ESPACIOS AL INICIO Y AL FINAL EN BLANCO.
                            data.nom_sucursal = data.nom_sucursal.trim();
                            data.ciudad = data.ciudad.trim();
                            console.log('dataaa 222222: ', data);
                            listSucursales.push(data);
                        }
                        data = {};
                    }));
                }
                //console.log('listaSucursales ', listSucursales)
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
                    listSucursales.forEach((item) => {
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
                        listSucursales = undefined;
                    }
                    return res.jsonp({ message: mensaje, data: listSucursales });
                }, 1500);
            }
        });
    }
    // METODO PARA CARGAR PLANTILLA DE SUCURSALES  **USADO
    RegistrarSucursales(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { sucursales, user_name, ip, ip_local } = req.body;
            let error = false;
            for (const sucursal of sucursales) {
                const { nombre, id_ciudad, id_empresa } = sucursal;
                try {
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
exports.SUCURSAL_CONTROLADOR = new SucursalControlador();
exports.default = exports.SUCURSAL_CONTROLADOR;
