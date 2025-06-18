import AUDITORIA_CONTROLADOR from '../../reportes/auditoriaControlador';
import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../../../database';

class NacionalidadControlador {

  // METODO PARA LISTAR NACIONALIDAD   **USADO
  public async ListarNacionalidades(req: Request, res: Response) {
    const NACIONALIDADES = await pool.query(
      `
      SELECT * FROM e_cat_nacionalidades  ORDER BY nombre ASC
      `
    );

    if (NACIONALIDADES.rowCount != 0) {
      return res.jsonp(NACIONALIDADES.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  // METODO PARA BUSCAR NACIONALIDAD POR SU NOMBRE   **USADO
  public async ObtenerNacionalidad(req: Request, res: Response): Promise<any> {
    const { nombre } = req.params;

    const unNacionalidades = await pool.query(
      `
      SELECT * FROM e_cat_nacionalidades WHERE UPPER(nombre) = $1
      `
      , [nombre]);

    if (unNacionalidades.rowCount != 0) {
      return res.jsonp(unNacionalidades.rows)
    }
    else {
      res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }

  // METODO PARA REGISTRAR NACIONALIDAD   **USADO
  public async CrearNacionalidad(req: Request, res: Response): Promise<Response> {
    try {
      const { nacionalidad, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      const response: QueryResult = await pool.query(
        `
        INSERT INTO e_cat_nacionalidades (nombre) VALUES ($1) RETURNING *
        `
        , [nacionalidad]);

      const [nivel] = response.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'e_cat_nacionalidades',
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
      return res.status(500).jsonp({ message: 'Error al registrar el nacionalidad.' });
    }
  }

  // METODO PARA ACTUALIZAR REGISTRO DE NACIONALIDAD   **USADO
  public async ActualizarNacionalidad(req: Request, res: Response): Promise<Response> {
    try {
      const { nacionalidad, id, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const rol = await pool.query(`SELECT * FROM e_cat_nacionalidades WHERE id = $1`, [id]);
      const [datosOriginales] = rol.rows;

      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'e_cat_nacionalidades',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al actualizar la nacionalidad con id ${id}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Error al actualizar el registro.' });
      }

      const datosNuevos = await pool.query(
        `
        UPDATE e_cat_nacionalidades SET nombre = $1 WHERE id = $2 RETURNING *
        `
        , [nacionalidad, id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'e_cat_nacionalidades',
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

  // ELIMIAR REGISTRO NACIONALIDAD   **USADO  
  public async EliminarNacionalidad(req: Request, res: Response): Promise<Response> {
    try {
      const { user_name, ip, ip_local } = req.body;
      const id = req.params.id;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // OBTENER DATOSORIGINALES
      const consulta = await pool.query(`SELECT * FROM e_cat_nacionalidades WHERE id = $1`, [id]);
      const [datosOriginales] = consulta.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'e_cat_nacionalidades',
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
        DELETE FROM e_cat_nacionalidades WHERE id = $1
        `
        , [id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'e_cat_nacionalidades',
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

export const nacionalidadControlador = new NacionalidadControlador();

export default nacionalidadControlador;