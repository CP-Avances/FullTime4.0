import { enviarCorreos, fechaHora, Credenciales, FormatearFecha, FormatearHora, dia_completo } from '../../../libs/settingsMail';
import AUDITORIA_CONTROLADOR from '../../reportes/auditoriaControlador';
import { ObtenerRutaVacacion } from '../../../libs/accesoCarpetas';
import { Request, Response } from 'express';
import { ObtenerRutaLogos } from '../../../libs/accesoCarpetas';
import { QueryResult } from 'pg';
import { DateTime } from 'luxon';
import pool from '../../../database';
import path from 'path';
import fs from 'fs';

class VacacionesControlador {

  //METODO PARA LISTAR VACACIONES CONFIGURADAS   **USADO
  public async ListarVacacionesConfiguradas(req: Request, res: Response): Promise<any> {
    const SOLICITUD = await pool.query(
      `
    SELECT * FROM mv_configurar_vacaciones
    `
    );

    if (SOLICITUD.rowCount != 0) {
      return res.json(SOLICITUD.rows);
    } else {
      return res.status(404).json({ text: 'No se encontraron configuraciones.' });
    }
  }


  //METODO QUE REALIZA LA VERIFICACION SI LA SOLICITUD DE VACACION ES APTA PARA SU REGISTRO    **USADO**
  public VerificarVacacionesMultiples = async (req: Request, res: Response): Promise<any> => {
    try {
      const { empleados, fechaInicio, fechaFin, incluirFeriados, permiteHoras, numHoras } = req.body;
      const resultados: any[] = [];
      const fechaIni = new Date(fechaInicio);
      const fechaFin_ = new Date(fechaFin);

      for (const idEmpleado of empleados) {
        //VERIFICA QUE EL EMPLEADO TENGA PERIODO DE VACACION Y SI ESE PERIODO ESTA ACTIVO
        const periodos = await pool.query(
          `SELECT * FROM mv_periodo_vacacion WHERE id_empleado = $1`,
          [idEmpleado]
        );
        if (periodos.rowCount === 0) {
          resultados.push({ idEmpleado, observacion: 'Empleado sin periodo registrado' });
          continue;
        }
        const periodoActivo = periodos.rows.find((p: any) => p.estado === true);
        if (!periodoActivo) {
          resultados.push({ idEmpleado, observacion: 'Empleado sin periodo activo' });
          continue;
        }

        const inicioPeriodo = new Date(periodoActivo.fecha_inicio);
        const finPeriodo = new Date(periodoActivo.fecha_final);
        if (fechaIni < inicioPeriodo || fechaFin_ > finPeriodo) {
          resultados.push({
            idEmpleado,
            observacion: 'Las fechas están fuera del periodo activo del empleado'
          });
          continue;
        }

        //FUNCION EN LA BASE DE DATOS PARA OBTENER EL SALDO DISPONIBLE DEL EMPLEADO
        const saldoResult = await pool.query(
          `SELECT public.fn_obtener_saldo_vacaciones($1) AS saldo`,
          [idEmpleado]
        );
        const saldoDisponible = parseFloat(saldoResult.rows[0].saldo);

        //VALIDACION CUANDO EL TIPO DE VACACION ES POR HORAS
        if (permiteHoras) {
          let horasSolicitadas: number;
          if (typeof numHoras === 'string' && numHoras.includes(':')) {
            const [horas, minutos] = numHoras.split(':').map(Number);
            horasSolicitadas = horas + (minutos / 60);
          } else {
            horasSolicitadas = parseFloat(numHoras);
          }
          if (!horasSolicitadas || isNaN(horasSolicitadas)) {
            resultados.push({
              idEmpleado,
              observacion: 'Número de horas inválido'
            });
            continue;
          }
          const contrato = await pool.query(`
          SELECT car.hora_trabaja
          FROM eu_empleado_contratos ec
          JOIN contrato_cargo_vigente cv ON cv.id_contrato = ec.id
          JOIN eu_empleado_cargos car ON car.id = cv.id_cargo
          WHERE ec.id_empleado = $1
          LIMIT 1;
        `, [idEmpleado]);

          if (contrato.rowCount === 0) {
            resultados.push({
              idEmpleado,
              observacion: 'Empleado sin contrato activo'
            });
            continue;
          }

          const horasContrato = parseFloat(contrato.rows[0].hora_trabaja);
          // VALIDACION DE LAS HORAS SOLICITADAS CON LAS HORAS DEL CONTRATO DE CARGO VIGENTE
          if (horasSolicitadas >= horasContrato) {
            resultados.push({
              idEmpleado,
              observacion: 'Las horas solicitadas superan las horas que equivalen a un día'
            });
            continue;
          }

          const diasEquivalentes = horasSolicitadas / horasContrato;

          if (saldoDisponible >= diasEquivalentes) {
            resultados.push({ idEmpleado, observacion: 'Ok' });
          } else {
            resultados.push({
              idEmpleado,
              observacion: `Saldo insuficiente`
            });
          }
        }
        //VALIDACION CUANDO EL TIPO DE VACACION ES POR DIAS
        else {
          const diasSolicitados = await this.contarDiasSolicitados(fechaIni, fechaFin_, incluirFeriados);

          if (saldoDisponible < diasSolicitados) {
            resultados.push({ idEmpleado, observacion: `Saldo insuficiente` });
            continue;
          }
          resultados.push({ idEmpleado, observacion: 'Ok' });
        }
      }
      return res.json(resultados);
    } catch (error) {
      console.error('Error en VerificarVacacionesMultiples:', error);
      return res.status(500).jsonp({ text: 'Error al verificar los empleados.' });
    }
  }

