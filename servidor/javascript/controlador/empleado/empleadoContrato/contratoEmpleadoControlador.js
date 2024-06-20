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
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
const accesoCarpetas_2 = require("../../../libs/accesoCarpetas");
const moment_1 = __importDefault(require("moment"));
const xlsx_1 = __importDefault(require("xlsx"));
const database_1 = __importDefault(require("../../../database"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class ContratoEmpleadoControlador {
    // REGISTRAR CONTRATOS
    CrearContrato(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado, fec_ingreso, fec_salida, vaca_controla, asis_controla, id_regimen, id_tipo_contrato } = req.body;
            const response = yield database_1.default.query(`
            INSERT INTO eu_empleado_contratos (id_empleado, fecha_ingreso, fecha_salida, controlar_vacacion, 
            controlar_asistencia, id_regimen, id_modalidad_laboral) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
            `, [id_empleado, fec_ingreso, fec_salida, vaca_controla, asis_controla, id_regimen,
                id_tipo_contrato]);
            const [contrato] = response.rows;
            if (contrato) {
                return res.status(200).jsonp(contrato);
            }
            else {
                return res.status(404).jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA GUARDAR DOCUMENTO
    GuardarDocumentoContrato(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // FECHA DEL SISTEMA
            var fecha = (0, moment_1.default)();
            var anio = fecha.format('YYYY');
            var mes = fecha.format('MM');
            var dia = fecha.format('DD');
            let id = req.params.id;
            const response = yield database_1.default.query(`
            SELECT codigo FROM eu_empleados AS e, eu_empleado_contratos AS c WHERE c.id = $1 AND c.id_empleado = e.id
            `, [id]);
            const [empleado] = response.rows;
            let documento = empleado.codigo + '_' + anio + '_' + mes + '_' + dia + '_' + ((_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname);
            yield database_1.default.query(`
            UPDATE eu_empleado_contratos SET documento = $2 WHERE id = $1
            `, [id, documento]);
            res.jsonp({ message: 'Documento actualizado.' });
        });
    }
    // METODO PARA VER DOCUMENTO
    ObtenerDocumento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const docs = req.params.docs;
            const id = req.params.id;
            let separador = path_1.default.sep;
            let ruta = (yield (0, accesoCarpetas_2.ObtenerRutaContrato)(id)) + separador + docs;
            fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                if (err) {
                }
                else {
                    res.sendFile(path_1.default.resolve(ruta));
                }
            });
        });
    }
    // METODO PARA LISTAR CONTRATOS POR ID DE EMPLEADO
    BuscarContratoEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const CONTRATO_EMPLEADO_REGIMEN = yield database_1.default.query(`
            SELECT ec.id, ec.fecha_ingreso, ec.fecha_salida 
            FROM eu_empleado_contratos AS ec
            WHERE ec.id_empleado = $1 ORDER BY ec.id ASC
            `, [id_empleado]);
            if (CONTRATO_EMPLEADO_REGIMEN.rowCount != 0) {
                return res.jsonp(CONTRATO_EMPLEADO_REGIMEN.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // EDITAR DATOS DE CONTRATO
    EditarContrato(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { fec_ingreso, fec_salida, vaca_controla, asis_controla, id_regimen, id_tipo_contrato } = req.body;
            yield database_1.default.query(`
            UPDATE eu_empleado_contratos SET fecha_ingreso = $1, fecha_salida = $2, controlar_vacacion = $3,
            controlar_asistencia = $4, id_regimen = $5, id_modalidad_laboral = $6 
            WHERE id = $7
            `, [fec_ingreso, fec_salida, vaca_controla, asis_controla, id_regimen,
                id_tipo_contrato, id]);
            res.jsonp({ message: 'Registro actualizado exitosamente.' });
        });
    }
    // ELIMINAR DOCUMENTO CONTRATO BASE DE DATOS - SERVIDOR
    EliminarDocumento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { documento, id } = req.body;
            let separador = path_1.default.sep;
            const response = yield database_1.default.query(`
            UPDATE eu_empleado_contratos SET documento = null WHERE id = $1 RETURNING *
            `, [id]);
            const [contrato] = response.rows;
            if (documento != 'null' && documento != '' && documento != null) {
                let ruta = (yield (0, accesoCarpetas_2.ObtenerRutaContrato)(contrato.id_empleado)) + separador + documento;
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
    // ELIMINAR DOCUMENTO CONTRATO DEL SERVIDOR
    EliminarDocumentoServidor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { documento, id } = req.body;
            let separador = path_1.default.sep;
            if (documento != 'null' && documento != '' && documento != null) {
                let ruta = (yield (0, accesoCarpetas_2.ObtenerRutaContrato)(id)) + separador + documento;
                // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                    if (err) {
                    }
                    else {
                        // ELIMINAR DEL SERVIDOR
                        fs_1.default.unlinkSync(ruta);
                    }
                });
                ;
            }
            res.jsonp({ message: 'Documento actualizado.' });
        });
    }
    // METODO PARA BUSCAR ID ACTUAL
    EncontrarIdContratoActual(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const CONTRATO = yield database_1.default.query(`
            SELECT MAX(ec.id) FROM eu_empleado_contratos AS ec, eu_empleados AS e 
            WHERE ec.id_empleado = e.id AND e.id = $1
            `, [id_empleado]);
            if (CONTRATO.rowCount != 0) {
                if (CONTRATO.rows[0]['max'] != null) {
                    return res.jsonp(CONTRATO.rows);
                }
                else {
                    return res.status(404).jsonp({ text: 'Registro no encontrado.' });
                }
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // METODO PARA BUSCAR DATOS DE CONTRATO POR ID 
    EncontrarDatosUltimoContrato(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const CONTRATO = yield database_1.default.query(`
            SELECT ec.id, ec.id_empleado, ec.id_regimen, ec.fecha_ingreso, ec.fecha_salida, ec.controlar_vacacion,
                ec.controlar_asistencia, ec.documento, ec.id_modalidad_laboral, cr.descripcion, 
                cr.mes_periodo, mt.descripcion AS nombre_contrato 
            FROM eu_empleado_contratos AS ec, ere_cat_regimenes AS cr, e_cat_modalidad_trabajo AS mt 
            WHERE ec.id = $1 AND ec.id_regimen = cr.id AND mt.id = ec.id_modalidad_laboral
            `, [id]);
            if (CONTRATO.rowCount != 0) {
                return res.jsonp(CONTRATO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // METODO PARA BUSCAR FECHAS DE CONTRATOS    --**VERIFICADO
    EncontrarFechaContrato(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.body;
            const FECHA = yield database_1.default.query(`
            SELECT ca.id_contrato, ec.fecha_ingreso, ec.fecha_salida
            FROM datos_contrato_actual AS ca, eu_empleado_contratos AS ec
            WHERE ca.id = $1 AND ec.id = ca.id_contrato
            `, [id_empleado]);
            if (FECHA.rowCount != 0) {
                return res.jsonp(FECHA.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    /** **************************************************************************** **
     ** **          METODOS PARA LA TABLA MODAL_TRABAJO O TIPO DE CONTRATOS       ** **
     ** **************************************************************************** **/
    // LISTAR TIPOS DE MODALIDAD DE TRABAJO
    ListarTiposContratos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const CONTRATOS = yield database_1.default.query(`
            SELECT * FROM e_cat_modalidad_trabajo
            `);
            if (CONTRATOS.rowCount != 0) {
                return res.jsonp(CONTRATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // REGISTRAR MODALIDAD DE TRABAJO
    CrearTipoContrato(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { descripcion } = req.body;
            const response = yield database_1.default.query(`
            INSERT INTO e_cat_modalidad_trabajo (descripcion) VALUES ($1) RETURNING *
            `, [descripcion]);
            const [contrato] = response.rows;
            if (contrato) {
                return res.status(200).jsonp(contrato);
            }
            else {
                return res.status(404).jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA BUSCAR MODALIDAD LABORAL POR NOMBRE
    BuscarModalidadLaboralNombre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.body;
            const CONTRATOS = yield database_1.default.query(`
            SELECT * FROM e_cat_modalidad_trabajo WHERE UPPER(descripcion) = $1
            `, [nombre]);
            if (CONTRATOS.rowCount != 0) {
                return res.jsonp(CONTRATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    ListarContratos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const CONTRATOS = yield database_1.default.query(`
            SELECT * FROM eu_empleado_contratos
            `);
            if (CONTRATOS.rowCount != 0) {
                return res.jsonp(CONTRATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    ObtenerUnContrato(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const CONTRATOS = yield database_1.default.query(`
            SELECT * FROM eu_empleado_contratos WHERE id = $1
            `, [id]);
            if (CONTRATOS.rowCount != 0) {
                return res.jsonp(CONTRATOS.rows[0]);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    EncontrarIdContrato(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const CONTRATO = yield database_1.default.query(`
            SELECT ec.id 
            FROM eu_empleado_contratos AS ec, eu_empleados AS e 
            WHERE ec.id_empleado = e.id AND e.id = $1 
            ORDER BY ec.fecha_ingreso DESC 
            `, [id_empleado]);
            if (CONTRATO.rowCount != 0) {
                return res.jsonp(CONTRATO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    EncontrarFechaContratoId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_contrato } = req.body;
            const FECHA = yield database_1.default.query(`
            SELECT contrato.fecha_ingreso FROM eu_empleado_contratos AS contrato
            WHERE contrato.id = $1
            `, [id_contrato]);
            if (FECHA.rowCount != 0) {
                return res.jsonp(FECHA.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR
    RevisarDatos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
            let separador = path_1.default.sep;
            let ruta = (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)() + separador + documento;
            const workbook = xlsx_1.default.readFile(ruta);
            const sheet_name_list = workbook.SheetNames;
            const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            let data = {
                fila: '',
                cedula: '',
                pais: '',
                regimen_la: '',
                modalida_la: '',
                fecha_ingreso: '',
                fecha_salida: '',
                control_asis: '',
                control_vaca: '',
                observacion: ''
            };
            var listContratos = [];
            var duplicados = [];
            var mensaje = 'correcto';
            // LECTURA DE LOS DATOS DE LA PLANTILLA
            plantilla.forEach((dato, indice, array) => __awaiter(this, void 0, void 0, function* () {
                var { item, cedula, pais, regimen_laboral, modalidad_laboral, fecha_ingreso, fecha_salida, controlar_asistencia, controlar_vacaciones, tipo_cargo } = dato;
                //Verificar que el registo no tenga datos vacios
                if ((item != undefined && item != '') && (cedula != undefined) && (pais != undefined) &&
                    (regimen_laboral != undefined) && (modalidad_laboral != undefined) && (fecha_ingreso != undefined) &&
                    (fecha_salida != undefined) && (controlar_asistencia != undefined) && (controlar_vacaciones != undefined) &&
                    (tipo_cargo != undefined)) {
                    data.fila = item;
                    data.cedula = cedula;
                    data.pais = pais;
                    data.regimen_la = regimen_laboral;
                    data.modalida_la = modalidad_laboral;
                    data.fecha_ingreso = fecha_ingreso;
                    data.fecha_salida = fecha_salida;
                    data.control_asis = controlar_asistencia;
                    data.control_vaca = controlar_vacaciones;
                    data.observacion = 'no registrado';
                    //Valida si los datos de la columna cedula son numeros.
                    const rege = /^[0-9]+$/;
                    if (rege.test(data.cedula)) {
                        if (data.cedula.toString().length != 10) {
                            data.observacion = 'La cédula ingresada no es válida';
                        }
                        else {
                            // Verificar si la variable tiene el formato de fecha correcto con moment
                            if ((0, moment_1.default)(fecha_ingreso, 'YYYY-MM-DD', true).isValid()) { }
                            else {
                                data.observacion = 'Formato de fecha ingreso incorrecto (YYYY-MM-DD)';
                            }
                            // Verificar si la variable tiene el formato de fecha correcto con moment
                            if ((0, moment_1.default)(fecha_salida, 'YYYY-MM-DD', true).isValid()) { }
                            else {
                                data.observacion = 'Formato de fecha salida incorrecto (YYYY-MM-DD)';
                            }
                        }
                    }
                    else {
                        data.observacion = 'La cédula ingresada no es válida';
                    }
                    listContratos.push(data);
                }
                else {
                    data.fila = item;
                    data.cedula = cedula;
                    data.pais = pais;
                    data.regimen_la = regimen_laboral;
                    data.modalida_la = modalidad_laboral;
                    data.fecha_ingreso = fecha_ingreso;
                    data.fecha_salida = fecha_salida;
                    data.control_asis = controlar_asistencia;
                    data.control_vaca = controlar_vacaciones;
                    data.observacion = 'no registrado';
                    if (data.fila == '' || data.fila == undefined) {
                        data.fila = 'error';
                        mensaje = 'error';
                    }
                    if (pais == undefined) {
                        data.pais = 'No registrado';
                        data.observacion = 'Pais ' + data.observacion;
                    }
                    if (regimen_laboral == undefined) {
                        data.regimen_la = 'No registrado';
                        data.observacion = 'Régimen laboral ' + data.observacion;
                    }
                    if (modalidad_laboral == undefined) {
                        data.modalida_la = 'No registrado';
                        data.observacion = 'Modalida laboral ' + data.observacion;
                    }
                    if (fecha_ingreso == undefined) {
                        data.fecha_ingreso = 'No registrado';
                        data.observacion = 'Fecha ingreso ' + data.observacion;
                    }
                    if (fecha_salida == undefined) {
                        data.fecha_salida = 'No registrado';
                        data.observacion = 'Fecha salida ' + data.observacion;
                    }
                    if (controlar_asistencia == undefined) {
                        data.control_asis = 'No registrado';
                        data.observacion = 'Control asistencia ' + data.observacion;
                    }
                    if (controlar_vacaciones == undefined) {
                        data.control_vaca = 'No registrado';
                        data.observacion = 'Control vacaciones ' + data.observacion;
                    }
                    if (cedula == undefined) {
                        data.cedula = 'No registrado';
                        data.observacion = 'Cédula ' + data.observacion;
                    }
                    else {
                        //Valida si los datos de la columna cedula son numeros.
                        const rege = /^[0-9]+$/;
                        if (rege.test(data.cedula)) {
                            if (data.cedula.toString().length != 10) {
                                data.observacion = 'La cédula ingresada no es válida';
                            }
                            else {
                                // Verificar si la variable tiene el formato de fecha correcto con moment
                                if (data.fecha_ingreso != 'No registrado') {
                                    if ((0, moment_1.default)(fecha_ingreso, 'YYYY-MM-DD', true).isValid()) { }
                                    else {
                                        data.observacion = 'Formato de fecha ingreso incorrecto (YYYY-MM-DD)';
                                    }
                                }
                                else if 
                                // Verificar si la variable tiene el formato de fecha correcto con moment
                                (data.fecha_salida != 'No registrado') {
                                    if ((0, moment_1.default)(fecha_salida, 'YYYY-MM-DD', true).isValid()) { }
                                    else {
                                        data.observacion = 'Formato de fecha salida incorrecto (YYYY-MM-DD)';
                                    }
                                }
                                else if (data.control_vaca != 'No registrado') {
                                    if (data.control_vaca.toUpperCase() != 'NO' && data.control_vaca.toUpperCase() != 'SI') {
                                        data.observacion = 'El control de vacaiones es incorrecto';
                                    }
                                }
                                else if (data.control_asis != 'No registrado') {
                                    if (data.control_asis.toUpperCase() != 'NO' && data.control_asisdata.toUpperCase() != 'SI') {
                                        data.observacion = 'El control de asistencias es incorrecto';
                                    }
                                }
                            }
                        }
                        else {
                            data.observacion = 'La cédula ingresada no es válida';
                        }
                    }
                    listContratos.push(data);
                }
                data = {};
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
            listContratos.forEach((valor) => __awaiter(this, void 0, void 0, function* () {
                if (valor.observacion == 'no registrado') {
                    var VERIFICAR_CEDULA = yield database_1.default.query(`
                    SELECT * FROM eu_empleados WHERE cedula = $1
                    `, [valor.cedula]);
                    if (VERIFICAR_CEDULA.rows[0] != undefined && VERIFICAR_CEDULA.rows[0] != '') {
                        if (valor.cedula != 'No registrado' && valor.pais != 'No registrado' && valor.pais != '') {
                            const fechaRango = yield database_1.default.query(`
                            SELECT * FROM eu_empleado_contratos 
                            WHERE id_empleado = $1 AND 
                                ($2 BETWEEN fecha_ingreso and fecha_salida OR $3 BETWEEN fecha_ingreso AND fecha_salida OR 
                                fecha_ingreso BETWEEN $2 AND $3)
                            `, [VERIFICAR_CEDULA.rows[0].id, valor.fecha_ingreso, valor.fecha_salida]);
                            if (fechaRango.rows[0] != undefined && fechaRango.rows[0] != '') {
                                valor.observacion = 'Existe un contrato vigente en esas fechas';
                            }
                            else {
                                var VERIFICAR_PAISES = yield database_1.default.query(`
                                SELECT * FROM e_cat_paises WHERE UPPER(nombre) = $1
                                `, [valor.pais.toUpperCase()]);
                                if (VERIFICAR_PAISES.rows[0] != undefined && VERIFICAR_PAISES.rows[0] != '') {
                                    var id_pais = VERIFICAR_PAISES.rows[0].id;
                                    if (valor.regimen_la != 'No registrado' && valor.regimen_la != '') {
                                        var VERIFICAR_REGIMENES = yield database_1.default.query(`
                                        SELECT * FROM ere_cat_regimenes WHERE UPPER(descripcion) = $1
                                        `, [valor.regimen_la.toUpperCase()]);
                                        if (VERIFICAR_REGIMENES.rows[0] != undefined && VERIFICAR_REGIMENES.rows[0] != '') {
                                            if (id_pais == VERIFICAR_REGIMENES.rows[0].id_pais) {
                                                if (valor.modalida_la != 'No registrado' && valor.modalida_la != '') {
                                                    var VERIFICAR_MODALIDAD = yield database_1.default.query(`
                                                    SELECT * FROM e_cat_modalidad_trabajo WHERE UPPER(descripcion) = $1
                                                    `, [valor.modalida_la.toUpperCase()]);
                                                    if (VERIFICAR_MODALIDAD.rows[0] != undefined && VERIFICAR_MODALIDAD.rows[0] != '') {
                                                        if ((0, moment_1.default)(valor.fecha_ingreso).format('YYYY-MM-DD') >= (0, moment_1.default)(valor.fecha_salida).format('YYYY-MM-DD')) {
                                                            valor.observacion = 'La fecha de ingreso no puede ser menor o igual a la fecha salida';
                                                        }
                                                    }
                                                    else {
                                                        valor.observacion = 'Modalidad Laboral no existe en el sistema';
                                                    }
                                                }
                                            }
                                            else {
                                                valor.observacion = 'País no corresponde con el Régimen Laboral';
                                            }
                                        }
                                        else {
                                            valor.observacion = 'Régimen Laboral no existe en el sistema';
                                        }
                                    }
                                }
                                else {
                                    valor.observacion = 'Pais ingresado no se encuentra registrado';
                                }
                            }
                        }
                        // Discriminación de elementos iguales
                        if (duplicados.find((p) => p.cedula === valor.cedula) == undefined) {
                            duplicados.push(valor);
                        }
                        else {
                            valor.observacion = '1';
                        }
                    }
                    else {
                        valor.observacion = 'Cédula no existe en el sistema';
                    }
                }
            }));
            setTimeout(() => {
                listContratos.sort((a, b) => {
                    // Compara los números de los objetos
                    if (a.fila < b.fila) {
                        return -1;
                    }
                    if (a.fila > b.fila) {
                        return 1;
                    }
                    return 0; // Son iguales
                });
                var filaDuplicada = 0;
                listContratos.forEach((item) => {
                    if (item.observacion == '1') {
                        item.observacion = 'Registro duplicado (cédula)';
                    }
                    if (item.observacion != undefined) {
                        let arrayObservacion = item.observacion.split(" ");
                        if (arrayObservacion[0] == 'no') {
                            item.observacion = 'ok';
                        }
                    }
                    //Valida si los datos de la columna N son numeros.
                    if (typeof item.fila === 'number' && !isNaN(item.fila)) {
                        //Condicion para validar si en la numeracion existe un numero que se repite dara error.
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
                    listContratos = undefined;
                }
                console.log('listContratos: ', listContratos);
                return res.jsonp({ message: mensaje, data: listContratos });
            }, 1500);
        });
    }
    CargarPlantilla_contrato(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const plantilla = req.body;
            console.log('datos contrato: ', plantilla);
            var contador = 1;
            plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                console.log('data: ', data);
                // Datos que se guardaran de la plantilla ingresada
                const { item, cedula, pais, regimen_la, modalida_la, fecha_ingreso, fecha_salida, control_asis, control_vaca } = data;
                const ID_EMPLEADO = yield database_1.default.query(`
                SELECT id FROM eu_empleados WHERE UPPER(cedula) = $1
                `, [cedula]);
                const ID_REGIMEN = yield database_1.default.query(`
                SELECT id FROM ere_cat_regimenes WHERE UPPER(descripcion) = $1
                `, [regimen_la.toUpperCase()]);
                const ID_TIPO_CONTRATO = yield database_1.default.query(`
                SELECT id FROM e_cat_modalidad_trabajo WHERE UPPER(descripcion) = $1
                `, [modalida_la.toUpperCase()]);
                //Transformar el string en booleano
                var vaca_controla;
                if (control_vaca.toUpperCase() === 'SI') {
                    vaca_controla = true;
                }
                else {
                    vaca_controla = false;
                }
                var asis_controla;
                if (control_asis.toUpperCase() === 'SI') {
                    asis_controla = true;
                }
                else {
                    asis_controla = false;
                }
                var id_empleado = ID_EMPLEADO.rows[0].id;
                var id_regimen = ID_REGIMEN.rows[0].id;
                var id_tipo_contrato = ID_TIPO_CONTRATO.rows[0].id;
                console.log('id_empleado: ', id_empleado);
                console.log('id_regimen: ', id_regimen);
                console.log('id_tipo_contrato: ', id_tipo_contrato);
                console.log('fecha ingreso: ', fecha_ingreso);
                console.log('fecha final: ', fecha_salida);
                console.log('vacaciones: ', vaca_controla);
                console.log('asistencias: ', asis_controla);
                // Registro de los datos de contratos
                const response = yield database_1.default.query(`
                INSERT INTO eu_empleado_contratos (id_empleado, fecha_ingreso, fecha_salida, controlar_vacacion, 
                    controlar_asistencia, id_regimen, id_modalidad_laboral) 
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
                `, [id_empleado, fecha_ingreso, fecha_salida, vaca_controla, asis_controla, id_regimen,
                    id_tipo_contrato]);
                const [contrato] = response.rows;
                console.log(contador, ' == ', plantilla.length);
                if (contador === plantilla.length) {
                    if (contrato) {
                        return res.status(200).jsonp({ message: 'ok' });
                    }
                    else {
                        return res.status(404).jsonp({ message: 'error' });
                    }
                }
                contador = contador + 1;
            }));
        });
    }
}
const CONTRATO_EMPLEADO_CONTROLADOR = new ContratoEmpleadoControlador();
exports.default = CONTRATO_EMPLEADO_CONTROLADOR;
