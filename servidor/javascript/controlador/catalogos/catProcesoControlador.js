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
exports.PROCESOS_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../database"));
class ProcesoControlador {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const Sin_proc_padre = yield database_1.default.query(`
      SELECT * FROM map_cat_procesos AS p 
      WHERE p.proceso_padre IS NULL 
      ORDER BY p.nombre ASC
      `);
            const Con_proc_padre = yield database_1.default.query(`
      SELECT p.id, p.nombre, p.nivel, nom_p.nombre AS proc_padre 
      FROM map_cat_procesos AS p, NombreProcesos AS nom_p 
      WHERE p.proceso_padre = nom_p.id 
      ORDER BY p.nombre ASC
      `);
            Sin_proc_padre.rows.forEach((obj) => {
                Con_proc_padre.rows.push(obj);
            });
            res.jsonp(Con_proc_padre.rows);
        });
    }
    getOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const unaProvincia = yield database_1.default.query(`
      SELECT * FROM map_cat_procesos WHERE id = $1
      `, [id]);
            if (unaProvincia.rowCount > 0) {
                return res.jsonp(unaProvincia.rows);
            }
            res.status(404).jsonp({ text: 'El proceso no ha sido encontrado.' });
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, nivel, proc_padre } = req.body;
            yield database_1.default.query(`
      INSERT INTO map_cat_procesos (nombre, nivel, proceso_padre) VALUES ($1, $2, $3)
      `, [nombre, nivel, proc_padre]);
            console.log(req.body);
            res.jsonp({ message: 'El proceso guardado.' });
        });
    }
    getIdByNombre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.params;
            const unIdProceso = yield database_1.default.query(`
      SELECT id FROM map_cat_procesos WHERE nombre = $1
      `, [nombre]);
            if (unIdProceso != null) {
                return res.jsonp(unIdProceso.rows);
            }
            res.status(404).jsonp({ text: 'El proceso no ha sido encontrado.' });
        });
    }
    ActualizarProceso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, nivel, proc_padre, id } = req.body;
            yield database_1.default.query(`
      UPDATE map_cat_procesos SET nombre = $1, nivel = $2, proceso_padre = $3 WHERE id = $4
      `, [nombre, nivel, proc_padre, id]);
            res.jsonp({ message: 'Proceso actualizado exitosamente.' });
        });
    }
    EliminarProceso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield database_1.default.query(`
      DELETE FROM map_cat_procesos WHERE id = $1
      `, [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
}
exports.PROCESOS_CONTROLADOR = new ProcesoControlador();
exports.default = exports.PROCESOS_CONTROLADOR;
