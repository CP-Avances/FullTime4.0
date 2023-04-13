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
exports.ENROLADO_RELOJ_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../database"));
class EnroladoRelojControlador {
    AsignarRelojEnrolado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_reloj, id_enrolado } = req.body;
            yield database_1.default.query('INSERT INTO relj_enrolados (id_reloj, id_enrolado) VALUES ($1, $2)', [id_reloj, id_enrolado]);
            res.jsonp({ message: 'Empleado enrolado agregado a dispositivo' });
        });
    }
    ObtenerIdReloj(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_reloj, id_enrolado } = req.body;
            const ENROLADO_RELOJ = yield database_1.default.query('SELECT * FROM relj_enrolados WHERE id_reloj = $1 AND id_enrolado  = $2', [id_reloj, id_enrolado]);
            if (ENROLADO_RELOJ.rowCount > 0) {
                return res.jsonp(ENROLADO_RELOJ.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados' });
            }
        });
    }
    EncontrarEnroladosReloj(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { enroladoid } = req.params;
            const ENROLADO_RELOJ = yield database_1.default.query('SELECT * FROM NombreEnroladoReloj WHERE enroladoid = $1', [enroladoid]);
            if (ENROLADO_RELOJ.rowCount > 0) {
                return res.jsonp(ENROLADO_RELOJ.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados' });
            }
        });
    }
    ActualizarRelojEnrolado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_reloj, id_enrolado, id } = req.body;
            yield database_1.default.query('UPDATE relj_enrolados SET id_reloj = $1, id_enrolado = $2 WHERE id = $3', [id_reloj, id_enrolado, id]);
            res.jsonp({ message: 'Registro Actualizado' });
        });
    }
    EliminarRelojEnrolado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield database_1.default.query('DELETE FROM relj_enrolados WHERE id = $1', [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
}
exports.ENROLADO_RELOJ_CONTROLADOR = new EnroladoRelojControlador();
exports.default = exports.ENROLADO_RELOJ_CONTROLADOR;
