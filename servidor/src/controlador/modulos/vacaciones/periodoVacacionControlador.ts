import AUDITORIA_CONTROLADOR from "../../reportes/auditoriaControlador";
import { Request, Response } from "express";
import { FormatearFecha2 } from "../../../libs/settingsMail";
import pool from "../../../database";
import { QueryResult } from "pg";

class PeriodoVacacionControlador {

  // METODO PARA CREAR PERIODO DE VACACIONES   **USADO
  public async CrearPerVacaciones(req: Request, res: Response) {
    try {
      const {
        observacion, fecha_inicio, fecha_final, fecha_carga, fecha_actualizacion, dias_vacacion,
        dias_usados_vacacion, dias_antiguedad, dias_usados_antiguedad, dias_perdido, fecha_perdida,
        id_empleado, estado, user_name, ip, ip_local, fecha_acreditar, transferido, dias_iniciales,
        dias_cargados, tomar_antiguedad, observacion_antiguedad
      } = req.body;

      // INICIAR TRANSACCION
      await pool.query("BEGIN");

      const datosNuevos = await pool.query(
        `
          INSERT INTO mv_periodo_vacacion (observacion, fecha_inicio, fecha_final, fecha_desde, fecha_ultima_actualizacion, 
            dias_vacacion, usados_dias_vacacion, dias_antiguedad, usados_antiguedad, dias_perdidos, 
            fecha_inicio_perdida, id_empleado, estado, fecha_acreditar_vacaciones, creado_manual, saldo_transferido,
            dias_iniciales, dias_cargados, tomar_antiguedad, observacion_antiguedad, anios_antiguedad)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) RETURNING *
        `,
        [observacion, fecha_inicio, fecha_final, fecha_carga, fecha_actualizacion, dias_vacacion,
          dias_usados_vacacion, dias_antiguedad, dias_usados_antiguedad, dias_perdido, fecha_perdida,
          id_empleado, estado, fecha_acreditar, true, transferido, dias_iniciales, dias_cargados,
          tomar_antiguedad, observacion_antiguedad, 0]
      );

      const [periodo] = datosNuevos.rows;
      const fechaInicioN = await FormatearFecha2(fecha_inicio, 'ddd');
      const fechaFinalN = await FormatearFecha2(fecha_final, 'ddd');

      periodo.fecha_inicio = fechaInicioN;
      periodo.fecha_final = fechaFinalN;


      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: "mv_periodo_vacacion",
        usuario: user_name,
        accion: "I",
        datosOriginales: "",
        datosNuevos: JSON.stringify(periodo),
        ip: ip,
        ip_local: ip_local,
        observacion: null,
      });

