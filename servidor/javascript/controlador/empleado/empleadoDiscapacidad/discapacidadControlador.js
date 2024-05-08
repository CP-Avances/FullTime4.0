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
exports.DISCAPACIDAD_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../../database"));
class DiscapacidadControlador {
    // METODO PARA BUSCAR DATOS DISCAPACIDAD USUARIO
    BuscarDiscapacidadUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const unaDiscapacidad = yield database_1.default.query(`
      SELECT cd.id_empleado, cd.carnet_conadis, cd.porcentaje, cd.id_discapacidad, td.nombre AS nom_tipo
      FROM eu_empleado_discapacidad cd, e_cat_discapacidad td, eu_empleados e
      WHERE cd.id_empleado = e.id AND cd.id_discapacidad = td.id AND cd.id_empleado = $1
      `, [id_empleado]);
            if (unaDiscapacidad.rowCount > 0) {
                return res.jsonp(unaDiscapacidad.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    // METODO PARA REGISTRAR DISCAPACIDAD
    RegistrarDiscapacidad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado, carn_conadis, porcentaje, tipo } = req.body;
            yield database_1.default.query(`
      INSERT INTO eu_empleado_discapacidad (id_empleado, carnet_conadis, porcentaje, id_discapacidad) 
      VALUES ($1, $2, $3, $4)
      `, [id_empleado, carn_conadis, porcentaje, tipo]);
            res.jsonp({ message: 'Registro guardado.' });
        });
    }
    // METODO PARA ACTUALIZAR DATOS DE REGISTRO
    ActualizarDiscapacidad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id_empleado = req.params.id_empleado;
            const { carn_conadis, porcentaje, tipo } = req.body;
            yield database_1.default.query(`
      UPDATE eu_empleado_discapacidad SET carnet_conadis = $1, porcentaje = $2, id_discapacidad = $3 
      WHERE id_empleado = $4
      `, [carn_conadis, porcentaje, tipo, id_empleado]);
            res.jsonp({ message: 'Registro actualizado.' });
        });
    }
    EliminarDiscapacidad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id_empleado = req.params.id_empleado;
            yield database_1.default.query(`
      DELETE FROM eu_empleado_discapacidad WHERE id_empleado = $1
      `, [id_empleado]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    /** *************************************************************************************** **
     ** **                METODO PARA MANEJO DE DATOS DE TIPO DISCAPACIDAD                   ** **
     ** *************************************************************************************** **/
    // METODO PARA CREAR TIPO DE DISCAPACIDAD
    RegistrarTipo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.body;
            const response = yield database_1.default.query(`
      INSERT INTO e_cat_discapacidad (nombre) VALUES ($1) RETURNING *
      `, [nombre]);
            const [tipo] = response.rows;
            if (tipo) {
                return res.status(200).jsonp(tipo);
            }
            else {
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            }
        });
    }
    // METODO PARA LISTAR TIPOS DE DISCAPACIDAD
    ListarTipo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const TIPO_DISCAPACIDAD = yield database_1.default.query(`
      SELECT * FROM e_cat_discapacidad
      `);
            if (TIPO_DISCAPACIDAD.rowCount > 0) {
                return res.jsonp(TIPO_DISCAPACIDAD.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const DISCAPACIDAD = yield database_1.default.query(`
      SELECT * FROM eu_empleado_discapacidad
      `);
            if (DISCAPACIDAD.rowCount > 0) {
                return res.jsonp(DISCAPACIDAD.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    /* TIPO DISCAPACIDAD */
    ObtenerUnTipoD(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const TIPO_DISCAPACIDAD = yield database_1.default.query(`
      SELECT * FROM e_cat_discapacidad WHERE id = $1
      `, [id]);
            if (TIPO_DISCAPACIDAD.rowCount > 0) {
                return res.jsonp(TIPO_DISCAPACIDAD.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    ActualizarTipoD(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params;
            const { nombre } = req.body;
            yield database_1.default.query(`
      UPDATE e_cat_discapacidad SET nombre = $1 WHERE id = $2
      `, [nombre, id]);
            res.jsonp({ message: 'Registro actualizado.' });
        });
    }
}
exports.DISCAPACIDAD_CONTROLADOR = new DiscapacidadControlador();
exports.default = exports.DISCAPACIDAD_CONTROLADOR;
