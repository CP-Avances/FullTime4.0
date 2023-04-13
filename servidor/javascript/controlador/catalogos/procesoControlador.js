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
class ProcesoControlador {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const provincia = yield database_1.default.query('SELECT * FROM cg_procesos');
            res.json(provincia.rows);
        });
    }
    getOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const unaProvincia = yield database_1.default.query('SELECT * FROM cg_procesos WHERE id = $1', [id]);
            if (unaProvincia.rowCount > 0) {
                return res.json(unaProvincia.rows);
            }
            res.status(404).json({ text: 'El proceso no ha sido encontrado' });
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, nivel, proc_padre } = req.body;
            yield database_1.default.query('INSERT INTO cg_procesos (nombre, nivel, proc_padre) VALUES ($1, $2, $3)', [nombre, nivel, proc_padre]);
            console.log(req.body);
            res.json({ message: 'El departamento ha sido guardado en éxito' });
        });
    }
    getIdByNombre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.params;
            const unIdProceso = yield database_1.default.query('SELECT id FROM cg_procesos WHERE nombre = $1', [nombre]);
            if (unIdProceso != null) {
                return res.json(unIdProceso.rows);
            }
            res.status(404).json({ text: 'El proceso no ha sido encontrado' });
        });
    }
}
exports.PROCESOS_CONTROLADOR = new ProcesoControlador();
exports.default = exports.PROCESOS_CONTROLADOR;
