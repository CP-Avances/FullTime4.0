import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../../../database';

class DiscapacidadControlador {

  // METODO PARA BUSCAR DATOS DISCAPACIDAD USUARIO
  public async BuscarDiscapacidadUsuario(req: Request, res: Response): Promise<any> {
    const { id_empleado } = req.params;
    const unaDiscapacidad = await pool.query(
      `
      SELECT cd.id_empleado, cd.carn_conadis, cd.porcentaje, cd.tipo, td.nombre AS nom_tipo
      FROM cg_discapacidades cd, tipo_discapacidad td, empleados e
      WHERE cd.id_empleado = e.id AND cd.tipo = td.id AND cd.id_empleado = $1
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
      INSERT INTO cg_discapacidades (id_empleado, carn_conadis, porcentaje, tipo) 
      VALUES ($1, $2, $3, $4)
      `
      , [id_empleado, carn_conadis, porcentaje, tipo]);
    res.jsonp({ message: 'Discapacidad guardada' });
  }

  // METODO PARA ACTUALIZAR DATOS DE REGISTRO
  public async ActualizarDiscapacidad(req: Request, res: Response): Promise<void> {
    const id_empleado = req.params.id_empleado;
    const { carn_conadis, porcentaje, tipo } = req.body;
    await pool.query(
      `
      UPDATE cg_discapacidades SET carn_conadis = $1, porcentaje = $2, tipo = $3 
      WHERE id_empleado = $4
      `
      , [carn_conadis, porcentaje, tipo, id_empleado]);
    res.jsonp({ message: 'Registro actualizado.' });
  }

  public async EliminarDiscapacidad(req: Request, res: Response): Promise<void> {
    const id_empleado = req.params.id_empleado;
    await pool.query(
      `
      DELETE FROM cg_discapacidades WHERE id_empleado = $1
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
      INSERT INTO tipo_discapacidad (nombre) VALUES ($1) RETURNING *
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
      SELECT * FROM tipo_discapacidad
      `
    );
    if (TIPO_DISCAPACIDAD.rowCount > 0) {
      return res.jsonp(TIPO_DISCAPACIDAD.rows)
    }
    else {
      res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }













  public async list(req: Request, res: Response) {
    const DISCAPACIDAD = await pool.query('SELECT * FROM cg_discapacidades');
    if (DISCAPACIDAD.rowCount > 0) {
      return res.jsonp(DISCAPACIDAD.rows)
    }
    else {
      res.status(404).jsonp({ text: 'Discapacidad no encontrada' });
    }
  }








  /* TIPO DISCAPACIDAD */



  public async ObtenerUnTipoD(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const TIPO_DISCAPACIDAD = await pool.query('SELECT * FROM tipo_discapacidad WHERE id = $1', [id]);
    if (TIPO_DISCAPACIDAD.rowCount > 0) {
      return res.jsonp(TIPO_DISCAPACIDAD.rows)
    }
    else {
      res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }

  public async ActualizarTipoD(req: Request, res: Response): Promise<void> {
    const id = req.params;
    const { nombre } = req.body;
    await pool.query('UPDATE tipo_discapacidad SET nombre = $1 WHERE id = $2', [nombre, id]);
    res.jsonp({ message: 'Tipo de Discapacidad actualizado exitosamente' });
  }


}

export const DISCAPACIDAD_CONTROLADOR = new DiscapacidadControlador();

export default DISCAPACIDAD_CONTROLADOR;