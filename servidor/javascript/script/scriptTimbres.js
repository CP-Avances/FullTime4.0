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
const luxon_1 = require("luxon");
const database_1 = __importDefault(require("../database"));
const generarTimbres = function (codigo, inicio, fin) {
    return __awaiter(this, void 0, void 0, function* () {
        let horarios = yield database_1.default.query(`
        SELECT pg.fecha_hora_horario::date AS fecha, pg.fecha_hora_horario::time AS hora, pg.tipo_dia, pg.tipo_accion,
            pg.minutos_alimentacion
        FROM eu_asistencia_general AS pg
        WHERE pg.fecha_horario BETWEEN $1 AND $2 AND pg.id_empleado = $3 AND (tipo_dia = 'N' OR estado_origen = 'HFD' OR estado_origen = 'HL')
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
                    //var hora_ = DateTime.fromFormat(ele.hora, "HH:mm:ss").plus(Duration.fromISOTime("00:01:00")).toFormat("HH:mm:ss");
                    var hora_ = luxon_1.DateTime.fromFormat(ele.hora, "HH:mm:ss").plus(luxon_1.Duration.fromISOTime("00:00:00")).toFormat("HH:mm:ss");
                    //console.log('ver fecha ', DateTime.fromFormat(ele.fecha, 'yyyy-MM-dd').toFormat('yyyy-MM-dd'))
                    var formato = luxon_1.DateTime.fromFormat(ele.fecha, 'yyyy-MM-dd').toFormat('yyyy-MM-dd');
                    fecha = luxon_1.DateTime.fromFormat(`${formato} ${hora_}`, 'yyyy-MM-dd HH:mm:ss').toFormat('yyyy-MM-dd HH:mm:ss');
                    //console.log('ver formato ', fecha)
                    accion = 'E';
                    observacion = 'Entrada';
                    tecla_funcion = '0';
                    break;
                case 'S':
                    //var hora_ = DateTime.fromFormat(ele.hora, "HH:mm:ss").plus(Duration.fromISOTime("00:10:00")).toFormat("HH:mm:ss");
                    //var hora_ = DateTime.fromFormat(ele.hora, "HH:mm:ss").plus(Duration.fromISOTime("00:00:00")).toFormat("HH:mm:ss");
                    var hora_ = luxon_1.DateTime.fromFormat(ele.hora, "HH:mm:ss").minus(luxon_1.Duration.fromISOTime("00:02:00")).toFormat("HH:mm:ss");
                    var formato = luxon_1.DateTime.fromFormat(ele.fecha, 'yyyy-MM-dd').toFormat('yyyy-MM-dd');
                    fecha = luxon_1.DateTime.fromFormat(`${formato} ${hora_}`, 'yyyy-MM-dd HH:mm:ss').toFormat('yyyy-MM-dd HH:mm:ss');
                    observacion = 'Salida';
                    tecla_funcion = '1';
                    break;
                case 'I/A':
                    auxiliar = '';
                    var hora_ = luxon_1.DateTime.fromFormat(ele.hora, "HH:mm:ss").plus(luxon_1.Duration.fromISOTime("00:20:00")).toFormat("HH:mm:ss");
                    var formato = luxon_1.DateTime.fromFormat(ele.fecha, 'yyyy-MM-dd').toFormat('yyyy-MM-dd');
                    fecha = luxon_1.DateTime.fromFormat(`${formato} ${hora_}`, 'yyyy-MM-dd HH:mm:ss').toFormat('yyyy-MM-dd HH:mm:ss');
                    accion = 'I/A';
                    observacion = 'Inicio alimentacion';
                    tecla_funcion = '2';
                    auxiliar = hora_;
                    break;
                case 'F/A':
                    var comida = luxon_1.DateTime.fromFormat(formatearMinutos(ele.minutos_alimentacion), 'HH:mm:ss').toFormat('HH:mm:ss');
                    //var min = DateTime.fromFormat(comida, "HH:mm:ss").minus(Duration.fromISOTime("00:02:00")).toFormat("HH:mm:ss");
                    var min = luxon_1.DateTime.fromFormat(comida, "HH:mm:ss").plus(luxon_1.Duration.fromISOTime("00:00:00")).toFormat("HH:mm:ss");
                    var hora_ = luxon_1.DateTime.fromFormat(auxiliar, "HH:mm:ss").plus(luxon_1.Duration.fromISOTime(min)).toFormat("HH:mm:ss");
                    //console.log('hora ', hora_, ' auxiliar ', auxiliar)
                    var formato = luxon_1.DateTime.fromFormat(ele.fecha, 'yyyy-MM-dd').toFormat('yyyy-MM-dd');
                    fecha = luxon_1.DateTime.fromFormat(`${formato} ${hora_}`, 'yyyy-MM-dd HH:mm:ss').toFormat('yyyy-MM-dd HH:mm:ss');
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
                    codigo, id_reloj, fecha_hora_timbre_servidor, fecha_hora_timbre_validado)
                values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)         
                `, [fecha, accion, tecla_funcion, observacion, latitud, longitud, codigo, 3, fecha, fecha]);
            }
        }));
        /*
            `
                INSERT INTO eu_timbres (fecha_hora_timbre, accion, tecla_funcion, observacion, latitud, longitud,
                    codigo, id_reloj, fecha_hora_timbre_servidor, fecha_hora_timbre_validado)
                values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                `
                , [fecha, accion, tecla_funcion, observacion, latitud, longitud, codigo, 3, fecha, fecha]
    
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
