"use strict";
function tiempoToSegundos(tiempo) {
    let h = parseInt(tiempo.split(':')[0]) * 3600;
    let m = parseInt(tiempo.split(':')[1]) * 60;
    let s = parseInt(tiempo.split(':')[2]);
    return h + m + s;
}
function Atrasos(hora, segundos_timbre) {
    console.log('**************************', hora, '===', segundos_timbre);
    if (hora === undefined)
        return { err: 'No se encontro hora' };
    if (segundos_timbre > hora) {
        return { bool: true, message: 'Llego atrasado al trabajo' };
    }
    return { bool: false, message: 'Llego a tiempo' };
}
function SalidasAntes(hora, hora_timbre) {
    console.log('**************************', hora, '===', hora_timbre);
    if (hora === undefined)
        return { err: 'No se encontro hora' };
    if (hora_timbre < hora) {
        return { bool: true, message: 'Salio antes del trabajo' };
    }
    return { bool: false, message: 'Salio despues' };
}
function SalidasAntesAlmuerzo(hora, hora_timbre) {
    console.log('**************************', hora, '===', hora_timbre);
    if (hora === undefined)
        return { err: 'No se encontro hora' };
    if (hora_timbre < hora) {
        return { bool: true, message: 'Salio antes al almuerzo' };
    }
    return { bool: false, message: 'Salio despues' };
}
function AtrasosAlmuerzo(hora, hora_timbre) {
    console.log('**************************', hora, '===', hora_timbre);
    if (hora === undefined)
        return { err: 'No se encontro hora' };
    if (hora_timbre > hora) {
        return { bool: true, message: 'Se tomo mucho tiempo de almuerzo' };
    }
    return { bool: false, message: 'Llego a tiempo' };
}
