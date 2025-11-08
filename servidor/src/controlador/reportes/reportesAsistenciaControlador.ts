import { Request, Response } from 'express';
import pool from '../../database';

class ReportesAsistenciaControlador {

    // METODO PARA CONSULTAR LISTA DE TIMBRES DEL USUARIO    **USADO     
    public async ReporteTimbresMultiple(req: Request, res: Response) {
        console.log("ENTRA A METODO PARA CONSULTAR ")
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

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No hay timbres en ese periodo.' })

        return res.status(200).jsonp(nuevo)

    }

    // METODO DE BUSQUEDA DE TIMBRES DE TIMBRE VIRTUAL      **USADO        
    public async ReporteTimbreSistema(req: Request, res: Response) {
        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        let n: Array<any> = await Promise.all(datos.map(async (obj: any) => {
            obj.empleados = await Promise.all(obj.empleados.map(async (o: any) => {
                o.timbres = await BuscarTimbreSistemas(desde, hasta, o.codigo);
                return o;
            }));
            return obj;
        }));

        let nuevo = n.map((e: any) => {
            e.empleados = e.empleados.filter((t: any) => { return t.timbres.length > 0 })
            return e;
        }).filter(e => { return e.empleados.length > 0 });

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No hay timbres en ese periodo.' });

        return res.status(200).jsonp(nuevo);
    }

