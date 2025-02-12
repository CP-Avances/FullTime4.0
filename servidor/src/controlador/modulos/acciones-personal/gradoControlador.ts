import { ObtenerIndicePlantilla, ObtenerRutaLeerPlantillas } from '../../../libs/accesoCarpetas';
import { Request, Response } from 'express';
import { Query, QueryResult } from 'pg';
import AUDITORIA_CONTROLADOR from '../../reportes/auditoriaControlador';
import pool from '../../../database';
import fs from 'fs';
import path from 'path';
import Excel from 'exceljs';

class GradoControlador {

  // METODO PARA BUSCAR LISTA DE GRADOS **USADO 
  public async listaGrados(req: Request, res: Response) {

    try{

      const GRADOS = await pool.query(
        `
        SELECT g.id, g.descripcion FROM map_cat_grado AS g
        ORDER BY g.id DESC
        `
      );
  
      res.jsonp(GRADOS.rows);

    }catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      res.status(500).jsonp({ message: 'Error al optener los grados' });
    }

  }

  // METODO PARA INSERTAR EL GRADO **USADO 
  public async IngresarGrados(req: Request, res: Response) {

    const { grado, user_name, ip, ip_local } = req.body;

    try {

      const GRADOS = await pool.query(
        `
          SELECT g.id, g.descripcion FROM map_cat_grado AS g
          WHERE UPPER(g.descripcion) = UPPER($1)
          `
        , [grado]);

      if (GRADOS.rows[0] != '' && GRADOS.rows[0] != null, GRADOS.rows[0] != undefined) {

        res.jsonp({ message: 'Ya existe un grado con ese nombre', codigo: 300 });

      } else {

        // INICIAR TRANSACCION
        await pool.query('BEGIN');

        await pool.query(
          `
            INSERT INTO map_cat_grado (descripcion) VALUES ($1)
            `
          , [grado]);

        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'map_cat_procesos',
          usuario: user_name,
          accion: 'I',
          datosOriginales: '',
          datosNuevos: `{"descripcion": "${grado}"}`,
          ip: ip,
          ip_local: ip_local,
          observacion: null
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');

        res.jsonp({ message: 'El grado ha sido guardado con éxito', codigo: 200 });
      }

    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      res.status(500).jsonp({ message: 'Error al guardar el grado'});
    }

  }

  // METODO PARA EDITAR EL GRADO **USADO 
  public async EditarGrados(req: Request, res: Response) {

    const { id_grado, grado, user_name, ip, ip_local } = req.body;

    try {

        // INICIAR TRANSACCION
        await pool.query('BEGIN');

        await pool.query( 
          `
            UPDATE map_cat_grado SET descripcion = $2 WHERE id = $1
          `
          , [id_grado, grado]);

        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'map_cat_procesos',
          usuario: user_name,
          accion: 'I',
          datosOriginales: '',
          datosNuevos: `{"id": "${id_grado}"}, {"descripcion": "${grado}"}`,
          ip: ip,
          ip_local: ip_local,
          observacion: null
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');

        res.status(200).jsonp({ message: 'El grado ha actualizado con éxito', codigo: 200 });

    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      res.status(500).jsonp({ message: 'Error al actualizar el grado'});
    }

  }

  // METODO PARA ELIMINAR EL GRADO **USADO 
  public async EliminarGrados(req: Request, res: Response) {

    const { id_grado, user_name, ip, ip_local } = req.body;

    console.log('datos a enviar: ', req.body)

    try {

        // INICIAR TRANSACCION
        await pool.query('BEGIN');

        await pool.query( 
          `
            DELETE FROM map_cat_grado WHERE id = $1
          `
          , [id_grado]);

        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'map_cat_procesos',
          usuario: user_name,
          accion: 'I',
          datosOriginales: '',
          datosNuevos: `{"id": "${id_grado}"}`,
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
      let verificador = ObtenerIndicePlantilla(workbook, 'GRADO');

      if (verificador === false) {
        return res.jsonp({ message: 'no_existe', data: undefined });
      }
      else {
        const sheet_name_list = workbook.worksheets.map(sheet => sheet.name);
        const plantilla = workbook.getWorksheet(sheet_name_list[verificador]);
        let data: any = {
          fila: '',
          descripcion: '',
          observacion: ''
        };
        var listaGrados: any = [];
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
          if (!headers['ITEM'] || !headers['DESCRIPCION']
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

            // VERIFICAR QUE EL REGISTO NO TENGA DATOS VACIOS
            if ((ITEM != undefined && ITEM != '') &&
              (DESCRIPCION != undefined && DESCRIPCION != '')) {

              data.fila = ITEM;
              data.descripcion = DESCRIPCION;
              data.observacion = 'no registrado';

              //USAMOS TRIM PARA ELIMINAR LOS ESPACIOS AL INICIO Y AL FINAL EN BLANCO.
              data.descripcion = data.descripcion.trim();

              listaGrados.push(data);

            } else {
              data.fila = ITEM;
              data.descripcion = DESCRIPCION;
              data.observacion = 'no registrado';

              if (data.fila == '' || data.fila == undefined) {
                data.fila = 'error';
                mensaje = 'error'
              }

              if (DESCRIPCION == undefined) {
                data.descripcion = 'No registrado';
                data.observacion = 'Grado ' + data.observacion;
              }

              //USAMOS TRIM PARA ELIMINAR LOS ESPACIOS AL INICIO Y AL FINAL EN BLANCO.
              data.descripcion = data.descripcion.trim();

              listaGrados.push(data);
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
        listaGrados.forEach(async (item: any, index: number) => {
          if (item.observacion == 'no registrado') {
            const VERIFICAR_PROCESO = await pool.query(
              `
                        SELECT g.id, g.descripcion FROM map_cat_grado AS g
                        WHERE UPPER(g.descripcion) = UPPER($1)
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
              item.observacion = 'Ya existe el grado en el sistema'
            }
          }
        });

        setTimeout(() => {
          listaGrados.sort((a: any, b: any) => {
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

          listaGrados.forEach(async (item: any) => {
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
            listaGrados = undefined;
          }

          return res.jsonp({ message: mensaje, data: listaGrados });
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
      const { descripcion } = item;
    
      try {
        // INICIAR TRANSACCION
        await pool.query('BEGIN');
        
        const response: QueryResult = await pool.query(
          `
          INSERT INTO map_cat_grado (descripcion) VALUES ($1) RETURNING *
          `
          , [descripcion]);
        const [gradoIn] = response.rows;
 
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'map_cat_grado',
          usuario: user_name,
          accion: 'I',
          datosOriginales: '',
          datosNuevos: JSON.stringify(gradoIn),
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
  public async  RegistrarGrados(req: Request, res: Response){
    const { id_grado, listaUsuarios, user_name, ip, ip_local } = req.body;
    let error: boolean = false;
    
    try{
      for (const item of listaUsuarios){

        const {id_empleado} = item;

         // INICIAR TRANSACCION
         await pool.query('BEGIN');
         const response: QueryResult = await pool.query(
           `
            SELECT * FROM map_empleado_grado WHERE id_grado = $1 and id_empleado = $2
           `
           , [id_grado, id_empleado]);

         const [grados] = response.rows;
         // AUDITORIA
         await AUDITORIA_CONTROLADOR.InsertarAuditoria({
           tabla: 'map_empleado_grado',
           usuario: user_name,
           accion: 'I',
           datosOriginales: '',
           datosNuevos: JSON.stringify(grados),
           ip: ip,
           ip_local: ip_local,
           observacion: null
         });
         // FINALIZAR TRANSACCION
         await pool.query('COMMIT');

         console.log('grados: ',grados)

        if (grados == undefined || grados == '' || grados == null) {

          // INICIAR TRANSACCION
          await pool.query('BEGIN');
          const response: QueryResult = await pool.query(
            `
            SELECT * FROM map_empleado_grado WHERE id_empleado = $1 and estado = true
           `
            , [id_empleado]);

          const [grado_activo] = response.rows;
          // AUDITORIA
          await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'map_empleado_grado',
            usuario: user_name,
            accion: 'I',
            datosOriginales: '',
            datosNuevos: JSON.stringify(grado_activo),
            ip: ip,
            ip_local: ip_local,
            observacion: null
          });
          // FINALIZAR TRANSACCION
          await pool.query('COMMIT');

          console.log('grado_activo: ',grado_activo)

          if(grado_activo == undefined || grado_activo == '' || grado_activo == null){
            
            // INICIAR TRANSACCION
            await pool.query('BEGIN');
            const responsee: QueryResult = await pool.query(
              `
              INSERT INTO map_empleado_grado (id_empleado, id_grado, estado) VALUES ($1, $2, $3) RETURNING *
              `
              , [id_empleado, id_grado, true]);

            const [grado_insert] = responsee.rows;

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'map_empleado_grado',
              usuario: user_name,
              accion: 'I',
              datosOriginales: '',
              datosNuevos: JSON.stringify(grado_insert),
              ip: ip,
              ip_local: ip_local,
              observacion: null
            });
            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');

            

          } else {

            // INICIAR TRANSACCION
            await pool.query('BEGIN');
            const grado_update: QueryResult = await pool.query(
              `
              UPDATE map_empleado_grado SET estado = false WHERE id = $1
              `
              , [grado_activo.id]);

            const [grado_UPD] = grado_update.rows;
            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'map_empleado_grado',
              usuario: user_name,
              accion: 'I',
              datosOriginales: '',
              datosNuevos: JSON.stringify(grado_UPD),
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
               INSERT INTO map_empleado_grado (id_empleado, id_grado, estado) VALUES ($1, $2, $3) RETURNING *
              `
              , [id_empleado, id_grado, true]);

            const [nuevo_grado] = response.rows;
            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'map_empleado_grado',
              usuario: user_name,
              accion: 'I',
              datosOriginales: '',
              datosNuevos: JSON.stringify(nuevo_grado),
              ip: ip,
              ip_local: ip_local,
              observacion: null
            });
            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
          }

        }else{
          console.log('proceso: ',grados.estado)
          if(grados.estado == false){
            
            // INICIAR TRANSACCION
          await pool.query('BEGIN');
          const response: QueryResult = await pool.query(
            `
            SELECT * FROM map_empleado_grado WHERE id_empleado = $1 and estado = true
           `
            , [id_empleado]);

          const [grado_activo1] = response.rows;
          // AUDITORIA
          await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'map_empleado_grado',
            usuario: user_name,
            accion: 'I',
            datosOriginales: '',
            datosNuevos: JSON.stringify(grado_activo1),
            ip: ip,
            ip_local: ip_local,
            observacion: null
          });
          // FINALIZAR TRANSACCION
          await pool.query('COMMIT');

            // INICIAR TRANSACCION
            await pool.query('BEGIN');
            const proceso_update: QueryResult = await pool.query(
              `
              UPDATE map_empleado_grado SET estado = true WHERE id = $1
              `
              , [grados.id]);

            const [grado_UPD] = proceso_update.rows;
            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'map_empleado_grado',
              usuario: user_name,
              accion: 'I',
              datosOriginales: '',
              datosNuevos: JSON.stringify(grado_UPD),
              ip: ip,
              ip_local: ip_local,
              observacion: null
            });
            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');


            // INICIAR TRANSACCION
            await pool.query('BEGIN');
            const proceso_update1: QueryResult = await pool.query(
              `
              UPDATE map_empleado_grado SET estado = false WHERE id = $1
              `
              , [grado_activo1.id]);

            const [grado_UPD1] = proceso_update1.rows;
            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'map_empleado_grado',
              usuario: user_name,
              accion: 'I',
              datosOriginales: '',
              datosNuevos: JSON.stringify(grado_UPD1),
              ip: ip,
              ip_local: ip_local,
              observacion: null
            });
            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');

          }
        }
      }

      return res.status(200).jsonp({ message: 'Registro de grados' });

    } catch {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      error = true;
      if (error) {
        return res.status(500).jsonp({ message: 'error' });
      }
    }


  }

}

export const GRADO_CONTROLADOR = new GradoControlador();

export default GRADO_CONTROLADOR;