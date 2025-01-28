import { ObtenerIndicePlantilla, ObtenerRutaLeerPlantillas } from '../../../libs/accesoCarpetas';
import { Request, Response } from 'express';
import { Query, QueryResult } from 'pg';
import AUDITORIA_CONTROLADOR from '../../reportes/auditoriaControlador';
import pool from '../../../database';
import fs from 'fs';
import path from 'path';
import Excel from 'exceljs';

class GrupoOcupacionalControlador {

    // METODO PARA BUSCAR LISTA DE GRUPO OCUPACIONAL **USADO
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

  // METODO PARA INSERTAR EL GRUPO OCUPACIONAL **USADO
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

  // METODO PARA EDITAR EL GRUPO OCUPACIONAL  **USADO
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

  // METODO PARA ELIMINAR EL GRUPO OCUPACIONAL  **USADO
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

  // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR  **USADO
  public async RevisarDatos(req: Request, res: Response): Promise<any> {
    try {
      const documento = req.file?.originalname;
      let separador = path.sep;
      let ruta = ObtenerRutaLeerPlantillas() + separador + documento;
      const workbook = new Excel.Workbook();
      await workbook.xlsx.readFile(ruta);
      let verificador = ObtenerIndicePlantilla(workbook, 'GRUPO_OCUPACIONAL');

      if (verificador === false) {
        return res.jsonp({ message: 'no_existe', data: undefined });
      }
      else {
        const sheet_name_list = workbook.worksheets.map(sheet => sheet.name);
        const plantilla = workbook.getWorksheet(sheet_name_list[verificador]);
        let data: any = {
          fila: '',
          descripcion: '',
          numero_partida: '',
          observacion: ''
        };
        var listaGrupoOcupacional: any = [];
        var duplicados: any = [];
        var mensaje: string = 'correcto';

        if (plantilla) {

          // SUPONIENDO QUE LA PRIMERA FILA SON LAS CABECERAS
          const headerRow = plantilla.getRow(1);
          const headers: any = {};
          // CREAR UN MAPA CON LAS CABECERAS Y SUS POSICIONES, ASEGURANDO QUE LAS CLAVES ESTEN EN MAYUSCULAS
          headerRow.eachCell((cell: any, colNumber) => {
            headers[cell.value.toString().toUpperCase()] = colNumber;
          });

          // VERIFICA SI LAS CABECERAS ESENCIALES ESTAN PRESENTES
          if (!headers['ITEM'] || !headers['DESCRIPCION'] || !headers['NUMERO_PARTIDA']
          ) {
            return res.jsonp({ message: 'Cabeceras faltantes', data: undefined });
          }

          // LECTURA DE LOS DATOS DE LA PLANTILLA
          plantilla.eachRow((row, rowNumber) => {

            // SALTAR LA FILA DE LAS CABECERAS
            if (rowNumber === 1) return;
            // LEER LOS DATOS SEGUN LAS COLUMNAS ENCONTRADAS
            const ITEM = row.getCell(headers['ITEM']).value;
            const DESCRIPCION = row.getCell(headers['DESCRIPCION']).value?.toString().trim();
            const NUMERO_PARTIDA = row.getCell(headers['NUMERO_PARTIDA']).value?.toString().trim();

            // VERIFICAR QUE EL REGISTO NO TENGA DATOS VACIOS
            if ((ITEM != undefined && ITEM != '') &&
              (DESCRIPCION != undefined && DESCRIPCION != '') && 
              (NUMERO_PARTIDA != undefined && NUMERO_PARTIDA != '')) {

              data.fila = ITEM;
              data.descripcion = DESCRIPCION;
              data.numero_partida = NUMERO_PARTIDA
              data.observacion = 'no registrado';

              //USAMOS TRIM PARA ELIMINAR LOS ESPACIOS AL INICIO Y AL FINAL EN BLANCO.
              data.descripcion = data.descripcion.trim();
              data.numero_partida = data.numero_partida.trim();

              listaGrupoOcupacional.push(data);

            } else {
              data.fila = ITEM;
              data.descripcion = DESCRIPCION;
              data.numero_partida = NUMERO_PARTIDA
              data.observacion = 'no registrado';

              if (data.fila == '' || data.fila == undefined) {
                data.fila = 'error';
                mensaje = 'error'
              }

              if (DESCRIPCION == undefined) {
                data.descripcion = 'No registrado';
                data.observacion = 'Grado ' + data.observacion;
              }

              if (DESCRIPCION == undefined) {
                data.descripcion = '-';
              }

              //USAMOS TRIM PARA ELIMINAR LOS ESPACIOS AL INICIO Y AL FINAL EN BLANCO.
              data.descripcion = data.descripcion.trim();
              data.numero_partida = data.numero_partida.trim();

              listaGrupoOcupacional.push(data);
            }
            data = {};
          });
        }
        // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
        fs.access(ruta, fs.constants.F_OK, (err) => {
          if (err) {
          } else {
            // ELIMINAR DEL SERVIDOR
            fs.unlinkSync(ruta);
          }
        });

        // VALIDACINES DE LOS DATOS DE LA PLANTILLA
        listaGrupoOcupacional.forEach(async (item: any, index: number) => {
          if (item.observacion == 'no registrado') {
            const VERIFICAR_PROCESO = await pool.query(
              `
                SELECT gp.id, gp.descripcion, gp.numero_partida FROM map_cat_grupo_ocupacional gp
                WHERE UPPER(gp.descripcion) = UPPER($1)
             `
              , [item.descripcion]);

            if (VERIFICAR_PROCESO.rowCount === 0) {

              // DISCRIMINACION DE ELEMENTOS IGUALES
              if (duplicados.find((p: any) => (p.descripcion.toLowerCase() === item.descripcion.toLowerCase())
                //|| (p.proceso.toLowerCase() === item.proceso_padre.toLowerCase() && p.proceso.toLowerCase() === item.proceso_padre.toLowerCase())
              ) == undefined) {
                duplicados.push(item);
              } else {
                item.observacion = '1';
              }

            } else {
              item.observacion = 'Ya existe el en el sistema'
            }
          }
        });

        setTimeout(() => {
          listaGrupoOcupacional.sort((a: any, b: any) => {
            // COMPARA LOS NUMEROS DE LOS OBJETOS
            if (a.fila < b.fila) {
              return -1;
            }
            if (a.fila > b.fila) {
              return 1;
            }
            return 0; // SON IGUALES
          });

          var filaDuplicada: number = 0;

          listaGrupoOcupacional.forEach(async (item: any) => {
            if (item.observacion == '1') {
              item.observacion = 'Registro duplicado'
            } else if (item.observacion == 'no registrado') {
              item.observacion = 'ok'
            }

            // VALIDA SI LOS DATOS DE LA COLUMNA N SON NUMEROS.
            if (typeof item.fila === 'number' && !isNaN(item.fila)) {
              // CONDICION PARA VALIDAR SI EN LA NUMERACION EXISTE UN NUMERO QUE SE REPITE DARA ERROR.

              if (item.fila == filaDuplicada) {
                mensaje = 'error';
              }
            } else {
              return mensaje = 'error';
            }

            filaDuplicada = item.fila;

          });

          if (mensaje == 'error') {
            listaGrupoOcupacional = undefined;
          }

          return res.jsonp({ message: mensaje, data: listaGrupoOcupacional });
        }, 1000)
      }

    } catch (error) {
      return res.status(500).jsonp({ message: 'Error con el servidor método RevisarDatos.', status: '500' });
    }
  }

