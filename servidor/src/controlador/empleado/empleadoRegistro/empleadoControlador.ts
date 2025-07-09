// SECCION LIBRERIAS
import AUDITORIA_CONTROLADOR from '../../reportes/auditoriaControlador';
import FUNCIONES_LLAVES from '../../../controlador/llaves/rsa-keys.service';
import { ObtenerRuta, ObtenerRutaUsuario, ObtenerRutaVacuna, ObtenerRutaPermisos, ObtenerRutaContrato, ObtenerIndicePlantilla } from '../../../libs/accesoCarpetas';
import { ObtenerRutaLeerPlantillas } from '../../../libs/accesoCarpetas';
import { ConvertirImagenBase64 } from '../../../libs/ImagenCodificacion';
import { Request, Response } from 'express';
import { FormatearFecha2 } from '../../../libs/settingsMail';
import { QueryResult } from 'pg';
import { DateTime } from 'luxon';
import Excel from 'exceljs';
import pool from '../../../database';
import path from 'path';
import sharp from 'sharp';
import fs from 'fs';

class EmpleadoControlador {

  /** ** ********************************************************************************************* ** 
   ** ** **                        MANEJO DE CODIGOS DE USUARIOS                                    ** ** 
   ** ** ********************************************************************************************* **/

  // BUSQUEDA DE CODIGO DEL EMPLEADO   **USADO
  public async ObtenerCodigo(req: Request, res: Response): Promise<any> {
    const VALOR = await pool.query(
      `
      SELECT * FROM e_codigo
      `
    );
    if (VALOR.rowCount != 0) {
      return res.jsonp(VALOR.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }
  }

  // CREAR CODIGO DE EMPLEADO    **USADO
  public async CrearCodigo(req: Request, res: Response) {
    try {
      const { id, valor, automatico, manual, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      const datos = await pool.query(
        `
        INSERT INTO e_codigo (id, valor, automatico, manual) VALUES ($1, $2, $3, $4) RETURNING *
        `
        , [id, valor, automatico, manual]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'e_codigo',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: JSON.stringify(datos.rows[0]),
        ip: ip,
        ip_local: ip_local,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      res.jsonp({ message: 'Registro guardado.' });

    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      res.status(500).jsonp({ message: 'Error al guardar código.' });
    }
  }

  // BUSQUEDA DEL ULTIMO CODIGO REGISTRADO EN EL SISTEMA   **USADO
  public async ObtenerMAXCodigo(req: Request, res: Response): Promise<any> {
    try {
      const VALOR = await pool.query(
        `
        SELECT MAX(codigo::BIGINT) AS codigo FROM eu_empleados
        `
      );
      if (VALOR.rowCount != 0) {
        return res.jsonp(VALOR.rows)
      }
      else {
        return res.status(404).jsonp({ text: 'Registros no encontrados.' });
      }
    } catch (error) {
      return res.status(404).jsonp({ text: 'Error al obtener código máximo.' });
    }

  }

  // METODO PARA ACTUALIZAR INFORMACION DE CODIGOS   **USADO
  public async ActualizarCodigoTotal(req: Request, res: Response): Promise<Response> {
    try {

      const { valor, automatico, manual, identificacion, id, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const codigo = await pool.query(
        `
        SELECT * FROM e_codigo WHERE id = $1
        `
        , [id]);
      const [datosOriginales] = codigo.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'e_codigo',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al actualizar código con id: ${id}`
        });

        //FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Error al actualizar código' });
      }

      const datosNuevos = await pool.query(
        `
        UPDATE e_codigo SET valor = $1, automatico = $2, manual = $3 , cedula = $4 WHERE id = $5 RETURNING *
        `
        , [valor, automatico, manual, identificacion, id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'e_codigo',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: JSON.stringify(datosNuevos.rows[0]),
        ip: ip,
        ip_local: ip_local,
        observacion: null
      });

      //FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro actualizado.' });

    } catch (error) {
      //REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'Error al actualizar código.' });
    }
  }

  // METODO PARA ACTUALIZAR CODIGO DE EMPLEADO   **USADO
  public async ActualizarCodigo(req: Request, res: Response): Promise<Response> {
    try {
      const { valor, id, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const codigo = await pool.query(
        `
        SELECT * FROM e_codigo WHERE id = $1
        `
        , [id]);
      const [datosOriginales] = codigo.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'e_codigo',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al actualizar código con id: ${id}`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Error al actualizar código' });
      }

      const datosNuevos = await pool.query(
        `
        UPDATE e_codigo SET valor = $1 WHERE id = $2 RETURNING *
        `
        , [valor, id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'e_codigo',
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

    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'Error al actualizar código.' });
    }
  }


  /** ********************************************************************************************* ** 
   ** **                         MANEJO DE DATOS DE EMPLEADO                                     ** ** 
   ** ********************************************************************************************* **/

  // BUSQUEDA DE UN SOLO EMPLEADO  **USADO
  public async BuscarEmpleado(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const EMPLEADO = await pool.query(
      `
        SELECT e.*, r.nombre AS rol FROM eu_empleados e
        INNER JOIN eu_usuarios u ON e.id = u.id_empleado 
        INNER JOIN ero_cat_roles r ON u.id_rol = r.id
        WHERE e.id = $1
      `
      , [id]);
    if (EMPLEADO.rowCount != 0) {
      return res.jsonp(EMPLEADO.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }

  // INGRESAR REGISTRO DE EMPLEADO EN BASE DE DATOS    **USADO
  public async InsertarEmpleado(req: Request, res: Response) {
    try {
      const { identificacion, apellido, nombre, esta_civil, genero, correo, fec_nacimiento, estado,
        domicilio, telefono, id_nacionalidad, codigo, tipo_identificacion, user_name, ip, ip_local, numero_partida_individual } = req.body;
      const numero_partida_individual_final = numero_partida_individual === '' ? null : numero_partida_individual;
      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      const response: QueryResult = await pool.query(
        `
        INSERT INTO eu_empleados (identificacion, apellido, nombre, estado_civil, genero, correo, 
          fecha_nacimiento, estado, domicilio, telefono, id_nacionalidad, codigo, tipo_identificacion, numero_partida_individual) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *
        `
        , [identificacion, apellido, nombre, esta_civil, genero, correo, fec_nacimiento, estado, domicilio,
          telefono, id_nacionalidad, codigo, tipo_identificacion, numero_partida_individual_final]);

      const [empleado] = response.rows;

      const fechaNacimiento = await FormatearFecha2(fec_nacimiento, 'ddd');

      empleado.fecha_nacimiento = fechaNacimiento;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eu_empleados',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: JSON.stringify(empleado),
        ip: ip,
        ip_local: ip_local,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');

      if (empleado) {
        return res.status(200).jsonp(empleado);
      }
      else {
        return res.status(404).jsonp({ message: 'error' })
      }

    }
    catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' });
    }
  }

  // ACTUALIZAR INFORMACION EL EMPLEADO    **USADO
  public async EditarEmpleado(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const { identificacion, apellido, nombre, esta_civil, genero, correo, fec_nacimiento, estado,
        domicilio, telefono, id_nacionalidad, codigo, user_name, ip, ip_local, numero_partida_individual, tipo_identificacion } = req.body;
      const partidaFinal = numero_partida_individual === '' ? null : numero_partida_individual;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const empleado = await pool.query(
        `
          SELECT * FROM eu_empleados WHERE id = $1
        `
        , [id]);

      const [datosOriginales] = empleado.rows;
      const codigoAnterior = datosOriginales.codigo;
      const cedulaAnterior = datosOriginales.identificacion;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eu_empleados',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al actualizar empleado con id: ${id}`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Error al actualizar empleado' });
      }

      const datosNuevos = await pool.query(
        `
        UPDATE eu_empleados SET identificacion = $2, apellido = $3, nombre = $4, estado_civil = $5, 
          genero = $6, correo = $7, fecha_nacimiento = $8, estado = $9, domicilio = $10, 
          telefono = $11, id_nacionalidad = $12, codigo = $13, numero_partida_individual = $14, tipo_identificacion = $15
        WHERE id = $1 RETURNING *
        `
        , [id, identificacion, apellido, nombre, esta_civil, genero, correo, fec_nacimiento, estado,
          domicilio, telefono, id_nacionalidad, codigo, partidaFinal, tipo_identificacion]);

      const fechaNacimientoO = await FormatearFecha2(datosOriginales.fecha_nacimiento, 'ddd');
      const fechaNacimientoN = await FormatearFecha2(datosNuevos.rows[0].fecha_nacimiento, 'ddd');

      datosOriginales.fecha_nacimiento = fechaNacimientoO;
      datosNuevos.rows[0].fecha_nacimiento = fechaNacimientoN;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eu_empleados',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: JSON.stringify(datosNuevos.rows[0]),
        ip: ip,
        ip_local: ip_local,
        observacion: null
      });

      // VARIABLES PARA VERIFICAR RENOBRAMIENTO DE CARPETAS
      // 0 => CORRECTO 1 => ERROR
      let verificar_permisos = 0;
      let verificar_imagen = 0;
      let verificar_vacunas = 0;
      let verificar_contrato = 0;

      if (codigoAnterior !== codigo || cedulaAnterior !== identificacion) {
        // RUTA DE LA CARPETA PERMISOS DEL USUARIO
        const carpetaPermisosAnterior = await ObtenerRuta(codigoAnterior, cedulaAnterior, 'permisos');
        const carpetaPermisos = await ObtenerRutaPermisos(codigo);

        // VERIFICACION DE EXISTENCIA CARPETA PERMISOS DE USUARIO
        fs.access(carpetaPermisosAnterior, fs.constants.F_OK, (err) => {
          if (err) {
            // SI NO EXISTE LA CARPETA CON EL CODIGO ANTERIOR, NO HACER NADA
          } else {
            // SI EXISTE LA CARPETA CON EL CODIGO ANTERIOR, RENOMBRARLA CON LA RUTA DEL CODIGO NUEVO
            fs.rename(carpetaPermisosAnterior, carpetaPermisos, (err) => {
              if (err) {
                verificar_permisos = 1;
              } else {
                verificar_permisos = 0;
              }
            });
          }
        });

        // RUTA DE LA CARPETA IMAGENES DEL USUARIO
        const carpetaImagenesAnterior = await ObtenerRuta(codigoAnterior, cedulaAnterior, 'imagenesEmpleados');
        const carpetaImagenes = await ObtenerRutaUsuario(id);

        // VERIFICACION DE EXISTENCIA CARPETA IMAGENES DE USUARIO
        fs.access(carpetaImagenesAnterior, fs.constants.F_OK, (err) => {
          if (err) {
            // SI NO EXISTE LA CARPETA CON EL CODIGO ANTERIOR, NO HACER NADA
          } else {
            // SI EXISTE LA CARPETA CON EL CODIGO ANTERIOR, RENOMBRARLA CON LA RUTA DEL CODIGO NUEVO
            fs.rename(carpetaImagenesAnterior, carpetaImagenes, (err) => {
              if (err) {
                verificar_imagen = 1;
              } else {
                verificar_imagen = 0;
              }
            });
          }
        });

        // RUTA DE LA CARPETA VACUNAS DEL USUARIO
        const carpetaVacunasAnterior = await ObtenerRuta(codigoAnterior, cedulaAnterior, 'carnetVacuna');
        const carpetaVacunas = await ObtenerRutaVacuna(id);

        // VERIFICACION DE EXISTENCIA CARPETA PERMISOS DE USUARIO
        fs.access(carpetaVacunasAnterior, fs.constants.F_OK, (err) => {
          if (err) {
            // SI NO EXISTE LA CARPETA CON EL CODIGO ANTERIOR, NO HACER NADA
          } else {
            // SI EXISTE LA CARPETA CON EL CODIGO ANTERIOR, RENOMBRARLA CON LA RUTA DEL CODIGO NUEVO
            fs.rename(carpetaVacunasAnterior, carpetaVacunas, (err) => {
              if (err) {
                verificar_vacunas = 1;
              } else {
                verificar_vacunas = 0;
              }
            });
          }
        });

        // RUTA DE LA CARPETA CONTRATOS DEL USUARIO
        const carpetaContratosAnterior = await ObtenerRuta(codigoAnterior, cedulaAnterior, 'contratos');
        const carpetaContratos = await ObtenerRutaContrato(id);

        // VERIFICACION DE EXISTENCIA CARPETA CONTRATOS DE USUARIO
        fs.access(carpetaContratosAnterior, fs.constants.F_OK, (err) => {
          if (err) {
            // SI NO EXISTE LA CARPETA CON EL CODIGO ANTERIOR, NO HACER NADA
          } else {
            // SI EXISTE LA CARPETA CON EL CODIGO ANTERIOR, RENOMBRARLA CON LA RUTA DEL CODIGO NUEVO
            fs.rename(carpetaContratosAnterior, carpetaContratos, (err) => {
              if (err) {
                verificar_contrato = 1;
              } else {
                verificar_contrato = 0;
              }
            });
          }
        });
      }

      // METODO DE VERIFICACION DE MODIFICACION DE DIRECTORIOS
      const errores: Record<string, string> = {
        '1': 'permisos',
        '2': 'imagenes',
        '3': 'vacunación',
        '4': 'contratos'
      };

      const verificaciones = [verificar_permisos, verificar_imagen, verificar_vacunas, verificar_contrato];
      const mensajesError = verificaciones.map((verificacion, index) => verificacion === 1 ? errores[(index + 1).toString()] : null).filter(Boolean);

