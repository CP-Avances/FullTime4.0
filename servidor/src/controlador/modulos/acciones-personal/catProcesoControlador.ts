import { Request, Response } from 'express';
import AUDITORIA_CONTROLADOR from '../../reportes/auditoriaControlador';
import pool from '../../../database';

class ProcesoControlador {

  // METODO PARA BUSCAR LISTA DE PROCESOS
  public async ListarProcesos(req: Request, res: Response) {

    const SIN_PROCESO_SUPERIOR = await pool.query(
      `
      SELECT p.id, p.nombre, p.nivel, p.proceso_padre AS proc_padre FROM map_cat_procesos AS p 
      WHERE p.proceso_padre IS NULL 
      ORDER BY p.nombre ASC
      `
    );

    const CON_PROCESO_SUPERIOR = await pool.query(
      `
      SELECT p.id, p.nombre, p.nivel, nom_p.nombre AS proc_padre 
      FROM map_cat_procesos AS p, nombreprocesos AS nom_p 
      WHERE p.proceso_padre = nom_p.id 
      ORDER BY p.nombre ASC
      `
    );

    SIN_PROCESO_SUPERIOR.rows.forEach((obj: any) => {
      CON_PROCESO_SUPERIOR.rows.push(obj);
    })

    res.jsonp(CON_PROCESO_SUPERIOR.rows);
  }


  public async getOne(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const unaProvincia = await pool.query(
      `
      SELECT * FROM map_cat_procesos WHERE id = $1
      `
      , [id]);
    if (unaProvincia.rowCount != 0) {
      return res.jsonp(unaProvincia.rows)
    }
    res.status(404).jsonp({ text: 'El proceso no ha sido encontrado.' });
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, nivel, proc_padre, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      await pool.query(
        `
        INSERT INTO map_cat_procesos (nombre, nivel, proceso_padre) VALUES ($1, $2, $3)
        `
        , [nombre, nivel, proc_padre]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'map_cat_procesos',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: `{"nombre": "${nombre}", "nivel": "${nivel}", "proc_padre": "${proc_padre}"}`,
        ip: ip,
        ip_local: ip_local,
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
    const unIdProceso = await pool.query(
      `
      SELECT id FROM map_cat_procesos WHERE nombre = $1
      `
      , [nombre]);
    if (unIdProceso != null) {
      return res.jsonp(unIdProceso.rows);
    }
    res.status(404).jsonp({ text: 'Registro no encontrado.' });
  }

  public async ActualizarProceso(req: Request, res: Response): Promise<Response> {
    try {
      const { nombre, nivel, proc_padre, id, user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const proceso = await pool.query('SELECT * FROM map_cat_procesos WHERE id = $1', [id]);
      const [datosOriginales] = proceso.rows;

      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'map_cat_procesos',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al actualizar el registro con id: ${id}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'error' });
      }

      await pool.query(
        `
        UPDATE map_cat_procesos SET nombre = $1, nivel = $2, proceso_padre = $3 WHERE id = $4
        `
        , [nombre, nivel, proc_padre, id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'map_cat_procesos',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: `{"nombre": "${nombre}", "nivel": "${nivel}", "proc_padre": "${proc_padre}"}`,
        ip: ip,
        ip_local: ip_local,
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

  // METODO PARA ELIMINA PROCESOS   **USADO
  public async EliminarProceso(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const { user_name, ip, ip_local } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const proceso = await pool.query(
        `
        SELECT * FROM map_cat_procesos WHERE id = $1
        `
        , [id]);
      const [datosOriginales] = proceso.rows;

      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'map_cat_procesos',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al eliminar el registro con id: ${id}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
      }

      await pool.query(
        `
        DELETE FROM map_cat_procesos WHERE id = $1
        `
        , [id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'map_cat_procesos',
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

      return res.jsonp({ message: 'Registro eliminado.' })

    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.jsonp({ message: 'error' });
    };
  }


}

export const PROCESOS_CONTROLADOR = new ProcesoControlador();

export default PROCESOS_CONTROLADOR;