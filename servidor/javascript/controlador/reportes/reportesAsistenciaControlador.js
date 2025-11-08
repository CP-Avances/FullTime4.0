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
const database_1 = __importDefault(require("../../database"));
class ReportesAsistenciaControlador {
    // METODO PARA CONSULTAR LISTA DE TIMBRES DEL USUARIO    **USADO     
    ReporteTimbresMultiple(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("ENTRA A METODO PARA CONSULTAR ");
            let { desde, hasta } = req.params;
            let datos = req.body;
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.empleados = yield Promise.all(obj.empleados.map((o) => __awaiter(this, void 0, void 0, function* () {
                    o.timbres = yield BuscarTimbres(desde, hasta, o.codigo);
                    return o;
                })));
                return obj;
            })));
            let nuevo = n.map((e) => {
                e.empleados = e.empleados.filter((t) => { return t.timbres.length > 0; });
                return e;
            }).filter(e => { return e.empleados.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No hay timbres en ese periodo.' });
            return res.status(200).jsonp(nuevo);
        });
    }
    // METODO DE BUSQUEDA DE TIMBRES DE TIMBRE VIRTUAL      **USADO        
    ReporteTimbreSistema(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { desde, hasta } = req.params;
            let datos = req.body;
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.empleados = yield Promise.all(obj.empleados.map((o) => __awaiter(this, void 0, void 0, function* () {
                    o.timbres = yield BuscarTimbreSistemas(desde, hasta, o.codigo);
                    return o;
                })));
                return obj;
            })));
            let nuevo = n.map((e) => {
                e.empleados = e.empleados.filter((t) => { return t.timbres.length > 0; });
                return e;
            }).filter(e => { return e.empleados.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No hay timbres en ese periodo.' });
            return res.status(200).jsonp(nuevo);
        });
    }
    // METODO DE BUSQUEDA DE TIMBRES DEL RELOJ VIRTUAL    **USADO    
    ReporteTimbreRelojVirtual(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { desde, hasta } = req.params;
            let datos = req.body;
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.empleados = yield Promise.all(obj.empleados.map((o) => __awaiter(this, void 0, void 0, function* () {
                    o.timbres = yield BuscarTimbreRelojVirtual(desde, hasta, o.codigo);
                    return o;
                })));
                return obj;
            })));
            let nuevo = n.map((e) => {
                e.empleados = e.empleados.filter((t) => { return t.timbres.length > 0; });
                return e;
            }).filter(e => { return e.empleados.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No hay timbres en ese periodo.' });
            return res.status(200).jsonp(nuevo);
        });
    }
    // METODO DE BUSQUEDA DE TIMBRES HORARIO ABIERTO    **USADO    
    ReporteTimbreHorarioAbierto(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { desde, hasta } = req.params;
            let datos = req.body;
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.empleados = yield Promise.all(obj.empleados.map((o) => __awaiter(this, void 0, void 0, function* () {
                    o.timbres = yield BuscarTimbreHorarioAbierto(desde, hasta, o.codigo);
                    return o;
                })));
                return obj;
            })));
            let nuevo = n.map((e) => {
                e.empleados = e.empleados.filter((t) => { return t.timbres.length > 0; });
                return e;
            }).filter(e => { return e.empleados.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No hay timbres en ese periodo.' });
            return res.status(200).jsonp(nuevo);
        });
    }
    // METODO DE BUSQUEDA DE TIMBRES INCOMPLETOS      **USADO   
    ReporteTimbresIncompletos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { desde, hasta } = req.params;
            let datos = req.body;
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.empleados = yield Promise.all(obj.empleados.map((o) => __awaiter(this, void 0, void 0, function* () {
                    o.timbres = yield BuscarTimbresIncompletos(desde, hasta, o.id);
                    return o;
                })));
                return obj;
            })));
            let nuevo = n.map((e) => {
                e.empleados = e.empleados.filter((t) => { return t.timbres.length > 0; });
                return e;
            }).filter(e => { return e.empleados.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No hay timbres incompletos en ese periodo.' });
            return res.status(200).jsonp(nuevo);
        });
    }
}
const REPORTE_A_CONTROLADOR = new ReportesAsistenciaControlador();
exports.default = REPORTE_A_CONTROLADOR;
// FUNCION DE BUSQUEDA DE TIMBRES     **USADO
const BuscarTimbres = function (fec_inicio, fec_final, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query(`
        SELECT CAST(fecha_hora_timbre AS VARCHAR), id_reloj, accion, observacion, 
            latitud, longitud, CAST(fecha_hora_timbre_servidor AS VARCHAR),
            CAST(fecha_hora_timbre_validado AS VARCHAR), zona_horaria_dispositivo, zona_horaria_servidor,
            formato_gmt_servidor, formato_gmt_dispositivo, hora_timbre_diferente
        FROM eu_timbres WHERE CAST(fecha_hora_timbre_validado AS VARCHAR) BETWEEN $1 || '%' 
            AND ($2::timestamp + '1 DAY') || '%' AND codigo = $3 
        ORDER BY fecha_hora_timbre_validado ASC
        `, [fec_inicio, fec_final, codigo])
            .then(res => {
            return res.rows;
        });
    });
};
// FUNCION PARA BUSQUEDA DE TIMBRES INCOMPLETOS    **USADO
const BuscarTimbresIncompletos = function (fec_inicio, fec_final, id_empleado) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query(`
        SELECT CAST(fecha_hora_horario AS VARCHAR), id_empleado, estado_timbre, tipo_accion AS accion, tipo_dia, estado_origen
        FROM eu_asistencia_general WHERE CAST(fecha_hora_horario AS VARCHAR) BETWEEN $1 || '%' 
            AND ($2::timestamp + '1 DAY') || '%' AND id_empleado = $3 
            AND fecha_hora_timbre IS null AND estado_origen IN ('N','HL', 'HFD') 
        ORDER BY fecha_hora_horario ASC
        `, [fec_inicio, fec_final, id_empleado])
            .then(res => {
            return res.rows;
        });
    });
};
// CONSULTA TIMBRES REALIZADOS EN EL SISTEMA CODIGO 98     **USADO
const BuscarTimbreSistemas = function (fec_inicio, fec_final, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query(`
        SELECT CAST(fecha_hora_timbre AS VARCHAR), id_reloj, accion, observacion, 
            latitud, longitud, CAST(fecha_hora_timbre_servidor AS VARCHAR), 
            CAST(fecha_hora_timbre_validado AS VARCHAR) 
        FROM eu_timbres WHERE CAST(fecha_hora_timbre_validado AS VARCHAR) BETWEEN $1 || '%' 
            AND ($2::timestamp + '1 DAY') || '%' AND codigo = $3 AND id_reloj = '98' 
            AND NOT accion = 'HA'
        ORDER BY fecha_hora_timbre_validado ASC
        `, [fec_inicio, fec_final, codigo])
            .then(res => {
            return res.rows;
        });
    });
};
// CONSULTA TIMBRES REALIZADOS EN EL RELOJ VIRTUAL CODIGO 97   **USADO
const BuscarTimbreRelojVirtual = function (fec_inicio, fec_final, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query(`
        SELECT CAST(fecha_hora_timbre AS VARCHAR), id_reloj, accion, observacion, 
            latitud, longitud, CAST(fecha_hora_timbre_servidor AS VARCHAR),
            CAST(fecha_hora_timbre_validado AS VARCHAR) 
        FROM eu_timbres WHERE CAST(fecha_hora_timbre_validado AS VARCHAR) BETWEEN $1 || \'%\' 
            AND ($2::timestamp + \'1 DAY\') || \'%\' AND codigo = $3 AND id_reloj = \'97\' 
            AND NOT accion = \'HA\' 
        ORDER BY fecha_hora_timbre_validado ASC
        `, [fec_inicio, fec_final, codigo])
            .then(res => {
            return res.rows;
        });
    });
};
// CONSULTA TIMBRES REALIZADOS EN HORARIO ABIERTO      **USADO
const BuscarTimbreHorarioAbierto = function (fec_inicio, fec_final, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query(`
        SELECT CAST(fecha_hora_timbre AS VARCHAR), id_reloj, accion, observacion, 
            latitud, longitud, CAST(fecha_hora_timbre_servidor AS VARCHAR),
            CAST(fecha_hora_timbre_validado AS VARCHAR) 
        FROM eu_timbres WHERE CAST(fecha_hora_timbre_validado AS VARCHAR) BETWEEN $1 || '%' 
            AND ($2::timestamp + '1 DAY') || '%' AND codigo = $3 AND accion = 'HA' 
        ORDER BY fecha_hora_timbre_validado ASC
        `, [fec_inicio, fec_final, codigo])
            .then(res => {
            return res.rows;
        });
    });
};
