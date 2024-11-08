import { Request, Response } from 'express';
import { ReporteHoraExtra } from '../../../class/HorasExtras';
import { QueryResult } from 'pg';
import { DateTime } from 'luxon';
import {
  enviarMail, email, nombre, cabecera_firma, pie_firma, servidor, puerto, fechaHora, Credenciales,
  FormatearFecha, FormatearHora, dia_completo
} from '../../../libs/settingsMail';
import {
  ObtenerRutaHorasExtraIdEmpleado, ObtenerRutaHorasExtraGeneral, ObtenerRutaHorasExtra,
  ObtenerRutaLogos
} from '../../../libs/accesoCarpetas';
import AUDITORIA_CONTROLADOR from '../../reportes/auditoriaControlador';
import pool from '../../../database';
import path from 'path';
import fs from 'fs';

class HorasExtrasPedidasControlador {

  // verificar uso de estado
  public async ListarHorasExtrasPedidas(req: Request, res: Response) {
    const HORAS_EXTRAS_PEDIDAS = await pool.query(
      `
      SELECT h.id, h.fecha_inicio, h.fecha_final, h.estado, h.fecha_solicita, h.descripcion, h.horas_solicitud, 
        h.tiempo_autorizado, e.id AS id_usua_solicita, h.id_empleado_cargo, e.nombre, e.apellido, 
        (e.nombre || \' \' || e.apellido) AS fullname, contrato.id AS id_contrato, da.id_departamento, e.codigo, 
        depa.nombre AS depa_nombre 
      FROM mhe_solicitud_hora_extra AS h, eu_empleados AS e, eu_empleado_contratos As contrato, eu_empleado_cargos AS cargo,
        contrato_cargo_vigente AS da, ed_departamentos AS depa 
      WHERE h.id_empleado_solicita = e.id AND 
        da.id_contrato = contrato.id AND depa.id = da.id_departamento AND (h.estado = 1 OR h.estado = 2) AND 
        contrato.id = cargo.id_contrato AND cargo.id = h.id_empleado_cargo AND h.observacion = false 
      ORDER BY id DESC
      `
    );
    if (HORAS_EXTRAS_PEDIDAS.rowCount != 0) {
      return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  // verificar si se requiere uso de estado
  public async ListarHorasExtrasPedidasObservacion(req: Request, res: Response) {
    const HORAS_EXTRAS_PEDIDAS = await pool.query(
      `
      SELECT h.id, h.fecha_inicio, h.fecha_final, h.estado, h.fecha_solicita, h.descripcion, h.horas_solicitud, 
        h.tiempo_autorizado, e.id AS id_usua_solicita, h.id_empleado_cargo, e.nombre, e.apellido,
        (e.nombre || \' \' || e.apellido) AS fullname, contrato.id AS id_contrato, da.id_departamento, e.codigo, 
        depa.nombre AS depa_nombre 
      FROM mhe_solicitud_hora_extra AS h, eu_empleados AS e, eu_empleado_contratos As contrato, eu_empleado_cargos AS cargo, 
        contrato_cargo_vigente AS da, ed_departamentos AS depa 
      WHERE h.id_empleado_solicita = e.id AND (h.estado = 1 OR h.estado = 2) AND contrato.id = cargo.id_contrato 
        AND cargo.id = h.id_empleado_cargo AND h.observacion = true AND da.id_contrato = e.id AND depa.id = da.id_departamento
      ORDER BY id DESC
      `
    );
    if (HORAS_EXTRAS_PEDIDAS.rowCount != 0) {
      return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  // verificar si se requiere estado
  public async ListarHorasExtrasPedidasAutorizadas(req: Request, res: Response) {
    const HORAS_EXTRAS_PEDIDAS = await pool.query(
      `
      SELECT h.id, h.fecha_inicio, h.fecha_final, h.estado, h.fecha_solicita, h.descripcion, h.horas_solicitud, 
        h.tiempo_autorizado, e.id AS id_usua_solicita, h.id_empleado_cargo, e.nombre, e.apellido, 
        (e.nombre || \' \' || e.apellido) AS fullname, contrato.id AS id_contrato, e.codigo, depa.nombre AS depa_nombre 
      FROM mhe_solicitud_hora_extra AS h, eu_empleados AS e, eu_empleado_contratos As contrato, eu_empleado_cargos AS cargo, 
        contrato_cargo_vigente AS da, ed_departamentos AS depa 
      WHERE h.id_empleado_solicita = e.id AND (h.estado = 3 OR h.estado = 4) AND contrato.id = cargo.id_contrato 
        AND cargo.id = h.id_empleado_cargo AND da.id_contrato = e.id AND depa.id = da.id_departamento 
      ORDER BY id DESC
      `
    );
    if (HORAS_EXTRAS_PEDIDAS.rowCount != 0) {
      return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  public async ObtenerSolicitudHoraExtra(req: Request, res: Response) {
    const id = req.params.id_emple_hora;
    const SOLICITUD = await pool.query(
      `
      SELECT * FROM VistaSolicitudHoraExtra WHERE id_emple_hora = $1
      `
      , [id]);
    if (SOLICITUD.rowCount != 0) {
      return res.json(SOLICITUD.rows)
    }
    else {
      return res.status(404).json({ text: 'No se encuentran registros.' });
    }
  }

  public async ObtenerAutorizacionHoraExtra(req: Request, res: Response) {
    const id = req.params.id_hora;
    const SOLICITUD = await pool.query(
      `
      SELECT a.id AS id_autorizacion, a.id_autoriza_estado AS empleado_estado, hp.id AS hora_extra 
      FROM ecm_autorizaciones AS a, mhe_solicitud_hora_extra AS hp 
      WHERE hp.id = a.id_hora_extra AND hp.id = $1
      `
      , [id]);
    if (SOLICITUD.rowCount != 0) {
      return res.json(SOLICITUD.rows)
    }
    else {
      return res.status(404).json({ text: 'No se encuentran registros.' });
    }
  }

  public async ListarPedidosHE(req: Request, res: Response) {
    const HORAS_EXTRAS_PEDIDAS = await pool.query(
      `
      SELECT e.id AS id_empleado, e.nombre, e.apellido, e.codigo, ph.id AS id_solicitud, ph.fecha_inicio::date AS fec_inicio, 
        ph.fecha_final::date AS fec_final, ph.descripcion, ph.horas_solicitud, ph.fecha_inicio::time AS hora_inicio, 
        ph.fecha_final::time AS hora_final
      FROM mhe_solicitud_hora_extra AS ph, eu_empleados AS e 
      WHERE e.id = ph.id_empleado_solicita 
      ORDER BY e.nombre ASC, ph.fecha_inicio ASC
      `
    );
    if (HORAS_EXTRAS_PEDIDAS.rowCount != 0) {
      return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  public async ListarPedidosHEAutorizadas(req: Request, res: Response) {
    const HORAS_EXTRAS_PEDIDAS = await pool.query(
      `
      SELECT e.id AS id_empleado, e.nombre, e.apellido, e.codigo, ph.id AS id_solicitud, ph.fecha_inicio::date AS fec_inicio, 
        ph.fecha_final::date AS fec_final, ph.descripcion, ph.tiempo_autorizado, ph.fecha_inicio::time AS hora_inicio, 
        ph.fecha_final::time AS hora_final, a.estado, a.id_autoriza_estado 
      FROM mhe_solicitud_hora_extra AS ph, eu_empleados AS e, ecm_autorizaciones AS a 
      WHERE e.id = ph.id_empleado_solicita AND a.id_hora_extra = ph.id AND a.estado = 3 
      ORDER BY e.nombre ASC, ph.fecha_inicio ASC
      `
    );
    if (HORAS_EXTRAS_PEDIDAS.rowCount != 0) {
      return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  public async ListarPedidosHE_Empleado(req: Request, res: Response) {
    const { id_empleado } = req.params;
    const HORAS_EXTRAS_PEDIDAS = await pool.query(
      `
      SELECT e.id AS id_empleado, e.nombre, e.apellido, e.codigo, ph.id AS id_solicitud, ph.fecha_inicio::date AS fec_inicio,
        ph.fecha_final::date AS fec_final, ph.descripcion, ph.horas_solicitud, ph.fecha_inicio::time AS hora_inicio, 
        ph.fecha_final::time AS hora_fin 
      FROM mhe_solicitud_hora_extra AS ph, eu_empleados AS e 
      WHERE e.id = ph.id_empleado_solicita AND e.id = $1 
      ORDER BY e.nombre ASC, ph.fecha_inicio ASC
      `
      , [id_empleado]);
    if (HORAS_EXTRAS_PEDIDAS.rowCount != 0) {
      return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  public async ListarPedidosHEAutorizadas_Empleado(req: Request, res: Response) {
    const { id_empleado } = req.params;
    const HORAS_EXTRAS_PEDIDAS = await pool.query(
      `
      SELECT e.id AS id_empleado, e.nombre, e.apellido, e.codigo, ph.id AS id_solicitud, ph.fecha_inicio::date fec_inicio,
        ph.fecha_final::date fec_final, ph.descripcion, ph.tiempo_autorizado, ph.fecha_inicio::time hora_inicio, 
        ph.fecha_final::time hora_final, a.estado, a.id_autoriza_estado 
      FROM mhe_solicitud_hora_extra AS ph, eu_empleados AS e, ecm_autorizaciones AS a 
      WHERE e.id = ph.id_empleado_solicita AND a.id_hora_extra = ph.id AND a.estado = 3 AND e.id = $1
      ORDER BY e.nombre ASC, ph.fecha_inicio ASC
      `
      , [id_empleado]);
    if (HORAS_EXTRAS_PEDIDAS.rowCount != 0) {
      HORAS_EXTRAS_PEDIDAS.rows.map((obj: any) => {
        if (obj.id_autoriza_estado != null && obj.id_autoriza_estado != '' && obj.estado != 1) {
          var autorizaciones = obj.id_autoriza_estado.split(',');
          let empleado_id = autorizaciones[autorizaciones.length - 2].split('_')[0];
          obj.autoriza = parseInt(empleado_id);
        }
      });
      return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }


  /** ******************************************************************************* *
   **       REPORTE PARA VER INFORMACIÓN DE PLANIFICACIÓN DE HORAS EXTRAS             *
   ** ******************************************************************************* */
  public async ReporteVacacionesMultiple(req: Request, res: Response) {
    console.log('datos recibidos', req.body)
    let datos: any[] = req.body;
    let { desde, hasta } = req.params;
    let n: Array<any> = await Promise.all(datos.map(async (obj: ReporteHoraExtra) => {
      obj.departamentos = await Promise.all(obj.departamentos.map(async (ele) => {
        ele.empleado = await Promise.all(ele.empleado.map(async (o) => {
          o.horaE = await BuscarHorasExtras(o.id, desde, hasta);
          console.log('Vacaciones: ', o);
          return o
        })
        )
        return ele
      })
      )
      return obj
    })
    )


    let nuevo = n.map((obj: ReporteHoraExtra) => {

      obj.departamentos = obj.departamentos.map((e) => {

        e.empleado = e.empleado.filter((v: any) => { return v.vacaciones.length > 0 })
        return e

      }).filter((e: any) => { return e.empleado.length > 0 })
      return obj

    }).filter(obj => { return obj.departamentos.length > 0 })

    if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registro de planificaciones.' })

    return res.status(200).jsonp(nuevo)
  }


  /** ************************************************************************************************* **
   ** **                       METODO PARA MANEJO DE HORAS EXTRAS                                    ** ** 
   ** ************************************************************************************************* **/

  // CREACIÓN DE HORAS EXTRAS
  public async CrearHoraExtraPedida(req: Request, res: Response): Promise<Response> {
    try {
      console.log("ver el cuerpo", req.body)


      const nombreArchivo = req.file?.originalname;

      var { id_empl_cargo, id_usua_solicita, fec_inicio, fec_final, fec_solicita, num_hora,
        descripcion, estado, observacion, tipo_funcion, depa_user_loggin, user_name, ip, subir_documento, codigo, documento } = req.body;
      console.log

      let codigoEmpleado = codigo || '';


      if (subir_documento) {
        try {
          const { carpetaHorasExtra, codigo } = await ObtenerRutaHorasExtraIdEmpleado(id_usua_solicita);
          codigoEmpleado = codigo;
          fs.access(carpetaHorasExtra, fs.constants.F_OK, (err) => {
            if (err) {
              // METODO MKDIR PARA CREAR LA CARPETA
              fs.mkdir(carpetaHorasExtra, { recursive: true }, (err2: any) => {
                if (err2) {
                  console.log('Error al intentar crear carpeta de permisos.', err2);
                  throw new Error('Error al intentar crear carpeta de permisos.');
                }
              });
            }
          });
        } catch (error) {
          throw new Error('Error al intentar acceder a la carpeta de permisos.');
        }
      }

      const carpetaHorasExtra = await ObtenerRutaHorasExtraGeneral();
      const separador = path.sep;
      const fecha = DateTime.now();
      const anio = fecha.toFormat('yyyy');
      const mes = fecha.toFormat('MM');
      const dia = fecha.toFormat('dd');

      const documentoTemporal = `${carpetaHorasExtra}${separador}${anio}_${mes}_${dia}_${nombreArchivo}`;

      if (nombreArchivo) {
        try {
          console.log("entrando a subir documento")
          const carpetaEmpleado = await ObtenerRutaHorasExtra(codigo);

          const documento = `${carpetaEmpleado}${separador}${codigo}_${anio}_${mes}_${dia}_${nombreArchivo}`;
          fs.copyFileSync(documentoTemporal, documento);

        }
        catch (error) {
          console.error('Error al copiar el archivo:', error);
          // errorPermisos = true;
        }
        const documento1 = `${codigo}_${anio}_${mes}_${dia}_${nombreArchivo}`;
        documento = documento1;
      }

      try {
        if (fs.existsSync(documentoTemporal)) {
          fs.unlinkSync(documentoTemporal);
        }
      } catch (error) {
        console.error('Error al eliminar el archivo temporal:', error);
      }
      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      const response: QueryResult = await pool.query(
        `
        INSERT INTO mhe_solicitud_hora_extra (id_empleado_cargo, id_empleado_solicita, fecha_inicio, fecha_final, 
          fecha_solicita, horas_solicitud, descripcion, estado, observacion, tipo_funcion, documento) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *
        `,
        [id_empl_cargo, id_usua_solicita, fec_inicio, fec_final, fec_solicita, num_hora, descripcion,
          estado, observacion, tipo_funcion, documento])
      const [objetoHoraExtra] = response.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'mhe_solicitud_hora_extra',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: JSON.stringify(objetoHoraExtra),
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');

      if (!objetoHoraExtra) return res.status(404).jsonp({ message: 'Solicitud no registrada.' });

      const hora_extra = objetoHoraExtra;

      return res.status(200).jsonp(hora_extra);

    } catch (error) {
      // REVERTIR TRNASACCION
      console.log("Ver error", error)

      await pool.query('ROLLBACK');
      return res.status(500)
        .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
  }

  // METODO PARA EDITAR HORA EXTRA
  public async EditarHoraExtra(req: Request, res: Response): Promise<Response> {

    try {
      const id = req.params.id

      const { fec_inicio, fec_final, num_hora, descripcion, estado, tipo_funcion, depa_user_loggin, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const datosOriginales = await pool.query(`SELECT * FROM mhe_solicitud_hora_extra WHERE id = $1`, [id]);
      const [objetoHoraExtraOriginal] = datosOriginales.rows;

      if (!objetoHoraExtraOriginal) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'mhe_solicitud_hora_extra',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al actualizar hora extra con id ${id}`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'error' });
      }

      const response: QueryResult = await pool.query(
        `
          UPDATE mhe_solicitud_hora_extra SET fecha_inicio = $1, fecha_final = $2, horas_solicitud = $3, descripcion = $4, 
            estado = $5, tipo_funcion = $6 
          WHERE id = $7 RETURNING *
        `
        , [fec_inicio, fec_final, num_hora, descripcion, estado, tipo_funcion, id]);

      const [objetoHoraExtra] = response.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'mhe_solicitud_hora_extra',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(objetoHoraExtraOriginal),
        datosNuevos: JSON.stringify(objetoHoraExtra),
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.status(200).jsonp(objetoHoraExtra);
    } catch (error) {
      // REVERTIR TRNASACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' });
    }
  }

  // ELIMINAR REGISTRO DE HORAS EXTRAS
  public async EliminarHoraExtra(req: Request, res: Response): Promise<Response> {
    try {
      const { id_hora_extra, documento } = req.params;
      const { user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES REALTIME_NOTI
      const datosOriginalesRealTime = await pool.query('SELECT * FROM ecm_realtime_notificacion WHERE id_hora_extra = $1', [id_hora_extra]);
      const [objetoRealTime] = datosOriginalesRealTime.rows;

      if (!objetoRealTime) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'ecm_realtime_notificacion',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al eliminar registro de ecm_realtime_notificacion con id_hora_extra ${id_hora_extra}`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'error' });
      }

      await pool.query(
        `
        DELETE FROM ecm_realtime_notificacion WHERE id_hora_extra = $1
        `
        , [id_hora_extra]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'ecm_realtime_notificacion',
        usuario: user_name,
        accion: 'D',
        datosOriginales: JSON.stringify(objetoRealTime),
        datosNuevos: '',
        ip,
        observacion: null
      });

      // CONSULTAR DATOSORIGINALES AUTORIZACIONES
      const datosOriginalesAutorizaciones = await pool.query('SELECT * FROM ecm_autorizaciones WHERE id_hora_extra = $1', [id_hora_extra]);
      const [objetoAutorizaciones] = datosOriginalesAutorizaciones.rows;

      if (!objetoAutorizaciones) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'ecm_autorizaciones',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al eliminar registro de ecm_autorizaciones con id_hora_extra ${id_hora_extra}`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'error' });
      }

      await pool.query(
        `
        DELETE FROM ecm_autorizaciones WHERE id_hora_extra = $1
        `
        , [id_hora_extra]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'ecm_autorizaciones',
        usuario: user_name,
        accion: 'D',
        datosOriginales: JSON.stringify(objetoAutorizaciones),
        datosNuevos: '',
        ip,
        observacion: null
      });

      // CONSULTAR DATOS ORIGINALES SOLICITUD DE HORA EXTRA
      const datosOriginalesHoraExtra = await pool.query(`SELECT * FROM mhe_solicitud_hora_extra WHERE id = $1`, [id_hora_extra]);
      const [objetoHoraExtraOriginal] = datosOriginalesHoraExtra.rows;

      if (!objetoHoraExtraOriginal) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'mhe_solicitud_hora_extra',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al eliminar registro de mhe_solicitud_hora_extra con id ${id_hora_extra}`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'error' });
      }

      const response: QueryResult = await pool.query(
        `
        DELETE FROM mhe_solicitud_hora_extra WHERE id = $1 RETURNING *
        `
        , [id_hora_extra]);

      const [objetoHoraExtra] = response.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'mhe_solicitud_hora_extra',
        usuario: user_name,
        accion: 'D',
        datosOriginales: JSON.stringify(objetoHoraExtraOriginal),
        datosNuevos: '',
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');

      if (documento != 'null' && documento != '' && documento != null) {
        let filePath = `servidor\\horasExtras\\${documento}`
        let direccionCompleta = __dirname.split("servidor")[0] + filePath;
        // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
        fs.access(direccionCompleta, fs.constants.F_OK, (err) => {
          if (err) {
          } else {
            // ELIMINAR DEL SERVIDOR
            fs.unlinkSync(direccionCompleta);
          }
        });
      }

      if (objetoHoraExtra) {
        return res.status(200).jsonp(objetoHoraExtra)
      }
      else {
        return res.status(404).jsonp({ message: 'Solicitud no eliminada.' })
      }
    } catch (error) {
      // REVERTIR TRNASACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' });
    }
  }

  // BUSCAR REGISTROS DE HORAS EXTRAS DE UN USUARIO   **USADO
  public async ObtenerListaHora(req: Request, res: Response): Promise<any> {
    const { id_user } = req.params;
    const HORAS_EXTRAS_PEDIDAS = await pool.query(
      `
      SELECT * FROM mhe_solicitud_hora_extra WHERE id_empleado_solicita = $1 ORDER BY id DESC
      `
      , [id_user]);
    if (HORAS_EXTRAS_PEDIDAS.rowCount != 0) {
      return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se han encontrado registros.' });
    }
  }

  // EDITAR TIEMPO DE AUTORIZACION
  public async TiempoAutorizado(req: Request, res: Response): Promise<Response> {
    try {
      const id_hora = parseInt(req.params.id_hora);
      const { hora, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const datosOriginales = await pool.query(`SELECT * FROM mhe_solicitud_hora_extra WHERE id = $1`, [id_hora]);
      const [objetoHoraExtraOriginal] = datosOriginales.rows;

      if (!objetoHoraExtraOriginal) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'mhe_solicitud_hora_extra',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al actualizar hora extra con id ${id_hora}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'error' });
      }

      const response: QueryResult = await pool.query(
        `
        UPDATE mhe_solicitud_hora_extra SET tiempo_autorizado = $2 WHERE id = $1 RETURNING *
        `
        , [id_hora, hora])

      const [horaExtra] = response.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'mhe_solicitud_hora_extra',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(objetoHoraExtraOriginal),
        datosNuevos: `{ tiempo_autorizado: ${hora} }`,
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');

      if (!horaExtra) {
        return res.status(400)
          .jsonp({ message: 'Upps!!! algo salio mal. Solicitud de hora extra no ingresada.' })
      }
      else {
        return res.status(200).jsonp(horaExtra);
      }

    } catch (error) {
      // REVERTIR TRNASACCION
      await pool.query('ROLLBACK');
      return res.status(500)
        .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }

  }

  // EDITAR ESTADO DE LA SOLICITUD DE HORA EXTRA
  public async ActualizarEstado(req: Request, res: Response): Promise<Response> {

    try {
      const id = req.params.id;
      const { estado, usser_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const datosOriginales = await pool.query(`SELECT * FROM mhe_solicitud_hora_extra WHERE id = $1`, [id]);
      const [objetoHoraExtraOriginal] = datosOriginales.rows;

      if (!objetoHoraExtraOriginal) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'mhe_solicitud_hora_extra',
          usuario: usser_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al actualizar hora extra con id ${id}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'error' });
      }

      const response: QueryResult = await pool.query(
        `
          UPDATE mhe_solicitud_hora_extra SET estado = $1 WHERE id = $2 RETURNING *
        `
        , [estado, id]);

      const [horaExtra] = response.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'mhe_solicitud_hora_extra',
        usuario: usser_name,
        accion: 'U',
        datosOriginales: JSON.stringify(objetoHoraExtraOriginal),
        datosNuevos: `{ estado: ${estado} }`,
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');

      if (!horaExtra) {
        return res.status(400)
          .jsonp({ message: 'Upps!!! algo salio mal. Solicitud de hora extra no ingresada.' })
      }
      else {
        return res.status(200).jsonp(horaExtra);
      }

    } catch (error) {
      // REVERTIR TRNASACCION
      await pool.query('ROLLBACK');
      return res.status(500)
        .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
  }

  // EDITAR ESTADO DE OBSERVACION DE SOLICITUD DE HORA EXTRA
  public async ActualizarObservacion(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const { observacion, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const datosOriginales = await pool.query(`SELECT * FROM mhe_solicitud_hora_extra WHERE id = $1`, [id]);
      const [objetoHoraExtraOriginal] = datosOriginales.rows;

      if (!objetoHoraExtraOriginal) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'mhe_solicitud_hora_extra',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al actualizar hora extra con id ${id}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'error' });
      }

      const response: QueryResult = await pool.query(
        `
      UPDATE mhe_solicitud_hora_extra SET observacion = $1 WHERE id = $2 RETURNING *
      `
        , [observacion, id]);

      const [horaExtra] = response.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'mhe_solicitud_hora_extra',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(objetoHoraExtraOriginal),
        datosNuevos: `{ observacion: ${observacion} }`,
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');

      if (!horaExtra) {
        return res.status(400)
          .jsonp({ message: 'Upps!!! algo salio mal. Solicitud de hora extra no ingresada.' })
      }
      else {
        return res.status(200).jsonp(horaExtra);
      }
    } catch (error) {
      // REVERTIR TRNASACCION
      await pool.query('ROLLBACK');
      return res.status(500)
        .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
  }


  // BUSCAR DATOS DE UNA SOLICITUD DE HORA EXTRA POR SU ID
  public async ObtenerUnaSolicitudHE(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const HORAS_EXTRAS_PEDIDAS = await pool.query(
      `
      SELECT h.id_empleado_cargo, h.id_empleado_solicita, h.fecha_inicio, h.fecha_final, h.fecha_solicita, 
        h.descripcion, h.estado, h.tipo_funcion, h.horas_solicitud, h.id, h.tiempo_autorizado,
        (e.nombre || ' ' || e.apellido) AS fullname, e.cedula     
      FROM mhe_solicitud_hora_extra AS h, eu_empleados AS e 
      WHERE h.id = $1 AND e.id = h.id_empleado_solicita
      `
      , [id]);
    if (HORAS_EXTRAS_PEDIDAS.rowCount != 0) {
      return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  // REGISTRAR DOCUMENTO DE RESPALDO DE HORAS EXTRAS 
  public async GuardarDocumentoHoras(req: Request, res: Response): Promise<Response> {
    try {
      let list: any = req.files;
      let doc = list.uploads[0].path.split("\\")[1];
      let { nombre } = req.params;
      let id = req.params.id;

      const { user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const datosOriginales = await pool.query(`SELECT * FROM mhe_solicitud_hora_extra WHERE id = $1`, [id]);
      const [objetoHoraExtraOriginal] = datosOriginales.rows;

      if (!objetoHoraExtraOriginal) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'mhe_solicitud_hora_extra',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al actualizar hora extra con id ${id}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'error' });
      }

      await pool.query(
        `
        UPDATE mhe_solicitud_hora_extra SET documento = $2, docu_nombre = $3 WHERE id = $1
        `
        , [id, doc, nombre]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'mhe_solicitud_hora_extra',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(objetoHoraExtraOriginal),
        datosNuevos: `{ documento: ${doc}, docu_nombre: ${nombre} }`,
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Documento Actualizado' });
    } catch (error) {
      // REVERTIR TRNASACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' });
    }
  }

  // ELIMINAR DOCUMENTO DE RESPALDO DE HORAS EXTRAS 
  public async EliminarDocumentoHoras(req: Request, res: Response): Promise<Response> {
    try {
      let { documento, id, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const datosOriginales = await pool.query(`SELECT * FROM mhe_solicitud_hora_extra WHERE id = $1`, [id]);
      const [objetoHoraExtraOriginal] = datosOriginales.rows;

      if (!objetoHoraExtraOriginal) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'mhe_solicitud_hora_extra',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al actualizar hora extra con id ${id}`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'error' });
      }

      await pool.query(
        `
        UPDATE mhe_solicitud_hora_extra SET documento = null, docu_nombre = null WHERE id = $1
        `
        , [id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'mhe_solicitud_hora_extra',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(objetoHoraExtraOriginal),
        datosNuevos: `{ documento: null, docu_nombre: null }`,
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');

      if (documento != 'null' && documento != '' && documento != null) {
        let filePath = `servidor\\horasExtras\\${documento}`
        let direccionCompleta = __dirname.split("servidor")[0] + filePath;
        // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
        fs.access(direccionCompleta, fs.constants.F_OK, (err) => {
          if (err) {
          } else {
            // ELIMINAR DEL SERVIDOR
            fs.unlinkSync(direccionCompleta);
          }
        });
      }

      return res.jsonp({ message: 'Documento Actualizado' });
    } catch (error) {
      // REVERTIR TRNASACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' });
    }
  }

  // ELIMINAR DOCUMENTO DE PERMISO DESDE APLICACION MOVIL
  public async EliminarArchivoMovil(req: Request, res: Response) {
    let { documento } = req.params;
    if (documento != 'null' && documento != '' && documento != null) {
      let filePath = `servidor\\horasExtras\\${documento}`
      let direccionCompleta = __dirname.split("servidor")[0] + filePath;
      // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
      fs.access(direccionCompleta, fs.constants.F_OK, (err) => {
        if (err) {
        } else {
          // ELIMINAR DEL SERVIDOR
          fs.unlinkSync(direccionCompleta);
        }
      });
    }
    res.jsonp({ message: 'ok' });
  }

  // BUSQUEDA DE DOCUMENTO HORAS EXTRAS
  public async ObtenerDocumento(req: Request, res: Response): Promise<any> {
    const docs = req.params.docs;
    let filePath = `servidor\\horasExtras\\${docs}`
    res.sendFile(__dirname.split("servidor")[0] + filePath);
  }


  /** ************************************************************************************************* **
   ** **          METODO PARA ENVÍO DE CORREO ELECTRÓNICO DE SOLICITUDES DE HORAS EXTRAS                **      
   ** ************************************************************************************************* **/

  // METODO PARA ENVIAR CORREOS DESDE APLICACIÓN WEB
  public async SendMailNotifiHoraExtra(req: Request, res: Response): Promise<void> {

    var tiempo = fechaHora();
    var fecha = await FormatearFecha(tiempo.fecha_formato, dia_completo);
    var hora = await FormatearHora(tiempo.hora);
    // OBTENER RUTA DE LOGOS
    let separador = path.sep;
    const path_folder = ObtenerRutaLogos();

    var datos = await Credenciales(req.id_empresa);

    if (datos === 'ok') {

      const { id_empl_contrato, solicitud, desde, hasta, num_horas, observacion, estado_h, correo,
        solicitado_por, h_inicio, h_final, id, asunto, proceso, tipo_solicitud } = req.body;

      const correoInfoPideHoraExtra = await pool.query(
        `
        SELECT e.correo, e.nombre, e.apellido, e.cedula, 
          ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo, tc.cargo AS tipo_cargo, 
          d.nombre AS departamento 
        FROM eu_empleado_contratos AS ecn, eu_empleados AS e, eu_empleado_cargos AS ecr, e_cat_tipo_cargo AS tc, 
          ed_departamentos AS d 
        WHERE ecn.id = $1 AND ecn.id_empleado = e.id AND 
          (SELECT id_cargo FROM contrato_cargo_vigente WHERE id_empleado = e.id) = ecr.id 
          AND tc.id = ecr.id_tipo_cargo AND d.id = ecr.id_departamento 
        ORDER BY cargo DESC
        `
        , [id_empl_contrato]);

      console.log(correoInfoPideHoraExtra.rows);

      var url = `${process.env.URL_DOMAIN}/ver-hora-extra`;

      let data = {
        to: correo,
        from: email,
        subject: asunto,
        html:
          `
          <body>
            <div style="text-align: center;">
              <img width="100%" height="100%" src="cid:cabeceraf"/>
            </div>
            <br>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                El presente correo es para informar que se ha ${proceso} la siguiente solicitud de realización de horas extras: <br>  
            </p>
            <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Empresa:</b> ${nombre} <br>   
              <b>Asunto:</b> ${asunto} <br> 
              <b>Colaborador que envía:</b> ${correoInfoPideHoraExtra.rows[0].nombre} ${correoInfoPideHoraExtra.rows[0].apellido} <br>
              <b>Número de Cédula:</b> ${correoInfoPideHoraExtra.rows[0].cedula} <br>
              <b>Cargo:</b> ${correoInfoPideHoraExtra.rows[0].tipo_cargo} <br>
              <b>Departamento:</b> ${correoInfoPideHoraExtra.rows[0].departamento} <br>
              <b>Generado mediante:</b> Aplicación Web <br>
              <b>Fecha de envío:</b> ${fecha} <br> 
              <b>Hora de envío:</b> ${hora} <br><br> 
            </p>
            <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Motivo:</b> Solicitud de Horas Extras <br>   
              <b>Fecha de Solicitud:</b> ${solicitud} <br> 
              <b>Desde:</b> ${desde} <br>
              <b>Hasta:</b> ${hasta} <br>
              <b>Horario:</b> ${h_inicio} a ${h_final} <br>
              <b>Observación:</b> ${observacion} <br>
              <b>Num. horas solicitadas:</b> ${num_horas} <br>
              <b>Estado:</b> ${estado_h} <br><br>
              <b>${tipo_solicitud}:</b> ${solicitado_por} <br><br>
              <a href="${url}/${id}">Dar clic en el siguiente enlace para revisar solicitud de realización de hora extra.</a> <br><br>                         
            </p>
            <p style="font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Gracias por la atención</b><br>
              <b>Saludos cordiales,</b> <br><br>
            </p>
            <img src="cid:pief" width="100%" height="100%"/>
          </body>
          `
        ,
        attachments: [
          {
            filename: 'cabecera_firma.jpg',
            path: `${path_folder}${separador}${cabecera_firma}`,
            cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
          },
          {
            filename: 'pie_firma.jpg',
            path: `${path_folder}${separador}${pie_firma}`,
            cid: 'pief' //COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
          }]
      };

      var corr = enviarMail(servidor, parseInt(puerto));
      corr.sendMail(data, function (error: any, info: any) {
        if (error) {
          corr.close();
          console.log('Email error: ' + error);
          return res.jsonp({ message: 'error' });
        } else {
          corr.close();
          console.log('Email sent: ' + info.response);
          return res.jsonp({ message: 'ok' });
        }
      });
    }
    else {
      res.jsonp({ message: 'Ups!!! algo salio mal. No fue posible enviar correo electrónico.' });
    }

  }

  // METODO DE ENVÍO DE CORREO ELECTRÓNICO MEDIANTE APLICACIÓN MÓVIL
  public async EnviarCorreoHoraExtraMovil(req: Request, res: Response): Promise<void> {

    var tiempo = fechaHora();
    var fecha = await FormatearFecha(tiempo.fecha_formato, dia_completo);
    var hora = await FormatearHora(tiempo.hora);

    // OBTENER RUTA DE LOGOS
    let separador = path.sep;
    const path_folder = ObtenerRutaLogos();

    var datos = await Credenciales(parseInt(req.params.id_empresa));

    if (datos === 'ok') {

      const { id_empl_contrato, solicitud, desde, hasta, num_horas, observacion, estado_h, correo,
        solicitado_por, h_inicio, h_final, asunto, proceso, tipo_solicitud } = req.body;

      const correoInfoPideHoraExtra = await pool.query(
        `
        SELECT e.correo, e.nombre, e.apellido, e.cedula, 
          ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo, tc.cargo AS tipo_cargo, 
          d.nombre AS departamento 
        FROM eu_empleado_contratos AS ecn, eu_empleados AS e, eu_empleado_cargos AS ecr, e_cat_tipo_cargo AS tc, 
          ed_departamentos AS d 
        WHERE ecn.id = $1 AND ecn.id_empleado = e.id AND 
          (SELECT id_cargo FROM contrato_cargo_vigente WHERE id_empleado = e.id) = ecr.id 
          AND tc.id = ecr.id_tipo_cargo AND d.id = ecr.id_departamento 
        ORDER BY cargo DESC
        `
        , [id_empl_contrato]);

      console.log(correoInfoPideHoraExtra.rows);

      let data = {
        to: correo,
        from: email,
        subject: asunto,
        html:
          `
          <body>
            <div style="text-align: center;">
              <img width="100%" height="100%" src="cid:cabeceraf"/>
            </div>
            <br>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              El presente correo es para informar que se ha ${proceso} la siguiente solicitud de realización de horas extras: <br>  
            </p>
            <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Empresa:</b> ${nombre} <br>   
              <b>Asunto:</b> ${asunto} <br> 
              <b>Colaborador que envía:</b> ${correoInfoPideHoraExtra.rows[0].nombre} ${correoInfoPideHoraExtra.rows[0].apellido} <br>
              <b>Número de Cédula:</b> ${correoInfoPideHoraExtra.rows[0].cedula} <br>
              <b>Cargo:</b> ${correoInfoPideHoraExtra.rows[0].tipo_cargo} <br>
              <b>Departamento:</b> ${correoInfoPideHoraExtra.rows[0].departamento} <br>
              <b>Generado mediante:</b> Aplicación Móvil <br>
              <b>Fecha de envío:</b> ${fecha} <br> 
              <b>Hora de envío:</b> ${hora} <br><br> 
            </p>
            <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Motivo:</b> ${observacion} <br>   
              <b>Fecha de Solicitud:</b> ${solicitud} <br> 
              <b>Desde:</b> ${desde} <br>
              <b>Hasta:</b> ${hasta} <br>
              <b>Horario:</b> ${h_inicio} a ${h_final} <br>
              <b>Num. horas solicitadas:</b> ${num_horas} <br>
              <b>Estado:</b> ${estado_h} <br><br>
              <b>${tipo_solicitud}:</b> ${solicitado_por} <br><br>
            </p>
            <p style="font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Gracias por la atención</b><br>
              <b>Saludos cordiales,</b> <br><br>
            </p>
            <img src="cid:pief" width="100%" height="100%"/>
          </body>
          `
        ,
        attachments: [
          {
            filename: 'cabecera_firma.jpg',
            path: `${path_folder}${separador}${cabecera_firma}`,
            cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
          },
          {
            filename: 'pie_firma.jpg',
            path: `${path_folder}${separador}${pie_firma}`,
            cid: 'pief' //COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
          }]
      };

      var corr = enviarMail(servidor, parseInt(puerto));
      corr.sendMail(data, function (error: any, info: any) {
        if (error) {
          corr.close();
          console.log('Email error: ' + error);
          return res.jsonp({ message: 'error' });
        } else {
          corr.close();
          console.log('Email sent: ' + info.response);
          return res.jsonp({ message: 'ok' });
        }
      });
    }
    else {
      res.jsonp({ message: 'Ups!!! algo salio mal. No fue posible enviar correo electrónico.' });
    }
  }

  //----------------------------------------------------------------- METODOS APP MOVIL------------------------------------------------------------------------------------------------------
  public async getlistaHorasExtrasByFechasyCodigo(req: Request, res: Response): Promise<Response> {
    try {
      const { fecha_inicio, fecha_final, codigo } = req.query;

      const query = `SELECT h.* FROM mhe_solicitud_hora_extra h WHERE h.id_empleado_solicita = '${codigo}' AND (
            ((\'${fecha_inicio}\' BETWEEN h.fecha_inicio AND h.fecha_final ) OR 
             (\'${fecha_final}\' BETWEEN h.fecha_inicio AND h.fecha_final)) 
            OR
            ((h.fecha_inicio BETWEEN \'${fecha_inicio}\' AND \'${fecha_final}\') OR 
             (h.fecha_final BETWEEN \'${fecha_inicio}\' AND \'${fecha_final}\'))
            )`

      const response: QueryResult = await pool.query(query);
      const horas_extras: any[] = response.rows;
      return res.status(200).jsonp(horas_extras);
    } catch (error) {
      console.log(error);
      return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
  };

  public async getlistaHorasExtrasByCodigo(req: Request, res: Response): Promise<Response> {
    try {
      const { codigo } = req.query;
      const subquery1 = '( SELECT t.cargo FROM eu_empleado_cargos i, e_cat_tipo_cargo t WHERE i.id = h.id_empleado_cargo and i.id_tipo_cargo = t.id) as ncargo '
      const subquery2 = '( SELECT da.id_contrato FROM informacion_general AS da WHERE da.id = h.id_empleado_solicita ) AS id_contrato '

      const query = `SELECT h.*, ${subquery1}, ${subquery2} 
            FROM mhe_solicitud_hora_extra h WHERE h.id_empleado_solicita = '${codigo}' 
            ORDER BY h.fecha_inicio DESC LIMIT 100`
      const response: QueryResult = await pool.query(query);
      const horas_extras: any[] = response.rows;
      return res.status(200).jsonp(horas_extras);
    } catch (error) {
      console.log(error);
      return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
  };
}

export const horaExtraPedidasControlador = new HorasExtrasPedidasControlador();

export default horaExtraPedidasControlador;

const BuscarHorasExtras = async function (id: string | number, desde: string, hasta: string) {
  return await pool.query(
    `
    SELECT p.fecha_desde, p.fecha_hasta, p.hora_inicio, p.hora_fin, p.descripcion, 
      p.horas_totales, e.nombre AS planifica_nombre, e.apellido AS planifica_apellido 
    FROM mhe_detalle_plan_hora_extra AS p, mhe_empleado_plan_hora_extra AS pe, eu_empleados AS e 
    WHERE p.id = pe.id_detalle_plan AND e.id = p.id_empleado_planifica AND pe.id_empleado_realiza = $1 AND 
      p.fecha_desde BETWEEN $2 AND $3
    `
    , [id, desde, hasta])
    .then(res => {
      return res.rows;
    })
}