      if (mensajesError.length > 0) {
        await pool.query('ROLLBACK');
        return res.status(500).jsonp({ message: `Ups! no fue posible modificar el directorio de ${mensajesError.join(', ')} del usuario.` });

      } else {
        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.jsonp({ message: 'Registro actualizado.' });
      }

    }
    catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' });
    }
  }

  // LISTAR EMPLEADOS ACTIVOS EN EL SISTEMA    **USADO
  public async Listar(req: Request, res: Response) {
    const empleado = await pool.query(
      `
        SELECT * FROM eu_empleados WHERE estado = 1 ORDER BY id
      `
    );
    return res.jsonp(empleado.rows);
  }

  // METODO QUE LISTA EMPLEADOS INHABILITADOS   **USADO
  public async ListarEmpleadosDesactivados(req: Request, res: Response) {
    const empleado = await pool.query(
      `
      SELECT * FROM eu_empleados WHERE estado = 2 ORDER BY id
      `
    );
    res.jsonp(empleado.rows);
  }

  // METODO PARA INHABILITAR USUARIOS EN EL SISTEMA   **USADO
  public async DesactivarMultiplesEmpleados(req: Request, res: Response): Promise<any> {
    const { arrayIdsEmpleados, user_name, ip, ip_local } = req.body;

    if (arrayIdsEmpleados.length > 0) {
      for (const obj of arrayIdsEmpleados) {
        try {
          // INICIAR TRANSACCION
          await pool.query('BEGIN');

          // CONSULTAR DATOSORIGINALES
          const empleado = await pool.query(
            `SELECT * FROM eu_empleados WHERE id = $1`, [obj]);
          const [datosOriginales] = empleado.rows;

          const usuario = await pool.query(
            `SELECT * FROM eu_usuarios WHERE id_empleado = $1`, [obj]);
          const [datosOriginalesUsuario] = usuario.rows;

          if (!datosOriginales || !datosOriginalesUsuario) {
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'eu_empleados',
              usuario: user_name,
              accion: 'U',
              datosOriginales: '',
              datosNuevos: '',
              ip: ip,
              ip_local: ip_local,
              observacion: `Error al inhabilitar empleado con id: ${obj}`
            });

            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'eu_usuarios',
              usuario: user_name,
              accion: 'U',
              datosOriginales: '',
              datosNuevos: '',
              ip: ip,
              ip_local: ip_local,
              observacion: `Error al inhabilitar usuario con id_empleado: ${obj}`
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            throw new Error('Error al inhabilitar empleado con id: ' + obj);
          }

          // 2 => DESACTIVADO O INACTIVO
          await pool.query(
            `UPDATE eu_empleados SET estado = 2 WHERE id = $1`, [obj]);

          const fechaNacimientoO = await FormatearFecha2(datosOriginales.fecha_nacimiento, 'ddd');

          // AUDITORIA
          await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'eu_empleados',
            usuario: user_name,
            accion: 'U',
            datosOriginales: `{id: ${datosOriginales.id}, identificacion: ${datosOriginales.identificacion}, codigo: ${datosOriginales.codigo}, apellido: ${datosOriginales.apellido}, nombre: ${datosOriginales.nombre}, fecha_nacimiento: ${fechaNacimientoO}, estado_civil: ${datosOriginales.estado_civil}, genero: ${datosOriginales.genero}, correo: ${datosOriginales.correo}, mail_alternativo: ${datosOriginales.mail_alternativo}, estado: ${datosOriginales.estado}, domicilio: ${datosOriginales.domicilio}, telefono: ${datosOriginales.telefono}, id_nacionalidad: ${datosOriginales.id_nacionalidad}, imagen: ${datosOriginales.imagen}, longitud: ${datosOriginales.longitud}, latitud: ${datosOriginales.latitud}, web_access: ${datosOriginales.web_access}}`,
            datosNuevos: `{id: ${datosOriginales.id}, identificacion: ${datosOriginales.identificacion}, codigo: ${datosOriginales.codigo}, apellido: ${datosOriginales.apellido}, nombre: ${datosOriginales.nombre}, fecha_nacimiento: ${fechaNacimientoO}, estado_civil: ${datosOriginales.estado_civil}, genero: ${datosOriginales.genero}, correo: ${datosOriginales.correo}, mail_alternativo: ${datosOriginales.mail_alternativo}, estado: 2, domicilio: ${datosOriginales.domicilio}, telefono: ${datosOriginales.telefono}, id_nacionalidad: ${datosOriginales.id_nacionalidad}, imagen: ${datosOriginales.imagen}, longitud: ${datosOriginales.longitud}, latitud: ${datosOriginales.latitud}, web_access: ${datosOriginales.web_access}}`,
            ip: ip,
            ip_local: ip_local,
            observacion: null
          });

          // FALSE => YA NO TIENE ACCESO
          await pool.query(
            `UPDATE eu_usuarios SET estado = false, app_habilita = false WHERE id_empleado = $1`, [obj]);

          // AUDITORIA
          await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'eu_usuarios',
            usuario: user_name,
            accion: 'U',
            datosOriginales: JSON.stringify(datosOriginalesUsuario),
            datosNuevos: `{estado: false, app_habilita: false}`,
            ip: ip,
            ip_local: ip_local,
            observacion: null
          });

          // FINALIZAR TRANSACCION
          await pool.query('COMMIT');

        } catch (error) {
          // REVERTIR TRANSACCION
          await pool.query('ROLLBACK');
          console.log('error deshabilitar', error);
        }
      }

      return res.jsonp({ message: 'Usuarios inhabilitados exitosamente.' });
    }

    return res.jsonp({ message: 'Upss!!! ocurrio un error.' });
  }

  // METODO PARA HABILITAR EMPLEADOS    *USADO
  public async ActivarMultiplesEmpleados(req: Request, res: Response): Promise<any> {
    const { arrayIdsEmpleados, user_name, ip, ip_local } = req.body;

    if (arrayIdsEmpleados.length > 0) {
      for (const obj of arrayIdsEmpleados) {
        try {
          // INICIAR TRANSACCION
          await pool.query('BEGIN');

          // CONSULTAR DATOS ORIGINALES
          const empleado = await pool.query(
            `
              SELECT * FROM eu_empleados WHERE id = $1
            `,
            [obj]
          );
          const [datosOriginales] = empleado.rows;

          const usuario = await pool.query(
            `
              SELECT * FROM eu_usuarios WHERE id_empleado = $1
            `,
            [obj]
          );
          const [datosOriginalesUsuario] = usuario.rows;

          if (!datosOriginales || !datosOriginalesUsuario) {
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'eu_empleados',
              usuario: user_name,
              accion: 'U',
              datosOriginales: '',
              datosNuevos: '',
              ip: ip,
              ip_local: ip_local,
              observacion: `Error al activar empleado con id: ${obj}`
            });

            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'eu_usuarios',
              usuario: user_name,
              accion: 'U',
              datosOriginales: '',
              datosNuevos: '',
              ip: ip,
              ip_local: ip_local,
              observacion: `Error al activar usuario con id_empleado: ${obj}`
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            throw new Error('Error al activar empleado con id: ' + obj);
          }

          // 1 => ACTIVADO
          await pool.query(
            `
              UPDATE eu_empleados SET estado = 1 WHERE id = $1
            `,
            [obj]
          );

          const fechaNacimientoO = await FormatearFecha2(datosOriginales.fecha_nacimiento, 'ddd');

          // AUDITORIA
          await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'eu_empleados',
            usuario: user_name,
            accion: 'U',
            datosOriginales: `{id: ${datosOriginales.id}, identificacion: ${datosOriginales.identificacion}, codigo: ${datosOriginales.codigo}, apellido: ${datosOriginales.apellido}, nombre: ${datosOriginales.nombre}, fecha_nacimiento: ${fechaNacimientoO}, estado_civil: ${datosOriginales.estado_civil}, genero: ${datosOriginales.genero}, correo: ${datosOriginales.correo}, mail_alternativo: ${datosOriginales.mail_alternativo}, estado: ${datosOriginales.estado}, domicilio: ${datosOriginales.domicilio}, telefono: ${datosOriginales.telefono}, id_nacionalidad: ${datosOriginales.id_nacionalidad}, imagen: ${datosOriginales.imagen}, longitud: ${datosOriginales.longitud}, latitud: ${datosOriginales.latitud}, web_access: ${datosOriginales.web_access}}`,
            datosNuevos: `{id: ${datosOriginales.id}, identificacion: ${datosOriginales.identificacion}, codigo: ${datosOriginales.codigo}, apellido: ${datosOriginales.apellido}, nombre: ${datosOriginales.nombre}, fecha_nacimiento: ${fechaNacimientoO}, estado_civil: ${datosOriginales.estado_civil}, genero: ${datosOriginales.genero}, correo: ${datosOriginales.correo}, mail_alternativo: ${datosOriginales.mail_alternativo}, estado: 1, domicilio: ${datosOriginales.domicilio}, telefono: ${datosOriginales.telefono}, id_nacionalidad: ${datosOriginales.id_nacionalidad}, imagen: ${datosOriginales.imagen}, longitud: ${datosOriginales.longitud}, latitud: ${datosOriginales.latitud}, web_access: ${datosOriginales.web_access}}`,
            ip: ip,
            ip_local: ip_local,
            observacion: null
          });

          // TRUE => TIENE ACCESO
          await pool.query(
            `
              UPDATE eu_usuarios SET estado = true, app_habilita = true WHERE id_empleado = $1
            `,
            [obj]
          );

          // AUDITORIA
          await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'eu_usuarios',
            usuario: user_name,
            accion: 'U',
            datosOriginales: JSON.stringify(datosOriginalesUsuario),
            datosNuevos: `{estado: true, app_habilita: true}`,
            ip: ip,
            ip_local: ip_local,
            observacion: null
          });

          // FINALIZAR TRANSACCION
          await pool.query('COMMIT');

        } catch (error) {
          // REVERTIR TRANSACCION
          await pool.query('ROLLBACK');
          console.log('error activar', error);
        }
      }

      return res.jsonp({ message: 'Usuarios habilitados exitosamente.' });
    }
    return res.jsonp({ message: 'Upss!!! ocurrio un error.' });
  }

  // CARGAR IMAGEN DE EMPLEADO   **USADO
  public async CrearImagenEmpleado(req: Request, res: Response): Promise<void> {
    sharp.cache(false);

    try {
      // FECHA DEL SISTEMA
      const fecha = DateTime.now();
      const anio = fecha.toFormat('yyyy');
      const mes = fecha.toFormat('MM');
      const dia = fecha.toFormat('dd');

      const id = req.params.id_empleado;
      const separador = path.sep;

      const { user_name, ip, ip_local } = req.body;

      const unEmpleado = await pool.query(
        `
          SELECT * FROM eu_empleados WHERE id = $1
        `
        , [id]);

      let ruta_temporal = ObtenerRutaLeerPlantillas() + separador + req.file?.originalname;
      console.log('ruta_temporal_', ruta_temporal);
      if (unEmpleado.rowCount != 0) {
        const imagen = `${unEmpleado.rows[0].codigo}_${anio}_${mes}_${dia}_${req.file?.originalname}`;
        let verificar_imagen = 0;
        // RUTA DE LA CARPETA IMAGENES DEL USUARIO
        const carpetaImagenes = await ObtenerRutaUsuario(id);
        // VERIFICACION DE EXISTENCIA CARPETA IMAGENES DE USUARIO
        fs.access(carpetaImagenes, fs.constants.F_OK, (err) => {
          if (err) {
            // METODO MKDIR PARA CREAR LA CARPETA
            fs.mkdir(carpetaImagenes, { recursive: true }, (err: any) => {
              if (err) {
                verificar_imagen = 1;
              } else {
                verificar_imagen = 0;
              }
            });
          } else {
            verificar_imagen = 0
          }
        });

        // VERIFICAR SI LA CARPETA DE IMAGENES SE CREO
        if (verificar_imagen === 0) {
          let ruta_guardar = await ObtenerRutaUsuario(unEmpleado.rows[0].id) + separador + imagen;
          fs.access(ruta_temporal, fs.constants.F_OK, (err) => {
            if (!err) {
              sharp(ruta_temporal)
                .resize(800) // CAMBIA EL TAMAÑO DE LA IMAGEN A UN ANCHO DE 800 PIXELES, MANTIENE LA RELACION DE ASPECTO
                .jpeg({ quality: 80 }) // CONFIGURA LA CALIDAD DE LA IMAGEN JPEG AL 80%
                .toFile(ruta_guardar);
              // ELIMIAR EL ARCHIVO ORIGINAL
              setTimeout(async () => {
                fs.unlinkSync(ruta_temporal);
              }, 1000); // ESPERAR 1 SEGUNDO
            }
          })

          // VERIFICAR EXISTENCIA DE IMAGEN Y ELIMINARLA PARA ACTUALIZAR
          if (unEmpleado.rows[0].imagen && unEmpleado.rows[0].imagen !== 'null') {
            const ruta = await ObtenerRutaUsuario(unEmpleado.rows[0].id) + separador + unEmpleado.rows[0].imagen;
            fs.access(ruta, fs.constants.F_OK, (err) => {
              if (!err) {
                fs.unlinkSync(ruta);
              }
            });
          }

          // INICIAR TRANSACCION
          await pool.query('BEGIN');

          // CONSULTAR DATOSORIGINALES
          const empleado = await pool.query(
            `
              SELECT * FROM eu_empleados WHERE id = $1
            `
            , [id]);
          const [datosOriginales] = empleado.rows;

          if (!datosOriginales) {
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'eu_empleados',
              usuario: user_name,
              accion: 'U',
              datosOriginales: '',
              datosNuevos: '',
              ip: ip,
              ip_local: ip_local,
              observacion: `Error al actualizar imagen del usuario con id: ${id}. Registro no encontrado.`
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            throw new Error('Error al actualizar imagen del usuario con id: ' + id);
          }

          await pool.query(
            `
              UPDATE eu_empleados SET imagen = $2 WHERE id = $1
            `
            , [id, imagen]);

          const fechaNacimientoO = await FormatearFecha2(datosOriginales.fecha_nacimiento, 'ddd')

          // AUDITORIA
          await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'eu_empleados',
            usuario: user_name,
            accion: 'U',
            datosOriginales: `{id: ${datosOriginales.id}, identificacion: ${datosOriginales.identificacion}, codigo: ${datosOriginales.codigo}, apellido: ${datosOriginales.apellido}, nombre: ${datosOriginales.nombre}, fecha_nacimiento: ${fechaNacimientoO}, estado_civil: ${datosOriginales.estado_civil}, genero: ${datosOriginales.genero}, correo: ${datosOriginales.correo}, mail_alternativo: ${datosOriginales.mail_alternativo}, estado: ${datosOriginales.estado}, domicilio: ${datosOriginales.domicilio}, telefono: ${datosOriginales.telefono}, id_nacionalidad: ${datosOriginales.id_nacionalidad}, imagen: ${datosOriginales.imagen}, longitud: ${datosOriginales.longitud}, latitud: ${datosOriginales.latitud}, web_access: ${datosOriginales.web_access}}`,
            datosNuevos: `{id: ${datosOriginales.id}, identificacion: ${datosOriginales.identificacion}, codigo: ${datosOriginales.codigo}, apellido: ${datosOriginales.apellido}, nombre: ${datosOriginales.nombre}, fecha_nacimiento: ${fechaNacimientoO}, estado_civil: ${datosOriginales.estado_civil}, genero: ${datosOriginales.genero}, correo: ${datosOriginales.correo}, mail_alternativo: ${datosOriginales.mail_alternativo}, estado: ${datosOriginales.estado}, domicilio: ${datosOriginales.domicilio}, telefono: ${datosOriginales.telefono}, id_nacionalidad: ${datosOriginales.id_nacionalidad}, imagen: ${imagen}, longitud: ${datosOriginales.longitud}, latitud: ${datosOriginales.latitud}, web_access: ${datosOriginales.web_access}}`,
            ip: ip,
            ip_local: ip_local,
            observacion: null
          });
          // FINALIZAR TRANSACCION
          await pool.query('COMMIT');

          res.jsonp({ message: 'Imagen actualizada.' });
        }
        else {
          res.jsonp({ message: 'error' });
        }
      }

    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      res.status(500).jsonp({ message: 'Error al actualizar imagen del usuario.' });
    }
  }


  // METODO PARA CONVERTIR IMAGEN EN BASE64 **USADO
  public async CodificarImagenBase64(req: Request, res: Response): Promise<any> {
    const imagen = req.params.imagen;
    const id = req.params.id;
    let separador = path.sep;
    let ruta = await ObtenerRutaUsuario(id) + separador + imagen;
    let verificador = 0;
    fs.access(ruta, fs.constants.F_OK, (err) => {
      if (err) {
        verificador = 1;
      } else {
        verificador = 0;
      }
    });
    if (verificador === 0) {
      const codificado = ConvertirImagenBase64(ruta);
      if (codificado === 0) {
        res.status(200).jsonp({ imagen: 0 })
      } else {
        res.status(200).jsonp({ imagen: codificado })
      }
    }
    else {
      res.status(200).jsonp({ imagen: 0 })
    }
  }

  // METODO PARA ELIMINAR REGISTROS    **USADO
  public async EliminarEmpleado(req: Request, res: Response) {
    const { empleados, user_name, ip, ip_local } = req.body;
    let empleadosRegistrados: boolean = false;
    let errorEliminar: boolean = false;

    for (const e of empleados) {
      try {
        // INICIAR TRANSACCION
        await pool.query('BEGIN');

        // CONSULTAR DATOS ORIGINALES
        const usuario = await pool.query(`SELECT * FROM eu_usuarios WHERE id_empleado = $1`, [e.id]);
        const [datosOriginalesUsuarios] = usuario.rows;

        const empleado = await pool.query(`SELECT * FROM eu_empleados WHERE id = $1`, [e.id]);
        const [datosOriginalesEmpleado] = empleado.rows;

        if (!datosOriginalesUsuarios || !datosOriginalesEmpleado) {
          await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'eu_usuarios',
            usuario: user_name,
            accion: 'D',
            datosOriginales: '',
            datosNuevos: '',
            ip: ip,
            ip_local: ip_local,
            observacion: `Error al eliminar usuario con id: ${e.id}. Registro no encontrado.`
          });

          await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'eu_empleados',
            usuario: user_name,
            accion: 'D',
            datosOriginales: '',
            datosNuevos: '',
            ip: ip,
            ip_local: ip_local,
            observacion: `Error al eliminar empleado con id: ${e.id}. Registro no encontrado.`
          });

          errorEliminar = true;
          await pool.query('COMMIT');
          continue;
        }

        const datosActuales = await pool.query(`SELECT * FROM informacion_general WHERE id = $1`, [e.id]);
        const [datosActualesEmpleado] = datosActuales.rows;

        const contratos = await pool.query(`SELECT * FROM eu_empleado_contratos WHERE id_empleado = $1`, [e.id]);
        const [datosContratos] = contratos.rows;

        const titulos = await pool.query(`SELECT * FROM eu_empleado_titulos WHERE id_empleado = $1`, [e.id]);
        const [datosTitulos] = titulos.rows;

        const discapacidad = await pool.query(`SELECT * FROM eu_empleado_discapacidad WHERE id_empleado = $1`, [e.id]);
        const [datosDiscapacidad] = discapacidad.rows;

        const vacunas = await pool.query(`SELECT * FROM eu_empleado_vacunas WHERE id_empleado = $1`, [e.id]);
        const [datosVacunas] = vacunas.rows;

        if (datosActualesEmpleado || datosContratos || datosTitulos || datosDiscapacidad || datosVacunas) {
          empleadosRegistrados = true;
          continue;
        }

        // ELIMINAR USUARIO
        await pool.query(`DELETE FROM eu_usuarios WHERE id_empleado = $1`, [e.id]);

        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eu_usuarios',
          usuario: user_name,
          accion: 'D',
          datosOriginales: JSON.stringify(datosOriginalesUsuarios),
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: null
        });

        // ELIMINAR EMPLEADO
        await pool.query(`DELETE FROM eu_empleados WHERE id = $1`, [e.id]);

        const fechaNacimientoO = await FormatearFecha2(datosOriginalesEmpleado.fecha_nacimiento, 'ddd')
        datosOriginalesEmpleado.fecha_nacimiento = fechaNacimientoO;

        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eu_empleados',
          usuario: user_name,
          accion: 'D',
          datosOriginales: JSON.stringify(datosOriginalesEmpleado),
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: null
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');

      } catch (error) {
        // REVERTIR TRANSACCION
        await pool.query('ROLLBACK');
        if (error.code === '23503') {
          empleadosRegistrados = true;
        } else {
          errorEliminar = true;
        }
      }
    }

    if (errorEliminar) {
      return res.status(500).jsonp({ message: 'Ocurrió un error al eliminar usuarios.' });
    }
    if (empleadosRegistrados) {
      return res.status(404).jsonp({ message: 'No se eliminaron algunos usuarios ya que tienen información registrada.' });
    }
    return res.jsonp({ message: 'Usuarios eliminados correctamente.' });
  }

  // BUSQUEDA DE INFORMACION ESPECIFICA DE EMPLEADOS
  public async ListarBusquedaEmpleados(req: Request, res: Response): Promise<any> {
    const empleado = await pool.query(
      `
      SELECT id, nombre, apellido FROM eu_empleados ORDER BY apellido
      `
    ).then((result: any) => {
      return result.rows.map((obj: any) => {
        return {
          id: obj.id,
          empleado: obj.apellido + ' ' + obj.nombre
        }
      })
    })

    res.jsonp(empleado);
  }

  // BUSQUEDA DE DATOS DE EMPLEADO INGRESANDO EL NOMBRE
  public async BuscarEmpleadoNombre(req: Request, res: Response): Promise<any> {
    const { informacion } = req.body;
    console.log('informacion: ',informacion)
    const EMPLEADO = await pool.query(
      `
        SELECT * FROM informacion_general WHERE
        ((UPPER (apellido) || \' \' || UPPER (nombre)) = $1) OR
        ((UPPER (nombre) || \' \' || UPPER (apellido)) = $1)
      `
      , [informacion]);
    if (EMPLEADO.rowCount != 0) {
      return res.jsonp(EMPLEADO.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }

  // METODO PARA CREAR CARPETAS DE ALMACENAMIENTO    **USADO
  public async CrearCarpetasEmpleado(req: Request, res: Response) {
    const { empleados, permisos, vacaciones, horasExtras } = req.body;
    let errorOccurred = false;

    for (const e of empleados) {
      const { codigo, identificacion } = e;

      if (permisos) {
        const carpetaPermisos = await ObtenerRuta(codigo, identificacion, 'permisos');
        try {
          await fs.promises.access(carpetaPermisos, fs.constants.F_OK);
        } catch (error) {
          try {
            await fs.promises.mkdir(carpetaPermisos, { recursive: true });
          } catch (error) {
            errorOccurred = true;
          }
        }
      }

      if (vacaciones) {
        const carpetaVacaciones = await ObtenerRuta(codigo, identificacion, 'vacaciones');
        try {
          await fs.promises.access(carpetaVacaciones, fs.constants.F_OK);
        } catch (error) {
          try {
            await fs.promises.mkdir(carpetaVacaciones, { recursive: true });
          } catch (error) {
            errorOccurred = true;
          }
        }
      }

      if (horasExtras) {
        const carpetaHorasExtras = await ObtenerRuta(codigo, identificacion, 'horasExtras');
        try {
          await fs.promises.access(carpetaHorasExtras, fs.constants.F_OK);
        } catch (error) {
          try {
            await fs.promises.mkdir(carpetaHorasExtras, { recursive: true });
          } catch (error) {
            errorOccurred = true;
          }
        }
      }
    }

    if (errorOccurred) {
      res.status(500).jsonp({ message: 'Ups! se produjo un error al crear las carpetas.' });
    } else {
      res.jsonp({ message: 'Carpetas creadas con éxito.' });
    }
  }

  // METODO PARA CONSULTAR INFORMACION DE CONTRATOS   **USADO
  public async getContratosCargos(req: Request, res: Response) {
    const { id_empleado } = req.body
    try {

      var listaCargos: any = [];
      var listaContratos: any = []

      const contratos: QueryResult = await pool.query(
        `
        SELECT 
	        emC.id, emC.id_empleado as id_empleado, emC.id_modalidad_laboral, 
          moda.descripcion, emC.fecha_ingreso, emC.fecha_salida, emC.controlar_vacacion, 
          emC.controlar_asistencia,  reg.descripcion as regimen
        FROM eu_empleado_contratos AS emC, e_cat_modalidad_trabajo AS moda, ere_cat_regimenes AS reg
        WHERE 
	        emc.id_empleado = $1 AND
	        moda.id = emC.id_modalidad_laboral AND
			    reg.id = emc.id_regimen
        `, [id_empleado]);
      listaContratos = contratos.rows;

      listaContratos.forEach(async (item: any) => {
        const cargos: QueryResult = await pool.query(
          `
          SELECT 
            emC.id, emC.id_contrato as contrato, emC.id_departamento, ed.nombre, su.nombre as sucursal, 
            emC.id_tipo_cargo, carg.cargo, emC.fecha_inicio, emC.fecha_final, emC.sueldo, emC.hora_trabaja,
            emC.jefe, emC.estado
          FROM 
            eu_empleado_cargos AS emC, ed_departamentos AS ed, 
            e_sucursales AS su, e_cat_tipo_cargo AS carg
          WHERE 
            emc.id_contrato = $1 AND
            ed.id = emC.id_departamento AND
            su.id = ed.id_sucursal AND
            carg.id = emC.id_tipo_cargo
          `, [item.id]);

        const Cargos = cargos.rows;
        Cargos.forEach((item: any) => {
          listaCargos.push(item);
        })

      })

      setTimeout(() => {
        return res.status(200).jsonp({ listacontratos: listaContratos, listacargos: listaCargos });
      }, 2000);

    } catch (error) {
      console.log(error);
      return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
  }

  // BUSQUEDA DE IMAGEN DE EMPLEADO
  public async BuscarImagen(req: Request, res: Response): Promise<any> {
    const imagen = req.params.imagen;
    const id = req.params.id;
    let separador = path.sep;
    let ruta = await ObtenerRutaUsuario(id) + separador + imagen;
    fs.access(ruta, fs.constants.F_OK, (err) => {
      if (err) {
      } else {
        res.sendFile(path.resolve(ruta));
      }
    });
  }

  /** **************************************************************************************** **
   ** **                      CARGAR INFORMACION MEDIANTE PLANTILLA                            ** 
   ** **************************************************************************************** **/

  // METODO PARA VERIFICAR PLANTILLA CODIGO AUTOMATICO    **USADO
  public async VerificarPlantilla_Automatica(req: Request, res: Response) {
    try {
      const documento = req.file?.originalname;
      let separador = path.sep;
      let ruta = ObtenerRutaLeerPlantillas() + separador + documento;
      const workbook = new Excel.Workbook();
      await workbook.xlsx.readFile(ruta);
      let verificador = ObtenerIndicePlantilla(workbook, 'EMPLEADOS');
      const modoCodigo = req.body.modoCodigo || 'automatico';
      if (verificador === false) {
        return res.jsonp({ message: 'no_existe', data: undefined });
      }
      else {
        const sheet_name_list = workbook.worksheets.map(sheet => sheet.name);
        const plantilla = workbook.getWorksheet(sheet_name_list[verificador]);
        let data: any = {
          fila: '',
          identificacion: '',
          apellido: '',
          nombre: '',
          estado_civil: '',
          genero: '',
          correo: '',
          fec_nacimiento: '',
          latitud: '',
          longitud: '',
          domicilio: '',
          telefono: '',
          nacionalidad: '',
          usuario: '',
          contrasena: '',
          rol: '',
          observacion: '',
          tipo_identificacion: '',
          numero_partida_individual: '',
        };
        //OBTIENE DATOS DE LA BASE PARA VALIDACIONES
        var ARREGLO_ESTADO_CIVIL = await pool.query(`SELECT * FROM e_estado_civil`);
        let lista_estados = ARREGLO_ESTADO_CIVIL.rows
        const estadoCivilArray: string[] = lista_estados.map(item => item.estado_civil.toUpperCase());
        var ARREGLO_GENERO = await pool.query(`SELECT * FROM e_genero`);
        let lista_generos = ARREGLO_GENERO.rows
        const tipogenero: string[] = lista_generos.map(item => item.genero.toUpperCase());
        // VALIDA SI LOS DATOS DE LA COLUMNA CEDULA SON NUMEROS.
        const regex = /^[0-9]+$/;
        // VALIDA EL FORMATO DEL CORREO: XXXXXXX@XXXXXXXXX.XXX
        const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const valiContra = /\s/;
        // Expresión regular para validar la latitud y longitud
        const regexLatitud = /^-?([1-8]?\d(\.\d+)?|90(\.0+)?)$/;
        const regexLongitud = /^-?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;

        var listEmpleados: any = [];
        var duplicados1: any = [];
        var duplicados2: any = [];
        var mensaje: string = 'correcto';
        if (plantilla) {
          // SUPONIENDO QUE LA PRIMERA FILA SON LAS CABECERAS
          const headerRow = plantilla.getRow(1);
          const headers: any = {};
          // CREAR UN MAPA CON LAS CABECERAS Y SUS POSICIONES, ASEGURANDO QUE LAS CLAVES ESTEN EN MAYUSCULAS
          headerRow.eachCell((cell: any, colNumber) => {
            headers[cell.value.toString().toUpperCase()] = colNumber;
          });
          // VERIFICA SI LAS CABECERAS ESENCIALES ESTAN PRESENTES
          if (!headers['ITEM'] || !headers['IDENTIFICACION'] || !headers['APELLIDO'] ||
            !headers['NOMBRE'] || !headers['USUARIO'] || !headers['CONTRASENA'] ||
            !headers['ROL'] || !headers['ESTADO_CIVIL'] || !headers['GENERO'] ||
            !headers['CORREO'] || !headers['FECHA_NACIMIENTO'] || !headers['LATITUD'] ||
            !headers['DOMICILIO'] || !headers['TELEFONO'] ||
            !headers['LONGITUD'] || !headers['NACIONALIDAD'] || !headers['TIPO_IDENTIFICACION'] || !headers['NUMERO_PARTIDA_INDIVIDUAL']
          ) {
            return res.jsonp({ message: 'Cabeceras faltantes', data: undefined });
          }

          for (let rowNumber = 2; rowNumber <= plantilla.rowCount; rowNumber++) {
            const row = plantilla.getRow(rowNumber);
            if (!row || row.hasValues === false) continue;
            // SALTAR LA FILA DE LAS CABECERAS
            if (rowNumber === 1) return;
            // LEER LOS DATOS SEGUN LAS COLUMNAS ENCONTRADAS
            const ITEM = row.getCell(headers['ITEM']).value;
            const IDENTIFICACION = row.getCell(headers['IDENTIFICACION']).value?.toString();
            const APELLIDO = row.getCell(headers['APELLIDO']).value?.toString();
            const NOMBRE = row.getCell(headers['NOMBRE']).value?.toString();
            const USUARIO = row.getCell(headers['USUARIO']).value?.toString();
            const CONTRASENA = row.getCell(headers['CONTRASENA']).value?.toString();
            const ROL = row.getCell(headers['ROL']).value?.toString();
            const ESTADO_CIVIL = row.getCell(headers['ESTADO_CIVIL']).value?.toString();
            const GENERO = row.getCell(headers['GENERO']).value?.toString();
            const FECHA_NACIMIENTO = row.getCell(headers['FECHA_NACIMIENTO']).value?.toString();
            const LATITUD = row.getCell(headers['LATITUD']).value?.toString();
            const LONGITUD = row.getCell(headers['LONGITUD']).value?.toString();
            const DOMICILIO = row.getCell(headers['DOMICILIO']).value?.toString();
            const TELEFONO = row.getCell(headers['TELEFONO']).value?.toString();
            const NACIONALIDAD = row.getCell(headers['NACIONALIDAD']).value?.toString();
            const TIPO_IDENTIFICACION = row.getCell(headers['TIPO_IDENTIFICACION']).value?.toString();
            const NUMERO_PARTIDA_INDIVIDUAL = row.getCell(headers['NUMERO_PARTIDA_INDIVIDUAL']).value?.toString();
            let CORREO = row.getCell(headers['CORREO']).value;
            if (typeof CORREO === 'object' && CORREO !== null) {
              if ('text' in CORREO) {
                CORREO = CORREO.text;
              } else {
                CORREO = '';
              }
            }
            CORREO = CORREO?.toString();
            // VERIFICAR QUE EL REGISTO NO TENGA DATOS VACIOS
            if (
              ITEM != undefined && ITEM != '' &&
              IDENTIFICACION != undefined && APELLIDO != undefined &&
              NOMBRE != undefined && ESTADO_CIVIL != undefined &&
              GENERO != undefined && CORREO != undefined &&
              FECHA_NACIMIENTO != undefined && LATITUD != undefined &&
              LONGITUD != undefined && DOMICILIO != undefined &&
              TELEFONO != undefined && NACIONALIDAD != undefined &&
              USUARIO != undefined && CONTRASENA != undefined &&
              ROL != undefined && TIPO_IDENTIFICACION != undefined &&
              NUMERO_PARTIDA_INDIVIDUAL != undefined
            ) {
              data.fila = ITEM;
              data.identificacion = IDENTIFICACION;
              data.nombre = NOMBRE;
              data.apellido = APELLIDO;
              data.usuario = USUARIO;
              data.contrasena = CONTRASENA;
              data.rol = ROL;
              data.estado_civil = ESTADO_CIVIL;
              data.genero = GENERO;
              data.correo = CORREO;
              data.fec_nacimiento = FECHA_NACIMIENTO;
              data.latitud = LATITUD;
              data.longitud = LONGITUD;
              data.domicilio = DOMICILIO;
              data.telefono = TELEFONO;
              data.nacionalidad = NACIONALIDAD;
              data.tipo_identificacion = TIPO_IDENTIFICACION?.trim();
              data.numero_partida_individual = NUMERO_PARTIDA_INDIVIDUAL.trim();
              data.observacion = 'no registrado';

              //METODO QUE VALIDA LOS DATOS CUANDO LA FILA TIENE LOS DATOS COMPLETOS
              await validarEmpleadoCompleto(
                data,
                regex,
                regexCorreo,
                valiContra,
                regexLatitud,
                regexLongitud,
                estadoCivilArray,
                tipogenero,
                TIPO_IDENTIFICACION ?? 'No registrado',
                pool,
                TELEFONO ?? '',
                LONGITUD ?? '',
                LATITUD ?? '',
                ValidarCedula,
                modoCodigo
              );
              listEmpleados.push(data);
            }
            else {
              //METODO QUE VALIDA LOS DATOS CUANDO LA FILA TIENE LOS DATOS INCOMPLETOS
              await validarEmpleadoIncompleto(
                data,
                ITEM,
                IDENTIFICACION,
                APELLIDO,
                NOMBRE,
                ESTADO_CIVIL,
                GENERO,
                CORREO,
                FECHA_NACIMIENTO,
                LATITUD,
                LONGITUD,
                DOMICILIO,
                TELEFONO,
                NACIONALIDAD,
                USUARIO,
                CONTRASENA,
                ROL,
                TIPO_IDENTIFICACION,
                NUMERO_PARTIDA_INDIVIDUAL,
                regex,
                regexCorreo,
                valiContra,
                regexLatitud,
                regexLongitud,
                estadoCivilArray,
                tipogenero,
                pool,
                ValidarCedula,
                modoCodigo
              );
              listEmpleados.push(data);
            }
            data = {}
          };
        }
        // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
        fs.access(ruta, fs.constants.F_OK, (err) => {
          if (err) {
          }
          else {
            // ELIMINAR DEL SERVIDOR
            fs.unlinkSync(ruta);
          }
        });

        ///VALIDACION DE COLUMNAS EN BASE SI EXISTEN O NO (VALIDACION CON COLUMNAS FALTANTES)
        listEmpleados.forEach(async (valor: any) => {
          var VERIFICAR_CEDULA = await pool.query(
            `SELECT * FROM eu_empleados WHERE identificacion = $1`,
            [valor.identificacion]
          );
          if (VERIFICAR_CEDULA.rows[0] != undefined && VERIFICAR_CEDULA.rows[0] != '') {
            valor.observacion = 'Identificación ya existe en el sistema';
          } else {
            var VERIFICAR_USUARIO = await pool.query(
              `SELECT * FROM eu_usuarios WHERE usuario = $1`,
              [valor.usuario]
            );
            if (VERIFICAR_USUARIO.rows[0] != undefined && VERIFICAR_USUARIO.rows[0] != '') {
              valor.observacion = 'Usuario ya existe en el sistema';
            } else {
              if (valor.rol != 'No registrado') {
                var VERIFICAR_ROL = await pool.query(
                  `SELECT * FROM ero_cat_roles WHERE UPPER(nombre) = $1`,
                  [valor.rol.toUpperCase()]
                );
                if (VERIFICAR_ROL.rows[0] != undefined && VERIFICAR_ROL.rows[0] != '') {
                  if (valor.nacionalidad != 'No registrado') {
                    var VERIFICAR_NACIONALIDAD = await pool.query(
                      `SELECT * FROM e_cat_nacionalidades WHERE UPPER(nombre) = $1`,
                      [valor.nacionalidad.toUpperCase()]
                    );
                    if (VERIFICAR_NACIONALIDAD.rows[0] != undefined && VERIFICAR_NACIONALIDAD.rows[0] != '') {

                      if (valor.estado_civil != 'No registrado') {
                        var VERIFICAR_ESTADO_CIVIL = await pool.query(
                          `SELECT * FROM e_estado_civil WHERE UPPER(estado_civil) = $1`,
                          [valor.estado_civil.toUpperCase()]
                        );
                        if (VERIFICAR_ESTADO_CIVIL.rows[0] != undefined && VERIFICAR_ESTADO_CIVIL.rows[0] != '') {

                          if (valor.genero != 'No registrado') {
                            var VERIFICAR_GENERO = await pool.query(
                              `SELECT * FROM e_genero WHERE UPPER(genero) = $1`,
                              [valor.genero.toUpperCase()]
                            );
                            if (VERIFICAR_GENERO.rows[0] != undefined && VERIFICAR_GENERO.rows[0] != '') {
                              // DISCRIMINACIÓN DE ELEMENTOS IGUALES
                              if (duplicados1.find((p: any) => p.identificacion === valor.identificacion) == undefined) {
                                if (duplicados2.find((a: any) => a.usuario === valor.usuario) == undefined) {
                                  duplicados2.push(valor);
                                } else {
                                  valor.observacion = '2';
                                }
                                duplicados1.push(valor);
                              } else {
                                valor.observacion = '1';
                              }
                            } else {
                              valor.observacion = 'Género no existe en el sistema';
                            }
                          }

                        } else {
                          valor.observacion = 'Estado civil no existe en el sistema';
                        }
                      }

                    } else {
                      valor.observacion = 'Nacionalidad no existe en el sistema';
                    }
                  }
                } else {
                  valor.observacion = 'Rol no existe en el sistema';
                }
              }
            }
          }
        });

        var tiempo = 2000;
        if (listEmpleados.length > 500 && listEmpleados.length <= 1000) {
          tiempo = 4000;
        }
        else if (listEmpleados.length > 1000) {
          tiempo = 7000;
        }
        setTimeout(() => {
          listEmpleados.sort((a: any, b: any) => {
            // COMPARA LOS NUMEROS DE LOS OBJETOS
            if (a.fila < b.fila) {
              return -1;
            }
            if (a.fila > b.fila) {
              return 1;
            }
            return 0; // SON IGUALES
          });
          var filaDuplicada: number = 0;
          listEmpleados.forEach((item: any) => {
            if (item.observacion == '1') {
              item.observacion = 'Registro duplicado (identificación)';
            }
            else if (item.observacion == '2') {
              item.observacion = 'Registro duplicado (usuario)';
            }
            else if (item.observacion == '3') {
              item.observacion = 'no registrado';
            }
            if (item.observacion != undefined) {
              let arrayObservacion = item.observacion.split(" ");
              if (arrayObservacion[0] == 'no' || item.observacion == " ") {
                item.observacion = 'ok'
              }
            }
            else {
              item.observacion = 'Datos no registrado';
            }
            // VALIDA SI LOS DATOS DE LA COLUMNA N SON NUMEROS.
            if (typeof item.fila === 'number' && !isNaN(item.fila)) {
              // CONDICION PARA VALIDAR SI EN LA NUMERACION EXISTE UN NUMERO QUE SE REPITE DARA ERROR.
              if (item.fila == filaDuplicada) {
                mensaje = 'error';
              }
            }
            else {
              return mensaje = 'error';
            }
            filaDuplicada = item.fila;
          });
          if (mensaje == 'error') {
            listEmpleados = undefined;
          }
          return res.jsonp({ message: mensaje, data: listEmpleados });
        }, tiempo)
      }

    } catch (error) {
      console.log("ver el error: ", error)
      return res.status(500).jsonp({ message: error });
    }
  }

  // METODO PARA REGISTRAR DATOS DE PLANTILLA CODIGO AUTOMATICO   **USADO
  public async CargarPlantilla_Automatico(req: Request, res: Response): Promise<any> {
    const { plantilla, user_name, ip, ip_local } = req.body;
    const VALOR = await pool.query(`SELECT * FROM e_codigo`);
    var codigo_dato = VALOR.rows[0].valor;
    var codigo = 0;
    if (codigo_dato != null && codigo_dato != undefined && codigo_dato != '') {
      codigo = codigo_dato = parseInt(codigo_dato);
    }
    // VERIFICAR SI EL CODIGO ESTA DESACTUALZIADO
    const MAX_CODIGO = await pool.query(`SELECT MAX(codigo::BIGINT) AS codigo FROM eu_empleados`);
    const max_real = parseInt(MAX_CODIGO.rows[0].codigo) || 0;
    // SI HAY UN CODIGO MAS ALTO, LO ACTUALIZA
    if (max_real > codigo) {
      codigo = max_real;
    }

    var contador = 1;
    let ocurrioError = false;
    let mensajeError = '';
    let codigoError = 0;

    for (const data of plantilla) {
      try {
        // INICIAR TRANSACCION
        await pool.query('BEGIN');
        // REALIZA UN CAPITAL LETTER A LOS NOMBRES Y APELLIDOS
        var nombreE: any;
        let nombres = data.nombre.split(' ');
        if (nombres.length > 1) {
          let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
          let name2 = nombres[1].charAt(0).toUpperCase() + nombres[1].slice(1);
          nombreE = name1 + ' ' + name2;
        }
        else {
          let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
          nombreE = name1
        }
        var apellidoE: any;
        let apellidos = data.apellido.split(' ');
        if (apellidos.length > 1) {
          let lastname1 = apellidos[0].charAt(0).toUpperCase() + apellidos[0].slice(1);
          let lastname2 = apellidos[1].charAt(0).toUpperCase() + apellidos[1].slice(1);
          apellidoE = lastname1 + ' ' + lastname2;
        }
        else {
          let lastname1 = apellidos[0].charAt(0).toUpperCase() + apellidos[0].slice(1);
          apellidoE = lastname1
        }

        //TODO: ACA SE REALIZA LA ENCRIPTACION
        console.log(' encriptando')
        // ENCRIPTAR CONTRASEÑA
        let contrasena = FUNCIONES_LLAVES.encriptarLogin(data.contrasena.toString());
        console.log('contraseña plantilla automatico: ', contrasena);

        // DATOS QUE SE LEEN DE LA PLANTILLA INGRESADA
        const { identificacion, tipo_identificacion, numero_partida_individual, estado_civil, genero, correo, fec_nacimiento, domicilio, longitud, latitud, telefono,
          nacionalidad, usuario, rol } = data;

        //OBTENER ID DEL ESTADO_CIVIL 
        let id_estado_civil = 0;
        const estadoCivilDB = await pool.query(
          `SELECT id FROM e_estado_civil WHERE UPPER(estado_civil) = $1 LIMIT 1`,
          [estado_civil.toUpperCase()]
        );

        if (estadoCivilDB.rows.length > 0) {
          id_estado_civil = estadoCivilDB.rows[0].id;
        } else {
          throw new Error(`Estado civil no registrado: ${estado_civil}`);
        }

        //OBTENER ID DEL GENERO
        let id_genero = 0;
        const generoDB = await pool.query(
          `SELECT id FROM e_genero WHERE UPPER(genero) = $1 LIMIT 1`,
          [genero?.toUpperCase().trim()]
        );

        if (generoDB.rows.length > 0) {
          id_genero = generoDB.rows[0].id;
        } else {
          throw new Error(`Género no registrado: ${genero}`);
        }

        var _longitud = null;
        if (longitud != 'No registrado') {
          _longitud = longitud;
        }

        var _latitud = null
        if (latitud != 'No registrado') {
          _latitud = latitud;
        }

        var _telefono = null
        if (telefono != 'No registrado') {
          _telefono = telefono
        }

        var _domicilio = null
        if (domicilio != 'No registrado') {
          _domicilio = domicilio
        }

        //OBTENER ID DEL ESTADO
        var id_estado = 1;
        var estado_user = true;
        var app_habilita = false;

        //OBTENER ID DE LA NACIONALIDAD
        const id_nacionalidad = await pool.query(`SELECT * FROM e_cat_nacionalidades WHERE UPPER(nombre) = $1`, [nacionalidad.toUpperCase()]);

        //OBTENER ID DEL ROL
        const id_rol = await pool.query(`SELECT * FROM ero_cat_roles WHERE UPPER(nombre) = $1`, [rol.toUpperCase()]);

        if (codigo_dato != null && codigo_dato != undefined && codigo_dato != '') {
          // INCREMENTAR EL VALOR DEL CODIGO
          codigo = codigo + 1;
        } else {
          codigo = identificacion;
        }

        let id_tipo_identificacion = 0;
        if (tipo_identificacion.toUpperCase() === 'CÉDULA') {
          id_tipo_identificacion = 1;
        }
        else if (tipo_identificacion.toUpperCase() === 'PASAPORTE') {
          id_tipo_identificacion = 2;
        }
        // REGISTRO DE NUEVO EMPLEADO
        const response: QueryResult = await pool.query(
          `
          INSERT INTO eu_empleados (tipo_identificacion, identificacion, apellido, nombre, estado_civil, genero, correo,
            fecha_nacimiento, estado, domicilio, telefono, id_nacionalidad, codigo, longitud, latitud, numero_partida_individual) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *
          `
          , [id_tipo_identificacion, identificacion, apellidoE, nombreE,
            id_estado_civil, id_genero, correo, fec_nacimiento, id_estado,
            _domicilio, _telefono, id_nacionalidad.rows[0]['id'], codigo, _longitud, _latitud, numero_partida_individual]);

        const [empleado] = response.rows;

        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eu_empleados',
          usuario: user_name,
          accion: 'I',
          datosOriginales: '',
          datosNuevos: `{tipo_identificacion: ${id_tipo_identificacion},identificacion: ${identificacion}, apellido: ${apellidoE}, nombre: ${nombreE}, estado_civil: ${id_estado_civil}, genero: ${id_genero}, correo: ${correo}, fecha_nacimiento: ${fec_nacimiento}, estado: ${id_estado}, domicilio: ${domicilio}, telefono: ${telefono}, id_nacionalidad: ${id_nacionalidad.rows[0]['id']}, codigo: ${codigo}, longitud: ${_longitud}, latitud: ${_latitud}, numero_partida_individual: ${numero_partida_individual}}`,
          ip: ip,
          ip_local: ip_local,
          observacion: null
        });

        // OBTENER EL ID DEL EMPLEADO INGRESADO
        const id_empleado = empleado.id;
        // REGISTRO DE LOS DATOS DE USUARIO
        await pool.query(
          `
          INSERT INTO eu_usuarios (usuario, contrasena, estado, id_rol, id_empleado, app_habilita)
          VALUES ($1, $2, $3, $4, $5, $6)
          `
          , [usuario, contrasena, estado_user, id_rol.rows[0]['id'],
            id_empleado, app_habilita]);

        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eu_usuarios',
          usuario: user_name,
          accion: 'I',
          datosOriginales: '',
          datosNuevos: `{usuario: ${usuario}, contrasena: ${contrasena}, estado: ${estado_user}, id_rol: ${id_rol.rows[0]['id']}, id_empleado: ${id_empleado}, app_habilita: ${app_habilita}}`,
          ip: ip,
          ip_local: ip_local,
          observacion: null
        });

        if (contador === plantilla.length) {
          // ACTUALIZACION DEL CODIGO
          if (codigo_dato != null && codigo_dato != undefined && codigo_dato != '') {
            await pool.query(
              `
              UPDATE e_codigo SET valor = $1 WHERE id = $2
              `
              , [codigo, VALOR.rows[0].id]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'e_codigo',
              usuario: user_name,
              accion: 'U',
              datosOriginales: JSON.stringify(codigo_dato),
              datosNuevos: `{valor: ${codigo}}`,
              ip: ip,
              ip_local: ip_local,
              observacion: null
            });
          }

          // FINALIZAR TRANSACCION
          await pool.query('COMMIT');
        }
        contador = contador + 1;
        contrasena = '';
      } catch (error) {
        // REVERTIR TRANSACCION
        await pool.query('ROLLBACK');
        console.error("Error en CargarPlantilla_Automatica:", error);

        ocurrioError = true;
        mensajeError = error;
        codigoError = 500;
        break;
      }
    }

    if (ocurrioError) {
      res.status(500).jsonp({ message: mensajeError });
    } else {
      res.jsonp({ message: 'correcto' });
    }
  }

  // METODOS PARA VERIFICAR PLANTILLA CON CODIGO INGRESADO DE FORMA MANUAL    **USADO
  public async VerificarPlantilla_Manual(req: Request, res: Response) {
    try {
      const documento = req.file?.originalname;
      let separador = path.sep;
      let ruta = ObtenerRutaLeerPlantillas() + separador + documento;
      const workbook = new Excel.Workbook();
      await workbook.xlsx.readFile(ruta);
      let verificador = ObtenerIndicePlantilla(workbook, 'EMPLEADOS');
      const modoCodigo = req.body.modoCodigo || 'manual';
      if (verificador === false) {
        return res.jsonp({ message: 'no_existe', data: undefined });
      }
      else {
        const sheet_name_list = workbook.worksheets.map(sheet => sheet.name);
        const plantilla = workbook.getWorksheet(sheet_name_list[verificador]);
        let data: any = {
          fila: '',
          identificacion: '',
          apellido: '',
          nombre: '',
          codigo: '',
          estado_civil: '',
          genero: '',
          correo: '',
          fec_nacimiento: '',
          latitud: '',
          longitud: '',
          domicilio: '',
          telefono: '',
          nacionalidad: '',
          usuario: '',
          contrasena: '',
          rol: '',
          observacion: '',
          tipo_identificacion: '',
          numero_partida_individual: '',
        };

        //ARREGLO DE ESTADOS CIVILES EN BD
        const estadoCivilDB = await pool.query(`SELECT estado_civil FROM e_estado_civil`);
        const estadoCivilArray: string[] = estadoCivilDB.rows.map(item => item.estado_civil.toUpperCase());

        //ARREGLO DE GENEROS EN BD
        const generoDB = await pool.query(`SELECT genero FROM e_genero`);
        const tipogenero: string[] = generoDB.rows.map(item => item.genero.toUpperCase());

        // VALIDA SI LOS DATOS DE LA COLUMNA CEDULA SON NUMEROS.
        const regex = /^[0-9]+$/;
        // VALIDA EL FORMATO DEL CORREO: XXXXXXX@XXXXXXXXX.XXX
        const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        const valiContra = /\s/;
        // EXPRESION REGULAR PARA VALIDAR LA LATITUD Y LONGITUD
        const regexLatitud = /^-?([1-8]?\d(\.\d+)?|90(\.0+)?)$/;
        const regexLongitud = /^-?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;

        var listEmpleadosManual: any = [];
        var duplicados1: any = [];
        var duplicados2: any = [];
        var duplicados3: any = [];
        var mensaje: string = 'correcto';
        if (plantilla) {
          // SUPONIENDO QUE LA PRIMERA FILA SON LAS CABECERAS
          const headerRow = plantilla.getRow(1);
          const headers: any = {};
          // CREAR UN MAPA CON LAS CABECERAS Y SUS POSICIONES, ASEGURANDO QUE LAS CLAVES ESTEN EN MAYUSCULAS
          headerRow.eachCell((cell: any, colNumber) => {
            headers[cell.value.toString().toUpperCase()] = colNumber;
          });
          // VERIFICA SI LAS CABECERAS ESENCIALES ESTAN PRESENTES
          if (!headers['ITEM'] || !headers['CODIGO'] || !headers['IDENTIFICACION'] ||
            !headers['APELLIDO'] || !headers['NOMBRE'] || !headers['USUARIO'] ||
            !headers['CONTRASENA'] || !headers['ROL'] || !headers['ESTADO_CIVIL'] ||
            !headers['GENERO'] || !headers['CORREO'] || !headers['FECHA_NACIMIENTO'] ||
            !headers['LATITUD'] || !headers['LONGITUD'] || !headers['DOMICILIO'] ||
            !headers['TELEFONO'] || !headers['NACIONALIDAD'] || !headers['TIPO_IDENTIFICACION'] || !headers['NUMERO_PARTIDA_INDIVIDUAL']
          ) {
            return res.jsonp({ message: 'Cabeceras faltantes', data: undefined });
          }

          for (let rowNumber = 2; rowNumber <= plantilla.rowCount; rowNumber++) {
            const row = plantilla.getRow(rowNumber);
            if (!row || row.hasValues === false) continue;
            // SALTAR LA FILA DE LAS CABECERAS
            if (rowNumber === 1) return;
            // LEER LOS DATOS SEGUN LAS COLUMNAS ENCONTRADAS
            const ITEM = row.getCell(headers['ITEM']).value;
            const CODIGO = row.getCell(headers['CODIGO']).value?.toString();
            const IDENTIFICACION = row.getCell(headers['IDENTIFICACION']).value?.toString();
            const APELLIDO = row.getCell(headers['APELLIDO']).value?.toString();
            const NOMBRE = row.getCell(headers['NOMBRE']).value?.toString();
            const USUARIO = row.getCell(headers['USUARIO']).value?.toString();
            const CONTRASENA = row.getCell(headers['CONTRASENA']).value?.toString();
            const ROL = row.getCell(headers['ROL']).value?.toString();
            const ESTADO_CIVIL = row.getCell(headers['ESTADO_CIVIL']).value?.toString();
            const GENERO = row.getCell(headers['GENERO']).value?.toString();
            const FECHA_NACIMIENTO = row.getCell(headers['FECHA_NACIMIENTO']).value?.toString();
            const LATITUD = row.getCell(headers['LATITUD']).value?.toString();
            const LONGITUD = row.getCell(headers['LONGITUD']).value?.toString();
            const DOMICILIO = row.getCell(headers['DOMICILIO']).value?.toString();
            const TELEFONO = row.getCell(headers['TELEFONO']).value?.toString();
            const NACIONALIDAD = row.getCell(headers['NACIONALIDAD']).value?.toString();
            const TIPO_IDENTIFICACION = row.getCell(headers['TIPO_IDENTIFICACION']).value?.toString();
            const NUMERO_PARTIDA_INDIVIDUAL = row.getCell(headers['NUMERO_PARTIDA_INDIVIDUAL']).value?.toString();

            let CORREO = row.getCell(headers['CORREO']).value;
            if (typeof CORREO === 'object' && CORREO !== null) {
              if ('text' in CORREO) {
                CORREO = CORREO.text;
              } else {
                CORREO = '';
              }
            }
            CORREO = CORREO?.toString();

            // VERIFICAR QUE EL REGISTO NO TENGA DATOS VACIOS
            if (
              ITEM != undefined && ITEM != '' &&
              IDENTIFICACION != undefined && APELLIDO != undefined &&
              NOMBRE != undefined && CODIGO != undefined && ESTADO_CIVIL != undefined &&
              GENERO != undefined && CORREO != undefined && FECHA_NACIMIENTO != undefined &&
              LATITUD != undefined && LONGITUD != undefined && DOMICILIO != undefined &&
              TELEFONO != undefined && NACIONALIDAD != undefined && USUARIO != undefined &&
              CONTRASENA != undefined && ROL != undefined && TIPO_IDENTIFICACION != undefined &&
              NUMERO_PARTIDA_INDIVIDUAL != undefined
            ) {
              data.fila = ITEM;
              data.identificacion = IDENTIFICACION?.trim();
              data.apellido = APELLIDO?.trim();
              data.nombre = NOMBRE?.trim();
              data.codigo = CODIGO?.trim();
              data.usuario = USUARIO?.trim();
              data.contrasena = CONTRASENA?.trim();
              data.rol = ROL?.trim();
              data.estado_civil = ESTADO_CIVIL?.trim();
              data.genero = GENERO?.trim();
              data.correo = CORREO?.trim();
              data.fec_nacimiento = FECHA_NACIMIENTO?.trim();
              data.latitud = LATITUD?.trim();
              data.longitud = LONGITUD?.trim();
              data.domicilio = DOMICILIO?.trim();
              data.telefono = TELEFONO?.trim();
              data.nacionalidad = NACIONALIDAD?.trim();
              data.tipo_identificacion = TIPO_IDENTIFICACION?.trim();
              data.numero_partida_individual = NUMERO_PARTIDA_INDIVIDUAL?.trim();
              data.observacion = 'no registrado';

              //METODO QUE VALIDA LOS DATOS CUANDO LA FILA TIENE LOS DATOS COMPLETOS
              await validarEmpleadoCompleto(
                data,
                regex,
                regexCorreo,
                valiContra,
                regexLatitud,
                regexLongitud,
                estadoCivilArray,
                tipogenero,
                TIPO_IDENTIFICACION ?? 'No registrado',
                pool,
                TELEFONO ?? '',
                LONGITUD ?? '',
                LATITUD ?? '',
                ValidarCedula,
                modoCodigo
              );
              listEmpleadosManual.push(data);
            }
            else {
              data.fila = ITEM;
              data.identificacion = IDENTIFICACION?.trim();
              data.apellido = APELLIDO?.trim();
              data.nombre = NOMBRE?.trim();
              data.codigo = CODIGO?.trim();
              data.usuario = USUARIO?.trim();
              data.contrasena = CONTRASENA?.trim();
              data.rol = ROL?.trim();
              data.estado_civil = ESTADO_CIVIL?.trim();
              data.genero = GENERO?.trim();
              data.correo = CORREO?.trim();
              data.fec_nacimiento = FECHA_NACIMIENTO?.trim();
              data.latitud = LATITUD?.trim();
              data.longitud = LONGITUD?.trim();
              data.domicilio = DOMICILIO?.trim();
              data.telefono = TELEFONO?.trim();
              data.nacionalidad = NACIONALIDAD?.trim();
              data.tipo_identificacion = TIPO_IDENTIFICACION?.trim();
              data.numero_partida_individual = NUMERO_PARTIDA_INDIVIDUAL?.trim();
              data.observacion = 'no registrado';

              //METODO QUE VALIDA LOS DATOS CUANDO LA FILA TIENE LOS DATOS INCOMPLETOS
              await validarEmpleadoIncompleto(
                data,
                ITEM,
                IDENTIFICACION,
                APELLIDO,
                NOMBRE,
                ESTADO_CIVIL,
                GENERO,
                CORREO,
                FECHA_NACIMIENTO,
                LATITUD,
                LONGITUD,
                DOMICILIO,
                TELEFONO,
                NACIONALIDAD,
                USUARIO,
                CONTRASENA,
                ROL,
                TIPO_IDENTIFICACION,
                NUMERO_PARTIDA_INDIVIDUAL,
                regex,
                regexCorreo,
                valiContra,
                regexLatitud,
                regexLongitud,
                estadoCivilArray,
                tipogenero,
                pool,
                ValidarCedula,
                modoCodigo
              );

              listEmpleadosManual.push(data);
            }
            data = {}
          };
        }
        // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
        fs.access(ruta, fs.constants.F_OK, (err) => {
          if (err) {
          }
          else {
            // ELIMINAR DEL SERVIDOR
            fs.unlinkSync(ruta);
          }
        });

        listEmpleadosManual.forEach(async (valor: any) => {
          if (valor.observacion == 'no registrado' || valor.observacion == ' ') {
            var VERIFICAR_CEDULA = await pool.query(
              `SELECT * FROM eu_empleados WHERE identificacion = $1`,
              [valor.identificacion]
            );
            if (VERIFICAR_CEDULA.rows[0] != undefined && VERIFICAR_CEDULA.rows[0] != '') {
              valor.observacion = 'Identificación ya existe en el sistema';
            } else {
              var VERIFICAR_CODIGO = await pool.query(
                `SELECT * FROM eu_empleados WHERE codigo = $1`,
                [valor.codigo]
              );
              if (VERIFICAR_CODIGO.rows[0] != undefined && VERIFICAR_CODIGO.rows[0] != '') {
                valor.observacion = 'Código ya existe en el sistema';
              } else {
                var VERIFICAR_USUARIO = await pool.query(
                  `SELECT * FROM eu_usuarios WHERE usuario = $1`,
                  [valor.usuario]
                );
                if (VERIFICAR_USUARIO.rows[0] != undefined && VERIFICAR_USUARIO.rows[0] != '') {
                  valor.observacion = 'Usuario ya existe en el sistema';
                } else {
                  if (valor.rol != 'No registrado') {
                    var VERIFICAR_ROL = await pool.query(
                      `SELECT * FROM ero_cat_roles WHERE UPPER(nombre) = $1`,
                      [valor.rol.toUpperCase()]
                    );
                    if (VERIFICAR_ROL.rows[0] != undefined && VERIFICAR_ROL.rows[0] != '') {
                      if (valor.nacionalidad != 'No registrado') {
                        var VERIFICAR_NACIONALIDAD = await pool.query(
                          `SELECT * FROM e_cat_nacionalidades WHERE UPPER(nombre) = $1`,
                          [valor.nacionalidad.toUpperCase()]
                        );
                        if (VERIFICAR_NACIONALIDAD.rows[0] != undefined && VERIFICAR_NACIONALIDAD.rows[0] != '') {

                          if (valor.estado_civil != 'No registrado') {
                            var VERIFICAR_ESTADO_CIVIL = await pool.query(
                              `SELECT * FROM e_estado_civil WHERE UPPER(estado_civil) = $1`,
                              [valor.estado_civil.toUpperCase()]
                            );
                            if (VERIFICAR_ESTADO_CIVIL.rows[0] != undefined && VERIFICAR_ESTADO_CIVIL.rows[0] != '') {

                              if (valor.genero != 'No registrado') {
                                var VERIFICAR_GENERO = await pool.query(
                                  `SELECT * FROM e_genero WHERE UPPER(genero) = $1`,
                                  [valor.genero.toUpperCase()]
                                );
                                if (VERIFICAR_GENERO.rows[0] != undefined && VERIFICAR_GENERO.rows[0] != '') {
                                  // DISCRIMINACIÓN DE ELEMENTOS IGUALES
                                  if (duplicados1.find((p: any) => p.identificacion === valor.identificacion) == undefined) {
                                    if (duplicados3.find((c: any) => c.codigo === valor.codigo) == undefined) {
                                      if (duplicados2.find((a: any) => a.usuario === valor.usuario) == undefined) {
                                        duplicados2.push(valor);
                                      } else {
                                        valor.observacion = '2';
                                      }
                                      duplicados3.push(valor);
                                    } else {
                                      valor.observacion = '3';
                                    }
                                    duplicados1.push(valor);
                                  } else {
                                    valor.observacion = '1';
                                  }
                                } else {
                                  valor.observacion = 'Género no existe en el sistema';
                                }
                              }

                            } else {
                              valor.observacion = 'Estado civil no existe en el sistema';
                            }
                          }

                        } else {
                          valor.observacion = 'Nacionalidad no existe en el sistema';
                        }
                      }
                    } else {
                      valor.observacion = 'Rol no existe en el sistema';
                    }
                  }
                }
              }
            }
          }
        });

        var tiempo = 2000;
        if (listEmpleadosManual.length > 500 && listEmpleadosManual.length <= 1000) {
          tiempo = 4000;
        }
        else if (listEmpleadosManual.length > 1000) {
          tiempo = 7000;
        }
        setTimeout(() => {
          listEmpleadosManual.sort((a: any, b: any) => {
            // COMPARA LOS NUMEROS DE LOS OBJETOS
            if (a.fila < b.fila) {
              return -1;
            }
            if (a.fila > b.fila) {
              return 1;
            }
            return 0; // SON IGUALES
          });

          var filaDuplicada: number = 0;
          listEmpleadosManual.forEach((item: any) => {
            if (item.observacion == '1') {
              item.observacion = 'Registro duplicado (identificación)';
            }
            else if (item.observacion == '2') {
              item.observacion = 'Registro duplicado (usuario)';
            }
            else if (item.observacion == '3') {
              item.observacion = 'Registro duplicado (código)';
            }
            else if (item.observacion == '4') {
              item.observacion = 'no registrado';
            }
            if (item.observacion != undefined) {
              let arrayObservacion = item.observacion.split(" ");
              if (arrayObservacion[0] == 'no' || item.observacion == " ") {
                item.observacion = 'ok';
              }
            }
            // VALIDA SI LOS DATOS DE LA COLUMNA N SON NUMEROS.
            if (typeof item.fila === 'number' && !isNaN(item.fila)) {
              // CONDICION PARA VALIDAR SI EN LA NUMERACION EXISTE UN NUMERO QUE SE REPITE DARA ERROR.
              if (item.fila == filaDuplicada) {
                mensaje = 'error';
              }
            }
            else {
              return mensaje = 'error';
            }

            filaDuplicada = item.fila;
          });

          if (mensaje == 'error') {
            listEmpleadosManual = undefined;
          }
          return res.jsonp({ message: mensaje, data: listEmpleadosManual });
        }, tiempo)
      }

    } catch (error) {
      return res.status(500).jsonp({ message: error });
    }
  }

  // METODO PARA REGISTRAR DATOS DE LA PLANTILLA CODIGO MANUAL   **USADO
  public async CargarPlantilla_Manual(req: Request, res: Response): Promise<any> {
    const { plantilla, user_name, ip, ip_local } = req.body
    var contador = 1;
    let ocurrioError = false;
    let mensajeError = '';
    let codigoError = 0;

    for (const data of plantilla) {
      try {
        // INICIAR TRANSACCION
        await pool.query('BEGIN');
        // REALIZA UN CAPITAL LETTER A LOS NOMBRES Y APELLIDOS
        var nombreE: any;
        let nombres = data.nombre.split(' ');
        if (nombres.length > 1) {
          let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
          let name2 = nombres[1].charAt(0).toUpperCase() + nombres[1].slice(1);
          nombreE = name1 + ' ' + name2;
        }
        else {
          let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
          nombreE = name1
        }
        var apellidoE: any;
        let apellidos = data.apellido.split(' ');
        if (apellidos.length > 1) {
          let lastname1 = apellidos[0].charAt(0).toUpperCase() + apellidos[0].slice(1);
          let lastname2 = apellidos[1].charAt(0).toUpperCase() + apellidos[1].slice(1);
          apellidoE = lastname1 + ' ' + lastname2;
        }
        else {
          let lastname1 = apellidos[0].charAt(0).toUpperCase() + apellidos[0].slice(1);
          apellidoE = lastname1
        }

        //TODO: ACA SE REALIZA LA ENCRIPTACION
        // ENCRIPTAR CONTRASEÑA
        let contrasena = FUNCIONES_LLAVES.encriptarLogin(data.contrasena.toString());
        console.log('contraseña plantilla manual: ', contrasena);

        // DATOS QUE SE LEEN DE LA PLANTILLA INGRESADA
        const { identificacion, tipo_identificacion, numero_partida_individual, codigo, estado_civil, genero, correo, fec_nacimiento, domicilio, longitud, latitud,
          telefono, nacionalidad, usuario, rol, } = data;

        // OBTENER ID DEL ESTADO_CIVIL 
        let id_estado_civil = 0;
        const estadoCivilDB = await pool.query(
          `SELECT id FROM e_estado_civil WHERE UPPER(estado_civil) = $1 LIMIT 1`,
          [estado_civil?.toUpperCase()]
        );

        if (estadoCivilDB.rows.length > 0) {
          id_estado_civil = estadoCivilDB.rows[0].id;
        } else {
          throw new Error(`Estado civil no registrado: ${estado_civil}`);
        }

        //OBTENER ID DEL GENERO
        let id_genero = 0;
        const generoDB = await pool.query(
          `SELECT id FROM e_genero WHERE UPPER(genero) = $1 LIMIT 1`,
          [genero?.toUpperCase()]
        );

        if (generoDB.rows.length > 0) {
          id_genero = generoDB.rows[0].id;
        } else {
          throw new Error(`Género no registrado: ${genero}`);
        }

        var _longitud = null;
        if (longitud != 'No registrado') {
          _longitud = longitud;
        }

        var _latitud = null
        if (latitud != 'No registrado') {
          _latitud = latitud;
        }

        var _telefono = null
        if (telefono != 'No registrado') {
          _telefono = telefono
        }

        var _domicilio = null
        if (domicilio != 'No registrado') {
          _domicilio = domicilio
        }

        // OBTENER ID DEL ESTADO
        var id_estado = 1;
        var estado_user = true;
        var app_habilita = false;

        // OBTENER ID DE LA NACIONALIDAD
        const id_nacionalidad = await pool.query(`SELECT * FROM e_cat_nacionalidades WHERE UPPER(nombre) = $1`, [nacionalidad.toUpperCase()]);

        // OBTENER ID DEL ROL
        const id_rol = await pool.query(`SELECT * FROM ero_cat_roles WHERE UPPER(nombre) = $1`, [rol.toUpperCase()]);

        // REGISTRO DE NUEVO EMPLEADO
        let id_tipo_identificacion = 0;
        if (tipo_identificacion.toUpperCase() === 'CÉDULA') {
          id_tipo_identificacion = 1;
        }
        else if (tipo_identificacion.toUpperCase() === 'PASAPORTE') {
          id_tipo_identificacion = 2;
        }
        const response: QueryResult = await pool.query(
          `
          INSERT INTO eu_empleados (tipo_identificacion,identificacion, apellido, nombre, estado_civil, genero, correo,
            fecha_nacimiento, estado, domicilio, telefono, id_nacionalidad, codigo, longitud, latitud, numero_partida_individual) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *
          `
          , [id_tipo_identificacion, identificacion, apellidoE, nombreE,
            id_estado_civil, id_genero, correo, fec_nacimiento, id_estado,
            _domicilio, _telefono, id_nacionalidad.rows[0]['id'], codigo, _longitud, _latitud, numero_partida_individual]);

        const [empleado] = response.rows;

        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eu_empleados',
          usuario: user_name,
          accion: 'I',
          datosOriginales: '',
          datosNuevos: `{tipo_identificacion: ${id_tipo_identificacion} ,identificacion: ${identificacion}, apellido: ${apellidoE}, nombre: ${nombreE}, estado_civil: ${id_estado_civil}, genero: ${id_genero}, correo: ${correo}, fecha_nacimiento: ${fec_nacimiento}, estado: ${id_estado}, domicilio: ${domicilio}, telefono: ${telefono}, id_nacionalidad: ${id_nacionalidad.rows[0]['id']}, codigo: ${codigo}, longitud: ${_longitud}, latitud: ${_latitud}, numero_partida_individual: ${numero_partida_individual}}`,
          ip: ip,
          ip_local: ip_local,
          observacion: null
        });

        // OBTENER EL ID DEL EMPELADO
        const id_empleado = empleado.id;

        // REGISTRO DE LOS DATOS DE USUARIO
        await pool.query(
          `
          INSERT INTO eu_usuarios (usuario, contrasena, estado, id_rol, id_empleado, app_habilita)
          VALUES ($1, $2, $3, $4, $5, $6)
          `
          , [usuario, contrasena, estado_user, id_rol.rows[0]['id'], id_empleado,
            app_habilita]);

        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eu_usuarios',
          usuario: user_name,
          accion: 'I',
          datosOriginales: '',
          datosNuevos: `{usuario: ${usuario}, contrasena: ${contrasena}, estado: ${estado_user}, id_rol: ${id_rol.rows[0]['id']}, id_empleado: ${id_empleado}, app_habilita: ${app_habilita}}`,
          ip: ip,
          ip_local: ip_local,
          observacion: null
        });

        if (contador === plantilla.length) {
          // ACTUALIZACION DEL CODIGO
          await pool.query(
            `
            UPDATE e_codigo SET valor = null WHERE id = 1
            `
          );

          // AUDITORIA
          await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'e_codigo',
            usuario: user_name,
            accion: 'U',
            datosOriginales: '',
            datosNuevos: `{valor: null}`,
            ip: ip,
            ip_local: ip_local,
            observacion: null
          });
          // FINALIZAR TRANSACCION
          await pool.query('COMMIT');

          return res.jsonp({ message: 'correcto' });
        }
        contador = contador + 1;

      } catch (error) {
        // REVERTIR TRANSACCION
        await pool.query('ROLLBACK');
        ocurrioError = true;
        mensajeError = error;
        codigoError = 500;
        break;
      }

    }
    if (ocurrioError) {
      res.status(500).jsonp({ message: mensajeError });
    } else {
      res.jsonp({ message: 'correcto' });
    }
  }

  /** ********************************************************************************************* **
   ** **               CONSULTAS DE GEOLOCALIZACION DEL USUARIO                                  ** ** 
   ** ********************************************************************************************* **/

  // METODO PARA BUSCAR DATOS DE COORDENADAS DE DOMICILIO    **USADO
  public async BuscarCoordenadas(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const UBICACION = await pool.query(
      `
        SELECT longitud, latitud FROM eu_empleados WHERE id = $1
      `
      , [id]);
    if (UBICACION.rowCount != 0) {
      return res.jsonp(UBICACION.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se ha encontrado registros.' });
    }
  }

  // METODO PARA TOMAR DATOS DE LA UBICACION DEL DOMICILIO DEL EMPLEADO   **USADO
  public async GeolocalizacionCrokis(req: Request, res: Response): Promise<Response> {
    let id = req.params.id
    let { lat, lng, user_name, ip, ip_local } = req.body
    try {
      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const empleado = await pool.query(
        `
        SELECT * FROM eu_empleados WHERE id = $1
        `
        , [id]);
      const [datosOriginales] = empleado.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eu_empleados',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al actualizar geolocalización de empleado con id: ${id}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Error al actualizar geolocalización de empleado.' });
      }

      const datosNuevos = await pool.query(
        `
        UPDATE eu_empleados SET latitud = $1, longitud = $2 WHERE id = $3 RETURNING *
        `
        , [lat, lng, id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eu_empleados',
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
      return res.status(200).jsonp({ message: 'Registro actualizado.' });

    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: error });
    }
  }

  /** **************************************************************************************** **
   ** **                       MANEJO DE DATOS DE TITULO PROFESIONAL                        ** ** 
   ** **************************************************************************************** **/

  // BUSQUEDA DE TITULOS PROFESIONALES DEL EMPLEADO   **USADO
  public async ObtenerTitulosEmpleado(req: Request, res: Response): Promise<any> {
    const { id_empleado } = req.params;
    const unEmpleadoTitulo = await pool.query(
      `
      SELECT et.id, et.observacion As observaciones, et.id_titulo, 
        et.id_empleado, ct.nombre, nt.nombre as nivel
      FROM eu_empleado_titulos AS et, et_titulos AS ct, et_cat_nivel_titulo AS nt
      WHERE et.id_empleado = $1 AND et.id_titulo = ct.id AND ct.id_nivel = nt.id
      ORDER BY id
      `
      , [id_empleado]);
    if (unEmpleadoTitulo.rowCount != 0) {
      return res.jsonp(unEmpleadoTitulo.rows)
    }
    else {
      res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  // INGRESAR TITULO PROFESIONAL DEL EMPLEADO   **USADO
  public async CrearEmpleadoTitulos(req: Request, res: Response): Promise<void> {
    try {
      const { observacion, id_empleado, id_titulo, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      const usuario = await pool.query(
        `
          SELECT id FROM eu_usuarios WHERE id_empleado = $1
        `
        , [id_empleado]);

      const id_usuario = usuario.rows[0].id;


      const datosNuevos = await pool.query(
        `
          INSERT INTO eu_empleado_titulos (observacion, id_empleado, id_titulo, id_usuario) VALUES ($1, $2, $3, $4) RETURNING *
        `
        , [observacion, id_empleado, id_titulo, id_usuario]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eu_empleado_titulos',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: JSON.stringify(datosNuevos.rows[0]),
        ip: ip,
        ip_local: ip_local,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      res.jsonp({ message: 'Registro guardado.' });

    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      res.status(500).jsonp({ message: 'error' });
    }
  }

  // METODO PARA BUSCAR TITULO ESPECIFICO DEL EMPLEADO   **USADO
  public async ObtenerTituloEspecifico(req: Request, res: Response): Promise<any> {
    const { id_empleado, id_titulo } = req.body;
    const unEmpleadoTitulo = await pool.query(
      `
      SELECT et.id
      FROM eu_empleado_titulos AS et
      WHERE et.id_empleado = $1 AND et.id_titulo = $2
      `
      , [id_empleado, id_titulo]);
    if (unEmpleadoTitulo.rowCount != 0) {
      return res.jsonp(unEmpleadoTitulo.rows)
    }
    else {
      res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  // ACTUALIZAR TITULO PROFESIONAL DEL EMPLEADO   **USADO
  public async EditarTituloEmpleado(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id_empleado_titulo;
      const { observacion, id_titulo, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const empleado = await pool.query(`SELECT * FROM eu_empleado_titulos WHERE id = $1`, [id]);
      const [datosOriginales] = empleado.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eu_empleado_titulos',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al actualizar titulo del empleado con id: ${id}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Error al actualizar titulo del empleado.' });
      }

      const datosNuevos = await pool.query(
        `
        UPDATE eu_empleado_titulos SET observacion = $1, id_titulo = $2 WHERE id = $3 RETURNING *
        `
        , [observacion, id_titulo, id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eu_empleado_titulos',
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

    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' });
    }
  }

  // METODO PARA ELIMINAR TITULO PROFESIONAL DEL EMPLEADO   **USADO
  public async EliminarTituloEmpleado(req: Request, res: Response): Promise<Response> {
    try {
      const { user_name, ip, ip_local } = req.body;
      const id = req.params.id_empleado_titulo;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const empleado = await pool.query(`SELECT * FROM eu_empleado_titulos WHERE id = $1`, [id]);
      const [datosOriginales] = empleado.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eu_empleado_titulos',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al eliminar titulo del empleado con id: ${id}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Error al eliminar titulo del empleado.' });
      }

      await pool.query(
        `
        DELETE FROM eu_empleado_titulos WHERE id = $1
        `
        , [id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eu_empleado_titulos',
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



  /** ******************************************************************************************** **
   ** **      M E T O D O S   U S A D O S    E N    L A    A P L I C A C I O N    M O V I L     ** ** 
   ** ******************************************************************************************** **/

  public async getHorariosEmpleadoByCodigo(req: Request, res: Response): Promise<Response> {
    try {
      const { codigo, fecha_inicio } = req.query;
      const response: QueryResult = await pool.query(
        `
            SELECT id, id_empleado AS empl_codigo, id_empleado_cargo, id_horario,
                fecha_horario AS fecha, fecha_hora_horario::time AS horario,
                tipo_dia, tipo_accion AS tipo_hora, id_detalle_horario
            FROM eu_asistencia_general
            WHERE id_empleado = $1
                AND fecha_horario BETWEEN $2 AND $2 
            ORDER BY horario ASC`
        , [codigo, fecha_inicio]
      );
      const horarios: any[] = response.rows;

      if (horarios.length === 0) return res.status(200).jsonp([]);
      return res.status(200).jsonp(horarios);
    } catch (error) {
      console.log(error);
      return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
  };


  public async getListaEmpleados(req: Request, res: Response): Promise<Response> {
    try {
      const response: QueryResult = await pool.query('SELECT id, identificacion, codigo,  (nombre || \' \' || apellido) as fullname, name_cargo as cargo, name_suc as sucursal, name_dep as departamento, name_regimen as regimen  FROM informacion_general ORDER BY fullname ASC');
      const empleados: any[] = response.rows;
      console.log(empleados);

      return res.status(200).jsonp(empleados);
    } catch (error) {
      console.log(error);
      return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
  };


  public async getPlanificacionMesesCodigoEmple(req: Request, res: Response): Promise<Response> {
    try {
      const { codigo } = req.query;
      const HORARIO: QueryResult = await pool.query(
        "SELECT codigo_e, nombre_e, anio, mes, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 1 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 1 THEN codigo_dia end,', ') ELSE '-' END AS dia1, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 2 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 2 THEN codigo_dia end,', ') ELSE '-' END AS dia2, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 3 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 3 THEN codigo_dia end,', ') ELSE '-' END AS dia3, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 4 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 4 THEN codigo_dia end,', ') ELSE '-' END AS dia4, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 5 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 5 THEN codigo_dia end,', ') ELSE '-' END AS dia5, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 6 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 6 THEN codigo_dia end,', ') ELSE '-' END AS dia6, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 7 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 7 THEN codigo_dia end,', ') ELSE '-' END AS dia7, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 8 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 8 THEN codigo_dia end,', ') ELSE '-' END AS dia8, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 9 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 9 THEN codigo_dia end,', ') ELSE '-' END AS dia9, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 10 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 10 THEN codigo_dia end,', ') ELSE '-' END AS dia10, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 11 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 11 THEN codigo_dia end,', ') ELSE '-' END AS dia11, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 12 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 12 THEN codigo_dia end,', ') ELSE '-' END AS dia12, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 13 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 13 THEN codigo_dia end,', ') ELSE '-' END AS dia13, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 14 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 14 THEN codigo_dia end,', ') ELSE '-' END AS dia14, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 15 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 15 THEN codigo_dia end,', ') ELSE '-' END AS dia15, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 16 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 16 THEN codigo_dia end,', ') ELSE '-' END AS dia16, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 17 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 17 THEN codigo_dia end,', ') ELSE '-' END AS dia17, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 18 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 18 THEN codigo_dia end,', ') ELSE '-' END AS dia18, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 19 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 19 THEN codigo_dia end,', ') ELSE '-' END AS dia19, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 20 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 20 THEN codigo_dia end,', ') ELSE '-' END AS dia20, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 21 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 21 THEN codigo_dia end,', ') ELSE '-' END AS dia21, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 22 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 22 THEN codigo_dia end,', ') ELSE '-' END AS dia22, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 23 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 23 THEN codigo_dia end,', ') ELSE '-' END AS dia23, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 24 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 24 THEN codigo_dia end,', ') ELSE '-' END AS dia24, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 25 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 25 THEN codigo_dia end,', ') ELSE '-' END AS dia25, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 26 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 26 THEN codigo_dia end,', ') ELSE '-' END AS dia26, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 27 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 27 THEN codigo_dia end,', ') ELSE '-' END AS dia27, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 28 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 28 THEN codigo_dia end,', ') ELSE '-' END AS dia28, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 29 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 29 THEN codigo_dia end,', ') ELSE '-' END AS dia29, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 30 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 30 THEN codigo_dia end,', ') ELSE '-' END AS dia30, " +
        "CASE WHEN STRING_AGG(CASE WHEN dia = 31 THEN codigo_dia end,', ') IS NOT NULL THEN STRING_AGG(CASE WHEN dia = 31 THEN codigo_dia end,', ') ELSE '-' END AS dia31 " +
        "FROM ( " +
        "SELECT p_g.id_empleado AS codigo_e, CONCAT(empleado.apellido, ' ', empleado.nombre) AS nombre_e, EXTRACT('year' FROM fecha_horario) AS anio, EXTRACT('month' FROM fecha_horario) AS mes, " +
        "EXTRACT('day' FROM fecha_horario) AS dia, CASE WHEN tipo_dia = 'L' THEN tipo_dia ELSE horario.codigo END AS codigo_dia " +
        "FROM eu_asistencia_general p_g " +
        "INNER JOIN eu_empleados empleado ON empleado.id = p_g.id_empleado AND p_g.id_empleado IN ($1) " +
        "INNER JOIN eh_cat_horarios horario ON horario.id = p_g.id_horario " +
        "GROUP BY codigo_e, nombre_e, anio, mes, dia, codigo_dia, p_g.id_horario " +
        "ORDER BY p_g.id_empleado,anio, mes , dia, p_g.id_horario " +
        ") AS datos " +
        "GROUP BY codigo_e, nombre_e, anio, mes " +
        "ORDER BY 1,3,4"
        , [codigo]);

      if (HORARIO.rowCount != 0) {
        return res.jsonp(HORARIO.rows)
      }
      else {
        return res.status(404).jsonp({ text: 'Registros no encontrados.' });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
  };

}

export const EMPLEADO_CONTROLADOR = new EmpleadoControlador();
export default EMPLEADO_CONTROLADOR;

// METODO PARA VALIDAR NUMERO DE CEDULA ECUATORIANA   **USADO
export async function ValidarCedula(cedula: string): Promise<boolean> {
  const result = await pool.query(
    `
      SELECT descripcion 
      FROM ep_detalle_parametro 
      WHERE id_parametro = 36 
      LIMIT 1
    `);

  const activarValidacion = result.rows[0]?.descripcion?.toLowerCase().trim() === 'si';

  if (!activarValidacion) {
    return true;
  }
  const cad = cedula.toString().trim();

  if (cad === "" || cad.length !== 10 || isNaN(Number(cad))) {
    return false;
  }

  let total = 0;

  for (let i = 0; i < 9; i++) {
    let num = parseInt(cad.charAt(i), 10);
    if (isNaN(num)) return false;

    if (i % 2 === 0) {
      num *= 2;
      if (num > 9) num -= 9;
    }

    total += num;
  }

  const verificador = parseInt(cad.charAt(9), 10);
  const resultado = total % 10 ? 10 - (total % 10) : 0;

  if (verificador === resultado) {
    return true;
  } else {
    return false;
  }
}

// METODO QUE VALIDA LA FILA DE PLANTILLA DE REGISTRO DE USUARIO, SI ES QUE ESTA COMPLETA    **USADO 
export async function validarEmpleadoCompleto(
  data: any,
  regex: any,
  regexCorreo: RegExp,
  valiContra: RegExp,
  regexLatitud: RegExp,
  regexLongitud: RegExp,
  estadoCivilArray: string[],
  tipogenero: string[],
  TIPO_IDENTIFICACION: string,
  pool: any,
  TELEFONO: string,
  LONGITUD: string,
  LATITUD: string,
  ValidarCedula: (cedula: string) => Promise<boolean>,
  modoCodigo: string,
): Promise<void> {
  if (data.identificacion.toString().length != 0) {
    if (TIPO_IDENTIFICACION == 'Pasaporte') {
      if (data.identificacion.toString().length == 0 || data.identificacion.toString().length > 10) {
        data.observacion = 'La identificación ingresada no es válida';
        return;
      }
    } else {
      if (regex.test(data.identificacion)) {
        const cedulaValida = await ValidarCedula(data.identificacion);
        if (data.identificacion.toString().length != 10 || !cedulaValida) {
          data.observacion = 'La identificación ingresada no es válida';
          return;
        }
      } else {
        data.observacion = 'La identificación ingresada no es válida';
        return;
      }
    }
  } else {
    data.observacion = 'La identificación ingresada no es válida';
    return;
  }
  if (modoCodigo === 'manual') {
    if (!regex.test(data.codigo)) {
      data.observacion = 'Formato de código incorrecto';
      return;
    }
  }
  if (!valiContra.test(data.contrasena.toString())) {
    if (data.contrasena.toString().length <= 10) {
      if (data.correo == undefined || !regexCorreo.test(data.correo)) {
        data.observacion = 'Verificar correo';
        return;
      }
      if (DateTime.fromFormat(data.fec_nacimiento, 'yyyy-MM-dd').isValid) {
        if (LONGITUD != undefined || LATITUD != undefined) {
          if (!regexLatitud.test(data.latitud) || !regexLongitud.test(data.longitud)) {
            data.observacion = 'Verificar ubicación';
            return;
          }
        } else if (LONGITUD == undefined || LATITUD == undefined) {
          data.observacion = 'Verificar ubicación';
          return;
        }
        if (TELEFONO != undefined) {
          if (regex.test(data.telefono.toString())) {
            if (data.telefono.toString().length > 10 || data.telefono.toString().length < 7) {
              data.observacion = 'El teléfono ingresado no es válido';
              return;
            }
          } else {
            data.observacion = 'El teléfono ingresado no es válido';
            return;
          }
        }
      } else {
        data.observacion = 'Formato de fecha incorrecto (YYYY-MM-DD)';
        return;
      }
    } else {
      data.observacion = 'La contraseña debe tener máximo 10 caracteres';
      return;
    }
  } else {
    data.observacion = 'La contraseña ingresada no es válida';
    return;
  }
  data.identificacion = data.identificacion.trim();
  data.apellido = data.apellido.trim();
  data.nombre = data.nombre.trim();
  data.estado_civil = data.estado_civil.trim();
  data.genero = data.genero.trim();
  data.correo = data.correo.trim();
  data.fec_nacimiento = data.fec_nacimiento.trim();
  data.latitud = data.latitud.trim();
  data.longitud = data.longitud.trim();
  data.domicilio = data.domicilio.trim();
  data.telefono = data.telefono.trim();
  data.nacionalidad = data.nacionalidad.trim();
  data.usuario = data.usuario.trim();
  data.contrasena = data.contrasena.trim();
  data.rol = data.rol.trim();
  data.tipo_identificacion = data.tipo_identificacion.trim();
  data.numero_partida_individual = data.numero_partida_individual.trim();
  const VERIFICAR_CEDULA = await pool.query(
    `SELECT * FROM eu_empleados WHERE identificacion = $1`,
    [data.identificacion]
  );
  if (VERIFICAR_CEDULA.rows[0] != undefined && VERIFICAR_CEDULA.rows[0] != '') {
    data.observacion = 'Identificación ya existe en el sistema';
    return;
  }
  if (modoCodigo === 'cedula') {
    const VERIFICAR_CODIGO = await pool.query(
      `SELECT * FROM eu_empleados WHERE codigo = $1`,
      [data.identificacion]
    );
    if (VERIFICAR_CODIGO.rows[0] != undefined && VERIFICAR_CODIGO.rows[0] != '') {
      data.observacion = 'Código ya existe en el sistema';
      return;
    }
  }
  const VERIFICAR_USUARIO = await pool.query(
    `SELECT * FROM eu_usuarios WHERE usuario = $1`,
    [data.usuario]
  );
  if (VERIFICAR_USUARIO.rows[0] != undefined && VERIFICAR_USUARIO.rows[0] != '') {
    data.observacion = 'Usuario ya existe en el sistema';
    return;
  }
  if (data.rol != 'No registrado') {
    const VERIFICAR_ROL = await pool.query(
      `SELECT * FROM ero_cat_roles WHERE UPPER(nombre) = $1`,
      [data.rol.toUpperCase()]
    );
    if (VERIFICAR_ROL.rows[0] == undefined || VERIFICAR_ROL.rows[0] == '') {
      data.observacion = 'Rol no existe en el sistema';
      return;
    }
  }
  if (data.nacionalidad != 'No registrado') {
    const VERIFICAR_NACIONALIDAD = await pool.query(
      `SELECT * FROM e_cat_nacionalidades WHERE UPPER(nombre) = $1`,
      [data.nacionalidad.toUpperCase()]
    );
    if (VERIFICAR_NACIONALIDAD.rows[0] == undefined || VERIFICAR_NACIONALIDAD.rows[0] == '') {
      data.observacion = 'Nacionalidad no existe en el sistema';
      return;
    }
  }
  if (data.estado_civil != 'No registrado') {
    const VERIFICAR_ESTADO_CIVIL = await pool.query(
      `SELECT * FROM e_estado_civil WHERE UPPER(estado_civil) = $1`,
      [data.estado_civil.toUpperCase()]
    );
    if (VERIFICAR_ESTADO_CIVIL.rows[0] == undefined || VERIFICAR_ESTADO_CIVIL.rows[0] == '') {
      data.observacion = 'Estado civil no existe en el sistema';
      return;
    }
  }
  if (data.genero != 'No registrado') {
    const VERIFICAR_GENERO = await pool.query(
      `SELECT * FROM e_genero WHERE UPPER(genero) = $1`,
      [data.genero.toUpperCase()]
    );
    if (VERIFICAR_GENERO.rows[0] == undefined || VERIFICAR_GENERO.rows[0] == '') {
      data.observacion = 'Género no existe en el sistema';
      return;
    }
  }
  data.observacion = 'no registrado';
}

// METODO QUE VALIDA LA FILA DE PLANTILLA DE REGISTRO DE USUARIO, SI ES QUE ESTA INCOMPLETA   **USADO
export async function validarEmpleadoIncompleto(
  data: any,
  ITEM: any,
  IDENTIFICACION: any,
  APELLIDO: any,
  NOMBRE: any,
  ESTADO_CIVIL: any,
  GENERO: any,
  CORREO: any,
  FECHA_NACIMIENTO: any,
  LATITUD: any,
  LONGITUD: any,
  DOMICILIO: any,
  TELEFONO: any,
  NACIONALIDAD: any,
  USUARIO: any,
  CONTRASENA: any,
  ROL: any,
  TIPO_IDENTIFICACION: any,
  NUMERO_PARTIDA_INDIVIDUAL: any,
  regex: any,
  regexCorreo: RegExp,
  valiContra: RegExp,
  regexLatitud: RegExp,
  regexLongitud: RegExp,
  estadoCivilArray: string[],
  tipogenero: string[],
  pool: any,
  ValidarCedula: (cedula: string) => Promise<boolean>,
  modoCodigo: string,
): Promise<void> {
  data.fila = ITEM;
  data.identificacion = IDENTIFICACION;
  data.nombre = NOMBRE;
  data.apellido = APELLIDO;
  data.usuario = USUARIO;
  data.contrasena = CONTRASENA;
  data.rol = ROL;
  data.estado_civil = ESTADO_CIVIL;
  data.genero = GENERO;
  data.correo = CORREO;
  data.fec_nacimiento = FECHA_NACIMIENTO;
  data.latitud = LATITUD;
  data.longitud = LONGITUD;
  data.domicilio = DOMICILIO;
  data.telefono = TELEFONO;
  data.nacionalidad = NACIONALIDAD;
  data.tipo_identificacion = TIPO_IDENTIFICACION;
  data.numero_partida_individual = NUMERO_PARTIDA_INDIVIDUAL;
  data.observacion = 'no registrado';
  let hayDatosFaltantes = false;
  if (data.fila == '' || data.fila == undefined) {
    data.fila = 'error';
    hayDatosFaltantes = true;
  }
  if (APELLIDO == undefined) {
    data.apellido = 'No registrado';
    data.observacion = 'Apellido no registrado';
    hayDatosFaltantes = true;
  }
  if (NOMBRE == undefined) {
    data.nombre = 'No registrado';
    data.observacion = 'Nombre no registrado';
    hayDatosFaltantes = true;
  }
  if (modoCodigo === 'manual' && (data.codigo == undefined || data.codigo == '')) {
    data.codigo = 'No registrado';
    data.observacion = 'Código no registrado';
    hayDatosFaltantes = true;
  }
  if (ESTADO_CIVIL == undefined) {
    data.estado_civil = 'No registrado';
    data.observacion = 'Estado civil no registrado';
    hayDatosFaltantes = true;
  }
  if (GENERO == undefined) {
    data.genero = 'No registrado';
    data.observacion = 'Género no registrado';
    hayDatosFaltantes = true;
  }
  if (CORREO == undefined) {
    data.correo = 'No registrado';
    data.observacion = 'Correo no registrado';
    hayDatosFaltantes = true;
  }
  if (FECHA_NACIMIENTO == undefined) {
    data.fec_nacimiento = 'No registrado';
    data.observacion = 'Fecha de nacimiento no registrado';
    hayDatosFaltantes = true;
  }
  if (DOMICILIO == undefined) {
    data.domicilio = 'No registrado';
    if (!data.observacion || data.observacion.trim() === '') {
      data.observacion = " ";
    }
  }
  if (TELEFONO == undefined) {
    data.telefono = 'No registrado';
    if (!data.observacion || data.observacion.trim() === '') {
      data.observacion = " ";
    }
  }
  if ((!LATITUD || LATITUD === undefined) && (!LONGITUD || LONGITUD === undefined)) {
    data.latitud = 'No registrado';
    data.longitud = 'No registrado';
    data.observacion = " ";
    hayDatosFaltantes = true;
  } else {
    if (!LATITUD || LATITUD === undefined) {
      data.latitud = 'No registrado';
      data.observacion = 'Verificar ubicación';
    }
    if (!LONGITUD || LONGITUD === undefined) {
      data.longitud = 'No registrado';
      data.observacion = 'Verificar ubicación';
    }
  }
  if (NACIONALIDAD == undefined) {
    data.nacionalidad = 'No registrado';
    data.observacion = 'Nacionalidad no registrado';
    hayDatosFaltantes = true;
  }
  if (USUARIO == undefined) {
    data.usuario = 'No registrado';
    data.observacion = 'Usuario no registrado';
    hayDatosFaltantes = true;
  }
  if (CONTRASENA == undefined) {
    data.contrasena = 'No registrado';
    data.observacion = 'Contraseña no registrada';
    hayDatosFaltantes = true;
  }
  if (ROL == undefined) {
    data.rol = 'No registrado';
    data.observacion = 'Rol no registrado';
    hayDatosFaltantes = true;
  }
  if (IDENTIFICACION == undefined) {
    data.identificacion = 'No registrado';
    data.observacion = 'Identificación no registrada';
    hayDatosFaltantes = true;
  }
  if (TIPO_IDENTIFICACION == undefined) {
    data.tipo_identificacion = 'No registrado';
    data.observacion = 'Tipo identificación no registrado';
    hayDatosFaltantes = true;
  }
  if (!hayDatosFaltantes) {
    data.identificacion = data.identificacion.trim();
    data.apellido = data.apellido.trim();
    data.nombre = data.nombre.trim();
    data.estado_civil = data.estado_civil.trim();
    data.genero = data.genero.trim();
    data.correo = data.correo.trim();
    data.fec_nacimiento = data.fec_nacimiento.trim();
    data.latitud = data.latitud.trim();
    data.longitud = data.longitud.trim();
    data.domicilio = data.domicilio.trim();
    data.telefono = data.telefono.trim();
    data.nacionalidad = data.nacionalidad.trim();
    data.usuario = data.usuario.trim();
    data.contrasena = data.contrasena.trim();
    data.rol = data.rol.trim();
    if (modoCodigo === 'manual') {
      if (!regex.test(data.codigo)) {
        data.observacion = 'Formato de código incorrecto';
        return;
      }
    }
    if (TIPO_IDENTIFICACION == 'Pasaporte') {
      if (data.identificacion.toString().length == 0 || data.identificacion.toString().length > 10) {
        data.observacion = 'La identificación ingresada no es válida';
      }
      else {
        if (data.apellido != 'No registrado' && data.nombre != 'No registrado') {
          if (data.contrasena != 'No registrado') {
            if (!valiContra.test(data.contrasena.toString())) {
              if (data.contrasena.toString().length <= 10) {
                if (data.estado_civil != 'No registrado') {
                  if (estadoCivilArray.includes(data.estado_civil.toUpperCase())) {
                    if (data.genero != 'No registrado') {
                      if (tipogenero.includes(data.genero.toUpperCase())) {
                        if (data.correo == undefined || !regexCorreo.test(data.correo)) {
                          data.observacion = 'Verificar correo';
                        }
                        if (data.fec_nacimiento != 'No registrado') {
                          if (DateTime.fromFormat(data.fec_nacimiento, 'yyyy-MM-dd').isValid) {
                            if (LONGITUD != undefined && LATITUD != undefined) {
                              if (!regexLatitud.test(data.latitud) || !regexLongitud.test(data.longitud)) {
                                data.observacion = 'Verificar ubicación';
                              }
                            } else if (LONGITUD == undefined || LATITUD == undefined) {
                              data.observacion = 'Verificar ubicación';
                            }
                            if (TELEFONO != undefined) {
                              if (regex.test(data.telefono.toString())) {
                                if (data.telefono.toString().length > 10 || data.telefono.toString().length < 7) {
                                  data.observacion = 'El teléfono ingresado no es válido';
                                }
                              }
                              else {
                                data.observacion = 'El teléfono ingresado no es válido';
                              }
                            }
                          }
                          else {
                            data.observacion = 'Formato de fecha incorrecto (YYYY-MM-DD)';
                          }
                        }
                      }
                      else {
                        data.observacion = 'Género no es válido';
                      }
                    }
                  }
                  else {
                    data.observacion = 'Estado civil no es válido';
                  }
                }
              }
              else {
                data.observacion = 'La contraseña debe tener máximo 10 caracteres';
              }
            }
            else {
              data.observacion = 'La contraseña ingresada no es válida';
            }
          }
        }
      }
    } else {
      if (regex.test(data.identificacion)) {
        const cedulaValida = await ValidarCedula(data.identificacion);
        if (data.identificacion.toString().length != 10 || !cedulaValida) {
          data.observacion = 'La identificación ingresada no es válida';
        }
        else {
          if (data.apellido != 'No registrado' && data.nombre != 'No registrado') {
            if (data.contrasena != 'No registrado') {
              if (!valiContra.test(data.contrasena.toString())) {
                if (data.contrasena.toString().length <= 10) {
                  if (data.estado_civil != 'No registrado') {
                    if (estadoCivilArray.includes(data.estado_civil.toUpperCase())) {
                      if (data.genero != 'No registrado') {
                        if (tipogenero.includes(data.genero.toUpperCase())) {
                          if (data.correo == undefined || !regexCorreo.test(data.correo)) {
                            data.observacion = 'Verificar correo';
                          }
                          if (data.fec_nacimiento != 'No registrado') {
                            if (DateTime.fromFormat(data.fec_nacimiento, 'yyyy-MM-dd').isValid) {
                              if (LONGITUD != undefined && LATITUD != undefined) {
                                if (!regexLatitud.test(data.latitud) || !regexLongitud.test(data.longitud)) {
                                  data.observacion = 'Verificar ubicación';
                                }
                              } else if (LONGITUD == undefined || LATITUD == undefined) {
                                data.observacion = 'Verificar ubicación';
                              }
                              if (TELEFONO != undefined) {
                                if (regex.test(data.telefono.toString())) {
                                  if (data.telefono.toString().length > 10 || data.telefono.toString().length < 7) {
                                    data.observacion = 'El teléfono ingresado no es válido';
                                  }
                                }
                                else {
                                  data.observacion = 'El teléfono ingresado no es válido';
                                }
                              }
                            }
                            else {
                              data.observacion = 'Formato de fecha incorrecto (YYYY-MM-DD)';
                            }
                          }
                        }
                        else {
                          data.observacion = 'Género no es válido';
                        }
                      }
                    }
                    else {
                      data.observacion = 'Estado civil no es válido';
                    }
                  }
                }
                else {
                  data.observacion = 'La contraseña debe tener máximo 10 caracteres';
                }
              }
              else {
                data.observacion = 'La contraseña ingresada no es válida';
              }
            }
          }
        }
      } else {
        data.observacion = 'La identificación ingresada no es válida';
      }
    }
  }
  const VERIFICAR_CEDULA = await pool.query(
    `SELECT * FROM eu_empleados WHERE identificacion = $1`,
    [data.identificacion]
  );
  if (VERIFICAR_CEDULA.rows[0] != undefined && VERIFICAR_CEDULA.rows[0] != '') {
    data.observacion = 'Identificación ya existe en el sistema';
    return;
  }
  if (modoCodigo === 'cedula') {
    const VERIFICAR_CODIGO = await pool.query(
      `SELECT * FROM eu_empleados WHERE codigo = $1`,
      [data.identificacion]
    );
    if (VERIFICAR_CODIGO.rows[0] != undefined && VERIFICAR_CODIGO.rows[0] != '') {
      data.observacion = 'Código ya existe en el sistema';
      return;
    }
  }
  const VERIFICAR_USUARIO = await pool.query(
    `SELECT * FROM eu_usuarios WHERE usuario = $1`,
    [data.usuario]
  );
  if (VERIFICAR_USUARIO.rows[0] != undefined && VERIFICAR_USUARIO.rows[0] != '') {
    data.observacion = 'Usuario ya existe en el sistema';
    return;
  }
  if (data.rol != 'No registrado') {
    const VERIFICAR_ROL = await pool.query(
      `SELECT * FROM ero_cat_roles WHERE UPPER(nombre) = $1`,
      [data.rol.toUpperCase()]
    );
    if (VERIFICAR_ROL.rows[0] == undefined || VERIFICAR_ROL.rows[0] == '') {
      data.observacion = 'Rol no existe en el sistema';
      return;
    }
  }
  if (data.nacionalidad != 'No registrado') {
    const VERIFICAR_NACIONALIDAD = await pool.query(
      `SELECT * FROM e_cat_nacionalidades WHERE UPPER(nombre) = $1`,
      [data.nacionalidad.toUpperCase()]
    );
    if (VERIFICAR_NACIONALIDAD.rows[0] == undefined || VERIFICAR_NACIONALIDAD.rows[0] == '') {
      data.observacion = 'Nacionalidad no existe en el sistema';
      return;
    }
  }
  if (data.estado_civil != 'No registrado') {
    const VERIFICAR_ESTADO_CIVIL = await pool.query(
      `SELECT * FROM e_estado_civil WHERE UPPER(estado_civil) = $1`,
      [data.estado_civil.toUpperCase()]
    );
    if (VERIFICAR_ESTADO_CIVIL.rows[0] == undefined || VERIFICAR_ESTADO_CIVIL.rows[0] == '') {
      data.observacion = 'Estado civil no existe en el sistema';
      return;
    }
  }
  if (data.genero != 'No registrado') {
    const VERIFICAR_GENERO = await pool.query(
      `SELECT * FROM e_genero WHERE UPPER(genero) = $1`,
      [data.genero.toUpperCase()]
    );
    if (VERIFICAR_GENERO.rows[0] == undefined || VERIFICAR_GENERO.rows[0] == '') {
      data.observacion = 'Género no existe en el sistema';
      return;
    }
  }
}
