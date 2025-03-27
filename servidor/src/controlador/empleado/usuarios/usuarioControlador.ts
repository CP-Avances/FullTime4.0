import {
  enviarMail, email, nombre, cabecera_firma, pie_firma, servidor, puerto, Credenciales, fechaHora,
  FormatearFecha, FormatearHora, dia_completo
} from '../../../libs/settingsMail'
import { Request, Response } from 'express';
import AUDITORIA_CONTROLADOR from '../../reportes/auditoriaControlador';
import path from 'path';
import pool from '../../../database';
import jwt from 'jsonwebtoken';
//IMPORTACIONES PARA APP MOVIL
import { QueryResult } from 'pg';
import { ObtenerRutaLogos } from '../../../libs/accesoCarpetas';

interface IPayload {
  _id: number,
}

class UsuarioControlador {

  // CREAR REGISTRO DE USUARIOS    **USADO
  public async CrearUsuario(req: Request, res: Response) {
    try {
      const { usuario, contrasena, estado, id_rol, id_empleado, user_name, ip, ip_local } = req.body;

      // INCIAR TRANSACCION
      await pool.query('BEGIN');

      const response = await pool.query(
        `
        INSERT INTO eu_usuarios (usuario, contrasena, estado, id_rol, id_empleado) 
          VALUES ($1, $2, $3, $4, $5) RETURNING *
        `
        , [usuario, contrasena, estado, id_rol, id_empleado]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eu_usuarios',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: JSON.stringify(response.rows[0]),
        ip: ip,
        ip_local: ip_local,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      res.jsonp({ message: 'Usuario Guardado' });

    }
    catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.jsonp({ message: 'error' });
    }
  }

  // METODO DE BUSQUEDA DE DATOS DE USUARIO   **USADO
  public async ObtenerDatosUsuario(req: Request, res: Response): Promise<any> {
    const { id_empleado } = req.params;
    const UN_USUARIO = await pool.query(
      `
      SELECT * FROM eu_usuarios WHERE id_empleado = $1
      `
      , [id_empleado]);
    if (UN_USUARIO.rowCount != 0) {
      return res.jsonp(UN_USUARIO.rows);
    }
    else {
      res.status(404).jsonp({ text: 'No se ha encontrado el usuario.' });
    }
  }

