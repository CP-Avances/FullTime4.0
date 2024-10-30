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
const auditoriaControlador_1 = __importDefault(require("../reportes/auditoriaControlador"));
const moment_1 = __importDefault(require("moment"));
const xlsx_1 = __importDefault(require("xlsx"));
const database_1 = __importDefault(require("../../database"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const settingsMail_1 = require("../../libs/settingsMail");
class FeriadosControlador {
    // CONSULTA DE LISTA DE FERIADOS ORDENADOS POR SU DESCRIPCION   **USADO
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
    // METODO PARA ELIMINAR UN REGISTRO DE FERIADOS    **USADO
    EliminarFeriado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOS ORIGINALES
                const datosOriginales = yield database_1.default.query(`
                SELECT * FROM ef_cat_feriados WHERE id = $1
                `, [id]);
                const [feriado] = datosOriginales.rows;
                const fecha_formatoO = yield (0, settingsMail_1.FormatearFechaBase)(feriado.fecha, 'ddd');
                feriado.fecha = fecha_formatoO;
                let fec_recuperacion_formatoO = '';
                if (feriado.fec_recuperacion) {
                    fec_recuperacion_formatoO = yield (0, settingsMail_1.FormatearFechaBase)(feriado.fecha_recuperacion, 'ddd');
                    feriado.fecha_recuperacion = fec_recuperacion_formatoO;
                }
                if (!feriado) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ef_cat_feriados',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: JSON.stringify(feriado),
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar feriado con id ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'error' });
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
                return res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA CREAR REGISTRO DE FERIADO   **USADO
    CrearFeriados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fecha, descripcion, fec_recuperacion, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // BUSCAR SI YA EXISTE UN FERIADO CON LA MISMA DESCRIPCION
                const busqueda = yield database_1.default.query(`
                SELECT * FROM ef_cat_feriados WHERE UPPER(descripcion) = $1 OR fecha = $2 OR fecha_recuperacion = $3
                `, [descripcion.toUpperCase(), fecha, fec_recuperacion]);
                const [existe] = busqueda.rows;
                if (existe) {
                    return res.jsonp({ message: 'existe', status: '300' });
                }
                else {
                    // OBTENER LOS DATOS ORIGINALES (EN ESTE CASO, NO HAY DATOS ORIGINALES PORQUE ES UNA INSERCION NUEVA)
                    const response = yield database_1.default.query(`
                    INSERT INTO ef_cat_feriados (fecha, descripcion, fecha_recuperacion) 
                    VALUES ($1, $2, $3) RETURNING *
                    `, [fecha, descripcion, fec_recuperacion]);
                    const [feriado] = response.rows;
                    const fecha_formato = yield (0, settingsMail_1.FormatearFecha2)(fecha.toLocaleString(), 'ddd');
                    feriado.fecha = fecha_formato;
                    let fec_recuperacion_formato = '';
                    if (fec_recuperacion) {
                        fec_recuperacion_formato = yield (0, settingsMail_1.FormatearFecha2)(fec_recuperacion, 'ddd');
                        feriado.fecha_recuperacion = fec_recuperacion_formato;
                    }
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ef_cat_feriados',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: JSON.stringify(feriado),
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
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // CONSULTA DE FERIDOS EXCEPTO EL REGISTRO QUE SE VA A ACTUALIZAR   **USADO
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
    // METODO PARA ACTUALIZAR UN FERIADO   **USADO
    ActualizarFeriado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fecha, descripcion, fec_recuperacion, id, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const busqueda = yield database_1.default.query(`
                SELECT * FROM ef_cat_feriados WHERE (UPPER(descripcion) = $1 OR fecha = $2 OR fecha_recuperacion = $3) AND 
                    NOT id = $4
                `, [descripcion.toUpperCase(), fecha, fec_recuperacion, id]);
                const [existe] = busqueda.rows;
                if (existe) {
                    return res.jsonp({ message: 'existe', status: '300' });
                }
                else {
                    // CONSULTAR DATOS ORIGINALES
                    const datosOriginales = yield database_1.default.query(`
                    SELECT * FROM ef_cat_feriados WHERE id = $1
                    `, [id]);
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
                    const actualizacion = yield database_1.default.query(`
                    UPDATE ef_cat_feriados SET fecha = $1, descripcion = $2, fecha_recuperacion = $3
                    WHERE id = $4 RETURNING *
                    `, [fecha, descripcion, fec_recuperacion, id]);
                    const [datosNuevos] = actualizacion.rows;
                    const fecha_formato = yield (0, settingsMail_1.FormatearFecha2)(fecha.toLocaleString(), 'ddd');
                    datosNuevos.fecha = fecha_formato;
                    let fec_recuperacion_formato = '';
                    if (fec_recuperacion) {
                        fec_recuperacion_formato = yield (0, settingsMail_1.FormatearFecha2)(fec_recuperacion, 'ddd');
                        datosNuevos.fecha_recuperacion = fec_recuperacion_formato;
                    }
                    const fecha_formatoO = yield (0, settingsMail_1.FormatearFecha2)(feriado.fecha, 'ddd');
                    feriado.fecha = fecha_formatoO;
                    let fec_recuperacion_formatoO = '';
                    if (feriado.fecha_recuperacion) {
                        fec_recuperacion_formatoO = yield (0, settingsMail_1.FormatearFechaBase)(feriado.fecha_recuperacion, 'ddd');
                        feriado.fecha_recuperacion = fec_recuperacion_formatoO;
                    }
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ef_cat_feriados',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: JSON.stringify(feriado),
                        datosNuevos: JSON.stringify(datosNuevos),
                        ip,
                        observacion: null
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.jsonp({ message: 'Registro actualizado.' });
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
    // CONSULTA DE DATOS DE UN REGISTRO DE FERIADO    **USADO
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
    // METODO PARA BUSCAR FERIADOS SEGUN CIUDAD Y RANGO DE FECHAS    **USADO
    FeriadosCiudad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fecha_inicio, fecha_final, id_empleado } = req.body;
                const FERIADO = yield database_1.default.query(`
                SELECT f.fecha, f.fecha_recuperacion, cf.id_ciudad, c.descripcion, s.nombre
                FROM ef_cat_feriados AS f, ef_ciudad_feriado AS cf, e_ciudades AS c, e_sucursales AS s, 
                    informacion_general AS de
                WHERE cf.id_feriado = f.id AND (f.fecha BETWEEN $1 AND $2) AND c.id = cf.id_ciudad 
                    AND s.id_ciudad = cf.id_ciudad AND de.id_suc = s.id AND de.id = $3
                `, [fecha_inicio, fecha_final, id_empleado]);
                if (FERIADO.rowCount != 0) {
                    console.log(FERIADO.rows);
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
    FeriadosCiudadMultiplesEmpleados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fecha_inicio, fecha_final, ids } = req.body;
                const FERIADO = yield database_1.default.query(`
                SELECT f.fecha, f.fecha_recuperacion, cf.id_ciudad, c.descripcion, s.nombre, de.id
                FROM ef_cat_feriados AS f, ef_ciudad_feriado AS cf, e_ciudades AS c, e_sucursales AS s, 
                    informacion_general AS de
                WHERE cf.id_feriado = f.id AND (f.fecha BETWEEN $1 AND $2) AND c.id = cf.id_ciudad 
                    AND s.id_ciudad = cf.id_ciudad AND de.id_suc = s.id AND de.id = ANY($3)
                `, [fecha_inicio, fecha_final, ids]);
                if (FERIADO.rowCount != 0) {
                    console.log(FERIADO.rows);
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
    // METODO PARA BUSCAR FERIADOS SEGUN CIUDAD Y RANGO DE FECHAS  **USADO
    FeriadosRecuperacionCiudad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fecha_inicio, fecha_final, id_empleado } = req.body;
                console.log("ver req body, feriado recuperar: ", req.body);
                const FERIADO = yield database_1.default.query(`
                SELECT f.fecha, f.fecha_recuperacion, cf.id_ciudad, c.descripcion, s.nombre
                FROM ef_cat_feriados AS f, ef_ciudad_feriado AS cf, e_ciudades AS c, e_sucursales AS s, 
                    informacion_general AS de
                WHERE cf.id_feriado = f.id AND (f.fecha BETWEEN $1 AND $2) AND c.id = cf.id_ciudad 
                    AND s.id_ciudad = cf.id_ciudad AND de.id_suc = s.id AND de.id = $3
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
    // METODO PARA BUSCAR FERIADOS SEGUN CIUDAD Y RANGO DE FECHAS  **USADO
    FeriadosRecuperacionCiudadMultiplesEmpleados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fecha_inicio, fecha_final, ids } = req.body;
                const FERIADO = yield database_1.default.query(`
                    SELECT f.fecha, f.fecha_recuperacion, cf.id_ciudad, c.descripcion, s.nombre,  de.id 
                    FROM ef_cat_feriados AS f, ef_ciudad_feriado AS cf, e_ciudades AS c, e_sucursales AS s,
                        informacion_general AS de
                    WHERE cf.id_feriado = f.id AND (f.fecha BETWEEN $1 AND $2) AND c.id = cf.id_ciudad 
                        AND s.id_ciudad = cf.id_ciudad AND de.id_suc = s.id AND de.id= ANY($3)
                        AND f.fecha_recuperacion IS NOT null
                    `, [fecha_inicio, fecha_final, ids]);
                if (FERIADO.rowCount != 0) {
                    console.log("ver feriado: ", FERIADO.rows);
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
    // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR   **USADO
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
                // PROCESO DE HOJA DE FERIADOS DE LA PLANTILLA FERIADOS.XLXS
                var listFeriados = [];
                var duplicados = [];
                var duplicados1 = [];
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
                            data.observacion = 'Fecha no registrada';
                        }
                        if (data.descripcion == undefined || data.descripcion == '') {
                            data.descripcion = 'No registrado';
                            data.observacion = 'Descripción no registrada';
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
                // PROCESO DE HOJA DE FERIADOSCIUDADES DE LA PLANTILLA FERIADOS.XLXS
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
                            data_fC.observacion = 'Provincia no registrado';
                        }
                        if (CIUDAD == undefined) {
                            data_fC.ciudad = 'No registrado';
                            data_fC.observacion = 'Ciudad no registrado';
                        }
                        if (FERIADO == undefined) {
                            data_fC.feriado = 'No registrado';
                            data_fC.observacion = 'Feriado no registrado';
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
                    //VERIFICA SI EXISTE EN LAs COLUMNA DATOS REGISTRADOS
                    if (item.fila != 'error' && item.fecha != 'No registrado' && item.descripcion != 'No registrado') {
                        // VERIFICAR SI LA VARIABLE TIENE EL FORMATO DE FECHA CORRECTO CON moment
                        if ((0, moment_1.default)(item.fecha, 'YYYY-MM-DD', true).isValid()) {
                            // VERIFICACION SI LA FECHA DEL FERIADO NO ESTE REGISTRADA EN EL SISTEMA
                            const VERIFICAR_FECHA = yield database_1.default.query(`SELECT * FROM ef_cat_feriados 
                            WHERE fecha = $1 OR fecha_recuperacion = $1
                            `, [item.fecha]);
                            if (VERIFICAR_FECHA.rowCount === 0) {
                                const VERIFICAR_DESCRIP = yield database_1.default.query(`
                                SELECT * FROM ef_cat_feriados 
                                WHERE UPPER(descripcion) = $1
                                `, [item.descripcion.toUpperCase()]);
                                if (VERIFICAR_DESCRIP.rowCount === 0) {
                                    if (item.fec_recuperacion == '-' || item.fec_recuperacion == undefined) {
                                        fec_recuperacion_correcta = true;
                                        // DISCRIMINACION DE ELEMENTOS IGUALES
                                        if (duplicados.find((p) => p.descripcion.toLowerCase() == item.descripcion.toLowerCase() || p.fecha === item.fecha) == undefined) {
                                            duplicados.push(item);
                                        }
                                        else {
                                            item.observacion = '1';
                                        }
                                    }
                                    else {
                                        if ((0, moment_1.default)(item.fec_recuperacion, 'YYYY-MM-DD', true).isValid()) {
                                            fec_recuperacion_correcta = true;
                                            const VERIFICAR_FECHA_RECUPE = yield database_1.default.query(`
                                            SELECT * FROM ef_cat_feriados     
                                            WHERE fecha = $1 OR fecha_recuperacion = $1
                                            `, [item.fec_recuperacion]);
                                            if (VERIFICAR_FECHA_RECUPE.rowCount === 0) {
                                                // DISCRIMINACION DE ELEMENTOS IGUALES
                                                if (duplicados1.find((p) => p.descripcion.toLowerCase() == item.descripcion.toLowerCase() ||
                                                    p.fecha === item.fecha || p.fec_recuperacion === item.fec_recuperacion) == undefined) {
                                                    duplicados1.push(item);
                                                }
                                                else {
                                                    item.observacion = '1';
                                                }
                                            }
                                            else {
                                                item.observacion = 'Fecha recuperación ya existe en el sistema';
                                            }
                                        }
                                        else {
                                            fec_recuperacion_correcta = false;
                                            item.observacion = 'Formato de fecha recuperación incorrecto (YYYY-MM-DD)';
                                        }
                                    }
                                }
                                else {
                                    item.observacion = 'Descripción ya existe en el sistema';
                                }
                            }
                            else {
                                item.observacion = 'Fecha ya existe en el sistema';
                            }
                        }
                        else {
                            item.observacion = 'Formato de fecha incorrecto (YYYY-MM-DD)';
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
                        // CONSULTAMOS LA ID LA PROVINCIA PARA VALIDAR QUE EXISTA LA CIUDAD REGISTRADA
                        var OBTENER_IDPROVINCI = yield database_1.default.query(`
                        SELECT id FROM e_provincias 
                        WHERE UPPER(nombre) = $1
                                `, [value.provincia.toUpperCase()]);
                        if (OBTENER_IDPROVINCI.rows[0] != undefined && OBTENER_IDPROVINCI.rows[0] != '') {
                            var id_provincia = OBTENER_IDPROVINCI.rows[0].id;
                            if (value.ciudad != 'No registrado') {
                                var VERIFICAR_CIUDAD = yield database_1.default.query(`
                                SELECT id FROM e_ciudades 
                                WHERE UPPER(descripcion) = $1
                                `, [value.ciudad.toUpperCase()]);
                                if (VERIFICAR_CIUDAD.rowCount == 0) {
                                    value.observacion = 'La ciudad no existe en el sistema';
                                }
                                else {
                                    var id_ciudad = VERIFICAR_CIUDAD.rows[0].id;
                                    var VERIFICAR_CIUDAD_PRO = yield database_1.default.query(`
                                    SELECT * FROM e_ciudades 
                                    WHERE id_provincia = $1 AND UPPER(descripcion) = $2
                                `, [id_provincia, value.ciudad.toUpperCase()]);
                                    if (VERIFICAR_CIUDAD_PRO.rows[0] != undefined && VERIFICAR_CIUDAD.rows[0] != '') {
                                        const VERIFICAR_DESCRIP = yield database_1.default.query(`
                                        SELECT id FROM ef_cat_feriados 
                                        WHERE UPPER(descripcion) = $1
                                `, [value.feriado.toUpperCase()]);
                                        if (VERIFICAR_DESCRIP.rowCount === 0) {
                                            value.observacion = 'registrado';
                                        }
                                        else {
                                            var id_feriado = VERIFICAR_DESCRIP.rows[0].id;
                                            var VERIFICAR_CIUDAD_FERIADO = yield database_1.default.query(`
                                            SELECT * FROM ef_ciudad_feriado 
                                            WHERE id_feriado = $1 AND id_ciudad = $2
                                            `, [id_feriado, id_ciudad]);
                                            if (VERIFICAR_CIUDAD_FERIADO.rowCount === 0) {
                                                value.observacion = 'registrado';
                                            }
                                            else {
                                                value.observacion = 'Feriando ya asignado a una ciudad';
                                            }
                                        }
                                    }
                                    else {
                                        value.observacion = 'La ciudad no pertenece a la provincia';
                                    }
                                }
                            }
                        }
                        else {
                            value.observacion = 'La provincia no existe en el sistema';
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
                var tiempo = 2000;
                if (listFeriados.length > 500 && listFeriados.length <= 1000) {
                    tiempo = 4000;
                }
                else if (listFeriados.length > 1000) {
                    tiempo = 7000;
                }
                setTimeout(() => {
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
                        if (item.fec_recuperacion != '-') {
                            fecha_igual.forEach((valor) => {
                                if (valor.fecha == item.fec_recuperacion) {
                                    item.observacion = 'Fecha como valor de otra columna';
                                }
                            });
                        }
                        if (item.observacion != undefined) {
                            let arrayObservacion = item.observacion.split(" ");
                            if (arrayObservacion[0] == 'no' || item.observacion == " ") {
                                item.observacion = 'ok';
                            }
                            if (item.observacion == '1') {
                                item.observacion = 'Registro duplicado';
                            }
                        }
                    });
                    listFeriados_ciudades.forEach((valor) => {
                        if (valor.provincia != 'No registrado' && valor.ciudad != 'No registrado' && valor.feriado != 'No registrado') {
                            if (duplicados_fc.find((a) => a.provincia === valor.provincia && a.ciudad === valor.ciudad && a.feriado == valor.feriado) == undefined) {
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
                            valor.observacion = 'Feriado no válido (Debe existir previamente)';
                            if (valor.feriado == 'No registrado') {
                                valor.observacion = 'Feriado no registrado';
                            }
                        }
                    });
                    if (mensaje == 'error') {
                        listFeriados = undefined;
                    }
                    return res.jsonp({ message: mensaje, data: listFeriados, datafc: listFeriados_ciudades });
                }, tiempo);
            }
        });
    }
    // METODO PARA REGISTRAR DATOS DE FERIADOS DE PLANTILLA   **USADO
    RegistrarFeriado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { plantilla, user_name, ip } = req.body;
            let error = false;
            for (const data of plantilla) {
                try {
                    let { fecha, descripcion, fec_recuperacion } = data;
                    if (fec_recuperacion == '-') {
                        fec_recuperacion = null;
                    }
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    const response = yield database_1.default.query(`
                    INSERT INTO ef_cat_feriados (fecha, descripcion, fecha_recuperacion) 
                    VALUES ($1, $2, $3) RETURNING *
                    `, [fecha, descripcion, fec_recuperacion]);
                    const [feriado] = response.rows;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ef_cat_feriados',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: JSON.stringify(feriado),
                        ip,
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
    // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR   **USADO
    RegistrarFeriado_Ciudad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { plantilla, user_name, ip } = req.body;
            let error = false;
            for (const data of plantilla) {
                try {
                    const { ciudad, feriado } = data;
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    //OBTENER ID DE LA CIUDAD
                    const id_ciudad = yield database_1.default.query(`
                    SELECT id FROM e_ciudades WHERE UPPER(descripcion) = $1
                    `, [ciudad.toUpperCase()]);
                    const id_feriado = yield database_1.default.query(`
                    SELECT id FROM ef_cat_feriados WHERE UPPER(descripcion) = $1
                    `, [feriado.toUpperCase()]);
                    const response = yield database_1.default.query(`
                    INSERT INTO ef_ciudad_feriado (id_feriado, id_ciudad) VALUES ($1, $2) RETURNING *
                    `, [id_feriado.rows[0].id, id_ciudad.rows[0].id]);
                    const [ciudad_feria] = response.rows;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ef_ciudad_feriado',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: JSON.stringify(ciudad_feria),
                        ip,
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
    /** ********************************************************************************************* **
     ** **                          METODOS DE APLICACION MOVIL                                    ** **
     ** ********************************************************************************************* **/
    // METODO PARA LEER FERIADOS   **USADO
    LeerFeriados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fecha = new Date();
                const response = yield database_1.default.query(`
                SELECT id, descripcion, CAST(fecha AS VARCHAR), CAST(fecha_recuperacion AS VARCHAR) 
                FROM ef_cat_feriados WHERE CAST(fecha AS VARCHAR) LIKE $1 || '%' 
                ORDER BY descripcion ASC
                `, [fecha.toJSON().split("-")[0]]);
                const cg_feriados = response.rows;
                return res.status(200).jsonp(cg_feriados);
            }
            catch (error) {
                console.log(error);
                return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
            }
        });
    }
    ;
}
const FERIADOS_CONTROLADOR = new FeriadosControlador();
exports.default = FERIADOS_CONTROLADOR;
