import { Request, Response } from 'express';
import pool from '../../../database';

class EmpleadoProcesoControlador {

  public async CrearEmpleProcesos(req: Request, res: Response): Promise<void> {
    const { id, id_empleado, id_empl_cargo, fec_inicio, fec_final } = req.body;
    await pool.query(
      `
      INSERT INTO map_empleado_procesos (id_proceso, id_empleado, id_empleado_cargo, fecha_inicio, fecha_final) 
      VALUES ($1, $2, $3, $4, $5)
      `
      , [id, id_empleado, id_empl_cargo, fec_inicio, fec_final]);
    res.jsonp({ message: 'Registro guardado.' });
  }

  public async ActualizarProcesoEmpleado(req: Request, res: Response): Promise<void> {
    const { id, id_empl_cargo, fec_inicio, fec_final, id_p } = req.body;
    await pool.query(
      `
      UPDATE map_empleado_procesos SET id = $1, id_empleado_cargo = $2, fecha_inicio = $3, fecha_final = $4 
      WHERE id = $5
      `
      , [id, id_empl_cargo, fec_inicio, fec_final, id_p]);
    res.jsonp({ message: 'Registro actualizado.' });
  }

  public async BuscarProcesoUsuario(req: Request, res: Response): Promise<any> {
    const { id_empleado } = req.params;
    const HORARIO_CARGO = await pool.query(
      `
      SELECT ep.id, ep.id_proceso, ep.id_empleado_cargo, ep.fecha_inicio, ep.fecha_final, cp.nombre AS proceso 
      FROM map_empleado_procesos AS ep, map_cat_procesos AS cp 
      WHERE ep.id_empleado = $1 AND ep.id_proceso = cp.id
      `
      , [id_empleado]);
    if (HORARIO_CARGO.rowCount != 0) {
      return res.jsonp(HORARIO_CARGO.rows)
    }
    res.status(404).jsonp({ text: 'Registro no encontrado.' });
  }

  public async ListarEmpleProcesos(req: Request, res: Response) {
    const PROCESOS = await pool.query(
      `
      SELECT * FROM map_empleado_procesos
      `
    );
    if (PROCESOS.rowCount != 0) {
      return res.jsonp(PROCESOS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  public async EliminarRegistros(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    await pool.query(
      `
      DELETE FROM map_empleado_procesos WHERE id = $1
      `, [id]);
    res.jsonp({ message: 'Registro eliminado.' });
  }

}

export const EMPLEADO_PROCESO_CONTROLADOR = new EmpleadoProcesoControlador();

export default EMPLEADO_PROCESO_CONTROLADOR;