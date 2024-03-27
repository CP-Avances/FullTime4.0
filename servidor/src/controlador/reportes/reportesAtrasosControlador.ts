import { IReporteAtrasos } from '../../class/Asistencia';
import { Request, Response } from 'express';
import pool from '../../database';

class ReportesAtrasosControlador {

    // METODO DE BUSQUEDA DE DATOS DE ATRASOS LISTA sucursales[regimenes[departamentos[cargos[empleados]]]]
    public async ReporteAtrasos(req: Request, res: Response) {
        console.log('datos recibidos', req.body)
        let { desde, hasta } = req.params
        let datos: any[] = req.body;

        let n: Array<any> = await Promise.all(datos.map(async (suc: any) => {
            suc.regimenes = await Promise.all(suc.regimenes.map(async (dep: any) => {
                dep.departamentos = await Promise.all(dep.departamentos.map(async (car: any) => {
                    car.cargos = await Promise.all(car.cargos.map(async (empl: any) => {
                        empl.empleado = await Promise.all(empl.empleado.map(async (o: any) => {
                            o.atrasos = await BuscarAtrasos(desde, hasta, o.codigo);
                            console.log('atrasos: ', o);
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
                        empl.empleado = empl.empleado.filter((a: any) => { return a.atrasos.length > 0 })
                        return empl;
                    }).filter((empl: any) => empl.empleado.length > 0)
                    return car;
                }).filter((car: any) => { return car.cargos.length > 0 })
                return dep;
            }).filter((dep: any) => { return dep.departamentos.length > 0 })
            return suc;
        }).filter((suc: any) => { return suc.regimenes.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registro de atrasos.' })

        return res.status(200).jsonp(nuevo)

    }


    // METODO DE BUSQUEDA DE DATOS DE ATRASOS LISTA sucursales[empleados]
    public async ReporteAtrasosRegimenCargo(req: Request, res: Response) {
        console.log('datos recibidos', req.body)
        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        let n: Array<any> = await Promise.all(datos.map(async (suc: any) => {
            suc.empleados = await Promise.all(suc.empleados.map(async (o: any) => {
                o.atrasos = await BuscarAtrasos(desde, hasta, o.codigo);
                console.log('atrasos: ', o);
                return o;
            }));
            return suc;
        }));

        let nuevo = n.map((e: any) => {
            e.empleados = e.empleados.filter((a: any) => { return a.atrasos.length > 0 })
            return e
        }).filter(e => { return e.empleados.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registro de atrasos.' })

        return res.status(200).jsonp(nuevo)
    }

}


// FUNCION DE BUSQUEDA DE REGISTROS DE ATRASOS
const BuscarAtrasos = async function (fec_inicio: string, fec_final: string, codigo: string | number) {
    return await pool.query(
        `
        SELECT CAST(fec_hora_horario AS VARCHAR), CAST(fec_hora_timbre AS VARCHAR),
            EXTRACT(epoch FROM (fec_hora_timbre - fec_hora_horario)) AS diferencia, 
            codigo, estado_timbre, tipo_entr_salida AS accion, tolerancia, tipo_dia 
        FROM plan_general WHERE CAST(fec_hora_horario AS VARCHAR) BETWEEN $1 || \'%\' 
            AND ($2::timestamp + \'1 DAY\') || \'%\' AND codigo = $3 
            AND fec_hora_timbre > fec_hora_horario AND tipo_dia NOT IN (\'L\', \'FD\') 
            AND tipo_entr_salida = \'E\' 
        ORDER BY fec_hora_horario ASC
        `
        , [fec_inicio, fec_final, codigo])
        .then(res => {

            return res.rows;
        })
}

const REPORTES_ATRASOS_CONTROLADOR = new ReportesAtrasosControlador();
export default REPORTES_ATRASOS_CONTROLADOR;