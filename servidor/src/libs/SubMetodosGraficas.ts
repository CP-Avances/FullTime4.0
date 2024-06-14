import pool from '../database';
import moment from 'moment';

export const BuscarTimbresByFecha = async function (fec_inicio: string, fec_final: string) {

    return await pool.query(
        `
        SELECT fecha_hora_timbre 
        FROM eu_timbres 
        WHERE CAST(fecha_hora_timbre AS VARCHAR) BETWEEN $1 || \'%\' AND $2 || \'%\' 
        ORDER BY fecha_hora_timbre ASC
        `
        , [fec_inicio, fec_final])
        .then(res => {
            return res.rows;
        })
}


export const BuscarTimbresByCodigo_Fecha = async function (codigo: number, horario: any[]) {
    return await Promise.all(horario.map(async (obj) => {
        return {
            fecha: obj.fecha,
            timbresTotal: await pool.query(
                `
                SELECT fecha_hora_timbre 
                FROM eu_timbres 
                WHERE CAST(fecha_hora_timbre AS VARCHAR) LIKE $1 || \'%\' AND codigo = $2 
                ORDER BY fecha_hora_timbre ASC
                `
                , [obj.fecha, codigo])
                .then(res => {
                    return res.rowCount
                })
        };
    }))
}

export const BuscarPermisosJustificados = async function (codigo: number, fecha: string) {
    return await pool.query(
        `
        SELECT fecha_inicio, descripcion 
        FROM mp_solicitud_permiso 
        WHERE codigo = $1 AND fecha_inicio::TIMESTAMP::DATE <= $2 AND fecha_final::TIMESTAMP::DATE >= $2 AND estado = 3
        `
        , [codigo, fecha + ''])
        .then(result => {
            return result.rowCount
        })
}

export const BuscarHorasExtras = async function (fec_inicio: string, fec_final: string) {

    return await pool.query(
        `
        SELECT fecha_hora_timbre 
        FROM eu_timbres 
        WHERE CAST(fecha_hora_timbre AS VARCHAR) between $1 || \'%\' AND $2 || \'%\' 
        ORDER BY fecha_hora_timbre ASC
        `
        , [fec_inicio, fec_final])
        .then(res => {
            return res.rows;
        })
}

export const HoraExtra_ModelarDatos = async function (fec_desde: Date, fec_hasta: Date) {
    let horas_extras = await ListaHorasExtrasGrafica(fec_desde, fec_hasta)
    // console.log('Lista de horas extras ===', horas_extras);
    let array = horas_extras.map((obj: any) => {
        obj.tiempo_autorizado = (obj.tiempo_autorizado === 0) ? obj.num_hora : obj.tiempo_autorizado;
        return obj
    });
    // console.log('Lista de array ===', array);
    let nuevo: any = [];

    array.forEach((obj: any) => {
        let respuesta = DiasIterados(obj.fec_inicio, obj.fec_final, obj.tiempo_autorizado, obj.id_empl_cargo, obj.codigo)
        respuesta.forEach((ele: any) => {
            nuevo.push(ele);
        })
    });
    // console.log('Lista de Nuevo ===', nuevo);    

    return nuevo
}

function DiasIterados(inicio: string, final: string, tiempo_autorizado: number, id_empl_cargo: number, codigo: number) {
    var fec_aux = new Date(inicio)
    var fecha1 = moment(inicio.split("T")[0]);
    var fecha2 = moment(final.split("T")[0]);

    var diasHorario = fecha2.diff(fecha1, 'days') + 1;
    let respuesta = [];
    for (let i = 0; i < diasHorario; i++) {
        let horario_res = {
            fecha: fec_aux.toJSON().split('T')[0],
            tiempo: tiempo_autorizado,
            cargo: id_empl_cargo,
            codigo: codigo
        };
        // console.log(inicio,'--', final, diasHorario,'**************',horario_res);

        respuesta.push(horario_res)
        fec_aux.setDate(fec_aux.getDate() + 1)
    }
    return respuesta
}

