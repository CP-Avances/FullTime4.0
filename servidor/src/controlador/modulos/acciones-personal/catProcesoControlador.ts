import { ObtenerIndicePlantilla, ObtenerRutaLeerPlantillas } from '../../../libs/accesoCarpetas';
import { Request, Response } from 'express';
import AUDITORIA_CONTROLADOR from '../../reportes/auditoriaControlador';
import pool from '../../../database';
import fs from 'fs';
import path from 'path';
import Excel from 'exceljs';

class ProcesoControlador {

  // METODO PARA BUSCAR LISTA DE PROCESOS
  public async ListarProcesos(req: Request, res: Response) {

    const SIN_PROCESO_SUPERIOR = await pool.query(
      `
      SELECT p.id, p.nombre, p.proceso_padre AS proc_padre FROM map_cat_procesos AS p 
      WHERE p.proceso_padre IS NULL 
      ORDER BY p.nombre ASC
      `
    );

    const CON_PROCESO_SUPERIOR = await pool.query(
      `
      SELECT p.id, p.nombre, nom_p.nombre AS proc_padre 
      FROM map_cat_procesos AS p, nombreprocesos AS nom_p 
      WHERE p.proceso_padre = nom_p.id 
      ORDER BY p.nombre ASC
      `
    );

    SIN_PROCESO_SUPERIOR.rows.forEach((obj: any) => {
      CON_PROCESO_SUPERIOR.rows.push(obj);
    })

    res.jsonp(CON_PROCESO_SUPERIOR.rows);
  }


  public async getOne(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const unaProvincia = await pool.query(
      `
      SELECT * FROM map_cat_procesos WHERE id = $1
      `
      , [id]);
    if (unaProvincia.rowCount != 0) {
      return res.jsonp(unaProvincia.rows)
    }
    res.status(404).jsonp({ text: 'El proceso no ha sido encontrado.' });
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, nivel, proc_padre, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      await pool.query(
        `
        INSERT INTO map_cat_procesos (nombre, nivel, proceso_padre) VALUES ($1, $2, $3)
        `
        , [nombre, nivel, proc_padre]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'map_cat_procesos',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: `{"nombre": "${nombre}", "nivel": "${nivel}", "proc_padre": "${proc_padre}"}`,
        ip: ip,
        ip_local: ip_local,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      res.jsonp({ message: 'El departamento ha sido guardado en éxito' });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      res.status(500).jsonp({ message: 'Error al guardar el departamento' });
    }
  }

  public async getIdByNombre(req: Request, res: Response): Promise<any> {
    const { nombre } = req.params;
    const unIdProceso = await pool.query(
      `
      SELECT id FROM map_cat_procesos WHERE nombre = $1
      `
      , [nombre]);
    if (unIdProceso != null) {
      return res.jsonp(unIdProceso.rows);
    }
    res.status(404).jsonp({ text: 'Registro no encontrado.' });
  }

  public async ActualizarProceso(req: Request, res: Response): Promise<Response> {
    try {
      const { nombre, nivel, proc_padre, id, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const proceso = await pool.query('SELECT * FROM map_cat_procesos WHERE id = $1', [id]);
      const [datosOriginales] = proceso.rows;

      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'map_cat_procesos',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al actualizar el registro con id: ${id}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'error' });
      }

