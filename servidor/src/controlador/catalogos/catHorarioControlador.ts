import { ObtenerRutaHorarios, ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';
import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import fs from 'fs';
import path from 'path';
import pool from '../../database';
import excel from 'xlsx';
import moment from 'moment';
import { hora } from '../../class/HorasExtras';
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






  public async CargarHorarioPlantilla(req: Request, res: Response): Promise<Response> {
   
    try {
      const { horarios, detalles } = req.body;
      let horariosCargados = true;
      let detallesCargados = true;
      // SI HORARIOS NO ESTA VACIO CARGAR EN LA BASE DE DATOS
      if (horarios.length > 0) {
        // CARGAR HORARIOS
        for (const horario of horarios) {
          const { DESCRIPCION, CODIGO_HORARIO, HORAS_TOTALES, MIN_ALIMENTACION, TIPO_HORARIO, HORARIO_NOCTURNO } = horario;
        
          // FORMATEAR HORAS_TOTALES
          horario.HORAS_TOTALES = FormatearHoras(horario.HORAS_TOTALES.toString(), horario.DETALLE);
  
          // INSERTAR EN LA BASE DE DATOS
          const response: QueryResult = await pool.query(
            `
            INSERT INTO cg_horarios (nombre, min_almuerzo, hora_trabajo,
            nocturno, detalle, codigo, default_) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
            `
            , [DESCRIPCION, MIN_ALIMENTACION, HORAS_TOTALES, HORARIO_NOCTURNO, true, CODIGO_HORARIO, TIPO_HORARIO]);

          const [correcto] = response.rows;
          
          if (correcto) {
            horariosCargados = true;
          }
          else {
            horariosCargados = false;
          }
        }
      }
  
      // SI DETALLES NO ESTA VACIO CARGAR EN LA BASE DE DATOS
      if (detalles.length > 0) {
        // CARGAR DETALLES
        for (const detalle of detalles) {
          const { CODIGO_HORARIO, TIPO_ACCION, HORA, ORDEN, SALIDA_SIGUIENTE_DIA, SALIDA_TERCER_DIA, MIN_ANTES, MIN_DESPUES } = detalle;

          // INSERTAR EN LA BASE DE DATOS
          const response: QueryResult = await pool.query(
            `
            INSERT INTO deta_horarios (orden, hora, minu_espera, id_horario, tipo_accion, segundo_dia, tercer_dia, min_antes,
                min_despues) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `

            , [ORDEN, HORA, 0, CODIGO_HORARIO, TIPO_ACCION, SALIDA_SIGUIENTE_DIA, SALIDA_TERCER_DIA, MIN_ANTES, MIN_DESPUES]);
          const [correcto] = response.rows;

          if (correcto) {
            detallesCargados = true;
          }
          else {
            detallesCargados = false;
          }
        }
      }

      if (horariosCargados && detallesCargados) {
        return res.status(200).jsonp({ message: 'correcto' })
      } else {
        return res.status(404).jsonp({ message: 'error' })
      }
    } catch (error) {
      return res.status(400).jsonp({ message: error });
    }
   
  }



  /** Verificar si existen datos duplicados dentro del sistema */
  public async VerificarDatos(req: Request, res: Response) {
    const documento = req.file?.originalname;
    let separador = path.sep;
    console.log(documento);
    let ruta = ObtenerRutaLeerPlantillas() + separador + documento;
    const workbook = excel.readFile(ruta);
    const sheet_name_list = workbook.SheetNames;
    const plantillaHorarios: Horario[] = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    let plantillaDetalles: DetalleHorario[] = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[1]]);
    plantillaDetalles = plantillaDetalles.filter((valor: DetalleHorario) => valor.CODIGO_HORARIO !== undefined);

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
        data.OBSERVACION = 'Faltan datos requeridos';
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
        data.OBSERVACION = 'Ya existe en el sistema';
        continue;
      }

      data.OBSERVACION = 'Ok';
      
    };

    // VALIDAR HORAS TOTALES EN HORARIOS CON OBSERVACION Ok
    for (const horario of plantillaHorarios) {
      if (horario.OBSERVACION === 'Ok') {
        plantillaHorarios[plantillaHorarios.indexOf(horario)] = ValidarHorasTotales(horario);
      }
    }

    for (const data of plantillaDetalles) {
      let { CODIGO_HORARIO, TIPO_ACCION, HORA, SALIDA_SIGUIENTE_DIA, MIN_ANTES, MIN_DESPUES } = data;
      let orden = 0;
      // VERIFICAR QUE LOS DATOS OBLIGATORIOS EXISTAN
      const requiredValues = [CODIGO_HORARIO, TIPO_ACCION, HORA];
      if (requiredValues.some(value => value === undefined)) {
        data.OBSERVACION = 'Faltan datos requeridos';
        continue;
      }

      switch (TIPO_ACCION.toLowerCase()) {
        case 'entrada':
          orden = 1;
          break;
        case 'inicio alimentación' || 'inicio alimentacion':
          orden = 2;
          break;
        case 'fin alimentación' || 'fin alimentacion':
          orden = 3;
          break;
        case 'salida':
          orden = 4;
          break;
      }

      data.ORDEN = orden;

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
        data.OBSERVACION = 'Codigo de horario no existe';
        continue;
      }

      if (VerificarFormatoDetalleHorario(data)[0]) {
        data.OBSERVACION = VerificarFormatoDetalleHorario(data)[1];
        continue;
      }

      data.OBSERVACION = 'Ok';
    };

    const detallesAgrupados = AgruparDetalles(plantillaDetalles);
    const detallesAgrupadosVerificados = VerificarDetallesAgrupados(detallesAgrupados, plantillaHorarios);

    // CAMBIAR OBSERVACIONES DE PLANTILLADETALLES SEGUN LOS CODIGOS QUE NO CUMPLAN CON LOS REQUISITOS
    for (const codigo of detallesAgrupadosVerificados) {
      const detalles = plantillaDetalles.filter((detalle: DetalleHorario) => detalle.CODIGO_HORARIO === codigo.codigo);
      for (const detalle of detalles) {
        detalle.OBSERVACION = codigo.observacion;
      }
    }

    // VERIFICAR EXISTENCIA DE DETALLES PARA CADA HORARIO
    plantillaHorarios.forEach((horario: any) => {
      if (horario.OBSERVACION === 'Ok') {
        const detallesCorrespondientes = plantillaDetalles.filter((detalle: any) => detalle.CODIGO_HORARIO === horario.CODIGO_HORARIO && detalle.OBSERVACION === 'Ok');
        if (detallesCorrespondientes.length === 0) {
          horario.DETALLE = false;
        } else{
          horario.DETALLE = true;
        }
      }
    });

    const horariosOk = plantillaHorarios.filter((horario: any) => horario.OBSERVACION === 'Ok');
    

    // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
    fs.access(ruta, fs.constants.F_OK, (err) => {
      if (err) {
      } else {
        // ELIMINAR DEL SERVIDOR
        fs.unlinkSync(ruta);
      }
    });

    const mensaje = horariosOk.length > 0 ? 'correcto' : 'error';

    res.json({plantillaHorarios, plantillaDetalles, mensaje});
  }

}

