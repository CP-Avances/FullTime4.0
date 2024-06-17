import { ObtenerIndicePlantilla, ObtenerRutaHorarios, ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';
import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';
import fs from 'fs';
import path from 'path';
import pool from '../../database';
import excel from 'xlsx';
import moment from 'moment';

class HorarioControlador {


  // REGISTRAR HORARIO
  public async CrearHorario(req: Request, res: Response): Promise<Response> {
    const { nombre, min_almuerzo, hora_trabajo, nocturno, codigo, default_, user_name, ip } = req.body;
    try {
      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      const response: QueryResult = await pool.query(
        `
      INSERT INTO eh_cat_horarios (nombre, minutos_comida, hora_trabajo,
        nocturno, codigo, default_) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
      `
        , [nombre, min_almuerzo, hora_trabajo, nocturno, codigo, default_]);

      const [horario] = response.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eh_cat_horarios',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: JSON.stringify(horario),
        ip,
        observacion: null
      })

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');

      if (horario) {
        return res.status(200).jsonp(horario)
      }
      else {
        return res.status(404).jsonp({ message: 'error' })
      }
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: error });
    }
  }

  // BUSCAR HORARIOS POR EL NOMBRE
  public async BuscarHorarioNombre(req: Request, res: Response) {
    const { codigo } = req.body;
    try {
      const HORARIOS = await pool.query(
        `
        SELECT * FROM eh_cat_horarios WHERE UPPER(codigo) = $1
        `
        , [codigo.toUpperCase()]);

      if (HORARIOS.rowCount != 0) return res.status(200).jsonp({ message: 'No se encuentran registros.' });

      return res.status(404).jsonp({ message: 'No existe horario. Continua.' })

    } catch (error) {
      return res.status(400).jsonp({ message: error });
    }

  }

  // GUARDAR DOCUMENTO DE HORARIO
  public async GuardarDocumentoHorario(req: Request, res: Response): Promise<Response> {

    try {
      let id = req.params.id;
      let { archivo, codigo } = req.params;
      const { user_name, ip } = req.body;

      // FECHA DEL SISTEMA
      var fecha = moment();
      var anio = fecha.format('YYYY');
      var mes = fecha.format('MM');
      var dia = fecha.format('DD');
      // LEER DATOS DE IMAGEN
      let documento = id + '_' + codigo + '_' + anio + '_' + mes + '_' + dia + '_' + req.file?.originalname;
      let separador = path.sep;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES

      const horario = await pool.query(
        `
        SELECT * FROM eh_cat_horarios WHERE id = $1
        `
        , [id]);
      const [datosOriginales] = horario.rows;

      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eh_cat_horarios',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al actualizar el horario con id: ${id}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'error' });
      }

      await pool.query(
        `
        UPDATE eh_cat_horarios SET documento = $2 WHERE id = $1
        `
        , [id, documento]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eh_cat_horarios',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: JSON.stringify({ documento }),
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');

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

      return res.jsonp({ message: 'Documento actualizado.' });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: error });
    }
  }

  // METODO PARA ACTUALIZAR DATOS DE HORARIO
  public async EditarHorario(req: Request, res: Response): Promise<any> {
    const id = req.params.id;
    const { nombre, min_almuerzo, hora_trabajo, nocturno, codigo, default_, user_name, ip } = req.body;

    try {
      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const horario = await pool.query(
        `
        SELECT * FROM eh_cat_horarios WHERE id = $1
        `
        , [id]);
      const [datosOriginales] = horario.rows;

      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eh_cat_horarios',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al actualizar el horario con id: ${id}`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'error' });
      }
      const respuesta = await pool.query(
        `
        UPDATE eh_cat_horarios SET nombre = $1, minutos_comida = $2, hora_trabajo = $3,  
          nocturno = $4, codigo = $5, default_ = $6
        WHERE id = $7 RETURNING *
        `
        , [nombre, min_almuerzo, hora_trabajo, nocturno, codigo, default_, id,])
        .then((result: any) => { return result.rows })

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eh_cat_horarios',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: `{nombre: ${nombre}, minutos_comida: ${min_almuerzo}, hora_trabajo: ${hora_trabajo}, nocturno: ${nocturno}, codigo: ${codigo}, default_: ${default_}}`,
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');

      if (respuesta.length === 0) return res.status(400).jsonp({ message: 'error' });

      return res.status(200).jsonp(respuesta);

    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: error });
    }
  }

  // ELIMINAR DOCUMENTO HORARIO BASE DE DATOS - SERVIDOR
  public async EliminarDocumento(req: Request, res: Response): Promise<Response> {
    let { documento, id, user_name, ip } = req.body;
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

    try {
      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const horario = await pool.query(
        `
        SELECT * FROM eh_cat_horarios WHERE id = $1
        `
        , [id]);
      const [datosOriginales] = horario.rows;

      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eh_cat_horarios',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al actualizar el horario con id: ${id}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'error' });
      }

      await pool.query(
        `
              UPDATE eh_cat_horarios SET documento = null WHERE id = $1
              `
        , [id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eh_cat_horarios',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: `{documento: null}`,
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Documento actualizado.' });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: error });
    }
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
      SELECT * FROM eh_cat_horarios ORDER BY codigo ASC
      `);
    if (HORARIOS.rowCount != 0) {
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
        SELECT * FROM eh_cat_horarios WHERE NOT id = $1 AND UPPER(codigo) = $2
        `,
        [parseInt(id), codigo.toUpperCase()]);

      if (HORARIOS.rowCount != 0) return res.status(200).jsonp({
        message: 'El nombre de horario ya existe, ingresar un nuevo nombre.'
      });

      return res.status(404).jsonp({ message: 'No existe horario. Continua.' })
    } catch (error) {
      return res.status(500).jsonp({ message: error });
    }
  }

  // METODO PARA ELIMINAR REGISTROS
  public async EliminarRegistros(req: Request, res: Response): Promise<Response> {
    try {
      const { user_name, ip } = req.body;
      const id = req.params.id;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const horario = await pool.query(
        `
        SELECT * FROM eh_cat_horarios WHERE id = $1
        `
        , [id]);
      const [datosOriginales] = horario.rows;

      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eh_cat_horarios',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al eliminar el horario con id: ${id}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'error' });
      }

      await pool.query(
        `
        DELETE FROM eh_cat_horarios WHERE id = $1
        `
        , [id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eh_cat_horarios',
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
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: error });
    }
  }

  // METODO PARA BUSCAR DATOS DE UN HORARIO
  public async ObtenerUnHorario(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const UN_HORARIO = await pool.query(
      `
      SELECT * FROM eh_cat_horarios WHERE id = $1
      `
      , [id]);
    if (UN_HORARIO.rowCount != 0) {
      return res.jsonp(UN_HORARIO.rows)
    }
    else {
      res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  // METODO PARA EDITAR HORAS TRABAJADAS
  public async EditarHorasTrabaja(req: Request, res: Response): Promise<any> {
    const id = req.params.id;
    const { hora_trabajo, user_name, ip } = req.body;
    try {
      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const horario = await pool.query(
        `
        SELECT * FROM eh_cat_horarios WHERE id = $1
        `
        , [id]);
      const [datosOriginales] = horario.rows;

      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eh_cat_horarios',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al actualizar el horario con id: ${id}`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'No actualizado.' });
      }

      const respuesta = await pool.query(
        `
        UPDATE eh_cat_horarios SET hora_trabajo = $1 WHERE id = $2 RETURNING *
        `
        , [hora_trabajo, id])
        .then((result: any) => { return result.rows });

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eh_cat_horarios',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: `{hora_trabajo: ${hora_trabajo}}`,
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');

      if (respuesta.length === 0) return res.status(400).jsonp({ message: 'No actualizado.' });

      return res.status(200).jsonp(respuesta)

    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: error });
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

  // METODO PARA CARGAR HORARIOS Y DETALLES DE UNA PLANTILLA EN LA BASE DE DATOS
  public async CargarHorarioPlantilla(req: Request, res: Response): Promise<Response> {

    try {
      const { horarios, detalles, user_name, } = req.body;
      let horariosCargados = true;
      let detallesCargados = true;
      let codigosHorariosCargados = [];
      // SI HORARIOS NO ESTA VACIO CARGAR EN LA BASE DE DATOS
      if (horarios.length > 0) {
        // CARGAR HORARIOS
        for (const horario of horarios) {
          try {
            let { DESCRIPCION, CODIGO_HORARIO, HORAS_TOTALES, MINUTOS_ALIMENTACION, TIPO_HORARIO, HORARIO_NOCTURNO } = horario;

            horario.CODIGO_HORARIO = horario.CODIGO_HORARIO.toString();

            //CAMBIAR TIPO DE HORARIO Laborable = N, Libre = L, Feriado = FD
            switch (TIPO_HORARIO) {
              case 'Laborable':
                TIPO_HORARIO = 'N';
                break;
              case 'Libre':
                TIPO_HORARIO = 'L';
                break;
              case 'Feriado':
                TIPO_HORARIO = 'FD';
                break;
            }

            // CAMBIAR HORARIO_NOCTURNO
            switch (HORARIO_NOCTURNO) {
              case 'Si':
                HORARIO_NOCTURNO = true;
                break;
              case 'No':
                HORARIO_NOCTURNO = false;
                break;
              default:
                HORARIO_NOCTURNO = false;
                break;
            }

            // FORMATEAR HORAS_TOTALES
            HORAS_TOTALES = FormatearHoras(horario.HORAS_TOTALES.toString(), horario.DETALLE);

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // INSERTAR EN LA BASE DE DATOS
            const response: QueryResult = await pool.query(
              `
              INSERT INTO eh_cat_horarios (nombre, minutos_comida, hora_trabajo,
              nocturno, codigo, default_) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
              `
              , [DESCRIPCION, MINUTOS_ALIMENTACION, HORAS_TOTALES, HORARIO_NOCTURNO, true, CODIGO_HORARIO, TIPO_HORARIO]);

            const [correcto] = response.rows;

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'eh_cat_horarios',
              usuario: user_name,
              accion: 'I',
              datosOriginales: '',
              datosNuevos: JSON.stringify(correcto),
              ip: '',
              observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');

            if (correcto) {
              horariosCargados = true;
            }
            else {
              horariosCargados = false;
            }
            const idHorario = correcto.id;
            const codigoHorario = correcto.codigo;
            codigosHorariosCargados.push({ codigoHorario, idHorario });
          } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            horariosCargados = false;
          }
        }
      }

      // SI DETALLES NO ESTA VACIO CARGAR EN LA BASE DE DATOS
      if (detalles.length > 0) {
        // CARGAR DETALLES
        for (const detalle of detalles) {
          try {
            let { CODIGO_HORARIO, TIPO_ACCION, HORA, TOLERANCIA, ORDEN, SALIDA_SIGUIENTE_DIA, SALIDA_TERCER_DIA, MINUTOS_ANTES, MINUTOS_DESPUES } = detalle;

            CODIGO_HORARIO = CODIGO_HORARIO.toString();

            // CAMBIAR TIPO DE ACCION Entrada = E, Inicio alimentacion = I/A, Fin alimentacion = F/A, Salida = S
            switch (TIPO_ACCION) {
              case 'Entrada':
                TIPO_ACCION = 'E';
                break;
              case 'Inicio alimentación':
                TIPO_ACCION = 'I/A';
                break;
              case 'Fin alimentación':
                TIPO_ACCION = 'F/A';
                break;
              case 'Salida':
                TIPO_ACCION = 'S';
                break;
            }

            // CAMBIAR SALIDA_SIGUIENTE_DIA
            switch (SALIDA_SIGUIENTE_DIA) {
              case 'Si':
                SALIDA_SIGUIENTE_DIA = true;
                break;
              case 'No':
                SALIDA_SIGUIENTE_DIA = false;
                break;
              default:
                SALIDA_SIGUIENTE_DIA = false;
                break;
            }

            // CAMBIAR SALIDA_TERCER_DIA
            switch (SALIDA_TERCER_DIA) {
              case 'Si':
                SALIDA_TERCER_DIA = true;
                break;
              case 'No':
                SALIDA_TERCER_DIA = false;
                break;
              default:
                SALIDA_TERCER_DIA = false;
                break;
            }

            // CAMBIAR TOLERANCIA
            TOLERANCIA = TIPO_ACCION.toLowerCase() === 'e' ? TOLERANCIA : null;

            // CAMBIAR CODIGO_HORARIO POR EL ID DEL HORARIO CORRESPONDIENTE
            const ID_HORARIO: number = (codigosHorariosCargados.find((codigo: any) => codigo.codigoHorario === CODIGO_HORARIO))?.idHorario;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // INSERTAR EN LA BASE DE DATOS
            const response2: QueryResult = await pool.query(
              `
              INSERT INTO eh_detalle_horarios (orden, hora, tolerancia, id_horario, tipo_accion, segundo_dia, tercer_dia, 
                minutos_antes, minutos_despues) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
              `
              , [ORDEN, HORA, TOLERANCIA, ID_HORARIO, TIPO_ACCION, SALIDA_SIGUIENTE_DIA, SALIDA_TERCER_DIA, MINUTOS_ANTES, MINUTOS_DESPUES]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'eh_detalle_horarios',
              usuario: user_name,
              accion: 'I',
              datosOriginales: '',
              datosNuevos: JSON.stringify(response2.rows),
              ip: '',
              observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');

            if (response2.rowCount != 0) {
              detallesCargados = true;
            } else {
              detallesCargados = false;
            }
          } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            detallesCargados = false;
          }
        }
      }

      if (horariosCargados && detallesCargados) {
        return res.status(200).jsonp({ message: 'correcto' })
      } else {
        return res.status(500).jsonp({ message: 'error' })
      }
    } catch (error) {
      return res.status(500).jsonp({ message: error });
    }
  }

  // METODO PARA VERIFICAR LOS DATOS DE LA PLANTILLA DE HORARIOS Y DETALLES
  public async VerificarDatos(req: Request, res: Response) {
    const documento = req.file?.originalname;
    let separador = path.sep;
    let ruta = ObtenerRutaLeerPlantillas() + separador + documento;
    const workbook = excel.readFile(ruta);

    let verificador_horario: any = ObtenerIndicePlantilla(workbook, 'HORARIOS');
    let verificador_detalle: any = ObtenerIndicePlantilla(workbook, 'DETALLE_HORARIOS');

    if (verificador_horario === false) {
      const mensaje = 'no_existe_horario';
      res.json({ mensaje });
    }
    else if (verificador_detalle === false) {
      const mensaje = 'no_existe_detalle';
      res.json({ mensaje });
    }
    else if (verificador_horario != false && verificador_detalle != false) {
      const sheet_name_list = workbook.SheetNames;
      const plantillaHorarios: Horario[] = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[verificador_horario]]);
      let plantillaDetalles: DetalleHorario[] = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[verificador_detalle]]);

      let codigos: string[] = [];

      for (const [index, data] of plantillaHorarios.entries()) {
        let { DESCRIPCION, CODIGO_HORARIO, HORAS_TOTALES, MINUTOS_ALIMENTACION, TIPO_HORARIO, HORARIO_NOCTURNO } = data;
        if (MINUTOS_ALIMENTACION === undefined) {
          data.MINUTOS_ALIMENTACION = 0;
        }

        if (HORARIO_NOCTURNO === undefined) {
          data.HORARIO_NOCTURNO = 'No';
        }

        // VERIFICAR QUE LOS DATOS OBLIGATORIOS EXISTAN
        const requiredValues = ['DESCRIPCION', 'CODIGO_HORARIO', 'TIPO_HORARIO', 'HORAS_TOTALES', 'HORARIO_NOCTURNO'];

        let faltanDatos = false;
        let datosFaltantes = [];

        // MAPEO DE CLAVES A DESCRIPCIONES
        let descripciones: any = {
          DESCRIPCION: 'descripción',
          CODIGO_HORARIO: 'código',
          TIPO_HORARIO: 'tipo',
          HORAS_TOTALES: 'horas totales',
          HORARIO_NOTURNO: 'horario noturno'
        };

        for (const key of requiredValues) {
          if ((data as any)[key] === undefined) {
            (data as any)[key] = 'No registrado';
            datosFaltantes.push(descripciones[key]);
            faltanDatos = true;
          }
        }

        if (faltanDatos) {
          data.OBSERVACION = 'Datos no registrados: ' + datosFaltantes.join(', ');
          continue;
        }

        codigos.push(CODIGO_HORARIO.toString());

        if (VerificarDuplicado(codigos, CODIGO_HORARIO.toString())) {
          data.OBSERVACION = 'Registro duplicado dentro de la plantilla';
          continue;
        }

        const verificacion = VerificarFormatoDatos(data);
        if (verificacion[0]) {
          data.OBSERVACION = verificacion[1];
          continue;
        }

        if (await VerificarDuplicadoBase(CODIGO_HORARIO.toString())) {
          data.OBSERVACION = 'Ya existe en el sistema';
          continue;
        }

        data.OBSERVACION = 'Ok';

        if (data.OBSERVACION === 'Ok') {
          plantillaHorarios[index] = ValidarHorasTotales(data);
        }

      };

      for (const data of plantillaDetalles) {
        let { CODIGO_HORARIO, TIPO_ACCION, HORA, TOLERANCIA, SALIDA_SIGUIENTE_DIA, MINUTOS_ANTES, MINUTOS_DESPUES } = data;
        let orden = 0;
        // VERIFICAR QUE LOS DATOS OBLIGATORIOS EXISTAN
        // const requiredValues = [CODIGO_HORARIO, TIPO_ACCION, HORA];
        const requeridos = ['CODIGO_HORARIO', 'TIPO_ACCION', 'HORA'];

        let faltanDatosDetalles = false;
        let datosFaltantesDetalles = [];

        // MAPEO DE CLAVES A DESCRIPCIONES
        let descripciones: any = {
          CODIGO_HORARIO: 'código',
          TIPO_ACCION: 'tipo de acción',
          HORA: 'hora'
        };

        for (const key of requeridos) {
          if ((data as any)[key] === undefined) {
            (data as any)[key] = 'No registrado';
            datosFaltantesDetalles.push(descripciones[key]);
            faltanDatosDetalles = true;
          }
        }

        if (faltanDatosDetalles) {
          data.OBSERVACION = 'Datos no registrados: ' + datosFaltantesDetalles.join(', ');
          continue;
        }

        switch (TIPO_ACCION.toLowerCase()) {
          case 'entrada':
            orden = 1;
            break;
          case 'inicio alimentación':
          case 'inicio alimentacion':
            orden = 2;
            break;
          case 'fin alimentación':
          case 'fin alimentacion':
            orden = 3;
            break;
          case 'salida':
            orden = 4;
            break;
        }

        data.ORDEN = orden;

        data.MINUTOS_ANTES = MINUTOS_ANTES ?? 0;
        data.MINUTOS_DESPUES = MINUTOS_DESPUES ?? 0;
        data.SALIDA_SIGUIENTE_DIA = SALIDA_SIGUIENTE_DIA ?? 'No';
        data.TOLERANCIA = TIPO_ACCION.toLowerCase() === 'entrada' ? (TOLERANCIA ?? 0) : '';


        if (!VerificarCodigoHorarioDetalleHorario(CODIGO_HORARIO.toString(), plantillaHorarios)) {
          data.OBSERVACION = 'Requerido codigo de horario existente';
          continue;
        }

        const verificacion = VerificarFormatoDetalleHorario(data);
        if (verificacion[0]) {
          data.OBSERVACION = verificacion[1];
          continue;
        }

        data.OBSERVACION = 'Ok';
      };

      const detallesAgrupados = AgruparDetalles(plantillaDetalles);
      const detallesAgrupadosVerificados = VerificarDetallesAgrupados(detallesAgrupados, plantillaHorarios);

      // CAMBIAR OBSERVACIONES DE PLANTILLADETALLES SEGUN LOS CODIGOS QUE NO CUMPLAN CON LOS REQUISITOS
      for (const codigo of detallesAgrupadosVerificados) {
        const detalles = plantillaDetalles.filter((detalle: DetalleHorario) => detalle.CODIGO_HORARIO.toString() === codigo.codigo);
        for (const detalle of detalles) {
          if (detalle.OBSERVACION === 'Ok') {
            detalle.OBSERVACION = codigo.observacion;
          }
        }
      }

      // VERIFICAR EXISTENCIA DE DETALLES PARA CADA HORARIO
      plantillaHorarios.forEach((horario: any) => {
        if (horario.OBSERVACION === 'Ok') {
          const detallesCorrespondientes = plantillaDetalles.filter((detalle: any) => detalle.CODIGO_HORARIO === horario.CODIGO_HORARIO && detalle.OBSERVACION === 'Ok');
          horario.DETALLE = detallesCorrespondientes.length > 0;
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

      res.json({ plantillaHorarios, plantillaDetalles, mensaje });
    }
  }

}

