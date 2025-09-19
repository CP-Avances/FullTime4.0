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
exports.ALIMENTACION_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../database"));
class AlimentacionControlador {
    // METODO PARA BUSCAR DATOS DE ALIMENTACION   **USADO
    ReporteTimbresAlimentacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("LLEGA HASTA AQUI EN EL BACKEND");
            let { desde, hasta } = req.params;
            let datos = req.body;
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.empleados = yield Promise.all(obj.empleados.map((o) => __awaiter(this, void 0, void 0, function* () {
                    const listaTimbres = yield BuscarAlimentacion(desde, hasta, o.id);
                    o.alimentacion = yield AgruparTimbres(listaTimbres);
                    return o;
                })));
                return obj;
            })));
            let nuevo = n.map((e) => {
                e.empleados = e.empleados.filter((t) => { return t.alimentacion.length > 0; });
                return e;
            }).filter(e => { return e.empleados.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No se ha encontrado registro de timbres de alimentación.' });
            return res.status(200).jsonp(nuevo);
        });
    }
}
exports.ALIMENTACION_CONTROLADOR = new AlimentacionControlador();
exports.default = exports.ALIMENTACION_CONTROLADOR;
// FUNCION PARA BUSCAR DATOS DE ALIMENTACION
const BuscarAlimentacion = function (fec_inicio, fec_final, id_empleado) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query(`
        SELECT CAST(fecha_horario AS VARCHAR), CAST(fecha_hora_horario AS VARCHAR), CAST(fecha_hora_timbre AS VARCHAR),
            id_empleado, estado_timbre, tipo_accion AS accion, minutos_alimentacion 
        FROM eu_asistencia_general 
        WHERE CAST(fecha_hora_horario AS VARCHAR) BETWEEN $1 || '%' 
            AND ($2::timestamp + '1 DAY') || '%' AND id_empleado = $3 
            AND tipo_accion IN ('I/A', 'F/A') 
        ORDER BY id_empleado, fecha_hora_horario ASC
        `, [fec_inicio, fec_final, id_empleado])
            .then(res => {
            return res.rows;
        });
    });
};
// METODO PARA AGRUPAR TIMBRES
const AgruparTimbres = function (listaTimbres) {
    return __awaiter(this, void 0, void 0, function* () {
        const timbresAgrupados = [];
        for (let i = 0; i < listaTimbres.length; i += 2) {
            timbresAgrupados.push({
                inicioAlimentacion: listaTimbres[i],
                finAlimentacion: i + 1 < listaTimbres.length ? listaTimbres[i + 1] : null
            });
        }
        return timbresAgrupados;
    });
};
