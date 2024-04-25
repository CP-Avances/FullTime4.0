// IMPORTAR LIBRERIAS
import { Request, Response } from 'express';
import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';
import pool from '../../database';

class RolesControlador {

  // METODO PARA LISTAR ROLES DEL SISTEMA
  public async ListarRoles(req: Request, res: Response) {
    const ROL = await pool.query(
      `
      SELECT id, nombre FROM cg_roles ORDER BY nombre ASC
      `
    );
    if (ROL.rowCount > 0) {
      return res.jsonp(ROL.rows)
    } else {
      res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }

  // METODO PARA ELIMINAR REGISTRO
  public async EliminarRol(req: Request, res: Response): Promise<Response> {
    try {
      // TODO ANALIZAR COMOOBTENER USER_NAME E IP DESDE EL FRONT
      const { user_name, ip } = req.body;
      const id = req.params.id;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const rol = await pool.query('SELECT * FROM cg_roles WHERE id = $1', [id]);
      const [datosOriginales] = rol.rows;
      
      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'cg_roles',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al eliminar el rol con id ${id}`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Error al eliminar el registro.' });
      }
      
      await pool.query(
        `
        DELETE FROM cg_roles WHERE id = $1
        `
        , [id]);
      
      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'cg_roles',
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
      // FINALIZAR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(404).jsonp({ message: 'Error al eliminar el registro.' });
    }
  }

  // METODO PARA REGISTRAR ROL
  public async CrearRol(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, user_name, ip } = req.body;
      
      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      await pool.query(
        `
         INSERT INTO cg_roles (nombre) VALUES ($1)
         `
        , [nombre]);
      
      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'cg_roles',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: `{nombre: ${nombre}}`,
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      res.jsonp({ message: 'Registro guardado.' });
    } catch (error) {
      // FINALIZAR TRANSACCION
      await pool.query('ROLLBACK');
      res.status(404).jsonp({ message: 'Error al guardar el registro.' });
    }

  }

  public async ListarRolesActualiza(req: Request, res: Response) {
    const id = req.params.id;
    const ROL = await pool.query('SELECT * FROM cg_roles WHERE NOT id = $1', [id]);
    if (ROL.rowCount > 0) {
      return res.jsonp(ROL.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }

  public async ObtnenerUnRol(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const ROL = await pool.query('SELECT * FROM cg_roles WHERE id = $1', [id]);
    if (ROL.rowCount > 0) {
      return res.jsonp(ROL.rows)
    } else {
      res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }


  public async ActualizarRol(req: Request, res: Response): Promise<Response> {
    try {
      const { nombre, id, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOS ORIGINALES
      const rol = await pool.query('SELECT * FROM cg_roles WHERE id = $1', [id]);
      const [datosOriginales] = rol.rows;

      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'cg_roles',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al actualizar el rol con id ${id}`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Error al actualizar el registro.' });
      }

      await pool.query('UPDATE cg_roles SET nombre = $1 WHERE id = $2', [nombre, id]);
      
      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'cg_roles',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: `{nombre: ${nombre}}`,
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro Actualizado' });
    } catch (error) {
      // FINALIZAR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(404).jsonp({ message: 'Error al actualizar el registro.' });
    }
  }
}

const ROLES_CONTROLADOR = new RolesControlador();

export default ROLES_CONTROLADOR;
