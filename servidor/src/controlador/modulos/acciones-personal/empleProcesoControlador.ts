import { Request, Response } from 'express';
import AUDITORIA_CONTROLADOR from '../../reportes/auditoriaControlador';
import pool from '../../../database';

class EmpleadoProcesoControlador {


  

  // METODO PARA OBTENER PROCESOS DEL USUARIO   **USADO
  public async BuscarProcesoUsuario(req: Request, res: Response): Promise<any> {
    const { id_empleado } = req.params;

    console.log('req.params: ',req.params)

    const EMPLEADO_PROCESOS = await pool.query(
      `
      SELECT ep.id, ep.id_proceso, ep.estado, cp.nombre AS proceso 
      FROM map_empleado_procesos AS ep, map_cat_procesos AS cp 
      WHERE ep.id_empleado = $1 AND ep.id_proceso = cp.id
      `
      , [id_empleado]);
    if (EMPLEADO_PROCESOS.rowCount != 0) {
      return res.status(200).jsonp({procesos: EMPLEADO_PROCESOS.rows, text: 'correcto', status: 200})
    }

    res.status(404).jsonp({Procesos: undefined, text: 'Registro no encontrado.', status: 400 });
  }



  public async EliminarRegistros(req: Request, res: Response): Promise<Response> {
    try {
      const { user_name, ip, ip_local } = req.body;
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
          ip: ip,
          ip_local: ip_local,
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

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'map_empleado_procesos',
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
      return res.status(200).jsonp({ message: 'Registro eliminado.' });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'Error al eliminar registro.' });
    }
  }

}

export const EMPLEADO_PROCESO_CONTROLADOR = new EmpleadoProcesoControlador();

export default EMPLEADO_PROCESO_CONTROLADOR;