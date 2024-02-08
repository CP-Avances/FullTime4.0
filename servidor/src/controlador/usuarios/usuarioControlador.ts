import {
  enviarMail, email, nombre, cabecera_firma, pie_firma, servidor, puerto, Credenciales, fechaHora,
  FormatearFecha, FormatearHora, dia_completo
} from '../../libs/settingsMail'
import { Request, Response } from 'express';
import path from 'path';
import pool from '../../database';
import jwt from 'jsonwebtoken';

interface IPayload {
  _id: number,
}

class UsuarioControlador {

  // CREAR REGISTRO DE USUARIOS
  public async CrearUsuario(req: Request, res: Response) {
    try {
      const { usuario, contrasena, estado, id_rol, id_empleado } = req.body;
      await pool.query(
        `
        INSERT INTO usuarios (usuario, contrasena, estado, id_rol, id_empleado) 
        VALUES ($1, $2, $3, $4, $5)
        `
        , [usuario, contrasena, estado, id_rol, id_empleado]);

      res.jsonp({ message: 'Usuario Guardado' });
    }
    catch (error) {
      return res.jsonp({ message: 'error' });
    }
  }

  // METODO DE BUSQUEDA DE DATOS DE USUARIO
  public async ObtenerDatosUsuario(req: Request, res: Response): Promise<any> {
    const { id_empleado } = req.params;
    const UN_USUARIO = await pool.query(
      `
      SELECT * FROM usuarios WHERE id_empleado = $1
      `
      , [id_empleado]);
    if (UN_USUARIO.rowCount > 0) {
      return res.jsonp(UN_USUARIO.rows);
    }
    else {
      res.status(404).jsonp({ text: 'No se ha encontrado el usuario' });
    }
  }

