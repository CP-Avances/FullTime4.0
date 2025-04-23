import { Request, Response } from 'express';
import { ObtenerRutaLogos } from '../../../libs/accesoCarpetas';
import { QueryResult } from 'pg';
import {
  enviarMail, email, nombre, cabecera_firma, pie_firma, servidor, puerto, fechaHora, Credenciales,
  FormatearFecha, FormatearHora, dia_completo, FormatearFecha2
}
  from '../../../libs/settingsMail';
import AUDITORIA_CONTROLADOR from '../../reportes/auditoriaControlador';
import pool from '../../../database';
import path from 'path';


class PlanHoraExtraControlador {


  public async ListarPlanHoraExtra(req: Request, res: Response) {
    const PLAN = await pool.query(
      `
      SELECT e.id AS empl_id, e.codigo, e.identificacion, e.nombre, e.apellido, 
        t.id_empl_cargo, t.id_empl_contrato, t.id_plan_extra, t.tiempo_autorizado, t.fecha_desde, t.fecha_hasta, 
        t.hora_inicio, t.hora_fin, (t.h_fin::interval - t.h_inicio::interval)::time AS hora_total_plan, 
        t.fecha_timbre, t.timbre_entrada, t.timbre_salida, 
        (t.timbre_salida::interval - t.timbre_entrada::interval)::time AS hora_total_timbre, t.observacion, 
        t.estado AS plan_estado 
      FROM eu_empleados AS e, (SELECT * FROM timbres_entrada_plan_hora_extra AS tehe 
        FULL JOIN timbres_salida_plan_hora_extra AS tshe 
        ON tehe.fecha_timbre_e = tshe.fecha_timbre AND tehe.id_empl = tshe.id_empleado) AS t
      WHERE t.observacion = false AND (e.id = t.id_empleado OR e.id = t.id_empl) AND (t.estado = 1 OR t.estado = 2)
      `
    );
    if (PLAN.rowCount != 0) {
      res.jsonp(PLAN.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  public async ListarPlanHoraExtraObserva(req: Request, res: Response) {
    const PLAN = await pool.query(
      `
      SELECT e.id AS empl_id, e.codigo, e.identificacion, e.nombre, e.apellido, 
        t.id_empl_cargo, t.id_empl_contrato, t.id_plan_extra, t.tiempo_autorizado, t.fecha_desde, t.fecha_hasta, 
        t.hora_inicio, t.hora_fin, (t.h_fin::interval - t.h_inicio::interval)::time AS hora_total_plan,
        t.fecha_timbre, t.timbre_entrada, t.timbre_salida, 
        (t.timbre_salida::interval - t.timbre_entrada::interval)::time AS hora_total_timbre, t.observacion, 
        t.estado AS plan_estado 
      FROM eu_empleados AS e, (SELECT * FROM timbres_entrada_plan_hora_extra AS tehe 
        FULL JOIN timbres_salida_plan_hora_extra AS tshe 
        ON tehe.fecha_timbre_e = tshe.fecha_timbre AND tehe.id_empl = tshe.id_empleado) AS t 
      WHERE t.observacion = true AND (e.id = t.id_empleado OR e.id = t.id_empl) AND (t.estado = 1 OR t.estado = 2)
      `
    );
    if (PLAN.rowCount != 0) {
      res.jsonp(PLAN.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  public async ListarPlanHoraExtraAutorizada(req: Request, res: Response) {
    const PLAN = await pool.query(
      `
      SELECT e.id AS empl_id, e.codigo, e.identificacion, e.nombre, e.apellido,
        t.id_empl_cargo, t.id_empl_contrato, t.id_plan_extra, t.tiempo_autorizado, t.fecha_desde, t.fecha_hasta,
        t.hora_inicio, t.hora_fin, (t.h_fin::interval - t.h_inicio::interval)::time AS hora_total_plan,
        t.fecha_timbre, t.timbre_entrada, t.timbre_salida, 
        (t.timbre_salida::interval - t.timbre_entrada::interval)::time AS hora_total_timbre, t.observacion, 
        t.estado AS plan_estado 
      FROM eu_empleados AS e, (SELECT * FROM timbres_entrada_plan_hora_extra AS tehe 
        FULL JOIN timbres_salida_plan_hora_extra AS tshe 
        ON tehe.fecha_timbre_e = tshe.fecha_timbre AND tehe.id_empl = tshe.id_empleado) AS t 
      WHERE (e.id = t.id_empleado OR e.id = t.id_empl) AND (t.estado = 3 OR t.estado = 4)
      `
    );
    if (PLAN.rowCount != 0) {
      res.jsonp(PLAN.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }


  public async ObtenerDatosAutorizacion(req: Request, res: Response) {
    const id = req.params.id_plan_extra;
    const SOLICITUD = await pool.query(
      `
      SELECT a.id AS id_autorizacion, a.id_autoriza_estado AS empleado_estado, p.id AS id_plan_extra, 
        pe.id AS plan_hora_extra_empleado 
      FROM ecm_autorizaciones AS a, mhe_detalle_plan_hora_extra AS p, mhe_empleado_plan_hora_extra AS pe 
      WHERE pe.id = a.id_plan_hora_extra AND pe.id_detalle_plan = p.id AND p.id = $1
      `
      , [id]);
    if (SOLICITUD.rowCount != 0) {
      return res.json(SOLICITUD.rows)
    }
    else {
      return res.status(404).json({ text: 'No se encuentran registros.' });
    }
  }

  // ACTUALIZAR 
  public async TiempoAutorizado(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      const { hora, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const consulta = await pool.query(`SELECT tiempo_autorizado FROM mhe_empleado_plan_hora_extra WHERE id = $1`, [id]);
      const [datosOriginales] = consulta.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'mhe_empleado_plan_hora_extra',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al actualizar tiempo autorizado en plan_hora_extra_empleado con id ${id}. Registro no encontrado`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado' });
      }

      let respuesta = await pool.query(
        `
        UPDATE mhe_empleado_plan_hora_extra SET tiempo_autorizado = $2 WHERE id = $1 RETURNING *
        `
        , [id, hora]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'mhe_empleado_plan_hora_extra',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: JSON.stringify(respuesta.rows[0]),
        ip: ip,
        ip_local: ip_local,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Tiempo de hora autorizada confirmada' });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'Error al actualizar tiempo autorizado' });
    }
  }



  public async ActualizarEstado(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const { estado, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const consulta = await pool.query(`SELECT estado FROM mhe_empleado_plan_hora_extra WHERE id = $1`, [id]);
      const [datosOriginales] = consulta.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'mhe_empleado_plan_hora_extra',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al actualizar estado en plan_hora_extra_empleado con id ${id}. Registro no encontrado`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado' });
      }

      const respuesta = await pool.query(
        `
        UPDATE mhe_empleado_plan_hora_extra SET estado = $1 WHERE id = $2 RETURNING *
        `
        , [estado, id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'mhe_empleado_plan_hora_extra',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: JSON.stringify(respuesta.rows[0]),
        ip: ip,
        ip_local: ip_local,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Estado de Planificación Actualizada' });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'Error al actualizar estado' });
    }
  }

  /** ************************************************************************************************* **
   ** **                METODOS PARA CREACION DE PLANIFICACION DE HORAS EXTRAS                       ** ** 
   ** ************************************************************************************************* **/

  // CREACION DE PLANIFICACION DE HORAS EXTRAS
  public async CrearPlanHoraExtra(req: Request, res: Response): Promise<Response> {
    try {

      const { id_empl_planifica, fecha_desde, fecha_hasta, hora_inicio, hora_fin, descripcion,
        horas_totales, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      const response: QueryResult = await pool.query(
        `
        INSERT INTO mhe_detalle_plan_hora_extra (id_empleado_planifica, fecha_desde, fecha_hasta, hora_inicio, hora_fin, 
          descripcion, horas_totales) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
        `
        , [id_empl_planifica, fecha_desde, fecha_hasta,
          hora_inicio, hora_fin, descripcion, horas_totales]);

      const [planHoraExtra] = response.rows;

      const fecha_DesdeN = await FormatearFecha2(fecha_desde, 'ddd');
      const fecha_HastaN = await FormatearFecha2(fecha_hasta, 'ddd');

      const horaInicio = await FormatearHora(hora_inicio);
      const horaFin = await FormatearHora(hora_fin);

      planHoraExtra.fecha_desde = fecha_DesdeN;
      planHoraExtra.fecha_hasta = fecha_HastaN;
      planHoraExtra.hora_inicio = horaInicio;
      planHoraExtra.hora_fin = horaFin;


      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'mhe_detalle_plan_hora_extra',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: JSON.stringify(planHoraExtra),
        ip: ip,
        ip_local: ip_local,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');

      if (!planHoraExtra) {
        return res.status(404).jsonp({ message: 'error' })
      }
      else {
        return res.status(200).jsonp({ message: 'ok', info: planHoraExtra });
      }

    } catch (error) {
      console.log('error hoara extra', error);
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500)
        .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
  }

  // CREAR PLANIFICACION DE HE POR USUARIO
  public async CrearPlanHoraExtraEmpleado(req: Request, res: Response) {

    try {

      const { id_plan_hora, id_empl_realiza, observacion, id_empl_cargo, estado,
        user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      const response: QueryResult = await pool.query(
        `
        INSERT INTO mhe_empleado_plan_hora_extra (id_detalle_plan, id_empleado_realiza, observacion, 
          id_empleado_cargo, estado)
        VALUES ($1, $2, $3, $4, $5) RETURNING *
        `
        , [id_plan_hora, id_empl_realiza, observacion, id_empl_cargo, estado]);

      const [planEmpleado] = response.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'mhe_empleado_plan_hora_extra',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: JSON.stringify(planEmpleado),
        ip: ip,
        ip_local: ip_local,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');

      if (!planEmpleado) return res.status(400).jsonp({ message: 'error' });

      return res.status(200)
        .jsonp({ message: 'Registro guardado.', info: planEmpleado });

    } catch (error) {
      console.log('error hoara extra', error);
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500)
        .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }

  }

  // BUSQUEDA DE DATOS DE PLANIFICACIONES DE HORAS EXTRAS
  public async ListarPlanificacion(req: Request, res: Response) {
    const PLAN = await pool.query(
      `
      SELECT * FROM mhe_detalle_plan_hora_extra ORDER BY fecha_desde DESC
      `
    );
    if (PLAN.rowCount != 0) {
      res.jsonp(PLAN.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  // BUSQUEDA DE USUARIOS POR ID DE PLANIFICACION
  public async ListarPlanEmpleados(req: Request, res: Response) {
    const id = req.params.id_plan_hora;
    const PLAN = await pool.query(
      `
      SELECT p.id AS id_plan, pe.id, p.descripcion, p.fecha_desde, p.fecha_hasta, p.hora_inicio, p.hora_fin,
        p.horas_totales, e.id AS id_empleado, (e.nombre || ' ' || e.apellido) AS nombre,
        e.codigo, e.identificacion, e.correo, pe.id_empleado_cargo AS id_cargo
      FROM mhe_empleado_plan_hora_extra AS pe, mhe_detalle_plan_hora_extra AS p, eu_empleados AS e
      WHERE pe.id_detalle_plan = $1 AND pe.id_detalle_plan = p.id AND e.id = pe.id_empleado_realiza
      `
      , [id]);
    if (PLAN.rowCount != 0) {
      res.jsonp(PLAN.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  // ELIMINAR REGISTRO DE PLANIFICACION HORAS EXTRAS
  public async EliminarRegistros(req: Request, res: Response): Promise<Response> {
    try {
      const { user_name, ip, ip_local } = req.body;
      const id = req.params.id;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const consulta = await pool.query('SELECT * FROM mhe_detalle_plan_hora_extra WHERE id = $1', [id]);
      const [datosOriginales] = consulta.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'mhe_detalle_plan_hora_extra',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al eliminar plan_hora_extra con id ${id}. Registro no encontrado`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado' });
      }

      await pool.query(
        `
        DELETE FROM mhe_detalle_plan_hora_extra WHERE id = $1
        `
        , [id]);
      var fecha_DesdeO = await FormatearFecha2(datosOriginales.fecha_desde, 'ddd');
      var fecha_HastaO = await FormatearFecha2(datosOriginales.fecha_hasta, 'ddd');

      const horaInicioO = await FormatearHora(datosOriginales.hora_inicio)
      const horaFinO = await FormatearHora(datosOriginales.hora_fin)


      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'mhe_detalle_plan_hora_extra',
        usuario: user_name,
        accion: 'D',
        datosOriginales: `{ id_empleado_planifica: ${datosOriginales.id_empleado_planifica}, fecha_desde: ${fecha_DesdeO}, fecha_hasta: ${fecha_HastaO}, hora_inicio: ${horaInicioO}, hora_fin: ${horaFinO}, 
          descripcion: ${datosOriginales.descripcion}, horas_totales: ${datosOriginales.horas_totales}}`,
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
      return res.status(500).jsonp({ message: 'Error al eliminar registro' });
    }
  }

  // ELIMINAR PLANIFICACION DE UN USUARIO ESPECIFICO    **USADO
  public async EliminarPlanEmpleado(req: Request, res: Response): Promise<Response> {
    try {
      const { user_name, ip, ip_local } = req.body;
      const id = req.params.id;
      const id_empleado = req.params.id_empleado;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const consulta = await pool.query(`SELECT * FROM mhe_empleado_plan_hora_extra WHERE id_detalle_plan = $1`, [id]);
      const [datosOriginales] = consulta.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'mhe_empleado_plan_hora_extra',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al eliminar mhe_empleado_plan_hora_extra con id ${id}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado' });
      }

      await pool.query(
        `
        DELETE FROM mhe_empleado_plan_hora_extra WHERE id_detalle_plan = $1 AND id_empleado_realiza = $2
        `
        , [id, id_empleado]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'mhe_empleado_plan_hora_extra',
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
      return res.status(500).jsonp({ message: 'Error al eliminar registro' });
    }
  }

  // BUSQUEDA DE PLANIFICACIONES POR ID DE USUARIO    **USADO
  public async BuscarPlanUsuario(req: Request, res: Response) {
    const { id } = req.params;
    const PLAN = await pool.query(
      `
      SELECT pe.id, p.id AS id_plan, p.descripcion, p.fecha_desde, p.fecha_hasta, p.hora_inicio, 
	      p.hora_fin, p.horas_totales, pe.observacion, pe.tiempo_autorizado, pe.estado,
        da.id AS id_empleado, (da.nombre || ' ' || da.apellido) AS nombre, da.correo, da.identificacion,
        da.codigo, da.id_cargo, da.id_contrato
      FROM mhe_empleado_plan_hora_extra AS pe, mhe_detalle_plan_hora_extra AS p, informacion_general AS da
      WHERE pe.id_empleado_realiza = $1 AND pe.id_detalle_plan = p.id AND da.id = pe.id_empleado_realiza
      `
      , [id]);
    if (PLAN.rowCount != 0) {
      res.jsonp(PLAN.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }


  /** ********************************************************************************************* **
   ** *             ENVIO DE CORREOS ELECTRONICOS DE PLANIFICACION DE HORAS EXTRAS                  **
   ** ********************************************************************************************* **/

  // METODO ENVIO CORREO DESDE APLICACION WEB CREACIoN DE PLANIFICACION DE HORAS EXTRAS   **USADO
  public async EnviarCorreoPlanificacion(req: Request, res: Response): Promise<void> {
    var tiempo = fechaHora();
    var fecha = await FormatearFecha(tiempo.fecha_formato, dia_completo);
    var hora = await FormatearHora(tiempo.hora);

    // OBTENER RUTA DE LOGOS
    let separador = path.sep;
    const path_folder = ObtenerRutaLogos();

    var datos = await Credenciales(req.id_empresa);

    if (datos === 'ok') {

      const { id_empl_envia, correos, nombres, observacion, desde, hasta, inicio, fin,
        horas, asunto, tipo_solicitud, proceso } = req.body;

      const Envia = await pool.query(
        `
        SELECT da.nombre, da.apellido, da.identificacion, da.correo, da.name_cargo AS tipo_cargo, 
          da.name_dep AS departamento
        FROM informacion_general AS da
        WHERE da.id = $1
        `
        , [id_empl_envia]).then((resultado: any) => { return resultado.rows[0] });

      let data = {
        from: email,
        to: correos,
        subject: asunto,
        html:
          `
          <body>
            <div style="text-align: center;">
              <img width="100%" height="100%" src="cid:cabeceraf"/>
            </div>
            <br>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              El presente correo es para informar que se ha ${proceso} la siguiente planificación de horas extras: <br>  
            </p>
            <h3 style="font-family: Arial; text-align: center;">DATOS DEL COLABORADOR QUE ${tipo_solicitud} PLANIFICACIÓN HORAS EXTRAS</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Empresa:</b> ${nombre} <br>   
              <b>Asunto:</b> ${asunto} <br> 
              <b>Colaborador que envía:</b> ${Envia.nombre} ${Envia.apellido} <br>
              <b>Número de identificación:</b> ${Envia.identificacion} <br>
              <b>Cargo:</b> ${Envia.tipo_cargo} <br>
              <b>Departamento:</b> ${Envia.departamento} <br>
              <b>Generado mediante:</b> Aplicación Web <br>
              <b>Fecha de envío:</b> ${fecha} <br> 
              <b>Hora de envío:</b> ${hora} <br><br> 
            </p>
            <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA PLANIFICACIÓN DE HORAS EXTRAS</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Motivo:</b> ${observacion} <br>   
              <b>Fecha de Planificación:</b> ${fecha} <br> 
              <b>Desde:</b> ${desde} <br>
              <b>Hasta:</b> ${hasta} <br>
              <b>Horario:</b> ${inicio} a ${fin} <br>
              <b>Número de horas planificadas:</b> ${horas} <br><br>
              <b>Colabores a los cuales se les ha ${proceso} una planificación de horas extras:</b>
            </p>
            <div style="text-align: center;"> 
              <table border=2 cellpadding=10 cellspacing=0 style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px;">
                <tr>
                  <th><h5>COLABORADOR</h5></th> 
                  <th><h5>IDENTIFICACIÓN</h5></th> 
                </tr>            
                ${nombres} 
              </table>
            </div>
            <p style="font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Gracias por la atención</b> <br>
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
    } else {
      res.jsonp({ message: 'Ups!!! algo salio mal. No fue posible enviar correo electrónico.' });
    }

  }


  /** ********************************************************************************************* **
   ** *             ENVIO DE NOTIFICACIONES DE PLANIFICACION DE HORAS EXTRAS                      * **
   ** ********************************************************************************************* **/

  // ENVIO DE NOTIFICACION DE PLANIFICACION DE HORAS EXTRAS   **USADO
  public async EnviarNotiPlanHE(req: Request, res: Response): Promise<Response> {
    try {
      var tiempo = fechaHora();

      const { id_empl_envia, id_empl_recive, mensaje, tipo, user_name, ip, ip_local } = req.body;
      let create_at = tiempo.fecha_formato + ' ' + tiempo.hora;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      const response: QueryResult = await pool.query(
        `
        INSERT INTO ecm_realtime_timbres (fecha_hora, id_empleado_envia, id_empleado_recibe, descripcion, tipo) 
        VALUES($1, $2, $3, $4, $5) RETURNING *
        `
        , [create_at, id_empl_envia, id_empl_recive, mensaje, tipo]);
      const [notificiacion] = response.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'ecm_realtime_timbres',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: JSON.stringify(notificiacion),
        ip: ip,
        ip_local: ip_local,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');

      if (!notificiacion) return res.status(400).jsonp({ message: 'error' });

      const USUARIO = await pool.query(
        `
        SELECT (nombre || ' ' || apellido) AS usuario
        FROM eu_empleados WHERE id = $1
        `
        , [id_empl_envia]);

      notificiacion.usuario = USUARIO.rows[0].usuario;

      return res.status(200).jsonp({ message: 'ok', respuesta: notificiacion });

    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500)
        .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
  }

}

export const PLAN_HORA_EXTRA_CONTROLADOR = new PlanHoraExtraControlador();

export default PLAN_HORA_EXTRA_CONTROLADOR;