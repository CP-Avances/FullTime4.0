import AUDITORIA_CONTROLADOR from '../../reportes/auditoriaControlador';
import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../../../database';

class GeneroControlador {

  // METODO PARA LISTAR GENEROS   ** USADO
  public async ListarGeneros(req: Request, res: Response) {
    const GENEROS = await pool.query(
      `
      SELECT * FROM e_genero ORDER BY genero ASC
      `
    );

    if (GENEROS.rowCount != 0) {
      return res.jsonp(GENEROS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  // METODO PARA BUSCAR GENEROS POR SU NOMBRE   **USADO
  public async ObtenerGenero(req: Request, res: Response): Promise<any> {
    const { genero } = req.params;
    const unGenero = await pool.query(
      `
      SELECT * FROM e_genero WHERE UPPER(genero) = $1
      `
      , [genero]);

    if (unGenero.rowCount != 0) {
      return res.jsonp(unGenero.rows)
    }
    else {
      res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }


  // METODO PARA CREAR GENERO   **USADO
  public async CrearGenero(req: Request, res: Response): Promise<Response> {
    try {
      const { genero, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      const response: QueryResult = await pool.query(
        `
        INSERT INTO e_genero (genero) VALUES ($1) RETURNING *
        `
        , [genero]);

      const [nivel] = response.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'e_genero',
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
      console.log('error genero ', error)
      return res.status(500).jsonp({ message: 'Error al registrar el genero.' });
    }
  }

  // METODO PARA ACTUALIZAR REGISTRO DE GENERO   **USADO
  public async ActualizarGenero(req: Request, res: Response): Promise<Response> {
    try {
      const { genero, id, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOS ORIGINALES
      const rol = await pool.query(`SELECT * FROM e_genero WHERE id = $1`, [id]);
      const [datosOriginales] = rol.rows;

      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'e_genero',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al actualizar el genero con id ${id}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Error al actualizar el registro.' });
      }

      const datosNuevos = await pool.query(
        `
        UPDATE e_genero SET genero = $1 WHERE id = $2 RETURNING *
        `
        , [genero, id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'e_genero',
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
  public async EliminarGenero(req: Request, res: Response): Promise<Response> {
    try {
      const { user_name, ip, ip_local } = req.body;
      const id = req.params.id;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // OBTENER DATOS ORIGINALES
      const consulta = await pool.query(`SELECT * FROM e_genero WHERE id = $1`, [id]);
      const [datosOriginales] = consulta.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'e_genero',
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
        DELETE FROM e_genero WHERE id = $1
        `
        , [id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'e_genero',
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

export const GENERO_CONTROLADOR = new GeneroControlador();
export default GENERO_CONTROLADOR;