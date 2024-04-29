import { Request, Response } from 'express';
import { QueryResult } from "pg";
import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';
import pool from '../../database';

class HorasExtrasControlador {
  public async ListarHorasExtras(req: Request, res: Response) {
    const HORAS_EXTRAS = await pool.query('SELECT * FROM cg_hora_extras');
    if (HORAS_EXTRAS.rowCount > 0) {
      return res.jsonp(HORAS_EXTRAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  public async ObtenerUnaHoraExtra(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const HORAS_EXTRAS = await pool.query('SELECT * FROM cg_hora_extras WHERE id = $1', [id]);
    if (HORAS_EXTRAS.rowCount > 0) {
      return res.jsonp(HORAS_EXTRAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  public async CrearHoraExtra(req: Request, res: Response) {
    try {
      const { descripcion, tipo_descuento, reca_porcentaje, hora_inicio, hora_final, hora_jornada, tipo_dia, codigo,
        incl_almuerzo, tipo_funcion, user_name, ip } = req.body;
  
      // INICIAR TRANSACCION
      await pool.query('BEGIN');
      
      const response: QueryResult = await pool.query(
        `
        INSERT INTO cg_hora_extras ( descripcion, tipo_descuento, reca_porcentaje, hora_inicio, hora_final, hora_jornada, 
          tipo_dia, codigo, incl_almuerzo, tipo_funcion ) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
        `
        , [descripcion, tipo_descuento, reca_porcentaje, hora_inicio, hora_final, hora_jornada, tipo_dia, codigo, incl_almuerzo, tipo_funcion]);
  
      const [HORA] = response.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'cg_hora_extras',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: JSON.stringify(HORA),
        ip: ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
  
      if (HORA) {
        return res.status(200).jsonp(HORA);
      } else {
        return res.status(404).jsonp({ message: "error" });
      }
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: error });
    }
  }

  public async EliminarRegistros(req: Request, res: Response): Promise<Response> {
    try {
      // TODO ANALIZAR COMO OBTENER DESDE EL FRONT EL USERNAME Y LA IP
      const { user_name, ip } = req.body;
      const id = req.params.id;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const horaExtra = await pool.query('SELECT * FROM cg_hora_extras WHERE id = $1', [id]);
      const [datosOriginales] = horaExtra.rows;

      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'cg_hora_extras',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          observacion: `Error al eliminar el registro con id: ${id}.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
      }

      await pool.query('DELETE FROM cg_hora_extras WHERE id = $1', [id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'cg_hora_extras',
        usuario: user_name,
        accion: 'D',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: '',
        ip: ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');

      return res.jsonp({ message: 'Registro eliminado.' });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: error });
      
    }
  }

  public async ActualizarHoraExtra(req: Request, res: Response): Promise<Response> {
    try {
      const { descripcion, tipo_descuento, reca_porcentaje, hora_inicio, hora_final, hora_jornada, tipo_dia, codigo, incl_almuerzo, tipo_funcion, id, user_name, ip } = req.body;
      
      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const horaExtra = await pool.query('SELECT * FROM cg_hora_extras WHERE id = $1', [id]);
      const [datosOriginales] = horaExtra.rows;

      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'cg_hora_extras',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          observacion: `Error al actualizar el registro con id: ${id}.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
      }

      await pool.query('UPDATE cg_hora_extras SET descripcion = $1, tipo_descuento = $2, reca_porcentaje = $3, hora_inicio = $4, hora_final = $5, hora_jornada = $6, tipo_dia = $7, codigo = $8, incl_almuerzo = $9, tipo_funcion = $10 WHERE id = $11', [descripcion, tipo_descuento, reca_porcentaje, hora_inicio, hora_final, hora_jornada, tipo_dia, codigo, incl_almuerzo, tipo_funcion, id]);
      
      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'cg_hora_extras',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: `{"descripcion": "${descripcion}", "tipo_descuento": "${tipo_descuento}", "reca_porcentaje": "${reca_porcentaje}", "hora_inicio": "${hora_inicio}", "hora_final": "${hora_final}", "hora_jornada": "${hora_jornada}", "tipo_dia": "${tipo_dia}", "codigo": "${codigo}", "incl_almuerzo": "${incl_almuerzo}", "tipo_funcion": "${tipo_funcion}"}`,
        ip: ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Hora extra actualizada' });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: error });
    }
  }
}

export const horaExtraControlador = new HorasExtrasControlador();

export default horaExtraControlador;