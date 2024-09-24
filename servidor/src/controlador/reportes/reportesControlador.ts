import { Request, Response } from 'express';
import pool from '../../database';
import { QueryResult } from 'pg';

class ReportesControlador {


    public async ListarEntradaSalidaEmpleado(req: Request, res: Response) {
        // id_empleado hace referencia al código del empleado
        const { id_empleado } = req.params;
        const { fechaInicio, fechaFinal } = req.body;
        const DATOS = await pool.query(
            `
            SELECT * FROM TimbresEntrada AS te 
            INNER JOIN TimbresSalida AS ts
                ON te.id_empleado = ts.id_empleado AND te.fecha_inicio::date = ts.fecha_fin::date AND 
                te.id_empleado = $1 AND te.fecha_inicio::date BETWEEN $2 AND $3
            `
            , [id_empleado, fechaInicio, fechaFinal]);
        if (DATOS.rowCount != 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async ListarPedidosEmpleado(req: Request, res: Response) {
        const { id_usua_solicita } = req.params;
        const { fechaInicio, fechaFinal } = req.body;
        const DATOS = await pool.query(
            `
            SELECT * FROM mhe_solicitud_hora_extra 
            WHERE id_empleado_solicita = $1 AND fecha_inicio::date BETWEEN $2 AND $3
            `
            , [id_usua_solicita, fechaInicio, fechaFinal]);
        if (DATOS.rowCount != 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async ListarEntradaSalidaTodos(req: Request, res: Response) {
        const { fechaInicio, fechaFinal } = req.body;
        const DATOS = await pool.query(
            `
            SELECT * FROM TimbresEntrada AS te 
            INNER JOIN TimbresSalida AS ts ON te.id_empleado = ts.id_empleado 
                AND te.fecha_inicio::date = ts.fecha_fin::date 
                AND te.fecha_inicio::date BETWEEN $1 AND $2
            `
            , [fechaInicio, fechaFinal]);
        if (DATOS.rowCount != 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async ListarPedidosTodos(req: Request, res: Response) {
        const { fechaInicio, fechaFinal } = req.body;
        const DATOS = await pool.query(
            `
            SELECT * FROM mhe_solicitud_hora_extra WHERE fecha_inicio::date BETWEEN $1 AND $2
            `
            , [fechaInicio, fechaFinal]);
        if (DATOS.rowCount != 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }


    ////FIN CAMBIO DE LISTAR TIMBRES

    public async ListarPermisoHorarioEmpleado(req: Request, res: Response) {
        const { codigo } = req.params;
        const DATOS = await pool.query(
            `
            SELECT cp.descripcion AS tipo, p.id, p.descripcion, p.fecha_creacion, p.fecha_inicio, p.fecha_final, 
                p.dias_permiso, p.horas_permiso, p.numero_permiso, p.id_empleado, a.estado, a.id_autoriza_estado, 
                ec.hora_trabaja, ec.id AS id_cargo 
            FROM mp_solicitud_permiso AS p, mp_cat_tipo_permisos AS cp, ecm_autorizaciones AS a, 
                eu_empleado_cargos AS ec, eu_empleados AS e
            WHERE cp.id = p.id_tipo_permiso AND a.id_permiso = p.id 
                AND ec.id = (SELECT MAX(cv.id_cargo) FROM contrato_cargo_vigente AS cv, eu_empleados AS e 
                WHERE e.id = cv.id_empleado AND e.codigo = $1) 
                AND p.id_empleado = e.id AND e.codigo = $1
            ORDER BY p.numero_permiso ASC
            `
            , [codigo]);

        if (DATOS.rowCount != 0) {
            DATOS.rows.map((obj: any) => {
                if (obj.id_autoriza_estado != null && obj.id_autoriza_estado != '' && obj.estado != 1) {
                    var autorizaciones = obj.id_autoriza_estado.split(',');
                    let empleado_id = autorizaciones[autorizaciones.length - 2].split('_')[0];
                    obj.autoriza = parseInt(empleado_id);
                }
                if (obj.estado === 1) {
                    obj.estado = 'Pendiente';
                }
                else if (obj.estado === 2) {
                    obj.estado = 'Pre-autorizado';
                }
                else if (obj.estado === 3) {
                    obj.estado = 'Autorizado';
                }
                else if (obj.estado === 4) {
                    obj.estado = 'Negado';
                }
            });
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async getInfoReporteTimbres(req: Request, res: Response): Promise<Response> {
        try {
            const { codigo, fec_inicio, fec_final } = req.query;
            const response: QueryResult = await pool.query(
                `
                SELECT t.*, CAST(t.fecha_hora_timbre AS VARCHAR) AS stimbre, 
                    CAST(t.fecha_hora_timbre_servidor AS VARCHAR) AS stimbre_servidor,
                    CAST(t.fecha_hora_timbre_validado AS VARCHAR) AS stimbre_valido
                FROM eu_timbres AS t 
                WHERE codigo = $3 AND fecha_hora_timbre_valido BETWEEN $1 AND $2 
                ORDER BY fecha_hora_timbre_valido DESC LIMIT 100
                `
                , [fec_inicio, fec_final, codigo]);
            const timbres: any[] = response.rows;
            // console.log(timbres);
            if (timbres.length === 0) return res.status(400).jsonp({ message: 'No hay timbres resgistrados' })

            return res.status(200).jsonp(timbres);
        } catch (error) {
            console.log(error);
            return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
        }
    };

    public async getInfoReporteTimbresNovedad(req: Request, res: Response) {
        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        console.log("ver req.body", req.body)
        let n: Array<any> = await Promise.all(datos.map(async (obj: any) => {
            obj.empleados = await Promise.all(obj.empleados.map(async (o: any) => {
                o.timbres = await BuscarTimbresConNovedades(desde, hasta, o.codigo, false );
                console.log('Timbres: ', o);
                return o;
            }));
            return obj;
        }));
        let nuevo = n.map((e: any) => {
            e.empleados = e.empleados.filter((t: any) => { return t.timbres.length > 0 })
            return e
        }).filter(e => { return e.empleados.length > 0 })
        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No hay timbres con novedad en ese periodo.' })
        return res.status(200).jsonp(nuevo)
    }
}

const BuscarTimbresConNovedades = async function (fec_inicio: string, fec_final: string, codigo: string | number, conexion: any) {
    return await pool.query(
         `SELECT id, codigo, id_reloj, accion, tecla_funcion, observacion, 
         ubicacion, latitud, longitud, hora_timbre_diferente, dispositivo_timbre, tipo_autenticacion, 
         conexion, novedades_conexion, CAST(fecha_hora_timbre_validado AS VARCHAR),
         CAST(fecha_subida_servidor AS VARCHAR), CAST(fecha_hora_timbre AS VARCHAR)  
         FROM eu_timbres WHERE CAST(fecha_hora_timbre_validado AS VARCHAR) BETWEEN $1 || '%' 
            AND ($2::timestamp + '1 DAY') || '%'  AND codigo = $3 AND conexion = 'false' ORDER BY fecha_hora_timbre_validado ASC`
        , [fec_inicio, fec_final, codigo])
        .then(res => {
            return res.rows;
        })
}


const BuscarTimbres = async function (fec_inicio: string, fec_final: string, codigo: string | number) {
    return await pool.query(
        `
        SELECT CAST(fecha_hora_timbre AS VARCHAR), id_reloj, accion, observacion, 
            latitud, longitud, CAST(fecha_hora_timbre_servidor AS VARCHAR),
            CAST(fecha_hora_timbre_validado AS VARCHAR)
        FROM eu_timbres WHERE CAST(fecha_hora_timbre_validado AS VARCHAR) BETWEEN $1 || '%' 
            AND ($2::timestamp + '1 DAY') || '%' AND codigo = $3 
        ORDER BY fecha_hora_timbre_validado ASC
        `
        , [fec_inicio, fec_final, codigo])
        .then(res => {
            return res.rows;
        })
}

export const REPORTES_CONTROLADOR = new ReportesControlador();

export default REPORTES_CONTROLADOR;

