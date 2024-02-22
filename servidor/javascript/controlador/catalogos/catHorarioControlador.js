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
    // METODO PARA CARGAR HORARIOS Y DETALLES DE UNA PLANTILLA EN LA BASE DE DATOS
    CargarHorarioPlantilla(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { horarios, detalles } = req.body;
                let horariosCargados = true;
                let detallesCargados = true;
                let codigosHorariosCargados = [];
                // SI HORARIOS NO ESTA VACIO CARGAR EN LA BASE DE DATOS
                if (horarios.length > 0) {
                    // CARGAR HORARIOS
                    for (const horario of horarios) {
                        let { DESCRIPCION, CODIGO_HORARIO, HORAS_TOTALES, MIN_ALIMENTACION, TIPO_HORARIO, HORARIO_NOCTURNO } = horario;
                        //CAMBIAR TIPO DE HORARIO Laborable = N, Libre = L, Feriado = FD
                        switch (TIPO_HORARIO) {
                            case 'Laborable':
                                TIPO_HORARIO = 'N';
                                break;
                            case 'Libre':
                                TIPO_HORARIO = 'L';
                                break;
                            case 'Feriado':
                                TIPO_HORARIO = 'FD';
                                break;
                        }
                        // CAMBIAR HORARIO_NOCTURNO
                        switch (HORARIO_NOCTURNO) {
                            case 'Si':
                                HORARIO_NOCTURNO = true;
                                break;
                            case 'No':
                                HORARIO_NOCTURNO = false;
                                break;
                            default:
                                HORARIO_NOCTURNO = false;
                                break;
                        }
                        // FORMATEAR HORAS_TOTALES
                        HORAS_TOTALES = FormatearHoras(horario.HORAS_TOTALES.toString(), horario.DETALLE);
                        // INSERTAR EN LA BASE DE DATOS
                        const response = yield database_1.default.query(`
            INSERT INTO cg_horarios (nombre, min_almuerzo, hora_trabajo,
            nocturno, detalle, codigo, default_) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
            `, [DESCRIPCION, MIN_ALIMENTACION, HORAS_TOTALES, HORARIO_NOCTURNO, true, CODIGO_HORARIO, TIPO_HORARIO]);
                        const [correcto] = response.rows;
                        if (correcto) {
                            horariosCargados = true;
                        }
                        else {
                            horariosCargados = false;
                        }
                        const idHorario = correcto.id;
                        const codigoHorario = correcto.codigo;
                        codigosHorariosCargados.push({ codigoHorario, idHorario });
                    }
                }
                // SI DETALLES NO ESTA VACIO CARGAR EN LA BASE DE DATOS
                if (detalles.length > 0) {
                    // CARGAR DETALLES
                    for (const detalle of detalles) {
                        let { CODIGO_HORARIO, TIPO_ACCION, HORA, ORDEN, SALIDA_SIGUIENTE_DIA, SALIDA_TERCER_DIA, MIN_ANTES, MIN_DESPUES } = detalle;
                        // CAMBIAR TIPO DE ACCION Entrada = E, Inicio alimentacion = I/A, Fin alimentacion = F/A, Salida = S
                        switch (TIPO_ACCION) {
                            case 'Entrada':
                                TIPO_ACCION = 'E';
                                break;
                            case 'Inicio alimentación':
                                TIPO_ACCION = 'I/A';
                                break;
                            case 'Fin alimentación':
                                TIPO_ACCION = 'F/A';
                                break;
                            case 'Salida':
                                TIPO_ACCION = 'S';
                                break;
                        }
                        // CAMBIAR SALIDA_SIGUIENTE_DIA
                        switch (SALIDA_SIGUIENTE_DIA) {
                            case 'Si':
                                SALIDA_SIGUIENTE_DIA = true;
                                break;
                            case 'No':
                                SALIDA_SIGUIENTE_DIA = false;
                                break;
                            default:
                                SALIDA_SIGUIENTE_DIA = false;
                                break;
                        }
                        // CAMBIAR SALIDA_TERCER_DIA
                        switch (SALIDA_TERCER_DIA) {
                            case 'Si':
                                SALIDA_TERCER_DIA = true;
                                break;
                            case 'No':
                                SALIDA_TERCER_DIA = false;
                                break;
                            default:
                                SALIDA_TERCER_DIA = false;
                                break;
                        }
                        // CAMBIAR CODIGO_HORARIO POR EL ID DEL HORARIO CORRESPONDIENTE
                        const ID_HORARIO = (_a = (codigosHorariosCargados.find((codigo) => codigo.codigoHorario === CODIGO_HORARIO))) === null || _a === void 0 ? void 0 : _a.idHorario;
                        // INSERTAR EN LA BASE DE DATOS
                        const response2 = yield database_1.default.query(`
            INSERT INTO deta_horarios (orden, hora, minu_espera, id_horario, tipo_accion, segundo_dia, tercer_dia, min_antes,
                min_despues) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [ORDEN, HORA, 0, ID_HORARIO, TIPO_ACCION, SALIDA_SIGUIENTE_DIA, SALIDA_TERCER_DIA, MIN_ANTES, MIN_DESPUES]);
                        if (response2.rowCount > 0) {
                            detallesCargados = true;
                        }
                        else {
                            detallesCargados = false;
                        }
                    }
                }
                if (horariosCargados && detallesCargados) {
                    return res.status(200).jsonp({ message: 'correcto' });
                }
                else {
                    return res.status(400).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                return res.status(400).jsonp({ message: error });
            }
        });
    }
    // METODO PARA VERIFICAR LOS DATOS DE LA PLANTILLA DE HORARIOS Y DETALLES
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
            let codigos = [];
            for (const [index, data] of plantillaHorarios.entries()) {
                let { DESCRIPCION, CODIGO_HORARIO, HORAS_TOTALES, MIN_ALIMENTACION, TIPO_HORARIO, HORARIO_NOCTURNO } = data;
                if (MIN_ALIMENTACION === undefined) {
                    data.MIN_ALIMENTACION = 0;
                }
                if (HORARIO_NOCTURNO === undefined) {
                    data.HORARIO_NOCTURNO = 'No';
                }
                // VERIFICAR QUE LOS DATOS OBLIGATORIOS EXISTAN
                const requiredValues = ['DESCRIPCION', 'CODIGO_HORARIO', 'TIPO_HORARIO', 'HORAS_TOTALES', 'HORARIO_NOCTURNO'];
                let faltanDatos = false;
                for (const key of requiredValues) {
                    if (data[key] === undefined) {
                        data[key] = 'No registrado';
                        faltanDatos = true;
                    }
                }
                if (faltanDatos) {
                    data.OBSERVACION = 'Faltan datos requeridos';
                    continue;
                }
                codigos.push(CODIGO_HORARIO.toString());
                if (VerificarDuplicado(codigos, CODIGO_HORARIO.toString())) {
                    data.OBSERVACION = 'Registro duplicado';
                    continue;
                }
                const verificacion = VerificarFormatoDatos(data);
                if (verificacion[0]) {
                    data.OBSERVACION = verificacion[1];
                    continue;
                }
                if (yield VerificarDuplicadoBase(CODIGO_HORARIO.toString())) {
                    data.OBSERVACION = 'Ya existe en el sistema';
                    continue;
                }
                data.OBSERVACION = 'Ok';
                if (data.OBSERVACION === 'Ok') {
                    plantillaHorarios[index] = ValidarHorasTotales(data);
                }
            }
            ;
            for (const data of plantillaDetalles) {
                let { CODIGO_HORARIO, TIPO_ACCION, HORA, SALIDA_SIGUIENTE_DIA, MIN_ANTES, MIN_DESPUES } = data;
                let orden = 0;
                // VERIFICAR QUE LOS DATOS OBLIGATORIOS EXISTAN
                const requiredValues = [CODIGO_HORARIO, TIPO_ACCION, HORA];
                if (requiredValues.some(value => value === undefined)) {
                    data.OBSERVACION = 'Faltan datos requeridos';
                    continue;
                }
                switch (TIPO_ACCION.toLowerCase()) {
                    case 'entrada':
                        orden = 1;
                        break;
                    case 'inicio alimentación':
                    case 'inicio alimentacion':
                        orden = 2;
                        break;
                    case 'fin alimentación':
                    case 'fin alimentacion':
                        orden = 3;
                        break;
                    case 'salida':
                        orden = 4;
                        break;
                }
                data.ORDEN = orden;
                data.MIN_ANTES = MIN_ANTES !== null && MIN_ANTES !== void 0 ? MIN_ANTES : 0;
                data.MIN_DESPUES = MIN_DESPUES !== null && MIN_DESPUES !== void 0 ? MIN_DESPUES : 0;
                data.SALIDA_SIGUIENTE_DIA = SALIDA_SIGUIENTE_DIA !== null && SALIDA_SIGUIENTE_DIA !== void 0 ? SALIDA_SIGUIENTE_DIA : 'No';
                if (!VerificarCodigoHorarioDetalleHorario(CODIGO_HORARIO.toString(), plantillaHorarios)) {
                    data.OBSERVACION = 'Codigo de horario no existe';
                    continue;
                }
                const verificacion = VerificarFormatoDetalleHorario(data);
                if (verificacion[0]) {
                    data.OBSERVACION = verificacion[1];
                    continue;
                }
                data.OBSERVACION = 'Ok';
            }
            ;
            const detallesAgrupados = AgruparDetalles(plantillaDetalles);
            const detallesAgrupadosVerificados = VerificarDetallesAgrupados(detallesAgrupados, plantillaHorarios);
            // CAMBIAR OBSERVACIONES DE PLANTILLADETALLES SEGUN LOS CODIGOS QUE NO CUMPLAN CON LOS REQUISITOS
            for (const codigo of detallesAgrupadosVerificados) {
                const detalles = plantillaDetalles.filter((detalle) => detalle.CODIGO_HORARIO === codigo.codigo);
                for (const detalle of detalles) {
                    detalle.OBSERVACION = codigo.observacion;
                }
            }
            // VERIFICAR EXISTENCIA DE DETALLES PARA CADA HORARIO
            plantillaHorarios.forEach((horario) => {
                if (horario.OBSERVACION === 'Ok') {
                    const detallesCorrespondientes = plantillaDetalles.filter((detalle) => detalle.CODIGO_HORARIO === horario.CODIGO_HORARIO && detalle.OBSERVACION === 'Ok');
                    horario.DETALLE = detallesCorrespondientes.length > 0;
                }
            });
            const horariosOk = plantillaHorarios.filter((horario) => horario.OBSERVACION === 'Ok');
            // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
            fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                if (err) {
                }
                else {
                    // ELIMINAR DEL SERVIDOR
                    fs_1.default.unlinkSync(ruta);
                }
            });
            const mensaje = horariosOk.length > 0 ? 'correcto' : 'error';
            res.json({ plantillaHorarios, plantillaDetalles, mensaje });
        });
    }
}
// FUNCION PARA VERIFICAR SI EXISTEN DATOS DUPLICADOS EN LA PLANTILLA
function VerificarDuplicado(codigos, codigo) {
    const valores = codigos.filter((valor) => valor.toLowerCase() === codigo.toLowerCase());
    const duplicado = valores.length > 1;
    return duplicado;
}
// FUNCION PARA VERIFICAR QUE LOS TIPOS DE DATOS EN LOS HORARIOS SEAN LOS CORRECTOS
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
        const result = yield database_1.default.query('SELECT * FROM cg_horarios WHERE LOWER(codigo) = $1', [codigo.toLowerCase()]);
        return result.rowCount > 0;
    });
}
// FUNCION PARA COMPROBAR QUE CODIGO_HORARIO EXISTA EN PLANTILLAHORARIOS
function VerificarCodigoHorarioDetalleHorario(codigo, plantillaHorarios) {
    const result = plantillaHorarios.filter((valor) => valor.CODIGO_HORARIO == codigo && valor.OBSERVACION == 'Ok');
    return result.length > 0;
}
// FUNCION PARA COMPROBAR LOS FORMATOS DE LOS DATOS EN LA PLANTILLA DETALLE HORARIO
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
// FUNCION PARA AGRUPAR LOS DETALLES QUE PERTENEZCAN A UN MISMO HORARIO
function AgruparDetalles(plantillaDetalles) {
    const result = plantillaDetalles.reduce((r, a) => {
        r[a.CODIGO_HORARIO] = [...r[a.CODIGO_HORARIO] || [], a];
        return r;
    }, {});
    return result;
}
// FUNCION PARA VERIFICAR QUE LOS DETALLES AGRUPADOS ESTEN COMPLETOS PARA CADA HORARIO
// Y VALIDAR QUE LA SUMA DE HORAS DE ENTRADA Y SALIDA SEA IGUAL A HORAS_TOTALES
function VerificarDetallesAgrupados(detallesAgrupados, horarios) {
    horarios = horarios.filter((horario) => horario.OBSERVACION === 'Ok');
    let codigosHorarios = horarios.map((horario) => horario.CODIGO_HORARIO);
    let codigosDetalles = [];
    // FILTRAR DETALLES QUE TENGAN CODIGO_HORARIO EN HORARIOS
    for (const codigoHorario in detallesAgrupados) {
        if (!codigosHorarios.includes(codigoHorario)) {
            delete detallesAgrupados[codigoHorario];
        }
    }
    for (const codigoHorario in detallesAgrupados) {
        const detalles = detallesAgrupados[codigoHorario].filter((detalle) => detalle.OBSERVACION === 'Ok');
        const horario = horarios.find(h => h.CODIGO_HORARIO === codigoHorario);
        if (horario) {
            const tieneAlimentacion = horario.MIN_ALIMENTACION > 0;
            const tiposAccionRequeridos = tieneAlimentacion ? ['Entrada', 'Inicio alimentación', 'Fin alimentación', 'Salida'] : ['Entrada', 'Salida'];
            const tiposAccionExistentes = detalles.map((detalle) => detalle.TIPO_ACCION);
            if (tiposAccionExistentes.length < tiposAccionRequeridos.length) {
                codigosDetalles.push({ codigo: codigoHorario, observacion: `Requerido ${tiposAccionRequeridos.length} detalles` });
            }
            else if (tiposAccionExistentes.length > tiposAccionRequeridos.length) {
                codigosDetalles.push({ codigo: codigoHorario, observacion: `Requerido solo ${tiposAccionRequeridos.length} detalles` });
            }
            //VERIFICAR QUE EN LOS TIPOSACCIONEXISTENTES ESTEN TODOS LOS TIPOSACCIONREQUERIDOS
            else if (tiposAccionRequeridos.some((tipo) => !tiposAccionExistentes.includes(tipo))) {
                codigosDetalles.push({ codigo: codigoHorario, observacion: `No cumple con los tipos de acción requeridos` });
            }
            else {
                //VERIFICAR QUE SALIDA MENOS ENTRADA SEA IGUAL A HORAS_TOTALES
                const entrada = detalles.find((detalle) => detalle.TIPO_ACCION === 'Entrada');
                const salida = detalles.find((detalle) => detalle.TIPO_ACCION === 'Salida');
                const horaEntrada = (0, moment_1.default)(entrada.HORA, 'HH:mm');
                const horaSalida = (0, moment_1.default)(salida.HORA, 'HH:mm');
                // SI EL HORARIO TIENE SALIDA AL OTRO DIA SE DEBE SUMAR 24 HORAS A LA SALIDA
                if (salida.SALIDA_SIGUIENTE_DIA.toLowerCase() == 'si') {
                    console.log('salida siguiente dia');
                    horaSalida.add(1, 'days');
                }
                console.log('horaEntrada ', horaEntrada);
                console.log('horaSalida ', horaSalida);
                const diferencia = horaSalida.diff(horaEntrada, 'minutes');
                const horasTotalesEnMinutos = convertirHorasTotalesAMinutos(horario.HORAS_TOTALES.toString());
                console.log('diferencia ', diferencia);
                console.log('horasTotalesEnMinutos ', horasTotalesEnMinutos);
                console.log(codigoHorario);
                if (diferencia !== horasTotalesEnMinutos) {
                    codigosDetalles.push({ codigo: codigoHorario, observacion: 'No cumple con las horas totales' });
                }
            }
        }
    }
    return codigosDetalles;
}
function convertirHorasTotalesAMinutos(horasTotales) {
    if (horasTotales.includes(':')) {
        const [horas, minutos] = horasTotales.split(':').map(Number);
        return horas * 60 + minutos;
    }
    else {
        return Number(horasTotales) * 60;
    }
}
// FUNCION PARA FORMATEAR HORAS
function FormatearHoras(hora, detalle) {
    let partes = hora.split(':');
    let horas = parseInt(partes[0]);
    let minutos = partes[1] || '00';
    let horasStr = horas.toString();
    if (horas < 10) {
        horasStr = '0' + horasStr;
    }
    if (detalle) {
        minutos += ':00';
    }
    return `${horasStr}:${minutos}`;
}
//FUNCION PARA VALIDAR SI EL HORARIO ES >= 24:00 Y < 72:00 (NO DETALLES DE ALIMENTACION
function ValidarHorasTotales(horario) {
    const hora = FormatearHoras(horario.HORAS_TOTALES.toString(), true);
    if ((hora >= '24:00' && hora < '72:00') ||
        (hora >= '24:00:00' && hora < '72:00:00') ||
        hora >= '72:00' ||
        hora >= '72:00:00') {
        horario.MIN_ALIMENTACION = 0;
    }
    return horario;
}
exports.HORARIO_CONTROLADOR = new HorarioControlador();
exports.default = exports.HORARIO_CONTROLADOR;
