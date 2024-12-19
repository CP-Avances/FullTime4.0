import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import {
  enviarMail, email, nombre, cabecera_firma, pie_firma, servidor, puerto, fechaHora, Credenciales,
  FormatearFecha, FormatearHora, dia_completo, FormatearFecha2
}
  from '../../libs/settingsMail';

import AUDITORIA_CONTROLADOR from '../reportes/auditoriaControlador';
import pool from '../../database';
import path from 'path';
import { ObtenerRutaLogos } from '../../libs/accesoCarpetas';

class NotificacionTiempoRealControlador {

  // METODO PARA ELIMINAR NOTIFICACIONES DE PERMISOS - VACACIONES - HORAS EXTRAS  --**VERIFICACION
  public async EliminarMultiplesNotificaciones(req: Request, res: Response): Promise<any> {
    const { arregloNotificaciones, user_name, ip, ip_local } = req.body;
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
              ip: ip,
              ip_local: ip_local,
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
            ip: ip,
            ip_local: ip_local,
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

  // METODO PARA LISTAR CONFIGURACION DE RECEPCION DE NOTIFICACIONES   **USADO
  public async ObtenerConfigEmpleado(req: Request, res: Response): Promise<any> {
    const id_empleado = req.params.id;


    console.log("ver id_empleado", id_empleado)
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
  // METODO PARA LISTAR CONFIGURACION DE RECEPCION DE NOTIFICACIONES   **USADO
  public async ObtenerConfigMultipleEmpleado(req: Request, res: Response): Promise<any> {
    try {
      const { id_empleado } = req.body;

      if (id_empleado) {
        const CONFIG_NOTI = await pool.query(
          `
        SELECT * FROM eu_configurar_alertas WHERE id_empleado = ANY($1::int[])
        `
          , [id_empleado]);
        if (CONFIG_NOTI.rowCount != 0) {
          return res.jsonp({ message: 'OK', respuesta: CONFIG_NOTI.rows });
        }
        else {
          return res.status(404).jsonp({ text: 'Registro no encontrados.' });
        }
      } else {
        res.status(404).jsonp({ text: 'Sin registros encontrados.' });
      }
    } catch (error) {
      console.error('Error al buscar opciones de marcación:', error);
      return res.status(500).jsonp({ message: 'Error interno del servidor' });
    }
  }




  // METODO PARA CREAR NOTIFICACIONES
  public async CrearNotificacion(req: Request, res: Response): Promise<Response> {
    try {
      var tiempo = fechaHora();

      const { id_send_empl, id_receives_empl, id_receives_depa, estado, id_permiso,
        id_vacaciones, id_hora_extra, mensaje, tipo, user_name, ip, ip_local } = req.body;

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
        ip: ip,
        ip_local: ip_local,
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
      console.log("Ver Error notificacion", error)
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
      const { visto, user_name, ip, ip_local } = req.body;
      console.log("ver parametros", req.body)

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
          ip: ip,
          ip_local: ip_local,
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
        ip: ip,
        ip_local: ip_local,
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

  // METODO PARA REGISTRAR CONFIGURACION DE RECEPCION DE NOTIFICACIONES
  public async CrearConfiguracion(req: Request, res: Response): Promise<void> {
    try {
      const { id_empleado, vaca_mail, vaca_noti, permiso_mail, permiso_noti, hora_extra_mail,
        hora_extra_noti, comida_mail, comida_noti, comunicado_mail, comunicado_noti, user_name, ip, ip_local } = req.body;

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
        ip: ip,
        ip_local: ip_local,
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

  // METODO PARA REGISTRAR CONFIGURACION DE RECEPCION DE NOTIFICACIONES
  public async CrearConfiguracionMultiple(req: Request, res: Response): Promise<void> {
    try {
      const { id_empleado, vaca_mail, vaca_noti, permiso_mail, permiso_noti, hora_extra_mail,
        hora_extra_noti, comida_mail, comida_noti, comunicado_mail, comunicado_noti, user_name, ip, ip_local } = req.body;

      const batchSize = 1000; // Tamaño del lote (ajustable según la capacidad de la base de datos)
      const batches = [];
      for (let i = 0; i < id_empleado.length; i += batchSize) {
        batches.push(id_empleado.slice(i, i + batchSize));
      }
      // INICIAR TRANSACCION
      await pool.query('BEGIN');
      for (const batch of batches) {
        const valores = batch
          .map((id: number) => `(${id}, ${vaca_mail}, ${vaca_noti}, ${permiso_mail}, ${permiso_noti}, 
                ${hora_extra_mail}, ${hora_extra_noti}, ${comida_mail}, ${comida_noti}, 
                ${comunicado_mail}, ${comunicado_noti})`)
          .join(', ');

        // Ejecutar la inserción en cada lote
        await pool.query(
          `INSERT INTO eu_configurar_alertas (
                id_empleado, vacacion_mail, vacacion_notificacion, permiso_mail,
                permiso_notificacion, hora_extra_mail, hora_extra_notificacion, comida_mail,
                comida_notificacion, comunicado_mail, comunicado_notificacion
            ) VALUES ${valores}`
        );
      }

      // Generar datos para la auditoría
      const auditoria = id_empleado.map((id: number) => ({
        tabla: 'eu_configurar_alertas',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: JSON.stringify({
          id_empleado: id,
          vacacion_mail: vaca_mail,
          vacacion_notificacion: vaca_noti,
          permiso_mail: permiso_mail,
          permiso_notificacion: permiso_noti,
          hora_extra_mail: hora_extra_mail,
          hora_extra_notificacion: hora_extra_noti,
          comida_mail: comida_mail,
          comida_notificacion: comida_noti,
          comunicado_mail: comunicado_mail,
          comunicado_notificacion: comunicado_noti
        }),
        ip,
        ip_local: ip_local,
        observacion: null
      }));

      await AUDITORIA_CONTROLADOR.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);

      await pool.query('COMMIT'); // Finalizar transacción

      res.jsonp({ message: 'Configuración guardada exitosamente' });


    } catch (error) {
      console.error('Error en CrearConfiguracion:', error);
      await pool.query('ROLLBACK'); // Revertir transacción en caso de error
      res.status(500).jsonp({ message: 'Error al guardar la configuración.' });
    }
  }


  // METODO PARA ACTUALIZAR CONFIGURACION DE RECEPCION DE NOTIFICACIONES   **USADO
  public async ActualizarConfigEmpleado(req: Request, res: Response): Promise<Response> {
    try {
      const { vaca_mail, vaca_noti, permiso_mail, permiso_noti, hora_extra_mail,
        hora_extra_noti, comida_mail, comida_noti, comunicado_mail, comunicado_noti, user_name, ip, ip_local } = req.body;
      const id_empleado = req.params.id;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // OBTENER DATOSORIGINALES
      const consulta = await pool.query(`SELECT * FROM eu_configurar_alertas WHERE id_empleado = $1`, [id_empleado]);
      const [datosOriginales] = consulta.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eu_configurar_alertas',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
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
        ip: ip,
        ip_local: ip_local,
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


  public async ActualizarConfigEmpleadoMultiple(req: Request, res: Response): Promise<Response> {
    try {
      const { id_empleado, vaca_mail, vaca_noti, permiso_mail, permiso_noti, hora_extra_mail,
        hora_extra_noti, comida_mail, comida_noti, comunicado_mail, comunicado_noti, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // OBTENER DATOSORIGINALES
      const consulta = await pool.query(`SELECT * FROM eu_configurar_alertas WHERE id_empleado = ANY($1::int[])`, [id_empleado]);
      const datosOriginales = consulta.rows;

      let rowsAffected: number = 0;
      const actualizacion: QueryResult = await pool.query(
        `
        UPDATE eu_configurar_alertas SET vacacion_mail = $1, vacacion_notificacion = $2, permiso_mail = $3,
          permiso_notificacion = $4, hora_extra_mail = $5, hora_extra_notificacion = $6, comida_mail = $7, 
          comida_notificacion = $8, comunicado_mail = $9, comunicado_notificacion = $10 
        WHERE id_empleado = ANY($11::int[]) 
        `
        ,
        [vaca_mail, vaca_noti, permiso_mail, permiso_noti, hora_extra_mail, hora_extra_noti,
          comida_mail, comida_noti, comunicado_mail, comunicado_noti, id_empleado]);

      rowsAffected = actualizacion.rowCount || 0;

      const auditoria = datosOriginales.map((item: any) => {
        // Crear una copia del objeto item para modificarlo
        const itemModificado = {
          ...item, vacacion_mail: vaca_mail, vacacion_notificacion: vaca_noti, permiso_mail: permiso_mail,
          permiso_notificacion: permiso_noti, hora_extra_mail: hora_extra_mail, hora_extra_notificacion: hora_extra_noti, comida_mail: comida_mail,
          comida_notificacion: comida_noti, comunicado_mail: comunicado_mail, comunicado_notificacion: comunicado_noti
        }; // Cambiar los valores deseados

        return {
          tabla: 'eu_configurar_alertas',
          usuario: user_name,
          accion: 'U',
          datosOriginales: JSON.stringify(item), // Objeto original como JSON
          datosNuevos: JSON.stringify(itemModificado), // Objeto modificado como JSON
          ip: ip,
          ip_local: ip_local,
          observacion: null
        };
      });

      await AUDITORIA_CONTROLADOR.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);


      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');

      if (rowsAffected > 0) {
        return res.status(200).jsonp({ message: 'Actualización exitosa', rowsAffected })
      }
      else {
        return res.status(404).jsonp({ message: 'error' })
      }
    } catch (error) {
      // REVERTIR TRANSACCION
      console.log("ver el error: ", error)

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

    // OBTENER RUTA DE LOGOS
    let separador = path.sep;
    const path_folder = ObtenerRutaLogos();

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
            path: `${path_folder}${separador}${cabecera_firma}`,
            cid: 'cabeceraf' // VALOR cid COLOCARSE IGUAL EN LA ETIQUETA img src DEL HTML.
          },
          {
            filename: 'pie_firma.jpg',
            path: `${path_folder}${separador}${pie_firma}`,
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

  // METODO PARA ENVIO DE CORREO ELECTRONICO DE COMUNICADOS MEDIANTE SISTEMA WEB      **USADO
  public async EnviarCorreoComunicado(req: Request, res: Response): Promise<void> {

    var tiempo = fechaHora();
    var fecha = await FormatearFecha(tiempo.fecha_formato, dia_completo);
    var hora = await FormatearHora(tiempo.hora);

    // OBTENER RUTA DE LOGOS
    let separador = path.sep;
    const path_folder = ObtenerRutaLogos();

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
            path: `${path_folder}${separador}${cabecera_firma}`,
            cid: 'cabeceraf' // VALOR cid COLOCARSE IGUAL EN LA ETIQUETA img src DEL HTML.
          },
          {
            filename: 'pie_firma.jpg',
            path: `${path_folder}${separador}${pie_firma}`,
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
  public async EnviarNotificacionGeneral(req: Request, res: Response): Promise<Response> {
    try {
      let { id_empl_envia, id_empl_recive, mensaje, tipo, user_name, ip, descripcion, ip_local } = req.body;

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
        ip: ip,
        ip_local: ip_local,
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
        , [id_empl_envia]);

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


  // NOTIFICACIONES GENERALES    **USADO
  public async EnviarNotificacionGeneralMultiple(req: Request, res: Response): Promise<any> {

    const client = await pool.connect(); // Obtener un cliente para la transacción

    try {
      let { id_empl_envia, id_empl_recive, mensaje, tipo, user_name, ip, descripcion, ip_local } = req.body;


      const id_empleados = Array.isArray(id_empl_recive) ? id_empl_recive : [id_empl_recive];
      const batchSize = 1000; // Tamaño del lote (ajustable según la capacidad de tu base de datos)
      const batches = [];

      for (let i = 0; i < id_empleados.length; i += batchSize) {
        batches.push(id_empleados.slice(i, i + batchSize));
      }

      var tiempo = fechaHora();
      let create_at = tiempo.fecha_formato + ' ' + tiempo.hora;


      await client.query('BEGIN');
      const resultados = []; // Aquí almacenaremos los resultados

      for (const batch of batches) {
        const valores = batch
          .map((id_empleado: number) => `('${create_at}', ${id_empl_envia}, ${id_empleado}, '${descripcion}', '${tipo}', '${mensaje}')`)
          .join(', ');


        // Ejecutar la inserción en cada lote
        const response = await client.query(
          ` INSERT INTO ecm_realtime_timbres (fecha_hora, id_empleado_envia, id_empleado_recibe, descripcion, 
          tipo, mensaje) VALUES ${valores} RETURNING *`
        );

        resultados.push(...response.rows); // Agregar las filas insertadas al arreglo

      }
      const fechaHoraN = await FormatearHora(create_at.split(' ')[1])
      const fechaN = await FormatearFecha2(create_at, 'ddd')
      const auditoria = id_empleados.map((id_empleado_recibe: any) => ({
        tabla: 'ecm_realtime_timbres',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: `{id_empleado_envia: ${id_empl_envia}, id_empleado_recibe: ${id_empleado_recibe},fecha_hora: ${fechaN + ' ' + fechaHoraN}, descripcion: ${descripcion}, mensaje: ${mensaje}, tipo: ${tipo}}`,
        ip: ip,
        ip_local: ip_local,
        observacion: null
      }));
      await AUDITORIA_CONTROLADOR.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);

      const USUARIO = await pool.query(
        `
        SELECT (nombre || ' ' || apellido) AS usuario
        FROM eu_empleados WHERE id = $1
        `
        , [id_empl_envia]);

      const usuario = USUARIO.rows[0].usuario;
      resultados.map(async (notificiacion: any) => {
        notificiacion.usuario = usuario;
        notificiacion.fecha_hora = `${fechaN} ${fechaHoraN}`;
      })
      // FINALIZAR TRANSACCION
      await client.query('COMMIT');
      return res.status(200)
        .jsonp({ message: 'Comunicado enviado exitosamente.', respuesta: resultados });
    } catch (error) {
      // REVERTIR TRANSACCION
      console.log("ver el error: ", error)
      await pool.query('ROLLBACK');
      return res.status(500)
        .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    } finally {
      client.release(); // Liberar el cliente al final
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

    // OBTENER RUTA DE LOGOS
    let separador = path.sep;
    const path_folder = ObtenerRutaLogos();

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
            path: `${path_folder}${separador}${cabecera_firma}`,
            cid: 'cabeceraf' // VALOR cid COLOCARSE IGUAL EN LA ETIQUETA img src DEL HTML.
          },
          {
            filename: 'pie_firma.jpg',
            path: `${path_folder}${separador}${pie_firma}`,
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

  //------------------------ METODOS PARA APP MOVIL ---------------------------------------------------------------

  // METODO PARA OBTENER LA INFORMACION GENERAL DEL EMPLEADO POR SU CODIGO
  public async getInfoEmpleadoByCodigo(req: Request, res: Response): Promise<Response> {
    try {

      const { codigo } = req.query;

      const query =
        `
            SELECT da.id_depa,  cn.* , (da.nombre || ' ' || da.apellido) as fullname, da.cedula,
            da.correo, da.codigo, da.estado, da.id_suc, da.id_contrato,
            (SELECT cd.nombre FROM ed_departamentos AS cd WHERE cd.id = da.id_depa) AS ndepartamento,
            (SELECT s.nombre FROM e_sucursales AS s WHERE s.id = da.id_suc) AS nsucursal
            FROM informacion_general AS da, eu_configurar_alertas AS cn            
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

  // METODO PARA OBTENER LAS NOTIFICACIONES
  public async getNotificacion(req: Request, res: Response): Promise<Response> {
    try {
      const { id_empleado } = req.query;
      const subquery1 = `( select (i.nombre || ' ' || i.apellido) from eu_empleados i where i.id = r.id_empleado_envia ) as nempleadosend`
      const subquery2 = `( select (i.nombre || ' ' || i.apellido) from eu_empleados i where i.id = r.id_empleado_recibe ) as nempleadoreceives`
      const query = `SELECT r.*, ${subquery1}, ${subquery2} FROM ecm_realtime_notificacion r WHERE r.id_empleado_recibe = ${id_empleado} ORDER BY r.fecha_hora DESC LIMIT 40`

      const response: QueryResult = await pool.query(query);
      const notificacion: any[] = response.rows;

      return res.status(200).jsonp(notificacion);
    } catch (error) {
      console.log(error);
      return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
  };

  // METODO PARA OBTENER LAS NOTIFICACIONES TIMBRES
  public async getNotificacionTimbres(req: Request, res: Response): Promise<Response> {
    try {
      const { id_empleado } = req.query;
      const subquery1 = `( select (i.nombre || ' ' || i.apellido) from eu_empleados i where i.id = r.id_empleado_envia ) as nempleadosend`
      const subquery2 = `( select (i.nombre || ' ' || i.apellido) from eu_empleados i where i.id = r.id_empleado_recibe ) as nempleadoreceives`
      const query = `SELECT r.id, r.fecha_hora, r.id_empleado_envia, r.id_empleado_recibe,r.visto, r.descripcion as mensaje, r.id_timbre, r.tipo, ${subquery1}, ${subquery2} FROM ecm_realtime_timbres r WHERE r.id_empleado_recibe = ${id_empleado} ORDER BY r.fecha_hora DESC LIMIT 60`
      const response: QueryResult = await pool.query(query);
      const notificacion: any[] = response.rows;
      console.log("ver notificacion: ", notificacion)
      return res.status(200).jsonp(notificacion);
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