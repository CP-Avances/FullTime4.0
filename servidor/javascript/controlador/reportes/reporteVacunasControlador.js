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
class ReportesVacunasControlador {
    // METODO DE BUSQUEDA DE DATOS DE VACUNAS LISTA sucursales[regimenes[departamentos[cargos[empleados]]]]
    ReporteVacunasMultiple(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('datos recibidos', req.body);
            let datos = req.body;
            let n = yield Promise.all(datos.map((suc) => __awaiter(this, void 0, void 0, function* () {
                suc.regimenes = yield Promise.all(suc.regimenes.map((dep) => __awaiter(this, void 0, void 0, function* () {
                    dep.departamentos = yield Promise.all(dep.departamentos.map((car) => __awaiter(this, void 0, void 0, function* () {
                        car.cargos = yield Promise.all(car.cargos.map((empl) => __awaiter(this, void 0, void 0, function* () {
                            empl.empleado = yield Promise.all(empl.empleado.map((o) => __awaiter(this, void 0, void 0, function* () {
                                o.vacunas = yield BuscarVacunas(o.id);
                                console.log('Vacunas: ', o);
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
                            empl.empleado = empl.empleado.filter((v) => { return v.vacunas.length > 0; });
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
    // METODO DE BUSQUEDA DE DATOS DE VACUNAS LISTA sucursales[empleados]
    ReporteVacunasMultipleCargosRegimen(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('datos recibidos', req.body);
            let datos = req.body;
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.empleados = yield Promise.all(obj.empleados.map((o) => __awaiter(this, void 0, void 0, function* () {
                    o.vacunas = yield BuscarVacunas(o.id);
                    console.log('Vacunas: ', o);
                    return o;
                })));
                return obj;
            })));
            let nuevo = n.map((obj) => {
                obj.empleados = obj.empleados.filter((v) => { return v.vacunas.length > 0; });
                return obj;
            }).filter(obj => { return obj.empleados.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No se ha encontrado registros.' });
            return res.status(200).jsonp(nuevo);
        });
    }
}
// FUNCION DE BUSQUEDA DE REGISTROS DE VACUNAS
const BuscarVacunas = function (id) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query(`
        SELECT ev.id, ev.id_empleado, tv.nombre AS tipo_vacuna, 
            ev.carnet, ev.fecha, ev.descripcion
        FROM eu_empleado_vacunas AS ev, e_cat_vacuna AS tv 
        WHERE ev.id_vacuna = tv.id
            AND ev.id_empleado = $1 
        ORDER BY ev.id DESC
        `, [id])
            .then((res) => {
            return res.rows;
        });
    });
};
const VACUNAS_REPORTE_CONTROLADOR = new ReportesVacunasControlador();
exports.default = VACUNAS_REPORTE_CONTROLADOR;
