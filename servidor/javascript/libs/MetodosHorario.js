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
exports.HorariosParaInasistencias = exports.EstadoHorarioPeriVacacion = exports.VerificarHorario = void 0;
const database_1 = __importDefault(require("../database"));
const moment_1 = __importDefault(require("moment"));
const MetodosFechas_1 = require("./MetodosFechas");
const FECHA_FERIADOS = [];
const VerificarHorario = function (id_cargo) {
    return __awaiter(this, void 0, void 0, function* () {
        let horario = yield database_1.default.query('SELECT * FROM empl_horarios WHERE id_empl_cargo = $1 AND estado = 1 ORDER BY fec_inicio DESC LIMIT 1', [id_cargo]).then(result => { return result.rows[0]; }); // devuelve el ultimo horario del cargo
        if (!horario)
            return { message: 'Horario no encontrado' };
        // console.log(horario);
        let respuesta = tipoHorario(horario.fec_inicio, horario.fec_final);
        var f = new Date();
        f.setUTCMonth(f.getMonth());
        f.setUTCDate(f.getDate());
        f.setUTCHours(f.getHours());
        // FECHA_FERIADOS = feriados
        let feriados;
        let fechasRango;
        let objeto;
        if (respuesta === 'semanal') {
            fechasRango = (0, MetodosFechas_1.ObtenerRangoSemanal)(f);
            feriados = yield database_1.default.query('SELECT f.fecha FROM empl_cargos AS ca, sucursales AS s, ciudades AS c, ciud_feriados AS cf, cg_feriados AS f WHERE ca.id_sucursal = s.id AND c.id = s.id_ciudad AND c.id = cf.id_ciudad AND f.id = cf.id_feriado AND ca.id = $1 AND CAST(f.fecha AS VARCHAR) between $2 || \'%\' AND $3 || \'%\'', [id_cargo, fechasRango.inicio.toJSON().split('T')[0], fechasRango.final.toJSON().split('T')[0]]).then(result => { return result.rows; });
            feriados.forEach(obj => {
                FECHA_FERIADOS.push(obj);
            });
            objeto = DiasByEstado(horario, fechasRango);
        }
        else if (respuesta === 'mensual') {
            fechasRango = (0, MetodosFechas_1.ObtenerRangoMensual)(f);
            objeto = DiasByEstado(horario, fechasRango);
        }
        else if (respuesta === 'anual') {
            fechasRango = (0, MetodosFechas_1.ObtenerRangoMensual)(f);
            objeto = DiasByEstado(horario, fechasRango);
        }
        // console.log('Fechas rango: ', fechasRango);
        // console.log('Objeto JSON: ', objeto);
        return objeto;
    });
};
exports.VerificarHorario = VerificarHorario;
/**
 * Metodo devuelve el tipo de horario que tiene el empleado.
 * @param inicio Fecha de inicio del horario del empleado.
 * @param final Fecha final del horario del empleado.
 */
function tipoHorario(inicio, final) {
    var fecha1 = (0, moment_1.default)(inicio.toJSON().split("T")[0]);
    var fecha2 = (0, moment_1.default)(final.toJSON().split("T")[0]);
    var diasHorario = fecha2.diff(fecha1, 'days');
    if (diasHorario >= 1 && diasHorario <= 7)
        return 'semanal';
    if (diasHorario >= 25 && diasHorario <= 35)
        return 'mensual';
    return 'anual';
    /**
     * semana = 6 (mayor a 1 menor a 7),
     * mensual (mayor a 25 y menor a 35)
     * anual = 365 (Hacer que sea mayor 40 y menor a 370)
     */
}
/**
 * Metodo que devuelve el arreglo de las fechas con su estado.
 * @param horario Ultimo horario del empleado con los estados de los dias libres y normales
 * @param rango Fecha de inicio y final, puede ser rango semanal o mensual
 */
