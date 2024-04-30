import { Request, Response } from 'express';
import pool from '../../database';
import {
  enviarMail, email, nombre, cabecera_firma, pie_firma, servidor, puerto, fechaHora, Credenciales,
  FormatearFecha, FormatearHora, dia_completo
}
  from '../../libs/settingsMail';

import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';
import path from 'path';
import { QueryResult } from 'pg';

class NotificacionTiempoRealControlador {

  // METODO PARA ELIMINAR NOTIFICACIONES DE PERMISOS - VACACIONES - HORAS EXTRAS  --**VERIFICACION
  public async EliminarMultiplesNotificaciones(req: Request, res: Response): Promise<any> {
    const {arregloNotificaciones, user_name, ip} = req.body;
    let contador: number = 0;

    console.log('VER IDS', arregloNotificaciones);

    if (arregloNotificaciones.length > 0) {
      contador = 0;
      arregloNotificaciones.forEach(async (obj: number) => {

        try {

          // INICIAR TRANSACCION
          await pool.query('BEGIN');

          // OBTENER DATOSORIGINALES
          const consulta = await pool.query('SELECT * FROM realtime_noti WHERE id = $1', [obj]);
          const [datosOriginales] = consulta.rows;

          if (!datosOriginales) {
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'realtime_noti',
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

          await pool.query('DELETE FROM realtime_noti WHERE id = $1', [obj])
            .then((result: any) => {
              contador = contador + 1;
              console.log(result.command, 'REALTIME ELIMINADO ====>', obj);
            });

          // AUDITORIA
          await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'realtime_noti',
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
        SELECT * FROM config_noti WHERE id_empleado = $1
        `
        , [id_empleado]);
      if (CONFIG_NOTI.rowCount > 0) {
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
        INSERT INTO realtime_noti( id_send_empl, id_receives_empl, id_receives_depa, estado, create_at, 
          id_permiso, id_vacaciones, id_hora_extra, mensaje, tipo ) 
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10 ) RETURNING * 
        `,
        [id_send_empl, id_receives_empl, id_receives_depa, estado, create_at, id_permiso, id_vacaciones,
          id_hora_extra, mensaje, tipo]);

      const [notificiacion] = response.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'realtime_noti',
        usuario: user_name,
        accion: 'C',
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
        FROM empleados WHERE id = $1
        `,
        [id_send_empl]);

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

  public async ListarNotificacion(req: Request, res: Response) {
    const REAL_TIME_NOTIFICACION = await pool.query('SELECT * FROM realtime_noti ORDER BY id DESC');

    if (REAL_TIME_NOTIFICACION.rowCount > 0) {
      return res.jsonp(REAL_TIME_NOTIFICACION.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }

  public async ListaPorEmpleado(req: Request, res: Response): Promise<any> {
    const id = req.params.id_send;
    const REAL_TIME_NOTIFICACION = await pool.query('SELECT * FROM realtime_noti WHERE id_send_empl = $1 ' +
      'ORDER BY id DESC', [id]).
      then((result: any) => {
        return result.rows.map((obj: any) => {
          obj
          return obj
        })
      });
    if (REAL_TIME_NOTIFICACION.length > 0) {
      return res.jsonp(REAL_TIME_NOTIFICACION);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }

  public async ListaNotificacionesRecibidas(req: Request, res: Response): Promise<any> {
    const id = req.params.id_receive;
    const REAL_TIME_NOTIFICACION = await pool.query(
      `
        SELECT r.id, r.id_send_empl, r.id_receives_empl, r.id_receives_depa, r.estado, r.create_at, 
          r.id_permiso, r.id_vacaciones, r.id_hora_extra, r.visto, r.mensaje, e.nombre, e.apellido 
        FROM realtime_noti AS r, empleados AS e 
        WHERE r.id_receives_empl = $1 AND e.id = r.id_send_empl ORDER BY id DESC
      `, [id])
      .then((result: any) => {
        return result.rows.map((obj: any) => {
          console.log(obj);
          return {
            id: obj.id,
            id_send_empl: obj.id_send_empl,
            id_receives_empl: obj.id_receives_empl,
            id_receives_depa: obj.id_receives_depa,
            estado: obj.estado,
            create_at: obj.create_at,
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
      const consulta = await pool.query('SELECT * FROM realtime_noti WHERE id = $1', [id]);
      const [datosOriginales] = consulta.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'realtime_noti',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al modificar el registro con id ${id}. No existe el registro en la base de datos.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
      }

      await pool.query('UPDATE realtime_noti SET visto = $1 WHERE id = $2', [visto, id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'realtime_noti',
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
   **                         METODOS PARA LA TABLA DE CONFIG_NOTI                                    **
   ** *********************************************************************************************** **/

  // METODO PARA REGISTRAR CONFIGURACIÓN DE RECEPCIÓN DE NOTIFICACIONES
  public async CrearConfiguracion(req: Request, res: Response): Promise<void> {
    try {
      const { id_empleado, vaca_mail, vaca_noti, permiso_mail, permiso_noti, hora_extra_mail,
        hora_extra_noti, comida_mail, comida_noti, comunicado_mail, comunicado_noti, user_name, ip } = req.body;
      
      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      await pool.query('INSERT INTO config_noti ( id_empleado, vaca_mail, vaca_noti, permiso_mail, ' +
        'permiso_noti, hora_extra_mail, hora_extra_noti, comida_mail, comida_noti, comunicado_mail, ' +
        'comunicado_noti) ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', [id_empleado, vaca_mail, vaca_noti,
        permiso_mail, permiso_noti, hora_extra_mail, hora_extra_noti, comida_mail, comida_noti,
        comunicado_mail, comunicado_noti]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'config_noti',
        usuario: user_name,
        accion: 'C',
        datosOriginales: '',
        datosNuevos: `{"id_empleado": "${id_empleado}", "vaca_mail": "${vaca_mail}", "vaca_noti": "${vaca_noti}", permiso_mail: "${permiso_mail}", permiso_noti: "${permiso_noti}", hora_extra_mail: "${hora_extra_mail}", hora_extra_noti: "${hora_extra_noti}", comida_mail: "${comida_mail}", comida_noti: "${comida_noti}", comunicado_mail: "${comunicado_mail}", comunicado_noti: "${comunicado_noti}"}`,
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
      const consulta = await pool.query('SELECT * FROM config_noti WHERE id_empleado = $1', [id_empleado]);
      const [datosOriginales] = consulta.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'config_noti',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al modificar el registro con id ${id_empleado}. No existe el registro en la base de datos.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
      }

      await pool.query('UPDATE config_noti SET vaca_mail = $1, vaca_noti = $2, permiso_mail = $3, ' +
        'permiso_noti = $4, hora_extra_mail = $5, hora_extra_noti = $6, comida_mail = $7, comida_noti = $8, ' +
        'comunicado_mail = $9, comunicado_noti = $10 WHERE id_empleado = $11',
        [vaca_mail, vaca_noti, permiso_mail, permiso_noti, hora_extra_mail, hora_extra_noti,
          comida_mail, comida_noti, comunicado_mail, comunicado_noti, id_empleado]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'config_noti',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: `{"vaca_mail": "${vaca_mail}", "vaca_noti": "${vaca_noti}", permiso_mail: "${permiso_mail}", permiso_noti: "${permiso_noti}", hora_extra_mail: "${hora_extra_mail}", hora_extra_noti: "${hora_extra_noti}", comida_mail: "${comida_mail}", comida_noti: "${comida_noti}", comunicado_mail: "${comunicado_mail}", comunicado_noti: "${comunicado_noti}"}`,
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
        SELECT r.id, r.id_send_empl, r.id_receives_empl, r.id_receives_depa, r.estado, 
          to_char(r.create_at, 'yyyy-MM-dd HH:mi:ss') AS create_at, r.id_permiso, r.id_vacaciones, 
          r.id_hora_extra, r.visto, r.mensaje, r.tipo, e.nombre, e.apellido 
        FROM realtime_noti AS r, empleados AS e 
        WHERE r.id_receives_empl = $1 AND e.id = r.id_send_empl 
        ORDER BY (visto is FALSE) DESC, id DESC LIMIT 20
        `
        , [id]);
      if (REAL_TIME_NOTIFICACION.rowCount > 0) {
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
      SELECT r.id, r.id_send_empl, r.id_receives_empl, r.id_receives_depa, r.estado, 
      r.create_at, r.id_permiso, r.id_vacaciones, r.tipo, r.id_hora_extra, r.visto, 
      r.mensaje, e.nombre, e.apellido 
      FROM realtime_noti AS r, empleados AS e 
      WHERE r.id = $1 AND e.id = r.id_send_empl
      `
      , [id]);
    if (REAL_TIME_NOTIFICACION_VACACIONES.rowCount > 0) {
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

      const USUARIO_ENVIA = await pool.query('SELECT e.id, e.correo, e.nombre, e.apellido, e.cedula, ' +
        'tc.cargo, d.nombre AS departamento ' +
        'FROM datos_actuales_empleado AS e, empl_cargos AS ec, tipo_cargo AS tc, cg_departamentos AS d ' +
        'WHERE e.id = $1 AND ec.id = e.id_cargo AND tc.id = ec.cargo AND d.id = ec.id_departamento',
        [id_envia]);

      let data = {
        to: correo,
        from: email,
        subject: asunto,
        html: `<body>
                <div style="text-align: center;">
                  <img width="25%" height="25%" src="cid:cabeceraf"/>
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
                <img src="cid:pief" width="50%" height="50%"/>
            </body>
            `,
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
      res.jsonp({ message: 'Ups! algo salio mal!!! No fue posible enviar correo electrónico.' });
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
          tc.cargo, d.nombre AS departamento 
        FROM datos_actuales_empleado AS e, empl_cargos AS ec, tipo_cargo AS tc, cg_departamentos AS d 
        WHERE e.id = $1 AND ec.id = e.id_cargo AND tc.id = ec.cargo AND d.id = ec.id_departamento
        `
        , [id_envia]);

      let data = {
        to: correo,
        from: email,
        subject: asunto,
        html: `<body>
                <div style="text-align: center;">
                  <img width="25%" height="25%" src="cid:cabeceraf"/>
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
                  <b>Generado mediante:</b> Sistema Web <br>
                  <b>Fecha de envío:</b> ${fecha} <br> 
                  <b>Hora de envío:</b> ${hora} <br><br>                  
                  <b>Mensaje:</b> ${mensaje} <br><br>
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
      res.jsonp({ message: 'Ups! algo salio mal!!! No fue posible enviar correo electrónico.' });
    }
  }

  // NOTIFICACIONES GENERALES
  public async EnviarNotificacionGeneral(req: Request, res: Response): Promise<Response> {
    try {
      let { id_empl_envia, id_empl_recive, mensaje, tipo, user_name, ip } = req.body;
      var tiempo = fechaHora();
      let create_at = tiempo.fecha_formato + ' ' + tiempo.hora;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');
  
      const response: QueryResult = await pool.query(
        `
            INSERT INTO realtime_timbres(create_at, id_send_empl, id_receives_empl, descripcion, tipo) 
            VALUES($1, $2, $3, $4, $5) RETURNING *
          `,
        [create_at, id_empl_envia, id_empl_recive, mensaje, tipo]);
  
      const [notificiacion] = response.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'realtime_timbres',
        usuario: user_name,
        accion: 'C',
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
          FROM empleados WHERE id = $1
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

    const { id_envia, correo, mensaje, asunto} = req.body.datosCorreo;
    const solicitudes = req.body.solicitudes;

    console.log('req.body.movil: ',req.body.movil);
    if(req.body.movil === true){
      dispositivo = 'Aprobado desde aplicación móvil';
      var datos = await Credenciales(req.body.id_empresa);
      tablaHTML = await generarTablaHTMLMovil(solicitudes);
    }else{
      dispositivo = 'Aprobado desde la aplicacion web';
      var datos = await Credenciales(req.id_empresa);
      tablaHTML = await generarTablaHTMLWeb(solicitudes);
    }
    
    if (datos === 'ok') {

      const USUARIO_ENVIA = await pool.query(
        `
        SELECT e.id, e.correo, e.nombre, e.apellido, e.cedula,
          tc.cargo, d.nombre AS departamento 
        FROM datos_actuales_empleado AS e, empl_cargos AS ec, tipo_cargo AS tc, cg_departamentos AS d 
        WHERE e.id = $1 AND ec.id = e.id_cargo AND tc.id = ec.cargo AND d.id = ec.id_departamento
        `
        , [id_envia]);

      let data = {
        to: correo,
        from: email,
        subject: asunto,
        html: `<body>
                <div style="text-align: center;">
                  <img width="25%" height="25%" src="cid:cabeceraf"/>
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
                  <b>Generado mediante:</b> Sistema Web <br>
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
                <img src="cid:pief" width="50%" height="50%"/>
              </body>
            `,
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
      res.jsonp({ message: 'Ups! algo salio mal!!! No fue posible enviar correo electrónico.' });
    }
  }

}

const generarTablaHTMLWeb = async function (datos: any []): Promise<string> {
  let tablaHtml = "<table style='border-collapse: collapse; width: 100%;'>";
  tablaHtml += "<tr style='background-color: #f2f2f2; text-align: center; font-size: 14px;'>";
  tablaHtml += "<th scope='col'>Permiso</th><th scope='col'>Departamento</th><th scope='col'>Empleado</th><th scope='col'>Aprobado</th><th scope='col'>Estado</th><th scope='col'>Observación</th>";
  tablaHtml += "</tr>";

    for(const dato of datos){
      let colorText = "black";

      if(dato.aprobar === "SI"){
        colorText = "green";
      }else if(dato.aprobar === "NO"){
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

const generarTablaHTMLMovil = async function (datos: any []): Promise<string> {
  let tablaHtml = "<table style='border-collapse: collapse; width: 100%;'>";
  tablaHtml += "<tr style='background-color: #f2f2f2; text-align: center; font-size: 14px;'>";
  tablaHtml += "<th scope='col'>Permiso</th><th scope='col'>Departamento</th><th scope='col'>Empleado</th><th scope='col'>Aprobado</th><th scope='col'>Estado</th><th scope='col'>Observación</th>";
  tablaHtml += "</tr>";

    for(const dato of datos){
      let colorText = "black";

      if(dato.aprobacion === "SI"){
        colorText = "green";
      }else if(dato.aprobacion === "NO"){
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