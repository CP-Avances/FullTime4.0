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
exports.EMPLEADO_CARGO_CONTROLADOR = void 0;
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
const auditoriaControlador_1 = __importDefault(require("../../auditoria/auditoriaControlador"));
const moment_1 = __importDefault(require("moment"));
const database_1 = __importDefault(require("../../../database"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const xlsx_1 = __importDefault(require("xlsx"));
class EmpleadoCargosControlador {
    // METODO BUSQUEDA DATOS DEL CARGO DE UN USUARIO
    ObtenerCargoID(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const unEmplCargp = yield database_1.default.query(`
      SELECT ec.id, ec.id_contrato, ec.id_tipo_cargo, ec.fecha_inicio, ec.fecha_final, ec.jefe, ec.sueldo, 
        ec.hora_trabaja, ec.id_sucursal, s.nombre AS sucursal, ec.id_departamento, 
        d.nombre AS departamento, e.id AS id_empresa, e.nombre AS empresa, tc.cargo AS nombre_cargo 
      FROM eu_empleado_cargos AS ec, e_sucursales AS s, ed_departamentos AS d, e_empresa AS e, 
        e_cat_tipo_cargo AS tc 
      WHERE ec.id = $1 AND ec.id_sucursal = s.id AND ec.id_departamento = d.id AND 
        s.id_empresa = e.id AND ec.id_tipo_cargo = tc.id 
      ORDER BY ec.id
      `, [id]);
            if (unEmplCargp.rowCount != 0) {
                return res.jsonp(unEmplCargp.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // METODO DE REGISTRO DE CARGO
    Crear(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empl_contrato, id_departamento, fec_inicio, fec_final, id_sucursal, sueldo, hora_trabaja, cargo, jefe, user_name, ip } = req.body;
                const datosNuevos = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                yield database_1.default.query(`
        INSERT INTO eu_empleado_cargos (id_contrato, id_departamento, fecha_inicio, fecha_final, id_sucursal,
           sueldo, hora_trabaja, id_tipo_cargo, jefe) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [id_empl_contrato, id_departamento, fec_inicio, fec_final, id_sucursal, sueldo, hora_trabaja, cargo, jefe]);
                delete datosNuevos.user_name;
                delete datosNuevos.ip;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_empleado_cargos',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(datosNuevos),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.jsonp({ message: 'Registro guardado.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'Error al guardar el registro.' });
            }
        });
    }
    // METODO PARA ACTUALIZAR REGISTRO
    EditarCargo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empl_contrato, id } = req.params;
                const { id_departamento, fec_inicio, fec_final, id_sucursal, sueldo, hora_trabaja, cargo, jefe, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const cargoConsulta = yield database_1.default.query('SELECT * FROM eu_empleado_cargos WHERE id = $1', [id]);
                const [datosOriginales] = cargoConsulta.rows;
                if (!datosOriginales) {
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_empleado_cargos',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar el cargo con id ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Error al actualizar el registro.' });
                }
                yield database_1.default.query(`
        UPDATE eu_empleado_cargos SET id_departamento = $1, fecha_inicio = $2, fecha_final = $3, id_sucursal = $4, 
          sueldo = $5, hora_trabaja = $6, id_tipo_cargo = $7, jefe = $8  
        WHERE id_contrato = $9 AND id = $10
        `, [id_departamento, fec_inicio, fec_final, id_sucursal, sueldo, hora_trabaja, cargo, jefe,
                    id_empl_contrato, id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_empleado_cargos',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: `{id_departamento: ${id_departamento}, fec_inicio: ${fec_inicio}, fec_final: ${fec_final}, id_sucursal: ${id_sucursal}, sueldo: ${sueldo}, hora_trabaja: ${hora_trabaja}, cargo: ${cargo}, jefe: ${jefe}}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro actualizado exitosamente.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al actualizar el registro.' });
            }
        });
    }
    // METODO PARA BUSCAR DATOS DE CARGO POR ID CONTRATO
    EncontrarCargoIDContrato(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empl_contrato } = req.params;
            const unEmplCargp = yield database_1.default.query(`
      SELECT ec.id, ec.id_tipo_cargo, ec.fecha_inicio, ec.fecha_final, ec.sueldo, ec.hora_trabaja, 
        s.nombre AS sucursal, d.nombre AS departamento 
      FROM eu_empleado_cargos AS ec, e_sucursales AS s, ed_departamentos AS d 
      WHERE ec.id_contrato = $1 AND ec.id_sucursal = s.id AND ec.id_departamento = d.id
      `, [id_empl_contrato]);
            if (unEmplCargp.rowCount != 0) {
                return res.jsonp(unEmplCargp.rows);
            }
            else {
                return res.status(404).jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA BUSCAR FECHAS DE CARGOS INTERMEDIOS
    BuscarCargosFecha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado, fecha_verificar } = req.body;
            const CARGOS = yield database_1.default.query(`
      SELECT dc.empl_id, ec.id AS id_cargo, ec.fecha_inicio, ec.fecha_final
      FROM eu_empleado_cargos AS ec, datos_empleado_cargo AS dc
      WHERE ec.id = dc.cargo_id AND dc.empl_id = $1 AND $2 < ec.fecha_final
      `, [id_empleado, fecha_verificar]);
            if (CARGOS.rowCount != 0) {
                return res.jsonp(CARGOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // METODO PARA BUSCAR FECHAS DE CARGOS INTERMEDIOS
    BuscarCargosFechaEditar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado, fecha_verificar, id_cargo } = req.body;
            const CARGOS = yield database_1.default.query(`
        SELECT dc.empl_id, ec.id AS id_cargo, ec.fecha_inicio, ec.fecha_final
        FROM eu_empleado_cargos AS ec, datos_empleado_cargo AS dc
        WHERE ec.id = dc.cargo_id AND dc.empl_id = $1 AND $2 < ec.fecha_final AND NOT ec.id = $3
        `, [id_empleado, fecha_verificar, id_cargo]);
            if (CARGOS.rowCount != 0) {
                return res.jsonp(CARGOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    EncontrarIdCargo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const CARGO = yield database_1.default.query(`
      SELECT ec.id 
      FROM eu_empleado_cargos AS ec, eu_empleado_contratos AS ce, eu_empleados AS e 
      WHERE ce.id_empleado = e.id AND ec.id_contrato = ce.id AND e.id = $1
      `, [id_empleado]);
            if (CARGO.rowCount != 0) {
                return res.jsonp(CARGO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    EncontrarIdCargoActual(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const CARGO = yield database_1.default.query(`
      SELECT ec.id AS max, ec.hora_trabaja 
      FROM datos_actuales_empleado AS da, eu_empleado_cargos AS ec
      WHERE ec.id = da.id_cargo AND da.id = $1
      `, [id_empleado]);
            if (CARGO.rowCount != 0 && CARGO.rows[0]['max'] != null) {
                return res.jsonp(CARGO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    BuscarTipoDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const Cargos = yield database_1.default.query(`
      SELECT tc.id, tc.cargo 
      FROM e_cat_tipo_cargo AS tc, eu_empleado_cargos AS ec
      WHERE tc.id = ec.id_tipo_cargo AND id_departamento = $1 
      GROUP BY tc.cargo, tc.id
      `, [id]);
            if (Cargos.rowCount != 0) {
                return res.jsonp(Cargos.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    BuscarTipoSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const Cargos = yield database_1.default.query(`
      SELECT tc.id, tc.cargo 
      FROM e_cat_tipo_cargo AS tc, eu_empleado_cargos AS ec 
      WHERE tc.id = ec.id_tipo_cargo AND id_sucursal = $1 
      GROUP BY tc.cargo, tc.id
      `, [id]);
            if (Cargos.rowCount != 0) {
                return res.jsonp(Cargos.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    BuscarTipoRegimen(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const Cargos = yield database_1.default.query(`
      SELECT tc.id, tc.cargo 
      FROM ere_cat_regimenes AS r, eu_empleado_cargos AS ec, eu_empleado_contratos AS c, e_cat_tipo_cargo AS tc 
      WHERE c.id_regimen = r.id AND c.id = ec.id_contrato AND ec.id_tipo_cargo = tc.id AND r.id = $1 
      GROUP BY tc.id, tc.cargo
      `, [id]);
            if (Cargos.rowCount != 0) {
                return res.jsonp(Cargos.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    /** **************************************************************************************** **
     ** **                  METODOS DE CONSULTA DE TIPOS DE CARGOS                            ** **
     ** **************************************************************************************** **/
    // METODO DE BUSQUEDA DE TIPO DE CARGOS
    ListarTiposCargo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const Cargos = yield database_1.default.query(`
      SELECT * FROM e_cat_tipo_cargo
      `);
            if (Cargos.rowCount != 0) {
                return res.jsonp(Cargos.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // METODO DE REGISTRO DE TIPO DE CARGO
    CrearTipoCargo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { cargo, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`
        INSERT INTO e_cat_tipo_cargo (cargo) VALUES ($1) RETURNING *
        `, [cargo]);
                const [tipo_cargo] = response.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'e_cat_tipo_cargo',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{cargo: ${cargo}}`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (tipo_cargo) {
                    return res.status(200).jsonp(tipo_cargo);
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
    // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR
    RevisarDatos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
            let separador = path_1.default.sep;
            let ruta = (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)() + separador + documento;
            const workbook = xlsx_1.default.readFile(ruta);
            let verificador = (0, accesoCarpetas_1.ObtenerIndicePlantilla)(workbook, 'EMPLEADOS_CARGOS');
            if (verificador === false) {
                return res.jsonp({ message: 'no_existe', data: undefined });
            }
            else {
                const sheet_name_list = workbook.SheetNames;
                const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[verificador]]);
                let data = {
                    fila: '',
                    cedula: '',
                    departamento: '',
                    fecha_desde: '',
                    fecha_hasta: '',
                    sucursal: '',
                    sueldo: '',
                    cargo: '',
                    hora_trabaja: '',
                    observacion: ''
                };
                var listCargos = [];
                var duplicados = [];
                var mensaje = 'correcto';
                // LECTURA DE LOS DATOS DE LA PLANTILLA
                plantilla.forEach((dato) => __awaiter(this, void 0, void 0, function* () {
                    var { ITEM, CEDULA, DEPARTAMENTO, FECHA_DESDE, FECHA_HASTA, SUCURSAL, SUELDO, CARGO, HORA_TRABAJA } = dato;
                    //Verificar que el registo no tenga datos vacios
                    if ((ITEM != undefined && ITEM != '') && (CEDULA != undefined) && (DEPARTAMENTO != undefined) &&
                        (FECHA_DESDE != undefined) && (FECHA_HASTA != undefined) && (SUCURSAL != undefined) &&
                        (SUELDO != undefined) && (CARGO != undefined) && (HORA_TRABAJA != undefined)) {
                        data.fila = ITEM;
                        data.cedula = CEDULA;
                        data.departamento = DEPARTAMENTO;
                        data.fecha_inicio = FECHA_DESDE;
                        data.fecha_final = FECHA_HASTA;
                        data.sucursal = SUCURSAL;
                        data.sueldo = SUELDO;
                        data.cargo = CARGO;
                        data.hora_trabaja = HORA_TRABAJA;
                        data.observacion = 'no registrado';
                        //Valida si los datos de la columna cedula son numeros.
                        const rege = /^[0-9]+$/;
                        if (rege.test(data.cedula)) {
                            if (data.cedula.toString().length != 10) {
                                data.observacion = 'La cédula ingresada no es válida';
                            }
                            else {
                                // Verificar si la variable tiene el formato de fecha correcto con moment
                                if ((0, moment_1.default)(FECHA_DESDE, 'YYYY-MM-DD', true).isValid()) { }
                                else {
                                    data.observacion = 'Formato de fecha inicio incorrecto (YYYY-MM-DD)';
                                }
                                // Verificar si la variable tiene el formato de fecha correcto con moment
                                if ((0, moment_1.default)(FECHA_HASTA, 'YYYY-MM-DD', true).isValid()) { }
                                else {
                                    data.observacion = 'Formato de fecha final incorrecto (YYYY-MM-DD)';
                                }
                                //Verifica el valor del suelo que sea solo numeros
                                if (typeof data.sueldo != 'number' && isNaN(data.sueldo)) {
                                    data.observacion = 'El sueldo es incorrecto';
                                }
                                if (data.hora_trabaja != 'No registrado') {
                                    if ((0, moment_1.default)(HORA_TRABAJA, 'HH:mm:ss', true).isValid()) { }
                                    else {
                                        data.observacion = 'Formato horas invalido  (HH:mm:ss)';
                                    }
                                }
                            }
                        }
                        else {
                            data.observacion = 'La cédula ingresada no es válida';
                        }
                        listCargos.push(data);
                    }
                    else {
                        data.fila = ITEM;
                        data.cedula = CEDULA;
                        data.departamento = DEPARTAMENTO;
                        data.fecha_inicio = FECHA_DESDE;
                        data.fecha_final = FECHA_HASTA;
                        data.sucursal = SUCURSAL;
                        data.sueldo = SUELDO;
                        data.cargo = CARGO;
                        data.hora_trabaja = HORA_TRABAJA;
                        data.observacion = 'no registrado';
                        if (data.fila == '' || data.fila == undefined) {
                            data.fila = 'error';
                            mensaje = 'error';
                        }
                        if (DEPARTAMENTO == undefined) {
                            data.departamento = 'No registrado';
                            data.observacion = 'Departamento ' + data.observacion;
                        }
                        if (FECHA_DESDE == undefined) {
                            data.fecha_inicio = 'No registrado';
                            data.observacion = 'Fecha inicio ' + data.observacion;
                        }
                        if (FECHA_HASTA == undefined) {
                            data.fecha_final = 'No registrado';
                            data.observacion = 'Fecha final ' + data.observacion;
                        }
                        if (SUCURSAL == undefined) {
                            data.sucursal = 'No registrado';
                            data.observacion = 'Sucursal ' + data.observacion;
                        }
                        if (SUELDO == undefined) {
                            data.sueldo = 'No registrado';
                            data.observacion = 'Sueldo ' + data.observacion;
                        }
                        if (CARGO == undefined) {
                            data.cargo = 'No registrado';
                            data.observacion = 'Cargo ' + data.observacion;
                        }
                        if (HORA_TRABAJA == undefined) {
                            data.hora_trabaja = 'No registrado';
                            data.observacion = 'Hora trabaja ' + data.observacion;
                        }
                        if (CEDULA == undefined) {
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
                                    if (data.fecha_inicio != 'No registrado') {
                                        if ((0, moment_1.default)(data.fecha_inicio, 'yyyy-mm-dd', true).isValid()) { }
                                        else {
                                            data.observacion = 'Formato de fecha inicio incorrecto (YYYY-MM-DD)';
                                        }
                                    }
                                    else 
                                    // Verificar si la variable tiene el formato de fecha correcto con moment
                                    if (data.fecha_final != 'No registrado') {
                                        if ((0, moment_1.default)(data.fecha_final, 'yyyy-mm-dd', true).isValid()) { }
                                        else {
                                            data.observacion = 'Formato de fecha final incorrecto (YYYY-MM-DD)';
                                        }
                                    }
                                    else 
                                    //Verifica el valor del suelo que sea solo numeros
                                    if (typeof data.sueldo != 'number' && isNaN(data.sueldo)) {
                                        data.observacion = 'El sueldo es incorrecto';
                                    }
                                    else 
                                    //Verficar formato de horas
                                    if (data.hora_trabaja != 'No registrado') {
                                        if ((0, moment_1.default)(HORA_TRABAJA, 'HH:mm:ss', true).isValid()) { }
                                        else {
                                            data.observacion = 'Formato horas invalido  (HH:mm:ss)';
                                        }
                                    }
                                }
                            }
                            else {
                                data.observacion = 'La cédula ingresada no es válida';
                            }
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
                listCargos.forEach((valor) => __awaiter(this, void 0, void 0, function* () {
                    if (valor.observacion == 'no registrado') {
                        var VERIFICAR_CEDULA = yield database_1.default.query(`
              SELECT * FROM eu_empleados WHERE cedula = $1
              `, [valor.cedula]);
                        if (VERIFICAR_CEDULA.rows[0] != undefined && VERIFICAR_CEDULA.rows[0] != '') {
                            const ID_CONTRATO = yield database_1.default.query(`SELECT id_contrato FROM datos_contrato_actual WHERE cedula = $1`, [valor.cedula]);
                            if (ID_CONTRATO.rows[0] != undefined && ID_CONTRATO.rows[0].id_contrato != null &&
                                ID_CONTRATO.rows[0].id_contrato != 0 && ID_CONTRATO.rows[0].id_contrato != '') {
                                var VERIFICAR_SUCURSALES = yield database_1.default.query(`SELECT * FROM e_sucursales WHERE UPPER(nombre) = $1`, [valor.sucursal.toUpperCase()]);
                                if (VERIFICAR_SUCURSALES.rows[0] != undefined && VERIFICAR_SUCURSALES.rows[0] != '') {
                                    var VERIFICAR_DEPARTAMENTO = yield database_1.default.query(`SELECT * FROM ed_departamentos WHERE UPPER(nombre) = $1`, [valor.departamento.toUpperCase()]);
                                    if (VERIFICAR_DEPARTAMENTO.rows[0] != undefined && VERIFICAR_DEPARTAMENTO.rows[0] != '') {
                                        var VERFICAR_CARGO = yield database_1.default.query(`SELECT * FROM e_cat_tipo_cargo WHERE UPPER(cargo) = $1`, [valor.cargo.toUpperCase()]);
                                        if (VERFICAR_CARGO.rows[0] != undefined && VERIFICAR_CEDULA.rows[0] != '') {
                                            if ((0, moment_1.default)(valor.fecha_inicio).format('YYYY-MM-DD') >= (0, moment_1.default)(valor.fecha_final).format('YYYY-MM-DD')) {
                                                valor.observacion = 'La fecha de inicio no puede ser mayor o igual a la fecha salida';
                                            }
                                            else {
                                                const fechaRango = yield database_1.default.query(`
                                  SELECT * FROM eu_empleado_cargos 
                                  WHERE id_contrato = $1 AND 
                                  ($2  BETWEEN fecha_inicio and fecha_final or $3 BETWEEN fecha_inicio and fecha_final or 
                                  fecha_inicio BETWEEN $2 AND $3)
                                  `, [ID_CONTRATO.rows[0].id_contrato, valor.fecha_inicio, valor.fecha_final]);
                                                if (fechaRango.rows[0] != undefined && fechaRango.rows[0] != '') {
                                                    valor.observacion = 'Existe un cargo vigente en esas fechas';
                                                }
                                                else {
                                                    // Discriminación de elementos iguales
                                                    if (duplicados.find((p) => p.cedula === valor.cedula) == undefined) {
                                                        valor.observacion = 'ok';
                                                        duplicados.push(valor);
                                                    }
                                                    else {
                                                        valor.observacion = '1';
                                                    }
                                                }
                                            }
                                        }
                                        else {
                                            valor.observacion = 'Cargo no existe en el sistema';
                                        }
                                    }
                                    else {
                                        valor.observacion = 'Departamento no existe en el sistema';
                                    }
                                }
                                else {
                                    valor.observacion = 'Sucursal no existe en el sistema';
                                }
                            }
                            else {
                                valor.observacion = 'Cédula no tiene registrado un contrato';
                            }
                        }
                        else {
                            valor.observacion = 'Cédula no existe en el sistema';
                        }
                    }
                }));
                var tiempo = 2000;
                if (listCargos.length > 500 && listCargos.length <= 1000) {
                    tiempo = 4000;
                }
                else if (listCargos.length > 1000) {
                    tiempo = 6000;
                }
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
                    listCargos.forEach((item) => {
                        if (item.observacion == '1') {
                            item.observacion = 'Registro duplicado (cédula)';
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
                        listCargos = undefined;
                    }
                    return res.jsonp({ message: mensaje, data: listCargos });
                }, tiempo);
            }
        });
    }
    CargarPlantilla_cargos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const plantilla = req.body;
            var contador = 1;
            plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                // Datos que se guardaran de la plantilla ingresada
                const { item, cedula, departamento, fecha_inicio, fecha_final, sucursal, sueldo, cargo, hora_trabaja } = data;
                const ID_EMPLEADO = yield database_1.default.query(`
        SELECT id FROM eu_empleados WHERE cedula = $1
        `, [cedula]);
                const ID_CONTRATO = yield database_1.default.query(`
        SELECT id_contrato FROM datos_contrato_actual WHERE cedula = $1
        `, [cedula]);
                const ID_DEPARTAMENTO = yield database_1.default.query(`
        SELECT id FROM ed_departamentos WHERE UPPER(nombre) = $1
        `, [departamento.toUpperCase()]);
                const ID_SUCURSAL = yield database_1.default.query(`
        SELECT id FROM e_sucursales WHERE UPPER(nombre) = $1
        `, [sucursal.toUpperCase()]);
                const ID_TIPO_CARGO = yield database_1.default.query(`
        SELECT id FROM e_cat_tipo_cargo WHERE UPPER(cargo) = $1
        `, [cargo.toUpperCase()]);
                var Jefe;
                Jefe = false;
                console.log('id_empleado: ', ID_EMPLEADO.rows[0]);
                console.log('depa: ', departamento.toUpperCase());
                var id_empleado = ID_EMPLEADO.rows[0].id;
                var id_contrato = ID_CONTRATO.rows[0].id_contrato;
                var id_departamento = ID_DEPARTAMENTO.rows[0].id;
                var id_sucursal = ID_SUCURSAL.rows[0].id;
                var id_cargo = ID_TIPO_CARGO.rows[0].id;
                console.log('id_empleado: ', id_empleado);
                console.log('departamento: ', id_departamento);
                /*
                console.log('id_empleado: ', id_empleado);
                console.log('id_contrato: ', id_contrato);
                console.log('fecha inicio: ', fecha_inicio);
                console.log('fecha final: ', fecha_final);
                console.log('departamento: ', id_departamento);
                console.log('sucursal: ', id_sucursal);
                console.log('sueldo: ', sueldo);
                console.log('hora_trabaja: ', hora_trabaja);
                console.log('tipo cargo: ', id_cargo);
                */
                // Registro de los datos de contratos
                const response = yield database_1.default.query(`
        INSERT INTO eu_empleado_cargos (id_contrato, id_departamento, fecha_inicio, fecha_final, id_sucursal, 
          sueldo, id_tipo_cargo, hora_trabaja, jefe) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
        `, [id_contrato, id_departamento, fecha_inicio, fecha_final, id_sucursal, sueldo, id_cargo,
                    hora_trabaja, Jefe]);
                const [cargos] = response.rows;
                yield database_1.default.query(`
        INSERT INTO eu_usuario_departamento (id_empleado, id_departamento, principal, personal, administra) 
        VALUES ($1, $2, $3, $4, $5)
        `, [id_empleado, id_departamento, true, true, false]);
                console.log(contador, ' == ', plantilla.length);
                if (contador === plantilla.length) {
                    if (cargos) {
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
exports.EMPLEADO_CARGO_CONTROLADOR = new EmpleadoCargosControlador();
exports.default = exports.EMPLEADO_CARGO_CONTROLADOR;
