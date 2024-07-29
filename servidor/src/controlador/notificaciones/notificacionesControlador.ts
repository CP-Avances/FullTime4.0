import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import {
  enviarMail, email, nombre, cabecera_firma, pie_firma, servidor, puerto, fechaHora, Credenciales,
  FormatearFecha, FormatearHora, dia_completo, FormatearFecha2
}
  from '../../libs/settingsMail';

import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';
import pool from '../../database';
import path from 'path';

class NotificacionTiempoRealControlador {

  // METODO PARA ELIMINAR NOTIFICACIONES DE PERMISOS - VACACIONES - HORAS EXTRAS  --**VERIFICACION
  public async EliminarMultiplesNotificaciones(req: Request, res: Response): Promise<any> {
    const { arregloNotificaciones, user_name, ip } = req.body;
    let contador: number = 0;

    if (arregloNotificaciones.length > 0) {
      contador = 0;
      arregloNotificaciones.forEach(async (obj: number) => {

        try {

          // INICIAR TRANSACCION
          await pool.query('BEGIN');

          // OBTENER DATOSORIGINALES
          const consulta = await pool.query('SELECT * FROM ecm_realtime_notificacion WHERE id = $1', [obj]);
          const [datosOriginales] = consulta.rows;

          if (!datosOriginales) {
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'ecm_realtime_notificacion',
              usuario: user_name,
              accion: 'D',
              datosOriginales: '',
              datosNuevos: '',
              ip,
              observacion: `Error al eliminar el registro con id ${obj}. No existe el registro en la base de datos.`
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.status(404).jsonp({ message: 'Registro no encontrado.' });
          }

          await pool.query(
            `
            DELETE FROM ecm_realtime_notificacion WHERE id = $1
            `
            , [obj])
            .then((result: any) => {
              contador = contador + 1;
              console.log(result.command, 'REALTIME ELIMINADO ====>', obj);
            });

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

          // FINALIZAR TRANSACCION
          await pool.query('COMMIT');
        } catch (error) {
          // ROEVERTIR TRANSACCION
          await pool.query('ROLLBACK');
          return res.status(500).jsonp({ message: 'Error al eliminar el registro.' });
        }
      });

      return res.jsonp({ message: 'OK' });
    }
    else {
      return res.jsonp({ message: 'error' });
    }

  }

  // METODO PARA LISTAR CONFIGURACION DE RECEPCION DE NOTIFICACIONES
  public async ObtenerConfigEmpleado(req: Request, res: Response): Promise<any> {
    const id_empleado = req.params.id;
    if (id_empleado != 'NaN') {
      const CONFIG_NOTI = await pool.query(
        `
        SELECT * FROM eu_configurar_alertas WHERE id_empleado = $1
        `
        , [id_empleado]);
      if (CONFIG_NOTI.rowCount != 0) {
        return res.jsonp(CONFIG_NOTI.rows);
      }
      else {
        return res.status(404).jsonp({ text: 'Registro no encontrados.' });
      }
    } else {
      res.status(404).jsonp({ text: 'Sin registros encontrados.' });
    }
  }



  // METODO PARA CREAR NOTIFICACIONES
  public async CrearNotificacion(req: Request, res: Response): Promise<Response> {
    try {
      var tiempo = fechaHora();

      const { id_send_empl, id_receives_empl, id_receives_depa, estado, id_permiso,
        id_vacaciones, id_hora_extra, mensaje, tipo, user_name, ip } = req.body;

      let create_at = tiempo.fecha_formato + ' ' + tiempo.hora;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      const response: QueryResult = await pool.query(
        `
        INSERT INTO ecm_realtime_notificacion (id_empleado_envia, id_empleado_recibe, id_departamento_recibe, estado, 
          fecha_hora, id_permiso, id_vacaciones, id_hora_extra, mensaje, tipo) 
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10 ) RETURNING * 
        `,
        [id_send_empl, id_receives_empl, id_receives_depa, estado, create_at, id_permiso, id_vacaciones,
          id_hora_extra, mensaje, tipo]);

      const [notificiacion] = response.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'ecm_realtime_notificacion',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: JSON.stringify(notificiacion),
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');

      if (!notificiacion) return res.status(400).jsonp({ message: 'Notificación no ingresada.' });

      const USUARIO = await pool.query(
        `
        SELECT (nombre || ' ' || apellido) AS usuario
        FROM eu_empleados WHERE id = $1
        `
        , [id_send_empl]);

      notificiacion.usuario = USUARIO.rows[0].usuario;

      return res.status(200)
        .jsonp({ message: 'Se ha enviado la respectiva notificación.', respuesta: notificiacion });

    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500)
        .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
  }