  // METODO QUE CUENTA DIAS ENTRE DOS FECHAS INCLUYENDO FINES DE SEMANA, EXCLUYE FERIADOS DEPENDIENDO EL TIPO DE VACACION   **USADO
  private async contarDiasSolicitados(fechaInicio: Date, fechaFin: Date, incluirFeriados: boolean): Promise<number> {
    let count = 0;
    const current = new Date(fechaInicio);
    let feriados: string[] = [];
    if (!incluirFeriados) {
      const result = await pool.query(`SELECT fecha FROM ef_cat_feriados`);
      feriados = result.rows.map((row: any) => row.fecha.toISOString().split('T')[0]);
    }
    while (current <= fechaFin) {
      const fechaStr = current.toISOString().split('T')[0];
      if (incluirFeriados || !feriados.includes(fechaStr)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  }

  /** ********************************************************************************************* **
   ** **                        METODOS DE REGISTROS DE VACACIONES                               ** ** 
   ** ********************************************************************************************* **/

  // METODO PARA CREAR REGISTRO DE VACACIONES    **USADO
  public async CrearVacaciones(req: Request, res: Response): Promise<Response> {
    try {
      const {
        id_empleado, fecha_inicio, fecha_final, incluir_feriados, num_lunes, num_martes,
        num_miercoles, num_jueves, num_viernes, num_sabado, num_domingo, num_dias_totales,
        user_name, ip, ip_local, subir_documento, permite_horas, num_horas
      } = req.body;

      if (subir_documento === true) {
        const carpetaVacaciones = await ObtenerRutaVacacion(id_empleado);
        try {
          await fs.promises.access(carpetaVacaciones);
        } catch (err) {
          try {
            await fs.promises.mkdir(carpetaVacaciones, { recursive: true });
          } catch (mkdirErr) {
            return res.status(500).jsonp({ message: 'error_carpeta' });
          }
        }
      }

      // INICIAR TRANSACCIÓN
      await pool.query('BEGIN');

      // OBTENER id_cargo_vigente
      const cargo = await pool.query(`
      SELECT car.id AS id_cargo_vigente
      FROM eu_empleado_cargos car
      JOIN contrato_cargo_vigente ccv ON ccv.id_cargo = car.id
      JOIN eu_empleado_contratos ec ON ec.id = ccv.id_contrato
      WHERE ec.id_empleado = $1
      LIMIT 1
    `, [id_empleado]);
      const id_cargo_vigente = cargo.rows[0]?.id_cargo_vigente;

      // OBTENER id_periodo_vacacion
      const periodo = await pool.query(`
      SELECT id AS id_periodo_vacacion
      FROM mv_periodo_vacacion
      WHERE id_empleado = $1
      AND estado = true
      LIMIT 1
    `, [id_empleado]);
      const id_periodo_vacacion = periodo.rows[0]?.id_periodo_vacacion;

      // OBTENER horas del contrato
      const horasContratoResult = await pool.query(`
      SELECT car.hora_trabaja
      FROM eu_empleado_contratos ec
      JOIN contrato_cargo_vigente cv ON cv.id_contrato = ec.id
      JOIN eu_empleado_cargos car ON car.id = cv.id_cargo
      WHERE ec.id_empleado = $1
      LIMIT 1
    `, [id_empleado]);

      const hora_trabaja = parseFloat(horasContratoResult.rows[0]?.hora_trabaja ?? 0);
      if (!hora_trabaja || isNaN(hora_trabaja)) {
        throw new Error('No se pudo obtener las horas del contrato vigente.');
      }

      // Calcular minutos totales
      let num_minutos_totales = 0;
      let diasTotales = num_dias_totales;
      let diasSemana = {
        lunes: num_lunes,
        martes: num_martes,
        miercoles: num_miercoles,
        jueves: num_jueves,
        viernes: num_viernes,
        sabado: num_sabado,
        domingo: num_domingo
      };

      if (permite_horas === true) {
        let horasSolicitadas: number;
        if (typeof num_horas === 'string' && num_horas.includes(':')) {
          const [horas, minutos] = num_horas.split(':').map(Number);
          horasSolicitadas = horas + (minutos / 60);
        } else {
          horasSolicitadas = parseFloat(num_horas);
        }
        if (isNaN(horasSolicitadas)) {
          throw new Error('El número de horas solicitadas es inválido.');
        }

        diasTotales = horasSolicitadas / hora_trabaja;
        num_minutos_totales = Math.round(horasSolicitadas * 60);
        diasSemana = {
          lunes: 0,
          martes: 0,
          miercoles: 0,
          jueves: 0,
          viernes: 0,
          sabado: 0,
          domingo: 0
        };
      } else {
        num_minutos_totales = Math.round(num_dias_totales * hora_trabaja * 60);
      }

      // INSERTAR SOLICITUD
      const response: QueryResult = await pool.query(`
      INSERT INTO mv_solicitud_vacacion (
        id_empleado, id_cargo_vigente, id_periodo_vacacion,
        fecha_inicio, fecha_final, estado, incluir_feriados,
        numero_dias_lunes, numero_dias_martes, numero_dias_miercoles, numero_dias_jueves,
        numero_dias_viernes, numero_dias_sabado, numero_dias_domingo, numero_dias_totales,
        minutos_totales, fecha_registro
      ) VALUES (
        $1, $2, $3,
        $4, $5, 1, $6,
        $7, $8, $9, $10,
        $11, $12, $13, $14,
        $15, CURRENT_DATE
      ) RETURNING *
    `, [
        id_empleado, id_cargo_vigente, id_periodo_vacacion,
        fecha_inicio, fecha_final, incluir_feriados,
        diasSemana.lunes, diasSemana.martes, diasSemana.miercoles, diasSemana.jueves,
        diasSemana.viernes, diasSemana.sabado, diasSemana.domingo,
        diasTotales, num_minutos_totales
      ]);

      const [objetoVacacion] = response.rows;

      // AUDITORÍA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'mv_solicitud_vacacion',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: JSON.stringify(objetoVacacion),
        ip,
        ip_local,
        observacion: null
      });

      // FINALIZAR TRANSACCIÓN
      await pool.query('COMMIT');

      return res.status(200).jsonp(objetoVacacion);

    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error en CrearVacaciones:', error);
      return res.status(500).jsonp({ message: 'Error al guardar la solicitud de vacaciones.' });
    }
  }

