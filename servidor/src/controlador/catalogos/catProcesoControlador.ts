import { Request, Response } from 'express';
import pool from '../../database';

class ProcesoControlador {

  public async list(req: Request, res: Response) {
    const Sin_proc_padre = await pool.query(
      `
      SELECT * FROM map_cat_procesos AS p 
      WHERE p.proceso_padre IS NULL 
      ORDER BY p.nombre ASC
      `
    );
    const Con_proc_padre = await pool.query(
      `
      SELECT p.id, p.nombre, p.nivel, nom_p.nombre AS proc_padre 
      FROM map_cat_procesos AS p, NombreProcesos AS nom_p 
      WHERE p.proceso_padre = nom_p.id 
      ORDER BY p.nombre ASC
      `
    );
    Sin_proc_padre.rows.forEach((obj: any) => {
      Con_proc_padre.rows.push(obj);
    })
    res.jsonp(Con_proc_padre.rows);
  }

  public async getOne(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const unaProvincia = await pool.query(
      `
      SELECT * FROM map_cat_procesos WHERE id = $1
      `
      , [id]);
    if (unaProvincia.rowCount > 0) {
      return res.jsonp(unaProvincia.rows)
    }
    res.status(404).jsonp({ text: 'El proceso no ha sido encontrado.' });
  }

  public async create(req: Request, res: Response): Promise<void> {
    const { nombre, nivel, proc_padre } = req.body;
    await pool.query(
      `
      INSERT INTO map_cat_procesos (nombre, nivel, proceso_padre) VALUES ($1, $2, $3)
      `
      , [nombre, nivel, proc_padre]);
    console.log(req.body);
    res.jsonp({ message: 'El proceso guardado.' });
  }

  public async getIdByNombre(req: Request, res: Response): Promise<any> {
    const { nombre } = req.params;
    const unIdProceso = await pool.query(
      `
      SELECT id FROM map_cat_procesos WHERE nombre = $1
      `
      , [nombre]);
    if (unIdProceso != null) {
      return res.jsonp(unIdProceso.rows);
    }
    res.status(404).jsonp({ text: 'Registro no encontrado.' });
  }

  public async ActualizarProceso(req: Request, res: Response): Promise<void> {
    const { nombre, nivel, proc_padre, id } = req.body;
    await pool.query(
      `
      UPDATE map_cat_procesos SET nombre = $1, nivel = $2, proceso_padre = $3 WHERE id = $4
      `
      , [nombre, nivel, proc_padre, id]);
    res.jsonp({ message: 'Proceso actualizado exitosamente.' });
  }

  public async EliminarProceso(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    await pool.query(
      `
      DELETE FROM map_cat_procesos WHERE id = $1
      `
      , [id]);
    res.jsonp({ message: 'Registro eliminado.' });
  }


}

export const PROCESOS_CONTROLADOR = new ProcesoControlador();

export default PROCESOS_CONTROLADOR;