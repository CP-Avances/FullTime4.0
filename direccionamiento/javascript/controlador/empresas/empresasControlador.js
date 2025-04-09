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
exports.empresasControlador = void 0;
const database_1 = __importDefault(require("../../database"));
const rsa_key_service_1 = __importDefault(require("../llaves/rsa-key-service"));
class EmpresasControlador {
    ObtenerEmpresas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //consulta de empresa en base a codigo encriptado
                let { codigo_empresa } = req.body;
                let codigo_empresa_encriptado = rsa_key_service_1.default.encriptarLogin(codigo_empresa);
                console.log('body: ', req.body);
                console.log('codigo_empresa: ', codigo_empresa);
                console.log('codigo_empresa e: ', codigo_empresa_encriptado);
                let empresasRows = 0;
                let empresas = yield database_1.default.query("SELECT emp.empresa_codigo, emp.empresa_direccion, emp.empresa_descripcion, emp.movil_socket_direccion FROM empresa AS emp WHERE emp.empresa_codigo = $1", [codigo_empresa_encriptado]).then((result) => {
                    empresasRows = result.rowCount;
                    if (result.rowCount > 0) {
                        return res.status(200).jsonp({ message: 'ok', empresas: result.rows });
                    }
                });
                if (empresasRows === 0) {
                    return res.status(404).jsonp({ message: 'vacio' });
                }
            }
            catch (error) {
                res.status(500).jsonp({ message: 'error' });
            }
        });
    }
}
exports.empresasControlador = new EmpresasControlador;
exports.default = exports.empresasControlador;
