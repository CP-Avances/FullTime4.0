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
const generarTimbres = function (id_empleado) {
    return __awaiter(this, void 0, void 0, function* () {
        /*
            // pool.query('SELECT co.id_empleado AS empleado, co.id AS contrato, ca.id AS cargo, ho.fec_inicio, ho.fec_final,' +
            //     'ho.lunes, ho.martes, ho.miercoles, ho.jueves, ho.viernes, ho.sabado, ho.domingo, ho.id_horarios' +
            //     'FROM empl_contratos AS co, empl_cargos AS ca, empl_horarios AS ho' +
            //     'WHERE co.id_empleado = $1 AND co.id = ca.id_empl_contrato AND ho.id_empl_cargo = ca.id AND ho.estado = 1',[id_empleado])
            let horarios = await pool.query(
                'SELECT ho.fec_inicio, ho.fec_final, ho.lunes, ho.martes, ho.miercoles, ho.jueves, ho.viernes, ho.sabado, ho.domingo, ho.id_horarios ' +
                'FROM empl_contratos AS co, empl_cargos AS ca, empl_horarios AS ho ' +
                'WHERE co.id_empleado = $1 AND co.id = ca.id_empl_contrato AND ho.id_empl_cargo = ca.id AND ho.estado = 1 ORDER BY ho.fec_inicio ASC',[id_empleado])
                .then(result => {
                    return result.rows
                });
        
            let Ids_horarios = [... new Set(
                    horarios.map(obj => {
                        return obj.id_horarios;
                    })
                )]
        
            console.log(Ids_horarios);
        
            let detaHorarios: any[] = await Promise.all(Ids_horarios.map(async(obj): Promise<any> => {
                return {
                    id_horario: obj,
                    datos: await pool.query('SELECT orden, hora FROM deta_horarios WHERE id_horario = $1 ORDER BY orden, hora',[obj])
                    .then(result => {
                        return result.rows.map(obj => { return obj })
                    })
                }
            }))
            detaHorarios.forEach(obj => {
                console.log(obj);
            })
            let arregloTotal: any = [];
        
            horarios.forEach(obj => {
                DiasByEstado(obj).forEach(ele => {
                    arregloTotal.push(ele)
                });
            })
        
            arregloTotal.forEach((obj:any) => {
                detaHorarios.forEach(ele => {
                    if (ele.id_horario === obj.id_horario) {
                        ele.datos.forEach(async(itera:any) => {
                            let fecha = obj.fecha + 'T' + '00:00:00'
                            var f = new Date(fecha)
                            var min_aleatoria = Math.floor((Math.random() * 59) + 0)
                            
                            f.setUTCHours(itera.hora.split(':')[0])
                            f.setUTCMinutes(min_aleatoria)
        
                            let accion: string;
                            let observacion: string;
                            let latitud = '-0.928755'
                            let longitud =  '-78.606327'
                            let tecla_funcion: number;
                            switch (itera.orden) {
                                case 1:
                                    f.setUTCHours(f.getUTCHours() - 1)
                                    accion = 'EoS';
                                    observacion = 'Entrada';
                                    tecla_funcion = 0;
                                    break;
                                case 2:
                                    accion = 'AES';
                                    observacion = 'Salida Almuerzo';
                                    tecla_funcion = 1;
                                    break;
                                case 3:
                                    accion = 'AES';
                                    observacion = 'Entrada Almuerzo';
                                    tecla_funcion = 1;
                                    break;
                                default: //es orden 4
                                    accion = 'EoS';
                                    observacion = 'Salida';
                                    tecla_funcion = 0;
                                    break;
                            }
                            console.log('accion:', accion,f.toJSON());
        
                            await pool.query('INSERT INTO timbres (fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, id_empleado, id_reloj)' +
                            'values($1,$2,$3,$4,$5,$6,$7,$8)', [f.toJSON(), accion, tecla_funcion , observacion, latitud, longitud, id_empleado, 3])
                        });
                    }
                })
            });
            
            */
    });
};
exports.generarTimbres = generarTimbres;
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
        yield database_1.default.query('DELETE FROM timbres WHERE codigo = $1', [id_empleado])
            .then(result => {
            console.log(result.command);
        });
    });
};
exports.EliminarTimbres = EliminarTimbres;
const ModificarTimbresEntrada = function () {
    return __awaiter(this, void 0, void 0, function* () {
        let arrayRespuesta = yield database_1.default.query('select id, CAST(fec_hora_timbre as VARCHAR) from timbres where accion like \'E\' order by fec_hora_timbre, codigo ASC')
            .then(result => {
            console.log(result.rowCount);
            return result.rows.filter(obj => {
                var minuto = obj.fec_hora_timbre.split(' ')[1].split(':')[1];
                return (minuto >= 0 && minuto <= 35);
            });
        });
        console.log(arrayRespuesta.length);
        arrayRespuesta.forEach((obj) => __awaiter(this, void 0, void 0, function* () {
            var hora = parseInt(obj.fec_hora_timbre.split(' ')[1].split(':')[0]) + 1;
            var minuto = obj.fec_hora_timbre.split(' ')[1].split(':')[1];
            var f = new Date(obj.fec_hora_timbre.split(' ')[0]);
            // console.log(f.toJSON());
            f.setUTCHours(hora);
            f.setUTCMinutes(minuto);
            // console.log('Fecha corregidad',f.toJSON());
            yield database_1.default.query('UPDATE timbres SET fec_hora_timbre = $1 WHERE id = $2', [f.toJSON(), obj.id]);
        }));
    });
};
exports.ModificarTimbresEntrada = ModificarTimbresEntrada;
