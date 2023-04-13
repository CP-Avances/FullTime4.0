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
const CalcularHorasExtras_1 = require("../../libs/CalcularHorasExtras");
class ReporteHoraExtraControlador {
    ReporteHorasExtras(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var { id_empleado, desde, hasta } = req.params;
            let resultado = yield (0, CalcularHorasExtras_1.CalcularHoraExtra)(parseInt(id_empleado), new Date(desde), new Date(hasta));
            // console.log(resultado);
            if (resultado.message) {
                return res.status(400).jsonp(resultado);
            }
            return res.status(200).jsonp(resultado);
        });
    }
}
const REPORTE_HORA_EXTRA_CONTROLADOR = new ReporteHoraExtraControlador();
exports.default = REPORTE_HORA_EXTRA_CONTROLADOR;
