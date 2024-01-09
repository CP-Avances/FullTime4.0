import pool from '../database';
import moment from 'moment';
const FECHA_FERIADOS: any = [];

export const generarTimbres = async function (codigo: string, inicio: string, fin: string) {

    let horarios = await pool.query(
        `
        SELECT pg.fec_hora_horario::date AS fecha, pg.fec_hora_horario::time AS hora, pg.tipo_dia, pg.tipo_entr_salida,
            pg.min_alimentacion
        FROM plan_general AS pg
        WHERE pg.fec_horario BETWEEN $1 AND $2 AND pg.codigo = $3 AND (tipo_dia = 'N' OR estado_origen = 'HFD' OR estado_origen = 'HL')
        ORDER BY pg.fec_hora_horario ASC
        `
        , [inicio, fin, codigo])
        .then(result => {
            return result.rows
        });

    var auxiliar: string = '';

    horarios.forEach(async ele => {
        let accion: string = '';
        let observacion: string = '';
        let latitud = '-0.928755'
        let longitud = '-78.606327'
        let tecla_funcion: string = '';
        let fecha: string = '';

        switch (ele.tipo_entr_salida) {
            case 'E':
                //var hora_ = moment(ele.hora, "HH:mm:ss").subtract(moment.duration("00:01:00")).format("HH:mm:ss");
                //var hora_ = moment(ele.hora, "HH:mm:ss").add(moment.duration("00:00:00")).format("HH:mm:ss");
                var hora_ = moment(ele.hora, "HH:mm:ss").add(moment.duration("00:00:00")).format("HH:mm:ss");
                //console.log('ver fecha ', moment(ele.fecha, 'YYYY-MM-DD').format('YYYY-MM-DD'))
                var formato = moment(ele.fecha, 'YYYY-MM-DD').format('YYYY-MM-DD');
                fecha = moment(formato + ' ' + hora_, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
                //console.log('ver formato ', fecha)
                accion = 'E';
                observacion = 'Entrada';
                tecla_funcion = '0';
                break;
            case 'S':
                //var hora_ = moment(ele.hora, "HH:mm:ss").add(moment.duration("00:10:00")).format("HH:mm:ss");
                //var hora_ = moment(ele.hora, "HH:mm:ss").add(moment.duration("00:00:00")).format("HH:mm:ss");
                var hora_ = moment(ele.hora, "HH:mm:ss").subtract(moment.duration("00:02:00")).format("HH:mm:ss");
                var formato = moment(ele.fecha, 'YYYY-MM-DD').format('YYYY-MM-DD');
                fecha = moment(formato + ' ' + hora_, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
                observacion = 'Salida';
                tecla_funcion = '1';
                break;
            case 'I/A':
                auxiliar = '';
                var hora_ = moment(ele.hora, "HH:mm:ss").add(moment.duration("00:20:00")).format("HH:mm:ss");
                var formato = moment(ele.fecha, 'YYYY-MM-DD').format('YYYY-MM-DD');
                fecha = moment(formato + ' ' + hora_, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
                accion = 'I/A';
                observacion = 'Inicio alimentacion';
                tecla_funcion = '2';
                auxiliar = hora_;
                break;
            case 'F/A':
                var comida = moment(formatearMinutos(ele.min_alimentacion), 'HH:mm:ss').format('HH:mm:ss');
                //var min = moment(comida, "HH:mm:ss").subtract(moment.duration("00:01:00")).format("HH:mm:ss");
                //var min = moment(comida, "HH:mm:ss").subtract(moment.duration("00:01:00")).format("HH:mm:ss");
                var min = moment(comida, "HH:mm:ss").add(moment.duration("00:00:00")).format("HH:mm:ss")
                var hora_ = moment(auxiliar, "HH:mm:ss").add(moment.duration(min)).format("HH:mm:ss");
                console.log('hora ', hora_, ' auxiliar ', auxiliar)
                var formato = moment(ele.fecha, 'YYYY-MM-DD').format('YYYY-MM-DD');
                fecha = moment(formato + ' ' + hora_, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
                accion = 'F/A';
                observacion = 'Fin alimentacion';
                tecla_funcion = '3';
                auxiliar = '';
                break;
            default:
                break;
        }

        console.log('fecha ', fecha)
        if (fecha) {
            await pool.query(
                `
                INSERT INTO timbres (fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, 
                    codigo, id_reloj, fec_hora_timbre_servidor)
                values($1, $2, $3, $4, $5, $6, $7, $8, $9)         
                `
                , [fecha, accion, tecla_funcion, observacion, latitud, longitud, codigo, 3, fecha]
            )
        }

    })

    /*
        `
            INSERT INTO timbres (fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, 
                codigo, id_reloj, fec_hora_timbre_servidor)
            values($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `
            , [fecha, accion, tecla_funcion, observacion, latitud, longitud, codigo, 3, fecha]

    */


}

function formatearMinutos(minutos: any) {
    var seconds: any = (minutos * 60);
    var hour: any = Math.floor(seconds / 3600);
    hour = (hour < 10) ? '0' + hour : hour;
    var minute: any = Math.floor((seconds / 60) % 60);
    minute = (minute < 10) ? '0' + minute : minute;
    var second: any = seconds % 60;
    second = (second < 10) ? '0' + second : second;
    return hour + ':' + minute + ':' + second;
}

/**
 * Metodo que devuelve el arreglo de las fechas con su estado.
 * @param horario Ultimo horario del empleado con los estados de los dias libres y normales
 * @param rango Fecha de inicio y final, puede ser rango semanal o mensual
 */
function DiasByEstado(horario: any) {
    var fecha1 = moment(horario.fec_inicio.toJSON().split("T")[0]);
    var fecha2 = moment(horario.fec_final.toJSON().split("T")[0]);

    var diasHorario = fecha2.diff(fecha1, 'days');

    var fec_aux = new Date(horario.fec_inicio)
    let respuesta = [];
    for (let i = 0; i <= diasHorario; i++) {
        let horario_res = fechaIterada(fec_aux, horario);
        respuesta.push(horario_res)
        fec_aux.setDate(fec_aux.getDate() + 1)
    }
    return respuesta.filter(ele => { return ele.estado === false })
}

/**
 * METODO para devolver la fecha y el estado de cada uno de los dias de ese horario
 * @param fechaIterada Fecha asignada por el ciclo for 
 * @param horario es el ultimo horario del empleado.
 */
function fechaIterada(fechaIterada: Date, horario: any) {
    let est;
    if (fechaIterada.getDay() === 0) {
        est = horario.domingo
    } else if (fechaIterada.getDay() === 1) {
        est = horario.lunes
    } else if (fechaIterada.getDay() === 2) {
        est = horario.martes
    } else if (fechaIterada.getDay() === 3) {
        est = horario.miercoles
    } else if (fechaIterada.getDay() === 4) {
        est = horario.jueves
    } else if (fechaIterada.getDay() === 5) {
        est = horario.viernes
    } else if (fechaIterada.getDay() === 6) {
        est = horario.sabado
    }

    return {
        fecha: fechaIterada.toJSON().split('T')[0],
        estado: est,
        id_horario: horario.id_horarios
    }
}

export const EliminarTimbres = async function (id_empleado: number) {

    await pool.query('DELETE FROM timbres WHERE codigo = $1', [id_empleado])
        .then(result => {
            console.log(result.command);
        });

}

export const ModificarTimbresEntrada = async function () {
    let arrayRespuesta = await pool.query('select id, CAST(fec_hora_timbre as VARCHAR) from timbres where accion like \'E\' order by fec_hora_timbre, codigo ASC')
        .then(result => {
            console.log(result.rowCount);

            return result.rows.filter(obj => {
                var minuto: number = obj.fec_hora_timbre.split(' ')[1].split(':')[1];
                return (minuto >= 0 && minuto <= 35)
            });
        });
    console.log(arrayRespuesta.length);

    arrayRespuesta.forEach(async (obj) => {
        var hora: number = parseInt(obj.fec_hora_timbre.split(' ')[1].split(':')[0]) + 1;
        var minuto: number = obj.fec_hora_timbre.split(' ')[1].split(':')[1];
        var f = new Date(obj.fec_hora_timbre.split(' ')[0]);

        // console.log(f.toJSON());
        f.setUTCHours(hora);
        f.setUTCMinutes(minuto);
        // console.log('Fecha corregidad',f.toJSON());

        await pool.query('UPDATE timbres SET fec_hora_timbre = $1 WHERE id = $2', [f.toJSON(), obj.id])
    })
}