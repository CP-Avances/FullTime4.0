import AUDITORIA_CONTROLADOR from '../../reportes/auditoriaControlador';
import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../../../database';

class DiscapacidadControlador {

  // METODO PARA BUSCAR DATOS DISCAPACIDAD USUARIO   **USADO
  public async BuscarDiscapacidadUsuario(req: Request, res: Response): Promise<any> {
    const { id_empleado } = req.params;
    const unaDiscapacidad = await pool.query(
      `
      SELECT cd.id_empleado, cd.carnet_conadis, cd.porcentaje, cd.id_discapacidad, td.nombre AS nom_tipo
      FROM eu_empleado_discapacidad cd, e_cat_discapacidad td, eu_empleados e
      WHERE cd.id_empleado = e.id AND cd.id_discapacidad = td.id AND cd.id_empleado = $1
      `
      , [id_empleado]);
    if (unaDiscapacidad.rowCount != 0) {
      return res.jsonp(unaDiscapacidad.rows)
    }
    else {
      res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }
  }

  // METODO PARA REGISTRAR DISCAPACIDAD    **USADO
  public async RegistrarDiscapacidad(req: Request, res: Response): Promise<void> {
    try {
      const { id_empleado, carn_conadis, porcentaje, tipo, user_name, ip, ip_local } = req.body;

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
        INSERT INTO eu_empleado_discapacidad (id_empleado, carnet_conadis, porcentaje, id_discapacidad, id_usuario) 
        VALUES ($1, $2, $3, $4, $5) RETURNING *
        `
        , [id_empleado, carn_conadis, porcentaje, tipo, id_usuario]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eu_empleado_discapacidad',
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
      res.jsonp({ message: 'Discapacidad guardada' });

    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      res.status(500).jsonp({ message: 'Error al guardar discapacidad.' });
    }
  }

  // METODO PARA ACTUALIZAR DATOS DE REGISTRO   **USADO
  public async ActualizarDiscapacidad(req: Request, res: Response): Promise<Response> {
    try {
      const id_empleado = req.params.id_empleado;
      const { carn_conadis, porcentaje, tipo, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOS ORIGINALES
      const discapacidad = await pool.query(`SELECT * FROM eu_empleado_discapacidad WHERE id_empleado = $1`, [id_empleado]);
      const [datosOriginales] = discapacidad.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eu_empleado_discapacidad',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al actualizar discapacidad con id_empleado: ${id_empleado}`
        });
      }

      const datosNuevos = await pool.query(
        `
        UPDATE eu_empleado_discapacidad SET carnet_conadis = $1, porcentaje = $2, id_discapacidad = $3 
        WHERE id_empleado = $4 RETURNING *
        `
        , [carn_conadis, porcentaje, tipo, id_empleado]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eu_empleado_discapacidad',
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
      return res.status(500).jsonp({ message: 'Error al actualizar registro.' });
    }
  }

  // METODO PARA ELIMINAR REGISTRO   **USADO
  public async EliminarDiscapacidad(req: Request, res: Response): Promise<Response> {
    try {
      const { user_name, ip, ip_local } = req.body;
      const id_empleado = req.params.id_empleado;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOS ORIGINALES
      const discapacidad = await pool.query(`SELECT * FROM eu_empleado_discapacidad WHERE id_empleado = $1`, [id_empleado]);
      const [datosOriginales] = discapacidad.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eu_empleado_discapacidad',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al eliminar discapacidad con id_empleado: ${id_empleado}`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
      }

      await pool.query(
        `
        DELETE FROM eu_empleado_discapacidad WHERE id_empleado = $1
        `
        , [id_empleado]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eu_empleado_discapacidad',
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
      return res.status(500).jsonp({ message: 'Error al eliminar registro.' });
    }
  }


  /** *************************************************************************************** **
   ** **                METODO PARA MANEJO DE DATOS DE TIPO DISCAPACIDAD                   ** ** 
   ** *************************************************************************************** **/

  // METODO PARA CREAR TIPO DE DISCAPACIDAD
  public async RegistrarTipo(req: Request, res: Response): Promise<Response> {
    try {
      const { nombre, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      const response: QueryResult = await pool.query(
        `
        INSERT INTO e_cat_discapacidad (nombre) VALUES ($1) RETURNING *
        `
        , [nombre]);

      const [tipo] = response.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'e_cat_discapacidad',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: `{nombre: ${nombre}}`,
        ip: ip,
        ip_local: ip_local,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');

      if (tipo) {
        return res.status(200).jsonp(tipo)
      }
      else {
        return res.status(404).jsonp({ message: 'No se han encontrado registros.' })
      }
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'Error al guardar registro.' });
    }
  }

  // METODO PARA LISTAR TIPOS DE DISCAPACIDAD   **USADO
  public async ListarTipo(req: Request, res: Response) {
    const TIPO_DISCAPACIDAD = await pool.query(
      `
      SELECT * FROM e_cat_discapacidad
      `
    );
    if (TIPO_DISCAPACIDAD.rowCount != 0) {
      return res.jsonp(TIPO_DISCAPACIDAD.rows)
    }
    else {
      res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }

  // METODO PARA BUSCAR DISCAPACIDAD POR SU NOMBRE   **USADO
  public async BuscarDiscapacidadNombre(req: Request, res: Response) {
    const { nombre } = req.body;
    const TIPO_DISCAPACIDAD = await pool.query(
      `
      SELECT * FROM e_cat_discapacidad WHERE UPPER(nombre) = $1
      `
      , [nombre])
    if (TIPO_DISCAPACIDAD.rowCount != 0) {
      return res.jsonp(TIPO_DISCAPACIDAD.rows)
    }
    else {
      res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }

}

export const DISCAPACIDAD_CONTROLADOR = new DiscapacidadControlador();

export default DISCAPACIDAD_CONTROLADOR;