"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restarYear = exports.ObtenerRangoMensual = exports.ObtenerRangoSemanal = exports.restaDias = exports.sumaDias = void 0;
const sumaDias = function (fecha, dias) {
    fecha.setUTCHours(fecha.getHours());
    fecha.setDate(fecha.getDate() + dias);
    return fecha;
};
exports.sumaDias = sumaDias;
const restaDias = function (fecha, dias) {
    fecha.setUTCHours(fecha.getHours());
    fecha.setDate(fecha.getDate() - dias);
    return fecha;
};
exports.restaDias = restaDias;
const ObtenerRangoSemanal = function (fHoy) {
    fHoy.setUTCHours(0);
    fHoy.setUTCMinutes(0);
    var fechaInicio = new Date(fHoy);
    var fechaFinal = new Date(fHoy);
    let dia_suma = (0, exports.sumaDias)(fechaFinal, 6 - fHoy.getDay());
    let dia_resta = (0, exports.restaDias)(fechaInicio, fHoy.getDay());
    return {
        inicio: dia_resta,
        final: dia_suma
    };
};
exports.ObtenerRangoSemanal = ObtenerRangoSemanal;
const ObtenerRangoMensual = function (fHoy) {
    fHoy.setUTCHours(0);
    fHoy.setUTCMinutes(0);
    var fechaInicio = new Date(fHoy);
    var fechaFinal = new Date(fHoy);
    let UltimoDiaMes = 30;
    if (((fHoy.getFullYear() % 4 == 0) && (fHoy.getFullYear() % 100 != 0)) || (fHoy.getFullYear() % 400 == 0)) { // console.log('Este año es bisiesto', final.getFullYear());            
        var DiasCadaMes = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        UltimoDiaMes = DiasCadaMes[fHoy.getMonth()];
    }
    else { // console.log('No bisiesto');
        var DiasCadaMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        UltimoDiaMes = DiasCadaMes[fHoy.getMonth()];
    }
    let dia_suma = (0, exports.sumaDias)(fechaFinal, UltimoDiaMes - fHoy.getDate() - 1);
    let dia_resta = (0, exports.restaDias)(fechaInicio, fHoy.getDate());
    return {
        inicio: dia_resta,
        final: dia_suma
    };
};
exports.ObtenerRangoMensual = ObtenerRangoMensual;
const restarYear = function (fecha, anio) {
    fecha.setFullYear(fecha.getFullYear() - anio);
    return fecha;
};
exports.restarYear = restarYear;
