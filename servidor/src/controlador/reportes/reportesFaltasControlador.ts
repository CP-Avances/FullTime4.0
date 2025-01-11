import { Request, Response } from 'express';
import pool from '../../database';

class FaltasControlador {

    // METODO DE BUSQUEDA DE DATOS DE FALTAS    **USADO
    public async ReporteFaltas(req: Request, res: Response) {
        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        let n: Array<any> = await Promise.all(datos.map(async (obj: any) => {
            obj.empleados = await Promise.all(obj.empleados.map(async (o: any) => {
                o.faltas = await BuscarFaltas(desde, hasta, o.id);
                return o;
            }));
            return obj;
        }));

        let nuevo = n.map((e: any) => {
            e.empleados = e.empleados.filter((t: any) => { return t.faltas.length > 0 })
            return e
        }).filter(e => { return e.empleados.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registros.' })

        return res.status(200).jsonp(nuevo)
    }

}

// FUNCION DE BUSQUEDA DE REGISTROS DE FALTAS
export const BuscarFaltas = async function (fec_inicio: string, fec_final: string, id_empleado: string | number) {
    return await pool.query(
        `
        SELECT id_empleado, CAST(fecha_horario AS VARCHAR)
        FROM eu_asistencia_general WHERE fecha_horario BETWEEN $1 AND $2 AND id_empleado = $3
            AND tipo_dia NOT IN (\'L\', \'FD\')
        GROUP BY id_empleado, fecha_horario
        HAVING COUNT(fecha_hora_timbre) = 0 
        ORDER BY fecha_horario ASC
        `
        , [fec_inicio, fec_final, id_empleado])
        .then(res => {
            return res.rows;
        })
}

const FALTAS_CONTROLADOR = new FaltasControlador();

export default FALTAS_CONTROLADOR;