// FUNCION PARA VERIFICAR SI EXISTEN DATOS DUPLICADOS EN LA PLANTILLA
function VerificarDuplicado(codigos: any, codigo: string): boolean {
  const valores = codigos.filter((valor: string) => valor == codigo);
  const duplicado = valores.length > 1;
  return duplicado;
}

// FUNCION PARA VERIFICAR QUE LOS TIPOS DE DATOS EN LOS HORARIOS SEAN LOS CORRECTOS
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
async function VerificarDuplicadoBase(codigo: string): Promise<boolean>{
  const result = await pool.query('SELECT * FROM cg_horarios WHERE UPPER(codigo) = $1',
            [codigo.toUpperCase()]);
  return result.rowCount > 0;
}

// FUNCION PARA COMPROBAR QUE CODIGO_HORARIO EXISTA EN PLANTILLAHORARIOS
function VerificarCodigoHorarioDetalleHorario(codigo: string, plantillaHorarios: Horario[]): boolean{
  const result = plantillaHorarios.filter((valor: Horario) => valor.CODIGO_HORARIO == codigo && valor.OBSERVACION == 'Ok');
  return result.length > 0;
}

// FUNCION PARA COMPROBAR LOS FORMATOS DE LOS DATOS EN LA PLANTILLA DETALLE HORARIO
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

// FUNCION PARA AGRUPAR LOS DETALLES QUE PERTENEZCAN A UN MISMO HORARIO
function AgruparDetalles(plantillaDetalles: DetalleHorario[]): any {
  const result = plantillaDetalles.reduce((r: any, a: any) => {
    r[a.CODIGO_HORARIO] = [...r[a.CODIGO_HORARIO] || [], a];
    return r;
  }, {});
  return result;
}

