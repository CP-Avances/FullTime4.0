// IMPORTAR LIBRERIAS
import { Request, Response } from 'express';
import pool from '../../database';

class RolesControlador {

  // METODO PARA LISTAR ROLES DEL SISTEMA
  public async ListarRoles(req: Request, res: Response) {
    const ROL = await pool.query(
      `
      SELECT id, nombre FROM ero_cat_roles ORDER BY nombre ASC
      `
    );
    if (ROL.rowCount > 0) {
      return res.jsonp(ROL.rows)
    } else {
      res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }

  // METODO PARA ELIMINAR REGISTRO
  public async EliminarRol(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    await pool.query(
      `
      DELETE FROM ero_cat_roles WHERE id = $1
      `
      , [id]);
    res.jsonp({ message: 'Registro eliminado.' });
  }

  // METODO PARA REGISTRAR ROL
  public async CrearRol(req: Request, res: Response): Promise<void> {
    const { nombre } = req.body;
    await pool.query(
      `
       INSERT INTO ero_cat_roles (nombre) VALUES ($1)
       `
      , [nombre]);
    res.jsonp({ message: 'Registro guardado.' });

  }














  public async ListarRolesActualiza(req: Request, res: Response) {
    const id = req.params.id;
    const ROL = await pool.query(
      `
      SELECT * FROM ero_cat_roles WHERE NOT id = $1
      `
      , [id]);
    if (ROL.rowCount > 0) {
      return res.jsonp(ROL.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  public async ObtnenerUnRol(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const ROL = await pool.query(
      `
      SELECT * FROM ero_cat_roles WHERE id = $1
      `
      , [id]);
    if (ROL.rowCount > 0) {
      return res.jsonp(ROL.rows)
    } else {
      res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }


  public async ActualizarRol(req: Request, res: Response): Promise<void> {
    const { nombre, id } = req.body;
    await pool.query(
      `
      UPDATE ero_cat_roles SET nombre = $1 WHERE id = $2
      `
      , [nombre, id]);
    res.jsonp({ message: 'Registro actualizado.' });
  }

}

const ROLES_CONTROLADOR = new RolesControlador();

export default ROLES_CONTROLADOR;