async function ListaHorasExtrasGrafica(fec_desde: Date, fec_hasta: Date) {
    let arrayUno = await HorasExtrasSolicitadasGrafica(fec_desde, fec_hasta)
    let arrayDos = await PlanificacionHorasExtrasSolicitadasGrafica(fec_desde, fec_hasta)
    let arrayUnido = arrayUno.concat(arrayDos)
    let set = new Set(arrayUnido.map((obj: any) => { return JSON.stringify(obj) }))
    arrayUnido = Array.from(set).map((obj: any) => { return JSON.parse(obj) });

    for (let j = 0; j < arrayUnido.length; j++) {
        let numMin;
        let i = numMin = j;
        for (++i; i < arrayUnido.length; i++) {
            (arrayUnido[i].fec_inicio < arrayUnido[numMin].fec_inicio) && (numMin = i);
        }
        [arrayUnido[j], arrayUnido[numMin]] = [arrayUnido[numMin], arrayUnido[j]]
    }

    return arrayUnido
}

async function HorasExtrasSolicitadasGrafica(fec_desde: Date, fec_hasta: Date) {
    return await pool.query(
        // estado = 3 significa q las horas extras fueron autorizadas
        `
        SELECT CAST(h.fecha_inicio AS VARCHAR), CAST(h.fecha_final AS VARCHAR), h.descripcion, h.horas_solicitud, 
            h.tiempo_autorizado, h.codigo, h.id_empleado_cargo 
        FROM mhe_solicitud_hora_extra AS h 
        WHERE h.fecha_inicio BETWEEN $1 and $2 AND h.estado = 3   
            AND h.fecha_final BETWEEN $1 and $2 ORDER BY h.fehac_inicio
        `
        , [fec_desde, fec_hasta])
        .then(result => {
            return Promise.all(result.rows.map(async (obj) => {
                const hora_inicio = HHMMtoSegundos(obj.fec_inicio.split(' ')[1]) / 3600;
                const hora_final = HHMMtoSegundos(obj.fec_final.split(' ')[1]) / 3600;
                return {
                    id_empl_cargo: obj.id_empl_cargo,
                    hora_inicio: hora_inicio,
                    hora_final: hora_final,
                    fec_inicio: obj.fec_inicio.split(' ')[0],
                    fec_final: obj.fec_final.split(' ')[0],
                    descripcion: obj.descripcion,
                    num_hora: HHMMtoSegundos(obj.num_hora) / 3600,
                    tiempo_autorizado: HHMMtoSegundos(obj.tiempo_autorizado) / 3600,
                    codigo: obj.codigo
                }
            }))
        });
}

async function PlanificacionHorasExtrasSolicitadasGrafica(fec_desde: Date, fec_hasta: Date) {
    return await pool.query(
        //estado = 3 para horas extras autorizadas
        `
        SELECT CAST(h.fecha_desde AS VARCHAR), CAST(h.hora_inicio AS VARCHAR), h.fecha_hasta, h.hora_fin, h.descripcion,
            h.horas_totales, ph.tiempo_autorizado, ph.codigo, ph.id_empleado_cargo '
        FROM mhe_empleado_plan_hora_extra AS ph, mhe_detalle_plan_hora_extra AS h 
        WHERE ph.id_detalle_plan = h.id AND ph.estado = 3 
            AND h.fecha_desde BETWEEN $1 and $2 AND h.fecha_hasta BETWEEN $1 and $2 
        ORDER BY h.fecha_desde
        `
        , [fec_desde, fec_hasta])
        .then(result => {
            return Promise.all(result.rows.map(async (obj) => {
                const hora_inicio = HHMMtoSegundos(obj.hora_inicio) / 3600;
                const hora_final = HHMMtoSegundos(obj.hora_fin) / 3600;
                return {
                    id_empl_cargo: obj.id_empl_cargo,
                    hora_inicio: hora_inicio,
                    hora_final: hora_final,
                    fec_inicio: obj.fecha_desde.split(' ')[0],
                    fec_final: obj.fecha_hasta.split(' ')[0],
                    descripcion: obj.descripcion,
                    num_hora: HHMMtoSegundos(obj.horas_totales) / 3600,
                    tiempo_autorizado: HHMMtoSegundos(obj.tiempo_autorizado) / 3600,
                    codigo: obj.codigo
                }
            }))
        })
}

export const HHMMtoSegundos = function (dato: any) { // Tiempo saldra en segundos
    if (dato === '') return 0
    if (dato === null) return 0
    // if (dato === 0) return 0
    // console.log(dato);
    var h = parseInt(dato.split(':')[0]) * 3600;
    var m = parseInt(dato.split(':')[1]) * 60;
    var s = parseInt(dato.split(':')[2]);
    // console.log(h, '>>>>>', m);
    return h + m + s
}

