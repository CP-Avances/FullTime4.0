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
const database_1 = __importDefault(require("../../../database"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const moment_1 = __importDefault(require("moment"));
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
const xlsx_1 = __importDefault(require("xlsx"));
class EmpleadoCargosControlador {
    // METODO BUSQUEDA DATOS DEL CARGO DE UN USUARIO
    ObtenerCargoID(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const unEmplCargp = yield database_1.default.query(`
      SELECT ec.id, ec.id_empl_contrato, ec.cargo, ec.fec_inicio, ec.fec_final, ec.jefe, ec.sueldo, 
      ec.hora_trabaja, ec.id_sucursal, s.nombre AS sucursal, ec.id_departamento, 
      d.nombre AS departamento, e.id AS id_empresa, e.nombre AS empresa, tc.cargo AS nombre_cargo 
      FROM empl_cargos AS ec, sucursales AS s, cg_departamentos AS d, cg_empresa AS e, 
      tipo_cargo AS tc 
      WHERE ec.id = $1 AND ec.id_sucursal = s.id AND ec.id_departamento = d.id AND 
      s.id_empresa = e.id AND ec.cargo = tc.id 
      ORDER BY ec.id
      `, [id]);
            if (unEmplCargp.rowCount > 0) {
                return res.jsonp(unEmplCargp.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Cargo del empleado no encontrado' });
            }
        });
    }
    // METODO DE REGISTRO DE CARGO
    Crear(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empl_contrato, id_departamento, fec_inicio, fec_final, id_sucursal, sueldo, hora_trabaja, cargo, jefe } = req.body;
            yield database_1.default.query(`
      INSERT INTO empl_cargos (id_empl_contrato, id_departamento, fec_inicio, fec_final, id_sucursal,
         sueldo, hora_trabaja, cargo, jefe) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [id_empl_contrato, id_departamento, fec_inicio, fec_final, id_sucursal, sueldo, hora_trabaja, cargo, jefe]);
            res.jsonp({ message: 'Registro guardado.' });
        });
    }
    // METODO PARA ACTUALIZAR REGISTRO
    EditarCargo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empl_contrato, id } = req.params;
            const { id_departamento, fec_inicio, fec_final, id_sucursal, sueldo, hora_trabaja, cargo, jefe } = req.body;
            yield database_1.default.query(`
      UPDATE empl_cargos SET id_departamento = $1, fec_inicio = $2, fec_final = $3, id_sucursal = $4, 
        sueldo = $5, hora_trabaja = $6, cargo = $7, jefe = $8  
      WHERE id_empl_contrato = $9 AND id = $10
      `, [id_departamento, fec_inicio, fec_final, id_sucursal, sueldo, hora_trabaja, cargo, jefe,
                id_empl_contrato, id]);
            res.jsonp({ message: 'Registro actualizado exitosamente.' });
        });
    }
    // METODO PARA BUSCAR DATOS DE CARGO POR ID CONTRATO
    EncontrarCargoIDContrato(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empl_contrato } = req.params;
            const unEmplCargp = yield database_1.default.query(`
      SELECT ec.id, ec.cargo, ec.fec_inicio, ec.fec_final, ec.sueldo, ec.hora_trabaja, 
      s.nombre AS sucursal, d.nombre AS departamento 
      FROM empl_cargos AS ec, sucursales AS s, cg_departamentos AS d 
      WHERE ec.id_empl_contrato = $1 AND ec.id_sucursal = s.id AND ec.id_departamento = d.id
      `, [id_empl_contrato]);
            if (unEmplCargp.rowCount > 0) {
                return res.jsonp(unEmplCargp.rows);
            }
            else {
                return res.status(404).jsonp({ message: 'error' });
            }
        });
    }
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const Cargos = yield database_1.default.query('SELECT * FROM empl_cargos');
            if (Cargos.rowCount > 0) {
                return res.jsonp(Cargos.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado' });
            }
        });
    }
    ListarCargoEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const empleadoCargos = yield database_1.default.query('SELECT cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, e.id AS empleado, e.nombre, e.apellido FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, sucursales AS s, empl_contratos AS ecn, empleados AS e WHERE da.id_empl_cargo = ecr.id AND da.id_departamento = cg.id AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND ecn.id_empleado = e.id ORDER BY nombre ASC');
            if (empleadoCargos.rowCount > 0) {
                return res.jsonp(empleadoCargos.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado' });
            }
        });
    }
    ListarEmpleadoAutoriza(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const empleadoCargos = yield database_1.default.query('SELECT * FROM Lista_empleados_autoriza WHERE id_notificacion = $1', [id]);
            if (empleadoCargos.rowCount > 0) {
                return res.jsonp(empleadoCargos.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado' });
            }
        });
    }
    EncontrarIdCargo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const CARGO = yield database_1.default.query(`
      SELECT ec.id 
      FROM empl_cargos AS ec, empl_contratos AS ce, empleados AS e 
      WHERE ce.id_empleado = e.id AND ec.id_empl_contrato = ce.id AND e.id = $1
      `, [id_empleado]);
            if (CARGO.rowCount > 0) {
                return res.jsonp(CARGO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado' });
            }
        });
    }
    EncontrarIdCargoActual(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const CARGO = yield database_1.default.query('SELECT ec.id AS max, ec.hora_trabaja ' +
                'FROM datos_actuales_empleado AS da, empl_cargos AS ec ' +
                'WHERE ec.id = da.id_cargo AND da.id = $1', [id_empleado]);
            if (CARGO.rowCount > 0 && CARGO.rows[0]['max'] != null) {
                return res.jsonp(CARGO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado' });
            }
        });
    }
    BuscarUnTipo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const Cargos = yield database_1.default.query('SELECT *FROM tipo_cargo WHERE id = $1', [id]);
            if (Cargos.rowCount > 0) {
                return res.jsonp(Cargos.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado' });
            }
        });
    }
    BuscarTipoDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const Cargos = yield database_1.default.query('SELECT tc.id, tc.cargo FROM tipo_cargo AS tc, empl_cargos AS ec ' +
                'WHERE tc.id = ec.cargo AND id_departamento = $1 GROUP BY tc.cargo, tc.id', [id]);
            if (Cargos.rowCount > 0) {
                return res.jsonp(Cargos.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado' });
            }
        });
    }
    BuscarTipoSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const Cargos = yield database_1.default.query('SELECT tc.id, tc.cargo FROM tipo_cargo AS tc, empl_cargos AS ec ' +
                'WHERE tc.id = ec.cargo AND id_sucursal = $1 GROUP BY tc.cargo, tc.id', [id]);
            if (Cargos.rowCount > 0) {
                return res.jsonp(Cargos.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado' });
            }
        });
    }
    BuscarTipoRegimen(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const Cargos = yield database_1.default.query('SELECT tc.id, tc.cargo FROM cg_regimenes AS r, empl_cargos AS ec, ' +
                'empl_contratos AS c, tipo_cargo AS tc WHERE c.id_regimen = r.id AND c.id = ec.id_empl_contrato AND ' +
                'ec.cargo = tc.id AND r.id = $1 GROUP BY tc.id, tc.cargo', [id]);
            if (Cargos.rowCount > 0) {
                return res.jsonp(Cargos.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado' });
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
      SELECT * FROM tipo_cargo
      `);
            if (Cargos.rowCount > 0) {
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
            const { cargo } = req.body;
            const response = yield database_1.default.query(`
      INSERT INTO tipo_cargo (cargo) VALUES ($1) RETURNING *
      `, [cargo]);
            const [tipo_cargo] = response.rows;
            if (tipo_cargo) {
                return res.status(200).jsonp(tipo_cargo);
            }
            else {
                return res.status(404).jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR
    RevisarDatos(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
            let separador = path_1.default.sep;
            let ruta = (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)() + separador + documento;
            const workbook = xlsx_1.default.readFile(ruta);
            const sheet_name_list = workbook.SheetNames;
            const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            let data = {
                fila: '',
                cedula: '',
                departamento: '',
                fecha_inicio: '',
                fecha_final: '',
                sucursal: '',
                sueldo: '',
                cargo: '',
                hora_traba: '',
                jefe: '',
                observacion: ''
            };
            var listCargos = [];
            var duplicados = [];
            var mensaje = 'correcto';
            // LECTURA DE LOS DATOS DE LA PLANTILLA
            plantilla.forEach((dato, indice, array) => __awaiter(this, void 0, void 0, function* () {
                var { item, cedula, departamento, fecha_inicio, fecha_final, sucursal, sueldo, cargo, hora_trabaja, jefe } = dato;
                console.log('dato: ', dato);
                //Verificar que el registo no tenga datos vacios
                if ((item != undefined && item != '') && (cedula != undefined) && (departamento != undefined) &&
                    (fecha_inicio != undefined) && (fecha_final != undefined) && (sucursal != undefined) &&
                    (sueldo != undefined) && (cargo != undefined) && (hora_trabaja != undefined) &&
                    (jefe != undefined)) {
                    data.fila = item;
                    data.cedula = cedula;
                    data.departamento = departamento;
                    data.fecha_inicio = fecha_inicio;
                    data.fecha_final = fecha_final;
                    data.sucursal = sucursal;
                    data.sueldo = sueldo;
                    data.cargo = cargo;
                    data.hora_traba = hora_trabaja;
                    data.jefe = jefe;
                    data.observacion = 'no registrado';
                    //Valida si los datos de la columna cedula son numeros.
                    const rege = /^[0-9]+$/;
                    if (rege.test(data.cedula)) {
                        if (data.cedula.toString().length != 10) {
                            data.observacion = 'La cédula ingresada no es válida';
                        }
                        else {
                            // Verificar si la variable tiene el formato de fecha correcto con moment
                            if ((0, moment_1.default)(fecha_inicio, 'YYYY-MM-DD', true).isValid()) { }
                            else {
                                data.observacion = 'Formato de fecha ingreso incorrecto (YYYY-MM-DD)';
                            }
                            // Verificar si la variable tiene el formato de fecha correcto con moment
                            if ((0, moment_1.default)(fecha_final, 'YYYY-MM-DD', true).isValid()) { }
                            else {
                                data.observacion = 'Formato de fecha salida incorrecto (YYYY-MM-DD)';
                            }
                        }
                    }
                    else {
                        data.observacion = 'La cédula ingresada no es válida';
                    }
                    listCargos.push(data);
                }
                else {
                    data.fila = item;
                    data.cedula = cedula;
                    data.departamento = departamento;
                    data.fecha_inicio = fecha_inicio;
                    data.fecha_final = fecha_final;
                    data.sucursal = sucursal;
                    data.sueldo = sueldo;
                    data.cargo = cargo;
                    data.hora_traba = hora_trabaja;
                    data.jefe = jefe;
                    data.observacion = 'no registrado';
                    if (data.fila == '' || data.fila == undefined) {
                        data.fila = 'error';
                        mensaje = 'error';
                    }
                    if (departamento == undefined) {
                        data.departamento = 'No registrado';
                        data.observacion = 'Departamento, ' + data.observacion;
                    }
                    if (fecha_inicio == undefined) {
                        data.fecha_inicio = 'No registrado';
                        data.observacion = 'Fecha inicio, ' + data.observacion;
                    }
                    if (fecha_final == undefined) {
                        data.fecha_final = 'No registrado';
                        data.observacion = 'Fecha final, ' + data.observacion;
                    }
                    if (sucursal == undefined) {
                        data.sucursal = 'No registrado';
                        data.observacion = 'Sucursal, ' + data.observacion;
                    }
                    if (sueldo == undefined) {
                        data.sueldo = 'No registrado';
                        data.observacion = 'Sueldo, ' + data.observacion;
                    }
                    if (cargo == undefined) {
                        data.cargo = 'No registrado';
                        data.observacion = 'Cargo, ' + data.observacion;
                    }
                    if (hora_trabaja == undefined) {
                        data.hora_trabaja = 'No registrado';
                        data.observacion = 'Hora trabaja, ' + data.observacion;
                    }
                    if (jefe == undefined) {
                        data.jefe = 'No registrado';
                        data.observacion = 'Jefe, ' + data.observacion;
                    }
                    // Verificar si la variable tiene el formato de fecha correcto con moment
                    if (data.fecha_ingreso != 'No registrado') {
                        if ((0, moment_1.default)(fecha_inicio, 'YYYY-MM-DD', true).isValid()) { }
                        else {
                            data.observacion = 'Formato de fecha inicio incorrecto (YYYY-MM-DD)';
                        }
                    }
                    // Verificar si la variable tiene el formato de fecha correcto con moment
                    if (data.fecha_salida != 'No registrado') {
                        if ((0, moment_1.default)(fecha_final, 'YYYY-MM-DD', true).isValid()) { }
                        else {
                            data.observacion = 'Formato de fecha final incorrecto (YYYY-MM-DD)';
                        }
                    }
                    if (cedula == undefined) {
                        data.cedula = 'No registrado';
                        data.observacion = 'Cédula, ' + data.observacion;
                    }
                    else {
                        //Valida si los datos de la columna cedula son numeros.
                        const rege = /^[0-9]+$/;
                        if (rege.test(data.cedula)) {
                            if (data.cedula.toString().length != 10) {
                                data.observacion = 'La cédula ingresada no es válida';
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
                if (valor.cedula != 'No registrado' && valor.pais != 'No registrado' && valor.pais != '') {
                    if (valor.observacion == 'no registrado') {
                        var VERIFICAR_CEDULA = yield database_1.default.query('SELECT * FROM empleados WHERE cedula = $1', [valor.cedula]);
                        if (VERIFICAR_CEDULA.rows[0] != undefined && VERIFICAR_CEDULA.rows[0] != '') {
                            var VERIFICAR_DEPARTAMENTO = yield database_1.default.query('SELECT  * FROM cg_departamentos WHERE UPPER(nombre) = $1', [valor.departamento.toUpperCase()]);
                            if (VERIFICAR_DEPARTAMENTO.rows[0] != undefined && VERIFICAR_DEPARTAMENTO.rows[0] != '') {
                                var VERIFICAR_SUCURSALES = yield database_1.default.query('SELECT * FROM sucursales WHERE UPPER(nombre) = $1', [valor.sucursal.toUpperCase()]);
                                if (VERIFICAR_SUCURSALES.rows[0] != undefined && VERIFICAR_SUCURSALES.rows[0] != '') {
                                    var VERFICAR_CARGO = yield database_1.default.query('SLECT * FROM tipo_cargo WHERE UPPER(cargo) = $1', [valor.cargo.toUpperCase()]);
                                    if (VERFICAR_CARGO.rows[0] != undefined && VERIFICAR_CEDULA.rows[0] != '') {
                                        // Discriminación de elementos iguales
                                        if (duplicados.find((p) => p.cedula === valor.cedula) == undefined) {
                                            duplicados.push(valor);
                                        }
                                        else {
                                            valor.observacion = '1';
                                        }
                                    }
                                    else {
                                        valor.observacion = 'Cargo no existe en el sistema';
                                    }
                                }
                                else {
                                    valor.observacion = 'Sucursal no existe en el sistema';
                                }
                            }
                            else {
                                valor.observacion = 'Departamento no existe en el sistema';
                            }
                        }
                        else {
                            valor.observacion = 'Cédula no existe en el sistema';
                        }
                    }
                }
            }));
            setTimeout(() => {
                listCargos.sort((a, b) => {
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
                listCargos.forEach((item) => {
                    if (item.observacion == '1') {
                        item.observacion = 'Registro duplicado - cédula';
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
                    listCargos = undefined;
                }
                console.log('listContratos: ', listCargos);
                return res.jsonp({ message: mensaje, data: listCargos });
            }, 1500);
        });
    }
    CargarPlantilla_contrato(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const plantilla = req.body;
            console.log('datos contrato: ', plantilla);
        });
    }
}
exports.EMPLEADO_CARGO_CONTROLADOR = new EmpleadoCargosControlador();
exports.default = exports.EMPLEADO_CARGO_CONTROLADOR;
