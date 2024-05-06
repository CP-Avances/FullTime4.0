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
class ReportesAtrasosControlador {
    // METODO DE BUSQUEDA DE DATOS DE ATRASOS LISTA sucursales[regimenes[departamentos[cargos[empleados]]]]
    ReporteAtrasos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('datos recibidos', req.body);
            let { desde, hasta } = req.params;
            let datos = req.body;
            let n = yield Promise.all(datos.map((suc) => __awaiter(this, void 0, void 0, function* () {
                suc.regimenes = yield Promise.all(suc.regimenes.map((dep) => __awaiter(this, void 0, void 0, function* () {
                    dep.departamentos = yield Promise.all(dep.departamentos.map((car) => __awaiter(this, void 0, void 0, function* () {
                        car.cargos = yield Promise.all(car.cargos.map((empl) => __awaiter(this, void 0, void 0, function* () {
                            empl.empleado = yield Promise.all(empl.empleado.map((o) => __awaiter(this, void 0, void 0, function* () {
                                o.atrasos = yield BuscarAtrasos(desde, hasta, o.codigo);
                                console.log('atrasos: ', o);
                                return o;
                            })));
                            return empl;
                        })));
                        return car;
                    })));
                    return dep;
                })));
                return suc;
            })));
            let nuevo = n.map((suc) => {
                suc.regimes = suc.regimenes.map((dep) => {
                    dep.departamentos = dep.departamentos.map((car) => {
                        car.cargos = car.cargos.map((empl) => {
                            empl.empleado = empl.empleado.filter((a) => { return a.atrasos.length > 0; });
                            return empl;
                        }).filter((empl) => empl.empleado.length > 0);
                        return car;
                    }).filter((car) => { return car.cargos.length > 0; });
                    return dep;
                }).filter((dep) => { return dep.departamentos.length > 0; });
                return suc;
            }).filter((suc) => { return suc.regimenes.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No se ha encontrado registro de atrasos.' });
            return res.status(200).jsonp(nuevo);
        });
    }
    // METODO DE BUSQUEDA DE DATOS DE ATRASOS LISTA sucursales[empleados]
    ReporteAtrasosRegimenCargo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('datos recibidos', req.body);
            let { desde, hasta } = req.params;
            let datos = req.body;
            let n = yield Promise.all(datos.map((suc) => __awaiter(this, void 0, void 0, function* () {
                suc.empleados = yield Promise.all(suc.empleados.map((o) => __awaiter(this, void 0, void 0, function* () {
                    o.atrasos = yield BuscarAtrasos(desde, hasta, o.codigo);
                    console.log('atrasos: ', o);
                    return o;
                })));
                return suc;
            })));
            let nuevo = n.map((e) => {
                e.empleados = e.empleados.filter((a) => { return a.atrasos.length > 0; });
                return e;
            }).filter(e => { return e.empleados.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No se ha encontrado registro de atrasos.' });
            return res.status(200).jsonp(nuevo);
        });
    }
}
// FUNCION DE BUSQUEDA DE REGISTROS DE ATRASOS
const BuscarAtrasos = function (fec_inicio, fec_final, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query(`
        SELECT CAST(fecha_hora_horario AS VARCHAR), CAST(fecha_hora_timbre AS VARCHAR),
            EXTRACT(epoch FROM (fecha_hora_timbre - fecha_hora_horario)) AS diferencia, 
            codigo, estado_timbre, tipo_accion AS accion, tolerancia, tipo_dia 
        FROM eu_asistencia_general WHERE CAST(fecha_hora_horario AS VARCHAR) BETWEEN $1 || \'%\' 
            AND ($2::timestamp + \'1 DAY\') || \'%\' AND codigo = $3 
            AND fecha_hora_timbre > fecha_hora_horario AND tipo_dia NOT IN (\'L\', \'FD\') 
            AND tipo_accion = \'E\' 
        ORDER BY fecha_hora_horario ASC
        `, [fec_inicio, fec_final, codigo])
            .then(res => {
            return res.rows;
        });
    });
};
const REPORTES_ATRASOS_CONTROLADOR = new ReportesAtrasosControlador();
exports.default = REPORTES_ATRASOS_CONTROLADOR;