// FUNCION PARA VERIFICAR SI EXISTEN DATOS DUPLICADOS EN LA PLANTILLA
function VerificarDuplicado(codigos: any, codigo: string): boolean {
  const valores = codigos.filter((valor: string) => valor.toLowerCase() === codigo.toLowerCase());
  const duplicado = valores.length > 1;
  return duplicado;
}

// FUNCION PARA VERIFICAR QUE LOS TIPOS DE DATOS EN LOS HORARIOS SEAN LOS CORRECTOS
function VerificarFormatoDatos(data: any): [boolean, string] {
  let observacion = '';
  let error = true
  const { HORAS_TOTALES, MINUTOS_ALIMENTACION, TIPO_HORARIO, HORARIO_NOCTURNO } = data;
  const horasTotalesFormatoCorrecto = /^(\d+)$|^(\d{1,2}:\d{2})$|^(\d{1,2}:\d{2}:\d{2})$/.test(HORAS_TOTALES);
  const minAlimentacionFormatoCorrecto = /^\d+$/.test(MINUTOS_ALIMENTACION);
  const tipoHorarioValido = ['Laborable', 'Libre', 'Feriado'].includes(TIPO_HORARIO);
  const tipoHorarioNocturnoValido = ['Si', 'No'].includes(HORARIO_NOCTURNO);
  horasTotalesFormatoCorrecto ? null : observacion = 'Formato de horas totales incorrecto (HH:mm)';
  minAlimentacionFormatoCorrecto ? null : observacion = 'Formato de minutos de alimentación incorrecto';
  tipoHorarioValido ? null : observacion = 'Tipo de horario incorrecto';
  tipoHorarioNocturnoValido ? null : observacion = 'Tipo de horario nocturno incorrecto';
  error = horasTotalesFormatoCorrecto && minAlimentacionFormatoCorrecto && tipoHorarioValido && tipoHorarioNocturnoValido ? false : true;
  return [error, observacion];
}

