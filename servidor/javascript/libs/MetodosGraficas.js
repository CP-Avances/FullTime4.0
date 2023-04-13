"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricaAtrasosEmpleadoSinAcciones = exports.MetricaAtrasosEmpleado = exports.MetricaPermisosEmpleado = exports.MetricaVacacionesEmpleado = exports.MetricaHorasExtraEmpleado = exports.GraficaSalidasAnticipadasSinAcciones = exports.GraficaSalidasAnticipadas = exports.GraficaMarcaciones = exports.GraficaTiempoJornada_VS_HorasExtras = exports.GraficaT_Jor_VS_HorExtTimbresSinAcciones = exports.GraficaJ_VS_H_E_SinAcciones = exports.GraficaJornada_VS_HorasExtras = exports.GraficaHorasExtras = exports.GraficaAsistencia = exports.GraficaAtrasos = exports.GraficaAtrasosSinAcciones = exports.GraficaInasistencia = void 0;
const M_graficas = __importStar(require("./SubMetodosGraficas"));
const GraficaInasistencia = function (id_empresa, fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(id_empresa, fec_inicio, fec_final);
        let horarios = yield M_graficas.BuscarHorariosActivos(fec_inicio.toJSON().split('T')[0], fec_final.toJSON().split('T')[0]);
        let array = yield Promise.all(horarios.map((obj) => __awaiter(this, void 0, void 0, function* () {
            obj.horario = yield M_graficas.BuscarTimbresByCodigo_Fecha(obj.codigo, obj.horario);
            return obj;
        })));
        let modelarAnio = {
            enero: [],
            febrero: [],
            marzo: [],
            abril: [],
            mayo: [],
            junio: [],
            julio: [],
            agosto: [],
            septiembre: [],
            octubre: [],
            noviembre: [],
            diciembre: []
        };
        array.forEach(obj => {
            // console.log(obj);
            obj.horario.forEach((ele) => {
                let fecha = parseInt(ele.fecha.split('-')[1]);
                if (ele.timbresTotal === 0) {
                    switch (fecha) {
                        case 1:
                            modelarAnio.enero.push(ele.fecha);
                            break;
                        case 2:
                            modelarAnio.febrero.push(ele.fecha);
                            break;
                        case 3:
                            modelarAnio.marzo.push(ele.fecha);
                            break;
                        case 4:
                            modelarAnio.abril.push(ele.fecha);
                            break;
                        case 5:
                            modelarAnio.mayo.push(ele.fecha);
                            break;
                        case 6:
                            modelarAnio.junio.push(ele.fecha);
                            break;
                        case 7:
                            modelarAnio.julio.push(ele.fecha);
                            break;
                        case 8:
                            modelarAnio.agosto.push(ele.fecha);
                            break;
                        case 9:
                            modelarAnio.septiembre.push(ele.fecha);
                            break;
                        case 10:
                            modelarAnio.octubre.push(ele.fecha);
                            break;
                        case 11:
                            modelarAnio.noviembre.push(ele.fecha);
                            break;
                        case 12:
                            modelarAnio.diciembre.push(ele.fecha);
                            break;
                        default: break;
                    }
                }
            });
        });
        horarios = [];
        array = [];
        let data = [
            { id: 0, mes: 'Enero', valor: modelarAnio.enero.length },
            { id: 1, mes: 'Febrero', valor: modelarAnio.febrero.length },
            { id: 2, mes: 'Marzo', valor: modelarAnio.marzo.length },
            { id: 3, mes: 'Abril', valor: modelarAnio.abril.length },
            { id: 4, mes: 'Mayo', valor: modelarAnio.mayo.length },
            { id: 5, mes: 'Junio', valor: modelarAnio.junio.length },
            { id: 6, mes: 'Julio', valor: modelarAnio.julio.length },
            { id: 7, mes: 'Agosto', valor: modelarAnio.agosto.length },
            { id: 8, mes: 'Septiembre', valor: modelarAnio.septiembre.length },
            { id: 9, mes: 'Octubre', valor: modelarAnio.octubre.length },
            { id: 10, mes: 'Noviembre', valor: modelarAnio.noviembre.length },
            { id: 11, mes: 'Diciembre', valor: modelarAnio.diciembre.length }
        ];
        let meses = data.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.mes; });
        let valor_mensual = data.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.valor; });
        return {
            datos: data,
            datos_grafica: {
                tooltip: { trigger: 'axis' },
                legend: { data: ['faltas'] },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    name: 'Mes',
                    data: meses
                },
                yAxis: { type: 'value', name: 'N° Faltas' },
                series: [
                    {
                        name: 'faltas',
                        type: 'line',
                        data: valor_mensual
                    }
                ]
            }
        };
    });
};
exports.GraficaInasistencia = GraficaInasistencia;
const GraficaAtrasosSinAcciones = function (id_empresa, fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(id_empresa, fec_inicio, fec_final);
        let array = yield M_graficas.BuscarTimbresEntradasSinAcciones(fec_inicio.toJSON().split('T')[0], fec_final.toJSON().split('T')[0]);
        // console.log(array);
        let modelarAnio = {
            enero: [],
            febrero: [],
            marzo: [],
            abril: [],
            mayo: [],
            junio: [],
            julio: [],
            agosto: [],
            septiembre: [],
            octubre: [],
            noviembre: [],
            diciembre: []
        };
        array.forEach((ele) => {
            // console.log('ATRASOS: ', ele.fecha);
            if (ele !== 0) {
                let fecha = parseInt(ele.fecha.split('-')[1]);
                switch (fecha) {
                    case 1:
                        modelarAnio.enero.push(ele.tiempo_atraso);
                        break;
                    case 2:
                        modelarAnio.febrero.push(ele.tiempo_atraso);
                        break;
                    case 3:
                        modelarAnio.marzo.push(ele.tiempo_atraso);
                        break;
                    case 4:
                        modelarAnio.abril.push(ele.tiempo_atraso);
                        break;
                    case 5:
                        modelarAnio.mayo.push(ele.tiempo_atraso);
                        break;
                    case 6:
                        modelarAnio.junio.push(ele.tiempo_atraso);
                        break;
                    case 7:
                        modelarAnio.julio.push(ele.tiempo_atraso);
                        break;
                    case 8:
                        modelarAnio.agosto.push(ele.tiempo_atraso);
                        break;
                    case 9:
                        modelarAnio.septiembre.push(ele.tiempo_atraso);
                        break;
                    case 10:
                        modelarAnio.octubre.push(ele.tiempo_atraso);
                        break;
                    case 11:
                        modelarAnio.noviembre.push(ele.tiempo_atraso);
                        break;
                    case 12:
                        modelarAnio.diciembre.push(ele.tiempo_atraso);
                        break;
                    default: break;
                }
            }
        });
        let data = [
            { id: 0, mes: 'Enero', valor: M_graficas.SumarValoresArray(modelarAnio.enero) },
            { id: 1, mes: 'Febrero', valor: M_graficas.SumarValoresArray(modelarAnio.febrero) },
            { id: 2, mes: 'Marzo', valor: M_graficas.SumarValoresArray(modelarAnio.marzo) },
            { id: 3, mes: 'Abril', valor: M_graficas.SumarValoresArray(modelarAnio.abril) },
            { id: 4, mes: 'Mayo', valor: M_graficas.SumarValoresArray(modelarAnio.mayo) },
            { id: 5, mes: 'Junio', valor: M_graficas.SumarValoresArray(modelarAnio.junio) },
            { id: 6, mes: 'Julio', valor: M_graficas.SumarValoresArray(modelarAnio.julio) },
            { id: 7, mes: 'Agosto', valor: M_graficas.SumarValoresArray(modelarAnio.agosto) },
            { id: 8, mes: 'Septiembre', valor: M_graficas.SumarValoresArray(modelarAnio.septiembre) },
            { id: 9, mes: 'Octubre', valor: M_graficas.SumarValoresArray(modelarAnio.octubre) },
            { id: 10, mes: 'Noviembre', valor: M_graficas.SumarValoresArray(modelarAnio.noviembre) },
            { id: 11, mes: 'Diciembre', valor: M_graficas.SumarValoresArray(modelarAnio.diciembre) }
        ];
        let meses = data.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.mes; });
        let valor_mensual = data.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.valor; });
        return {
            datos: data,
            datos_grafica: {
                color: ['#3398DB'],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' }
                },
                legend: {
                    align: 'left',
                    data: [{ name: 'horas' }]
                },
                xAxis: {
                    name: 'Meses',
                    type: 'category',
                    data: meses,
                    axisTick: { alignWithLabel: true }
                },
                yAxis: [{ type: 'value', name: 'Tiempo Atraso' }],
                series: [{
                        name: 'horas',
                        type: 'bar',
                        barWidth: '60%',
                        data: valor_mensual
                    }]
            }
        };
    });
};
exports.GraficaAtrasosSinAcciones = GraficaAtrasosSinAcciones;
const GraficaAtrasos = function (id_empresa, fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(id_empresa, fec_inicio, fec_final);
        let timbres = yield M_graficas.BuscarTimbresEntradas(fec_inicio.toJSON().split('T')[0], fec_final.toJSON().split('T')[0]);
        console.log(timbres);
        let modelarAnio = {
            enero: [],
            febrero: [],
            marzo: [],
            abril: [],
            mayo: [],
            junio: [],
            julio: [],
            agosto: [],
            septiembre: [],
            octubre: [],
            noviembre: [],
            diciembre: []
        };
        let array = yield Promise.all(timbres.map((obj) => __awaiter(this, void 0, void 0, function* () {
            return yield M_graficas.ModelarAtrasos(obj, fec_inicio.toJSON().split('T')[0], fec_final.toJSON().split('T')[0]);
        })));
        array.filter((o) => {
            return o.tiempo_atraso > 0;
        }).forEach((ele) => {
            let fecha = parseInt(ele.fecha.split('-')[1]);
            switch (fecha) {
                case 1:
                    modelarAnio.enero.push(ele.tiempo_atraso);
                    break;
                case 2:
                    modelarAnio.febrero.push(ele.tiempo_atraso);
                    break;
                case 3:
                    modelarAnio.marzo.push(ele.tiempo_atraso);
                    break;
                case 4:
                    modelarAnio.abril.push(ele.tiempo_atraso);
                    break;
                case 5:
                    modelarAnio.mayo.push(ele.tiempo_atraso);
                    break;
                case 6:
                    modelarAnio.junio.push(ele.tiempo_atraso);
                    break;
                case 7:
                    modelarAnio.julio.push(ele.tiempo_atraso);
                    break;
                case 8:
                    modelarAnio.agosto.push(ele.tiempo_atraso);
                    break;
                case 9:
                    modelarAnio.septiembre.push(ele.tiempo_atraso);
                    break;
                case 10:
                    modelarAnio.octubre.push(ele.tiempo_atraso);
                    break;
                case 11:
                    modelarAnio.noviembre.push(ele.tiempo_atraso);
                    break;
                case 12:
                    modelarAnio.diciembre.push(ele.tiempo_atraso);
                    break;
                default: break;
            }
        });
        timbres = [];
        let data = [
            { id: 0, mes: 'Enero', valor: M_graficas.SumarValoresArray(modelarAnio.enero) },
            { id: 1, mes: 'Febrero', valor: M_graficas.SumarValoresArray(modelarAnio.febrero) },
            { id: 2, mes: 'Marzo', valor: M_graficas.SumarValoresArray(modelarAnio.marzo) },
            { id: 3, mes: 'Abril', valor: M_graficas.SumarValoresArray(modelarAnio.abril) },
            { id: 4, mes: 'Mayo', valor: M_graficas.SumarValoresArray(modelarAnio.mayo) },
            { id: 5, mes: 'Junio', valor: M_graficas.SumarValoresArray(modelarAnio.junio) },
            { id: 6, mes: 'Julio', valor: M_graficas.SumarValoresArray(modelarAnio.julio) },
            { id: 7, mes: 'Agosto', valor: M_graficas.SumarValoresArray(modelarAnio.agosto) },
            { id: 8, mes: 'Septiembre', valor: M_graficas.SumarValoresArray(modelarAnio.septiembre) },
            { id: 9, mes: 'Octubre', valor: M_graficas.SumarValoresArray(modelarAnio.octubre) },
            { id: 10, mes: 'Noviembre', valor: M_graficas.SumarValoresArray(modelarAnio.noviembre) },
            { id: 11, mes: 'Diciembre', valor: M_graficas.SumarValoresArray(modelarAnio.diciembre) }
        ];
        let meses = data.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.mes; });
        let valor_mensual = data.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.valor; });
        return {
            datos: data,
            datos_grafica: {
                color: ['#3398DB'],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' }
                },
                legend: {
                    align: 'left',
                    data: [{ name: 'horas' }]
                },
                xAxis: {
                    name: 'Meses',
                    type: 'category',
                    data: meses,
                    axisTick: { alignWithLabel: true }
                },
                yAxis: [{ type: 'value', name: 'Tiempo Atraso' }],
                series: [{
                        name: 'horas',
                        type: 'bar',
                        barWidth: '60%',
                        data: valor_mensual
                    }]
            }
        };
    });
};
exports.GraficaAtrasos = GraficaAtrasos;
const GraficaAsistencia = function (id_empresa, fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(id_empresa, fec_inicio, fec_final);
        let horarios = yield M_graficas.BuscarHorariosActivos(fec_inicio.toJSON().split('T')[0], fec_final.toJSON().split('T')[0]);
        let array = yield Promise.all(horarios.map((obj) => __awaiter(this, void 0, void 0, function* () {
            obj.horario = yield M_graficas.BuscarTimbresByCodigo_Fecha(obj.codigo, obj.horario);
            obj.horario = yield Promise.all(obj.horario.map((o) => __awaiter(this, void 0, void 0, function* () {
                o.justificado = yield M_graficas.BuscarPermisosJustificados(obj.codigo, o.fecha);
                return o;
            })));
            return obj;
        })));
        let modelarPie = {
            presente: [],
            a_justifi: [],
            a_no_justi: [],
        };
        array.forEach(obj => {
            obj.horario.forEach((ele) => {
                // console.log(ele);
                let fecha = parseInt(ele.fecha.split('-')[1]);
                if (ele.timbresTotal === 0 && ele.justificado === 0) {
                    modelarPie.a_no_justi.push(fecha);
                }
                else if (ele.timbresTotal === 0 && ele.justificado > 0) {
                    modelarPie.a_justifi.push(fecha);
                }
                else {
                    modelarPie.presente.push(fecha);
                }
            });
        });
        horarios = [];
        array = [];
        return {
            datos_grafica: {
                tooltip: { trigger: 'item' },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                },
                series: {
                    name: 'Asistencia',
                    type: 'pie',
                    radius: '50%',
                    data: [
                        { value: modelarPie.a_justifi.length, name: 'Ausencia justificada' },
                        { value: modelarPie.a_no_justi.length, name: 'Ausencia no justificada' },
                        { value: modelarPie.presente.length, name: 'Presencia', selected: true }
                    ],
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            }
        };
    });
};
exports.GraficaAsistencia = GraficaAsistencia;
const GraficaHorasExtras = function (id_empresa, fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(id_empresa, fec_inicio, fec_final);
        let horas_extras = yield M_graficas.HoraExtra_ModelarDatos(fec_inicio, fec_final);
        let modelarAnio = {
            enero: [],
            febrero: [],
            marzo: [],
            abril: [],
            mayo: [],
            junio: [],
            julio: [],
            agosto: [],
            septiembre: [],
            octubre: [],
            noviembre: [],
            diciembre: []
        };
        horas_extras.forEach((obj) => {
            let fecha = parseInt(obj.fecha.split('-')[1]);
            // console.log(fecha.getMonth());
            switch (fecha) {
                case 1:
                    modelarAnio.enero.push(obj.tiempo);
                    break;
                case 2:
                    modelarAnio.febrero.push(obj.tiempo);
                    break;
                case 3:
                    modelarAnio.marzo.push(obj.tiempo);
                    break;
                case 4:
                    modelarAnio.abril.push(obj.tiempo);
                    break;
                case 5:
                    modelarAnio.mayo.push(obj.tiempo);
                    break;
                case 6:
                    modelarAnio.junio.push(obj.tiempo);
                    break;
                case 7:
                    modelarAnio.julio.push(obj.tiempo);
                    break;
                case 8:
                    modelarAnio.agosto.push(obj.tiempo);
                    break;
                case 9:
                    modelarAnio.septiembre.push(obj.tiempo);
                    break;
                case 10:
                    modelarAnio.octubre.push(obj.tiempo);
                    break;
                case 11:
                    modelarAnio.noviembre.push(obj.tiempo);
                    break;
                case 12:
                    modelarAnio.diciembre.push(obj.tiempo);
                    break;
                default: break;
            }
        });
        // console.log(modelarAnio);
        horas_extras = [];
        let data = [
            { id: 0, mes: 'Enero', valor: M_graficas.SumarValoresArray(modelarAnio.enero) },
            { id: 1, mes: 'Febrero', valor: M_graficas.SumarValoresArray(modelarAnio.febrero) },
            { id: 2, mes: 'Marzo', valor: M_graficas.SumarValoresArray(modelarAnio.marzo) },
            { id: 3, mes: 'Abril', valor: M_graficas.SumarValoresArray(modelarAnio.abril) },
            { id: 4, mes: 'Mayo', valor: M_graficas.SumarValoresArray(modelarAnio.mayo) },
            { id: 5, mes: 'Junio', valor: M_graficas.SumarValoresArray(modelarAnio.junio) },
            { id: 6, mes: 'Julio', valor: M_graficas.SumarValoresArray(modelarAnio.julio) },
            { id: 7, mes: 'Agosto', valor: M_graficas.SumarValoresArray(modelarAnio.agosto) },
            { id: 8, mes: 'Septiembre', valor: M_graficas.SumarValoresArray(modelarAnio.septiembre) },
            { id: 9, mes: 'Octubre', valor: M_graficas.SumarValoresArray(modelarAnio.octubre) },
            { id: 10, mes: 'Noviembre', valor: M_graficas.SumarValoresArray(modelarAnio.noviembre) },
            { id: 11, mes: 'Diciembre', valor: M_graficas.SumarValoresArray(modelarAnio.diciembre) }
        ];
        // console.log(data);
        let meses = data.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.mes; });
        let valor_mensual = data.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.valor; });
        return {
            datos: data,
            datos_grafica: {
                color: ['#3398DB'],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' }
                },
                xAxis: { type: 'category', name: 'Meses', data: meses },
                yAxis: { type: 'value', name: 'N° Horas' },
                series: [{
                        data: valor_mensual,
                        type: 'bar',
                        showBackground: true,
                        backgroundStyle: {
                            color: 'rgba(220, 220, 220, 0.8)'
                        }
                    }]
            }
        };
    });
};
exports.GraficaHorasExtras = GraficaHorasExtras;
const GraficaJornada_VS_HorasExtras = function (id_empresa, fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log('ingreso a jornada ',id_empresa, fec_inicio, fec_final);
        /**
         * Para Horas Extras
         */
        let horas_extras = yield M_graficas.HoraExtra_ModelarDatos(fec_inicio, fec_final);
        let modelarAnio = {
            enero: [],
            febrero: [],
            marzo: [],
            abril: [],
            mayo: [],
            junio: [],
            julio: [],
            agosto: [],
            septiembre: [],
            octubre: [],
            noviembre: [],
            diciembre: []
        };
        horas_extras.forEach((obj) => {
            let fecha = parseInt(obj.fecha.split('-')[1]);
            // console.log(fecha.getMonth());
            switch (fecha) {
                case 1:
                    modelarAnio.enero.push(obj.tiempo);
                    break;
                case 2:
                    modelarAnio.febrero.push(obj.tiempo);
                    break;
                case 3:
                    modelarAnio.marzo.push(obj.tiempo);
                    break;
                case 4:
                    modelarAnio.abril.push(obj.tiempo);
                    break;
                case 5:
                    modelarAnio.mayo.push(obj.tiempo);
                    break;
                case 6:
                    modelarAnio.junio.push(obj.tiempo);
                    break;
                case 7:
                    modelarAnio.julio.push(obj.tiempo);
                    break;
                case 8:
                    modelarAnio.agosto.push(obj.tiempo);
                    break;
                case 9:
                    modelarAnio.septiembre.push(obj.tiempo);
                    break;
                case 10:
                    modelarAnio.octubre.push(obj.tiempo);
                    break;
                case 11:
                    modelarAnio.noviembre.push(obj.tiempo);
                    break;
                case 12:
                    modelarAnio.diciembre.push(obj.tiempo);
                    break;
                default: break;
            }
        });
        horas_extras = [];
        let data = [
            { id: 0, mes: 'Enero', valor: M_graficas.SumarValoresArray(modelarAnio.enero) },
            { id: 1, mes: 'Febrero', valor: M_graficas.SumarValoresArray(modelarAnio.febrero) },
            { id: 2, mes: 'Marzo', valor: M_graficas.SumarValoresArray(modelarAnio.marzo) },
            { id: 3, mes: 'Abril', valor: M_graficas.SumarValoresArray(modelarAnio.abril) },
            { id: 4, mes: 'Mayo', valor: M_graficas.SumarValoresArray(modelarAnio.mayo) },
            { id: 5, mes: 'Junio', valor: M_graficas.SumarValoresArray(modelarAnio.junio) },
            { id: 6, mes: 'Julio', valor: M_graficas.SumarValoresArray(modelarAnio.julio) },
            { id: 7, mes: 'Agosto', valor: M_graficas.SumarValoresArray(modelarAnio.agosto) },
            { id: 8, mes: 'Septiembre', valor: M_graficas.SumarValoresArray(modelarAnio.septiembre) },
            { id: 9, mes: 'Octubre', valor: M_graficas.SumarValoresArray(modelarAnio.octubre) },
            { id: 10, mes: 'Noviembre', valor: M_graficas.SumarValoresArray(modelarAnio.noviembre) },
            { id: 11, mes: 'Diciembre', valor: M_graficas.SumarValoresArray(modelarAnio.diciembre) }
        ];
        // let meses = data.filter(obj => {return ( obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth() )}).map(obj => {return obj.mes});    
        let valor_mensual_hora_extra = data.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.valor; });
        /**
         * Para tiempo de joranda
         */
        let timbres = yield M_graficas.BuscarTimbresEoSModelado(fec_inicio.toJSON().split('T')[0], fec_final.toJSON().split('T')[0]);
        let nuevo = timbres.filter(obj => {
            return obj.horario.length != 0;
        }).map(obj => {
            obj.horario.forEach(ele => {
                ele.hora = M_graficas.HHMMtoSegundos(ele.hora) / 3600;
            });
            return obj;
        });
        let modelarAnioTiempoJornada = {
            enero: [],
            febrero: [],
            marzo: [],
            abril: [],
            mayo: [],
            junio: [],
            julio: [],
            agosto: [],
            septiembre: [],
            octubre: [],
            noviembre: [],
            diciembre: []
        };
        timbres = [];
        nuevo.forEach(obj => {
            obj.timbres.forEach((ele) => {
                ele.registros.forEach((obj1) => {
                    if (obj.horario[0].hora < obj1.fec_hora_timbre) {
                        obj.respuesta.push({
                            fecha: ele.fecha,
                            total: obj1.fec_hora_timbre - obj.horario[0].hora
                        });
                    }
                });
            });
        });
        nuevo.forEach(ele => {
            ele.respuesta.forEach(obj => {
                let fecha = parseInt(obj.fecha.split('-')[1]);
                switch (fecha) {
                    case 1:
                        modelarAnioTiempoJornada.enero.push(obj.total);
                        break;
                    case 2:
                        modelarAnioTiempoJornada.febrero.push(obj.total);
                        break;
                    case 3:
                        modelarAnioTiempoJornada.marzo.push(obj.total);
                        break;
                    case 4:
                        modelarAnioTiempoJornada.abril.push(obj.total);
                        break;
                    case 5:
                        modelarAnioTiempoJornada.mayo.push(obj.total);
                        break;
                    case 6:
                        modelarAnioTiempoJornada.junio.push(obj.total);
                        break;
                    case 7:
                        modelarAnioTiempoJornada.julio.push(obj.total);
                        break;
                    case 8:
                        modelarAnioTiempoJornada.agosto.push(obj.total);
                        break;
                    case 9:
                        modelarAnioTiempoJornada.septiembre.push(obj.total);
                        break;
                    case 10:
                        modelarAnioTiempoJornada.octubre.push(obj.total);
                        break;
                    case 11:
                        modelarAnioTiempoJornada.noviembre.push(obj.total);
                        break;
                    case 12:
                        modelarAnioTiempoJornada.diciembre.push(obj.total);
                        break;
                    default: break;
                }
            });
        });
        let data_tiempo_jornada = [
            { id: 0, mes: 'Enero', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.enero) },
            { id: 1, mes: 'Febrero', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.febrero) },
            { id: 2, mes: 'Marzo', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.marzo) },
            { id: 3, mes: 'Abril', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.abril) },
            { id: 4, mes: 'Mayo', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.mayo) },
            { id: 5, mes: 'Junio', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.junio) },
            { id: 6, mes: 'Julio', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.julio) },
            { id: 7, mes: 'Agosto', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.agosto) },
            { id: 8, mes: 'Septiembre', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.septiembre) },
            { id: 9, mes: 'Octubre', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.octubre) },
            { id: 10, mes: 'Noviembre', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.noviembre) },
            { id: 11, mes: 'Diciembre', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.diciembre) }
        ];
        let valor_mensual_tiempo = data_tiempo_jornada.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.valor; });
        return {
            datos_grafica: {
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b} : {c} ({d}%)'
                },
                legend: {
                    name: 'tiempo',
                    type: 'scroll',
                    orient: 'vertical',
                    right: 10,
                    top: 20,
                    bottom: 20,
                    data: ['Horas extra', 'Jornada']
                },
                series: {
                    type: 'pie',
                    radius: '55%',
                    center: ['40%', '50%'],
                    data: [
                        { value: M_graficas.SumarValoresArray(valor_mensual_hora_extra), name: 'Horas extra' },
                        { value: M_graficas.SumarValoresArray(valor_mensual_tiempo), name: 'Jornada' }
                    ],
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            }
        };
    });
};
exports.GraficaJornada_VS_HorasExtras = GraficaJornada_VS_HorasExtras;
const GraficaJ_VS_H_E_SinAcciones = function (id_empresa, fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log('ingreso a jornada ',id_empresa, fec_inicio, fec_final);
        /**
         * Para Horas Extras
         */
        let horas_extras = yield M_graficas.HoraExtra_ModelarDatos(fec_inicio, fec_final);
        let modelarAnio = {
            enero: [],
            febrero: [],
            marzo: [],
            abril: [],
            mayo: [],
            junio: [],
            julio: [],
            agosto: [],
            septiembre: [],
            octubre: [],
            noviembre: [],
            diciembre: []
        };
        horas_extras.forEach((obj) => {
            let fecha = parseInt(obj.fecha.split('-')[1]);
            // console.log(fecha.getMonth());
            switch (fecha) {
                case 1:
                    modelarAnio.enero.push(obj.tiempo);
                    break;
                case 2:
                    modelarAnio.febrero.push(obj.tiempo);
                    break;
                case 3:
                    modelarAnio.marzo.push(obj.tiempo);
                    break;
                case 4:
                    modelarAnio.abril.push(obj.tiempo);
                    break;
                case 5:
                    modelarAnio.mayo.push(obj.tiempo);
                    break;
                case 6:
                    modelarAnio.junio.push(obj.tiempo);
                    break;
                case 7:
                    modelarAnio.julio.push(obj.tiempo);
                    break;
                case 8:
                    modelarAnio.agosto.push(obj.tiempo);
                    break;
                case 9:
                    modelarAnio.septiembre.push(obj.tiempo);
                    break;
                case 10:
                    modelarAnio.octubre.push(obj.tiempo);
                    break;
                case 11:
                    modelarAnio.noviembre.push(obj.tiempo);
                    break;
                case 12:
                    modelarAnio.diciembre.push(obj.tiempo);
                    break;
                default: break;
            }
        });
        horas_extras = [];
        let data = [
            { id: 0, mes: 'Enero', valor: M_graficas.SumarValoresArray(modelarAnio.enero) },
            { id: 1, mes: 'Febrero', valor: M_graficas.SumarValoresArray(modelarAnio.febrero) },
            { id: 2, mes: 'Marzo', valor: M_graficas.SumarValoresArray(modelarAnio.marzo) },
            { id: 3, mes: 'Abril', valor: M_graficas.SumarValoresArray(modelarAnio.abril) },
            { id: 4, mes: 'Mayo', valor: M_graficas.SumarValoresArray(modelarAnio.mayo) },
            { id: 5, mes: 'Junio', valor: M_graficas.SumarValoresArray(modelarAnio.junio) },
            { id: 6, mes: 'Julio', valor: M_graficas.SumarValoresArray(modelarAnio.julio) },
            { id: 7, mes: 'Agosto', valor: M_graficas.SumarValoresArray(modelarAnio.agosto) },
            { id: 8, mes: 'Septiembre', valor: M_graficas.SumarValoresArray(modelarAnio.septiembre) },
            { id: 9, mes: 'Octubre', valor: M_graficas.SumarValoresArray(modelarAnio.octubre) },
            { id: 10, mes: 'Noviembre', valor: M_graficas.SumarValoresArray(modelarAnio.noviembre) },
            { id: 11, mes: 'Diciembre', valor: M_graficas.SumarValoresArray(modelarAnio.diciembre) }
        ];
        // let meses = data.filter(obj => {return ( obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth() )}).map(obj => {return obj.mes});    
        let valor_mensual_hora_extra = data.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.valor; });
        /**
         * Para Jornada
         */
        let timbres = yield M_graficas.BuscarTimbresEntradaSinAccionModelado(fec_inicio.toJSON().split('T')[0], fec_final.toJSON().split('T')[0]);
        let modelarAnioTiempoJornada = {
            enero: [],
            febrero: [],
            marzo: [],
            abril: [],
            mayo: [],
            junio: [],
            julio: [],
            agosto: [],
            septiembre: [],
            octubre: [],
            noviembre: [],
            diciembre: []
        };
        timbres.forEach(obj => {
            let fecha = parseInt(obj.fecha.split('-')[1]);
            switch (fecha) {
                case 1:
                    modelarAnioTiempoJornada.enero.push(M_graficas.HHMMtoSegundos(obj.total_timbres) / 3600);
                    break;
                case 2:
                    modelarAnioTiempoJornada.febrero.push(M_graficas.HHMMtoSegundos(obj.total_timbres) / 3600);
                    break;
                case 3:
                    modelarAnioTiempoJornada.marzo.push(M_graficas.HHMMtoSegundos(obj.total_timbres) / 3600);
                    break;
                case 4:
                    modelarAnioTiempoJornada.abril.push(M_graficas.HHMMtoSegundos(obj.total_timbres) / 3600);
                    break;
                case 5:
                    modelarAnioTiempoJornada.mayo.push(M_graficas.HHMMtoSegundos(obj.total_timbres) / 3600);
                    break;
                case 6:
                    modelarAnioTiempoJornada.junio.push(M_graficas.HHMMtoSegundos(obj.total_timbres) / 3600);
                    break;
                case 7:
                    modelarAnioTiempoJornada.julio.push(M_graficas.HHMMtoSegundos(obj.total_timbres) / 3600);
                    break;
                case 8:
                    modelarAnioTiempoJornada.agosto.push(M_graficas.HHMMtoSegundos(obj.total_timbres) / 3600);
                    break;
                case 9:
                    modelarAnioTiempoJornada.septiembre.push(M_graficas.HHMMtoSegundos(obj.total_timbres) / 3600);
                    break;
                case 10:
                    modelarAnioTiempoJornada.octubre.push(M_graficas.HHMMtoSegundos(obj.total_timbres) / 3600);
                    break;
                case 11:
                    modelarAnioTiempoJornada.noviembre.push(M_graficas.HHMMtoSegundos(obj.total_timbres) / 3600);
                    break;
                case 12:
                    modelarAnioTiempoJornada.diciembre.push(M_graficas.HHMMtoSegundos(obj.total_timbres) / 3600);
                    break;
                default: break;
            }
        });
        let data_tiempo_jornada = [
            { id: 0, mes: 'Enero', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.enero) },
            { id: 1, mes: 'Febrero', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.febrero) },
            { id: 2, mes: 'Marzo', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.marzo) },
            { id: 3, mes: 'Abril', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.abril) },
            { id: 4, mes: 'Mayo', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.mayo) },
            { id: 5, mes: 'Junio', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.junio) },
            { id: 6, mes: 'Julio', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.julio) },
            { id: 7, mes: 'Agosto', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.agosto) },
            { id: 8, mes: 'Septiembre', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.septiembre) },
            { id: 9, mes: 'Octubre', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.octubre) },
            { id: 10, mes: 'Noviembre', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.noviembre) },
            { id: 11, mes: 'Diciembre', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.diciembre) }
        ];
        let valor_mensual_tiempo = data_tiempo_jornada.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.valor; });
        return {
            datos_grafica: {
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b} : {c} ({d}%)'
                },
                legend: {
                    name: 'tiempo',
                    type: 'scroll',
                    orient: 'vertical',
                    right: 10,
                    top: 20,
                    bottom: 20,
                    data: ['Horas extra', 'Jornada']
                },
                series: {
                    type: 'pie',
                    radius: '55%',
                    center: ['40%', '50%'],
                    data: [
                        { value: M_graficas.SumarValoresArray(valor_mensual_hora_extra), name: 'Horas extra' },
                        { value: M_graficas.SumarValoresArray(valor_mensual_tiempo), name: 'Jornada' }
                    ],
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            }
        };
    });
};
exports.GraficaJ_VS_H_E_SinAcciones = GraficaJ_VS_H_E_SinAcciones;
const GraficaT_Jor_VS_HorExtTimbresSinAcciones = function (id_empresa, fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(id_empresa, fec_inicio, fec_final);
        /**
         * Para Horas Extras
         */
        let horas_extras = yield M_graficas.HoraExtra_ModelarDatos(fec_inicio, fec_final);
        let modelarAnio = {
            enero: [],
            febrero: [],
            marzo: [],
            abril: [],
            mayo: [],
            junio: [],
            julio: [],
            agosto: [],
            septiembre: [],
            octubre: [],
            noviembre: [],
            diciembre: []
        };
        horas_extras.forEach((obj) => {
            let fecha = parseInt(obj.fecha.split('-')[1]);
            // console.log(fecha.getMonth());
            switch (fecha) {
                case 1:
                    modelarAnio.enero.push(obj.tiempo);
                    break;
                case 2:
                    modelarAnio.febrero.push(obj.tiempo);
                    break;
                case 3:
                    modelarAnio.marzo.push(obj.tiempo);
                    break;
                case 4:
                    modelarAnio.abril.push(obj.tiempo);
                    break;
                case 5:
                    modelarAnio.mayo.push(obj.tiempo);
                    break;
                case 6:
                    modelarAnio.junio.push(obj.tiempo);
                    break;
                case 7:
                    modelarAnio.julio.push(obj.tiempo);
                    break;
                case 8:
                    modelarAnio.agosto.push(obj.tiempo);
                    break;
                case 9:
                    modelarAnio.septiembre.push(obj.tiempo);
                    break;
                case 10:
                    modelarAnio.octubre.push(obj.tiempo);
                    break;
                case 11:
                    modelarAnio.noviembre.push(obj.tiempo);
                    break;
                case 12:
                    modelarAnio.diciembre.push(obj.tiempo);
                    break;
                default: break;
            }
        });
        horas_extras = [];
        let data = [
            { id: 0, mes: 'Enero', valor: M_graficas.SumarValoresArray(modelarAnio.enero) },
            { id: 1, mes: 'Febrero', valor: M_graficas.SumarValoresArray(modelarAnio.febrero) },
            { id: 2, mes: 'Marzo', valor: M_graficas.SumarValoresArray(modelarAnio.marzo) },
            { id: 3, mes: 'Abril', valor: M_graficas.SumarValoresArray(modelarAnio.abril) },
            { id: 4, mes: 'Mayo', valor: M_graficas.SumarValoresArray(modelarAnio.mayo) },
            { id: 5, mes: 'Junio', valor: M_graficas.SumarValoresArray(modelarAnio.junio) },
            { id: 6, mes: 'Julio', valor: M_graficas.SumarValoresArray(modelarAnio.julio) },
            { id: 7, mes: 'Agosto', valor: M_graficas.SumarValoresArray(modelarAnio.agosto) },
            { id: 8, mes: 'Septiembre', valor: M_graficas.SumarValoresArray(modelarAnio.septiembre) },
            { id: 9, mes: 'Octubre', valor: M_graficas.SumarValoresArray(modelarAnio.octubre) },
            { id: 10, mes: 'Noviembre', valor: M_graficas.SumarValoresArray(modelarAnio.noviembre) },
            { id: 11, mes: 'Diciembre', valor: M_graficas.SumarValoresArray(modelarAnio.diciembre) }
        ];
        let meses = data.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.mes; });
        let valor_mensual_hora_extra = data.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.valor; });
        /**
         * Para tiempo de joranda
         */
        let timbres = yield M_graficas.BuscarTimbresEntradaSinAccionModelado(fec_inicio.toJSON().split('T')[0], fec_final.toJSON().split('T')[0]);
        let nuevo = timbres.map((obj) => {
            obj.total = M_graficas.HHMMtoSegundos(obj.total_timbres) / 3600;
            return obj;
        });
        let modelarAnioTiempoJornada = {
            enero: [],
            febrero: [],
            marzo: [],
            abril: [],
            mayo: [],
            junio: [],
            julio: [],
            agosto: [],
            septiembre: [],
            octubre: [],
            noviembre: [],
            diciembre: []
        };
        timbres = [];
        nuevo.forEach(obj => {
            let fecha = parseInt(obj.fecha.split('-')[1]);
            // console.log(obj);
            switch (fecha) {
                case 1:
                    modelarAnioTiempoJornada.enero.push(obj.total);
                    break;
                case 2:
                    modelarAnioTiempoJornada.febrero.push(obj.total);
                    break;
                case 3:
                    modelarAnioTiempoJornada.marzo.push(obj.total);
                    break;
                case 4:
                    modelarAnioTiempoJornada.abril.push(obj.total);
                    break;
                case 5:
                    modelarAnioTiempoJornada.mayo.push(obj.total);
                    break;
                case 6:
                    modelarAnioTiempoJornada.junio.push(obj.total);
                    break;
                case 7:
                    modelarAnioTiempoJornada.julio.push(obj.total);
                    break;
                case 8:
                    modelarAnioTiempoJornada.agosto.push(obj.total);
                    break;
                case 9:
                    modelarAnioTiempoJornada.septiembre.push(obj.total);
                    break;
                case 10:
                    modelarAnioTiempoJornada.octubre.push(obj.total);
                    break;
                case 11:
                    modelarAnioTiempoJornada.noviembre.push(obj.total);
                    break;
                case 12:
                    modelarAnioTiempoJornada.diciembre.push(obj.total);
                    break;
                default: break;
            }
        });
        let data_tiempo_jornada = [
            { id: 0, mes: 'Enero', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.enero) },
            { id: 1, mes: 'Febrero', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.febrero) },
            { id: 2, mes: 'Marzo', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.marzo) },
            { id: 3, mes: 'Abril', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.abril) },
            { id: 4, mes: 'Mayo', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.mayo) },
            { id: 5, mes: 'Junio', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.junio) },
            { id: 6, mes: 'Julio', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.julio) },
            { id: 7, mes: 'Agosto', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.agosto) },
            { id: 8, mes: 'Septiembre', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.septiembre) },
            { id: 9, mes: 'Octubre', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.octubre) },
            { id: 10, mes: 'Noviembre', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.noviembre) },
            { id: 11, mes: 'Diciembre', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.diciembre) }
        ];
        let valor_mensual_tiempo = data_tiempo_jornada.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.valor; });
        let newArray = [];
        for (let i = 0; i < meses.length; i++) {
            let obj = {
                mes: meses[i],
                tiempo_j: valor_mensual_tiempo[i],
                hora_extra: valor_mensual_hora_extra[i]
            };
            newArray.push(obj);
        }
        return {
            datos: 0,
            datos_grafica: {
                legend: {},
                tooltip: {},
                dataset: {
                    dimensions: ['mouth', 'Tiempo Jornada', 'Horas Extras'],
                    source: newArray.map(obj => {
                        return {
                            mouth: obj.mes, 'Tiempo Jornada': obj.tiempo_j, 'Horas Extras': obj.hora_extra
                        };
                    })
                },
                xAxis: { type: 'category' },
                yAxis: {},
                series: [
                    { type: 'bar' },
                    { type: 'bar' }
                ]
            }
        };
    });
};
exports.GraficaT_Jor_VS_HorExtTimbresSinAcciones = GraficaT_Jor_VS_HorExtTimbresSinAcciones;
const GraficaTiempoJornada_VS_HorasExtras = function (id_empresa, fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(id_empresa, fec_inicio, fec_final);
        /**
         * Para Horas Extras
         */
        let horas_extras = yield M_graficas.HoraExtra_ModelarDatos(fec_inicio, fec_final);
        let modelarAnio = {
            enero: [],
            febrero: [],
            marzo: [],
            abril: [],
            mayo: [],
            junio: [],
            julio: [],
            agosto: [],
            septiembre: [],
            octubre: [],
            noviembre: [],
            diciembre: []
        };
        horas_extras.forEach((obj) => {
            let fecha = parseInt(obj.fecha.split('-')[1]);
            // console.log(fecha.getMonth());
            switch (fecha) {
                case 1:
                    modelarAnio.enero.push(obj.tiempo);
                    break;
                case 2:
                    modelarAnio.febrero.push(obj.tiempo);
                    break;
                case 3:
                    modelarAnio.marzo.push(obj.tiempo);
                    break;
                case 4:
                    modelarAnio.abril.push(obj.tiempo);
                    break;
                case 5:
                    modelarAnio.mayo.push(obj.tiempo);
                    break;
                case 6:
                    modelarAnio.junio.push(obj.tiempo);
                    break;
                case 7:
                    modelarAnio.julio.push(obj.tiempo);
                    break;
                case 8:
                    modelarAnio.agosto.push(obj.tiempo);
                    break;
                case 9:
                    modelarAnio.septiembre.push(obj.tiempo);
                    break;
                case 10:
                    modelarAnio.octubre.push(obj.tiempo);
                    break;
                case 11:
                    modelarAnio.noviembre.push(obj.tiempo);
                    break;
                case 12:
                    modelarAnio.diciembre.push(obj.tiempo);
                    break;
                default: break;
            }
        });
        horas_extras = [];
        let data = [
            { id: 0, mes: 'Enero', valor: M_graficas.SumarValoresArray(modelarAnio.enero) },
            { id: 1, mes: 'Febrero', valor: M_graficas.SumarValoresArray(modelarAnio.febrero) },
            { id: 2, mes: 'Marzo', valor: M_graficas.SumarValoresArray(modelarAnio.marzo) },
            { id: 3, mes: 'Abril', valor: M_graficas.SumarValoresArray(modelarAnio.abril) },
            { id: 4, mes: 'Mayo', valor: M_graficas.SumarValoresArray(modelarAnio.mayo) },
            { id: 5, mes: 'Junio', valor: M_graficas.SumarValoresArray(modelarAnio.junio) },
            { id: 6, mes: 'Julio', valor: M_graficas.SumarValoresArray(modelarAnio.julio) },
            { id: 7, mes: 'Agosto', valor: M_graficas.SumarValoresArray(modelarAnio.agosto) },
            { id: 8, mes: 'Septiembre', valor: M_graficas.SumarValoresArray(modelarAnio.septiembre) },
            { id: 9, mes: 'Octubre', valor: M_graficas.SumarValoresArray(modelarAnio.octubre) },
            { id: 10, mes: 'Noviembre', valor: M_graficas.SumarValoresArray(modelarAnio.noviembre) },
            { id: 11, mes: 'Diciembre', valor: M_graficas.SumarValoresArray(modelarAnio.diciembre) }
        ];
        let meses = data.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.mes; });
        let valor_mensual_hora_extra = data.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.valor; });
        /**
         * Para tiempo de joranda
         */
        let timbres = yield M_graficas.BuscarTimbresEoSModelado(fec_inicio.toJSON().split('T')[0], fec_final.toJSON().split('T')[0]);
        let nuevo = timbres.filter(obj => {
            return obj.horario.length != 0;
        }).map(obj => {
            obj.horario.forEach(ele => {
                ele.hora = M_graficas.HHMMtoSegundos(ele.hora) / 3600;
            });
            return obj;
        });
        let modelarAnioTiempoJornada = {
            enero: [],
            febrero: [],
            marzo: [],
            abril: [],
            mayo: [],
            junio: [],
            julio: [],
            agosto: [],
            septiembre: [],
            octubre: [],
            noviembre: [],
            diciembre: []
        };
        timbres = [];
        nuevo.forEach(obj => {
            obj.timbres.forEach((ele) => {
                ele.registros.forEach((obj1) => {
                    if (obj.horario[0].hora < obj1.fec_hora_timbre) {
                        obj.respuesta.push({
                            fecha: ele.fecha,
                            total: obj1.fec_hora_timbre - obj.horario[0].hora
                        });
                    }
                });
            });
        });
        nuevo.forEach(ele => {
            ele.respuesta.forEach(obj => {
                let fecha = parseInt(obj.fecha.split('-')[1]);
                // console.log(fecha.getMonth());
                switch (fecha) {
                    case 1:
                        modelarAnioTiempoJornada.enero.push(obj.total);
                        break;
                    case 2:
                        modelarAnioTiempoJornada.febrero.push(obj.total);
                        break;
                    case 3:
                        modelarAnioTiempoJornada.marzo.push(obj.total);
                        break;
                    case 4:
                        modelarAnioTiempoJornada.abril.push(obj.total);
                        break;
                    case 5:
                        modelarAnioTiempoJornada.mayo.push(obj.total);
                        break;
                    case 6:
                        modelarAnioTiempoJornada.junio.push(obj.total);
                        break;
                    case 7:
                        modelarAnioTiempoJornada.julio.push(obj.total);
                        break;
                    case 8:
                        modelarAnioTiempoJornada.agosto.push(obj.total);
                        break;
                    case 9:
                        modelarAnioTiempoJornada.septiembre.push(obj.total);
                        break;
                    case 10:
                        modelarAnioTiempoJornada.octubre.push(obj.total);
                        break;
                    case 11:
                        modelarAnioTiempoJornada.noviembre.push(obj.total);
                        break;
                    case 12:
                        modelarAnioTiempoJornada.diciembre.push(obj.total);
                        break;
                    default: break;
                }
            });
        });
        let data_tiempo_jornada = [
            { id: 0, mes: 'Enero', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.enero) },
            { id: 1, mes: 'Febrero', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.febrero) },
            { id: 2, mes: 'Marzo', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.marzo) },
            { id: 3, mes: 'Abril', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.abril) },
            { id: 4, mes: 'Mayo', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.mayo) },
            { id: 5, mes: 'Junio', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.junio) },
            { id: 6, mes: 'Julio', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.julio) },
            { id: 7, mes: 'Agosto', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.agosto) },
            { id: 8, mes: 'Septiembre', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.septiembre) },
            { id: 9, mes: 'Octubre', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.octubre) },
            { id: 10, mes: 'Noviembre', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.noviembre) },
            { id: 11, mes: 'Diciembre', valor: M_graficas.SumarValoresArray(modelarAnioTiempoJornada.diciembre) }
        ];
        let valor_mensual_tiempo = data_tiempo_jornada.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.valor; });
        let newArray = [];
        for (let i = 0; i < meses.length; i++) {
            let obj = {
                mes: meses[i],
                tiempo_j: valor_mensual_tiempo[i],
                hora_extra: valor_mensual_hora_extra[i]
            };
            newArray.push(obj);
        }
        return {
            datos: 0,
            datos_grafica: {
                legend: {},
                tooltip: {},
                dataset: {
                    dimensions: ['mouth', 'Tiempo Jornada', 'Horas Extras'],
                    source: newArray.map(obj => {
                        return {
                            mouth: obj.mes, 'Tiempo Jornada': obj.tiempo_j, 'Horas Extras': obj.hora_extra
                        };
                    })
                },
                xAxis: { type: 'category' },
                yAxis: {},
                series: [
                    { type: 'bar' },
                    { type: 'bar' }
                ]
            }
        };
    });
};
exports.GraficaTiempoJornada_VS_HorasExtras = GraficaTiempoJornada_VS_HorasExtras;
const GraficaMarcaciones = function (id_empresa, fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(id_empresa, fec_inicio, fec_final);
        let timbres = yield M_graficas.BuscarTimbresByFecha(fec_inicio.toJSON().split('T')[0], fec_final.toJSON().split('T')[0]);
        // console.log('==========================================');
        // console.log(timbres);
        // console.log('==========================================');
        let modelarAnio = {
            enero: [],
            febrero: [],
            marzo: [],
            abril: [],
            mayo: [],
            junio: [],
            julio: [],
            agosto: [],
            septiembre: [],
            octubre: [],
            noviembre: [],
            diciembre: []
        };
        timbres.forEach(obj => {
            let fecha = obj.fec_hora_timbre;
            // console.log(fecha.getMonth());
            switch (fecha.getMonth()) {
                case 0:
                    modelarAnio.enero.push(fecha);
                    break;
                case 1:
                    modelarAnio.febrero.push(fecha);
                    break;
                case 2:
                    modelarAnio.marzo.push(fecha);
                    break;
                case 3:
                    modelarAnio.abril.push(fecha);
                    break;
                case 4:
                    modelarAnio.mayo.push(fecha);
                    break;
                case 5:
                    modelarAnio.junio.push(fecha);
                    break;
                case 6:
                    modelarAnio.julio.push(fecha);
                    break;
                case 7:
                    modelarAnio.agosto.push(fecha);
                    break;
                case 8:
                    modelarAnio.septiembre.push(fecha);
                    break;
                case 9:
                    modelarAnio.octubre.push(fecha);
                    break;
                case 10:
                    modelarAnio.noviembre.push(fecha);
                    break;
                case 11:
                    modelarAnio.diciembre.push(fecha);
                    break;
                default: break;
            }
        });
        // console.log(modelarAnio);
        timbres = [];
        let data = [
            { id: 0, mes: 'Enero', valor: modelarAnio.enero.length },
            { id: 1, mes: 'Febrero', valor: modelarAnio.febrero.length },
            { id: 2, mes: 'Marzo', valor: modelarAnio.marzo.length },
            { id: 3, mes: 'Abril', valor: modelarAnio.abril.length },
            { id: 4, mes: 'Mayo', valor: modelarAnio.mayo.length },
            { id: 5, mes: 'Junio', valor: modelarAnio.junio.length },
            { id: 6, mes: 'Julio', valor: modelarAnio.julio.length },
            { id: 7, mes: 'Agosto', valor: modelarAnio.agosto.length },
            { id: 8, mes: 'Septiembre', valor: modelarAnio.septiembre.length },
            { id: 9, mes: 'Octubre', valor: modelarAnio.octubre.length },
            { id: 10, mes: 'Noviembre', valor: modelarAnio.noviembre.length },
            { id: 11, mes: 'Diciembre', valor: modelarAnio.diciembre.length }
        ];
        let meses = data.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.mes; });
        let valor_mensual = data.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.valor; });
        return {
            datos: data,
            datos_grafica: {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'line', label: { backgroundColor: '#6a7985' } }
                },
                legend: { align: 'left', data: [{ name: 'marcaciones' }] },
                xAxis: { type: 'category', name: 'Meses', data: meses },
                yAxis: { type: 'value', name: 'N° Timbres' },
                series: [{
                        name: 'marcaciones',
                        data: valor_mensual,
                        type: 'line',
                        lineStyle: { color: 'rgb(20, 112, 233)' },
                        itemStyle: { color: 'rgb(20, 112, 233)' }
                    }],
            }
        };
    });
};
exports.GraficaMarcaciones = GraficaMarcaciones;
const GraficaSalidasAnticipadas = function (id_empresa, fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(id_empresa, fec_inicio, fec_final);
        let timbres = yield M_graficas.ModelarSalidasAnticipadas(fec_inicio.toJSON().split('T')[0], fec_final.toJSON().split('T')[0]);
        // console.log(timbres);    
        let modelarAnio = {
            enero: [],
            febrero: [],
            marzo: [],
            abril: [],
            mayo: [],
            junio: [],
            julio: [],
            agosto: [],
            septiembre: [],
            octubre: [],
            noviembre: [],
            diciembre: []
        };
        timbres.forEach(obj => {
            let fecha = new Date(obj.fecha);
            // console.log(fecha.getMonth());
            switch (fecha.getMonth()) {
                case 0:
                    modelarAnio.enero.push(obj.diferencia_tiempo);
                    break;
                case 1:
                    modelarAnio.febrero.push(obj.diferencia_tiempo);
                    break;
                case 2:
                    modelarAnio.marzo.push(obj.diferencia_tiempo);
                    break;
                case 3:
                    modelarAnio.abril.push(obj.diferencia_tiempo);
                    break;
                case 4:
                    modelarAnio.mayo.push(obj.diferencia_tiempo);
                    break;
                case 5:
                    modelarAnio.junio.push(obj.diferencia_tiempo);
                    break;
                case 6:
                    modelarAnio.julio.push(obj.diferencia_tiempo);
                    break;
                case 7:
                    modelarAnio.agosto.push(obj.diferencia_tiempo);
                    break;
                case 8:
                    modelarAnio.septiembre.push(obj.diferencia_tiempo);
                    break;
                case 9:
                    modelarAnio.octubre.push(obj.diferencia_tiempo);
                    break;
                case 10:
                    modelarAnio.noviembre.push(obj.diferencia_tiempo);
                    break;
                case 11:
                    modelarAnio.diciembre.push(obj.diferencia_tiempo);
                    break;
                default: break;
            }
        });
        timbres = [];
        let data = [
            { id: 0, mes: 'Enero', valor: M_graficas.SumarValoresArray(modelarAnio.enero) },
            { id: 1, mes: 'Febrero', valor: M_graficas.SumarValoresArray(modelarAnio.febrero) },
            { id: 2, mes: 'Marzo', valor: M_graficas.SumarValoresArray(modelarAnio.marzo) },
            { id: 3, mes: 'Abril', valor: M_graficas.SumarValoresArray(modelarAnio.abril) },
            { id: 4, mes: 'Mayo', valor: M_graficas.SumarValoresArray(modelarAnio.mayo) },
            { id: 5, mes: 'Junio', valor: M_graficas.SumarValoresArray(modelarAnio.junio) },
            { id: 6, mes: 'Julio', valor: M_graficas.SumarValoresArray(modelarAnio.julio) },
            { id: 7, mes: 'Agosto', valor: M_graficas.SumarValoresArray(modelarAnio.agosto) },
            { id: 8, mes: 'Septiembre', valor: M_graficas.SumarValoresArray(modelarAnio.septiembre) },
            { id: 9, mes: 'Octubre', valor: M_graficas.SumarValoresArray(modelarAnio.octubre) },
            { id: 10, mes: 'Noviembre', valor: M_graficas.SumarValoresArray(modelarAnio.noviembre) },
            { id: 11, mes: 'Diciembre', valor: M_graficas.SumarValoresArray(modelarAnio.diciembre) }
        ];
        let meses = data.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.mes; });
        let valor_mensual = data.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.valor; });
        return {
            datos: data,
            datos_grafica: {
                color: ['#3398DB'],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' }
                },
                xAxis: { type: 'category', name: 'Meses', data: meses },
                yAxis: { type: 'value', name: 'N° Horas' },
                series: [{
                        data: valor_mensual,
                        type: 'bar',
                        showBackground: true,
                        backgroundStyle: {
                            color: 'rgba(220, 220, 220, 0.8)'
                        }
                    }]
            }
        };
    });
};
exports.GraficaSalidasAnticipadas = GraficaSalidasAnticipadas;
const GraficaSalidasAnticipadasSinAcciones = function (id_empresa, fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(id_empresa, fec_inicio, fec_final);
        let timbres = yield M_graficas.ModelarSalidasAnticipadasSinAcciones(fec_inicio.toJSON().split('T')[0], fec_final.toJSON().split('T')[0]);
        // console.log(timbres);    
        let modelarAnio = {
            enero: [],
            febrero: [],
            marzo: [],
            abril: [],
            mayo: [],
            junio: [],
            julio: [],
            agosto: [],
            septiembre: [],
            octubre: [],
            noviembre: [],
            diciembre: []
        };
        // timbres.forEach(obj => {
        //     console.log('TIMBRE:',obj);
        // })
        timbres.forEach(obj => {
            let fecha = parseInt(obj.fecha.split('-')[1]);
            switch (fecha) {
                case 1:
                    modelarAnio.enero.push(M_graficas.HHMMtoSegundos(obj.total_timbres) / 3600);
                    break;
                case 2:
                    modelarAnio.febrero.push(M_graficas.HHMMtoSegundos(obj.total_timbres) / 3600);
                    break;
                case 3:
                    modelarAnio.marzo.push(M_graficas.HHMMtoSegundos(obj.total_timbres) / 3600);
                    break;
                case 4:
                    modelarAnio.abril.push(M_graficas.HHMMtoSegundos(obj.total_timbres) / 3600);
                    break;
                case 5:
                    modelarAnio.mayo.push(M_graficas.HHMMtoSegundos(obj.total_timbres) / 3600);
                    break;
                case 6:
                    modelarAnio.junio.push(M_graficas.HHMMtoSegundos(obj.total_timbres) / 3600);
                    break;
                case 7:
                    modelarAnio.julio.push(M_graficas.HHMMtoSegundos(obj.total_timbres) / 3600);
                    break;
                case 8:
                    modelarAnio.agosto.push(M_graficas.HHMMtoSegundos(obj.total_timbres) / 3600);
                    break;
                case 9:
                    modelarAnio.septiembre.push(M_graficas.HHMMtoSegundos(obj.total_timbres) / 3600);
                    break;
                case 10:
                    modelarAnio.octubre.push(M_graficas.HHMMtoSegundos(obj.total_timbres) / 3600);
                    break;
                case 11:
                    modelarAnio.noviembre.push(M_graficas.HHMMtoSegundos(obj.total_timbres) / 3600);
                    break;
                case 12:
                    modelarAnio.diciembre.push(M_graficas.HHMMtoSegundos(obj.total_timbres) / 3600);
                    break;
                default: break;
            }
        });
        timbres = [];
        let data = [
            { id: 0, mes: 'Enero', valor: M_graficas.SumarValoresArray(modelarAnio.enero) },
            { id: 1, mes: 'Febrero', valor: M_graficas.SumarValoresArray(modelarAnio.febrero) },
            { id: 2, mes: 'Marzo', valor: M_graficas.SumarValoresArray(modelarAnio.marzo) },
            { id: 3, mes: 'Abril', valor: M_graficas.SumarValoresArray(modelarAnio.abril) },
            { id: 4, mes: 'Mayo', valor: M_graficas.SumarValoresArray(modelarAnio.mayo) },
            { id: 5, mes: 'Junio', valor: M_graficas.SumarValoresArray(modelarAnio.junio) },
            { id: 6, mes: 'Julio', valor: M_graficas.SumarValoresArray(modelarAnio.julio) },
            { id: 7, mes: 'Agosto', valor: M_graficas.SumarValoresArray(modelarAnio.agosto) },
            { id: 8, mes: 'Septiembre', valor: M_graficas.SumarValoresArray(modelarAnio.septiembre) },
            { id: 9, mes: 'Octubre', valor: M_graficas.SumarValoresArray(modelarAnio.octubre) },
            { id: 10, mes: 'Noviembre', valor: M_graficas.SumarValoresArray(modelarAnio.noviembre) },
            { id: 11, mes: 'Diciembre', valor: M_graficas.SumarValoresArray(modelarAnio.diciembre) }
        ];
        let meses = data.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.mes; });
        let valor_mensual = data.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.valor; });
        return {
            datos: data,
            datos_grafica: {
                color: ['#3398DB'],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' }
                },
                xAxis: { type: 'category', name: 'Meses', data: meses },
                yAxis: { type: 'value', name: 'N° Horas' },
                series: [{
                        data: valor_mensual,
                        type: 'bar',
                        showBackground: true,
                        backgroundStyle: {
                            color: 'rgba(220, 220, 220, 0.8)'
                        }
                    }]
            }
        };
    });
};
exports.GraficaSalidasAnticipadasSinAcciones = GraficaSalidasAnticipadasSinAcciones;
/**
 *
 * Graficas para los usuarios de rol empleado
 *
 */
