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

    try{
      const GRUPO_OCUPACIONAL = await pool.query(
        `
        SELECT gp.id, gp.descripcion, gp.numero_partida FROM map_cat_grupo_ocupacional AS gp 
        ORDER BY gp.id DESC
        `
      );
  
      res.jsonp(GRUPO_OCUPACIONAL.rows);
    }catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      res.status(500).jsonp({ message: 'Error al optener los grupos ocupacionales' });
    }
    
  }

  // METODO PARA INSERTAR EL GRADO
  public async IngresarGrupoOcupacional(req: Request, res: Response) {

    const { grupo, numero_partida, user_name, ip, ip_local } = req.body;

    try {

      const GRUPO = await pool.query(
        `
          SELECT gp.id, gp.descripcion, gp.numero_partida FROM map_cat_grupo_ocupacional AS gp
          WHERE UPPER(gp.descripcion) = UPPER($1)
          `
        , [grupo]);

      if (GRUPO.rows[0] != '' && GRUPO.rows[0] != null, GRUPO.rows[0] != undefined) {

        res.jsonp({ message: 'Ya existe un grupo ocupacional con ese nombre', codigo: 300 });

      } else {

        // INICIAR TRANSACCION
        await pool.query('BEGIN');
        const response: QueryResult = await pool.query(
          `
            INSERT INTO map_cat_grupo_ocupacional (descripcion, numero_partida) VALUES ($1, $2) RETURNING * 
            `
          , [grupo, numero_partida]);

        const [grupo_ocupacional] = response.rows;

        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'map_cat_grupo_ocupacional',
          usuario: user_name,
          accion: 'I',
          datosOriginales: '',
          datosNuevos: JSON.stringify(grupo_ocupacional),
          ip: ip,
          ip_local: ip_local,
          observacion: null
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');

        res.jsonp({ message: 'El grupo ocupacional ha sido guardado con éxito', codigo: 200 });
      }

    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      res.status(500).jsonp({ message: 'Error al guardar el grupo ocupacional'});
    }

  }

  // METODO PARA EDITAR EL GRADO
  public async EditarGrupoOcupacional(req: Request, res: Response) {

    const { id_grupo, grupo, numero_partida, user_name, ip, ip_local } = req.body;

    try {

        // INICIAR TRANSACCION
        await pool.query('BEGIN');

        await pool.query( 
          `
            UPDATE map_cat_grupo_ocupacional SET descripcion = $2, numero_partida = $3 WHERE id = $1
          `
          , [id_grupo, grupo, numero_partida]);

        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'map_cat_procesos',
          usuario: user_name,
          accion: 'I',
          datosOriginales: '',
          datosNuevos: `{"id": "${id_grupo}"}, {"descripcion": "${grupo}"}, {"numero_partida": "${numero_partida}"}`,
          ip: ip,
          ip_local: ip_local,
          observacion: null
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');

        res.status(200).jsonp({ message: 'El grupo ocupacional se ha actualizado con éxito', codigo: 200 });

    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      res.status(500).jsonp({ message: 'Error al actualizar el grupo ocupacional'});
    }

  }

  // METODO PARA ELIMINAR EL GRADO
  public async EliminarGrupoOcupacional(req: Request, res: Response) {

    const { id_grupo, user_name, ip, ip_local } = req.body;

    try {

        // INICIAR TRANSACCION
        await pool.query('BEGIN');

        await pool.query( 
          `
            DELETE FROM map_cat_grupo_ocupacional WHERE id = $1
          `
          , [id_grupo]);

        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'map_cat_grupo_ocupacional',
          usuario: user_name,
          accion: 'I',
          datosOriginales: '',
          datosNuevos: `{"id": "${id_grupo}"}`,
          ip: ip,
          ip_local: ip_local,
          observacion: null
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');

        res.status(200).jsonp({ message: 'El grado se ha eliminado con éxito', codigo: 200});

    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      res.status(500).jsonp({ message: 'Error al eliminar el grado'});
    }

  }

}

export const GRUPO_OCUPACIONAL_CONTROLADOR = new GrupoOcupacionalControlador();

export default GRUPO_OCUPACIONAL_CONTROLADOR;