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
    AdminAtrasosMicro(req, res) {
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
            let resultado;
            //false sin acciones || true con acciones
            if (req.acciones_timbres === true) {
                // Resultados de timbres con 6 y 3 acciones 
                resultado = yield (0, MetodosGraficas_1.GraficaAtrasos)(id_empresa, fec_inicio, fec_final);
            }
            else {
                // Resultados de timbres sin acciones
                console.log('entro aqui en sin acciones');
                resultado = yield (0, MetodosGraficas_1.GraficaAtrasosSinAcciones)(id_empresa, fec_inicio, fec_final);
            }
            res.status(200).jsonp(resultado);
        });
    }
    AdminAtrasosMacro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const fec_inicio = req.params.desde;
            const fec_final = req.params.hasta;
            const id_empresa = req.id_empresa;
            let resultado;
            //false sin acciones || true con acciones
            if (req.acciones_timbres === true) {
                // Resultados de timbres con 6 y 3 acciones 
                resultado = yield (0, MetodosGraficas_1.GraficaAtrasos)(id_empresa, new Date(fec_inicio), new Date(fec_final));
            }
            else {
                // Resultados de timbres sin acciones
                resultado = yield (0, MetodosGraficas_1.GraficaAtrasosSinAcciones)(id_empresa, new Date(fec_inicio), new Date(fec_final));
            }
            res.status(200).jsonp(resultado);
        });
    }
    AdminAsistenciaMicro(req, res) {
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
            //El metodo GraficaAsistencia funciona para timbres de 6 y 3 acciones, y timbres sin acciones.
            let resultado = yield (0, MetodosGraficas_1.GraficaAsistencia)(id_empresa, fec_inicio, fec_final);
            res.status(200).jsonp(resultado);
        });
    }
    AdminAsistenciaMacro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const fec_inicio = req.params.desde;
            const fec_final = req.params.hasta;
            const id_empresa = req.id_empresa;
            //El metodo GraficaAsistencia funciona para timbres de 6 y 3 acciones, y timbres sin acciones.
            let resultado = yield (0, MetodosGraficas_1.GraficaAsistencia)(id_empresa, new Date(fec_inicio), new Date(fec_final));
            res.status(200).jsonp(resultado);
        });
    }
    AdminJornadaHorasExtrasMicro(req, res) {
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
            let resultado;
            //false sin acciones || true con acciones
            if (req.acciones_timbres === true) {
                // Resultados de timbres con 6 y 3 acciones 
                resultado = yield (0, MetodosGraficas_1.GraficaJornada_VS_HorasExtras)(id_empresa, fec_inicio, fec_final);
            }
            else {
                // Resultados de timbres sin acciones
                resultado = yield (0, MetodosGraficas_1.GraficaJ_VS_H_E_SinAcciones)(id_empresa, fec_inicio, fec_final);
            }
            res.status(200).jsonp(resultado);
        });
    }
    AdminJornadaHorasExtrasMacro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const fec_inicio = req.params.desde;
            const fec_final = req.params.hasta;
            const id_empresa = req.id_empresa;
            let resultado;
            //false sin acciones || true con acciones
            if (req.acciones_timbres === true) {
                // Resultados de timbres con 6 y 3 acciones 
                resultado = yield (0, MetodosGraficas_1.GraficaJornada_VS_HorasExtras)(id_empresa, new Date(fec_inicio), new Date(fec_final));
            }
            else {
                // Resultados de timbres sin acciones
                resultado = yield (0, MetodosGraficas_1.GraficaJ_VS_H_E_SinAcciones)(id_empresa, new Date(fec_inicio), new Date(fec_final));
            }
            res.status(200).jsonp(resultado);
        });
    }
    AdminTiempoJornadaHorasExtrasMicro(req, res) {
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
            let resultado;
            //false sin acciones || true con acciones
            if (req.acciones_timbres === true) {
                // Resultados de timbres con 6 y 3 acciones 
                resultado = yield (0, MetodosGraficas_1.GraficaTiempoJornada_VS_HorasExtras)(id_empresa, fec_inicio, fec_final);
            }
            else {
                // Resultados de timbres sin acciones
                resultado = yield (0, MetodosGraficas_1.GraficaT_Jor_VS_HorExtTimbresSinAcciones)(id_empresa, fec_inicio, fec_final);
            }
            res.status(200).jsonp(resultado);
        });
    }
    AdminTiempoJornadaHorasExtrasMacro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const fec_inicio = req.params.desde;
            const fec_final = req.params.hasta;
            const id_empresa = req.id_empresa;
            let resultado;
            //false sin acciones || true con acciones
            if (req.acciones_timbres === true) {
                // Resultados de timbres con 6 y 3 acciones 
                resultado = yield (0, MetodosGraficas_1.GraficaTiempoJornada_VS_HorasExtras)(id_empresa, new Date(fec_inicio), new Date(fec_final));
            }
            else {
                // Resultados de timbres sin acciones
                resultado = yield (0, MetodosGraficas_1.GraficaT_Jor_VS_HorExtTimbresSinAcciones)(id_empresa, new Date(fec_inicio), new Date(fec_final));
            }
            res.status(200).jsonp(resultado);
        });
    }
    AdminInasistenciaMicro(req, res) {
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
            //El metodo GraficaInasistencia funciona para timbres de 6 y 3 acciones, y timbres sin acciones.
            let resultado = yield (0, MetodosGraficas_1.GraficaInasistencia)(id_empresa, fec_inicio, fec_final);
            res.status(200).jsonp(resultado);
        });
    }
    AdminInasistenciaMacro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const fec_inicio = req.params.desde;
            const fec_final = req.params.hasta;
            const id_empresa = req.id_empresa;
            //El metodo GraficaInasistencia funciona para timbres de 6 y 3 acciones, y timbres sin acciones.
            let resultado = yield (0, MetodosGraficas_1.GraficaInasistencia)(id_empresa, new Date(fec_inicio), new Date(fec_final));
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
    AdminSalidasAnticipadasMicro(req, res) {
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
            let resultado = yield (0, MetodosGraficas_1.GraficaSalidasAnticipadas)(id_empresa, fec_inicio, fec_final);
            res.status(200).jsonp(resultado);
        });
    }
    AdminSalidasAnticipadasMacro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const fec_inicio = req.params.desde;
            const fec_final = req.params.hasta;
            const id_empresa = req.id_empresa;
            let resultado;
            //false sin acciones || true con acciones
            if (req.acciones_timbres === true) {
                // Resultados de timbres con 6 y 3 acciones 
                resultado = yield (0, MetodosGraficas_1.GraficaSalidasAnticipadas)(id_empresa, new Date(fec_inicio), new Date(fec_final));
            }
            else {
                // Resultados de timbres sin acciones
                resultado = yield (0, MetodosGraficas_1.GraficaSalidasAnticipadasSinAcciones)(id_empresa, new Date(fec_inicio), new Date(fec_final));
            }
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
            //let resultado = await MetricaVacacionesEmpleado(codigo, id_empleado, fec_inicio, fec_final)
            let resultado;
            res.status(200).jsonp(resultado);
        });
    }
    EmpleadoVacacionesMacro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id_empleado = req.userIdEmpleado;
            const fec_inicio = req.params.desde;
            const fec_final = req.params.hasta;
            const codigo = req.userCodigo;
            //let resultado = await MetricaVacacionesEmpleado(codigo, id_empleado, new Date(fec_inicio), new Date(fec_final))
            let resultado;
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
            //let resultado = await MetricaPermisosEmpleado(codigo, id_empleado, fec_inicio, fec_final)
            let resultado;
            res.status(200).jsonp(resultado);
        });
    }
    EmpleadoPermisosMacro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const codigo = req.userCodigo;
            const id_empleado = req.userIdEmpleado;
            const fec_inicio = req.params.desde;
            const fec_final = req.params.hasta;
            //let resultado = await MetricaPermisosEmpleado(codigo, id_empleado, new Date(fec_inicio), new Date(fec_final))
            let resultado;
            res.status(200).jsonp(resultado);
        });
    }
    EmpleadoAtrasosMicro(req, res) {
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
            let resultado;
            //false sin acciones || true con acciones
            if (req.acciones_timbres === true) {
                // Resultados de timbres con 6 y 3 acciones 
                resultado = yield (0, MetodosGraficas_1.MetricaAtrasosEmpleado)(codigo, id_empleado, fec_inicio, fec_final);
            }
            else {
                // Resultados de timbres sin acciones
                resultado = yield (0, MetodosGraficas_1.MetricaAtrasosEmpleadoSinAcciones)(codigo, id_empleado, fec_inicio, fec_final);
            }
            res.status(200).jsonp(resultado);
        });
    }
    EmpleadoAtrasosMacro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id_empleado = req.userIdEmpleado;
            const fec_inicio = req.params.desde;
            const fec_final = req.params.hasta;
            const codigo = req.userCodigo;
            let resultado;
            //false sin acciones || true con acciones
            if (req.acciones_timbres === true) {
                // Resultados de timbres con 6 y 3 acciones 
                resultado = yield (0, MetodosGraficas_1.MetricaAtrasosEmpleado)(codigo, id_empleado, new Date(fec_inicio), new Date(fec_final));
            }
            else {
                // Resultados de timbres sin acciones
                resultado = yield (0, MetodosGraficas_1.MetricaAtrasosEmpleadoSinAcciones)(codigo, id_empleado, new Date(fec_inicio), new Date(fec_final));
            }
            res.status(200).jsonp(resultado);
        });
    }
}
exports.GRAFICAS_CONTROLADOR = new GraficasControlador();
exports.default = exports.GRAFICAS_CONTROLADOR;
