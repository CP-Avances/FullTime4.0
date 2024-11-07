"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HorariosParaInasistencias = void 0;
/**
 * METODO para devolver la fecha y el estado de cada uno de los dias de ese horario
 * @param fechaIterada Fecha asignada por el ciclo for
 * @param horario es el ultimo horario del empleado.
 */
function fechaIterada(fechaIterada, horario) {
    let est;
    switch (fechaIterada.getDay()) {
        case 0:
            est = horario.domingo;
            break;
        case 1:
            est = horario.lunes;
            break;
        case 2:
            est = horario.martes;
            break;
        case 3:
            est = horario.miercoles;
            break;
        case 4:
            est = horario.jueves;
            break;
        case 5:
            est = horario.viernes;
            break;
        case 6:
            est = horario.sabado;
            break;
        default: break;
    }
    return {
        fecha: fechaIterada.toJSON().split('T')[0],
        estado: est
    };
}
const HorariosParaInasistencias = function (horario) {
    let fechasRango = {
        inicio: horario.fec_inicio,
        final: horario.fec_final
    };
    let objeto = DiasConEstado(horario, fechasRango);
    // console.log('Fechas rango: ', fechasRango);
    // console.log('Objeto JSON: ', objeto);
    return objeto.filter(obj => { return (obj.estado === false); }).map((obj) => { return { fecha: obj.fecha }; });
};
exports.HorariosParaInasistencias = HorariosParaInasistencias;
function DiasConEstado(horario, rango) {
    var fec_aux = new Date(rango.inicio);
    // console.log('FECHA_FERIADOS', FECHA_FERIADOS);
    var fecha1 = moment(rango.inicio.toJSON().split("T")[0]);
    var fecha2 = moment(rango.final.toJSON().split("T")[0]);
    var diasHorario = fecha2.diff(fecha1, 'days');
    let respuesta = [];
    for (let i = 0; i <= diasHorario; i++) {
        let horario_res = fechaIterada(fec_aux, horario);
        respuesta.push(horario_res);
        fec_aux.setDate(fec_aux.getDate() + 1);
    }
    return respuesta;
}
