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
    // METODO DE BUSQUEDA DE DATOS DE FALTAS LISTA sucursales[regimenes[departamentos[cargos[empleados]]]]
    ReporteFaltas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('datos recibidos', req.body);
            let { desde, hasta } = req.params;
            let datos = req.body;
            let n = yield Promise.all(datos.map((suc) => __awaiter(this, void 0, void 0, function* () {
                suc.regimenes = yield Promise.all(suc.regimenes.map((dep) => __awaiter(this, void 0, void 0, function* () {
                    dep.departamentos = yield Promise.all(dep.departamentos.map((car) => __awaiter(this, void 0, void 0, function* () {
                        car.cargos = yield Promise.all(car.cargos.map((empl) => __awaiter(this, void 0, void 0, function* () {
                            empl.empleado = yield Promise.all(empl.empleado.map((o) => __awaiter(this, void 0, void 0, function* () {
                                o.timbres = yield BuscarFaltas(desde, hasta, o.codigo);
                                console.log('timbres: ', o);
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
                            empl.empleado = empl.empleado.filter((v) => { return v.timbres.length > 0; });
                            return empl;
                        }).filter((empl) => empl.empleado.length > 0);
                        return car;
                    }).filter((car) => { return car.cargos.length > 0; });
                    return dep;
                }).filter((dep) => { return dep.departamentos.length > 0; });
                return suc;
            }).filter((suc) => { return suc.regimenes.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No se ha encontrado registros.' });
            return res.status(200).jsonp(nuevo);
        });
    }
    // METODO DE BUSQUEDA DE DATOS DE FALTAS LISTA sucursales[empleados]
    ReporteFaltasRegimenCargo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('datos recibidos', req.body);
            let { desde, hasta } = req.params;
            let datos = req.body;
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.empleados = yield Promise.all(obj.empleados.map((o) => __awaiter(this, void 0, void 0, function* () {
                    o.timbres = yield BuscarFaltas(desde, hasta, o.codigo);
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
                return res.status(400).jsonp({ message: 'No se ha encontrado registros.' });
            return res.status(200).jsonp(nuevo);
        });
    }
}
// FUNCION DE BUSQUEDA DE REGISTROS DE FALTAS
const BuscarFaltas = function (fec_inicio, fec_final, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query(`
        SELECT codigo, CAST(fecha_horario AS VARCHAR)
        FROM eu_asistencia_gneral WHERE fecha_horario BETWEEN $1 AND $2 AND codigo = $3
            AND tipo_dia NOT IN (\'L\', \'FD\')
        GROUP BY codigo, fecha_horario
        HAVING COUNT(fecha_hora_timbre) = 0 
        ORDER BY fecha_horario ASC
        `, [fec_inicio, fec_final, codigo])
            .then(res => {
            return res.rows;
        });
    });
};
const FALTAS_CONTROLADOR = new FaltasControlador();
exports.default = FALTAS_CONTROLADOR;
