import { Request, Response } from 'express';
import { RestarPeriodoVacacionAutorizada } from '../../libs/CargarVacacion';
import {
  enviarMail, email, nombre, cabecera_firma, pie_firma, servidor, puerto, fechaHora, Credenciales,
  FormatearFecha, FormatearHora, dia_completo
}
  from '../../libs/settingsMail'
import { QueryResult } from 'pg';
import pool from '../../database';
import path from 'path';

const builder = require('xmlbuilder');

class VacacionesControlador {

  public async VacacionesIdPeriodo(req: Request, res: Response) {
    const { id } = req.params;
    const VACACIONES = await pool.query(
      `
      SELECT v.fec_inicio, v.fec_final, fec_ingreso, v.estado, v.dia_libre, v.dia_laborable, 
      v.legalizado, v.id, v.id_peri_vacacion 
      FROM vacaciones AS v, peri_vacaciones AS p 
      WHERE v.id_peri_vacacion = p.id AND p.id = $1 ORDER BY v.id DESC
      `
      , [id]);
    if (VACACIONES.rowCount > 0) {
      return res.jsonp(VACACIONES.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  public async ListarVacaciones(req: Request, res: Response) {
    const { estado } = req.body;
    const VACACIONES = await pool.query(
      `
      SELECT v.fec_inicio, v.fec_final, v.fec_ingreso, v.estado, v.dia_libre, v.dia_laborable, v.legalizado, 
        v.id, v.id_peri_vacacion, v.id_empl_cargo, dc.contrato_id, e.id AS id_empl_solicita, da.id_departamento, 
	      e.nombre, e.apellido, (e.nombre || \' \' || e.apellido) AS fullname, da.codigo, depa.nombre AS depa_nombre
      FROM vacaciones AS v, datos_empleado_cargo AS dc, empleados AS e, datos_actuales_empleado AS da, cg_departamentos AS depa   
      WHERE dc.cargo_id = v.id_empl_cargo 
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
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  public async ListarVacacionesAutorizadas(req: Request, res: Response) {
    const VACACIONES = await pool.query(`
    SELECT v.fec_inicio, v.fec_final, v.fec_ingreso, v.estado, v.dia_libre, v.dia_laborable, v.legalizado, 
    v.id, v.id_peri_vacacion, v.id_empl_cargo, e.id AS id_empl_solicita, e.nombre, e.apellido, (e.nombre || \' \' || e.apellido) AS fullname, 
    dc.codigo, depa.nombre AS depa_nombre 
	  FROM vacaciones AS v, datos_empleado_cargo AS dc, empleados AS e, cg_departamentos AS depa   
	  WHERE dc.cargo_id = v.id_empl_cargo AND dc.empl_id = e.id  AND depa.id = dc.id_departamento
	  AND (v.estado = 3 OR v.estado = 4) ORDER BY id DESC
    `);
    if (VACACIONES.rowCount > 0) {
      return res.jsonp(VACACIONES.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  public async ObtenerFechasFeriado(req: Request, res: Response): Promise<any> {
    const { fechaSalida, fechaIngreso } = req.body;
    const FECHAS = await pool.query('SELECT fecha FROM cg_feriados WHERE fecha BETWEEN $1 AND $2 ORDER BY fecha ASC', [fechaSalida, fechaIngreso]);
    if (FECHAS.rowCount > 0) {
      return res.jsonp(FECHAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registros no encontrados' });
    }
  }

  public async ObtenerSolicitudVacaciones(req: Request, res: Response) {
    const id = req.params.id_emple_vacacion;
    const SOLICITUD = await pool.query('SELECT *FROM vista_datos_solicitud_vacacion WHERE id_emple_vacacion = $1', [id]);
    if (SOLICITUD.rowCount > 0) {
      return res.json(SOLICITUD.rows)
    }
    else {
      return res.status(404).json({ text: 'No se encuentran registros' });
    }
  }

  public async ObtenerAutorizacionVacaciones(req: Request, res: Response) {
    const id = req.params.id_vacaciones;
    const SOLICITUD = await pool.query('SELECT a.id AS id_autorizacion, a.id_documento AS empleado_estado, ' +
      'v.id AS vacacion_id FROM autorizaciones AS a, vacaciones AS v ' +
      'WHERE v.id = a.id_vacacion AND v.id = $1', [id]);
    if (SOLICITUD.rowCount > 0) {
      return res.json(SOLICITUD.rows)
    }
    else {
      return res.status(404).json({ text: 'No se encuentran registros' });
    }
  }


  /** ********************************************************************************************* **
   ** **                        METODOS DE REGISTROS DE VACACIONES                               ** ** 
   ** ********************************************************************************************* **/

  // METODO PARA CREAR REGISTRO DE VACACIONES
  public async CrearVacaciones(req: Request, res: Response): Promise<Response> {
    try {
      const { fec_inicio, fec_final, fec_ingreso, estado, dia_libre, dia_laborable, legalizado,
        id_peri_vacacion, depa_user_loggin, id_empl_cargo, codigo } = req.body;

      const response: QueryResult = await pool.query(
        `
        INSERT INTO vacaciones (fec_inicio, fec_final, 
        fec_ingreso, estado, dia_libre, dia_laborable, legalizado, id_peri_vacacion, id_empl_cargo, codigo)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
        `,
        [fec_inicio, fec_final, fec_ingreso, estado, dia_libre, dia_laborable, legalizado, id_peri_vacacion,
          id_empl_cargo, codigo]);

      const [objetoVacacion] = response.rows;

      if (!objetoVacacion) return res.status(400)
        .jsonp({ message: 'Upps !!! algo salio mal. Solicitud de vacación no ingresada' })

      const vacacion = objetoVacacion;

      const JefesDepartamentos = await pool.query(
        `
        SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, cg.nivel, s.id AS id_suc, 
        cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato, 
        e.id AS empleado, (e.nombre || ' ' || e.apellido) as fullname , e.cedula, e.correo, 
        c.vaca_mail, c.vaca_noti 
        FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, 
        sucursales AS s, empl_contratos AS ecn,empleados AS e, config_noti AS c 
        WHERE da.id_departamento = $1 AND 
        da.id_empl_cargo = ecr.id AND 
        da.id_departamento = cg.id AND 
        da.estado = true AND 
        cg.id_sucursal = s.id AND 
        ecr.id_empl_contrato = ecn.id AND 
        ecn.id_empleado = e.id AND 
        e.id = c.id_empleado
        `, [depa_user_loggin]).then((result: any) => { return result.rows });

      if (JefesDepartamentos.length === 0) return res.status(400)
        .jsonp({ message: 'Ups !!! algo salio mal. Solicitud ingresada, pero es necesario verificar configuraciones jefes de departamento.' });

      const [obj] = JefesDepartamentos;
      let depa_padre = obj.depa_padre;
      let JefeDepaPadre;

      if (depa_padre !== null) {
        console.log('******************', depa_padre);
        do {
          JefeDepaPadre = await pool.query(
            `
            SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, cg.nivel, s.id AS id_suc,
            cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato,
            e.id AS empleado, (e.nombre || ' ' || e.apellido) as fullname , e.cedula, e.correo, 
            c.vaca_mail, c.vaca_noti
            FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, 
            sucursales AS s, empl_contratos AS ecn,empleados AS e, config_noti AS c 
            WHERE da.id_departamento = $1 AND 
            da.id_empl_cargo = ecr.id AND 
            da.id_departamento = cg.id AND 
            da.estado = true AND 
            cg.id_sucursal = s.id AND 
            ecr.id_empl_contrato = ecn.id AND 
            ecn.id_empleado = e.id AND 
            e.id = c.id_empleado
            `, [depa_padre]);

          console.log(JefeDepaPadre.rows.length);
          depa_padre = JefeDepaPadre.rows[0].depa_padre;
          JefesDepartamentos.push(JefeDepaPadre.rows[0]);

        } while (depa_padre !== null);
        vacacion.EmpleadosSendNotiEmail = JefesDepartamentos
        return res.status(200).jsonp(vacacion);
      } else {
        vacacion.EmpleadosSendNotiEmail = JefesDepartamentos
        return res.status(200).jsonp(vacacion);
      }

    } catch (error) {
      return res.status(500).
        jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
  }

  // METODO DE EDICIÓN DE REGISTRO DE VACACIONES
  public async EditarVacaciones(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id

      const { fec_inicio, fec_final, fec_ingreso, dia_libre, dia_laborable, depa_user_loggin } = req.body;

      const response: QueryResult = await pool.query(
        `
        UPDATE vacaciones SET fec_inicio = $1, fec_final = $2, fec_ingreso = $3, dia_libre = $4, 
        dia_laborable = $5 WHERE id = $6 RETURNING *
        `, [fec_inicio, fec_final, fec_ingreso, dia_libre, dia_laborable, id]);

      const [objetoVacacion] = response.rows;

      if (!objetoVacacion) return res.status(400)
        .jsonp({ message: 'Upps !!! algo salio mal. Solicitud de vacación no ingresada' })

      const vacacion = objetoVacacion;

      const JefesDepartamentos = await pool.query(
        `
        SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, cg.nivel, s.id AS id_suc, 
        cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato, 
        e.id AS empleado, (e.nombre || ' ' || e.apellido) as fullname , e.cedula, e.correo, 
        c.vaca_mail, c.vaca_noti 
        FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, 
        sucursales AS s, empl_contratos AS ecn,empleados AS e, config_noti AS c 
        WHERE da.id_departamento = $1 AND 
        da.id_empl_cargo = ecr.id AND 
        da.id_departamento = cg.id AND 
        da.estado = true AND 
        cg.id_sucursal = s.id AND 
        ecr.id_empl_contrato = ecn.id AND 
        ecn.id_empleado = e.id AND
        e.id = c.id_empleado
        `, [depa_user_loggin]).then((result: any) => { return result.rows });

      if (JefesDepartamentos.length === 0) return res.status(400)
        .jsonp({ message: 'Ups !!! algo salio mal. Solicitud ingresada, pero es necesario verificar configuraciones jefes de departamento.' });

      const [obj] = JefesDepartamentos;
      let depa_padre = obj.depa_padre;
      let JefeDepaPadre;

      if (depa_padre !== null) {

        do {
          JefeDepaPadre = await pool.query(
            `
            SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, cg.nivel, s.id AS id_suc,
            cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato,
            e.id AS empleado, (e.nombre || ' ' || e.apellido) as fullname , e.cedula, e.correo,
            c.vaca_mail, c.vaca_noti
            FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, 
            sucursales AS s, empl_contratos AS ecn,empleados AS e, config_noti AS c 
            WHERE da.id_departamento = $1 AND 
            da.id_empl_cargo = ecr.id AND 
            da.id_departamento = cg.id AND 
            da.estado = true AND 
            cg.id_sucursal = s.id AND 
            ecr.id_empl_contrato = ecn.id AND 
            ecn.id_empleado = e.id AND 
            e.id = c.id_empleado
            `, [depa_padre]);

          console.log(JefeDepaPadre.rows.length);
          depa_padre = JefeDepaPadre.rows[0].depa_padre;
          JefesDepartamentos.push(JefeDepaPadre.rows[0]);

        } while (depa_padre !== null);
        vacacion.EmpleadosSendNotiEmail = JefesDepartamentos
        return res.status(200).jsonp(vacacion);
      } else {
        vacacion.EmpleadosSendNotiEmail = JefesDepartamentos
        return res.status(200).jsonp(vacacion);
      }

    } catch (error) {
      return res.status(500)
        .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
  }

  // ELIMINAR SOLICITUD DE VACACION
  public async EliminarVacaciones(req: Request, res: Response): Promise<Response> {

    let { id_vacacion } = req.params;

    await pool.query(
      `
      DELETE FROM realtime_noti WHERE id_vacaciones = $1
      `
      , [id_vacacion]);

    await pool.query(
      `
        DELETE FROM autorizaciones WHERE id_vacacion = $1
      `
      , [id_vacacion])

    const response: QueryResult = await pool.query(
      `
      DELETE FROM vacaciones WHERE id = $1 RETURNING *
      `
      , [id_vacacion]);

    const [objetoVacacion] = response.rows;

    if (objetoVacacion) {
      return res.status(200).jsonp(objetoVacacion)
    }
    else {
      return res.status(404).jsonp({ message: 'Solicitud no eliminada.' })
    }
  }

  // BUSCAR VACACIONES MEDIANTE ID DE VACACION *** revisar toma de estado
  public async ListarVacacionId(req: Request, res: Response) {
    const { id } = req.params;
    const { estado } = req.body; // ---
    const VACACIONES = await pool.query(
      `
      SELECT v.id, v.fec_inicio, v.fec_final, fec_ingreso, v.estado, 
      v.dia_libre, v.dia_laborable, v.legalizado, v.id, v.id_peri_vacacion, e.id AS id_empleado, de.id_contrato
      FROM vacaciones AS v, empleados AS e, datos_actuales_empleado AS de
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
  public async ActualizarEstado(req: Request, res: Response): Promise<void> {

    const id = req.params.id;
    const { estado } = req.body;

    await pool.query(
      `
      UPDATE vacaciones SET estado = $1 WHERE id = $2
      `, [estado, id]);

    if (3 === estado) {
      RestarPeriodoVacacionAutorizada(parseInt(id));
    }

  }

  // METODO DE BUSQUEDA DE DATOS DE VACACION POR ID DE VACACION  
  public async ListarUnaVacacion(req: Request, res: Response) {
    const id = req.params.id;
    const VACACIONES = await pool.query(
      `
      SELECT v.fec_inicio, v.fec_final, v.fec_ingreso, v.estado, v.dia_libre, v.dia_laborable, 
        v.legalizado, v.id, v.id_peri_vacacion, v.id_empl_cargo, e.id AS id_empleado,
        (e.nombre || ' ' || e.apellido) AS fullname, e.cedula
      FROM vacaciones AS v, empleados AS e 
      WHERE v.id = $1 AND e.codigo = v.codigo::varchar
      `
      , [id]);
    if (VACACIONES.rowCount > 0) {
      return res.jsonp(VACACIONES.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
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
        FROM empl_contratos AS ecn, empleados AS e, empl_cargos AS ecr, tipo_cargo AS tc, 
        cg_departamentos AS d 
        WHERE ecn.id = $1 AND ecn.id_empleado = e.id AND 
        (SELECT MAX(cargo_id) AS cargo FROM datos_empleado_cargo WHERE empl_id = e.id) = ecr.id 
        AND tc.id = ecr.cargo AND d.id = ecr.id_departamento 
        ORDER BY cargo DESC
        `, [idContrato]);

      // obj.id_dep === correoInfoPideVacacion.rows[0].id_departamento && obj.id_suc === correoInfoPideVacacion.rows[0].id_sucursal
      var url = `${process.env.URL_DOMAIN}/ver-vacacion`;

      let data = {
        to: correo,
        from: email,
        subject: asunto,
        html: `
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
            `,
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
      res.jsonp({ message: 'Ups! algo salio mal!!! No fue posible enviar correo electrónico.' });
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
        FROM empl_contratos AS ecn, empleados AS e, empl_cargos AS ecr, tipo_cargo AS tc, 
        cg_departamentos AS d 
        WHERE ecn.id = $1 AND ecn.id_empleado = e.id AND 
        (SELECT MAX(cargo_id) AS cargo FROM datos_empleado_cargo WHERE empl_id = e.id) = ecr.id 
        AND tc.id = ecr.cargo AND d.id = ecr.id_departamento 
        ORDER BY cargo DESC
        `, [idContrato]);

      // obj.id_dep === correoInfoPideVacacion.rows[0].id_departamento && obj.id_suc === correoInfoPideVacacion.rows[0].id_sucursal

      let data = {
        to: correo,
        from: email,
        subject: asunto,
        html: `
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
              `,
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
      res.jsonp({ message: 'Ups algo salio mal !!! No fue posible enviar correo electrónico.' });
    }
  }

}

export const VACACIONES_CONTROLADOR = new VacacionesControlador();

export default VACACIONES_CONTROLADOR;