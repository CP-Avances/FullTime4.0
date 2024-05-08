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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auditoriaControlador_1 = __importDefault(require("../auditoria/auditoriaControlador"));
const database_1 = __importDefault(require("../../database"));
class RegimenControlador {
    /** ** ************************************************************************************************ **
     ** **                                  CONSULTAS REGIMEN LABORAL                                    ** **
     ** ** ************************************************************************************************ **/
    // REGISTRO DE REGIMEN LABORAL
    CrearRegimen(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_pais, descripcion, mes_periodo, dias_mes, trabajo_minimo_mes, trabajo_minimo_horas, continuidad_laboral, vacacion_dias_laboral, vacacion_dias_libre, vacacion_dias_calendario, acumular, dias_max_acumulacion, contar_feriados, vacacion_divisible, antiguedad, antiguedad_fija, anio_antiguedad, dias_antiguedad, antiguedad_variable, vacacion_dias_calendario_mes, vacacion_dias_laboral_mes, calendario_dias, laboral_dias, meses_calculo, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query("BEGIN");
                const response = yield database_1.default.query(`
        INSERT INTO cg_regimenes (id_pais, descripcion, mes_periodo, dias_mes, trabajo_minimo_mes, trabajo_minimo_horas,
          continuidad_laboral, vacacion_dias_laboral, vacacion_dias_libre, vacacion_dias_calendario, acumular, 
          dias_max_acumulacion, contar_feriados, vacacion_divisible, antiguedad, antiguedad_fija, anio_antiguedad, 
          dias_antiguedad, antiguedad_variable, vacacion_dias_calendario_mes, vacacion_dias_laboral_mes, calendario_dias, 
          laboral_dias, meses_calculo)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, 
          $23, $24) RETURNING *
        `, [
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
                    contar_feriados,
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
                ]);
                const [regimen] = response.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: "cg_regimenes",
                    usuario: user_name,
                    accion: "I",
                    datosOriginales: "",
                    datosNuevos: JSON.stringify(regimen),
                    ip: ip,
                    observacion: null,
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query("COMMIT");
                if (regimen) {
                    return res.status(200).jsonp(regimen);
                }
                else {
                    return res.status(404).jsonp({ message: "mal_registro" });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query("ROLLBACK");
                return res.status(500).jsonp({ message: "error" });
            }
        });
    }
    // ACTUALIZAR REGISTRO DE REGIMEN LABORAL
    ActualizarRegimen(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_pais, descripcion, mes_periodo, dias_mes, trabajo_minimo_mes, trabajo_minimo_horas, continuidad_laboral, vacacion_dias_laboral, vacacion_dias_libre, vacacion_dias_calendario, acumular, dias_max_acumulacion, contar_feriados, vacacion_divisible, antiguedad, antiguedad_fija, anio_antiguedad, dias_antiguedad, antiguedad_variable, vacacion_dias_calendario_mes, vacacion_dias_laboral_mes, calendario_dias, laboral_dias, meses_calculo, id, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query("BEGIN");
                // CONSULTAR DATOSORIGINALES
                const regimen = yield database_1.default.query(`
        SELECT * FROM cg_regimenes WHERE id = $1
        `, [id]);
                const [datosOriginales] = regimen.rows;
                if (!datosOriginales) {
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: "cg_regimenes",
                        usuario: user_name,
                        accion: "U",
                        datosOriginales: "",
                        datosNuevos: "",
                        ip: ip,
                        observacion: `Error al actualizar el registro con id: ${id}.`,
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query("COMMIT");
                    return res.status(404).jsonp({ message: "error" });
                }
                yield database_1.default.query(`
        UPDATE cg_regimenes SET id_pais = $1, descripcion = $2, mes_periodo = $3, dias_mes = $4, trabajo_minimo_mes = $5, 
          trabajo_minimo_horas = $6, continuidad_laboral = $7, vacacion_dias_laboral = $8, vacacion_dias_libre = $9, 
          vacacion_dias_calendario = $10, acumular = $11, dias_max_acumulacion = $12, contar_feriados = $13, 
          vacacion_divisible = $14, antiguedad = $15, antiguedad_fija = $16, anio_antiguedad = $17, dias_antiguedad = $18, 
          antiguedad_variable = $19, vacacion_dias_calendario_mes = $20, vacacion_dias_laboral_mes = $21, calendario_dias = $22,
          laboral_dias = $23, meses_calculo = $24 
        WHERE id = $25
        `, [
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
                    contar_feriados,
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
                ]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: "cg_regimenes",
                    usuario: user_name,
                    accion: "U",
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: `
                    { "id_pais": "${id_pais}", "descripcion": "${descripcion}", "mes_periodo": "${mes_periodo}", 
                     "dias_mes": "${dias_mes}", "trabajo_minimo_mes": "${trabajo_minimo_mes}", "trabajo_minimo_horas": "${trabajo_minimo_horas}", 
                     "continuidad_laboral": "${continuidad_laboral}", "vacacion_dias_laboral": "${vacacion_dias_laboral}", 
                     "vacacion_dias_libre": "${vacacion_dias_libre}", "vacacion_dias_calendario": "${vacacion_dias_calendario}", 
                     "acumular": "${acumular}", "dias_max_acumulacion": "${dias_max_acumulacion}", "contar_feriados": "${contar_feriados}", 
                     "vacacion_divisible": "${vacacion_divisible}", "antiguedad": "${antiguedad}", "antiguedad_fija": "${antiguedad_fija}", 
                     "anio_antiguedad": "${anio_antiguedad}", "dias_antiguedad": "${dias_antiguedad}", "antiguedad_variable": "${antiguedad_variable}", 
                     "vacacion_dias_calendario_mes": "${vacacion_dias_calendario_mes}", "vacacion_dias_laboral_mes": "${vacacion_dias_laboral_mes}", 
                     "calendario_dias": "${calendario_dias}", "laboral_dias": "${laboral_dias}", "meses_calculo": "${meses_calculo}" }`,
                    ip: ip,
                    observacion: null,
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query("COMMIT");
                return res.jsonp({ message: "Regimen guardado" });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query("ROLLBACK");
                return res.status(500).jsonp({ message: "error" });
            }
        });
    }
    // METODO PARA BUSCAR DESCRIPCION DE REGIMEN LABORAL
    ListarNombresRegimen(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const REGIMEN = yield database_1.default.query(` 
      SELECT descripcion FROM cg_regimenes
      `);
            if (REGIMEN.rowCount > 0) {
                return res.jsonp(REGIMEN.rows);
            }
            else {
                return res.status(404).jsonp({ text: "No se encuentran registros" });
            }
        });
    }
    // METODO PARA BUSCAR LISTA DE REGIMEN
    ListarRegimen(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const REGIMEN = yield database_1.default.query(`
      SELECT  r.*, p.nombre AS pais FROM cg_regimenes r INNER JOIN cg_paises p ON r.id_pais = p.id ORDER BY r.descripcion ASC
      `);
            if (REGIMEN.rowCount > 0) {
                return res.jsonp(REGIMEN.rows);
            }
            else {
                return res.status(404).jsonp({ text: "No se encuentran registros" });
            }
        });
    }
    // BUSCAR UN REGISTRO DE REGIMEN LABORAL
    ListarUnRegimen(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const REGIMEN = yield database_1.default.query(`
      SELECT * FROM cg_regimenes WHERE id = $1
      `, [id]);
            if (REGIMEN.rowCount > 0) {
                return res.jsonp(REGIMEN.rows[0]);
            }
            else {
                return res.status(404).jsonp({ text: "No se encuentran registros" });
            }
        });
    }
    // BUSCAR REGISTRO DE REGIMEN LABORAL POR ID DE PAIS
    ListarRegimenPais(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.params;
            const REGIMEN = yield database_1.default.query(`
      SELECT r.* FROM cg_regimenes AS r, cg_paises AS p WHERE r.id_pais = p.id AND p.nombre = $1
      `, [nombre]);
            if (REGIMEN.rowCount > 0) {
                return res.jsonp(REGIMEN.rows);
            }
            else {
                return res.status(404).jsonp({ text: "No se encuentran registros" });
            }
        });
    }
    // ELIMINAR REGISTRO DE REGIMEN LABORAL
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // TODO ANALIZAR COMO OBTENER DESDE EL FRONT EL USERNAME Y LA IP
                const { user_name, ip } = req.body;
                const id = req.params.id;
                // INICIAR TRANSACCION
                yield database_1.default.query("BEGIN");
                // CONSULTAR DATOSORIGINALES
                const regimen = yield database_1.default.query(`
        SELECT * FROM cg_regimenes WHERE id = $1
        `, [id]);
                const [datosOriginales] = regimen.rows;
                if (!datosOriginales) {
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: "cg_regimenes",
                        usuario: user_name,
                        accion: "D",
                        datosOriginales: "",
                        datosNuevos: "",
                        ip: ip,
                        observacion: `Error al eliminar el registro con id: ${id}.`,
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query("COMMIT");
                    return res.status(404).jsonp({ message: "Registro no encontrado." });
                }
                yield database_1.default.query(`
        DELETE FROM cg_regimenes WHERE id = $1
        `, [id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: "cg_regimenes",
                    usuario: user_name,
                    accion: "D",
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: "",
                    ip: ip,
                    observacion: null,
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query("COMMIT");
                return res.jsonp({ message: "Registro eliminado." });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query("ROLLBACK");
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    /** ** ************************************************************************************************ **
     ** **                         CONSULTAS DE PERIODOS DE VACACIONES                                   ** **
     ** ** ************************************************************************************************ **/
    // REGISTRAR PERIODO DE VACACIONES
    CrearPeriodo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_regimen, descripcion, dias_vacacion, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query("BEGIN");
                const response = yield database_1.default.query(`
        INSERT INTO dividir_vacaciones (id_regimen, descripcion, dias_vacacion)
        VALUES ($1, $2, $3) RETURNING *
        `, [id_regimen, descripcion, dias_vacacion]);
                const [periodo] = response.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: "dividir_vacaciones",
                    usuario: user_name,
                    accion: "I",
                    datosOriginales: "",
                    datosNuevos: JSON.stringify(periodo),
                    ip: ip,
                    observacion: null,
                });
                // FINALIZAR TRANSACCION 
                yield database_1.default.query("COMMIT");
                if (periodo) {
                    return res.status(200).jsonp(periodo);
                }
                else {
                    return res.status(404).jsonp({ message: "mal_registro" });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query("ROLLBACK");
                return res.status(500).jsonp({ message: "error" });
            }
        });
    }
    // ACTUALIZAR REGISTRO DE PERIODO DE VACACIONES
    ActualizarPeriodo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { descripcion, dias_vacacion, id, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query("BEGIN");
                // CONSULTAR DATOSORIGINALES
                const periodo = yield database_1.default.query(`
        SELECT * FROM dividir_vacaciones WHERE id = $1
        `, [id]);
                const [datosOriginales] = periodo.rows;
                if (!datosOriginales) {
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: "dividir_vacaciones",
                        usuario: user_name,
                        accion: "U",
                        datosOriginales: "",
                        datosNuevos: "",
                        ip: ip,
                        observacion: `Error al actualizar el registro con id: ${id}.`,
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query("COMMIT");
                    return res.status(404).jsonp({ message: "error" });
                }
                yield database_1.default.query(`
        UPDATE dividir_vacaciones SET descripcion = $1, dias_vacacion = $2 WHERE id = $3
        `, [descripcion, dias_vacacion, id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: "dividir_vacaciones",
                    usuario: user_name,
                    accion: "U",
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: `{"descripcion": "${descripcion}", "dias_vacacion": "${dias_vacacion}"}`,
                    ip: ip,
                    observacion: null,
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query("COMMIT");
                return res.jsonp({ message: "Periodo guardado" });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // BUSCAR UN REGISTRO DE PERIODO DE VACACIONES POR REGIMEN LABORAL
    ListarUnPeriodo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const PERIODO = yield database_1.default.query(`
      SELECT * FROM dividir_vacaciones WHERE id_regimen = $1 ORDER BY id
      `, [id]);
            if (PERIODO.rowCount > 0) {
                return res.jsonp(PERIODO.rows);
            }
            else {
                return res.status(404).jsonp({ text: "No se encuentran registros" });
            }
        });
    }
    // ELIMINAR REGISTRO DE PERIODO DE VACACIONES
    EliminarPeriodo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // TODO ANALIZAR COMO OBTENER DESDE EL FRONT EL USERNAME Y LA IP
                const { user_name, ip } = req.body;
                const id = req.params.id;
                // INICIAR TRANSACCION
                yield database_1.default.query("BEGIN");
                // CONSULTAR DATOSORIGINALES
                const periodo = yield database_1.default.query(`
        SELECT * FROM dividir_vacaciones WHERE id = $1
        `, [id]);
                const [datosOriginales] = periodo.rows;
                if (!datosOriginales) {
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: "dividir_vacaciones",
                        usuario: user_name,
                        accion: "D",
                        datosOriginales: "",
                        datosNuevos: "",
                        ip: ip,
                        observacion: `Error al eliminar el registro con id: ${id}.`,
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query("COMMIT");
                    return res.status(404).jsonp({ message: "Registro no encontrado." });
                }
                yield database_1.default.query(`
        DELETE FROM dividir_vacaciones WHERE id = $1
        `, [id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: "dividir_vacaciones",
                    usuario: user_name,
                    accion: "D",
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: "",
                    ip: ip,
                    observacion: null,
                });
                return res.jsonp({ message: "Registro eliminado." });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query("ROLLBACK");
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    /** ** ********************************************************************************************** **
     ** ** **                     REGISTRAR ANTIGUEDAD DE VACACIONES                                   ** **
     ** ** ********************************************************************************************** **/
    // REGISTRAR ANTIGUEDAD DE VACACIONES
    CrearAntiguedad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { anio_desde, anio_hasta, dias_antiguedad, id_regimen, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query("BEGIN");
                const response = yield database_1.default.query(`
        INSERT INTO antiguedad (anio_desde, anio_hasta, dias_antiguedad, id_regimen)
        VALUES ($1, $2, $3, $4) RETURNING *
        `, [anio_desde, anio_hasta, dias_antiguedad, id_regimen]);
                const [antiguedad] = response.rows;
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: "antiguedad",
                    usuario: user_name,
                    accion: "I",
                    datosOriginales: "",
                    datosNuevos: JSON.stringify(antiguedad),
                    ip: ip,
                    observacion: null,
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query("COMMIT");
                if (antiguedad) {
                    return res.status(200).jsonp(antiguedad);
                }
                else {
                    return res.status(404).jsonp({ message: "mal_registro" });
                }
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query("ROLLBACK");
                return res.status(500).jsonp({ message: "error" });
            }
        });
    }
    // ACTUALIZAR ANTIGUEDAD DE VACACIONES
    ActualizarAntiguedad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { anio_desde, anio_hasta, dias_antiguedad, id, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query("BEGIN");
                // CONSULTAR DATOSORIGINALES
                const antiguedad = yield database_1.default.query(`
        SELECT * FROM antiguedad WHERE id = $1
        `, [id]);
                const [datosOriginales] = antiguedad.rows;
                if (!datosOriginales) {
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: "antiguedad",
                        usuario: user_name,
                        accion: "U",
                        datosOriginales: "",
                        datosNuevos: "",
                        ip: ip,
                        observacion: `Error al actualizar el registro con id: ${id}.`,
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query("COMMIT");
                    return res.status(404).jsonp({ message: "error" });
                }
                yield database_1.default.query(`
        UPDATE antiguedad SET anio_desde = $1, anio_hasta = $2, dias_antiguedad = $3 WHERE id = $4
        `, [anio_desde, anio_hasta, dias_antiguedad, id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: "antiguedad",
                    usuario: user_name,
                    accion: "U",
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: `{"anio_desde": "${anio_desde}", "anio_hasta": "${anio_hasta}", "dias_antiguedad": "${dias_antiguedad}"}`,
                    ip: ip,
                    observacion: null,
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query("COMMIT");
                return res.jsonp({ message: "Antiguedad guardada" });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query("ROLLBACK");
                return res.status(500).jsonp({ message: "error" });
            }
        });
    }
    // BUSCAR UN REGISTRO DE ANTIGUEDAD
    ListarAntiguedad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const ANTIGUO = yield database_1.default.query(`
      SELECT * FROM antiguedad WHERE id_regimen = $1 ORDER BY id
      `, [id]);
            if (ANTIGUO.rowCount > 0) {
                return res.jsonp(ANTIGUO.rows);
            }
            else {
                return res.status(404).jsonp({ text: "No se encuentran registros" });
            }
        });
    }
    // ELIMINAR REGISTRO DE ANTIGUEDAD DE VACACIONES
    EliminarAntiguedad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // TODO ANALIZAR COMO OBTENER DESDE EL FRONT EL USERNAME Y LA IP
                const { user_name, ip } = req.body;
                const id = req.params.id;
                // INICIAR TRANSACCION
                yield database_1.default.query("BEGIN");
                // CONSULTAR DATOSORIGINALES
                const antiguedad = yield database_1.default.query(`
        SELECT * FROM antiguedad WHERE id = $1
        `, [id]);
                const [datosOriginales] = antiguedad.rows;
                if (!datosOriginales) {
                    // AUDITORIA
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: "antiguedad",
                        usuario: user_name,
                        accion: "D",
                        datosOriginales: "",
                        datosNuevos: "",
                        ip: ip,
                        observacion: `Error al eliminar el registro con id: ${id}.`,
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query("COMMIT");
                    return res.status(404).jsonp({ message: "Registro no encontrado." });
                }
                yield database_1.default.query(`
        DELETE FROM antiguedad WHERE id = $1
        `, [id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: "antiguedad",
                    usuario: user_name,
                    accion: "D",
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: "",
                    ip: ip,
                    observacion: null,
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query("COMMIT");
                return res.jsonp({ message: "Registro eliminado." });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query("ROLLBACK");
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    ListarRegimenSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const REGIMEN = yield database_1.default.query(" SELECT r.id, r.descripcion FROM cg_regimenes AS r, empl_cargos AS ec, " +
                "empl_contratos AS c WHERE c.id_regimen = r.id AND c.id = ec.id_empl_contrato AND ec.id_sucursal = $1 " +
                "GROUP BY r.id, r.descripcion", [id]);
            if (REGIMEN.rowCount > 0) {
                return res.jsonp(REGIMEN.rows);
            }
            else {
                return res.status(404).jsonp({ text: "No se encuentran registros" });
            }
        });
    }
}
const REGIMEN_CONTROLADOR = new RegimenControlador();
exports.default = REGIMEN_CONTROLADOR;
