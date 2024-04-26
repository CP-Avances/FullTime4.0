import { Request, Response } from 'express';
import AUDITORIA_CONTROLADOR from '../../auditoria/auditoriaControlador';
import pool from '../../../database';

class EmpleadoProcesoControlador {


  public async CrearEmpleProcesos(req: Request, res: Response): Promise<void> {
    try {
      const { id, id_empleado, id_empl_cargo, fec_inicio, fec_final, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      await pool.query(
        `
        INSERT INTO empl_procesos (id, id_empleado, id_empl_cargo, fec_inicio, fec_final) 
        VALUES ($1, $2, $3, $4, $5)
        `
        , [id, id_empleado, id_empl_cargo, fec_inicio, fec_final]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'empl_procesos',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos:`{id: ${id}, id_empleado: ${id_empleado}, id_empl_cargo: ${id_empl_cargo}, fec_inicio: ${fec_inicio}, fec_final: ${fec_final}}`,
        ip, 
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      res.jsonp({ message: 'Procesos del empleado guardados con éxito' });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      res.status(404).jsonp({ message: 'Error al guardar procesos del empleado.' });
    }
  }

  public async ActualizarProcesoEmpleado(req: Request, res: Response): Promise<Response> {
    try {
      const { id, id_empl_cargo, fec_inicio, fec_final, id_p, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const proceso = await pool.query('SELECT * FROM empl_procesos WHERE id_p = $1', [id_p]);
      const [datosOriginales] = proceso.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'empl_procesos',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos:'',
          ip, 
          observacion: `Error al actualizar proceso con id_p: ${id_p}`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Error al actualizar proceso' });
      }

      await pool.query(
        `
        UPDATE empl_procesos SET id = $1, id_empl_cargo = $2, fec_inicio = $3, fec_final = $4 
        WHERE id_p = $5
        `
        , [id, id_empl_cargo, fec_inicio, fec_final, id_p]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'empl_procesos',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: `{id: ${id}, id_empl_cargo: ${id_empl_cargo}, fec_inicio: ${fec_inicio}, fec_final: ${fec_final}}`,
        ip, 
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Proceso actualizado exitosamente' });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(404).jsonp({ message: 'Error al actualizar proceso.' });
    }
  }

  public async BuscarProcesoUsuario(req: Request, res: Response): Promise<any> {
    const { id_empleado } = req.params;
    const HORARIO_CARGO = await pool.query(
      `
      SELECT ep.id_p, ep.id, ep.id_empl_cargo, ep.fec_inicio, ep.fec_final, cp.nombre AS proceso 
      FROM empl_procesos AS ep, cg_procesos AS cp 
      WHERE ep.id_empleado = $1 AND ep.id = cp.id
      `
      , [id_empleado]);
    if (HORARIO_CARGO.rowCount > 0) {
      return res.jsonp(HORARIO_CARGO.rows)
    }
    res.status(404).jsonp({ text: 'Registro no encontrado' });
  }

  public async ListarEmpleProcesos(req: Request, res: Response) {
    const PROCESOS = await pool.query(
      `
      SELECT *FROM empl_procesos
      `
    );
    if (PROCESOS.rowCount > 0) {
      return res.jsonp(PROCESOS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  public async EliminarRegistros(req: Request, res: Response): Promise<Response> {
    try {
      // TODO ANALIZAR COMO OBTENER USER_NAME E IP DESDEEL FRONT
      const { user_name, ip } = req.body;
      const id = req.params.id;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const proceso = await pool.query('SELECT * FROM empl_procesos WHERE id = $1', [id]);
      const [datosOriginales] = proceso.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'empl_procesos',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos:'',
          ip, 
          observacion: `Error al eliminar proceso con id: ${id}`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
      }

      await pool.query(
        `
        DELETE FROM empl_procesos WHERE id = $1
        `, [id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'empl_procesos',
        usuario: user_name,
        accion: 'D',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos:'',
        ip, 
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro eliminado.' });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(404).jsonp({ message: 'Error al eliminar registro.' });
    }
  }

}

export const EMPLEADO_PROCESO_CONTROLADOR = new EmpleadoProcesoControlador();

export default EMPLEADO_PROCESO_CONTROLADOR;