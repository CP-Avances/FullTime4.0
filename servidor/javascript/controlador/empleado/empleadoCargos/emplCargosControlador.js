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
}
exports.EMPLEADO_CARGO_CONTROLADOR = new EmpleadoCargosControlador();
exports.default = exports.EMPLEADO_CARGO_CONTROLADOR;
