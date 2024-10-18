import { Request, Response } from 'express';
import pool from '../../../database';

class NacionalidadControlador {

  // METODO PARA BUSCAR NACIONALIDADES   **USADO
  public async ListarNacionalidades(req: Request, res: Response) {
    const nacinalidad = await pool.query(
      `
      SELECT * FROM e_cat_nacionalidades
      `
    );
    res.jsonp(nacinalidad.rows);
  }

}

export const nacionalidadControlador = new NacionalidadControlador();

export default nacionalidadControlador;