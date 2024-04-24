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
exports.DEPARTAMENTO_CONTROLADOR = void 0;
const builder = require('xmlbuilder');
const database_1 = __importDefault(require("../../database"));
class DepartamentoControlador {
    // REGISTRAR DEPARTAMENTO
    CrearDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, id_sucursal } = req.body;
                yield database_1.default.query(`
        INSERT INTO cg_departamentos (nombre, id_sucursal ) VALUES ($1, $2)
        `, [nombre, id_sucursal]);
                res.jsonp({ message: 'Registro guardado.' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // ACTUALIZAR REGISTRO DE DEPARTAMENTO   --**VERIFICADO
    ActualizarDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, id_sucursal } = req.body;
                const id = req.params.id;
                console.log(id);
                yield database_1.default.query(`
        UPDATE cg_departamentos set nombre = $1, id_sucursal = $2 
        WHERE id = $3
        `, [nombre, id_sucursal, id]);
                res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA BUSCAR LISTA DE DEPARTAMENTOS POR ID SUCURSAL
    ObtenerDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const DEPARTAMENTO = yield database_1.default.query(`
      SELECT d.*, s.nombre AS sucursal
      FROM cg_departamentos AS d, sucursales AS s 
      WHERE d.id = $1 AND s.id = d.id_sucursal
      `, [id]);
            if (DEPARTAMENTO.rowCount > 0) {
                return res.jsonp(DEPARTAMENTO.rows);
            }
            res.status(404).jsonp({ text: 'El departamento no ha sido encontrado.' });
        });
    }
    // METODO PARA BUSCAR LISTA DE DEPARTAMENTOS POR ID SUCURSAL
    ObtenerDepartamentosSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_sucursal } = req.params;
            const DEPARTAMENTO = yield database_1.default.query(`
      SELECT * FROM cg_departamentos WHERE id_sucursal = $1
      `, [id_sucursal]);
            if (DEPARTAMENTO.rowCount > 0) {
                return res.jsonp(DEPARTAMENTO.rows);
            }
            res.status(404).jsonp({ text: 'El departamento no ha sido encontrado' });
        });
    }
    // METODO PARA BUSCAR LISTA DE DEPARTAMENTOS POR ID SUCURSAL Y EXCLUIR DEPARTAMENTO ACTUALIZADO
    ObtenerDepartamentosSucursal_(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_sucursal, id } = req.params;
            const DEPARTAMENTO = yield database_1.default.query(`
        SELECT * FROM cg_departamentos WHERE id_sucursal = $1 AND NOT id = $2
        `, [id_sucursal, id]);
            if (DEPARTAMENTO.rowCount > 0) {
                return res.jsonp(DEPARTAMENTO.rows);
            }
            res.status(404).jsonp({ text: 'El departamento no ha sido encontrado' });
        });
    }
    // METODO DE BUSQUEDA DE DEPARTAMENTOS   --**VERIFICAR
    ListarDepartamentos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const NIVELES = yield database_1.default.query(`
      SELECT s.id AS id_sucursal, s.nombre AS nomsucursal, n.id_departamento AS id, 
        n.departamento AS nombre, n.nivel, n.dep_nivel_nombre AS departamento_padre
      FROM nivel_jerarquicodep AS n, sucursales AS s
      WHERE n.id_establecimiento = s.id AND 
        n.nivel = (SELECT MAX(nivel) FROM nivel_jerarquicodep WHERE id_departamento = n.id_departamento)
      ORDER BY s.nombre, n.departamento ASC
      `);
            const DEPARTAMENTOS = yield database_1.default.query(`
      SELECT s.id AS id_sucursal, s.nombre AS nomsucursal, cd.id, cd.nombre,
      0 AS NIVEL, null AS departamento_padre
      FROM cg_departamentos AS cd, sucursales AS s
      WHERE NOT cd.id IN (SELECT id_departamento FROM nivel_jerarquicodep) AND
      s.id = cd.id_sucursal
      ORDER BY s.nombre, cd.nombre ASC;
      `);
            if (DEPARTAMENTOS.rowCount > 0 && NIVELES.rowCount > 0) {
                NIVELES.rows.forEach((obj) => {
                    DEPARTAMENTOS.rows.push(obj);
                });
                return res.jsonp(DEPARTAMENTOS.rows);
            }
            else if (DEPARTAMENTOS.rowCount > 0) {
                return res.jsonp(DEPARTAMENTOS.rows);
            }
            else if (NIVELES.rowCount > 0) {
                return res.jsonp(NIVELES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA LISTAR INFORMACION DE DEPARTAMENTOS POR ID DE SUCURSAL   --**VERIFICADO
    ListarDepartamentosSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_sucursal;
            const NIVEL = yield database_1.default.query(`
      SELECT s.id AS id_sucursal, s.nombre AS nomsucursal, n.id_departamento AS id, 
        n.departamento AS nombre, n.nivel, n.dep_nivel_nombre AS departamento_padre
      FROM nivel_jerarquicodep AS n, sucursales AS s
      WHERE n.id_establecimiento = s.id AND 
        n.nivel = (SELECT MAX(nivel) FROM nivel_jerarquicodep WHERE id_departamento = n.id_departamento)
        AND s.id = $1
      ORDER BY s.nombre, n.departamento ASC
      `, [id]);
            const DEPARTAMENTO = yield database_1.default.query(`
      SELECT s.id AS id_sucursal, s.nombre AS nomsucursal, cd.id, cd.nombre,
        0 AS NIVEL, null AS departamento_padre
      FROM cg_departamentos AS cd, sucursales AS s
      WHERE NOT cd.id IN (SELECT id_departamento FROM nivel_jerarquicodep) AND
        s.id = cd.id_sucursal AND s.id = $1
      ORDER BY s.nombre, cd.nombre ASC
      `, [id]);
            if (DEPARTAMENTO.rowCount > 0 && NIVEL.rowCount > 0) {
                DEPARTAMENTO.rows.forEach((obj) => {
                    NIVEL.rows.push(obj);
                });
                return res.jsonp(NIVEL.rows);
            }
            else if (DEPARTAMENTO.rowCount > 0) {
                return res.jsonp(DEPARTAMENTO.rows);
            }
            else if (NIVEL.rowCount > 0) {
                return res.jsonp(NIVEL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTRO
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                yield database_1.default.query(`
        DELETE FROM cg_departamentos WHERE id = $1
        `, [id]);
                res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    //METODO PARA CREAR NIVELES JERARQUICOS POR DEPARTAMENTOS  --**VERIFICADO
    CrearNivelDepa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_departamento, departamento, nivel, dep_nivel, dep_nivel_nombre, id_establecimiento, id_suc_dep_nivel } = req.body;
                yield database_1.default.query(`
        INSERT INTO nivel_jerarquicodep (departamento, id_departamento, nivel, dep_nivel_nombre, id_dep_nivel, 
          id_establecimiento, id_suc_dep_nivel ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [departamento, id_departamento, nivel, dep_nivel_nombre, dep_nivel, id_establecimiento, id_suc_dep_nivel]);
                res.jsonp({ message: 'Registro guardado.' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    //METODO PARA BUSCAR NIVELES JERARQUICOS POR DEPARTAMENTO   --**VERIFICADO
    ObtenerNivelesDepa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_departamento, id_establecimiento } = req.params;
            const NIVELESDEP = yield database_1.default.query(`
      SELECT n.*, s.nombre AS suc_nivel
      FROM nivel_jerarquicodep AS n, sucursales AS s
      WHERE id_departamento = $1 AND id_establecimiento = $2 
        AND s.id = n.id_suc_dep_nivel
      ORDER BY nivel DESC 
      `, [id_departamento, id_establecimiento]);
            if (NIVELESDEP.rowCount > 0) {
                return res.jsonp(NIVELESDEP.rows);
            }
            res.status(404).jsonp({ text: 'Registros no encontrados.' });
        });
    }
    // ACTUALIZAR REGISTRO DE NIVEL DE DEPARTAMENTO DE TABLA NIVEL_JERARQUICO   --**VERIFICADO
    ActualizarNivelDepa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel } = req.body;
                const id = req.params.id;
                yield database_1.default.query(`
        UPDATE nivel_jerarquicodep set nivel = $1 
        WHERE id = $2
        `, [nivel, id]);
                res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTRO DE NIVEL DE DEPARTAMENTO   --**VERIFICADO
    EliminarRegistroNivelDepa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                yield database_1.default.query(`
        DELETE FROM nivel_jerarquicodep WHERE id = $1
        `, [id]);
                res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    //METODO PARA CREAR NIVELES JERARQUICOS POR DEPARTAMENTOS  --**VERIFICADO
    ActualizarNombreNivel(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_departamento, departamento } = req.body;
                yield database_1.default.query(`
        UPDATE nivel_jerarquicodep SET departamento = $1
        WHERE id_departamento = $2
        `, [departamento, id_departamento]);
                yield database_1.default.query(`
        UPDATE nivel_jerarquicodep SET dep_nivel_nombre = $1
        WHERE id_dep_nivel = $2
        `, [departamento, id_departamento]);
                res.jsonp({ message: 'Registro guardado.' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    ListarNombreDepartamentos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const DEPARTAMENTOS = yield database_1.default.query('SELECT * FROM cg_departamentos');
            if (DEPARTAMENTOS.rowCount > 0) {
                return res.jsonp(DEPARTAMENTOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarIdDepartamentoNombre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.params;
            const DEPARTAMENTOS = yield database_1.default.query('SELECT * FROM cg_departamentos WHERE nombre = $1', [nombre]);
            if (DEPARTAMENTOS.rowCount > 0) {
                return res.jsonp(DEPARTAMENTOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ObtenerIdDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.params;
            const DEPARTAMENTO = yield database_1.default.query('SELECT id FROM cg_departamentos WHERE nombre = $1', [nombre]);
            if (DEPARTAMENTO.rowCount > 0) {
                return res.jsonp(DEPARTAMENTO.rows);
            }
            res.status(404).jsonp({ text: 'El departamento no ha sido encontrado' });
        });
    }
    ObtenerUnDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const DEPARTAMENTO = yield database_1.default.query('SELECT * FROM cg_departamentos WHERE id = $1', [id]);
            if (DEPARTAMENTO.rowCount > 0) {
                return res.jsonp(DEPARTAMENTO.rows[0]);
            }
            res.status(404).jsonp({ text: 'El departamento no ha sido encontrado' });
        });
    }
    BuscarDepartamentoPorCargo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_cargo;
            const departamento = yield database_1.default.query('SELECT ec.id_departamento, d.nombre, ec.id AS cargo ' +
                'FROM empl_cargos AS ec, cg_departamentos AS d WHERE d.id = ec.id_departamento AND ec.id = $1 ' +
                'ORDER BY cargo DESC', [id]);
            if (departamento.rowCount > 0) {
                return res.json([departamento.rows[0]]);
            }
            else {
                return res.status(404).json({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarDepartamentosRegimen(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const DEPARTAMENTOS = yield database_1.default.query('SELECT d.id, d.nombre FROM cg_regimenes AS r, empl_cargos AS ec, ' +
                'empl_contratos AS c, cg_departamentos AS d WHERE c.id_regimen = r.id AND c.id = ec.id_empl_contrato AND ' +
                'ec.id_departamento = d.id AND r.id = $1 GROUP BY d.id, d.nombre', [id]);
            if (DEPARTAMENTOS.rowCount > 0) {
                res.jsonp(DEPARTAMENTOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
}
exports.DEPARTAMENTO_CONTROLADOR = new DepartamentoControlador();
exports.default = exports.DEPARTAMENTO_CONTROLADOR;
