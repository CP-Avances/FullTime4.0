import { ObtenerIndicePlantilla, ObtenerRutaLeerPlantillas } from '../../../libs/accesoCarpetas';
import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import AUDITORIA_CONTROLADOR from '../../reportes/auditoriaControlador';
import pool from '../../../database';
import fs from 'fs';
import path from 'path';
import Excel from 'exceljs';

class GrupoOcupacionalControlador {

  // METODO PARA BUSCAR LISTA DE GRUPO OCUPACIONAL **USADO
  public async ListaGrupoOcupacional(req: Request, res: Response) {

    try {
      const GRUPO_OCUPACIONAL = await pool.query(
        `
        SELECT gp.id, gp.descripcion, gp.numero_partida FROM map_cat_grupo_ocupacional AS gp 
        ORDER BY gp.id ASC
        `
      );

      res.jsonp(GRUPO_OCUPACIONAL.rows);
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      res.status(500).jsonp({ message: 'Error al obtener los grupos ocupacionales' });
    }

  }

  // METODO PARA BUSCAR EL GRUPO OCUPACIONAL POR EMPLEADO **USADO
  public async GrupoOcupacionalByEmple(req: Request, res: Response) {
    const { id_empleado } = req.params;

    console.log('req.params: ', req.params)

    const EMPLEADO_GRUPO = await pool.query(
      `
      SELECT eg.id, eg.id_grupo_ocupacional, eg.estado, cg.descripcion AS grupo 
      FROM map_empleado_grupo_ocupacional AS eg, map_cat_grupo_ocupacional AS cg
      WHERE eg.id_empleado = $1 AND eg.id_grupo_ocupacional = cg.id
      `
      , [id_empleado]);
    if (EMPLEADO_GRUPO.rowCount != 0) {
      return res.status(200).jsonp({ grupo: EMPLEADO_GRUPO.rows, text: 'correcto', status: 200 })
    }

    res.status(404).jsonp({ grupo: undefined, text: 'Registro no encontrado.', status: 400 });
  }

