import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';
import pool from '../../database';
import { FormatearFecha2, FormatearHora } from '../../libs/settingsMail';

class TipoPermisosControlador {

  // METODO PARA BUSCAR TIPO DE PERMISOS
  public async Listar(req: Request, res: Response) {
    const rolPermisos = await pool.query(
      `
      SELECT * FROM mp_cat_tipo_permisos ORDER BY descripcion ASC
      `
    );
    if (rolPermisos.rowCount != 0) {
      return res.jsonp(rolPermisos.rows)
    }
    else {
      res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }
  }

  // METODO PARA ELIMINAR REGISTROS
  public async EliminarRegistros(req: Request, res: Response): Promise<Response> {
    try {
      const { user_name, ip } = req.body;
      const id = req.params.id;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const rol = await pool.query('SELECT * FROM mp_cat_tipo_permisos WHERE id = $1', [id]);
      const [datosOriginales] = rol.rows;

      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'mp_cat_tipo_permisos',
          usuario: user_name,
          accion: 'D',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al eliminar el tipo de permiso con id ${id}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Error al eliminar el registro.' });
      }

      await pool.query(
        `
        DELETE FROM mp_cat_tipo_permisos WHERE id = $1
        `
        , [id]);
      const fechaHoraO = await FormatearHora(datosOriginales.horas_maximo_permiso)
      const fechaInicioO = await FormatearFecha2(datosOriginales.fecha_inicio, 'ddd')
      const fechaFinO = await FormatearFecha2(datosOriginales.fecha_fin, 'ddd')

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'mp_cat_tipo_permisos',
        usuario: user_name,
        accion: 'D',
        datosOriginales: `{descripcion: ${datosOriginales.descripcion}, tipo_descuento: ${datosOriginales.tipo_descuento}, dias_maximo_permiso: ${datosOriginales.dias_maximo_permiso}, dias_anticipar_permiso: ${datosOriginales.dias_anticipar_permiso}, 
        justificar: ${datosOriginales.justificar}, fecha_restriccion: ${datosOriginales.fecha_restriccion}, solicita_empleado: ${datosOriginales.solicita_empleado}, legalizar: ${datosOriginales.legalizar}, incluir_minutos_comida: ${datosOriginales.incluir_minutos_comida}, dias_justificar: ${datosOriginales.dias_justificar}, 
        horas_maximo_permiso: ${fechaHoraO}, fecha_inicio: ${fechaInicioO}, documento: ${datosOriginales.documento}, contar_feriados: ${datosOriginales.contar_feriados}, correo_crear: ${datosOriginales.correo_crear}, correo_editar: ${datosOriginales.correo_editar}, correo_eliminar: ${datosOriginales.correo_eliminar}, 
        correo_preautorizar: ${datosOriginales.correo_preautorizar}, correo_autorizar: ${datosOriginales.correo_autorizar}, correo_negar: ${datosOriginales.correo_negar}, correo_legalizar: ${datosOriginales.correo_legalizar}, fecha_fin: ${fechaFinO}, crear_dias_anteriores: ${datosOriginales.crear_dias_anteriores}}`,
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
      SELECT * FROM mp_cat_tipo_permisos WHERE id = $1
      `
      , [id]);
    if (unTipoPermiso.rowCount != 0) {
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
      const tipo = await pool.query('SELECT * FROM mp_cat_tipo_permisos WHERE id = $1', [id]);
      const [datosOriginales] = tipo.rows;

      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'mp_cat_tipo_permisos',
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

      const response = await pool.query(
        `
        UPDATE mp_cat_tipo_permisos SET descripcion = $1, tipo_descuento = $2, dias_maximo_permiso = $3, 
        dias_anticipar_permiso = $4, justificar = $5, fecha_restriccion = $6, solicita_empleado = $7, legalizar = $8, 
        incluir_minutos_comida = $9, dias_justificar = $10, horas_maximo_permiso = $11, fecha_inicio = $12, documento = $13, 
        contar_feriados = $14, correo_crear = $15, correo_editar = $16, correo_eliminar = $17, correo_preautorizar = $18, 
        correo_autorizar = $19, correo_negar = $20, correo_legalizar = $21, fecha_fin = $22, crear_dias_anteriores = $23
      WHERE id = $24 RETURNING *
        `
        , [descripcion, tipo_descuento, num_dia_maximo, num_dia_anticipo, gene_justificacion, fec_validar, acce_empleado,
          legalizar, almu_incluir, num_dia_justifica, num_hora_maximo, fecha_inicio, documento, contar_feriados, correo_crear,
          correo_editar, correo_eliminar, correo_preautorizar, correo_autorizar, correo_negar, correo_legalizar, fecha_fin,
          num_dia_anterior, id]);

      const [tipoPermiso] = response.rows;

      const fechaHoraO = await FormatearHora(datosOriginales.horas_maximo_permiso)
      const fechaInicioO = await FormatearFecha2(datosOriginales.fecha_inicio, 'ddd')
      const fechaFinO = await FormatearFecha2(datosOriginales.fecha_fin, 'ddd')
      const fechaHora = await FormatearHora(num_hora_maximo)
      const fechaInicio = await FormatearFecha2(fecha_inicio, 'ddd')
      const fechaFin = await FormatearFecha2(fecha_fin, 'ddd')

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'mp_cat_tipo_permisos',
        usuario: user_name,
        accion: 'U',
        datosOriginales: `{descripcion: ${datosOriginales.descripcion}, tipo_descuento: ${datosOriginales.tipo_descuento}, dias_maximo_permiso: ${datosOriginales.dias_maximo_permiso}, dias_anticipar_permiso: ${datosOriginales.dias_anticipar_permiso}, 
        justificar: ${datosOriginales.justificar}, fecha_restriccion: ${datosOriginales.fecha_restriccion}, solicita_empleado: ${datosOriginales.solicita_empleado}, legalizar: ${datosOriginales.legalizar}, incluir_minutos_comida: ${datosOriginales.incluir_minutos_comida}, dias_justificar: ${datosOriginales.dias_justificar}, 
        horas_maximo_permiso: ${fechaHoraO}, fecha_inicio: ${fechaInicioO}, documento: ${datosOriginales.documento}, contar_feriados: ${datosOriginales.contar_feriados}, correo_crear: ${datosOriginales.correo_crear}, correo_editar: ${datosOriginales.correo_editar}, correo_eliminar: ${datosOriginales.correo_eliminar}, 
        correo_preautorizar: ${datosOriginales.correo_preautorizar}, correo_autorizar: ${datosOriginales.correo_autorizar}, correo_negar: ${datosOriginales.correo_negar}, correo_legalizar: ${datosOriginales.correo_legalizar}, fecha_fin: ${fechaFinO}, crear_dias_anteriores: ${datosOriginales.crear_dias_anteriores}}`,
        datosNuevos: `{descripcion: ${descripcion}, tipo_descuento: ${tipo_descuento}, dias_maximo_permiso: ${num_dia_maximo}, dias_anticipar_permiso: ${num_dia_anticipo}, 
        justificar: ${gene_justificacion}, fecha_restriccion: ${fec_validar}, solicita_empleado: ${acce_empleado}, legalizar: ${legalizar}, incluir_minutos_comida: ${almu_incluir}, dias_justificar: ${num_dia_justifica}, 
        horas_maximo_permiso: ${fechaHora}, fecha_inicio: ${fechaInicio}, documento: ${documento}, contar_feriados: ${contar_feriados}, correo_crear: ${correo_crear}, correo_editar: ${correo_editar}, correo_eliminar: ${correo_eliminar}, 
        correo_preautorizar: ${correo_preautorizar}, correo_autorizar: ${correo_autorizar}, correo_negar: ${correo_negar}, correo_legalizar: ${correo_legalizar}, fecha_fin: ${fechaFin}, crear_dias_anteriores: ${num_dia_anterior}}`,
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
    console.log(req.body);
    try {
      const { descripcion, tipo_descuento, num_dia_maximo, num_dia_anticipo, gene_justificacion, fec_validar, acce_empleado,
        legalizar, almu_incluir, num_dia_justifica, num_hora_maximo, fecha_inicio, documento, contar_feriados, correo_crear,
        correo_editar, correo_eliminar, correo_preautorizar, correo_autorizar, correo_negar, correo_legalizar,
        fecha_fin, num_dia_anterior, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      const response: QueryResult = await pool.query(
        `
        INSERT INTO mp_cat_tipo_permisos (descripcion, tipo_descuento, dias_maximo_permiso, dias_anticipar_permiso, 
          justificar, fecha_restriccion, solicita_empleado, legalizar, incluir_minutos_comida, dias_justificar, 
          horas_maximo_permiso, fecha_inicio, documento, contar_feriados, correo_crear, correo_editar, correo_eliminar, 
          correo_preautorizar, correo_autorizar, correo_negar, correo_legalizar, fecha_fin, crear_dias_anteriores)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21,
           $22, $23) RETURNING *
        `
        , [descripcion, tipo_descuento, num_dia_maximo, num_dia_anticipo, gene_justificacion, fec_validar,
          acce_empleado, legalizar, almu_incluir, num_dia_justifica, num_hora_maximo, fecha_inicio, documento, contar_feriados,
          correo_crear, correo_editar, correo_eliminar, correo_preautorizar, correo_autorizar, correo_negar, correo_legalizar,
          fecha_fin, num_dia_anterior]);

      const [tipo] = response.rows;

      const fechaHora = await FormatearHora(num_hora_maximo)
      const fechaInicio = await FormatearFecha2(fecha_inicio, 'ddd')
      const fechaFin = await FormatearFecha2(fecha_fin, 'ddd')


      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'mp_cat_tipo_permisos',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: `{descripcion: ${descripcion}, tipo_descuento: ${tipo_descuento}, dias_maximo_permiso: ${num_dia_maximo}, dias_anticipar_permiso: ${num_dia_anticipo}, 
          justificar: ${gene_justificacion}, fecha_restriccion: ${fec_validar}, solicita_empleado: ${acce_empleado}, legalizar: ${legalizar}, incluir_minutos_comida: ${almu_incluir}, dias_justificar: ${num_dia_justifica}, 
          horas_maximo_permiso: ${fechaHora}, fecha_inicio: ${fechaInicio}, documento: ${documento}, contar_feriados: ${contar_feriados}, correo_crear: ${correo_crear}, correo_editar: ${correo_editar}, correo_eliminar: ${correo_eliminar}, 
          correo_preautorizar: ${correo_preautorizar}, correo_autorizar: ${correo_autorizar}, correo_negar: ${correo_negar}, correo_legalizar: ${correo_legalizar}, fecha_fin: ${fechaFin}, crear_dias_anteriores: ${num_dia_anterior}}`,
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
      console.log(error);
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
      SELECT * FROM mp_cat_tipo_permisos WHERE solicita_empleado = $1 ORDER BY descripcion
      `
      , [acce_empleado]);
    res.json(rolPermisos.rows);
  }

}

export const TIPO_PERMISOS_CONTROLADOR = new TipoPermisosControlador();

export default TIPO_PERMISOS_CONTROLADOR;