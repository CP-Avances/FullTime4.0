// IMPORTAR LIBRERIAS
import { enviarCorreos, Credenciales, fechaHora, FormatearFecha, FormatearHora, dia_completo } from '../../libs/settingsMail';
import AUDITORIA_CONTROLADOR from '../reportes/auditoriaControlador';
import FUNCIONES_LLAVES from '../llaves/rsa-keys.service';
import { ObtenerRutaLogos } from '../../libs/accesoCarpetas';
import { Request, Response } from 'express';
import ipaddr from 'ipaddr.js';
import pool from '../../database';
import path from 'path';
import jwt from 'jsonwebtoken';

interface IPayload {
  _id: number,
  iat: number,
  exp: number
}

class LoginControlador {

  // METODO PARA VALIDAR DATOS DE ACCESO AL SISTEMA     **USADO
  public async ValidarCredenciales(req: Request, res: Response) {
    // VARIABLE USADO PARA BUSQUEDA DE LICENCIA
    let caducidad_licencia: Date = new Date();

    // OBTENCION DE DIRECCION IP
    const getClientIp = (req: Request): string | null => {
      // OBTIENE LA IP DEL ENCABEZADO O DEL SOCKET
      const rawIp = req.headers['x-forwarded-for']
        ? req.headers['x-forwarded-for'].toString().split(',')[0].trim()
        : req.socket.remoteAddress;

      // VALIDA Y FORMATEA LA IP
      if (rawIp && ipaddr.isValid(rawIp)) {
        const ip = ipaddr.process(rawIp); // NORMALIZA IPV4/IPV6
        return ip.toString(); // DEVUELVE LA IP COMO STRING
      }
      return null; // SI NO ES VALIDA, DEVUELVE NULL
    };
    const ip_cliente = getClientIp(req);
    try {
      const { nombre_usuario, pass, movil } = req.body;
      let pass_encriptado = FUNCIONES_LLAVES.encriptarLogin(pass);
      // BUSQUEDA DE USUARIO
      const USUARIO = await pool.query(
        `
        SELECT id, usuario, id_rol, id_empleado FROM accesoUsuarios($1, $2)
        `
        , [nombre_usuario, pass_encriptado]);

      // SI EXISTE USUARIOS
      if (USUARIO.rowCount != 0) {

        const { id, id_empleado, id_rol, usuario: user } = USUARIO.rows[0];
        let ACTIVO = await pool.query(
          `
            SELECT 
              u.app_habilita, 
              e.estado AS empleado, 
              u.estado AS usuario, 
              e.codigo, 
              e.web_access, 
              e.nombre, 
              e.apellido, 
              e.identificacion, 
              e.imagen
            FROM eu_usuarios AS u
            INNER JOIN eu_empleados AS e ON e.id = u.id_empleado
            WHERE u.id = $1;
          `
          , [USUARIO.rows[0].id])
          .then((result: any) => {
            return result.rows
          });

        const { empleado, usuario, codigo, web_access, nombre, apellido, identificacion, imagen, app_habilita } = ACTIVO[0];
        // SI EL USUARIO NO SE ENCUENTRA ACTIVO
        if (empleado === 2 && usuario === false) {
          return res.jsonp({ message: 'inactivo', text: ip_cliente });
        }
        // SI LOS USUARIOS NO TIENEN PERMISO DE ACCESO
        if (!web_access) return res.status(404).jsonp({ message: "sin_permiso_acceso", text: ip_cliente })

        // SI LOS USUARIOS NO TIENEN PERMISO DE ACCESO A LA APP_MOVIL
        if (!app_habilita && movil == true) return res.jsonp({ message: "sin_permiso_acces_movil", text: ip_cliente })

        // BUSQUEDA DE CLAVE DE LICENCIA
        const EMPRESA = await pool.query(
          `
          SELECT public_key, id AS id_empresa, ruc FROM e_empresa
          `
        );

        // CAMBIAR VALIDACION DE LICENCIA A LA QUE USA EL DIRECCIONAMIENTO
        const { public_key, id_empresa, ruc } = EMPRESA.rows[0];
        // BUSQUEDA DE LICENCIA DE USO DE APLICACION
        const licenciaData = await fetch(`${(process.env.DIRECCIONAMIENTO as string)}/licencia`,
          {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ public_key: public_key })
          });


        if (!licenciaData.ok) {
          return res.status(404).jsonp({ message: 'licencia_no_existe', text: ip_cliente });
        }

        const dataLic = await licenciaData.json();

        const fec_activacion = new Date(dataLic[0].fecha_activacion);
        const fec_desactivacion = new Date(dataLic[0].fecha_desactivacion);

        const hoy = new Date();
        if (hoy > fec_desactivacion) return res.status(404).jsonp({ message: 'licencia_expirada', text: ip_cliente });
        if (hoy < fec_activacion) return res.status(404).jsonp({ message: 'licencia_expirada', text: ip_cliente });
        caducidad_licencia = fec_desactivacion

        // BUSQUEDA DE INFORMACION
        const INFORMACION = await pool.query(
          `
          SELECT cv.id_contrato, cv.id_cargo, cv.id_departamento, d.nombre AS ndepartamento, ec.hora_trabaja,
            d.id_sucursal, s.id_empresa, e.acciones_timbres, e.public_key
          FROM contrato_cargo_vigente AS cv, ed_departamentos AS d, e_sucursales AS s, e_empresa AS e,
            eu_empleado_cargos AS ec
          WHERE cv.id_empleado = $1 AND d.id = cv.id_departamento AND s.id = d.id_sucursal AND ec.id = cv.id_cargo
          `
          , [USUARIO.rows[0].id_empleado]);

        // VALIDACION DE ACCESO CON LICENCIA 
        if (INFORMACION.rowCount != 0) {
          const { id_contrato, id_cargo, id_departamento, acciones_timbres, id_sucursal, id_empresa, public_key: licencia } = INFORMACION.rows[0];
          const expiresIn = movil ? '365d' : 60 * 60 * 23;
          const token = jwt.sign({
            _licencia: licencia,
            codigo: codigo,
            _id: id,
            _id_empleado: id_empleado,
            rol: id_rol,
            _dep: id_departamento,
            _web_access: web_access,
            _acc_tim: acciones_timbres,
            _suc: id_sucursal,
            _empresa: id_empresa,
            cargo: id_cargo,
            ip_adress: ip_cliente,
            id_contrato: id_contrato
          }, process.env.TOKEN_SECRET || 'llaveSecreta', { expiresIn: expiresIn, algorithm: 'HS512' });

          return res.status(200).jsonp({
            caducidad_licencia,
            token,
            usuario: user,
            rol: id_rol,
            empleado: id_empleado,
            departamento: id_departamento,
            acciones_timbres: acciones_timbres,
            sucursal: id_sucursal,
            empresa: id_empresa,
            cargo: id_cargo,
            ip_adress: ip_cliente,
            id_contrato: id_contrato,
            nombre: nombre,
            apellido: apellido,
            identificacion: identificacion,
            imagen: imagen,
            codigo: codigo,
            ruc: ruc,
            version: '4.0.0'
          });
        }
        else {
          // VALIDAR SI EL USUARIO QUE ACCEDE ES ADMINISTRADOR
          if (id_rol === 1) {
            const token = jwt.sign({
              _licencia: public_key, codigo: codigo, _id: id, _id_empleado: id_empleado, rol: id_rol,
              _web_access: web_access, _empresa: id_empresa, ip_adress: ip_cliente
            },
              process.env.TOKEN_SECRET || 'llaveSecreta', { expiresIn: 60 * 60 * 23, algorithm: 'HS512' });
            return res.status(200).jsonp({
              caducidad_licencia, token, usuario: user, rol: id_rol, empleado: id_empleado,
              empresa: id_empresa, ip_adress: ip_cliente
            });
          }
          else {
            return res.jsonp({ message: 'error_', text: ip_cliente });
          }
        }
      }
      else {
        return res.jsonp({ message: 'error', text: ip_cliente });
      }
    } catch (error) {
      console.log('error', error)
      return res.jsonp({ message: 'error', text: ip_cliente });
    }
  }

  // METODO PARA CAMBIAR CONTRASEÑA - ENVIO DE CORREO    **USADO
  public async EnviarCorreoContrasena(req: Request, res: Response) {
    const correo = req.body.correo;
    const url_page = req.body.url_page;
    const identificacion = req.body.identificacion;

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
      WHERE e.correo = $1 AND u.id_empleado = e.id AND e.identificacion = $2 
      `
      , [correo, identificacion]);

    if (correoValido.rows[0] == undefined) return res.status(401).send('Correo o identificación de usuario no válido.');

    var datos = await Credenciales(1);

    if (datos.message === 'ok') {

      const token = jwt.sign({ _id: correoValido.rows[0].id }, process.env.TOKEN_SECRET_MAIL || 'llaveEmail',
        { expiresIn: 60 * 5, algorithm: 'HS512' });

      var url = url_page + '/confirmar-contrasenia';

      let data = {
        to: correoValido.rows[0].correo,
        from: datos.informacion.email,
        subject: 'FULLTIME CAMBIO DE CONTRASEÑA',
        html:
          `
            <body style="font-family: Arial, sans-serif; font-size: 12px; color: rgb(11, 22, 121); line-height: 1.5;">

              <div style="text-align: center; margin: 0; padding: 0;">
                <img src="cid:cabeceraf" alt="Encabezado"
                  style="display: block; width: 100%; height: auto; margin: 0; padding: 0; border: 0;" />
              </div>

              <hr style="border: none; border-top: 1px solid #aaa; margin: 20px 0;" />

              <p>
                El presente correo tiene como finalidad informarle que se ha generado un enlace para cambiar su contraseña de acceso.
              </p>

              <h3 style="text-align: center; color: rgb(11, 22, 121);">DATOS DEL SOLICITANTE</h3>

              <p>
                <strong>Empresa:</strong> ${datos.informacion.nombre} <br>
                <strong>Asunto:</strong> CAMBIAR CONTRASEÑA DE ACCESO <br>
                <strong>Colaborador que envía:</strong> ${correoValido.rows[0].nombre} ${correoValido.rows[0].apellido} <br>
                <strong>Generado mediante:</strong> Aplicación Web <br>
                <strong>Fecha de envío:</strong> ${fecha} <br>
                <strong>Hora de envío:</strong> ${hora} <br>
              </p>
  
              <h3 style="text-align: center; color: rgb(11, 22, 121);">CAMBIAR CONTRASEÑA DE USUARIO</h3>
              
              <p>
                <strong>Por favor, haga clic en el siguiente enlace para registrar una nueva contraseña:</strong><br><br>
                <a href="${url}/${token}" style="color: #0b1679;">${url}/${token}</a>
              </p>

              <hr style="border: none; border-top: 1px solid #aaa; margin: 20px 0;" />

              <p style="color: #555; font-style: italic; font-size: 11px;">
                <strong>Este correo ha sido generado automáticamente. Por favor, no responda a este mensaje.</strong>
              </p>

              <div style="text-align: center; margin: 0; padding: 0;">
                <img src="cid:pief" alt="Pie de página"
                  style="display: block; width: 100%; height: auto; margin: 0; padding: 0; border: 0;" />
              </div>

            </body>

          `
        ,
        attachments: [
          {
            filename: 'cabecera_firma.jpg',
            path: `${path_folder}${separador}${datos.informacion.cabecera_firma}`,
            cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
          },
          {
            filename: 'pie_firma.jpg',
            path: `${path_folder}${separador}${datos.informacion.pie_firma}`,
            cid: 'pief' //COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
          }]
      };

      var corr = enviarCorreos(datos.informacion.servidor, parseInt(datos.informacion.puerto), datos.informacion.email, datos.informacion.pass);
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
      res.jsonp({ message: 'Ups! algo salio mal. No fue posible enviar correo electrónico.' });
    }

  }

  // METODO PARA CAMBIAR CONTRASEÑA
  public async CambiarContrasenia(req: Request, res: Response): Promise<Response> {
    let { token, contrasena, user_name, ip, ip_local } = req.body;

    try {
      let contrasena_encriptada = FUNCIONES_LLAVES.encriptarLogin(contrasena);
      const payload = jwt.verify(token, process.env.TOKEN_SECRET_MAIL || 'llaveEmail') as IPayload;
      const id_empleado = payload._id;
      try {
        // INICIAR TRANSACCION
        await pool.query('BEGIN');

        // OBTENER DATOSORIGINALES
        const consulta = await pool.query(
          `
          SELECT * FROM eu_usuarios WHERE id_empleado = $1
          `
          , [id_empleado]);

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
            observacion: `Error al cambiar la contraseña del usuario con id ${id_empleado}`
          });

          // FINALIZAR TRANSACCION
          await pool.query('COMMIT');
          return res.status(404).jsonp({ message: 'error' });
        }

        await pool.query(
          `
          UPDATE eu_usuarios SET contrasena = $2 WHERE id_empleado = $1
          `
          , [id_empleado, contrasena_encriptada]);

        datosOriginales.contrasena = '';

        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eu_usuarios',
          usuario: user_name,
          accion: 'U',
          datosOriginales: JSON.stringify(datosOriginales),
          datosNuevos: `{"contrasena": "Contraseña actualizada"}`,
          ip: ip,
          ip_local: ip_local,
          observacion: null
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
      } catch (error) {
        // ROLLBACK
        await pool.query('ROLLBACK');
        return res.status(500).jsonp({ message: 'error' });
      }
      return res.jsonp({
        expiro: 'no',
        message: "Contraseña actualizada. Intente ingresar con la nueva contraseña."
      });
    } catch (error) {
      return res.jsonp({
        expiro: 'si',
        message: "Tiempo para cambiar contraseña ha expirado. Vuelva a solicitar cambio de contraseña."
      });
    }
  }

  // METODO PARA AUDITAR INICIO DE SESION    **USADO
  public async RegistrarAuditoriaLogin(req: Request, res: Response) {

    const { plataforma, user_name, ip_addres, ip_addres_local, acceso, observaciones } = req.body;

    const ahora = new Date();
    const fecha = ahora.toISOString().split('T')[0];       // YYYY-MM-DD
    const hora = ahora.toTimeString().split(' ')[0];       // HH:mm:ss

    try {
      await pool.query(
        `
        INSERT INTO audit.acceso_sistema 
          (plataforma, user_name, fecha, hora, acceso, ip_addres, ip_addres_local, observaciones)   
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `
        , [plataforma, user_name, fecha, hora, acceso, ip_addres, ip_addres_local, observaciones]);

      return res.jsonp({ message: 'ok' });

    } catch (err) {
      console.error('Error al registrar auditoría de login:', err);
      res.jsonp({ message: 'Ups! algo salio mal.' });
    }
  }

}

const LOGIN_CONTROLADOR = new LoginControlador();
export default LOGIN_CONTROLADOR;