    // METODO DE BUSQUEDA DE TIMBRES DEL RELOJ VIRTUAL    **USADO    
    public async ReporteTimbreRelojVirtual(req: Request, res: Response) {
        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        let n: Array<any> = await Promise.all(datos.map(async (obj: any) => {
            obj.empleados = await Promise.all(obj.empleados.map(async (o: any) => {
                o.timbres = await BuscarTimbreRelojVirtual(desde, hasta, o.codigo);
                return o;
            }));
            return obj;
        }));

        let nuevo = n.map((e: any) => {
            e.empleados = e.empleados.filter((t: any) => { return t.timbres.length > 0 });
            return e;
        }).filter(e => { return e.empleados.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No hay timbres en ese periodo.' });

        return res.status(200).jsonp(nuevo);
    }

    // METODO DE BUSQUEDA DE TIMBRES HORARIO ABIERTO    **USADO    
    public async ReporteTimbreHorarioAbierto(req: Request, res: Response) {
        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        let n: Array<any> = await Promise.all(datos.map(async (obj: any) => {
            obj.empleados = await Promise.all(obj.empleados.map(async (o: any) => {
                o.timbres = await BuscarTimbreHorarioAbierto(desde, hasta, o.codigo);
                return o;
            }));
            return obj;
        }));

        let nuevo = n.map((e: any) => {
            e.empleados = e.empleados.filter((t: any) => { return t.timbres.length > 0 });
            return e;
        }).filter(e => { return e.empleados.length > 0 });

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No hay timbres en ese periodo.' });

        return res.status(200).jsonp(nuevo);
    }

    // METODO DE BUSQUEDA DE TIMBRES INCOMPLETOS      **USADO   
    public async ReporteTimbresIncompletos(req: Request, res: Response) {
        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        let n: Array<any> = await Promise.all(datos.map(async (obj: any) => {
            obj.empleados = await Promise.all(obj.empleados.map(async (o: any) => {
                o.timbres = await BuscarTimbresIncompletos(desde, hasta, o.id);
                return o;
            }));
            return obj;
        }));

        let nuevo = n.map((e: any) => {
            e.empleados = e.empleados.filter((t: any) => { return t.timbres.length > 0 })
            return e
        }).filter(e => { return e.empleados.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No hay timbres incompletos en ese periodo.' });

        return res.status(200).jsonp(nuevo);
    }
}

const REPORTE_A_CONTROLADOR = new ReportesAsistenciaControlador();

export default REPORTE_A_CONTROLADOR;

// FUNCION DE BUSQUEDA DE TIMBRES     **USADO
const BuscarTimbres = async function (fec_inicio: string, fec_final: string, codigo: string | number) {
    return await pool.query(
        `
        SELECT CAST(fecha_hora_timbre AS VARCHAR), id_reloj, accion, observacion, 
            latitud, longitud, CAST(fecha_hora_timbre_servidor AS VARCHAR),
            CAST(fecha_hora_timbre_validado AS VARCHAR), zona_horaria_dispositivo, zona_horaria_servidor,
            formato_gmt_servidor, formato_gmt_dispositivo, hora_timbre_diferente
        FROM eu_timbres WHERE CAST(fecha_hora_timbre_validado AS VARCHAR) BETWEEN $1 || '%' 
            AND ($2::timestamp + '1 DAY') || '%' AND codigo = $3 
        ORDER BY fecha_hora_timbre_validado ASC
        `
        , [fec_inicio, fec_final, codigo])
        .then(res => {
            return res.rows;
        })
}

// FUNCION PARA BUSQUEDA DE TIMBRES INCOMPLETOS    **USADO
const BuscarTimbresIncompletos = async function (fec_inicio: string, fec_final: string, id_empleado: string | number) {
    return await pool.query(
        `
        SELECT CAST(fecha_hora_horario AS VARCHAR), id_empleado, estado_timbre, tipo_accion AS accion, tipo_dia, estado_origen
        FROM eu_asistencia_general WHERE CAST(fecha_hora_horario AS VARCHAR) BETWEEN $1 || '%' 
            AND ($2::timestamp + '1 DAY') || '%' AND id_empleado = $3 
            AND fecha_hora_timbre IS null AND estado_origen IN ('N','HL', 'HFD') 
        ORDER BY fecha_hora_horario ASC
        `
        , [fec_inicio, fec_final, id_empleado])
        .then(res => {
            return res.rows;
        })
}

// CONSULTA TIMBRES REALIZADOS EN EL SISTEMA CODIGO 98     **USADO
const BuscarTimbreSistemas = async function (fec_inicio: string, fec_final: string, codigo: string | number) {
    return await pool.query(
        `
        SELECT CAST(fecha_hora_timbre AS VARCHAR), id_reloj, accion, observacion, 
            latitud, longitud, CAST(fecha_hora_timbre_servidor AS VARCHAR), 
            CAST(fecha_hora_timbre_validado AS VARCHAR) 
        FROM eu_timbres WHERE CAST(fecha_hora_timbre_validado AS VARCHAR) BETWEEN $1 || '%' 
            AND ($2::timestamp + '1 DAY') || '%' AND codigo = $3 AND id_reloj = '98' 
            AND NOT accion = 'HA'
        ORDER BY fecha_hora_timbre_validado ASC
        `
        , [fec_inicio, fec_final, codigo])
        .then(res => {
            return res.rows;
        })
}

// CONSULTA TIMBRES REALIZADOS EN EL RELOJ VIRTUAL CODIGO 97   **USADO
const BuscarTimbreRelojVirtual = async function (fec_inicio: string, fec_final: string, codigo: string | number) {
    return await pool.query(
        `
        SELECT CAST(fecha_hora_timbre AS VARCHAR), id_reloj, accion, observacion, 
            latitud, longitud, CAST(fecha_hora_timbre_servidor AS VARCHAR),
            CAST(fecha_hora_timbre_validado AS VARCHAR) 
        FROM eu_timbres WHERE CAST(fecha_hora_timbre_validado AS VARCHAR) BETWEEN $1 || \'%\' 
            AND ($2::timestamp + \'1 DAY\') || \'%\' AND codigo = $3 AND id_reloj = \'97\' 
            AND NOT accion = \'HA\' 
        ORDER BY fecha_hora_timbre_validado ASC
        `
        , [fec_inicio, fec_final, codigo])
        .then(res => {
            return res.rows;
        })
}

// CONSULTA TIMBRES REALIZADOS EN HORARIO ABIERTO      **USADO
const BuscarTimbreHorarioAbierto = async function (fec_inicio: string, fec_final: string, codigo: string | number) {
    return await pool.query(
        `
        SELECT CAST(fecha_hora_timbre AS VARCHAR), id_reloj, accion, observacion, 
            latitud, longitud, CAST(fecha_hora_timbre_servidor AS VARCHAR),
            CAST(fecha_hora_timbre_validado AS VARCHAR) 
        FROM eu_timbres WHERE CAST(fecha_hora_timbre_validado AS VARCHAR) BETWEEN $1 || '%' 
            AND ($2::timestamp + '1 DAY') || '%' AND codigo = $3 AND accion = 'HA' 
        ORDER BY fecha_hora_timbre_validado ASC
        `
        , [fec_inicio, fec_final, codigo])
        .then(res => {
            return res.rows;
        })
}