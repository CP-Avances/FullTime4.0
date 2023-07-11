import { Request, Response } from 'express';
import pool from '../../database';
import {
  enviarMail, email, nombre, cabecera_firma, pie_firma, servidor, puerto, fechaHora, Credenciales,
  FormatearFecha, FormatearHora, dia_completo
}
  from '../../libs/settingsMail';
import path from 'path';
import { QueryResult } from 'pg';

class NotificacionTiempoRealControlador {

  // METODO PARA ELIMINAR NOTIFICACIONES DE PERMISOS - VACACIONES - HORAS EXTRAS  --**VERIFICACION
  public async EliminarMultiplesNotificaciones(req: Request, res: Response): Promise<any> {
    const arregloNotificaciones = req.body;
    let contador: number = 0;

    console.log('VER IDS', arregloNotificaciones);

    if (arregloNotificaciones.length > 0) {
      contador = 0;
      arregloNotificaciones.forEach(async (obj: number) => {
        await pool.query('DELETE FROM realtime_noti WHERE id = $1', [obj])
          .then((result: any) => {
            contador = contador + 1;
            if (contador === arregloNotificaciones.length) {
              return res.jsonp({ message: 'OK' });
            }
            console.log(result.command, 'REALTIME ELIMINADO ====>', obj);
          });
      });
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
        id_vacaciones, id_hora_extra, mensaje, tipo } = req.body;

      let create_at = tiempo.fecha_formato + ' ' + tiempo.hora;

      const response: QueryResult = await pool.query(
        `
        INSERT INTO realtime_noti( id_send_empl, id_receives_empl, id_receives_depa, estado, create_at, 
          id_permiso, id_vacaciones, id_hora_extra, mensaje, tipo ) 
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10 ) RETURNING * 
        `,
        [id_send_empl, id_receives_empl, id_receives_depa, estado, create_at, id_permiso, id_vacaciones,
          id_hora_extra, mensaje, tipo]);

      const [notificiacion] = response.rows;

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






  public async ActualizarVista(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    const { visto } = req.body;
    await pool.query('UPDATE realtime_noti SET visto = $1 WHERE id = $2', [visto, id]);
    res.jsonp({ message: 'Vista modificado' });
  }



  /** *********************************************************************************************** **
   **                         METODOS PARA LA TABLA DE CONFIG_NOTI                                    **
   ** *********************************************************************************************** **/

  // METODO PARA REGISTRAR CONFIGURACIÓN DE RECEPCIÓN DE NOTIFICACIONES
  public async CrearConfiguracion(req: Request, res: Response): Promise<void> {
    const { id_empleado, vaca_mail, vaca_noti, permiso_mail, permiso_noti, hora_extra_mail,
      hora_extra_noti, comida_mail, comida_noti, comunicado_mail, comunicado_noti } = req.body;
    await pool.query('INSERT INTO config_noti ( id_empleado, vaca_mail, vaca_noti, permiso_mail, ' +
      'permiso_noti, hora_extra_mail, hora_extra_noti, comida_mail, comida_noti, comunicado_mail, ' +
      'comunicado_noti) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', [id_empleado, vaca_mail, vaca_noti,
      permiso_mail, permiso_noti, hora_extra_mail, hora_extra_noti, comida_mail, comida_noti,
      comunicado_mail, comunicado_noti]);
    res.jsonp({ message: 'Configuracion guardada' });
  }


  // METODO PARA ACTUALIZAR CONFIGURACIÓN DE RECEPCIÓN DE NOTIFICACIONES
  public async ActualizarConfigEmpleado(req: Request, res: Response): Promise<void> {
    const { vaca_mail, vaca_noti, permiso_mail, permiso_noti, hora_extra_mail,
      hora_extra_noti, comida_mail, comida_noti, comunicado_mail, comunicado_noti } = req.body;
    const id_empleado = req.params.id;
    await pool.query('UPDATE config_noti SET vaca_mail = $1, vaca_noti = $2, permiso_mail = $3, ' +
      'permiso_noti = $4, hora_extra_mail = $5, hora_extra_noti = $6, comida_mail = $7, comida_noti = $8, ' +
      'comunicado_mail = $9, comunicado_noti = $10 WHERE id_empleado = $11',
      [vaca_mail, vaca_noti, permiso_mail, permiso_noti, hora_extra_mail, hora_extra_noti,
        comida_mail, comida_noti, comunicado_mail, comunicado_noti, id_empleado]);
    res.jsonp({ message: 'Configuración actualizada.' });
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





  // METODO PARA ENVÍO DE CORREO ELECTRÓNICO DE COMUNICADOS MEDIANTE APLICACIÓN MÓVIL
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

  // METODO PARA ENVIO DE CORREO ELECTRONICO DE COMUNICADOS MEDIANTE SISTEMA WEB
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
    let { id_empl_envia, id_empl_recive, mensaje, tipo } = req.body;
    var tiempo = fechaHora();
    let create_at = tiempo.fecha_formato + ' ' + tiempo.hora;

    const response: QueryResult = await pool.query(
      `
          INSERT INTO realtime_timbres(create_at, id_send_empl, id_receives_empl, descripcion, tipo) 
          VALUES($1, $2, $3, $4, $5) RETURNING *
        `,
      [create_at, id_empl_envia, id_empl_recive, mensaje, tipo]);

    const [notificiacion] = response.rows;

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

  }


  /** ***************************************************************************************** **
   ** **                      MANEJO DE ENVIO DE CORREOS DE SOLICITUDES                      ** ** 
   ** ***************************************************************************************** **/

  // METODO PARA ENVIO DE CORREO ELECTRONICO DE COMUNICADOS MEDIANTE SISTEMA WEB
  public async EnviarCorreoSolicitudes(req: Request, res: Response): Promise<void> {

    var tiempo = fechaHora();
    var fecha = await FormatearFecha(tiempo.fecha_formato, dia_completo);
    var hora = await FormatearHora(tiempo.hora);

    const path_folder = path.resolve('logos');

    var datos = await Credenciales(req.id_empresa);

    //const { id_envia, correo, mensaje, asunto} = req.body;
    const array = req.body

    //console.log('id_envia: ',id_envia);
    //console.log('correo: ',correo);
    //console.log('mensaje: ',mensaje);
    //console.log('asunto: ',asunto);
    console.log('permisos: ',array);

    /*
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
                  <b>Mensaje:</b> 
                    <table class="table table-hover table-sm">
                      <thead class="thead-light">
                        <tr style="text-align: center;">
                          <th scope="col">Permiso #</th>
                          <th scope="col">Departamento</th>
                          <th scope="col">Empleado</th>
                          <th scope="col">Estado</th>
                          <th scope="col">Aprobar</th>
                          <th scope="col">Observación</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let dato of solicitudes>
                          <td>{{dato.id}}</td>
                          <td>{{dato.nombre_depa}}</td>
                          <td>{{dato.empleado}}</td>
                          <td>{{dato.estado}}</td>
                          <td>
                            <p *ngIf="dato.aprobar == 'NO'" style="color: rgb(189, 8, 8);">{{dato.aprobar}}</p>
                            <p *ngIf="dato.aprobar == 'SI'" style="color: rgb(3, 146, 53);">{{dato.aprobar}}</p>
                          </td>
                        <td>{{dato.observacion}}</td>
                        </tr>
                      </tbody>
                    </table>
                  <br><br>
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
          return res.jsonp({ message: 'error' });
        } else {
          corr.close();
          return res.jsonp({ message: 'ok' });
        }
      });

    } else {
      res.jsonp({ message: 'Ups! algo salio mal!!! No fue posible enviar correo electrónico.' });
    }*/
  }


}

export const NOTIFICACION_TIEMPO_REAL_CONTROLADOR = new NotificacionTiempoRealControlador();

export default NOTIFICACION_TIEMPO_REAL_CONTROLADOR;