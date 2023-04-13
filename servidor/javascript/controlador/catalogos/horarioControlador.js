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
class HorarioControlador {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const provincia = yield database_1.default.query('SELECT * FROM cg_horarios');
            res.json(provincia.rows);
        });
    }
    getOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const unaProvincia = yield database_1.default.query('SELECT * FROM cg_horarios WHERE id = $1', [id]);
            if (unaProvincia.rowCount > 0) {
                return res.json(unaProvincia.rows);
            }
            res.status(404).json({ text: 'No se ha encontrado el horario' });
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, min_almuerzo, hora_trabajo, flexible, por_horas } = req.body;
            //HORA_TRABAJO --SOLO PERMITE 2 Nùmeros 1 entero, un decimal
            yield database_1.default.query('INSERT INTO cg_horarios (nombre, min_almuerzo, hora_trabajo,flexible, por_horas) VALUES ($1, $2,$3,$4,$5)', [nombre, min_almuerzo, hora_trabajo, flexible, por_horas]);
            res.json({ message: 'El horario ha sido registrado' });
        });
    }
}
exports.HORARIO_CONTROLADOR = new HorarioControlador();
exports.default = exports.HORARIO_CONTROLADOR;
