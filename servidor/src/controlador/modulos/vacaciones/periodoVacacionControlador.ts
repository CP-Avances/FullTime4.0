import AUDITORIA_CONTROLADOR from "../../reportes/auditoriaControlador";
import { Request, Response } from "express";
import { FormatearFecha2 } from "../../../libs/settingsMail";
import pool from "../../../database";

class PeriodoVacacionControlador {

  // METODO PARA BUSCAR ID DE PERIODO DE VACACIONES   **USADO
  public async EncontrarIdPerVacaciones(req: Request, res: Response): Promise<any> {

    const { id_empleado } = req.params;
    const VACACIONES = await pool.query(
      `
      SELECT pv.id, pv.id_empleado_cargo
      FROM mv_periodo_vacacion AS pv
      WHERE pv.id = (SELECT MAX(pv.id) AS id 
        FROM mv_periodo_vacacion AS pv 
        WHERE pv.id_empleado = $1 )
      `
      , [id_empleado]);
    if (VACACIONES.rowCount != 0) {
      return res.jsonp(VACACIONES.rows)
    }
    res.status(404).jsonp({ text: 'Registro no encontrado' });
  }

  public async CrearPerVacaciones(req: Request, res: Response) {
    try {
      const {
        id_empl_cargo, descripcion, dia_vacacion, dia_antiguedad, estado, fec_inicio, fec_final,
        dia_perdido, horas_vacaciones, min_vacaciones, id_empleado, user_name, ip, ip_local
      } = req.body;

      // INICIAR TRANSACCION
      await pool.query("BEGIN");

      const datosNuevos = await pool.query(
        `
          INSERT INTO mv_periodo_vacacion (id_empleado_cargo., descripcion, dia_vacacion,
              dia_antiguedad, estado, fecha_inicio, fecha_final, dia_perdido, horas_vacaciones, minutos_vacaciones, id_empleado)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *
        `,
        [id_empl_cargo, descripcion, dia_vacacion, dia_antiguedad, estado,
          fec_inicio, fec_final, dia_perdido, horas_vacaciones, min_vacaciones,
          id_empleado,]
      );

      const [periodo] = datosNuevos.rows;
      const fechaInicioN = await FormatearFecha2(fec_inicio, 'ddd');
      const fechaFinalN = await FormatearFecha2(fec_final, 'ddd');

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
      res.jsonp({ message: "Período de Vacación guardado" });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query("ROLLBACK");
      res.status(500).jsonp({ message: "Error al guardar período de vacación." });
    }
  }

  // METODO PARA BUSCAR DATOS DE PERIODO DE VACACION    **USADO
  public async EncontrarPerVacaciones(req: Request, res: Response): Promise<any> {
    const { id_empleado } = req.params;
    const PERIODO_VACACIONES = await pool.query(
      `
      SELECT * FROM mv_periodo_vacacion AS p WHERE p.id_empleado = $1
      `
      , [id_empleado]);
    if (PERIODO_VACACIONES.rowCount != 0) {
      return res.jsonp(PERIODO_VACACIONES.rows)
    }
    res.status(404).jsonp({ text: 'Registro no encontrado.' });
  }

  public async ActualizarPeriodo(req: Request, res: Response): Promise<Response> {
    try {
      const {
        id_empl_cargo, descripcion, dia_vacacion, dia_antiguedad, estado, fec_inicio,
        fec_final, dia_perdido, horas_vacaciones, min_vacaciones, id, user_name, ip, ip_local
      } = req.body;

      // INICIAR TRANSACCION
      await pool.query("BEGIN");

      // CONSULTAR DATOSORIGINALES
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
        UPDATE mv_periodo_vacacion SET id_empleado_cargo = $1, descripcion = $2, dia_vacacion = $3 ,
            dia_antiguedad = $4, estado = $5, fecha_inicio = $6, fecha_final = $7, dia_perdido = $8, 
            horas_vacaciones = $9, minutos_vacaciones = $10 
        WHERE id = $11 RETURNING *
        `
        ,
        [id_empl_cargo, descripcion, dia_vacacion, dia_antiguedad, estado,
          fec_inicio, fec_final, dia_perdido, horas_vacaciones, min_vacaciones, id]
      );

      const [datosNuevos] = periodoNuevo.rows;
      const fechaInicioN = await FormatearFecha2(fec_inicio, 'ddd');
      const fechaFinalN = await FormatearFecha2(fec_final, 'ddd');
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

}

const PERIODO_VACACION_CONTROLADOR = new PeriodoVacacionControlador();

export default PERIODO_VACACION_CONTROLADOR;