// FUNCION PARA VERIFICAR SI EXISTEN DATOS DUPLICADOS EN LA BASE DE DATOS
async function VerificarDuplicadoBase(codigo: string): Promise<boolean> {
  const result = await pool.query(
    `
    SELECT * FROM eh_cat_horarios WHERE LOWER(codigo) = $1
    `
    , [codigo.toLowerCase()]);
  return result.rowCount != 0;
}

// FUNCION PARA COMPROBAR QUE CODIGO_HORARIO EXISTA EN PLANTILLAHORARIOS
function VerificarCodigoHorarioDetalleHorario(codigo: string, plantillaHorarios: Horario[]): boolean {
  const result = plantillaHorarios.filter((valor: Horario) => valor.CODIGO_HORARIO == codigo && valor.OBSERVACION == 'Ok');
  return result.length > 0;
}

// FUNCION PARA COMPROBAR LOS FORMATOS DE LOS DATOS EN LA PLANTILLA DETALLE HORARIO
function VerificarFormatoDetalleHorario(data: any): [boolean, string] {
  let observacion = '';
  let error = true
  const { TIPO_ACCION, HORA, TOLERANCIA, MINUTOS_ANTES, MINUTOS_DESPUES } = data;
  const horaFormatoCorrecto = /^(\d{1,2}:\d{2})$|^(\d{1,2}:\d{2}:\d{2})$/.test(HORA);
  const minAntesFormatoCorrecto = /^\d+$/.test(MINUTOS_ANTES);
  const minDespuesFormatoCorrecto = /^\d+$/.test(MINUTOS_DESPUES);
  let toleranciaFormatoCorrecto = true;
  if (TIPO_ACCION.toLowerCase() === 'entrada') {
    toleranciaFormatoCorrecto = /^\d+$/.test(TOLERANCIA);
  }
  horaFormatoCorrecto ? null : observacion = observacion.concat('Formato de hora incorrecto (HH:mm)');
  toleranciaFormatoCorrecto ? null : observacion = observacion.concat('Formato de tolerancia incorrecto');
  minAntesFormatoCorrecto ? null : observacion = observacion.concat('Formato de minutos antes incorrecto');
  minDespuesFormatoCorrecto ? null : observacion = observacion.concat('Formato de minutos después incorrecto');
  error = horaFormatoCorrecto && minAntesFormatoCorrecto && minDespuesFormatoCorrecto && toleranciaFormatoCorrecto ? false : true;
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
  let codigosHorarios = horarios.map((horario: Horario) => horario.CODIGO_HORARIO.toString());
  let codigosDetalles = [];

  // FILTRAR DETALLES QUE TENGAN CODIGO_HORARIO EN HORARIOS
  for (const codigoHorario in detallesAgrupados) {
    if (!codigosHorarios.includes(codigoHorario)) {
      delete detallesAgrupados[codigoHorario];
    }
  }

  for (const codigoHorario in detallesAgrupados) {
    const detalles = detallesAgrupados[codigoHorario].filter((detalle: any) => detalle.OBSERVACION === 'Ok');
    const horario = horarios.find(h => h.CODIGO_HORARIO.toString() === codigoHorario);
    if (horario) {
      const tieneAlimentacion = horario.MINUTOS_ALIMENTACION > 0;
      const tiposAccionRequeridos = tieneAlimentacion ? ['Entrada', 'Inicio alimentación', 'Fin alimentación', 'Salida'] : ['Entrada', 'Salida'];
      const tiposAccionExistentes = detalles.map((detalle: any) => detalle.TIPO_ACCION);
      if (tiposAccionExistentes.length < tiposAccionRequeridos.length) {
        codigosDetalles.push({ codigo: codigoHorario, observacion: `Requerido ${tiposAccionRequeridos.length} detalles` });
      } else if (tiposAccionExistentes.length > tiposAccionRequeridos.length) {
        codigosDetalles.push({ codigo: codigoHorario, observacion: `Requerido solo ${tiposAccionRequeridos.length} detalles` });
      }


      //VERIFICAR QUE EN LOS TIPOSACCIONEXISTENTES ESTEN TODOS LOS TIPOSACCIONREQUERIDOS
      else if (tiposAccionRequeridos.some((tipo: string) => !tiposAccionExistentes.includes(tipo))) {
        codigosDetalles.push({ codigo: codigoHorario, observacion: `Requerido tipos de acción: ${tiposAccionRequeridos.join(', ')}` });
      }

      else {
        //VALIDAR QUE LA SUMA DE HORAS DE ENTRADA Y SALIDA SEA IGUAL A HORAS_TOTALES

        const getDetalle = (accion: string) => detalles.find((detalle: any) => detalle.TIPO_ACCION === accion);
        const getHora = (detalle: any) => moment(detalle.HORA, 'HH:mm');

        const entrada = getDetalle('Entrada');
        const salida = getDetalle('Salida');
        let horaEntrada = getHora(entrada);
        let horaSalida = getHora(salida);
        let minutosAlimentacion = 0;
        let diferenciaAlimentacion = 0;

        if (tieneAlimentacion) {
          const inicioAlimentacion = getDetalle('Inicio alimentación');
          const finAlimentacion = getDetalle('Fin alimentación');
          const horaInicioAlimentacion = getHora(inicioAlimentacion);
          const horaFinAlimentacion = getHora(finAlimentacion);

          diferenciaAlimentacion = horaFinAlimentacion.diff(horaInicioAlimentacion, 'minutes');
          minutosAlimentacion = Number(horario.MINUTOS_ALIMENTACION.toString());

          if (diferenciaAlimentacion < minutosAlimentacion) {
            codigosDetalles.push({ codigo: codigoHorario, observacion: 'Minutos de alimentación no corresponden a los asignados' });
            return codigosDetalles;
          }
        } else if (salida.SALIDA_SIGUIENTE_DIA.toLowerCase() == 'si') {
          horaSalida.add(1, 'days');
        }

        const diferencia = horaSalida.diff(horaEntrada, 'minutes');
        const direnciaTotal = tieneAlimentacion ? diferencia - minutosAlimentacion : diferencia;
        const horasTotalesEnMinutos = convertirHorasTotalesAMinutos(horario.HORAS_TOTALES.toString());

        if (direnciaTotal !== horasTotalesEnMinutos) {
          codigosDetalles.push({ codigo: codigoHorario, observacion: 'No cumple con las horas totales' });
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
function ValidarHorasTotales(horario: Horario): Horario {
  const hora = FormatearHoras(horario.HORAS_TOTALES.toString(), true);
  if ((hora >= '24:00' && hora < '72:00') ||
    (hora >= '24:00:00' && hora < '72:00:00') ||
    hora >= '72:00' ||
    hora >= '72:00:00') {
    horario.MINUTOS_ALIMENTACION = 0;
  }
  return horario;
}

interface Horario {
  DESCRIPCION: string | number,
  CODIGO_HORARIO: string | number,
  HORAS_TOTALES: string | number,
  MINUTOS_ALIMENTACION: number,
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
  TOLERANCIA: string | number,
  SALIDA_SIGUIENTE_DIA: string,
  SALIDA_TERCER_DIA: string,
  MINUTOS_ANTES: string | number,
  MINUTOS_DESPUES: string | number,
  OBSERVACION: string,
}

export const HORARIO_CONTROLADOR = new HorarioControlador();

export default HORARIO_CONTROLADOR;