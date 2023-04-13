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
class EnroladoControlador {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const provincia = yield database_1.default.query('SELECT * FROM cg_enrolados');
            res.json(provincia.rows);
        });
    }
    getOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const unEnrolado = yield database_1.default.query('SELECT * FROM cg_enrolados WHERE id = $1', [id]);
            if (unEnrolado.rowCount > 0) {
                return res.json(unEnrolado.rows);
            }
            res.status(404).json({ text: 'No se ha encontrado en el catálogo de enrolados' });
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_usuario, nombre, contrasenia, activo, finger, data_finger } = req.body;
            yield database_1.default.query('INSERT INTO cg_enrolados (id_usuario, nombre, contrasenia, activo, finger, data_finger) VALUES ($1, $2,$3, $4, $5, $6)', [id_usuario, nombre, contrasenia, activo, finger, data_finger]);
            console.log(req.body);
            res.json({ message: 'Se ha añadido correctamente al catalogo enrolados' });
        });
    }
    getIdByNombre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.params;
            const unIdEnrolado = yield database_1.default.query('SELECT id FROM cg_enrolados WHERE nombre = $1', [nombre]);
            if (unIdEnrolado != null) {
                return res.json(unIdEnrolado.rows);
            }
            res.status(404).json({ text: 'No se ha encontrado en el catàlogo enrolados' });
        });
    }
}
exports.ENROLADOS_CONTROLADOR = new EnroladoControlador();
exports.default = exports.ENROLADOS_CONTROLADOR;
