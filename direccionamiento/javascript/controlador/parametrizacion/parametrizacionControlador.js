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
exports.parametrizacionControlador = void 0;
const database_1 = __importDefault(require("../../database"));
const builder = require('xmlbuilder');
class ParametrizacionControlador {
    //Servicio con datos por defecto
    ObtenerParametrizacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const PARAMETRO = yield database_1.default.query(`
                SELECT 999 AS id_tipo, 'ejecucion_inicial' AS tipo, 999 AS id_detalle, CASE WHEN $1 = 25 THEN 'DD/MM/YYYY' WHEN $1 = 26 THEN 'hh:mm:ss A' END AS descripcion
                `, [id]);
                if (PARAMETRO.rowCount != null) {
                    if (PARAMETRO.rowCount > 0) {
                        return res.jsonp(PARAMETRO.rows);
                    }
                }
                else {
                    res.status(404).jsonp({ text: 'Registro no encontrado.' });
                }
            }
            catch (error) {
                res.status(500).jsonp({ text: 'error' });
            }
        });
    }
}
exports.parametrizacionControlador = new ParametrizacionControlador;
exports.default = exports.parametrizacionControlador;
