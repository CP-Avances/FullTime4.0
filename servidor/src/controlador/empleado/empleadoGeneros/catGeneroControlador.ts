import { Request, Response } from 'express';
import pool from '../../../database';
import AUDITORIA_CONTROLADOR from '../../reportes/auditoriaControlador';

class GeneroControlador {

    // LISTA DE GENEROS

    public async ListarGeneros(req: Request, res: Response) {
        const GENEROS = await pool.query(
            `
      SELECT * FROM e_genero  ORDER BY genero ASC
      `
            );

        if (GENEROS.rowCount != 0) {
            return res.jsonp(GENEROS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }
}

export const GENERO_CONTROLADOR = new GeneroControlador();
export default GENERO_CONTROLADOR;