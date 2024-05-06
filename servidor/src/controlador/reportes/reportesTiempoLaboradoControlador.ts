import { Request, Response } from 'express';
import pool from '../../database';

class ReportesTiempoLaboradoControlador {

    // METODO DE BUSQUEDA DE DATOS DE TIEMPO LABORADO LISTA sucursales[regimenes[departamentos[cargos[empleados]]]]
    public async ReporteTiempoLaborado(req: Request, res: Response) {
        console.log('datos recibidos', req.body)
        let { desde, hasta } = req.params
        let datos: any[] = req.body;

        let n: Array<any> = await Promise.all(datos.map(async (suc: any) => {
            suc.regimenes = await Promise.all(suc.regimenes.map(async (dep: any) => {
                dep.departamentos = await Promise.all(dep.departamentos.map(async (car: any) => {
                    car.cargos = await Promise.all(car.cargos.map(async (empl: any) => {
                        empl.empleado = await Promise.all(empl.empleado.map(async (o: any) => {
                            const listaTimbres = await BuscarTiempoLaborado(desde, hasta, o.codigo);
                            o.timbres = await agruparTimbres(listaTimbres);
                            console.log('tiempo laborado: ', o);
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

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registros.' })

        return res.status(200).jsonp(nuevo)

    }

    // METODO DE BUSQUEDA DE DATOS DE TIEMPO LABORADO LISTA sucursales[empleados]
    public async ReporteTiempoLaboradoRegimenCargo(req: Request, res: Response) {
        console.log('datos recibidos', req.body)
        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        let n: Array<any> = await Promise.all(datos.map(async (suc: any) => {
            suc.empleados = await Promise.all(suc.empleados.map(async (o: any) => {
                const listaTimbres = await BuscarTiempoLaborado(desde, hasta, o.codigo);
                o.timbres = await agruparTimbres(listaTimbres);
                console.log('Timbres: ', o);
                return o;
            }));
            return suc;
        }));

        let nuevo = n.map((e: any) => {
            e.empleados = e.empleados.filter((t: any) => { return t.timbres.length > 0 })
            return e
        }).filter(e => { return e.empleados.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registros.' })

        return res.status(200).jsonp(nuevo)
    }


}


// FUNCION PARA BUSCAR DATOS DE TIEMPO LABORADO
const BuscarTiempoLaborado = async function (fec_inicio: string, fec_final: string, codigo: string | number) {
    return await pool.query(
        `
        SELECT CAST(fecha_horario AS VARCHAR), CAST(fecha_hora_horario AS VARCHAR), CAST(fecha_hora_timbre AS VARCHAR),
            codigo, estado_timbre, tipo_accion AS accion, minutos_alimentacion, tipo_dia, id_horario, 
            estado_origen, tolerancia 
        FROM eu_asistencia_general WHERE CAST(fecha_hora_horario AS VARCHAR) BETWEEN $1 || \'%\' 
            AND ($2::timestamp + \'1 DAY\') || \'%\' AND codigo = $3 
            AND tipo_accion IN (\'E\',\'I/A\', \'F/A\', \'S\') 
        ORDER BY codigo, fecha_hora_horario ASC
        `
        , [fec_inicio, fec_final, codigo])
        .then(res => {

            return res.rows;
        })
}


// METODO PARA AGRUPAR TIMBRES
const agruparTimbres = async function agruparTimbresPorClave(timbres: Timbre[]) {
    const timbresAgrupadosFecha: { [key: string]: Timbre[] } = {};
    const timbresAgrupados: any[] = [];

    timbres.forEach((timbre) => {
        const clave = `${timbre.fec_horario}-${timbre.id_horario}`;
        if (!timbresAgrupadosFecha[clave]) {
            timbresAgrupadosFecha[clave] = [];
        }
        timbresAgrupadosFecha[clave].push(timbre);
    });

    for (let key in timbresAgrupadosFecha) {
        console.log('key', key)
        const cantidadTimbres = timbresAgrupadosFecha[key].length;
        switch (cantidadTimbres) {
            case 4:
                for (let i = 0; i < timbresAgrupadosFecha[key].length; i += 4) {
                    timbresAgrupados.push({
                        tipo: 'EAS',
                        dia: timbresAgrupadosFecha[key][i].tipo_dia,
                        origen: timbresAgrupadosFecha[key][i].estado_origen,
                        entrada: timbresAgrupadosFecha[key][i],
                        inicioAlimentacion: timbresAgrupadosFecha[key][i + 1],
                        finAlimentacion: timbresAgrupadosFecha[key][i + 2],
                        salida: i + 3 < timbresAgrupadosFecha[key].length ? timbresAgrupadosFecha[key][i + 3] : null
                    });
                }
                break;
            case 2:
                for (let i = 0; i < timbresAgrupadosFecha[key].length; i += 2) {
                    timbresAgrupados.push({
                        tipo: 'ES',
                        dia: timbresAgrupadosFecha[key][i].tipo_dia,
                        origen: timbresAgrupadosFecha[key][i].estado_origen,
                        entrada: timbresAgrupadosFecha[key][i],
                        salida: i + 1 < timbresAgrupadosFecha[key].length ? timbresAgrupadosFecha[key][i + 1] : null
                    });
                }
                break;
        }
    }

    return timbresAgrupados;
}

interface Timbre {
    id_horario: string;
    fec_horario: string;
    fec_hora_horario: string;
    fec_hora_timbre: string | null;
    codigo: string;
    estado_timbre: string | null;
    accion: string;
    tipo_dia: string;
    estado_origen: string;
    min_alimentacion: number;
    toleranica: number;
}

const REPORTES_TIEMPO_LABORADO_CONTROLADOR = new ReportesTiempoLaboradoControlador();

export default REPORTES_TIEMPO_LABORADO_CONTROLADOR;

