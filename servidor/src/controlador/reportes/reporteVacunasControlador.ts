import { Request, Response } from 'express'
import pool from '../../database'

class ReportesVacunasControlador {

    // METODO DE BUSQUEDA DE DATOS DE VACUNAS     **USADO
    public async ReporteVacunasMultiple(req: Request, res: Response) {
        let datos: any[] = req.body;
        let n: Array<any> = await Promise.all(datos.map(async (obj: any) => {
            obj.empleados = await Promise.all(obj.empleados.map(async (o: any) => {
                o.vacunas = await BuscarVacunas(o.id);
                console.log('Vacunas: ', o);
                return o
            })
            )
            return obj
        })
        )

        let nuevo = n.map((obj: any) => {
            obj.empleados = obj.empleados.filter((v: any) => { return v.vacunas.length > 0 })
            return obj
        }).filter(obj => { return obj.empleados.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registros.' })

        return res.status(200).jsonp(nuevo)
    }

}

// FUNCION DE BUSQUEDA DE REGISTROS DE VACUNAS
const BuscarVacunas = async function (id: number) {
    return await pool.query(
        `
        SELECT ev.id, ev.id_empleado, tv.nombre AS tipo_vacuna, 
            ev.carnet, ev.fecha, ev.descripcion
        FROM eu_empleado_vacunas AS ev, e_cat_vacuna AS tv 
        WHERE ev.id_vacuna = tv.id
            AND ev.id_empleado = $1 
        ORDER BY ev.id DESC
        `
        , [id])
        .then((res: any) => {
            return res.rows;
        })
}

const VACUNAS_REPORTE_CONTROLADOR = new ReportesVacunasControlador();

export default VACUNAS_REPORTE_CONTROLADOR;