  public async ListaNotificacionesRecibidas(req: Request, res: Response): Promise<any> {
    const id = req.params.id_receive;
    const REAL_TIME_NOTIFICACION = await pool.query(
      `
      SELECT r.id, r.id_empleado_envia, r.id_empleado_recibe, r.id_departamento_recibe, r.estado, r.fecha_hora, 
        r.id_permiso, r.id_vacaciones, r.id_hora_extra, r.visto, r.mensaje, e.nombre, e.apellido 
      FROM ecm_realtime_notificacion AS r, eu_empleados AS e 
      WHERE r.id_empleado_recibe = $1 AND e.id = r.id_empleado_envia 
      ORDER BY id DESC
      `
      , [id])
      .then((result: any) => {
        return result.rows.map((obj: any) => {
          console.log(obj);
          return {
            id: obj.id,
            id_send_empl: obj.id_empleado_envia,
            id_receives_empl: obj.id_empleado_recibe,
            id_receives_depa: obj.id_departamento_recibe,
            estado: obj.estado,
            create_at: obj.fecha_hora,
            id_permiso: obj.id_permiso,
            id_vacaciones: obj.id_vacaciones,
            id_hora_extra: obj.id_hora_extra,
            visto: obj.visto,
            mensaje: obj.mensaje,
            empleado: obj.nombre + ' ' + obj.apellido
          }
        })
      });
    if (REAL_TIME_NOTIFICACION.length > 0) {
      return res.jsonp(REAL_TIME_NOTIFICACION)
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }

  public async ActualizarVista(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const { visto, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // OBTENER DATOSORIGINALES
      const consulta = await pool.query('SELECT * FROM ecm_realtime_notificacion WHERE id = $1', [id]);
      const [datosOriginales] = consulta.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'ecm_realtime_notificacion',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al modificar el registro con id ${id}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
      }

      await pool.query(
        `
        UPDATE ecm_realtime_notificacion SET visto = $1 WHERE id = $2
        `
        , [visto, id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'ecm_realtime_notificacion',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: `{"visto": "${visto}"}`,
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Vista modificado' });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'Error al modificar el registro.' });
    }
  }



  /** *********************************************************************************************** **
   **                         METODOS PARA LA TABLA DE CONFIGURAR_ALERTAS                                    **
   ** *********************************************************************************************** **/

  // METODO PARA REGISTRAR CONFIGURACIÓN DE RECEPCIÓN DE NOTIFICACIONES
  public async CrearConfiguracion(req: Request, res: Response): Promise<void> {
    try {
      const { id_empleado, vaca_mail, vaca_noti, permiso_mail, permiso_noti, hora_extra_mail,
        hora_extra_noti, comida_mail, comida_noti, comunicado_mail, comunicado_noti, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      const response = await pool.query(
        `
        INSERT INTO eu_configurar_alertas (id_empleado, vacacion_mail, vacacion_notificacion, permiso_mail,
          permiso_notificacion, hora_extra_mail, hora_extra_notificacion, comida_mail, comida_notificacion, comunicado_mail,
        comunicado_notificacion)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *
        `
        , [id_empleado, vaca_mail, vaca_noti,
          permiso_mail, permiso_noti, hora_extra_mail, hora_extra_noti, comida_mail, comida_noti,
          comunicado_mail, comunicado_noti]);

      const [datosNuevos] = response.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eu_configurar_alertas',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: JSON.stringify(datosNuevos),
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      res.jsonp({ message: 'Configuracion guardada' });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      res.status(500).jsonp({ message: 'Error al guardar la configuración.' });
    }
  }

  // METODO PARA ACTUALIZAR CONFIGURACIÓN DE RECEPCIÓN DE NOTIFICACIONES
  public async ActualizarConfigEmpleado(req: Request, res: Response): Promise<Response> {
    try {
      const { vaca_mail, vaca_noti, permiso_mail, permiso_noti, hora_extra_mail,
        hora_extra_noti, comida_mail, comida_noti, comunicado_mail, comunicado_noti, user_name, ip } = req.body;
      const id_empleado = req.params.id;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // OBTENER DATOSORIGINALES
      const consulta = await pool.query('SELECT * FROM eu_configurar_alertas WHERE id_empleado = $1', [id_empleado]);
      const [datosOriginales] = consulta.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eu_configurar_alertas',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al modificar el registro con id ${id_empleado}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
      }

      const actualizacion = await pool.query(
        `
        UPDATE eu_configurar_alertas SET vacacion_mail = $1, vacacion_notificacion = $2, permiso_mail = $3,
          permiso_notificacion = $4, hora_extra_mail = $5, hora_extra_notificacion = $6, comida_mail = $7, 
          comida_notificacion = $8, comunicado_mail = $9, comunicado_notificacion = $10 
        WHERE id_empleado = $11 RETURNING *
        `
        ,
        [vaca_mail, vaca_noti, permiso_mail, permiso_noti, hora_extra_mail, hora_extra_noti,
          comida_mail, comida_noti, comunicado_mail, comunicado_noti, id_empleado]);

      const [datosNuevos] = actualizacion.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eu_configurar_alertas',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: JSON.stringify(datosNuevos),
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Configuración actualizada.' });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'Error al modificar el registro.' });
    }
  }

  /** ******************************************************************************************** **
   ** **                               CONSULTAS DE NOTIFICACIONES                              ** ** 
   ** ******************************************************************************************** **/


  public async ListarNotificacionUsuario(req: Request, res: Response): Promise<any> {
    const id = req.params.id_receive;
    if (id != 'NaN') {
      const REAL_TIME_NOTIFICACION = await pool.query(
        `
        SELECT r.id, r.id_empleado_envia, r.id_empleado_recibe, r.id_departamento_recibe, r.estado, 
          to_char(r.fecha_hora, 'yyyy-MM-dd HH:mi:ss') AS fecha_hora, r.id_permiso, r.id_vacaciones, 
          r.id_hora_extra, r.visto, r.mensaje, r.tipo, e.nombre, e.apellido 
        FROM ecm_realtime_notificacion AS r, eu_empleados AS e 
        WHERE r.id_empleado_recibe = $1 AND e.id = r.id_empleado_envia 
        ORDER BY (visto is FALSE) DESC, id DESC LIMIT 20
        `
        , [id]);
      if (REAL_TIME_NOTIFICACION.rowCount != 0) {
        return res.jsonp(REAL_TIME_NOTIFICACION.rows)
      }
      else {
        return res.status(404).jsonp({ text: 'Registro no encontrado' });
      }
    }
    else {
      return res.status(404).jsonp({ message: 'sin registros' });
    }
  }

  // METODO DE BUSQUEDA DE UNA NOTIFICACION ESPECIFICA
  public async ObtenerUnaNotificacion(req: Request, res: Response): Promise<any> {
    const id = req.params.id;
    const REAL_TIME_NOTIFICACION_VACACIONES = await pool.query(
      `
      SELECT r.id, r.id_empleado_envia, r.id_empleado_recibe, r.id_departamento_recibe, r.estado, 
        r.fecha_hora, r.id_permiso, r.id_vacaciones, r.tipo, r.id_hora_extra, r.visto, 
        r.mensaje, e.nombre, e.apellido 
      FROM ecm_realtime_notificacion AS r, eu_empleados AS e 
      WHERE r.id = $1 AND e.id = r.id_empleado_envia
      `
      , [id]);
    if (REAL_TIME_NOTIFICACION_VACACIONES.rowCount != 0) {
      return res.jsonp(REAL_TIME_NOTIFICACION_VACACIONES.rows[0])
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }

  /** ******************************************************************************************** ** 
   ** **                      METODOS PARA ENVIOS DE COMUNICADOS                                ** ** 
   ** ******************************************************************************************** **/





  // METODO PARA ENVÍO DE CORREO ELECTRÓNICO DE COMUNICADOS MEDIANTE APLICACIÓN MÓVIL  -- verificar si se requiere estado
  public async EnviarCorreoComunicadoMovil(req: Request, res: Response) {

    var tiempo = fechaHora();
    var fecha = await FormatearFecha(tiempo.fecha_formato, dia_completo);
    var hora = await FormatearHora(tiempo.hora);

    const path_folder = path.resolve('logos');

    var datos = await Credenciales(parseInt(req.params.id_empresa));

    const { id_envia, correo, mensaje, asunto } = req.body;

    if (datos === 'ok') {

      const USUARIO_ENVIA = await pool.query(
        `
        SELECT e.id, e.correo, e.nombre, e.apellido, e.cedula,
          e.name_cargo AS cargo, e.name_dep AS departamento
        FROM informacion_general AS e
        WHERE e.id = $1
        `
        ,
        [id_envia]);

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
              El presente correo es para informar el siguiente comunicado: <br>  
            </p>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;" >
              <b>Empresa:</b> ${nombre}<br>
              <b>Asunto:</b> ${asunto} <br>
              <b>Colaborador que envía:</b> ${USUARIO_ENVIA.rows[0].nombre} ${USUARIO_ENVIA.rows[0].apellido} <br>
              <b>Cargo:</b> ${USUARIO_ENVIA.rows[0].cargo} <br>
              <b>Departamento:</b> ${USUARIO_ENVIA.rows[0].departamento} <br>
              <b>Generado mediante:</b> Aplicación Móvil <br>
              <b>Fecha de envío:</b> ${fecha} <br> 
              <b>Hora de envío:</b> ${hora} <br><br>                   
              <b>Mensaje:</b> ${mensaje} <br><br>
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
            path: `${path_folder}/${cabecera_firma}`,
            cid: 'cabeceraf' // VALOR cid COLOCARSE IGUAL EN LA ETIQUETA img src DEL HTML.
          },
          {
            filename: 'pie_firma.jpg',
            path: `${path_folder}/${pie_firma}`,
            cid: 'pief' // VALOR cid COLOCARSE IGUAL EN LA ETIQUETA img src DEL HTML.
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
      res.jsonp({ message: 'Ups! algo salio mal. No fue posible enviar correo electrónico.' });
    }
  }

  /** ***************************************************************************************** **
   ** **                          MANEJO DE COMUNICADOS                                      ** ** 
   ** ***************************************************************************************** **/

  // METODO PARA ENVIO DE CORREO ELECTRONICO DE COMUNICADOS MEDIANTE SISTEMA WEB  -- verificar si se requiere estado
  public async EnviarCorreoComunicado(req: Request, res: Response): Promise<void> {

    var tiempo = fechaHora();
    var fecha = await FormatearFecha(tiempo.fecha_formato, dia_completo);
    var hora = await FormatearHora(tiempo.hora);

    const path_folder = path.resolve('logos');

    var datos = await Credenciales(req.id_empresa);

    const { id_envia, correo, mensaje, asunto } = req.body;

    if (datos === 'ok') {

      const USUARIO_ENVIA = await pool.query(
        `
        SELECT e.id, e.correo, e.nombre, e.apellido, e.cedula,
          e.name_cargo AS cargo, e.name_dep AS departamento 
        FROM informacion_general AS e
        WHERE e.id = $1
        `
        , [id_envia]);

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
              El presente correo es para informar el siguiente comunicado: <br>  
            </p>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;" >
              <b>Empresa:</b> ${nombre}<br>
              <b>Asunto:</b> ${asunto} <br>
              <b>Colaborador que envía:</b> ${USUARIO_ENVIA.rows[0].nombre} ${USUARIO_ENVIA.rows[0].apellido} <br>
              <b>Cargo:</b> ${USUARIO_ENVIA.rows[0].cargo} <br>
              <b>Departamento:</b> ${USUARIO_ENVIA.rows[0].departamento} <br>
              <b>Generado mediante:</b> Aplicación Web <br>
              <b>Fecha de envío:</b> ${fecha} <br> 
              <b>Hora de envío:</b> ${hora} <br><br>                  
              <b>Mensaje:</b> ${mensaje} <br><br>
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
            path: `${path_folder}/${cabecera_firma}`,
            cid: 'cabeceraf' // VALOR cid COLOCARSE IGUAL EN LA ETIQUETA img src DEL HTML.
          },
          {
            filename: 'pie_firma.jpg',
            path: `${path_folder}/${pie_firma}`,
            cid: 'pief' // VALOR cid COLOCARSE IGUAL EN LA ETIQUETA img src DEL HTML.
          }]
      };

      var corr = enviarMail(servidor, parseInt(puerto));
      corr.sendMail(data, function (error: any, info: any) {
        if (error) {
          console.log('error: ', error)
          corr.close();
          return res.jsonp({ message: 'error' });
        } else {
          corr.close();
          return res.jsonp({ message: 'ok' });
        }
      });

    } else {
      res.jsonp({ message: 'Ups!!! algo salio mal. No fue posible enviar correo electrónico.' });
    }
  }

