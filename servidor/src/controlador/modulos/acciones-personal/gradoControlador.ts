import { ObtenerIndicePlantilla, ObtenerRutaLeerPlantillas } from '../../../libs/accesoCarpetas';
import { Request, Response } from 'express';
import { Query, QueryResult } from 'pg';
import AUDITORIA_CONTROLADOR from '../../reportes/auditoriaControlador';
import pool from '../../../database';
import fs from 'fs';
import path from 'path';
import Excel from 'exceljs';

class GradoControlador {

  // METODO PARA BUSCAR LISTA DE GRADOS
  public async listaGrados(req: Request, res: Response) {

    const GRADOS = await pool.query(
      `
      SELECT g.id, g.descripcion FROM map_cat_grado AS g
      ORDER BY g.id DESC
      `
    );

    res.jsonp(GRADOS.rows);
  }

}

export const GRADO_CONTROLADOR = new GradoControlador();

export default GRADO_CONTROLADOR;