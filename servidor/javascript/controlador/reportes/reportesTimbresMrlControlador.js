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
    ReporteTimbresMrl(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { desde, hasta } = req.params;
            let datos = req.body;
            //El reporte funciona para relojs de 6, 3 y sin acciones.        
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.departamentos = yield Promise.all(obj.departamentos.map((ele) => __awaiter(this, void 0, void 0, function* () {
                    ele.empleado = yield Promise.all(ele.empleado.map((o) => __awaiter(this, void 0, void 0, function* () {
                        o.timbres = yield BuscarTimbres(desde, hasta, o.codigo);
                        console.log('Timbres: ', o);
                        return o;
                    })));
                    return ele;
                })));
                return obj;
            })));
            let nuevo = n.map((obj) => {
                obj.departamentos = obj.departamentos.map((e) => {
                    e.empleado = e.empleado.filter((t) => { return t.timbres.length > 0; });
                    // console.log('Empleados: ',e);
                    return e;
                }).filter((e) => { return e.empleado.length > 0; });
                return obj;
            }).filter(obj => { return obj.departamentos.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No hay timbres en ese periodo.' });
            return res.status(200).jsonp(nuevo);
        });
    }
    ReporteTimbresMrlRegimenCargo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('datos recibidos', req.body);
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
                return res.status(400).jsonp({ message: 'No hay timbres en ese periodo.' });
            return res.status(200).jsonp(nuevo);
        });
    }
}
const REPORTES_TIMBRES_MRL_CONTROLADOR = new ReportesTimbresMrlControlador();
exports.default = REPORTES_TIMBRES_MRL_CONTROLADOR;
const BuscarTimbres = function (fec_inicio, fec_final, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query('SELECT CAST(fec_hora_timbre_servidor AS VARCHAR), accion ' +
            'FROM timbres WHERE CAST(fec_hora_timbre_servidor AS VARCHAR) BETWEEN $1 || \'%\' ' +
            'AND ($2::timestamp + \'1 DAY\') || \'%\' AND codigo = $3 AND accion != \'99\' ' +
            'ORDER BY fec_hora_timbre_servidor ASC', [fec_inicio, fec_final, codigo])
            .then(res => {
            return res.rows;
        });
    });
};