  public async ObtenerDepartamentoUsuarios(req: Request, res: Response) {
    const { id_empleado } = req.params;
    const EMPLEADO = await pool.query(
      `
      SELECT e.id, e.id_departamento, e.id_contrato, cg_departamentos.nombre FROM datos_actuales_empleado AS e 
      INNER JOIN cg_departamentos ON e.id_departamento = cg_departamentos.id 
      WHERE id_contrato = $1
      `
      , [id_empleado]);
    if (EMPLEADO.rowCount > 0) {
      return res.jsonp(EMPLEADO.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registros no encontrados' });
    }
  }


  // METODO PARA ACTUALIZAR DATOS DE USUARIO
  public async ActualizarUsuario(req: Request, res: Response) {
    try {
      const { usuario, contrasena, id_rol, id_empleado } = req.body;
      await pool.query(
        `
        UPDATE usuarios SET usuario = $1, contrasena = $2, id_rol = $3 WHERE id_empleado = $4
        `
        , [usuario, contrasena, id_rol, id_empleado]);
      res.jsonp({ message: 'Registro actualizado.' });
    }
    catch (error) {
      return res.jsonp({ message: 'error' });
    }
  }

  // METODO PARA ACTUALIZAR CONTRASEÑA
  public async CambiarPasswordUsuario(req: Request, res: Response): Promise<any> {
    const { contrasena, id_empleado } = req.body;
    await pool.query(
      `
      UPDATE usuarios SET contrasena = $1 WHERE id_empleado = $2
      `
      , [contrasena, id_empleado]);
    res.jsonp({ message: 'Registro actualizado.' });
  }


  // ADMINISTRACION DEL MODULO DE ALIMENTACION
  public async RegistrarAdminComida(req: Request, res: Response): Promise<void> {
    const { admin_comida, id_empleado } = req.body;
    await pool.query(
      `
      UPDATE usuarios SET admin_comida = $1 WHERE id_empleado = $2
      `
      , [admin_comida, id_empleado]);
    res.jsonp({ message: 'Registro guardado.' });
  }

  /** ************************************************************************************* ** 
   ** **                METODO FRASE DE SEGURIDAD ADMINISTRADOR                          ** **
   ** ************************************************************************************* **/

  // METODO PARA GUARDAR FRASE DE SEGURIDAD
  public async ActualizarFrase(req: Request, res: Response): Promise<void> {
    const { frase, id_empleado } = req.body;
    await pool.query(
      `
      UPDATE usuarios SET frase = $1 WHERE id_empleado = $2
      `
      , [frase, id_empleado]);
    res.jsonp({ message: 'Registro guardado.' });
  }


  /** ******************************************************************************************** **
   ** **               METODO PARA MANEJAR DATOS DE USUARIOS TIMBRE WEB                         ** **
   ** ******************************************************************************************** **/

  /**
   * METODO DE BUSQUEDA DE USUARIOS QUE USAN TIMBRE WEB
   * REALIZA UN ARRAY DE SUCURSALES CON DEPARTAMENTOS Y EMPLEADOS DEPENDIENDO DE SU ESTADO 
   * BUSCA EMPLEADOS ACTIVOS O INACTIVOS. 
   * @returns Retorna Array de [Sucursales[Departamentos[empleados[]]]]
   **/

  public async UsuariosTimbreWeb(req: Request, res: Response) {
    let estado = req.params.estado;
    let habilitado = req.params.habilitado;

    // CONSULTA DE BUSQUEDA DE SUCURSALES
    let suc = await pool.query(
      `
      SELECT s.id AS id_suc, s.nombre AS name_suc, c.descripcion AS ciudad FROM sucursales AS s, 
        ciudades AS c 
      WHERE s.id_ciudad = c.id ORDER BY s.id
      `
    ).then((result: any) => { return result.rows });

    if (suc.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE DEPARTAMENTOS
    let departamentos = await Promise.all(suc.map(async (dep: any) => {
      dep.departamentos = await pool.query(
        `
        SELECT d.id as id_depa, d.nombre as name_dep, s.nombre AS sucursal
        FROM cg_departamentos AS d, sucursales AS s
        WHERE d.id_sucursal = $1 AND d.id_sucursal = s.id
        `
        , [dep.id_suc]
      ).then((result: any) => {
        return result.rows
      });
      return dep;
    }));

    let depa = departamentos.filter((obj: any) => {
      return obj.departamentos.length > 0
    });

    if (depa.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE COLABORADORES POR DEPARTAMENTO
    let lista = await Promise.all(depa.map(async (obj: any) => {
      obj.departamentos = await Promise.all(obj.departamentos.map(async (empl: any) => {
        empl.empleado = await pool.query(
          `
          SELECT DISTINCT e.id, (e.nombre || ' ' || e.apellido) AS nombre, e.cedula, e.codigo, u.usuario, 
            u.web_habilita, u.id AS userid, d.nombre AS departamento, ec.id_regimen
          FROM usuarios AS u, datos_actuales_empleado AS e, cg_departamentos AS d, empl_contratos AS ec
          WHERE e.id = u.id_empleado AND d.id = e.id_departamento AND e.id_departamento = $1 AND e.estado = $2
            AND u.web_habilita = $3 AND ec.id = e.id_contrato
          ORDER BY nombre
          `,
          [empl.id_depa, estado, habilitado])
          .then((result: any) => { return result.rows });
        return empl;
      }));
      return obj;
    }))

    if (lista.length === 0) return res.status(404)
      .jsonp({ message: 'No se han encontrado registros.' });

    let empleados = lista.map((obj: any) => {
      obj.departamentos = obj.departamentos.filter((ele: any) => {
        return ele.empleado.length > 0;
      })
      return obj;
    }).filter((obj: any) => {
      return obj.departamentos.length > 0;
    });


    // CONSULTA DE BUSQUEDA DE COLABORADORES POR REGIMEN
    let regimen = await Promise.all(empleados.map(async (obj: any) => {
      obj.departamentos = await Promise.all(obj.departamentos.map(async (empl: any) => {
        empl.empleado = await Promise.all(empl.empleado.map(async (reg: any) => {
          //console.log('variables car ', reg)
          reg.regimen = await pool.query(
            `
                          SELECT r.id AS id_regimen, r.descripcion AS name_regimen
                          FROM cg_regimenes AS r
                          WHERE r.id = $1
                          ORDER BY r.descripcion ASC
                          `,
            [reg.id_regimen])
            .then((result: any) => { return result.rows });
          return reg;
        }))
        return empl;
      }));
      return obj;
    }))

    if (regimen.length === 0) return res.status(404)
      .jsonp({ message: 'No se han encontrado registros.' });

    let respuesta = regimen.map((obj: any) => {
      obj.departamentos = obj.departamentos.filter((ele: any) => {
        ele.empleado = ele.empleado.filter((reg: any) => {
          return reg.regimen.length > 0;
        })
        return ele;
      }).filter((ele: any) => {
        return ele.empleado.length > 0;
      });
      return obj;
    }).filter((obj: any) => {
      return obj.departamentos.length > 0;
    });

    return res.status(200).jsonp(respuesta);
  }

  /**
   * METODO DE CONSULTA DE DATOS GENERALES DE USUARIOS QUE USAN TIMBRE WEB
   * REALIZA UN ARRAY DE CARGOS Y EMPLEADOS DEPENDIENDO DEL ESTADO DEL 
   * EMPLEADO SI BUSCA EMPLEADOS ACTIVOS O INACTIVOS. 
   * @returns Retorna Array de [Cargos[empleados[]]]
   **/

  public async UsuariosTimbreWebCargos(req: Request, res: Response) {
    let estado = req.params.estado;
    let habilitado = req.params.habilitado;

    // CONSULTA DE BUSQUEDA DE CARGOS
    let cargo = await pool.query(
      `
      SELECT tc.id AS id_cargo, tc.cargo AS name_cargo
      FROM tipo_cargo AS tc 
      ORDER BY tc.cargo ASC
      `
    ).then((result: any) => { return result.rows });

    if (cargo.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE EMPLEADOS
    let empleados = await Promise.all(cargo.map(async (empl: any) => {
      empl.empleados = await pool.query(
        `
        SELECT DISTINCT e.id, CONCAT(e.nombre, ' ' , e.apellido) nombre, e.codigo, 
          e.cedula, tc.cargo, r.descripcion AS regimen, d.nombre AS departamento, 
          s.nombre AS sucursal, u.usuario, u.web_habilita, u.id AS userid
        FROM empl_cargos AS ca, empl_contratos AS co, cg_regimenes AS r, empleados AS e,
          tipo_cargo AS tc, cg_departamentos AS d, sucursales AS s, usuarios AS u
        WHERE ca.id = (SELECT da.id_cargo FROM datos_actuales_empleado AS da WHERE 
          da.id = e.id) 
          AND tc.id = ca.cargo
          AND ca.cargo = $1
          AND ca.id_departamento = d.id
          AND co.id = (SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE 
          da.id = e.id) 
          AND s.id = d.id_sucursal
          AND co.id_regimen = r.id AND e.estado = $2
          AND e.id = u.id_empleado
          AND u.web_habilita = $3
        ORDER BY nombre ASC
        `
        , [empl.id_cargo, estado, habilitado]

      ).then((result: any) => { return result.rows });


      return empl;
    }));

    let respuesta = empleados.filter((obj: any) => {
      return obj.empleados.length > 0
    });

    if (respuesta.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    return res.status(200).jsonp(respuesta);
  }




















  // METODO PARA ACTUALIZAR ESTADO DE TIMBRE WEB
  public async ActualizarEstadoTimbreWeb(req: Request, res: Response) {
    try {
      const array = req.body;

      if (array.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registros.' })

      const nuevo = await Promise.all(array.map(async (o: any) => {

        try {
          const [result] = await pool.query(
            `
            UPDATE usuarios SET web_habilita = $1 WHERE id = $2 RETURNING id
            `
            , [!o.web_habilita, o.userid])
            .then((result: any) => { return result.rows })
          return result
        } catch (error) {
          return { error: error.toString() }
        }

      }))

      return res.status(200).jsonp({ message: 'Datos actualizados exitosamente.', nuevo })

    } catch (error) {
      return res.status(500).jsonp({ message: error })
    }
  }


  /** ******************************************************************************************** **
   ** **               METODO PARA MANEJAR DATOS DE USUARIOS TIMBRE MOVIL                       ** **
   ** ******************************************************************************************** **/

  /**
   * METODO DE BUSQUEDA DE USUARIOS QUE USAN TIMBRE MOVIL
   * REALIZA UN ARRAY DE SUCURSALES CON DEPARTAMENTOS Y EMPLEADOS DEPENDIENDO DE SU ESTADO 
   * BUSCA EMPLEADOS ACTIVOS O INACTIVOS. 
   * @returns Retorna Array de [Sucursales[Departamentos[empleados[]]]]
   **/

  public async UsuariosTimbreMovil(req: Request, res: Response) {
    let estado = req.params.estado;
    let habilitado = req.params.habilitado;

    // CONSULTA DE BUSQUEDA DE SUCURSALES
    let suc = await pool.query(
      `
      SELECT s.id AS id_suc, s.nombre AS name_suc, c.descripcion AS ciudad FROM sucursales AS s, 
        ciudades AS c 
      WHERE s.id_ciudad = c.id ORDER BY s.id
      `
    ).then((result: any) => { return result.rows });

    if (suc.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE DEPARTAMENTOS
    let departamentos = await Promise.all(suc.map(async (dep: any) => {
      dep.departamentos = await pool.query(
        `
        SELECT d.id as id_depa, d.nombre as name_dep, s.nombre AS sucursal
        FROM cg_departamentos AS d, sucursales AS s
        WHERE d.id_sucursal = $1 AND d.id_sucursal = s.id
        `
        , [dep.id_suc]
      ).then((result: any) => {
        return result.rows
      });
      return dep;
    }));

    let depa = departamentos.filter((obj: any) => {
      return obj.departamentos.length > 0
    });

    if (depa.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE COLABORADORES POR DEPARTAMENTO
    let lista = await Promise.all(depa.map(async (obj: any) => {
      obj.departamentos = await Promise.all(obj.departamentos.map(async (empl: any) => {
        empl.empleado = await pool.query(
          `
          SELECT DISTINCT e.id, (e.nombre || ' ' || e.apellido) AS nombre, e.cedula, e.codigo, u.usuario, 
            u.app_habilita, u.id AS userid, d.nombre AS departamento, ec.id_regimen
          FROM usuarios AS u, datos_actuales_empleado AS e, cg_departamentos AS d, empl_contratos AS ec
          WHERE e.id = u.id_empleado AND d.id = e.id_departamento AND e.id_departamento = $1 AND e.estado = $2
            AND u.app_habilita = $3 AND ec.id = e.id_contrato
          ORDER BY nombre
          `,
          [empl.id_depa, estado, habilitado])
          .then((result: any) => { return result.rows });
        return empl;
      }));
      return obj;
    }))

    if (lista.length === 0) return res.status(404)
      .jsonp({ message: 'No se han encontrado registros.' });

    let empleados = lista.map((obj: any) => {
      obj.departamentos = obj.departamentos.filter((ele: any) => {
        return ele.empleado.length > 0;
      })
      return obj;
    }).filter((obj: any) => {
      return obj.departamentos.length > 0;
    });


    // CONSULTA DE BUSQUEDA DE COLABORADORES POR REGIMEN
    let regimen = await Promise.all(empleados.map(async (obj: any) => {
      obj.departamentos = await Promise.all(obj.departamentos.map(async (empl: any) => {
        empl.empleado = await Promise.all(empl.empleado.map(async (reg: any) => {
          //console.log('variables car ', reg)
          reg.regimen = await pool.query(
            `
                            SELECT r.id AS id_regimen, r.descripcion AS name_regimen
                            FROM cg_regimenes AS r
                            WHERE r.id = $1
                            ORDER BY r.descripcion ASC
                            `,
            [reg.id_regimen])
            .then((result: any) => { return result.rows });
          return reg;
        }))
        return empl;
      }));
      return obj;
    }))

    if (regimen.length === 0) return res.status(404)
      .jsonp({ message: 'No se han encontrado registros.' });

    let respuesta = regimen.map((obj: any) => {
      obj.departamentos = obj.departamentos.filter((ele: any) => {
        ele.empleado = ele.empleado.filter((reg: any) => {
          return reg.regimen.length > 0;
        })
        return ele;
      }).filter((ele: any) => {
        return ele.empleado.length > 0;
      });
      return obj;
    }).filter((obj: any) => {
      return obj.departamentos.length > 0;
    });

    if (respuesta.length === 0) return res.status(404)
      .jsonp({ message: 'No se han encontrado registros.' })

    return res.status(200).jsonp(respuesta);
  }


  /**
   * METODO DE CONSULTA DE DATOS GENERALES DE USUARIOS QUE USAN TIMBRE MOVIL
   * REALIZA UN ARRAY DE CARGOS Y EMPLEADOS DEPENDIENDO DEL ESTADO DEL 
   * EMPLEADO SI BUSCA EMPLEADOS ACTIVOS O INACTIVOS. 
   * @returns Retorna Array de [Cargos[empleados[]]]
   **/

  public async UsuariosTimbreMovilCargos(req: Request, res: Response) {
    let estado = req.params.estado;
    let habilitado = req.params.habilitado;

    // CONSULTA DE BUSQUEDA DE CARGOS
    let cargo = await pool.query(
      `
      SELECT tc.id AS id_cargo, tc.cargo AS name_cargo
      FROM tipo_cargo AS tc 
      ORDER BY tc.cargo ASC
      `
    ).then((result: any) => { return result.rows });

    if (cargo.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE EMPLEADOS
    let empleados = await Promise.all(cargo.map(async (empl: any) => {
      empl.empleados = await pool.query(
        `
        SELECT DISTINCT e.id, CONCAT(e.nombre, ' ' , e.apellido) nombre, e.codigo, 
          e.cedula, tc.cargo, r.descripcion AS regimen, d.nombre AS departamento, 
          s.nombre AS sucursal, u.usuario, u.app_habilita, u.id AS userid
        FROM empl_cargos AS ca, empl_contratos AS co, cg_regimenes AS r, empleados AS e,
          tipo_cargo AS tc, cg_departamentos AS d, sucursales AS s, usuarios AS u
        WHERE ca.id = (SELECT da.id_cargo FROM datos_actuales_empleado AS da WHERE 
          da.id = e.id) 
          AND tc.id = ca.cargo
          AND ca.cargo = $1
          AND ca.id_departamento = d.id
          AND co.id = (SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE 
          da.id = e.id) 
          AND s.id = d.id_sucursal
          AND co.id_regimen = r.id AND e.estado = $2
          AND e.id = u.id_empleado
          AND u.app_habilita = $3
        ORDER BY nombre ASC
        `
        , [empl.id_cargo, estado, habilitado]

      ).then((result: any) => { return result.rows });


      return empl;
    }));

    let respuesta = empleados.filter((obj: any) => {
      return obj.empleados.length > 0
    });

    if (respuesta.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    return res.status(200).jsonp(respuesta);
  }












  // METODO PARA ACTUALIZAR ESTADO DE TIMBRE MOVIL
  public async ActualizarEstadoTimbreMovil(req: Request, res: Response) {
    try {
      console.log(req.body);
      const array = req.body;

      if (array.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registros.' })

      const nuevo = await Promise.all(array.map(async (o: any) => {

        try {
          const [result] = await pool.query(
            `
            UPDATE usuarios SET app_habilita = $1 WHERE id = $2 RETURNING id
            `
            , [!o.app_habilita, o.userid])
            .then((result: any) => { return result.rows })
          return result
        } catch (error) {
          return { error: error.toString() }
        }
      }))

      return res.status(200).jsonp({ message: 'Datos actualizados exitosamente.', nuevo })

    } catch (error) {
      return res.status(500).jsonp({ message: error })
    }
  }

  /** ******************************************************************************************** **
   ** **            METODO PARA MANEJAR DATOS DE REGISTRO DE DISPOSITIVOS MOVILES               ** **
   ** ******************************************************************************************** **/

  // LISTADO DE DISPOSITIVOS REGISTRADOS POR EL CODIGO DE USUARIO
  public async ListarDispositivosMoviles(req: Request, res: Response) {
    try {
      const DISPOSITIVOS = await pool.query(
        `
        SELECT e.codigo, (e.nombre || \' \' || e.apellido) AS nombre, e.cedula, d.id_dispositivo, d.modelo_dispositivo
        FROM id_dispositivos AS d INNER JOIN empleados AS e ON d.id_empleado = e.codigo
        ORDER BY nombre
        `
      ).then((result: any) => { return result.rows });

      if (DISPOSITIVOS.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

      return res.status(200).jsonp(DISPOSITIVOS)

    } catch (error) {
      return res.status(500).jsonp({ message: error })
    }
  }

  // METODO PARA ELIMINAR REGISTROS DE DISPOSITIVOS MOVILES
  public async EliminarDispositivoMovil(req: Request, res: Response) {
    try {
      const array = req.params.dispositivo;

      let dispositivos = array.split(',');

      if (dispositivos.length === 0) return res.status(400).jsonp({ message: 'No se han encontrado registros.' })

      const nuevo = await Promise.all(dispositivos.map(async (id_dispo: any) => {
        try {
          const [result] = await pool.query(
            `
            DELETE FROM id_dispositivos WHERE id_dispositivo = $1 RETURNING *
            `
            , [id_dispo])
            .then((result: any) => { return result.rows })
          return result
        } catch (error) {
          return { error: error.toString() }
        }
      }))

      return res.status(200).jsonp({ message: 'Datos eliminados exitosamente.', nuevo })

    } catch (error) {
      return res.status(500).jsonp({ message: error })
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

    const path_folder = path.resolve('logos');

    const correoValido = await pool.query(
      `
      SELECT e.id, e.nombre, e.apellido, e.correo, u.usuario, u.contrasena 
      FROM empleados AS e, usuarios AS u 
      WHERE E.correo = $1 AND u.id_empleado = e.id
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
        html: `
                <body>
                    <div style="text-align: center;">
                        <img width="25%" height="25%" src="cid:cabeceraf"/>
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
  public async CambiarFrase(req: Request, res: Response) {
    var token = req.body.token;
    var frase = req.body.frase;
    try {
      const payload = jwt.verify(token, process.env.TOKEN_SECRET_MAIL || 'llaveEmail') as IPayload;
      const id_empleado = payload._id;
      await pool.query(
        `
        UPDATE usuarios SET frase = $2 WHERE id_empleado = $1
        `
        , [id_empleado, frase]);
      return res.jsonp({ expiro: 'no', message: "Frase de seguridad actualizada." });
    } catch (error) {
      return res.jsonp({ expiro: 'si', message: "Tiempo para cambiar su frase de seguridad ha expirado." });
    }
  }
























  public async list(req: Request, res: Response) {
    const USUARIOS = await pool.query('SELECT * FROM usuarios');
    if (USUARIOS.rowCount > 0) {
      return res.jsonp(USUARIOS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  public async getIdByUsuario(req: Request, res: Response): Promise<any> {
    const { usuario } = req.params;
    const unUsuario = await pool.query('SELECT id FROM usuarios WHERE usuario = $1', [usuario]);
    if (unUsuario.rowCount > 0) {
      return res.jsonp(unUsuario.rows);
    }
    else {
      res.status(404).jsonp({ text: 'No se ha encontrado el usuario' });
    }
  }

  public async BuscarUsuarioSucursal(req: Request, res: Response) {
    const { id_empleado } = req.body;
    const USUARIOS = await pool.query(
      `
      SELECT * FROM usuario_sucursal WHERE id_usuario = $1
      `,
      [id_empleado]
    );
    if (USUARIOS.rowCount > 0) {
      return res.jsonp(USUARIOS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  //ACCESOS AL SISTEMA
  public async AuditarAcceso(req: Request, res: Response) {
    const { modulo, user_name, fecha, hora, acceso, ip_address } = req.body;
    await pool.query('INSERT INTO logged_user ( modulo, user_name, fecha, hora, acceso, ip_address ) ' +
      'VALUES ($1, $2, $3, $4, $5, $6)', [modulo, user_name, fecha, hora, acceso, ip_address]);
    return res.jsonp({ message: 'Auditoria Realizada' });
  }

}

export const USUARIO_CONTROLADOR = new UsuarioControlador();

export default USUARIO_CONTROLADOR;