      await pool.query(
        `
        UPDATE map_cat_procesos SET nombre = $1, nivel = $2, proceso_padre = $3 WHERE id = $4
        `
        , [nombre, nivel, proc_padre, id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'map_cat_procesos',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: `{"nombre": "${nombre}", "nivel": "${nivel}", "proc_padre": "${proc_padre}"}`,
        ip: ip,
        ip_local: ip_local,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'El proceso actualizado exitosamente' });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: error });
    }
  }

  // METODO PARA ELIMINA PROCESOS   **USADO
  public async EliminarProceso(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const { user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const proceso = await pool.query(
        `
        SELECT * FROM map_cat_procesos WHERE id = $1
        `
        , [id]);
      const [datosOriginales] = proceso.rows;

      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'map_cat_procesos',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al eliminar el registro con id: ${id}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
      }

      await pool.query(
        `
        DELETE FROM map_cat_procesos WHERE id = $1
        `
        , [id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'map_cat_procesos',
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

      return res.jsonp({ message: 'Registro eliminado.' })

    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.jsonp({ message: 'error' });
    };
  }


  // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR    **USADO
  public async RevisarDatos(req: Request, res: Response): Promise<any> {
    try {
        const documento = req.file?.originalname;
        let separador = path.sep;
        let ruta = ObtenerRutaLeerPlantillas() + separador + documento;
        const workbook = new Excel.Workbook();
        await workbook.xlsx.readFile(ruta);
        let verificador = ObtenerIndicePlantilla(workbook, 'PROCESOS');
        if (verificador === false) {
            return res.jsonp({ message: 'no_existe', data: undefined });
        }
        else {
            const sheet_name_list = workbook.worksheets.map(sheet => sheet.name);
            const plantilla = workbook.getWorksheet(sheet_name_list[verificador]);
            let data: any = {
                fila: '',
                proceso: '',
                nivel: '',
                proceso_padre: '',
                observacion: ''
            };
            var listaProcesos: any = [];
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
                if (!headers['ITEM'] || !headers['PROCESO'] || !headers['NIVEL'] || !headers['PROCESO_PADRE']
                ) {
                    return res.jsonp({ message: 'Cabeceras faltantes', data: undefined });
                }

                // LECTURA DE LOS DATOS DE LA PLANTILLA
                plantilla.eachRow((row, rowNumber) => {
                    // SALTAR LA FILA DE LAS CABECERAS
                    if (rowNumber === 1) return;
                    // LEER LOS DATOS SEGUN LAS COLUMNAS ENCONTRADAS
                    const ITEM = row.getCell(headers['ITEM']).value;
                    const PROCESO = row.getCell(headers['PROCESO']).value;
                    const NIVEL = row.getCell(headers['NIVEL']).value;
                    const PROCESO_PADRE = row.getCell(headers['PROCESO_PADRE']).value;

                    // VERIFICAR QUE EL REGISTO NO TENGA DATOS VACIOS
                    if ((ITEM != undefined && ITEM != '') &&
                        (PROCESO != undefined && PROCESO != '') &&
                        (NIVEL != undefined && NIVEL != '') &&
                        (PROCESO_PADRE != undefined && PROCESO_PADRE != '') ) {

                        data.fila = ITEM;
                        data.proceso = PROCESO;
                        data.nivel = NIVEL;
                        data.proceso_padre= PROCESO_PADRE;
                        data.observacion = 'no registrada';

                         //USAMOS TRIM PARA ELIMINAR LOS ESPACIOS AL INICIO Y AL FINAL EN BLANCO.
                        data.proceso = data.proceso.trim();

                        listaProcesos.push(data);

                    } else {
                        data.fila = ITEM;
                        data.proceso = PROCESO;
                        data.nivel = NIVEL;
                        data.proceso_padre = PROCESO_PADRE;
                        data.observacion = 'no registrada';

                        if (data.fila == '' || data.fila == undefined) {
                            data.fila = 'error';
                            mensaje = 'error'
                        }

                        if (PROCESO == undefined) {
                            data.proceso = 'No registrado';
                            data.observacion = 'Proceso ' + data.observacion;
                        }

                        if (NIVEL == undefined) {
                          data.nivel = 'No registrado';
                          data.observacion = 'Nivel ' + data.observacion;
                        }

                        if (PROCESO_PADRE == undefined) {
                          data.proceso_padre = 'No registrado';
                          data.observacion = 'Proceso padre ' + data.observacion;
                        }

                        //USAMOS TRIM PARA ELIMINAR LOS ESPACIOS AL INICIO Y AL FINAL EN BLANCO.
                        data.proceso = data.proceso.trim();

                        listaProcesos.push(data);
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
            listaProcesos.forEach(async (item: any) => {
                if (item.observacion == 'no registrada') {
                    
                }
            });

            setTimeout(() => {
                listaProcesos.sort((a: any, b: any) => {
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

                listaProcesos.forEach(async (item: any) => {
                    if (item.observacion == '1') {
                        item.observacion = 'Registro duplicado'
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
                    listaProcesos = undefined;
                }
                return res.jsonp({ message: mensaje, data: listaProcesos });
            }, 1000)
        }

    } catch (error) {
        return res.status(500).jsonp({ message: 'Error con el servidor método RevisarDatos.', status: '500' });
    }
}

  // REGISTRAR PLANTILLA TIPO VACUNA    **USADO 
  public async CargarPlantilla(req: Request, res: Response) {
    const { plantilla, user_name, ip, ip_local } = req.body;
    let error: boolean = false;

    for (const data of plantilla) {
        
    }
    if (error) {
        return res.status(500).jsonp({ message: 'error' });
    }
    return res.status(200).jsonp({ message: 'ok' });
  }


}

export const PROCESOS_CONTROLADOR = new ProcesoControlador();

export default PROCESOS_CONTROLADOR;