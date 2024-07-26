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
const settingsMail_1 = require("../../../libs/settingsMail");
const xlsx_1 = __importDefault(require("xlsx"));
class EmpleadoCargosControlador {
    // METODO PARA BUSCAR ULTIMO CONTRATO
    BuscarCargosActivos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.body;
            const CARGO = yield database_1.default.query(`
      SELECT e.id AS id_empleado,econ.id AS id_contrato, ecar.id AS id_cargo
      FROM eu_empleado_cargos AS ecar, eu_empleado_contratos AS econ, eu_empleados AS e
      WHERE e.id = econ.id_empleado AND econ.id = ecar.id_contrato AND ecar.estado = true AND e.id = $1;
      `, [id_empleado]);
            if (CARGO.rowCount != 0) {
                return res.jsonp({ message: 'contrato_cargo', datos: CARGO.rows[0] });
            }
            else {
                return res.status(404).jsonp({ message: 'No se han encontrado registro.' });
            }
        });
    }
    // METODO PARA ACTUALIZAR ESTADO DEL CARGO
    EditarEstadoCargo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_cargo, estado, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const cargoConsulta = yield database_1.default.query(`
        SELECT * FROM eu_empleado_cargos WHERE id = $1
        `, [id_cargo]);
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
                        observacion: `Error al actualizar el cargo con id ${id_cargo}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Error al actualizar el registro.' });
                }
                const datosNuevos = yield database_1.default.query(`
        UPDATE eu_empleado_cargos SET estado = $2 
        WHERE id = $1
        `, [id_cargo, estado]);
                const [empleadoCargo] = datosNuevos.rows;
                const fechaIngresoO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_inicio, 'ddd');
                const fechaSalidaO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_final, 'ddd');
                datosOriginales.fecha_inicio = fechaIngresoO;
                datosOriginales.fecha_final = fechaSalidaO;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_empleado_cargos',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(empleadoCargo),
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
    // METODO BUSQUEDA DATOS DEL CARGO DE UN USUARIO
    ObtenerCargoID(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const unEmplCargp = yield database_1.default.query(`
      SELECT ec.id, ec.id_contrato, ec.id_tipo_cargo, ec.fecha_inicio, ec.fecha_final, ec.sueldo, 
        ec.hora_trabaja, d.id_sucursal, s.nombre AS sucursal, ec.id_departamento, ec.jefe, ec.estado,
        d.nombre AS departamento, e.id AS id_empresa, e.nombre AS empresa, tc.cargo AS nombre_cargo 
      FROM eu_empleado_cargos AS ec, e_sucursales AS s, ed_departamentos AS d, e_empresa AS e, 
        e_cat_tipo_cargo AS tc 
      WHERE ec.id = $1 AND d.id_sucursal = s.id AND ec.id_departamento = d.id AND 
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
                const { id_empl_contrato, id_departamento, fec_inicio, fec_final, sueldo, hora_trabaja, cargo, user_name, ip, jefe } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const datosNuevos = yield database_1.default.query(`
        INSERT INTO eu_empleado_cargos (id_contrato, id_departamento, fecha_inicio, fecha_final,
           sueldo, hora_trabaja, id_tipo_cargo, jefe) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
        `, [id_empl_contrato, id_departamento, fec_inicio, fec_final, sueldo, hora_trabaja, cargo, jefe]);
                const [empleadoCargo] = datosNuevos.rows;
                const fechaIngresoN = yield (0, settingsMail_1.FormatearFecha2)(fec_inicio, 'ddd');
                const fechaSalidaN = yield (0, settingsMail_1.FormatearFecha2)(fec_final, 'ddd');
                empleadoCargo.fecha_inicio = fechaIngresoN;
                empleadoCargo.fecha_final = fechaSalidaN;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_empleado_cargos',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(empleadoCargo),
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.jsonp({ message: 'Registro guardado.' });
            }
            catch (error) {
                console.log('error ', error);
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
                const { id_departamento, fec_inicio, fec_final, sueldo, hora_trabaja, cargo, user_name, ip, jefe } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const cargoConsulta = yield database_1.default.query(`
        SELECT * FROM eu_empleado_cargos WHERE id = $1
        `, [id]);
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
                const datosNuevos = yield database_1.default.query(`
        UPDATE eu_empleado_cargos SET id_departamento = $1, fecha_inicio = $2, fecha_final = $3, 
          sueldo = $4, hora_trabaja = $5, id_tipo_cargo = $6, jefe = $9  
        WHERE id_contrato = $7 AND id = $8 RETURNING *
        `, [id_departamento, fec_inicio, fec_final, sueldo, hora_trabaja, cargo,
                    id_empl_contrato, id, jefe]);
                const [empleadoCargo] = datosNuevos.rows;
                const fechaIngresoO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_inicio, 'ddd');
                const fechaSalidaO = yield (0, settingsMail_1.FormatearFecha2)(datosOriginales.fecha_final, 'ddd');
                const fechaIngresoN = yield (0, settingsMail_1.FormatearFecha2)(fec_inicio, 'ddd');
                const fechaSalidaN = yield (0, settingsMail_1.FormatearFecha2)(fec_final, 'ddd');
                datosOriginales.fecha_inicio = fechaIngresoO;
                datosOriginales.fecha_final = fechaSalidaO;
                empleadoCargo.fecha_inicio = fechaIngresoN;
                empleadoCargo.fecha_final = fechaSalidaN;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'eu_empleado_cargos',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(empleadoCargo),
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
        s.nombre AS sucursal, d.nombre AS departamento, ec.jefe 
      FROM eu_empleado_cargos AS ec, e_sucursales AS s, ed_departamentos AS d 
      WHERE ec.id_contrato = $1 AND d.id_sucursal = s.id AND ec.id_departamento = d.id
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
      SELECT e.id AS id_empleado, car.id AS id_cargo, car.fecha_inicio, car.fecha_final, car.estado
      FROM eu_empleados e, eu_empleado_contratos con, eu_empleado_cargos car
      WHERE con.id_empleado = e.id AND con.id = car.id_contrato AND e.id = $1 AND $2 < car.fecha_final
      ORDER BY e.id ASC
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
        SELECT e.id AS id_empleado, car.id AS id_cargo, car.fecha_inicio, car.fecha_final, car.estado
        FROM eu_empleados e, eu_empleado_contratos con, eu_empleado_cargos car
        WHERE con.id_empleado = e.id AND con.id = car.id_contrato AND e.id = $1 AND $2 < car.fecha_final
          AND NOT car.id = $3
        ORDER BY e.id ASC
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
      FROM contrato_cargo_vigente AS da, eu_empleado_cargos AS ec
      WHERE ec.id = da.id_cargo AND da.id_empleado = $1
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
    //TODO REVISAR
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
                    datosNuevos: JSON.stringify(tipo_cargo),
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
                    admini_depa: '',
                    observacion: ''
                };
                var listCargos = [];
                var duplicados = [];
                var mensaje = 'correcto';
                // LECTURA DE LOS DATOS DE LA PLANTILLA
                plantilla.forEach((dato) => __awaiter(this, void 0, void 0, function* () {
                    var { ITEM, CEDULA, DEPARTAMENTO, FECHA_DESDE, FECHA_HASTA, SUCURSAL, SUELDO, CARGO, HORA_TRABAJA, JEFE } = dato;
                    //Verificar que el registo no tenga datos vacios
                    if ((ITEM != undefined && ITEM != '') && (CEDULA != undefined) && (DEPARTAMENTO != undefined) &&
                        (FECHA_DESDE != undefined) && (FECHA_HASTA != undefined) && (SUCURSAL != undefined) &&
                        (SUELDO != undefined) && (CARGO != undefined) && (HORA_TRABAJA != undefined) &&
                        (JEFE != undefined)) {
                        data.fila = ITEM;
                        data.cedula = CEDULA;
                        data.departamento = DEPARTAMENTO;
                        data.fecha_desde = FECHA_DESDE;
                        data.fecha_hasta = FECHA_HASTA;
                        data.sucursal = SUCURSAL;
                        data.sueldo = SUELDO;
                        data.cargo = CARGO;
                        data.hora_trabaja = HORA_TRABAJA;
                        data.admini_depa = JEFE;
                        data.observacion = 'no registrado';
                        //Valida si los datos de la columna cedula son numeros.
                        const rege = /^[0-9]+$/;
                        if (rege.test(data.cedula)) {
                            if (data.cedula.toString().length != 10) {
                                data.observacion = 'La cédula ingresada no es válida';
                            }
                            else {
                                // Verificar si la variable tiene el formato de fecha correcto con moment
                                if ((0, moment_1.default)(FECHA_DESDE, 'YYYY-MM-DD', true).isValid()) {
                                    // Verificar si la variable tiene el formato de fecha correcto con moment
                                    if ((0, moment_1.default)(FECHA_HASTA, 'YYYY-MM-DD', true).isValid()) {
                                        //Verifica el valor del suelo que sea solo numeros
                                        if (typeof data.sueldo != 'number' && isNaN(data.sueldo)) {
                                            data.observacion = 'El sueldo es incorrecto';
                                        }
                                        else {
                                            if ((0, moment_1.default)(HORA_TRABAJA, 'HH:mm:ss', true).isValid()) {
                                                if (data.admini_depa.toLowerCase() != 'si' && data.admini_depa.toLowerCase() != 'no') {
                                                    data.observacion = 'Columna jefe formato incorrecto';
                                                }
                                            }
                                            else {
                                                data.observacion = 'Formato horas invalido  (HH:mm:ss)';
                                            }
                                        }
                                    }
                                    else {
                                        data.observacion = 'Formato de fecha hasta incorrecto (YYYY-MM-DD)';
                                    }
                                }
                                else {
                                    data.observacion = 'Formato de fecha desde incorrecto (YYYY-MM-DD)';
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
                        data.fecha_desde = FECHA_DESDE;
                        data.fecha_hasta = FECHA_HASTA;
                        data.sucursal = SUCURSAL;
                        data.sueldo = SUELDO;
                        data.cargo = CARGO;
                        data.hora_trabaja = HORA_TRABAJA;
                        data.admini_depa = JEFE;
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
                            data.fecha_desde = 'No registrado';
                            data.observacion = 'Fecha desde ' + data.observacion;
                        }
                        if (FECHA_HASTA == undefined) {
                            data.fecha_hasta = 'No registrado';
                            data.observacion = 'Fecha hasta ' + data.observacion;
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
                            data.observacion = 'Hora trabajo ' + data.observacion;
                        }
                        if (JEFE == undefined) {
                            data.admini_depa = 'No registrado';
                            data.observacion = 'Jefe ' + data.observacion;
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
                                    if (data.fecha_desde != 'No registrado') {
                                        if ((0, moment_1.default)(FECHA_DESDE, 'YYYY-MM-DD', true).isValid()) {
                                            // Verificar si la variable tiene el formato de fecha correcto con moment
                                            if (data.fecha_hasta != 'No registrado') {
                                                if ((0, moment_1.default)(FECHA_HASTA, 'YYYY-MM-DD', true).isValid()) {
                                                    if (data.sueldo != 'No registrado') {
                                                        //Verifica el valor del suelo que sea solo numeros
                                                        if (typeof data.sueldo != 'number' && isNaN(data.sueldo)) {
                                                            data.observacion = 'El sueldo es incorrecto';
                                                        }
                                                        else {
                                                            //Verficar formato de horas
                                                            if (data.hora_trabaja != 'No registrado') {
                                                                if ((0, moment_1.default)(HORA_TRABAJA, 'HH:mm:ss', true).isValid()) {
                                                                    if (data.admini_depa != 'No registrado') {
                                                                        if (data.admini_depa.toLowerCase() != 'si' && data.admini_depa.toLowerCase() != 'no') {
                                                                            data.observacion = 'Columna jefe formato incorrecto';
                                                                        }
                                                                    }
                                                                }
                                                                else {
                                                                    data.observacion = 'Formato horas invalido  (HH:mm:ss)';
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                                else {
                                                    data.observacion = 'Formato de fecha hasta incorrecto (YYYY-MM-DD)';
                                                }
                                            }
                                        }
                                        else {
                                            data.observacion = 'Formato de fecha desde incorrecto (YYYY-MM-DD)';
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
                            const ID_CONTRATO = yield database_1.default.query(`
              SELECT uc.id_contrato FROM ultimo_contrato AS uc, eu_empleados AS e 
              WHERE e.id = uc.id_empleado AND e.cedula = $1
              `, [valor.cedula]);
                            if (ID_CONTRATO.rows[0] != undefined && ID_CONTRATO.rows[0].id_contrato != null &&
                                ID_CONTRATO.rows[0].id_contrato != 0 && ID_CONTRATO.rows[0].id_contrato != '') {
                                var VERIFICAR_SUCURSALES = yield database_1.default.query(`SELECT * FROM e_sucursales WHERE UPPER(nombre) = $1`, [valor.sucursal.toUpperCase()]);
                                if (VERIFICAR_SUCURSALES.rows[0] != undefined && VERIFICAR_SUCURSALES.rows[0] != '') {
                                    var VERIFICAR_DEPARTAMENTO = yield database_1.default.query(`SELECT * FROM ed_departamentos WHERE UPPER(nombre) = $1`, [valor.departamento.toUpperCase()]);
                                    if (VERIFICAR_DEPARTAMENTO.rows[0] != undefined && VERIFICAR_DEPARTAMENTO.rows[0] != '') {
                                        var VERIFICAR_DEP_SUC = yield database_1.default.query(`SELECT * FROM ed_departamentos WHERE id_sucursal = $1 and UPPER(nombre) = $2`, [VERIFICAR_SUCURSALES.rows[0].id, valor.departamento.toUpperCase()]);
                                        if (VERIFICAR_DEP_SUC.rows[0] != undefined && VERIFICAR_DEP_SUC.rows[0] != '') {
                                            var VERFICAR_CARGO = yield database_1.default.query(`SELECT * FROM e_cat_tipo_cargo WHERE UPPER(cargo) = $1`, [valor.cargo.toUpperCase()]);
                                            if (VERFICAR_CARGO.rows[0] != undefined && VERIFICAR_CEDULA.rows[0] != '') {
                                                if ((0, moment_1.default)(valor.fecha_desde).format('YYYY-MM-DD') >= (0, moment_1.default)(valor.fecha_hasta).format('YYYY-MM-DD')) {
                                                    valor.observacion = 'La fecha desde no puede ser mayor o igual a la fecha hasta';
                                                }
                                                else {
                                                    const fechaRango = yield database_1.default.query(`
                                    SELECT id FROM eu_empleado_cargos 
                                    WHERE id_contrato = $1 AND 
                                    ($2  BETWEEN fecha_inicio and fecha_final or $3 BETWEEN fecha_inicio and fecha_final or 
                                    fecha_inicio BETWEEN $2 AND $3)
                                    `, [ID_CONTRATO.rows[0].id_contrato, valor.fecha_desde, valor.fecha_hasta]);
                                                    if (fechaRango.rows[0] != undefined && fechaRango.rows[0] != '') {
                                                        valor.observacion = 'Existe un cargo en esas fechas';
                                                    }
                                                    else {
                                                        // Discriminación de elementos iguales
                                                        if (duplicados.find((p) => p.cedula === valor.cedula) == undefined) {
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
                                            valor.observacion = 'Departamento no pertenece a la sucursal';
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
                    tiempo = 7000;
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
                        if (item.observacion != undefined) {
                            let arrayObservacion = item.observacion.split(" ");
                            if (arrayObservacion[0] == 'no') {
                                item.observacion = 'ok';
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
            const { plantilla, user_name, ip } = req.body;
            let error = false;
            for (const data of plantilla) {
                try {
                    const { item, cedula, departamento, fecha_desde, fecha_hasta, sucursal, sueldo, cargo, hora_trabaja, admini_depa } = data;
                    // INICIAR TRANSACCION
                    yield database_1.default.query('BEGIN');
                    const ID_EMPLEADO = yield database_1.default.query(`
          SELECT id FROM eu_empleados WHERE cedula = $1
          `, [cedula]);
                    const ID_CONTRATO = yield database_1.default.query(`
          SELECT uc.id_contrato FROM ultimo_contrato AS uc, eu_empleados AS e 
          WHERE e.id = uc.id_empleado AND e.cedula = $1
          `, [cedula]);
                    const ID_SUCURSAL = yield database_1.default.query(`
            SELECT id FROM e_sucursales WHERE UPPER(nombre) = $1
            `, [sucursal.toUpperCase()]);
                    const ID_DEPARTAMENTO = yield database_1.default.query(`
          SELECT id FROM ed_departamentos WHERE id_sucursal = $1 AND UPPER(nombre) = $2
          `, [ID_SUCURSAL.rows[0].id, departamento.toUpperCase()]);
                    const ID_TIPO_CARGO = yield database_1.default.query(`
          SELECT id FROM e_cat_tipo_cargo WHERE UPPER(cargo) = $1
          `, [cargo.toUpperCase()]);
                    let id_empleado = ID_EMPLEADO.rows[0].id;
                    let id_contrato = ID_CONTRATO.rows[0].id_contrato;
                    let id_sucursal = ID_SUCURSAL.rows[0].id;
                    let id_departamento = ID_DEPARTAMENTO.rows[0].id;
                    let id_cargo = ID_TIPO_CARGO.rows[0].id;
                    let admin_dep = false;
                    if (admini_depa.toLowerCase() == 'si') {
                        admin_dep = true;
                    }
                    console.log('id_empleado: ', id_empleado);
                    console.log('departamento: ', id_departamento);
                    const response = yield database_1.default.query(`
          INSERT INTO eu_empleado_cargos (id_contrato, id_departamento, fecha_inicio, fecha_final, 
            sueldo, id_tipo_cargo, hora_trabaja, jefe) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
          `, [id_contrato, id_departamento, fecha_desde, fecha_hasta, sueldo, id_cargo,
                        hora_trabaja, admin_dep]);
                    const [cargos] = response.rows;
                    const response2 = yield database_1.default.query(`
          INSERT INTO eu_usuario_departamento (id_empleado, id_departamento, principal, personal, administra) 
          VALUES ($1, $2, $3, $4, $5) RETURNING *
          `, [id_empleado, id_departamento, true, true, admin_dep]);
                    const [usuarioDep] = response2.rows;
                    const id_last_cargo = yield database_1.default.query(`
           SELECT id FROM eu_empleado_cargos WHERE id_contrato = $1
          `, [id_contrato]);
                    const response3 = yield database_1.default.query(`
          UPDATE eu_empleado_cargos set estado = $2 
          WHERE id = $1 AND estado = 'true' RETURNING *
          `, [id_last_cargo.rows[0].id, false]);
                    const [usuarioCargo] = response3.rows;
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_empleado_cargos',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: JSON.stringify(cargos),
                        ip,
                        observacion: null
                    });
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'eu_usuario_departamento',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: JSON.stringify(usuarioDep),
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
}
exports.EMPLEADO_CARGO_CONTROLADOR = new EmpleadoCargosControlador();
exports.default = exports.EMPLEADO_CARGO_CONTROLADOR;
