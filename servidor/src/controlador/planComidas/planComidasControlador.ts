import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import {
  enviarMail, email, nombre, cabecera_firma, pie_firma, servidor, puerto, fechaHora, Credenciales,
  FormatearFecha, FormatearHora, dia_completo
}
  from '../../libs/settingsMail';
import pool from '../../database';
import path from 'path';
import fs from 'fs';

const builder = require('xmlbuilder');

class PlanComidasControlador {

  // CONSULTA DE SOLICITUDES DE SERVICIO DE ALIMENTACIÓN CON ESTADO PENDIENTE
  public async EncontrarSolicitaComidaNull(req: Request, res: Response): Promise<any> {
    const PLAN_COMIDAS = await pool.query('SELECT e.apellido, e.nombre, e.cedula, e.codigo, sc.aprobada, sc.id, ' +
      'sc.id_empleado, sc.fecha, sc.observacion, sc.fec_comida, sc.hora_inicio, sc.hora_fin, sc.aprobada, ' +
      'sc.verificar, ctc.id AS id_menu, ctc.nombre AS nombre_menu, tc.id AS id_servicio, ' +
      'tc.nombre AS nombre_servicio, dm.id AS id_detalle, dm.valor, dm.nombre AS nombre_plato, ' +
      'dm.observacion AS observa_menu, sc.extra ' +
      'FROM solicita_comidas AS sc, cg_tipo_comidas AS ctc, tipo_comida AS tc, detalle_menu AS dm, empleados AS e ' +
      'WHERE ctc.tipo_comida = tc.id AND sc.verificar = \'NO\' AND e.id = sc.id_empleado AND ' +
      'ctc.id = dm.id_menu AND sc.id_comida = dm.id AND sc.fec_comida >= current_date ORDER BY sc.fec_comida DESC');
    if (PLAN_COMIDAS.rowCount > 0) {
      return res.jsonp(PLAN_COMIDAS.rows)
    }
    res.status(404).jsonp({ text: 'Registro no encontrado' });
  }

  // CONSULTA DE SOLICITUDES DE SERVICIO DE ALIMENTACIÓN CON ESTADO AUTORIZADO O NEGADO
  public async EncontrarSolicitaComidaAprobada(req: Request, res: Response): Promise<any> {
    const PLAN_COMIDAS = await pool.query('SELECT e.apellido, e.nombre, e.cedula, e.codigo, sc.aprobada, sc.id, ' +
      'sc.id_empleado, sc.fecha, sc.observacion, sc.fec_comida, sc.hora_inicio, sc.hora_fin, sc.aprobada, ' +
      'sc.verificar, ctc.id AS id_menu, ctc.nombre AS nombre_menu, tc.id AS id_servicio, ' +
      'tc.nombre AS nombre_servicio, dm.id AS id_detalle, dm.valor, dm.nombre AS nombre_plato, ' +
      'dm.observacion AS observa_menu, sc.extra ' +
      'FROM solicita_comidas AS sc, cg_tipo_comidas AS ctc, tipo_comida AS tc, detalle_menu AS dm, empleados AS e ' +
      'WHERE ctc.tipo_comida = tc.id AND (sc.aprobada = true OR sc.aprobada = false) AND e.id = sc.id_empleado AND ' +
      'ctc.id = dm.id_menu AND sc.id_comida = dm.id AND sc.fec_comida >= current_date ORDER BY sc.fec_comida DESC');
    if (PLAN_COMIDAS.rowCount > 0) {
      return res.jsonp(PLAN_COMIDAS.rows)
    }
    res.status(404).jsonp({ text: 'Registro no encontrado' });
  }

  // CONSULTA DE SOLICITUDES DE SERVICIO DE ALIMENTACIÓN CON ESTADO EXPIRADO
  public async EncontrarSolicitaComidaExpirada(req: Request, res: Response): Promise<any> {
    const PLAN_COMIDAS = await pool.query('SELECT e.apellido, e.nombre, e.cedula, e.codigo, sc.aprobada, sc.id, ' +
      'sc.id_empleado, sc.fecha, sc.observacion, sc.fec_comida, sc.hora_inicio, sc.hora_fin, sc.aprobada, ' +
      'sc.verificar, ctc.id AS id_menu, ctc.nombre AS nombre_menu, tc.id AS id_servicio, ' +
      'tc.nombre AS nombre_servicio, dm.id AS id_detalle, dm.valor, dm.nombre AS nombre_plato, ' +
      'dm.observacion AS observa_menu, sc.extra FROM solicita_comidas AS sc, cg_tipo_comidas AS ctc, ' +
      'tipo_comida AS tc, detalle_menu AS dm, empleados AS e ' +
      'WHERE ctc.tipo_comida = tc.id AND e.id = sc.id_empleado AND ctc.id = dm.id_menu AND sc.id_comida = dm.id ' +
      'AND sc.fec_comida < current_date ORDER BY sc.fec_comida DESC');
    if (PLAN_COMIDAS.rowCount > 0) {
      return res.jsonp(PLAN_COMIDAS.rows)
    }
    res.status(404).jsonp({ text: 'Registro no encontrado' });
  }


