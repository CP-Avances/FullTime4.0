import { IReporteTimbres } from '../../class/Asistencia';
import { Request, Response } from 'express';
import pool from '../../database';

class ReportesTimbresMrlControlador {

    // METODO DE BUSQUEDA DE TIMBRES EN FORMATO MRL     **USADO
    public async ReporteTimbresMrl(req: Request, res: Response) {
        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        let n: Array<any> = await Promise.all(datos.map(async (obj: any) => {
            obj.empleados = await Promise.all(obj.empleados.map(async (o: any) => {
                o.timbres = await BuscarTimbres(desde, hasta, o.codigo);
                return o;
            }));
            return obj;
        }));

        let nuevo = n.map((e: any) => {
            e.empleados = e.empleados.filter((t: any) => { return t.timbres.length > 0 })
            return e
        }).filter(e => { return e.empleados.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No se han encontrado registros.' })

        return res.status(200).jsonp(nuevo);
    }
}

const REPORTES_TIMBRES_MRL_CONTROLADOR = new ReportesTimbresMrlControlador();

export default REPORTES_TIMBRES_MRL_CONTROLADOR;

// FUNCION DE BUSQUEDA DE TIMBRES    **USADO  
const BuscarTimbres = async function (fec_inicio: string, fec_final: string, codigo: string | number) {
    return await pool.query(
        `
        SELECT CAST(fecha_hora_timbre_validado AS VARCHAR), accion 
        FROM eu_timbres 
        WHERE CAST(fecha_hora_timbre_validado AS VARCHAR) BETWEEN $1 || \'%\' 
            AND ($2::timestamp + \'1 DAY\') || \'%\' AND codigo = $3 AND accion != \'99\' 
        ORDER BY fecha_hora_timbre_validado ASC
        `
        , [fec_inicio, fec_final, codigo])
        .then(res => {
            return res.rows;
        })
}