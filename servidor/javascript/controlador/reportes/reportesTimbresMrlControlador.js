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
class ReportesTimbresMrlControlador {
    // METODO DE BUSQUEDA DE TIMBRES EN FORMATO MRL     **USADO
    ReporteTimbresMrl(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { desde, hasta } = req.params;
            let datos = req.body;
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.empleados = yield Promise.all(obj.empleados.map((o) => __awaiter(this, void 0, void 0, function* () {
                    o.timbres = yield BuscarTimbres(desde, hasta, o.codigo);
                    console.log('Timbres: ', o);
                    return o;
                })));
                return obj;
            })));
            let nuevo = n.map((e) => {
                e.empleados = e.empleados.filter((t) => { return t.timbres.length > 0; });
                return e;
            }).filter(e => { return e.empleados.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No se han encontrado registros.' });
            return res.status(200).jsonp(nuevo);
        });
    }
}
const REPORTES_TIMBRES_MRL_CONTROLADOR = new ReportesTimbresMrlControlador();
exports.default = REPORTES_TIMBRES_MRL_CONTROLADOR;
// FUNCION DE BUSQUEDA DE TIMBRES    **USADO  
const BuscarTimbres = function (fec_inicio, fec_final, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query(`
        SELECT CAST(fecha_hora_timbre_validado AS VARCHAR), accion 
        FROM eu_timbres 
        WHERE CAST(fecha_hora_timbre_validado AS VARCHAR) BETWEEN $1 || \'%\' 
            AND ($2::timestamp + \'1 DAY\') || \'%\' AND codigo = $3 AND accion != \'99\' 
        ORDER BY fecha_hora_timbre_validado ASC
        `, [fec_inicio, fec_final, codigo])
            .then(res => {
            return res.rows;
        });
    });
};