  public async ObtenerDepartamentoUsuarios(req: Request, res: Response) {
    const { id_empleado } = req.params;
    const EMPLEADO = await pool.query(
      `
      SELECT e.id_empleado AS id, e.id_departamento, e.id_contrato, ed_departamentos.nombre 
      FROM contrato_cargo_vigente AS e 
      INNER JOIN ed_departamentos ON e.id_departamento = ed_departamentos.id 
      WHERE id_contrato = $1
      `
      , [id_empleado]);
    if (EMPLEADO.rowCount != 0) {
      return res.jsonp(EMPLEADO.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }
  }

  // METODO PARA OBTENER EL ID DEL USUARIO MEDIANTE DEPARTAMENTO VIGENTE DEL USUARIO **USADO
  public async ObtenerIdUsuariosDepartamento(req: Request, res: Response) {
    const { id_departamento } = req.body;
    const Ids = await pool.query(
      `
      SELECT id_empleado AS id
      FROM contrato_cargo_vigente
      WHERE id_departamento = $1
      `
      , [id_departamento]);
    if (Ids.rowCount != 0) {
      return res.jsonp(Ids.rows)
    }
    else {
      return res.jsonp(null);
    }
  }


  // METODO PARA ACTUALIZAR DATOS DE USUARIO   **USADO
  public async ActualizarUsuario(req: Request, res: Response): Promise<Response> {
    try {
      const { usuario, contrasena, id_rol, id_empleado, estado, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const consulta = await pool.query(`SELECT * FROM eu_usuarios WHERE id_empleado = $1`, [id_empleado]);
      const [datosOriginales] = consulta.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eu_usuarios',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al actualizar usuario con id_empleado: ${id_empleado}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
      }

      const datosNuevos = await pool.query(
        `
        UPDATE eu_usuarios SET usuario = $1, contrasena = $2, id_rol = $3, estado = $5 
        WHERE id_empleado = $4 RETURNING *
        `
        , [usuario, contrasena, id_rol, id_empleado, estado]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eu_usuarios',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: JSON.stringify(datosNuevos.rows[0]),
        ip: ip,
        ip_local: ip_local,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro actualizado.' });

    }
    catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' });
    }
  }

  // METODO PARA ACTUALIZAR CONTRASEÑA    **USADO
  public async CambiarPasswordUsuario(req: Request, res: Response): Promise<Response> {
    try {
      const { contrasena, id_empleado, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const consulta = await pool.query(`SELECT * FROM eu_usuarios WHERE id_empleado = $1`, [id_empleado]);
      const [datosOriginales] = consulta.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eu_usuarios',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al actualizar usuario con id_empleado: ${id_empleado}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
      }

      await pool.query(
        `
        UPDATE eu_usuarios SET contrasena = $1 WHERE id_empleado = $2
        `
        , [contrasena, id_empleado]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'usuarios',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: `{contrasena: ${contrasena}}`,
        ip: ip,
        ip_local: ip_local,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro actualizado.' });

    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' });
    }
  }


  // ADMINISTRACION DEL MODULO DE ALIMENTACION
  public async RegistrarAdminComida(req: Request, res: Response): Promise<Response> {
    try {
      const { admin_comida, id_empleado, user_name, ip, ip_local } = req.body;

      const adminComida = await admin_comida.toLowerCase() === 'si' ? true : false;


      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const consulta = await pool.query(`SELECT * FROM eu_usuarios WHERE id_empleado = $1`, [id_empleado]);
      const [datosOriginales] = consulta.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eu_usuarios',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al actualizar usuario con id_empleado: ${id_empleado}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
      }

      const actualizacion = await pool.query(
        `
        UPDATE eu_usuarios SET administra_comida = $1 WHERE id_empleado = $2 RETURNING *
        `
        , [adminComida, id_empleado]);

      const [datosNuevos] = actualizacion.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eu_usuarios',
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
      return res.jsonp({ message: 'Registro guardado.' });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' });
    }
  }

  /** ************************************************************************************* ** 
   ** **                METODO FRASE DE SEGURIDAD ADMINISTRADOR                          ** **
   ** ************************************************************************************* **/

  // METODO PARA GUARDAR FRASE DE SEGURIDAD
  public async ActualizarFrase(req: Request, res: Response): Promise<Response> {
    try {
      const { frase, id_empleado, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const consulta = await pool.query(`SELECT * FROM eu_usuarios WHERE id_empleado = $1`, [id_empleado]);
      const [datosOriginales] = consulta.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eu_usuarios',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al actualizar usuario con id_empleado: ${id_empleado}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
      }

      await pool.query(
        `
        UPDATE eu_usuarios SET frase = $1 WHERE id_empleado = $2
        `
        , [frase, id_empleado]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eu_usuarios',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: `{frase: ${frase}}`,
        ip: ip,
        ip_local: ip_local,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro guardado.' });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' });
    }
  }


  /** ******************************************************************************************** **
   ** **               METODO PARA MANEJAR DATOS DE USUARIOS TIMBRE WEB                         ** **
   ** ******************************************************************************************** **/