      // FINALIZAR TRANSACCION
      await pool.query("COMMIT");
      res.jsonp({ message: "Registro guardado." });
    } catch (error) {
      console.log('error periodo ', error)
      // REVERTIR TRANSACCION
      await pool.query("ROLLBACK");
      res.status(500).jsonp({ message: "Error al guardar período de vacación." });
    }
  }

  // METODO PARA ACTUALIZAR PERIODO DE VACACIONES    **USADO
  public async ActualizarPeriodo(req: Request, res: Response): Promise<Response> {
    try {
      const {
        observacion, fecha_inicio, fecha_final, fecha_carga, fecha_actualizacion, dias_vacacion,
        dias_usados_vacacion, dias_antiguedad, dias_usados_antiguedad, dias_perdido, fecha_perdida,
        estado, user_name, ip, ip_local, fecha_acreditar, transferido, dias_iniciales,
        dias_cargados, tomar_antiguedad, observacion_antiguedad, id
      } = req.body;

      // INICIAR TRANSACCION
      await pool.query("BEGIN");

      // CONSULTAR DATOS ORIGINALES
      const periodo = await pool.query(
        `SELECT * FROM mv_periodo_vacacion WHERE id = $1`,
        [id]
      );
      const [datosOriginales] = periodo.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: "mv_periodo_vacacion",
          usuario: user_name,
          accion: "U",
          datosOriginales: "",
          datosNuevos: "",
          ip: ip,
          ip_local: ip_local,
          observacion: `Error al actualizar período de vacaciones con id: ${id}`,
        });

        // FINALIZAR TRANSACCION
        await pool.query("COMMIT");
        return res.status(404).jsonp({ message: "Error al actualizar período de vacaciones." });
      }

      const periodoNuevo = await pool.query(
        `
        UPDATE mv_periodo_vacacion SET observacion = $1, fecha_inicio = $2, fecha_final = $3 ,
            fecha_desde = $4, fecha_ultima_actualizacion = $5, dias_vacacion = $6, usados_dias_vacacion = $7,
            dias_antiguedad = $8, usados_antiguedad = $9, dias_perdidos = $10, fecha_inicio_perdida = $11,
            estado = $12, fecha_acreditar_vacaciones = $13, saldo_transferido = $14, dias_iniciales = $15,
            dias_cargados = $16, tomar_antiguedad = $17, observacion_antiguedad = $18  
        WHERE id = $19 RETURNING *
        `
        ,
        [observacion, fecha_inicio, fecha_final, fecha_carga, fecha_actualizacion, dias_vacacion,
          dias_usados_vacacion, dias_antiguedad, dias_usados_antiguedad, dias_perdido, fecha_perdida,
          estado, fecha_acreditar, transferido, dias_iniciales, dias_cargados, tomar_antiguedad,
          observacion_antiguedad, id]
      );

      const [datosNuevos] = periodoNuevo.rows;
      const fechaInicioN = await FormatearFecha2(fecha_inicio, 'ddd');
      const fechaFinalN = await FormatearFecha2(fecha_final, 'ddd');
      const fechaInicioO = await FormatearFecha2(datosOriginales.fecha_inicio, 'ddd');
      const fechaFinalO = await FormatearFecha2(datosOriginales.fecha_final, 'ddd');

      datosOriginales.fecha_inicio = fechaInicioO;
      datosOriginales.fecha_final = fechaFinalO;
      datosNuevos.fecha_inicio = fechaInicioN;
      datosNuevos.fecha_final = fechaFinalN;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: "mv_periodo_vacacion",
        usuario: user_name,
        accion: "U",
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: JSON.stringify(datosNuevos),
        ip: ip,
        ip_local: ip_local,
        observacion: null,
      });

      // FINALIZAR TRANSACCION
      await pool.query("COMMIT");
      return res.jsonp({ message: "Registro Actualizado exitosamente" });
    } catch (error) {
      // REVERTIR TRANSACCION
      console.log('error ', error)
      await pool.query("ROLLBACK");
      return res.status(500).jsonp({ message: "Error al actualizar período de vacaciones." });
    }
  }

  // METODO PARA BUSCAR DATOS DE PERIODO DE VACACION    **USADO
  public async EncontrarPerVacaciones(req: Request, res: Response): Promise<any> {
    const { id_empleado } = req.params;
    const PERIODO_VACACIONES = await pool.query(
      `
        SELECT * FROM mv_periodo_vacacion AS p WHERE p.id_empleado = $1 ORDER BY id ASC
      `
      , [id_empleado]);
    if (PERIODO_VACACIONES.rowCount != 0) {
      return res.jsonp(PERIODO_VACACIONES.rows)
    }
    res.status(404).jsonp({ text: 'Registro no encontrado.' });
  }

  // METODO PARA BUSCAR ID DE PERIODO DE VACACIONES   **USADO
  public async EncontrarIdPerVacaciones(req: Request, res: Response): Promise<any> {

    const { id_empleado } = req.params;
    const VACACIONES = await pool.query(
      `
      SELECT pv.id
      FROM mv_periodo_vacacion AS pv
      WHERE pv.estado = true AND pv.id_empleado = $1;
      `
      , [id_empleado]);
    if (VACACIONES.rowCount != 0) {
      return res.jsonp(VACACIONES.rows)
    }
    res.status(404).jsonp({ text: 'Registro no encontrado' });
  }

  // METODO PARA CERRAR PERIODOS DE VACACIONES DE FORMA MANUAL   **USADO
  public async CerrarPeriodoVacaciones(req: Request, res: Response): Promise<any> {
    const { empleados, fecha } = req.body;

    console.log('ver datos cerrar ', req.body)

    try {
      const resultado = await pool.query(
        `
        SELECT public.fn_cierre_masivo_periodos($1, $2) AS resumen;
        `,
        [empleados, fecha]
      );

      res.status(200).json({ mensaje: resultado.rows });

    } catch (error: any) {
      console.error('Error al cerrar periodos:', error.message);

      res.status(500).json({
        error: 'Error',
        detalle: error.message
      });

    }
  }


  // METODO PARA GENERAR PERIODOS DESDE EL SISTEMA 
  public async GenerarPeriodoManual(req: Request, res: Response): Promise<any> {

    //console.log('ingresa ------ ', req.body)
    try {
      const { fecha_inicio, fecha_fin } = req.body;

      const response: QueryResult = await pool.query(
        `
          SELECT * FROM public.fn_generar_periodos_rango($1::DATE, $2::DATE)
        `
        , [fecha_inicio, fecha_fin]);

      const [periodo] = response.rows;

      if (periodo) {
        return res.status(200).jsonp({ message: 'Registro guardado.', status: 'OK', datos: periodo })
      } else {
        return res.status(404).jsonp({ message: 'No se pudo guardar', status: 'error', datos: periodo })
      }
    }
    catch (error) {
      console.log('error ', error)
      return res.status(500).jsonp({ message: 'error', status: 'error' });
    }
  }

  // METODO PARA CONSULTAR LISTA DE TIMBRES DEL USUARIO    **USADO     
  public async ReportePeriodosVacaciones(req: Request, res: Response) {
    let { estado } = req.params;
    let verificar_estado: boolean = false;
    if (estado === 'activo') {
      verificar_estado = true;
    }
    let datos: any[] = req.body;
    let n: Array<any> = await Promise.all(datos.map(async (obj: any) => {
      obj.empleados = await Promise.all(obj.empleados.map(async (o: any) => {
        if (estado === 'todos') {
          o.periodos = await BuscarPeriodos(o.id);
        }
        else {
          o.periodos = await BuscarPeriodosEstado(o.id, verificar_estado);
        }
        return o;
      }));
      return obj;
    }));
    let nuevo = n.map((e: any) => {
      e.empleados = e.empleados.filter((t: any) => { return t.periodos.length > 0 })
      return e
    }).filter(e => { return e.empleados.length > 0 })

    if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registros.' })

    return res.status(200).jsonp(nuevo)

  }


}