export const SumarValoresArray = function (array: any[]) {
    let valor = 0;
    for (let i = 0; i < array.length; i++) {
        valor = valor + parseFloat(array[i]);
    }
    return valor.toFixed(2)
}

export const BuscarTimbresEntradas = async function (fec_inicio: string, fec_final: string) {
    return await pool.query(
        `
        SELECT CAST(fecha_hora_timbre AS VARCHAR), id_empleado 
        FROM eu_timbres 
        WHERE CAST(fecha_hora_timbre AS VARCHAR) BETWEEN $1 || \'%\' AND $2 || \'%\' 
            AND accion in (\'EoS\', \'E\') 
        ORDER BY fecha_hora_timbre ASC 
        `
        , [fec_inicio, fec_final])
        .then(res => {
            return res.rows;
        })
}


/**
 * SUBMETODOS PARA LAS GRAFICAS DE EMPLEADOS INDIVIDUALEMTNE
 */

export const Empleado_HoraExtra_ModelarDatos = async function (codigo: string | number, fec_desde: Date, fec_hasta: Date) {
    let horas_extras = await EmpleadoHorasExtrasGrafica(codigo, fec_desde, fec_hasta)
    console.log('Lista de horas extras ===', horas_extras);
    let array = horas_extras.map((obj: any) => {
        (obj.tiempo_autorizado === 0) ? obj.tiempo_autorizado = obj.num_hora : obj.tiempo_autorizado = obj.tiempo_autorizado;
        return obj
    });
    // console.log('Lista de array ===', array);
    let nuevo: any = [];

    array.forEach((obj: any) => {
        let respuesta = DiasIterados(obj.fec_inicio, obj.fec_final, obj.tiempo_autorizado, obj.id_empl_cargo, obj.codigo)
        respuesta.forEach((ele: any) => {
            nuevo.push(ele);
        })
    });
    // console.log('Lista de Nuevo ===', nuevo);    

    return nuevo
}

async function EmpleadoHorasExtrasGrafica(codigo: string | number, fec_desde: Date, fec_hasta: Date) {
    let arrayUno = await EmpleadoHorasExtrasSolicitadasGrafica(codigo, fec_desde, fec_hasta)
    let arrayDos = await EmpleadoPlanificacionHorasExtrasSolicitadasGrafica(codigo, fec_desde, fec_hasta)
    // let arrayUnido  = [...new Set(arrayUno.concat(arrayDos))];  
    let arrayUnido = arrayUno.concat(arrayDos)
    let set = new Set(arrayUnido.map((obj: any) => { return JSON.stringify(obj) }))
    arrayUnido = Array.from(set).map((obj: any) => { return JSON.parse(obj) });

    for (let j = 0; j < arrayUnido.length; j++) {
        let numMin;
        let i = numMin = j;
        for (++i; i < arrayUnido.length; i++) {
            (arrayUnido[i].fec_inicio < arrayUnido[numMin].fec_inicio) && (numMin = i);
        }
        [arrayUnido[j], arrayUnido[numMin]] = [arrayUnido[numMin], arrayUnido[j]]
    }

    return arrayUnido
}

async function EmpleadoHorasExtrasSolicitadasGrafica(codigo: string | number, fec_desde: Date, fec_hasta: Date) {
    return await pool.query(
        // estado = 3 significa q las horas extras fueron autorizadas
        `
        SELECT h.fecha_inicio, h.fecha_final, h.descripcion, h.horas_solicitud, h.tiempo_autorizado, h.codigo,
            h.id_empleado_cargo 
        FROM mhe_solicitud_hora_extra AS h 
        WHERE h.fecha_inicio between $1 and $2 AND h.estado = 3
            AND h.fecha_final between $1 and $2 AND h.codigo = $3 
        ORDER BY h.fecha_inicio
        `
        , [fec_desde, fec_hasta, codigo])
        .then(result => {
            return Promise.all(result.rows.map(async (obj) => {
                var f1 = new Date(obj.fec_inicio)
                var f2 = new Date(obj.fec_final)
                f1.setUTCHours(f1.getUTCHours() - 5);
                f2.setUTCHours(f2.getUTCHours() - 5);
                const hora_inicio = HHMMtoSegundos(f1.toJSON().split('T')[1].split('.')[0]) / 3600;
                const hora_final = HHMMtoSegundos(f2.toJSON().split('T')[1].split('.')[0]) / 3600;
                f1.setUTCHours(f1.getUTCHours() - 5);
                f2.setUTCHours(f2.getUTCHours() - 5);
                return {
                    id_empl_cargo: obj.id_empl_cargo,
                    hora_inicio: hora_inicio,
                    hora_final: hora_final,
                    fec_inicio: new Date(f1.toJSON().split('.')[0]),
                    fec_final: new Date(f2.toJSON().split('.')[0]),
                    descripcion: obj.descripcion,
                    num_hora: HHMMtoSegundos(obj.num_hora) / 3600,
                    tiempo_autorizado: HHMMtoSegundos(obj.tiempo_autorizado) / 3600,
                    codigo: obj.codigo
                }
            }))
        });
}

