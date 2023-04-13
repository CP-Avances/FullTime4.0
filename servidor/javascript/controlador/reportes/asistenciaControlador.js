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
const ContarHoras_1 = require("../../libs/ContarHoras");
const ListaEmpleados_1 = require("../../libs/ListaEmpleados");
class AsistenciaControlador {
    ObtenerHorasTrabajadas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var { id_empleado, desde, hasta } = req.params;
            //false sin acciones || true con acciones
            if (req.acciones_timbres === true) {
                // Resultados de timbres con 6 y 3 acciones
                let resultado = yield (0, ContarHoras_1.ContarHorasByCargo)(parseInt(id_empleado), new Date(desde), new Date(hasta));
                if (resultado.message)
                    return res.status(404).jsonp(resultado);
                //console.log('ver resultado total', resultado)
                return res.status(200).jsonp(resultado);
            }
            else {
                // Resultados de timbres sin acciones
                let respuesta = yield (0, ContarHoras_1.ContarHorasByCargoSinAcciones)(parseInt(id_empleado), new Date(desde), new Date(hasta));
                if (respuesta.message)
                    return res.status(404).jsonp(respuesta);
                return res.status(200).jsonp(respuesta);
            }
        });
    }
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
