import { IReporteTimbres } from '../../class/Asistencia';
import { Request, Response } from 'express';
import pool from '../../database';

class ReportesTimbresMrlControlador {
   
    public async ReporteTimbresMrl(req: Request, res: Response) {

        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        //El reporte funciona para relojs de 6, 3 y sin acciones.        

        let n: Array<any> = await Promise.all(datos.map(async (obj: IReporteTimbres) => {
            obj.departamentos = await Promise.all(obj.departamentos.map(async (ele) => {
                ele.empleado = await Promise.all(ele.empleado.map(async (o) => {
                    o.timbres = await BuscarTimbres(desde, hasta, o.codigo);
                    console.log('Timbres: ', o);
                    return o
                })
                )
                return ele
            })
            )
            return obj
        })
        )


        let nuevo = n.map((obj: IReporteTimbres) => {

            obj.departamentos = obj.departamentos.map((e) => {

                e.empleado = e.empleado.filter((t: any) => { return t.timbres.length > 0 })
                // console.log('Empleados: ',e);
                return e

            }).filter((e: any) => { return e.empleado.length > 0 })
            return obj

        }).filter(obj => { return obj.departamentos.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No hay timbres en ese periodo.' })

        return res.status(200).jsonp(nuevo)

    }

    public async ReporteTimbresMrlRegimenCargo(req: Request, res: Response) {
        console.log('datos recibidos', req.body)
        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        let n: Array<any> = await Promise.all(datos.map(async (obj: any) => {      
            obj.empleados = await Promise.all(obj.empleados.map(async (o:any) => {
                o.timbres = await BuscarTimbres(desde, hasta, o.codigo);
                console.log('Timbres: ', o);
                return o;
            }));    
            return obj;
        }));

        let nuevo = n.map((e: any) => {
            e.empleados = e.empleados.filter((t: any) => { return t.timbres.length > 0 })
            return e
        }).filter(e => { return e.empleados.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No hay timbres en ese periodo.' })

        return res.status(200).jsonp(nuevo)

    }
}

const REPORTES_TIMBRES_MRL_CONTROLADOR = new ReportesTimbresMrlControlador();
export default REPORTES_TIMBRES_MRL_CONTROLADOR;

const BuscarTimbres = async function (fec_inicio: string, fec_final: string, codigo: string | number) {
    return await pool.query('SELECT CAST(fec_hora_timbre_servidor AS VARCHAR), accion ' +
        'FROM timbres WHERE CAST(fec_hora_timbre_servidor AS VARCHAR) BETWEEN $1 || \'%\' ' +
        'AND ($2::timestamp + \'1 DAY\') || \'%\' AND codigo = $3 AND accion != \'99\' ' +
        'ORDER BY fec_hora_timbre_servidor ASC', [fec_inicio, fec_final, codigo])
        .then(res => {
            return res.rows;
        })
}