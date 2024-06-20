import { ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';
import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import excel from 'xlsx';
import pool from '../../database';
import path from 'path';
import fs from 'fs';

class SucursalControlador {

  // BUSCAR SUCURSALES POR EL NOMBRE
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

  // GUARDAR REGISTRO DE SUCURSAL
  public async CrearSucursal(req: Request, res: Response): Promise<Response> {

    const { nombre, id_ciudad, id_empresa } = req.body;

    const response: QueryResult = await pool.query(
      `
      INSERT INTO e_sucursales (nombre, id_ciudad, id_empresa) VALUES ($1, $2, $3) RETURNING *
      `
      , [nombre, id_ciudad, id_empresa]);

    const [sucursal] = response.rows;

    if (sucursal) {
      return res.status(200).jsonp(sucursal)
    }
    else {
      return res.status(404).jsonp({ message: 'error' })
    }
  }

  // ACTUALIZAR REGISTRO DE ESTABLECIMIENTO
  public async ActualizarSucursal(req: Request, res: Response): Promise<void> {
    const { nombre, id_ciudad, id } = req.body;
    await pool.query(
      `
      UPDATE e_sucursales SET nombre = $1, id_ciudad = $2 WHERE id = $3
      `
      , [nombre, id_ciudad, id]);

    res.jsonp({ message: 'Registro actualizado.' });
  }

  // BUSCAR SUCURSAL POR ID DE EMPRESA
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

  // METODO DE BUSQUEDA DE SUCURSALES
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

  // METODO PARA ELIMINAR REGISTRO
  public async EliminarRegistros(req: Request, res: Response) {
    try {
      const id = req.params.id;
      await pool.query(
        `
        DELETE FROM e_sucursales WHERE id = $1
        `
        , [id]);
      res.jsonp({ message: 'Registro eliminado.' });
    } catch (error) {
      return res.jsonp({ message: 'error' });

    }

  }

  // METODO PARA BUSCAR DATOS DE UNA SUCURSAL
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



  // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR
  public async RevisarDatos(req: Request, res: Response): Promise<any> {
    const documento = req.file?.originalname;
    let separador = path.sep;
    let ruta = ObtenerRutaLeerPlantillas() + separador + documento;

    const workbook = excel.readFile(ruta);
    const sheet_name_list = workbook.SheetNames;
    const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

    let data: any = {
      fila: '',
      nom_sucursal: '',
      ciudad: '',
      observacion: ''
    };

    var mensaje: string = 'correcto';

    var listSucursales: any = [];
    var duplicados: any = [];

    // LECTURA DE LOS DATOS DE LA PLANTILLA
    plantilla.forEach(async (dato: any, indice: any, array: any) => {
      var { item, nombre, ciudad } = dato;

      data.fila = dato.item
      data.nom_sucursal = dato.nombre;
      data.ciudad = dato.ciudad;

      if ((data.fila != undefined && data.fila != '') &&
        (data.nom_sucursal != undefined && data.nom_sucursal != '') &&
        (data.ciudad != undefined && data.ciudad != '')) {

        //Validar primero que exista la ciudad en la tabla ciudades
        const existe_ciudad = await pool.query(
          `
          SELECT id FROM e_ciudades WHERE UPPER(descripcion) = UPPER($1)
          `
          , [ciudad]);
        var id_ciudad = existe_ciudad.rows[0];
        if (id_ciudad != undefined && id_ciudad != '') {
          // VERIFICACIÓN SI LA SUCURSAL NO ESTE REGISTRADA EN EL SISTEMA
          const VERIFICAR_SUCURSAL = await pool.query(
            `
            SELECT * FROM e_sucursales 
            WHERE UPPER(nombre) = UPPER($1) AND id_ciudad = $2
            `
            , [nombre, id_ciudad.id]);
          if (VERIFICAR_SUCURSAL.rowCount === 0) {
            data.fila = item
            data.nom_sucursal = nombre;
            data.ciudad = ciudad;
            // Discriminación de elementos iguales
            if (duplicados.find((p: any) => p.nombre.toLowerCase() === dato.nombre.toLowerCase() &&
              p.ciudad.toLowerCase() === dato.ciudad.toLowerCase()) == undefined) {
              data.observacion = 'ok';
              duplicados.push(dato);
            }

            listSucursales.push(data);

          } else {
            data.fila = item
            data.nom_sucursal = nombre;
            data.ciudad = ciudad;
            data.observacion = 'Ya existe en el sistema';

            listSucursales.push(data);
          }

        } else {
          data.fila = item
          data.nom_sucursal = dato.nombre;
          data.ciudad = dato.ciudad;

          if (data.ciudad == '' || data.ciudad == undefined) {
            data.ciudad = 'No registrado';
          }

          data.observacion = 'Ciudad no existe en el sistema';

          listSucursales.push(data);
        }

      } else {
        data.fila = item
        data.nom_sucursal = dato.nombre;
        data.ciudad = dato.ciudad;

        if (data.fila == '' || data.fila == undefined) {
          data.fila = 'error';
          mensaje = 'error'
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
          data.observacion = 'Sucursal y ciudad no registrado';
        }

        listSucursales.push(data);
      }

      data = {};

    });

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
        // Compara los números de los objetos
        if (a.fila < b.fila) {
          return -1;
        }
        if (a.fila > b.fila) {
          return 1;
        }
        return 0; // Son iguales
      });

      var filaDuplicada: number = 0;

      listSucursales.forEach((item: any) => {
        if (item.observacion == undefined || item.observacion == null || item.observacion == '') {
          item.observacion = 'Registro duplicado'
        }

        //Valida si los datos de la columna N son numeros.
        if (typeof item.fila === 'number' && !isNaN(item.fila)) {
          //Condicion para validar si en la numeracion existe un numero que se repite dara error.
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

export const SUCURSAL_CONTROLADOR = new SucursalControlador();

export default SUCURSAL_CONTROLADOR;