async function EmpleadoPlanificacionHorasExtrasSolicitadasGrafica(codigo: string | number, fec_desde: Date, fec_hasta: Date) {
    return await pool.query(
        //estado = 3 para horas extras autorizadas
        `
        SELECT h.fecha_desde, h.hora_inicio, h.fecha_hasta, h.hora_fin, h.descripcion, h.horas_totales, 
            ph.tiempo_autorizado, ph.codigo, ph.id_empleado_cargo 
        FROM mhe_empleado_plan_hora_extra AS ph, mhe_detalle_plan_hora_extra AS h 
        WHERE ph.id_detalle_plan = h.id AND ph.estado = 3 AND h.fecha_desde BETWEEN $1 AND $2 
            AND h.fecha_hasta BETWEEN $1 and $2 AND ph.codigo = $3
        ORDER BY h.fecha_desde
        `
        , [fec_desde, fec_hasta, codigo])
        .then(result => {
            return Promise.all(result.rows.map(async (obj) => {
                var f1 = new Date(obj.fecha_desde.toJSON().split('T')[0] + 'T' + obj.hora_inicio);
                var f2 = new Date(obj.fecha_hasta.toJSON().split('T')[0] + 'T' + obj.hora_fin);
                f1.setUTCHours(f1.getUTCHours() - 5);
                f2.setUTCHours(f2.getUTCHours() - 5);
                const hora_inicio = HHMMtoSegundos(f1.toJSON().split('T')[1].split('.')[0]) / 3600;
                const hora_final = HHMMtoSegundos(f2.toJSON().split('T')[1].split('.')[0]) / 3600;
                f1.setUTCHours(f1.getUTCHours() - 5);
                f2.setUTCHours(f2.getUTCHours() - 5);
                return {
                    id_empl_cargo: obj.id_empl_cargo,
                    hora_inicio: hora_inicio,
                    hora_final: hora_final,
                    fec_inicio: new Date(f1.toJSON().split('.')[0]),
                    fec_final: new Date(f2.toJSON().split('.')[0]),
                    descripcion: obj.descripcion,
                    num_hora: HHMMtoSegundos(obj.horas_totales) / 3600,
                    tiempo_autorizado: HHMMtoSegundos(obj.tiempo_autorizado) / 3600,
                    codigo: obj.codigo
                }
            }))
        })
}

export const Empleado_Vacaciones_ModelarDatos = async function (codigo: string | number, fec_desde: Date, fec_hasta: Date) {
    let vacaciones = await pool.query(
        `
        SELECT CAST(fecha_inicio AS VARCHAR), CAST(fecha_final AS VARCHAR) 
        FROM mv_solicitud_vacacion WHERE codigo = $1 AND fecha_inicio BETWEEN $2 AND $3 AND estado = 3
        `
        , [codigo, fec_desde, fec_hasta]).then(result => { return result.rows })
    // console.log('Lista de vacaciones ===', vacaciones);
    let aux_array: any = [];
    vacaciones.forEach((obj: any) => {
        var fec_aux = new Date(obj.fec_inicio)
        var fecha1 = moment(obj.fec_inicio.split(" ")[0]);
        var fecha2 = moment(obj.fec_final.split(" ")[0]);

        var diasHorario = fecha2.diff(fecha1, 'days') + 1;
        for (let i = 0; i < diasHorario; i++) {
            let horario_res = {
                fecha: fec_aux.toJSON().split('T')[0],
                n_dia: 1
            };
            aux_array.push(horario_res)
            fec_aux.setDate(fec_aux.getDate() + 1)
        }
    })
    // console.log('Lista array fechas: ',aux_array);    
    return aux_array
}