  // METODO PARA INSERTAR EL GRUPO OCUPACIONAL **USADO
  public async IngresarGrupoOcupacional(req: Request, res: Response) {

    const { grupo, numero_partida, user_name, ip, ip_local } = req.body;

    try {

      const GRUPO = await pool.query(
        `
          SELECT gp.id, gp.descripcion, gp.numero_partida FROM map_cat_grupo_ocupacional AS gp
          WHERE UPPER(gp.descripcion) = UPPER($1) OR ($2 <> '' AND gp.numero_partida = $2)
          `
        , [grupo, numero_partida]);

      if (GRUPO.rows[0] != '' && GRUPO.rows[0] != null, GRUPO.rows[0] != undefined) {

        if (GRUPO.rows[0].descripcion.toLowerCase() == grupo.toLowerCase()) {
          res.status(300).jsonp({ message: 'Ya existe un grupo ocupacional registrado', codigo: 300 });
        } else {
          res.status(300).jsonp({ message: 'Ya existe el número de partida', codigo: 300 });
        }

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
      res.status(500).jsonp({ message: 'Error al guardar el grupo ocupacional.' });
    }

  }

  // METODO PARA EDITAR EL GRUPO OCUPACIONAL  **USADO
  public async EditarGrupoOcupacional(req: Request, res: Response) {

    const { id_grupo, grupo, numero_partida, user_name, ip, ip_local } = req.body;

    try {

      // INICIAR TRANSACCION
      await pool.query('BEGIN');
      const DataGrupoOcu = await pool.query(
        `
        SELECT * FROM map_cat_grupo_ocupacional WHERE (UPPER(descripcion) = UPPER($1) OR ($2 <> '' AND numero_partida = $2)) AND id != $3
        `
        , [grupo, numero_partida, id_grupo]);
      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');

      if (DataGrupoOcu.rows[0] != undefined && DataGrupoOcu.rows[0] != null && DataGrupoOcu.rows[0] != "") {
        if (DataGrupoOcu.rows[0].descripcion.toLowerCase() == grupo.toLowerCase()) {
          res.status(300).jsonp({ message: 'Ya existe un grupo ocupacional registrado.', codigo: 300 });
        } else {
          res.status(300).jsonp({ message: 'Ya existe el número de partida.', codigo: 300 });
        }

      } else {
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

        res.status(200).jsonp({ message: 'El grupo ocupacional se ha actualizado con éxito.', codigo: 200 });

      }

    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      res.status(500).jsonp({ message: 'Error al actualizar el grupo ocupacional.' + error });
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

      res.status(200).jsonp({ message: 'Registro eliminado.', codigo: 200 });

    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      res.status(500).jsonp({ message: 'Existen datos relacionados con este registro.' });
    }

  }

  // METODO PARA ELIMINAR EL GRUPO OCUPACIONAL POR EMPLEADO  **USADO
  public async EliminarEmpleGrupoOcupacional(req: Request, res: Response) {
    try {
      const { user_name, ip, ip_local } = req.body;
      const id = req.params.id;

      console.log('id: ', id);

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const proceso = await pool.query('SELECT * FROM map_empleado_grupo_ocupacional WHERE id = $1', [id]);
      const [datosOriginales] = proceso.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'map_empleado_grupo_ocupacional',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al eliminar proceso con id: ${id}`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
      }

      await pool.query(
        `
          DELETE FROM map_empleado_grupo_ocupacional WHERE id = $1
          `, [id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'map_empleado_grupo_ocupacional',
        usuario: user_name,
        accion: 'D',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: '',
        ip: ip,
        ip_local: ip_local,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.status(200).jsonp({ message: 'Registro eliminado.' });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'Error al eliminar registro.' });
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

            console.log('DESCRIPCION: ', DESCRIPCION)
            console.log('NUMERO_PARTIDA: ', NUMERO_PARTIDA)

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
                data.observacion = 'Grupo Ocupacional ' + data.observacion;
              }

              if (NUMERO_PARTIDA == undefined) {
                data.numero_partida = '-';
              }

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
            const VERIFICAR_GRUPO = await pool.query(
              `
                SELECT gp.id, gp.descripcion, gp.numero_partida FROM map_cat_grupo_ocupacional gp
                WHERE UPPER(gp.descripcion) = UPPER($1)
             `
              , [item.descripcion]);

            if (VERIFICAR_GRUPO.rowCount === 0) {

              const VERIFICAR_PARTIDA = await pool.query(
                `
                  SELECT * FROM map_cat_grupo_ocupacional gp WHERE gp.numero_partida = $1
                `
                , [item.numero_partida]);

              if (VERIFICAR_PARTIDA.rowCount === 0) {
                // DISCRIMINACION DE ELEMENTOS IGUALES
                if (duplicados.find((p: any) => ((p.descripcion.toLowerCase() === item.descripcion.toLowerCase()) ||
                  (p.numero_partida === item.numero_partida))

                ) == undefined) {
                  duplicados.push(item);
                } else {
                  item.observacion = '1';
                }

              } else {
                item.observacion = 'Número de partida ya existe en el sistema'
              }
            } else {
              item.observacion = 'Grupo Ocupacional ya existe en el sistema'
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

      if (numero_partida == '-') {
        num_partida = null
      } else {
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

  // REGISTRAR PROCESOS POR MEDIO DE INTERFAZ
  public async RegistrarGrupo(req: Request, res: Response) {
    const { id_grupo, listaUsuarios, user_name, ip, ip_local } = req.body;
    let error: boolean = false;

    try {
      for (const item of listaUsuarios) {

        const { id } = item;

        // INICIAR TRANSACCION
        await pool.query('BEGIN');
        const response: QueryResult = await pool.query(
          `
          SELECT * FROM map_empleado_grupo_ocupacional WHERE id_grupo_ocupacional = $1 and id_empleado = $2
          `
          , [id_grupo, id]);

        const [grupo] = response.rows;

        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'map_empleado_grupo_ocupacional',
          usuario: user_name,
          accion: 'I',
          datosOriginales: '',
          datosNuevos: JSON.stringify(grupo),
          ip: ip,
          ip_local: ip_local,
          observacion: null
        });
        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');

        if (grupo == undefined || grupo == '' || grupo == null) {

          // INICIAR TRANSACCION
          await pool.query('BEGIN');
          const response: QueryResult = await pool.query(
            `
            SELECT * FROM map_empleado_grupo_ocupacional WHERE id_empleado = $1 and estado = true
           `
            , [id]);

          const [grupo_activo] = response.rows;

          // AUDITORIA
          await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'map_empleado_grupo_ocupacional',
            usuario: user_name,
            accion: 'I',
            datosOriginales: '',
            datosNuevos: JSON.stringify(grupo_activo),
            ip: ip,
            ip_local: ip_local,
            observacion: null
          });
          // FINALIZAR TRANSACCION
          await pool.query('COMMIT');

          if (grupo_activo == undefined || grupo_activo == '' || grupo_activo == null) {

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            const responsee: QueryResult = await pool.query(
              `
              INSERT INTO map_empleado_grupo_ocupacional (id_empleado, id_grupo_ocupacional, estado) VALUES ($1, $2, $3) RETURNING *
              `
              , [id, id_grupo, true]);

            const [grupo_insert] = responsee.rows;

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'map_empleado_grupo_ocupacional',
              usuario: user_name,
              accion: 'I',
              datosOriginales: '',
              datosNuevos: JSON.stringify(grupo_insert),
              ip: ip,
              ip_local: ip_local,
              observacion: null
            });
            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');

          } else {

            // INICIAR TRANSACCION
            await pool.query('BEGIN');
            const grupo_update: QueryResult = await pool.query(
              `
              UPDATE map_empleado_grupo_ocupacional SET estado = false WHERE id = $1
              `
              , [grupo_activo.id]);

            const [grupo_UPD] = grupo_update.rows;
            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'map_empleado_grupo_ocupacional',
              usuario: user_name,
              accion: 'I',
              datosOriginales: '',
              datosNuevos: JSON.stringify(grupo_UPD),
              ip: ip,
              ip_local: ip_local,
              observacion: null
            });
            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');

            // INICIAR TRANSACCION
            await pool.query('BEGIN');
            const response: QueryResult = await pool.query(
              `
               INSERT INTO map_empleado_grupo_ocupacional (id_empleado, id_grupo_ocupacional, estado) VALUES ($1, $2, $3) RETURNING *
              `
              , [id, id_grupo, true]);

            const [nuevo_grupo] = response.rows;
            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'map_empleado_grupo_ocupacional',
              usuario: user_name,
              accion: 'I',
              datosOriginales: '',
              datosNuevos: JSON.stringify(nuevo_grupo),
              ip: ip,
              ip_local: ip_local,
              observacion: null
            });
            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
          }

        } else {

          if (grupo.estado == false) {
            //actualizao a true

            // INICIAR TRANSACCION
            await pool.query('BEGIN');
            const response: QueryResult = await pool.query(
              `
                SELECT * FROM map_empleado_grupo_ocupacional WHERE id_empleado = $1 and estado = true
              `
              , [id]);

            const [grupo_activo1] = response.rows;
            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'map_empleado_grupo_ocupacional',
              usuario: user_name,
              accion: 'I',
              datosOriginales: '',
              datosNuevos: JSON.stringify(grupo_activo1),
              ip: ip,
              ip_local: ip_local,
              observacion: null
            });
            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');

            if (grupo_activo1 != undefined && grupo_activo1 != null && grupo_activo1 != '') {
              // INICIAR TRANSACCION
              await pool.query('BEGIN');
              const grupo_update: QueryResult = await pool.query(
                `
                UPDATE map_empleado_grupo_ocupacional SET estado = true WHERE id = $1
                `
                , [grupo.id]);

              const [grup_UPD] = grupo_update.rows;
              // AUDITORIA
              await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'map_empleado_grupo_ocupacional',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: JSON.stringify(grup_UPD),
                ip: ip,
                ip_local: ip_local,
                observacion: null
              });
              // FINALIZAR TRANSACCION
              await pool.query('COMMIT');

              // INICIAR TRANSACCION
              await pool.query('BEGIN');
              const grupo_update_false: QueryResult = await pool.query(
                `
                UPDATE map_empleado_grupo_ocupacional SET estado = false WHERE id = $1
                `
                , [grupo_activo1.id]);

              const [grupo_UPD] = grupo_update_false.rows;
              // AUDITORIA
              await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'map_empleado_grupo_ocupacional',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: JSON.stringify(grupo_UPD),
                ip: ip,
                ip_local: ip_local,
                observacion: null
              });
              // FINALIZAR TRANSACCION
              await pool.query('COMMIT');
            } else {
              // INICIAR TRANSACCION
              await pool.query('BEGIN');
              const grupo_update: QueryResult = await pool.query(
                `
              UPDATE map_empleado_grupo_ocupacional SET estado = true WHERE id = $1
              `
                , [grupo.id]);

              const [grup_UPD] = grupo_update.rows;
              // AUDITORIA
              await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'map_empleado_grupo_ocupacional',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: JSON.stringify(grup_UPD),
                ip: ip,
                ip_local: ip_local,
                observacion: null
              });
              // FINALIZAR TRANSACCION
              await pool.query('COMMIT');
            }
          }
        }
      }
      return res.status(200).jsonp({ message: 'Registro de grupo ocupacional' });

    } catch {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      error = true;
      if (error) {
        return res.status(500).jsonp({ message: 'error' });
      }
    }


  }


  // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DE EMPLEADOS PROCESOS DENTRO DEL SISTEMA - MENSAJE DE CADA ERROR **USADO
  public async RevisarPantillaEmpleadoGrupoOcu(req: Request, res: Response): Promise<any> {

    try {
      const documento = req.file?.originalname;
      let separador = path.sep;
      let ruta = ObtenerRutaLeerPlantillas() + separador + documento;
      const workbook = new Excel.Workbook();
      await workbook.xlsx.readFile(ruta);
      let verificador = ObtenerIndicePlantilla(workbook, 'EMPLEADO_GRUPO_OCUPACIONAL');

      if (verificador === false) {
        return res.jsonp({ message: 'no_existe', data: undefined });
      } else {
        const sheet_name_list = workbook.worksheets.map(sheet => sheet.name);
        const plantilla = workbook.getWorksheet(sheet_name_list[verificador]);
        let data: any = {
          fila: '',
          nombre: '',
          apellido: '',
          cedula: '',
          grupo_ocupacional: '',
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
          if (!headers['ITEM'] || !headers['NOMBRE'] || !headers['APELLIDO'] || !headers['CEDULA'] || !headers['GRUPO_OCUPACIONAL']
          ) {
            return res.jsonp({ message: 'Cabeceras faltantes', data: undefined });
          }

          // LECTURA DE LOS DATOS DE LA PLANTILLA
          plantilla.eachRow((row, rowNumber) => {

            // SALTAR LA FILA DE LAS CABECERAS
            if (rowNumber === 1) return;
            // LEER LOS DATOS SEGUN LAS COLUMNAS ENCONTRADAS
            const ITEM = row.getCell(headers['ITEM']).value;
            const NOMBRE = row.getCell(headers['NOMBRE']).value?.toString().trim();
            const APELLIDO = row.getCell(headers['APELLIDO']).value?.toString().trim();
            const CEDULA = row.getCell(headers['CEDULA']).value?.toString().trim();
            const GRUPO_OCUPACIONAL = row.getCell(headers['GRUPO_OCUPACIONAL']).value?.toString().trim();

            // VERIFICAR QUE EL REGISTO NO TENGA DATOS VACIOS
            if ((ITEM != undefined && ITEM != '') &&
              (NOMBRE != undefined && NOMBRE != '') &&
              (APELLIDO != undefined && APELLIDO != '') &&
              (CEDULA != undefined && CEDULA != '') &&
              (GRUPO_OCUPACIONAL != undefined && GRUPO_OCUPACIONAL != '')) {

              data.fila = ITEM;
              data.nombre = NOMBRE,
                data.apellido = APELLIDO,
                data.cedula = CEDULA,
                data.grupo_ocupacional = GRUPO_OCUPACIONAL,
                data.observacion = 'no registrado';

              listaGrupoOcupacional.push(data);

            } else {

              data.fila = ITEM;
              data.nombre = NOMBRE,
                data.apellido = APELLIDO,
                data.cedula = CEDULA,
                data.grupo_ocupacional = GRUPO_OCUPACIONAL,
                data.observacion = 'no registrado';

              if (data.fila == '' || data.fila == undefined) {
                data.fila = 'error';
                mensaje = 'error'
              }

              if (NOMBRE == undefined) {
                data.nombre = '-';
              }

              if (APELLIDO == undefined) {
                data.apellido = '-';
              }

              if (CEDULA == undefined) {
                data.cedula = 'No registrado';
                data.observacion = 'Cédula ' + data.observacion;
              }

              if (GRUPO_OCUPACIONAL == undefined) {
                data.grupo_ocupacional = 'No registrado';
                data.observacion = 'Grupo Ocupacional ' + data.observacion;
              }

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
            const VERIFICAR_IDEMPLEADO = await pool.query(
              `
              SELECT id FROM eu_empleados WHERE cedula = $1
              `
              , [item.cedula.trim()]);

            if (VERIFICAR_IDEMPLEADO.rows[0] != undefined) {

              let id_empleado = VERIFICAR_IDEMPLEADO.rows[0].id

              const VERIFICAR_IDGRUPOOCU = await pool.query(
                `
                SELECT id FROM map_cat_grupo_ocupacional WHERE UPPER(descripcion) = UPPER($1)
                `
                , [item.grupo_ocupacional.trim()]);

              if (VERIFICAR_IDGRUPOOCU.rows[0] != undefined) {

                let id_grupoOcupa = VERIFICAR_IDGRUPOOCU.rows[0].id

                const response: QueryResult = await pool.query(
                  `
                   SELECT * FROM map_empleado_grupo_ocupacional WHERE id_grupo_ocupacional = $1 and id_empleado = $2 and estado = true
                  `
                  , [id_grupoOcupa, id_empleado]);

                const [gupoOcu_emple] = response.rows;

                if (gupoOcu_emple != undefined && gupoOcu_emple != '' && gupoOcu_emple != null) {
                  item.observacion = 'Ya existe un registro activo con este Grupo Ocupacional.'
                } else {
                  if (item.observacion == 'no registrado') {
                    // DISCRIMINACION DE ELEMENTOS IGUALES
                    if (duplicados.find((p: any) => (p.cedula.trim() === item.cedula.trim())
                    ) == undefined) {
                      duplicados.push(item);
                    } else {
                      item.observacion = '1';
                    }
                  }
                }

              } else {
                item.observacion = 'Grupo Ocupacional no esta registrado en el sistema'
              }

            } else {
              item.observacion = 'La cédula ingresada no esta registrada en el sistema'
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

  // METODO PARA REGISTRAR EMPLEADOS GRUPO POR MEDIO DE PLANTILLA
  public async RegistrarEmpleadoGrupoOcu(req: Request, res: Response): Promise<any> {
    const { plantilla, user_name, ip, ip_local } = req.body;
    let error: boolean = false;

    try {
      for (const item of plantilla) {

        const { cedula, grupo_ocupacional } = item;

        await pool.query('BEGIN');
        const VERIFICAR_IDGRUPO = await pool.query(
          `
          SELECT id FROM map_cat_grupo_ocupacional WHERE UPPER(descripcion) = UPPER($1)
          `
          , [grupo_ocupacional]);

        const id_grupo_ocupacional = VERIFICAR_IDGRUPO.rows[0].id;
        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');

        await pool.query('BEGIN');
        const VERIFICAR_IDEMPLEADO = await pool.query(
          `
          SELECT id FROM eu_empleados WHERE cedula = $1
          `
          , [cedula.trim()]);

        const id_empleado = VERIFICAR_IDEMPLEADO.rows[0].id;
        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');

        console.log('id_grupo_ocupacional: ', id_grupo_ocupacional)
        console.log('id_empleado: ', id_empleado)

        // INICIAR TRANSACCION
        await pool.query('BEGIN');
        const response: QueryResult = await pool.query(
          `
            SELECT * FROM map_empleado_grupo_ocupacional WHERE id_grupo_ocupacional = $1 and id_empleado = $2
           `
          , [id_grupo_ocupacional, id_empleado]);

        const [Gupo_Ocupacionales] = response.rows;
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'map_empleado_grupo_ocupacional',
          usuario: user_name,
          accion: 'I',
          datosOriginales: '',
          datosNuevos: JSON.stringify(Gupo_Ocupacionales),
          ip: ip,
          ip_local: ip_local,
          observacion: null
        });
        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');

        if (Gupo_Ocupacionales == undefined || Gupo_Ocupacionales == '' || Gupo_Ocupacionales == null) {

          // INICIAR TRANSACCION
          await pool.query('BEGIN');
          const response: QueryResult = await pool.query(
            `
            SELECT * FROM map_empleado_grupo_ocupacional WHERE id_empleado = $1 and estado = true
           `
            , [id_empleado]);

          const [grupo_activo] = response.rows;
          // AUDITORIA
          await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'map_empleado_grupo_ocupacional',
            usuario: user_name,
            accion: 'I',
            datosOriginales: '',
            datosNuevos: JSON.stringify(grupo_activo),
            ip: ip,
            ip_local: ip_local,
            observacion: null
          });
          // FINALIZAR TRANSACCION
          await pool.query('COMMIT');

          if (grupo_activo == undefined || grupo_activo == '' || grupo_activo == null) {

            // INICIAR TRANSACCION
            await pool.query('BEGIN');
            const responsee: QueryResult = await pool.query(
              `
              INSERT INTO map_empleado_grupo_ocupacional (id_grupo_ocupacional, id_empleado, estado) VALUES ($1, $2, $3) RETURNING *
              `
              , [id_grupo_ocupacional, id_empleado, true]);

            const [grupo_insert] = responsee.rows;

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'map_empleado_grupo_ocupacional',
              usuario: user_name,
              accion: 'I',
              datosOriginales: '',
              datosNuevos: JSON.stringify(grupo_insert),
              ip: ip,
              ip_local: ip_local,
              observacion: null
            });
            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');



          } else {

            // INICIAR TRANSACCION
            await pool.query('BEGIN');
            const grupo_update: QueryResult = await pool.query(
              `
              UPDATE map_empleado_grupo_ocupacional SET estado = false WHERE id = $1
              `
              , [grupo_activo.id]);

            const [proceso_UPD] = grupo_update.rows;
            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'map_empleado_grupo_ocupacional',
              usuario: user_name,
              accion: 'I',
              datosOriginales: '',
              datosNuevos: JSON.stringify(proceso_UPD),
              ip: ip,
              ip_local: ip_local,
              observacion: null
            });
            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');

            // INICIAR TRANSACCION
            await pool.query('BEGIN');
            const response: QueryResult = await pool.query(
              `
               INSERT INTO map_empleado_grupo_ocupacional (id_grupo_ocupacional, id_empleado, estado) VALUES ($1, $2, $3) RETURNING *
              `
              , [id_grupo_ocupacional, id_empleado, true]);

            const [nuevo_grupo] = response.rows;
            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'map_empleado_grupo_ocupacional',
              usuario: user_name,
              accion: 'I',
              datosOriginales: '',
              datosNuevos: JSON.stringify(nuevo_grupo),
              ip: ip,
              ip_local: ip_local,
              observacion: null
            });
            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
          }

        } else {
          console.log('Gupo_Ocupacionales: ', Gupo_Ocupacionales.estado)
          if (Gupo_Ocupacionales.estado == false) {

            // INICIAR TRANSACCION
            await pool.query('BEGIN');
            const response: QueryResult = await pool.query(
              `
                SELECT * FROM map_empleado_grupo_ocupacional WHERE id_empleado = $1 and estado = true
              `
              , [id_empleado]);

            const [grupo_activo1] = response.rows;
            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'map_empleado_procesos',
              usuario: user_name,
              accion: 'I',
              datosOriginales: '',
              datosNuevos: JSON.stringify(grupo_activo1),
              ip: ip,
              ip_local: ip_local,
              observacion: null
            });
            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');

            console.log('grupo_ocupacional: ', Gupo_Ocupacionales.id)

            // INICIAR TRANSACCION
            await pool.query('BEGIN');
            const grupo_update: QueryResult = await pool.query(
              `
              UPDATE map_empleado_grupo_ocupacional SET estado = true WHERE id = $1
              `
              , [Gupo_Ocupacionales.id]);

            const [grupoOcu_UPD] = grupo_update.rows;
            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'map_empleado_grupo_ocupacional',
              usuario: user_name,
              accion: 'I',
              datosOriginales: '',
              datosNuevos: JSON.stringify(grupoOcu_UPD),
              ip: ip,
              ip_local: ip_local,
              observacion: null
            });
            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');

            if (grupo_activo1 != undefined) {
              // INICIAR TRANSACCION
              await pool.query('BEGIN');
              const grupo_update1: QueryResult = await pool.query(
                `
              UPDATE map_empleado_grupo_ocupacional SET estado = false WHERE id = $1
              `
                , [grupo_activo1.id]);

              const [grupo_UPD1] = grupo_update1.rows;
              // AUDITORIA
              await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'map_empleado_grupo_ocupacional',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: JSON.stringify(grupo_UPD1),
                ip: ip,
                ip_local: ip_local,
                observacion: null
              });
              // FINALIZAR TRANSACCION
              await pool.query('COMMIT');
            }




          }
        }
      }

      return res.status(200).jsonp({ message: 'Registro de grupo ocuapcional' });

    } catch {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      error = true;
      if (error) {
        return res.status(500).jsonp({ message: 'error' });
      }
    }

  }

  // METODO PARA EDITAR EL REGISTRO DEL EMPLEADOS PROCESOS
  public async EditarRegistroGrupoEmple(req: Request, res: Response): Promise<any> {
    try {

      const { id_empleado, id, id_accion, estado, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');
      const response: QueryResult = await pool.query(
        `
          SELECT * FROM map_empleado_grupo_ocupacional WHERE id_empleado = $1 AND id_grupo_ocupacional = $2
        `
        , [id_empleado, id_accion]);

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      const [grupo_activo1] = response.rows;

      if (grupo_activo1 != undefined && grupo_activo1 != null) {

        if (grupo_activo1.id != id) {
          return res.status(500).jsonp({ message: 'Grupo Ocupacional ya asignado' });
        }
      }

      console.log('estado: ', estado)

      if (estado == true) {
        // CONSULTAR DATOSORIGINALES
        // INICIAR TRANSACCION
        await pool.query('BEGIN');
        const grupo = await pool.query(
          `
              SELECT * FROM map_empleado_grupo_ocupacional WHERE id_empleado = $1 AND estado = true
              `
          , [id_empleado]);
        const [grupo_] = grupo.rows;
        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');

        if (grupo_ != undefined || grupo_ != null) {
          // INICIAR TRANSACCION
          await pool.query('BEGIN');
          await pool.query(
            `
                UPDATE map_empleado_grupo_ocupacional SET estado = $1 WHERE id = $2
                `
            , [false, grupo_.id]);
          // FINALIZAR TRANSACCION
          await pool.query('COMMIT');
        }

        // INICIAR TRANSACCION
        await pool.query('BEGIN');
        await pool.query(
          `
                UPDATE map_empleado_grupo_ocupacional SET id_grupo_ocupacional = $1, estado = $2 WHERE id = $3
                `
          , [id_accion, estado, id]);
        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');

      } else {
        // INICIAR TRANSACCION
        await pool.query('BEGIN');
        await pool.query(
          `
                UPDATE map_empleado_grupo_ocupacional SET id_grupo_ocupacional = $1, estado = $2 WHERE id = $3
                `
          , [id_accion, estado, id]);
        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');

      }

      return res.jsonp({ message: 'Registro actualizado exitosamente' });


    } catch (error) {
      return res.status(500).jsonp({ message: error });
    }
  }

  // METODO PARA ELIMINAR DATOS DE MANERA MULTIPLE
  public async EliminarGrupoMultiple(req: Request, res: Response): Promise<any> {
    const { listaEliminar, user_name, ip, ip_local } = req.body;
    let error: boolean = false;
    var count = 0;
    var count_no = 0;
   
    try {

      for (const item of listaEliminar) {

        // INICIAR TRANSACCION
        await pool.query('BEGIN');
      
        const resultado = await pool.query(
          `
             SELECT * FROM map_cat_grupo_ocupacional WHERE id = $1
           `
          , [item.id]);
        const [existe_grupo] = resultado.rows;

        if (!existe_grupo) {
          // AUDITORIA
          await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'map_cat_grupo_ocupacional',
            usuario: user_name,
            accion: 'D',
            datosOriginales: '',
            datosNuevos: '',
            ip: ip,
            ip_local: ip_local,
            observacion: `Error al eliminar el Grupo ocupacional con id: ${item.id}. Registro no encontrado.`
          });
        }
        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');

        if (existe_grupo) {

          // INICIAR TRANSACCION
          await pool.query('BEGIN');
          
          const resultado = await pool.query(
            `
             SELECT * FROM map_empleado_grupo_ocupacional WHERE id_grupo_ocupacional = $1
           `
            , [item.id]);

          const [existe_grupo_emple] = resultado.rows;

          if (!existe_grupo_emple) {
            // INICIAR TRANSACCION
            await pool.query('BEGIN');
            
            const res = await pool.query(
              `
             DELETE FROM map_cat_grupo_ocupacional WHERE id = $1
           `
              , [item.id]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'map_cat_grupo_ocupacional',
              usuario: user_name,
              accion: 'D',
              datosOriginales: JSON.stringify(existe_grupo),
              datosNuevos: '',
              ip: ip,
              ip_local: ip_local,
              observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');

            //CONTADOR ELIMINADOS
            count += 1;

          } else {
            count_no += 1;
          }

        }

      }

      res.status(200).jsonp({ message: count.toString()+' registros eliminados con éxito', ms2: 'Existen'+ count_no +' datos relacionados con el grupo ocupacional', codigo: 200 });

    } catch (err) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      error = true;

      if (error) {
        if (err.table == 'map_empleado_grupo_ocupacional') {
          if (count == 1) {
            return res.status(300).jsonp({ message: 'Se ha eliminado ' + count + ' registro.', ms2: 'Existen datos relacionados con el grupo ocupacional' });
          } else {
            return res.status(300).jsonp({ message: 'Se ha eliminado ' + count + ' registros.', ms2: 'Existen datos relacionados con el grupo ocupacional ' });
          }
        } else {
          return res.status(500).jsonp({ message: 'No se puedo completar la operacion.' });
        }
      }
    }

  }

}

export const GRUPO_OCUPACIONAL_CONTROLADOR = new GrupoOcupacionalControlador();

export default GRUPO_OCUPACIONAL_CONTROLADOR;