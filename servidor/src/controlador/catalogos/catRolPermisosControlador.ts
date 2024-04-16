import { Request, Response } from 'express';
import { QueryResult } from 'pg';

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
    const { funcion, link, etiqueta } = req.body;
    await pool.query('INSERT INTO cg_rol_permisos ( funcion, link, etiqueta ) VALUES ($1, $2, $3)', [funcion, link, etiqueta]);
    console.log(req.body);
    const rolPermisos = await pool.query('SELECT id FROM cg_rol_permisos');
    const ultimoDato = rolPermisos.rows.length - 1;
    const idRespuesta = rolPermisos.rows[ultimoDato].id;
    res.jsonp({ message: 'Rol permiso Guardado', id: idRespuesta });
  }

  public async createPermisoDenegado(req: Request, res: Response): Promise<void> {
    const { id_rol, id_permiso } = req.body;
    await pool.query('INSERT INTO rol_perm_denegado ( id_rol, id_permiso ) VALUES ($1, $2)', [id_rol, id_permiso]);
    console.log(req.body);
    res.jsonp({ message: 'Permiso denegado Guardado' });
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


  //METODO PARA ENLISTAR LINKS 
  public async ListarMenuRoles(req: Request, res: Response) {
    const Roles = await pool.query(
      `SELECT * FROM opciones_menu`
    );
    if (Roles.rowCount > 0) {
      return res.jsonp(Roles.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }

  // METODO PARA BUSCAR ID DE PAGINAS
  public async ObtenerIdPaginas(req: Request, res: Response): Promise<any> {
    const { funcion, id_rol } = req.body;
    const PAGINA_ROL = await pool.query(
      `
          SELECT * FROM cg_rol_permisos WHERE funcion = $1  AND id_rol = $2 
          `
      , [funcion, id_rol]);
    if (PAGINA_ROL.rowCount > 0) {
      return res.jsonp(PAGINA_ROL.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }
  }
    // METODO PARA BUSCAR ID DE PAGINAS
    public async ObtenerIdPaginasConAcciones(req: Request, res: Response): Promise<any> {
      const { funcion, id_rol, id_accion } = req.body;
      const PAGINA_ROL = await pool.query(
        `
            SELECT * FROM cg_rol_permisos WHERE funcion = $1  AND id_rol = $2 AND id_accion = $3
            `
        , [funcion, id_rol, id_accion]);
      if (PAGINA_ROL.rowCount > 0) {
        return res.jsonp(PAGINA_ROL.rows)
      }
      else {
        return res.status(404).jsonp({ text: 'Registros no encontrados.' });
      }
    }


  // METODO PARA BUSCAR ID DE PAGINAS
  public async ObtenerPaginasRol(req: Request, res: Response): Promise<any> {
    const { id_rol } = req.body;
    const PAGINA_ROL = await pool.query(
      `
          SELECT * FROM cg_rol_permisos WHERE id_rol = $1 
          `
      , [id_rol]);
    if (PAGINA_ROL.rowCount > 0) {
      return res.jsonp(PAGINA_ROL.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }
  }

  // METODO PARA ASIGNAR CIUDADES A FERIADO
  public async AsignarPaginaRol(req: Request, res: Response) {
    try {
      const { funcion, link, id_rol, id_accion } = req.body;
      const response: QueryResult = await pool.query(
        `
            INSERT INTO cg_rol_permisos (funcion, link, id_rol, id_accion) VALUES ($1, $2, $3, $4) RETURNING *
            `
        , [funcion, link, id_rol, id_accion]);

      const [rol] = response.rows;

      if (rol) {
        return res.status(200).jsonp({ message: 'OK', reloj: rol })
      }
      else {
        return res.status(404).jsonp({ message: 'error' })
      }
    } catch (error) {
      return res.status(500).jsonp({ message: 'error' })
    }

  }


  // METODO PARA ELIMINAR REGISTRO
  public async EliminarPaginaRol(req: Request, res: Response): Promise<void> {
    // const id = req.params.id;

    const { funcion, id_rol } = req.body

    console.log(funcion);
    console.log(id_rol);
    await pool.query(
      `
        DELETE FROM cg_rol_permisos WHERE funcion = $1 AND id_rol = $2
        `
      , [funcion, id_rol]);
    res.jsonp({ message: 'Registro eliminado.' });
  }

  // METODO PARA Buscar las acciones de cada pagina


  public async ObtenerAccionesPaginas(req: Request, res: Response): Promise<any> {
    const { id_funcion } = req.body;
    const PAGINA_ROL = await pool.query(
      `
          SELECT * FROM cg_acciones_roles WHERE id_funcion = $1 
          `
      , [id_funcion]);
    if (PAGINA_ROL.rowCount > 0) {
      return res.jsonp(PAGINA_ROL.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }
  }

  public async ObtenerAccionPorId(req: Request, res: Response): Promise<any> {
    const { id } = req.body;
    const PAGINA_ROL = await pool.query(
      `
          SELECT * FROM cg_acciones_roles WHERE id = $1 
          `
      , [id]);
    if (PAGINA_ROL.rowCount > 0) {
      return res.jsonp(PAGINA_ROL.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }
  }

  

  //METODO PARA ENLISTAR ACCIONES 
  public async ListarAcciones(req: Request, res: Response) {
    const Roles = await pool.query(
      `SELECT * FROM cg_acciones_roles`
    );
    if (Roles.rowCount > 0) {
      return res.jsonp(Roles.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }


  








}

export const rolPermisosControlador = new RolPermisosControlador();

export default rolPermisosControlador;