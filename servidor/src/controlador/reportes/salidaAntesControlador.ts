import { ReporteSalidaAntes } from '../../class/Salida_Antes';
import { Request, Response } from 'express'
import pool from '../../database'

class SalidasAntesControlador {

    public async ReporteSalidasAnticipadas(req: Request, res: Response) {
        console.log('datos recibidos', req.body)
        let { desde, hasta } = req.params
        let datos: any[] = req.body;

        let n: Array<any> = await Promise.all(datos.map(async (obj: ReporteSalidaAntes) => {
            obj.departamentos = await Promise.all(obj.departamentos.map(async (ele) => {
                ele.empleado = await Promise.all(ele.empleado.map(async (o) => {
                    o.timbres = await BuscarSalidasAnticipadas(desde, hasta, o.id);
                    console.log('timbres:-------------------- ', o);
                    return o
                })
                )
                return ele
            })
            )
            return obj
        })
        )

        let nuevo = n.map((obj: ReporteSalidaAntes) => {
            obj.departamentos = obj.departamentos.map((e) => {
                e.empleado = e.empleado.filter((v: any) => { return v.timbres.length > 0 })
                return e
            }).filter((e: any) => { return e.empleado.length > 0 })
            return obj

        }).filter(obj => { return obj.departamentos.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registros.' })

        return res.status(200).jsonp(nuevo)

    }

    public async ReporteSalidasAnticipadasRegimenCargo(req: Request, res: Response) {
        console.log('datos recibidos', req.body)
        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        let n: Array<any> = await Promise.all(datos.map(async (obj: any) => {
            obj.empleados = await Promise.all(obj.empleados.map(async (o: any) => {
                o.timbres = await BuscarSalidasAnticipadas(desde, hasta, o.id);
                console.log('Timbres: ', o);
                return o;
            }));
            return obj;
        }));

        let nuevo = n.map((e: any) => {
            e.empleados = e.empleados.filter((t: any) => { return t.timbres.length > 0 })
            return e
        }).filter(e => { return e.empleados.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registros.' })

        return res.status(200).jsonp(nuevo)

    }


}

const SALIDAS_ANTICIPADAS_CONTROLADOR = new SalidasAntesControlador();

export default SALIDAS_ANTICIPADAS_CONTROLADOR;

const BuscarSalidasAnticipadas = async function (fec_inicio: string, fec_final: string, codigo: string | number) {
    return await pool.query(
        `
        SELECT CAST(fecha_hora_horario AS VARCHAR), CAST(fecha_hora_timbre AS VARCHAR), 
            EXTRACT(epoch FROM (fecha_hora_horario - fecha_hora_timbre)) AS diferencia, 
            id_empleado, estado_timbre, tipo_accion AS accion, tipo_dia 
        FROM eu_asistencia_general 
        WHERE CAST(fecha_hora_horario AS VARCHAR) BETWEEN $1 || \'%\' 
            AND ($2::timestamp + \'1 DAY\') || \'%\' AND id_empleado = $3 
            AND fecha_hora_timbre < fecha_hora_horario AND tipo_dia NOT IN (\'L\', \'FD\') 
            AND tipo_accion = \'S\'
        ORDER BY fecha_hora_horario ASC
        `
        , [fec_inicio, fec_final, codigo])
        .then(res => {
            return res.rows;
        })
}
