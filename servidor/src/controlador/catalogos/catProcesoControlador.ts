import { Request, Response } from 'express';
import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';

import pool from '../../database';

class ProcesoControlador {
  public async list(req: Request, res: Response) {
    const Sin_proc_padre = await pool.query('SELECT * FROM cg_procesos AS cg_p WHERE cg_p.proc_padre IS NULL ORDER BY cg_p.nombre ASC');
    const Con_proc_padre = await pool.query('SELECT cg_p.id, cg_p.nombre, cg_p.nivel, nom_p.nombre AS proc_padre FROM cg_procesos AS cg_p, NombreProcesos AS nom_p WHERE cg_p.proc_padre = nom_p.id ORDER BY cg_p.nombre ASC');
    Sin_proc_padre.rows.forEach((obj: any) => {
      Con_proc_padre.rows.push(obj);
    })
    res.jsonp(Con_proc_padre.rows);
  }

  public async getOne(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const unaProvincia = await pool.query('SELECT * FROM cg_procesos WHERE id = $1', [id]);
    if (unaProvincia.rowCount > 0) {
      return res.jsonp(unaProvincia.rows)
    }
    res.status(404).jsonp({ text: 'El proceso no ha sido encontrado' });
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, nivel, proc_padre, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      await pool.query('INSERT INTO cg_procesos (nombre, nivel, proc_padre) VALUES ($1, $2, $3)', [nombre, nivel, proc_padre]);
      console.log(req.body);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'cg_procesos',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: `{"nombre": "${nombre}", "nivel": "${nivel}", "proc_padre": "${proc_padre}"}`,
        ip: ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      res.jsonp({ message: 'El departamento ha sido guardado en éxito' });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      res.status(500).jsonp({ message: 'Error al guardar el departamento' });
    }
  }

  public async getIdByNombre(req: Request, res: Response): Promise<any> {
    const { nombre } = req.params;
    const unIdProceso = await pool.query('SELECT id FROM cg_procesos WHERE nombre = $1', [nombre]);
    if (unIdProceso != null) {
      return res.jsonp(unIdProceso.rows);
    }
    res.status(404).jsonp({ text: 'El proceso no ha sido encontrado' });
  }

  public async ActualizarProceso(req: Request, res: Response): Promise<Response> {
    try {
      const { nombre, nivel, proc_padre, id, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const proceso = await pool.query('SELECT * FROM cg_procesos WHERE id = $1', [id]);
      const [datosOriginales] = proceso.rows;

      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'cg_procesos',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          observacion: `Error al actualizar el registro con id: ${id}.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'error' });
      }

      await pool.query('UPDATE cg_procesos SET nombre = $1, nivel = $2, proc_padre = $3 WHERE id = $4', [nombre, nivel, proc_padre, id]);
      
      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'cg_procesos',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: `{"nombre": "${nombre}", "nivel": "${nivel}", "proc_padre": "${proc_padre}"}`,
        ip: ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'El proceso actualizado exitosamente' });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: error });
    }
  }

  public async EliminarProceso(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      // TODO ANALIZAR COMOOBTNER USER_NAME E IP DESDE EL FRONT
      const { user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const proceso = await pool.query('SELECT * FROM cg_procesos WHERE id = $1', [id]);
      const [datosOriginales] = proceso.rows;

      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'cg_procesos',
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

      await pool.query('DELETE FROM cg_procesos WHERE id = $1', [id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'cg_procesos',
        usuario: user_name,
        accion: 'D',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: '',
        ip: ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro eliminado.' })
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: error });
    };
  }


}

export const PROCESOS_CONTROLADOR = new ProcesoControlador();

export default PROCESOS_CONTROLADOR;