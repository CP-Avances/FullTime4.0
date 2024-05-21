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
exports.MetricaPermisosEmpleado = exports.MetricaVacacionesEmpleado = exports.MetricaHorasExtraEmpleado = exports.GraficaMarcaciones = exports.GraficaHorasExtras = void 0;
const M_graficas = __importStar(require("./SubMetodosGraficas"));
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
        timbres.forEach((obj) => {
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