export const Empleado_Permisos_ModelarDatos = async function (codigo: string | number, fec_desde: Date, fec_hasta: Date) {
    let permisos = await pool.query(
        `
        SELECT CAST(fecha_inicio AS VARCHAR), CAST(fecha_final AS VARCHAR), horas_permiso, dias_permiso 
        FROM mp_solicitud_permiso WHERE codigo = $1 AND fec_inicio BETWEEN $2 and $3 AND estado = 3
        `
        , [codigo, fec_desde, fec_hasta]).then(result => { return result.rows })
    // console.log('Lista de permisos ===', permisos);
    let aux_array: any = [];
    permisos.forEach((obj: any) => {
        var fec_aux = new Date(obj.fec_inicio)
        var fecha1 = moment(obj.fec_inicio.split(" ")[0]);
        var fecha2 = moment(obj.fec_final.split(" ")[0]);

        var diasHorario = fecha2.diff(fecha1, 'days') + 1;
        for (let i = 0; i < diasHorario; i++) {
            let horario_res = {
                fecha: fec_aux.toJSON().split('T')[0],
                tiempo: (obj.dia + (HHMMtoSegundos(obj.hora_numero) / 3600)) / diasHorario,
            };
            aux_array.push(horario_res)
            fec_aux.setDate(fec_aux.getDate() + 1)
        }
    })
    // console.log('Lista array fechas: ',aux_array);    
    return aux_array
}



export const SegundosToHHMM = function (dato: number) {
    // console.log('Hora decimal a HHMM ======>',dato);
    var h = Math.floor(dato / 3600);
    var m = Math.floor((dato % 3600) / 60);
    var s = dato % 60;
    if (h <= -1) {
        return '00:00:00'
    }
    let hora = (h >= 10) ? h : '0' + h;
    let min = (m >= 10) ? m : '0' + m;
    let seg = (s >= 10) ? s : '0' + s;

    return hora + ':' + min + ':' + seg
}

export const ModelarFechas = function (desde: string, hasta: string, horario: any): Array<any> {
    let fechasRango = {
        inicio: desde,
        final: hasta
    };

    let objeto = DiasConEstado(horario, fechasRango);
    // console.log('Objeto JSON: ', objeto);
    return objeto.filter(obj => { return (obj.estado === false) }).map((obj: any) => { return { fecha: obj.fecha } })
}

/**
 * Mezcla el horario y las fechas para obtener los dias con su estado: TRUE=dia libre || FALSE=dia laborable
 * @param horario Es el horario del empleado
 * @param rango Rango de fecha de inicio y final 
 * @returns Un Array de objetos.
 */
function DiasConEstado(horario: any, rango: any) {
    var fec_aux = new Date(rango.inicio)
    var fecha1 = moment(rango.inicio);
    var fecha2 = moment(rango.final);

    var diasHorario = fecha2.diff(fecha1, 'days');
    let respuesta = [];
    for (let i = 0; i <= diasHorario; i++) {
        let horario_res = fechaIterada(fec_aux, horario);
        respuesta.push(horario_res)
        fec_aux.setDate(fec_aux.getDate() + 1)
    }
    return respuesta
}

/**
 * Funcion se utiliza en un Ciclo For de un rango de fechas.
 * @param fechaIterada Dia de un ciclo for
 * @param horario Es el horario del empleado
 * @returns Retorna objeto de fecha con su estado true si el dia es libre y false si el dia trabaja. 
 */
function fechaIterada(fechaIterada: Date, horario: any) {
    let est;

    switch (fechaIterada.getDay()) {
        case 0: est = horario.domingo; break;
        case 1: est = horario.lunes; break;
        case 2: est = horario.martes; break;
        case 3: est = horario.miercoles; break;
        case 4: est = horario.jueves; break;
        case 5: est = horario.viernes; break;
        case 6: est = horario.sabado; break;
        default: break;
    }

    return {
        fecha: fechaIterada.toJSON().split('T')[0],
        estado: est
    }
}


