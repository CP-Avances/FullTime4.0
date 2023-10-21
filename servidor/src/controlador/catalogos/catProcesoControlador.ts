import { Request, Response } from 'express';
import fs from 'fs';
const builder = require('xmlbuilder');

import pool from '../../database';

class ProcesoControlador {
  public async list(req: Request, res: Response) {
    const Sin_proc_padre = await pool.query('SELECT * FROM cg_procesos AS cg_p WHERE cg_p.proc_padre IS NULL ORDER BY cg_p.nombre ASC');
    const Con_proc_padre = await pool.query('SELECT cg_p.id, cg_p.nombre, cg_p.nivel, nom_p.nombre AS proc_padre FROM cg_procesos AS cg_p, NombreProcesos AS nom_p WHERE cg_p.proc_padre = nom_p.id ORDER BY cg_p.nombre ASC');
    Sin_proc_padre.rows.forEach((obj: any) => {
      Con_proc_padre.rows.push(obj);
    })
    res.jsonp(Con_proc_padre.rows);
  }

  public async getOne(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const unaProvincia = await pool.query('SELECT * FROM cg_procesos WHERE id = $1', [id]);
    if (unaProvincia.rowCount > 0) {
      return res.jsonp(unaProvincia.rows)
    }
    res.status(404).jsonp({ text: 'El proceso no ha sido encontrado' });
  }

  public async create(req: Request, res: Response): Promise<void> {
    const { nombre, nivel, proc_padre } = req.body;
    await pool.query('INSERT INTO cg_procesos (nombre, nivel, proc_padre) VALUES ($1, $2, $3)', [nombre, nivel, proc_padre]);
    console.log(req.body);
    res.jsonp({ message: 'El departamento ha sido guardado en éxito' });
  }

  public async getIdByNombre(req: Request, res: Response): Promise<any> {
    const { nombre } = req.params;
    const unIdProceso = await pool.query('SELECT id FROM cg_procesos WHERE nombre = $1', [nombre]);
    if (unIdProceso != null) {
      return res.jsonp(unIdProceso.rows);
    }
    res.status(404).jsonp({ text: 'El proceso no ha sido encontrado' });
  }

  public async ActualizarProceso(req: Request, res: Response): Promise<void> {
    const { nombre, nivel, proc_padre, id } = req.body;
    await pool.query('UPDATE cg_procesos SET nombre = $1, nivel = $2, proc_padre = $3 WHERE id = $4', [nombre, nivel, proc_padre, id]);
    res.jsonp({ message: 'El proceso actualizado exitosamente' });
  }

  public async EliminarProceso(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    await pool.query('DELETE FROM cg_procesos WHERE id = $1', [id]);
    res.jsonp({ message: 'Registro eliminado.' });
  }


}

export const PROCESOS_CONTROLADOR = new ProcesoControlador();

export default PROCESOS_CONTROLADOR;