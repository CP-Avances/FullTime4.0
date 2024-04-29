import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';
import pool from '../../database';

class TipoPermisosControlador {

  // METODO PARA BUSCAR TIPO DE PERMISOS
  public async Listar(req: Request, res: Response) {
    const rolPermisos = await pool.query(
      `
      SELECT * FROM cg_tipo_permisos ORDER BY descripcion ASC
      `
    );
    if (rolPermisos.rowCount > 0) {
      return res.jsonp(rolPermisos.rows)
    }
    else {
      res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }
  }

  // METODO PARA ELIMINAR REGISTROS
  public async EliminarRegistros(req: Request, res: Response): Promise<Response> {
    try {
      // TODO ANALIZAR COMOOBTENER USER_NAME E IP DESDE EL FRONT
      const { user_name, ip } = req.body;
      const id = req.params.id;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const rol = await pool.query('SELECT * FROM cg_tipo_permisos WHERE id = $1', [id]);
      const [datosOriginales] = rol.rows;

      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'cg_tipo_permisos',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al eliminar el tipo de permiso con id ${id}`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Error al eliminar el registro.' });
      }

      await pool.query(
        `
        DELETE FROM cg_tipo_permisos WHERE id = $1
        `
        , [id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'cg_tipo_permisos',
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
      return res.status(500).jsonp({ message: 'Error al eliminar el registro.' });
    }
  }

  // METODO PARA LISTAR DATOS DE UN TIPO DE PERMISO
  public async BuscarUnTipoPermiso(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const unTipoPermiso = await pool.query(
      `
      SELECT * FROM cg_tipo_permisos WHERE id = $1
      `
      , [id]);
    if (unTipoPermiso.rowCount > 0) {
      return res.jsonp(unTipoPermiso.rows)
    }
    res.status(404).jsonp({ text: 'Registro no encontrado.' });
  }

  // METODO PARA EDITAR REGISTRO
  public async Editar(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const { descripcion, tipo_descuento, num_dia_maximo, num_dia_anticipo, gene_justificacion, fec_validar, acce_empleado,
        legalizar, almu_incluir, num_dia_justifica, num_hora_maximo, fecha_inicio, documento, contar_feriados, correo_crear,
        correo_editar, correo_eliminar, correo_preautorizar, correo_autorizar, correo_negar, correo_legalizar, fecha_fin,
        num_dia_anterior, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const tipo = await pool.query('SELECT * FROM cg_tipo_permisos WHERE id = $1', [id]);
      const [datosOriginales] = tipo.rows;

      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'cg_tipo_permisos',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al actualizar el tipo de permiso con id ${id}`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Error al actualizar el registro.' });
      }

      await pool.query(
        `
        UPDATE cg_tipo_permisos SET descripcion = $1, tipo_descuento = $2, num_dia_maximo = $3, num_dia_anticipo = $4, 
          gene_justificacion = $5, fec_validar = $6, acce_empleado = $7, legalizar = $8, almu_incluir = $9, 
          num_dia_justifica = $10, num_hora_maximo = $11, fecha_inicio = $12, documento = $13, contar_feriados = $14, 
          correo_crear = $15, correo_editar = $16, correo_eliminar = $17, correo_preautorizar = $18, correo_autorizar = $19, 
          correo_negar = $20, correo_legalizar = $21, fecha_fin = $22, num_dia_anterior = $23
        WHERE id = $24
        `
        , [descripcion, tipo_descuento, num_dia_maximo, num_dia_anticipo, gene_justificacion, fec_validar, acce_empleado,
          legalizar, almu_incluir, num_dia_justifica, num_hora_maximo, fecha_inicio, documento, contar_feriados, correo_crear,
          correo_editar, correo_eliminar, correo_preautorizar, correo_autorizar, correo_negar, correo_legalizar, fecha_fin,
          num_dia_anterior, id]);

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'cg_tipo_permisos',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: `{descripcion: ${descripcion}, tipo_descuento: ${tipo_descuento}, num_dia_maximo: ${num_dia_maximo}, 
                      num_dia_anticipo: ${num_dia_anticipo}, gene_justificacion: ${gene_justificacion}, fec_validar: ${fec_validar}, 
                      acce_empleado: ${acce_empleado}, legalizar: ${legalizar}, almu_incluir: ${almu_incluir}, 
                      num_dia_justifica: ${num_dia_justifica}, num_hora_maximo: ${num_hora_maximo}, fecha_inicio: ${fecha_inicio}, 
                      documento: ${documento}, contar_feriados: ${contar_feriados}, correo_crear: ${correo_crear}, 
                      correo_editar: ${correo_editar}, correo_eliminar: ${correo_eliminar}, correo_preautorizar: ${correo_preautorizar}, 
                      correo_autorizar: ${correo_autorizar}, correo_negar: ${correo_negar}, correo_legalizar: ${correo_legalizar}, 
                      fecha_fin: ${fecha_fin}, num_dia_anterior: ${num_dia_anterior}}`,
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro actualizado.' });
    } catch (error) {
      // FINALIZAR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'Error al actualizar el registro.' });
    }
  }

  // METODO PARA CREAR REGISTRO DE TIPO DE PERMISO
  public async Crear(req: Request, res: Response) {
    try {
      const { descripcion, tipo_descuento, num_dia_maximo, num_dia_anticipo, gene_justificacion, fec_validar, acce_empleado,
        legalizar, almu_incluir, num_dia_justifica, num_hora_maximo, fecha_inicio, documento, contar_feriados, correo_crear,
        correo_editar, correo_eliminar, correo_preautorizar, correo_autorizar, correo_negar, correo_legalizar,
        fecha_fin, num_dia_anterior, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      const response: QueryResult = await pool.query(
        `
        INSERT INTO cg_tipo_permisos (descripcion, tipo_descuento, num_dia_maximo, num_dia_anticipo, gene_justificacion, 
          fec_validar, acce_empleado, legalizar, almu_incluir, num_dia_justifica, num_hora_maximo, fecha_inicio, documento,
           contar_feriados, correo_crear, correo_editar, correo_eliminar, correo_preautorizar, correo_autorizar, correo_negar, 
           correo_legalizar, fecha_fin, num_dia_anterior)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21,
           $22, $23) RETURNING *
        `
        , [descripcion, tipo_descuento, num_dia_maximo, num_dia_anticipo, gene_justificacion, fec_validar,
          acce_empleado, legalizar, almu_incluir, num_dia_justifica, num_hora_maximo, fecha_inicio, documento, contar_feriados,
          correo_crear, correo_editar, correo_eliminar, correo_preautorizar, correo_autorizar, correo_negar, correo_legalizar,
          fecha_fin, num_dia_anterior]);

      const [tipo] = response.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'cg_tipo_permisos',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: JSON.stringify(tipo),
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');

      if (tipo) {
        return res.status(200).jsonp(tipo)
      }
      else {
        return res.status(404).jsonp({ message: 'error' })
      }
    }
    catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: error });
    }
  }

  // METODO PARA LISTAR TIPO DE PERMISOS DE ACUERDO AL ROL
  public async ListarTipoPermisoRol(req: Request, res: Response) {
    const acce_empleado = req.params.acce_empleado;
    const rolPermisos = await pool.query(
      `
      SELECT * FROM cg_tipo_permisos WHERE acce_empleado = $1 ORDER BY descripcion
      `
      , [acce_empleado]);
    res.json(rolPermisos.rows);
  }

}

export const TIPO_PERMISOS_CONTROLADOR = new TipoPermisosControlador();

export default TIPO_PERMISOS_CONTROLADOR;