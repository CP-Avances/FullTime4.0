import { Request, Response } from 'express'
import pool from '../../database'

class ReportesVacunasControlador {

    // METODO DE BUSQUEDA DE DATOS DE VACUNAS LISTA sucursales[regimenes[departamentos[cargos[empleados]]]]
    public async ReporteVacunasMultiple(req: Request, res: Response) {
        console.log('datos recibidos', req.body)
        let datos: any[] = req.body;

        let n: Array<any> = await Promise.all(datos.map(async (suc: any) => {
            suc.regimenes = await Promise.all(suc.regimenes.map(async (dep: any) => {
                dep.departamentos = await Promise.all(dep.departamentos.map(async (car: any) => {
                    car.cargos = await Promise.all(car.cargos.map(async (empl: any) => {
                        empl.empleado = await Promise.all(empl.empleado.map(async (o: any) => {
                            o.vacunas = await BuscarVacunas(o.id);
                            console.log('Vacunas: ', o);
                            return o
                        })
                        )
                        return empl;
                    })
                    )
                    return car;
                })
                )
                return dep;
            })
            )
            return suc;
        })
        )

        let nuevo = n.map((suc: any) => {
            suc.regimes = suc.regimenes.map((dep: any) => {
                dep.departamentos = dep.departamentos.map((car: any) => {
                    car.cargos = car.cargos.map((empl: any) => {
                        empl.empleado = empl.empleado.filter((v: any) => { return v.vacunas.length > 0 })
                        return empl;
                    }).filter((empl: any) => empl.empleado.length > 0)
                    return car;
                }).filter((car: any) => { return car.cargos.length > 0 })
                return dep;
            }).filter((dep: any) => { return dep.departamentos.length > 0 })
            return suc;
        }).filter((suc: any) => { return suc.regimenes.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registro de vacunas.' })

        return res.status(200).jsonp(nuevo)

    }

    // METODO DE BUSQUEDA DE DATOS DE VACUNAS LISTA sucursales[empleados]
    public async ReporteVacunasMultipleCargosRegimen(req: Request, res: Response) {
        console.log('datos recibidos', req.body)
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

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registro de vacunas.' })

        return res.status(200).jsonp(nuevo)
    }

}

// FUNCION DE BUSQUEDA DE REGISTROS DE VACUNAS
const BuscarVacunas = async function (id: number) {
    return await pool.query(
        `
        SELECT ev.id, ev.id_empleado, tv.nombre AS tipo_vacuna, 
            ev.carnet, ev.fecha, ev.descripcion
        FROM empl_vacunas AS ev, tipo_vacuna AS tv 
        WHERE ev.id_tipo_vacuna = tv.id
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