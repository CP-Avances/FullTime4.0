import { Request, Response } from 'express'
import { ReporteSalidaAntes } from '../../class/Salida_Antes';
import pool from '../../database'

class SalidasAntesControlador {

    public async BuscarTimbres_AccionS(req: Request, res: Response) {
        console.log('datos recibidos', req.body)
        let { desde, hasta } = req.params
        let datos: any[] = req.body;

        let n: Array<any> = await Promise.all(datos.map(async (obj: ReporteSalidaAntes) => {
            obj.departamentos = await Promise.all(obj.departamentos.map(async (ele) => {
                ele.empleado = await Promise.all(ele.empleado.map(async (o) => {
                    o.timbres = await BuscarTimbresS(desde, hasta, o.codigo);
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

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registro de timbres.' })

        return res.status(200).jsonp(nuevo)

    }
}

const SALIDAS_ANTICIPADAS_CONTROLADOR = new SalidasAntesControlador();
export default SALIDAS_ANTICIPADAS_CONTROLADOR;

const BuscarTimbresS = async function (fec_inicio: string, fec_final: string, id: number) {
    console.log('datos buscados---------------------*************', id)
    return await pool.query('SELECT t.fec_hora_timbre::date AS fecha, t.fec_hora_timbre::time AS hora ' +
        'FROM timbres AS t ' +
        'WHERE t.id_empleado = $3 ' +
        'AND t.fec_hora_timbre::date BETWEEN $1 AND $2 AND t.accion = \'S\'',
        [fec_inicio, fec_final, id])
        .then((res: any) => {
            return res.rows;
        })
}

const BuscarHoraHorario = async function (fecha: string, codigo: number) {
    return await pool.query('SELECT eh.codigo, eh.id_horarios, hora ' +
        'FROM empl_horarios AS eh, deta_horarios AS dh ' +
        'WHERE eh.codigo = $2 ' +
        'AND $1 BETWEEN eh.fec_inicio AND eh.fec_final ' +
        'AND dh.id_horario = eh.id_horarios AND dh.orden = 4',
        [fecha, codigo])
        .then((res: any) => {
            return res.rows;
        })
}
