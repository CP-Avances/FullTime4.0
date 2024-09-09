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
    ////FIN CAMBIO DE LISTAR TIMBRES
    ListarPermisoHorarioEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { codigo } = req.params;
            const DATOS = yield database_1.default.query(`
            SELECT cp.descripcion AS tipo, p.id, p.descripcion, p.fecha_creacion, p.fecha_inicio, p.fecha_final, 
                p.dias_permiso, p.horas_permiso, p.numero_permiso, p.id_empleado, a.estado, a.id_autoriza_estado, 
                ec.hora_trabaja, ec.id AS id_cargo 
            FROM mp_solicitud_permiso AS p, mp_cat_tipo_permisos AS cp, ecm_autorizaciones AS a, 
                eu_empleado_cargos AS ec, eu_empleados AS e
            WHERE cp.id = p.id_tipo_permiso AND a.id_permiso = p.id 
                AND ec.id = (SELECT MAX(cv.id_cargo) FROM contrato_cargo_vigente AS cv, eu_empleados AS e 
                WHERE e.id = cv.id_empleado AND e.codigo = $1) 
                AND p.id_empleado = e.id AND e.codigo = $1
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
    getInfoReporteTimbres(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { codigo, fec_inicio, fec_final } = req.query;
                const response = yield database_1.default.query('SELECT t.*, CAST(t.fecha_hora_timbre AS VARCHAR) AS stimbre, CAST(t.fecha_hora_timbre_servidor AS VARCHAR) AS stimbre_servidor FROM eu_timbres as t WHERE codigo = $3 AND fecha_hora_timbre BETWEEN $1 AND $2 ORDER BY fecha_hora_timbre DESC LIMIT 100', [fec_inicio, fec_final, codigo]);
                const timbres = response.rows;
                // console.log(timbres);
                if (timbres.length === 0)
                    return res.status(400).jsonp({ message: 'No hay timbres resgistrados' });
                return res.status(200).jsonp(timbres);
            }
            catch (error) {
                console.log(error);
                return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
            }
        });
    }
    ;
    getInfoReporteTimbresNovedad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { codigo, fec_inicio, fec_final, conexion } = req.query;
                const response = yield database_1.default.query('SELECT t.*, CAST(t.fecha_hora_timbre AS VARCHAR) AS stimbre, CAST(t.fecha_subida_servidor AS VARCHAR) AS stimbre_servidor FROM eu_timbres as t WHERE codigo = $3 AND fecha_hora_timbre BETWEEN $1 AND $2 AND conexion = $4 ORDER BY fecha_hora_timbre DESC LIMIT 100', [fec_inicio, fec_final, codigo, conexion]);
                const timbres = response.rows;
                // console.log(timbres);
                if (timbres.length === 0)
                    return res.status(400).jsonp({ message: 'No hay timbres resgistrados' });
                return res.status(200).jsonp(timbres);
            }
            catch (error) {
                console.log(error);
                return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
            }
        });
    }
    ;
}
exports.REPORTES_CONTROLADOR = new ReportesControlador();
exports.default = exports.REPORTES_CONTROLADOR;
