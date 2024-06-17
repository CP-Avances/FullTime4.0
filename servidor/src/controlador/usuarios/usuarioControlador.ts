import {
  enviarMail, email, nombre, cabecera_firma, pie_firma, servidor, puerto, Credenciales, fechaHora,
  FormatearFecha, FormatearHora, dia_completo
} from '../../libs/settingsMail'
import { Request, Response } from 'express';
import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';
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
      const { usuario, contrasena, estado, id_rol, id_empleado, user_name, ip } = req.body;

      // INCIAR TRANSACCION
      await pool.query('BEGIN');

      await pool.query(
        `
        INSERT INTO eu_usuarios (usuario, contrasena, estado, id_rol, id_empleado) 
          VALUES ($1, $2, $3, $4, $5)
        `
        , [usuario, contrasena, estado, id_rol, id_empleado]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eu_usuarios',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: `{usuario: ${usuario}, contrasena: ${contrasena}, estado: ${estado}, id_rol: ${id_rol}, id_empleado: ${id_empleado}}`,
        ip,
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

  // METODO DE BUSQUEDA DE DATOS DE USUARIO
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
      SELECT e.id, e.id_departamento, e.id_contrato, ed_departamentos.nombre 
      FROM datos_actuales_empleado AS e 
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

  public async ObtenerIdUsuariosDepartamento(req: Request, res: Response) {
    const { id_departamento } = req.body;
    const Ids = await pool.query(
      `
      SELECT id
      FROM datos_actuales_empleado
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


  // METODO PARA ACTUALIZAR DATOS DE USUARIO
  public async ActualizarUsuario(req: Request, res: Response): Promise<Response> {
    try {
      const { usuario, contrasena, id_rol, id_empleado, user_name, ip } = req.body;

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
          ip,
          observacion: `Error al actualizar usuario con id_empleado: ${id_empleado}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
      }

      await pool.query(
        `
        UPDATE eu_usuarios SET usuario = $1, contrasena = $2, id_rol = $3 WHERE id_empleado = $4
        `
        , [usuario, contrasena, id_rol, id_empleado]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eu_usuarios',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: `{usuario: ${usuario}, contrasena: ${contrasena}, id_rol: ${id_rol}}`,
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro actualizado.' });
    }
    catch (error) {
      console.log('error *** ', error)
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' });
    }
  }

  // METODO PARA ACTUALIZAR CONTRASEÑA
  public async CambiarPasswordUsuario(req: Request, res: Response): Promise<Response> {
    try {
      const { contrasena, id_empleado, user_name, ip } = req.body;
  
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
          ip,
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
        ip,
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
      const { admin_comida, id_empleado, user_name, ip } = req.body;

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
          ip,
          observacion: `Error al actualizar usuario con id_empleado: ${id_empleado}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
      }

      await pool.query(
        `
        UPDATE eu_usuarios SET administra_comida = $1 WHERE id_empleado = $2
        `
        , [admin_comida, id_empleado]);
      
      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eu_usuarios',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: `{administra_comida: ${admin_comida}}`,
        ip,
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
      const { frase, id_empleado, user_name, ip } = req.body;

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
          ip,
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
        ip,
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

  /**
   * @returns Retorna Array de [Sucursales[Regimen[Departamentos[Cargos[empleados[]]]]]]
   **/

  // METODO PARA LEER DATOS PERFIL SUPER-ADMINISTRADOR
  public async UsuariosTimbreWeb_SUPERADMIN(req: Request, res: Response) {
    let estado = req.params.estado;
    let habilitado = req.params.habilitado;

    // CONSULTA DE BUSQUEDA DE SUCURSALES
    let sucursal_ = await pool.query(
      `
      SELECT ig.id_suc, ig.name_suc 
      FROM informacion_general AS ig
      GROUP BY ig.id_suc, ig.name_suc
      ORDER BY ig.name_suc ASC
      `
    ).then((result: any) => { return result.rows });

    if (sucursal_.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE REGIMEN
    let regimen_ = await Promise.all(sucursal_.map(async (reg: any) => {
      reg.regimenes = await pool.query(
        `
        SELECT ig.id_suc, ig.name_suc, ig.id_regimen, ig.name_regimen
        FROM informacion_general AS ig
        WHERE ig.id_suc = $1
        GROUP BY ig.id_suc, ig.name_suc, ig.id_regimen, ig.name_regimen
        ORDER BY ig.name_suc ASC
        `
        , [reg.id_suc]
      ).then((result: any) => { return result.rows });
      return reg;
    }));

    let lista_regimen = regimen_.filter((obj: any) => {
      return obj.regimenes.length > 0
    });

    if (lista_regimen.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE DEPARTAMENTOS
    let departamentos_ = await Promise.all(lista_regimen.map(async (reg: any) => {
      reg.regimenes = await Promise.all(reg.regimenes.map(async (dep: any) => {
        dep.departamentos = await pool.query(
          `
          SELECT DISTINCT ig.id_suc, ig.name_suc, ig.id_depa, ig.name_dep, ig.id_regimen, ig.name_regimen
          FROM informacion_general AS ig
          WHERE ig.id_regimen = $1 AND ig.id_suc = $2
          GROUP BY ig.id_suc, ig.name_suc, ig.id_depa, ig.name_dep, ig.id_regimen, ig.name_regimen
          ORDER BY ig.name_suc ASC
          `
          , [dep.id_regimen, dep.id_suc]
        ).then((result: any) => { return result.rows });
        return dep;
      }))
      return reg;
    }));

    let lista_departamentos = departamentos_.map((reg: any) => {
      reg.regimenes = reg.regimenes.filter((dep: any) => {
        return dep.departamentos.length > 0;
      })
      return reg;
    });

    if (lista_departamentos.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE CARGOS
    let cargos_ = await Promise.all(lista_departamentos.map(async (reg: any) => {
      reg.regimenes = await Promise.all(reg.regimenes.map(async (dep: any) => {
        dep.departamentos = await Promise.all(dep.departamentos.map(async (car: any) => {
          car.cargos = await pool.query(
            `
            SELECT ig.id_suc, ig.name_suc, ig.id_cargo_, ig.name_cargo, ig.id_depa, ig.name_dep, ig.id_regimen,
              ig.name_regimen
            FROM informacion_general AS ig
            WHERE ig.id_depa = $1 AND ig.id_suc = $2 AND ig.id_regimen = $3
            GROUP BY ig.id_suc, ig.name_suc, ig.id_cargo_, ig.name_cargo, ig.id_depa, ig.name_dep, ig.id_regimen, 
              ig.name_regimen
            ORDER BY ig.name_suc ASC
            `
            , [car.id_depa, car.id_suc, car.id_regimen]
          ).then((result: any) => { return result.rows });
          return car;
        }))
        return dep;
      }))
      return reg;
    }));

    let lista_cargos = cargos_.map((reg: any) => {
      reg.regimenes = reg.regimenes.filter((dep: any) => {
        dep.departamentos = dep.departamentos.filter((car: any) => {
          return car.cargos.length > 0;
        })
        return dep;
      })
      return reg;
    });

    if (lista_cargos.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE COLABORADORES POR CARGO
    let lista = await Promise.all(lista_cargos.map(async (reg: any) => {
      reg.regimenes = await Promise.all(reg.regimenes.map(async (dep: any) => {
        dep.departamentos = await Promise.all(dep.departamentos.map(async (car: any) => {
          car.cargos = await Promise.all(car.cargos.map(async (empl: any) => {
            empl.empleado = await pool.query(
              `
              SELECT ig.*, u.usuario, u.web_habilita, u.id AS userid
              FROM informacion_general AS ig, eu_usuarios AS u 
              WHERE ig.id_cargo_= $1 AND ig.id_suc = $2 AND ig.estado = $3
                AND ig.id_depa = $4 AND ig.id_regimen = $5 AND u.id_empleado = ig.id
                AND u.web_habilita = $6
              `
              , [empl.id_cargo_, empl.id_suc, estado, empl.id_depa, empl.id_regimen, habilitado])
              .then((result: any) => { return result.rows });
            return empl;
          }));
          return car;
        }))
        return dep;
      }))
      return reg;
    }))

    let empleados = lista.map((reg: any) => {
      reg.regimenes = reg.regimenes.filter((dep: any) => {
        dep.departamentos = dep.departamentos.filter((car: any) => {
          car.cargos = car.cargos.filter((empl: any) => {
            return empl.empleado.length > 0;
          })
          return car;
        }).filter((car: any) => {
          return car.cargos.length > 0;
        });
        return dep;
      }).filter((dep: any) => {
        return dep.departamentos.length > 0;
      });
      return reg;
    }).filter((reg: any) => {
      return reg.regimenes.length > 0;
    });

    if (empleados.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' })

    return res.status(200).jsonp(empleados);
  }

  // METODO PARA LEER DATOS PERFIL ADMINISTRADOR
  public async UsuariosTimbreWeb_ADMIN(req: Request, res: Response) {
    let estado = req.params.estado;
    let habilitado = req.params.habilitado;
    let { id_sucursal } = req.body;

    // CONSULTA DE BUSQUEDA DE SUCURSALES
    let sucursal_ = await pool.query(
      "SELECT ig.id_suc, ig.name_suc " +
      "FROM informacion_general AS ig " +
      "WHERE ig.id_suc IN (" + id_sucursal + ")" +
      "GROUP BY ig.id_suc, ig.name_suc " +
      "ORDER BY ig.name_suc ASC"
    ).then((result: any) => { return result.rows });

    if (sucursal_.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE REGIMEN
    let regimen_ = await Promise.all(sucursal_.map(async (reg: any) => {
      reg.regimenes = await pool.query(
        `
        SELECT ig.id_suc, ig.name_suc, ig.id_regimen, ig.name_regimen
        FROM informacion_general AS ig
        WHERE ig.id_suc = $1
        GROUP BY ig.id_suc, ig.name_suc, ig.id_regimen, ig.name_regimen
        ORDER BY ig.name_suc ASC
        `
        , [reg.id_suc]
      ).then((result: any) => { return result.rows });
      return reg;
    }));

    let lista_regimen = regimen_.filter((obj: any) => {
      return obj.regimenes.length > 0
    });

    if (lista_regimen.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE DEPARTAMENTOS
    let departamentos_ = await Promise.all(lista_regimen.map(async (reg: any) => {
      reg.regimenes = await Promise.all(reg.regimenes.map(async (dep: any) => {
        dep.departamentos = await pool.query(
          `
          SELECT DISTINCT ig.id_suc, ig.name_suc, ig.id_depa, ig.name_dep, ig.id_regimen, ig.name_regimen
          FROM informacion_general AS ig
          WHERE ig.id_regimen = $1 AND ig.id_suc = $2
          GROUP BY ig.id_suc, ig.name_suc, ig.id_depa, ig.name_dep, ig.id_regimen, ig.name_regimen
          ORDER BY ig.name_suc ASC
          `
          , [dep.id_regimen, dep.id_suc]
        ).then((result: any) => { return result.rows });
        return dep;
      }))
      return reg;
    }));

    let lista_departamentos = departamentos_.map((reg: any) => {
      reg.regimenes = reg.regimenes.filter((dep: any) => {
        return dep.departamentos.length > 0;
      })
      return reg;
    });

    if (lista_departamentos.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE CARGOS
    let cargos_ = await Promise.all(lista_departamentos.map(async (reg: any) => {
      reg.regimenes = await Promise.all(reg.regimenes.map(async (dep: any) => {
        dep.departamentos = await Promise.all(dep.departamentos.map(async (car: any) => {
          car.cargos = await pool.query(
            `
              SELECT ig.id_suc, ig.name_suc, ig.id_cargo_, ig.name_cargo, ig.id_depa, ig.name_dep, ig.id_regimen,
                  ig.name_regimen
              FROM informacion_general AS ig
              WHERE ig.id_depa = $1 AND ig.id_suc = $2 AND ig.id_regimen = $3
              GROUP BY ig.id_suc, ig.name_suc, ig.id_cargo_, ig.name_cargo, ig.id_depa, ig.name_dep, ig.id_regimen, 
                  ig.name_regimen
              ORDER BY ig.name_suc ASC
            `
            , [car.id_depa, car.id_suc, car.id_regimen]
          ).then((result: any) => { return result.rows });
          return car;
        }))
        return dep;
      }))
      return reg;
    }));

    let lista_cargos = cargos_.map((reg: any) => {
      reg.regimenes = reg.regimenes.filter((dep: any) => {
        dep.departamentos = dep.departamentos.filter((car: any) => {
          return car.cargos.length > 0;
        })
        return dep;
      })
      return reg;
    });

    if (lista_cargos.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE COLABORADORES POR CARGO
    let lista = await Promise.all(lista_cargos.map(async (reg: any) => {
      reg.regimenes = await Promise.all(reg.regimenes.map(async (dep: any) => {
        dep.departamentos = await Promise.all(dep.departamentos.map(async (car: any) => {
          car.cargos = await Promise.all(car.cargos.map(async (empl: any) => {
            empl.empleado = await pool.query(
              `
              SELECT ig.*, u.usuario, u.web_habilita, u.id AS userid
              FROM informacion_general AS ig, eu_usuarios AS u 
              WHERE ig.id_cargo_= $1 AND ig.id_suc = $2 AND ig.estado = $3
                AND ig.id_depa = $4 AND ig.id_regimen = $5 AND u.id_empleado = ig.id
                AND u.web_habilita = $6
              `
              , [empl.id_cargo_, empl.id_suc, estado, empl.id_depa, empl.id_regimen, habilitado])
              .then((result: any) => { return result.rows });
            return empl;
          }));
          return car;
        }))
        return dep;
      }))
      return reg;
    }))

    let empleados = lista.map((reg: any) => {
      reg.regimenes = reg.regimenes.filter((dep: any) => {
        dep.departamentos = dep.departamentos.filter((car: any) => {
          car.cargos = car.cargos.filter((empl: any) => {
            return empl.empleado.length > 0;
          })
          return car;
        }).filter((car: any) => {
          return car.cargos.length > 0;
        });
        return dep;
      }).filter((dep: any) => {
        return dep.departamentos.length > 0;
      });
      return reg;
    }).filter((reg: any) => {
      return reg.regimenes.length > 0;
    });

    if (empleados.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' })

    return res.status(200).jsonp(empleados);
  }

  // METODO PARA LEER DATOS PERFIL ADMINISTRADOR JEFE
  public async UsuariosTimbreWeb_JEFE(req: Request, res: Response) {
    let estado = req.params.estado;
    let habilitado = req.params.habilitado;
    let { id_sucursal, id_departamento } = req.body;

    // CONSULTA DE BUSQUEDA DE SUCURSALES
    let sucursal_ = await pool.query(
      "SELECT ig.id_suc, ig.name_suc " +
      "FROM informacion_general AS ig " +
      "WHERE ig.id_suc IN (" + id_sucursal + ")" +
      "GROUP BY ig.id_suc, ig.name_suc " +
      "ORDER BY ig.name_suc ASC"
    ).then((result: any) => { return result.rows });

    if (sucursal_.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE REGIMEN
    let regimen_ = await Promise.all(sucursal_.map(async (reg: any) => {
      reg.regimenes = await pool.query(
        `
        SELECT ig.id_suc, ig.name_suc, ig.id_regimen, ig.name_regimen
        FROM informacion_general AS ig
        WHERE ig.id_suc = $1
        GROUP BY ig.id_suc, ig.name_suc, ig.id_regimen, ig.name_regimen
        ORDER BY ig.name_suc ASC
        `
        , [reg.id_suc]
      ).then((result: any) => { return result.rows });
      return reg;
    }));

    let lista_regimen = regimen_.filter((obj: any) => {
      return obj.regimenes.length > 0
    });

    if (lista_regimen.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE DEPARTAMENTOS
    let departamentos_ = await Promise.all(lista_regimen.map(async (reg: any) => {
      reg.regimenes = await Promise.all(reg.regimenes.map(async (dep: any) => {
        dep.departamentos = await pool.query(
          "SELECT DISTINCT ig.id_suc, ig.name_suc, ig.id_depa, ig.name_dep, ig.id_regimen, ig.name_regimen " +
          "FROM informacion_general AS ig " +
          "WHERE ig.id_regimen = $1 AND ig.id_suc = $2 AND ig.id_depa IN (" + id_departamento + ")" +
          "GROUP BY ig.id_suc, ig.name_suc, ig.id_depa, ig.name_dep, ig.id_regimen, ig.name_regimen " +
          "ORDER BY ig.name_suc ASC "
          , [dep.id_regimen, dep.id_suc]
        ).then((result: any) => { return result.rows });
        return dep;
      }))
      return reg;
    }));

    let lista_departamentos = departamentos_.map((reg: any) => {
      reg.regimenes = reg.regimenes.filter((dep: any) => {
        return dep.departamentos.length > 0;
      })
      return reg;
    });

    if (lista_departamentos.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE CARGOS
    let cargos_ = await Promise.all(lista_departamentos.map(async (reg: any) => {
      reg.regimenes = await Promise.all(reg.regimenes.map(async (dep: any) => {
        dep.departamentos = await Promise.all(dep.departamentos.map(async (car: any) => {
          car.cargos = await pool.query(
            `
            SELECT ig.id_suc, ig.name_suc, ig.id_cargo_, ig.name_cargo, ig.id_depa, ig.name_dep, ig.id_regimen,
              ig.name_regimen
            FROM informacion_general AS ig
            WHERE ig.id_depa = $1 AND ig.id_suc = $2 AND ig.id_regimen = $3
            GROUP BY ig.id_suc, ig.name_suc, ig.id_cargo_, ig.name_cargo, ig.id_depa, ig.name_dep, ig.id_regimen, 
              ig.name_regimen
            ORDER BY ig.name_suc ASC
            `
            , [car.id_depa, car.id_suc, car.id_regimen]
          ).then((result: any) => { return result.rows });
          return car;
        }))
        return dep;
      }))
      return reg;
    }));

    let lista_cargos = cargos_.map((reg: any) => {
      reg.regimenes = reg.regimenes.filter((dep: any) => {
        dep.departamentos = dep.departamentos.filter((car: any) => {
          return car.cargos.length > 0;
        })
        return dep;
      })
      return reg;
    });

    if (lista_cargos.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE COLABORADORES POR CARGO
    let lista = await Promise.all(lista_cargos.map(async (reg: any) => {
      reg.regimenes = await Promise.all(reg.regimenes.map(async (dep: any) => {
        dep.departamentos = await Promise.all(dep.departamentos.map(async (car: any) => {
          car.cargos = await Promise.all(car.cargos.map(async (empl: any) => {
            empl.empleado = await pool.query(
              `
              SELECT ig.*, u.usuario, u.web_habilita, u.id AS userid
              FROM informacion_general AS ig, eu_usuarios AS u 
              WHERE ig.id_cargo_= $1 AND ig.id_suc = $2 AND ig.estado = $3
                AND ig.id_depa = $4 AND ig.id_regimen = $5 AND u.id_empleado = ig.id
                AND u.web_habilita = $6
              `,
              [empl.id_cargo_, empl.id_suc, estado, empl.id_depa, empl.id_regimen, habilitado])
              .then((result: any) => { return result.rows });
            return empl;
          }));
          return car;
        }))
        return dep;
      }))
      return reg;
    }))

    let empleados = lista.map((reg: any) => {
      reg.regimenes = reg.regimenes.filter((dep: any) => {
        dep.departamentos = dep.departamentos.filter((car: any) => {
          car.cargos = car.cargos.filter((empl: any) => {
            return empl.empleado.length > 0;
          })
          return car;
        }).filter((car: any) => {
          return car.cargos.length > 0;
        });
        return dep;
      }).filter((dep: any) => {
        return dep.departamentos.length > 0;
      });
      return reg;
    }).filter((reg: any) => {
      return reg.regimenes.length > 0;
    });

    if (empleados.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' })

    return res.status(200).jsonp(empleados);
  }


  // METODO PARA ACTUALIZAR ESTADO DE TIMBRE WEB
  public async ActualizarEstadoTimbreWeb(req: Request, res: Response) {
    try {
      const {array, user_name, ip} = req.body;

      if (array.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registros.' })

      const nuevo = await Promise.all(array.map(async (o: any) => {

        try {
          // INICIA TRANSACCION
          await pool.query('BEGIN');

          // CONSULTA DATOSORIGINALES
          const consulta = await pool.query(`SELECT * FROM eu_usuarios WHERE id = $1`, [o.userid]);
          const [datosOriginales] = consulta.rows;

          if (!datosOriginales) {
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'eu_usuarios',
              usuario: user_name,
              accion: 'U',
              datosOriginales: '',
              datosNuevos: '',
              ip,
              observacion: `Error al actualizar usuario con id: ${o.userid}. Registro no encontrado.`
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.status(404).jsonp({ message: 'Registro no encontrado.' });
          }

          const [result] = await pool.query(
            `
            UPDATE eu_usuarios SET web_habilita = $1 WHERE id = $2 RETURNING id
            `
            , [!o.web_habilita, o.userid])
            .then((result: any) => { return result.rows });

          // AUDITORIA
          await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'eu_usuarios',
            usuario: user_name,
            accion: 'U',
            datosOriginales: JSON.stringify(datosOriginales),
            datosNuevos: `{web_habilita: ${!o.web_habilita}}`,
            ip,
            observacion: null
          });

          // FINALIZAR TRANSACCION
          await pool.query('COMMIT');
          return result
        } catch (error) {
          // REVERTIR TRANSACCION
          await pool.query('ROLLBACK');
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
   * @returns Retorna Array de [Sucursales[Regimen[Departamentos[Cargos[empleados[]]]]]]
   **/

  // METODO PARA LEER DATOS PERFIL SUPER-ADMINISTRADOR
  public async UsuariosTimbreMovil_SUPERADMIN(req: Request, res: Response) {
    let estado = req.params.estado;
    let habilitado = req.params.habilitado;

    // CONSULTA DE BUSQUEDA DE SUCURSALES
    let sucursal_ = await pool.query(
      `
      SELECT ig.id_suc, ig.name_suc FROM informacion_general AS ig
      GROUP BY ig.id_suc, ig.name_suc
      ORDER BY ig.name_suc ASC
      `
    ).then((result: any) => { return result.rows });

    if (sucursal_.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE REGIMEN
    let regimen_ = await Promise.all(sucursal_.map(async (reg: any) => {
      reg.regimenes = await pool.query(
        `
        SELECT ig.id_suc, ig.name_suc, ig.id_regimen, ig.name_regimen
        FROM informacion_general AS ig
        WHERE ig.id_suc = $1
        GROUP BY ig.id_suc, ig.name_suc, ig.id_regimen, ig.name_regimen
        ORDER BY ig.name_suc ASC
        `
        , [reg.id_suc]
      ).then((result: any) => { return result.rows });
      return reg;
    }));

    let lista_regimen = regimen_.filter((obj: any) => {
      return obj.regimenes.length > 0
    });

    if (lista_regimen.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE DEPARTAMENTOS
    let departamentos_ = await Promise.all(lista_regimen.map(async (reg: any) => {
      reg.regimenes = await Promise.all(reg.regimenes.map(async (dep: any) => {
        dep.departamentos = await pool.query(
          `
          SELECT DISTINCT ig.id_suc, ig.name_suc, ig.id_depa, ig.name_dep, ig.id_regimen, ig.name_regimen
          FROM informacion_general AS ig
          WHERE ig.id_regimen = $1 AND ig.id_suc = $2
          GROUP BY ig.id_suc, ig.name_suc, ig.id_depa, ig.name_dep, ig.id_regimen, ig.name_regimen
          ORDER BY ig.name_suc ASC
          `
          , [dep.id_regimen, dep.id_suc]
        ).then((result: any) => { return result.rows });
        return dep;
      }))
      return reg;
    }));

    let lista_departamentos = departamentos_.map((reg: any) => {
      reg.regimenes = reg.regimenes.filter((dep: any) => {
        return dep.departamentos.length > 0;
      })
      return reg;
    });

    if (lista_departamentos.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE CARGOS
    let cargos_ = await Promise.all(lista_departamentos.map(async (reg: any) => {
      reg.regimenes = await Promise.all(reg.regimenes.map(async (dep: any) => {
        dep.departamentos = await Promise.all(dep.departamentos.map(async (car: any) => {
          car.cargos = await pool.query(
            `
            SELECT ig.id_suc, ig.name_suc, ig.id_cargo_, ig.name_cargo, ig.id_depa, ig.name_dep, ig.id_regimen,
              ig.name_regimen
            FROM informacion_general AS ig
            WHERE ig.id_depa = $1 AND ig.id_suc = $2 AND ig.id_regimen = $3
            GROUP BY ig.id_suc, ig.name_suc, ig.id_cargo_, ig.name_cargo, ig.id_depa, ig.name_dep, ig.id_regimen, 
              ig.name_regimen
            ORDER BY ig.name_suc ASC
            `
            , [car.id_depa, car.id_suc, car.id_regimen]
          ).then((result: any) => { return result.rows });
          return car;
        }))
        return dep;
      }))
      return reg;
    }));

    let lista_cargos = cargos_.map((reg: any) => {
      reg.regimenes = reg.regimenes.filter((dep: any) => {
        dep.departamentos = dep.departamentos.filter((car: any) => {
          return car.cargos.length > 0;
        })
        return dep;
      })
      return reg;
    });

    if (lista_cargos.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE COLABORADORES POR CARGO
    let lista = await Promise.all(lista_cargos.map(async (reg: any) => {
      reg.regimenes = await Promise.all(reg.regimenes.map(async (dep: any) => {
        dep.departamentos = await Promise.all(dep.departamentos.map(async (car: any) => {
          car.cargos = await Promise.all(car.cargos.map(async (empl: any) => {
            empl.empleado = await pool.query(
              `
              SELECT ig.*, u.usuario, u.app_habilita, u.id AS userid
              FROM informacion_general AS ig, eu_usuarios AS u 
              WHERE ig.id_cargo_= $1 AND ig.id_suc = $2 AND ig.estado = $3
                AND ig.id_depa = $4 AND ig.id_regimen = $5 AND u.id_empleado = ig.id
                AND u.app_habilita = $6
              `,
              [empl.id_cargo_, empl.id_suc, estado, empl.id_depa, empl.id_regimen, habilitado])
              .then((result: any) => { return result.rows });
            return empl;
          }));
          return car;
        }))
        return dep;
      }))
      return reg;
    }))

    let empleados = lista.map((reg: any) => {
      reg.regimenes = reg.regimenes.filter((dep: any) => {
        dep.departamentos = dep.departamentos.filter((car: any) => {
          car.cargos = car.cargos.filter((empl: any) => {
            return empl.empleado.length > 0;
          })
          return car;
        }).filter((car: any) => {
          return car.cargos.length > 0;
        });
        return dep;
      }).filter((dep: any) => {
        return dep.departamentos.length > 0;
      });
      return reg;
    }).filter((reg: any) => {
      return reg.regimenes.length > 0;
    });

    if (empleados.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' })

    return res.status(200).jsonp(empleados);
  }

  // METODO PARA LEER DATOS PERFIL ADMINISTRADOR
  public async UsuariosTimbreMovil_ADMIN(req: Request, res: Response) {
    let estado = req.params.estado;
    let habilitado = req.params.habilitado;
    let { id_sucursal } = req.body;

    // CONSULTA DE BUSQUEDA DE SUCURSALES
    let sucursal_ = await pool.query(
      "SELECT ig.id_suc, ig.name_suc " +
      "FROM informacion_general AS ig " +
      "WHERE ig.id_suc IN (" + id_sucursal + ")" +
      "GROUP BY ig.id_suc, ig.name_suc " +
      "ORDER BY ig.name_suc ASC"
    ).then((result: any) => { return result.rows });

    if (sucursal_.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE REGIMEN
    let regimen_ = await Promise.all(sucursal_.map(async (reg: any) => {
      reg.regimenes = await pool.query(
        `
        SELECT ig.id_suc, ig.name_suc, ig.id_regimen, ig.name_regimen
        FROM informacion_general AS ig
        WHERE ig.id_suc = $1
        GROUP BY ig.id_suc, ig.name_suc, ig.id_regimen, ig.name_regimen
        ORDER BY ig.name_suc ASC
        `
        , [reg.id_suc]
      ).then((result: any) => { return result.rows });
      return reg;
    }));

    let lista_regimen = regimen_.filter((obj: any) => {
      return obj.regimenes.length > 0
    });

    if (lista_regimen.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE DEPARTAMENTOS
    let departamentos_ = await Promise.all(lista_regimen.map(async (reg: any) => {
      reg.regimenes = await Promise.all(reg.regimenes.map(async (dep: any) => {
        dep.departamentos = await pool.query(
          `
          SELECT DISTINCT ig.id_suc, ig.name_suc, ig.id_depa, ig.name_dep, ig.id_regimen, ig.name_regimen
          FROM informacion_general AS ig
          WHERE ig.id_regimen = $1 AND ig.id_suc = $2
          GROUP BY ig.id_suc, ig.name_suc, ig.id_depa, ig.name_dep, ig.id_regimen, ig.name_regimen
          ORDER BY ig.name_suc ASC
          `
          , [dep.id_regimen, dep.id_suc]
        ).then((result: any) => { return result.rows });
        return dep;
      }))
      return reg;
    }));

    let lista_departamentos = departamentos_.map((reg: any) => {
      reg.regimenes = reg.regimenes.filter((dep: any) => {
        return dep.departamentos.length > 0;
      })
      return reg;
    });

    if (lista_departamentos.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE CARGOS
    let cargos_ = await Promise.all(lista_departamentos.map(async (reg: any) => {
      reg.regimenes = await Promise.all(reg.regimenes.map(async (dep: any) => {
        dep.departamentos = await Promise.all(dep.departamentos.map(async (car: any) => {
          car.cargos = await pool.query(
            `
            SELECT ig.id_suc, ig.name_suc, ig.id_cargo_, ig.name_cargo, ig.id_depa, ig.name_dep, ig.id_regimen,
              ig.name_regimen
            FROM informacion_general AS ig
            WHERE ig.id_depa = $1 AND ig.id_suc = $2 AND ig.id_regimen = $3
            GROUP BY ig.id_suc, ig.name_suc, ig.id_cargo_, ig.name_cargo, ig.id_depa, ig.name_dep, ig.id_regimen, 
              ig.name_regimen
            ORDER BY ig.name_suc ASC
            `
            , [car.id_depa, car.id_suc, car.id_regimen]
          ).then((result: any) => { return result.rows });
          return car;
        }))
        return dep;
      }))
      return reg;
    }));

    let lista_cargos = cargos_.map((reg: any) => {
      reg.regimenes = reg.regimenes.filter((dep: any) => {
        dep.departamentos = dep.departamentos.filter((car: any) => {
          return car.cargos.length > 0;
        })
        return dep;
      })
      return reg;
    });

    if (lista_cargos.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE COLABORADORES POR CARGO
    let lista = await Promise.all(lista_cargos.map(async (reg: any) => {
      reg.regimenes = await Promise.all(reg.regimenes.map(async (dep: any) => {
        dep.departamentos = await Promise.all(dep.departamentos.map(async (car: any) => {
          car.cargos = await Promise.all(car.cargos.map(async (empl: any) => {
            empl.empleado = await pool.query(
              `
              SELECT ig.*, u.usuario, u.app_habilita, u.id AS userid
              FROM informacion_general AS ig, eu_usuarios AS u 
              WHERE ig.id_cargo_= $1 AND ig.id_suc = $2 AND ig.estado = $3
                AND ig.id_depa = $4 AND ig.id_regimen = $5 AND u.id_empleado = ig.id
                AND u.app_habilita = $6
              `
              , [empl.id_cargo_, empl.id_suc, estado, empl.id_depa, empl.id_regimen, habilitado])
              .then((result: any) => { return result.rows });
            return empl;
          }));
          return car;
        }))
        return dep;
      }))
      return reg;
    }))

    let empleados = lista.map((reg: any) => {
      reg.regimenes = reg.regimenes.filter((dep: any) => {
        dep.departamentos = dep.departamentos.filter((car: any) => {
          car.cargos = car.cargos.filter((empl: any) => {
            return empl.empleado.length > 0;
          })
          return car;
        }).filter((car: any) => {
          return car.cargos.length > 0;
        });
        return dep;
      }).filter((dep: any) => {
        return dep.departamentos.length > 0;
      });
      return reg;
    }).filter((reg: any) => {
      return reg.regimenes.length > 0;
    });

    if (empleados.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' })

    return res.status(200).jsonp(empleados);
  }

  // METODO PARA LEER DATOS PERFIL ADMINISTRADOR JEFE
  public async UsuariosTimbreMovil_JEFE(req: Request, res: Response) {
    let estado = req.params.estado;
    let habilitado = req.params.habilitado;
    let { id_sucursal, id_departamento } = req.body;

    // CONSULTA DE BUSQUEDA DE SUCURSALES
    let sucursal_ = await pool.query(
      "SELECT ig.id_suc, ig.name_suc " +
      "FROM informacion_general AS ig " +
      "WHERE ig.id_suc IN (" + id_sucursal + ")" +
      "GROUP BY ig.id_suc, ig.name_suc " +
      "ORDER BY ig.name_suc ASC"
    ).then((result: any) => { return result.rows });

    if (sucursal_.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE REGIMEN
    let regimen_ = await Promise.all(sucursal_.map(async (reg: any) => {
      reg.regimenes = await pool.query(
        `
        SELECT ig.id_suc, ig.name_suc, ig.id_regimen, ig.name_regimen
        FROM informacion_general AS ig
        WHERE ig.id_suc = $1
        GROUP BY ig.id_suc, ig.name_suc, ig.id_regimen, ig.name_regimen
        ORDER BY ig.name_suc ASC
        `
        , [reg.id_suc]
      ).then((result: any) => { return result.rows });
      return reg;
    }));

    let lista_regimen = regimen_.filter((obj: any) => {
      return obj.regimenes.length > 0
    });

    if (lista_regimen.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE DEPARTAMENTOS
    let departamentos_ = await Promise.all(lista_regimen.map(async (reg: any) => {
      reg.regimenes = await Promise.all(reg.regimenes.map(async (dep: any) => {
        dep.departamentos = await pool.query(
          "SELECT DISTINCT ig.id_suc, ig.name_suc, ig.id_depa, ig.name_dep, ig.id_regimen, ig.name_regimen " +
          "FROM informacion_general AS ig " +
          "WHERE ig.id_regimen = $1 AND ig.id_suc = $2 AND ig.id_depa IN (" + id_departamento + ")" +
          "GROUP BY ig.id_suc, ig.name_suc, ig.id_depa, ig.name_dep, ig.id_regimen, ig.name_regimen " +
          "ORDER BY ig.name_suc ASC"
          , [dep.id_regimen, dep.id_suc]
        ).then((result: any) => { return result.rows });
        return dep;
      }))
      return reg;
    }));

    let lista_departamentos = departamentos_.map((reg: any) => {
      reg.regimenes = reg.regimenes.filter((dep: any) => {
        return dep.departamentos.length > 0;
      })
      return reg;
    });

    if (lista_departamentos.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE CARGOS
    let cargos_ = await Promise.all(lista_departamentos.map(async (reg: any) => {
      reg.regimenes = await Promise.all(reg.regimenes.map(async (dep: any) => {
        dep.departamentos = await Promise.all(dep.departamentos.map(async (car: any) => {
          car.cargos = await pool.query(
            `
            SELECT ig.id_suc, ig.name_suc, ig.id_cargo_, ig.name_cargo, ig.id_depa, ig.name_dep, ig.id_regimen,
              ig.name_regimen
            FROM informacion_general AS ig
            WHERE ig.id_depa = $1 AND ig.id_suc = $2 AND ig.id_regimen = $3
            GROUP BY ig.id_suc, ig.name_suc, ig.id_cargo_, ig.name_cargo, ig.id_depa, ig.name_dep, ig.id_regimen, 
              ig.name_regimen
            ORDER BY ig.name_suc ASC
            `
            , [car.id_depa, car.id_suc, car.id_regimen]
          ).then((result: any) => { return result.rows });
          return car;
        }))
        return dep;
      }))
      return reg;
    }));

    let lista_cargos = cargos_.map((reg: any) => {
      reg.regimenes = reg.regimenes.filter((dep: any) => {
        dep.departamentos = dep.departamentos.filter((car: any) => {
          return car.cargos.length > 0;
        })
        return dep;
      })
      return reg;
    });

    if (lista_cargos.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE COLABORADORES POR CARGO
    let lista = await Promise.all(lista_cargos.map(async (reg: any) => {
      reg.regimenes = await Promise.all(reg.regimenes.map(async (dep: any) => {
        dep.departamentos = await Promise.all(dep.departamentos.map(async (car: any) => {
          car.cargos = await Promise.all(car.cargos.map(async (empl: any) => {
            empl.empleado = await pool.query(
              `
              SELECT ig.*, u.usuario, u.app_habilita, u.id AS userid
              FROM informacion_general AS ig, eu_usuarios AS u 
              WHERE ig.id_cargo_= $1 AND ig.id_suc = $2 AND ig.estado = $3
                AND ig.id_depa = $4 AND ig.id_regimen = $5 AND u.id_empleado = ig.id
                AND u.app_habilita = $6
              `
              , [empl.id_cargo_, empl.id_suc, estado, empl.id_depa, empl.id_regimen, habilitado])
              .then((result: any) => { return result.rows });
            return empl;
          }));
          return car;
        }))
        return dep;
      }))
      return reg;
    }))

    let empleados = lista.map((reg: any) => {
      reg.regimenes = reg.regimenes.filter((dep: any) => {
        dep.departamentos = dep.departamentos.filter((car: any) => {
          car.cargos = car.cargos.filter((empl: any) => {
            return empl.empleado.length > 0;
          })
          return car;
        }).filter((car: any) => {
          return car.cargos.length > 0;
        });
        return dep;
      }).filter((dep: any) => {
        return dep.departamentos.length > 0;
      });
      return reg;
    }).filter((reg: any) => {
      return reg.regimenes.length > 0;
    });

    if (empleados.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' })

    return res.status(200).jsonp(empleados);
  }

  // METODO PARA ACTUALIZAR ESTADO DE TIMBRE MOVIL
  public async ActualizarEstadoTimbreMovil(req: Request, res: Response) {
    try {
      const {array, user_name, ip} = req.body;

      if (array.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registros.' })

      const nuevo = await Promise.all(array.map(async (o: any) => {

        try {
          // INICIA TRANSACCION
          await pool.query('BEGIN');

          // CONSULTA DATOSORIGINALES
          const consulta = await pool.query(`SELECT * FROM eu_usuarios WHERE id = $1`, [o.userid]);
          const [datosOriginales] = consulta.rows;

          if (!datosOriginales) {
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'eu_usuarios',
              usuario: user_name,
              accion: 'U',
              datosOriginales: '',
              datosNuevos: '',
              ip,
              observacion: `Error al actualizar usuario con id: ${o.userid}. Registro no encontrado.`
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.status(404).jsonp({ message: 'Registro no encontrado.' });
          }

          const [result] = await pool.query(
            `
            UPDATE eu_usuarios SET app_habilita = $1 WHERE id = $2 RETURNING id
            `
            , [!o.app_habilita, o.userid])
            .then((result: any) => { return result.rows });

          // AUDITORIA
          await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'eu_usuarios',
            usuario: user_name,
            accion: 'U',
            datosOriginales: JSON.stringify(datosOriginales),
            datosNuevos: `{"app_habilita": ${!o.app_habilita}}`,
            ip,
            observacion: null
          });

          // FINALIZAR TRANSACCION
          await pool.query('COMMIT');

          return result
        } catch (error) {
          // REVERTIR TRANSACCION
          await pool.query('ROLLBACK');
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
        FROM mrv_dispositivos AS d 
        INNER JOIN eu_empleados AS e ON d.codigo_empleado = e.codigo
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
      const { user_name, ip } = req.body;

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
              ip,
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
            ip,
            observacion: null
          });

          // FINALIZAR TRANSACCION
          await pool.query('COMMIT');

          return result
        } catch (error) {
          // REVERTIR TRANSACCION
          await pool.query('ROLLBACK');
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
    const {user_name, ip} = req.body;
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
          ip,
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
        ip,
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

  // BUSCAR LISTA DE ID_SUCURSAL DE ASIGNACION USUARIO - DEPARTAMENTO
  public async BuscarUsuarioSucursal(req: Request, res: Response) {
    const { id_empleado } = req.body;
    const USUARIOS = await pool.query(
      `
      SELECT DISTINCT d.id_sucursal
      FROM eu_usuario_departamento AS ud
      JOIN ed_departamentos AS d ON ud.id_departamento = d.id 
      WHERE id_empleado = $1
      `,
      [id_empleado]
    );
    if (USUARIOS.rowCount != 0) {
      return res.jsonp(USUARIOS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }


  // CREAR REGISTRO DE USUARIOS - DEPARTAMENTO
  public async CrearUsuarioDepartamento(req: Request, res: Response) {
    try {
      const { id_empleado, id_departamento, principal, personal, administra, user_name, ip } = req.body
      
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
        ip,
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

  //BUSCAR DATOS DE USUARIOS - DEPARTAMENTO
  public async BuscarUsuarioDepartamento(req: Request, res: Response) {
    const { id_empleado } = req.body;
    const USUARIOS = await pool.query(
      `
      SELECT ud.id, e.nombre, e.apellido, d.nombre AS departamento, d.id AS id_departamento, 
      s.id AS id_sucursal, s.nombre AS sucursal, ud.principal, ud.personal, ud.administra
      FROM eu_usuario_departamento AS ud
      INNER JOIN eu_empleados AS e ON ud.id_empleado=e.id
      INNER JOIN ed_departamentos AS d ON ud.id_departamento=d.id
      INNER JOIN e_sucursales AS s ON d.id_sucursal=s.id
      WHERE id_empleado = $1
      ORDER BY ud.id ASC
      `,[id_empleado]
    );
    if (USUARIOS.rowCount != 0) {
      return res.jsonp(USUARIOS.rows)
    }
    else {
      return res.jsonp(null);
    }
  }

  // BUSCAR ASIGNACION DE USUARIO - DEPARTAMENTO
  public async BuscarAsignacionUsuarioDepartamento(req: Request, res: Response) {
    const { id_empleado } = req.body;
    const USUARIOS = await pool.query(
      `
      SELECT * FROM eu_usuario_departamento WHERE id_empleado = $1 
      AND principal = true
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

  // ACTUALIZAR DATOS DE USUARIOS - DEPARTAMENTO
  public async ActualizarUsuarioDepartamento(req: Request, res: Response): Promise<Response> {
    try {
      const { id, id_departamento, principal, personal, administra, user_name, ip } = req.body;

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
          ip,
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
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro actualizado.' });
    }
    catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.jsonp({ message: 'error' });
    }
  }

  // METODO PARA ELIMINAR ASIGNACIONES DE USUARIO - DEPARTAMENTO
  public async EliminarUsuarioDepartamento(req: Request, res: Response): Promise<Response> {
    try {
      const { user_name, ip, id } = req.body;

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
          ip,
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
        ip,
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
}

export const USUARIO_CONTROLADOR = new UsuarioControlador();

export default USUARIO_CONTROLADOR;