  // METODO PARA VERIFICAR EXISTENCIA DE SOLICITUD DE VACACION DE EMPLEADO EN CIERTO PERIODO DE FECHAS    **USADO**
  public async VerificarExistenciaSolicitud(req: Request, res: Response): Promise<Response> {
    const { id_empleado, fecha_inicio, fecha_final } = req.params;
    try {
      const existe = await pool.query(
        `
      SELECT id FROM mv_solicitud_vacacion
      WHERE id_empleado = $1
        AND (
          (fecha_inicio <= $3 AND fecha_final >= $2)  -- cruce de fechas
        )
      LIMIT 1;
      `,
        [id_empleado, fecha_inicio, fecha_final]
      );

      if (existe.rows.length > 0) {
        return res.status(200).json({ message: 'Solicitud ya existe', id: existe.rows[0].id });
      } else {
        return res.status(404).json({ message: 'No existe solicitud' });
      }

    } catch (error) {
      console.error('Error al verificar solicitud:', error);
      return res.status(500).json({ message: 'Error en el servidor' });
    }
  }

  //METODO PARA REGISTRO DE DOCUMENTO DE SOLICITUD DE VACACIONES   **USADO**
  public async GuardarDocumento(req: Request, res: Response): Promise<Response> {
    try {
      const fecha = DateTime.now();
      const anio = fecha.toFormat('yyyy');
      const mes = fecha.toFormat('MM');
      const dia = fecha.toFormat('dd');

      const { user_name, ip, ip_local } = req.body;
      const id = req.params.id;
      const id_empleado = req.params.id_empleado;

      await pool.query('BEGIN');

      const response: QueryResult = await pool.query(
        `SELECT codigo FROM eu_empleados WHERE id = $1`,
        [id_empleado]
      );
      const [empleado] = response.rows;

      const documento = `${empleado.codigo}_${anio}_${mes}_${dia}_${req.file?.originalname}`;

      const solicitudActual = await pool.query(
        `SELECT * FROM mv_solicitud_vacacion WHERE id = $1`,
        [id]
      );
      const [datosOriginales] = solicitudActual.rows;

      if (!datosOriginales) {
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'mv_solicitud_vacacion',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          ip_local,
          observacion: `Error al guardar documento de solicitud de vacaciones con id: ${id}`
        });

        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Registro no encontrado.' });
      }

