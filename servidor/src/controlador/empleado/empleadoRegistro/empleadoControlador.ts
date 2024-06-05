// SECCION LIBRERIAS
import { ObtenerRutaUsuario, ObtenerRutaVacuna, ObtenerRutaPermisos, ObtenerRutaContrato } from '../../../libs/accesoCarpetas';
import { ObtenerRutaLeerPlantillas } from '../../../libs/accesoCarpetas';
import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import { Md5 } from 'ts-md5';
import AUDITORIA_CONTROLADOR from '../../auditoria/auditoriaControlador';
import pool from '../../../database';
import moment from 'moment';
import excel from 'xlsx';
import path from 'path';
import fs from 'fs';

class EmpleadoControlador {

  /** ** ********************************************************************************************* ** 
   ** ** **                        MANEJO DE CODIGOS DE USUARIOS                                    ** ** 
   ** ** ********************************************************************************************* **/

  // BUSQUEDA DE CODIGO DEL EMPLEADO
  public async ObtenerCodigo(req: Request, res: Response): Promise<any> {
    const VALOR = await pool.query(
      `
      SELECT * FROM e_codigo
      `
    );
    if (VALOR.rowCount > 0) {
      return res.jsonp(VALOR.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }
  }

  // CREAR CODIGO DE EMPLEADO
  public async CrearCodigo(req: Request, res: Response) {
    try {
      const { id, valor, automatico, manual, user_name, ip } = req.body;
      
      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      await pool.query(
        `
        INSERT INTO e_codigo (id, valor, automatico, manual) VALUES ($1, $2, $3, $4)
        `
        , [id, valor, automatico, manual]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'e_codigo',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos:`{id: ${id}, valor: ${valor}, automatico: ${automatico}, manual: ${manual}}`,
        ip, 
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      res.jsonp({ message: 'Registro guardado.' });
    } catch (error) {
      console.log('error ---- ', error)
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      res.status(500).jsonp({ message: 'Error al guardar código.' });
    }
  }

  // BUSQUEDA DEL ULTIMO CODIGO REGISTRADO EN EL SISTEMA
  public async ObtenerMAXCodigo(req: Request, res: Response): Promise<any> {
    try {
      const VALOR = await pool.query(
        `
        SELECT MAX(codigo::BIGINT) AS codigo FROM eu_empleados
        `
      );
      if (VALOR.rowCount > 0) {
        return res.jsonp(VALOR.rows)
      }
      else {
        return res.status(404).jsonp({ text: 'Registros no encontrados.' });
      }
    } catch (error) {
      console.log('error ---- ', error)
      return res.status(404).jsonp({ text: 'Error al obtener código máximo.' });
    }

  }

  // METODO PARA ACTUALIZAR INFORMACION DE CODIGOS
  public async ActualizarCodigoTotal(req: Request, res: Response): Promise<Response> {
    try {
 
      const { valor, automatico, manual, cedula, id, user_name, ip } = req.body;
      console.log('***** ', req.body)
      // INICIAR TRANSACCION
      await pool.query('BEGIN');
  
      // CONSULTAR DATOSORIGINALES
      const codigo = await pool.query('SELECT * FROM e_codigo WHERE id = $1', [id]);
      const [datosOriginales] = codigo.rows;
  
      if (!datosOriginales){
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'e_codigo',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al actualizar código con id: ${id}`
        });
  
        //FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Error al actualizar código' });
      }
  
      await pool.query(
        `
        UPDATE e_codigo SET valor = $1, automatico = $2, manual = $3 , cedula = $4 WHERE id = $5
        `
        , [valor, automatico, manual, cedula, id]);
  
      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'e_codigo',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: `{valor: ${valor}, automatico: ${automatico}, manual: ${manual}, cedula: ${cedula}}`,
        ip,
        observacion: null
      });
  
      //FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro actualizado.' });
    } catch (error) {
      console.log('error ---- ', error)
      //REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'Error al actualizar código.' });
    }
  }

  // METODO PARA ACTUALIZAR CODIGO DE EMPLEADO
  public async ActualizarCodigo(req: Request, res: Response): Promise<Response>{
    try {
      const { valor, id, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const codigo = await pool.query('SELECT * FROM e_codigo WHERE id = $1', [id]);
      const [datosOriginales] = codigo.rows;

      if (!datosOriginales){
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'e_codigo',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al actualizar código con id: ${id}`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Error al actualizar código' });
      }

      await pool.query(
         `
        UPDATE e_codigo SET valor = $1 WHERE id = $2
        `
        , [valor, id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'e_codigo',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: `{valor: ${valor}}`,
        ip,
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


  /** ** ********************************************************************************************* ** 
   ** ** **                         MANEJO DE DATOS DE EMPLEADO                                     ** ** 
   ** ** ********************************************************************************************* **/

  // INGRESAR REGISTRO DE EMPLEADO EN BASE DE DATOS
  public async InsertarEmpleado(req: Request, res: Response) {
    try {
      const { cedula, apellido, nombre, esta_civil, genero, correo, fec_nacimiento, estado,
        domicilio, telefono, id_nacionalidad, codigo, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      const response: QueryResult = await pool.query(
        `
        INSERT INTO eu_empleados (cedula, apellido, nombre, estado_civil, genero, correo, 
          fecha_nacimiento, estado, domicilio, telefono, id_nacionalidad, codigo) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *
        `
        , [cedula, apellido, nombre, esta_civil, genero, correo, fec_nacimiento, estado, domicilio,
          telefono, id_nacionalidad, codigo]);

      const [empleado] = response.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eu_empleados',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: JSON.stringify(empleado),
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');

      if (empleado) {

        let verificar = 0;
        // RUTA DE LA CARPETA PRINCIPAL PERMISOS
        const carpetaPermisos = await ObtenerRutaPermisos(codigo);

        // METODO MKDIR PARA CREAR LA CARPETA
        fs.mkdir(carpetaPermisos, { recursive: true }, (err: any) => {
          if (err) {
            verificar = 1;
          } else {
            verificar = 0;
          }
        });

        // RUTA DE LA CARPETA PRINCIPAL IMAGENES
        const carpetaImagenes = await ObtenerRutaUsuario(empleado.id);

        // METODO MKDIR PARA CREAR LA CARPETA
        fs.mkdir(carpetaImagenes, { recursive: true }, (err: any) => {
          if (err) {
            verificar = 1;
          } else {
            verificar = 0;
          }
        });

        // RUTA DE LA CARPETA DE ALMACENAMIENTO DE VACUNAS
        const carpetaVacunas = await ObtenerRutaVacuna(empleado.id);

        // METODO MKDIR PARA CREAR LA CARPETA
        fs.mkdir(carpetaVacunas, { recursive: true }, (err: any) => {
          if (err) {
            verificar = 1;
          } else {
            verificar = 0;
          }
        });

        // RUTA DE LA CARPETA DE ALMACENAMIENTO DE CONTRATOS
        const carpetaContratos = await ObtenerRutaContrato(empleado.id);

        // METODO MKDIR PARA CREAR LA CARPETA
        fs.mkdir(carpetaContratos, { recursive: true }, (err: any) => {
          if (err) {
            verificar = 1;
          } else {
            verificar = 0;
          }
        });

        // METODO DE VERIFICACION DE CREACION DE DIRECTORIOS
        if (verificar === 1) {
          console.error('Error al crear las carpetas.');
        }
        else {
          return res.status(200).jsonp(empleado)
        }

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

  // ACTUALIZAR INFORMACION EL EMPLEADO
  public async EditarEmpleado(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const { cedula, apellido, nombre, esta_civil, genero, correo, fec_nacimiento, estado,
        domicilio, telefono, id_nacionalidad, codigo, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const empleado = await pool.query('SELECT * FROM eu_empleados WHERE id = $1', [id]);
      const [datosOriginales] = empleado.rows;

      if (!datosOriginales){
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eu_empleados',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al actualizar empleado con id: ${id}`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Error al actualizar empleado' });
      }

      await pool.query(
        `
        UPDATE eu_empleados SET cedula = $2, apellido = $3, nombre = $4, estado_civil = $5, 
          genero = $6, correo = $7, fecha_nacimiento = $8, estado = $9, domicilio = $10, 
          telefono = $11, id_nacionalidad = $12, codigo = $13 
        WHERE id = $1 
        `
        , [id, cedula, apellido, nombre, esta_civil, genero, correo, fec_nacimiento, estado,
          domicilio, telefono, id_nacionalidad, codigo]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eu_empleados',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: `{cedula: ${cedula}, apellido: ${apellido}, nombre: ${nombre}, estado_civil: ${esta_civil}, genero: ${genero}, correo: ${correo}, fecha_nacimiento: ${fec_nacimiento}, estado: ${estado}, domicilio: ${domicilio}, telefono: ${telefono}, id_nacionalidad: ${id_nacionalidad}, codigo: ${codigo}}`,
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');

      let verificar_permisos = 0;

      // RUTA DE LA CARPETA PERMISOS DEL USUARIO
      const carpetaPermisos = await ObtenerRutaPermisos(codigo);

      // VERIFICACION DE EXISTENCIA CARPETA PERMISOS DE USUARIO
      fs.access(carpetaPermisos, fs.constants.F_OK, (err) => {
        if (err) {
          // METODO MKDIR PARA CREAR LA CARPETA
          fs.mkdir(carpetaPermisos, { recursive: true }, (err: any) => {
            if (err) {
              verificar_permisos = 1;
            } else {
              verificar_permisos = 0;
            }
          });
        } else {
          verificar_permisos = 0;
        }
      });


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

      let verificar_vacunas = 0;

      // RUTA DE LA CARPETA VACUNAS DEL USUARIO
      const carpetaVacunas = await ObtenerRutaVacuna(id);

      // VERIFICACION DE EXISTENCIA CARPETA PERMISOS DE USUARIO
      fs.access(carpetaVacunas, fs.constants.F_OK, (err) => {
        if (err) {
          // METODO MKDIR PARA CREAR LA CARPETA
          fs.mkdir(carpetaVacunas, { recursive: true }, (err: any) => {
            if (err) {
              verificar_vacunas = 1;
            } else {
              verificar_vacunas = 0;
            }
          });
        } else {
          verificar_vacunas = 0;
        }
      });

      let verificar_contrato = 0;

      // RUTA DE LA CARPETA CONTRATOS DEL USUARIO
      const carpetaContratos = await ObtenerRutaContrato(id);

      // VERIFICACION DE EXISTENCIA CARPETA CONTRATOS DE USUARIO
      fs.access(carpetaContratos, fs.constants.F_OK, (err) => {
        if (err) {
          // METODO MKDIR PARA CREAR LA CARPETA
          fs.mkdir(carpetaContratos, { recursive: true }, (err: any) => {
            if (err) {
              verificar_contrato = 1;
            } else {
              verificar_contrato = 0;
            }
          });
        } else {
          verificar_contrato = 0
        }
      });

      // METODO DE VERIFICACION DE CREACION DE DIRECTORIOS
      if (verificar_permisos === 1 && verificar_imagen === 1 && verificar_vacunas === 1 && verificar_contrato === 1) {
        res.jsonp({ message: 'Ups!!! no fue posible crear el directorio de contratos, permisos, imagenes y vacunación del usuario.' });

      } else if (verificar_permisos === 1 && verificar_imagen === 0 && verificar_vacunas === 0 && verificar_contrato === 0) {
        res.jsonp({ message: 'Ups!!! no fue posible crear el directorio de permisos del usuario.' });

      } else if (verificar_permisos === 0 && verificar_imagen === 1 && verificar_vacunas === 0 && verificar_contrato === 0) {
        res.jsonp({ message: 'Ups!!! no fue posible crear el directorio de imagenes del usuario.' });
      }
      else if (verificar_permisos === 0 && verificar_imagen === 0 && verificar_vacunas === 1 && verificar_contrato === 0) {
        res.jsonp({ message: 'Ups!!! no fue posible crear el directorio de vacunación del usuario.' });
      }
      else if (verificar_permisos === 0 && verificar_imagen === 0 && verificar_vacunas === 1 && verificar_contrato === 1) {
        res.jsonp({ message: 'Ups!!! no fue posible crear el directorio de contratos del usuario.' });
      }
      else {
        res.jsonp({ message: 'Registro actualizado.' });
      }

    }
    catch (error) {
      console.log('error ', error)
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' });
    }
  }



  // BUSQUEDA DE UN SOLO EMPLEADO  --**VERIFICADO
  public async BuscarEmpleado(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const EMPLEADO = await pool.query(
      `
      SELECT * FROM eu_empleados WHERE id = $1
      `
      , [id]);
    if (EMPLEADO.rowCount > 0) {
      return res.jsonp(EMPLEADO.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
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

  // LISTAR EMPLEADOS ACTIVOS EN EL SISTEMA
  public async Listar(req: Request, res: Response) {
    const empleado = await pool.query(
      `
      SELECT * FROM eu_empleados WHERE estado = 1 ORDER BY id
      `
    );
    res.jsonp(empleado.rows);
  }

  // METODO QUE LISTA EMPLEADOS INHABILITADOS
  public async ListarEmpleadosDesactivados(req: Request, res: Response) {
    const empleado = await pool.query(
      `
      SELECT * FROM eu_empleados WHERE estado = 2 ORDER BY id
      `
    );
    res.jsonp(empleado.rows);
  }


  // METODO PARA INHABILITAR USUARIOS EN EL SISTEMA
  public async DesactivarMultiplesEmpleados(req: Request, res: Response): Promise<any> {
    const {arrayIdsEmpleados, user_name, ip} = req.body;

    if (arrayIdsEmpleados.length > 0) {
      arrayIdsEmpleados.forEach(async (obj: number) => {

        try {
          // INICIAR TRANSACCION
          await pool.query('BEGIN');

          // CONSULTAR DATOSORIGINALES
          const empleado = await pool.query('SELECT * FROM eu_empleados WHERE id = $1', [obj]);
          const [datosOriginales] = empleado.rows;

          const usuario = await pool.query('SELECT * FROM eu_usuarios WHERE id_empleado = $1', [obj]);
          const [datosOriginalesUsuario] = usuario.rows;

          if (!datosOriginales || !datosOriginalesUsuario){
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'eu_empleados',
              usuario: user_name,
              accion: 'U',
              datosOriginales: '',
              datosNuevos: '',
              ip,
              observacion: `Error al inhabilitar empleado con id: ${obj}`
            });

            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'eu_usuarios',
              usuario: user_name,
              accion: 'U',
              datosOriginales: '',
              datosNuevos: '',
              ip,
              observacion: `Error al inhabilitar usuario con id_empleado: ${obj}`
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            throw new Error('Error al inhabilitar empleado con id: ' + obj);
          }

          // 2 => DESACTIVADO O INACTIVO
          await pool.query(
            `
            UPDATE eu_empleados SET estado = 2 WHERE id = $1
            `
            , [obj])
            .then((result: any) => { });

          // AUDITORIA
          await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'eu_empleados',
            usuario: user_name,
            accion: 'U',
            datosOriginales: JSON.stringify(datosOriginales),
            datosNuevos: `{estado: 2}`,
            ip,
            observacion: null
          });

          // FALSE => YA NO TIENE ACCESO
          await pool.query(
            `
            UPDATE eu_usuarios SET estado = false, app_habilita = false WHERE id_empleado = $1
            `
            , [obj])
            .then((result: any) => { });

          // AUDITORIA
          await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'eu_usuarios',
            usuario: user_name,
            accion: 'U',
            datosOriginales: JSON.stringify(datosOriginalesUsuario),
            datosNuevos: `{estado: false, app_habilita: false}`,
            ip,
            observacion: null
          });

          // FINALIZAR TRANSACCION
          await pool.query('COMMIT');
        } catch (error) {
          // REVERTIR TRANSACCION
          await pool.query('ROLLBACK');
        }
      });

      return res.jsonp({ message: 'Usuarios inhabilitados exitosamente.' });
    }

    return res.jsonp({ message: 'Upss!!! ocurrio un error.' });
  }

  // METODO PARA HABILITAR EMPLEADOS
  public async ActivarMultiplesEmpleados(req: Request, res: Response): Promise<any> {
    const {arrayIdsEmpleados, user_name, ip} = req.body;

    if (arrayIdsEmpleados.length > 0) {
      arrayIdsEmpleados.forEach(async (obj: number) => {
        try {

          // INICIAR TRANSACCION
          await pool.query('BEGIN');

          // CONSULTAR DATOSORIGINALES
          const empleado = await pool.query('SELECT * FROM eu_empleados WHERE id = $1', [obj]);
          const [datosOriginales] = empleado.rows;

          const usuario = await pool.query('SELECT * FROM eu_usuarios WHERE id_empleado = $1', [obj]);
          const [datosOriginalesUsuario] = usuario.rows;

          if (!datosOriginales || !datosOriginalesUsuario){
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'eu_empleados',
              usuario: user_name,
              accion: 'U',
              datosOriginales: '',
              datosNuevos: '',
              ip,
              observacion: `Error al activar empleado con id: ${obj}`
            });

            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'eu_usuarios',
              usuario: user_name,
              accion: 'U',
              datosOriginales: '',
              datosNuevos: '',
              ip,
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
            `
            , [obj])
            .then((result: any) => { });

          // AUDITORIA
          await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'eu_empleados',
            usuario: user_name,
            accion: 'U',
            datosOriginales: JSON.stringify(datosOriginales),
            datosNuevos: `{estado: 1}`,
            ip,
            observacion: null
          });
  
          // TRUE => TIENE ACCESO
          await pool.query(
            `
            UPDATE eu_usuarios SET estado = true, app_habilita = true WHERE id_empleado = $1
            `
            , [obj])
            .then((result: any) => { });

          // AUDITORIA
          await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'eu_usuarios',
            usuario: user_name,
            accion: 'U',
            datosOriginales: JSON.stringify(datosOriginalesUsuario),
            datosNuevos: `{estado: true, app_habilita: true}`,
            ip,
            observacion: null
          });

          // FINALIZAR TRANSACCION
          await pool.query('COMMIT');
        } catch (error) {
          // REVERTIR TRANSACCION
          await pool.query('ROLLBACK');
        }
      });

      return res.jsonp({ message: 'Usuarios habilitados exitosamente.' });
    }
    return res.jsonp({ message: 'Upss!!! ocurrio un error.' });
  }

  // METODO PARA HABILITAR TODA LA INFORMACION DEL EMPLEADO
  public async ReactivarMultiplesEmpleados(req: Request, res: Response): Promise<any> {
    const {arrayIdsEmpleados, user_name, ip} = req.body;
    if (arrayIdsEmpleados.length > 0) {
      arrayIdsEmpleados.forEach(async (obj: number) => {
        try {
          // INICIAR TRANSACCION
          await pool.query('BEGIN');

          // CONSULTAR DATOSORIGINALES
          const empleado = await pool.query('SELECT * FROM eu_empleados WHERE id = $1', [obj]);
          const [datosOriginales] = empleado.rows;

          const usuario = await pool.query('SELECT * FROM eu_usuarios WHERE id_empleado = $1', [obj]);
          const [datosOriginalesUsuario] = usuario.rows;

          if (!datosOriginales || !datosOriginalesUsuario){
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'eu_empleados',
              usuario: user_name,
              accion: 'U',
              datosOriginales: '',
              datosNuevos: '',
              ip,
              observacion: `Error al reactivar empleado con id: ${obj}`
            });

            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
              tabla: 'eu_usuarios',
              usuario: user_name,
              accion: 'U',
              datosOriginales: '',
              datosNuevos: '',
              ip,
              observacion: `Error al reactivar usuario con id_empleado: ${obj}`
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            throw new Error('Error al reactivar empleado con id: ' + obj);
          }

          // 1 => ACTIVADO
          await pool.query(
            `
            UPDATE eu_empleados SET estado = 1 WHERE id = $1
            `
            , [obj])
            .then((result: any) => { });

          // AUDITORIA
          await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'eu_empleados',
            usuario: user_name,
            accion: 'U',
            datosOriginales: JSON.stringify(datosOriginales),
            datosNuevos: `{estado: 1}`,
            ip,
            observacion: null
          });
  
          // TRUE => TIENE ACCESO
          await pool.query(
            `
            UPDATE eu_usuarios SET estado = true, app_habilita = true WHERE id_empleado = $1
            `
            , [obj])
            .then((result: any) => { });

          // AUDITORIA
          await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'eu_usuarios',
            usuario: user_name,
            accion: 'U',
            datosOriginales: JSON.stringify(datosOriginalesUsuario),
            datosNuevos: `{estado: true, app_habilita: true}`,
            ip,
            observacion: null
          });

          // FINALIZAR TRANSACCION
          await pool.query('COMMIT');

          // REVISAR
          //EstadoHorarioPeriVacacion(obj);
        } catch (error) {
          // REVERTIR TRANSACCION
          await pool.query('ROLLBACK');          
        }
      });

      return res.jsonp({ message: 'Usuarios habilitados exitosamente.' });
    }
    return res.jsonp({ message: 'Upps!!! ocurrio un error.' });
  }

  // CARGAR IMAGEN DE EMPLEADO
  public async CrearImagenEmpleado(req: Request, res: Response): Promise<void> {
  // FECHA DEL SISTEMA
  const fecha = moment();
  const anio = fecha.format('YYYY');
  const mes = fecha.format('MM');
  const dia = fecha.format('DD');

  const id = req.params.id_empleado;
  const separador = path.sep;

  const { user_name, ip } = req.body;

  const unEmpleado = await pool.query('SELECT * FROM eu_empleados WHERE id = $1', [id]);

  if (unEmpleado.rowCount > 0) {
    const promises = unEmpleado.rows.map(async (obj: any) => {
      try {
        const imagen = `${obj.codigo}_${anio}_${mes}_${dia}_${req.file?.originalname}`;
  
        if (obj.imagen && obj.imagen !== 'null') {
          const ruta = await ObtenerRutaUsuario(obj.id) + separador + obj.imagen;
          fs.access(ruta, fs.constants.F_OK, (err) => {
            if (!err) {
              fs.unlinkSync(ruta);
            }
          });
        }

        // INICIAR TRANSACCION
        await pool.query('BEGIN');

        // CONSULTAR DATOSORIGINALES
        const empleado = await pool.query('SELECT * FROM empleados WHERE id = $1', [id]);
        const [datosOriginales] = empleado.rows;

        if (!datosOriginales){
          await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'eu_empleados',
            usuario: user_name,
            accion: 'U',
            datosOriginales: '',
            datosNuevos: '',
            ip,
            observacion: `Error al actualizar imagen de empleado con id: ${id}. Registro no encontrado.`
          });

          // FINALIZAR TRANSACCION
          await pool.query('COMMIT');
          throw new Error('Error al actualizar imagen de empleado con id: ' + id);
        }
  
        await pool.query('UPDATE eu_empleados SET imagen = $2 WHERE id = $1', [id, imagen]);

        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eu_empleados',
          usuario: user_name,
          accion: 'U',
          datosOriginales: JSON.stringify(datosOriginales),
          datosNuevos: `{imagen: ${imagen}}`,
          ip,
          observacion: null
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
      } catch (error) {
        // REVERTIR TRANSACCION
        await pool.query('ROLLBACK');
        res.status(500).jsonp({ message: 'Error al actualizar imagen de empleado.' });
      }
    });

    await Promise.all(promises);
    res.jsonp({ message: 'Imagen actualizada.' });
  }
}

  // METODO PARA TOMAR DATOS DE LA UBICACION DEL DOMICILIO DEL EMPLEADO
  public async GeolocalizacionCrokis(req: Request, res: Response): Promise<Response> {
    let id = req.params.id
    let { lat, lng, user_name, ip } = req.body
    console.log(lat, lng, id);
    try {
      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const empleado = await pool.query('SELECT * FROM empleados WHERE id = $1', [id]);
      const [datosOriginales] = empleado.rows;

      if (!datosOriginales){
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'empleados',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al actualizar geolocalización de empleado con id: ${id}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Error al actualizar geolocalización de empleado.' });
      }

      await pool.query(
        `
        UPDATE eu_empleados SET latitud = $1, longitud = $2 WHERE id = $3
        `
        , [lat, lng, id])
        .then((result: any) => { });

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'empleados',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: `{latitud: ${lat}, longitud: ${lng}}`,
        ip,
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

  // BUSQUEDA DE TITULOS PROFESIONALES DEL EMPLEADO
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
    if (unEmpleadoTitulo.rowCount > 0) {
      return res.jsonp(unEmpleadoTitulo.rows)
    }
    else {
      res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  // METODO PARA BUSCAR TITULO ESPECIFICO DEL EMPLEADO
  public async ObtenerTituloEspecifico(req: Request, res: Response): Promise<any> {
    const { id_empleado, id_titulo } = req.body;
    const unEmpleadoTitulo = await pool.query(
      `
      SELECT et.id
      FROM eu_empleado_titulos AS et
      WHERE et.id_empleado = $1 AND et.id_titulo = $2
      `
      , [id_empleado, id_titulo]);
    if (unEmpleadoTitulo.rowCount > 0) {
      return res.jsonp(unEmpleadoTitulo.rows)
    }
    else {
      res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  // INGRESAR TITULO PROFESIONAL DEL EMPLEADO
  public async CrearEmpleadoTitulos(req: Request, res: Response): Promise<void> {
    try {
      const { observacion, id_empleado, id_titulo, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      await pool.query(
        `
        INSERT INTO eu_empleado_titulos (observacion, id_empleado, id_titulo) VALUES ($1, $2, $3)
        `
        , [observacion, id_empleado, id_titulo]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eu_empleado_titulos',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: `{observacion: ${observacion}, id_empleado: ${id_empleado}, id_titulo: ${id_titulo}}`,
        ip,
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

  // ACTUALIZAR TITULO PROFESIONAL DEL EMPLEADO
  public async EditarTituloEmpleado(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id_empleado_titulo;
      const { observacion, id_titulo, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const empleado = await pool.query('SELECT * FROM eu_empleado_titulos WHERE id = $1', [id]);
      const [datosOriginales] = empleado.rows;

      if (!datosOriginales){
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eu_empleado_titulos',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al actualizar titulo del empleado con id: ${id}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Error al actualizar titulo del empleado.' });
      }

      await pool.query(
        `
        UPDATE eu_empleado_titulos SET observacion = $1, id_titulo = $2 WHERE id = $3
        `
        , [observacion, id_titulo, id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eu_empleado_titulos',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: `{observacion: ${observacion}, id_titulo: ${id_titulo}}`,
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

  // METODO PARA ELIMINAR TITULO PROFESIONAL DEL EMPLEADO
  public async EliminarTituloEmpleado(req: Request, res: Response): Promise<Response> {
    try {
      const { user_name, ip } = req.body;
      const id = req.params.id_empleado_titulo;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const empleado = await pool.query('SELECT * FROM eu_empleado_titulos WHERE id = $1', [id]);
      const [datosOriginales] = empleado.rows;

      if (!datosOriginales){
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eu_empleado_titulos',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip,
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


  /** ******************************************************************************************* **
   ** **               CONSULTAS DE COORDENADAS DE UBICACION DEL USUARIO                       ** ** 
   ** ******************************************************************************************* **/

  // METODO PARA BUSCAR DATOS DE COORDENADAS DE DOMICILIO
  public async BuscarCoordenadas(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const UBICACION = await pool.query(
      `
      SELECT longitud, latitud FROM eu_empleados WHERE id = $1
      `
      , [id]);
    if (UBICACION.rowCount > 0) {
      return res.jsonp(UBICACION.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se ha encontrado registros.' });
    }
  }

  // BUSQUEDA DE DATOS DE EMPLEADO INGRESANDO EL NOMBRE
  public async BuscarEmpleadoNombre(req: Request, res: Response): Promise<any> {
    const { informacion } = req.body;
    const EMPLEADO = await pool.query(
      `
      SELECT * FROM eu_empleados WHERE
      (UPPER (apellido) || \' \' || UPPER (nombre)) = $1
      `
      , [informacion]);
    if (EMPLEADO.rowCount > 0) {
      return res.jsonp(EMPLEADO.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }

  // BUSQUEDA DE IMAGEN DE EMPLEADO
  public async BuscarImagen(req: Request, res: Response): Promise<any> {
    const imagen = req.params.imagen;
    const id = req.params.id;
    let separador = path.sep;

    let ruta = await ObtenerRutaUsuario(id) + separador + imagen;
    console.log('ver file ', ruta)

    fs.access(ruta, fs.constants.F_OK, (err) => {
      if (err) {
      } else {
        res.sendFile(path.resolve(ruta));
      }
    });
  }

  public async getImagenBase64(req: Request, res: Response): Promise<any> {
    const imagen = req.params.imagen;
    const id = req.params.id;
    let separador = path.sep;

    let ruta = await ObtenerRutaUsuario(id) + separador + imagen;

    fs.access(ruta, fs.constants.F_OK, (err) => {
      if (err) {
        res.status(200).jsonp({ imagen: 0 })
      } else {
        let path_file = path.resolve(ruta);
        let data = fs.readFileSync(path_file);
        let codificado = data.toString('base64');
        if (codificado === null) {
          res.status(200).jsonp({ imagen: 0 })
        } else {
          res.status(200).jsonp({ imagen: codificado })
        }
      }
    });
  }

  // BUSQUEDA INFORMACIÓN DEPARTAMENTOS EMPLEADO
  public async ObtenerDepartamentoEmpleado(req: Request, res: Response): Promise<any> {
    const { id_emple, id_cargo } = req.body;
    const DEPARTAMENTO = await pool.query(
      `
      SELECT * FROM VistaDepartamentoEmpleado WHERE id_emple = $1 AND
      id_cargo = $2
      `
      , [id_emple, id_cargo]);
    if (DEPARTAMENTO.rowCount > 0) {
      return res.jsonp(DEPARTAMENTO.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }
  }

  // METODO PARA ELIMINAR REGISTROS

  public async EliminarEmpleado(req: Request, res: Response) {


    try {

      const id = req.params.id;
      const { user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const empleado = await pool.query('SELECT * FROM eu_empleados WHERE id = $1', [id]);
      const [datosOriginales] = empleado.rows;

      if (!datosOriginales){
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eu_empleados',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al eliminar empleado con id: ${id}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Error al eliminar empleado.' });
      }

      await pool.query(
        `
        DELETE FROM eu_empleados WHERE id = $1
        `
        , [id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eu_empleados',
        usuario: user_name,
        accion: 'D',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: '',
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      res.jsonp({ message: 'Registro eliminado.' });
    }
    catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.jsonp({ message: 'error' });
    }


  }


  /** **************************************************************************************** **
   ** **                      CARGAR INFORMACIÓN MEDIANTE PLANTILLA                            ** 
   ** **************************************************************************************** **/

  public async VerificarPlantilla_Automatica(req: Request, res: Response): Promise<void> {
    const documento = req.file?.originalname;
    let separador = path.sep;
    let ruta = ObtenerRutaLeerPlantillas() + separador + documento;

    const workbook = excel.readFile(ruta);
    const sheet_name_list = workbook.SheetNames;
    const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

    let data: any = {
      fila: '',
      cedula: '',
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
    };

    var listEmpleados: any = [];
    var duplicados: any = [];
    var duplicados1: any = [];
    var duplicados2: any = [];
    var mensaje: string = 'correcto';

    plantilla.forEach(async (dato: any, indice: any, array: any) => {
      // Datos que se leen de la plantilla ingresada
      var { item, cedula, apellido, nombre, estado_civil, genero, correo, fec_nacimiento, latitud, longitud,
        domicilio, telefono, nacionalidad, usuario, contrasena, rol } = dato;

      //Verificar que el registo no tenga datos vacios
      if ((item != undefined && item != '') &&
        (cedula != undefined) && (apellido != undefined) &&
        (nombre != undefined) && (estado_civil != undefined) &&
        (genero != undefined) && (correo != undefined) &&
        (fec_nacimiento != undefined) &&
        (latitud != undefined) && (longitud != undefined) &&
        (domicilio != undefined) && (telefono != undefined) &&
        (nacionalidad != undefined) && (usuario != undefined) &&
        (contrasena != undefined) && (rol != undefined)
      ) {
        data.fila = item; data.cedula = cedula; 
        data.nombre = nombre; data.apellido = apellido; 
        data.usuario = usuario; data.contrasena = contrasena;
        data.rol = rol; data.estado_civil = estado_civil;
        data.genero = genero; data.correo = correo;
        data.fec_nacimiento = fec_nacimiento; data.latitud = latitud;
        data.longitud = longitud;
        data.domicilio = domicilio; data.telefono = telefono;
        data.nacionalidad = nacionalidad; 

        //Valida si los datos de la columna cedula son numeros.
        const regex = /^[0-9]+$/;
        const valiContra = /\s/;
        if (regex.test(data.cedula)) {
          if (data.cedula.toString().length != 10) {
            data.observacion = 'La cédula ingresada no es válida';
          } else {
            if(!valiContra.test(data.contrasena.toString())){
              data.observacion = 'La contraseña ingresada no es válida';
            }else{
              console.log('entro ',data.contraseña.length);
              if(data.contraseña.toString().length < 10){
                // Verificar si la variable tiene el formato de fecha correcto con moment
                if (moment(fec_nacimiento, 'YYYY-MM-DD', true).isValid()) {
                  //Valida si los datos de la columna telefono son numeros.
                  if (telefono != undefined) {
                    if (regex.test(data.telefono)) {
                      if (data.telefono.toString().length > 10 || data.telefono.toString().length < 7) {
                        data.observacion = 'El teléfono ingresada no es válido';
                      } else {
                        if (duplicados.find((p: any) => p.cedula === dato.cedula || p.usuario === dato.usuario) == undefined) {
                          data.observacion = 'ok';
                          duplicados.push(dato);
                        }
                      }
                    } else {
                      data.observacion = 'El teléfono ingresada no es válido';
                    }
                  }

                } else {
                  data.observacion = 'Formato de fecha incorrecto (YYYY-MM-DD)';
                }
              }else{
                data.observacion = 'La contraseña debe ser maximo de 10 caracteres';
              }

            }
            
          }

        } else {
          data.observacion = 'La cédula ingresada no es válida';
        }


        listEmpleados.push(data);

      } else {
        data.fila = item; data.cedula = cedula; 
        data.nombre = nombre; data.apellido = apellido; 
        data.usuario = usuario; data.contrasena = contrasena;
        data.rol = rol; data.estado_civil = estado_civil;
        data.genero = genero; data.correo = correo;
        data.fec_nacimiento = fec_nacimiento; data.latitud = latitud;
        data.longitud = longitud;
        data.domicilio = domicilio; data.telefono = telefono;
        data.nacionalidad = nacionalidad; 
        data.observacion = 'no registrado';

        if (data.fila == '' || data.fila == undefined) {
          data.fila = 'error';
          mensaje = 'error'
        }

        if (apellido == undefined) {
          data.apellido = 'No registrado';
          data.observacion = 'Apellido ' + data.observacion;
        }
        if (nombre == undefined) {
          data.nombre = 'No registrado';
          data.observacion = 'Nombre ' + data.observacion;
        }
        if (estado_civil == undefined) {
          data.estado_civil = 'No registrado';
          data.observacion = 'Estado civil ' + data.observacion;
        }
        if (genero == undefined) {
          data.genero = 'No registrado';
          data.observacion = 'Género ' + data.observacion;
        }
        if (correo == undefined) {
          data.correo = 'No registrado';
          data.observacion = 'Correo ' + data.observacion;
        }
        if (fec_nacimiento == undefined) {
          data.fec_nacimiento = 'No registrado';
          data.observacion = 'Fecha de nacimiento ' + data.observacion;
        }
        if (latitud == undefined) {
          data.latitud = 'No registrado';
        }
        if (longitud == undefined) {
          data.longitud = 'No registrado';
        }
        if (domicilio == undefined) {
          data.domicilio = 'No registrado';
          data.observacion = 'Domicilio ' + data.observacion;
        }
        if (telefono == undefined) {
          data.telefono = 'No registrado';
          data.observacion = 'Teléfono ' + data.observacion;
        }
        if (nacionalidad == undefined) {
          data.nacionalidad = 'No registrado';
          data.observacion = 'Nacionalidad ' + data.observacion;
        }
        if (usuario == undefined) {
          data.usuario = 'No registrado';
          data.observacion = 'Usuario ' + data.observacion;
        }
        if (contrasena == undefined) {
          data.contrasena = 'No registrado';
          data.observacion = 'Contraseña ' + data.observacion;
        }
        if (rol == undefined) {
          data.rol = 'No registrado'
          data.observacion = 'Rol ' + data.observacion;
        }
        
        if (cedula == undefined) {
          data.cedula = 'No registrado'
          data.observacion = 'Cédula ' + data.observacion;
        } else {
          //Valida si los datos de la columna cedula son numeros.
          const rege = /^[0-9]+$/;
          const valiContra = /\s/;
          if (rege.test(data.cedula)) {
            if (data.cedula.toString().length != 10) {
              data.observacion = 'La cédula ingresada no es válida';
            }else{
              if(data.contrasena != 'No registrado'){
                if(!valiContra.test(data.contrasena.toString())){
                  data.observacion = 'La contraseña ingresada no es válida';
                }else{
                  console.log('entro ',data.contraseña.length);
                  if(data.contraseña.toString().length < 10){
                    // Verificar si la variable tiene el formato de fecha correcto con moment
                    if (data.fec_nacimiento != 'No registrado') {
                      if (moment(fec_nacimiento, 'YYYY-MM-DD', true).isValid()) { } else {
                        data.observacion = 'Formato de fecha incorrecto (YYYY-MM-DD)';
                      }
                    }else{
                      //Valida si los datos de la columna telefono son numeros.
                      if (telefono != undefined) {
                        const regex = /^[0-9]+$/;
                        if (regex.test(telefono)) {
                          if (data.telefono.toString().length > 10 || data.telefono.toString().length < 7) {
                            data.observacion = 'El teléfono ingresado no es válido';
                          }
                        } else {
                          data.observacion = 'El teléfono ingresado no es válido';
                        }
                      }
                    }
                  }else{
                    data.observacion = 'La contraseña debe ser maximo de 10 caracteres';
                  }
                  
                }
              }
            }
          } else {
            data.observacion = 'La cédula ingresada no es válida';
          }

        }


        listEmpleados.push(data);
      }

      data = {}

    });


    // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
    fs.access(ruta, fs.constants.F_OK, (err) => {
      if (err) {
      } else {
        // ELIMINAR DEL SERVIDOR
        fs.unlinkSync(ruta);
      }
    });

    listEmpleados.forEach(async (valor: any) => {
      var VERIFICAR_CEDULA = await pool.query(
        `
        SELECT * FROM eu_empleados WHERE cedula = $1
        `
        , [valor.cedula]);
      if (VERIFICAR_CEDULA.rows[0] != undefined && VERIFICAR_CEDULA.rows[0] != '') {
        valor.observacion = 'Cédula ya existe en el sistema'
      } else {
        var VERIFICAR_USUARIO = await pool.query(
          `
          SELECT * FROM eu_usuarios WHERE usuario = $1
          `
          , [valor.usuario]);
        if (VERIFICAR_USUARIO.rows[0] != undefined && VERIFICAR_USUARIO.rows[0] != '') {
          valor.observacion = 'Usuario ya existe en el sistema'
        } else {
          if (valor.rol != 'No registrado') {
            var VERIFICAR_ROL = await pool.query(
              `
              SELECT * FROM ero_cat_roles WHERE UPPER(nombre) = $1
              `
              , [valor.rol.toUpperCase()]);
            if (VERIFICAR_ROL.rows[0] != undefined && VERIFICAR_ROL.rows[0] != '') {
              if (valor.nacionalidad != 'No registrado') {
                var VERIFICAR_NACIONALIDAD = await pool.query(
                  `
                  SELECT * FROM e_cat_nacionalidades WHERE UPPER(nombre) = $1
                  `
                  , [valor.nacionalidad.toUpperCase()]);
                if (VERIFICAR_NACIONALIDAD.rows[0] != undefined && VERIFICAR_NACIONALIDAD.rows[0] != '') {

                  // Discriminación de elementos iguales
                  if (duplicados1.find((p: any) => p.cedula === valor.cedula) == undefined) {
                    // Discriminación de elementos iguales
                    if (duplicados2.find((a: any) => a.usuario === valor.usuario) == undefined) {
                      //valor.observacion = 'ok'
                      duplicados2.push(valor);
                    } else {
                      valor.observacion = '2'
                    }

                    duplicados1.push(valor);

                  } else {
                    valor.observacion = '1'
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

    })


    setTimeout(() => {

      listEmpleados.sort((a: any, b: any) => {
        // Compara los números de los objetos
        if (a.fila < b.fila) {
          return -1;
        }
        if (a.fila > b.fila) {
          return 1;
        }
        return 0; // Son iguales
      });

      var filaDuplicada: number = 0;

      listEmpleados.forEach((item: any) => {
        if (item.observacion == '1') {
          item.observacion = 'Registro duplicado (cédula)'
        } else if (item.observacion == '2') {
          item.observacion = 'Registro duplicado (usuario)'
        }

        if (item.observacion != undefined) {
          let arrayObservacion = item.observacion.split(" ");
          if (arrayObservacion[0] == 'no') {
            item.observacion = 'ok'
          }
        } else {
          item.observacion = 'Datos no registrado'
        }

        //Valida si los datos de la columna N son numeros.
        if (typeof item.fila === 'number' && !isNaN(item.fila)) {
          //Condicion para validar si en la numeracion existe un numero que se repite dara error.
          if (item.fila == filaDuplicada) {
            mensaje = 'error';
          }
        } else {
          return mensaje = 'error';
        }

        filaDuplicada = item.fila;

      });

      if (mensaje == 'error') {
        listEmpleados = undefined;
      }

      //console.log('empleados: ', listEmpleados);

      return res.jsonp({ message: mensaje, data: listEmpleados });

    }, 1500)

  }

  public async VerificarPlantilla_DatosAutomatico(req: Request, res: Response) {
    let list: any = req.files;


    let separador = path.sep;
    let ruta = ObtenerRutaLeerPlantillas() + separador + list;

    //const workbook = excel.readFile(filePath);
    const workbook = excel.readFile(ruta);
    const sheet_name_list = workbook.SheetNames;
    const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

    console.log('plantilla1: ', plantilla);



  }

  public async CargarPlantilla_Automatico(req: Request, res: Response): Promise<void> {
    
    const {plantilla, user_name, ip} = req.body;
    
    const VALOR = await pool.query('SELECT * FROM codigo');
    var codigo_dato = VALOR.rows[0].valor;
    var codigo = 0;
    if (codigo_dato != null && codigo_dato != undefined && codigo_dato != '') {
      codigo = codigo_dato = parseInt(codigo_dato);
    }
    var contador = 1;

    plantilla.forEach(async (data: any) => {

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
  
        // ENCRIPTAR CONTRASEÑA
        var md5 = new Md5();
        var contrasena = md5.appendStr(data.contrasena).end()?.toString();
  
        // DATOS QUE SE LEEN DE LA PLANTILLA INGRESADA
        const { cedula, estado_civil, genero, correo, fec_nacimiento, domicilio, longitud, latitud, telefono,
          nacionalidad, usuario, rol } = data;
  
        //OBTENER ID DEL ESTADO_CIVIL
        var id_estado_civil = 0;
        if (estado_civil.toUpperCase() === 'SOLTERO/A') {
          id_estado_civil = 1;
        }
        else if (estado_civil.toUpperCase() === 'UNION DE HECHO') {
          id_estado_civil = 2;
        }
        else if (estado_civil.toUpperCase() === 'CASADO/A') {
          id_estado_civil = 3;
        }
        else if (estado_civil.toUpperCase() === 'DIVORCIADO/A') {
          id_estado_civil = 4;
        }
        else if (estado_civil.toUpperCase() === 'VIUDO/A') {
          id_estado_civil = 5;
        }
  
        //OBTENER ID DEL GENERO
        var id_genero = 0;
        if (genero.toUpperCase() === 'MASCULINO') {
          id_genero = 1;
        }
        else if (genero.toUpperCase() === 'FEMENINO') {
          id_genero = 2;
        }
  
        var _longitud = null;
        if(longitud != 'No registrado'){
          _longitud = longitud;
        }
          
  
        var _latitud = null
        if(latitud != 'No registrado'){
          _latitud = latitud;
        }
  
        //OBTENER ID DEL ESTADO
        var id_estado = 1;
        var estado_user = true;
        var app_habilita = false;
  
        //OBTENER ID DE LA NACIONALIDAD
        const id_nacionalidad = await pool.query('SELECT * FROM e_cat_nacionalidades WHERE UPPER(nombre) = $1',
          [nacionalidad.toUpperCase()]);
  
        //OBTENER ID DEL ROL
        const id_rol = await pool.query(`
          SELECT * FROM ero_cat_roles WHERE UPPER(nombre) = $1
          `
        , [rol.toUpperCase()]);
  
        if(codigo_dato != null && codigo_dato != undefined && codigo_dato != ''){
          // INCREMENTAR EL VALOR DEL CÓDIGO
          codigo = codigo + 1;
        }else{
          codigo = cedula;
        }
        
  
        var fec_nacimi = new Date(moment(fec_nacimiento).format('YYYY-MM-DD'));
  
        console.log('codigo: ', codigo)
        console.log('cedula: ', cedula, ' usuario: ', usuario, ' contrasena: ', contrasena);
        console.log('nombre: ', nombreE, ' usuario: ', apellidoE, ' fecha nacimien: ', fec_nacimi, ' estado civil: ', id_estado_civil);
        console.log('genero: ', id_genero, ' estado: ', id_estado, ' nacionalidad: ', id_nacionalidad.rows, ' rol: ', id_rol);
        console.log('longitud: ', _longitud, ' latitud: ', _latitud)
  
  
        // REGISTRO DE NUEVO EMPLEADO
        await pool.query(
          `
          INSERT INTO eu_empleados (cedula, apellido, nombre, estado_civil, genero, correo,
            fecha_nacimiento, estado, domicilio, telefono, id_nacionalidad, codigo, longitud, latitud) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          `
          , [cedula, apellidoE, nombreE,
          id_estado_civil, id_genero, correo, fec_nacimiento, id_estado,
          domicilio, telefono, id_nacionalidad.rows[0]['id'], codigo, _longitud, _latitud ]);

        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eu_empleados',
          usuario: user_name,
          accion: 'I',
          datosOriginales: '',
          datosNuevos: `{cedula: ${cedula}, apellido: ${apellidoE}, nombre: ${nombreE}, estado_civil: ${id_estado_civil}, genero: ${id_genero}, correo: ${correo}, fecha_nacimiento: ${fec_nacimiento}, estado: ${id_estado}, domicilio: ${domicilio}, telefono: ${telefono}, id_nacionalidad: ${id_nacionalidad.rows[0]['id']}, codigo: ${codigo}, longitud: ${_longitud}, latitud: ${_latitud}}`,
          ip,
          observacion: null
        });
  
        // OBTENER EL ID DEL EMPLEADO INGRESADO
        const oneEmpley = await pool.query('SELECT id FROM eu_empleados WHERE cedula = $1', [cedula]);
        const id_empleado = oneEmpley.rows[0].id;
  
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
          ip,
          observacion: null
        });

       
  
        if (contador === plantilla.length) {
          // ACTUALIZACIÓN DEL CÓDIGO
          if(codigo_dato != null && codigo_dato != undefined && codigo_dato != ''){
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
              ip,
              observacion: null
            });
          }
        }

         // FINALIZAR TRANSACCION
         await pool.query('COMMIT');
  
        contador = contador + 1;
        contrasena = undefined
      } catch (error) {
        // REVERTIR TRANSACCION
        await pool.query('ROLLBACK');
        return res.status(500).jsonp({ message: error });
      }
    });

    setTimeout(() => {
      return res.jsonp({ message: 'correcto' });
    }, 1500)

  }

  /** METODOS PARA VERIFICAR PLANTILLA CON CÓDIGO INGRESADO DE FORMA MANUAL */

  public async VerificarPlantilla_Manual(req: Request, res: Response) {
    const documento = req.file?.originalname;
    let separador = path.sep;
    let ruta = ObtenerRutaLeerPlantillas() + separador + documento;
  
    const workbook = excel.readFile(ruta);
    const sheet_name_list = workbook.SheetNames;
    const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
  
    let listEmpleadosManual: any = [];
    let duplicados: any = [];
    let duplicados1: any = [];
    let duplicados2: any = [];
    let duplicados3: any = [];
    let mensaje: string = 'correcto';
  
    plantilla.forEach((dato: any) => {
      let {
        item, cedula, apellido, nombre, codigo, estado_civil, genero, correo, fec_nacimiento,
        latitud, longitud, domicilio, telefono, nacionalidad, usuario, contrasena, rol
      } = dato;
  
      let observacion = 'ok';
  
      if (
        !item || !cedula || !apellido || !nombre || !codigo || !estado_civil || !genero ||
        !correo || !fec_nacimiento || !latitud || !longitud || !domicilio || !telefono ||
        !nacionalidad || !usuario || !contrasena || !rol
      ) {
        observacion = 'Datos incompletos';
      }
  
      const rege = /^[0-9]+$/;
      const valiContra = /\s/;
  
      if (rege.test(cedula) && cedula.toString().length === 10) {
        if (rege.test(codigo)) {
          if (!valiContra.test(contrasena) && contrasena.length <= 10) {
            if (moment(fec_nacimiento, 'YYYY-MM-DD', true).isValid()) {
              if (telefono === undefined || (rege.test(telefono) && telefono.toString().length >= 7 && telefono.toString().length <= 10)) {
                if (!duplicados.find((p: any) => p.cedula === cedula || p.usuario === usuario)) {
                  duplicados.push(dato);
                } else {
                  observacion = 'Registro duplicado';
                }
              } else {
                observacion = 'El teléfono ingresado no es válido';
              }
            } else {
              observacion = 'Formato de fecha incorrecto (YYYY-MM-DD)';
            }
          } else {
            observacion = 'La contraseña debe ser máxima de 10 caracteres y no contener espacios';
          }
        } else {
          observacion = 'Formato de código incorrecto';
        }
      } else {
        observacion = 'La cédula ingresada no es válida';
      }
  
      listEmpleadosManual.push({
        fila: item, cedula, apellido, nombre, codigo, estado_civil, genero,
        correo, fec_nacimiento, latitud, longitud, domicilio, telefono,
        nacionalidad, usuario, contrasena, rol, observacion
      });
    });
  
    fs.access(ruta, fs.constants.F_OK, (err) => {
      if (!err) {
        fs.unlinkSync(ruta);
      }
    });
  
    for (const valor of listEmpleadosManual) {
      const VERIFICAR_CEDULA = await pool.query(`SELECT * FROM eu_empleados WHERE cedula = $1`, [valor.cedula]);
      if (VERIFICAR_CEDULA.rows.length > 0) {
        valor.observacion = 'Cédula ya existe en el sistema';
      } else {
        const VERIFICAR_CODIGO = await pool.query(`SELECT * FROM eu_empleados WHERE codigo = $1`, [valor.codigo]);
        if (VERIFICAR_CODIGO.rows.length > 0) {
          valor.observacion = 'Código ya existe en el sistema';
        } else {
          const VERIFICAR_USUARIO = await pool.query(`SELECT * FROM eu_usuarios WHERE usuario = $1`, [valor.usuario]);
          if (VERIFICAR_USUARIO.rows.length > 0) {
            valor.observacion = 'Usuario ya existe en el sistema';
          } else {
            if (valor.rol !== 'No registrado') {
              const VERIFICAR_ROL = await pool.query(`SELECT * FROM ero_cat_roles WHERE UPPER(nombre) = $1`, [valor.rol.toUpperCase()]);
              if (VERIFICAR_ROL.rows.length === 0) {
                valor.observacion = 'Rol no existe en el sistema';
              }
              if (valor.nacionalidad !== 'No registrado') {
                const VERIFICAR_NACIONALIDAD = await pool.query(`SELECT * FROM e_cat_nacionalidades WHERE UPPER(nombre) = $1`, [valor.nacionalidad.toUpperCase()]);
                if (VERIFICAR_NACIONALIDAD.rows.length === 0) {
                  valor.observacion = 'Nacionalidad no existe en el sistema';
                }
              }
            }
          }
        }
      }
  
      if (valor.observacion === 'ok') {
        if (duplicados1.find((p: any) => p.cedula === valor.cedula) !== undefined) {
          valor.observacion = 'Registro duplicado (cédula)';
        } else {
          duplicados1.push(valor);
        }
        if (duplicados2.find((p: any) => p.usuario === valor.usuario) !== undefined) {
          valor.observacion = 'Registro duplicado (usuario)';
        } else {
          duplicados2.push(valor);
        }
        if (duplicados3.find((p: any) => p.codigo === valor.codigo) !== undefined) {
          valor.observacion = 'Registro duplicado (código)';
        } else {
          duplicados3.push(valor);
        }
      }
    }
  
    listEmpleadosManual.sort((a: any, b: any) => (a.fila < b.fila ? -1 : a.fila > b.fila ? 1 : 0));
  
    let filaDuplicada: number = 0;
  
    for (const item of listEmpleadosManual) {
      if (typeof item.fila === 'number' && !isNaN(item.fila)) {
        if (item.fila === filaDuplicada) {
          mensaje = 'error';
        }
      } else {
        mensaje = 'error';
      }
  
      filaDuplicada = item.fila;
  
      if (item.observacion.startsWith('no ')) {
        item.observacion = 'ok';
      }
    }
  
    if (mensaje === 'error') {
      return res.jsonp({ message: mensaje, data: undefined });
    }
  
    return res.jsonp({ message: mensaje, data: listEmpleadosManual });
  }
  


  public async VerificarPlantilla_DatosManual(req: Request, res: Response) {
    let list: any = req.files;
    let cadena = list.uploads[0].path;
    let filename = cadena.split("\\")[1];
    var filePath = `./plantillas/${filename}`
    const workbook = excel.readFile(filePath);
    const sheet_name_list = workbook.SheetNames;
    const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    var contarCedulaData = 0;
    var contarUsuarioData = 0;
    var contarCodigoData = 0;
    var contador_arreglo = 1;
    var arreglos_datos: any = [];
    //LEER LA PLANTILLA PARA LLENAR UN ARRAY CON LOS DATOS CEDULA Y USUARIO PARA VERIFICAR QUE NO SEAN DUPLICADOs
    plantilla.forEach(async (data: any) => {
      // DATOS QUE SE LEEN DE LA PLANTILLA INGRESADA
      const { cedula, codigo, estado_civil, genero, correo, fec_nacimiento, estado, domicilio,
        telefono, nacionalidad, usuario, estado_user, rol, app_habilita } = data;
      let datos_array = {
        cedula: cedula,
        usuario: usuario,
        codigo: codigo
      }
      arreglos_datos.push(datos_array);
    });

    // VAMOS A VERIFICAR DENTRO DE ARREGLO_DATOS QUE NO SE ENCUENTREN DATOS DUPLICADos
    for (var i = 0; i <= arreglos_datos.length - 1; i++) {
      for (var j = 0; j <= arreglos_datos.length - 1; j++) {
        if (arreglos_datos[i].cedula === arreglos_datos[j].cedula) {
          contarCedulaData = contarCedulaData + 1;
        }
        if (arreglos_datos[i].usuario === arreglos_datos[j].usuario) {
          contarUsuarioData = contarUsuarioData + 1;
        }
        if (arreglos_datos[i].codigo === arreglos_datos[j].codigo) {
          contarCodigoData = contarCodigoData + 1;
        }
      }
      contador_arreglo = contador_arreglo + 1;
    }

    // CUANDO TODOS LOS DATOS HAN SIDO LEIDOS VERIFICAMOS SI TODOS LOS DATOS SON CORRECTOS
    console.log('cedula_data', contarCedulaData, plantilla.length, contador_arreglo);
    console.log('usuario_data', contarUsuarioData, plantilla.length, contador_arreglo);
    console.log('codigo_data', contarCodigoData, plantilla.length, contador_arreglo);
    if ((contador_arreglo - 1) === plantilla.length) {
      if (contarCedulaData === plantilla.length && contarUsuarioData === plantilla.length &&
        contarCodigoData === plantilla.length) {
        return res.jsonp({ message: 'correcto' });
      } else {
        return res.jsonp({ message: 'error' });
      }
    }
    // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
      } else {
        // ELIMINAR DEL SERVIDOR
        fs.unlinkSync(filePath);
      }
    });
  }

  public async CargarPlantilla_Manual(req: Request, res: Response): Promise<void> {
    const {plantilla, user_name, ip}  = req.body
    
    var contador = 1;

    plantilla.forEach(async (data: any) => {
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
  
        // ENCRIPTAR CONTRASEÑA
        const md5 = new Md5();
        const contrasena = md5.appendStr(data.contrasena).end();
  
        // DATOS QUE SE LEEN DE LA PLANTILLA INGRESADA
        const { cedula, codigo, estado_civil, genero, correo, fec_nacimiento, estado, domicilio, longitud, latitud,
          telefono, nacionalidad, usuario, rol} = data;
  
        //OBTENER ID DEL ESTADO_CIVIL
        var id_estado_civil = 0;
        if (estado_civil.toUpperCase() === 'SOLTERA/A') {
          id_estado_civil = 1;
        }
        else if (estado_civil.toUpperCase() === 'UNION DE HECHO') {
          id_estado_civil = 2;
        }
        else if (estado_civil.toUpperCase() === 'CASADO/A') {
          id_estado_civil = 3;
        }
        else if (estado_civil.toUpperCase() === 'DIVORCIADO/A') {
          id_estado_civil = 4;
        }
        else if (estado_civil.toUpperCase() === 'VIUDO/A') {
          id_estado_civil = 5;
        }
  
        //OBTENER ID DEL GENERO
        var id_genero = 0;
        if (genero.toUpperCase() === 'MASCULINO') {
          id_genero = 1;
        }
        else if (genero.toUpperCase() === 'FEMENINO') {
          id_genero = 2;
        }
  
        var _longitud = null;
        if(longitud != 'No registrado'){
          _longitud = longitud;
        }
          
  
        var _latitud = null
        if(latitud != 'No registrado'){
          _latitud = latitud;
        }
  
        //OBTENER ID DEL ESTADO
        var id_estado = 1;
        var estado_user = true;
        var app_habilita = false;
  
        //OBTENER ID DE LA NACIONALIDAD
        const id_nacionalidad = await pool.query(
          `
          SELECT * FROM e_cat_nacionalidades WHERE UPPER(nombre) = $1
          `
          ,
          [nacionalidad.toUpperCase()]);
  
        //OBTENER ID DEL ROL
        const id_rol = await pool.query(
          `
          SELECT * FROM ero_cat_roles WHERE UPPER(nombre) = $1
          `
          , [rol.toUpperCase()]);
  
        // REGISTRO DE NUEVO EMPLEADO
        await pool.query(
        `
        INSERT INTO eu_empleados ( cedula, apellido, nombre, estado_civil, genero, correo,
          fecha_nacimiento, estado, domicilio, telefono, id_nacionalidad, codigo, longitud, latitud) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `
        , [cedula, apellidoE, nombreE,
          id_estado_civil, id_genero, correo, fec_nacimiento, id_estado,
          domicilio, telefono, id_nacionalidad.rows[0]['id'], codigo, _longitud, _latitud]);

        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eu_empleados',
          usuario: user_name,
          accion: 'I',
          datosOriginales: '',
          datosNuevos: `{cedula: ${cedula}, apellido: ${apellidoE}, nombre: ${nombreE}, estado_civil: ${id_estado_civil}, genero: ${id_genero}, correo: ${correo}, fecha_nacimiento: ${fec_nacimiento}, estado: ${id_estado}, domicilio: ${domicilio}, telefono: ${telefono}, id_nacionalidad: ${id_nacionalidad.rows[0]['id']}, codigo: ${codigo}, longitud: ${_longitud}, latitud: ${_latitud}}`,
          ip,
          observacion: null
        });
  
        // OBTENER EL ID DEL EMPLEADO INGRESADO
        const oneEmpley = await pool.query('SELECT id FROM eu_empleados WHERE cedula = $1', [cedula]);
        const id_empleado = oneEmpley.rows[0].id;
  
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
          ip,
          observacion: null
        });

        if (contador === plantilla.length) {


          // ACTUALIZACIÓN DEL CÓDIGO
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
            ip,
            observacion: null
          });
          // FINALIZAR TRANSACCION
          await pool.query('COMMIT');
          return res.jsonp({ message: 'correcto' });
        }
        contador = contador + 1;

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');

      } catch (error) {
        // REVERTIR TRANSACCION
        await pool.query('ROLLBACK');
        return res.status(500).jsonp({ message: error });
      }
    });
  }


  
  /** **************************************************************************************** **
   ** **                      CREAR CARPETAS EMPLEADOS SELECCIONADOS                           ** 
   ** **************************************************************************************** **/

   public async CrearCarpetasEmpleado(req: Request, res: Response) {

    //const id = req.params.id;
    const { id, codigo } = req.body;

    /*
    let verificar_permisos = 0;

    // RUTA DE LA CARPETA PERMISOS DEL USUARIO
    const carpetaPermisos = await ObtenerRutaPermisos(codigo);

    // VERIFICACION DE EXISTENCIA CARPETA PERMISOS DE USUARIO
    fs.access(carpetaPermisos, fs.constants.F_OK, (err) => {
      if (err) {
        // METODO MKDIR PARA CREAR LA CARPETA
        fs.mkdir(carpetaPermisos, { recursive: true }, (err: any) => {
          if (err) {
            verificar_permisos = 1;
          } else {
            verificar_permisos = 0;
          }
        });
      } else {
        verificar_permisos = 0;
      }
    });
    */


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

    let verificar_vacunas = 0;

    // RUTA DE LA CARPETA VACUNAS DEL USUARIO
    const carpetaVacunas = await ObtenerRutaVacuna(id);

    // VERIFICACION DE EXISTENCIA CARPETA PERMISOS DE USUARIO
    fs.access(carpetaVacunas, fs.constants.F_OK, (err) => {
      if (err) {
        // METODO MKDIR PARA CREAR LA CARPETA
        fs.mkdir(carpetaVacunas, { recursive: true }, (err: any) => {
          if (err) {
            verificar_vacunas = 1;
          } else {
            verificar_vacunas = 0;
          }
        });
      } else {
        verificar_vacunas = 0;
      }
    });

    let verificar_contrato = 0;

    // RUTA DE LA CARPETA CONTRATOS DEL USUARIO
    const carpetaContratos = await ObtenerRutaContrato(id);

    // VERIFICACION DE EXISTENCIA CARPETA CONTRATOS DE USUARIO
    fs.access(carpetaContratos, fs.constants.F_OK, (err) => {
      if (err) {
        // METODO MKDIR PARA CREAR LA CARPETA
        fs.mkdir(carpetaContratos, { recursive: true }, (err: any) => {
          if (err) {
            verificar_contrato = 1;
          } else {
            verificar_contrato = 0;
          }
        });
      } else {
        verificar_contrato = 0
      }
    });

    // METODO DE VERIFICACION DE CREACION DE DIRECTORIOS
    //    if (verificar_permisos === 1 && verificar_imagen === 1 && verificar_vacunas === 1 && verificar_contrato === 1) {

    if ( verificar_imagen === 1 && verificar_vacunas === 1 && verificar_contrato === 1) {
      res.jsonp({ message: 'Ups!!! no fue posible crear el directorio de contratos, permisos, imagenes y vacunación del usuario.' });

    } else if ( verificar_imagen === 0 && verificar_vacunas === 0 && verificar_contrato === 0) {
      res.jsonp({ message: 'Ups!!! no fue posible crear el directorio de permisos del usuario.' });

    } else if ( verificar_imagen === 1 && verificar_vacunas === 0 && verificar_contrato === 0) {
      res.jsonp({ message: 'Ups!!! no fue posible crear el directorio de imagenes del usuario.' });
    }
    else if ( verificar_imagen === 0 && verificar_vacunas === 1 && verificar_contrato === 0) {
      res.jsonp({ message: 'Ups!!! no fue posible crear el directorio de vacunación del usuario.' });
    }
    else if ( verificar_imagen === 0 && verificar_vacunas === 1 && verificar_contrato === 1) {
      res.jsonp({ message: 'Ups!!! no fue posible crear el directorio de contratos del usuario.' });
    }
    else {
      res.jsonp({ message: 'Registro actualizado.' });
    }
  }


}

export const EMPLEADO_CONTROLADOR = new EmpleadoControlador();

export default EMPLEADO_CONTROLADOR;
