import { Request, Response } from 'express';
import pool from '../../database';

class ReportesAtrasosControlador {

    // METODO DE BUSQUEDA DE DATOS DE ATRASOS
    public async ReporteAtrasos(req: Request, res: Response) {
        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        let n: Array<any> = await Promise.all(datos.map(async (suc: any) => {
            suc.empleados = await Promise.all(suc.empleados.map(async (o: any) => {
                o.atrasos = await BuscarAtrasos(desde, hasta, o.id);
                console.log('atrasos: ', o);
                return o;
            }));
            return suc;
        }));

        let nuevo = n.map((e: any) => {
            e.empleados = e.empleados.filter((a: any) => { return a.atrasos.length > 0 })
            return e
        }).filter(e => { return e.empleados.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registro de atrasos.' })

        return res.status(200).jsonp(nuevo)
    }

}


// FUNCION DE BUSQUEDA DE REGISTROS DE ATRASOS
const BuscarAtrasos = async function (fec_inicio: string, fec_final: string, id_empleado: string | number) {
    return await pool.query(
        `
        SELECT CAST(fecha_hora_horario AS VARCHAR), CAST(fecha_hora_timbre AS VARCHAR),
            EXTRACT(epoch FROM (fecha_hora_timbre - fecha_hora_horario)) AS diferencia, 
            id_empleado, estado_timbre, tipo_accion AS accion, tolerancia, tipo_dia 
        FROM eu_asistencia_general WHERE CAST(fecha_hora_horario AS VARCHAR) BETWEEN $1 || \'%\' 
            AND ($2::timestamp + \'1 DAY\') || \'%\' AND id_empleado = $3 
            AND fecha_hora_timbre > fecha_hora_horario AND tipo_dia NOT IN (\'L\', \'FD\') 
            AND tipo_accion = \'E\' 
        ORDER BY fecha_hora_horario ASC
        `
        , [fec_inicio, fec_final, id_empleado])
        .then(res => {

            return res.rows;
        })
}

const REPORTES_ATRASOS_CONTROLADOR = new ReportesAtrasosControlador();

export default REPORTES_ATRASOS_CONTROLADOR;