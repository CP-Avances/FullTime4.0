import { ReporteFaltas } from '../../class/Faltas';
import { Request, Response } from 'express';
import pool from '../../database';

class FaltasControlador {

    public async ReporteFaltas(req: Request, res: Response) {
        console.log('datos recibidos', req.body)
        let { desde, hasta } = req.params
        let datos: any[] = req.body;

        let n: Array<any> = await Promise.all(datos.map(async (obj: ReporteFaltas) => {
            obj.departamentos = await Promise.all(obj.departamentos.map(async (ele) => {
                ele.empleado = await Promise.all(ele.empleado.map(async (o) => {
                    o.timbres = await BuscarFaltas(desde, hasta, o.codigo);
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

        let nuevo = n.map((obj: ReporteFaltas) => {
            obj.departamentos = obj.departamentos.map((e) => {
                e.empleado = e.empleado.filter((v: any) => { return v.timbres.length > 0 })
                return e
            }).filter((e: any) => { return e.empleado.length > 0 })
            return obj

        }).filter(obj => { return obj.departamentos.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registro de faltas.' })

        return res.status(200).jsonp(nuevo)

    }

    public async ReporteFaltasRegimenCargo(req: Request, res: Response) {
        console.log('datos recibidos', req.body)
        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        let n: Array<any> = await Promise.all(datos.map(async (obj: any) => {      
            obj.empleados = await Promise.all(obj.empleados.map(async (o:any) => {
                o.timbres = await BuscarFaltas(desde, hasta, o.codigo);
                console.log('Timbres: ', o);
                return o;
            }));    
            return obj;
        }));

        let nuevo = n.map((e: any) => {
            e.empleados = e.empleados.filter((t: any) => { return t.timbres.length > 0 })
            return e
        }).filter(e => { return e.empleados.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registro de faltas.' })

        return res.status(200).jsonp(nuevo)

    }


}

const FALTAS_CONTROLADOR = new FaltasControlador();
export default FALTAS_CONTROLADOR;

const BuscarFaltas = async function (fec_inicio: string, fec_final: string, codigo: string | number) {
    console.log('aca estoy')
    return await pool.query('SELECT codigo, CAST(fec_horario AS VARCHAR) ' +
        'FROM plan_general WHERE fec_horario BETWEEN $1 ' +
        'AND $2 AND codigo = $3 ' +
        'AND tipo_dia NOT IN (\'L\', \'FD\') ' +
        'GROUP BY codigo, fec_horario ' +
        'HAVING COUNT(fec_hora_timbre) = 0 ' +
        'ORDER BY fec_horario ASC', [fec_inicio, fec_final, codigo])
        .then(res => {
            return res.rows;
        })
}
