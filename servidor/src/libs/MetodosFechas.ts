
export const sumaDias = function(fecha: Date, dias: number) {
    fecha.setUTCHours(fecha.getHours());
    fecha.setDate(fecha.getDate() + dias);
    return fecha;
}

export const restaDias = function(fecha: Date, dias: number) {
    fecha.setUTCHours(fecha.getHours());
    fecha.setDate(fecha.getDate() - dias);
    return fecha;
}

export const ObtenerRangoSemanal = function(fHoy: Date) {
    fHoy.setUTCHours(0);
    fHoy.setUTCMinutes(0);
    
    var fechaInicio = new Date(fHoy); 
    var fechaFinal = new Date(fHoy); 
    let dia_suma = sumaDias(fechaFinal, 6 - fHoy.getDay())
    let dia_resta = restaDias(fechaInicio, fHoy.getDay())

    return {
        inicio: dia_resta,
        final: dia_suma
    }             
}

export const ObtenerRangoMensual = function(fHoy: Date) {
    fHoy.setUTCHours(0);
    fHoy.setUTCMinutes(0);
    
    var fechaInicio = new Date(fHoy); 
    var fechaFinal = new Date(fHoy); 
    
    let UltimoDiaMes = 30;

    if (((fHoy.getFullYear() % 4 == 0) && (fHoy.getFullYear() % 100 != 0 )) || (fHoy.getFullYear() % 400 == 0)){ // console.log('Este año es bisiesto', final.getFullYear());            
        var DiasCadaMes = [31,29,31,30,31,30,31,31,30,31,30,31]
        UltimoDiaMes = DiasCadaMes[fHoy.getMonth()] ;
    } else {// console.log('No bisiesto');
        var DiasCadaMes = [31,28,31,30,31,30,31,31,30,31,30,31]
        UltimoDiaMes = DiasCadaMes[fHoy.getMonth()] ;
    }

    let dia_suma = sumaDias(fechaFinal, UltimoDiaMes - fHoy.getDate() - 1)
    let dia_resta = restaDias(fechaInicio, fHoy.getDate())

    return {
        inicio: dia_resta,
        final: dia_suma
    }      
}

export const restarYear = function(fecha: Date, anio: number) { //este aun no lo usa
    fecha.setFullYear(fecha.getFullYear() - anio);
    return fecha;
}