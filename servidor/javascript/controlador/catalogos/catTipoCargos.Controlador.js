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
exports.TIPOSCARGOSCONTROLADOR = void 0;
const auditoriaControlador_1 = __importDefault(require("../auditoria/auditoriaControlador"));
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = __importDefault(require("../../database"));
const xlsx_1 = __importDefault(require("xlsx"));
class TiposCargosControlador {
    // METODO PARA BUSCAR TIPO DE CARGOS POR EL NOMBRE
    BuscarTipoCargoNombre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.body;
            const CARGOS = yield database_1.default.query(`
            SELECT * FROM e_cat_tipo_cargo WHERE UPPER(cargo) = $1
            `, [nombre]);
            if (CARGOS.rowCount > 0) {
                return res.jsonp(CARGOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA LISTAR TIPO CARGOS
    ListaTipoCargos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const TIPO_CARGO = yield database_1.default.query(`
                SELECT * FROM e_cat_tipo_cargo ORDER BY cargo ASC
                `);
                if (TIPO_CARGO.rowCount > 0) {
                    return res.status(200).jsonp(TIPO_CARGO.rows);
                }
                else {
                    return res.status(404).jsonp({ text: 'No se encuentran registros.', status: '404' });
                }
            }
            catch (error) {
                return res.status(500).jsonp({ message: error, status: '500' });
            }
        });
    }
    // METODO PARA REGISTRAR TIPO CARGO
    CrearCargo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { cargo, user_name, ip } = req.body;
                var VERIFICAR_CARGO = yield database_1.default.query(`
                SELECT * FROM e_cat_tipo_cargo WHERE UPPER(cargo) = $1
                `, [cargo.toUpperCase()]);
                if (VERIFICAR_CARGO.rows[0] == undefined || VERIFICAR_CARGO.rows[0] == '') {
                    const tipoCargo = cargo.charAt(0).toUpperCase() + cargo.slice(1).toLowerCase();
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    const response = yield database_1.default.query(`
                    INSERT INTO e_cat_tipo_cargo (cargo) VALUES ($1) RETURNING *
                    `, [tipoCargo]);
                    const [TipoCargos] = response.rows;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'e_cat_tipo_cargo',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: JSON.stringify(TipoCargos),
                        ip,
                        observacion: null
                    });
                    // FIN DE TRANSACCION
                    yield database_1.default.query('COMMIT');
                    if (TipoCargos) {
                        return res.status(200).jsonp({ message: 'Registro guardado.', status: '200' });
                    }
                    else {
                        return res.status(404).jsonp({ message: 'Ups!!! algo slaio mal.', status: '400' });
                    }
                }
                else {
                    return res.jsonp({ message: 'Tipo cargo ya existe en el sistema.', status: '300' });
                }
            }
            catch (error) {
                // ROLLBACK
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error', status: '500' });
            }
        });
    }
    // METODO PARA EDITAR TIPO CARGO
    EditarCargo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, cargo } = req.body;
                // DAR FORMATO A LA PALABRA CARGO
                const tipoCargo = cargo.charAt(0).toUpperCase() + cargo.slice(1).toLowerCase();
                const tipoCargoExiste = yield database_1.default.query(`
                SELECT * FROM e_cat_tipo_cargo WHERE UPPER(cargo) = $1
                `, [cargo.toUpperCase()]);
                const consulta = yield database_1.default.query('SELECT * FROM e_cat_tipo_cargo WHERE id = $1', [id]);
                const [datosOriginales] = consulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'et_cat_nivel_titulo',
                        usuario: req.body.user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: req.body.ip,
                        observacion: `Error al actualizar el registro con id ${id}. No existe el registro en la base de datos.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                if (tipoCargoExiste.rows[0] != undefined && tipoCargoExiste.rows[0].cargo != '' && tipoCargoExiste.rows[0].cargo != null) {
                    return res.status(200).jsonp({ message: 'Tipo cargo ya existe en el sistema.', status: '300' });
                }
                else {
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    const response = yield database_1.default.query(`
                    UPDATE e_cat_tipo_cargo SET cargo = $2
                    WHERE id = $1 RETURNING *
                    `, [id, tipoCargo]);
                    const [TipoCargos] = response.rows;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'e_cat_tipo_cargo',
                        usuario: req.body.user_name,
                        accion: 'U',
                        datosOriginales: JSON.stringify(datosOriginales),
                        datosNuevos: JSON.stringify(TipoCargos),
                        ip: req.body.ip,
                        observacion: null
                    });
                    // FIN DE TRANSACCION
                    yield database_1.default.query('COMMIT');
                    if (TipoCargos) {
                        return res.status(200).jsonp({ message: 'Registro actualizado.', status: '200' });
                    }
                    else {
                        return res.status(404).jsonp({ message: 'Ups!!! algo salio mal.', status: '400' });
                    }
                }
            }
            catch (error) {
                // ROLLBACK
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error', status: '500' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTRO
    EliminarRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOS ANTES DE ELIMINAR
                const TIPO_CARGO = yield database_1.default.query(`
                SELECT * FROM e_cat_tipo_cargo WHERE id = $1
                `, [id]);
                const [datosTiposCargos] = TIPO_CARGO.rows;
                if (!datosTiposCargos) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'e_cat_tipo_cargo',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar el registro con id: ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'No se encuentra el registro.', status: '404' });
                }
                yield database_1.default.query(`
                DELETE FROM e_cat_tipo_cargo WHERE id = $1
                `, [id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'e_cat_tipo_cargo',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(datosTiposCargos),
                    datosNuevos: '',
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.jsonp({ message: 'Registro eliminado.', code: '200' });
            }
            catch (error) {
                // ROLLBACK
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: error.detail, code: error.code });
            }
        });
    }
    // LECTURA DE LOS DATOS DE LA PLATILLA TIPO CARGO
    VerfificarPlantillaTipoCargos(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
                let separador = path_1.default.sep;
                let ruta = (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)() + separador + documento;
                const workbook = xlsx_1.default.readFile(ruta);
                let verificador = (0, accesoCarpetas_1.ObtenerIndicePlantilla)(workbook, 'TIPO_CARGO');
                if (verificador === false) {
                    return res.jsonp({ message: 'no_existe', data: undefined });
                }
                else {
                    const sheet_name_list = workbook.SheetNames;
                    const plantilla_cargo = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[verificador]]);
                    let data = {
                        fila: '',
                        tipo_cargo: '',
                        observacion: ''
                    };
                    var listCargos = [];
                    var duplicados = [];
                    var mensaje = 'correcto';
                    // LECTURA DE LOS DATOS DE LA PLANTILLA
                    plantilla_cargo.forEach((dato) => __awaiter(this, void 0, void 0, function* () {
                        var { ITEM, CARGO } = dato;
                        // VERIFICAR QUE EL REGISTO NO TENGA DATOS VACIOS
                        if ((ITEM != undefined && ITEM != '') &&
                            (CARGO != undefined && CARGO != '')) {
                            data.fila = ITEM;
                            data.tipo_cargo = CARGO;
                            data.observacion = 'no registrado';
                            listCargos.push(data);
                        }
                        else {
                            data.fila = ITEM;
                            data.tipo_cargo = CARGO;
                            data.observacion = 'no registrado';
                            if (data.fila == '' || data.fila == undefined) {
                                data.fila = 'error';
                                mensaje = 'error';
                            }
                            if (data.tipo_cargo == undefined) {
                                data.tipo_cargo = 'No registrado';
                                data.observacion = 'Cargo ' + data.observacion;
                            }
                            listCargos.push(data);
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
                    listCargos.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                        if (item.observacion == 'no registrado') {
                            var VERIFICAR_CARGOS = yield database_1.default.query(`
                            SELECT * FROM e_cat_tipo_cargo WHERE UPPER(cargo) = $1
                            `, [item.tipo_cargo.toUpperCase()]);
                            if (VERIFICAR_CARGOS.rows[0] == undefined || VERIFICAR_CARGOS.rows[0] == '') {
                                item.observacion = 'ok';
                            }
                            else {
                                item.observacion = 'Ya existe en el sistema';
                            }
                            // DISCRIMINACION DE ELEMENTOS IGUALES
                            if (duplicados.find((p) => p.tipo_cargo.toLowerCase() === item.tipo_cargo.toLowerCase()) == undefined) {
                                duplicados.push(item);
                            }
                            else {
                                item.observacion = '1';
                            }
                        }
                    }));
                    setTimeout(() => {
                        listCargos.sort((a, b) => {
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
                        listCargos.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                            if (item.observacion == '1') {
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
                        }));
                        if (mensaje == 'error') {
                            listCargos = undefined;
                        }
                        return res.jsonp({ message: mensaje, data: listCargos });
                    }, 1000);
                }
            }
            catch (error) {
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    // REGISTRAR PLANTILLA TIPO CARGO 
    CargarPlantilla(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { plantilla, user_name, ip } = req.body;
                var contador = 1;
                var respuesta;
                plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                    // DATOS QUE SE GUARDARAN DE LA PLANTILLA INGRESADA
                    const { tipo_cargo } = data;
                    const cargo = tipo_cargo.charAt(0).toUpperCase() + tipo_cargo.slice(1).toLowerCase();
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    // REGISTRO DE LOS DATOS DE TIPO CARGO
                    const response = yield database_1.default.query(`
                    INSERT INTO e_cat_tipo_cargo (cargo) VALUES ($1) RETURNING *
                    `, [cargo]);
                    const [cargos] = response.rows;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'e_cat_tipo_cargo',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: JSON.stringify(cargos),
                        ip,
                        observacion: null
                    });
                    // FIN DE TRANSACCION
                    yield database_1.default.query('COMMIT');
                    if (contador === plantilla.length) {
                        if (cargos) {
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
                // ROLLBACK
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: error });
            }
        });
    }
}
exports.TIPOSCARGOSCONTROLADOR = new TiposCargosControlador();
exports.default = exports.TIPOSCARGOSCONTROLADOR;
