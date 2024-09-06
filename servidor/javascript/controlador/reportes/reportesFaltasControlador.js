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
class FaltasControlador {
    // METODO DE BUSQUEDA DE DATOS DE FALTAS    **USADO
    ReporteFaltas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { desde, hasta } = req.params;
            let datos = req.body;
            console.log("ver datos, ", req.body);
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.empleados = yield Promise.all(obj.empleados.map((o) => __awaiter(this, void 0, void 0, function* () {
                    o.faltas = yield BuscarFaltas(desde, hasta, o.id);
                    console.log('Timbres: ', o);
                    return o;
                })));
                return obj;
            })));
            let nuevo = n.map((e) => {
                e.empleados = e.empleados.filter((t) => { return t.faltas.length > 0; });
                return e;
            }).filter(e => { return e.empleados.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No se ha encontrado registros.' });
            return res.status(200).jsonp(nuevo);
        });
    }
}
// FUNCION DE BUSQUEDA DE REGISTROS DE FALTAS
const BuscarFaltas = function (fec_inicio, fec_final, id_empleado) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query(`
        SELECT id_empleado, CAST(fecha_horario AS VARCHAR)
        FROM eu_asistencia_general WHERE fecha_horario BETWEEN $1 AND $2 AND id_empleado = $3
            AND tipo_dia NOT IN (\'L\', \'FD\')
        GROUP BY id_empleado, fecha_horario
        HAVING COUNT(fecha_hora_timbre) = 0 
        ORDER BY fecha_horario ASC
        `, [fec_inicio, fec_final, id_empleado])
            .then(res => {
            return res.rows;
        });
    });
};
const FALTAS_CONTROLADOR = new FaltasControlador();
exports.default = FALTAS_CONTROLADOR;