function DiasByEstado(horario, rango) {
    var fec_aux = new Date(rango.inicio);
    // console.log('FECHA_FERIADOS', FECHA_FERIADOS);
    let respuesta = [];
    for (let i = fec_aux.getDate(); i <= rango.final.getDate(); i++) {
        let horario_res = fechaIterada(fec_aux, horario);
        respuesta.push(horario_res);
        fec_aux.setDate(fec_aux.getDate() + 1);
    }
    return respuesta;
}
/**
 * METODO para devolver la fecha y el estado de cada uno de los dias de ese horario
 * @param fechaIterada Fecha asignada por el ciclo for
 * @param horario es el ultimo horario del empleado.
 */
function fechaIterada(fechaIterada, horario) {
    let est;
    switch (fechaIterada.getDay()) {
        case 0:
            est = horario.domingo;
            break;
        case 1:
            est = horario.lunes;
            break;
        case 2:
            est = horario.martes;
            break;
        case 3:
            est = horario.miercoles;
            break;
        case 4:
            est = horario.jueves;
            break;
        case 5:
            est = horario.viernes;
            break;
        case 6:
            est = horario.sabado;
            break;
        default: break;
    }
    return {
        fecha: fechaIterada.toJSON().split('T')[0],
        estado: est
    };
}
const EstadoHorarioPeriVacacion = function (id_empleado) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(id_empleado);
        let ids = yield database_1.default.query('SELECT co.id AS id_contrato, ca.id AS id_cargo FROM empl_contratos AS co, empl_cargos AS ca WHERE co.id_empleado = $1 AND co.id = ca.id_empl_contrato', [id_empleado])
            .then(result => { return result.rows; });
        if (ids.length === 0) {
            return 0;
        }
        console.log(ids);
        let cargos = [...new Set(ids.map(obj => {
                return obj.id_cargo;
            }))];
        cargos.forEach((id_cargo) => __awaiter(this, void 0, void 0, function* () {
            yield database_1.default.query('UPDATE empl_horarios SET estado = 2 WHERE id_empl_cargo = $1', [id_cargo]); //Estado 2 es para q esten desactivados esos horarios
        }));
        let contratos = [...new Set(ids.map(obj => {
                return obj.id_contrato;
            }))];
        contratos.forEach((id_contrato) => __awaiter(this, void 0, void 0, function* () {
            yield database_1.default.query('UPDATE peri_vacaciones SET estado = 2 WHERE id_empl_contrato = $1', [id_contrato]); //Estado 2 es para q esten desactivados esos periodos de vacacion
        }));
        return 0;
    });
};
exports.EstadoHorarioPeriVacacion = EstadoHorarioPeriVacacion;
const HorariosParaInasistencias = function (horario) {
    let fechasRango = {
        inicio: horario.fec_inicio,
        final: horario.fec_final
    };
    let objeto = DiasConEstado(horario, fechasRango);
    // console.log('Fechas rango: ', fechasRango);
    // console.log('Objeto JSON: ', objeto);
    return objeto.filter(obj => { return (obj.estado === false); }).map(obj => { return { fecha: obj.fecha }; });
};
exports.HorariosParaInasistencias = HorariosParaInasistencias;
function DiasConEstado(horario, rango) {
    var fec_aux = new Date(rango.inicio);
    // console.log('FECHA_FERIADOS', FECHA_FERIADOS);
    var fecha1 = (0, moment_1.default)(rango.inicio.toJSON().split("T")[0]);
    var fecha2 = (0, moment_1.default)(rango.final.toJSON().split("T")[0]);
    var diasHorario = fecha2.diff(fecha1, 'days');
    let respuesta = [];
    for (let i = 0; i <= diasHorario; i++) {
        let horario_res = fechaIterada(fec_aux, horario);
        respuesta.push(horario_res);
        fec_aux.setDate(fec_aux.getDate() + 1);
    }
    return respuesta;
}
