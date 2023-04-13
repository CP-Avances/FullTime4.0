import { Request, Response } from 'express';
import pool from '../../database';

class NacionalidadControlador {

  public async ListarNacionalidades(req: Request, res: Response) {
    const nacinalidad = await pool.query(
      `
      SELECT * FROM nacionalidades
      `
    );
    res.jsonp(nacinalidad.rows);
  }

}

export const nacionalidadControlador = new NacionalidadControlador();

export default nacionalidadControlador;