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
Object.defineProperty(exports, "__esModule", { value: true });
const ListaEmpleados_1 = require("../../libs/ListaEmpleados");
class AsistenciaControlador {
    ObtenerListaEmpresa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var { id_empresa } = req.params;
            let c = yield (0, ListaEmpleados_1.Consultar)(parseInt(id_empresa));
            res.jsonp(c);
        });
    }
}
const ASISTENCIA_CONTROLADOR = new AsistenciaControlador();
exports.default = ASISTENCIA_CONTROLADOR;
