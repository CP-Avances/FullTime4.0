import { Request, Response } from "express";
import AUDITORIA_CONTROLADOR from "../../auditoria/auditoriaControlador";
import pool from "../../../database";
import excel from "xlsx";
import fs from "fs";

class PeriodoVacacionControlador {
  // METODO PARA BUSCAR ID DE PERIODO DE VACACIONES
  public async EncontrarIdPerVacaciones(req: Request,res: Response): Promise<any> {
    const { id_empleado } = req.params;
    const VACACIONES = await pool.query(
      `
            SELECT pv.id, pv.id_empl_contrato
            FROM peri_vacaciones AS pv
            WHERE pv.id = (SELECT MAX(pv.id) AS id 
                           FROM peri_vacaciones AS pv, empleados AS e 
                           WHERE pv.codigo = e.codigo AND e.id = $1 )
            `,
      [id_empleado]
    );
    if (VACACIONES.rowCount > 0) {
      return res.jsonp(VACACIONES.rows);
    }
    res.status(404).jsonp({ text: "Registro no encontrado" });
  }

  public async ListarPerVacaciones(req: Request, res: Response) {
    const VACACIONES = await pool.query(
      "SELECT * FROM peri_vacaciones WHERE estado = 1 ORDER BY fec_inicio DESC"
    );
    if (VACACIONES.rowCount > 0) {
      return res.jsonp(VACACIONES.rows);
    } else {
      return res.status(404).jsonp({ text: "No se encuentran registros" });
    }
  }

