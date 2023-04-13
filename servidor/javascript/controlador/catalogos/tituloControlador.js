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
class TituloControlador {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const titulo = yield database_1.default.query('SELECT * FROM cg_titulos');
            res.json(titulo.rows);
        });
    }
    getOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const unTitulo = yield database_1.default.query('SELECT * FROM cg_titulos WHERE id = $1', [id]);
            if (unTitulo.rowCount > 0) {
                return res.json(unTitulo.rows);
            }
            res.status(404).json({ text: 'El empleado no ha sido encontrado' });
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, nivel } = req.body;
            yield database_1.default.query('INSERT INTO cg_titulos ( nombre, nivel ) VALUES ($1, $2)', [nombre, nivel]);
            console.log(req.body);
            res.json({ message: 'Titulo guardado' });
        });
    }
}
exports.tituloControlador = new TituloControlador();
exports.default = exports.tituloControlador;