  public async BuscarSolEmpleadoFechasActualizar(req: Request, res: Response) {
    const { id, id_empleado, fecha, hora_inicio, hora_fin } = req.body;
    const PLAN_COMIDAS = await pool.query('SELECT * FROM solicita_comidas WHERE NOT id = $1 AND id_empleado = $2 ' +
      'AND fec_comida = $3 AND ($4 BETWEEN hora_inicio AND hora_fin OR $5 BETWEEN hora_inicio AND hora_fin)',
      [id, id_empleado, fecha, hora_inicio, hora_fin]);
    if (PLAN_COMIDAS.rowCount > 0) {
      return res.jsonp(PLAN_COMIDAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }







  public async EncontrarSolicitaComidaIdEmpleado(req: Request, res: Response): Promise<any> {
    const { id_empleado } = req.params;
    const PLAN_COMIDAS = await pool.query('SELECT sc.verificar, sc.aprobada, sc.id, sc.id_empleado, sc.fecha, sc.observacion, ' +
      'sc.fec_comida, sc.hora_inicio, sc.hora_fin, ' +
      'ctc.id AS id_menu, ctc.nombre AS nombre_menu, tc.id AS id_servicio, tc.nombre AS nombre_servicio, ' +
      'dm.id AS id_detalle, dm.valor, dm.nombre AS nombre_plato, dm.observacion AS observa_menu, sc.extra ' +
      'FROM solicita_comidas AS sc, cg_tipo_comidas AS ctc, tipo_comida AS tc, detalle_menu AS dm ' +
      'WHERE sc.id_empleado = $1 AND ctc.tipo_comida = tc.id AND ' +
      'ctc.id = dm.id_menu AND sc.id_comida = dm.id ORDER BY sc.fec_comida DESC', [id_empleado]);
    if (PLAN_COMIDAS.rowCount > 0) {
      return res.jsonp(PLAN_COMIDAS.rows)
    }
    res.status(404).jsonp({ text: 'Registro no encontrado' });
  }


  // CONSULTA PARA BUSCAR JEFES DE DEPARTAMENTOS 
  public async BuscarJefes(req: Request, res: Response): Promise<any> {
    const { id_departamento } = req.params;

    const JefesDepartamentos = await pool.query('SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, ' +
      'cg.nivel, s.id AS id_suc, cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ' +
      'ecn.id AS contrato, e.id AS empleado, e.nombre, e.apellido, e.cedula, e.correo, c.comida_mail, ' +
      'c.comida_noti ' +
      'FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, sucursales AS s, ' +
      'empl_contratos AS ecn, empleados AS e, config_noti AS c ' +
      'WHERE da.id_departamento = $1 AND da.estado = true AND da.id_empl_cargo = ecr.id AND ' +
      'da.id_departamento = cg.id AND cg.id_sucursal = s.id AND ' +
      'ecr.id_empl_contrato = ecn.id AND ecn.id_empleado = e.id AND e.id = c.id_empleado', [id_departamento])
      .then((result: any) => {
        return result.rows
      })

    if (JefesDepartamentos.length === 0) return res.jsonp({ message: 'Departamento sin nadie a cargo' });

    let depa_padre = JefesDepartamentos[0].depa_padre;
    let JefeDepaPadre;

    if (depa_padre !== null) {
      do {
        JefeDepaPadre = await pool.query('SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, cg.nivel, ' +
          's.id AS id_suc, cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato, ' +
          'e.id AS empleado, e.nombre, e.apellido, e.cedula, e.correo, c.comida_mail, c.comida_noti  ' +
          'FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, sucursales AS s, ' +
          'empl_contratos AS ecn, empleados AS e, config_noti AS c WHERE da.id_departamento = $1 AND ' +
          'da.id_empl_cargo = ecr.id AND da.id_departamento = cg.id AND cg.id_sucursal = s.id AND ' +
          'ecr.id_empl_contrato = ecn.id AND ecn.id_empleado = e.id AND e.id = c.id_empleado', [depa_padre])
          .then((result: any) => {
            return result.rows
          });
        if (JefeDepaPadre.length === 0) {
          depa_padre = null;
        } else {
          depa_padre = JefeDepaPadre[0].depa_padre;
          JefesDepartamentos.push(JefeDepaPadre[0]);
        }
      } while (depa_padre !== null);
      return res.jsonp(JefesDepartamentos);
    } else {
      return res.jsonp(JefesDepartamentos);
    }
  }








  // CONSULTA PARA BUSCAR TODAS LAS PLANIFICACIONES DE COMIDAS
  public async ListarPlanComidas(req: Request, res: Response) {
    const PLAN_COMIDAS = await pool.query('SELECT pc.id, pc.fecha, pc.observacion, pc.fec_inicio, ' +
      'pc.fec_final, pc.hora_inicio, pc.hora_fin, ctc.id AS id_menu, ctc.nombre AS nombre_menu, ' +
      'tc.id AS id_servicio, tc.nombre AS nombre_servicio, dm.id AS id_detalle, dm.valor, ' +
      'dm.nombre AS nombre_plato, dm.observacion AS observa_menu, pc.extra ' +
      'FROM plan_comidas AS pc, cg_tipo_comidas AS ctc, tipo_comida AS tc, detalle_menu AS dm ' +
      'WHERE ctc.tipo_comida = tc.id AND ctc.id = dm.id_menu AND pc.id_comida = dm.id ORDER BY pc.fec_inicio DESC');
    if (PLAN_COMIDAS.rowCount > 0) {
      return res.jsonp(PLAN_COMIDAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }


  // CONSULTA PARA CREAR UNA PLANIFICACIÓN
  public async CrearPlanComidas(req: Request, res: Response): Promise<Response> {
    try {
      const { fecha, id_comida, observacion, fec_comida, hora_inicio, hora_fin,
        extra, fec_inicio, fec_final } = req.body;

      const response: QueryResult = await pool.query(
        `
        INSERT INTO plan_comidas (fecha, id_comida, observacion, fec_comida, hora_inicio, hora_fin, extra, 
          fec_inicio, fec_final) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
        `,
        [fecha, id_comida, observacion, fec_comida, hora_inicio, hora_fin, extra, fec_inicio, fec_final]);

      const [planAlimentacion] = response.rows;

      if (!planAlimentacion) {
        return res.status(404).jsonp({ message: 'error' })
      }
      else {
        return res.status(200).jsonp({ message: 'ok', info: planAlimentacion });
      }

    } catch (error) {
      return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
  }





  public async ObtenerUltimaPlanificacion(req: Request, res: Response) {
    const PLAN_COMIDAS = await pool.query('SELECT MAX(id) AS ultimo FROM plan_comidas');
    if (PLAN_COMIDAS.rowCount > 0) {
      return res.jsonp(PLAN_COMIDAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  public async ActualizarPlanComidas(req: Request, res: Response): Promise<void> {
    const {
      fecha, id_comida, observacion, fec_comida, hora_inicio, hora_fin,
      extra, id
    } = req.body;
    await pool.query('UPDATE plan_comidas SET id_empleado = $1, fecha = $2, id_comida = $3, ' +
      'observacion = $4, fec_comida = $5, hora_inicio = $6, hora_fin = $7, extra = $8 ' +
      'WHERE id = $9',
      [fecha, id_comida, observacion, fec_comida, hora_inicio, hora_fin, extra, id]);
    res.jsonp({ message: 'Planificación del almuerzo ha sido guardado con éxito' });
  }

  public async EncontrarPlanComidaEmpleadoConsumido(req: Request, res: Response): Promise<any> {
    const { id_plan_comida, id_empleado } = req.body;
    const PLAN_COMIDAS = await pool.query('SELECT * FROM plan_comida_empleado WHERE id_plan_comida = $1 AND ' +
      'consumido = true AND id_empleado = $2', [id_plan_comida, id_empleado]);
    if (PLAN_COMIDAS.rowCount > 0) {
      return res.jsonp(PLAN_COMIDAS.rows)
    }
    res.status(404).jsonp({ text: 'Registro no encontrado' });
  }

  // BUSQUEDA DE PLANIFICACIONES POR EMPLEADO Y FECHA 
  public async BuscarPlanComidaEmpleadoFechas(req: Request, res: Response) {
    const { id, fecha_inicio, fecha_fin, hora_inicio, hora_fin } = req.body;
    const PLAN_COMIDAS = await pool.query('SELECT * FROM plan_comida_empleado WHERE id_empleado = $1 AND ' +
      'fecha BETWEEN $2 AND $3', [id, fecha_inicio, fecha_fin]);
    if (PLAN_COMIDAS.rowCount > 0) {
      return res.jsonp(PLAN_COMIDAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  // CONSULTA PARA BUSCAR DATOS DE EMPLEADO Y FECHAS DE PLANIFICACIÓN SIN INCLUIR LA QUE SERA ACTUALIZADA
  public async ActualizarPlanComidaEmpleadoFechas(req: Request, res: Response) {
    const { id, fecha_inicio, fecha_fin, id_plan_comida } = req.body;
    const PLAN_COMIDAS = await pool.query('SELECT * FROM plan_comida_empleado WHERE NOT id_plan_comida = $4 AND ' +
      'id_empleado = $1 AND fecha BETWEEN $2 AND $3', [id, fecha_inicio, fecha_fin, id_plan_comida]);
    if (PLAN_COMIDAS.rowCount > 0) {
      return res.jsonp(PLAN_COMIDAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  // CONSULTA PARA BUSCAR DATOS DE EMPLEADO Y FECHAS DE PLANIFICACIÓN-SOLICITUD SIN INCLUIR LA QUE SERA ACTUALIZADA
  public async ActualizarSolComidaEmpleadoFechas(req: Request, res: Response) {
    const { id, fecha_inicio, fecha_fin, id_sol_comida } = req.body;
    const PLAN_COMIDAS = await pool.query('SELECT * FROM plan_comida_empleado WHERE NOT id_sol_comida = $4 AND ' +
      'id_empleado = $1 AND fecha BETWEEN $2 AND $3', [id, fecha_inicio, fecha_fin, id_sol_comida]);
    if (PLAN_COMIDAS.rowCount > 0) {
      return res.jsonp(PLAN_COMIDAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }


  /** TABLA TIPO COMIDAS */
  public async ListarTipoComidas(req: Request, res: Response) {
    const PLAN_COMIDAS = await pool.query('SELECT * FROM tipo_comida');
    if (PLAN_COMIDAS.rowCount > 0) {
      return res.jsonp(PLAN_COMIDAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  public async CrearTipoComidas(req: Request, res: Response) {
    const { nombre } = req.body;
    const response: QueryResult = await pool.query('INSERT INTO tipo_comida (nombre) VALUES ($1) RETURNING *',
      [nombre]);
    const [tipo] = response.rows;

    if (tipo) {
      return res.status(200).jsonp(tipo);
    } else {
      return res.status(404).jsonp({ message: "error" });
    };
  }

  public async VerUltimoTipoComidas(req: Request, res: Response) {
    const PLAN_COMIDAS = await pool.query('SELECT MAX(id) FROM tipo_comida');
    if (PLAN_COMIDAS.rowCount > 0) {
      return res.jsonp(PLAN_COMIDAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  /** **************************************************************************************************** **
   ** **                          METODOS DE CREACIÓN DE SOLICITUD DE COMIDAS                           ** ** 
   ** **************************************************************************************************** **/

  // CONSULTA PARA REGISTRAR DATOS DE SOLICITUD DE COMIDA
  public async CrearSolicitaComida(req: Request, res: Response): Promise<Response> {

    try {
      const { id_empleado, fecha, id_comida, observacion, fec_comida, hora_inicio, hora_fin,
        extra, verificar, id_departamento } = req.body;

      const response: QueryResult = await pool.query('INSERT INTO solicita_comidas (id_empleado, fecha, id_comida, observacion, fec_comida, ' +
        'hora_inicio, hora_fin, extra, verificar) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [id_empleado, fecha, id_comida, observacion, fec_comida, hora_inicio, hora_fin, extra, verificar]);
      const [objetoAlimento] = response.rows;

      if (!objetoAlimento) return res.status(404).jsonp({ message: 'Solicitud no registrada.' })

      const alimento = objetoAlimento;

      const JefesDepartamentos = await pool.query(
        `
        SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, cg.nivel, s.id AS id_suc, 
        cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato, 
        e.id AS empleado, (e.nombre || ' ' || e.apellido) as fullname , e.cedula, e.correo, 
        c.comida_mail, c.comida_noti 
        FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, 
        sucursales AS s, empl_contratos AS ecn,empleados AS e, config_noti AS c 
        WHERE da.id_departamento = $1 AND 
        da.id_empl_cargo = ecr.id AND 
        da.id_departamento = cg.id AND 
        da.estado = true AND 
        cg.id_sucursal = s.id AND 
        ecr.id_empl_contrato = ecn.id AND 
        ecn.id_empleado = e.id AND 
        e.id = c.id_empleado
        `
        , [id_departamento]).then((result: any) => { return result.rows });
      console.log(JefesDepartamentos);

      if (JefesDepartamentos.length === 0) return res.status(400)
        .jsonp({ message: 'Ups !!! algo salio mal. Solicitud ingresada, pero es necesario verificar configuraciones jefes de departamento.' });

      const [obj] = JefesDepartamentos;
      let depa_padre = obj.depa_padre;
      let JefeDepaPadre;

      if (depa_padre !== null) {
        do {
          JefeDepaPadre = await pool.query(
            `
            SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, 
            cg.nivel, s.id AS id_suc, cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, 
            ecn.id AS contrato, e.id AS empleado, (e.nombre || ' ' || e.apellido) as fullname, e.cedula, 
            e.correo, c.comida_mail, 
            c.comida_noti FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, 
            sucursales AS s, empl_contratos AS ecn,empleados AS e, config_noti AS c 
            WHERE da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND da.id_departamento = cg.id AND 
            da.estado = true AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND 
            ecn.id_empleado = e.id AND e.id = c.id_empleado
            `
            , [depa_padre])
          depa_padre = JefeDepaPadre.rows[0].depa_padre;
          JefesDepartamentos.push(JefeDepaPadre.rows[0]);
        } while (depa_padre !== null);
        alimento.EmpleadosSendNotiEmail = JefesDepartamentos
        return res.status(200).jsonp(alimento);
      } else {
        alimento.EmpleadosSendNotiEmail = JefesDepartamentos
        return res.status(200).jsonp(alimento);
      }

    } catch (error) {
      console.log(error);
      return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
  }

  // METODO DE ACTUALIZACIÓN DE SERVICIO DE ALIMENTACION
  public async ActualizarSolicitaComida(req: Request, res: Response): Promise<Response> {

    const { id_empleado, fecha, id_comida, observacion, fec_comida, hora_inicio, hora_fin,
      extra, id, id_departamento } = req.body;

    const response: QueryResult = await pool.query(
      `
      UPDATE solicita_comidas SET id_empleado = $1, fecha = $2, id_comida = $3, 
      observacion = $4, fec_comida = $5, hora_inicio = $6, hora_fin = $7, extra = $8 
      WHERE id = $9 RETURNING *
      `
      , [id_empleado, fecha, id_comida, observacion, fec_comida, hora_inicio, hora_fin, extra, id]);

    const [objetoAlimento] = response.rows;

    if (!objetoAlimento) return res.status(404).jsonp({ message: 'Solicitud no registrada.' })

    const alimento = objetoAlimento;

    const JefesDepartamentos = await pool.query(
      `
        SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, cg.nivel, s.id AS id_suc, 
        cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato, 
        e.id AS empleado, (e.nombre || ' ' || e.apellido) as fullname , e.cedula, e.correo, 
        c.comida_mail, c.comida_noti 
        FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, 
        sucursales AS s, empl_contratos AS ecn,empleados AS e, config_noti AS c 
        WHERE da.id_departamento = $1 AND 
        da.id_empl_cargo = ecr.id AND 
        da.id_departamento = cg.id AND 
        da.estado = true AND 
        cg.id_sucursal = s.id AND 
        ecr.id_empl_contrato = ecn.id AND 
        ecn.id_empleado = e.id AND 
        e.id = c.id_empleado
        `
      , [id_departamento]).then((result: any) => { return result.rows });
    console.log(JefesDepartamentos);

    if (JefesDepartamentos.length === 0) return res.status(400)
      .jsonp({ message: 'Ups !!! algo salio mal. Solicitud ingresada, pero es necesario verificar configuraciones jefes de departamento.' });

    const [obj] = JefesDepartamentos;
    let depa_padre = obj.depa_padre;
    let JefeDepaPadre;

    if (depa_padre !== null) {
      do {
        JefeDepaPadre = await pool.query(
          `
            SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, 
            cg.nivel, s.id AS id_suc, cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, 
            ecn.id AS contrato, e.id AS empleado, (e.nombre || ' ' || e.apellido) as fullname, e.cedula, 
            e.correo, c.comida_mail, 
            c.comida_noti FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, 
            sucursales AS s, empl_contratos AS ecn,empleados AS e, config_noti AS c 
            WHERE da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND da.id_departamento = cg.id AND 
            da.estado = true AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND 
            ecn.id_empleado = e.id AND e.id = c.id_empleado
            `
          , [depa_padre])
        depa_padre = JefeDepaPadre.rows[0].depa_padre;
        JefesDepartamentos.push(JefeDepaPadre.rows[0]);

      } while (depa_padre !== null);
      alimento.EmpleadosSendNotiEmail = JefesDepartamentos
      return res.status(200).jsonp(alimento);

    } else {
      alimento.EmpleadosSendNotiEmail = JefesDepartamentos
      return res.status(200).jsonp(alimento);
    }
  }

  // ELIMINAR REGISTRO DE SOLIICTUD DE COMIDA
  public async EliminarSolicitudComida(req: Request, res: Response): Promise<Response> {

    const id = req.params.id;

    const response: QueryResult = await pool.query(
      `
      DELETE FROM solicita_comidas WHERE id = $1 RETURNING *
      `, [id]);

    const [alimentacion] = response.rows;

    if (alimentacion) {
      return res.status(200).jsonp(alimentacion)
    }
    else {
      return res.status(404).jsonp({ message: 'Solicitud no eliminada.' })
    }

  }

  // METODO PARA ACTUALIZAR ESTADO DE SOLICITUD DE ALIMENTACION
  public async AprobarSolicitaComida(req: Request, res: Response): Promise<Response> {

    const { aprobada, verificar, id } = req.body;

    const response: QueryResult = await pool.query(
      `
      UPDATE solicita_comidas SET aprobada = $1, verificar = $2 WHERE id = $3 RETURNING *
      `
      , [aprobada, verificar, id]);

    const [objetoAlimento] = response.rows;

    if (objetoAlimento) {
      return res.status(200).jsonp(objetoAlimento)
    }
    else {
      return res.status(404).jsonp({ message: 'error' })
    }

  }

  //  CREAR REGISTRO DE ALIMENTOS APROBADOS POR EMPLEADO
  public async CrearComidaAprobada(req: Request, res: Response): Promise<Response> {

    const { codigo, id_empleado, id_sol_comida, fecha, hora_inicio, hora_fin, consumido } = req.body;

    const response: QueryResult = await pool.query(
      `
      INSERT INTO plan_comida_empleado (codigo, id_empleado, id_sol_comida, fecha,
      hora_inicio, hora_fin, consumido ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
      `
      , [codigo, id_empleado, id_sol_comida, fecha, hora_inicio, hora_fin, consumido]);

    const [objetoAlimento] = response.rows;

    if (objetoAlimento) {
      return res.status(200).jsonp(objetoAlimento)
    }
    else {
      return res.status(404).jsonp({ message: 'error' })
    }
  }

  // ELIMINAR ALIMENTACION APROBADA
  public async EliminarComidaAprobada(req: Request, res: Response): Promise<Response> {

    const id = req.params.id;
    const fecha = req.params.fecha;
    const id_empleado = req.params.id_empleado;
    const response: QueryResult = await pool.query(
      `
      DELETE FROM plan_comida_empleado WHERE id_sol_comida = $1 AND fecha = $2 AND id_empleado = $3
      RETURNING *
      `
      , [id, fecha, id_empleado]);

    const [objetoAlimento] = response.rows;

    if (objetoAlimento) {
      return res.status(200).jsonp(objetoAlimento)
    }
    else {
      return res.status(404).jsonp({ message: 'error' })
    }
  }

  // ELIMINAR REGISTRO DE ALIMENTACION
  public async EliminarRegistros(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    await pool.query(
      `
      DELETE FROM plan_comidas WHERE id = $1
      `
      , [id]);
    res.jsonp({ message: 'Registro eliminado.' });
  }

  // ELIMINAR PLANIFICACION DE UN USUARIO ESPECIFICO
  public async EliminarPlanComidaEmpleado(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    const id_empleado = req.params.id_empleado;
    await pool.query(
      `
      DELETE FROM plan_comida_empleado WHERE id_plan_comida = $1 AND id_empleado = $2
      `
      , [id, id_empleado]);

    res.jsonp({ message: 'Registro eliminado.' });
  }

  // BUSQUEDA DE PLANIFICCAIONES DE ALIMENTACION POR ID DE PLANIFICACION
  public async EncontrarPlanComidaIdPlan(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const PLAN_COMIDAS = await pool.query(
      `
      SELECT DISTINCT pc.id, pce.id_empleado, pc.fecha, pc.observacion, 
      pc.fec_inicio, pc.fec_final, pc.hora_inicio, pc.hora_fin, (e.nombre || ' ' || e.apellido) AS nombre,
      e.codigo, e.cedula, e.correo,
      ctc.id AS id_menu, ctc.nombre AS nombre_menu, tc.id AS id_servicio, tc.nombre AS nombre_servicio, 
      dm.id AS id_detalle, dm.valor, dm.nombre AS nombre_plato, dm.observacion AS observa_menu, pc.extra 
      FROM plan_comidas AS pc, plan_comida_empleado AS pce, cg_tipo_comidas AS ctc, tipo_comida AS tc, 
      detalle_menu AS dm, empleados AS e 
      WHERE pc.id = $1 AND ctc.tipo_comida = tc.id AND 
      ctc.id = dm.id_menu AND pc.id_comida = dm.id AND pc.id = pce.id_plan_comida AND e.id = pce.id_empleado 
      ORDER BY pc.fec_inicio DESC
      `
      , [id]);
    if (PLAN_COMIDAS.rowCount > 0) {
      return res.jsonp(PLAN_COMIDAS.rows)
    }
    res.status(404).jsonp({ text: 'Registro no encontrado' });
  }

  // CREAR PLANIFICACIÓN POR EMPLEADO
  public async CrearPlanEmpleado(req: Request, res: Response): Promise<void> {

    const { codigo, id_empleado, id_plan_comida, fecha, hora_inicio, hora_fin, consumido } = req.body;

    await pool.query(
      `
        INSERT INTO plan_comida_empleado (codigo, id_empleado, id_plan_comida, fecha, 
        hora_inicio, hora_fin, consumido ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `
      , [codigo, id_empleado, id_plan_comida, fecha, hora_inicio, hora_fin, consumido]);
    res.jsonp({ message: 'Planificación del almuerzo ha sido guardada con éxito' });
  }

  // METODO PARA BUSCAR DATOS DE PLANIFICACIÓN DE ALIMENTACIÓN POR ID DE USUARIO
  public async EncontrarPlanComidaIdEmpleado(req: Request, res: Response): Promise<any> {
    const { id_empleado } = req.params;
    const PLAN_COMIDAS = await pool.query(
      `
      SELECT DISTINCT pc.id, pce.id_empleado, pc.fecha, pc.observacion, pc.fec_inicio, pc.fec_final, 
        pc.hora_inicio, pc.hora_fin, ctc.id AS id_menu, ctc.nombre AS nombre_menu, tc.id AS id_servicio, 
        tc.nombre AS nombre_servicio, dm.id AS id_detalle, dm.valor, dm.nombre AS nombre_plato, 
        dm.observacion AS observa_menu, pc.extra, e.codigo, e.cedula, e.correo, 
        (e.nombre || ' ' || e.apellido) AS nombre
      FROM plan_comidas AS pc, plan_comida_empleado AS pce, cg_tipo_comidas AS ctc, tipo_comida AS tc, 
        detalle_menu AS dm, empleados AS e 
	    WHERE pce.id_empleado = $1 AND ctc.tipo_comida = tc.id AND 
        ctc.id = dm.id_menu AND pc.id_comida = dm.id AND pc.id = pce.id_plan_comida AND
	      e.id = pce.id_empleado
	    ORDER BY pc.fec_inicio DESC
      `
      , [id_empleado]);
    if (PLAN_COMIDAS.rowCount > 0) {
      return res.jsonp(PLAN_COMIDAS.rows)
    }
    res.status(404).jsonp({ text: 'Registro no encontrado' });
  }

  /** ********************************************************************************************** **
   ** *              ENVIO DE NOTIFICACIONES DE SERVICIOS DE ALIMENTACIÓN                          * **
   ** ********************************************************************************************** **/

  // NOTIFICACIONES DE SOLICITUDES Y PLANIFICACIÓN DE SERVICIO DE ALIMENTACIÓN
  public async EnviarNotificacionComidas(req: Request, res: Response): Promise<Response> {
    let { id_empl_envia, id_empl_recive, mensaje, tipo, id_comida } = req.body;
    var tiempo = fechaHora();
    let create_at = tiempo.fecha_formato + ' ' + tiempo.hora;
    const SERVICIO_SOLICITADO = await pool.query(
      `
        SELECT tc.nombre AS servicio, ctc.nombre AS menu, ctc.hora_inicio, ctc.hora_fin, 
          dm.nombre AS comida, dm.valor, dm.observacion 
        FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm 
        WHERE tc.id = ctc.tipo_comida AND ctc.id = dm.id_menu AND dm.id = $1
      `,
      [id_comida]);

    let notifica = mensaje + SERVICIO_SOLICITADO.rows[0].servicio;

    const response: QueryResult = await pool.query(
      `
      INSERT INTO realtime_timbres(create_at, id_send_empl, id_receives_empl, descripcion, tipo) 
      VALUES($1, $2, $3, $4, $5) RETURNING *
      `,
      [create_at, id_empl_envia, id_empl_recive, notifica, tipo]);

    const [notificiacion] = response.rows;

    if (!notificiacion) return res.status(400).jsonp({ message: 'Notificación no ingresada.' });

    const USUARIO = await pool.query(
      `
      SELECT (nombre || ' ' || apellido) AS usuario
      FROM empleados WHERE id = $1
      `,
      [id_empl_envia]);

    notificiacion.usuario = USUARIO.rows[0].usuario;

    return res.status(200)
      .jsonp({ message: 'Se ha enviado la respectiva notificación.', respuesta: notificiacion });

  }

  // METODO PARA CREAR ARCHIVO XML
  public async FileXML(req: Request, res: Response): Promise<any> {
    var xml = builder.create('root').ele(req.body).end({ pretty: true });
    console.log(req.body.userName);
    let filename = "PlanComidas-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() + '.xml';
    fs.writeFile(`xmlDownload/${filename}`, xml, function (err) {
    });
    res.jsonp({ text: 'XML creado', name: filename });
  }

  // METODO PARA DESCARGAR ARCHIVO XML
  public async downloadXML(req: Request, res: Response): Promise<any> {
    const name = req.params.nameXML;
    let filePath = `servidor\\xmlDownload\\${name}`
    res.sendFile(__dirname.split("servidor")[0] + filePath);
  }



  /** ******************************************************************************************** **
   ** *            METODO ENVÍO DE CORREO ELECTRÓNICO DE SOLICITUDES DE ALIMENTACIÓN             * **
   ** ******************************************************************************************** **/

  // ENVIAR CORRE ELECTRÓNICO INDICANDO QUE SE HA REALIZADO UNA SOLICITUD DE COMIDA MEDIANTE APP WEB
  public async EnviarCorreoComidas(req: Request, res: Response): Promise<void> {

    var tiempo = fechaHora();
    var fecha = await FormatearFecha(tiempo.fecha_formato, dia_completo);
    var hora = await FormatearHora(tiempo.hora);

    const path_folder = path.resolve('logos');

    var datos = await Credenciales(req.id_empresa);

    if (datos === 'ok') {

      const { id_usua_solicita, correo, fec_solicitud, id_comida, inicio, final, observacion,
        extra, solicitado_por, asunto, tipo_solicitud, proceso, estadoc } = req.body;

      var tipo_servicio = 'Extra';
      if (extra === false) {
        tipo_servicio = 'Normal';
      }

      const EMPLEADO_SOLICITA = await pool.query(
        `
          SELECT e.correo, e.nombre, e.apellido, e.cedula, ecr.id_departamento, ecr.id_sucursal, 
            ecr.id AS cargo, tc.cargo AS tipo_cargo, d.nombre AS departamento 
          FROM empleados AS e, empl_cargos AS ecr, tipo_cargo AS tc, cg_departamentos AS d 
          WHERE (SELECT MAX(cargo_id) AS cargo FROM datos_empleado_cargo WHERE empl_id = e.id) = ecr.id 
          AND tc.id = ecr.cargo AND d.id = ecr.id_departamento AND e.id = $1 ORDER BY cargo DESC
        `,
        [id_usua_solicita]);

      const SERVICIO_SOLICITADO = await pool.query(
        `
          SELECT tc.nombre AS servicio, ctc.nombre AS menu, ctc.hora_inicio, ctc.hora_fin, 
            dm.nombre AS comida, dm.valor, dm.observacion 
          FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm 
          WHERE tc.id = ctc.tipo_comida AND ctc.id = dm.id_menu AND dm.id = $1
        `,
        [id_comida]);

      console.log(EMPLEADO_SOLICITA.rows);

      var url = `${process.env.URL_DOMAIN}/listaSolicitaComida`;

      let data = {
        to: correo,
        from: email,
        subject: asunto,
        html: `
                   <body>
                       <div style="text-align: center;">
                           <img width="25%" height="25%" src="cid:cabeceraf"/>
                       </div>
                       <br>
                       <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                           El presente correo es para informar que se ha ${proceso} la siguiente solicitud de servicio de alimentación: <br>  
                       </p>
                       <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
                       <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                           <b>Empresa:</b> ${nombre} <br>   
                           <b>Asunto:</b> ${asunto} <br> 
                           <b>Colaborador que envía:</b> ${EMPLEADO_SOLICITA.rows[0].nombre} ${EMPLEADO_SOLICITA.rows[0].apellido} <br>
                           <b>Número de Cédula:</b> ${EMPLEADO_SOLICITA.rows[0].cedula} <br>
                           <b>Cargo:</b> ${EMPLEADO_SOLICITA.rows[0].tipo_cargo} <br>
                           <b>Departamento:</b> ${EMPLEADO_SOLICITA.rows[0].departamento} <br>
                           <b>Generado mediante:</b> Aplicación Web <br>
                           <b>Fecha de envío:</b> ${fecha} <br> 
                           <b>Hora de envío:</b> ${hora} <br><br> 
                       </p>
                       <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
                       <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                           <b>Motivo:</b> ${observacion} <br>   
                           <b>Fecha de Solicitud:</b> ${fec_solicitud} <br> 
                           <b>Servicio:</b> ${SERVICIO_SOLICITADO.rows[0].servicio} <br>
                           <b>Menú:</b> ${SERVICIO_SOLICITADO.rows[0].menu} - ${SERVICIO_SOLICITADO.rows[0].comida} <br>
                           <b>Detalle del servicio:</b> ${SERVICIO_SOLICITADO.rows[0].observacion} <br>
                           <b>Servicio desde:</b> ${inicio} <br>
                           <b>Servicio hasta:</b> ${final} <br>
                           <b>Tipo de servicio:</b> ${tipo_servicio} <br>
                           <b>Estado:</b> ${estadoc} <br><br>
                           <b>${tipo_solicitud}:</b> ${solicitado_por} <br><br>
                           <a href="${url}">Dar clic en el siguiente enlace para revisar solicitud de servicio de alimentación.</a> <br><br>
                       </p>
                       <p style="font-family: Arial; font-size:12px; line-height: 1em;">
                           <b>Gracias por la atención</b><br>
                           <b>Saludos cordiales,</b> <br><br>
                       </p>
                       <img src="cid:pief" width="50%" height="50%"/>
                    </body>
                `,
        attachments: [
          {
            filename: 'cabecera_firma.jpg',
            path: `${path_folder}/${cabecera_firma}`,
            cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
          },
          {
            filename: 'pie_firma.jpg',
            path: `${path_folder}/${pie_firma}`,
            cid: 'pief' //COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
          }]
      };

      var corr = enviarMail(servidor, parseInt(puerto));
      corr.sendMail(data, function (error: any, info: any) {
        if (error) {
          corr.close();
          console.log('Email error: ' + error);
          return res.jsonp({ message: 'error' });
        } else {
          corr.close();
          console.log('Email sent: ' + info.response);
          return res.jsonp({ message: 'ok' });
        }
      });

    }
    else {
      res.jsonp({ message: 'Ups !!! algo salio mal. No fue posible enviar correo electrónico.' });
    }
  }

  // METODO DE ENVIO DE CORREO ELECTRÓNICO MEDIANTE APLICACIÓN MÓVIL
  public async EnviarCorreoComidasMovil(req: Request, res: Response): Promise<void> {

    var tiempo = fechaHora();
    var fecha = await FormatearFecha(tiempo.fecha_formato, dia_completo);
    var hora = await FormatearHora(tiempo.hora);

    const path_folder = path.resolve('logos');

    var datos = await Credenciales(parseInt(req.params.id_empresa));

    if (datos === 'ok') {

      const { id_usua_solicita, correo, fec_solicitud, id_comida, inicio, final, observacion,
        extra, solicitado_por, asunto, tipo_solicitud, proceso, estadoc } = req.body;

      var tipo_servicio = 'Extra';
      if (extra === false) {
        tipo_servicio = 'Normal';
      }

      const EMPLEADO_SOLICITA = await pool.query(
        `
          SELECT e.correo, e.nombre, e.apellido, e.cedula, ecr.id_departamento, ecr.id_sucursal, 
            ecr.id AS cargo, tc.cargo AS tipo_cargo, d.nombre AS departamento 
          FROM empleados AS e, empl_cargos AS ecr, tipo_cargo AS tc, cg_departamentos AS d
          WHERE (SELECT MAX(cargo_id) AS cargo FROM datos_empleado_cargo WHERE empl_id = e.id) = ecr.id 
          AND tc.id = ecr.cargo AND d.id = ecr.id_departamento AND e.id = $1 ORDER BY cargo DESC
        `,
        [id_usua_solicita]);

      const SERVICIO_SOLICITADO = await pool.query(
        `
          SELECT tc.nombre AS servicio, ctc.nombre AS menu, ctc.hora_inicio, ctc.hora_fin, 
            dm.nombre AS comida, dm.valor, dm.observacion 
          FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm 
          WHERE tc.id = ctc.tipo_comida AND ctc.id = dm.id_menu AND dm.id = $1
        `,
        [id_comida]);

      console.log(EMPLEADO_SOLICITA.rows);

      let data = {
        to: correo,
        from: email,
        subject: asunto,
        html: `
                   <body>
                       <div style="text-align: center;">
                           <img width="25%" height="25%" src="cid:cabeceraf"/>
                       </div>
                       <br>
                       <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                           El presente correo es para informar que se ha ${proceso} la siguiente solicitud de servicio de alimentación: <br>  
                       </p>
                       <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
                       <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                           <b>Empresa:</b> ${nombre} <br>   
                           <b>Asunto:</b> ${asunto} <br> 
                           <b>Colaborador que envía:</b> ${EMPLEADO_SOLICITA.rows[0].nombre} ${EMPLEADO_SOLICITA.rows[0].apellido} <br>
                           <b>Número de Cédula:</b> ${EMPLEADO_SOLICITA.rows[0].cedula} <br>
                           <b>Cargo:</b> ${EMPLEADO_SOLICITA.rows[0].tipo_cargo} <br>
                           <b>Departamento:</b> ${EMPLEADO_SOLICITA.rows[0].departamento} <br>
                           <b>Generado mediante:</b> Aplicación Móvil <br>
                           <b>Fecha de envío:</b> ${fecha} <br> 
                           <b>Hora de envío:</b> ${hora} <br><br> 
                       </p>
                       <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
                       <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                           <b>Motivo:</b> ${observacion} <br>   
                           <b>Fecha de Solicitud:</b> ${fec_solicitud} <br> 
                           <b>Servicio:</b> ${SERVICIO_SOLICITADO.rows[0].servicio} <br>
                           <b>Menú:</b> ${SERVICIO_SOLICITADO.rows[0].menu} - ${SERVICIO_SOLICITADO.rows[0].comida} <br>
                           <b>Detalle del servicio:</b> ${SERVICIO_SOLICITADO.rows[0].observacion} <br>
                           <b>Servicio desde:</b> ${inicio} <br>
                           <b>Servicio hasta:</b> ${final} <br>
                           <b>Tipo de servicio:</b> ${tipo_servicio} <br>
                           <b>Estado:</b> ${estadoc} <br><br>
                           <b>${tipo_solicitud}:</b> ${solicitado_por} <br><br>
                       </p>
                       <p style="font-family: Arial; font-size:12px; line-height: 1em;">
                           <b>Gracias por la atención</b><br>
                           <b>Saludos cordiales,</b> <br><br>
                       </p>
                       <img src="cid:pief" width="50%" height="50%"/>
                    </body>
                `,
        attachments: [
          {
            filename: 'cabecera_firma.jpg',
            path: `${path_folder}/${cabecera_firma}`,
            cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
          },
          {
            filename: 'pie_firma.jpg',
            path: `${path_folder}/${pie_firma}`,
            cid: 'pief' //COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
          }]
      };

      var corr = enviarMail(servidor, parseInt(puerto));
      corr.sendMail(data, function (error: any, info: any) {
        if (error) {
          corr.close();
          console.log('Email error: ' + error);
          return res.jsonp({ message: 'error' });
        } else {
          corr.close();
          console.log('Email sent: ' + info.response);
          return res.jsonp({ message: 'ok' });
        }
      });

    }
    else {
      res.jsonp({ message: 'Ups !!! algo salio mal. No fue posible enviar correo electrónico.' });
    }
  }


  /** ************************************************************************************************ **
   ** **    METODOS DE ENVIO DE CORREO ELECTRONICO DE PLANIFICACION DE SERVICIOS DE ALIMENTACION    ** ** 
   ** ************************************************************************************************ **/

  // ENVIAR CORREO ELECTRÓNICO DE PLANIFICACIÓN DE COMIDA APLICACION WEB  -- verificar si se requiere estado
  public async EnviarCorreoPlanComidas(req: Request, res: Response): Promise<void> {

    var tiempo = fechaHora();
    var fecha = await FormatearFecha(tiempo.fecha_formato, dia_completo);
    var hora = await FormatearHora(tiempo.hora);

    const path_folder = path.resolve('logos');

    var datos = await Credenciales(req.id_empresa);

    if (datos === 'ok') {

      const { id_envia, desde, hasta, inicio, final, correo, id_comida, observacion,
        extra, nombres, asunto, tipo_solicitud, proceso } = req.body;

      console.log('data', req.body)

      var tipo_servicio = 'Extra';
      if (extra === false) {
        tipo_servicio = 'Normal';
      }

      const Envia = await pool.query(`
        SELECT da.nombre, da.apellido, da.cedula, da.correo, 
        (SELECT tc.cargo FROM tipo_cargo AS tc WHERE tc.id = ec.cargo) AS tipo_cargo,
        (SELECT cd.nombre FROM cg_departamentos AS cd WHERE cd.id = ec.id_departamento) AS departamento
        FROM datos_actuales_empleado AS da, empl_cargos AS ec
        WHERE da.id = $1 AND ec.id = da.id_cargo
      `,
        [id_envia]).then((resultado: any) => { return resultado.rows[0] });
      console.log('envia...', Envia)
      const SERVICIO_SOLICITADO = await pool.query(
        `
            SELECT tc.nombre AS servicio, ctc.nombre AS menu, ctc.hora_inicio, ctc.hora_fin, 
              dm.nombre AS comida, dm.valor, dm.observacion 
            FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm 
            WHERE tc.id = ctc.tipo_comida AND ctc.id = dm.id_menu AND dm.id = $1
          `,
        [id_comida]);

      let data = {
        to: correo,
        from: email,
        subject: asunto,
        html: `
                   <body>
                       <div style="text-align: center;">
                           <img width="25%" height="25%" src="cid:cabeceraf"/>
                       </div>
                       <br>
                       <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                           El presente correo es para informar que se ha ${proceso} la siguiente planificación de servicio de alimentación: <br>  
                       </p>
                       <h3 style="font-family: Arial; text-align: center;">DATOS DEL COLABORADOR QUE ${tipo_solicitud} PLANIFICACIÓN DE ALIMENTACIÓN</h3>
                       <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                           <b>Empresa:</b> ${nombre} <br>   
                           <b>Asunto:</b> ${asunto} <br> 
                           <b>Colaborador que envía:</b> ${Envia.nombre} ${Envia.apellido} <br>
                           <b>Número de Cédula:</b> ${Envia.cedula} <br>
                           <b>Cargo:</b> ${Envia.tipo_cargo} <br>
                           <b>Departamento:</b> ${Envia.departamento} <br>
                           <b>Generado mediante:</b> Aplicación Web <br>
                           <b>Fecha de envío:</b> ${fecha} <br> 
                           <b>Hora de envío:</b> ${hora} <br><br> 
                       </p>
                       <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA PLANIFICACIÓN</h3>
                       <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                           <b>Motivo:</b> ${observacion} <br>   
                           <b>Fecha de Planificación:</b> ${fecha} <br> 
                           <b>Desde:</b> ${desde} <br>
                           <b>Hasta:</b> ${hasta} <br>
                           <b>Horario:</b> ${inicio} a ${final} <br>
                           <b>Servicio:</b> ${SERVICIO_SOLICITADO.rows[0].servicio} <br>
                           <b>Menú:</b> ${SERVICIO_SOLICITADO.rows[0].menu} - ${SERVICIO_SOLICITADO.rows[0].comida} <br>
                           <b>Detalle del servicio:</b> ${SERVICIO_SOLICITADO.rows[0].observacion} <br>
                           <b>Servicio desde:</b> ${inicio} <br>
                           <b>Servicio hasta:</b> ${final} <br>
                           <b>Tipo de servicio:</b> ${tipo_servicio} <br><br>
                           <b>Colabores a los cuales se les ha ${proceso} una planificación de servicio de alimentación:</b>
                       </p>
                       <div style="text-align: center;"> 
                       <table border=2 cellpadding=10 cellspacing=0 style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px;">
                         <tr>
                           <th><h5>COLABORADOR</h5></th> 
                           <th><h5>CÉDULA</h5></th> 
                         </tr>            
                         ${nombres} 
                      </table>
                   </div>
                       <p style="font-family: Arial; font-size:12px; line-height: 1em;">
                           <b>Gracias por la atención</b><br>
                           <b>Saludos cordiales,</b> <br><br>
                       </p>
                       <img src="cid:pief" width="50%" height="50%"/>
                    </body>
                `,
        attachments: [
          {
            filename: 'cabecera_firma.jpg',
            path: `${path_folder}/${cabecera_firma}`,
            cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
          },
          {
            filename: 'pie_firma.jpg',
            path: `${path_folder}/${pie_firma}`,
            cid: 'pief' //COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
          }]
      };

      var corr = enviarMail(servidor, parseInt(puerto));
      corr.sendMail(data, function (error: any, info: any) {
        if (error) {
          corr.close();
          console.log('Email error: ' + error);
          return res.jsonp({ message: 'error' });
        } else {
          corr.close();
          console.log('Email sent: ' + info.response);
          return res.jsonp({ message: 'ok' });
        }
      });

    } else {
      res.jsonp({ message: 'Ups!!! algo salio mal. No fue posible enviar correo electrónico.' });
    }
  }

}

export const PLAN_COMIDAS_CONTROLADOR = new PlanComidasControlador();

export default PLAN_COMIDAS_CONTROLADOR;