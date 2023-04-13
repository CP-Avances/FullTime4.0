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
const database_1 = __importDefault(require("../../database"));
class DepartamentoControlador {
    ListarDepartamentos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const PROVINCIA = yield database_1.default.query('SELECT * FROM cg_departamentos');
            if (PROVINCIA.rowCount > 0) {
                return res.json(PROVINCIA.rows);
            }
            else {
                return res.status(404).json({ text: 'No se encuentran registros' });
            }
        });
    }
    getOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const unaProvincia = yield database_1.default.query('SELECT * FROM cg_departamentos WHERE id = $1', [id]);
            if (unaProvincia.rowCount > 0) {
                return res.json(unaProvincia.rows);
            }
            res.status(404).json({ text: 'El departamento no ha sido encontrado' });
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, depa_padre, nivel } = req.body;
            yield database_1.default.query('INSERT INTO cg_departamentos (nombre, depa_padre,nivel) VALUES ($1, $2,$3)', [nombre, depa_padre, nivel]);
            res.json({ message: 'El departamento ha sido guardado con éxito' });
        });
    }
    getIdByNombre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.params;
            const unIdProceso = yield database_1.default.query('SELECT id FROM cg_departamentos WHERE nombre = $1', [nombre]);
            if (unIdProceso.rowCount > 0) {
                return res.json(unIdProceso.rows);
            }
            res.status(404).json({ text: 'El departamento no ha sido encontrado' });
        });
    }
    updateDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, nivel, depa_padre } = req.body;
            const { id } = req.params;
            yield database_1.default.query('UPDATE cg_departamentos set NOMBRE= $1, DEPA_PADRE =$2, NIVEL=$3 WHERE id= $4', [nombre, depa_padre, nivel, id]);
            console.log(database_1.default.query);
            res.json({ message: 'El departamento ha sido modificado con éxito' });
        });
    }
}
exports.DEPARTAMENTO_CONTROLADOR = new DepartamentoControlador();
exports.default = exports.DEPARTAMENTO_CONTROLADOR;