  // REGISTRAR PLANTILLA GRADO   **USADO 
  public async CargarPlantilla(req: Request, res: Response) {
    const { plantilla, user_name, ip, ip_local } = req.body;
    let error: boolean = false;

    for (const item of plantilla) {
      const { descripcion, numero_partida } = item;
      let num_partida

      if(numero_partida == '-'){
        num_partida = null
      }else{
        num_partida = numero_partida
      }

      try {
        // INICIAR TRANSACCION
        await pool.query('BEGIN');

        const response: QueryResult = await pool.query(
          `
            INSERT INTO map_cat_grupo_ocupacional (descripcion, numero_partida) VALUES ($1, $2) RETURNING *
            `
          , [descripcion, num_partida]);

        const [grupoOcu] = response.rows;

        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'map_cat_grupo_ocupacional',
          usuario: user_name,
          accion: 'I',
          datosOriginales: '',
          datosNuevos: JSON.stringify(grupoOcu),
          ip: ip,
          ip_local: ip_local,
          observacion: null
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');

      } catch (error) {
        // REVERTIR TRANSACCION
        await pool.query('ROLLBACK');
        error = true;
      }

    }

    if (error) {
      return res.status(500).jsonp({ message: 'error' });
    }
    return res.status(200).jsonp({ message: 'ok' });
  }

}

export const GRUPO_OCUPACIONAL_CONTROLADOR = new GrupoOcupacionalControlador();

export default GRUPO_OCUPACIONAL_CONTROLADOR;