  // NOTIFICACIONES GENERALES
  public async EnviarNotificacionGeneral(req: Request, res: Response): Promise<Response> {
    try {
      let { id_empl_envia, id_empl_recive, mensaje, tipo, user_name, ip, descripcion } = req.body;

      var tiempo = fechaHora();
      let create_at = tiempo.fecha_formato + ' ' + tiempo.hora;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      const response: QueryResult = await pool.query(
        `
        INSERT INTO ecm_realtime_timbres (fecha_hora, id_empleado_envia, id_empleado_recibe, descripcion, tipo, mensaje) 
        VALUES($1, $2, $3, $4, $5, $6) RETURNING *
        `,
        [create_at, id_empl_envia, id_empl_recive, descripcion, tipo, mensaje]);

      const [notificiacion] = response.rows;

      const fechaHoraN = await FormatearHora(create_at.split(' ')[1])
      const fechaN = await FormatearFecha2(create_at, 'ddd')

      notificiacion.fecha_hora = `${fechaN} ${fechaHoraN}`;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'ecm_realtime_timbres',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: JSON.stringify(notificiacion),
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');

      if (!notificiacion) return res.status(400).jsonp({ message: 'Notificación no ingresada.' });

      const USUARIO = await pool.query(
        `
        SELECT (nombre || ' ' || apellido) AS usuario
        FROM eu_empleados WHERE id = $1
        `,
        [id_empl_envia]);

      notificiacion.usuario = USUARIO.rows[0].usuario;

      return res.status(200)
        .jsonp({ message: 'Comunicado enviado exitosamente.', respuesta: notificiacion });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500)
        .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }

  }


  /** ***************************************************************************************** **
   ** **                      MANEJO DE ENVIO DE CORREOS DE SOLICITUDES                      ** ** 
   ** ***************************************************************************************** **/

  // METODO PARA ENVIO DE CORREO ELECTRONICO DE COMUNICADOS MEDIANTE SISTEMA WEB -- veriifcar si se requiere estado
  public async EnviarCorreoSolicitudes(req: Request, res: Response): Promise<void> {

    var tablaHTML = '';
    var tiempo = fechaHora();
    var fecha = await FormatearFecha(tiempo.fecha_formato, dia_completo);
    var hora = await FormatearHora(tiempo.hora);
    var dispositivo = ''

    const path_folder = path.resolve('logos');

    const { id_envia, correo, mensaje, asunto } = req.body.datosCorreo;
    const solicitudes = req.body.solicitudes;

    console.log('req.body.movil: ', req.body.movil);
    if (req.body.movil === true) {
      dispositivo = 'Aprobado desde aplicación móvil';
      var datos = await Credenciales(req.body.id_empresa);
      tablaHTML = await generarTablaHTMLMovil(solicitudes);
    } else {
      dispositivo = 'Aprobado desde la aplicacion web';
      var datos = await Credenciales(req.id_empresa);
      tablaHTML = await generarTablaHTMLWeb(solicitudes);
    }

    if (datos === 'ok') {

      const USUARIO_ENVIA = await pool.query(
        `
        SELECT e.id, e.correo, e.nombre, e.apellido, e.cedula,
          e.name_cargo AS cargo, e.name_dep AS departamento 
        FROM informacion_general AS e
        WHERE e.id = $1 
        `
        , [id_envia]);

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
              El presente correo es para informar el siguiente comunicado: <br>  
            </p>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;" >
              <b>Empresa:</b> ${nombre}<br>
              <b>Asunto:</b> ${asunto} <br>
              <b>Colaborador que envía:</b> ${USUARIO_ENVIA.rows[0].nombre} ${USUARIO_ENVIA.rows[0].apellido} <br>
              <b>Cargo:</b> ${USUARIO_ENVIA.rows[0].cargo} <br>
              <b>Departamento:</b> ${USUARIO_ENVIA.rows[0].departamento} <br>
              <b>Generado mediante:</b> Aplicación Web <br>
              <b>Fecha de envío:</b> ${fecha} <br> 
              <b>Hora de envío:</b> ${hora} <br><br>                  
              <b>Mensaje:</b> ${dispositivo} 
            </p>
            <div style="font-family: Arial; font-size:15px; margin: auto; text-align: center;">
              <p><b>LISTADO DE PERMISOS</b></p>
              ${tablaHTML}
              <br><br>
            </div>
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
            path: `${path_folder}/${cabecera_firma}`,
            cid: 'cabeceraf' // VALOR cid COLOCARSE IGUAL EN LA ETIQUETA img src DEL HTML.
          },
          {
            filename: 'pie_firma.jpg',
            path: `${path_folder}/${pie_firma}`,
            cid: 'pief' // VALOR cid COLOCARSE IGUAL EN LA ETIQUETA img src DEL HTML.
          }]
      };

      var corr = enviarMail(servidor, parseInt(puerto));
      corr.sendMail(data, function (error: any, info: any) {
        if (error) {
          corr.close();
          return res.jsonp({ message: 'error' });
        } else {
          corr.close();
          return res.jsonp({ message: 'ok' });
        }
      });

    } else {
      res.jsonp({ message: 'Ups!!! algo salio mal. No fue posible enviar correo electrónico.' });
    }
  }


  public async getInfoEmpleadoByCodigo(req: Request, res: Response): Promise<Response> {
    try {

      const { codigo } = req.query;

      const query =
        `
            SELECT da.id_departamento,  cn.* , (da.nombre || ' ' || da.apellido) as fullname, da.cedula,
            da.correo, da.codigo, da.estado, da.id_sucursal, da.id_contrato,
            (SELECT cd.nombre FROM ed_departamentos AS cd WHERE cd.id = da.id_departamento) AS ndepartamento,
            (SELECT s.nombre FROM e_sucursales AS s WHERE s.id = da.id_sucursal) AS nsucursal
            FROM datos_actuales_empleado AS da, eu_configurar_alertas AS cn            
            WHERE da.id = ${codigo} AND cn.id_empleado = da.id
            `
      const response: QueryResult = await pool.query(query);
      const [infoEmpleado]: any[] = response.rows;
      console.log("ver", response.rows);

      console.log(infoEmpleado);

      return res.status(200).jsonp(infoEmpleado);
    } catch (error) {
      console.log(error);
      return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
  };

}

