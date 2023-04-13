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
const moment_1 = __importDefault(require("moment"));
const xlsx_1 = __importDefault(require("xlsx"));
const database_1 = __importDefault(require("../../database"));
const fs_1 = __importDefault(require("fs"));
const builder = require('xmlbuilder');
class FeriadosControlador {
    // CONSULTA DE LISTA DE FERIADOS ORDENADOS POR SU DESCRIPCION
    ListarFeriados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const FERIADOS = yield database_1.default.query(`
            SELECT * FROM cg_feriados ORDER BY descripcion ASC
            `);
            if (FERIADOS.rowCount > 0) {
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
            const id = req.params.id;
            yield database_1.default.query(`
            DELETE FROM cg_feriados WHERE id = $1
            `, [id]);
            res.jsonp({ text: 'Registro eliminado.' });
        });
    }
    // METODO PARA CREAR ARCHIVO EN FORMATO XML
    FileXML(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var xml = builder.create('root').ele(req.body).end({ pretty: true });
            let filename = "Feriados-" + req.body.userName + '-' + req.body.userId + '-' +
                new Date().getTime() + '.xml';
            fs_1.default.writeFile(`xmlDownload/${filename}`, xml, function (err) {
            });
            res.jsonp({ text: 'XML creado', name: filename });
        });
    }
    // METODO PARA DESCARGAR ARCHIVO XML DE FERIADOS
    downloadXML(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const name = req.params.nameXML;
            let filePath = `servidor\\xmlDownload\\${name}`;
            res.sendFile(__dirname.split("servidor")[0] + filePath);
        });
    }
    // METODO PARA CREAR REGISTRO DE FERIADO
    CrearFeriados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fecha, descripcion, fec_recuperacion } = req.body;
                const response = yield database_1.default.query(`
                INSERT INTO cg_feriados (fecha, descripcion, fec_recuperacion) 
                VALUES ($1, $2, $3) RETURNING *
                `, [fecha, descripcion, fec_recuperacion]);
                const [feriado] = response.rows;
                if (feriado) {
                    return res.status(200).jsonp(feriado);
                }
                else {
                    return res.status(404).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // CONSULTA DE FERIDOS EXCEPTO EL REGISTRO QUE SE VA A ACTUALIZAR
    ListarFeriadosActualiza(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const FERIADOS = yield database_1.default.query(`
            SELECT * FROM cg_feriados WHERE NOT id = $1
            `, [id]);
            if (FERIADOS.rowCount > 0) {
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
                const { fecha, descripcion, fec_recuperacion, id } = req.body;
                yield database_1.default.query(`
                UPDATE cg_feriados SET fecha = $1, descripcion = $2, fec_recuperacion = $3
                WHERE id = $4
                `, [fecha, descripcion, fec_recuperacion, id]);
                res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // CONSULTA DE DATOS DE UN REGISTRO DE FERIADO
    ObtenerUnFeriado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const FERIADO = yield database_1.default.query(`
            SELECT * FROM cg_feriados WHERE id = $1
            `, [id]);
            if (FERIADO.rowCount > 0) {
                return res.jsonp(FERIADO.rows);
            }
            res.status(404).jsonp({ text: 'Registros no encontrados.' });
        });
    }
    // METODO PARA BUSCAR FERIADOS SEGUN CIUDAD Y RANGO DE FECHAS
    FeriadosCiudad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fecha_inicio, fecha_final, id_empleado } = req.body;
                const FERIADO = yield database_1.default.query(`
                SELECT f.fecha, f.fec_recuperacion, cf.id_ciudad, c.descripcion, s.nombre
                FROM cg_feriados AS f, ciud_feriados AS cf, ciudades AS c, sucursales AS s, datos_actuales_empleado AS de
                WHERE cf.id_feriado = f.id AND (f.fecha BETWEEN $1 AND $2) AND c.id = cf.id_ciudad 
                    AND s.id_ciudad = cf.id_ciudad AND de.id_sucursal = s.id AND de.id = $3
                `, [fecha_inicio, fecha_final, id_empleado]);
                if (FERIADO.rowCount > 0) {
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
    // METODO PARA BUSCAR FERIADOS SEGUN CIUDAD Y RANGO DE FECHAS
    FeriadosRecuperacionCiudad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fecha_inicio, fecha_final, id_empleado } = req.body;
                const FERIADO = yield database_1.default.query(`
                SELECT f.fecha, f.fec_recuperacion, cf.id_ciudad, c.descripcion, s.nombre
                FROM cg_feriados AS f, ciud_feriados AS cf, ciudades AS c, sucursales AS s, datos_actuales_empleado AS de
                WHERE cf.id_feriado = f.id AND (f.fecha BETWEEN $1 AND $2) AND c.id = cf.id_ciudad 
                    AND s.id_ciudad = cf.id_ciudad AND de.id_sucursal = s.id AND de.id = $3
                    AND f.fec_recuperacion IS NOT null
                `, [fecha_inicio, fecha_final, id_empleado]);
                if (FERIADO.rowCount > 0) {
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
    // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR
    RevisarDatos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = req.files;
            let cadena = list.uploads[0].path;
            let filename = cadena.split("\\")[1];
            var filePath = `./plantillas/${filename}`;
            const workbook = xlsx_1.default.readFile(filePath);
            const sheet_name_list = workbook.SheetNames;
            const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            // VARIABLES USADAS PARA CONTAR NÚMERO DE FILAS CORRECTAS
            let lectura = 1;
            let contador = 1;
            let contarFecha = 0;
            let existeFecha = 0;
            let contarFechaValida = 0;
            let existeDescripcion = 0;
            let contarRecuperacion = 0;
            let contarFechaSiguiente = 0;
            let contarFechaRecuperarValida = 0;
            // VARIABLES DE ALMACENAMIENTO DE FILAS CON ERRORES
            let faltaFecha = '';
            let fechaInvalida = '';
            let fechaDuplicada = '';
            let faltaDescripcion = '';
            let fechasIncorrectas = '';
            let recuperacionInvalida = '';
            let recuperacionDuplicada = '';
            // LECTURA DE LOS DATOS DE LA PLANTILLA
            plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                lectura = lectura + 1;
                var { fecha, descripcion, fec_recuperacion, fila = lectura } = data;
                // VERIFICACIÓN DE EXISTENCIA DE REGISTRO DE FECHA
                if (fecha != undefined) {
                    existeFecha = existeFecha + 1;
                    // VERIFICACIÓN DE EXSTENCIA DE REGISTRO DE DESCRIPCION
                    if (descripcion != undefined) {
                        existeDescripcion = existeDescripcion + 1;
                    }
                    else {
                        faltaDescripcion = faltaDescripcion + ' - Fila: ' + fila;
                    }
                    // VERIFICACIÓN DE FORMATO DE FECHA VÁLIDO
                    if (fecha === (0, moment_1.default)(fecha).format('YYYY-MM-DD')) {
                        contarFechaValida = contarFechaValida + 1;
                        // VERIFICACIÓN DE REGISTRO DE FECHA DENTRO DEL SISTEMA - NO SON VÁLIDAS FECHAS DUPLICADAS
                        const VERIFICAR_FECHA = yield database_1.default.query('SELECT * FROM cg_feriados ' +
                            'WHERE fecha = $1 OR fec_recuperacion = $1', [fecha]);
                        if (VERIFICAR_FECHA.rowCount === 0) {
                            contarFecha = contarFecha + 1;
                        }
                        else {
                            fechaDuplicada = fechaDuplicada + ' - Fila: ' + fila;
                        }
                        // CAMPO FEC_RECUPERACON QUE INDICA RECUPERACIÓN DE FERIADO NO ES OBLIGATORIO
                        if (fec_recuperacion != undefined) {
                            // VALIDACIÓN DE FORMATO DE FECHA DE RECUPERACIÓN
                            if (fec_recuperacion === (0, moment_1.default)(fec_recuperacion).format('YYYY-MM-DD')) {
                                contarFechaRecuperarValida = contarFechaRecuperarValida + 1;
                                // VALIDACIÓN DE INGRESO CORRECTO DE FECHAS - NO ES POSIBLE QUE FECHA DE RECUPERACIÓN SEA ANTERIOR A LA FECHA DE FERIADO
                                if (fec_recuperacion > fecha) {
                                    contarFechaSiguiente = contarFechaSiguiente + 1;
                                    // VERIFICACIÓN DE FECHA DE RECUPERACIÓN NO ESTE REGISTRADA EN EL SISTEMA
                                    const VERIFICAR_FECHA_RECUPERAR = yield database_1.default.query('SELECT * FROM cg_feriados ' +
                                        'WHERE fecha = $1 OR fec_recuperacion = $1', [fec_recuperacion]);
                                    if (VERIFICAR_FECHA_RECUPERAR.rowCount === 0) {
                                        contarRecuperacion = contarRecuperacion + 1;
                                    }
                                    else {
                                        recuperacionDuplicada = recuperacionDuplicada + ' - Fila: ' + fila;
                                    }
                                }
                                else {
                                    fechasIncorrectas = fechasIncorrectas + ' - Fila: ' + fila;
                                }
                            }
                            else {
                                recuperacionInvalida = recuperacionInvalida + ' - Fila: ' + fila;
                            }
                        }
                        else {
                            contarFechaRecuperarValida = contarFechaRecuperarValida + 1;
                            contarFechaSiguiente = contarFechaSiguiente + 1;
                            contarRecuperacion = contarRecuperacion + 1;
                        }
                    }
                    else {
                        fechaInvalida = fechaInvalida + ' - Fila: ' + fila;
                    }
                }
                else {
                    faltaFecha = faltaFecha + ' - Fila: ' + fila;
                }
                // ENVIO DE MENSAJES CUANDO SE HA LEIDO TODOS LOS DATOS DE LA PLANTILLA
                if (contador === plantilla.length) {
                    if (existeFecha === plantilla.length) {
                        if (existeDescripcion === plantilla.length) {
                            if (contarFechaValida === plantilla.length) {
                                if (contarFecha === plantilla.length) {
                                    if (contarFechaRecuperarValida === plantilla.length) {
                                        if (contarFechaSiguiente === plantilla.length) {
                                            if (contarRecuperacion === plantilla.length) {
                                                return res.jsonp({ message: 'CORRECTO' });
                                            }
                                            else {
                                                return res.jsonp({
                                                    message: 'FECHA DE RECUPERACION YA EXISTE',
                                                    data: recuperacionDuplicada
                                                });
                                            }
                                        }
                                        else {
                                            return res.jsonp({
                                                message: 'FECHA DE RECUPERACION ANTERIOR',
                                                data: fechasIncorrectas
                                            });
                                        }
                                    }
                                    else {
                                        return res.jsonp({
                                            message: 'FECHA DE RECUPERACION INVALIDA',
                                            data: recuperacionInvalida
                                        });
                                    }
                                }
                                else {
                                    return res.jsonp({ message: 'FECHA YA EXISTE', data: fechaDuplicada });
                                }
                            }
                            else {
                                return res.jsonp({ message: 'FECHA INVALIDA', data: fechaInvalida });
                            }
                        }
                        else {
                            return res.jsonp({
                                message: 'CAMPO DESCRIPCION ES OBLIGATORIO',
                                data: faltaDescripcion
                            });
                        }
                    }
                    else {
                        return res.jsonp({ message: 'CAMPO FECHA ES OBLIGATORIO', data: faltaFecha });
                    }
                }
                contador = contador + 1;
            }));
            fs_1.default.unlinkSync(filePath);
        });
    }
    // REVISAR DATOS DUPLICADOS DENTRO DE LA MISMA PLANTILLA
    RevisarDatos_Duplicados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = req.files;
            let cadena = list.uploads[0].path;
            let filename = cadena.split("\\")[1];
            var filePath = `./plantillas/${filename}`;
            const workbook = xlsx_1.default.readFile(filePath);
            const sheet_name_list = workbook.SheetNames;
            const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            // VARIABLES DE CONTADORES DE REGISTROS
            var lectura = 1;
            var contador = 1;
            var contarFecha = 0;
            var contarRecuperacion = 0;
            var fecha_recuperacion = 0;
            // ARRAY DE DATOS TOTALES DE PLANTILLA
            var ver_fecha = [];
            var datos_totales = [];
            var ver_recuperacion = [];
            // VARIABLES DE ALMACENAMIENTO DE FILAS DUPLICADAS
            let fechaDuplicada = '';
            let fechaIgualRecupera = '';
            let recuperacionDuplicada = '';
            // LECTURA DE DATOS DE LA PLANTILLA FILA POR FILA
            plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                lectura = lectura + 1;
                var { fecha, fec_recuperacion, fila = lectura } = data;
                let fila_datos = {
                    fec_recuperacion: fec_recuperacion,
                    fecha: fecha,
                    fila: fila
                };
                datos_totales.push(fila_datos);
            }));
            fs_1.default.unlinkSync(filePath);
            ver_fecha = ver_recuperacion = datos_totales;
            // VERIFICACIÓN DE FECHAS DUPLICADAS DENTRO DE LA MISMA PLANTILLA
            for (var i = 0; i <= datos_totales.length - 1; i++) {
                for (var j = 0; j <= datos_totales.length - 1; j++) {
                    // NO SE LEE LA MISMA FILA EN LOS DATOS
                    if (i != j) {
                        // VERIFICAR SI LA FECHA SE ENCUENTRA DUPLICADA EN LAS DEMÁS FILAS 
                        if (ver_fecha[i].fecha === ver_fecha[j].fecha) {
                            contarFecha = contarFecha + 1;
                            fechaDuplicada = fechaDuplicada + ' - Fila ' + ver_fecha[i].fila +
                                ' similar a la fila ' + ver_fecha[j].fila + '.';
                            ver_fecha.splice(i, 1);
                        }
                        // SE REALIZA VERIFICACIÓN SI EXISTE FECHA DE RECUPERACIÓN
                        if (ver_recuperacion[i].fec_recuperacion != undefined) {
                            // VERIFICAR SI LA FECHA DE RECUPERACIÓN SE ENCUENTRA DUPLICADA EN LAS DEMÁS FILAS 
                            if (ver_recuperacion[i].fec_recuperacion === ver_recuperacion[j].fec_recuperacion) {
                                contarRecuperacion = contarRecuperacion + 1;
                                recuperacionDuplicada = recuperacionDuplicada + ' - Fila ' + ver_fecha[i].fila +
                                    ' similar a la fila ' + ver_fecha[j].fila + '.';
                                ver_recuperacion.splice(i, 1);
                            }
                        }
                    }
                    // VERIFICAR SI LA FECHA DE FERIADO ES IGUAL A UNA FECHA DE RECUPERACIÓN
                    if (datos_totales[i].fecha === datos_totales[j].fec_recuperacion) {
                        fecha_recuperacion = fecha_recuperacion + 1;
                        fechaIgualRecupera = fechaIgualRecupera + ' - Campo fecha Fila ' + datos_totales[i].fila +
                            ' similar a campo fec_recuperacion fila ' + datos_totales[j].fila + '.';
                    }
                }
                contador = contador + 1;
            }
            // ENVIO DE MENSAJES DE EVENTOS DESPUÉS DE LEER TODA LA PLANTILLA
            if ((contador - 1) === plantilla.length) {
                if (contarFecha === 0) {
                    if (contarRecuperacion === 0) {
                        if (fecha_recuperacion === 0) {
                            return res.jsonp({ message: 'CORRECTO' });
                        }
                        else {
                            return res.jsonp({ message: 'SIMILAR FECHA-RECUPERACION', data: fechaIgualRecupera });
                        }
                    }
                    else {
                        return res.jsonp({ message: 'ERROR RECUPERACION', data: recuperacionDuplicada });
                    }
                }
                else {
                    return res.jsonp({ message: 'ERROR FECHA', data: fechaDuplicada });
                }
            }
        });
    }
    // INGRESAR DATOS DE FERIADOS MEDIANTE PLANTILLA
    CrearFeriadoPlantilla(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = req.files;
            let cadena = list.uploads[0].path;
            let filename = cadena.split("\\")[1];
            var filePath = `./plantillas/${filename}`;
            var contador = 1;
            const workbook = xlsx_1.default.readFile(filePath);
            const sheet_name_list = workbook.SheetNames;
            const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            // LECTURA DE DATOS DE LA PLANTILLA
            plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                const { fecha, descripcion, fec_recuperacion } = data;
                // VERIFICACIÓN DE EXISTENCIA DE DATOS DE FECHA DE RECUPERACIÓN
                if (fec_recuperacion === undefined) {
                    var recuperar = null;
                }
                else {
                    recuperar = fec_recuperacion;
                }
                // REGISTRO DE DATOS EN EL SISTEMA
                yield database_1.default.query('INSERT INTO cg_feriados (fecha, descripcion, fec_recuperacion) ' +
                    'VALUES ($1, $2, $3)', [fecha, descripcion, recuperar]);
                // ENVIO DE MENSAJE UNA VEZ QUE SE HA LEIDO TODOS LOS DATOS DE LA PLANTILLA
                if (contador === plantilla.length) {
                    return res.jsonp({ message: 'CORRECTO' });
                }
                contador = contador + 1;
            }));
            fs_1.default.unlinkSync(filePath);
        });
    }
}
const FERIADOS_CONTROLADOR = new FeriadosControlador();
exports.default = FERIADOS_CONTROLADOR;