const MetricaHorasExtraEmpleado = function (codigo, id_empleado, fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(codigo, id_empleado, fec_inicio, fec_final);
        let horas_extras = yield M_graficas.Empleado_HoraExtra_ModelarDatos(codigo, fec_inicio, fec_final);
        let modelarAnio = {
            enero: [],
            febrero: [],
            marzo: [],
            abril: [],
            mayo: [],
            junio: [],
            julio: [],
            agosto: [],
            septiembre: [],
            octubre: [],
            noviembre: [],
            diciembre: []
        };
        horas_extras.forEach((obj) => {
            let fecha = parseInt(obj.fecha.split('-')[1]);
            // console.log(fecha.getMonth());
            switch (fecha) {
                case 1:
                    modelarAnio.enero.push(obj.tiempo);
                    break;
                case 2:
                    modelarAnio.febrero.push(obj.tiempo);
                    break;
                case 3:
                    modelarAnio.marzo.push(obj.tiempo);
                    break;
                case 4:
                    modelarAnio.abril.push(obj.tiempo);
                    break;
                case 5:
                    modelarAnio.mayo.push(obj.tiempo);
                    break;
                case 6:
                    modelarAnio.junio.push(obj.tiempo);
                    break;
                case 7:
                    modelarAnio.julio.push(obj.tiempo);
                    break;
                case 8:
                    modelarAnio.agosto.push(obj.tiempo);
                    break;
                case 9:
                    modelarAnio.septiembre.push(obj.tiempo);
                    break;
                case 10:
                    modelarAnio.octubre.push(obj.tiempo);
                    break;
                case 11:
                    modelarAnio.noviembre.push(obj.tiempo);
                    break;
                case 12:
                    modelarAnio.diciembre.push(obj.tiempo);
                    break;
                default: break;
            }
        });
        // console.log(modelarAnio);
        horas_extras = [];
        let data = [
            { id: 0, mes: 'Enero', valor: M_graficas.SumarValoresArray(modelarAnio.enero) },
            { id: 1, mes: 'Febrero', valor: M_graficas.SumarValoresArray(modelarAnio.febrero) },
            { id: 2, mes: 'Marzo', valor: M_graficas.SumarValoresArray(modelarAnio.marzo) },
            { id: 3, mes: 'Abril', valor: M_graficas.SumarValoresArray(modelarAnio.abril) },
            { id: 4, mes: 'Mayo', valor: M_graficas.SumarValoresArray(modelarAnio.mayo) },
            { id: 5, mes: 'Junio', valor: M_graficas.SumarValoresArray(modelarAnio.junio) },
            { id: 6, mes: 'Julio', valor: M_graficas.SumarValoresArray(modelarAnio.julio) },
            { id: 7, mes: 'Agosto', valor: M_graficas.SumarValoresArray(modelarAnio.agosto) },
            { id: 8, mes: 'Septiembre', valor: M_graficas.SumarValoresArray(modelarAnio.septiembre) },
            { id: 9, mes: 'Octubre', valor: M_graficas.SumarValoresArray(modelarAnio.octubre) },
            { id: 10, mes: 'Noviembre', valor: M_graficas.SumarValoresArray(modelarAnio.noviembre) },
            { id: 11, mes: 'Diciembre', valor: M_graficas.SumarValoresArray(modelarAnio.diciembre) }
        ];
        // console.log(data);
        let meses = data.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.mes; });
        let valor_mensual = data.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.valor; });
        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: { type: 'category', name: 'Meses', data: meses, axisTick: { alignWithLabel: true } },
            yAxis: { type: 'value', name: 'N° Horas' },
            series: {
                name: 'hora extra',
                type: 'bar',
                barWidth: '60%',
                data: valor_mensual
            },
            legend: {
                align: 'left',
                data: [{ name: 'hora extra' }]
            }
        };
    });
};
exports.MetricaHorasExtraEmpleado = MetricaHorasExtraEmpleado;
const MetricaVacacionesEmpleado = function (codigo, id_empleado, fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(codigo, id_empleado, fec_inicio, fec_final);
        let vacaciones = yield M_graficas.Empleado_Vacaciones_ModelarDatos(codigo, fec_inicio, fec_final);
        // let ids = await IdsEmpleados(id_empresa);
        let modelarAnio = {
            enero: [],
            febrero: [],
            marzo: [],
            abril: [],
            mayo: [],
            junio: [],
            julio: [],
            agosto: [],
            septiembre: [],
            octubre: [],
            noviembre: [],
            diciembre: []
        };
        vacaciones.forEach((obj) => {
            // console.log('VACACIONES',obj);
            let fecha = parseInt(obj.fecha.split('-')[1]);
            switch (fecha) {
                case 1:
                    modelarAnio.enero.push(obj.n_dia);
                    break;
                case 2:
                    modelarAnio.febrero.push(obj.n_dia);
                    break;
                case 3:
                    modelarAnio.marzo.push(obj.n_dia);
                    break;
                case 4:
                    modelarAnio.abril.push(obj.n_dia);
                    break;
                case 5:
                    modelarAnio.mayo.push(obj.n_dia);
                    break;
                case 6:
                    modelarAnio.junio.push(obj.n_dia);
                    break;
                case 7:
                    modelarAnio.julio.push(obj.n_dia);
                    break;
                case 8:
                    modelarAnio.agosto.push(obj.n_dia);
                    break;
                case 9:
                    modelarAnio.septiembre.push(obj.n_dia);
                    break;
                case 10:
                    modelarAnio.octubre.push(obj.n_dia);
                    break;
                case 11:
                    modelarAnio.noviembre.push(obj.n_dia);
                    break;
                case 12:
                    modelarAnio.diciembre.push(obj.n_dia);
                    break;
                default: break;
            }
        });
        // console.log(modelarAnio);
        vacaciones = [];
        let data = [
            { id: 0, mes: 'Enero', valor: M_graficas.SumarValoresArray(modelarAnio.enero) },
            { id: 1, mes: 'Febrero', valor: M_graficas.SumarValoresArray(modelarAnio.febrero) },
            { id: 2, mes: 'Marzo', valor: M_graficas.SumarValoresArray(modelarAnio.marzo) },
            { id: 3, mes: 'Abril', valor: M_graficas.SumarValoresArray(modelarAnio.abril) },
            { id: 4, mes: 'Mayo', valor: M_graficas.SumarValoresArray(modelarAnio.mayo) },
            { id: 5, mes: 'Junio', valor: M_graficas.SumarValoresArray(modelarAnio.junio) },
            { id: 6, mes: 'Julio', valor: M_graficas.SumarValoresArray(modelarAnio.julio) },
            { id: 7, mes: 'Agosto', valor: M_graficas.SumarValoresArray(modelarAnio.agosto) },
            { id: 8, mes: 'Septiembre', valor: M_graficas.SumarValoresArray(modelarAnio.septiembre) },
            { id: 9, mes: 'Octubre', valor: M_graficas.SumarValoresArray(modelarAnio.octubre) },
            { id: 10, mes: 'Noviembre', valor: M_graficas.SumarValoresArray(modelarAnio.noviembre) },
            { id: 11, mes: 'Diciembre', valor: M_graficas.SumarValoresArray(modelarAnio.diciembre) }
        ];
        // console.log(data);
        let meses = data.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.mes; });
        let valor_mensual = data.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.valor; });
        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: { type: 'category', name: 'Meses', data: meses, axisTick: { alignWithLabel: true } },
            yAxis: { type: 'value', name: 'N° Días' },
            series: {
                name: 'Dias',
                type: 'bar',
                barWidth: '60%',
                data: valor_mensual
            },
            legend: {
                align: 'left',
                data: [{ name: 'vacaciones' }]
            }
        };
    });
};
exports.MetricaVacacionesEmpleado = MetricaVacacionesEmpleado;
const MetricaPermisosEmpleado = function (codigo, id_empleado, fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(codigo, id_empleado, fec_inicio, fec_final);
        let permisos = yield M_graficas.Empleado_Permisos_ModelarDatos(codigo, fec_inicio, fec_final);
        let modelarAnio = {
            enero: [],
            febrero: [],
            marzo: [],
            abril: [],
            mayo: [],
            junio: [],
            julio: [],
            agosto: [],
            septiembre: [],
            octubre: [],
            noviembre: [],
            diciembre: []
        };
        permisos.forEach((obj) => {
            let fecha = parseInt(obj.fecha.split('-')[1]);
            switch (fecha) {
                case 1:
                    modelarAnio.enero.push(obj.tiempo);
                    break;
                case 2:
                    modelarAnio.febrero.push(obj.tiempo);
                    break;
                case 3:
                    modelarAnio.marzo.push(obj.tiempo);
                    break;
                case 4:
                    modelarAnio.abril.push(obj.tiempo);
                    break;
                case 5:
                    modelarAnio.mayo.push(obj.tiempo);
                    break;
                case 6:
                    modelarAnio.junio.push(obj.tiempo);
                    break;
                case 7:
                    modelarAnio.julio.push(obj.tiempo);
                    break;
                case 8:
                    modelarAnio.agosto.push(obj.tiempo);
                    break;
                case 9:
                    modelarAnio.septiembre.push(obj.tiempo);
                    break;
                case 10:
                    modelarAnio.octubre.push(obj.tiempo);
                    break;
                case 11:
                    modelarAnio.noviembre.push(obj.tiempo);
                    break;
                case 12:
                    modelarAnio.diciembre.push(obj.tiempo);
                    break;
                default: break;
            }
        });
        // // console.log(modelarAnio);
        permisos = [];
        let data = [
            { id: 0, mes: 'Enero', valor: M_graficas.SumarValoresArray(modelarAnio.enero) },
            { id: 1, mes: 'Febrero', valor: M_graficas.SumarValoresArray(modelarAnio.febrero) },
            { id: 2, mes: 'Marzo', valor: M_graficas.SumarValoresArray(modelarAnio.marzo) },
            { id: 3, mes: 'Abril', valor: M_graficas.SumarValoresArray(modelarAnio.abril) },
            { id: 4, mes: 'Mayo', valor: M_graficas.SumarValoresArray(modelarAnio.mayo) },
            { id: 5, mes: 'Junio', valor: M_graficas.SumarValoresArray(modelarAnio.junio) },
            { id: 6, mes: 'Julio', valor: M_graficas.SumarValoresArray(modelarAnio.julio) },
            { id: 7, mes: 'Agosto', valor: M_graficas.SumarValoresArray(modelarAnio.agosto) },
            { id: 8, mes: 'Septiembre', valor: M_graficas.SumarValoresArray(modelarAnio.septiembre) },
            { id: 9, mes: 'Octubre', valor: M_graficas.SumarValoresArray(modelarAnio.octubre) },
            { id: 10, mes: 'Noviembre', valor: M_graficas.SumarValoresArray(modelarAnio.noviembre) },
            { id: 11, mes: 'Diciembre', valor: M_graficas.SumarValoresArray(modelarAnio.diciembre) }
        ];
        // // console.log(data);
        let meses = data.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.mes; });
        let valor_mensual = data.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.valor; });
        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: { type: 'category', name: 'Meses', data: meses, axisTick: { alignWithLabel: true } },
            yAxis: { type: 'value', name: 'N° tiempo' },
            series: {
                name: 'Dias',
                type: 'bar',
                barWidth: '60%',
                data: valor_mensual
            },
            legend: {
                align: 'left',
                data: [{
                        name: 'Permisos'
                    }]
            },
        };
    });
};
exports.MetricaPermisosEmpleado = MetricaPermisosEmpleado;
const MetricaAtrasosEmpleado = function (codigo, id_empleado, fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(id_empleado, fec_inicio, fec_final);
        // console.log(codigo, id_empleado, fec_inicio, fec_final);
        let atrasos = yield M_graficas.Empleado_Atrasos_ModelarDatos(codigo, fec_inicio, fec_final);
        // let ids = await IdsEmpleados(id_empresa);
        let modelarAnio = {
            enero: [],
            febrero: [],
            marzo: [],
            abril: [],
            mayo: [],
            junio: [],
            julio: [],
            agosto: [],
            septiembre: [],
            octubre: [],
            noviembre: [],
            diciembre: []
        };
        atrasos.forEach((ele) => {
            let fecha = parseInt(ele.fecha.split('-')[1]);
            if (ele.retraso === true) {
                switch (fecha) {
                    case 1:
                        modelarAnio.enero.push(ele.fecha);
                        break;
                    case 2:
                        modelarAnio.febrero.push(ele.fecha);
                        break;
                    case 3:
                        modelarAnio.marzo.push(ele.fecha);
                        break;
                    case 4:
                        modelarAnio.abril.push(ele.fecha);
                        break;
                    case 5:
                        modelarAnio.mayo.push(ele.fecha);
                        break;
                    case 6:
                        modelarAnio.junio.push(ele.fecha);
                        break;
                    case 7:
                        modelarAnio.julio.push(ele.fecha);
                        break;
                    case 8:
                        modelarAnio.agosto.push(ele.fecha);
                        break;
                    case 9:
                        modelarAnio.septiembre.push(ele.fecha);
                        break;
                    case 10:
                        modelarAnio.octubre.push(ele.fecha);
                        break;
                    case 11:
                        modelarAnio.noviembre.push(ele.fecha);
                        break;
                    case 12:
                        modelarAnio.diciembre.push(ele.fecha);
                        break;
                    default: break;
                }
            }
        });
        atrasos = [];
        let data = [
            { id: 0, mes: 'Enero', valor: modelarAnio.enero.length },
            { id: 1, mes: 'Febrero', valor: modelarAnio.febrero.length },
            { id: 2, mes: 'Marzo', valor: modelarAnio.marzo.length },
            { id: 3, mes: 'Abril', valor: modelarAnio.abril.length },
            { id: 4, mes: 'Mayo', valor: modelarAnio.mayo.length },
            { id: 5, mes: 'Junio', valor: modelarAnio.junio.length },
            { id: 6, mes: 'Julio', valor: modelarAnio.julio.length },
            { id: 7, mes: 'Agosto', valor: modelarAnio.agosto.length },
            { id: 8, mes: 'Septiembre', valor: modelarAnio.septiembre.length },
            { id: 9, mes: 'Octubre', valor: modelarAnio.octubre.length },
            { id: 10, mes: 'Noviembre', valor: modelarAnio.noviembre.length },
            { id: 11, mes: 'Diciembre', valor: modelarAnio.diciembre.length }
        ];
        let meses = data.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.mes; });
        let valor_mensual = data.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.valor; });
        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: { type: 'category', name: 'Meses', data: meses, axisTick: { alignWithLabel: true } },
            yAxis: { type: 'value', name: 'N° horas' },
            series: {
                name: 'Dias',
                type: 'bar',
                barWidth: '60%',
                data: valor_mensual
            },
            legend: {
                align: 'left',
                data: [{
                        name: 'Atrasos'
                    }]
            },
        };
    });
};
exports.MetricaAtrasosEmpleado = MetricaAtrasosEmpleado;
const MetricaAtrasosEmpleadoSinAcciones = function (codigo, id_empleado, fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(id_empleado, fec_inicio, fec_final);
        let atrasos = yield M_graficas.Empleado_Atrasos_ModelarDatos_SinAcciones(codigo, fec_inicio, fec_final);
        // let ids = await IdsEmpleados(id_empresa);
        let modelarAnio = {
            enero: [],
            febrero: [],
            marzo: [],
            abril: [],
            mayo: [],
            junio: [],
            julio: [],
            agosto: [],
            septiembre: [],
            octubre: [],
            noviembre: [],
            diciembre: []
        };
        atrasos.forEach((ele) => {
            // console.log(ele);
            if (ele !== 0) {
                let fecha = parseInt(ele.fecha.split('-')[1]);
                switch (fecha) {
                    case 1:
                        modelarAnio.enero.push(ele.tiempo_atraso);
                        break;
                    case 2:
                        modelarAnio.febrero.push(ele.tiempo_atraso);
                        break;
                    case 3:
                        modelarAnio.marzo.push(ele.tiempo_atraso);
                        break;
                    case 4:
                        modelarAnio.abril.push(ele.tiempo_atraso);
                        break;
                    case 5:
                        modelarAnio.mayo.push(ele.tiempo_atraso);
                        break;
                    case 6:
                        modelarAnio.junio.push(ele.ftiempo_atrasoecha);
                        break;
                    case 7:
                        modelarAnio.julio.push(ele.tiempo_atraso);
                        break;
                    case 8:
                        modelarAnio.agosto.push(ele.tiempo_atraso);
                        break;
                    case 9:
                        modelarAnio.septiembre.push(ele.tiempo_atraso);
                        break;
                    case 10:
                        modelarAnio.octubre.push(ele.tiempo_atraso);
                        break;
                    case 11:
                        modelarAnio.noviembre.push(ele.tiempo_atraso);
                        break;
                    case 12:
                        modelarAnio.diciembre.push(ele.tiempo_atraso);
                        break;
                    default: break;
                }
            }
        });
        atrasos = [];
        let data = [
            { id: 0, mes: 'Enero', valor: M_graficas.SumarValoresArray(modelarAnio.enero) },
            { id: 1, mes: 'Febrero', valor: M_graficas.SumarValoresArray(modelarAnio.febrero) },
            { id: 2, mes: 'Marzo', valor: M_graficas.SumarValoresArray(modelarAnio.marzo) },
            { id: 3, mes: 'Abril', valor: M_graficas.SumarValoresArray(modelarAnio.abril) },
            { id: 4, mes: 'Mayo', valor: M_graficas.SumarValoresArray(modelarAnio.mayo) },
            { id: 5, mes: 'Junio', valor: M_graficas.SumarValoresArray(modelarAnio.junio) },
            { id: 6, mes: 'Julio', valor: M_graficas.SumarValoresArray(modelarAnio.julio) },
            { id: 7, mes: 'Agosto', valor: M_graficas.SumarValoresArray(modelarAnio.agosto) },
            { id: 8, mes: 'Septiembre', valor: M_graficas.SumarValoresArray(modelarAnio.septiembre) },
            { id: 9, mes: 'Octubre', valor: M_graficas.SumarValoresArray(modelarAnio.octubre) },
            { id: 10, mes: 'Noviembre', valor: M_graficas.SumarValoresArray(modelarAnio.noviembre) },
            { id: 11, mes: 'Diciembre', valor: M_graficas.SumarValoresArray(modelarAnio.diciembre) }
        ];
        let meses = data.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.mes; });
        let valor_mensual = data.filter(obj => { return (obj.id >= fec_inicio.getUTCMonth() && obj.id <= fec_final.getUTCMonth()); }).map(obj => { return obj.valor; });
        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: { type: 'category', name: 'Meses', data: meses, axisTick: { alignWithLabel: true } },
            yAxis: { type: 'value', name: 'N° horas' },
            series: {
                name: 'Dias',
                type: 'bar',
                barWidth: '60%',
                data: valor_mensual
            },
            legend: {
                align: 'left',
                data: [{
                        name: 'Atrasos'
                    }]
            },
        };
    });
};
exports.MetricaAtrasosEmpleadoSinAcciones = MetricaAtrasosEmpleadoSinAcciones;
