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
    // METODO DE BUSQUEDA DE DATOS DE TIEMPO LABORADO LISTA
    ReporteTiempoLaborado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { desde, hasta } = req.params;
            let datos = req.body;
            let n = yield Promise.all(datos.map((suc) => __awaiter(this, void 0, void 0, function* () {
                suc.empleados = yield Promise.all(suc.empleados.map((o) => __awaiter(this, void 0, void 0, function* () {
                    const listaTimbres = yield BuscarTiempoLaborado(desde, hasta, o.id);
                    o.tLaborado = yield AgruparTimbres(listaTimbres);
                    console.log('Timbres: ', o);
                    return o;
                })));
                return suc;
            })));
            let nuevo = n.map((e) => {
                e.empleados = e.empleados.filter((t) => { return t.tLaborado.length > 0; });
                return e;
            }).filter(e => { return e.empleados.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No se ha encontrado registros.' });
            return res.status(200).jsonp(nuevo);
        });
    }
}
// FUNCION PARA BUSCAR DATOS DE TIEMPO LABORADO
const BuscarTiempoLaborado = function (fec_inicio, fec_final, id_empleado) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query(`
        SELECT CAST(fecha_horario AS VARCHAR), CAST(fecha_hora_horario AS VARCHAR), CAST(fecha_hora_timbre AS VARCHAR),
            id_empleado, estado_timbre, tipo_accion AS accion, minutos_alimentacion, tipo_dia, id_horario, 
            estado_origen, tolerancia 
        FROM eu_asistencia_general WHERE CAST(fecha_hora_horario AS VARCHAR) BETWEEN $1 || '%' 
            AND ($2::timestamp + '1 DAY') || '%' AND id_empleado = $3 
            AND tipo_accion IN ('E','I/A', 'F/A', 'S') 
        ORDER BY id_empleado, fecha_hora_horario ASC
        `, [fec_inicio, fec_final, id_empleado])
            .then(res => {
            return res.rows;
        });
    });
};
// METODO PARA AGRUPAR TIMBRES
const AgruparTimbres = function agruparTimbresPorClave(timbres) {
    return __awaiter(this, void 0, void 0, function* () {
        const timbresAgrupadosFecha = {};
        const timbresAgrupados = [];
        timbres.forEach((timbre) => {
            const clave = `${timbre.fecha_horario}-${timbre.id_horario}`;
            if (!timbresAgrupadosFecha[clave]) {
                timbresAgrupadosFecha[clave] = [];
            }
            timbresAgrupadosFecha[clave].push(timbre);
        });
        for (let key in timbresAgrupadosFecha) {
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
const REPORTES_TIEMPO_LABORADO_CONTROLADOR = new ReportesTiempoLaboradoControlador();
exports.default = REPORTES_TIEMPO_LABORADO_CONTROLADOR;
