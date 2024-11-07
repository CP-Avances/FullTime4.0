import { DateTime, Duration } from 'luxon';
import pool from '../database';

export const generarTimbres = async function (codigo: string, inicio: string, fin: string) {

    let horarios = await pool.query(
        `
        SELECT pg.fecha_hora_horario::date AS fecha, pg.fecha_hora_horario::time AS hora, pg.tipo_dia, pg.tipo_accion,
            pg.minutos_alimentacion
        FROM eu_asistencia_general AS pg
        WHERE pg.fecha_horario BETWEEN $1 AND $2 AND pg.id_empleado = $3 AND (tipo_dia = 'N' OR estado_origen = 'HFD' OR estado_origen = 'HL')
        ORDER BY pg.fecha_hora_horario ASC
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

        switch (ele.tipo_accion) {
            case 'E':
                //var hora_ = DateTime.fromFormat(ele.hora, "HH:mm:ss").plus(Duration.fromISOTime("00:01:00")).toFormat("HH:mm:ss");
                var hora_ = DateTime.fromFormat(ele.hora, "HH:mm:ss").plus(Duration.fromISOTime("00:00:00")).toFormat("HH:mm:ss");
                //console.log('ver fecha ', DateTime.fromFormat(ele.fecha, 'yyyy-MM-dd').toFormat('yyyy-MM-dd'))
                var formato = DateTime.fromFormat(ele.fecha, 'yyyy-MM-dd').toFormat('yyyy-MM-dd');
                fecha = DateTime.fromFormat(`${formato} ${hora_}`, 'yyyy-MM-dd HH:mm:ss').toFormat('yyyy-MM-dd HH:mm:ss');
                //console.log('ver formato ', fecha)
                accion = 'E';
                observacion = 'Entrada';
                tecla_funcion = '0';
                break;
            case 'S':
                //var hora_ = DateTime.fromFormat(ele.hora, "HH:mm:ss").plus(Duration.fromISOTime("00:10:00")).toFormat("HH:mm:ss");
                //var hora_ = DateTime.fromFormat(ele.hora, "HH:mm:ss").plus(Duration.fromISOTime("00:00:00")).toFormat("HH:mm:ss");
                var hora_ = DateTime.fromFormat(ele.hora, "HH:mm:ss").minus(Duration.fromISOTime("00:02:00")).toFormat("HH:mm:ss");
                var formato = DateTime.fromFormat(ele.fecha, 'yyyy-MM-dd').toFormat('yyyy-MM-dd');
                fecha = DateTime.fromFormat(`${formato} ${hora_}`, 'yyyy-MM-dd HH:mm:ss').toFormat('yyyy-MM-dd HH:mm:ss');
                observacion = 'Salida';
                tecla_funcion = '1';
                break;
            case 'I/A':
                auxiliar = '';
                var hora_ = DateTime.fromFormat(ele.hora, "HH:mm:ss").plus(Duration.fromISOTime("00:20:00")).toFormat("HH:mm:ss");
                var formato = DateTime.fromFormat(ele.fecha, 'yyyy-MM-dd').toFormat('yyyy-MM-dd');
                fecha = DateTime.fromFormat(`${formato} ${hora_}`, 'yyyy-MM-dd HH:mm:ss').toFormat('yyyy-MM-dd HH:mm:ss');
                accion = 'I/A';
                observacion = 'Inicio alimentacion';
                tecla_funcion = '2';
                auxiliar = hora_;
                break;
            case 'F/A':
                var comida = DateTime.fromFormat(formatearMinutos(ele.minutos_alimentacion), 'HH:mm:ss').toFormat('HH:mm:ss');
                //var min = DateTime.fromFormat(comida, "HH:mm:ss").minus(Duration.fromISOTime("00:02:00")).toFormat("HH:mm:ss");
                var min = DateTime.fromFormat(comida, "HH:mm:ss").plus(Duration.fromISOTime("00:00:00")).toFormat("HH:mm:ss");
                var hora_ = DateTime.fromFormat(auxiliar, "HH:mm:ss").plus(Duration.fromISOTime(min)).toFormat("HH:mm:ss");
                //console.log('hora ', hora_, ' auxiliar ', auxiliar)
                var formato = DateTime.fromFormat(ele.fecha, 'yyyy-MM-dd').toFormat('yyyy-MM-dd');
                fecha = DateTime.fromFormat(`${formato} ${hora_}`, 'yyyy-MM-dd HH:mm:ss').toFormat('yyyy-MM-dd HH:mm:ss');
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
                INSERT INTO eu_timbres (fecha_hora_timbre, accion, tecla_funcion, observacion, latitud, longitud, 
                    codigo, id_reloj, fecha_hora_timbre_servidor, fecha_hora_timbre_validado)
                values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)         
                `
                , [fecha, accion, tecla_funcion, observacion, latitud, longitud, codigo, 3, fecha, fecha]
            )
        }

    })

    /*
        `
            INSERT INTO eu_timbres (fecha_hora_timbre, accion, tecla_funcion, observacion, latitud, longitud, 
                codigo, id_reloj, fecha_hora_timbre_servidor, fecha_hora_timbre_validado)
            values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `
            , [fecha, accion, tecla_funcion, observacion, latitud, longitud, codigo, 3, fecha, fecha]

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

export const EliminarTimbres = async function (id_empleado: number) {

    await pool.query('DELETE FROM eu_timbres WHERE codigo = $1', [id_empleado])
        .then(result => {
            console.log(result.command);
        });

}

export const ModificarTimbresEntrada = async function () {
    let arrayRespuesta = await pool.query('select id, CAST(fecha_hora_timbre as VARCHAR) FROM eu_timbres WHERE accion like \'E\' ORDER BY fecha_hora_timbre, codigo ASC')
        .then(result => {
            console.log(result.rowCount);

            return result.rows.filter(obj => {
                var minuto: number = obj.fecha_hora_timbre.split(' ')[1].split(':')[1];
                return (minuto >= 0 && minuto <= 35)
            });
        });
    console.log(arrayRespuesta.length);

    arrayRespuesta.forEach(async (obj) => {
        var hora: number = parseInt(obj.fecha_hora_timbre.split(' ')[1].split(':')[0]) + 1;
        var minuto: number = obj.fecha_hora_timbre.split(' ')[1].split(':')[1];
        var f = new Date(obj.fecha_hora_timbre.split(' ')[0]);

        // console.log(f.toJSON());
        f.setUTCHours(hora);
        f.setUTCMinutes(minuto);
        // console.log('Fecha corregidad',f.toJSON());

        await pool.query('UPDATE eu_timbres SET fecha_hora_timbre = $1 WHERE id = $2', [f.toJSON(), obj.id])
    })
}