import { ReporteTiempoLaborado } from '../../class/TiempoLaborado';
import { Request, Response } from 'express';
import pool from '../../database';

class ReportesTiempoLaboradoControlador {

    public async ReporteTiempoLaborado(req: Request, res: Response) {
        console.log('datos recibidos', req.body)
        let { desde, hasta } = req.params
        let datos: any[] = req.body;

        let n: Array<any> = await Promise.all(datos.map(async (obj: ReporteTiempoLaborado) => {
            obj.departamentos = await Promise.all(obj.departamentos.map(async (ele) => {
                ele.empleado = await Promise.all(ele.empleado.map(async (o) => {
                    const listaTimbres = await BuscarTiempoLaborado(desde, hasta, o.codigo);
                    o.timbres = await agruparTimbres(listaTimbres);
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

        let nuevo = n.map((obj: ReporteTiempoLaborado) => {
            obj.departamentos = obj.departamentos.map((e) => {
                e.empleado = e.empleado.filter((v: any) => { return v.timbres.length > 0 })
                return e
            }).filter((e: any) => { return e.empleado.length > 0 })
            return obj

        }).filter(obj => { return obj.departamentos.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registro de tiempo laborado.' })

        return res.status(200).jsonp(nuevo)

    }

    public async ReporteTiempoLaboradoRegimenCargo(req: Request, res: Response) {
        console.log('datos recibidos', req.body)
        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        let n: Array<any> = await Promise.all(datos.map(async (obj: any) => {      
            obj.empleados = await Promise.all(obj.empleados.map(async (o:any) => {
                const listaTimbres = await BuscarTiempoLaborado(desde, hasta, o.codigo);
                o.timbres = await agruparTimbres(listaTimbres);
                console.log('Timbres: ', o);
                return o;
            }));    
            return obj;
        }));

        let nuevo = n.map((e: any) => {
            e.empleados = e.empleados.filter((t: any) => { return t.timbres.length > 0 })
            return e
        }).filter(e => { return e.empleados.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registro de tiempo laborado.' })

        return res.status(200).jsonp(nuevo)

    }


}

const REPORTES_TIEMPO_LABORADO_CONTROLADOR = new ReportesTiempoLaboradoControlador();
export default REPORTES_TIEMPO_LABORADO_CONTROLADOR;

const BuscarTiempoLaborado = async function (fec_inicio: string, fec_final: string, codigo: string | number) {
    return await pool.query('SELECT CAST(fec_horario AS VARCHAR), CAST(fec_hora_horario AS VARCHAR), CAST(fec_hora_timbre AS VARCHAR), ' +
    'codigo, estado_timbre, tipo_entr_salida AS accion, min_alimentacion, tipo_dia, id_horario ' +
    'FROM plan_general WHERE CAST(fec_hora_horario AS VARCHAR) BETWEEN $1 || \'%\' ' +
    'AND ($2::timestamp + \'1 DAY\') || \'%\' AND codigo = $3 ' +
    'AND tipo_entr_salida IN (\'E\',\'I/A\', \'F/A\', \'S\') ' +
    'ORDER BY codigo, fec_hora_horario ASC', [fec_inicio, fec_final, codigo])
        .then(res => {
            
            return res.rows;
        })
}

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
        console.log('key',key)
        const cantidadTimbres = timbresAgrupadosFecha[key].length;
        switch (cantidadTimbres) {
            case 4:
                for (let i = 0; i < timbresAgrupadosFecha[key].length; i += 4) {
                    timbresAgrupados.push({
                        tipo: 'EAS',
                        dia: timbresAgrupadosFecha[key][i].tipo_dia,
                        entrada: timbresAgrupadosFecha[key][i],
                        inicioAlimentacion: timbresAgrupadosFecha[key][i+1],
                        finAlimentacion: timbresAgrupadosFecha[key][i+2],
                        salida: i + 3 < timbresAgrupadosFecha[key].length ? timbresAgrupadosFecha[key][i + 3] : null
                    });
                }
                break;  
            case 2:
                for (let i = 0; i < timbresAgrupadosFecha[key].length; i += 2) {
                    timbresAgrupados.push({
                         tipo: 'ES',
                         dia: timbresAgrupadosFecha[key][i].tipo_dia,
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
    min_alimentacion: number;
}

