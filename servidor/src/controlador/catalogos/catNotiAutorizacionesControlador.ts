import { Request, Response } from 'express';
import pool from '../../database';

class NotificacionesAutorizacionesControlador {

    public async ListarNotiAutorizaciones(req: Request, res: Response) {
        const NOTI_AUTORIZACIONES = await pool.query('SELECT * FROM cg_noti_autorizaciones');
        if (NOTI_AUTORIZACIONES.rowCount > 0) {
        return res.jsonp(NOTI_AUTORIZACIONES.rows)
        }
        else {
        return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarPorNotificacion(req: Request, res: Response) {
        const id = req.params.id_notificacion
        const NOTI_AUTORIZACIONES = await pool.query('SELECT n.id, n.orden, n.id_empl_cargo, ec.cargo, e.nombre, e.apellido FROM cg_noti_autorizaciones AS n, empl_cargos AS ec, empl_contratos AS c, empleados AS e WHERE n.id_notificacion = $1 AND ec.id = n.id_empl_cargo AND ec.id_empl_contrato = c.id AND c.id_empleado = e.id ',[id]);
        if (NOTI_AUTORIZACIONES.rowCount > 0) {
        return res.jsonp(NOTI_AUTORIZACIONES.rows)
        }
        else {
        return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ObtenerUnaNotiAutorizacion(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        const NOTI_AUTORIZACIONES = await pool.query('SELECT * FROM cg_noti_autorizaciones WHERE id = $1', [id]);
        if (NOTI_AUTORIZACIONES.rowCount > 0) {
        return res.jsonp(NOTI_AUTORIZACIONES.rows)
        }
        else {
        return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async CrearNotiAutorizacion(req: Request, res: Response): Promise<void> {
        const { id_notificacion, id_empl_cargo, orden} = req.body;
        await pool.query('INSERT INTO cg_noti_autorizaciones ( id_notificacion, id_empl_cargo, orden ) VALUES ($1, $2, $3)', [id_notificacion, id_empl_cargo, orden]);
        res.jsonp({ message: 'Hora extra guardada' });
    }

}

export const notificacionesAutorizacionesControlador = new NotificacionesAutorizacionesControlador();

export default notificacionesAutorizacionesControlador;