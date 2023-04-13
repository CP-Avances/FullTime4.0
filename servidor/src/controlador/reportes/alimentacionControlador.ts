import { Request, Response } from 'express';
import pool from '../../database';

class AlimentacionControlador {

    public async ListarPlanificadosConsumidos(req: Request, res: Response) {
        const { fec_inicio, fec_final } = req.body;
        const DATOS = await pool.query('SELECT tc.nombre AS comida_tipo, ctc.tipo_comida AS id_comida, ' +
            'ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, ' +
            '(COUNT(dm.nombre) * dm.valor) AS total ' +
            'FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm, plan_comidas AS pc, ' +
            'plan_comida_empleado AS pce ' +
            'WHERE tc.id = ctc.tipo_comida AND dm.id_menu = ctc.id AND pc.id_comida = dm.id ' +
            'AND pc.extra = false AND pce.consumido = true AND pce.id_plan_comida = pc.id AND ' +
            'pce.fecha BETWEEN $1 AND $2 ' +
            'GROUP BY tc.nombre, ctc.tipo_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion',
            [fec_inicio, fec_final]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarSolicitadosConsumidos(req: Request, res: Response) {
        const { fec_inicio, fec_final } = req.body;
        const DATOS = await pool.query('SELECT tc.nombre AS comida_tipo, ctc.tipo_comida AS id_comida, ' +
            'ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, ' +
            '(COUNT(dm.nombre) * dm.valor) AS total ' +
            'FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm, solicita_comidas AS sc, ' +
            'plan_comida_empleado AS pce ' +
            'WHERE tc.id = ctc.tipo_comida AND dm.id_menu = ctc.id AND sc.id_comida = dm.id ' +
            'AND sc.extra = false AND pce.consumido = true AND sc.fec_comida BETWEEN $1 AND $2 AND ' +
            'pce.id_sol_comida = sc.id ' +
            'GROUP BY tc.nombre, ctc.tipo_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion',
            [fec_inicio, fec_final]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async ListarExtrasPlanConsumidos(req: Request, res: Response) {
        const { fec_inicio, fec_final } = req.body;
        const DATOS = await pool.query('SELECT tc.nombre AS comida_tipo, ctc.tipo_comida AS id_comida, ' +
            'ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, ' +
            '(COUNT(dm.nombre) * dm.valor) AS total ' +
            'FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm, plan_comidas AS pc, ' +
            'plan_comida_empleado AS pce ' +
            'WHERE tc.id = ctc.tipo_comida AND dm.id_menu = ctc.id AND pc.id_comida = dm.id ' +
            'AND pc.extra = true AND pce.consumido = true AND pce.id_plan_comida = pc.id AND ' +
            'pc.fecha BETWEEN $1 AND $2 ' +
            'GROUP BY tc.nombre, ctc.tipo_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion',
            [fec_inicio, fec_final]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async ListarExtrasSolConsumidos(req: Request, res: Response) {
        const { fec_inicio, fec_final } = req.body;
        const DATOS = await pool.query('SELECT tc.nombre AS comida_tipo, ctc.tipo_comida AS id_comida, ' +
            'ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, ' +
            '(COUNT(dm.nombre) * dm.valor) AS total ' +
            'FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm, solicita_comidas AS sc, ' +
            'plan_comida_empleado AS pce ' +
            'WHERE tc.id = ctc.tipo_comida AND dm.id_menu = ctc.id AND sc.id_comida = dm.id ' +
            'AND sc.extra = true AND pce.consumido = true AND sc.fec_comida BETWEEN $1 AND $2 AND ' +
            'pce.id_sol_comida = sc.id ' +
            'GROUP BY tc.nombre, ctc.tipo_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion',
            [fec_inicio, fec_final]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async DetallarPlanificadosConsumidos(req: Request, res: Response) {
        const { fec_inicio, fec_final } = req.body;
        const DATOS = await pool.query('SELECT e.nombre, e.apellido, e.cedula, e.codigo, ' +
            'tc.nombre AS comida_tipo, ctc.tipo_comida AS id_comida, ' +
            'ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, ' +
            '(COUNT(dm.nombre) * dm.valor) AS total ' +
            'FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm, plan_comidas AS pc, ' +
            'empleados AS e, plan_comida_empleado AS pce ' +
            'WHERE tc.id = ctc.tipo_comida AND dm.id_menu = ctc.id AND pc.id_comida = dm.id ' +
            'AND pc.extra = false AND pce.consumido = true AND e.id = pce.id_empleado AND ' +
            'pc.id = pce.id_plan_comida AND pc.fecha BETWEEN $1 AND $2 ' +
            'GROUP BY tc.nombre, ctc.tipo_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion, e.nombre, ' +
            'e.apellido, e.cedula, e.codigo ORDER BY e.apellido ASC',
            [fec_inicio, fec_final]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async DetallarSolicitudConsumidos(req: Request, res: Response) {
        const { fec_inicio, fec_final } = req.body;
        const DATOS = await pool.query('SELECT e.nombre, e.apellido, e.cedula, e.codigo, ' +
            'tc.nombre AS comida_tipo, ctc.tipo_comida AS id_comida, ' +
            'ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, ' +
            '(COUNT(dm.nombre) * dm.valor) AS total ' +
            'FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm, solicita_comidas AS sc, ' +
            'plan_comida_empleado AS pce, empleados AS e ' +
            'WHERE tc.id = ctc.tipo_comida AND dm.id_menu = ctc.id AND sc.id_comida = dm.id ' +
            'AND sc.extra = false AND pce.consumido = true AND e.id = sc.id_empleado AND ' +
            'sc.fec_comida BETWEEN $1 AND $2  AND pce.id_sol_comida = sc.id ' +
            'GROUP BY tc.nombre, ctc.tipo_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion, e.nombre, ' +
            'e.apellido, e.cedula, e.codigo ORDER BY e.apellido ASC',
            [fec_inicio, fec_final]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async DetallarExtrasPlanConsumidos(req: Request, res: Response) {
        const { fec_inicio, fec_final } = req.body;
        const DATOS = await pool.query('SELECT e.nombre, e.apellido, e.cedula, e.codigo, ' +
            'tc.nombre AS comida_tipo, ctc.tipo_comida AS id_comida, ' +
            'ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, ' +
            '(COUNT(dm.nombre) * dm.valor) AS total ' +
            'FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm, plan_comidas AS pc, ' +
            'empleados AS e, plan_comida_empleado AS pce ' +
            'WHERE tc.id = ctc.tipo_comida AND dm.id_menu = ctc.id AND pc.id_comida = dm.id ' +
            'AND pc.extra = true AND pce.consumido = true AND e.id = pce.id_empleado AND ' +
            'pc.id = pce.id_plan_comida AND pc.fecha BETWEEN $1 AND $2 ' +
            'GROUP BY tc.nombre, ctc.tipo_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion, e.nombre, ' +
            'e.apellido, e.cedula, e.codigo ORDER BY e.apellido ASC',
            [fec_inicio, fec_final]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async DetallarExtrasSolConsumidos(req: Request, res: Response) {
        const { fec_inicio, fec_final } = req.body;
        const DATOS = await pool.query('SELECT e.nombre, e.apellido, e.cedula, e.codigo, ' +
            'tc.nombre AS comida_tipo, ctc.tipo_comida AS id_comida, ' +
            'ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, ' +
            '(COUNT(dm.nombre) * dm.valor) AS total ' +
            'FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm, solicita_comidas AS sc, ' +
            'plan_comida_empleado AS pce, empleados AS e ' +
            'WHERE tc.id = ctc.tipo_comida AND dm.id_menu = ctc.id AND sc.id_comida = dm.id ' +
            'AND sc.extra = true AND pce.consumido = true AND e.id = sc.id_empleado AND ' +
            'sc.fec_comida BETWEEN $1 AND $2  AND pce.id_sol_comida = sc.id ' +
            'GROUP BY tc.nombre, ctc.tipo_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion, e.nombre, ' +
            'e.apellido, e.cedula, e.codigo ORDER BY e.apellido ASC',
            [fec_inicio, fec_final]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }


    public async DetallarServiciosInvitados(req: Request, res: Response) {
        const { fec_inicio, fec_final } = req.body;
        const DATOS = await pool.query('SELECT ci.nombre_invitado, ci.apellido_invitado, ci.cedula_invitado, ' +
            'tc.nombre AS comida_tipo, ctc.tipo_comida AS id_comida, ci.ticket, ' +
            'ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, ' +
            '(COUNT(dm.nombre) * dm.valor) AS total ' +
            'FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm, comida_invitados AS ci ' +
            'WHERE tc.id = ctc.tipo_comida AND dm.id_menu = ctc.id AND ci.id_detalle_menu = dm.id ' +
            'AND ci.fecha BETWEEN $1 AND $2 ' +
            'GROUP BY tc.nombre, ctc.tipo_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion, ' +
            'ci.nombre_invitado, ci.apellido_invitado, ci.cedula_invitado, ci.ticket',
            [fec_inicio, fec_final]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

}

export const ALIMENTACION_CONTROLADOR = new AlimentacionControlador();

export default ALIMENTACION_CONTROLADOR;