      const datosNuevos = await pool.query(
        `UPDATE mv_solicitud_vacacion SET documento = $2 WHERE id = $1 RETURNING *`,
        [id, documento]
      );

      // AUDITORÍA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'mv_solicitud_vacacion',
        usuario: user_name,
        accion: 'U',
        datosOriginales: JSON.stringify(datosOriginales),
        datosNuevos: JSON.stringify(datosNuevos.rows[0]),
        ip,
        ip_local,
        observacion: null
      });

      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro guardado.' });

    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error en GuardarDocumento Vacaciones:', error);
      return res.status(500).jsonp({ message: 'Error al guardar registro.' });
    }
  }


  /** ********************************************************************************************** **
   **                            METODOS USADOS EN LA APLICACION MOVIL                               **
   ** ********************************************************************************************** **/

  // METODO DE ENVIO DE CORREO ELECTRONICO MEDIANTE APLICACION MOVIL
  public async EnviarCorreoVacacionesMovil(req: Request, res: Response): Promise<void> {

    var tiempo = fechaHora();
    var fecha = await FormatearFecha(tiempo.fecha_formato, dia_completo);
    var hora = await FormatearHora(tiempo.hora);

    // OBTENER RUTA DE LOGOS
    let separador = path.sep;
    const path_folder = ObtenerRutaLogos();

    var datos = await Credenciales(parseInt(req.params.id_empresa));

    if (datos.message === 'ok') {

      const { idContrato, desde, hasta, id_dep, id_suc, estado_v, correo, solicitado_por,
        asunto, tipo_solicitud, proceso } = req.body;

      const correoInfoPideVacacion = await pool.query(
        `
        SELECT e.correo, e.nombre, e.apellido, e.identificacion, 
          ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo, tc.cargo AS tipo_cargo, 
          d.nombre AS departamento 
        FROM eu_empleado_contratos AS ecn, eu_empleados AS e, eu_empleado_cargos AS ecr, e_cat_tipo_cargo AS tc, 
          ed_departamentos AS d 
        WHERE ecn.id = $1 AND ecn.id_empleado = e.id AND 
          (SELECT id_cargo FROM contrato_cargo_vigente WHERE id_empleado = e.id) = ecr.id 
          AND tc.id = ecr.id_tipo_cargo AND d.id = ecr.id_departamento 
        ORDER BY cargo DESC
        `
        , [idContrato]);

      // obj.id_dep === correoInfoPideVacacion.rows[0].id_departamento && obj.id_suc === correoInfoPideVacacion.rows[0].id_sucursal

      let data = {
        to: correo,
        from: datos.informacion.email,
        subject: asunto,
        html:
          `
          <body>
            <div style="text-align: center;">
              <img width="100%" height="100%" src="cid:cabeceraf"/>
            </div>
            <br>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              El presente correo es para informar que se ha ${proceso} la siguiente solicitud de vacaciones: <br>  
            </p>
            <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Empresa:</b> ${datos.informacion.nombre} <br>   
              <b>Asunto:</b> ${asunto} <br> 
              <b>Colaborador que envía:</b> ${correoInfoPideVacacion.rows[0].nombre} ${correoInfoPideVacacion.rows[0].apellido} <br>
              <b>Número de identificación:</b> ${correoInfoPideVacacion.rows[0].identificacion} <br>
              <b>Cargo:</b> ${correoInfoPideVacacion.rows[0].tipo_cargo} <br>
              <b>Departamento:</b> ${correoInfoPideVacacion.rows[0].departamento} <br>
              <b>Generado mediante:</b> Aplicación Móvil <br>
              <b>Fecha de envío:</b> ${fecha} <br> 
              <b>Hora de envío:</b> ${hora} <br><br> 
            </p>
            <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Motivo:</b> Vacaciones <br>   
              <b>Fecha de Solicitud:</b> ${fecha} <br> 
              <b>Desde:</b> ${desde} <br>
              <b>Hasta:</b> ${hasta} <br>
              <b>Estado:</b> ${estado_v} <br><br>
              <b>${tipo_solicitud}:</b> ${solicitado_por} <br><br>
            </p>
            <p style="font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Gracias por la atención</b><br>
              <b>Saludos cordiales,</b> <br><br>
            </p>
            <img src="cid:pief" width="100%" height="100%"/>
          </body>
          `
        ,
        attachments: [
          {
            filename: 'cabecera_firma.jpg',
            path: `${path_folder}${separador}${datos.informacion.cabecera_firma}`,
            cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
          },
          {
            filename: 'pie_firma.jpg',
            path: `${path_folder}${separador}${datos.informacion.pie_firma}`,
            cid: 'pief' //COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
          }]
      };

      var corr = enviarCorreos(datos.informacion.servidor, parseInt(datos.informacion.puerto), datos.informacion.email, datos.informacion.pass);
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
      res.jsonp({ message: 'Ups! algo salio mal. No fue posible enviar correo electrónico.' });
    }
  }

  // METODO PARA MOSTRAR LAS SOLICITUDES DE VACACIONES DEL EMPLEADO POR SU CODIGO
  public async getlistaVacacionesByFechasyCodigo(req: Request, res: Response): Promise<Response> {
    try {
      const { fec_inicio, fec_final, codigo } = req.query;

      const query = `SELECT v.* FROM mv_solicitud_vacacion v WHERE v.id_empleado = '${codigo}' AND (
            ((\'${fec_inicio}\' BETWEEN v.fecha_inicio AND v.fecha_final ) OR 
             (\'${fec_final}\' BETWEEN v.fecha_inicio AND v.fecha_final)) 
            OR
            ((v.fecha_inicio BETWEEN \'${fec_inicio}\' AND \'${fec_final}\') OR 
             (v.fecha_final BETWEEN \'${fec_inicio}\' AND \'${fec_final}\'))
            )`

      const response: QueryResult = await pool.query(query);
      const vacaciones: any[] = response.rows;
      return res.status(200).jsonp(vacaciones);
    } catch (error) {
      console.log(error);
      return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
  };

}

export const VACACIONES_CONTROLADOR = new VacacionesControlador();

export default VACACIONES_CONTROLADOR;