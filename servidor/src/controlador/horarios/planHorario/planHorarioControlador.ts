import { Request, Response } from 'express';
import pool from '../../../database';

class PlanHorarioControlador {

    // METODO PARA VERIFICAR FECHAS DE HORARIOS
    public async VerificarFechasPlan(req: Request, res: Response): Promise<any> {
        const { fechaInicio, fechaFinal } = req.body;
        const codigo = req.params.codigo;
        const PLAN = await pool.query(
            `
            SELECT * FROM plan_horarios 
            WHERE ($1 BETWEEN fec_inicio AND fec_final OR $2 BETWEEN fec_inicio AND fec_final 
                OR fec_inicio BETWEEN $1 AND $2 OR fec_final BETWEEN $1 AND $2) AND codigo = $3
            `
            , [fechaInicio, fechaFinal, codigo]);
        if (PLAN.rowCount > 0) {
            return res.jsonp(PLAN.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registros no encontrados.' });
        }
    }

    // METODO PARA VERIFICAR FECHAS DE HORARIOS ACTUALIZACION
    public async VerificarFechasPlanEdicion(req: Request, res: Response): Promise<any> {
        const id = req.params.id;
        const { codigo } = req.params;
        const { fechaInicio, fechaFinal } = req.body;
        const PLAN = await pool.query(
            `
            SELECT * FROM plan_horarios 
            WHERE NOT id=$3 AND ($1 BETWEEN fec_inicio AND fec_final OR $2 BETWEEN fec_inicio AND fec_final
                OR fec_inicio BETWEEN $1 AND $2 OR fec_final BETWEEN $1 AND $2) AND codigo = $4
            `
            , [fechaInicio, fechaFinal, id, codigo]);
        if (PLAN.rowCount > 0) {
            return res.jsonp(PLAN.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registros no encontrados.' });
        }
    }









    public async ListarPlanHorario(req: Request, res: Response) {
        const HORARIO = await pool.query('SELECT * FROM plan_horarios');
        if (HORARIO.rowCount > 0) {
            return res.jsonp(HORARIO.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async CrearPlanHorario(req: Request, res: Response): Promise<void> {
        const { id_cargo, fec_inicio, fec_final, codigo } = req.body;
        await pool.query('INSERT INTO plan_horarios ( id_cargo, fec_inicio, fec_final, codigo ) VALUES ($1, $2, $3, $4)', [id_cargo, fec_inicio, fec_final, codigo]);
        res.jsonp({ message: 'Plan Horario Registrado' });
    }

    public async EncontrarIdPlanHorario(req: Request, res: Response): Promise<any> {
        const { id_empleado } = req.params;
        const HORARIO = await pool.query('SELECT ph.id FROM plan_horarios AS ph, empl_cargos AS ecargo, empl_contratos AS contratoe, empleados AS e WHERE ph.id_cargo = ecargo.id AND ecargo.id_empl_contrato = contratoe.id AND contratoe.id_empleado = e.id AND e.id = $1', [id_empleado]);
        if (HORARIO.rowCount > 0) {
            return res.jsonp(HORARIO.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registro no encontrado' });
        }
    }

   /* SE ELIMINA TABAL
    public async BuscarHorarioRotativoCodigo(req: Request, res: Response): Promise<any> {
        const { codigo } = req.params;
        console.log('CODIGO .. ', codigo)
        const HORARIO = await pool.query(
            `
            SELECT * FROM plan_horarios AS p WHERE p.codigo = $1
            `
            , [codigo]);
        console.log('data .. ', HORARIO)
        if (HORARIO.rowCount > 0) {
            return res.jsonp(HORARIO.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registro no encontrado' });
        }
    }
*/
    public async EncontrarPlanHorarioPorId(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        const HORARIO_CARGO = await pool.query('SELECT * FROM plan_horarios AS p WHERE p.id = $1', [id]);
        if (HORARIO_CARGO.rowCount > 0) {
            return res.jsonp(HORARIO_CARGO.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registro no encontrado' });
        }
    }

    public async ActualizarPlanHorario(req: Request, res: Response): Promise<void> {
        const { id_cargo, fec_inicio, fec_final, id } = req.body;
        await pool.query('UPDATE plan_horarios SET id_cargo = $1, fec_inicio = $2, fec_final = $3 WHERE id = $4', [id_cargo, fec_inicio, fec_final, id]);
        res.jsonp({ message: 'Registro Actualizado' + id, });
    }

    public async EliminarRegistros(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        await pool.query('DELETE FROM plan_horarios WHERE id = $1', [id]);
        res.jsonp({ message: 'Registro eliminado.' });
    }

    public async ObtenerPlanificacionEmpleadoFechas(req: Request, res: Response): Promise<any> {
        const { id_empleado } = req.params;
        const { fechaInicio, fechaFinal } = req.body;
        const PLAN = await pool.query('SELECT * FROM datos_empleado_cargo AS dec INNER JOIN ' +
            '(SELECT ph.id AS id_plan, ph.id_cargo, ph.fec_inicio, ph.fec_final, ' +
            'phd.id AS id_detalle_plan, phd.fecha AS fecha_dia, phd.tipo_dia ' +
            'FROM plan_horarios AS ph, plan_hora_detalles AS phd ' +
            'WHERE phd.id_plan_horario = ph.id) AS ph ON ' +
            'dec.cargo_id = ph.id_cargo AND dec.codigo = $1 ' +
            'AND ph.fecha_dia BETWEEN $2 AND $3', [id_empleado, fechaInicio, fechaFinal]);
        if (PLAN.rowCount > 0) {
            return res.jsonp(PLAN.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registros no encontrados' });
        }
    }





}

export const PLAN_HORARIO_CONTROLADOR = new PlanHorarioControlador();

export default PLAN_HORARIO_CONTROLADOR;