// FUNCION PARA VERIFICAR QUE LOS DETALLES AGRUPADOS ESTEN COMPLETOS PARA CADA HORARIO
// Y VALIDAR QUE LA SUMA DE HORAS DE ENTRADA Y SALIDA SEA IGUAL A HORAS_TOTALES
function VerificarDetallesAgrupados(detallesAgrupados: any, horarios: Horario[]): any {
  horarios = horarios.filter((horario: Horario) => horario.OBSERVACION === 'Ok');
  let codigosHorarios = horarios.map((horario: Horario) => horario.CODIGO_HORARIO);
  let codigosDetalles= [];

  // FILTRAR DETALLES QUE TENGAN CODIGO_HORARIO EN HORARIOS
  for (const codigoHorario in detallesAgrupados) {
    if (!codigosHorarios.includes(codigoHorario)) {
      delete detallesAgrupados[codigoHorario];
    }
  }

  for (const codigoHorario in detallesAgrupados) {
    const detalles = detallesAgrupados[codigoHorario].filter((detalle: any) => detalle.OBSERVACION === 'Ok');
    const horario = horarios.find(h => h.CODIGO_HORARIO === codigoHorario);
    if (horario) {
      const tieneAlimentacion = horario.MIN_ALIMENTACION > 0;
      const tiposAccionRequeridos = tieneAlimentacion ? ['Entrada', 'Inicio alimentación', 'Fin alimentación', 'Salida'] : ['Entrada', 'Salida'];
      const tiposAccionExistentes = detalles.map((detalle: any) => detalle.TIPO_ACCION);
      if (tiposAccionExistentes.length < tiposAccionRequeridos.length ) {
        codigosDetalles.push({codigo: codigoHorario, observacion:`Requerido ${tiposAccionRequeridos.length} detalles`});
      } else if  ( tiposAccionExistentes.length > tiposAccionRequeridos.length ) {
        codigosDetalles.push({codigo: codigoHorario, observacion:`Requerido solo ${tiposAccionRequeridos.length} detalles`});
      } 
      //VERIFICAR QUE EN LOS TIPOSACCIONEXISTENTES ESTEN TODOS LOS TIPOSACCIONREQUERIDOS
      else if (tiposAccionRequeridos.some((tipo: string) => !tiposAccionExistentes.includes(tipo))) {
        codigosDetalles.push({codigo: codigoHorario, observacion:`No cumple con los tipos de acción requeridos`});
      }

      else {
        //VERIFICAR QUE SALIDA MENOS ENTRADA SEA IGUAL A HORAS_TOTALES
        const entrada = detalles.find((detalle: any) => detalle.TIPO_ACCION === 'Entrada');
        const salida = detalles.find((detalle: any) => detalle.TIPO_ACCION === 'Salida');
        const horaEntrada = moment(entrada.HORA, 'HH:mm');
        const horaSalida = moment(salida.HORA, 'HH:mm');
        // SI EL HORARIO TIENE SALIDA AL OTRO DIA SE DEBE SUMAR 24 HORAS A LA SALIDA
        if (salida.SALIDA_SIGUIENTE_DIA) {
          horaSalida.add(1, 'days');
        }
        const diferencia = horaSalida.diff(horaEntrada, 'minutes');
        const horasTotalesEnMinutos = convertirHorasTotalesAMinutos(horario.HORAS_TOTALES.toString());
        if (diferencia !== horasTotalesEnMinutos) {
          codigosDetalles.push({codigo: codigoHorario, observacion: 'No cumple con las horas totales'});
        }
      }
    }
  }
  return codigosDetalles;
}

function convertirHorasTotalesAMinutos(horasTotales: string): number {
  if (horasTotales.includes(':')) {
    const [horas, minutos] = horasTotales.split(':').map(Number);
    return horas * 60 + minutos;
  } else {
    return Number(horasTotales) * 60;
  }
}

// FUNCION PARA FORMATEAR HORAS
function FormatearHoras(hora: string, detalle: boolean): string {
  let partes = hora.split(':');
  let horas = parseInt(partes[0]);
  let minutos = partes[1] || '00';
  let horasStr = horas.toString();

  if (horas < 10) {
    horasStr = '0' + horasStr;
  }

  if (detalle) {
    minutos += ':00';
  }

  return `${horasStr}:${minutos}`;
}

//FUNCION PARA VALIDAR SI EL HORARIO ES >= 24:00 Y < 72:00 (NO DETALLES DE ALIMENTACION
function ValidarHorasTotales(horario: Horario): Horario{

  const hora = FormatearHoras(horario.HORAS_TOTALES.toString(), true);
  if ((hora >= '24:00' && hora < '72:00') ||
    (hora >= '24:00:00' && hora < '72:00:00')) {
    horario.MIN_ALIMENTACION = 0;
  }
  else if (hora >= '72:00' || hora >= '72:00:00') {
    horario.MIN_ALIMENTACION = 0;
  }
  return horario;
}


interface Horario {
  DESCRIPCION: string | number, 
  CODIGO_HORARIO: string | number, 
  HORAS_TOTALES: string | number, 
  MIN_ALIMENTACION: number,
  TIPO_HORARIO: string, 
  HORARIO_NOCTURNO: string,
  OBSERVACION: string,
  DETALLE: boolean,
}

interface DetalleHorario {
  CODIGO_HORARIO: string | number,
  TIPO_ACCION: string,
  HORA: string,	
  ORDEN: string | number,
  SALIDA_SIGUIENTE_DIA: string,
  SALIDA_TERCER_DIA: string,
  MIN_ANTES: string | number,
  MIN_DESPUES: string | number,
  OBSERVACION: string,
}





export const HORARIO_CONTROLADOR = new HorarioControlador();

export default HORARIO_CONTROLADOR;