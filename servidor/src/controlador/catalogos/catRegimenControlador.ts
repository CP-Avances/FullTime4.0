import { Request, Response } from "express";
import { QueryResult } from "pg";
import AUDITORIA_CONTROLADOR from "../auditoria/auditoriaControlador";
import pool from "../../database";

class RegimenControlador {
  /** ** ************************************************************************************************ **
   ** **                                  CONSULTAS REGIMEN LABORAL                                    ** **
   ** ** ************************************************************************************************ **/

  // REGISTRO DE REGIMEN LABORAL
  public async CrearRegimen(req: Request, res: Response): Promise<Response> {
    try {
      const {
        id_pais,
        descripcion,
        mes_periodo,
        dias_mes,
        trabajo_minimo_mes,
        trabajo_minimo_horas,
        continuidad_laboral,
        vacacion_dias_laboral,
        vacacion_dias_libre,
        vacacion_dias_calendario,
        acumular,
        dias_max_acumulacion,
        vacacion_divisible,
        antiguedad,
        antiguedad_fija,
        anio_antiguedad,
        dias_antiguedad,
        antiguedad_variable,
        vacacion_dias_calendario_mes,
        vacacion_dias_laboral_mes,
        calendario_dias,
        laboral_dias,
        meses_calculo,
        user_name,
        ip
      } = req.body;

      // INICIAR TRANSACCION
      await pool.query("BEGIN");

      const response: QueryResult = await pool.query(
        `
        INSERT INTO ere_cat_regimenes (id_pais, descripcion, mes_periodo, dias_mes, trabajo_minimo_mes, trabajo_minimo_horas,
          continuidad_laboral, vacacion_dias_laboral, vacacion_dias_libre, vacacion_dias_calendario, acumular, 
          dias_maximo_acumulacion, vacacion_divisible, antiguedad, antiguedad_fija, anio_antiguedad, 
          dias_antiguedad, antiguedad_variable, vacacion_dias_calendario_mes, vacacion_dias_laboral_mes, calendario_dias, 
          laboral_dias, meses_calculo)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, 
          $23) RETURNING *
        `
        , [
          id_pais,
          descripcion,
          mes_periodo,
          dias_mes,
          trabajo_minimo_mes,
          trabajo_minimo_horas,
          continuidad_laboral,
          vacacion_dias_laboral,
          vacacion_dias_libre,
          vacacion_dias_calendario,
          acumular,
          dias_max_acumulacion,
          vacacion_divisible,
          antiguedad,
          antiguedad_fija,
          anio_antiguedad,
          dias_antiguedad,
          antiguedad_variable,
          vacacion_dias_calendario_mes,
          vacacion_dias_laboral_mes,
          calendario_dias,
          laboral_dias,
          meses_calculo
        ]
      );

      const [regimen] = response.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: "ere_cat_regimenes",
        usuario: user_name,
        accion: "I",
        datosOriginales: "",
        datosNuevos: JSON.stringify(regimen),
        ip: ip,
        observacion: null,
      });

      // FINALIZAR TRANSACCION
      await pool.query("COMMIT");

