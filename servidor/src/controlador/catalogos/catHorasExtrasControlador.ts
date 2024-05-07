import { Request, Response } from 'express';
import { QueryResult } from "pg";
import pool from '../../database';

class HorasExtrasControlador {
  public async ListarHorasExtras(req: Request, res: Response) {
    const HORAS_EXTRAS = await pool.query(
      `
      SELECT * FROM mhe_configurar_hora_extra
      `
    );
    if (HORAS_EXTRAS.rowCount > 0) {
      return res.jsonp(HORAS_EXTRAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  public async ObtenerUnaHoraExtra(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const HORAS_EXTRAS = await pool.query(
      `
      SELECT * FROM mhe_configurar_hora_extra WHERE id = $1
      `
      , [id]);
    if (HORAS_EXTRAS.rowCount > 0) {
      return res.jsonp(HORAS_EXTRAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  public async CrearHoraExtra(req: Request, res: Response) {
    const { descripcion, tipo_descuento, reca_porcentaje, hora_inicio, hora_final, hora_jornada, tipo_dia, codigo,
      incl_almuerzo, tipo_funcion } = req.body;
    const response: QueryResult = await pool.query(
      `
      INSERT INTO mhe_configurar_hora_extra ( descripcion, tipo_descuento, recargo_porcentaje, hora_inicio, hora_final, 
        hora_jornada, tipo_dia, codigo, minutos_comida, tipo_funcion ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
      `
      , [descripcion, tipo_descuento, reca_porcentaje, hora_inicio, hora_final, hora_jornada, tipo_dia, codigo, incl_almuerzo,
        tipo_funcion]);

    const [HORA] = response.rows;

    if (HORA) {
      return res.status(200).jsonp(HORA);
    } else {
      return res.status(404).jsonp({ message: "error" });
    }
  }

  public async EliminarRegistros(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    await pool.query(
      `
      DELETE FROM mhe_configurar_hora_extra WHERE id = $1
      `
      , [id]);
    res.jsonp({ message: 'Registro eliminado.' });
  }

  public async ActualizarHoraExtra(req: Request, res: Response): Promise<void> {
    const { descripcion, tipo_descuento, reca_porcentaje, hora_inicio, hora_final, hora_jornada, tipo_dia, codigo,
      incl_almuerzo, tipo_funcion, id } = req.body;
    await pool.query(
      `
      UPDATE mhe_configurar_hora_extra SET descripcion = $1, tipo_descuento = $2, recargo_porcentaje = $3, hora_inicio = $4, 
        hora_final = $5, hora_jornada = $6, tipo_dia = $7, codigo = $8, minutos_comida = $9, tipo_funcion = $10 
      WHERE id = $11
      `
      , [descripcion, tipo_descuento, reca_porcentaje, hora_inicio, hora_final, hora_jornada, tipo_dia, codigo,
        incl_almuerzo, tipo_funcion, id]);
    res.jsonp({ message: 'Hora extra actualizada.' });
  }

}

export const horaExtraControlador = new HorasExtrasControlador();

export default horaExtraControlador;