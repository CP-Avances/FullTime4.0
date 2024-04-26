import { Request, Response } from 'express';
import pool from '../../database';

class FaltasControlador {

    // METODO DE BUSQUEDA DE DATOS DE FALTAS LISTA sucursales[regimenes[departamentos[cargos[empleados]]]]
    public async ReporteFaltas(req: Request, res: Response) {
        console.log('datos recibidos', req.body)
        let { desde, hasta } = req.params
        let datos: any[] = req.body;

        let n: Array<any> = await Promise.all(datos.map(async (suc: any) => {
            suc.regimenes = await Promise.all(suc.regimenes.map(async (dep: any) => {
                dep.departamentos = await Promise.all(dep.departamentos.map(async (car: any) => {
                    car.cargos = await Promise.all(car.cargos.map(async (empl: any) => {
                        empl.empleado = await Promise.all(empl.empleado.map(async (o: any) => {
                            o.timbres = await BuscarFaltas(desde, hasta, o.codigo);
                            console.log('timbres: ', o);
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
                        empl.empleado = empl.empleado.filter((v: any) => { return v.timbres.length > 0 })
                        return empl;
                    }).filter((empl: any) => empl.empleado.length > 0)
                    return car;
                }).filter((car: any) => { return car.cargos.length > 0 })
                return dep;
            }).filter((dep: any) => { return dep.departamentos.length > 0 })
            return suc;
        }).filter((suc: any) => { return suc.regimenes.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registro de faltas.' })

        return res.status(200).jsonp(nuevo)

    }

    // METODO DE BUSQUEDA DE DATOS DE FALTAS LISTA sucursales[empleados]
    public async ReporteFaltasRegimenCargo(req: Request, res: Response) {
        console.log('datos recibidos', req.body)
        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        let n: Array<any> = await Promise.all(datos.map(async (obj: any) => {
            obj.empleados = await Promise.all(obj.empleados.map(async (o: any) => {
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

// FUNCION DE BUSQUEDA DE REGISTROS DE FALTAS
const BuscarFaltas = async function (fec_inicio: string, fec_final: string, codigo: string | number) {
    return await pool.query(
        `
        SELECT codigo, CAST(fec_horario AS VARCHAR)
        FROM plan_general WHERE fec_horario BETWEEN $1 AND $2 AND codigo = $3
            AND tipo_dia NOT IN (\'L\', \'FD\')
        GROUP BY codigo, fec_horario
        HAVING COUNT(fec_hora_timbre) = 0 
        ORDER BY fec_horario ASC
        `
        , [fec_inicio, fec_final, codigo])
        .then(res => {
            return res.rows;
        })
}

const FALTAS_CONTROLADOR = new FaltasControlador();
export default FALTAS_CONTROLADOR;
