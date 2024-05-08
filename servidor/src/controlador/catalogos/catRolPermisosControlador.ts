import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../../database';

class RolPermisosControlador {

  public async list(req: Request, res: Response) {
    const rolPermisos = await pool.query(
      `
      SELECT * FROM ero_rol_permisos
      `
    );
    res.jsonp(rolPermisos.rows);
  }

  public async getOne(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const unRolPermiso = await pool.query(
      `
      SELECT * FROM ero_rol_permisos WHERE id = $1
      `
      , [id]);
    if (unRolPermiso.rowCount > 0) {
      return res.jsonp(unRolPermiso.rows)
    }
    res.status(404).jsonp({ text: 'Registro no encontrado.' });
  }


  //METODO PARA ENLISTAR PAGINAS QUE NO SEAN MODULOS
  public async ListarMenuRoles(req: Request, res: Response) {
    const Roles = await pool.query(
      `
      SELECT * FROM es_paginas WHERE modulo = false
      `
    );
    if (Roles.rowCount > 0) {
      return res.jsonp(Roles.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }



  //METODO PARA ENLISTAR PAGINAS QUE NO SEAN MODULOS
  public async ListarMenuModulosRoles(req: Request, res: Response) {
    const Roles = await pool.query(
      `
      SELECT * FROM es_paginas WHERE modulo = true
      `
    );
    if (Roles.rowCount > 0) {
      return res.jsonp(Roles.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }




  //METODO PARA ENLISTAR PAGINAS QUE SON MODULOS, CLASIFICANDOLAS POR EL NOMBRE DEL MODULO
  //METODO PARA ENLISTAR PAGINAS QUE NO SEAN MODULOS
  public async ListarMenuRolesModulos(req: Request, res: Response) {

    const { nombre_modulo } = req.body;

    const Roles = await pool.query(
      `
      SELECT * FROM es_paginas WHERE nombre_modulo = $1
      `
      , [nombre_modulo]
    );
    if (Roles.rowCount > 0) {
      return res.jsonp(Roles.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }






  // METODO PARA BUSCAR SI EXISTEN PAGINAS CON EL ID DEL ROL REGISTRADA
  public async ObtenerIdPaginas(req: Request, res: Response): Promise<any> {
    const { funcion, id_rol } = req.body;
    const PAGINA_ROL = await pool.query(
      `
      SELECT * FROM ero_rol_permisos WHERE pagina = $1  AND id_rol = $2 
      `
      , [funcion, id_rol]);
    if (PAGINA_ROL.rowCount > 0) {
      return res.jsonp(PAGINA_ROL.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }
  }
  // METODO PARA BUSCAR SI EXISTEN PAGINAS CON EL ID DEL ROL REGISTRADA
  public async ObtenerIdPaginasConAcciones(req: Request, res: Response): Promise<any> {
    const { funcion, id_rol, id_accion } = req.body;
    const PAGINA_ROL = await pool.query(
      `
      SELECT * FROM ero_rol_permisos WHERE pagina = $1 AND id_rol = $2 AND id_accion = $3
      `
      , [funcion, id_rol, id_accion]);
    if (PAGINA_ROL.rowCount > 0) {
      return res.jsonp(PAGINA_ROL.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }
  }


  // METODO PARA BUSCAR LAS PAGINAS POR EL ID DEL ROL
  public async ObtenerPaginasRol(req: Request, res: Response): Promise<any> {
    
    try{

      const { id_rol } = req.body;
    const PAGINA_ROL = await pool.query(
      `
      SELECT * FROM ero_rol_permisos WHERE id_rol = $1 
      `
      , [id_rol]);
      return res.jsonp(PAGINA_ROL.rows)

    }catch(error){
      return res.status(404).jsonp({ text: 'Registros no encontrados.' });

    }

    /*
    const { id_rol } = req.body;
    const PAGINA_ROL = await pool.query(
      `
      SELECT * FROM ero_rol_permisos WHERE id_rol = $1 
      `
      , [id_rol]);
    if (PAGINA_ROL.rowCount > 0) {
      return res.jsonp(PAGINA_ROL.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }
    */
  }

  // METODO PARA ASIGNAR PERMISOS AL ROL
  public async AsignarPaginaRol(req: Request, res: Response) {
    try {
      const { funcion, link, id_rol, id_accion } = req.body;
      const response: QueryResult = await pool.query(
        `
        INSERT INTO ero_rol_permisos (pagina, link, id_rol, id_accion) VALUES ($1, $2, $3, $4) RETURNING *
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

    const { id } = req.body
    await pool.query(
      `
      DELETE FROM ero_rol_permisos WHERE id = $1
      `
      , [id]);
    res.jsonp({ message: 'Registro eliminado.' });
  }


  // METODO PARA GUARDAR TODAS LAS ACCIONES EXISTENTES EN UN OBJETO






  // METODO PARA Buscar las acciones de cada pagina


  public async ObtenerAccionesPaginas(req: Request, res: Response): Promise<any> {


    const { id_funcion } = req.body;
    const PAGINA_ROL = await pool.query(
      `
      SELECT * FROM es_acciones_paginas WHERE id_pagina = $1 
      `
      , [id_funcion]);
    if (PAGINA_ROL.rowCount > 0) {
      return res.jsonp(PAGINA_ROL.rows)
    }
    else {

      return res.jsonp([])

      // return res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }
  }



  public async ObtenerAccionesPaginasExistentes(req: Request, res: Response): Promise<any> {


    const { id_funcion } = req.body;
    const PAGINA_ROL = await pool.query(
      `
          SELECT * FROM es_acciones_paginas WHERE id_pagina = $1 
          `
      , [id_funcion]);
    if (PAGINA_ROL.rowCount > 0) {
      return res.jsonp(PAGINA_ROL.rows)
    }
    else {

      //return res.jsonp([])

      return res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }
  }

  public async ObtenerAccionPorId(req: Request, res: Response): Promise<any> {
    const { id } = req.body;
    const PAGINA_ROL = await pool.query(
      `
      SELECT * FROM es_acciones_paginas WHERE id = $1 
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
      `
      SELECT * FROM es_acciones_paginas
      `
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