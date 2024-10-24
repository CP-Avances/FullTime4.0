import { Request, Response } from 'express';
import AUDITORIA_CONTROLADOR from '../../reportes/auditoriaControlador';
import pool from '../../../database';
import { FormatearFecha2 } from '../../../libs/settingsMail';

class EmpleadoProcesoControlador {

  public async CrearEmpleProcesos(req: Request, res: Response): Promise<void> {
    try {
      const { id, id_empleado, id_empl_cargo, fec_inicio, fec_final, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      await pool.query(
        `
        INSERT INTO map_empleado_procesos (id_proceso, id_empleado, id_empleado_cargo, fecha_inicio, fecha_final) 
        VALUES ($1, $2, $3, $4, $5)
        `
        , [id, id_empleado, id_empl_cargo, fec_inicio, fec_final])


      var fechaInicioN = await FormatearFecha2(fec_inicio, 'ddd');
      var fechaFinalN = await FormatearFecha2(fec_final, 'ddd');;


      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'map_empleado_procesos',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: `{id: ${id}, id_empleado: ${id_empleado}, id_empleado_cargo: ${id_empl_cargo}, fecha_inicio: ${fechaInicioN}, fecha_final: ${fechaFinalN}}`,
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      res.jsonp({ message: 'Procesos del empleado guardados con éxito' });

    } catch (error) {
      console.log('error ', error)
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      res.status(500).jsonp({ message: 'Error al guardar procesos del empleado.' });
    }
  }

  public async ActualizarProcesoEmpleado(req: Request, res: Response): Promise<Response> {
    try {
      const { id, id_empleado_cargo, fec_inicio, fec_final, id_proceso, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const proceso = await pool.query('SELECT * FROM map_empleado_procesos WHERE id = $1', [id]);
      const [datosOriginales] = proceso.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'map_empleado_procesos',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al actualizar proceso con id: ${id}`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Error al actualizar proceso' });
      }

      const datosNuevos = await pool.query(
        `
        UPDATE map_empleado_procesos SET id_proceso = $5, id_empleado_cargo = $2, fecha_inicio = $3, fecha_final = $4 
        WHERE id = $1 RETURNING *
        `
        , [id, id_empleado_cargo, fec_inicio, fec_final, id_proceso]);

      const fechaInicioN = await FormatearFecha2(fec_inicio, 'ddd');
      const fechaFinalN = await FormatearFecha2(fec_final, 'ddd');

      const fechaInicioO = await FormatearFecha2(datosOriginales.fecha_inicio, 'ddd');
      const fechaFinalO = await FormatearFecha2(datosOriginales.fecha_final, 'ddd');

      datosOriginales.fecha_inicio = fechaInicioO;
      datosOriginales.fecha_final = fechaFinalO;

      datosNuevos.rows[0].fecha_inicio = fechaInicioN;
      datosNuevos.rows[0].fecha_final = fechaFinalN;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'map_empleado_procesos',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: JSON.stringify(datosNuevos.rows[0]),
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Proceso actualizado exitosamente' });
    } catch (error) {
      // REVERTIR TRANSACCION
      console.log('error ', error)
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'Error al actualizar proceso.' });
    }
  }

  // METODO PARA OBTENER PROCESOS DEL USUARIO   **USADO
  public async BuscarProcesoUsuario(req: Request, res: Response): Promise<any> {
    const { id_empleado } = req.params;
    const HORARIO_CARGO = await pool.query(
      `
      SELECT ep.id, ep.id_proceso, ep.id_empleado_cargo, ep.fecha_inicio, ep.fecha_final, cp.nombre AS proceso 
      FROM map_empleado_procesos AS ep, map_cat_procesos AS cp 
      WHERE ep.id_empleado = $1 AND ep.id_proceso = cp.id
      `
      , [id_empleado]);
    if (HORARIO_CARGO.rowCount != 0) {
      return res.jsonp(HORARIO_CARGO.rows)
    }
    res.status(404).jsonp({ text: 'Registro no encontrado.' });
  }



  public async EliminarRegistros(req: Request, res: Response): Promise<Response> {
    try {
      const { user_name, ip } = req.body;
      const id = req.params.id;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const proceso = await pool.query('SELECT * FROM map_empleado_procesos WHERE id = $1', [id]);
      const [datosOriginales] = proceso.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'map_empleado_procesos',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al eliminar proceso con id: ${id}`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
      }

      await pool.query(
        `
        DELETE FROM map_empleado_procesos WHERE id = $1
        `, [id]);
      const fechaInicioO = await FormatearFecha2(datosOriginales.fecha_inicio, 'ddd');
      const fechaFinalO = await FormatearFecha2(datosOriginales.fecha_final, 'ddd');

      datosOriginales.fecha_inicio = fechaInicioO;
      datosOriginales.fecha_final = fechaFinalO;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'map_empleado_procesos',
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
      return res.status(500).jsonp({ message: 'Error al eliminar registro.' });
    }
  }

}

export const EMPLEADO_PROCESO_CONTROLADOR = new EmpleadoProcesoControlador();

export default EMPLEADO_PROCESO_CONTROLADOR;