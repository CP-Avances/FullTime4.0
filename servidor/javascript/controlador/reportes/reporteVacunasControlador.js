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
    ReporteVacunasMultiple(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('datos recibidos', req.body);
            let datos = req.body;
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.departamentos = yield Promise.all(obj.departamentos.map((ele) => __awaiter(this, void 0, void 0, function* () {
                    ele.empleado = yield Promise.all(ele.empleado.map((o) => __awaiter(this, void 0, void 0, function* () {
                        o.vacunas = yield BuscarVacunas(o.id);
                        console.log('Vacunas: ', o);
                        return o;
                    })));
                    return ele;
                })));
                return obj;
            })));
            let nuevo = n.map((obj) => {
                obj.departamentos = obj.departamentos.map((e) => {
                    e.empleado = e.empleado.filter((v) => { return v.vacunas.length > 0; });
                    return e;
                }).filter((e) => { return e.empleado.length > 0; });
                return obj;
            }).filter(obj => { return obj.departamentos.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No se ha encontrado registro de vacunas.' });
            return res.status(200).jsonp(nuevo);
        });
    }
    ReporteVacunasMultipleCargos(req, res) {
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
            console.log('n', n);
            let nuevo = n.map((obj) => {
                obj.empleados = obj.empleados.filter((v) => { return v.vacunas.length > 0; });
                return obj;
            }).filter(obj => { return obj.empleados.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No se ha encontrado registro de vacunas.' });
            return res.status(200).jsonp(nuevo);
        });
    }
}
const VACUNAS_REPORTE_CONTROLADOR = new ReportesVacunasControlador();
exports.default = VACUNAS_REPORTE_CONTROLADOR;
const BuscarVacunas = function (id) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query(`
        SELECT ev.id, ev.id_empleado, tv.nombre AS tipo_vacuna, 
            ev.carnet, ev.nom_carnet, ev.fecha, ev.descripcion
        FROM empl_vacunas AS ev, tipo_vacuna AS tv 
        WHERE ev.id_tipo_vacuna = tv.id
            AND ev.id_empleado = $1 
        ORDER BY ev.id DESC`, [id])
            .then((res) => {
            return res.rows;
        });
    });
};
