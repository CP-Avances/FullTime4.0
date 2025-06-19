import AUDITORIA_CONTROLADOR from '../../reportes/auditoriaControlador';
import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../../../database';

class EstadoCivilControlador {

  // METODO PARA LISTAR ESTADO CIVIL   **USADO
  public async ListarEstadosCivil(req: Request, res: Response) {
    const ESTADOS = await pool.query(
      `
      SELECT * FROM e_estado_civil  ORDER BY estado_civil ASC
      `
    );

    if (ESTADOS.rowCount != 0) {
      return res.jsonp(ESTADOS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  // METODO PARA BUSCAR ESTADO CIVIL POR SU NOMBRE   **USADO
  public async ObtenerEstadoCivil(req: Request, res: Response): Promise<any> {
    const { estado } = req.params;
    const unEstado = await pool.query(
      `
      SELECT * FROM e_estado_civil WHERE UPPER(estado_civil) = $1
      `
      , [estado]);

    if (unEstado.rowCount != 0) {
      return res.jsonp(unEstado.rows)
    }
    else {
      res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }


  // METODO PARA REGISTRAR ESTADO CIVIL   **USADO
  public async CrearEstadoCivil(req: Request, res: Response): Promise<Response> {
    try {
      const { estado, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      const response: QueryResult = await pool.query(
        `
        INSERT INTO e_estado_civil (estado_civil) VALUES ($1) RETURNING *
        `
        , [estado]);

      const [nivel] = response.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'e_estado_civil',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: JSON.stringify(nivel),
        ip: ip,
        ip_local: ip_local,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');

      if (nivel) {
        return res.status(200).jsonp(nivel)
      }
      else {
        return res.status(404).jsonp({ message: 'error' })
      }

    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'Error al registrar el estado civil.' });
    }
  }

  // METODO PARA ACTUALIZAR REGISTRO DE ESTADO CIVIL   **USADO
  public async ActualizarEstadoCivil(req: Request, res: Response): Promise<Response> {
    try {
      const { estado, id, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const rol = await pool.query(`SELECT * FROM e_estado_civil WHERE id = $1`, [id]);
      const [datosOriginales] = rol.rows;

      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'e_estado_civil',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al actualizar el estado civil con id ${id}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Error al actualizar el registro.' });
      }

      const datosNuevos = await pool.query(
        `
        UPDATE e_estado_civil SET estado_civil = $1 WHERE id = $2 RETURNING *
        `
        , [estado, id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'e_estado_civil',
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
      // FINALIZAR TRANSACCION
      console.log("ver el error: ", error)
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'Error al actualizar el registro.' });
    }
  }

  // METODO PARA ELIMINAR REGISTROS   **USADO
  public async EliminarEstadoCivil(req: Request, res: Response): Promise<Response> {
    try {
      const { user_name, ip, ip_local } = req.body;
      const id = req.params.id;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // OBTENER DATOSORIGINALES
      const consulta = await pool.query(`SELECT * FROM e_estado_civil WHERE id = $1`, [id]);
      const [datosOriginales] = consulta.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'e_estado_civil',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al eliminar el genero con id ${id}. No existe el registro en la base de datos.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
      }
      await pool.query(
        `
        DELETE FROM e_estado_civil WHERE id = $1
        `
        , [id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'e_estado_civil',
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
      return res.jsonp({ message: 'error' });
    }
  }
}

export const ESTADO_CIVIL_CONTROLADOR = new EstadoCivilControlador();
export default ESTADO_CIVIL_CONTROLADOR;