  public async CrearPerVacaciones(req: Request, res: Response) {
    try {
      const {
        id_empl_contrato, descripcion, dia_vacacion, dia_antiguedad, estado, fec_inicio, fec_final,
        dia_perdido, horas_vacaciones, min_vacaciones, codigo, user_name, ip,
      } = req.body;

      // INICIAR TRANSACCION
      await pool.query("BEGIN");

      await pool.query(
        "INSERT INTO peri_vacaciones (id_empl_contrato, descripcion, dia_vacacion, " +
          "dia_antiguedad, estado, fec_inicio, fec_final, dia_perdido, horas_vacaciones, min_vacaciones, codigo ) " +
          "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
        [ id_empl_contrato, descripcion, dia_vacacion, dia_antiguedad, estado,
          fec_inicio, fec_final, dia_perdido, horas_vacaciones, min_vacaciones,
          codigo,]
      );

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: "peri_vacaciones",
        usuario: user_name,
        accion: "I",
        datosOriginales: "",
        datosNuevos: `{id_empl_contrato: ${id_empl_contrato}, descripcion: ${descripcion}, dia_vacacion: ${dia_vacacion}, dia_antiguedad: ${dia_antiguedad}, estado: ${estado}, fec_inicio: ${fec_inicio}, fec_final: ${fec_final}, dia_perdido: ${dia_perdido}, horas_vacaciones: ${horas_vacaciones}, min_vacaciones: ${min_vacaciones}, codigo: ${codigo}}`,
        ip,
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

  public async EncontrarPerVacaciones(req: Request,res: Response): Promise<any> {
    const { codigo } = req.params;
    const PERIODO_VACACIONES = await pool.query(
      "SELECT * FROM peri_vacaciones AS p WHERE p.codigo = $1",
      [codigo]
    );
    if (PERIODO_VACACIONES.rowCount > 0) {
      return res.jsonp(PERIODO_VACACIONES.rows);
    }
    res.status(404).jsonp({ text: "Registro no encontrado" });
  }

  public async ActualizarPeriodo(req: Request,res: Response): Promise<Response> {
    try {
      const {
        id_empl_contrato, descripcion, dia_vacacion, dia_antiguedad, estado, fec_inicio,
        fec_final, dia_perdido, horas_vacaciones, min_vacaciones, id, user_name, ip,
      } = req.body;

      // INICIAR TRANSACCION
      await pool.query("BEGIN");

      // CONSULTAR DATOSORIGINALES
      const periodo = await pool.query(
        "SELECT * FROM peri_vacaciones WHERE id = $1",
        [id]
      );
      const [datosOriginales] = periodo.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: "peri_vacaciones",
          usuario: user_name,
          accion: "U",
          datosOriginales: "",
          datosNuevos: "",
          ip,
          observacion: `Error al actualizar período de vacaciones con id: ${id}`,
        });

        // FINALIZAR TRANSACCION
        await pool.query("COMMIT");
        return res.status(404).jsonp({ message: "Error al actualizar período de vacaciones." });
      }

      await pool.query(
        "UPDATE peri_vacaciones SET id_empl_contrato = $1, descripcion = $2, dia_vacacion = $3 , dia_antiguedad = $4, estado = $5, fec_inicio = $6, fec_final = $7, dia_perdido = $8, horas_vacaciones = $9, min_vacaciones = $10 WHERE id = $11",
        [ id_empl_contrato, descripcion, dia_vacacion, dia_antiguedad, estado,
          fec_inicio, fec_final, dia_perdido, horas_vacaciones, min_vacaciones, id, ]
      );

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: "peri_vacaciones",
        usuario: user_name,
        accion: "U",
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: `{id_empl_contrato: ${id_empl_contrato}, descripcion: ${descripcion}, dia_vacacion: ${dia_vacacion}, dia_antiguedad: ${dia_antiguedad}, estado: ${estado}, fec_inicio: ${fec_inicio}, fec_final: ${fec_final}, dia_perdido: ${dia_perdido}, horas_vacaciones: ${horas_vacaciones}, min_vacaciones: ${min_vacaciones}}`,
        ip,
        observacion: null,
      });

      // FINALIZAR TRANSACCION
      await pool.query("COMMIT");
      return res.jsonp({ message: "Registro Actualizado exitosamente" });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query("ROLLBACK");
      return res.status(500).jsonp({ message: "Error al actualizar período de vacaciones." });
    }
  }

  /** VERIFICAR QUE LOS DATOS EXISTAN PARA REGISTRAR PERIODO DE VACACIONES */
  public async VerificarDatos(req: Request, res: Response) {
    let list: any = req.files;
    let cadena = list.uploads[0].path;
    let filename = cadena.split("\\")[1];
    var filePath = `./plantillas/${filename}`;

    const workbook = excel.readFile(filePath);
    const sheet_name_list = workbook.SheetNames; // ARRAY DE HOJAS DE CALCULO
    const plantilla = excel.utils.sheet_to_json(
      workbook.Sheets[sheet_name_list[0]]
    );

    var contarDatos = 0;
    var contarCedula = 0;
    var contarContrato = 0;
    var contarPeriodos = 0;
    var contador = 1;
    /** PERIODO DE VACACIONES */
    plantilla.forEach(async (data: any) => {
      // DATOS OBTENIDOS DE LA PLANTILLA
      const {
        nombre_empleado, apellido_empleado, cedula, descripcion, vacaciones_tomadas, fecha_inicia_periodo,
        fecha_fin_periodo, dias_vacacion, horas_vacacion, minutos_vacacion, dias_por_antiguedad, dias_perdidos,
      } = data;

      // VERIFICAR SI LOS DATOS OBLIGATORIOS EXISTEN
      if (
        cedula != undefined &&
        descripcion != undefined &&
        vacaciones_tomadas != undefined &&
        fecha_inicia_periodo != undefined &&
        fecha_fin_periodo != undefined &&
        dias_vacacion != undefined &&
        horas_vacacion != undefined &&
        minutos_vacacion != undefined &&
        dias_por_antiguedad != undefined &&
        dias_perdidos != undefined
      ) {
        contarDatos = contarDatos + 1;
      }

      // VERIFICAR SI LA CÉDULA DEL EMPLEADO EXISTEN DENTRO DEL SISTEMA
      if (cedula != undefined) {
        const CEDULA = await pool.query(
          "SELECT id, codigo FROM empleados WHERE cedula = $1",
          [cedula]
        );
        if (CEDULA.rowCount != 0) {
          contarCedula = contarCedula + 1;
          // VERIFICAR SI EL EMPLEADO TIENE UN CONTRATO
          const CONTRATO = await pool.query(
            "SELECT MAX(ec.id) FROM empl_contratos AS ec, empleados AS e WHERE ec.id_empleado = e.id AND e.id = $1",
            [CEDULA.rows[0]["id"]]
          );
          if (CONTRATO.rowCount != 0) {
            contarContrato = contarContrato + 1;
            // VERIFICAR SI EL EMPLEADO YA TIENE REGISTRADO UN PERIODO DE VACACIONES
            const PERIODO = await pool.query(
              "SELECT * FROM peri_vacaciones WHERE codigo = $1",
              CEDULA.rows[0]["codigo"]
            );
            if (PERIODO.rowCount === 0) {
              contarPeriodos = contarPeriodos + 1;
            }
          }
        }
      }
      // VERIFICAR QUE TODOS LOS DATOS SEAN CORRECTOS
      console.log("datos", contarDatos, contarCedula, contarContrato);
      if (contador === plantilla.length) {
        if (
          contarDatos === plantilla.length &&
          contarCedula === plantilla.length &&
          contarContrato === plantilla.length &&
          contarPeriodos === plantilla.length
        ) {
          return res.jsonp({ message: "correcto" });
        } else {
          return res.jsonp({ message: "error" });
        }
      }
      contador = contador + 1;
    });
    // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
      } else {
        // ELIMINAR DEL SERVIDOR
        fs.unlinkSync(filePath);
      }
    });
  }

  /** VERIFICAR QUE NO EXISTA CEDULAS DUPLICADAS EN EL REGISTRO */
  public async VerificarPlantilla(req: Request, res: Response) {
    let list: any = req.files;
    let cadena = list.uploads[0].path;
    let filename = cadena.split("\\")[1];
    var filePath = `./plantillas/${filename}`;
    const workbook = excel.readFile(filePath);
    const sheet_name_list = workbook.SheetNames;
    const plantilla = excel.utils.sheet_to_json(
      workbook.Sheets[sheet_name_list[0]]
    );
    var contarCedulaData = 0;
    var contador_arreglo = 1;
    var arreglos_datos: any = [];
    //LEER LA PLANTILLA PARA LLENAR UN ARRAY CON LOS DATOS NOMBRE PARA VERIFICAR QUE NO SEAN DUPLICADOS
    plantilla.forEach(async (data: any) => {
      // DATOS QUE SE LEEN DE LA PLANTILLA INGRESADA
      const {
        nombre_empleado, apellido_empleado, cedula, descripcion, vacaciones_tomadas, fecha_inicia_periodo, 
        fecha_fin_periodo, dias_vacacion, horas_vacacion, minutos_vacacion, dias_por_antiguedad, dias_perdidos,
      } = data;

      let datos_array = { cedula: cedula,};

      arreglos_datos.push(datos_array);
    });

    // VAMOS A VERIFICAR DENTRO DE ARREGLO_DATOS QUE NO SE ENCUENTREN DATOS DUPLICADOS
    for (var i = 0; i <= arreglos_datos.length - 1; i++) {
      for (var j = 0; j <= arreglos_datos.length - 1; j++) {
        if (arreglos_datos[i].cedula === arreglos_datos[j].cedula) {
          contarCedulaData = contarCedulaData + 1;
        }
      }
      contador_arreglo = contador_arreglo + 1;
    }

    // CUANDO TODOS LOS DATOS HAN SIDO LEIDOS VERIFICAMOS SI TODOS LOS DATOS SON CORRECTOS
    if (contador_arreglo - 1 === plantilla.length) {
      if (contarCedulaData === plantilla.length) {
        return res.jsonp({ message: "correcto" });
      } else {
        return res.jsonp({ message: "error" });
      }
    }
    // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
      } else {
        // ELIMINAR DEL SERVIDOR
        fs.unlinkSync(filePath);
      }
    });
  }

  public async CargarPeriodoVacaciones(req: Request, res: Response) {
    let list: any = req.files;
    let cadena = list.uploads[0].path;
    let filename = cadena.split("\\")[1];
    var filePath = `./plantillas/${filename}`;

    const workbook = excel.readFile(filePath);
    const sheet_name_list = workbook.SheetNames; // ARRAY DE HOJAS DE CALCULO
    const plantilla = excel.utils.sheet_to_json(
      workbook.Sheets[sheet_name_list[0]]
    );

    const { user_name, ip } = req.body;

    /** PERIODO DE VACACIONES */
    plantilla.forEach(async (data: any) => {
      try {
        // DATOS OBTENIDOS DE LA PLANTILLA
        let estado;
        let {
          nombre_empleado, apellido_empleado, cedula, descripcion, vacaciones_tomadas, fecha_inicia_periodo,
          fecha_fin_periodo, dias_vacacion, horas_vacacion, minutos_vacacion, dias_por_antiguedad, dias_perdidos,
        } = data;

        // INICIAR TRANSACCION
        await pool.query("BEGIN");

        // OBTENER ID DEL EMPLEADO MEDIANTE LA CÉDULA
        const datosEmpleado = await pool.query(
          "SELECT id, nombre, apellido, codigo, estado FROM empleados WHERE cedula = $1",
          [cedula]
        );
        let id_empleado = datosEmpleado.rows[0]["id"];
        // OBTENER EL ID DEL CONTRATO ACTUAL DEL EMPLEADO INDICADO
        const CONTRATO = await pool.query(
          "SELECT MAX(ec.id) FROM empl_contratos AS ec, empleados AS e WHERE ec.id_empleado = e.id AND e.id = $1",
          [id_empleado]
        );
        let id_empl_contrato = CONTRATO.rows[0]["max"];
        // CAMBIAR EL ESTADO DE VACACIONES USADAS A VALORES ENTEROS
        if (vacaciones_tomadas === true) {
          estado = 1;
        } else {
          estado = 2;
        }

        // REGISTRAR DATOS DE PERIODO DE VACACIÓN
        await pool.query(
          "INSERT INTO peri_vacaciones (id_empl_contrato, descripcion, dia_vacacion, " +
            "dia_antiguedad, estado, fec_inicio, fec_final, dia_perdido, horas_vacaciones, " +
            "min_vacaciones, codigo ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
          [
            id_empl_contrato, descripcion, dias_vacacion, dias_por_antiguedad, estado, fecha_inicia_periodo,
            fecha_fin_periodo, dias_perdidos, horas_vacacion, minutos_vacacion, datosEmpleado.rows[0]["codigo"],
          ]
        );

        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: "peri_vacaciones",
          usuario: user_name,
          accion: "I",
          datosOriginales: "",
          datosNuevos: `{id_empl_contrato: ${id_empl_contrato}, descripcion: ${descripcion}, dia_vacacion: ${dias_vacacion}, dia_antiguedad: ${dias_por_antiguedad}, estado: ${estado}, fec_inicio: ${fecha_inicia_periodo}, fec_final: ${fecha_fin_periodo}, dia_perdido: ${dias_perdidos}, horas_vacaciones: ${horas_vacacion}, min_vacaciones: ${minutos_vacacion}, codigo: ${datosEmpleado.rows[0]["codigo"]}}`,
          ip,
          observacion: null,
        });

        // FINALIZAR TRANSACCION
        await pool.query("COMMIT");
        return res.jsonp({ message: "correcto" });
      } catch (error) {
        // REVERTIR TRANSACCION
        await pool.query("ROLLBACK");
        return res.status(500).jsonp({ message: "Error al guardar período de vacaciones." });
      }
    });

    // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
      } else {
        // ELIMINAR DEL SERVIDOR
        fs.unlinkSync(filePath);
      }
    });
  }
}

const PERIODO_VACACION_CONTROLADOR = new PeriodoVacacionControlador();

export default PERIODO_VACACION_CONTROLADOR;