const PERIODO_VACACION_CONTROLADOR = new PeriodoVacacionControlador();

export default PERIODO_VACACION_CONTROLADOR;

// FUNCION DE BUSQUEDA DE PERIODOS DE VACACIONES     **USADO
const BuscarPeriodos = async function (id_empleado: string | number) {
  return await pool.query(
    `
      SELECT 
        mv.fecha_inicio, mv.fecha_final, mv.fecha_desde, mv.fecha_ultima_actualizacion, mv.fecha_acreditar_vacaciones,
        mv.dias_iniciales, mv.dias_cargados, mv.dias_antiguedad, mv.saldo_transferido,
        mv.dias_vacacion, mv.dias_perdidos, mv.usados_dias_vacacion, mv.usados_antiguedad,
        mv.observacion, mv.tomar_antiguedad, mv.observacion_antiguedad,
        mv.estado, mv.anios_antiguedad
      FROM 
        mv_periodo_vacacion AS mv
      WHERE
        mv.id_empleado = $1
    `
    , [id_empleado])
    .then(res => {
      return res.rows;
    })
}

// FUNCION DE BUSQUEDA DE PERIODOS DE VACACIONES DE ACUERDO AL ESTADO    **USADO
const BuscarPeriodosEstado = async function (id_empleado: string | number, estado: any) {
  return await pool.query(
    `
      SELECT 
        mv.fecha_inicio, mv.fecha_final, mv.fecha_desde, mv.fecha_ultima_actualizacion, mv.fecha_acreditar_vacaciones,
        mv.dias_iniciales, mv.dias_cargados, mv.dias_antiguedad, mv.saldo_transferido,
        mv.dias_vacacion, mv.dias_perdidos, mv.usados_dias_vacacion, mv.usados_antiguedad,
        mv.observacion, mv.tomar_antiguedad, mv.observacion_antiguedad,
        mv.estado, mv.anios_antiguedad
      FROM 
        mv_periodo_vacacion AS mv
      WHERE
        mv.id_empleado = $1 AND mv.estado = $2
    `
    , [id_empleado, estado])
    .then(res => {
      return res.rows;
    })
}
