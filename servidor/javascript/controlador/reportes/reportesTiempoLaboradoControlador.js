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
const luxon_1 = require("luxon");
class ReportesTiempoLaboradoControlador {
    // METODO DE BUSQUEDA DE DATOS DE TIEMPO LABORADO    **USADO
    ReporteTiempoLaborado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { desde, hasta } = req.params;
            let datos = req.body;
            let n = yield Promise.all(datos.map((suc) => __awaiter(this, void 0, void 0, function* () {
                suc.empleados = yield Promise.all(suc.empleados.map((o) => __awaiter(this, void 0, void 0, function* () {
                    const listaTimbres = yield BuscarTiempoLaborado(desde, hasta, o.id);
                    o.tLaborado = yield AgruparTimbres(listaTimbres);
                    yield Promise.all(o.tLaborado.map((t) => __awaiter(this, void 0, void 0, function* () {
                        const [minAlimentacion, minLaborados, minAtrasos, minSalidasAnticipadas, minPlanificados] = yield calcularTiempoLaborado(t);
                        t.minAlimentacion = minAlimentacion;
                        t.minLaborados = minLaborados;
                        t.minAtrasos = minAtrasos;
                        t.minSalidasAnticipadas = minSalidasAnticipadas;
                        t.minPlanificados = minPlanificados;
                    })));
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
        SELECT CAST(ag.fecha_horario AS VARCHAR), CAST(ag.fecha_hora_horario AS VARCHAR), CAST(ag.fecha_hora_timbre AS VARCHAR),
            ag.id_empleado, ag.estado_timbre, ag.tipo_accion AS accion, ag.minutos_alimentacion, ag.tipo_dia, ag.id_horario, ec.controlar_asistencia,
            ag.estado_origen, ag.tolerancia 
        FROM eu_asistencia_general AS ag, eu_empleado_contratos AS ec
        WHERE CAST(ag.fecha_hora_horario AS VARCHAR) BETWEEN $1 || '%' 
            AND ($2::timestamp + '1 DAY') || '%' AND ag.id_empleado = $3  AND ag.id_empleado = $3 AND ec.id_empleado = ag.id_empleado 
            AND ag.tipo_accion IN ('E','I/A', 'F/A', 'S') 
        ORDER BY ag.id_empleado, ag.fecha_hora_horario ASC
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
                            salida: i + 3 < timbresAgrupadosFecha[key].length ? timbresAgrupadosFecha[key][i + 3] : null,
                            control: timbresAgrupadosFecha[key][i].controlar_asistencia,
                            tolerancia: timbresAgrupadosFecha[key][i].tolerancia,
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
                            salida: i + 1 < timbresAgrupadosFecha[key].length ? timbresAgrupadosFecha[key][i + 1] : null,
                            control: timbresAgrupadosFecha[key][i].controlar_asistencia,
                            tolerancia: timbresAgrupadosFecha[key][i].tolerancia,
                        });
                    }
                    break;
            }
        }
        return timbresAgrupados;
    });
};
// CONSULTAR PARAMETRO DE TOLERANCIA
function consultarParametroTolerancia(parametro) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const resultado = yield database_1.default.query(`
        SELECT descripcion
        FROM ep_detalle_parametro
        WHERE id_parametro = $1
        `, [parametro]);
        return ((_a = resultado.rows[0]) === null || _a === void 0 ? void 0 : _a.descripcion) || null;
    });
}
// CALCULAR DIREFERENCIA DE TIEMPO EN MINUTOS
function calcularDiferenciaEnMinutos(fecha1, fecha2) {
    const dt1 = luxon_1.DateTime.fromSQL(fecha1);
    const dt2 = luxon_1.DateTime.fromSQL(fecha2);
    const diff = dt2.diff(dt1, ['hours', 'minutes', 'seconds']);
    return diff.as('minutes');
}
// CALCULAR TIEMPO LABORADO
function calcularTiempoLaborado(tLaborado) {
    return __awaiter(this, void 0, void 0, function* () {
        if (['L', 'FD'].includes(tLaborado.origen))
            return [0, 0, 0, 0, 0];
        const { entrada, salida, inicioAlimentacion, finAlimentacion, tolerancia, tipo } = tLaborado;
        const parametroTolerancia = yield consultarParametroTolerancia(3);
        let minutosAlimentacion = 0;
        let minutosLaborados = 0;
        let minutosAtrasos = 0;
        let minutosSalidasAnticipadas = 0;
        let minutosPlanificados = 0;
        const hayTimbresEntradaYSalida = entrada.fecha_hora_timbre && salida.fecha_hora_timbre;
        if (entrada.fecha_hora_timbre) {
            minutosAtrasos = calcularAtraso(entrada.fecha_hora_horario, entrada.fecha_hora_timbre, tolerancia, parametroTolerancia);
        }
        if (salida.fecha_hora_timbre) {
            minutosSalidasAnticipadas = calcularSalidaAnticipada(salida.fecha_hora_timbre, salida.fecha_hora_horario);
        }
        if (hayTimbresEntradaYSalida) {
            minutosLaborados = calcularDiferenciaEnMinutos(entrada.fecha_hora_timbre, salida.fecha_hora_timbre);
        }
        minutosPlanificados = calcularDiferenciaEnMinutos(entrada.fecha_hora_horario, salida.fecha_hora_horario);
        if (tipo !== 'ES') {
            const minAlimentacionBase = inicioAlimentacion.minutos_alimentacion;
            minutosAlimentacion = calcularTiempoAlimentacion(inicioAlimentacion.fecha_hora_timbre, finAlimentacion.fecha_hora_timbre, minAlimentacionBase);
            if (minutosLaborados > 0) {
                minutosLaborados -= minutosAlimentacion;
            }
        }
        return [
            minutosAlimentacion,
            minutosLaborados,
            minutosAtrasos,
            minutosSalidasAnticipadas,
            minutosPlanificados,
        ];
    });
}
;
function calcularAtraso(horaHorario, horaTimbre, tolerancia, parametroTolerancia) {
    const diferencia = Math.max(calcularDiferenciaEnMinutos(horaHorario, horaTimbre), 0);
    if (parametroTolerancia === '1')
        return diferencia;
    if (diferencia > tolerancia) {
        return parametroTolerancia === '2-1' ? diferencia : diferencia - tolerancia;
    }
    return 0;
}
function calcularSalidaAnticipada(horaTimbre, horaHorario) {
    return Math.max(calcularDiferenciaEnMinutos(horaTimbre, horaHorario), 0);
}
function calcularTiempoAlimentacion(inicioTimbre, finTimbre, minutosPorDefecto) {
    if (inicioTimbre && finTimbre) {
        return calcularDiferenciaEnMinutos(inicioTimbre, finTimbre);
    }
    return minutosPorDefecto;
}
const REPORTES_TIEMPO_LABORADO_CONTROLADOR = new ReportesTiempoLaboradoControlador();
exports.default = REPORTES_TIEMPO_LABORADO_CONTROLADOR;
