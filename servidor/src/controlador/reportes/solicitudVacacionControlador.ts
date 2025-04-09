import { Request, Response } from 'express'
import { ReporteVacacion } from '../../class/Vacaciones';
import pool from '../../database'

class SolicitudVacacionesControlador {

    public async ReporteVacacionesMultiple(req: Request, res: Response) {
        console.log('datos recibidos', req.body)
        let datos: any[] = req.body;
        let { desde, hasta } = req.params;
        let n: Array<any> = await Promise.all(datos.map(async (obj: ReporteVacacion) => {
            obj.departamentos = await Promise.all(obj.departamentos.map(async (ele) => {
                ele.empleado = await Promise.all(ele.empleado.map(async (o) => {
                    o.vacaciones = await BuscarVacaciones(o.id, desde, hasta);
                    console.log('Vacaciones: ', o);
                    return o
                })
                )
                return ele
            })
            )
            return obj
        })
        )


        let nuevo = n.map((obj: ReporteVacacion) => {

            obj.departamentos = obj.departamentos.map((e) => {

                e.empleado = e.empleado.filter((v: any) => { return v.vacaciones.length > 0 })
                return e

            }).filter((e: any) => { return e.empleado.length > 0 })
            return obj

        }).filter(obj => { return obj.departamentos.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registros.' })

        return res.status(200).jsonp(nuevo)

    }

}

const VACACIONES_REPORTE_CONTROLADOR = new SolicitudVacacionesControlador();

export default VACACIONES_REPORTE_CONTROLADOR;

const BuscarVacaciones = async function (id: string | number, desde: string, hasta: string) {
    return await pool.query(
        `
        SELECT v.fecha_inicio, v.fecha_final, v.fecha_ingreso,v.id AS id_vacacion, a.id_autoriza_estado, a.estado 
        FROM mv_solicitud_vacacion AS v, ecm_autorizaciones AS a 
        WHERE v.id = a.id_vacacion AND v.id_empleado = $1 AND fecha_inicio BETWEEN $2 AND $3
        `
        , [id, desde, hasta])
        .then((res: any) => {
            if (res.rowCount != 0) {
                res.rows.map((obj: any) => {
                    if (obj.id_autoriza_estado != null && obj.id_autoriza_estado != '' && obj.estado != 1) {
                        var autorizaciones = obj.id_autoriza_estado.split(',');
                        let empleado_id = autorizaciones[autorizaciones.length - 2].split('_')[0];
                        obj.autoriza = parseInt(empleado_id);
                    }
                    if (obj.estado === 1) {
                        obj.estado = 'Pendiente';
                    }
                    else if (obj.estado === 2) {
                        obj.estado = 'Pre-autorizado';
                    }
                    else if (obj.estado === 3) {
                        obj.estado = 'Autorizado';
                    }
                    else if (obj.estado === 4) {
                        obj.estado = 'Negado';
                    }
                });
            }
            return res.rows
        });
}
