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
exports.REPORTES_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../database"));
class ReportesControlador {
    // -- poner en consulta el estado del usuario
    ListarDatosContractoA(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const DATOS = yield database_1.default.query(`
            SELECT * FROM datos_contrato_actual
            `);
            if (DATOS.rowCount != 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    ListarDatosCargoA(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { empleado_id } = req.params;
            const DATOS = yield database_1.default.query(`
            SELECT * FROM datosCargoActual ($1)
            `, [empleado_id]);
            if (DATOS.rowCount != 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'error' });
            }
        });
    }
    ListarEntradaSalidaEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // id_empleado hace referencia al código del empleado
            const { id_empleado } = req.params;
            const { fechaInicio, fechaFinal } = req.body;
            const DATOS = yield database_1.default.query(`
            SELECT * FROM TimbresEntrada AS te 
            INNER JOIN TimbresSalida AS ts
                ON te.id_empleado = ts.id_empleado AND te.fecha_inicio::date = ts.fecha_fin::date AND 
                te.id_empleado = $1 AND te.fecha_inicio::date BETWEEN $2 AND $3
            `, [id_empleado, fechaInicio, fechaFinal]);
            if (DATOS.rowCount != 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'error' });
            }
        });
    }
    ListarPedidosEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_usua_solicita } = req.params;
            const { fechaInicio, fechaFinal } = req.body;
            const DATOS = yield database_1.default.query(`
            SELECT * FROM mhe_solicitud_hora_extra 
            WHERE id_empleado_solicita = $1 AND fecha_inicio::date BETWEEN $2 AND $3
            `, [id_usua_solicita, fechaInicio, fechaFinal]);
            if (DATOS.rowCount != 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'error' });
            }
        });
    }
    ListarEntradaSalidaTodos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fechaInicio, fechaFinal } = req.body;
            const DATOS = yield database_1.default.query(`
            SELECT * FROM TimbresEntrada AS te 
            INNER JOIN TimbresSalida AS ts ON te.id_empleado = ts.id_empleado 
                AND te.fecha_inicio::date = ts.fecha_fin::date 
                AND te.fecha_inicio::date BETWEEN $1 AND $2
            `, [fechaInicio, fechaFinal]);
            if (DATOS.rowCount != 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'error' });
            }
        });
    }
    ListarPedidosTodos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fechaInicio, fechaFinal } = req.body;
            const DATOS = yield database_1.default.query(`
            SELECT * FROM mhe_solicitud_hora_extra WHERE fecha_inicio::date BETWEEN $1 AND $2
            `, [fechaInicio, fechaFinal]);
            if (DATOS.rowCount != 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'error' });
            }
        });
    }
    ////PLANIFICACION DE EMPLEADO CON FECHAS
    BuscarPlan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { codigo } = req.params;
            const { fechaInicio, fechaFinal } = req.body;
            const FECHAS = yield database_1.default.query(`
            SELECT pg.id, pg.codigo, pg.id_empleado_cargo, pg.id_detalle_horario, pg.fecha_horario, pg.fecha_hora_horario, 
                pg.tipo_accion, pg.fecha_hora_timbre, pg.id_horario
            FROM eu_asistencia_general pg 
            WHERE pg.codigo = $3 AND (pg.fecha_hora_horario::date BETWEEN $1 AND $2 ) 
            ORDER BY fecha_hora_horario
            `, [fechaInicio, fechaFinal, codigo]);
            console.log("m: ", (FECHAS.rows));
            if (FECHAS.rowCount != 0) {
                return res.jsonp(FECHAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    //// FIN PLANIFICACION DE EMPLEADO CON FECHAS
    ////CAMBIO DE LISTAR TIMBRES COMENTAR METODO ANTIGUO
    ListarTimbres(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const { fechaInicio, fechaFinal } = req.body;
            const DATOS = yield database_1.default.query(`
            SELECT t.fecha_hora_timbre,t.accion, t.tecla_funcion, t.observacion, t.latitud, t.longitud, t.id, 
                t.codigo, t.id_reloj, t.hora_timbre_diferente, t.fecha_hora_timbre_servidor, t.dispositivo_timbre, 
                t.tipo_autenticacion 
            FROM eu_timbres t 
            WHERE t.codigo = $1 AND NOT accion = \'HA\' AND t.fecha_hora_timbre::date BETWEEN $2 AND $3 
            GROUP BY t.fecha_hora_timbre,t.accion, t.tecla_funcion, t.observacion, t.latitud, t.longitud, t.id, 
                t.codigo, t.id_reloj, t.hora_timbre_diferente, t.fecha_hora_timbre_servidor, t.dispositivo_timbre, 
                t.tipo_autenticacion 
            ORDER BY t.fecha_hora_timbre ASC
            `, [id_empleado, fechaInicio, fechaFinal]);
            console.log("LT RepCont: ", (DATOS.rows));
            if (DATOS.rowCount != 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'error' });
            }
        });
    }
    ////FIN CAMBIO DE LISTAR TIMBRES
    ListarPermisoHorarioEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { codigo } = req.params;
            const DATOS = yield database_1.default.query(`
            SELECT cp.descripcion AS tipo, p.id, p.descripcion, p.fecha_creacion, p.fecha_inicio, p.fecha_final, 
                p.dias_permiso, p.horas_permiso, p.numero_permiso, p.codigo, a.estado, a.id_autoriza_estado, 
                ec.hora_trabaja, ec.id AS id_cargo 
            FROM mp_solicitud_permiso AS p, mp_cat_tipo_permisos AS cp, ecm_autorizaciones AS a, eu_empleado_cargos AS ec 
            WHERE cp.id = p.id_tipo_permiso AND a.id_permiso = p.id 
                AND ec.id = (SELECT MAX(cargo_id) FROM datos_empleado_cargo WHERE codigo = $1) 
                AND p.codigo = $1 
            ORDER BY p.numero_permiso ASC
            `, [codigo]);
            if (DATOS.rowCount != 0) {
                DATOS.rows.map((obj) => {
                    if (obj.id_autoriza_estado != null && obj.id_autoriza_estado != '' && obj.estado != 1) {
                        var autorizaciones = obj.id_autoriza_estado.split(',');
                        let empleado_id = autorizaciones[autorizaciones.length - 2].split('_')[0];
                        obj.autoriza = parseInt(empleado_id);
                    }
                    if (obj.estado === 1) {
                        obj.estado = 'Pendiente';
                    }
                    else if (obj.estado === 2) {
                        obj.estado = 'Pre-autorizado';
                    }
                    else if (obj.estado === 3) {
                        obj.estado = 'Autorizado';
                    }
                    else if (obj.estado === 4) {
                        obj.estado = 'Negado';
                    }
                });
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'error' });
            }
        });
    }
    ListarPermisoHorarioEmpleadoFechas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { codigo } = req.params;
            const { fechaInicio, fechaFinal } = req.body;
            const DATOS = yield database_1.default.query(`
            SELECT cp.descripcion AS tipo, p.id, p.descripcion, p.fecha_creacion, p.fecha_inicio, p.fecha_final, 
                p.dias_permiso, p.horas_permiso, p.numero_permiso, p.codigo, a.estado, a.id_autoriza_estado, 
                ec.hora_trabaja, ec.id AS id_cargo 
            FROM mp_solicitud_permiso AS p, mp_cat_tipo_permisos AS cp, ecm_autorizaciones AS a, eu_empleado_cargos AS ec 
            WHERE cp.id = p.id_tipo_permiso AND a.id_permiso = p.id 
                AND ec.id = (SELECT MAX(cargo_id) FROM datos_empleado_cargo WHERE codigo = $1) 
                AND p.fecha_inicio::date BETWEEN $2 AND $3 AND p.codigo = $1 
            ORDER BY p.numero_permiso ASC
            `, [codigo, fechaInicio, fechaFinal]);
            if (DATOS.rowCount != 0) {
                DATOS.rows.map((obj) => {
                    if (obj.id_autoriza_estado != null && obj.id_autoriza_estado != '' && obj.estado != 1) {
                        var autorizaciones = obj.id_autoriza_estado.split(',');
                        let empleado_id = autorizaciones[autorizaciones.length - 2].split('_')[0];
                        obj.autoriza = parseInt(empleado_id);
                    }
                    if (obj.estado === 1) {
                        obj.estado = 'Pendiente';
                    }
                    else if (obj.estado === 2) {
                        obj.estado = 'Pre-autorizado';
                    }
                    else if (obj.estado === 3) {
                        obj.estado = 'Autorizado';
                    }
                    else if (obj.estado === 4) {
                        obj.estado = 'Negado';
                    }
                });
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'error' });
            }
        });
    }
    ListarPermisoAutorizaEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const DATOS = yield database_1.default.query(`
            SELECT a.id AS id_autoriza, a.estado, a.id_permiso,
                a.id_autoriza_estado AS empleado_estado, p.id_empl_contrato, contrato.id_empleado 
            FROM ecm_autorizaciones AS a, mp_solicitud_permiso AS p, eu_empleado_contratos AS contrato, eu_empleados AS e 
            WHERE a.id_permiso = p.id AND p.id_empleado_contrato = contrato.id AND contrato.id_empleado = e.id AND e.id = $1
            `, [id_empleado]);
            if (DATOS.rowCount != 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'error' });
            }
        });
    }
}
exports.REPORTES_CONTROLADOR = new ReportesControlador();
exports.default = exports.REPORTES_CONTROLADOR;
