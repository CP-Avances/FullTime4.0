import { Request, Response } from 'express';
import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';
import pool from '../../database';

class RolPermisosControlador {
  public async list(req: Request, res: Response) {
    const rolPermisos = await pool.query('SELECT * FROM cg_rol_permisos');
    res.jsonp(rolPermisos.rows);
  }

  public async getOne(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const unRolPermiso = await pool.query('SELECT * FROM cg_rol_permisos WHERE id = $1', [id]);
    if (unRolPermiso.rowCount > 0) {
      return res.jsonp(unRolPermiso.rows)
    }
    res.status(404).jsonp({ text: 'Rol permiso no encontrado' });
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      const { funcion, link, etiqueta, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      await pool.query('INSERT INTO cg_rol_permisos ( funcion, link, etiqueta ) VALUES ($1, $2, $3)', [funcion, link, etiqueta]);
      
      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'cg_rol_permisos',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: `{funcion: ${funcion}, link: ${link}, etiqueta: ${etiqueta}}`,
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');

      const rolPermisos = await pool.query('SELECT id FROM cg_rol_permisos');
      const ultimoDato = rolPermisos.rows.length - 1;
      const idRespuesta = rolPermisos.rows[ultimoDato].id;
      res.jsonp({ message: 'Rol permiso Guardado', id: idRespuesta});
    } catch (error) {
      // FINALIZAR TRANSACCION
      await pool.query('ROLLBACK');
      res.status(404).jsonp({ message: 'Error al guardar el rol permiso.' });
    }
  }

  public async createPermisoDenegado(req: Request, res: Response): Promise<void> {
    try {
      const { id_rol, id_permiso, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      await pool.query('INSERT INTO rol_perm_denegado ( id_rol, id_permiso ) VALUES ($1, $2)', [id_rol, id_permiso]);
      
      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'rol_perm_denegado',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: `{id_rol: ${id_rol}, id_permiso: ${id_permiso}}`,
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      res.jsonp({ message: 'Permiso denegado Guardado'});
    } catch (error) {
      // FINALIZAR TRANSACCION
      await pool.query('ROLLBACK');
      res.status(404).jsonp({ message: 'Error al guardar el permiso denegado.' });
    }
  }

  public async getPermisosUsuario(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const unRolPermiso = await pool.query('SELECT * FROM VistaPermisoRoles WHERE id_rol = $1', [id]);
    if (unRolPermiso.rowCount > 0) {
      console.log(unRolPermiso.rows);
      return res.jsonp(unRolPermiso.rows);
    }
    res.status(404).jsonp({ text: 'El rol no tiene permisos' });
  }
}

export const rolPermisosControlador = new RolPermisosControlador();

export default rolPermisosControlador;