import { Request, Response } from 'express';
import { QueryResult } from 'pg';

import { ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';

import pool from '../../database';
import excel from 'xlsx';
import fs from 'fs';
import path from 'path';
const builder = require('xmlbuilder');

class NivelTituloControlador {

  // METODO PARA LISTAR NIVELES DE TITULO PROFESIONAL
  public async ListarNivel(req: Request, res: Response) {
    const titulo = await pool.query(
      `
      SELECT * FROM nivel_titulo ORDER BY nombre ASC
      `
    );
    if (titulo.rowCount > 0) {
      return res.jsonp(titulo.rows)
    }
    else {
      res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }

  // METODO PARA ELIMINAR REGISTROS
  public async EliminarNivelTitulo(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    await pool.query(
      `
      DELETE FROM nivel_titulo WHERE id = $1
      `
      , [id]);
    res.jsonp({ message: 'Registro eliminado.' });
  }

  // METODO PARA REGISTRAR NIVEL DE TITULO
  public async CrearNivel(req: Request, res: Response): Promise<Response> {
    const { nombre } = req.body;

    console.log('nombre ingresado: ',nombre);

    const response: QueryResult = await pool.query(
      `
      INSERT INTO nivel_titulo (nombre) VALUES ($1) RETURNING *
      `
      , [nombre]);

    const [nivel] = response.rows;

    if (nivel) {
      return res.status(200).jsonp(nivel)
    }
    else {
      return res.status(404).jsonp({ message: 'error' })
    }
  }

  // METODO PARA ACTUALIZAR REGISTRO DE NIVEL DE TITULO
  public async ActualizarNivelTitulo(req: Request, res: Response): Promise<void> {
    const { nombre, id } = req.body;
    await pool.query(
      `
      UPDATE nivel_titulo SET nombre = $1 WHERE id = $2
      `
      , [nombre, id]);
    res.jsonp({ message: 'Registro actualizado.' });
  }

  // METODO PARA BUSCAR TITULO POR SU NOMBRE
  public async ObtenerNivelNombre(req: Request, res: Response): Promise<any> {
    const { nombre } = req.params;
    const unNivelTitulo = await pool.query(
      `
      SELECT * FROM nivel_titulo WHERE nombre = $1
      `
      , [nombre]);

    if (unNivelTitulo.rowCount > 0) {
      return res.jsonp(unNivelTitulo.rows)
    }
    else {
      res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }









  public async getOne(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const unNivelTitulo = await pool.query('SELECT * FROM nivel_titulo WHERE id = $1', [id]);
    if (unNivelTitulo.rowCount > 0) {
      return res.jsonp(unNivelTitulo.rows)
    }
    else {
      res.status(404).jsonp({ text: 'Registro no encontrado' });
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
      nombre: '',
      observacion: ''
    };

    var listNivelesProfesionales: any = [];
    var duplicados: any = [];
    var mensaje: string = 'correcto';

    // LECTURA DE LOS DATOS DE LA PLANTILLA
    plantilla.forEach(async (dato: any, indice: any, array: any) => {
      var {N, nombre} = dato;
      data.fila = dato.N
      data.nombre = dato.nombre;

      if((data.fila != undefined && data.fila != '') && 
        (data.nombre != undefined && data.nombre != '' && data.nombre != null)){
        //Validar primero que exista la ciudad en la tabla ciudades
        const existe_nivelProfecional = await pool.query('SELECT nombre FROM nivel_titulo WHERE UPPER(nombre) = UPPER($1)', [data.nombre]);
        if(existe_nivelProfecional.rowCount == 0){
          data.fila = N
          data.nombre = nombre;
          if(duplicados.find((p: any)=> p.nombre.toLowerCase() === data.nombre.toLowerCase()) == undefined)
          {
              data.observacion = 'ok';
              duplicados.push(dato);
          }

          listNivelesProfesionales.push(data);
        }else{
          data.fila = N
          data.nombre = nombre;
          data.observacion = 'Ya existe en el sistema';

          listNivelesProfesionales.push(data);
        }
      }else{
        data.fila = N
        data.nombre = 'No registrado';
        data.observacion = 'Nivel no registrado';

        if(data.fila == '' || data.fila == undefined){
          data.fila = 'error';
          mensaje = 'error'
        }

        listNivelesProfesionales.push(data);
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

      listNivelesProfesionales.sort((a: any, b: any) => {
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

      listNivelesProfesionales.forEach((item:any) => {
        if(item.observacion == undefined || item.observacion == null || item.observacion == ''){
          item.observacion = 'Registro duplicado'
        }

        //Valida si los datos de la columna N son numeros.
        if (typeof item.fila === 'number' && !isNaN(item.fila)) {
          //Condicion para validar si en la numeracion existe un numero que se repite dara error.
              if(item.fila == filaDuplicada){
                  mensaje = 'error';
              }
        }else{
            return mensaje = 'error';
        } 

        filaDuplicada = item.fila;

      });

      if(mensaje == 'error'){
        listNivelesProfesionales = undefined;
      }

      return res.jsonp({ message: mensaje, data:  listNivelesProfesionales});

    }, 1500)
  }

}

export const NIVEL_TITULO_CONTROLADOR = new NivelTituloControlador();

export default NIVEL_TITULO_CONTROLADOR;