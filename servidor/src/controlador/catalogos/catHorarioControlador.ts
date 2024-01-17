import { ObtenerRutaHorarios, ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';
import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import fs from 'fs';
import path from 'path';
import pool from '../../database';
import excel from 'xlsx';
import moment from 'moment';
const builder = require('xmlbuilder');

class HorarioControlador {


  // REGISTRAR HORARIO
  public async CrearHorario(req: Request, res: Response): Promise<Response> {
    const { nombre, min_almuerzo, hora_trabajo, nocturno, detalle, codigo, default_ } = req.body;
    try {
      const response: QueryResult = await pool.query(
        `
      INSERT INTO cg_horarios (nombre, min_almuerzo, hora_trabajo,
      nocturno, detalle, codigo, default_) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
      `
        , [nombre, min_almuerzo, hora_trabajo, nocturno, detalle, codigo, default_]);

      const [horario] = response.rows;

      if (horario) {
        return res.status(200).jsonp(horario)
      }
      else {
        return res.status(404).jsonp({ message: 'error' })
      }
    } catch (error) {
      console.log('error ', error)
      return res.status(400).jsonp({ message: error });
    }
  }

  // BUSCAR HORARIOS POR EL NOMBRE
  public async BuscarHorarioNombre(req: Request, res: Response) {
    const { codigo } = req.body;
    try {
      const HORARIOS = await pool.query(
        `
        SELECT * FROM cg_horarios WHERE UPPER(codigo) = $1
        `
        , [codigo.toUpperCase()]);

      if (HORARIOS.rowCount > 0) return res.status(200).jsonp({ message: 'No se encuentran registros.' });

      return res.status(404).jsonp({ message: 'No existe horario. Continua.' })

    } catch (error) {
      return res.status(400).jsonp({ message: error });
    }

  }

  // GUARDAR DOCUMENTO DE HORARIO
  public async GuardarDocumentoHorario(req: Request, res: Response): Promise<void> {

    let id = req.params.id;
    let { archivo, codigo } = req.params;
    // FECHA DEL SISTEMA
    var fecha = moment();
    var anio = fecha.format('YYYY');
    var mes = fecha.format('MM');
    var dia = fecha.format('DD');
    // LEER DATOS DE IMAGEN
    let documento = id + '_' + codigo + '_' + anio + '_' + mes + '_' + dia + '_' + req.file?.originalname;
    let separador = path.sep;

    await pool.query(
      `
      UPDATE cg_horarios SET documento = $2 WHERE id = $1
      `
      , [id, documento]);

    res.jsonp({ message: 'Documento actualizado.' });

    if (archivo != 'null' && archivo != '' && archivo != null) {
      if (archivo != documento) {
        let ruta = ObtenerRutaHorarios() + separador + archivo;
        // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
        fs.access(ruta, fs.constants.F_OK, (err) => {
          if (err) {
          } else {
            // ELIMINAR DEL SERVIDOR
            fs.unlinkSync(ruta);
          }
        });
      }
    }
  }

  // METODO PARA ACTUALIZAR DATOS DE HORARIO
  public async EditarHorario(req: Request, res: Response): Promise<any> {
    const id = req.params.id;
    const { nombre, min_almuerzo, hora_trabajo, nocturno, detalle, codigo, default_ } = req.body;

    try {
      const respuesta = await pool.query(
        `
        UPDATE cg_horarios SET nombre = $1, min_almuerzo = $2, hora_trabajo = $3,  
        nocturno = $4, detalle = $5, codigo = $6, default_ = $7
        WHERE id = $8 RETURNING *
        `
        , [nombre, min_almuerzo, hora_trabajo, nocturno, detalle, codigo, default_, id,])
        .then((result: any) => { return result.rows })

      if (respuesta.length === 0) return res.status(400).jsonp({ message: 'error' });

      return res.status(200).jsonp(respuesta);

    } catch (error) {
      return res.status(400).jsonp({ message: error });
    }
  }

  // ELIMINAR DOCUMENTO HORARIO BASE DE DATOS - SERVIDOR
  public async EliminarDocumento(req: Request, res: Response): Promise<void> {
    let { documento, id } = req.body;
    let separador = path.sep;

    await pool.query(
      `
            UPDATE cg_horarios SET documento = null WHERE id = $1
            `
      , [id]);

    if (documento != 'null' && documento != '' && documento != null) {
      let ruta = ObtenerRutaHorarios() + separador + documento;
      // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
      fs.access(ruta, fs.constants.F_OK, (err) => {
        if (err) {
        } else {
          // ELIMINAR DEL SERVIDOR
          fs.unlinkSync(ruta);
        }
      });
    }

    res.jsonp({ message: 'Documento actualizado.' });
  }

  // ELIMINAR DOCUMENTO HORARIO DEL SERVIDOR
  public async EliminarDocumentoServidor(req: Request, res: Response): Promise<void> {
    let { documento } = req.body;
    let separador = path.sep;

    if (documento != 'null' && documento != '' && documento != null) {
      let ruta = ObtenerRutaHorarios() + separador + documento;
      // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
      fs.access(ruta, fs.constants.F_OK, (err) => {
        if (err) {
        } else {
          // ELIMINAR DEL SERVIDOR
          fs.unlinkSync(ruta);
        }
      });
    }

    res.jsonp({ message: 'Documento actualizado.' });
  }

  // BUSCAR LISTA DE CATALOGO HORARIOS  --**VERIFICADO
  public async ListarHorarios(req: Request, res: Response) {
    const HORARIOS = await pool.query(
      `
      SELECT * FROM cg_horarios ORDER BY codigo ASC
      `);
    if (HORARIOS.rowCount > 0) {
      return res.jsonp(HORARIOS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  // METODO PARA BUSCAR HORARIOS SIN CONSIDERAR UNO EN ESPECIFICO (METODO DE EDICION)
  public async BuscarHorarioNombre_(req: Request, res: Response) {
    const { id, codigo } = req.body;
    try {
      const HORARIOS = await pool.query(
        `
        SELECT * FROM cg_horarios WHERE NOT id = $1 AND UPPER(codigo) = $2)
        `,
        [parseInt(id), codigo.toUpperCase()]);

      if (HORARIOS.rowCount > 0) return res.status(200).jsonp({
        message: 'El nombre de horario ya existe, ingresar un nuevo nombre.'
      });

      return res.status(404).jsonp({ message: 'No existe horario. Continua.' })
    } catch (error) {
      return res.status(400).jsonp({ message: error });
    }
  }

  // METODO PARA ELIMINAR REGISTROS
  public async EliminarRegistros(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    await pool.query(
      `
      DELETE FROM cg_horarios WHERE id = $1
      `
      , [id]);
    res.jsonp({ message: 'Registro eliminado.' });
  }

  // METODO PARA BUSCAR DATOS DE UN HORARIO
  public async ObtenerUnHorario(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const UN_HORARIO = await pool.query(
      `
      SELECT * FROM cg_horarios WHERE id = $1
      `
      , [id]);
    if (UN_HORARIO.rowCount > 0) {
      return res.jsonp(UN_HORARIO.rows)
    }
    else {
      res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  // METODO PARA EDITAR HORAS TRABAJADAS
  public async EditarHorasTrabaja(req: Request, res: Response): Promise<any> {
    const id = req.params.id;
    const { hora_trabajo } = req.body;
    try {
      const respuesta = await pool.query(
        `
        UPDATE cg_horarios SET hora_trabajo = $1 WHERE id = $2 RETURNING *
        `
        , [hora_trabajo, id])
        .then((result: any) => { return result.rows })

      if (respuesta.length === 0) return res.status(400).jsonp({ message: 'No actualizado.' });

      return res.status(200).jsonp(respuesta)

    } catch (error) {
      return res.status(400).jsonp({ message: error });
    }
  }

  // METODO PARA BUSCAR DOCUMENTO
  public async ObtenerDocumento(req: Request, res: Response): Promise<any> {
    const docs = req.params.docs;
    let separador = path.sep;
    let ruta = ObtenerRutaHorarios() + separador + docs;
    fs.access(ruta, fs.constants.F_OK, (err) => {
      if (err) {
      } else {
        res.sendFile(path.resolve(ruta));
      }
    });
  }






  public async CargarHorarioPlantilla(req: Request, res: Response): Promise<void> {
    
    console.log('Cargar')
    // let list: any = req.files;
    // let cadena = list.uploads[0].path;
    // let filename = cadena.split("\\")[1];
    // var filePath = `./plantillas/${filename}`

    // const workbook = excel.readFile(filePath);
    // const sheet_name_list = workbook.SheetNames; // Array de hojas de calculo
    // const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    // /** Horarios */
    // plantilla.forEach(async (data: any) => {
    //   var { nombre_horario, minutos_almuerzo, hora_trabajo, horario_nocturno } = data;
    //   if (minutos_almuerzo != undefined) {
    //     await pool.query('INSERT INTO cg_horarios (nombre, min_almuerzo, hora_trabajo, nocturno) VALUES ($1, $2, $3, $4)', [nombre_horario, minutos_almuerzo, hora_trabajo, horario_nocturno]);
    //     res.jsonp({ message: 'correcto' });
    //   } else {
    //     minutos_almuerzo = 0;
    //     await pool.query('INSERT INTO cg_horarios (nombre, min_almuerzo, hora_trabajo, nocturno) VALUES ($1, $2, $3, $4)', [nombre_horario, minutos_almuerzo, hora_trabajo, horario_nocturno]);
    //     res.jsonp({ message: 'correcto' });
    //   }
    // });

    // // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
    // fs.access(filePath, fs.constants.F_OK, (err) => {
    //   if (err) {
    //   } else {
    //     // ELIMINAR DEL SERVIDOR
    //     fs.unlinkSync(filePath);
    //   }
    // });

  }



  /** Verificar si existen datos duplicados dentro del sistema */
  public async VerificarDatos(req: Request, res: Response) {
    const documento = req.file?.originalname;
    let separador = path.sep;
    let ruta = ObtenerRutaLeerPlantillas() + separador + documento;
    const workbook = excel.readFile(ruta);
    const sheet_name_list = workbook.SheetNames;
    const plantillaHorarios: Horario[] = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    let plantillaDetalles: DetalleHorario[] = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[1]]);
    plantillaDetalles = plantillaDetalles.filter((valor: DetalleHorario) => valor.CODIGO_HORARIO !== undefined);
    console.log('plantillaDetalles', plantillaDetalles);

    let codigos: string[] = [];
    for (const data of plantillaHorarios) {
      let { DESCRIPCION, CODIGO_HORARIO, HORAS_TOTALES, MIN_ALIMENTACION, TIPO_HORARIO, HORARIO_NOCTURNO} = data;
      if (MIN_ALIMENTACION === undefined) {
        data.MIN_ALIMENTACION = 0; 
      }

      if (HORARIO_NOCTURNO === undefined) {
        data.HORARIO_NOCTURNO = 'No'; 
      }

      // VERIFICAR QUE LOS DATOS OBLIGATORIOS EXISTAN
      const requiredValues = [DESCRIPCION, CODIGO_HORARIO, TIPO_HORARIO, HORAS_TOTALES, HORARIO_NOCTURNO];

      if (requiredValues.some(value => value === undefined)) {
        data.OBSERVACION = 'Faltan valores obligatorios';
        continue;
      }

      codigos.push(CODIGO_HORARIO.toString());

      if (VerificarDuplicado(codigos, CODIGO_HORARIO.toString())) {
        data.OBSERVACION = 'Registro duplicado';
        continue;
      }

      if (VerificarFormatoDatos(data)[0]) {
        data.OBSERVACION = VerificarFormatoDatos(data)[1];
        continue;
      }

      if (await VerificarDuplicadoBase(CODIGO_HORARIO.toString())) {
        data.OBSERVACION = 'Ya esta registrado en la base de datos';
        continue;
      }

      data.OBSERVACION = 'Ok';
      
    };

    for (const data of plantillaDetalles) {
      let { CODIGO_HORARIO, TIPO_ACCION, HORA, SALIDA_SIGUIENTE_DIA, MIN_ANTES, MIN_DESPUES } = data;
      // VERIFICAR QUE LOS DATOS OBLIGATORIOS EXISTAN
      const requiredValues = [CODIGO_HORARIO, TIPO_ACCION, HORA];
      if (requiredValues.some(value => value === undefined)) {
        data.OBSERVACION = 'Faltan valores obligatorios';
        continue;
      }

      if (MIN_ANTES === undefined) {
        data.MIN_ANTES = 0; 
      }

      if (MIN_DESPUES === undefined) {
        data.MIN_DESPUES = 0; 
      }

      if (SALIDA_SIGUIENTE_DIA === undefined) {
        data.SALIDA_SIGUIENTE_DIA = 'No'; 
      }
      

      if (!VerificarCodigoHorarioDetalleHorario(CODIGO_HORARIO.toString(), plantillaHorarios)) {
        data.OBSERVACION = 'Codigo de horario no existe en los horarios validos';
        continue;
      }

      if (VerificarFormatoDetalleHorario(data)[0]) {
        data.OBSERVACION = VerificarFormatoDetalleHorario(data)[1];
        continue;
      }

      data.OBSERVACION = 'Ok';
    };

    // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
    fs.access(ruta, fs.constants.F_OK, (err) => {
      if (err) {
      } else {
        // ELIMINAR DEL SERVIDOR
        fs.unlinkSync(ruta);
      }
    });

    res.json({plantillaHorarios, plantillaDetalles});
  }

  /** Verificar que los datos dentro de la plantilla no se encuntren duplicados */
  // public async VerificarPlantilla(req: Request, res: Response) {
  //   const documento = req.file?.originalname;
  //   let separador = path.sep;
  //   let ruta = ObtenerRutaLeerPlantillas() + separador + documento;
  //   const workbook = excel.readFile(ruta);
  //   const sheet_name_list = workbook.SheetNames;
  //   const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

  //   var contarNombreData = 0;
  //   var contador_arreglo = 1;
  //   var arreglos_datos: any = [];
  //   //Leer la plantilla para llenar un array con los datos nombre para verificar que no sean duplicados
  //   plantilla.forEach(async (data: any) => {
  //     // Datos que se leen de la plantilla ingresada
  //     var { nombre_horario, minutos_almuerzo, hora_trabajo, horario_nocturno } = data;
  //     let datos_array = {
  //       nombre: nombre_horario,
  //     }
  //     arreglos_datos.push(datos_array);
  //   });

  //   // Vamos a verificar dentro de arreglo_datos que no se encuentren datos duplicados
  //   for (var i = 0; i <= arreglos_datos.length - 1; i++) {
  //     for (var j = 0; j <= arreglos_datos.length - 1; j++) {
  //       if (arreglos_datos[i].nombre.toUpperCase() === arreglos_datos[j].nombre.toUpperCase()) {
  //         contarNombreData = contarNombreData + 1;
  //       }
  //     }
  //     contador_arreglo = contador_arreglo + 1;
  //   }

  //   // Cuando todos los datos han sido leidos verificamos si todos los datos son correctos
  //   console.log('nombre_data', contarNombreData, plantilla.length, contador_arreglo);
  //   if ((contador_arreglo - 1) === plantilla.length) {
  //     if (contarNombreData === plantilla.length) {
  //       return res.jsonp({ message: 'correcto' });
  //     } else {
  //       return res.jsonp({ message: 'error' });
  //     }
  //   }
  //   // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
  //   fs.access(ruta, fs.constants.F_OK, (err) => {
  //     if (err) {
  //     } else {
  //       // ELIMINAR DEL SERVIDOR
  //       fs.unlinkSync(ruta);
  //     }
  //   });

  // }

}

// FUNCION PARA VERIFICAR SI EXISTEN DATOS DUPLICADOS EN LA PLANTILLA
function VerificarDuplicado(codigos: any, codigo: string): boolean {
  const valores = codigos.filter((valor: string) => valor == codigo);
  const duplicado = valores.length > 1;
  return duplicado;
}

//FUNCION PARA VERIFICAR QUE LOS TIPOS DE DATOS SEAN LOS CORRECTOS
function VerificarFormatoDatos(data: any): [boolean, string] {
  let observacion = '';
  let error = true
  const { HORAS_TOTALES, MIN_ALIMENTACION, TIPO_HORARIO, HORARIO_NOCTURNO } = data;
  const horasTotalesFormatoCorrecto = /^(\d+)$|^(\d{1,2}:\d{2})$|^(\d{1,2}:\d{2}:\d{2})$/.test(HORAS_TOTALES);
  const minAlimentacionFormatoCorrecto = /^\d+$/.test(MIN_ALIMENTACION);
  const tipoHorarioValido = ['Laborable', 'Libre', 'Feriado'].includes(TIPO_HORARIO);
  const tipoHorarioNocturnoValido = ['Si', 'No'].includes(HORARIO_NOCTURNO);
  horasTotalesFormatoCorrecto ? null : observacion = 'Formato de HORAS_TOTALES incorrecto';
  minAlimentacionFormatoCorrecto ? null : observacion = 'Formato de MIN_ALIMENTACION incorrecto';
  tipoHorarioValido ? null : observacion = 'Tipo de horario incorrecto';
  tipoHorarioNocturnoValido ? null : observacion = 'Tipo de horario nocturno incorrecto'; 
  error = horasTotalesFormatoCorrecto && minAlimentacionFormatoCorrecto && tipoHorarioValido && tipoHorarioNocturnoValido ? false : true ;
  return [error, observacion];
}

// FUNCION PARA VERIFICAR SI EXISTEN DATOS DUPLICADOS EN LA BASE DE DATOS
async function VerificarDuplicadoBase(codigo: string){
  const result = await pool.query('SELECT * FROM cg_horarios WHERE UPPER(codigo) = $1',
            [codigo.toUpperCase()]);
  return result.rowCount > 0;
}

//FUNCION PARA COMBROBAR QUE CODIGO_HORARIO EXISTA EN PLANTILLAHORARIOS
function VerificarCodigoHorarioDetalleHorario(codigo: string, plantillaHorarios: Horario[]){
  const result = plantillaHorarios.filter((valor: Horario) => valor.CODIGO_HORARIO == codigo && valor.OBSERVACION == 'Ok');
  console.log('result', codigo, result);
  return result.length > 0;
}

//FUNCION PARA COMPROBAR FORMATO DE PLANILLA DETALLE HORARIO
function VerificarFormatoDetalleHorario(data: any): [boolean, string] {
  let observacion = '';
  let error = true
  const { HORA, MIN_ANTES, MIN_DESPUES } = data;
  const horaFormatoCorrecto = /^(\d{1,2}:\d{2})$|^(\d{1,2}:\d{2}:\d{2})$/.test(HORA);
  const minAntesFormatoCorrecto = /^\d+$/.test(MIN_ANTES);
  const minDespuesFormatoCorrecto = /^\d+$/.test(MIN_DESPUES);
  horaFormatoCorrecto ? null : observacion = 'Formato de HORA incorrecto';
  minAntesFormatoCorrecto ? null : observacion = 'Formato de MIN_ANTES INCORRECTO';
  minDespuesFormatoCorrecto ? null : observacion = 'Formato de MIN_DESPUES INCORRECTO';
  error = horaFormatoCorrecto && minAntesFormatoCorrecto && minDespuesFormatoCorrecto ? false : true ;
  return [error, observacion];
}


interface Horario {
  DESCRIPCION: string | number, 
  CODIGO_HORARIO: string | number, 
  HORAS_TOTALES: string | number, 
  MIN_ALIMENTACION: string | number,
  TIPO_HORARIO: string, 
  HORARIO_NOCTURNO: string,
  OBSERVACION: string
}

interface DetalleHorario {
  CODIGO_HORARIO: string | number,
  TIPO_ACCION: string,
  HORA: string,	
  ORDEN: string | number,
  SALIDA_SIGUIENTE_DIA: string,
  MIN_ANTES: string | number,
  MIN_DESPUES: string | number,
  OBSERVACION: string,
}





export const HORARIO_CONTROLADOR = new HorarioControlador();

export default HORARIO_CONTROLADOR;