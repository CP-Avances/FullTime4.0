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
exports.licenciaControlador = void 0;
const database_1 = __importDefault(require("../../database"));
class LicenciaControlador {
    ObtenerLicencia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //CONSULTA DE LICENCIA EN BASE A PUBLIC_KEY DE EMPRESA
                let { public_key } = req.body;
                let licenciasRows = 0;
                let licencias = yield database_1.default.query(`
                SELECT 
                    llave_publica, 
                    fecha_activacion, 
                    fecha_desactivacion 
                FROM empresa_licencia empresa_licencia
                WHERE llave_publica = $1
                `, [public_key]).then((result) => {
                    licenciasRows = result.rowCount;
                    if (result.rowCount > 0) {
                        return res.status(200).jsonp(result.rows);
                    }
                });
                if (licenciasRows === 0) {
                    return res.status(404).jsonp({ text: 'No se encuentran registros.' });
                }
            }
            catch (error) {
                res.status(500).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
}
exports.licenciaControlador = new LicenciaControlador;
exports.default = exports.licenciaControlador;