const generarTablaHTMLWeb = async function (datos: any[]): Promise<string> {
  let tablaHtml = "<table style='border-collapse: collapse; width: 100%;'>";
  tablaHtml += "<tr style='background-color: #f2f2f2; text-align: center; font-size: 14px;'>";
  tablaHtml += "<th scope='col'>Permiso</th><th scope='col'>Departamento</th><th scope='col'>Empleado</th><th scope='col'>Aprobado</th><th scope='col'>Estado</th><th scope='col'>Observación</th>";
  tablaHtml += "</tr>";

  for (const dato of datos) {
    let colorText = "black";

    if (dato.aprobar === "SI") {
      colorText = "green";
    } else if (dato.aprobar === "NO") {
      colorText = "red";
    }

    tablaHtml += "<tr style='text-align: center; font-size: 14px;'>"
    tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.id}</td>`;
    tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.nombre_depa}</td>`;
    tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.empleado}</td>`;
    tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px; color: ${colorText};'>${dato.aprobar}</td>`;
    tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.estado}</td>`
    tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.observacion}</td>`;
    tablaHtml += "<tr>"
  }

  tablaHtml += "</table>"
  return tablaHtml;
};

const generarTablaHTMLMovil = async function (datos: any[]): Promise<string> {
  let tablaHtml = "<table style='border-collapse: collapse; width: 100%;'>";
  tablaHtml += "<tr style='background-color: #f2f2f2; text-align: center; font-size: 14px;'>";
  tablaHtml += "<th scope='col'>Permiso</th><th scope='col'>Departamento</th><th scope='col'>Empleado</th><th scope='col'>Aprobado</th><th scope='col'>Estado</th><th scope='col'>Observación</th>";
  tablaHtml += "</tr>";

  for (const dato of datos) {
    let colorText = "black";

    if (dato.aprobacion === "SI") {
      colorText = "green";
    } else if (dato.aprobacion === "NO") {
      colorText = "red";
    }

    tablaHtml += "<tr style='text-align: center; font-size: 14px;'>"
    tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.id}</td>`;
    tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.nombre_depa}</td>`;
    tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.nempleado}</td>`;
    tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px; color: ${colorText};'>${dato.aprobacion}</td>`;
    tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.estado}</td>`
    tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.observacion}</td>`;
    tablaHtml += "<tr>"
  }

  tablaHtml += "</table>"
  return tablaHtml;
};


export const NOTIFICACION_TIEMPO_REAL_CONTROLADOR = new NotificacionTiempoRealControlador();

export default NOTIFICACION_TIEMPO_REAL_CONTROLADOR;