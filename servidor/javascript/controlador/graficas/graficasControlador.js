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
exports.GRAFICAS_CONTROLADOR = void 0;
const MetodosGraficas_1 = require("../../libs/MetodosGraficas");
class GraficasControlador {
    AdminHorasExtrasMicro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id_empresa = req.id_empresa;
            const fec_final = new Date();
            var fec_inicio = new Date();
            fec_inicio.setUTCDate(1);
            fec_inicio.setUTCMonth(0);
            fec_inicio.setUTCHours(0);
            fec_inicio.setUTCMinutes(0);
            fec_inicio.setUTCSeconds(0);
            fec_final.setUTCHours(0);
            fec_final.setUTCMinutes(0);
            fec_final.setUTCSeconds(0);
            let resultado = yield (0, MetodosGraficas_1.GraficaHorasExtras)(id_empresa, fec_inicio, fec_final);
            res.status(200).jsonp(resultado);
        });
    }
    AdminHorasExtrasMacro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const fec_inicio = req.params.desde;
            const fec_final = req.params.hasta;
            const id_empresa = req.id_empresa;
            let resultado = yield (0, MetodosGraficas_1.GraficaHorasExtras)(id_empresa, new Date(fec_inicio), new Date(fec_final));
            res.status(200).jsonp(resultado);
        });
    }
    AdminMarcacionesEmpleadoMicro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id_empresa = req.id_empresa;
            const fec_final = new Date();
            var fec_inicio = new Date();
            fec_inicio.setUTCDate(1);
            fec_inicio.setUTCMonth(0);
            fec_inicio.setUTCHours(0);
            fec_inicio.setUTCMinutes(0);
            fec_inicio.setUTCSeconds(0);
            fec_final.setUTCHours(0);
            fec_final.setUTCMinutes(0);
            fec_final.setUTCSeconds(0);
            let resultado = yield (0, MetodosGraficas_1.GraficaMarcaciones)(id_empresa, fec_inicio, fec_final);
            res.status(200).jsonp(resultado);
        });
    }
    AdminMarcacionesEmpleadoMacro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const fec_inicio = req.params.desde;
            const fec_final = req.params.hasta;
            const id_empresa = req.id_empresa;
            let resultado = yield (0, MetodosGraficas_1.GraficaMarcaciones)(id_empresa, new Date(fec_inicio), new Date(fec_final));
            res.status(200).jsonp(resultado);
        });
    }
    /**
     *
     * METODOS DE GRAFICAS PARA LOS EMPLEADOS
     *
     */
    EmpleadoHorasExtrasMicro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id_empleado = req.userIdEmpleado;
            const codigo = req.userCodigo;
            const fec_final = new Date();
            var fec_inicio = new Date();
            fec_inicio.setUTCDate(1);
            fec_inicio.setUTCMonth(0);
            fec_inicio.setUTCHours(0);
            fec_inicio.setUTCMinutes(0);
            fec_inicio.setUTCSeconds(0);
            fec_final.setUTCHours(0);
            fec_final.setUTCMinutes(0);
            fec_final.setUTCSeconds(0);
            let resultado = yield (0, MetodosGraficas_1.MetricaHorasExtraEmpleado)(codigo, id_empleado, fec_inicio, fec_final);
            res.status(200).jsonp(resultado);
        });
    }
    EmpleadoHorasExtrasMacro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id_empleado = req.userIdEmpleado;
            const fec_inicio = req.params.desde;
            const fec_final = req.params.hasta;
            const codigo = req.userCodigo;
            let resultado = yield (0, MetodosGraficas_1.MetricaHorasExtraEmpleado)(codigo, id_empleado, new Date(fec_inicio), new Date(fec_final));
            res.status(200).jsonp(resultado);
        });
    }
    EmpleadoVacacionesMicro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id_empleado = req.userIdEmpleado;
            const fec_final = new Date();
            var fec_inicio = new Date();
            const codigo = req.userCodigo;
            fec_inicio.setUTCDate(1);
            fec_inicio.setUTCMonth(0);
            fec_inicio.setUTCHours(0);
            fec_inicio.setUTCMinutes(0);
            fec_inicio.setUTCSeconds(0);
            fec_final.setUTCHours(0);
            fec_final.setUTCMinutes(0);
            fec_final.setUTCSeconds(0);
            let resultado = yield (0, MetodosGraficas_1.MetricaVacacionesEmpleado)(codigo, id_empleado, fec_inicio, fec_final);
            res.status(200).jsonp(resultado);
        });
    }
    EmpleadoVacacionesMacro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id_empleado = req.userIdEmpleado;
            const fec_inicio = req.params.desde;
            const fec_final = req.params.hasta;
            const codigo = req.userCodigo;
            let resultado = yield (0, MetodosGraficas_1.MetricaVacacionesEmpleado)(codigo, id_empleado, new Date(fec_inicio), new Date(fec_final));
            res.status(200).jsonp(resultado);
        });
    }
    EmpleadoPermisosMicro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const codigo = req.userCodigo;
            const id_empleado = req.userIdEmpleado;
            const fec_final = new Date();
            var fec_inicio = new Date();
            fec_inicio.setUTCDate(1);
            fec_inicio.setUTCMonth(0);
            fec_inicio.setUTCHours(0);
            fec_inicio.setUTCMinutes(0);
            fec_inicio.setUTCSeconds(0);
            fec_final.setUTCHours(0);
            fec_final.setUTCMinutes(0);
            fec_final.setUTCSeconds(0);
            let resultado = yield (0, MetodosGraficas_1.MetricaPermisosEmpleado)(codigo, id_empleado, fec_inicio, fec_final);
            res.status(200).jsonp(resultado);
        });
    }
    EmpleadoPermisosMacro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const codigo = req.userCodigo;
            const id_empleado = req.userIdEmpleado;
            const fec_inicio = req.params.desde;
            const fec_final = req.params.hasta;
            let resultado = yield (0, MetodosGraficas_1.MetricaPermisosEmpleado)(codigo, id_empleado, new Date(fec_inicio), new Date(fec_final));
            res.status(200).jsonp(resultado);
        });
    }
}
exports.GRAFICAS_CONTROLADOR = new GraficasControlador();
exports.default = exports.GRAFICAS_CONTROLADOR;
