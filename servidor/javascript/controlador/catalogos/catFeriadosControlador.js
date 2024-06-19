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
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
const auditoriaControlador_1 = __importDefault(require("../auditoria/auditoriaControlador"));
const moment_1 = __importDefault(require("moment"));
const xlsx_1 = __importDefault(require("xlsx"));
const database_1 = __importDefault(require("../../database"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const settingsMail_1 = require("../../libs/settingsMail");
class FeriadosControlador {
    // CONSULTA DE LISTA DE FERIADOS ORDENADOS POR SU DESCRIPCION
    ListarFeriados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const FERIADOS = yield database_1.default.query(`
            SELECT * FROM ef_cat_feriados ORDER BY descripcion ASC
            `);
            if (FERIADOS.rowCount != 0) {
                return res.jsonp(FERIADOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA ELIMINAR UN REGISTRO DE FERIADOS
    EliminarFeriado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOS ORIGINALES
                const datosOriginales = yield database_1.default.query('SELECT * FROM ef_cat_feriados WHERE id = $1', [id]);
                const [feriado] = datosOriginales.rows;
                if (!feriado) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ef_cat_feriados',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar feriado con id ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ text: 'Registro no encontrado.' });
                }
                yield database_1.default.query(`
                DELETE FROM ef_cat_feriados WHERE id = $1
                `, [id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ef_cat_feriados',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(feriado),
                    datosNuevos: '',
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ text: 'Registro eliminado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ text: 'Error al eliminar el registro.' });
            }
        });
    }
    // METODO PARA CREAR REGISTRO DE FERIADO
    CrearFeriados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fecha, descripcion, fec_recuperacion, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const busqueda = yield database_1.default.query(`
                SELECT * FROM ef_cat_feriados WHERE UPPER(descripcion) = $1
                `, [descripcion.toUpperCase()]);
                const [nombres] = busqueda.rows;
                if (nombres) {
                    return res.jsonp({ message: 'existe', status: '300' });
                }
                else {
                    const response = yield database_1.default.query(`
                    INSERT INTO ef_cat_feriados (fecha, descripcion, fecha_recuperacion) 
                    VALUES ($1, $2, $3) RETURNING *
                    `, [fecha, descripcion, fec_recuperacion]);
                    const [feriado] = response.rows;
                    var fecha_formato_hora = yield (0, settingsMail_1.FormatearHora)(fecha.toLocaleString().split('T')[1]);
                    var fecha_formato = yield (0, settingsMail_1.FormatearFecha)(fecha.toLocaleString(), 'ddd');
                    var fec_recuperacion_formato_hora = yield (0, settingsMail_1.FormatearHora)(fec_recuperacion.toLocaleString().split('T')[1]);
                    var fec_recuperacion_formato = yield (0, settingsMail_1.FormatearFecha)(fec_recuperacion.toLocaleString(), 'ddd');
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ef_cat_feriados',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        //datosNuevos: JSON.stringify(feriado),
                        datosNuevos: `{fecha: ${fecha_formato + ' ' + fecha_formato_hora}, 
                            descripcion: ${descripcion}, fecha_recuperacion: ${fec_recuperacion_formato + ' ' + fec_recuperacion_formato_hora}} `,
                        ip,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    if (feriado) {
                        return res.status(200).jsonp(feriado);
                    }
                    else {
                        return res.status(404).jsonp({ message: 'error' });
                    }
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                console.log(error);
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // CONSULTA DE FERIDOS EXCEPTO EL REGISTRO QUE SE VA A ACTUALIZAR
    ListarFeriadosActualiza(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const FERIADOS = yield database_1.default.query(`
            SELECT * FROM ef_cat_feriados WHERE NOT id = $1
            `, [id]);
            if (FERIADOS.rowCount != 0) {
                return res.jsonp(FERIADOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA ACTUALIZAR UN FERIADO
    ActualizarFeriado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fecha, descripcion, fec_recuperacion, id, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOS ORIGINALES
                const datosOriginales = yield database_1.default.query('SELECT * FROM ef_cat_feriados WHERE id = $1', [id]);
                const [feriado] = datosOriginales.rows;
                if (!feriado) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ef_cat_feriados',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar feriado con id ${id}.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ text: 'Registro no encontrado.' });
                }
                yield database_1.default.query(`
                UPDATE ef_cat_feriados SET fecha = $1, descripcion = $2, fecha_recuperacion = $3
                WHERE id = $4
                `, [fecha, descripcion, fec_recuperacion, id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ef_cat_feriados',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(feriado),
                    datosNuevos: JSON.stringify({ fecha, descripcion, fec_recuperacion }),
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
    // CONSULTA DE DATOS DE UN REGISTRO DE FERIADO
    ObtenerUnFeriado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const FERIADO = yield database_1.default.query(`
            SELECT * FROM ef_cat_feriados WHERE id = $1
            `, [id]);
            if (FERIADO.rowCount != 0) {
                return res.jsonp(FERIADO.rows);
            }
            res.status(404).jsonp({ text: 'Registros no encontrados.' });
        });
    }
    // METODO PARA BUSCAR FERIADOS SEGUN CIUDAD Y RANGO DE FECHAS   --**VERIFICADO
    FeriadosCiudad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fecha_inicio, fecha_final, id_empleado } = req.body;
                const FERIADO = yield database_1.default.query(`
                SELECT f.fecha, f.fecha_recuperacion, cf.id_ciudad, c.descripcion, s.nombre
                FROM ef_cat_feriados AS f, ef_ciudad_feriado AS cf, e_ciudades AS c, e_sucursales AS s, 
                    datos_actuales_empleado AS de
                WHERE cf.id_feriado = f.id AND (f.fecha BETWEEN $1 AND $2) AND c.id = cf.id_ciudad 
                    AND s.id_ciudad = cf.id_ciudad AND de.id_sucursal = s.id AND de.id = $3
                `, [fecha_inicio, fecha_final, id_empleado]);
                if (FERIADO.rowCount != 0) {
                    return res.jsonp(FERIADO.rows);
                }
                else {
                    res.status(404).jsonp({ text: 'Registros no encontrados.' });
                }
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA BUSCAR FERIADOS SEGUN CIUDAD Y RANGO DE FECHAS   --**VERIFICADO
    FeriadosRecuperacionCiudad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fecha_inicio, fecha_final, id_empleado } = req.body;
                const FERIADO = yield database_1.default.query(`
                SELECT f.fecha, f.fecha_recuperacion, cf.id_ciudad, c.descripcion, s.nombre
                FROM ef_cat_feriados AS f, ef_ciudad_feriado AS cf, e_ciudades AS c, e_sucursales AS s, 
                    datos_actuales_empleado AS de
                WHERE cf.id_feriado = f.id AND (f.fecha BETWEEN $1 AND $2) AND c.id = cf.id_ciudad 
                    AND s.id_ciudad = cf.id_ciudad AND de.id_sucursal = s.id AND de.id = $3
                    AND f.fecha_recuperacion IS NOT null
                `, [fecha_inicio, fecha_final, id_empleado]);
                if (FERIADO.rowCount != 0) {
                    return res.jsonp(FERIADO.rows);
                }
                else {
                    res.status(404).jsonp({ text: 'Registros no encontrados.' });
                }
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    /*
    * Metodo para revisar
    */
    // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR
    RevisarDatos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
            let separador = path_1.default.sep;
            let ruta = (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)() + separador + documento;
            const workbook = xlsx_1.default.readFile(ruta);
            let verificador_feriado = (0, accesoCarpetas_1.ObtenerIndicePlantilla)(workbook, 'FERIADOS');
            let verificador_ciudad = (0, accesoCarpetas_1.ObtenerIndicePlantilla)(workbook, 'CIUDAD_FERIADOS');
            if (verificador_feriado === false) {
                return res.jsonp({ message: 'no_existe_feriado', data: undefined });
            }
            else if (verificador_ciudad === false) {
                return res.jsonp({ message: 'no_existe_ciudad', data: undefined });
            }
            else if (verificador_feriado != false && verificador_ciudad != false) {
                const sheet_name_list = workbook.SheetNames;
                const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[verificador_feriado]]);
                const plantilla_feriafoCiudades = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[verificador_ciudad]]);
                let data = {
                    fila: '',
                    fecha: '',
                    descripcion: '',
                    fec_recuperacion: '',
                    observacion: ''
                };
                var fecha_correcta = false;
                var fec_recuperacion_correcta = false;
                //Proceso de hoja de feriados de la plantilla feriados.xlxs
                var listFeriados = [];
                var duplicados = [];
                var fecha_igual = [];
                var mensaje = 'correcto';
                // LECTURA DE LOS DATOS DE LA PLANTILLA
                plantilla.forEach((dato) => __awaiter(this, void 0, void 0, function* () {
                    var { ITEM, FECHA, DESCRIPCION, FECHA_RECUPERACION } = dato;
                    if ((ITEM != undefined && ITEM != '') &&
                        (FECHA != undefined) && (FECHA != '') &&
                        (DESCRIPCION != undefined) && (DESCRIPCION != '') &&
                        (FECHA_RECUPERACION != undefined) && (FECHA_RECUPERACION != '')) {
                        data.fila = ITEM;
                        data.fecha = FECHA;
                        data.descripcion = DESCRIPCION;
                        data.fec_recuperacion = FECHA_RECUPERACION;
                        data.observacion = 'no registrada';
                        listFeriados.push(data);
                    }
                    else {
                        data.fila = ITEM;
                        data.fecha = FECHA;
                        data.descripcion = DESCRIPCION;
                        data.fec_recuperacion = FECHA_RECUPERACION;
                        data.observacion = 'no registrada';
                        if (data.fila == '' || data.fila == undefined) {
                            data.fila = 'error';
                            mensaje = 'error';
                        }
                        if (data.fecha == undefined || data.descripcion == '') {
                            data.fecha = 'No registrado';
                            data.observacion = 'Fecha ' + data.observacion;
                        }
                        if (data.descripcion == undefined || data.descripcion == '') {
                            data.descripcion = 'No registrado';
                            data.observacion = 'Descripción ' + data.observacion;
                        }
                        if (data.fecha == 'No registrado' && data.descripcion == 'No registrado') {
                            data.observacion = 'Fecha y descripción no registrada';
                        }
                        if (data.fec_recuperacion == undefined) {
                            data.fec_recuperacion = '-';
                        }
                        listFeriados.push(data);
                    }
                    data = {};
                }));
                //Proceso de hoja de feriadosCiudades de la plantilla feriados.xlxs
                let data_fC = {
                    fila: '',
                    provincia: '',
                    ciudad: '',
                    feriado: '',
                    observacion: ''
                };
                var listFeriados_ciudades = [];
                var duplicados_fc = [];
                // LECTURA DE LOS DATOS DE LA PLANTILLA
                plantilla_feriafoCiudades.forEach((dato, indice, array) => __awaiter(this, void 0, void 0, function* () {
                    var { ITEM, PROVINCIA, CIUDAD, FERIADO } = dato;
                    if ((ITEM != undefined && ITEM != '') &&
                        (PROVINCIA != undefined) && (PROVINCIA != '') &&
                        (CIUDAD != undefined) && (CIUDAD != '') &&
                        (FERIADO != undefined) && (FERIADO != '')) {
                        data_fC.fila = ITEM;
                        data_fC.provincia = PROVINCIA;
                        data_fC.ciudad = CIUDAD;
                        data_fC.feriado = FERIADO;
                        data_fC.observacion = 'registrado';
                        listFeriados_ciudades.push(data_fC);
                    }
                    else {
                        data_fC.fila = ITEM;
                        data_fC.provincia = PROVINCIA;
                        data_fC.ciudad = CIUDAD;
                        data_fC.feriado = FERIADO;
                        data_fC.observacion = 'registrado';
                        if (data_fC.fila == '' || data_fC.fila == undefined) {
                            data_fC.fila = 'error';
                            mensaje = 'error';
                        }
                        if (PROVINCIA == undefined) {
                            data_fC.provincia = 'No registrado';
                            data_fC.observacion = 'Provincia no ' + data_fC.observacion;
                        }
                        if (CIUDAD == undefined) {
                            data_fC.ciudad = 'No registrado';
                            data_fC.observacion = 'Ciudad no' + data_fC.observacion;
                        }
                        if (FERIADO == undefined) {
                            data_fC.feriado = 'No registrado';
                            data_fC.observacion = 'Feriado no' + data_fC.observacion;
                        }
                        listFeriados_ciudades.push(data_fC);
                    }
                    data_fC = {};
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
                var filaDuplicada = 0;
                listFeriados.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                    console.log('item: ', item);
                    //VERIFICA SI EXISTE EN LAs COLUMNA DATOS REGISTRADOS
                    if (item.fila != 'error' && item.fecha != 'No registrado' && item.descripcion != 'No registrado') {
                        // Verificar si la variable tiene el formato de fecha correcto con moment
                        if ((0, moment_1.default)(item.fecha, 'YYYY-MM-DD', true).isValid()) {
                            fecha_correcta = true;
                        }
                        else {
                            fecha_correcta = false;
                            item.observacion = 'Formato de fecha incorrecto (YYYY-MM-DD)';
                        }
                        if (fecha_correcta == true) {
                            // VERIFICACIÓN SI LA FECHA DEL FERIADO NO ESTE REGISTRADA EN EL SISTEMA
                            const VERIFICAR_FECHA = yield database_1.default.query(`
                        SELECT * FROM ef_cat_feriados 
                        WHERE fecha = $1 OR fecha_recuperacion = $1
                        `, [item.fecha]);
                            if (VERIFICAR_FECHA.rowCount === 0) {
                                if (item.fec_recuperacion == '-' || item.fec_recuperacion == undefined) {
                                    fec_recuperacion_correcta = true;
                                    // Discriminación de elementos iguales
                                    if (duplicados.find((p) => p.descripcion == item.descripcion || p.fecha === item.fecha) == undefined) {
                                        item.observacion = 'ok';
                                        duplicados.push(item);
                                    }
                                    else {
                                        item.observacion = '1';
                                    }
                                }
                                else {
                                    if ((0, moment_1.default)(item.fec_recuperacion, 'YYYY-MM-DD', true).isValid()) {
                                        fec_recuperacion_correcta = true;
                                        // Discriminación de elementos iguales
                                        if (duplicados.find((p) => p.descripcion == item.descripcion || p.fecha === item.fecha || p.fec_recuperacion === item.fec_recuperacion) == undefined) {
                                            item.observacion = 'ok';
                                            duplicados.push(item);
                                        }
                                        else {
                                            item.observacion = '1';
                                        }
                                    }
                                    else {
                                        fec_recuperacion_correcta = false;
                                        item.observacion = 'Formato de fec_recuperacion incorrecto (YYYY-MM-DD)';
                                    }
                                }
                            }
                            else {
                                item.observacion = 'Ya existe en el sistema';
                            }
                        }
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
                var filaDuplicada_fc = 0;
                listFeriados_ciudades.forEach((value) => __awaiter(this, void 0, void 0, function* () {
                    if (value.provincia != 'No registrado') {
                        //consultamos la id la provincia para validar que exista la ciudad registrada
                        var OBTENER_IDPROVINCI = yield database_1.default.query(`
                    SELECT id FROM e_provincias WHERE UPPER(nombre) = $1
                    `, [value.provincia.toUpperCase()]);
                        if (OBTENER_IDPROVINCI.rows[0] != undefined && OBTENER_IDPROVINCI.rows[0] != '') {
                            var id_provincia = OBTENER_IDPROVINCI.rows[0].id;
                            if (value.ciudad != 'No registrado') {
                                var VERIFICAR_CIUDAD = yield database_1.default.query(`
                            SELECT * FROM e_ciudades WHERE id_provincia = $1 AND UPPER (descripcion) = $2
                            `, [id_provincia, value.ciudad.toUpperCase()]);
                                if (VERIFICAR_CIUDAD.rows[0] != undefined && VERIFICAR_CIUDAD.rows[0] != '') {
                                    value.observacion = 'registrado';
                                }
                                else {
                                    value.observacion = 'La ciudad no pertenece a la provincia';
                                }
                            }
                        }
                        else {
                            value.observacion = 'La provincia ingresada no existe en la base';
                        }
                    }
                    // VALIDA SI LOS DATOS DE LA COLUMNA N SON NUMEROS.
                    if (typeof value.fila === 'number' && !isNaN(value.fila)) {
                        // CONDICION PARA VALIDAR SI EN LA NUMERACION EXISTE UN NUMERO QUE SE REPITE DARA ERROR.
                        if (value.fila == filaDuplicada_fc) {
                            mensaje = 'error';
                        }
                    }
                    else {
                        return mensaje = 'error';
                    }
                    filaDuplicada_fc = value.fila;
                }));
                setTimeout(() => {
                    //console.log('lista feriados: ',listFeriados);
                    fecha_igual = listFeriados;
                    listFeriados.sort((a, b) => {
                        // COMPARA LOS NUMEROS DE LOS OBJETOS
                        if (a.fila < b.fila) {
                            return -1;
                        }
                        if (a.fila > b.fila) {
                            return 1;
                        }
                        return 0; // SON IGUALES
                    });
                    listFeriados_ciudades.sort((a, b) => {
                        // COMPARA LOS NUMEROS DE LOS OBJETOS
                        if (a.fila < b.fila) {
                            return -1;
                        }
                        if (a.fila > b.fila) {
                            return 1;
                        }
                        return 0; // SON IGUALES
                    });
                    listFeriados.forEach((item) => {
                        console.log('item.observacion: ', item);
                        if (item.fec_recuperacion != '-') {
                            fecha_igual.forEach((valor) => {
                                console.log(valor.fecha, ' == ', item.fec_recuperacion);
                                if (valor.fecha == item.fec_recuperacion) {
                                    item.observacion = 'Fecha registrada como valor de otra columna';
                                }
                            });
                        }
                        if (item.observacion == '1') {
                            item.observacion = 'Registro duplicado';
                        }
                    });
                    listFeriados_ciudades.forEach((valor) => {
                        if (valor.provincia != 'No registrado' && valor.ciudad != 'No registrado' && valor.feriado != 'No registrado') {
                            if (duplicados_fc.find((a) => a.provincia === valor.provincia && a.ciudad === valor.ciudad && a.feriado == valor.feriado) == undefined) {
                                valor.observacion = 'registrado';
                                duplicados_fc.push(valor);
                            }
                            else {
                                valor.observacion = '1';
                            }
                        }
                    });
                    for (var x = 0; x < listFeriados_ciudades.length; x++) {
                        if (listFeriados_ciudades[x].observacion == 'registrado') {
                            for (var i = 0; i < listFeriados.length; i++) {
                                if (listFeriados[i].observacion == 'ok') {
                                    if (listFeriados[i].descripcion.toLowerCase() == listFeriados_ciudades[x].feriado.toLowerCase()) {
                                        console.log(listFeriados[i].descripcion.toLowerCase() == listFeriados_ciudades[x].feriado.toLowerCase());
                                        listFeriados_ciudades[x].observacion = 'ok';
                                    }
                                }
                            }
                        }
                    }
                    listFeriados_ciudades.forEach((valor) => {
                        if (valor.observacion == '1') {
                            valor.observacion = 'Registro duplicado';
                        }
                        else if (valor.observacion == 'registrado') {
                            valor.observacion = 'Feriado no válido';
                        }
                    });
                    if (mensaje == 'error') {
                        listFeriados = undefined;
                    }
                    return res.jsonp({ message: mensaje, data: listFeriados, datafc: listFeriados_ciudades });
                }, 1500);
            }
        });
    }
    // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR
    RegistrarFeriado_Ciudad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const plantilla = req.body;
                console.log('datos manual: ', plantilla);
                var contador = 1;
                var respuesta;
                plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                    // Datos que se leen de la plantilla ingresada
                    const { provincia, ciudad, feriado, observacion } = data;
                    //Obtener id de la ciudad
                    const id_ciudad = yield database_1.default.query(`
                    SELECT id FROM e_ciudades WHERE UPPER(descripcion) = $1
                    `, [ciudad.toUpperCase()]);
                    const id_feriado = yield database_1.default.query(`
                    SELECT id FROM ef_cat_feriados WHERE UPPER(descripcion) = $1
                    `, [feriado.toUpperCase()]);
                    console.log('id_ciudad: ', id_ciudad.rows[0].id);
                    console.log('id_feriado: ', id_feriado.rows[0].id);
                    // Registro de los datos
                    const response = yield database_1.default.query(`
                    INSERT INTO ef_ciudad_feriado (id_feriado, id_ciudad) VALUES ($1, $2) RETURNING *
                    `, [id_feriado.rows[0].id, id_ciudad.rows[0].id]);
                    const [ciudad_feria] = response.rows;
                    if (contador === plantilla.length) {
                        if (ciudad_feria) {
                            return respuesta = res.status(200).jsonp({ message: 'ok' });
                        }
                        else {
                            return respuesta = res.status(404).jsonp({ message: 'error' });
                        }
                    }
                    contador = contador + 1;
                }));
            }
            catch (error) {
                return res.status(500).jsonp({ message: error });
            }
        });
    }
}
const FERIADOS_CONTROLADOR = new FeriadosControlador();
exports.default = FERIADOS_CONTROLADOR;
