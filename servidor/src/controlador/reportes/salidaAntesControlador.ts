import { ReporteSalidaAntes } from '../../class/Salida_Antes';
import { Request, Response } from 'express'
import pool from '../../database'

class SalidasAntesControlador {

    // METODO DE REGISTROS DE SALIDAS ANTICIPADAS     **USADO
    public async ReporteSalidasAnticipadas(req: Request, res: Response) {
        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        let n: Array<any> = await Promise.all(datos.map(async (obj: any) => {
            obj.empleados = await Promise.all(obj.empleados.map(async (o: any) => {
                o.salidas = await BuscarSalidasAnticipadas(desde, hasta, o.id);
                return o;
            }));
            return obj;
        }));

        let nuevo = n.map((e: any) => {
            e.empleados = e.empleados.filter((t: any) => { return t.salidas.length > 0 })
            return e
        }).filter(e => { return e.empleados.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registros.' })

        return res.status(200).jsonp(nuevo)
    }
}

const SALIDAS_ANTICIPADAS_CONTROLADOR = new SalidasAntesControlador();

export default SALIDAS_ANTICIPADAS_CONTROLADOR;

// FUNCION DE BUSQUEDA DE SALIDAS ANTICIPADAS    **USADO
export const BuscarSalidasAnticipadas = async function (fec_inicio: string, fec_final: string, id_empleado: string | number) {
    return await pool.query(
        `
        SELECT CAST(fecha_hora_horario AS VARCHAR), CAST(fecha_hora_timbre AS VARCHAR), 
            EXTRACT(epoch FROM (fecha_hora_horario - fecha_hora_timbre)) AS diferencia, 
            id_empleado, estado_timbre, tipo_accion AS accion, tipo_dia 
        FROM eu_asistencia_general 
        WHERE CAST(fecha_hora_horario AS VARCHAR) BETWEEN $1 || '%' 
            AND ($2::timestamp + '1 DAY') || '%' AND id_empleado = $3 
            AND fecha_hora_timbre < fecha_hora_horario AND tipo_dia NOT IN ('L', 'FD') 
            AND tipo_accion = 'S'
        ORDER BY fecha_hora_horario ASC
        `
        , [fec_inicio, fec_final, id_empleado])
        .then(res => {
            return res.rows;
        })
}
