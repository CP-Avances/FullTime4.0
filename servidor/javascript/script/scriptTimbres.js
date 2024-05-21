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
exports.ModificarTimbresEntrada = exports.EliminarTimbres = exports.generarTimbres = void 0;
const database_1 = __importDefault(require("../database"));
const moment_1 = __importDefault(require("moment"));
const FECHA_FERIADOS = [];
const generarTimbres = function (codigo, inicio, fin) {
    return __awaiter(this, void 0, void 0, function* () {
        let horarios = yield database_1.default.query(`
        SELECT pg.fecha_hora_horario::date AS fecha, pg.fecha_hora_horario::time AS hora, pg.tipo_dia, pg.tipo_accion,
            pg.minutos_alimentacion
        FROM eu_asistencia_general AS pg
        WHERE pg.fecha_horario BETWEEN $1 AND $2 AND pg.codigo = $3 AND (tipo_dia = 'N' OR estado_origen = 'HFD' OR estado_origen = 'HL')
        ORDER BY pg.fecha_hora_horario ASC
        `, [inicio, fin, codigo])
            .then(result => {
            return result.rows;
        });
        var auxiliar = '';
        horarios.forEach((ele) => __awaiter(this, void 0, void 0, function* () {
            let accion = '';
            let observacion = '';
            let latitud = '-0.928755';
            let longitud = '-78.606327';
            let tecla_funcion = '';
            let fecha = '';
            switch (ele.tipo_accion) {
                case 'E':
                    //var hora_ = moment(ele.hora, "HH:mm:ss").subtract(moment.duration("00:01:00")).format("HH:mm:ss");
                    //var hora_ = moment(ele.hora, "HH:mm:ss").add(moment.duration("00:00:00")).format("HH:mm:ss");
                    var hora_ = (0, moment_1.default)(ele.hora, "HH:mm:ss").add(moment_1.default.duration("00:00:00")).format("HH:mm:ss");
                    //console.log('ver fecha ', moment(ele.fecha, 'YYYY-MM-DD').format('YYYY-MM-DD'))
                    var formato = (0, moment_1.default)(ele.fecha, 'YYYY-MM-DD').format('YYYY-MM-DD');
                    fecha = (0, moment_1.default)(formato + ' ' + hora_, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
                    //console.log('ver formato ', fecha)
                    accion = 'E';
                    observacion = 'Entrada';
                    tecla_funcion = '0';
                    break;
                case 'S':
                    //var hora_ = moment(ele.hora, "HH:mm:ss").add(moment.duration("00:10:00")).format("HH:mm:ss");
                    //var hora_ = moment(ele.hora, "HH:mm:ss").add(moment.duration("00:00:00")).format("HH:mm:ss");
                    var hora_ = (0, moment_1.default)(ele.hora, "HH:mm:ss").subtract(moment_1.default.duration("00:02:00")).format("HH:mm:ss");
                    var formato = (0, moment_1.default)(ele.fecha, 'YYYY-MM-DD').format('YYYY-MM-DD');
                    fecha = (0, moment_1.default)(formato + ' ' + hora_, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
                    observacion = 'Salida';
                    tecla_funcion = '1';
                    break;
                case 'I/A':
                    auxiliar = '';
                    var hora_ = (0, moment_1.default)(ele.hora, "HH:mm:ss").add(moment_1.default.duration("00:20:00")).format("HH:mm:ss");
                    var formato = (0, moment_1.default)(ele.fecha, 'YYYY-MM-DD').format('YYYY-MM-DD');
                    fecha = (0, moment_1.default)(formato + ' ' + hora_, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
                    accion = 'I/A';
                    observacion = 'Inicio alimentacion';
                    tecla_funcion = '2';
                    auxiliar = hora_;
                    break;
                case 'F/A':
                    var comida = (0, moment_1.default)(formatearMinutos(ele.minutos_alimentacion), 'HH:mm:ss').format('HH:mm:ss');
                    //var min = moment(comida, "HH:mm:ss").subtract(moment.duration("00:01:00")).format("HH:mm:ss");
                    //var min = moment(comida, "HH:mm:ss").subtract(moment.duration("00:01:00")).format("HH:mm:ss");
                    var min = (0, moment_1.default)(comida, "HH:mm:ss").add(moment_1.default.duration("00:00:00")).format("HH:mm:ss");
                    var hora_ = (0, moment_1.default)(auxiliar, "HH:mm:ss").add(moment_1.default.duration(min)).format("HH:mm:ss");
                    console.log('hora ', hora_, ' auxiliar ', auxiliar);
                    var formato = (0, moment_1.default)(ele.fecha, 'YYYY-MM-DD').format('YYYY-MM-DD');
                    fecha = (0, moment_1.default)(formato + ' ' + hora_, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
                    accion = 'F/A';
                    observacion = 'Fin alimentacion';
                    tecla_funcion = '3';
                    auxiliar = '';
                    break;
                default:
                    break;
            }
            console.log('fecha ', fecha);
            if (fecha) {
                yield database_1.default.query(`
                INSERT INTO eu_timbres (fecha_hora_timbre, accion, tecla_funcion, observacion, latitud, longitud, 
                    codigo, id_reloj, fecha_hora_timbre_servidor)
                values($1, $2, $3, $4, $5, $6, $7, $8, $9)         
                `, [fecha, accion, tecla_funcion, observacion, latitud, longitud, codigo, 3, fecha]);
            }
        }));
        /*
            `
                INSERT INTO eu_timbres (fecha_hora_timbre, accion, tecla_funcion, observacion, latitud, longitud,
                    codigo, id_reloj, fecha_hora_timbre_servidor)
                values($1, $2, $3, $4, $5, $6, $7, $8, $9)
                `
                , [fecha, accion, tecla_funcion, observacion, latitud, longitud, codigo, 3, fecha]
    
        */
    });
};
exports.generarTimbres = generarTimbres;
function formatearMinutos(minutos) {
    var seconds = (minutos * 60);
    var hour = Math.floor(seconds / 3600);
    hour = (hour < 10) ? '0' + hour : hour;
    var minute = Math.floor((seconds / 60) % 60);
    minute = (minute < 10) ? '0' + minute : minute;
    var second = seconds % 60;
    second = (second < 10) ? '0' + second : second;
    return hour + ':' + minute + ':' + second;
}
/**
 * Metodo que devuelve el arreglo de las fechas con su estado.
 * @param horario Ultimo horario del empleado con los estados de los dias libres y normales
 * @param rango Fecha de inicio y final, puede ser rango semanal o mensual
 */
function DiasByEstado(horario) {
    var fecha1 = (0, moment_1.default)(horario.fec_inicio.toJSON().split("T")[0]);
    var fecha2 = (0, moment_1.default)(horario.fec_final.toJSON().split("T")[0]);
    var diasHorario = fecha2.diff(fecha1, 'days');
    var fec_aux = new Date(horario.fec_inicio);
    let respuesta = [];
    for (let i = 0; i <= diasHorario; i++) {
        let horario_res = fechaIterada(fec_aux, horario);
        respuesta.push(horario_res);
        fec_aux.setDate(fec_aux.getDate() + 1);
    }
    return respuesta.filter(ele => { return ele.estado === false; });
}
/**
 * METODO para devolver la fecha y el estado de cada uno de los dias de ese horario
 * @param fechaIterada Fecha asignada por el ciclo for
 * @param horario es el ultimo horario del empleado.
 */
function fechaIterada(fechaIterada, horario) {
    let est;
    if (fechaIterada.getDay() === 0) {
        est = horario.domingo;
    }
    else if (fechaIterada.getDay() === 1) {
        est = horario.lunes;
    }
    else if (fechaIterada.getDay() === 2) {
        est = horario.martes;
    }
    else if (fechaIterada.getDay() === 3) {
        est = horario.miercoles;
    }
    else if (fechaIterada.getDay() === 4) {
        est = horario.jueves;
    }
    else if (fechaIterada.getDay() === 5) {
        est = horario.viernes;
    }
    else if (fechaIterada.getDay() === 6) {
        est = horario.sabado;
    }
    return {
        fecha: fechaIterada.toJSON().split('T')[0],
        estado: est,
        id_horario: horario.id_horarios
    };
}
const EliminarTimbres = function (id_empleado) {
    return __awaiter(this, void 0, void 0, function* () {
        yield database_1.default.query('DELETE FROM eu_timbres WHERE codigo = $1', [id_empleado])
            .then(result => {
            console.log(result.command);
        });
    });
};
exports.EliminarTimbres = EliminarTimbres;
const ModificarTimbresEntrada = function () {
    return __awaiter(this, void 0, void 0, function* () {
        let arrayRespuesta = yield database_1.default.query('select id, CAST(fecha_hora_timbre as VARCHAR) FROM eu_timbres WHERE accion like \'E\' ORDER BY fecha_hora_timbre, codigo ASC')
            .then(result => {
            console.log(result.rowCount);
            return result.rows.filter(obj => {
                var minuto = obj.fecha_hora_timbre.split(' ')[1].split(':')[1];
                return (minuto >= 0 && minuto <= 35);
            });
        });
        console.log(arrayRespuesta.length);
        arrayRespuesta.forEach((obj) => __awaiter(this, void 0, void 0, function* () {
            var hora = parseInt(obj.fecha_hora_timbre.split(' ')[1].split(':')[0]) + 1;
            var minuto = obj.fecha_hora_timbre.split(' ')[1].split(':')[1];
            var f = new Date(obj.fecha_hora_timbre.split(' ')[0]);
            // console.log(f.toJSON());
            f.setUTCHours(hora);
            f.setUTCMinutes(minuto);
            // console.log('Fecha corregidad',f.toJSON());
            yield database_1.default.query('UPDATE eu_timbres SET fecha_hora_timbre = $1 WHERE id = $2', [f.toJSON(), obj.id]);
        }));
    });
};
exports.ModificarTimbresEntrada = ModificarTimbresEntrada;
