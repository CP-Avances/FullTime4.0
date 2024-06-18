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
exports.funcionesControlador = void 0;
const database_1 = __importDefault(require("../../database"));
class FuncionesControlador {
    ObtenerFunciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //CONSULTA DE EMPRESA EN BASE A CODIGO ENCRIPTADO
                let { direccion } = req.body;
                let empresasRows = 0;
                let empresas = yield database_1.default.query("SELECT emp.empresa_id as id, emp.hora_extra, emp.accion_personal, emp.alimentacion, emp.permisos, emp.geolocalizacion, emp.vacaciones, emp.app_movil, emp.timbre_web FROM empresa AS emp WHERE emp.empresa_direccion = $1", [direccion]).then((result) => {
                    empresasRows = result.rowCount;
                    if (result.rowCount > 0) {
                        return res.status(200).jsonp(result.rows);
                    }
                });
                if (empresasRows === 0) {
                    return res.status(404).jsonp({ text: 'No se encuentran registros.' });
                }
            }
            catch (error) {
                res.status(500).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
}
exports.funcionesControlador = new FuncionesControlador;
exports.default = exports.funcionesControlador;
