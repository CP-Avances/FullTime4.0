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
class SalidasAntesControlador {
    BuscarTimbres_AccionS(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('datos recibidos', req.body);
            let { desde, hasta } = req.params;
            let datos = req.body;
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.departamentos = yield Promise.all(obj.departamentos.map((ele) => __awaiter(this, void 0, void 0, function* () {
                    ele.empleado = yield Promise.all(ele.empleado.map((o) => __awaiter(this, void 0, void 0, function* () {
                        o.timbres = yield BuscarTimbresS(desde, hasta, o.codigo);
                        console.log('timbres:-------------------- ', o);
                        return o;
                    })));
                    return ele;
                })));
                return obj;
            })));
            let nuevo = n.map((obj) => {
                obj.departamentos = obj.departamentos.map((e) => {
                    e.empleado = e.empleado.filter((v) => { return v.timbres.length > 0; });
                    return e;
                }).filter((e) => { return e.empleado.length > 0; });
                return obj;
            }).filter(obj => { return obj.departamentos.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No se ha encontrado registro de timbres.' });
            return res.status(200).jsonp(nuevo);
        });
    }
}
const SALIDAS_ANTICIPADAS_CONTROLADOR = new SalidasAntesControlador();
exports.default = SALIDAS_ANTICIPADAS_CONTROLADOR;
const BuscarTimbresS = function (fec_inicio, fec_final, id) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('datos buscados---------------------*************', id);
        return yield database_1.default.query('SELECT t.fec_hora_timbre::date AS fecha, t.fec_hora_timbre::time AS hora ' +
            'FROM timbres AS t ' +
            'WHERE t.id_empleado = $3 ' +
            'AND t.fec_hora_timbre::date BETWEEN $1 AND $2 AND t.accion = \'S\'', [fec_inicio, fec_final, id])
            .then((res) => {
            return res.rows;
        });
    });
};
const BuscarHoraHorario = function (fecha, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query('SELECT eh.codigo, eh.id_horarios, hora ' +
            'FROM empl_horarios AS eh, deta_horarios AS dh ' +
            'WHERE eh.codigo = $2 ' +
            'AND $1 BETWEEN eh.fec_inicio AND eh.fec_final ' +
            'AND dh.id_horario = eh.id_horarios AND dh.orden = 4', [fecha, codigo])
            .then((res) => {
            return res.rows;
        });
    });
};
