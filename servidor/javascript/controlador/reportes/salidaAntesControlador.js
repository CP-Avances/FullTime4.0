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
exports.BuscarSalidasAnticipadas = void 0;
const database_1 = __importDefault(require("../../database"));
class SalidasAntesControlador {
    // METODO DE REGISTROS DE SALIDAS ANTICIPADAS     **USADO
    ReporteSalidasAnticipadas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { desde, hasta } = req.params;
            let datos = req.body;
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.empleados = yield Promise.all(obj.empleados.map((o) => __awaiter(this, void 0, void 0, function* () {
                    o.salidas = yield (0, exports.BuscarSalidasAnticipadas)(desde, hasta, o.id);
                    return o;
                })));
                return obj;
            })));
            let nuevo = n.map((e) => {
                e.empleados = e.empleados.filter((t) => { return t.salidas.length > 0; });
                return e;
            }).filter(e => { return e.empleados.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No se ha encontrado registros.' });
            return res.status(200).jsonp(nuevo);
        });
    }
}
const SALIDAS_ANTICIPADAS_CONTROLADOR = new SalidasAntesControlador();
exports.default = SALIDAS_ANTICIPADAS_CONTROLADOR;
// FUNCION DE BUSQUEDA DE SALIDAS ANTICIPADAS    **USADO
const BuscarSalidasAnticipadas = function (fec_inicio, fec_final, id_empleado) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query(`
            SELECT 
                ag.fecha_hora_horario::VARCHAR,
                ag.fecha_hora_timbre::VARCHAR,
                EXTRACT(EPOCH FROM (ag.fecha_hora_horario - ag.fecha_hora_timbre)) AS diferencia, 
                ag.id_empleado,
                ag.estado_timbre,
                ag.tipo_accion AS accion,
                ag.tipo_dia 
            FROM 
                eu_asistencia_general ag
            JOIN 
                cargos_empleado AS car ON car.id_cargo = ag.id_empleado_cargo
            JOIN 
                eu_empleado_contratos AS ec ON car.id_contrato = ec.id
            WHERE 
                ag.fecha_hora_horario::DATE BETWEEN $1::DATE AND $2::DATE
                AND ag.id_empleado = $3
                AND ec.controlar_asistencia = true
                AND ag.fecha_hora_timbre < ag.fecha_hora_horario
                AND ag.tipo_dia NOT IN ('L', 'FD') 
                AND ag.tipo_accion = 'S'
            ORDER BY 
                ag.fecha_hora_horario ASC;
        `, [fec_inicio, fec_final, id_empleado])
            .then(res => {
            return res.rows;
        });
    });
};
exports.BuscarSalidasAnticipadas = BuscarSalidasAnticipadas;
