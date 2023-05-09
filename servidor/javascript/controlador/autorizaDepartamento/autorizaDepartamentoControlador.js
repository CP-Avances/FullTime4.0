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
exports.AUTORIZA_DEPARTAMENTO_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../database"));
class AutorizaDepartamentoControlador {
    // METODO PARA BUSCAR USUARIO AUTORIZA
    EncontrarAutorizacionUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const AUTORIZA = yield database_1.default.query(`
            SELECT da.id, da.id_departamento, da.id_empl_cargo, da.estado, da.autorizar, da.preautorizar, cd.nombre AS nom_depar,
                ce.id AS id_empresa, ce.nombre AS nom_empresa, s.id AS id_sucursal, 
                s.nombre AS nom_sucursal
            FROM depa_autorizaciones AS da, cg_departamentos AS cd, cg_empresa AS ce, 
                sucursales AS s
            WHERE da.id_departamento = cd.id AND cd.id_sucursal = s.id AND ce.id = s.id_empresa
                AND da.id_empleado = $1
            `, [id_empleado]);
            if (AUTORIZA.rowCount > 0) {
                return res.jsonp(AUTORIZA.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA REGISTRAR AUTORIZACION
    CrearAutorizaDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_departamento, id_empl_cargo, estado, id_empleado, autorizar, preautorizar } = req.body;
            yield database_1.default.query(`
            INSERT INTO depa_autorizaciones (id_departamento, id_empl_cargo, estado, id_empleado, autorizar, preautorizar)
            VALUES ($1, $2, $3, $4, $5, $6)
            `, [id_departamento, id_empl_cargo, estado, id_empleado, autorizar, preautorizar]);
            res.jsonp({ message: 'Registro guardado.' });
        });
    }
    // METODO PARA ACTUALIZAR REGISTRO
    ActualizarAutorizaDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_departamento, id_empl_cargo, estado, id, autorizar, preautorizar } = req.body;
            yield database_1.default.query(`
            UPDATE depa_autorizaciones SET id_departamento = $1, id_empl_cargo = $2, estado = $3, autorizar = $5, preautorizar = $6
            WHERE id = $4
            `, [id_departamento, id_empl_cargo, estado, id, autorizar, preautorizar]);
            res.jsonp({ message: 'Registro actualizado.' });
        });
    }
    // METODO PARA ELIMINAR REGISTROS
    EliminarAutorizacionDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield database_1.default.query(`
            DELETE FROM depa_autorizaciones WHERE id = $1
            `, [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    ListarAutorizaDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const AUTORIZA = yield database_1.default.query('SELECT * FROM depa_autorizaciones');
            if (AUTORIZA.rowCount > 0) {
                return res.jsonp(AUTORIZA.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ObtenerlistaEmpleadosAutorizan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_depa } = req.params;
            const EMPLEADOS = yield database_1.default.query(`
            SELECT d.id_departamento, v.nombre, v.apellido, d.autorizar, d.preautorizar, d.estado, v.depa_trabaja 
            FROM depa_autorizaciones AS d INNER JOIN VistaAutorizanCargo AS v ON d.id_departamento = v.id_depar AND d.id_empl_cargo = v.id_cargo 
            WHERE d.id_departamento = $1
            `, [id_depa]);
            if (EMPLEADOS.rowCount > 0) {
                return res.jsonp(EMPLEADOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados' });
            }
        });
    }
    ObtenerQuienesAutorizan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_depar } = req.params;
            const EMPLEADOS = yield database_1.default.query('SELECT * FROM VistaAutorizanCargo WHERE id_depar = $1', [id_depar]);
            if (EMPLEADOS.rowCount > 0) {
                return res.jsonp(EMPLEADOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados' });
            }
        });
    }
}
exports.AUTORIZA_DEPARTAMENTO_CONTROLADOR = new AutorizaDepartamentoControlador();
exports.default = exports.AUTORIZA_DEPARTAMENTO_CONTROLADOR;
