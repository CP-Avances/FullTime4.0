import { Request, Response } from 'express'
import { ReporteVacuna } from '../../class/Vacuna';
import pool from '../../database'

class ReportesVacunasControlador {

    public async ReporteVacunasMultiple(req: Request, res: Response) {
        console.log('datos recibidos', req.body)
        let datos: any[] = req.body;

        let n: Array<any> = await Promise.all(datos.map(async (obj: ReporteVacuna) => {
            obj.departamentos = await Promise.all(obj.departamentos.map(async (ele) => {
                ele.empleado = await Promise.all(ele.empleado.map(async (o) => {
                    o.vacunas = await BuscarVacunas(o.id);
                    console.log('Vacunas: ', o);
                    return o
                })
                )
                return ele
            })
            )
            return obj
        })
        )


        let nuevo = n.map((obj: ReporteVacuna) => {

            obj.departamentos = obj.departamentos.map((e) => {

                e.empleado = e.empleado.filter((v: any) => { return v.vacunas.length > 0 })
                return e

            }).filter((e: any) => { return e.empleado.length > 0 })
            return obj

        }).filter(obj => { return obj.departamentos.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registro de vacunas.' })

        return res.status(200).jsonp(nuevo)

    }

    public async ReporteVacunasMultipleCargos(req: Request, res: Response) {
        console.log('datos recibidos', req.body)
        let datos: any[] = req.body;
        let n: Array<any> = await Promise.all(datos.map(async (obj: any) => {      
            obj.empleados = await Promise.all(obj.empleados.map(async (o:any) => {
                o.vacunas = await BuscarVacunas(o.id);
                console.log('Vacunas: ', o);
                return o
            })
            )    
            return obj
        })
        )

        console.log('n',n)


        let nuevo = n.map((obj: any) => {

            obj.empleados = obj.empleados.filter((v: any) => { return v.vacunas.length > 0 })
            return obj

        }).filter(obj => { return obj.empleados.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registro de vacunas.' })

        return res.status(200).jsonp(nuevo)

    }

}

const VACUNAS_REPORTE_CONTROLADOR = new ReportesVacunasControlador();
export default VACUNAS_REPORTE_CONTROLADOR;

const BuscarVacunas = async function (id: number) {
    return await pool.query(`
        SELECT ev.id, ev.id_empleado, tv.nombre AS tipo_vacuna, 
            ev.carnet, ev.fecha, ev.descripcion
        FROM empl_vacunas AS ev, tipo_vacuna AS tv 
        WHERE ev.id_tipo_vacuna = tv.id
            AND ev.id_empleado = $1 
        ORDER BY ev.id DESC`,
        [id])
        .then((res: any) => {
            return res.rows;
        })
}