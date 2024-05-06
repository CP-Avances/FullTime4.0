import { Request, Response } from 'express';
import pool from '../../database';

class ReportesControlador {

    // -- poner en consulta el estado del usuario
    public async ListarDatosContractoA(req: Request, res: Response) {
        const DATOS = await pool.query(
            `
            SELECT * FROM datos_contrato_actual
            `
        );
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    public async ListarDatosCargoA(req: Request, res: Response) {
        const { empleado_id } = req.params;
        const DATOS = await pool.query(
            `
            SELECT * FROM datosCargoActual ($1)
            `
            , [empleado_id]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

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
        if (DATOS.rowCount > 0) {
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
        if (DATOS.rowCount > 0) {
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
        if (DATOS.rowCount > 0) {
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
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    ////PLANIFICACION DE EMPLEADO CON FECHAS
    public async BuscarPlan(req: Request, res: Response) {
        const { codigo } = req.params;
        const { fechaInicio, fechaFinal } = req.body;
        const FECHAS = await pool.query(
            `
            SELECT pg.id, pg.codigo, pg.id_empleado_cargo, pg.id_detalle_horario, pg.fecha_horario, pg.fecha_hora_horario, 
                pg.tipo_accion, pg.fecha_hora_timbre, pg.id_horario
            FROM eu_asistencia_general pg 
            WHERE pg.codigo = $3 AND (pg.fecha_hora_horario::date BETWEEN $1 AND $2 ) 
            ORDER BY fecha_hora_horario
            `
            , [fechaInicio, fechaFinal, codigo]);
        console.log("m: ", (FECHAS.rows));
        if (FECHAS.rowCount > 0) {
            return res.jsonp(FECHAS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }
    //// FIN PLANIFICACION DE EMPLEADO CON FECHAS

    ////CAMBIO DE LISTAR TIMBRES COMENTAR METODO ANTIGUO
    public async ListarTimbres(req: Request, res: Response) {
        const { id_empleado } = req.params;
        const { fechaInicio, fechaFinal } = req.body;
        const DATOS = await pool.query(
            `
            SELECT t.fecha_hora_timbre,t.accion, t.tecla_funcion, t.observacion, t.latitud, t.longitud, t.id, 
                t.codigo, t.id_reloj, t.hora_timbre_diferente, t.fecha_hora_timbre_servidor, t.dispositivo_timbre, 
                t.tipo_autenticacion 
            FROM eu_timbres t 
            WHERE t.codigo = $1 AND NOT accion = \'HA\' AND t.fecha_hora_timbre::date BETWEEN $2 AND $3 
            GROUP BY t.fecha_hora_timbre,t.accion, t.tecla_funcion, t.observacion, t.latitud, t.longitud, t.id, 
                t.codigo, t.id_reloj, t.hora_timbre_diferente, t.fecha_hora_timbre_servidor, t.dispositivo_timbre, 
                t.tipo_autenticacion 
            ORDER BY t.fecha_hora_timbre ASC
            `
            , [id_empleado, fechaInicio, fechaFinal]);
        console.log("LT RepCont: ", (DATOS.rows));
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows);
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
                p.dias_permiso, p.horas_permiso, p.numero_permiso, p.codigo, a.estado, a.id_autoriza_estado, 
                ec.hora_trabaja, ec.id AS id_cargo 
            FROM mp_solicitud_permiso AS p, mp_cat_tipo_permisos AS cp, ecm_autorizaciones AS a, eu_empleado_cargos AS ec 
            WHERE cp.id = p.id_tipo_permiso AND a.id_permiso = p.id 
                AND ec.id = (SELECT MAX(cargo_id) FROM datos_empleado_cargo WHERE codigo = $1) 
                AND p.codigo = $1 
            ORDER BY p.numero_permiso ASC
            `
            , [codigo]);

        if (DATOS.rowCount > 0) {
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


    public async ListarPermisoHorarioEmpleadoFechas(req: Request, res: Response) {
        const { codigo } = req.params;
        const { fechaInicio, fechaFinal } = req.body;
        const DATOS = await pool.query(
            `
            SELECT cp.descripcion AS tipo, p.id, p.descripcion, p.fecha_creacion, p.fecha_inicio, p.fecha_final, 
                p.dias_permiso, p.horas_permiso, p.numero_permiso, p.codigo, a.estado, a.id_autoriza_estado, 
                ec.hora_trabaja, ec.id AS id_cargo 
            FROM mp_solicitud_permiso AS p, mp_cat_tipo_permisos AS cp, ecm_autorizaciones AS a, eu_empleado_cargos AS ec 
            WHERE cp.id = p.id_tipo_permiso AND a.id_permiso = p.id 
                AND ec.id = (SELECT MAX(cargo_id) FROM datos_empleado_cargo WHERE codigo = $1) 
                AND p.fecha_inicio::date BETWEEN $2 AND $3 AND p.codigo = $1 
            ORDER BY p.numero_permiso ASC
            `
            , [codigo, fechaInicio, fechaFinal]);


        if (DATOS.rowCount > 0) {
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

    public async ListarPermisoAutorizaEmpleado(req: Request, res: Response) {
        const { id_empleado } = req.params;
        const DATOS = await pool.query(
            `
            SELECT a.id AS id_autoriza, a.estado, a.id_permiso,
                a.id_autoriza_estado AS empleado_estado, p.id_empl_contrato, contrato.id_empleado 
            FROM ecm_autorizaciones AS a, mp_solicitud_permiso AS p, eu_empleado_contratos AS contrato, eu_empleados AS e 
            WHERE a.id_permiso = p.id AND p.id_empleado_contrato = contrato.id AND contrato.id_empleado = e.id AND e.id = $1
            `
            , [id_empleado]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

}

export const REPORTES_CONTROLADOR = new ReportesControlador();

export default REPORTES_CONTROLADOR;

