import { Request, Response } from 'express';
import pool from '../../database';

class ReportesTiempoLaboradoControlador {

    // METODO DE BUSQUEDA DE DATOS DE TIEMPO LABORADO    **USADO
    public async ReporteTiempoLaborado(req: Request, res: Response) {
        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        let n: Array<any> = await Promise.all(datos.map(async (suc: any) => {
            suc.empleados = await Promise.all(suc.empleados.map(async (o: any) => {
                const listaTimbres = await BuscarTiempoLaborado(desde, hasta, o.id);
                o.tLaborado = await AgruparTimbres(listaTimbres);
                console.log('Timbres: ', o);
                return o;
            }));
            return suc;
        }));

        let nuevo = n.map((e: any) => {
            e.empleados = e.empleados.filter((t: any) => { return t.tLaborado.length > 0 })
            return e
        }).filter(e => { return e.empleados.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registros.' })

        return res.status(200).jsonp(nuevo)
    }


}

// FUNCION PARA BUSCAR DATOS DE TIEMPO LABORADO
const BuscarTiempoLaborado = async function (fec_inicio: string, fec_final: string, id_empleado: string | number) {
    return await pool.query(
        `
        SELECT CAST(fecha_horario AS VARCHAR), CAST(fecha_hora_horario AS VARCHAR), CAST(fecha_hora_timbre AS VARCHAR),
            id_empleado, estado_timbre, tipo_accion AS accion, minutos_alimentacion, tipo_dia, id_horario, 
            estado_origen, tolerancia 
        FROM eu_asistencia_general WHERE CAST(fecha_hora_horario AS VARCHAR) BETWEEN $1 || '%' 
            AND ($2::timestamp + '1 DAY') || '%' AND id_empleado = $3 
            AND tipo_accion IN ('E','I/A', 'F/A', 'S') 
        ORDER BY id_empleado, fecha_hora_horario ASC
        `
        , [fec_inicio, fec_final, id_empleado])
        .then(res => {
            return res.rows;
        })
}

// METODO PARA AGRUPAR TIMBRES
const AgruparTimbres = async function agruparTimbresPorClave(timbres: Timbre[]) {
    const timbresAgrupadosFecha: { [key: string]: Timbre[] } = {};
    const timbresAgrupados: any[] = [];

    timbres.forEach((timbre) => {
        const clave = `${timbre.fecha_horario}-${timbre.id_horario}`;
        if (!timbresAgrupadosFecha[clave]) {
            timbresAgrupadosFecha[clave] = [];
        }
        timbresAgrupadosFecha[clave].push(timbre);
    });

    for (let key in timbresAgrupadosFecha) {
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
    fecha_horario: string;
    fecha_hora_horario: string;
    fecha_hora_timbre: string | null;
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

