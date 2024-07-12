import { Request, Response } from 'express';
import pool from '../../database';

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
                AND ec.id = (SELECT MAX(cargo_id) FROM datos_empleado_cargo WHERE codigo = $1) 
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


}

export const REPORTES_CONTROLADOR = new ReportesControlador();

export default REPORTES_CONTROLADOR;

