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
class ReportesTiempoLaboradoControlador {
    ReporteTiempoLaborado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('datos recibidos', req.body);
            let { desde, hasta } = req.params;
            let datos = req.body;
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.departamentos = yield Promise.all(obj.departamentos.map((ele) => __awaiter(this, void 0, void 0, function* () {
                    ele.empleado = yield Promise.all(ele.empleado.map((o) => __awaiter(this, void 0, void 0, function* () {
                        const listaTimbres = yield BuscarTiempoLaborado(desde, hasta, o.codigo);
                        o.timbres = yield agruparTimbres(listaTimbres);
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
                return res.status(400).jsonp({ message: 'No se ha encontrado registro de tiempo laborado.' });
            return res.status(200).jsonp(nuevo);
        });
    }
    ReporteTiempoLaboradoRegimenCargo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('datos recibidos', req.body);
            let { desde, hasta } = req.params;
            let datos = req.body;
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.empleados = yield Promise.all(obj.empleados.map((o) => __awaiter(this, void 0, void 0, function* () {
                    const listaTimbres = yield BuscarTiempoLaborado(desde, hasta, o.codigo);
                    o.timbres = yield agruparTimbres(listaTimbres);
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
                return res.status(400).jsonp({ message: 'No se ha encontrado registro de tiempo laborado.' });
            return res.status(200).jsonp(nuevo);
        });
    }
}
const REPORTES_TIEMPO_LABORADO_CONTROLADOR = new ReportesTiempoLaboradoControlador();
exports.default = REPORTES_TIEMPO_LABORADO_CONTROLADOR;
const BuscarTiempoLaborado = function (fec_inicio, fec_final, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query('SELECT CAST(fec_horario AS VARCHAR), CAST(fec_hora_horario AS VARCHAR), CAST(fec_hora_timbre AS VARCHAR), ' +
            'codigo, estado_timbre, tipo_entr_salida AS accion, min_alimentacion, tipo_dia, id_horario, estado_origen, tolerancia ' +
            'FROM plan_general WHERE CAST(fec_hora_horario AS VARCHAR) BETWEEN $1 || \'%\' ' +
            'AND ($2::timestamp + \'1 DAY\') || \'%\' AND codigo = $3 ' +
            'AND tipo_entr_salida IN (\'E\',\'I/A\', \'F/A\', \'S\') ' +
            'ORDER BY codigo, fec_hora_horario ASC', [fec_inicio, fec_final, codigo])
            .then(res => {
            return res.rows;
        });
    });
};
const agruparTimbres = function agruparTimbresPorClave(timbres) {
    return __awaiter(this, void 0, void 0, function* () {
        const timbresAgrupadosFecha = {};
        const timbresAgrupados = [];
        timbres.forEach((timbre) => {
            const clave = `${timbre.fec_horario}-${timbre.id_horario}`;
            if (!timbresAgrupadosFecha[clave]) {
                timbresAgrupadosFecha[clave] = [];
            }
            timbresAgrupadosFecha[clave].push(timbre);
        });
        for (let key in timbresAgrupadosFecha) {
            console.log('key', key);
            const cantidadTimbres = timbresAgrupadosFecha[key].length;
            switch (cantidadTimbres) {
                case 4:
                    for (let i = 0; i < timbresAgrupadosFecha[key].length; i += 4) {
                        timbresAgrupados.push({
                            tipo: 'EAS',
                            dia: timbresAgrupadosFecha[key][i].tipo_dia,
                            origen: timbresAgrupadosFecha[key][i].estado_origen,
                            entrada: timbresAgrupadosFecha[key][i],
                            inicioAlimentacion: timbresAgrupadosFecha[key][i + 1],
                            finAlimentacion: timbresAgrupadosFecha[key][i + 2],
                            salida: i + 3 < timbresAgrupadosFecha[key].length ? timbresAgrupadosFecha[key][i + 3] : null
                        });
                    }
                    break;
                case 2:
                    for (let i = 0; i < timbresAgrupadosFecha[key].length; i += 2) {
                        timbresAgrupados.push({
                            tipo: 'ES',
                            dia: timbresAgrupadosFecha[key][i].tipo_dia,
                            origen: timbresAgrupadosFecha[key][i].estado_origen,
                            entrada: timbresAgrupadosFecha[key][i],
                            salida: i + 1 < timbresAgrupadosFecha[key].length ? timbresAgrupadosFecha[key][i + 1] : null
                        });
                    }
                    break;
            }
        }
        return timbresAgrupados;
    });
};
