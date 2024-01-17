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
exports.HORARIO_CONTROLADOR = void 0;
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = __importDefault(require("../../database"));
const xlsx_1 = __importDefault(require("xlsx"));
const moment_1 = __importDefault(require("moment"));
const builder = require('xmlbuilder');
class HorarioControlador {
    // REGISTRAR HORARIO
    CrearHorario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, min_almuerzo, hora_trabajo, nocturno, detalle, codigo, default_ } = req.body;
            try {
                const response = yield database_1.default.query(`
      INSERT INTO cg_horarios (nombre, min_almuerzo, hora_trabajo,
      nocturno, detalle, codigo, default_) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
      `, [nombre, min_almuerzo, hora_trabajo, nocturno, detalle, codigo, default_]);
                const [horario] = response.rows;
                if (horario) {
                    return res.status(200).jsonp(horario);
                }
                else {
                    return res.status(404).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                console.log('error ', error);
                return res.status(400).jsonp({ message: error });
            }
        });
    }
    // BUSCAR HORARIOS POR EL NOMBRE
    BuscarHorarioNombre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { codigo } = req.body;
            try {
                const HORARIOS = yield database_1.default.query(`
        SELECT * FROM cg_horarios WHERE UPPER(codigo) = $1
        `, [codigo.toUpperCase()]);
                if (HORARIOS.rowCount > 0)
                    return res.status(200).jsonp({ message: 'No se encuentran registros.' });
                return res.status(404).jsonp({ message: 'No existe horario. Continua.' });
            }
            catch (error) {
                return res.status(400).jsonp({ message: error });
            }
        });
    }
    // GUARDAR DOCUMENTO DE HORARIO
    GuardarDocumentoHorario(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let id = req.params.id;
            let { archivo, codigo } = req.params;
            // FECHA DEL SISTEMA
            var fecha = (0, moment_1.default)();
            var anio = fecha.format('YYYY');
            var mes = fecha.format('MM');
            var dia = fecha.format('DD');
            // LEER DATOS DE IMAGEN
            let documento = id + '_' + codigo + '_' + anio + '_' + mes + '_' + dia + '_' + ((_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname);
            let separador = path_1.default.sep;
            yield database_1.default.query(`
      UPDATE cg_horarios SET documento = $2 WHERE id = $1
      `, [id, documento]);
            res.jsonp({ message: 'Documento actualizado.' });
            if (archivo != 'null' && archivo != '' && archivo != null) {
                if (archivo != documento) {
                    let ruta = (0, accesoCarpetas_1.ObtenerRutaHorarios)() + separador + archivo;
                    // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                    fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                        if (err) {
                        }
                        else {
                            // ELIMINAR DEL SERVIDOR
                            fs_1.default.unlinkSync(ruta);
                        }
                    });
                }
            }
        });
    }
    // METODO PARA ACTUALIZAR DATOS DE HORARIO
    EditarHorario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const { nombre, min_almuerzo, hora_trabajo, nocturno, detalle, codigo, default_ } = req.body;
            try {
                const respuesta = yield database_1.default.query(`
        UPDATE cg_horarios SET nombre = $1, min_almuerzo = $2, hora_trabajo = $3,  
        nocturno = $4, detalle = $5, codigo = $6, default_ = $7
        WHERE id = $8 RETURNING *
        `, [nombre, min_almuerzo, hora_trabajo, nocturno, detalle, codigo, default_, id,])
                    .then((result) => { return result.rows; });
                if (respuesta.length === 0)
                    return res.status(400).jsonp({ message: 'error' });
                return res.status(200).jsonp(respuesta);
            }
            catch (error) {
                return res.status(400).jsonp({ message: error });
            }
        });
    }
    // ELIMINAR DOCUMENTO HORARIO BASE DE DATOS - SERVIDOR
    EliminarDocumento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { documento, id } = req.body;
            let separador = path_1.default.sep;
            yield database_1.default.query(`
            UPDATE cg_horarios SET documento = null WHERE id = $1
            `, [id]);
            if (documento != 'null' && documento != '' && documento != null) {
                let ruta = (0, accesoCarpetas_1.ObtenerRutaHorarios)() + separador + documento;
                // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                    if (err) {
                    }
                    else {
                        // ELIMINAR DEL SERVIDOR
                        fs_1.default.unlinkSync(ruta);
                    }
                });
            }
            res.jsonp({ message: 'Documento actualizado.' });
        });
    }
    // ELIMINAR DOCUMENTO HORARIO DEL SERVIDOR
    EliminarDocumentoServidor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { documento } = req.body;
            let separador = path_1.default.sep;
            if (documento != 'null' && documento != '' && documento != null) {
                let ruta = (0, accesoCarpetas_1.ObtenerRutaHorarios)() + separador + documento;
                // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                    if (err) {
                    }
                    else {
                        // ELIMINAR DEL SERVIDOR
                        fs_1.default.unlinkSync(ruta);
                    }
                });
            }
            res.jsonp({ message: 'Documento actualizado.' });
        });
    }
    // BUSCAR LISTA DE CATALOGO HORARIOS  --**VERIFICADO
    ListarHorarios(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const HORARIOS = yield database_1.default.query(`
      SELECT * FROM cg_horarios ORDER BY codigo ASC
      `);
            if (HORARIOS.rowCount > 0) {
                return res.jsonp(HORARIOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA BUSCAR HORARIOS SIN CONSIDERAR UNO EN ESPECIFICO (METODO DE EDICION)
    BuscarHorarioNombre_(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, codigo } = req.body;
            try {
                const HORARIOS = yield database_1.default.query(`
        SELECT * FROM cg_horarios WHERE NOT id = $1 AND UPPER(codigo) = $2)
        `, [parseInt(id), codigo.toUpperCase()]);
                if (HORARIOS.rowCount > 0)
                    return res.status(200).jsonp({
                        message: 'El nombre de horario ya existe, ingresar un nuevo nombre.'
                    });
                return res.status(404).jsonp({ message: 'No existe horario. Continua.' });
            }
            catch (error) {
                return res.status(400).jsonp({ message: error });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTROS
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield database_1.default.query(`
      DELETE FROM cg_horarios WHERE id = $1
      `, [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    // METODO PARA BUSCAR DATOS DE UN HORARIO
    ObtenerUnHorario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const UN_HORARIO = yield database_1.default.query(`
      SELECT * FROM cg_horarios WHERE id = $1
      `, [id]);
            if (UN_HORARIO.rowCount > 0) {
                return res.jsonp(UN_HORARIO.rows);
            }
            else {
                res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA EDITAR HORAS TRABAJADAS
    EditarHorasTrabaja(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const { hora_trabajo } = req.body;
            try {
                const respuesta = yield database_1.default.query(`
        UPDATE cg_horarios SET hora_trabajo = $1 WHERE id = $2 RETURNING *
        `, [hora_trabajo, id])
                    .then((result) => { return result.rows; });
                if (respuesta.length === 0)
                    return res.status(400).jsonp({ message: 'No actualizado.' });
                return res.status(200).jsonp(respuesta);
            }
            catch (error) {
                return res.status(400).jsonp({ message: error });
            }
        });
    }
    // METODO PARA BUSCAR DOCUMENTO
    ObtenerDocumento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const docs = req.params.docs;
            let separador = path_1.default.sep;
            let ruta = (0, accesoCarpetas_1.ObtenerRutaHorarios)() + separador + docs;
            fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                if (err) {
                }
                else {
                    res.sendFile(path_1.default.resolve(ruta));
                }
            });
        });
    }
    CargarHorarioPlantilla(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Cargar');
            // let list: any = req.files;
            // let cadena = list.uploads[0].path;
            // let filename = cadena.split("\\")[1];
            // var filePath = `./plantillas/${filename}`
            // const workbook = excel.readFile(filePath);
            // const sheet_name_list = workbook.SheetNames; // Array de hojas de calculo
            // const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            // /** Horarios */
            // plantilla.forEach(async (data: any) => {
            //   var { nombre_horario, minutos_almuerzo, hora_trabajo, horario_nocturno } = data;
            //   if (minutos_almuerzo != undefined) {
            //     await pool.query('INSERT INTO cg_horarios (nombre, min_almuerzo, hora_trabajo, nocturno) VALUES ($1, $2, $3, $4)', [nombre_horario, minutos_almuerzo, hora_trabajo, horario_nocturno]);
            //     res.jsonp({ message: 'correcto' });
            //   } else {
            //     minutos_almuerzo = 0;
            //     await pool.query('INSERT INTO cg_horarios (nombre, min_almuerzo, hora_trabajo, nocturno) VALUES ($1, $2, $3, $4)', [nombre_horario, minutos_almuerzo, hora_trabajo, horario_nocturno]);
            //     res.jsonp({ message: 'correcto' });
            //   }
            // });
            // // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
            // fs.access(filePath, fs.constants.F_OK, (err) => {
            //   if (err) {
            //   } else {
            //     // ELIMINAR DEL SERVIDOR
            //     fs.unlinkSync(filePath);
            //   }
            // });
        });
    }
    /** Verificar si existen datos duplicados dentro del sistema */
    VerificarDatos(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
            let separador = path_1.default.sep;
            let ruta = (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)() + separador + documento;
            const workbook = xlsx_1.default.readFile(ruta);
            const sheet_name_list = workbook.SheetNames;
            const plantillaHorarios = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            let plantillaDetalles = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[1]]);
            plantillaDetalles = plantillaDetalles.filter((valor) => valor.CODIGO_HORARIO !== undefined);
            console.log('plantillaDetalles', plantillaDetalles);
            let codigos = [];
            for (const data of plantillaHorarios) {
                let { DESCRIPCION, CODIGO_HORARIO, HORAS_TOTALES, MIN_ALIMENTACION, TIPO_HORARIO, HORARIO_NOCTURNO } = data;
                if (MIN_ALIMENTACION === undefined) {
                    data.MIN_ALIMENTACION = 0;
                }
                if (HORARIO_NOCTURNO === undefined) {
                    data.HORARIO_NOCTURNO = 'No';
                }
                // VERIFICAR QUE LOS DATOS OBLIGATORIOS EXISTAN
                const requiredValues = [DESCRIPCION, CODIGO_HORARIO, TIPO_HORARIO, HORAS_TOTALES, HORARIO_NOCTURNO];
                if (requiredValues.some(value => value === undefined)) {
                    data.OBSERVACION = 'Faltan valores obligatorios';
                    continue;
                }
                codigos.push(CODIGO_HORARIO.toString());
                if (VerificarDuplicado(codigos, CODIGO_HORARIO.toString())) {
                    data.OBSERVACION = 'Registro duplicado';
                    continue;
                }
                if (VerificarFormatoDatos(data)[0]) {
                    data.OBSERVACION = VerificarFormatoDatos(data)[1];
                    continue;
                }
                if (yield VerificarDuplicadoBase(CODIGO_HORARIO.toString())) {
                    data.OBSERVACION = 'Ya esta registrado en la base de datos';
                    continue;
                }
                data.OBSERVACION = 'Ok';
            }
            ;
            for (const data of plantillaDetalles) {
                let { CODIGO_HORARIO, TIPO_ACCION, HORA, SALIDA_SIGUIENTE_DIA, MIN_ANTES, MIN_DESPUES } = data;
                // VERIFICAR QUE LOS DATOS OBLIGATORIOS EXISTAN
                const requiredValues = [CODIGO_HORARIO, TIPO_ACCION, HORA];
                if (requiredValues.some(value => value === undefined)) {
                    data.OBSERVACION = 'Faltan valores obligatorios';
                    continue;
                }
                if (MIN_ANTES === undefined) {
                    data.MIN_ANTES = 0;
                }
                if (MIN_DESPUES === undefined) {
                    data.MIN_DESPUES = 0;
                }
                if (SALIDA_SIGUIENTE_DIA === undefined) {
                    data.SALIDA_SIGUIENTE_DIA = 'No';
                }
                if (!VerificarCodigoHorarioDetalleHorario(CODIGO_HORARIO.toString(), plantillaHorarios)) {
                    data.OBSERVACION = 'Codigo de horario no existe en los horarios validos';
                    continue;
                }
                if (VerificarFormatoDetalleHorario(data)[0]) {
                    data.OBSERVACION = VerificarFormatoDetalleHorario(data)[1];
                    continue;
                }
                data.OBSERVACION = 'Ok';
            }
            ;
            // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
            fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                if (err) {
                }
                else {
                    // ELIMINAR DEL SERVIDOR
                    fs_1.default.unlinkSync(ruta);
                }
            });
            res.json({ plantillaHorarios, plantillaDetalles });
        });
    }
}
// FUNCION PARA VERIFICAR SI EXISTEN DATOS DUPLICADOS EN LA PLANTILLA
function VerificarDuplicado(codigos, codigo) {
    const valores = codigos.filter((valor) => valor == codigo);
    const duplicado = valores.length > 1;
    return duplicado;
}
//FUNCION PARA VERIFICAR QUE LOS TIPOS DE DATOS SEAN LOS CORRECTOS
function VerificarFormatoDatos(data) {
    let observacion = '';
    let error = true;
    const { HORAS_TOTALES, MIN_ALIMENTACION, TIPO_HORARIO, HORARIO_NOCTURNO } = data;
    const horasTotalesFormatoCorrecto = /^(\d+)$|^(\d{1,2}:\d{2})$|^(\d{1,2}:\d{2}:\d{2})$/.test(HORAS_TOTALES);
    const minAlimentacionFormatoCorrecto = /^\d+$/.test(MIN_ALIMENTACION);
    const tipoHorarioValido = ['Laborable', 'Libre', 'Feriado'].includes(TIPO_HORARIO);
    const tipoHorarioNocturnoValido = ['Si', 'No'].includes(HORARIO_NOCTURNO);
    horasTotalesFormatoCorrecto ? null : observacion = 'Formato de HORAS_TOTALES incorrecto';
    minAlimentacionFormatoCorrecto ? null : observacion = 'Formato de MIN_ALIMENTACION incorrecto';
    tipoHorarioValido ? null : observacion = 'Tipo de horario incorrecto';
    tipoHorarioNocturnoValido ? null : observacion = 'Tipo de horario nocturno incorrecto';
    error = horasTotalesFormatoCorrecto && minAlimentacionFormatoCorrecto && tipoHorarioValido && tipoHorarioNocturnoValido ? false : true;
    return [error, observacion];
}
// FUNCION PARA VERIFICAR SI EXISTEN DATOS DUPLICADOS EN LA BASE DE DATOS
function VerificarDuplicadoBase(codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield database_1.default.query('SELECT * FROM cg_horarios WHERE UPPER(codigo) = $1', [codigo.toUpperCase()]);
        return result.rowCount > 0;
    });
}
//FUNCION PARA COMBROBAR QUE CODIGO_HORARIO EXISTA EN PLANTILLAHORARIOS
function VerificarCodigoHorarioDetalleHorario(codigo, plantillaHorarios) {
    const result = plantillaHorarios.filter((valor) => valor.CODIGO_HORARIO == codigo && valor.OBSERVACION == 'Ok');
    console.log('result', codigo, result);
    return result.length > 0;
}
//FUNCION PARA COMPROBAR FORMATO DE PLANILLA DETALLE HORARIO
function VerificarFormatoDetalleHorario(data) {
    let observacion = '';
    let error = true;
    const { HORA, MIN_ANTES, MIN_DESPUES } = data;
    const horaFormatoCorrecto = /^(\d{1,2}:\d{2})$|^(\d{1,2}:\d{2}:\d{2})$/.test(HORA);
    const minAntesFormatoCorrecto = /^\d+$/.test(MIN_ANTES);
    const minDespuesFormatoCorrecto = /^\d+$/.test(MIN_DESPUES);
    horaFormatoCorrecto ? null : observacion = 'Formato de HORA incorrecto';
    minAntesFormatoCorrecto ? null : observacion = 'Formato de MIN_ANTES INCORRECTO';
    minDespuesFormatoCorrecto ? null : observacion = 'Formato de MIN_DESPUES INCORRECTO';
    error = horaFormatoCorrecto && minAntesFormatoCorrecto && minDespuesFormatoCorrecto ? false : true;
    return [error, observacion];
}
exports.HORARIO_CONTROLADOR = new HorarioControlador();
exports.default = exports.HORARIO_CONTROLADOR;
