import { Request, Response } from 'express';
import pool from '../../database';

class NotificacionesControlador {

    public async ListarPermisosEnviados(req: Request, res: Response) {
        const { envia } = req.params;
        const DATOS = await pool.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
            'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_permiso, e.nombre, e.apellido, e.cedula, ' +
            'ctp.descripcion AS permiso, p.fec_inicio, p.fec_final ' +
            'FROM realtime_noti AS rn, empleados AS e, permisos AS p, cg_tipo_permisos AS ctp ' +
            'WHERE id_permiso IS NOT null AND e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND ' +
            'p.id = rn.id_permiso AND p.id_tipo_permiso = ctp.id ORDER BY rn.id DESC',
            [envia]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarPermisosRecibidos(req: Request, res: Response) {
        const { recibe } = req.params;
        const DATOS = await pool.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
            'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_permiso, e.nombre, e.apellido, e.cedula, ' +
            'ctp.descripcion AS permiso, p.fec_inicio, p.fec_final ' +
            'FROM realtime_noti AS rn, empleados AS e, permisos AS p, cg_tipo_permisos AS ctp ' +
            'WHERE id_permiso IS NOT null AND e.id = rn.id_send_empl AND rn.id_receives_empl = $1 AND ' +
            'p.id = rn.id_permiso AND p.id_tipo_permiso = ctp.id ORDER BY rn.id DESC',
            [recibe]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarSolicitudHoraExtraEnviadas(req: Request, res: Response) {
        const { envia } = req.params;
        const DATOS = await pool.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
            'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_hora_extra, e.nombre, e.apellido, e.cedula, ' +
            'h.fec_inicio, h.fec_final, h.descripcion, h.num_hora, h.tiempo_autorizado ' +
            'FROM realtime_noti AS rn, empleados AS e, hora_extr_pedidos AS h ' +
            'WHERE rn.id_hora_extra IS NOT null AND e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND ' +
            'h.id = rn.id_hora_extra ORDER BY rn.id DESC',
            [envia]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }


    public async ListarSolicitudHoraExtraRecibidas(req: Request, res: Response) {
        const { recibe } = req.params;
        const DATOS = await pool.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
            'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_hora_extra, e.nombre, e.apellido, e.cedula, ' +
            'h.fec_inicio, h.fec_final, h.descripcion, h.num_hora, h.tiempo_autorizado ' +
            'FROM realtime_noti AS rn, empleados AS e, hora_extr_pedidos AS h ' +
            'WHERE rn.id_hora_extra IS NOT null AND e.id = rn.id_send_empl AND rn.id_receives_empl = $1 AND ' +
            'h.id = rn.id_hora_extra ORDER BY rn.id DESC',
            [recibe]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarVacacionesEnviadas(req: Request, res: Response) {
        const { envia } = req.params;
        const DATOS = await pool.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
            'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_vacaciones, e.nombre, e.apellido, e.cedula, ' +
            'v.fec_inicio, v.fec_final, v.fec_ingreso ' +
            'FROM realtime_noti AS rn, empleados AS e, vacaciones AS v ' +
            'WHERE rn.id_vacaciones IS NOT null AND e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND ' +
            'v.id = rn.id_vacaciones ORDER BY rn.id DESC',
            [envia]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarVacacionesRecibidas(req: Request, res: Response) {
        const { recibe } = req.params;
        const DATOS = await pool.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
            'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_vacaciones, e.nombre, e.apellido, e.cedula, ' +
            'v.fec_inicio, v.fec_final, v.fec_ingreso ' +
            'FROM realtime_noti AS rn, empleados AS e, vacaciones AS v ' +
            'WHERE rn.id_vacaciones IS NOT null AND e.id = rn.id_send_empl AND rn.id_receives_empl = $1 AND ' +
            'v.id = rn.id_vacaciones ORDER BY rn.id DESC',
            [recibe]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarPlanificaComidaEnviadas(req: Request, res: Response) {
        const { envia } = req.params;
        const DATOS = await pool.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
            'rn.create_at, e.nombre, e.apellido, e.cedula, ' +
            'rn.descripcion ' +
            'FROM realtime_timbres AS rn, empleados AS e ' +
            'WHERE e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND rn.descripcion like \'Alimentación Planificada%\' ' +
            'ORDER BY rn.id DESC',
            [envia]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarPlanificacionesEliminadas(req: Request, res: Response) {
        const { envia } = req.params;
        const DATOS = await pool.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
            'rn.create_at, e.nombre, e.apellido, e.cedula, ' +
            'rn.descripcion ' +
            'FROM realtime_timbres AS rn, empleados AS e ' +
            'WHERE e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND rn.descripcion like \'Planificación de Alimentación Eliminada.\' ' +
            'ORDER BY rn.id DESC',
            [envia]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    // LISTAR USUARIOS
    public async ListarUsuariosPermisosEnviados(req: Request, res: Response) {
        const { envia } = req.params;
        const DATOS = await pool.query('SELECT DISTINCT rn.id_receives_empl AS id_empleado, rn.id_send_empl, ' +
            'e.nombre, e.apellido, e.cedula ' +
            'FROM realtime_noti AS rn, empleados AS e ' +
            'WHERE id_permiso IS NOT null AND e.id = rn.id_receives_empl AND rn.id_send_empl = $1 ' +
            'ORDER BY e.nombre ASC',
            [envia]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarUsuariosPermisosRecibidos(req: Request, res: Response) {
        const { recibe } = req.params;
        const DATOS = await pool.query('SELECT DISTINCT rn.id_send_empl AS id_empleado, rn.id_receives_empl, ' +
            'e.nombre, e.apellido, e.cedula ' +
            'FROM realtime_noti AS rn, empleados AS e ' +
            'WHERE id_permiso IS NOT null AND e.id = rn.id_send_empl AND rn.id_receives_empl = $1 ' +
            'ORDER BY e.nombre ASC',
            [recibe]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarUsuariosExtrasEnviados(req: Request, res: Response) {
        const { envia } = req.params;
        const DATOS = await pool.query('SELECT DISTINCT rn.id_receives_empl AS id_empleado, rn.id_send_empl, ' +
            'e.nombre, e.apellido, e.cedula ' +
            'FROM realtime_noti AS rn, empleados AS e ' +
            'WHERE rn.id_hora_extra IS NOT null AND e.id = rn.id_receives_empl AND rn.id_send_empl = $1 ' +
            'ORDER BY e.nombre ASC',
            [envia]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarUsuariosExtrasRecibidos(req: Request, res: Response) {
        const { recibe } = req.params;
        const DATOS = await pool.query('SELECT DISTINCT rn.id_send_empl AS id_empleado, rn.id_receives_empl, ' +
            'e.nombre, e.apellido, e.cedula ' +
            'FROM realtime_noti AS rn, empleados AS e ' +
            'WHERE rn.id_hora_extra IS NOT null AND e.id = rn.id_send_empl AND rn.id_receives_empl = $1 ' +
            'ORDER BY e.nombre ASC',
            [recibe]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarUsuariosVacacionesEnviadas(req: Request, res: Response) {
        const { envia } = req.params;
        const DATOS = await pool.query('SELECT DISTINCT rn.id_receives_empl AS id_empleado, rn.id_send_empl, ' +
            'e.nombre, e.apellido, e.cedula ' +
            'FROM realtime_noti AS rn, empleados AS e ' +
            'WHERE rn.id_vacaciones IS NOT null AND e.id = rn.id_receives_empl AND rn.id_send_empl = $1 ' +
            'ORDER BY e.nombre ASC',
            [envia]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarUsuariosVacacionesRecibidas(req: Request, res: Response) {
        const { recibe } = req.params;
        const DATOS = await pool.query('SELECT DISTINCT rn.id_send_empl AS id_empleado, rn.id_receives_empl, ' +
            'e.nombre, e.apellido, e.cedula ' +
            'FROM realtime_noti AS rn, empleados AS e ' +
            'WHERE rn.id_vacaciones IS NOT null AND e.id = rn.id_send_empl AND rn.id_receives_empl = $1 ' +
            'ORDER BY e.nombre ASC',
            [recibe]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarUsuariosComidasEnviadas(req: Request, res: Response) {
        const { envia } = req.params;
        const DATOS = await pool.query('SELECT DISTINCT rn.id_receives_empl AS id_empleado, rn.id_send_empl, ' +
            'e.nombre, e.apellido, e.cedula ' +
            'FROM realtime_timbres AS rn, empleados AS e ' +
            'WHERE e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND rn.descripcion like \'Alimentación Planificada%\' ' +
            'ORDER BY e.nombre ASC',
            [envia]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarUsuariosComidasRecibidas(req: Request, res: Response) {
        const { recibe } = req.params;
        const DATOS = await pool.query('SELECT DISTINCT rn.id_send_empl AS id_empleado, rn.id_receives_empl, ' +
            'e.nombre, e.apellido, e.cedula ' +
            'FROM realtime_timbres AS rn, empleados AS e ' +
            'WHERE e.id = rn.id_send_empl AND rn.id_receives_empl = $1 AND rn.descripcion like \'Solicitó Alimentación%\' ' +
            'ORDER BY e.nombre ASC',
            [recibe]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    // NOTIFICACIONES TOTALES DE USUARIOS
    public async ListarPermisosEnviados_Usuario(req: Request, res: Response) {
        const { envia, id_empleado } = req.params;
        const DATOS = await pool.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
            'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_permiso, e.nombre, e.apellido, e.cedula, ' +
            'ctp.descripcion AS permiso, p.fec_inicio, p.fec_final ' +
            'FROM realtime_noti AS rn, empleados AS e, permisos AS p, cg_tipo_permisos AS ctp ' +
            'WHERE id_permiso IS NOT null AND e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND ' +
            'rn.id_receives_empl = $2 AND ' +
            'p.id = rn.id_permiso AND p.id_tipo_permiso = ctp.id ORDER BY rn.id DESC',
            [envia, id_empleado]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarPermisosRecibidos_Usuario(req: Request, res: Response) {
        const { recibe, id_empleado } = req.params;
        const DATOS = await pool.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
            'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_permiso, e.nombre, e.apellido, e.cedula, ' +
            'ctp.descripcion AS permiso, p.fec_inicio, p.fec_final ' +
            'FROM realtime_noti AS rn, empleados AS e, permisos AS p, cg_tipo_permisos AS ctp ' +
            'WHERE id_permiso IS NOT null AND e.id = rn.id_send_empl AND rn.id_receives_empl = $1 AND ' +
            'rn.id_send_empl = $2 AND ' +
            'p.id = rn.id_permiso AND p.id_tipo_permiso = ctp.id ORDER BY rn.id DESC',
            [recibe, id_empleado]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarSolicitudHoraExtraEnviadas_Usuario(req: Request, res: Response) {
        const { envia, id_empleado } = req.params;
        const DATOS = await pool.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
            'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_hora_extra, e.nombre, e.apellido, e.cedula, ' +
            'h.fec_inicio, h.fec_final, h.descripcion, h.num_hora, h.tiempo_autorizado ' +
            'FROM realtime_noti AS rn, empleados AS e, hora_extr_pedidos AS h ' +
            'WHERE rn.id_hora_extra IS NOT null AND e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND ' +
            'rn.id_receives_empl = $2 AND ' +
            'h.id = rn.id_hora_extra ORDER BY rn.id DESC',
            [envia, id_empleado]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }


    public async ListarSolicitudHoraExtraRecibidas_Usuario(req: Request, res: Response) {
        const { recibe, id_empleado } = req.params;
        const DATOS = await pool.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
            'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_hora_extra, e.nombre, e.apellido, e.cedula, ' +
            'h.fec_inicio, h.fec_final, h.descripcion, h.num_hora, h.tiempo_autorizado ' +
            'FROM realtime_noti AS rn, empleados AS e, hora_extr_pedidos AS h ' +
            'WHERE rn.id_hora_extra IS NOT null AND e.id = rn.id_send_empl AND rn.id_receives_empl = $1 AND ' +
            'rn.id_send_empl = $2 AND ' +
            'h.id = rn.id_hora_extra ORDER BY rn.id DESC',
            [recibe, id_empleado]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarVacacionesEnviadas_Usuario(req: Request, res: Response) {
        const { envia, id_empleado } = req.params;
        const DATOS = await pool.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
            'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_vacaciones, e.nombre, e.apellido, e.cedula, ' +
            'v.fec_inicio, v.fec_final, v.fec_ingreso ' +
            'FROM realtime_noti AS rn, empleados AS e, vacaciones AS v ' +
            'WHERE rn.id_vacaciones IS NOT null AND e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND ' +
            'rn.id_receives_empl = $2 AND ' +
            'v.id = rn.id_vacaciones ORDER BY rn.id DESC',
            [envia, id_empleado]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarVacacionesRecibidas_Usuario(req: Request, res: Response) {
        const { recibe, id_empleado } = req.params;
        const DATOS = await pool.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
            'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_vacaciones, e.nombre, e.apellido, e.cedula, ' +
            'v.fec_inicio, v.fec_final, v.fec_ingreso ' +
            'FROM realtime_noti AS rn, empleados AS e, vacaciones AS v ' +
            'WHERE rn.id_vacaciones IS NOT null AND e.id = rn.id_send_empl AND rn.id_receives_empl = $1 AND ' +
            'rn.id_send_empl = $2 AND ' +
            'v.id = rn.id_vacaciones ORDER BY rn.id DESC',
            [recibe, id_empleado]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarPlanificaComidaEnviadas_Usuario(req: Request, res: Response) {
        const { envia, id_empleado } = req.params;
        const DATOS = await pool.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
            'rn.create_at, e.nombre, e.apellido, e.cedula, ' +
            'rn.descripcion ' +
            'FROM realtime_timbres AS rn, empleados AS e ' +
            'WHERE e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND rn.descripcion like \'Alimentación Planificada%\' ' +
            'AND rn.id_receives_empl = $2 ' +
            'ORDER BY rn.id DESC',
            [envia, id_empleado]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    // NOTIFICACIONES TOTALES DE USUARIOS FECHAS
    public async ListarPermisosEnviados_UsuarioFecha(req: Request, res: Response) {
        const { envia, id_empleado, fec_inicio, fec_final } = req.params;
        const DATOS = await pool.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
            'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_permiso, e.nombre, e.apellido, e.cedula, ' +
            'ctp.descripcion AS permiso, p.fec_inicio, p.fec_final ' +
            'FROM realtime_noti AS rn, empleados AS e, permisos AS p, cg_tipo_permisos AS ctp ' +
            'WHERE id_permiso IS NOT null AND e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND ' +
            'rn.id_receives_empl = $2 AND rn.create_at BETWEEN $3 AND $4 AND ' +
            'p.id = rn.id_permiso AND p.id_tipo_permiso = ctp.id ORDER BY rn.id DESC',
            [envia, id_empleado, fec_inicio, fec_final ]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarPermisosRecibidos_UsuarioFecha(req: Request, res: Response) {
        const { recibe, id_empleado, fec_inicio, fec_final  } = req.params;
        const DATOS = await pool.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
            'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_permiso, e.nombre, e.apellido, e.cedula, ' +
            'ctp.descripcion AS permiso, p.fec_inicio, p.fec_final ' +
            'FROM realtime_noti AS rn, empleados AS e, permisos AS p, cg_tipo_permisos AS ctp ' +
            'WHERE id_permiso IS NOT null AND e.id = rn.id_send_empl AND rn.id_receives_empl = $1 AND ' +
            'rn.id_send_empl = $2 AND rn.create_at BETWEEN $3 AND $4 AND ' +
            'p.id = rn.id_permiso AND p.id_tipo_permiso = ctp.id ORDER BY rn.id DESC',
            [recibe, id_empleado, fec_inicio, fec_final ]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarSolicitudHoraExtraEnviadas_UsuarioFecha(req: Request, res: Response) {
        const { envia, id_empleado, fec_inicio, fec_final  } = req.params;
        const DATOS = await pool.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
            'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_hora_extra, e.nombre, e.apellido, e.cedula, ' +
            'h.fec_inicio, h.fec_final, h.descripcion, h.num_hora, h.tiempo_autorizado ' +
            'FROM realtime_noti AS rn, empleados AS e, hora_extr_pedidos AS h ' +
            'WHERE rn.id_hora_extra IS NOT null AND e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND ' +
            'rn.id_receives_empl = $2 AND rn.create_at BETWEEN $3 AND $4 AND ' +
            'h.id = rn.id_hora_extra ORDER BY rn.id DESC',
            [envia, id_empleado, fec_inicio, fec_final ]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }


    public async ListarSolicitudHoraExtraRecibidas_UsuarioFecha(req: Request, res: Response) {
        const { recibe, id_empleado, fec_inicio, fec_final  } = req.params;
        const DATOS = await pool.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
            'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_hora_extra, e.nombre, e.apellido, e.cedula, ' +
            'h.fec_inicio, h.fec_final, h.descripcion, h.num_hora, h.tiempo_autorizado ' +
            'FROM realtime_noti AS rn, empleados AS e, hora_extr_pedidos AS h ' +
            'WHERE rn.id_hora_extra IS NOT null AND e.id = rn.id_send_empl AND rn.id_receives_empl = $1 AND ' +
            'rn.id_send_empl = $2 AND rn.create_at BETWEEN $3 AND $4 AND ' +
            'h.id = rn.id_hora_extra ORDER BY rn.id DESC',
            [recibe, id_empleado, fec_inicio, fec_final ]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarVacacionesEnviadas_UsuarioFecha(req: Request, res: Response) {
        const { envia, id_empleado, fec_inicio, fec_final  } = req.params;
        const DATOS = await pool.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
            'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_vacaciones, e.nombre, e.apellido, e.cedula, ' +
            'v.fec_inicio, v.fec_final, v.fec_ingreso ' +
            'FROM realtime_noti AS rn, empleados AS e, vacaciones AS v ' +
            'WHERE rn.id_vacaciones IS NOT null AND e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND ' +
            'rn.id_receives_empl = $2 AND rn.create_at BETWEEN $3 AND $4 AND ' +
            'v.id = rn.id_vacaciones ORDER BY rn.id DESC',
            [envia, id_empleado, fec_inicio, fec_final ]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarVacacionesRecibidas_UsuarioFecha(req: Request, res: Response) {
        const { recibe, id_empleado, fec_inicio, fec_final  } = req.params;
        const DATOS = await pool.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
            'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_vacaciones, e.nombre, e.apellido, e.cedula, ' +
            'v.fec_inicio, v.fec_final, v.fec_ingreso ' +
            'FROM realtime_noti AS rn, empleados AS e, vacaciones AS v ' +
            'WHERE rn.id_vacaciones IS NOT null AND e.id = rn.id_send_empl AND rn.id_receives_empl = $1 AND ' +
            'rn.id_send_empl = $2 AND rn.create_at BETWEEN $3 AND $4 AND ' +
            'v.id = rn.id_vacaciones ORDER BY rn.id DESC',
            [recibe, id_empleado, fec_inicio, fec_final ]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarPlanificaComidaEnviadas_UsuarioFecha(req: Request, res: Response) {
        const { envia, id_empleado, fec_inicio, fec_final  } = req.params;
        const DATOS = await pool.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
            'rn.create_at, e.nombre, e.apellido, e.cedula, ' +
            'rn.descripcion ' +
            'FROM realtime_timbres AS rn, empleados AS e ' +
            'WHERE e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND rn.descripcion like \'Alimentación Planificada%\' ' +
            'AND rn.id_receives_empl = $2 AND rn.create_at BETWEEN $3 AND $4 ' +
            'ORDER BY rn.id DESC',
            [envia, id_empleado, fec_inicio, fec_final ]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }


    // TODAS LAS NOTIFICACIONES CON FECHA

    public async ListarPermisosEnviados_Fecha(req: Request, res: Response) {
        const { envia } = req.params;
        const DATOS = await pool.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
            'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_permiso, e.nombre, e.apellido, e.cedula, ' +
            'ctp.descripcion AS permiso, p.fec_inicio, p.fec_final ' +
            'FROM realtime_noti AS rn, empleados AS e, permisos AS p, cg_tipo_permisos AS ctp ' +
            'WHERE id_permiso IS NOT null AND e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND ' +
            'p.id = rn.id_permiso AND p.id_tipo_permiso = ctp.id AND rn.create_at BETWEEN $2 AND $3 ORDER BY rn.id DESC',
            [envia]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarPermisosRecibidos_Fecha(req: Request, res: Response) {
        const { recibe } = req.params;
        const DATOS = await pool.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
            'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_permiso, e.nombre, e.apellido, e.cedula, ' +
            'ctp.descripcion AS permiso, p.fec_inicio, p.fec_final ' +
            'FROM realtime_noti AS rn, empleados AS e, permisos AS p, cg_tipo_permisos AS ctp ' +
            'WHERE id_permiso IS NOT null AND e.id = rn.id_send_empl AND rn.id_receives_empl = $1 AND ' +
            'p.id = rn.id_permiso AND p.id_tipo_permiso = ctp.id ORDER BY rn.id DESC',
            [recibe]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarSolicitudHoraExtraEnviadas_Fecha(req: Request, res: Response) {
        const { envia } = req.params;
        const DATOS = await pool.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
            'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_hora_extra, e.nombre, e.apellido, e.cedula, ' +
            'h.fec_inicio, h.fec_final, h.descripcion, h.num_hora, h.tiempo_autorizado ' +
            'FROM realtime_noti AS rn, empleados AS e, hora_extr_pedidos AS h ' +
            'WHERE rn.id_hora_extra IS NOT null AND e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND ' +
            'h.id = rn.id_hora_extra ORDER BY rn.id DESC',
            [envia]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }


    public async ListarSolicitudHoraExtraRecibidas_Fecha(req: Request, res: Response) {
        const { recibe } = req.params;
        const DATOS = await pool.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
            'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_hora_extra, e.nombre, e.apellido, e.cedula, ' +
            'h.fec_inicio, h.fec_final, h.descripcion, h.num_hora, h.tiempo_autorizado ' +
            'FROM realtime_noti AS rn, empleados AS e, hora_extr_pedidos AS h ' +
            'WHERE rn.id_hora_extra IS NOT null AND e.id = rn.id_send_empl AND rn.id_receives_empl = $1 AND ' +
            'h.id = rn.id_hora_extra ORDER BY rn.id DESC',
            [recibe]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarVacacionesEnviadas_Fecha(req: Request, res: Response) {
        const { envia } = req.params;
        const DATOS = await pool.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
            'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_vacaciones, e.nombre, e.apellido, e.cedula, ' +
            'v.fec_inicio, v.fec_final, v.fec_ingreso ' +
            'FROM realtime_noti AS rn, empleados AS e, vacaciones AS v ' +
            'WHERE rn.id_vacaciones IS NOT null AND e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND ' +
            'v.id = rn.id_vacaciones ORDER BY rn.id DESC',
            [envia]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarVacacionesRecibidas_Fecha(req: Request, res: Response) {
        const { recibe } = req.params;
        const DATOS = await pool.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
            'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_vacaciones, e.nombre, e.apellido, e.cedula, ' +
            'v.fec_inicio, v.fec_final, v.fec_ingreso ' +
            'FROM realtime_noti AS rn, empleados AS e, vacaciones AS v ' +
            'WHERE rn.id_vacaciones IS NOT null AND e.id = rn.id_send_empl AND rn.id_receives_empl = $1 AND ' +
            'v.id = rn.id_vacaciones ORDER BY rn.id DESC',
            [recibe]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarPlanificaComidaEnviadas_Fecha(req: Request, res: Response) {
        const { envia } = req.params;
        const DATOS = await pool.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
            'rn.create_at, e.nombre, e.apellido, e.cedula, ' +
            'rn.descripcion ' +
            'FROM realtime_timbres AS rn, empleados AS e ' +
            'WHERE e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND rn.descripcion like \'Alimentación Planificada%\' ' +
            'ORDER BY rn.id DESC',
            [envia]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarPlanificacionesEliminadas_Fecha(req: Request, res: Response) {
        const { envia } = req.params;
        const DATOS = await pool.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
            'rn.create_at, e.nombre, e.apellido, e.cedula, ' +
            'rn.descripcion ' +
            'FROM realtime_timbres AS rn, empleados AS e ' +
            'WHERE e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND rn.descripcion like \'Planificación de Alimentación Eliminada.\' ' +
            'ORDER BY rn.id DESC',
            [envia]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

}

export const NOTIFICACIONES_CONTROLADOR = new NotificacionesControlador();

export default NOTIFICACIONES_CONTROLADOR;