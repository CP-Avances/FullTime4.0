import AUDITORIA_CONTROLADOR from '../../reportes/auditoriaControlador';
import { ObtenerIndicePlantilla, ObtenerRutaLeerPlantillas } from '../../../libs/accesoCarpetas';
import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import Excel from 'exceljs';
import pool from '../../../database';
import path from 'path';
import fs from 'fs';

class SucursalControlador {

  // BUSCAR SUCURSALES POR EL NOMBRE   **USADO
  public async BuscarNombreSucursal(req: Request, res: Response) {
    const { nombre } = req.body;
    const SUCURSAL = await pool.query(
      `
      SELECT * FROM e_sucursales WHERE UPPER(nombre) = $1
      `
      , [nombre]);

    if (SUCURSAL.rowCount != 0) {
      return res.jsonp(SUCURSAL.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  // GUARDAR REGISTRO DE SUCURSAL   **USADO
  public async CrearSucursal(req: Request, res: Response): Promise<Response> {

    try {
      const { nombre, id_ciudad, id_empresa, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      const response: QueryResult = await pool.query(
        `
        INSERT INTO e_sucursales (nombre, id_ciudad, id_empresa) VALUES ($1, $2, $3) RETURNING *
        `
        , [nombre, id_ciudad, id_empresa]);

      const [sucursal] = response.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'e_sucursales',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: JSON.stringify(sucursal),
        ip: ip,
        ip_local: ip_local,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');

      if (sucursal) {
        return res.status(200).jsonp(sucursal)
      }
      else {
        return res.status(404).jsonp({ message: 'error' })
      }
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' });
    }
  }

  // ACTUALIZAR REGISTRO DE ESTABLECIMIENTO  **USADO
  public async ActualizarSucursal(req: Request, res: Response): Promise<Response> {
    try {
      const { nombre, id_ciudad, id, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const consulta = await pool.query(`SELECT * FROM e_sucursales WHERE id = $1`, [id]);
      const [datosOriginales] = consulta.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'e_sucursales',
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
        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
      }

      await pool.query(
        `
        UPDATE e_sucursales SET nombre = $1, id_ciudad = $2 WHERE id = $3
        `
        , [nombre, id_ciudad, id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'e_sucursales',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: `{ "nombre": "${nombre}", "id_ciudad": "${id_ciudad}" }`,
        ip: ip,
        ip_local: ip_local,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro actualizado.' });

    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' });
    }
  }

  // BUSCAR SUCURSAL POR ID DE EMPRESA  **USADO
  public async ObtenerSucursalEmpresa(req: Request, res: Response): Promise<any> {
    const { id_empresa } = req.params;
    const SUCURSAL = await pool.query(
      `
      SELECT * FROM e_sucursales WHERE id_empresa = $1
      `
      , [id_empresa]);
    if (SUCURSAL.rowCount != 0) {
      return res.jsonp(SUCURSAL.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  // METODO DE BUSQUEDA DE SUCURSALES **USADO
  public async ListarSucursales(req: Request, res: Response) {
    const SUCURSAL = await pool.query(
      `
      SELECT s.id, s.nombre, s.id_ciudad, c.descripcion, s.id_empresa, ce.nombre AS nomempresa
      FROM e_sucursales s, e_ciudades c, e_empresa ce
      WHERE s.id_ciudad = c.id AND s.id_empresa = ce.id
      ORDER BY s.id
      `
    );
    if (SUCURSAL.rowCount != 0) {
      return res.jsonp(SUCURSAL.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  // METODO PARA ELIMINAR REGISTRO **USADO
  public async EliminarRegistros(req: Request, res: Response): Promise<Response> {
    try {
      const { user_name, ip, ip_local } = req.body;

      const id = req.params.id;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const consulta = await pool.query('SELECT * FROM e_sucursales WHERE id = $1', [id]);
      const [datosOriginales] = consulta.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'e_sucursales',
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
        DELETE FROM e_sucursales WHERE id = $1
        `
        , [id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'e_sucursales',
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
      return res.jsonp({ message: 'Registro eliminado.' });

    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.jsonp({ message: 'error' });

    }
  }

  // METODO PARA BUSCAR DATOS DE UNA SUCURSAL  **USADO
  public async ObtenerUnaSucursal(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const SUCURSAL = await pool.query(
      `
      SELECT s.id, s.nombre, s.id_ciudad, c.descripcion, s.id_empresa, ce.nombre AS nomempresa
      FROM e_sucursales s, e_ciudades c, e_empresa ce
      WHERE s.id_ciudad = c.id AND s.id_empresa = ce.id AND s.id = $1
      `
      , [id]);
    if (SUCURSAL.rowCount != 0) {
      return res.jsonp(SUCURSAL.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR  **USADO
  public async RevisarDatos(req: Request, res: Response): Promise<any> {
    const documento = req.file?.originalname;
    let separador = path.sep;

    let ruta = ObtenerRutaLeerPlantillas() + separador + documento;
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(ruta);

    let verificador = ObtenerIndicePlantilla(workbook, 'SUCURSALES');
    if (verificador === false) {
      return res.jsonp({ message: 'no_existe', data: undefined });
    }
    else {
      const sheet_name_list = workbook.worksheets.map(sheet => sheet.name);
      const plantilla = workbook.getWorksheet(sheet_name_list[verificador]);
      let data: any = {
        fila: '',
        nom_sucursal: '',
        ciudad: '',
        observacion: ''
      };
      var mensaje: string = 'correcto';
      var listSucursales: any = [];
      var duplicados: any = [];
      if (plantilla) {
        // SUPONIENDO QUE LA PRIMERA FILA SON LAS CABECERAS
        const headerRow = plantilla.getRow(1);
        const headers: any = {};

        // CREAR UN MAPA CON LAS CABECERAS Y SUS POSICIONES, ASEGURANDO QUE LAS CLAVES ESTEN EN MAYUSCULAS
        headerRow.eachCell((cell: any, colNumber) => {
          headers[cell.value.toString().toUpperCase()] = colNumber;
        });

        // VERIFICA SI LAS CABECERAS ESENCIALES ESTAN PRESENTES
        if (!headers['ITEM'] || !headers['NOMBRE'] || !headers['CIUDAD']) {
          return res.jsonp({ message: 'Cabeceras faltantes', data: undefined });
        }

        // LECTURA DE LOS DATOS DE LA PLANTILLA
        plantilla.eachRow(async (row, rowNumber) => {
          // SALTAR LA FILA DE LAS CABECERAS
          if (rowNumber === 1) return;

          // LEER LOS DATOS SEGUN LAS COLUMNAS ENCONTRADAS
          const ITEM = row.getCell(headers['ITEM']).value;
          const NOMBRE = row.getCell(headers['NOMBRE']).value;
          const CIUDAD = row.getCell(headers['CIUDAD']).value;

          const dato = {
            ITEM: ITEM,
            NOMBRE: NOMBRE,
            CIUDAD: CIUDAD,
          }

          data.fila = ITEM;
          data.nom_sucursal = NOMBRE;
          data.ciudad = CIUDAD;

          if ((data.fila != undefined && data.fila != '') &&
            (data.nom_sucursal != undefined && data.nom_sucursal != '') &&
            (data.ciudad != undefined && data.ciudad != '')) {
            console.log('ingresa undfined')
            // VALIDAR PRIMERO QUE EXISTA LA CIUDAD EN LA TABLA CIUDADES
            const existe_ciudad = await pool.query(
              `
              SELECT id FROM e_ciudades WHERE UPPER(descripcion) = UPPER($1)
              `
              , [CIUDAD]);

            var id_ciudad = existe_ciudad.rows[0];

            if (id_ciudad != undefined && id_ciudad != '') {
              // VERIFICACION SI LA SUCURSAL NO ESTE REGISTRADA EN EL SISTEMA
              const VERIFICAR_SUCURSAL = await pool.query(
                `
                SELECT * FROM e_sucursales 
                WHERE UPPER(nombre) = UPPER($1) AND id_ciudad = $2
                `
                , [NOMBRE, id_ciudad.id]);

              if (VERIFICAR_SUCURSAL.rowCount === 0) {
                data.fila = ITEM
                data.nom_sucursal = NOMBRE;
                data.ciudad = CIUDAD;

                // DISCRIMINACION DE ELEMENTOS IGUALES
                if (duplicados.find((p: any) => p.NOMBRE.toLowerCase() === data.nom_sucursal.toLowerCase() &&
                  p.CIUDAD.toLowerCase() === data.ciudad.toLowerCase()) == undefined) {
                  data.observacion = 'ok';
                  duplicados.push(dato);
                }

                //USAMOS TRIM PARA ELIMINAR LOS ESPACIOS AL INICIO Y AL FINAL EN BLANCO.
                data.nom_sucursal = data.nom_sucursal.trim();
                data.ciudad = data.ciudad.trim();

                listSucursales.push(data);
              } else {
                data.fila = ITEM
                data.nom_sucursal = NOMBRE;
                data.ciudad = CIUDAD;
                data.observacion = 'Ya existe en el sistema';

                //USAMOS TRIM PARA ELIMINAR LOS ESPACIOS AL INICIO Y AL FINAL EN BLANCO.
                data.nom_sucursal = data.nom_sucursal.trim();
                data.ciudad = data.ciudad.trim();

                listSucursales.push(data);
              }
            } else {
              data.fila = ITEM
              data.nom_sucursal = NOMBRE;
              data.ciudad = CIUDAD;

              if (data.ciudad == '' || data.ciudad == undefined) {
                data.ciudad = 'No registrado';
              }
              data.observacion = 'Ciudad no existe en el sistema';

              //USAMOS TRIM PARA ELIMINAR LOS ESPACIOS AL INICIO Y AL FINAL EN BLANCO.
              data.nom_sucursal = data.nom_sucursal.trim();
              data.ciudad = data.ciudad.trim();

              listSucursales.push(data);
            }
          } else {
            data.fila = ITEM
            data.nom_sucursal = NOMBRE;
            data.ciudad = CIUDAD;

            if (data.fila == '' || data.fila == undefined) {
              data.fila = 'error';
              mensaje = 'error';
            }

            if (data.nom_sucursal == '' || data.nom_sucursal == undefined) {
              data.nom_sucursal = 'No registrado';
              data.observacion = 'Sucursal no registrada';
            }

            if (data.ciudad == '' || data.ciudad == undefined) {
              data.ciudad = 'No registrado';
              data.observacion = 'Ciudad no registrada';
            }

            if ((data.nom_sucursal == '' || data.nom_sucursal == undefined) && (data.ciudad == '' || data.ciudad == undefined)) {
              data.observacion = 'Sucursal y ciudad no registrada';
            }

            //USAMOS TRIM PARA ELIMINAR LOS ESPACIOS AL INICIO Y AL FINAL EN BLANCO.
            data.nom_sucursal = data.nom_sucursal.trim();
            data.ciudad = data.ciudad.trim();

            listSucursales.push(data);
          }
          data = {};
        });
      }
      //console.log('listaSucursales ', listSucursales)
      // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
      fs.access(ruta, fs.constants.F_OK, (err) => {
        if (err) {
        } else {
          // ELIMINAR DEL SERVIDOR
          fs.unlinkSync(ruta);
        }
      });

      setTimeout(() => {
        listSucursales.sort((a: any, b: any) => {
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

        listSucursales.forEach((item: any) => {
          if (item.observacion == undefined || item.observacion == null || item.observacion == '') {
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
          listSucursales = undefined;
        }
        return res.jsonp({ message: mensaje, data: listSucursales });
      }, 1500)
    }
  }

  // METODO PARA CARGAR PLANTILLA DE SUCURSALES  **USADO
  public async RegistrarSucursales(req: Request, res: Response): Promise<Response> {
    const { sucursales, user_name, ip, ip_local } = req.body;
    let error: boolean = false;

    for (const sucursal of sucursales) {
      const { nombre, id_ciudad, id_empresa } = sucursal;
      try {

        // INICIAR TRANSACCION
        await pool.query('BEGIN');

        const response: QueryResult = await pool.query(
          `
          INSERT INTO e_sucursales (nombre, id_ciudad, id_empresa) VALUES ($1, $2, $3) RETURNING *
          `
          , [nombre, id_ciudad, id_empresa]);

        const [sucursal] = response.rows;

        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'e_sucursales',
          usuario: user_name,
          accion: 'I',
          datosOriginales: '',
          datosNuevos: JSON.stringify(sucursal),
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

    return res.status(200).jsonp({ message: 'ok' })
  }

}

export const SUCURSAL_CONTROLADOR = new SucursalControlador();

export default SUCURSAL_CONTROLADOR;