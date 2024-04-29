import { Request, Response } from 'express';
import { ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';
import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';
import pool from '../../database';
import fs from 'fs';
import excel from 'xlsx';
import path from 'path';

class TituloControlador {

  // METODO PARA LISTAR TITULOS
  public async ListarTitulos(req: Request, res: Response) {
    const titulo = await pool.query(
      `
      SELECT ct.id, ct.nombre, nt.nombre as nivel 
      FROM cg_titulos AS ct, nivel_titulo AS nt 
      WHERE ct.id_nivel = nt.id 
      ORDER BY ct.nombre ASC
      `
    );
    res.jsonp(titulo.rows);
  }

  // METODO PARA ELIMINAR REGISTROS
  public async EliminarRegistros(req: Request, res: Response): Promise<Response> {
    try {
      // TODO ANALIZAR COMOOBTENER USER_NAME E IP DESDE EL FRONT
      const { user_name, ip } = req.body;
      const id = req.params.id;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const rol = await pool.query('SELECT * FROM cg_titulos WHERE id = $1', [id]);
      const [datosOriginales] = rol.rows;

      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'cg_titulos',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al eliminar el título con id ${id}`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Error al eliminar el registro.' });
      }
      
      await pool.query(
        `
        DELETE FROM cg_titulos WHERE id = $1
        `
        , [id]);
      
      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'cg_titulos',
        usuario: user_name,
        accion: 'D',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: '',
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro eliminado.' });
    } catch (error) {
      // FINALIZAR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'Error al eliminar el registro.' });
    }
  }

  // METODO PARA ACTUALIZAR REGISTRO
  public async ActualizarTitulo(req: Request, res: Response): Promise<Response> {
    try {
      const { nombre, id_nivel, id, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const rol = await pool.query('SELECT * FROM cg_titulos WHERE id = $1', [id]);
      const [datosOriginales] = rol.rows;

      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'cg_titulos',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al actualizar el título con id ${id}`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Error al actualizar el registro.' });
      }

      await pool.query(
        `
        UPDATE cg_titulos SET nombre = $1, id_nivel = $2 WHERE id = $3
        `
        , [nombre, id_nivel, id]);
      
      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'cg_titulos',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: `{nombre: ${nombre}, id_nivel: ${id_nivel}}`,
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro actualizado.' });
    } catch (error) {
      // FINALIZAR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'Error al actualizar el registro.' });
    }
  }

  public async getOne(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const unTitulo = await pool.query('SELECT * FROM cg_titulos WHERE id = $1', [id]);
    if (unTitulo.rowCount > 0) {
      return res.jsonp(unTitulo.rows)
    }
    res.status(404).jsonp({ text: 'El empleado no ha sido encontrado' });
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, id_nivel, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      await pool.query('INSERT INTO cg_titulos ( nombre, id_nivel ) VALUES ($1, $2)', [nombre, id_nivel]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'cg_titulos',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: `{nombre: ${nombre}, id_nivel: ${id_nivel}}`,
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      res.jsonp({ message: 'Título guardado' });
    } catch (error) {
      // FINALIZAR TRANSACCION
      await pool.query('ROLLBACK');
      res.status(500).jsonp({ message: 'Error al guardar el título.' });
    }
  }

  // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR
  public async RevisarDatos(req: Request, res: Response): Promise<any> {
    const documento = req.file?.originalname;
    let separador = path.sep;
    let ruta = ObtenerRutaLeerPlantillas() + separador + documento;

    const workbook = excel.readFile(ruta);
    const sheet_name_list = workbook.SheetNames;
    const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[1]]);

    let data: any = {
      fila: '',
      titulo: '',
      nivel: '',
      observacion: ''
    };

    var listTitulosProfesionales: any = [];
    var duplicados: any = [];
    var mensaje: string = 'correcto';

    // LECTURA DE LOS DATOS DE LA PLANTILLA
    plantilla.forEach(async (dato: any, indice: any, array: any) => {
      var {item, nombre, nivel} = dato;
      data.fila = dato.item
      data.titulo = dato.nombre;
      data.nivel = dato.nivel;

      if((data.fila != undefined && data.fila != '') && 
        (data.titulo != undefined && data.titulo != '') && 
        (data.nivel != undefined && data.nivel != '') ){
        // VALIDAR PRIMERO QUE EXISTA NIVELES EN LA TABLA NIVELES
        const existe_nivel = await pool.query('SELECT id FROM nivel_titulo WHERE UPPER(nombre) = UPPER($1)', [nivel]);
        var id_nivel = existe_nivel.rows[0];
        if(id_nivel != undefined && id_nivel != ''){
          // VERIFICACIÓN SI LA SUCURSAL NO ESTE REGISTRADA EN EL SISTEMA
          const VERIFICAR_Titulos = await  pool.query('SELECT * FROM cg_titulos ' +
          'WHERE UPPER(nombre) = UPPER($1) AND id_nivel = $2', [nombre, id_nivel.id]);
          if(VERIFICAR_Titulos.rowCount == 0){
            data.fila = dato.item
            data.titulo = dato.nombre;
            data.nivel = dato.nivel
              if(duplicados.find((p: any)=> p.nombre.toLowerCase() === dato.nombre.toLowerCase() && p.nivel.toLowerCase() === dato.nivel.toLowerCase()) == undefined)
              {
                data.observacion = 'ok';
                duplicados.push(dato);
              }

            listTitulosProfesionales.push(data);
          
          }else{
            data.fila = dato.item
            data.titulo = nombre;
            data.nivel = nivel
            data.observacion = 'Ya esta registrado en base';
  
            listTitulosProfesionales.push(data);
          }
        }else{
          data.fila = dato.item
          data.titulo = dato.nombre;
          data.nivel = dato.nivel;

          if(data.nivel == '' || data.nivel == undefined){
            data.nivel = 'No registrado';
            data.observacion = 'Nivel no registrado';
          }

          data.observacion = 'Nivel no existe en el sistema'

          listTitulosProfesionales.push(data);
        }

      }else{
        data.fila = dato.item
        data.titulo = dato.nombre;
        data.nivel = dato.nivel;

        if(data.fila == '' || data.fila == undefined){
          data.fila = 'error';
          mensaje = 'error'
        }

        if(data.titulo == '' ||data.titulo == undefined){
          data.titulo = 'No registrado';
          data.observacion = 'Título no registrado';
        }

        if(data.nivel == '' || data.nivel == undefined){
          data.nivel = 'No registrado';
          data.observacion = 'Nivel no registrado';
        }

        if((data.titulo == '' || data.titulo == undefined) && (data.nivel == '' || data.nivel == undefined)){
          data.observacion = 'Título y Nivel no registrado';
        }

        listTitulosProfesionales.push(data);
        
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

      listTitulosProfesionales.sort((a: any, b: any) => {
        // COMPARA LOS NÚMEROS DE LOS OBJETOS
        if (a.fila < b.fila) {
            return -1;
        }
        if (a.fila > b.fila) {
            return 1;
        }
        return 0; // SON IGUALES
      });

      var filaDuplicada: number = 0;

      listTitulosProfesionales.forEach((item:any) => {
        if(item.observacion == undefined || item.observacion == null || item.observacion == ''){
          item.observacion = 'Registro duplicado'
        }

        // VALIDA SI LOS DATOS DE LA COLUMNA N SON NUMEROS.
        if (typeof item.fila === 'number' && !isNaN(item.fila)) {
          // CONDICION PARA VALIDAR SI EN LA NUMERACION EXISTE UN NUMERO QUE SE REPITE DARA ERROR.
              if(item.fila == filaDuplicada){
                  mensaje = 'error';
              }
        }else{
            return mensaje = 'error';
        } 

        filaDuplicada = item.fila;
      });

      if(mensaje == 'error'){
        listTitulosProfesionales = undefined;
      }

      return res.jsonp({ message: mensaje, data:  listTitulosProfesionales});

    }, 1500)
  }

}

export const TITULO_CONTROLADOR = new TituloControlador();

export default TITULO_CONTROLADOR;