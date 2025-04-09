import { Request, Response } from 'express';
import pool from '../../database';

class ReportesAtrasosControlador {

    // METODO DE BUSQUEDA DE DATOS DE ATRASOS    **USADO
    public async ReporteAtrasos(req: Request, res: Response) {
        let { desde, hasta } = req.params;
        console.log("ver desde: ", desde);
        let datos: any[] = req.body;
        let n: Array<any> = await Promise.all(datos.map(async (suc: any) => {
            suc.empleados = await Promise.all(suc.empleados.map(async (o: any) => {
                o.atrasos = await BuscarAtrasos(desde, hasta, o.id);
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
export const BuscarAtrasos = async function (fec_inicio: string, fec_final: string, id_empleado: string | number) {
    return await pool.query(
        `
        SELECT CAST(ag.fecha_hora_horario AS VARCHAR), CAST(ag.fecha_hora_timbre AS VARCHAR),
            EXTRACT(epoch FROM (ag.fecha_hora_timbre - ag.fecha_hora_horario)) AS diferencia, 
            ag.id_empleado, ag.estado_timbre, ag.tipo_accion AS accion, ag.tolerancia, ag.tipo_dia 
        FROM eu_asistencia_general AS ag , eu_empleado_contratos AS ec
        WHERE CAST(ag.fecha_hora_horario AS VARCHAR) BETWEEN $1 || \'%\' 
            AND ($2::timestamp + \'1 DAY\') || \'%\' AND ag.id_empleado = $3 AND ec.id_empleado = ag.id_empleado AND ec.controlar_asistencia = true
            AND ag.fecha_hora_timbre > ag.fecha_hora_horario AND tipo_dia NOT IN (\'L\', \'FD\') 
            AND ag.tipo_accion = \'E\' 
        ORDER BY ag.fecha_hora_horario ASC
        `
        , [fec_inicio, fec_final, id_empleado])
        .then(res => {

            return res.rows;
        })
}

const REPORTES_ATRASOS_CONTROLADOR = new ReportesAtrasosControlador();

export default REPORTES_ATRASOS_CONTROLADOR;