      if (regimen) {
        return res.status(200).jsonp(regimen);
      } else {
        return res.status(404).jsonp({ message: "mal_registro" });
      }
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query("ROLLBACK");
      return res.status(500).jsonp({ message: "error" });
    }
  }

  // ACTUALIZAR REGISTRO DE REGIMEN LABORAL
  public async ActualizarRegimen(req: Request, res: Response): Promise<Response> {
    try {
      const {
        id_pais,
        descripcion,
        mes_periodo,
        dias_mes,
        trabajo_minimo_mes,
        trabajo_minimo_horas,
        continuidad_laboral,
        vacacion_dias_laboral,
        vacacion_dias_libre,
        vacacion_dias_calendario,
        acumular,
        dias_max_acumulacion,
        vacacion_divisible,
        antiguedad,
        antiguedad_fija,
        anio_antiguedad,
        dias_antiguedad,
        antiguedad_variable,
        vacacion_dias_calendario_mes,
        vacacion_dias_laboral_mes,
        calendario_dias,
        laboral_dias,
        meses_calculo,
        id,
        user_name,
        ip
      } = req.body;
  
      // INICIAR TRANSACCION
      await pool.query("BEGIN");
  
      // CONSULTAR DATOSORIGINALES
      const regimen = await pool.query(
        `
        SELECT * FROM ere_cat_regimenes WHERE id = $1
        `
        , [id]
      );
      const [datosOriginales] = regimen.rows;
  
      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: "ere_cat_regimenes",
          usuario: user_name,
          accion: "U",
          datosOriginales: "",
          datosNuevos: "",
          ip: ip,
          observacion: `Error al actualizar el registro con id: ${id}. Registro no encontrado.`,
        });
  
        // FINALIZAR TRANSACCION
        await pool.query("COMMIT");
        return res.status(404).jsonp({ message: "Registro no encontrado" });
      }
  
      const datosNuevos = await pool.query(
          `
      UPDATE ere_cat_regimenes SET id_pais = $1, descripcion = $2, mes_periodo = $3, dias_mes = $4, trabajo_minimo_mes = $5, 
        trabajo_minimo_horas = $6, continuidad_laboral = $7, vacacion_dias_laboral = $8, vacacion_dias_libre = $9, 
        vacacion_dias_calendario = $10, acumular = $11, dias_maximo_acumulacion = $12, 
        vacacion_divisible = $13, antiguedad = $14, antiguedad_fija = $15, anio_antiguedad = $16, dias_antiguedad = $17, 
        antiguedad_variable = $18, vacacion_dias_calendario_mes = $19, vacacion_dias_laboral_mes = $20, calendario_dias = $21,
        laboral_dias = $22, meses_calculo = $23 
      WHERE id = $24 RETURNING *
      `
        , [
          id_pais,
          descripcion,
          mes_periodo,
          dias_mes,
          trabajo_minimo_mes,
          trabajo_minimo_horas,
          continuidad_laboral,
          vacacion_dias_laboral,
          vacacion_dias_libre,
          vacacion_dias_calendario,
          acumular,
          dias_max_acumulacion,
          vacacion_divisible,
          antiguedad,
          antiguedad_fija,
          anio_antiguedad,
          dias_antiguedad,
          antiguedad_variable,
          vacacion_dias_calendario_mes,
          vacacion_dias_laboral_mes,
          calendario_dias,
          laboral_dias,
          meses_calculo,
          id,
        ]
      );

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: "ere_cat_regimenes",
        usuario: user_name,
        accion: "U",
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: JSON.stringify(datosNuevos.rows[0]),
        ip: ip,
        observacion: null,
      });

      // FINALIZAR TRANSACCION
      await pool.query("COMMIT");
  
      return res.jsonp({ message: "Regimen guardado" });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query("ROLLBACK");
      return res.status(500).jsonp({ message: "error" });
    }
  }

  // METODO PARA BUSCAR DESCRIPCION DE REGIMEN LABORAL
  public async ListarNombresRegimen(req: Request, res: Response) {
    const REGIMEN = await pool.query(
      ` 
      SELECT descripcion FROM ere_cat_regimenes
      `
    );
    if (REGIMEN.rowCount != 0) {
      return res.jsonp(REGIMEN.rows);
    } else {
      return res.status(404).jsonp({ text: "No se encuentran registros." });
    }
  }

  // METODO PARA BUSCAR LISTA DE REGIMEN
  public async ListarRegimen(req: Request, res: Response) {
    const REGIMEN = await pool.query(
      `
      SELECT  r.*, p.nombre AS pais 
      FROM ere_cat_regimenes r 
      INNER JOIN e_cat_paises p ON r.id_pais = p.id 
      ORDER BY r.descripcion ASC
      `
    );
    if (REGIMEN.rowCount != 0) {
      return res.jsonp(REGIMEN.rows);
    } else {
      return res.status(404).jsonp({ text: "No se encuentran registros." });
    }
  }

  // BUSCAR UN REGISTRO DE REGIMEN LABORAL
  public async ListarUnRegimen(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const REGIMEN = await pool.query(
      `
      SELECT * FROM ere_cat_regimenes WHERE id = $1
      `
      , [id]
    );
    if (REGIMEN.rowCount != 0) {
      return res.jsonp(REGIMEN.rows[0]);
    } else {
      return res.status(404).jsonp({ text: "No se encuentran registros." });
    }
  }

  // BUSCAR REGISTRO DE REGIMEN LABORAL POR ID DE PAIS
  public async ListarRegimenPais(req: Request, res: Response): Promise<any> {
    const { nombre } = req.params;
    const REGIMEN = await pool.query(
      `
      SELECT r.* FROM ere_cat_regimenes AS r, e_cat_paises AS p 
      WHERE r.id_pais = p.id AND p.nombre = $1
      `
      , [nombre]
    );
    if (REGIMEN.rowCount != 0) {
      return res.jsonp(REGIMEN.rows);
    } else {
      return res.status(404).jsonp({ text: "No se encuentran registros." });
    }
  }

  // ELIMINAR REGISTRO DE REGIMEN LABORAL
  public async EliminarRegistros(req: Request, res: Response): Promise<Response> {
    try {
      const { user_name, ip } = req.body;
      const id = req.params.id;

      // INICIAR TRANSACCION
      await pool.query("BEGIN");

      // CONSULTAR DATOSORIGINALES
      const regimen = await pool.query(
        `
        SELECT * FROM ere_cat_regimenes WHERE id = $1
        `
        , [id]
      );
      const [datosOriginales] = regimen.rows;

      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: "ere_cat_regimenes",
          usuario: user_name,
          accion: "D",
          datosOriginales: "",
          datosNuevos: "",
          ip: ip,
          observacion: `Error al eliminar el registro con id: ${id}. Registro no encontrado.`,
        });

        // FINALIZAR TRANSACCION
        await pool.query("COMMIT");
        return res.status(404).jsonp({ message: "Registro no encontrado." });
      }

      await pool.query(
        `
        DELETE FROM ere_cat_regimenes WHERE id = $1
        `
        , [id]
      );

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: "ere_cat_regimenes",
        usuario: user_name,
        accion: "D",
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: "",
        ip: ip,
        observacion: null,
      });

      // FINALIZAR TRANSACCION
      await pool.query("COMMIT");
      return res.jsonp({ message: "Registro eliminado." });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query("ROLLBACK");
      //return res.status(500).jsonp({ message:'error'});
      return res.jsonp({ message: 'error' });

    }
  }

  /** ** ************************************************************************************************ **
   ** **                         CONSULTAS DE PERIODOS DE VACACIONES                                   ** **
   ** ** ************************************************************************************************ **/

  // REGISTRAR PERIODO DE VACACIONES
  public async CrearPeriodo(req: Request, res: Response): Promise<Response> {
    try {
      const { id_regimen, descripcion, dias_vacacion, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query("BEGIN");

      const response: QueryResult = await pool.query(
        `
        INSERT INTO ere_dividir_vacaciones (id_regimen, descripcion, dias_vacacion)
        VALUES ($1, $2, $3) RETURNING *
        `
        , [id_regimen, descripcion, dias_vacacion]
      );

      const [periodo] = response.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: "ere_dividir_vacaciones",
        usuario: user_name,
        accion: "I",
        datosOriginales: "",
        datosNuevos: JSON.stringify(periodo),
        ip: ip,
        observacion: null,
      });

      // FINALIZAR TRANSACCION 
      await pool.query("COMMIT");

      if (periodo) {
        return res.status(200).jsonp(periodo);
      } else {
        return res.status(404).jsonp({ message: "mal_registro" });
      }
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query("ROLLBACK");
      return res.status(500).jsonp({ message: "error" });
    }
  }

  // ACTUALIZAR REGISTRO DE PERIODO DE VACACIONES
  public async ActualizarPeriodo(req: Request, res: Response): Promise<Response> {
    try {
      const { descripcion, dias_vacacion, id, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query("BEGIN");

      // CONSULTAR DATOSORIGINALES
      const periodo = await pool.query(
        `
        SELECT * FROM ere_dividir_vacaciones WHERE id = $1
        `
        , [id]
      );
      const [datosOriginales] = periodo.rows;

      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: "ere_dividir_vacaciones",
          usuario: user_name,
          accion: "U",
          datosOriginales: "",
          datosNuevos: "",
          ip: ip,
          observacion: `Error al actualizar el registro con id: ${id}. Registro no encontrado.`,
        });

        // FINALIZAR TRANSACCION
        await pool.query("COMMIT");
        return res.status(404).jsonp({ message: "error" });
      }
  
      await pool.query(
        `
        UPDATE ere_dividir_vacaciones SET descripcion = $1, dias_vacacion = $2 WHERE id = $3
        `
        , [descripcion, dias_vacacion, id]
      );

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: "ere_dividir_vacaciones",
        usuario: user_name,
        accion: "U",
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: `{"descripcion": "${descripcion}", "dias_vacacion": "${dias_vacacion}"}`,
        ip: ip,
        observacion: null,
      });

      // FINALIZAR TRANSACCION
      await pool.query("COMMIT");
  
      return res.jsonp({ message: "Periodo guardado" });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' });
      
    }
  }

  // BUSCAR UN REGISTRO DE PERIODO DE VACACIONES POR REGIMEN LABORAL
  public async ListarUnPeriodo(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const PERIODO = await pool.query(
      `
      SELECT * FROM ere_dividir_vacaciones WHERE id_regimen = $1 
      ORDER BY id
      `
      , [id]
    );
    if (PERIODO.rowCount != 0) {
      return res.jsonp(PERIODO.rows);
    } else {
      return res.status(404).jsonp({ text: "No se encuentran registros." });
    }
  }

  // ELIMINAR REGISTRO DE PERIODO DE VACACIONES
  public async EliminarPeriodo(req: Request, res: Response): Promise<Response> {
    try {
      const { user_name, ip } = req.body;
      const id = req.params.id;

      // INICIAR TRANSACCION
      await pool.query("BEGIN");

      // CONSULTAR DATOSORIGINALES
      const periodo = await pool.query(
        `
        SELECT * FROM ere_dividir_vacaciones WHERE id = $1
        `
        , [id]
      );
      const [datosOriginales] = periodo.rows;

      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: "ere_dividir_vacaciones",
          usuario: user_name,
          accion: "D",
          datosOriginales: "",
          datosNuevos: "",
          ip: ip,
          observacion: `Error al eliminar el registro con id: ${id}. Registro no encontrado.`,
        });

        // FINALIZAR TRANSACCION
        await pool.query("COMMIT");
        return res.status(404).jsonp({ message: "Registro no encontrado." });
      }

      await pool.query(
        `
        DELETE FROM ere_dividir_vacaciones WHERE id = $1
        `
        , [id]
      );

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: "ere_dividir_vacaciones",
        usuario: user_name,
        accion: "D",
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: "",
        ip: ip,
        observacion: null,
      });
      return res.jsonp({ message: "Registro eliminado." });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query("ROLLBACK");
      return res.status(500).jsonp({ message: error });
    }
  }

  /** ** ********************************************************************************************** **
   ** ** **                     REGISTRAR ANTIGUEDAD DE VACACIONES                                   ** **
   ** ** ********************************************************************************************** **/

  // REGISTRAR ANTIGUEDAD DE VACACIONES
  public async CrearAntiguedad(req: Request, res: Response): Promise<Response> {
    try {
      const { anio_desde, anio_hasta, dias_antiguedad, id_regimen, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query("BEGIN");

      const response: QueryResult = await pool.query(
        `
        INSERT INTO ere_antiguedad (anio_desde, anio_hasta, dias_antiguedad, id_regimen)
        VALUES ($1, $2, $3, $4) RETURNING *
        `
        , [anio_desde, anio_hasta, dias_antiguedad, id_regimen]
      );

      const [antiguedad] = response.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: "ere_antiguedad",
        usuario: user_name,
        accion: "I",
        datosOriginales: "",
        datosNuevos: JSON.stringify(antiguedad),
        ip: ip,
        observacion: null,
      });

      // FINALIZAR TRANSACCION
      await pool.query("COMMIT");

      if (antiguedad) {
        return res.status(200).jsonp(antiguedad);
      } else {
        return res.status(404).jsonp({ message: "mal_registro" });
      }
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query("ROLLBACK");
      return res.status(500).jsonp({ message: "error" });
    }
  }

  // ACTUALIZAR ANTIGUEDAD DE VACACIONES
  public async ActualizarAntiguedad(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { anio_desde, anio_hasta, dias_antiguedad, id, user_name, ip } = req.body;
  
      // INICIAR TRANSACCION
      await pool.query("BEGIN");
  
      // CONSULTAR DATOSORIGINALES
      const antiguedad = await pool.query(
        `
        SELECT * FROM ere_antiguedad WHERE id = $1
        `
        , [id]
      );
      const [datosOriginales] = antiguedad.rows;
  
      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: "ere_antiguedad",
          usuario: user_name,
          accion: "U",
          datosOriginales: "",
          datosNuevos: "",
          ip: ip,
          observacion: `Error al actualizar el registro con id: ${id}. Registro no encontrado.`,
        });
  
        // FINALIZAR TRANSACCION
        await pool.query("COMMIT");
        return res.status(404).jsonp({ message: "error" });
      }
      await pool.query(
        `
        UPDATE ere_antiguedad SET anio_desde = $1, anio_hasta = $2, dias_antiguedad = $3 WHERE id = $4
        `
        , [anio_desde, anio_hasta, dias_antiguedad, id]
      );
  
      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: "ere_antiguedad",
        usuario: user_name,
        accion: "U",
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: `{"anio_desde": "${anio_desde}", "anio_hasta": "${anio_hasta}", "dias_antiguedad": "${dias_antiguedad}"}`,
        ip: ip,
        observacion: null,
      });
  
      // FINALIZAR TRANSACCION
      await pool.query("COMMIT");
  
      return res.jsonp({ message: "Antiguedad guardada" });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query("ROLLBACK");
      return res.status(500).jsonp({ message: "error" });
    }
  }

  // BUSCAR UN REGISTRO DE ANTIGUEDAD
  public async ListarAntiguedad(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const ANTIGUO = await pool.query(
      `
      SELECT * FROM ere_antiguedad WHERE id_regimen = $1 ORDER BY id
      `
      , [id]
    );
    if (ANTIGUO.rowCount != 0) {
      return res.jsonp(ANTIGUO.rows);
    } else {
      return res.status(404).jsonp({ text: "No se encuentran registros." });
    }
  }

  // ELIMINAR REGISTRO DE ANTIGUEDAD DE VACACIONES
  public async EliminarAntiguedad(req: Request, res: Response): Promise<Response> {
    try {
      const { user_name, ip } = req.body;
      const id = req.params.id;

      // INICIAR TRANSACCION
      await pool.query("BEGIN");

      // CONSULTAR DATOSORIGINALES
      const antiguedad = await pool.query(
        `
        SELECT * FROM ere_antiguedad WHERE id = $1
        `
        , [id]
      );
      const [datosOriginales] = antiguedad.rows;

      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: "ere_antiguedad",
          usuario: user_name,
          accion: "D",
          datosOriginales: "",
          datosNuevos: "",
          ip: ip,
          observacion: `Error al eliminar el registro con id: ${id}. Registro no encontrado.`,
        });

        // FINALIZAR TRANSACCION
        await pool.query("COMMIT");
        return res.status(404).jsonp({ message: "Registro no encontrado." });
      }

      await pool.query(
        `
        DELETE FROM ere_antiguedad WHERE id = $1
        `
        , [id]
      );

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: "ere_antiguedad",
        usuario: user_name,
        accion: "D",
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: "",
        ip: ip,
        observacion: null,
      });

      // FINALIZAR TRANSACCION
      await pool.query("COMMIT");
      return res.jsonp({ message: "Registro eliminado." });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query("ROLLBACK");
      return res.status(500).jsonp({ message: error });
    }
  }

  public async ListarRegimenSucursal(
    req: Request,
    res: Response
  ): Promise<any> {
    const { id } = req.params;
    const REGIMEN = await pool.query(
      `
      SELECT r.id, r.descripcion 
      FROM ere_cat_regimenes AS r, eu_empleado_cargos AS ec, eu_empleado_contratos AS c 
      WHERE c.id_regimen = r.id AND c.id = ec.id_contrato AND ec.id_sucursal = $1
      GROUP BY r.id, r.descripcion
      `
      , [id]
    );
    if (REGIMEN.rowCount != 0) {
      return res.jsonp(REGIMEN.rows);
    } else {
      return res.status(404).jsonp({ text: "No se encuentran registros." });
    }
  }
}

const REGIMEN_CONTROLADOR = new RegimenControlador();

export default REGIMEN_CONTROLADOR;
