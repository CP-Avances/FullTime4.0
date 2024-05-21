import { RestarPeriodoVacacionAutorizada } from '../../libs/CargarVacacion';
import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import {
  enviarMail, email, nombre, cabecera_firma, pie_firma, servidor, puerto, fechaHora, Credenciales,
  FormatearFecha, FormatearHora, dia_completo
}
  from '../../libs/settingsMail';
import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';
import pool from '../../database';
import path from 'path';

class VacacionesControlador {

  public async VacacionesIdPeriodo(req: Request, res: Response) {
    const { id } = req.params;
    const VACACIONES = await pool.query(
      `
      SELECT v.fecha_inicio, v.fecha_final, fecha_ingreso, v.estado, v.dia_libre, v.dia_laborable, 
        v.legalizado, v.id, v.id_periodo_vacacion 
      FROM mv_solicitud_vacacion AS v, mv_periodo_vacacion AS p 
      WHERE v.id_periodo_vacacion = p.id AND p.id = $1 
      ORDER BY v.id DESC
      `
      , [id]);
    if (VACACIONES.rowCount > 0) {
      return res.jsonp(VACACIONES.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  public async ListarVacaciones(req: Request, res: Response) {
    const { estado } = req.body;
    const VACACIONES = await pool.query(
      `
      SELECT v.fecha_inicio, v.fecha_final, v.fecha_ingreso, v.estado, v.dia_libre, v.dia_laborable, v.legalizado, 
        v.id, v.id_periodo_vacacion, v.id_empleado_cargo, dc.contrato_id, e.id AS id_empl_solicita, da.id_departamento, 
	      e.nombre, e.apellido, (e.nombre || \' \' || e.apellido) AS fullname, da.codigo, depa.nombre AS depa_nombre
      FROM mv_solicitud_vacacion AS v, datos_empleado_cargo AS dc, eu_empleados AS e, datos_actuales_empleado AS da, 
        ed_departamentos AS depa   
      WHERE dc.cargo_id = v.id_empleado_cargo 
	      AND dc.empl_id = e.id  
	      AND da.id_contrato = dc.contrato_id
        AND depa.id = da.id_departamento
	      AND (v.estado = 1 OR v.estado = 2) 
        AND da.estado = $1
      ORDER BY id DESC
      `
      , [estado]
    );

    if (VACACIONES.rowCount > 0) {
      return res.jsonp(VACACIONES.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  public async ListarVacacionesAutorizadas(req: Request, res: Response) {
    const VACACIONES = await pool.query(
      `
      SELECT v.fecha_inicio, v.fecha_final, v.fecha_ingreso, v.estado, v.dia_libre, v.dia_laborable, v.legalizado, 
        v.id, v.id_periodo_vacacion, v.id_empleado_cargo, e.id AS id_empl_solicita, e.nombre, e.apellido, 
        (e.nombre || \' \' || e.apellido) AS fullname, dc.codigo, depa.nombre AS depa_nombre 
	    FROM mv_solicitud_vacacion AS v, datos_empleado_cargo AS dc, eu_empleados AS e, ed_departamentos AS depa   
	    WHERE dc.cargo_id = v.id_empleado_cargo AND dc.empl_id = e.id  AND depa.id = dc.id_departamento
	      AND (v.estado = 3 OR v.estado = 4) 
      ORDER BY id DESC
      `
    );
    if (VACACIONES.rowCount > 0) {
      return res.jsonp(VACACIONES.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  public async ObtenerFechasFeriado(req: Request, res: Response): Promise<any> {
    const { fechaSalida, fechaIngreso } = req.body;
    const FECHAS = await pool.query(
      `
      SELECT fecha FROM ef_cat_feriados WHERE fecha BETWEEN $1 AND $2 ORDER BY fecha ASC
      `
      , [fechaSalida, fechaIngreso]);
    if (FECHAS.rowCount > 0) {
      return res.jsonp(FECHAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }
  }

  public async ObtenerSolicitudVacaciones(req: Request, res: Response) {
    const id = req.params.id_emple_vacacion;
    const SOLICITUD = await pool.query(
      `
      SELECT * FROM vista_datos_solicitud_vacacion WHERE id_emple_vacacion = $1
      `
      , [id]);
    if (SOLICITUD.rowCount > 0) {
      return res.json(SOLICITUD.rows)
    }
    else {
      return res.status(404).json({ text: 'No se encuentran registros.' });
    }
  }

  public async ObtenerAutorizacionVacaciones(req: Request, res: Response) {
    const id = req.params.id_vacaciones;
    const SOLICITUD = await pool.query(
      `
      SELECT a.id AS id_autorizacion, a.id_autoriza_estado AS empleado_estado, 
        v.id AS vacacion_id 
      FROM ecm_autorizaciones AS a, mv_solicitud_vacacion AS v 
      WHERE v.id = a.id_vacacion AND v.id = $1
      `
      , [id]);
    if (SOLICITUD.rowCount > 0) {
      return res.json(SOLICITUD.rows)
    }
    else {
      return res.status(404).json({ text: 'No se encuentran registros.' });
    }
  }


  /** ********************************************************************************************* **
   ** **                        METODOS DE REGISTROS DE VACACIONES                               ** ** 
   ** ********************************************************************************************* **/

  // METODO PARA CREAR REGISTRO DE VACACIONES
  public async CrearVacaciones(req: Request, res: Response): Promise<Response> {
    try {
      const { fec_inicio, fec_final, fec_ingreso, estado, dia_libre, dia_laborable, legalizado,
        id_peri_vacacion, depa_user_loggin, id_empl_cargo, codigo, user_name, ip } = req.body;

      // INICIAR TRANSACCIÓN
      await pool.query('BEGIN');

      const response: QueryResult = await pool.query(
        `
        INSERT INTO mv_solicitud_vacacion (fecha_inicio, fecha_final, fecha_ingreso, estado, dia_libre, dia_laborable, 
          legalizado, id_periodo_vacacion, id_empleado_cargo, codigo)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
        `
        , [fec_inicio, fec_final, fec_ingreso, estado, dia_libre, dia_laborable, legalizado, id_peri_vacacion,
          id_empl_cargo, codigo]);

      const [objetoVacacion] = response.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'mv_solicitud_vacacion',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: JSON.stringify(objetoVacacion),
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCIÓN
      await pool.query('COMMIT');

      if (!objetoVacacion) return res.status(400)
        .jsonp({ message: 'Upps!!! algo salio mal. Solicitud de vacación no ingresada.' })

      const vacacion = objetoVacacion;

      return res.status(200).jsonp(vacacion);


    } catch (error) {
      // REVERTIR TRANSACCIÓN
      await pool.query('ROLLBACK');
      return res.status(500).
        jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
  }

  // METODO DE EDICIÓN DE REGISTRO DE VACACIONES
  public async EditarVacaciones(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id

      const { fec_inicio, fec_final, fec_ingreso, dia_libre, dia_laborable, depa_user_loggin, user_name, ip } = req.body;

      // INICIAR TRANSACCIÓN
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const consulta = await pool.query('SELECT * FROM mv_solicitud_vacacion WHERE id = $1', [id]);
      const [datosOriginales] = consulta.rows; 

      if (!datosOriginales){
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'mv_solicitud_vacacion',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al intentar actualizar registro de vacación con id ${id}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCIÓN
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
      }

      const response: QueryResult = await pool.query(
        `
        UPDATE mv_solicitud_vacacion SET fecha_inicio = $1, fecha_final = $2, fecha_ingreso = $3, dia_libre = $4, 
        dia_laborable = $5 WHERE id = $6 RETURNING *
        `
        , [fec_inicio, fec_final, fec_ingreso, dia_libre, dia_laborable, id]);

      const [objetoVacacion] = response.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'mv_solicitud_vacacion',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: JSON.stringify(objetoVacacion),
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCIÓN
      await pool.query('COMMIT');

      if (!objetoVacacion) return res.status(400)
        .jsonp({ message: 'Upps !!! algo salio mal. Solicitud de vacación no ingresada.' })

      const vacacion = objetoVacacion;

      return res.status(200).jsonp(vacacion);


    } catch (error) {
      // REVERTIR TRANSACCIÓN
      await pool.query('ROLLBACK');
      return res.status(500)
        .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
  }

  // ELIMINAR SOLICITUD DE VACACION
  public async EliminarVacaciones(req: Request, res: Response): Promise<Response> {

    try {
      const { user_name, ip } = req.body;
      let { id_vacacion } = req.params;

      // INICIAR TRANSACCIÓN
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const consulta = await pool.query('SELECT * FROM ecm_realtime_notificacion WHERE id_vacaciones = $1', [id_vacacion]);
      const [datosOriginales] = consulta.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'ecm_realtime_notificacion',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al intentar eliminar registro con id_vacaciones ${id_vacacion}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCIÓN
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
      }
  
      await pool.query(
        `
        DELETE FROM ecm_realtime_notificacion WHERE id_vacaciones = $1
        `
        , [id_vacacion]);
      
      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'ecm_realtime_notificacion',
        usuario: user_name,
        accion: 'D',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: '',
        ip,
        observacion: null
      });

      // CONSULTAR DATOSORIGINALESAUTORIZACIONES
      const consultaAutorizaciones = await pool.query('SELECT * FROM ecm_autorizaciones WHERE id_vacacion = $1', [id_vacacion]);
      const [datosOriginalesAutorizaciones] = consultaAutorizaciones.rows;

      if (!datosOriginalesAutorizaciones) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'ecm_autorizaciones',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al intentar eliminar registro con id_vacacion ${id_vacacion}. Registro no encontrado.`
        });
      }
  
      await pool.query(
        `
        DELETE FROM ecm_autorizaciones WHERE id_vacacion = $1
        `
        , [id_vacacion]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'ecm_autorizaciones',
        usuario: user_name,
        accion: 'D',
        datosOriginales: JSON.stringify(datosOriginalesAutorizaciones),
        datosNuevos: '',
        ip,
        observacion: null
      });

      // CONSULTAR DATOSORIGINALESVACACIONES
      const consultaVacaciones = await pool.query('SELECT * FROM mv_solicitud_vacacion WHERE id = $1', [id_vacacion]);
      const [datosOriginalesVacaciones] = consultaVacaciones.rows;

      if (!datosOriginalesVacaciones) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'mv_solicitud_vacacion',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al intentar eliminar registro con id ${id_vacacion}. Registro no encontrado.`
        });
      }
  
      const response: QueryResult = await pool.query(
        `
        DELETE FROM mv_solicitud_vacacion WHERE id = $1 RETURNING *
        `
        , [id_vacacion]);
  
      const [objetoVacacion] = response.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'mv_solicitud_vacacion',
        usuario: user_name,
        accion: 'D',
        datosOriginales: JSON.stringify(datosOriginalesVacaciones),
        datosNuevos: '',
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCIÓN
      await pool.query('COMMIT');
  
      if (objetoVacacion) {
        return res.status(200).jsonp(objetoVacacion)
      }
      else {
        return res.status(404).jsonp({ message: 'Solicitud no eliminada.' })
      }
    } catch (error) {
      // REVERTIR TRANSACCIÓN
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' });
      
    }
  }

  // BUSCAR VACACIONES MEDIANTE ID DE VACACION *** revisar toma de estado
  public async ListarVacacionId(req: Request, res: Response) {
    const { id } = req.params;
    const { estado } = req.body; // ---
    const VACACIONES = await pool.query(
      `
      SELECT v.id, v.fecha_inicio, v.fecha_final, fecha_ingreso, v.estado, v.dia_libre, v.dia_laborable, 
        v.legalizado, v.id, v.id_periodo_vacacion, e.id AS id_empleado, de.id_contrato
      FROM mv_solicitud_vacacion AS v, eu_empleados AS e, datos_actuales_empleado AS de
	    WHERE v.id = $1 AND e.codigo = v.codigo AND e.id = de.id AND de.estado = $2
      `
      , [id, estado]);
    if (VACACIONES.rowCount > 0) {
      return res.jsonp(VACACIONES.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  // ACTUALIZAR ESTADO DE SOLICITUD DE VACACIONES
  public async ActualizarEstado(req: Request, res: Response): Promise<any> {

    try {
      const id = req.params.id;
      const { estado, user_name, ip} = req.body;

      // INICIAR TRANSACCIÓN
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const consulta = await pool.query('SELECT * FROM mv_solicitud_vacacion WHERE id = $1', [id]);
      const [datosOriginales] = consulta.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'mv_solicitud_vacacion',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al intentar actualizar registro de vacación con id ${id}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCIÓN
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
      }
  
      await pool.query(
        `
        UPDATE mv_solicitud_vacacion SET estado = $1 WHERE id = $2
        `, [estado, id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'mv_solicitud_vacacion',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: '',
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCIÓN
      await pool.query('COMMIT');
  
      if (3 === estado) {
        RestarPeriodoVacacionAutorizada(parseInt(id), user_name, ip);
      }
    } catch (error) {
      // REVERTIR TRANSACCIÓN
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' });
    }

  }

  // METODO DE BUSQUEDA DE DATOS DE VACACION POR ID DE VACACION  
  public async ListarUnaVacacion(req: Request, res: Response) {
    const id = req.params.id;
    const VACACIONES = await pool.query(
      `
      SELECT v.fecha_inicio, v.fecha_final, v.fecha_ingreso, v.estado, v.dia_libre, v.dia_laborable, 
        v.legalizado, v.id, v.id_periodo_vacacion, v.id_empleado_cargo, e.id AS id_empleado,
        (e.nombre || ' ' || e.apellido) AS fullname, e.cedula
      FROM mv_solicitud_vacacion AS v, eu_empleados AS e 
      WHERE v.id = $1 AND e.codigo = v.codigo::varchar
      `
      , [id]);
    if (VACACIONES.rowCount > 0) {
      return res.jsonp(VACACIONES.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  /** ********************************************************************************************** **
   **                METODOS DE ENVIO DE CORREOS DE SOLICITUDES DE VACACIONES                        **
   ** ********************************************************************************************** **/

  // METODO DE ENVIO DE CORREO DESDE APLICACIÓN WEB
  public async EnviarCorreoVacacion(req: Request, res: Response): Promise<void> {

    var tiempo = fechaHora();
    var fecha = await FormatearFecha(tiempo.fecha_formato, dia_completo);
    var hora = await FormatearHora(tiempo.hora);

    const path_folder = path.resolve('logos');

    var datos = await Credenciales(req.id_empresa);

    if (datos === 'ok') {

      const { idContrato, desde, hasta, id_dep, id_suc, estado_v, correo, solicitado_por,
        id, asunto, tipo_solicitud, proceso } = req.body;

      const correoInfoPideVacacion = await pool.query(
        `
        SELECT e.correo, e.nombre, e.apellido, e.cedula, 
          ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo, tc.cargo AS tipo_cargo, 
          d.nombre AS departamento 
        FROM eu_empleado_contratos AS ecn, eu_empleados AS e, eu_empleado_cargos AS ecr, e_cat_tipo_cargo AS tc, 
          ed_departamentos AS d 
        WHERE ecn.id = $1 AND ecn.id_empleado = e.id AND 
          (SELECT MAX(cargo_id) AS cargo FROM datos_empleado_cargo WHERE empl_id = e.id) = ecr.id 
          AND tc.id = ecr.id_tipo_cargo AND d.id = ecr.id_departamento 
        ORDER BY cargo DESC
        `
        , [idContrato]);

      // obj.id_dep === correoInfoPideVacacion.rows[0].id_departamento && obj.id_suc === correoInfoPideVacacion.rows[0].id_sucursal
      var url = `${process.env.URL_DOMAIN}/ver-vacacion`;

      let data = {
        to: correo,
        from: email,
        subject: asunto,
        html:
          `
          <body>
            <div style="text-align: center;">
              <img width="25%" height="25%" src="cid:cabeceraf"/>
            </div>
            <br>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              El presente correo es para informar que se ha ${proceso} la siguiente solicitud de vacaciones: <br>  
            </p>
            <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Empresa:</b> ${nombre} <br>   
              <b>Asunto:</b> ${asunto} <br> 
              <b>Colaborador que envía:</b> ${correoInfoPideVacacion.rows[0].nombre} ${correoInfoPideVacacion.rows[0].apellido} <br>
              <b>Número de Cédula:</b> ${correoInfoPideVacacion.rows[0].cedula} <br>
              <b>Cargo:</b> ${correoInfoPideVacacion.rows[0].tipo_cargo} <br>
              <b>Departamento:</b> ${correoInfoPideVacacion.rows[0].departamento} <br>
              <b>Generado mediante:</b> Aplicación Web <br>
              <b>Fecha de envío:</b> ${fecha} <br> 
              <b>Hora de envío:</b> ${hora} <br><br> 
            </p>
            <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Motivo:</b> Vacaciones <br>   
              <b>Fecha de Solicitud:</b> ${fecha} <br> 
              <b>Desde:</b> ${desde} <br>
              <b>Hasta:</b> ${hasta} <br>
              <b>Estado:</b> ${estado_v} <br><br>
              <b>${tipo_solicitud}:</b> ${solicitado_por} <br><br>
              <a href="${url}/${id}">Dar clic en el siguiente enlace para revisar solicitud de realización de vacaciones.</a> <br><br>                                                  
            </p>
            <p style="font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Gracias por la atención</b><br>
              <b>Saludos cordiales,</b> <br><br>
            </p>
            <img src="cid:pief" width="50%" height="50%"/>
          </body>
          `
        ,
        attachments: [
          {
            filename: 'cabecera_firma.jpg',
            path: `${path_folder}/${cabecera_firma}`,
            cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
          },
          {
            filename: 'pie_firma.jpg',
            path: `${path_folder}/${pie_firma}`,
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

  // METODO DE ENVIO DE CORREO ELECTRÓNICO MEDIANTE APLICACIÓN MOVIL
  public async EnviarCorreoVacacionesMovil(req: Request, res: Response): Promise<void> {

    var tiempo = fechaHora();
    var fecha = await FormatearFecha(tiempo.fecha_formato, dia_completo);
    var hora = await FormatearHora(tiempo.hora);

    const path_folder = path.resolve('logos');

    var datos = await Credenciales(parseInt(req.params.id_empresa));

    if (datos === 'ok') {

      const { idContrato, desde, hasta, id_dep, id_suc, estado_v, correo, solicitado_por,
        asunto, tipo_solicitud, proceso } = req.body;

      const correoInfoPideVacacion = await pool.query(
        `
        SELECT e.correo, e.nombre, e.apellido, e.cedula, 
          ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo, tc.cargo AS tipo_cargo, 
          d.nombre AS departamento 
        FROM eu_empleado_contratos AS ecn, eu_empleados AS e, eu_empleado_cargos AS ecr, e_cat_tipo_cargo AS tc, 
          ed_departamentos AS d 
        WHERE ecn.id = $1 AND ecn.id_empleado = e.id AND 
          (SELECT MAX(cargo_id) AS cargo FROM datos_empleado_cargo WHERE empl_id = e.id) = ecr.id 
          AND tc.id = ecr.id_tipo_cargo AND d.id = ecr.id_departamento 
        ORDER BY cargo DESC
        `
        , [idContrato]);

      // obj.id_dep === correoInfoPideVacacion.rows[0].id_departamento && obj.id_suc === correoInfoPideVacacion.rows[0].id_sucursal

      let data = {
        to: correo,
        from: email,
        subject: asunto,
        html:
          `
          <body>
            <div style="text-align: center;">
              <img width="25%" height="25%" src="cid:cabeceraf"/>
            </div>
            <br>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              El presente correo es para informar que se ha ${proceso} la siguiente solicitud de vacaciones: <br>  
            </p>
            <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Empresa:</b> ${nombre} <br>   
              <b>Asunto:</b> ${asunto} <br> 
              <b>Colaborador que envía:</b> ${correoInfoPideVacacion.rows[0].nombre} ${correoInfoPideVacacion.rows[0].apellido} <br>
              <b>Número de Cédula:</b> ${correoInfoPideVacacion.rows[0].cedula} <br>
              <b>Cargo:</b> ${correoInfoPideVacacion.rows[0].tipo_cargo} <br>
              <b>Departamento:</b> ${correoInfoPideVacacion.rows[0].departamento} <br>
              <b>Generado mediante:</b> Aplicación Móvil <br>
              <b>Fecha de envío:</b> ${fecha} <br> 
              <b>Hora de envío:</b> ${hora} <br><br> 
            </p>
            <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Motivo:</b> Vacaciones <br>   
              <b>Fecha de Solicitud:</b> ${fecha} <br> 
              <b>Desde:</b> ${desde} <br>
              <b>Hasta:</b> ${hasta} <br>
              <b>Estado:</b> ${estado_v} <br><br>
              <b>${tipo_solicitud}:</b> ${solicitado_por} <br><br>
            </p>
            <p style="font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Gracias por la atención</b><br>
              <b>Saludos cordiales,</b> <br><br>
            </p>
            <img src="cid:pief" width="50%" height="50%"/>
          </body>
          `
        ,
        attachments: [
          {
            filename: 'cabecera_firma.jpg',
            path: `${path_folder}/${cabecera_firma}`,
            cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
          },
          {
            filename: 'pie_firma.jpg',
            path: `${path_folder}/${pie_firma}`,
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

}

export const VACACIONES_CONTROLADOR = new VacacionesControlador();

export default VACACIONES_CONTROLADOR;