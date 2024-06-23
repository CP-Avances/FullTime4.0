import { ObtenerIndicePlantilla, ObtenerRutaLeerPlantillas } from '../../../libs/accesoCarpetas';
import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import AUDITORIA_CONTROLADOR from '../../auditoria/auditoriaControlador';
import moment from 'moment';
import pool from '../../../database';
import path from 'path';
import fs from 'fs';
import { FormatearFecha2 } from '../../../libs/settingsMail';

import excel from 'xlsx';

class EmpleadoCargosControlador {

  // METODO BUSQUEDA DATOS DEL CARGO DE UN USUARIO
  public async ObtenerCargoID(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const unEmplCargp = await pool.query(
      `
      SELECT ec.id, ec.id_contrato, ec.id_tipo_cargo, ec.fecha_inicio, ec.fecha_final, ec.sueldo, 
        ec.hora_trabaja, ec.id_sucursal, s.nombre AS sucursal, ec.id_departamento, 
        d.nombre AS departamento, e.id AS id_empresa, e.nombre AS empresa, tc.cargo AS nombre_cargo 
      FROM eu_empleado_cargos AS ec, e_sucursales AS s, ed_departamentos AS d, e_empresa AS e, 
        e_cat_tipo_cargo AS tc 
      WHERE ec.id = $1 AND ec.id_sucursal = s.id AND ec.id_departamento = d.id AND 
        s.id_empresa = e.id AND ec.id_tipo_cargo = tc.id 
      ORDER BY ec.id
      `
      , [id]);
    if (unEmplCargp.rowCount != 0) {
      return res.jsonp(unEmplCargp.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }

  }

  // METODO DE REGISTRO DE CARGO
  public async Crear(req: Request, res: Response): Promise<void> {
    try {
      const { id_empl_contrato, id_departamento, fec_inicio, fec_final, id_sucursal, sueldo, hora_trabaja, cargo,
        user_name, ip } = req.body;

      const datosNuevos = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      await pool.query(
        `
        INSERT INTO eu_empleado_cargos (id_contrato, id_departamento, fecha_inicio, fecha_final, id_sucursal,
           sueldo, hora_trabaja, id_tipo_cargo) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `
        , [id_empl_contrato, id_departamento, fec_inicio, fec_final, id_sucursal, sueldo, hora_trabaja, cargo]);

      delete datosNuevos.user_name;
      delete datosNuevos.ip;

      var fechaIngresoN = await FormatearFecha2(fec_inicio, 'ddd');
      var fechaSalidaN = await FormatearFecha2(fec_final, 'ddd');


      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eu_empleado_cargos',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: `{id_contrato: ${id_empl_contrato}, id_departamento: ${id_departamento}, id_sucursal: ${id_sucursal}, id_tipo_cargo: ${cargo}, fecha_inicio: ${fechaIngresoN}, fecha_final: ${fechaSalidaN}, sueldo: ${sueldo}, hora_trabaja: ${hora_trabaja}}`,
        ip,
        observacion: null
      });
      
      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');

      res.jsonp({ message: 'Registro guardado.' });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      res.status(500).jsonp({ message: 'Error al guardar el registro.' });
    }
  }

  // METODO PARA ACTUALIZAR REGISTRO
  public async EditarCargo(req: Request, res: Response): Promise<Response> {
    try {
      const { id_empl_contrato, id } = req.params;
      const { id_departamento, fec_inicio, fec_final, id_sucursal, sueldo, hora_trabaja, cargo, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      // CONSULTAR DATOSORIGINALES
      const cargoConsulta = await pool.query(
        `
        SELECT * FROM eu_empleado_cargos WHERE id = $1
        `
        , [id]);
      const [datosOriginales] = cargoConsulta.rows;

      if (!datosOriginales) {
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'eu_empleado_cargos',
          usuario: user_name,
          accion: 'U',
          datosOriginales: '',
          datosNuevos: '',
          ip,
          observacion: `Error al actualizar el cargo con id ${id}. Registro no encontrado.`
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
        return res.status(404).jsonp({ message: 'Error al actualizar el registro.' });
      }

      await pool.query(
        `
        UPDATE eu_empleado_cargos SET id_departamento = $1, fecha_inicio = $2, fecha_final = $3, id_sucursal = $4, 
          sueldo = $5, hora_trabaja = $6, id_tipo_cargo = $7  
        WHERE id_contrato = $8 AND id = $9
        `
        , [id_departamento, fec_inicio, fec_final, id_sucursal, sueldo, hora_trabaja, cargo,
          id_empl_contrato, id]);

          
      var fechaIngresoO = await FormatearFecha2(datosOriginales.fecha_inicio, 'ddd');
      var fechaSalidaO = await FormatearFecha2(datosOriginales.fecha_final, 'ddd');
      var fechaIngresoN = await FormatearFecha2(fec_inicio, 'ddd');
      var fechaSalidaN = await FormatearFecha2(fec_final, 'ddd');
      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'eu_empleado_cargos',
        usuario: user_name,
        accion: 'U',
        datosOriginales: `{id_contrato: ${datosOriginales.id_contrato}, id_departamento: ${datosOriginales.id_departamento}, id_sucursal: ${datosOriginales.id_sucursal}, id_tipo_cargo: ${datosOriginales.id_tipo_cargo}, fecha_inicio: ${fechaIngresoO}, fecha_final: ${fechaSalidaO}, sueldo: ${datosOriginales.sueldo}, hora_trabaja: ${datosOriginales.hora_trabaja}}`,
        datosNuevos: `{id_contrato: ${id_empl_contrato}, id_departamento: ${id_departamento}, id_sucursal: ${id_sucursal}, id_tipo_cargo: ${cargo}, fecha_inicio: ${fechaIngresoN}, fecha_final: ${fechaSalidaN}, sueldo: ${sueldo}, hora_trabaja: ${hora_trabaja}}`,
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');
      return res.jsonp({ message: 'Registro actualizado exitosamente.' });
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'Error al actualizar el registro.' });
    }
  }

  // METODO PARA BUSCAR DATOS DE CARGO POR ID CONTRATO
  public async EncontrarCargoIDContrato(req: Request, res: Response): Promise<any> {
    const { id_empl_contrato } = req.params;
    const unEmplCargp = await pool.query(
      `
      SELECT ec.id, ec.id_tipo_cargo, ec.fecha_inicio, ec.fecha_final, ec.sueldo, ec.hora_trabaja, 
        s.nombre AS sucursal, d.nombre AS departamento 
      FROM eu_empleado_cargos AS ec, e_sucursales AS s, ed_departamentos AS d 
      WHERE ec.id_contrato = $1 AND ec.id_sucursal = s.id AND ec.id_departamento = d.id
      `
      , [id_empl_contrato]);
    if (unEmplCargp.rowCount != 0) {
      return res.jsonp(unEmplCargp.rows)
    }
    else {
      return res.status(404).jsonp({ message: 'error' });
    }
  }


  // METODO PARA BUSCAR FECHAS DE CARGOS INTERMEDIOS
  public async BuscarCargosFecha(req: Request, res: Response): Promise<any> {
    const { id_empleado, fecha_verificar } = req.body;
    const CARGOS = await pool.query(
      `
      SELECT dc.empl_id, ec.id AS id_cargo, ec.fecha_inicio, ec.fecha_final
      FROM eu_empleado_cargos AS ec, datos_empleado_cargo AS dc
      WHERE ec.id = dc.cargo_id AND dc.empl_id = $1 AND $2 < ec.fecha_final
      `
      , [id_empleado, fecha_verificar]);
    if (CARGOS.rowCount != 0) {
      return res.jsonp(CARGOS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }

  // METODO PARA BUSCAR FECHAS DE CARGOS INTERMEDIOS
  public async BuscarCargosFechaEditar(req: Request, res: Response): Promise<any> {
    const { id_empleado, fecha_verificar, id_cargo } = req.body;
    const CARGOS = await pool.query(
      `
        SELECT dc.empl_id, ec.id AS id_cargo, ec.fecha_inicio, ec.fecha_final
        FROM eu_empleado_cargos AS ec, datos_empleado_cargo AS dc
        WHERE ec.id = dc.cargo_id AND dc.empl_id = $1 AND $2 < ec.fecha_final AND NOT ec.id = $3
        `
      , [id_empleado, fecha_verificar, id_cargo]);
    if (CARGOS.rowCount != 0) {
      return res.jsonp(CARGOS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }



  public async EncontrarIdCargo(req: Request, res: Response): Promise<any> {
    const { id_empleado } = req.params;
    const CARGO = await pool.query(
      `
      SELECT ec.id 
      FROM eu_empleado_cargos AS ec, eu_empleado_contratos AS ce, eu_empleados AS e 
      WHERE ce.id_empleado = e.id AND ec.id_contrato = ce.id AND e.id = $1
      `
      , [id_empleado]);
    if (CARGO.rowCount != 0) {
      return res.jsonp(CARGO.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }

  public async EncontrarIdCargoActual(req: Request, res: Response): Promise<any> {
    const { id_empleado } = req.params;
    const CARGO = await pool.query(
      `
      SELECT ec.id AS max, ec.hora_trabaja 
      FROM datos_actuales_empleado AS da, eu_empleado_cargos AS ec
      WHERE ec.id = da.id_cargo AND da.id = $1
      `
      ,
      [id_empleado]);
    if (CARGO.rowCount != 0 && CARGO.rows[0]['max'] != null) {
      return res.jsonp(CARGO.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }










  public async BuscarTipoDepartamento(req: Request, res: Response) {
    const id = req.params.id;
    const Cargos = await pool.query(
      `
      SELECT tc.id, tc.cargo 
      FROM e_cat_tipo_cargo AS tc, eu_empleado_cargos AS ec
      WHERE tc.id = ec.id_tipo_cargo AND id_departamento = $1 
      GROUP BY tc.cargo, tc.id
      `
      , [id]);
    if (Cargos.rowCount != 0) {
      return res.jsonp(Cargos.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }

  public async BuscarTipoSucursal(req: Request, res: Response) {
    const id = req.params.id;
    const Cargos = await pool.query(
      `
      SELECT tc.id, tc.cargo 
      FROM e_cat_tipo_cargo AS tc, eu_empleado_cargos AS ec 
      WHERE tc.id = ec.id_tipo_cargo AND id_sucursal = $1 
      GROUP BY tc.cargo, tc.id
      `
      , [id]);
    if (Cargos.rowCount != 0) {
      return res.jsonp(Cargos.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }

  public async BuscarTipoRegimen(req: Request, res: Response) {
    const id = req.params.id;
    const Cargos = await pool.query(
      `
      SELECT tc.id, tc.cargo 
      FROM ere_cat_regimenes AS r, eu_empleado_cargos AS ec, eu_empleado_contratos AS c, e_cat_tipo_cargo AS tc 
      WHERE c.id_regimen = r.id AND c.id = ec.id_contrato AND ec.id_tipo_cargo = tc.id AND r.id = $1 
      GROUP BY tc.id, tc.cargo
      `
      , [id]);
    if (Cargos.rowCount != 0) {
      return res.jsonp(Cargos.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }

  /** **************************************************************************************** **
   ** **                  METODOS DE CONSULTA DE TIPOS DE CARGOS                            ** ** 
   ** **************************************************************************************** **/

  // METODO DE BUSQUEDA DE TIPO DE CARGOS
  public async ListarTiposCargo(req: Request, res: Response) {
    const Cargos = await pool.query(
      `
      SELECT * FROM e_cat_tipo_cargo
      `
    );
    if (Cargos.rowCount != 0) {
      return res.jsonp(Cargos.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado.' });
    }
  }

  // METODO DE REGISTRO DE TIPO DE CARGO
  public async CrearTipoCargo(req: Request, res: Response): Promise<Response> {
    try {
      const { cargo, user_name, ip } = req.body;

      // INICIAR TRANSACCION
      await pool.query('BEGIN');

      const response: QueryResult = await pool.query(
        `
        INSERT INTO e_cat_tipo_cargo (cargo) VALUES ($1) RETURNING *
        `
        , [cargo]);

      const [tipo_cargo] = response.rows;

      // AUDITORIA
      await AUDITORIA_CONTROLADOR.InsertarAuditoria({
        tabla: 'e_cat_tipo_cargo',
        usuario: user_name,
        accion: 'I',
        datosOriginales: '',
        datosNuevos: `{cargo: ${cargo}}`,
        ip,
        observacion: null
      });

      // FINALIZAR TRANSACCION
      await pool.query('COMMIT');

      if (tipo_cargo) {
        return res.status(200).jsonp(tipo_cargo)
      }
      else {
        return res.status(404).jsonp({ message: 'error' })
      }
    } catch (error) {
      // REVERTIR TRANSACCION
      await pool.query('ROLLBACK');
      return res.status(500).jsonp({ message: 'error' })
    }
  }



  // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR
  public async RevisarDatos(req: Request, res: Response): Promise<any> {
    const documento = req.file?.originalname;
    let separador = path.sep;
    let ruta = ObtenerRutaLeerPlantillas() + separador + documento;

    const workbook = excel.readFile(ruta);
    let verificador = ObtenerIndicePlantilla(workbook, 'EMPLEADOS_CARGOS');
    if (verificador === false) {
      return res.jsonp({ message: 'no_existe', data: undefined });
    }
    else {
      const sheet_name_list = workbook.SheetNames;
      const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[verificador]]);
      let data: any = {
        fila: '',
        cedula: '',
        departamento: '',
        fecha_desde: '',
        fecha_hasta: '',
        sucursal: '',
        sueldo: '',
        cargo: '',
        hora_trabaja: '',
        jefe: '',
        observacion: ''
      };

      var listCargos: any = [];
      var duplicados: any = [];
      var mensaje: string = 'correcto';


      // LECTURA DE LOS DATOS DE LA PLANTILLA
      plantilla.forEach(async (dato: any) => {
        var { ITEM, CEDULA, DEPARTAMENTO, FECHA_DESDE, FECHA_HASTA, SUCURSAL, SUELDO,
          CARGO, HORA_TRABAJA, JEFE } = dato;

        console.log('dato: ', dato)

        //Verificar que el registo no tenga datos vacios
        if ((ITEM != undefined && ITEM != '') && (CEDULA != undefined) && (DEPARTAMENTO != undefined) &&
          (FECHA_DESDE != undefined) && (FECHA_HASTA != undefined) && (SUCURSAL != undefined) &&
          (SUELDO != undefined) && (CARGO != undefined) && (HORA_TRABAJA != undefined) &&
          (JEFE != undefined)) {
          data.fila = ITEM;
          data.cedula = CEDULA; data.departamento = DEPARTAMENTO;
          data.fecha_inicio = FECHA_DESDE; data.fecha_final = FECHA_HASTA;
          data.sucursal = SUCURSAL; data.sueldo = SUELDO;
          data.cargo = CARGO; data.hora_trabaja = HORA_TRABAJA;
          data.jefe = JEFE;

          data.observacion = 'no registrado';

          //Valida si los datos de la columna cedula son numeros.
          const rege = /^[0-9]+$/;
          if (rege.test(data.cedula)) {
            if (data.cedula.toString().length != 10) {
              data.observacion = 'La cédula ingresada no es válida';
            } else {
              // Verificar si la variable tiene el formato de fecha correcto con moment
              if (moment(FECHA_DESDE, 'YYYY-MM-DD', true).isValid()) { } else {
                data.observacion = 'Formato de fecha inicio incorrecto (YYYY-MM-DD)';
              }
              // Verificar si la variable tiene el formato de fecha correcto con moment
              if (moment(FECHA_HASTA, 'YYYY-MM-DD', true).isValid()) { } else {
                data.observacion = 'Formato de fecha final incorrecto (YYYY-MM-DD)';
              }

              //Verifica el valor del suelo que sea solo numeros
              if (typeof data.sueldo != 'number' && isNaN(data.sueldo)) {
                data.observacion = 'El sueldo es incorrecto';
              }

              if (data.hora_trabaja != 'No registrado') {
                if (moment(HORA_TRABAJA, 'HH:mm:ss', true).isValid()) { } else {
                  data.observacion = 'Formato horas invalido  (HH:mm:ss)';
                }
              }

            }
          } else {
            data.observacion = 'La cédula ingresada no es válida';
          }

          listCargos.push(data);

        } else {
          data.fila = ITEM;
          data.cedula = CEDULA; data.departamento = DEPARTAMENTO;
          data.fecha_inicio = FECHA_DESDE; data.fecha_final = FECHA_HASTA;
          data.sucursal = SUCURSAL; data.sueldo = SUELDO;
          data.cargo = CARGO; data.hora_trabaja = HORA_TRABAJA;
          data.jefe = JEFE;
          data.observacion = 'no registrado';

          if (data.fila == '' || data.fila == undefined) {
            data.fila = 'error';
            mensaje = 'error'
          }
          if (DEPARTAMENTO == undefined) {
            data.departamento = 'No registrado';
            data.observacion = 'Departamento ' + data.observacion;
          }
          if (FECHA_DESDE == undefined) {
            data.fecha_inicio = 'No registrado';
            data.observacion = 'Fecha inicio ' + data.observacion;
          }
          if (FECHA_HASTA == undefined) {
            data.fecha_final = 'No registrado';
            data.observacion = 'Fecha final ' + data.observacion;
          }
          if (SUCURSAL == undefined) {
            data.sucursal = 'No registrado';
            data.observacion = 'Sucursal ' + data.observacion;
          }
          if (SUELDO == undefined) {
            data.sueldo = 'No registrado';
            data.observacion = 'Sueldo ' + data.observacion;
          }
          if (CARGO == undefined) {
            data.cargo = 'No registrado';
            data.observacion = 'Cargo ' + data.observacion;
          }
          if (HORA_TRABAJA == undefined) {
            data.hora_trabaja = 'No registrado';
            data.observacion = 'Hora trabaja ' + data.observacion;
          }
          if (JEFE == undefined) {
            data.jefe = 'No registrado';
            data.observacion = 'Jefe ' + data.observacion;
          }

          if (CEDULA == undefined) {
            data.cedula = 'No registrado'
            data.observacion = 'Cédula ' + data.observacion;
          } else {
            //Valida si los datos de la columna cedula son numeros.
            const rege = /^[0-9]+$/;
            if (rege.test(data.cedula)) {
              if (data.cedula.toString().length != 10) {
                data.observacion = 'La cédula ingresada no es válida';
              } else {
                // Verificar si la variable tiene el formato de fecha correcto con moment
                if (data.fecha_inicio != 'No registrado') {
                  if (moment(FECHA_DESDE, 'YYYY-MM-DD', true).isValid()) { } else {
                    data.observacion = 'Formato de fecha inicio incorrecto (YYYY-MM-DD)';
                  }
                } else
                  // Verificar si la variable tiene el formato de fecha correcto con moment
                  if (data.fecha_final != 'No registrado') {
                    if (moment(FECHA_HASTA, 'YYYY-MM-DD', true).isValid()) { } else {
                      data.observacion = 'Formato de fecha final incorrecto (YYYY-MM-DD)';
                    }
                  } else
                    //Verifica el valor del suelo que sea solo numeros
                    if (typeof data.sueldo != 'number' && isNaN(data.sueldo)) {
                      data.observacion = 'El sueldo es incorrecto';
                    } else
                      //Verficar formato de horas
                      if (data.hora_trabaja != 'No registrado') {
                        if (moment(HORA_TRABAJA, 'HH:mm:ss', true).isValid()) { } else {
                          data.observacion = 'Formato horas invalido  (HH:mm:ss)';
                        }
                      }
              }
            } else {
              data.observacion = 'La cédula ingresada no es válida';
            }

          }



          listCargos.push(data);


        }

        data = {}

      });

      // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
      fs.access(ruta, fs.constants.F_OK, (err) => {
        if (err) {
        } else {
          // ELIMINAR DEL SERVIDOR
          fs.unlinkSync(ruta);
        }
      });

      listCargos.forEach(async (valor: any) => {
        if (valor.cedula != 'No registrado' && valor.pais != 'No registrado' && valor.pais != '') {
          if (valor.observacion == 'no registrado') {
            var VERIFICAR_CEDULA = await pool.query(
              `
              SELECT * FROM eu_empleados WHERE cedula = $1
              `
              , [valor.cedula]);
            if (VERIFICAR_CEDULA.rows[0] != undefined && VERIFICAR_CEDULA.rows[0] != '') {
              const ID_CONTRATO: any = await pool.query(
                `
                SELECT id_contrato FROM datos_contrato_actual WHERE cedula = $1
                `
                , [valor.cedula]);
              if (ID_CONTRATO.rows[0] != undefined && ID_CONTRATO.rows[0].id_contrato != null &&
                ID_CONTRATO.rows[0].id_contrato != 0 && ID_CONTRATO.rows[0].id_contrato != ''
              ) {
                const fechaRango: any = await pool.query(
                  `
                  SELECT * FROM eu_empleado_cargos 
                  WHERE id_contrato = $1 AND 
                  ($2  BETWEEN fecha_inicio and fecha_final or $3 BETWEEN fecha_inicio and fecha_final or 
                  fecha_inicio BETWEEN $2 AND $3)
                  `
                  , [ID_CONTRATO.rows[0].id_contrato, valor.fecha_inicio, valor.fecha_final])

                if (fechaRango.rows[0] != undefined && fechaRango.rows[0] != '') {
                  valor.observacion = 'Existe un cargo vigente en esas fechas'
                } else {
                  var VERIFICAR_DEPARTAMENTO = await pool.query(
                    `
                    SELECT  * FROM ed_departamentos WHERE UPPER(nombre) = $1
                    `
                    , [valor.departamento.toUpperCase()])
                  if (VERIFICAR_DEPARTAMENTO.rows[0] != undefined && VERIFICAR_DEPARTAMENTO.rows[0] != '') {
                    var VERIFICAR_SUCURSALES = await pool.query(
                      `
                      SELECT * FROM e_sucursales WHERE UPPER(nombre) = $1
                      `
                      , [valor.sucursal.toUpperCase()])
                    if (VERIFICAR_SUCURSALES.rows[0] != undefined && VERIFICAR_SUCURSALES.rows[0] != '') {
                      var VERFICAR_CARGO = await pool.query(
                        `
                        SELECT * FROM e_cat_tipo_cargo WHERE UPPER(cargo) = $1
                        `
                        , [valor.cargo.toUpperCase()])
                      if (VERFICAR_CARGO.rows[0] != undefined && VERIFICAR_CEDULA.rows[0] != '') {
                        if (moment(valor.fecha_inicio).format('YYYY-MM-DD') >= moment(valor.fecha_final).format('YYYY-MM-DD')) {
                          valor.observacion = 'La fecha de inicio no puede ser menor o igual a la fecha salida'
                        }
                      } else {
                        valor.observacion = 'Cargo no existe en el sistema'
                      }
                    } else {
                      valor.observacion = 'Sucursal no existe en el sistema'
                    }
                  } else {
                    valor.observacion = 'Departamento no existe en el sistema'
                  }

                }

              } else {
                valor.observacion = 'Cédula no tiene registrado un contrato'
              }

            } else {
              valor.observacion = 'Cédula no existe en el sistema'
            }

            // Discriminación de elementos iguales
            if (duplicados.find((p: any) => p.cedula === valor.cedula) == undefined) {
              duplicados.push(valor);
            } else {
              valor.observacion = '1';
            }

          }

        }

      });

      setTimeout(() => {

        listCargos.sort((a: any, b: any) => {
          // COMPARA LOS NUMEROS DE LOS OBJETOS
          if (a.fila < b.fila) {
            return -1;
          }
          if (a.fila > b.fila) {
            return 1;
          }
          return 0; // SON IGUALES
        });

        var filaDuplicada: number = 0;

        listCargos.forEach((item: any) => {
          if (item.observacion == '1') {
            item.observacion = 'Registro duplicado (cédula)'
          }

          if (item.observacion != undefined) {
            let arrayObservacion = item.observacion.split(" ");
            if (arrayObservacion[0] == 'no') {
              item.observacion = 'ok'
            }
          }

          // VALIDA SI LOS DATOS DE LA COLUMNA N SON NUMEROS.
          if (typeof item.fila === 'number' && !isNaN(item.fila)) {
            // CONDICION PARA VALIDAR SI EN LA NUMERACION EXISTE UN NUMERO QUE SE REPITE DARA ERROR.
            if (item.fila == filaDuplicada) {
              mensaje = 'error';
            }
          } else {
            return mensaje = 'error';
          }

          filaDuplicada = item.fila;

        });

        if (mensaje == 'error') {
          listCargos = undefined;
        }

        console.log('listContratos: ', listCargos);

        return res.jsonp({ message: mensaje, data: listCargos });

      }, 1500)
    }


  }

  public async CargarPlantilla_cargos(req: Request, res: Response): Promise<void> {
    const plantilla = req.body;
    var contador = 1;
    plantilla.forEach(async (data: any) => {
      console.log('data: ', data);

      // Datos que se guardaran de la plantilla ingresada
      const { item, cedula, departamento, fecha_inicio, fecha_final, sucursal, sueldo,
        cargo, hora_trabaja, jefe } = data;

      const ID_EMPLEADO: any = await pool.query(
        `
        SELECT id FROM eu_empleados WHERE UPPER(cedula) = $1
        `
        , [cedula]);
      const ID_CONTRATO: any = await pool.query(
        `
        SELECT id_contrato FROM datos_contrato_actual WHERE cedula = $1
        `
        , [cedula]);
      const ID_DEPARTAMENTO: any = await pool.query(
        `
        SELECT id FROM ed_departamentos WHERE UPPER(nombre) = $1
        `
        , [departamento.toUpperCase()]);
      const ID_SUCURSAL: any = await pool.query(
        `
        SELECT id FROM e_sucursales WHERE UPPER(nombre) = $1
        `
        , [sucursal.toUpperCase()]);
      const ID_TIPO_CARGO: any = await pool.query(
        `
        SELECT id FROM e_cat_tipo_cargo WHERE UPPER(cargo) = $1
        `
        , [cargo.toUpperCase()]);

      var Jefe: any;
      if (jefe.toUpperCase() === 'SI') {
        Jefe = true;
      } else {
        Jefe = false;
      }

      var id_empleado = ID_EMPLEADO.rows[0].id;
      var id_contrato = ID_CONTRATO.rows[0].id_contrato;
      var id_departamento = ID_DEPARTAMENTO.rows[0].id;
      var id_sucursal = ID_SUCURSAL.rows[0].id;
      var id_cargo = ID_TIPO_CARGO.rows[0].id

      console.log('id_empleado: ', ID_EMPLEADO.rows[0].id);
      console.log('id_empleado: ', ID_CONTRATO.rows[0].id_contrato);
      console.log('fecha inicio: ', fecha_inicio);
      console.log('fecha final: ', fecha_final);
      console.log('departamento: ', ID_DEPARTAMENTO.rows[0].id);
      console.log('sucursal: ', ID_SUCURSAL.rows[0].id);
      console.log('sueldo: ', sueldo);
      console.log('hora_trabaja: ', hora_trabaja);
      console.log('tipo cargo: ', ID_TIPO_CARGO.rows[0].id);
      console.log('Jefe: ', Jefe);

      // Registro de los datos de contratos
      const response: QueryResult = await pool.query(
        `
        INSERT INTO eu_empleado_cargos (id_contrato, id_departamento, fecha_inicio, fecha_final, id_sucursal, 
          sueldo, id_tipo_cargo, hora_trabaja, jefe) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
        `
        , [id_contrato, id_departamento, fecha_inicio, fecha_final, id_sucursal, sueldo, id_cargo,
          hora_trabaja, Jefe]);

      const [cargos] = response.rows;

      console.log(contador, ' == ', plantilla.length);
      if (contador === plantilla.length) {
        if (cargos) {
          return res.status(200).jsonp({ message: 'ok' })
        } else {
          return res.status(404).jsonp({ message: 'error' })
        }
      }

      contador = contador + 1;

    });

  }

}

export const EMPLEADO_CARGO_CONTROLADOR = new EmpleadoCargosControlador();

export default EMPLEADO_CARGO_CONTROLADOR;