import { ObtenerIndicePlantilla, ObtenerRutaLeerPlantillas } from '../../../libs/accesoCarpetas';
import { Request, Response } from 'express';
import { Query, QueryResult } from 'pg';
import AUDITORIA_CONTROLADOR from '../../reportes/auditoriaControlador';
import pool from '../../../database';
import fs from 'fs';
import path from 'path';
import Excel from 'exceljs';

class GrupoOcupacionalControlador {

    // METODO PARA BUSCAR LISTA DE GRADOS
  public async listaGrupoOcupacional(req: Request, res: Response) {

    const GRUPO_OCUPACIONAL = await pool.query(
      `
      SELECT gp.id, gp.descripcion, gp.numero_partida FROM map_cat_grupo_ocupacional AS gp 
      ORDER BY gp.id DESC
      `
    );

    res.jsonp(GRUPO_OCUPACIONAL.rows);
  }

}

export const GRUPO_OCUPACIONAL_CONTROLADOR = new GrupoOcupacionalControlador();

export default GRUPO_OCUPACIONAL_CONTROLADOR;