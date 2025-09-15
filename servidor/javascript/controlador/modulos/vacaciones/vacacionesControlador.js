"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VACACIONES_CONTROLADOR = void 0;
const auditoriaControlador_1 = __importDefault(require("../../reportes/auditoriaControlador"));
const settingsMail_1 = require("../../../libs/settingsMail");
const CargarVacacion_1 = require("../../../libs/CargarVacacion");
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
const luxon_1 = require("luxon");
const accesoCarpetas_2 = require("../../../libs/accesoCarpetas");
const database_1 = __importDefault(require("../../../database"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class VacacionesControlador {
    constructor() {
        //METODO QUE REALIZA LA VERIFICACION SI LA SOLICITUD DE VACACION ES APTA PARA SU REGISTRO
        this.VerificarVacacionesMultiples = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { empleados, fechaInicio, fechaFin, incluirFeriados, permiteHoras, numHoras } = req.body;
                const resultados = [];
                const fechaIni = new Date(fechaInicio);
                const fechaFin_ = new Date(fechaFin);
                for (const idEmpleado of empleados) {
                    //VERIFICA QUE EL EMPLEADO TENGA PERIODO DE VACACION Y SI ESE PERIODO ESTA ACTIVO
                    const periodos = yield database_1.default.query(`SELECT * FROM mv_periodo_vacacion WHERE id_empleado = $1`, [idEmpleado]);
                    if (periodos.rowCount === 0) {
                        resultados.push({ idEmpleado, observacion: 'Empleado sin periodo registrado' });
                        continue;
                    }
                    const periodoActivo = periodos.rows.find((p) => p.estado === true);
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
                    const saldoResult = yield database_1.default.query(`SELECT public.fn_obtener_saldo_vacaciones($1) AS saldo`, [idEmpleado]);
                    const saldoDisponible = parseFloat(saldoResult.rows[0].saldo);
                    //VALIDACION CUANDO EL TIPO DE VACACION ES POR HORAS
                    if (permiteHoras) {
                        let horasSolicitadas;
                        if (typeof numHoras === 'string' && numHoras.includes(':')) {
                            const [horas, minutos] = numHoras.split(':').map(Number);
                            horasSolicitadas = horas + (minutos / 60);
                        }
                        else {
                            horasSolicitadas = parseFloat(numHoras);
                        }
                        if (!horasSolicitadas || isNaN(horasSolicitadas)) {
                            resultados.push({
                                idEmpleado,
                                observacion: 'Número de horas inválido'
                            });
                            continue;
                        }
                        const contrato = yield database_1.default.query(`
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
                        }
                        else {
                            resultados.push({
                                idEmpleado,
                                observacion: `Saldo insuficiente`
                            });
                        }
                    }
                    //VALIDACION CUANDO EL TIPO DE VACACION ES POR DIAS
                    else {
                        const diasSolicitados = yield this.contarDiasSolicitados(fechaIni, fechaFin_, incluirFeriados);
                        if (saldoDisponible < diasSolicitados) {
                            resultados.push({ idEmpleado, observacion: `Saldo insuficiente` });
                            continue;
                        }
                        resultados.push({ idEmpleado, observacion: 'Ok' });
                    }
                }
                return res.json(resultados);
            }
            catch (error) {
                console.error('Error en VerificarVacacionesMultiples:', error);
                return res.status(500).jsonp({ text: 'Error al verificar los empleados.' });
            }
        });
        this.EditarSolicitudVacaciones = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const data = __rest(req.body, []);
            try {
                const response = yield database_1.default.query(`UPDATE mv_solicitud_vacacion SET
          id_empleado = $1, id_cargo_vigente = $2, id_periodo_vacacion = $3,
          fecha_inicio = $4, fecha_final = $5, estado = $6, numero_dias_lunes = $7,
          numero_dias_martes = $8, numero_dias_miercoles = $9, numero_dias_jueves = $10,
          numero_dias_viernes = $11, numero_dias_sabado = $12, numero_dias_domingo = $13,
          numero_dias_totales = $14, incluir_feriados = $15, documento = $16, minutos_totales = $17
        WHERE id = $18 RETURNING *`[data.id_empleado,
                    data.id_cargo_vigente,
                    data.id_periodo_vacacion,
                    data.fecha_inicio,
                    data.fecha_final,
                    data.estado,
                    data.numero_dias_lunes,
                    data.numero_dias_martes,
                    data.numero_dias_miercoles,
                    data.numero_dias_jueves,
                    data.numero_dias_viernes,
                    data.numero_dias_sabado,
                    data.numero_dias_domingo,
                    data.numero_dias_totales,
                    data.incluir_feriados,
                    data.documento,
                    data.minutos_totales,
                    data.id]);
                res.json(response.rows[0]);
                res.status(200).json({ message: "Solicitud actualizada exitosamente" });
            }
            catch (error) {
                res.status(500).json({ error: "Error al actualizar una solicitud" });
            }
        });
    }
    // METODO PARA BUSCAR VACACIONES POR ID DE PERIODO    **USADO
    VacacionesIdPeriodo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const VACACIONES = yield database_1.default.query(`
      SELECT *
      FROM mv_solicitud_vacacion
      WHERE id_periodo_vacacion = $1 
      ORDER BY id DESC
      `, [id]);
            if (VACACIONES.rowCount != 0) {
                return res.jsonp(VACACIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    /*
      public async ListarVacaciones(req: Request, res: Response) {
        const { estado } = req.body;
        const VACACIONES = await pool.query(
          `
          SELECT v.fecha_inicio, v.fecha_final, v.fecha_ingreso, v.estado, v.dia_libre, v.dia_laborable, v.legalizado,
            v.id, v.id_periodo_vacacion, dc.id_contrato AS contrato_id, e.id AS id_empl_solicita, da.id_depa,
            e.nombre, e.apellido, (e.nombre || \' \' || e.apellido) AS fullname, da.codigo, depa.nombre AS depa_nombre
          FROM mv_solicitud_vacacion AS v, cargos_empleado AS dc, eu_empleados AS e, informacion_general AS da,
            ed_departamentos AS depa
          WHERE dc.id_empleado = e.id
            AND da.id_contrato = dc.id_contrato
            AND depa.id = da.id_depa
            AND (v.estado = 1 OR v.estado = 2)
            AND da.estado = $1
          ORDER BY id DESC
          `
          , [estado]
        );
    
        if (VACACIONES.rowCount != 0) {
          return res.jsonp(VACACIONES.rows)
        }
        else {
          return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
      }*/
    /*
  public async ListarVacacionesAutorizadas(req: Request, res: Response) {
    const VACACIONES = await pool.query(
      `
      SELECT v.fecha_inicio, v.fecha_final, v.fecha_ingreso, v.estado, v.dia_libre, v.dia_laborable, v.legalizado,
        v.id, v.id_periodo_vacacion, e.id AS id_empl_solicita, e.nombre, e.apellido,
        (e.nombre || \' \' || e.apellido) AS fullname, dc.codigo, depa.nombre AS depa_nombre
      FROM mv_solicitud_vacacion AS v, cargos_empleado AS dc, eu_empleados AS e, ed_departamentos AS depa
      WHERE dc.id_empleado = e.id  AND depa.id = dc.id_departamento
        AND (v.estado = 3 OR v.estado = 4)
      ORDER BY id DESC
      `
    );
    if (VACACIONES.rowCount != 0) {
      return res.jsonp(VACACIONES.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros.' });
    }
  }
  
  public async ObtenerFechasFeriado(req: Request, res: Response): Promise<any> {
    const { fechaSalida, fechaIngreso } = req.body;
    const FECHAS = await pool.query(
      `
      SELECT fecha FROM ef_cat_feriados WHERE fecha BETWEEN $1 AND $2 ORDER BY fecha ASC
      `
      , [fechaSalida, fechaIngreso]);
    if (FECHAS.rowCount != 0) {
      return res.jsonp(FECHAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }
  }*/
    ObtenerSolicitudVacaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_empleado;
            const SOLICITUD = yield database_1.default.query(`
      SELECT * FROM mv_solicitud_vacacion WHERE id_empleado = $1 ORDER BY fecha_inicio DESC
      `, [id]);
            if (SOLICITUD.rowCount != 0) {
                return res.json(SOLICITUD.rows);
            }
            else {
                return res.status(404).json({ text: 'No se encuentran registros.' });
            }
        });
    }
    ObtenerAutorizacionVacaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_vacaciones;
            const SOLICITUD = yield database_1.default.query(`
      SELECT a.id AS id_autorizacion, a.id_autoriza_estado AS empleado_estado, 
        v.id AS vacacion_id 
      FROM ecm_autorizaciones AS a, mv_solicitud_vacacion AS v 
      WHERE v.id = a.id_vacacion AND v.id = $1
      `, [id]);
            if (SOLICITUD.rowCount != 0) {
                return res.json(SOLICITUD.rows);
            }
            else {
                return res.status(404).json({ text: 'No se encuentran registros.' });
            }
        });
    }
    //METODO PARA OBTENER DATOS DE LA VACACION CONFIGURADA
    /* public async ObtenerParametroIncluirVacacion(req: Request, res: Response): Promise<any> {
       const { id } = req.params;
       console.log("DATO DE OBTENER PARAMETRO:", req);
       const SOLICITUD = await pool.query(
         `
       SELECT * FROM mv_configurar_vacaciones WHERE id = $1
       `,
         [id]
       );
   
       if (SOLICITUD.rowCount != 0) {
         return res.json(SOLICITUD.rows[0]);
       } else {
         return res.status(404).json({ text: 'No se encuentra la configuración.' });
       }
     }*/
    //METODO PARA LISTAR VACACIONES CONFIGURADAS
    ListarVacacionesConfiguradas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const SOLICITUD = yield database_1.default.query(`
    SELECT * FROM mv_configurar_vacaciones
    `);
            if (SOLICITUD.rowCount != 0) {
                return res.json(SOLICITUD.rows);
            }
            else {
                return res.status(404).json({ text: 'No se encontraron configuraciones.' });
            }
        });
    }
    //METODO QUE CUENTA DIAS ENTRE DOS FECHAS INCLUYENDO FINES DE SEMANA, EXCLUYE FERIADOS DEPENDIENDO EL TIPO DE VACACION
    contarDiasSolicitados(fechaInicio, fechaFin, incluirFeriados) {
        return __awaiter(this, void 0, void 0, function* () {
            let count = 0;
            const current = new Date(fechaInicio);
            let feriados = [];
            if (!incluirFeriados) {
                const result = yield database_1.default.query(`SELECT fecha FROM ef_cat_feriados`);
                feriados = result.rows.map((row) => row.fecha.toISOString().split('T')[0]);
            }
            while (current <= fechaFin) {
                const fechaStr = current.toISOString().split('T')[0];
                if (incluirFeriados || !feriados.includes(fechaStr)) {
                    count++;
                }
                current.setDate(current.getDate() + 1);
            }
            return count;
        });
    }
    /** ********************************************************************************************* **
     ** **                        METODOS DE REGISTROS DE VACACIONES                               ** **
     ** ********************************************************************************************* **/
    // METODO PARA CREAR REGISTRO DE VACACIONES
    CrearVacaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            try {
                const { id_empleado, fecha_inicio, fecha_final, incluir_feriados, num_lunes, num_martes, num_miercoles, num_jueves, num_viernes, num_sabado, num_domingo, num_dias_totales, user_name, ip, ip_local, subir_documento, permite_horas, num_horas } = req.body;
                if (subir_documento === true) {
                    const carpetaVacaciones = yield (0, accesoCarpetas_2.ObtenerRutaVacacion)(id_empleado);
                    try {
                        yield fs_1.default.promises.access(carpetaVacaciones);
                    }
                    catch (err) {
                        try {
                            yield fs_1.default.promises.mkdir(carpetaVacaciones, { recursive: true });
                        }
                        catch (mkdirErr) {
                            return res.status(500).jsonp({ message: 'error_carpeta' });
                        }
                    }
                }
                // INICIAR TRANSACCIÓN
                yield database_1.default.query('BEGIN');
                // OBTENER id_cargo_vigente
                const cargo = yield database_1.default.query(`
      SELECT car.id AS id_cargo_vigente
      FROM eu_empleado_cargos car
      JOIN contrato_cargo_vigente ccv ON ccv.id_cargo = car.id
      JOIN eu_empleado_contratos ec ON ec.id = ccv.id_contrato
      WHERE ec.id_empleado = $1
      LIMIT 1
    `, [id_empleado]);
                const id_cargo_vigente = (_a = cargo.rows[0]) === null || _a === void 0 ? void 0 : _a.id_cargo_vigente;
                // OBTENER id_periodo_vacacion
                const periodo = yield database_1.default.query(`
      SELECT id AS id_periodo_vacacion
      FROM mv_periodo_vacacion
      WHERE id_empleado = $1
      AND estado = true
      LIMIT 1
    `, [id_empleado]);
                const id_periodo_vacacion = (_b = periodo.rows[0]) === null || _b === void 0 ? void 0 : _b.id_periodo_vacacion;
                // OBTENER horas del contrato
                const horasContratoResult = yield database_1.default.query(`
      SELECT car.hora_trabaja
      FROM eu_empleado_contratos ec
      JOIN contrato_cargo_vigente cv ON cv.id_contrato = ec.id
      JOIN eu_empleado_cargos car ON car.id = cv.id_cargo
      WHERE ec.id_empleado = $1
      LIMIT 1
    `, [id_empleado]);
                const hora_trabaja = parseFloat((_d = (_c = horasContratoResult.rows[0]) === null || _c === void 0 ? void 0 : _c.hora_trabaja) !== null && _d !== void 0 ? _d : 0);
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
                    let horasSolicitadas;
                    if (typeof num_horas === 'string' && num_horas.includes(':')) {
                        const [horas, minutos] = num_horas.split(':').map(Number);
                        horasSolicitadas = horas + (minutos / 60);
                    }
                    else {
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
                }
                else {
                    num_minutos_totales = Math.round(num_dias_totales * hora_trabaja * 60);
                }
                // INSERTAR SOLICITUD
                const response = yield database_1.default.query(`
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
                yield auditoriaControlador_1.default.InsertarAuditoria({
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
                yield database_1.default.query('COMMIT');
                return res.status(200).jsonp(objetoVacacion);
            }
            catch (error) {
                yield database_1.default.query('ROLLBACK');
                console.error('Error en CrearVacaciones:', error);
                return res.status(500).jsonp({ message: 'Error al guardar la solicitud de vacaciones.' });
            }
        });
    }
    /*
    // METODO DE EDICIÓN DE REGISTRO DE VACACIONES
    public async EditarVacaciones(req: Request, res: Response): Promise<Response> {
      try {
        const id = req.params.id
  
        const { fec_inicio, fec_final, fec_ingreso, dia_libre, dia_laborable, depa_user_loggin, user_name, ip, ip_local } = req.body;
  
        // INICIAR TRANSACCION
        await pool.query('BEGIN');
  
        // CONSULTAR DATOS ORIGINALES
        const consulta = await pool.query(`SELECT * FROM mv_solicitud_vacacion WHERE id = $1`, [id]);
        const [datosOriginales] = consulta.rows;
  
        if (!datosOriginales) {
          await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'mv_solicitud_vacacion',
            usuario: user_name,
            accion: 'U',
            datosOriginales: '',
            datosNuevos: '',
            ip: ip,
            ip_local: ip_local,
            observacion: `Error al intentar actualizar registro de vacación con id ${id}. Registro no encontrado.`
          });
  
          // FINALIZAR TRANSACCION
          await pool.query('COMMIT');
          return res.status(404).jsonp({ message: 'Registro no encontrado.' });
        }
  
        const response: QueryResult = await pool.query(
          `
          UPDATE mv_solicitud_vacacion SET fecha_inicio = $1, fecha_final = $2, fecha_ingreso = $3, dia_libre = $4,
          dia_laborable = $5 WHERE id = $6 RETURNING *
          `
          , [fec_inicio, fec_final, fec_ingreso, dia_libre, dia_laborable, id]);
  
        const [objetoVacacion] = response.rows;
  
        // AUDITORIA
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
          tabla: 'mv_solicitud_vacacion',
          usuario: user_name,
          accion: 'U',
          datosOriginales: JSON.stringify(datosOriginales),
          datosNuevos: JSON.stringify(objetoVacacion),
          ip: ip,
          ip_local: ip_local,
          observacion: null
        });
  
        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');
  
        if (!objetoVacacion) return res.status(400)
          .jsonp({ message: 'Upps !!! algo salio mal. Solicitud de vacación no ingresada.' })
  
        const vacacion = objetoVacacion;
  
        return res.status(200).jsonp(vacacion);
  
  
      } catch (error) {
        // REVERTIR TRANSACCION
        await pool.query('ROLLBACK');
        return res.status(500)
          .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
      }
    }*/
    // ELIMINAR SOLICITUD DE VACACION
    EliminarVacaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_name, ip, ip_local } = req.body;
                let { id_vacacion } = req.params;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOS ORIGINALES
                const consulta = yield database_1.default.query('SELECT * FROM ecm_realtime_notificacion WHERE id_vacaciones = $1', [id_vacacion]);
                const [datosOriginales] = consulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ecm_realtime_notificacion',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al intentar eliminar registro con id_vacaciones ${id_vacacion}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                yield database_1.default.query(`
        DELETE FROM ecm_realtime_notificacion WHERE id_vacaciones = $1
        `, [id_vacacion]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ecm_realtime_notificacion',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // CONSULTAR DATOS ORIGINALES AUTORIZACIONES
                const consultaAutorizaciones = yield database_1.default.query('SELECT * FROM ecm_autorizaciones WHERE id_vacacion = $1', [id_vacacion]);
                const [datosOriginalesAutorizaciones] = consultaAutorizaciones.rows;
                if (!datosOriginalesAutorizaciones) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ecm_autorizaciones',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al intentar eliminar registro con id_vacacion ${id_vacacion}. Registro no encontrado.`
                    });
                }
                yield database_1.default.query(`
        DELETE FROM ecm_autorizaciones WHERE id_vacacion = $1
        `, [id_vacacion]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ecm_autorizaciones',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(datosOriginalesAutorizaciones),
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // CONSULTAR DATOS ORIGINALES VACACIONES
                const consultaVacaciones = yield database_1.default.query(`SELECT * FROM mv_solicitud_vacacion WHERE id = $1`, [id_vacacion]);
                const [datosOriginalesVacaciones] = consultaVacaciones.rows;
                if (!datosOriginalesVacaciones) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'mv_solicitud_vacacion',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al intentar eliminar registro con id ${id_vacacion}. Registro no encontrado.`
                    });
                }
                const response = yield database_1.default.query(`
        DELETE FROM mv_solicitud_vacacion WHERE id = $1 RETURNING *
        `, [id_vacacion]);
                const [objetoVacacion] = response.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'mv_solicitud_vacacion',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(datosOriginalesVacaciones),
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (objetoVacacion) {
                    return res.status(200).jsonp(objetoVacacion);
                }
                else {
                    return res.status(404).jsonp({ message: 'Solicitud no eliminada.' });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    /*
      // BUSCAR VACACIONES MEDIANTE ID DE VACACION *** revisar toma de estado
      public async ListarVacacionId(req: Request, res: Response) {
        const { id } = req.params;
        const { estado } = req.body; // ---
        const VACACIONES = await pool.query(
          `
          SELECT v.id, v.fecha_inicio, v.fecha_final, fecha_ingreso, v.estado, v.dia_libre, v.dia_laborable,
            v.legalizado, v.id, v.id_periodo_vacacion, e.id AS id_empleado, de.id_contrato
          FROM mv_solicitud_vacacion AS v, eu_empleados AS e, informacion_general AS de
          WHERE v.id = $1 AND e.id = v.id_empleado AND e.id = de.id AND de.estado = $2
          `
          , [id, estado]);
        if (VACACIONES.rowCount != 0) {
          return res.jsonp(VACACIONES.rows)
        }
        else {
          return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
      }*/
    // ACTUALIZAR ESTADO DE SOLICITUD DE VACACIONES
    ActualizarEstado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { estado, user_name, ip, ip_local } = req.body;
                console.log('estado', id);
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOS ORIGINALES
                const consulta = yield database_1.default.query(`SELECT * FROM mv_solicitud_vacacion WHERE id = $1`, [id]);
                const [datosOriginales] = consulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'mv_solicitud_vacacion',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        ip_local: ip_local,
                        observacion: `Error al intentar actualizar registro de vacación con id ${id}. Registro no encontrado.`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                yield database_1.default.query(`
        UPDATE mv_solicitud_vacacion SET estado = $1 WHERE id = $2
        `, [estado, id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'mv_solicitud_vacacion',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                if (3 === estado) {
                    (0, CargarVacacion_1.RestarPeriodoVacacionAutorizada)(parseInt(id), user_name, ip, ip_local);
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    /*
    // METODO DE BUSQUEDA DE DATOS DE VACACION POR ID DE VACACION
    public async ListarUnaVacacion(req: Request, res: Response) {
      const id = req.params.id;
      const VACACIONES = await pool.query(
        `
        SELECT v.fecha_inicio, v.fecha_final, v.fecha_ingreso, v.estado, v.dia_libre, v.dia_laborable,
          v.legalizado, v.id, v.id_periodo_vacacion, e.id AS id_empleado,
          (e.nombre || ' ' || e.apellido) AS fullname, e.identificacion
        FROM mv_solicitud_vacacion AS v, eu_empleados AS e
        WHERE v.id = $1 AND e.id = v.id_empleado
        `
        , [id]);
      if (VACACIONES.rowCount != 0) {
        return res.jsonp(VACACIONES.rows)
      }
      else {
        return res.status(404).jsonp({ text: 'No se encuentran registros.' });
      }
    }*/
    // METODO PARA VERIFICAR EXISTENCIA DE SOLICITUD DE VACACION DE EMPLEADO EN CIERTO PERIODO DE FECHAS
    VerificarExistenciaSolicitud(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado, fecha_inicio, fecha_final } = req.params;
            try {
                const existe = yield database_1.default.query(`
      SELECT id FROM mv_solicitud_vacacion
      WHERE id_empleado = $1
        AND (
          (fecha_inicio <= $3 AND fecha_final >= $2)  -- cruce de fechas
        )
      LIMIT 1;
      `, [id_empleado, fecha_inicio, fecha_final]);
                if (existe.rows.length > 0) {
                    return res.status(200).json({ message: 'Solicitud ya existe', id: existe.rows[0].id });
                }
                else {
                    return res.status(404).json({ message: 'No existe solicitud' });
                }
            }
            catch (error) {
                console.error('Error al verificar solicitud:', error);
                return res.status(500).json({ message: 'Error en el servidor' });
            }
        });
    }
    //METODO PARA REGISTRO DE DOCUMENTO DE SOLICITUD DE VACACIONES
    GuardarDocumento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const fecha = luxon_1.DateTime.now();
                const anio = fecha.toFormat('yyyy');
                const mes = fecha.toFormat('MM');
                const dia = fecha.toFormat('dd');
                const { user_name, ip, ip_local } = req.body;
                const id = req.params.id;
                const id_empleado = req.params.id_empleado;
                yield database_1.default.query('BEGIN');
                const response = yield database_1.default.query(`SELECT codigo FROM eu_empleados WHERE id = $1`, [id_empleado]);
                const [empleado] = response.rows;
                const documento = `${empleado.codigo}_${anio}_${mes}_${dia}_${(_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname}`;
                const solicitudActual = yield database_1.default.query(`SELECT * FROM mv_solicitud_vacacion WHERE id = $1`, [id]);
                const [datosOriginales] = solicitudActual.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'mv_solicitud_vacacion',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        ip_local,
                        observacion: `Error al guardar documento de solicitud de vacaciones con id: ${id}`
                    });
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                const datosNuevos = yield database_1.default.query(`UPDATE mv_solicitud_vacacion SET documento = $2 WHERE id = $1 RETURNING *`, [id, documento]);
                // AUDITORÍA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'mv_solicitud_vacacion',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(datosNuevos.rows[0]),
                    ip,
                    ip_local,
                    observacion: null
                });
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro guardado.' });
            }
            catch (error) {
                yield database_1.default.query('ROLLBACK');
                console.error('Error en GuardarDocumento Vacaciones:', error);
                return res.status(500).jsonp({ message: 'Error al guardar registro.' });
            }
        });
    }
    /** ********************************************************************************************** **
     **                METODOS DE ENVIO DE CORREOS DE SOLICITUDES DE VACACIONES                        **
     ** ********************************************************************************************** **/
    // METODO DE ENVIO DE CORREO DESDE APLICACIÓN WEB
    EnviarCorreoVacacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var tiempo = (0, settingsMail_1.fechaHora)();
            var fecha = yield (0, settingsMail_1.FormatearFecha)(tiempo.fecha_formato, settingsMail_1.dia_completo);
            var hora = yield (0, settingsMail_1.FormatearHora)(tiempo.hora);
            // OBTENER RUTA DE LOGOS
            let separador = path_1.default.sep;
            const path_folder = (0, accesoCarpetas_1.ObtenerRutaLogos)();
            var datos = yield (0, settingsMail_1.Credenciales)(req.id_empresa);
            if (datos.message === 'ok') {
                const { idContrato, desde, hasta, id_dep, id_suc, estado_v, correo, solicitado_por, id, asunto, tipo_solicitud, proceso } = req.body;
                const correoInfoPideVacacion = yield database_1.default.query(`
        SELECT e.correo, e.nombre, e.apellido, e.identificacion, 
          ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo, tc.cargo AS tipo_cargo, 
          d.nombre AS departamento 
        FROM eu_empleado_contratos AS ecn, eu_empleados AS e, eu_empleado_cargos AS ecr, e_cat_tipo_cargo AS tc, 
          ed_departamentos AS d 
        WHERE ecn.id = $1 AND ecn.id_empleado = e.id AND 
          (SELECT id_cargo FROM contrato_cargo_vigente WHERE id_empleado = e.id) = ecr.id 
          AND tc.id = ecr.id_tipo_cargo AND d.id = ecr.id_departamento 
        ORDER BY cargo DESC
        `, [idContrato]);
                // obj.id_dep === correoInfoPideVacacion.rows[0].id_departamento && obj.id_suc === correoInfoPideVacacion.rows[0].id_sucursal
                var url = `${process.env.URL_DOMAIN}/ver-vacacion`;
                let data = {
                    to: correo,
                    from: datos.informacion.email,
                    subject: asunto,
                    html: `
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
              <b>Generado mediante:</b> Aplicación Web <br>
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
              <a href="${url}/${id}">Dar clic en el siguiente enlace para revisar solicitud de realización de vacaciones.</a> <br><br>                                                  
            </p>
            <p style="font-family: Arial; font-size:12px; line-height: 1em;">
              <b>Gracias por la atención</b><br>
              <b>Saludos cordiales,</b> <br><br>
            </p>
            <img src="cid:pief" width="100%" height="100%"/>
          </body>
          `,
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
                        }
                    ]
                };
                var corr = (0, settingsMail_1.enviarCorreos)(datos.informacion.servidor, parseInt(datos.informacion.puerto), datos.informacion.email, datos.informacion.pass);
                corr.sendMail(data, function (error, info) {
                    if (error) {
                        corr.close();
                        console.log('Email error: ' + error);
                        return res.jsonp({ message: 'error' });
                    }
                    else {
                        corr.close();
                        console.log('Email sent: ' + info.response);
                        return res.jsonp({ message: 'ok' });
                    }
                });
            }
            else {
                res.jsonp({ message: 'Ups! algo salio mal. No fue posible enviar correo electrónico.' });
            }
        });
    }
    // METODO DE ENVIO DE CORREO ELECTRÓNICO MEDIANTE APLICACIÓN MOVIL
    EnviarCorreoVacacionesMovil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var tiempo = (0, settingsMail_1.fechaHora)();
            var fecha = yield (0, settingsMail_1.FormatearFecha)(tiempo.fecha_formato, settingsMail_1.dia_completo);
            var hora = yield (0, settingsMail_1.FormatearHora)(tiempo.hora);
            // OBTENER RUTA DE LOGOS
            let separador = path_1.default.sep;
            const path_folder = (0, accesoCarpetas_1.ObtenerRutaLogos)();
            var datos = yield (0, settingsMail_1.Credenciales)(parseInt(req.params.id_empresa));
            if (datos.message === 'ok') {
                const { idContrato, desde, hasta, id_dep, id_suc, estado_v, correo, solicitado_por, asunto, tipo_solicitud, proceso } = req.body;
                const correoInfoPideVacacion = yield database_1.default.query(`
        SELECT e.correo, e.nombre, e.apellido, e.identificacion, 
          ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo, tc.cargo AS tipo_cargo, 
          d.nombre AS departamento 
        FROM eu_empleado_contratos AS ecn, eu_empleados AS e, eu_empleado_cargos AS ecr, e_cat_tipo_cargo AS tc, 
          ed_departamentos AS d 
        WHERE ecn.id = $1 AND ecn.id_empleado = e.id AND 
          (SELECT id_cargo FROM contrato_cargo_vigente WHERE id_empleado = e.id) = ecr.id 
          AND tc.id = ecr.id_tipo_cargo AND d.id = ecr.id_departamento 
        ORDER BY cargo DESC
        `, [idContrato]);
                // obj.id_dep === correoInfoPideVacacion.rows[0].id_departamento && obj.id_suc === correoInfoPideVacacion.rows[0].id_sucursal
                let data = {
                    to: correo,
                    from: datos.informacion.email,
                    subject: asunto,
                    html: `
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
          `,
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
                        }
                    ]
                };
                var corr = (0, settingsMail_1.enviarCorreos)(datos.informacion.servidor, parseInt(datos.informacion.puerto), datos.informacion.email, datos.informacion.pass);
                corr.sendMail(data, function (error, info) {
                    if (error) {
                        corr.close();
                        console.log('Email error: ' + error);
                        return res.jsonp({ message: 'error' });
                    }
                    else {
                        corr.close();
                        console.log('Email sent: ' + info.response);
                        return res.jsonp({ message: 'ok' });
                    }
                });
            }
            else {
                res.jsonp({ message: 'Ups! algo salio mal. No fue posible enviar correo electrónico.' });
            }
        });
    }
    //------------------------------------------------- METODO APP MOBIL ----------------------------------------------------------------------
    getlistaVacacionesByFechasyCodigo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fec_inicio, fec_final, codigo } = req.query;
                const query = `SELECT v.* FROM mv_solicitud_vacacion v WHERE v.id_empleado = '${codigo}' AND (
            ((\'${fec_inicio}\' BETWEEN v.fecha_inicio AND v.fecha_final ) OR 
             (\'${fec_final}\' BETWEEN v.fecha_inicio AND v.fecha_final)) 
            OR
            ((v.fecha_inicio BETWEEN \'${fec_inicio}\' AND \'${fec_final}\') OR 
             (v.fecha_final BETWEEN \'${fec_inicio}\' AND \'${fec_final}\'))
            )`;
                const response = yield database_1.default.query(query);
                const vacaciones = response.rows;
                return res.status(200).jsonp(vacaciones);
            }
            catch (error) {
                console.log(error);
                return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
            }
        });
    }
    ;
}
exports.VACACIONES_CONTROLADOR = new VacacionesControlador();
exports.default = exports.VACACIONES_CONTROLADOR;
