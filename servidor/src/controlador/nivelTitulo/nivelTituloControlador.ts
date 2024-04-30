import { Request, Response } from 'express';
import { QueryResult } from 'pg';

import { ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';
import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';

import pool from '../../database';
import excel from 'xlsx';
import fs from 'fs';
import path from 'path';

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
  public async EliminarNivelTitulo(req: Request, res: Response): Promise<Response> {
    try {
      // TODO: ANALIZAR COMO OBTENER USER_NAME E IP DESDE EL FRONT
      const { user_name, ip } = req.body;
      const id = req.params.id;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // OBTENER DATOSORIGINALES
      const consulta = await pool.query('SELECT * FROM nivel_titulo WHERE id = $1', [id]);
      const [datosOriginales] = consulta.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'nivel_titulo',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al eliminar el registro con id ${id}. No existe el registro en la base de datos.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
      }
      await pool.query(
        `
        DELETE FROM nivel_titulo WHERE id = $1
        `
        , [id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'nivel_titulo',
        usuario: user_name,
        accion: 'D',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: '',
        ip,
        observacion: ''
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro eliminado.' });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'Error al eliminar el registro.' });      
    }
  }

  // METODO PARA REGISTRAR NIVEL DE TITULO
  public async CrearNivel(req: Request, res: Response): Promise<Response> {
    try {
      const { nombre, user_name, ip } = req.body;
  
      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      const response: QueryResult = await pool.query(
        `
        INSERT INTO nivel_titulo (nombre) VALUES ($1) RETURNING *
        `
        , [nombre]);

      const [nivel] = response.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'nivel_titulo',
        usuario: user_name,
        accion: 'C',
        datosOriginales: '',
        datosNuevos: `{"nombre": "${nombre}"}`,
        ip,
        observacion: ''
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
  
      if (nivel) {
        return res.status(200).jsonp(nivel)
      }
      else {
        return res.status(404).jsonp({ message: 'error' })
      }
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'Error al registrar el nivel de título.' });
    }
  }

  // METODO PARA ACTUALIZAR REGISTRO DE NIVEL DE TITULO
  public async ActualizarNivelTitulo(req: Request, res: Response): Promise<Response> {
    try {
      const { nombre, id, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // OBTENER DATOSORIGINALES
      const consulta = await pool.query('SELECT * FROM nivel_titulo WHERE id = $1', [id]);
      const [datosOriginales] = consulta.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'nivel_titulo',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al actualizar el registro con id ${id}. No existe el registro en la base de datos.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
      }

      await pool.query(
        `
        UPDATE nivel_titulo SET nombre = $1 WHERE id = $2
        `
        , [nombre, id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'nivel_titulo',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: `{"nombre": "${nombre}"}`,
        ip,
        observacion: ''
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro actualizado.' });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'Error al actualizar el registro.' });
    }
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
      var {item, nombre} = dato;
      data.fila = dato.item
      data.nombre = dato.nombre;

      if((data.fila != undefined && data.fila != '') && 
        (data.nombre != undefined && data.nombre != '' && data.nombre != null)){
        //Validar primero que exista la ciudad en la tabla ciudades
        const existe_nivelProfecional = await pool.query('SELECT nombre FROM nivel_titulo WHERE UPPER(nombre) = UPPER($1)', [data.nombre]);
        if(existe_nivelProfecional.rowCount == 0){
          data.fila = item
          data.nombre = nombre;
          if(duplicados.find((p: any)=> p.nombre.toLowerCase() === data.nombre.toLowerCase()) == undefined)
          {
              data.observacion = 'ok';
              duplicados.push(dato);
          }

          listNivelesProfesionales.push(data);
        }else{
          data.fila = item
          data.nombre = nombre;
          data.observacion = 'Ya existe en el sistema';

          listNivelesProfesionales.push(data);
        }
      }else{
        data.fila = item
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