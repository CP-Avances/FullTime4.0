import { Request, Response } from 'express';
import { ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';
import pool from '../../database';
import fs from 'fs';
const builder = require('xmlbuilder');
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
  public async EliminarRegistros(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    await pool.query(
      `
      DELETE FROM cg_titulos WHERE id = $1
      `
      , [id]);
    res.jsonp({ message: 'Registro eliminado.' });
  }

  // METODO PARA ACTUALIZAR REGISTRO
  public async ActualizarTitulo(req: Request, res: Response): Promise<void> {
    const { nombre, id_nivel, id } = req.body;
    await pool.query(
      `
      UPDATE cg_titulos SET nombre = $1, id_nivel = $2 WHERE id = $3
      `
      , [nombre, id_nivel, id]);
    res.jsonp({ message: 'Registro actualizado.' });
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
    const { nombre, id_nivel } = req.body;
    await pool.query('INSERT INTO cg_titulos ( nombre, id_nivel ) VALUES ($1, $2)', [nombre, id_nivel]);
    console.log(req.body);
    res.jsonp({ message: 'Título guardado' });
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
      titulo: '',
      nivel: '',
      observacion: ''
    };

    var listTitulosProfesionales: any = [];
    var duplicados: any = [];

    console.log('plantilla: ',plantilla);

    // LECTURA DE LOS DATOS DE LA PLANTILLA
    plantilla.forEach(async (dato: any, indice: any, array: any) => {
      var { nombre, nivel} = dato;
      data.titulo = dato.nombre;
      data.nivel = dato.nivel;

      if((data.titulo != undefined && data.titulo != '')){

      }else{

        if(data.titulo == '' && data.titulo == undefined){
          data.nivel = 'No registrado';
        }

        if(data.nivel == '' && data.nivel == undefined){
          data.nivel = 'No registrado';
        }

        listTitulosProfesionales.push(data);
        
      }


      //Validar primero que exista niveles en la tabla niveles
      const existe_nivel = await pool.query('SELECT id FROM nivel_titulo WHERE UPPER(nombre) = UPPER($1)', [nivel]);
      var id_nivel = existe_nivel.rows[0];
      if(id_nivel != undefined && id_nivel != ''){
        // VERIFICACIÓN SI LA SUCURSAL NO ESTE REGISTRADA EN EL SISTEMA
        const VERIFICAR_Titulos = await  pool.query('SELECT * FROM cg_titulos ' +
        'WHERE nombre = $1 AND id_nivel = $2', [nombre, id_nivel.id]);
        if(VERIFICAR_Titulos.rowCount == 0){
          if(nombre != null && nombre != undefined && nombre != ''){
            console.log('nombre valido: ',nombre);
            data.titulo = nombre;
            if(nivel != null && nivel != undefined && nivel != ''){
              data.nivel = nivel
              if(duplicados.find((p: any)=> p.nombre === dato.nombre && p.nivel === dato.nivel) == undefined)
              {
                data.observacion = 'ok';
                duplicados.push(dato);
              }
            }else{
              data.nivel = 'No registrado';
              data.observacion = 'Nivel no registrado';
            }
          }else{
            console.log('nombre valido: ',nombre);
            data.titulo = 'No registrado';
            if(nivel != null && nivel != undefined && nivel != ''){
              data.nivel = nivel
              data.observacion = 'Titulo no registrado';
            }else{
              data.nivel = 'No registrado';
              data.observacion = 'Titulo y Nivel no registrado';
            }

          }

          listTitulosProfesionales.push(data);

        }else{
          data.titulo = nombre;
          data.nivel = nivel
          data.observacion = 'Ya esta registrado en base';
  
          listTitulosProfesionales.push(data);
         
        }

      }else{
        data.titulo = nombre;
        if(nivel != '' && nivel != undefined){
          data.nivel = nivel;
        }else{
          data.nivel = 'No registrado';
        }
        
        data.observacion = 'No existe el nivel';

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
      listTitulosProfesionales.forEach((item:any) => {
        if(item.observacion == undefined || item.observacion == null || item.observacion == ''){
          item.observacion = 'Registro duplicado'
        }
      });
      return res.jsonp({ message: 'correcto', data:  listTitulosProfesionales});

    }, 1500)
  }



}

export const TITULO_CONTROLADOR = new TituloControlador();

export default TITULO_CONTROLADOR;