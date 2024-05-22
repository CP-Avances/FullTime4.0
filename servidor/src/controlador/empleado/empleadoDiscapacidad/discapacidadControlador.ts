import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../../../database';

class DiscapacidadControlador {

  // METODO PARA BUSCAR DATOS DISCAPACIDAD USUARIO
  public async BuscarDiscapacidadUsuario(req: Request, res: Response): Promise<any> {
    const { id_empleado } = req.params;
    const unaDiscapacidad = await pool.query(
      `
      SELECT cd.id_empleado, cd.carnet_conadis, cd.porcentaje, cd.id_discapacidad, td.nombre AS nom_tipo
      FROM eu_empleado_discapacidad cd, e_cat_discapacidad td, eu_empleados e
      WHERE cd.id_empleado = e.id AND cd.id_discapacidad = td.id AND cd.id_empleado = $1
      `
      , [id_empleado]);
    if (unaDiscapacidad.rowCount > 0) {
      return res.jsonp(unaDiscapacidad.rows)
    }
    else {
      res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }
  }

  // METODO PARA REGISTRAR DISCAPACIDAD
  public async RegistrarDiscapacidad(req: Request, res: Response): Promise<void> {
    const { id_empleado, carn_conadis, porcentaje, tipo } = req.body;
    await pool.query(
      `
      INSERT INTO eu_empleado_discapacidad (id_empleado, carnet_conadis, porcentaje, id_discapacidad) 
      VALUES ($1, $2, $3, $4)
      `
      , [id_empleado, carn_conadis, porcentaje, tipo]);
    res.jsonp({ message: 'Registro guardado.' });
  }

  // METODO PARA ACTUALIZAR DATOS DE REGISTRO
  public async ActualizarDiscapacidad(req: Request, res: Response): Promise<void> {
    const id_empleado = req.params.id_empleado;
    const { carn_conadis, porcentaje, tipo } = req.body;
    await pool.query(
      `
      UPDATE eu_empleado_discapacidad SET carnet_conadis = $1, porcentaje = $2, id_discapacidad = $3 
      WHERE id_empleado = $4
      `
      , [carn_conadis, porcentaje, tipo, id_empleado]);
    res.jsonp({ message: 'Registro actualizado.' });
  }

  public async EliminarDiscapacidad(req: Request, res: Response): Promise<void> {
    const id_empleado = req.params.id_empleado;
    await pool.query(
      `
      DELETE FROM eu_empleado_discapacidad WHERE id_empleado = $1
      `
      , [id_empleado]);
    res.jsonp({ message: 'Registro eliminado.' });
  }


  /** *************************************************************************************** **
   ** **                METODO PARA MANEJO DE DATOS DE TIPO DISCAPACIDAD                   ** ** 
   ** *************************************************************************************** **/

  // METODO PARA CREAR TIPO DE DISCAPACIDAD
  public async RegistrarTipo(req: Request, res: Response): Promise<Response> {
    const { nombre } = req.body;
    const response: QueryResult = await pool.query(
      `
      INSERT INTO e_cat_discapacidad (nombre) VALUES ($1) RETURNING *
      `
      , [nombre]);

    const [tipo] = response.rows;

    if (tipo) {
      return res.status(200).jsonp(tipo)
    }
    else {
      return res.status(404).jsonp({ message: 'No se han encontrado registros.' })
    }
  }

  // METODO PARA LISTAR TIPOS DE DISCAPACIDAD
  public async ListarTipo(req: Request, res: Response) {
    const TIPO_DISCAPACIDAD = await pool.query(
      `
      SELECT * FROM e_cat_discapacidad
      `
    );
    if (TIPO_DISCAPACIDAD.rowCount > 0) {
      return res.jsonp(TIPO_DISCAPACIDAD.rows)
    }
    else {
      res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }

  // METODO PARA BUSCAR DISCAPACIDAD POR SU NOMBRE
  public async BuscarDiscapacidadNombre(req: Request, res: Response) {
    const { nombre } = req.body;
    const TIPO_DISCAPACIDAD = await pool.query(
      `
      SELECT * FROM e_cat_discapacidad WHERE UPPER(nombre) = $1
      `
      , [nombre])
    if (TIPO_DISCAPACIDAD.rowCount > 0) {
      return res.jsonp(TIPO_DISCAPACIDAD.rows)
    }
    else {
      res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }

  public async list(req: Request, res: Response) {
    const DISCAPACIDAD = await pool.query(
      `
      SELECT * FROM eu_empleado_discapacidad
      `
    );
    if (DISCAPACIDAD.rowCount > 0) {
      return res.jsonp(DISCAPACIDAD.rows)
    }
    else {
      res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }

  
}

export const DISCAPACIDAD_CONTROLADOR = new DiscapacidadControlador();

export default DISCAPACIDAD_CONTROLADOR;