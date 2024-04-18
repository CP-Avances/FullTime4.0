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
exports.timbresControlador = void 0;
const database_1 = __importDefault(require("../../database"));
class TimbresControlador {
    // METODO PARA LISTAR MARCACIONES
    ObtenerTimbres(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const codigoEmpresa = req.codigo_empresa;
                let empresas = yield database_1.default.query(`
                SELECT emp.empresa_codigo, emp.empresa_direccion, emp.empresa_descripcion FROM empresa emp
                `);
                if (empresas.rowCount === 0) {
                    return res.status(404).jsonp({ message: 'vacio' });
                }
                else {
                    var contador = 0;
                    empresas.rows.forEach((obj) => __awaiter(this, void 0, void 0, function* () {
                        console.log('fecha ', obj.empresa_codigo);
                        console.log('fecha ', obj.empresa_direccion);
                        console.log('fecha ', obj.empresa_descripcion);
                        contador = contador + 1;
                    }));
                    if (contador === empresas.rowCount) {
                        return res.jsonp({ message: 'OK', respuesta: empresas.rows });
                    }
                    else {
                        return res.status(404).jsonp({ message: 'error' });
                    }
                }
            }
            catch (error) {
                res.status(400).jsonp({ message: error });
            }
        });
    }
}
exports.timbresControlador = new TimbresControlador;
exports.default = exports.timbresControlador;