  // METODO PARA LEER DATOS GENERALES TIMBRE WEB    **USADO
  public async BuscarUsuariosTimbreWeb(req: Request, res: Response) {
    let estado = req.params.estado;
    let habilitado = req.params.habilitado;
    let respuesta = await pool.query(
      `
      SELECT ig.*, u.usuario, u.web_habilita, u.id AS userid
      FROM informacion_general AS ig, eu_usuarios AS u 
      WHERE ig.estado = $1 AND u.id_empleado = ig.id AND u.web_habilita = $2
      `
      , [estado, habilitado]
    ).then((result: any) => { return result.rows });

    if (respuesta.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' })

    return res.status(200).jsonp(respuesta);
  }

  // METODO PARA ACTUALIZAR ESTADO DE TIMBRE WEB    **USADO
  public async ActualizarEstadoTimbreWeb(req: Request, res: Response) {
    try {
      const { array, web_habilita, user_name, ip, ip_local } = req.body;
      console.log("ver req.body", req.body)
      const ids_empleados = array.map((empl: any) => empl.id);
      console.log("ver ids_empleados", ids_empleados )
      const consulta = await pool.query(`SELECT * FROM eu_usuarios WHERE id_empleado = ANY($1::int[])`, [ids_empleados]);
      const datosOriginales = consulta.rows;
      console.log("ver datos originales: ",  datosOriginales)

      if (array.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registros.' })
      let rowsAffected: number = 0;

      const response: QueryResult = await pool.query(
        `
            UPDATE eu_usuarios SET web_habilita = $1 WHERE id_empleado = ANY($2::int[])
          `
        , [!web_habilita, ids_empleados]);


      rowsAffected = response.rowCount || 0;

      const auditoria = datosOriginales.map((item: any) => (
        {
          tabla: 'eu_usuarios',
          usuario: user_name,
          accion: 'U',
          datosOriginales: JSON.stringify(item),
          datosNuevos: `{"web_habilita": ${!item.web_habilita}}`,
          ip: ip,
          ip_local: ip_local,
          observacion: null
        }
      ));
      await AUDITORIA_CONTROLADOR.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);

      if (rowsAffected > 0) {
        return res.status(200).jsonp({ message: 'Actualización exitosa', rowsAffected })
      }
      else {
        return res.status(404).jsonp({ message: 'error' })
      }
    } catch (error) {
      console.log('Ver error:',error)
      return res.status(500).jsonp({ message: error })
    }
  }


  /** ******************************************************************************************** **
   ** **               METODO PARA MANEJAR DATOS DE USUARIOS TIMBRE MOVIL                       ** **
   ** ******************************************************************************************** **/

  // METODO PARA LEER DATOS GENERALES DE USUARIO TIMBRE MOVIL   **USADO
  public async UsuariosTimbreMovilGeneral(req: Request, res: Response) {
    let estado = req.params.estado;
    let habilitado = req.params.habilitado;

    let respuesta = await pool.query(
      `
      SELECT ig.*, u.usuario, u.app_habilita, u.id AS userid
      FROM informacion_general AS ig, eu_usuarios AS u 
      WHERE ig.estado = $1 AND u.id_empleado = ig.id AND u.app_habilita = $2
      `
      , [estado, habilitado]
    ).then((result: any) => { return result.rows });

    if (respuesta.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' })

    return res.status(200).jsonp(respuesta);
  }


  // METODO PARA LEER DATOS GENERALES DE USUARIO TIMBRE MOVIL   **USADO
  public async accesoMovil(req: Request, res: Response) {
    let id_empleado = req.params.id_empleado;

    let respuesta = await pool.query(
      `
        SELECT u.app_habilita 
        FROM eu_usuarios AS u 
        WHERE u.id_empleado = $1
        `
      , [id_empleado]
    ).then((result: any) => { return result.rows });

    if (respuesta.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' })

    return res.status(200).jsonp(respuesta);
  }

  // METODO PARA ACTUALIZAR ESTADO DE TIMBRE MOVIL    **USADO
  public async ActualizarEstadoTimbreMovil(req: Request, res: Response) {
    try {
      const { array, app_habilita, user_name, ip, ip_local } = req.body;
      console.log("ver req.body", req.body)
      const ids_empleados = array.map((empl: any) => empl.id);
      const consulta = await pool.query(`SELECT * FROM eu_usuarios WHERE id_empleado = ANY($1::int[])`, [ids_empleados]);
      const datosOriginales = consulta.rows;

      if (array.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registros.' })
      let rowsAffected: number = 0;

      const response: QueryResult = await pool.query(
        `
            UPDATE eu_usuarios SET app_habilita = $1 WHERE id_empleado = ANY($2::int[])
          `
        , [!app_habilita, ids_empleados]);


      rowsAffected = response.rowCount || 0;

      const auditoria = datosOriginales.map((item: any) => (
        {
          tabla: 'eu_usuarios',
          usuario: user_name,
          accion: 'U',
          datosOriginales: JSON.stringify(item),
          datosNuevos: `{"app_habilita": ${!item.app_habilita}}`,
          ip: ip,
          ip_local: ip_local,
          observacion: null
        }
      ));
      await AUDITORIA_CONTROLADOR.InsertarAuditoriaPorLotes(auditoria, user_name, ip, ip_local);

      if (rowsAffected > 0) {
        return res.status(200).jsonp({ message: 'Actualización exitosa', rowsAffected })
      }
      else {
        return res.status(404).jsonp({ message: 'error' })
      }
    } catch (error) {
      console.log("ver error: ", error)
      return res.status(500).jsonp({ message: error })
    }
  }

  /** ******************************************************************************************** **
   ** **            METODO PARA MANEJAR DATOS DE REGISTRO DE DISPOSITIVOS MOVILES               ** **
   ** ******************************************************************************************** **/

  // LISTADO DE DISPOSITIVOS REGISTRADOS POR EL ID DE USUARIO
  public async ListarDispositivosMoviles(req: Request, res: Response) {
    try {
      const DISPOSITIVOS = await pool.query(
        `
        SELECT e.codigo, e.id AS id_empleado, (e.nombre || \' \' || e.apellido) AS nombre, e.cedula, d.id_dispositivo, d.modelo_dispositivo
        FROM mrv_dispositivos AS d 
        INNER JOIN eu_empleados AS e ON d.id_empleado = e.id
        ORDER BY nombre
        `
      ).then((result: any) => { return result.rows });

      if (DISPOSITIVOS.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

      return res.status(200).jsonp(DISPOSITIVOS)

    } catch (error) {
      return res.status(500).jsonp({ message: error })
    }
  }

  // METODO PARA ELIMINAR REGISTROS DE DISPOSITIVOS MOVILES    **USADO
  public async EliminarDispositivoMovil(req: Request, res: Response) {
    try {
      const { user_name, ip, ip_local } = req.body;

      const array = req.params.dispositivo;

      let dispositivos = array.split(',');

      if (dispositivos.length === 0) return res.status(400).jsonp({ message: 'No se han encontrado registros.' })

      const nuevo = await Promise.all(dispositivos.map(async (id_dispo: any) => {
        try {
          // INICIAR TRANSACCION
          await pool.query('BEGIN');

          // CONSULTA DATOSORIGINALES
          const consulta = await pool.query(`SELECT * FROM mrv_dispositivos WHERE id_dispositivo = $1`, [id_dispo]);
          const [datosOriginales] = consulta.rows;

          if (!datosOriginales) {
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'mrv_dispositivos',
              usuario: user_name,
              accion: 'D',
              datosOriginales: '',
              datosNuevos: '',
              ip: ip,
              ip_local: ip_local,
              observacion: `Error al eliminar dispositivo con id: ${id_dispo}. Registro no encontrado.`
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.status(404).jsonp({ message: 'Registro no encontrado.' });
          }

          const [result] = await pool.query(
            `
            DELETE FROM mrv_dispositivos WHERE id_dispositivo = $1 RETURNING *
            `
            , [id_dispo])
            .then((result: any) => { return result.rows });

          // AUDITORIA
          await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'mrv_dispositivos',
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
          return result;

        } catch (error) {
          // REVERTIR TRANSACCION
          await pool.query('ROLLBACK');
          return { error: error.toString() }
        }
      }))

      return res.status(200).jsonp({ message: 'Datos eliminados exitosamente.', nuevo });

    } catch (error) {
      return res.status(500).jsonp({ message: error });
    }
  }


  /** ******************************************************************************************************************* **
   ** **                           ENVIAR CORREO PARA CAMBIAR FRASE DE SEGURIDAD                                       ** ** 
   ** ******************************************************************************************************************* **/

  public async RestablecerFrase(req: Request, res: Response) {
    const correo = req.body.correo;
    const url_page = req.body.url_page;

    var tiempo = fechaHora();
    var fecha = await FormatearFecha(tiempo.fecha_formato, dia_completo);
    var hora = await FormatearHora(tiempo.hora);

    // OBTENER RUTA DE LOGOS
    let separador = path.sep;
    const path_folder = ObtenerRutaLogos();

    const correoValido = await pool.query(
      `
      SELECT e.id, e.nombre, e.apellido, e.correo, u.usuario, u.contrasena 
      FROM eu_empleados AS e, eu_usuarios AS u 
      WHERE e.correo = $1 AND u.id_empleado = e.id
      `
      , [correo]);

    if (correoValido.rows[0] == undefined) return res.status(401).send('Correo de usuario no válido.');

    var datos = await Credenciales(1);

    if (datos === 'ok') {

      const token = jwt.sign({ _id: correoValido.rows[0].id }, process.env.TOKEN_SECRET_MAIL || 'llaveEmail',
        { expiresIn: 60 * 5, algorithm: 'HS512' });

      var url = url_page + '/recuperar-frase';

      let data = {
        to: correoValido.rows[0].correo,
        from: email,
        subject: 'FULLTIME CAMBIO FRASE DE SEGURIDAD',
        html:
          `
          <body>
            <div style="text-align: center;">
              <img width="100%" height="100%" src="cid:cabeceraf"/>
            </div>
            <br>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              El presente correo es para informar que se ha enviado un link para cambiar su frase de seguridad. <br>  
            </p>
            <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Empresa:</b> ${nombre} <br>   
              <b>Asunto:</b> CAMBIAR FRASE DE SEGURIDAD <br> 
              <b>Colaborador que envía:</b> ${correoValido.rows[0].nombre} ${correoValido.rows[0].apellido} <br>
              <b>Generado mediante:</b> Aplicación Web <br>
              <b>Fecha de envío:</b> ${fecha} <br> 
              <b>Hora de envío:</b> ${hora} <br><br> 
            </p>
            <h3 style="font-family: Arial; text-align: center;">CAMBIAR FRASE DE SEGURIDAD</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Ingrese al siguiente link y registre una nueva frase de seguridad.</b> <br>   
              <a href="${url}/${token}">${url}/${token}</a>  
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
          console.log('Email error: ' + error);
          corr.close();
          return res.jsonp({ message: 'error' });
        } else {
          console.log('Email sent: ' + info.response);
          corr.close();
          return res.jsonp({ message: 'ok' });
        }
      });
    }
    else {
      res.jsonp({ message: 'Ups!!! algo salio mal. No fue posible enviar correo electrónico.' });
    }
  }

  // METODO PARA CAMBIAR FRASE DE SEGURIDAD
  public async CambiarFrase(req: Request, res: Response): Promise<Response> {
    var token = req.body.token;
    var frase = req.body.frase;
    const { user_name, ip, ip_local } = req.body;
    try {
      const payload = jwt.verify(token, process.env.TOKEN_SECRET_MAIL || 'llaveEmail') as IPayload;
      const id_empleado = payload._id;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTA DATOSORIGINALES
      const consulta = await pool.query(`SELECT * FROM eu_usuarios WHERE id_empleado = $1`, [id_empleado]);
      const [datosOriginales] = consulta.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eu_usuarios',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al actualizar usuario con id: ${id_empleado}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
      }

      await pool.query(
        `
        UPDATE eu_usuarios SET frase = $2 WHERE id_empleado = $1
        `
        , [id_empleado, frase]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eu_usuarios',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: `{"frase": "${frase}"}`,
        ip: ip,
        ip_local: ip_local,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ expiro: 'no', message: "Frase de seguridad actualizada." });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.jsonp({ expiro: 'si', message: "Tiempo para cambiar su frase de seguridad ha expirado." });
    }
  }



  /** ************************************************************************************************** **
   ** **                           METODOS TABLA USUARIO - DEPARTAMENTO                               ** **
   ** ************************************************************************************************** */

  // CREAR REGISTRO DE USUARIOS - DEPARTAMENTO    **USADO
  public async CrearUsuarioDepartamento(req: Request, res: Response) {
    try {
      const { id_empleado, id_departamento, principal, personal, administra, user_name, ip, ip_local } = req.body

      // INICIA TRANSACCION
      await pool.query('BEGIN');

      await pool.query(
        `
        INSERT INTO eu_usuario_departamento (id_empleado, id_departamento, principal, personal, administra) 
        VALUES ($1, $2, $3, $4, $5)
        `
        , [id_empleado, id_departamento, principal, personal, administra]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eu_usuario_departamento',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: `{"id_empleado": ${id_empleado}, "id_departamento": ${id_departamento}, "principal": ${principal}, "personal": ${personal}, "administra": ${administra}}`,
        ip: ip,
        ip_local: ip_local,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      res.jsonp({ message: 'Registro guardado.' });

    }
    catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.jsonp({ message: 'error' });
    }
  }

  // BUSCAR DATOS DE USUARIOS - DEPARTAMENTO - ASIGNACION DE INFORMACION **USADO
  public async BuscarUsuarioDepartamento(req: Request, res: Response) {
    const { id_empleado } = req.body;
    const USUARIOS = await pool.query(
      `
      SELECT ud.id, e.nombre, e.apellido, d.nombre AS departamento, d.id AS id_departamento, 
      s.id AS id_sucursal, s.nombre AS sucursal, ud.principal, ud.personal, ud.administra
      FROM eu_usuario_departamento AS ud
      INNER JOIN eu_empleados AS e ON ud.id_empleado = e.id
      INNER JOIN ed_departamentos AS d ON ud.id_departamento = d.id
      INNER JOIN e_sucursales AS s ON d.id_sucursal = s.id
      WHERE id_empleado = $1
      ORDER BY ud.id ASC
      `
      , [id_empleado]
    );
    if (USUARIOS.rowCount != 0) {
      return res.jsonp(USUARIOS.rows)
    }
    else {
      return res.jsonp(null);
    }
  }

  // BUSCAR TODAS LAS ASIGNACION DE USUARIO - DEPARTAMENTO   **USADO
  public async BuscarAsignacionesUsuario(req: Request, res: Response) {
    const { id_empleado } = req.body;
    const USUARIOS = await pool.query(
      `
        SELECT * FROM eu_usuario_departamento WHERE id_empleado = $1 
        `,
      [id_empleado]
    );
    if (USUARIOS.rowCount != 0) {
      return res.jsonp(USUARIOS.rows)
    }
    else {
      return res.jsonp(null);
    }
  }

  // ACTUALIZAR DATOS DE USUARIOS - DEPARTAMENTO   **USADO
  public async ActualizarUsuarioDepartamento(req: Request, res: Response): Promise<Response> {
    try {
      const { id, id_departamento, principal, personal, administra, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTA DATOSORIGINALES
      const consulta = await pool.query(`SELECT * FROM eu_usuario_departamento WHERE id = $1`, [id]);
      const [datosOriginales] = consulta.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eu_usuario_departamento',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al actualizar registro con id: ${id}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
      }

      const datosActuales = await pool.query(
        `
        UPDATE eu_usuario_departamento SET id_departamento = $2, principal = $3, personal = $4, administra = $5 
        WHERE id = $1 RETURNING *
        `
        , [id, id_departamento, principal, personal, administra]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eu_usuario_departamento',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: JSON.stringify(datosActuales.rows[0]),
        ip: ip,
        ip_local: ip_local,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro actualizado.' });

    }
    catch (error) {
      console.log('error ', error)
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.jsonp({ message: 'error' });
    }
  }

  // METODO PARA ELIMINAR ASIGNACIONES DE USUARIO - DEPARTAMENTO   **USADO
  public async EliminarUsuarioDepartamento(req: Request, res: Response): Promise<Response> {
    try {
      const { user_name, ip, id, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTA DATOSORIGINALES
      const consulta = await pool.query(`SELECT * FROM eu_usuario_departamento WHERE id = $1`, [id]);
      const [datosOriginales] = consulta.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eu_usuario_departamento',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al eliminar eu_usuario_departamento con id: ${id}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
      }

      await pool.query(
        `
        DELETE FROM eu_usuario_departamento WHERE id = $1
        `
        , [id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eu_usuario_departamento',
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
      return res.status(500).jsonp({ message: 'error' });
    }
  }

  // METODO PARA REGISTRAR MULTIPLES ASIGNACIONES DE USUARIO - DEPARTAMENTO    **USADO
  public async RegistrarUsuarioDepartamentoMultiple(req: Request, res: Response) {
    const { usuarios_seleccionados, departamentos_seleccionados, isPersonal, user_name, ip } = req.body;
    let error: boolean = false;

    for (const usuario of usuarios_seleccionados) {
      let datos: Datos = {
        id: '',
        id_empleado: usuario.id,
        id_departamento: '',
        principal: false,
        personal: false,
        administra: false,
        user_name: user_name,
        ip: ip,
      };

      if (isPersonal) {
        datos.id_departamento = usuario.id_departamento;
        const verificacion = await VerificarAsignaciones(datos, true, isPersonal);
        if (verificacion === 2) {
          error = await EditarUsuarioDepartamento(datos);
        }
      }


      for (const departamento of departamentos_seleccionados) {

        datos.id_departamento = departamento.id;
        datos.administra = true;
        datos.principal = false;
        datos.personal = false;
        const verificacion = await VerificarAsignaciones(datos, false, isPersonal);

        switch (verificacion) {
          case 1:
            // INSERTAR NUEVA ASIGNACION
            error = await RegistrarUsuarioDepartamento(datos);
            break;
          case 2:
            // ACTUALIZAR ASIGNACION EXISTENTE
            error = await EditarUsuarioDepartamento(datos);
            break;
        }
      }
    }

    if (error) return res.status(500).jsonp({ message: 'error' });

    return res.json({ message: 'Proceso completado.' });

  }

  //-------------------------------------- METODOS PARA APP_MOVIL ------------------------------------------------

  // BUSCAR EL DISPOSITIVO POR ID DEL EMPLEADO
  public async getidDispositivo(req: Request, res: Response): Promise<Response> {
    try {
      const id_empleado = req.params.id_empleado;
      const response: QueryResult = await pool.query(`SELECT * FROM mrv_dispositivos WHERE id_empleado = ${id_empleado} ORDER BY id ASC `);
      const IdDispositivos = response.rows;
      return res.jsonp(IdDispositivos);
    } catch (error) {
      console.log("error", error);
      return res.status(500).jsonp({
        message: 'Ups! Problemas para conectar con el servidor' +
          '(593) 2 – 252-7663 o https://casapazmino.com.ec'
      });
    }
  };

  // BUSCAR EL DISPOSITIVO POR ID DEL DISPOSITIVO
  public async getDispositivoPorIdDispositivo(req: Request, res: Response): Promise<Response> {
    try {
      const { id_dispositivo } = req.body;
      const response: QueryResult = await pool.query(`SELECT * FROM mrv_dispositivos WHERE id_dispositivo = '${id_dispositivo}'`);
      const idDispositivo = response.rows[0];
      if (response.rows.length === 0) {
        return res.status(404).jsonp({
          message: 'Dispositivo no encontrado'
        });
      }
      return res.jsonp(idDispositivo);
    } catch (error) {
      console.log("error", error);
      return res.status(500).jsonp({
        message: 'Ups! Problemas para conectar con el servidor' +
          '(593) 2 – 252-7663 o https://casapazmino.com.ec'
      });
    }
  };

  // METODO PARA REGISTRAR EL DISPOSITIVO
  public async ingresarIDdispositivo(req: Request, res: Response) {
    try {
      const { id_empleado, id_celular, modelo_dispositivo, user_name, ip, terminos_condiciones, ip_local } = req.body;
      await pool.query('BEGIN');

      const response: QueryResult = await pool.query(
        'INSERT INTO mrv_dispositivos(id_empleado, id_dispositivo, modelo_dispositivo, terminos_condiciones)' +
        'VALUES ($1, $2, $3, $4) RETURNING *',
        [id_empleado, id_celular, modelo_dispositivo, terminos_condiciones]
      )
      const [objetoDispositivos] = response.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: "mrv_dispositivos",
        usuario: user_name,
        accion: "I",
        datosOriginales: "",
        datosNuevos: JSON.stringify(objetoDispositivos),
        ip: ip,
        ip_local: ip_local,
        observacion: null,
      });

      await pool.query('COMMIT');
      if (!Response) return res.status(400).jsonp({ message: "El dispositivo no se Registro" });

      return res.status(200).jsonp({
        body: {
          mensaje: "Celular Registrado ",
          response: response.rowCount
        }
      })
    } catch (error) {
      console.log(error);
      return res.status(500).jsonp({ message: 'Error para registrar el celular, Revise su conexion a la red.' });
    }
  };

  //  METODO PARA OBTENER LOS USUARIOS DE LA EMPRESA
  public async getEmpleadosActivos(req: Request, res: Response): Promise<Response> {
    try {
      const response: QueryResult = await pool.query('SELECT e.cedula, e.codigo,  e.nombre, e.apellido, ' +
        '( e.apellido || \' \' || e.nombre) as fullname, e.correo, e.id, e.telefono, e.id_rol, u.usuario, e.name_rol ' +
        'FROM informacion_general AS e, eu_usuarios AS u WHERE e.id = u.id_empleado AND e.estado = 1 ORDER BY fullname');
      const empleados: any[] = response.rows;
      return res.status(200).jsonp(empleados);
    } catch (error) {
      console.log(error);
      return res.status(500).
        jsonp({
          message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 ' +
            'o https://casapazmino.com.ec'
        });
    }
  };

  // METODO PARA OBTENER LA INFORMACION DEL USUARIO
  public async getUserById(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      const response: QueryResult = await pool.query("SELECT * FROM eu_usuarios WHERE id = $1", [id]);
      const usuarios: any[] = response.rows;
      return res.jsonp(usuarios[0]);
    } catch (error) {
      console.log(error);
      return res.status(500).jsonp({
        message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 ' +
          'o https://casapazmino.com.ec'
      });
    }
  };

}

/* @return
    CASOS DE RETORNO
    0: USUARIO NO EXISTE => NO SE EJECUTA NINGUNA ACCION
    1: NO EXISTE LA ASIGNACION => SE PUEDE ASIGNAR (INSERTAR)
    2: EXISTE LA ASIGNACION Y ES PRINCIPAL => SE ACTUALIZA LA ASIGNACION (PRINCIPAL) 
    3: EXISTE LA ASIGNACION Y NO ES PRINCIPAL => NO SE EJECUTA NINGUNA ACCION  
*/

// METODO PARA VERIFICAR ASIGNACIONES DE INFORMACION
async function VerificarAsignaciones(datos: any, personal: boolean, isPersonal: boolean): Promise<number> {
  const { id_empleado, id_departamento } = datos;
  const consulta = await pool.query(
    `
    SELECT * FROM eu_usuario_departamento WHERE id_empleado = $1 AND id_departamento = $2
    `
    , [id_empleado, id_departamento]);

  if (consulta.rowCount === 0) return 1;
  const asignacion = consulta.rows[0];

  if (asignacion.principal) {
    datos.principal = true;
    datos.id = asignacion.id;
    datos.personal = asignacion.personal;
    if (isPersonal) {
      datos.personal = true;
    }
    if (personal) {
      datos.administra = asignacion.administra;
    }
    return 2;
  }
  return 3;
}

// METODO PARA REGISTRAR UNA ASIGNACION
async function RegistrarUsuarioDepartamento(datos: any): Promise<boolean> {
  try {
    const { id_empleado, id_departamento, principal, personal, administra, user_name, ip, ip_local } = datos;

    // INICIA TRANSACCION
    await pool.query('BEGIN');

    const registro = await pool.query(
      `
      INSERT INTO eu_usuario_departamento (id_empleado, id_departamento, principal, personal, administra) 
      VALUES ($1, $2, $3, $4, $5) RETURNING *
      `
      , [id_empleado, id_departamento, principal, personal, administra]);

    const [datosNuevos] = registro.rows;

    // AUDITORIA
    await AUDITORIA_CONTROLADOR.InsertarAuditoria({
      tabla: 'eu_usuario_departamento',
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
    return false;
  } catch (error) {
    return true;
  }
}

// METODO PARA EDITAR UNA ASIGNACION
async function EditarUsuarioDepartamento(datos: any): Promise<boolean> {
  try {
    const { id_empleado, id_departamento, principal, personal, administra, user_name, ip, ip_local } = datos;

    // INICIAR TRANSACCION
    await pool.query('BEGIN');

    // CONSULTA DATOSORIGINALES
    const consulta = await pool.query(
      `
      SELECT * FROM eu_usuario_departamento WHERE id_empleado = $1 AND id_departamento = $2
      `
      , [id_empleado, id_departamento]);
    const [datosOriginales] = consulta.rows;

    if (!datosOriginales) {
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eu_usuario_departamento',
        usuario: user_name,
        accion: 'U',
        datosOriginales: '',
        datosNuevos: '',
        ip: ip,
        ip_local: ip_local,
        observacion: `Error al actualizar registro con id_empleado: ${id_empleado} y id_departamento: ${id_departamento}. Registro no encontrado.`
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return true;
    }

    const actualizacion = await pool.query(
      `
      UPDATE eu_usuario_departamento SET principal = $3, personal = $4, administra = $5
      WHERE id_empleado = $1 AND id_departamento = $2 RETURNING *
      `
      , [id_empleado, id_departamento, principal, personal, administra]);

    const [datosNuevos] = actualizacion.rows;

    // AUDITORIA
    await AUDITORIA_CONTROLADOR.InsertarAuditoria({
      tabla: 'eu_usuario_departamento',
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
    return false;
  } catch (error) {
    return true;
  }
}

interface Datos {
  id: string;
  id_empleado: string;
  id_departamento: string;
  principal: boolean;
  personal: boolean;
  administra: boolean;
  user_name: string;
  ip: string;
}



export const USUARIO_CONTROLADOR = new UsuarioControlador();

export default USUARIO_CONTROLADOR;