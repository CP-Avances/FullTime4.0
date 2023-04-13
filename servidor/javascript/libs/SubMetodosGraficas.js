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
exports.ModelarFechas = exports.SegundosToHHMM = exports.Empleado_Atrasos_ModelarDatos_SinAcciones = exports.Empleado_Atrasos_ModelarDatos = exports.Empleado_Permisos_ModelarDatos = exports.Empleado_Vacaciones_ModelarDatos = exports.Empleado_HoraExtra_ModelarDatos = exports.ModelarSalidasAnticipadasSinAcciones = exports.ModelarSalidasAnticipadas = exports.ModelarTiempoJornada = exports.ModelarAtrasos = exports.BuscarTimbresEoSModelado = exports.BuscarTimbresEntradaSinAccionModelado = exports.BuscarTimbresEntradasSinAcciones = exports.BuscarTimbresEntradas = exports.SumarValoresArray = exports.HHMMtoSegundos = exports.HoraExtra_ModelarDatos = exports.BuscarHorasExtras = exports.BuscarPermisosJustificados = exports.BuscarTimbresByCodigo_Fecha = exports.BuscarHorariosActivos = exports.BuscarTimbresByFecha = void 0;
const database_1 = __importDefault(require("../database"));
const moment_1 = __importDefault(require("moment"));
const MetodosHorario_1 = require("./MetodosHorario");
const BuscarTimbresByFecha = function (fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query('SELECT fec_hora_timbre FROM timbres WHERE CAST(fec_hora_timbre AS VARCHAR) between $1 || \'%\' AND $2 || \'%\' ORDER BY fec_hora_timbre ASC', [fec_inicio, fec_final])
            .then(res => {
            return res.rows;
        });
    });
};
exports.BuscarTimbresByFecha = BuscarTimbresByFecha;
const BuscarHorariosActivos = function (fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        let lista_horarios = yield database_1.default.query('SELECT * FROM empl_horarios WHERE CAST(fec_inicio AS VARCHAR) between $1 || \'%\' AND $2 || \'%\' ORDER BY fec_inicio ASC', [fec_inicio, fec_final])
            .then(res => {
            return res.rows;
        });
        let array = lista_horarios.map(obj => {
            return {
                horario: (0, MetodosHorario_1.HorariosParaInasistencias)(obj),
                codigo: obj.codigo
            };
        });
        lista_horarios = [];
        return array;
    });
};
exports.BuscarHorariosActivos = BuscarHorariosActivos;
const BuscarTimbresByCodigo_Fecha = function (codigo, horario) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield Promise.all(horario.map((obj) => __awaiter(this, void 0, void 0, function* () {
            return {
                fecha: obj.fecha,
                timbresTotal: yield database_1.default.query('SELECT fec_hora_timbre FROM timbres WHERE CAST(fec_hora_timbre AS VARCHAR) like $1 || \'%\' AND id_empleado = $2 ORDER BY fec_hora_timbre ASC', [obj.fecha, codigo])
                    .then(res => {
                    return res.rowCount;
                })
            };
        })));
    });
};
exports.BuscarTimbresByCodigo_Fecha = BuscarTimbresByCodigo_Fecha;
const BuscarPermisosJustificados = function (codigo, fecha) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query('SELECT fec_inicio, descripcion FROM permisos WHERE codigo = $1 AND fec_inicio::TIMESTAMP::DATE <= $2 AND fec_final::TIMESTAMP::DATE >= $2 AND estado = 3 ', [codigo, fecha + ''])
            .then(result => {
            return result.rowCount;
        });
    });
};
exports.BuscarPermisosJustificados = BuscarPermisosJustificados;
const BuscarHorasExtras = function (fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query('SELECT fec_hora_timbre FROM timbres WHERE CAST(fec_hora_timbre AS VARCHAR) between $1 || \'%\' AND $2 || \'%\' ORDER BY fec_hora_timbre ASC', [fec_inicio, fec_final])
            .then(res => {
            return res.rows;
        });
    });
};
exports.BuscarHorasExtras = BuscarHorasExtras;
const HoraExtra_ModelarDatos = function (fec_desde, fec_hasta) {
    return __awaiter(this, void 0, void 0, function* () {
        let horas_extras = yield ListaHorasExtrasGrafica(fec_desde, fec_hasta);
        // console.log('Lista de horas extras ===', horas_extras);
        let array = horas_extras.map((obj) => {
            obj.tiempo_autorizado = (obj.tiempo_autorizado === 0) ? obj.num_hora : obj.tiempo_autorizado;
            return obj;
        });
        // console.log('Lista de array ===', array);
        let nuevo = [];
        array.forEach(obj => {
            let respuesta = DiasIterados(obj.fec_inicio, obj.fec_final, obj.tiempo_autorizado, obj.id_empl_cargo, obj.codigo);
            respuesta.forEach(ele => {
                nuevo.push(ele);
            });
        });
        // console.log('Lista de Nuevo ===', nuevo);    
        return nuevo;
    });
};
exports.HoraExtra_ModelarDatos = HoraExtra_ModelarDatos;
function DiasIterados(inicio, final, tiempo_autorizado, id_empl_cargo, codigo) {
    var fec_aux = new Date(inicio);
    var fecha1 = (0, moment_1.default)(inicio.split("T")[0]);
    var fecha2 = (0, moment_1.default)(final.split("T")[0]);
    var diasHorario = fecha2.diff(fecha1, 'days') + 1;
    let respuesta = [];
    for (let i = 0; i < diasHorario; i++) {
        let horario_res = {
            fecha: fec_aux.toJSON().split('T')[0],
            tiempo: tiempo_autorizado,
            cargo: id_empl_cargo,
            codigo: codigo
        };
        // console.log(inicio,'--', final, diasHorario,'**************',horario_res);
        respuesta.push(horario_res);
        fec_aux.setDate(fec_aux.getDate() + 1);
    }
    return respuesta;
}
function ListaHorasExtrasGrafica(fec_desde, fec_hasta) {
    return __awaiter(this, void 0, void 0, function* () {
        let arrayUno = yield HorasExtrasSolicitadasGrafica(fec_desde, fec_hasta);
        let arrayDos = yield PlanificacionHorasExtrasSolicitadasGrafica(fec_desde, fec_hasta);
        let arrayUnido = arrayUno.concat(arrayDos);
        let set = new Set(arrayUnido.map(obj => { return JSON.stringify(obj); }));
        arrayUnido = Array.from(set).map(obj => { return JSON.parse(obj); });
        for (let j = 0; j < arrayUnido.length; j++) {
            let numMin;
            let i = numMin = j;
            for (++i; i < arrayUnido.length; i++) {
                (arrayUnido[i].fec_inicio < arrayUnido[numMin].fec_inicio) && (numMin = i);
            }
            [arrayUnido[j], arrayUnido[numMin]] = [arrayUnido[numMin], arrayUnido[j]];
        }
        return arrayUnido;
    });
}
function HorasExtrasSolicitadasGrafica(fec_desde, fec_hasta) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query('SELECT CAST(h.fec_inicio AS VARCHAR), CAST(h.fec_final AS VARCHAR), h.descripcion, h.num_hora, h.tiempo_autorizado, h.codigo, h.id_empl_cargo ' +
            'FROM hora_extr_pedidos AS h WHERE h.fec_inicio between $1 and $2 AND h.estado = 3 ' + // estado = 3 significa q las horas extras fueron autorizadas
            'AND h.fec_final between $1 and $2 ORDER BY h.fec_inicio', [fec_desde, fec_hasta])
            .then(result => {
            return Promise.all(result.rows.map((obj) => __awaiter(this, void 0, void 0, function* () {
                const hora_inicio = (0, exports.HHMMtoSegundos)(obj.fec_inicio.split(' ')[1]) / 3600;
                const hora_final = (0, exports.HHMMtoSegundos)(obj.fec_final.split(' ')[1]) / 3600;
                return {
                    id_empl_cargo: obj.id_empl_cargo,
                    hora_inicio: hora_inicio,
                    hora_final: hora_final,
                    fec_inicio: obj.fec_inicio.split(' ')[0],
                    fec_final: obj.fec_final.split(' ')[0],
                    descripcion: obj.descripcion,
                    num_hora: (0, exports.HHMMtoSegundos)(obj.num_hora) / 3600,
                    tiempo_autorizado: (0, exports.HHMMtoSegundos)(obj.tiempo_autorizado) / 3600,
                    codigo: obj.codigo
                };
            })));
        });
    });
}
function PlanificacionHorasExtrasSolicitadasGrafica(fec_desde, fec_hasta) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query('SELECT CAST(h.fecha_desde AS VARCHAR), CAST(h.hora_inicio AS VARCHAR), h.fecha_hasta, h.hora_fin, h.descripcion, h.horas_totales, ph.tiempo_autorizado, ph.codigo, ph.id_empl_cargo ' +
            'FROM plan_hora_extra_empleado AS ph, plan_hora_extra AS h WHERE ph.id_plan_hora = h.id AND ph.estado = 3 ' + //estado = 3 para horas extras autorizadas
            'AND h.fecha_desde between $1 and $2 AND h.fecha_hasta between $1 and $2 ORDER BY h.fecha_desde', [fec_desde, fec_hasta])
            .then(result => {
            return Promise.all(result.rows.map((obj) => __awaiter(this, void 0, void 0, function* () {
                const hora_inicio = (0, exports.HHMMtoSegundos)(obj.hora_inicio) / 3600;
                const hora_final = (0, exports.HHMMtoSegundos)(obj.hora_fin) / 3600;
                return {
                    id_empl_cargo: obj.id_empl_cargo,
                    hora_inicio: hora_inicio,
                    hora_final: hora_final,
                    fec_inicio: obj.fecha_desde.split(' ')[0],
                    fec_final: obj.fecha_hasta.split(' ')[0],
                    descripcion: obj.descripcion,
                    num_hora: (0, exports.HHMMtoSegundos)(obj.horas_totales) / 3600,
                    tiempo_autorizado: (0, exports.HHMMtoSegundos)(obj.tiempo_autorizado) / 3600,
                    codigo: obj.codigo
                };
            })));
        });
    });
}
const HHMMtoSegundos = function (dato) {
    if (dato === '')
        return 0;
    if (dato === null)
        return 0;
    // if (dato === 0) return 0
    // console.log(dato);
    var h = parseInt(dato.split(':')[0]) * 3600;
    var m = parseInt(dato.split(':')[1]) * 60;
    var s = parseInt(dato.split(':')[2]);
    // console.log(h, '>>>>>', m);
    return h + m + s;
};
exports.HHMMtoSegundos = HHMMtoSegundos;
const SumarValoresArray = function (array) {
    let valor = 0;
    for (let i = 0; i < array.length; i++) {
        valor = valor + parseFloat(array[i]);
    }
    return valor.toFixed(2);
};
exports.SumarValoresArray = SumarValoresArray;
const BuscarTimbresEntradas = function (fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query('SELECT CAST(fec_hora_timbre AS VARCHAR), id_empleado FROM timbres WHERE CAST(fec_hora_timbre AS VARCHAR) between $1 || \'%\' AND $2 || \'%\' AND accion in (\'EoS\', \'E\') ORDER BY fec_hora_timbre ASC ', [fec_inicio, fec_final])
            .then(res => {
            return res.rows;
        });
    });
};
exports.BuscarTimbresEntradas = BuscarTimbresEntradas;
const BuscarTimbresEntradasSinAcciones = function (fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        const orden = 1;
        const horarioEntrada = yield database_1.default.query('SELECT eh.codigo, dt.hora, dt.minu_espera, CAST(eh.fec_inicio AS VARCHAR), CAST(eh.fec_final AS VARCHAR), ' +
            'eh.lunes, eh.martes, eh.miercoles, eh.jueves, eh.viernes, eh.sabado, eh.domingo ' +
            'FROM empl_horarios AS eh, cg_horarios AS ch, deta_horarios AS dt ' +
            'WHERE dt.orden = $1 AND eh.fec_inicio BETWEEN $2 AND $3 AND eh.fec_final BETWEEN $2 AND $3 ' +
            'AND eh.id_horarios = ch.id AND ch.id = dt.id_horario', [orden, new Date(fec_inicio), new Date(fec_final)])
            .then(result => { return result.rows; });
        if (horarioEntrada.length === 0)
            return [0];
        console.log(horarioEntrada);
        let nuevo = [];
        let aux = yield Promise.all(horarioEntrada.map((obj) => __awaiter(this, void 0, void 0, function* () {
            let fechas = (0, exports.ModelarFechas)(obj.fec_inicio, obj.fec_final, obj);
            const hora_seg = (0, exports.HHMMtoSegundos)(obj.hora) + (obj.minu_espera * 60);
            let timbres = yield Promise.all(fechas.map((o) => __awaiter(this, void 0, void 0, function* () {
                var f_inicio = o.fecha + ' ' + (0, exports.SegundosToHHMM)(hora_seg);
                var f_final = o.fecha + ' ' + (0, exports.SegundosToHHMM)(hora_seg + (0, exports.HHMMtoSegundos)('02:00:00'));
                // console.log( f_inicio, ' || ', f_final, ' || ', codigo);
                const query = 'SELECT CAST(fec_hora_timbre AS VARCHAR) from timbres where fec_hora_timbre >= TO_TIMESTAMP(\'' + f_inicio + '\'' + ', \'YYYY-MM-DD HH24:MI:SS\') ' +
                    'and fec_hora_timbre <= TO_TIMESTAMP(\'' + f_final + '\'' + ', \'YYYY-MM-DD HH24:MI:SS\') and id_empleado = ' + obj.codigo + ' order by fec_hora_timbre';
                // console.log(query);
                try {
                    return yield database_1.default.query(query)
                        .then(res => {
                        if (res.rowCount === 0) {
                            return 0;
                        }
                        else {
                            const h_timbre = res.rows[0].fec_hora_timbre.split(' ')[1];
                            const t_tim = (0, exports.HHMMtoSegundos)(h_timbre);
                            // console.log(f_timbre);
                            return {
                                fecha: res.rows[0].fec_hora_timbre.split(' ')[0],
                                tiempo_atraso: (t_tim - hora_seg) / 3600
                            };
                        }
                    });
                }
                catch (error) {
                    console.log('********************* METODO BuscarTimbresEntradasSinAcciones ********************');
                    console.log(error);
                    console.log('***************************************************************************');
                    return 0;
                }
            })));
            return timbres;
        })));
        aux.forEach(obj => {
            if (obj.length > 0) {
                obj.forEach((o) => {
                    if (o.tiempo_atraso > 0) {
                        nuevo.push(o);
                    }
                });
            }
        });
        return nuevo;
    });
};
exports.BuscarTimbresEntradasSinAcciones = BuscarTimbresEntradasSinAcciones;
const BuscarTimbresEntradaSinAccionModelado = function (fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        let codigos = yield database_1.default.query('SELECT Distinct id_empleado FROM timbres WHERE CAST(fec_hora_timbre AS VARCHAR) between $1 || \'%\' AND $2 || \'%\' ORDER BY id_empleado ASC ', [fec_inicio, fec_final])
            .then(res => {
            return res.rows;
        });
        let nuevo = yield Promise.all(codigos.map((obj) => __awaiter(this, void 0, void 0, function* () {
            return database_1.default.query('SELECT eh.codigo, dh.hora, dh.orden, dh.id_horario, CAST(eh.fec_inicio AS VARCHAR), CAST(eh.fec_final AS VARCHAR) FROM empl_horarios AS eh, cg_horarios AS h, deta_horarios AS dh ' +
                'WHERE eh.codigo = $1 AND h.id = eh.id_horarios AND dh.id_horario = h.id AND CAST(eh.fec_inicio AS VARCHAR) between $2 || \'%\' AND $3 || \'%\' ' +
                'AND CAST(eh.fec_final AS VARCHAR) between $2 || \'%\' AND $3 || \'%\' ORDER BY eh.fec_inicio', [obj.id_empleado, fec_inicio, fec_final])
                .then(res => { return res.rows; });
        })));
        let array = [];
        nuevo.filter(o => {
            return o.length > 0;
        }).forEach(o => {
            o.forEach(e => {
                array.push(e);
            });
        });
        // console.log('Array: ',array);    
        if (array.length === 0)
            return [];
        // console.log('ARRAY MODELAR HORAS TRABAJADAS: ',array);
        var nuevoArray = [];
        var arrayTemporal = [];
        for (var i = 0; i < array.length; i++) {
            arrayTemporal = nuevoArray.filter((res) => {
                return res["Fecha"] == array[i]["fec_inicio"] + ' ' + array[i]["fec_final"] + ' ' + array[i]["codigo"];
            });
            if (arrayTemporal.length > 0) {
                nuevoArray[nuevoArray.indexOf(arrayTemporal[0])]["Horario"].push(array[i]);
            }
            else {
                nuevoArray.push({ "Fecha": array[i]["fec_inicio"] + ' ' + array[i]["fec_final"] + ' ' + array[i]["codigo"], "Horario": [array[i]] });
            }
        }
        nuevoArray.sort(compareFechas);
        let res_timbre = yield Promise.all(nuevoArray.map((obj) => __awaiter(this, void 0, void 0, function* () {
            var fec_aux = new Date(obj.Fecha.split(' ')[0]);
            var fecha1 = (0, moment_1.default)(obj.Fecha.split(' ')[0]);
            var fecha2 = (0, moment_1.default)(obj.Fecha.split(' ')[1]);
            const codigo = obj.Fecha.split(' ')[2];
            var diasDiferencia = fecha2.diff(fecha1, 'days');
            let res = [];
            for (let i = 0; i <= diasDiferencia; i++) {
                let horario_res = {
                    fecha: fec_aux.toJSON().split('T')[0],
                    timbres: yield BuscarTimbresSinAccionesReporte(fec_aux.toJSON().split('T')[0], codigo),
                    horario: obj.Horario.sort(compareOrden)
                };
                // console.log('Horarios Timbres Res:',horario_res.timbres);
                if (horario_res.timbres.length > 0) {
                    res.push(horario_res);
                }
                fec_aux.setDate(fec_aux.getDate() + 1);
            }
            return res;
        })));
        let arr_respuesta = [];
        res_timbre.filter((obj) => {
            return obj.length > 0;
        }).forEach((arr) => {
            arr.forEach((o) => {
                let obj = {
                    fecha: o.fecha,
                    total_timbres: '',
                };
                let arr_EoS = [];
                let arr_AES = [];
                let arrayHorarioEoS = [];
                let arrayHorarioAES = [];
                o.horario.forEach((h) => {
                    let obj2 = {
                        hora_timbre: '',
                    };
                    let diferencia = 0;
                    let dif = 0;
                    switch (h.orden) {
                        case 1:
                            var arr3 = o.timbres.filter((t) => {
                                const hora_timbre = (0, exports.HHMMtoSegundos)(t.fec_hora_timbre.split(' ')[1]);
                                const h_inicio = (0, exports.HHMMtoSegundos)(h.hora) - (0, exports.HHMMtoSegundos)('01:30:00');
                                const h_final = (0, exports.HHMMtoSegundos)(h.hora) + (0, exports.HHMMtoSegundos)('01:59:00');
                                return (h_inicio <= hora_timbre && h_final >= hora_timbre);
                            });
                            obj2.hora_timbre = (arr3.length === 0) ? '' : arr3[0].fec_hora_timbre.split(' ')[1];
                            dif = (obj2.hora_timbre === '') ? 0 : (0, exports.HHMMtoSegundos)(h.hora) - (0, exports.HHMMtoSegundos)(obj2.hora_timbre);
                            diferencia = (dif < 0) ? dif * (-1) : dif;
                            arrayHorarioEoS.push((0, exports.HHMMtoSegundos)(h.hora));
                            arr_EoS.push((0, exports.HHMMtoSegundos)(obj2.hora_timbre));
                            break;
                        case 2:
                            var arr4 = o.timbres.filter((t) => {
                                const hora_timbre = (0, exports.HHMMtoSegundos)(t.fec_hora_timbre.split(' ')[1]);
                                const h_inicio = (0, exports.HHMMtoSegundos)(h.hora) - (0, exports.HHMMtoSegundos)('00:59:00');
                                const h_final = (0, exports.HHMMtoSegundos)(h.hora) + (0, exports.HHMMtoSegundos)('00:59:00');
                                return (h_inicio <= hora_timbre && h_final >= hora_timbre);
                            });
                            obj2.hora_timbre = (arr4.length === 0) ? '' : arr4[0].fec_hora_timbre.split(' ')[1];
                            dif = (obj2.hora_timbre === '') ? 0 : (0, exports.HHMMtoSegundos)(obj2.hora_timbre) - (0, exports.HHMMtoSegundos)(h.hora);
                            diferencia = (dif < 0) ? dif * (-1) : dif;
                            arrayHorarioAES.push((0, exports.HHMMtoSegundos)(h.hora));
                            arr_AES.push((0, exports.HHMMtoSegundos)(obj2.hora_timbre));
                            break;
                        case 3:
                            var arr1 = o.timbres.filter((t) => {
                                const hora_timbre = (0, exports.HHMMtoSegundos)(t.fec_hora_timbre.split(' ')[1]);
                                const h_inicio = (0, exports.HHMMtoSegundos)(h.hora) - (0, exports.HHMMtoSegundos)('00:59:00');
                                const h_final = (0, exports.HHMMtoSegundos)(h.hora) + (0, exports.HHMMtoSegundos)('00:59:00');
                                return (h_inicio <= hora_timbre && h_final >= hora_timbre);
                            });
                            obj2.hora_timbre = (arr1.length === 0) ? '' : arr1[0].fec_hora_timbre.split(' ')[1];
                            dif = (obj2.hora_timbre === '') ? 0 : (0, exports.HHMMtoSegundos)(h.hora) - (0, exports.HHMMtoSegundos)(obj2.hora_timbre);
                            diferencia = (dif < 0) ? dif * (-1) : dif;
                            arrayHorarioAES.push((0, exports.HHMMtoSegundos)(h.hora));
                            arr_AES.push((0, exports.HHMMtoSegundos)(obj2.hora_timbre));
                            break;
                        case 4:
                            var arr2 = o.timbres.filter((t) => {
                                const hora_timbre = (0, exports.HHMMtoSegundos)(t.fec_hora_timbre.split(' ')[1]);
                                const h_inicio = (0, exports.HHMMtoSegundos)(h.hora) - (0, exports.HHMMtoSegundos)('01:59:00');
                                const h_final = (0, exports.HHMMtoSegundos)(h.hora) + (0, exports.HHMMtoSegundos)('01:30:00');
                                return (h_inicio <= hora_timbre && h_final >= hora_timbre);
                            });
                            obj2.hora_timbre = (arr2.length === 0) ? '' : arr2[0].fec_hora_timbre.split(' ')[1];
                            dif = (obj2.hora_timbre === '') ? 0 : (0, exports.HHMMtoSegundos)(obj2.hora_timbre) - (0, exports.HHMMtoSegundos)(h.hora);
                            diferencia = (dif < 0) ? dif * (-1) : dif;
                            arrayHorarioEoS.push((0, exports.HHMMtoSegundos)(h.hora));
                            arr_EoS.push((0, exports.HHMMtoSegundos)(obj2.hora_timbre));
                            break;
                        default:
                            break;
                    }
                });
                // RESTA DE TIEMPO DE LOS TIMBRES ENTRADA Y SALIDA
                let resta_tim_EoS = 0;
                if (parseFloat(arr_EoS[0]) === 0 && parseFloat(arr_EoS[1]) > 0) {
                    resta_tim_EoS = parseFloat(arr_EoS[1]) - parseFloat(arrayHorarioEoS[0]); // salida timbre - entrada horario
                }
                else if (parseFloat(arr_EoS[0]) > 0 && parseFloat(arr_EoS[1]) === 0) {
                    resta_tim_EoS = parseFloat(arrayHorarioEoS[1]) - parseFloat(arr_EoS[0]); //salida horario - entrada timbre
                }
                else if (parseFloat(arr_EoS[0]) > 0 && parseFloat(arr_EoS[1]) > 0) {
                    resta_tim_EoS = parseFloat(arr_EoS[1]) - parseFloat(arr_EoS[0]); //salida timbres - entrada timbre
                }
                // RESTA DE TIEMPO DE LOS TIMBRES ENTRADA Y SALIDA ALMUERZO
                let resta_tim_AES = 0;
                if (parseFloat(arr_AES[0]) === 0 && parseFloat(arr_AES[1]) > 0) {
                    resta_tim_AES = parseFloat(arr_AES[1]) - parseFloat(arrayHorarioAES[0]); // salida timbre A - entrada horario A
                }
                else if (parseFloat(arr_AES[0]) > 0 && parseFloat(arr_AES[1]) === 0) {
                    resta_tim_AES = parseFloat(arrayHorarioAES[1]) - parseFloat(arr_AES[0]); //salida horario A - entrada timbre A
                }
                else if (parseFloat(arr_AES[0]) > 0 && parseFloat(arr_AES[1]) > 0) {
                    resta_tim_AES = parseFloat(arr_AES[1]) - parseFloat(arr_AES[0]); //salida timbres A - entrada timbre A
                }
                let resta_tim = resta_tim_EoS - resta_tim_AES;
                obj.total_timbres = (0, exports.SegundosToHHMM)(resta_tim);
                arr_respuesta.push(obj);
            });
        });
        nuevoArray = [];
        res_timbre = [];
        array = [];
        return arr_respuesta;
    });
};
exports.BuscarTimbresEntradaSinAccionModelado = BuscarTimbresEntradaSinAccionModelado;
const BuscarTimbresEoSModelado = function (fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        var fec_aux = new Date(fec_inicio);
        var fecha1 = (0, moment_1.default)(fec_inicio);
        var fecha2 = (0, moment_1.default)(fec_final);
        var diasHorario = fecha2.diff(fecha1, 'days');
        let fechas_consulta = [];
        for (let i = 0; i <= diasHorario; i++) {
            fechas_consulta.push({ fecha: fec_aux.toJSON().split('T')[0] });
            fec_aux.setDate(fec_aux.getDate() + 1);
        }
        let codigos = yield database_1.default.query('SELECT Distinct id_empleado FROM timbres WHERE CAST(fec_hora_timbre AS VARCHAR) between $1 || \'%\' AND $2 || \'%\' AND accion in (\'EoS\', \'E\', \'S\') ORDER BY id_empleado ASC ', [fec_inicio, fec_final])
            .then(res => {
            return res.rows;
        });
        let nuevo = yield Promise.all(codigos.map((obj) => __awaiter(this, void 0, void 0, function* () {
            let arr = yield Promise.all(fechas_consulta.map((ele) => __awaiter(this, void 0, void 0, function* () {
                return {
                    fecha: ele.fecha,
                    registros: yield database_1.default.query('SELECT CAST(fec_hora_timbre AS VARCHAR), tecl_funcion FROM timbres WHERE CAST(fec_hora_timbre AS VARCHAR) like $1 || \'%\' AND id_empleado = $2 AND accion in (\'EoS\', \'E\', \'S\') ORDER BY fec_hora_timbre ASC ', [ele.fecha, obj.id_empleado])
                        .then(res => {
                        return res.rows;
                    })
                };
            })));
            return {
                id_empleado: obj.id_empleado,
                timbres: arr,
                respuesta: new Array,
                horario: yield database_1.default.query('SELECT dh.hora, dh.orden FROM empl_horarios AS eh, cg_horarios AS h, deta_horarios AS dh ' +
                    'WHERE eh.codigo = $1 AND h.id = eh.id_horarios AND dh.id_horario = h.id AND CAST(eh.fec_inicio AS VARCHAR) between $2 || \'%\' AND $3 || \'%\' ' +
                    'AND CAST(eh.fec_final AS VARCHAR) between $2 || \'%\' AND $3 || \'%\' AND dh.orden in (1, 4)', [obj.id_empleado, fec_inicio, fec_final])
                    .then(res => {
                    return res.rows;
                })
            };
        })));
        nuevo.forEach((obj) => {
            obj.timbres = obj.timbres.filter((ele) => {
                return (ele.registros != 0);
            }).map((ele) => {
                ele.registros.forEach((obj1) => {
                    obj1.fec_hora_timbre = (0, exports.HHMMtoSegundos)(obj1.fec_hora_timbre.split(' ')[1]) / 3600;
                });
                return ele;
            });
            let set = new Set(obj.horario.map((nue) => { return JSON.stringify(nue); }));
            obj.horario = Array.from(set).map((nue) => { return JSON.parse(nue); });
        });
        return nuevo;
    });
};
exports.BuscarTimbresEoSModelado = BuscarTimbresEoSModelado;
const ModelarAtrasos = function (obj, fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(obj);
        try {
            let array = yield database_1.default.query('SELECT dh.hora, dh.minu_espera FROM empl_horarios AS eh, cg_horarios AS h, deta_horarios AS dh ' +
                'WHERE eh.codigo = $1 AND h.id = eh.id_horarios AND dh.id_horario = h.id AND CAST(eh.fec_inicio AS VARCHAR) between $2 || \'%\' AND $3 || \'%\' ' +
                'AND CAST(eh.fec_final AS VARCHAR) between $2 || \'%\' AND $3 || \'%\' AND dh.orden = 1 limit 1', [obj.id_empleado, fec_inicio, fec_final])
                .then(res => { return res.rows; });
            //  console.log('Array del resultado',array);
            if (array.length === 0) {
                return {
                    fecha: obj.fec_hora_timbre,
                    tiempo_atraso: 0,
                };
            }
            return array.map(ele => {
                var timbre = (0, exports.HHMMtoSegundos)(obj.fec_hora_timbre.split(' ')[1]);
                var hora = (0, exports.HHMMtoSegundos)(ele.hora) + ele.minu_espera * 60;
                return {
                    fecha: obj.fec_hora_timbre,
                    tiempo_atraso: (timbre - hora) / 3600
                };
            })[0];
        }
        catch (error) {
            console.log(error);
            return {
                fecha: obj.fec_hora_timbre,
                tiempo_atraso: 0,
            };
        }
    });
};
exports.ModelarAtrasos = ModelarAtrasos;
const ModelarTiempoJornada = function (obj, fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(obj);
        let array = yield database_1.default.query('SELECT dh.hora, dh.orden FROM empl_horarios AS eh, cg_horarios AS h, deta_horarios AS dh ' +
            'WHERE eh.codigo = $1 AND h.id = eh.id_horarios AND dh.id_horario = h.id AND CAST(eh.fec_inicio AS VARCHAR) between $2 || \'%\' AND $3 || \'%\' ' +
            'AND CAST(eh.fec_final AS VARCHAR) between $2 || \'%\' AND $3 || \'%\' AND dh.orden in (1, 4) ', [obj.id_empleado, fec_inicio, fec_final])
            .then(res => { return res.rows; });
        // console.log('Array del resultado',array);
        if (array.length === 0) {
            return {
                fecha: obj.fec_hora_timbre,
                retraso: false
            };
        }
        return array.map(ele => {
            let retraso = false;
            var timbre = (0, exports.HHMMtoSegundos)(obj.fec_hora_timbre.split(' ')[1]);
            var hora = (0, exports.HHMMtoSegundos)(ele.hora) + ele.minu_espera / 60;
            (timbre > hora) ? retraso = true : retraso = false;
            return {
                fecha: obj.fec_hora_timbre,
                retraso: retraso
            };
        })[0];
    });
};
exports.ModelarTiempoJornada = ModelarTiempoJornada;
const ModelarSalidasAnticipadas = function (fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(obj);
        let timbres = yield database_1.default.query('SELECT CAST(fec_hora_timbre AS VARCHAR), id_empleado FROM timbres WHERE CAST(fec_hora_timbre AS VARCHAR) between $1 || \'%\' AND $2 || \'%\' AND accion in (\'EoS\', \'S\') ORDER BY fec_hora_timbre ASC', [fec_inicio, fec_final])
            .then(res => {
            return res.rows;
        });
        let nuevo = yield Promise.all(timbres.map((obj) => __awaiter(this, void 0, void 0, function* () {
            var f = new Date(obj.fec_hora_timbre);
            return {
                fecha: obj.fec_hora_timbre.split(' ')[0],
                hora_timbre: obj.fec_hora_timbre.split(' ')[1],
                codigo: obj.id_empleado,
                diferencia_tiempo: 0,
                hora_salida: yield database_1.default.query('SELECT dt.hora FROM empl_horarios AS eh, cg_horarios AS h, deta_horarios AS dt ' +
                    'WHERE eh.fec_inicio < $1 AND eh.fec_final > $1 AND eh.codigo = $2 AND h.id = eh.id_horarios ' +
                    'AND dt.id_horario = h.id AND dt.orden = 4', [f, obj.id_empleado])
                    .then(res => {
                    return res.rows;
                })
            };
        })));
        timbres = [];
        let array = nuevo.filter(obj => {
            return obj.hora_salida.length != 0;
        }).map((obj) => {
            obj.hora_timbre = (0, exports.HHMMtoSegundos)(obj.hora_timbre) / 3600;
            obj.hora_salida = (0, exports.HHMMtoSegundos)(obj.hora_salida[0].hora) / 3600;
            return obj;
        }).filter(obj => {
            var rango_inicio = obj.hora_salida - 3;
            obj.diferencia_tiempo = obj.hora_salida - obj.hora_timbre;
            return rango_inicio <= obj.hora_timbre && obj.hora_salida > obj.hora_timbre;
        });
        nuevo = [];
        return array;
    });
};
exports.ModelarSalidasAnticipadas = ModelarSalidasAnticipadas;
const ModelarSalidasAnticipadasSinAcciones = function (fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(obj);
        let codigos = yield database_1.default.query('SELECT Distinct id_empleado FROM timbres WHERE CAST(fec_hora_timbre AS VARCHAR) between $1 || \'%\' AND $2 || \'%\' ORDER BY id_empleado ASC ', [fec_inicio, fec_final])
            .then(res => {
            return res.rows;
        });
        let nuevo = yield Promise.all(codigos.map((obj) => __awaiter(this, void 0, void 0, function* () {
            return database_1.default.query('SELECT eh.codigo, dh.hora, dh.orden, dh.id_horario, CAST(eh.fec_inicio AS VARCHAR), CAST(eh.fec_final AS VARCHAR) FROM empl_horarios AS eh, cg_horarios AS h, deta_horarios AS dh ' +
                'WHERE eh.codigo = $1 AND h.id = eh.id_horarios AND dh.id_horario = h.id AND CAST(eh.fec_inicio AS VARCHAR) between $2 || \'%\' AND $3 || \'%\' ' +
                'AND CAST(eh.fec_final AS VARCHAR) between $2 || \'%\' AND $3 || \'%\' AND orden IN (2,4) ORDER BY eh.fec_inicio', [obj.id_empleado, fec_inicio, fec_final])
                .then(res => { return res.rows; });
        })));
        let array = [];
        nuevo.filter(o => {
            return o.length > 0;
        }).forEach(o => {
            o.forEach(e => {
                array.push(e);
            });
        });
        if (array.length === 0)
            return [];
        // console.log('Array Sin Acciones Salidas Antes: ',array);    
        var nuevoArray = [];
        var arrayTemporal = [];
        for (var i = 0; i < array.length; i++) {
            arrayTemporal = nuevoArray.filter((res) => {
                return res["Fecha"] == array[i]["fec_inicio"] + ' ' + array[i]["fec_final"] + ' ' + array[i]["codigo"];
            });
            if (arrayTemporal.length > 0) {
                nuevoArray[nuevoArray.indexOf(arrayTemporal[0])]["Horario"].push(array[i]);
            }
            else {
                nuevoArray.push({ "Fecha": array[i]["fec_inicio"] + ' ' + array[i]["fec_final"] + ' ' + array[i]["codigo"], "Horario": [array[i]] });
            }
        }
        nuevoArray.sort(compareFechas);
        let res_timbre = yield Promise.all(nuevoArray.map((obj) => __awaiter(this, void 0, void 0, function* () {
            var fec_aux = new Date(obj.Fecha.split(' ')[0]);
            var fecha1 = (0, moment_1.default)(obj.Fecha.split(' ')[0]);
            var fecha2 = (0, moment_1.default)(obj.Fecha.split(' ')[1]);
            const codigo = obj.Fecha.split(' ')[2];
            var diasDiferencia = fecha2.diff(fecha1, 'days');
            let res = [];
            for (let i = 0; i <= diasDiferencia; i++) {
                let horario_res = {
                    fecha: fec_aux.toJSON().split('T')[0],
                    timbres: yield BuscarTimbresSinAccionesReporte(fec_aux.toJSON().split('T')[0], codigo),
                    horario: obj.Horario.sort(compareOrden)
                };
                // console.log('Horarios Timbres Res:',horario_res.timbres);
                if (horario_res.timbres.length > 0) {
                    res.push(horario_res);
                }
                fec_aux.setDate(fec_aux.getDate() + 1);
            }
            return res;
        })));
        let arr_respuesta = [];
        res_timbre.filter((obj) => {
            return obj.length > 0;
        }).forEach((arr) => {
            arr.forEach((o) => {
                let obj = {
                    fecha: o.fecha,
                    total_timbres: '',
                };
                let sal_antes_almuerzo = 0;
                let sal_antes_laboral = 0;
                o.horario.forEach((h) => {
                    let obj2 = {
                        hora_timbre: '',
                    };
                    let diferencia = 0;
                    let dif = 0;
                    switch (h.orden) {
                        case 2:
                            let arr2 = o.timbres.filter((t) => {
                                console.log('timbre sin filtro: ', t.fec_hora_timbre, ' || ', h.hora);
                                const hora = (0, exports.HHMMtoSegundos)(h.hora);
                                const hora_timbre = (0, exports.HHMMtoSegundos)(t.fec_hora_timbre.split(' ')[1]);
                                const h_inicio = hora - (0, exports.HHMMtoSegundos)('00:59:00');
                                const h_final = hora;
                                return (h_inicio <= hora_timbre && h_final >= hora_timbre);
                            });
                            console.log('ARR 2', arr2, h.hora);
                            obj2.hora_timbre = (arr2.length === 0) ? '' : arr2[0].fec_hora_timbre.split(' ')[1];
                            dif = (obj2.hora_timbre === '') ? 0 : (0, exports.HHMMtoSegundos)(obj2.hora_timbre) - (0, exports.HHMMtoSegundos)(h.hora);
                            if (dif < 0) {
                                diferencia = dif * (-1);
                                console.log(diferencia);
                                sal_antes_almuerzo = diferencia;
                            }
                            break;
                        case 4:
                            let arr4 = o.timbres.filter((t) => {
                                console.log('timbre sin filtro: ', t.fec_hora_timbre, ' || ', h.hora);
                                const hora = (0, exports.HHMMtoSegundos)(h.hora);
                                const hora_timbre = (0, exports.HHMMtoSegundos)(t.fec_hora_timbre.split(' ')[1]);
                                const h_inicio = hora - (0, exports.HHMMtoSegundos)('00:59:00');
                                const h_final = hora;
                                return (h_inicio <= hora_timbre && h_final >= hora_timbre);
                            });
                            console.log('ARR 4', arr4, h.hora);
                            obj2.hora_timbre = (arr4.length === 0) ? '' : arr4[0].fec_hora_timbre.split(' ')[1];
                            dif = (obj2.hora_timbre === '') ? 0 : (0, exports.HHMMtoSegundos)(obj2.hora_timbre) - (0, exports.HHMMtoSegundos)(h.hora);
                            if (dif < 0) {
                                diferencia = dif * (-1);
                                console.log(diferencia);
                                sal_antes_laboral = diferencia;
                            }
                            break;
                        default: break;
                    }
                });
                const suma = sal_antes_almuerzo + sal_antes_laboral;
                console.log('SUMA:', suma);
                obj.total_timbres = (0, exports.SegundosToHHMM)(suma);
                arr_respuesta.push(obj);
            });
        });
        nuevoArray = [];
        res_timbre = [];
        array = [];
        return arr_respuesta;
    });
};
exports.ModelarSalidasAnticipadasSinAcciones = ModelarSalidasAnticipadasSinAcciones;
/**
 * SUBMETODOS PARA LAS GRAFICAS DE EMPLEADOS INDIVIDUALEMTNE
 */
const Empleado_HoraExtra_ModelarDatos = function (codigo, fec_desde, fec_hasta) {
    return __awaiter(this, void 0, void 0, function* () {
        let horas_extras = yield EmpleadoHorasExtrasGrafica(codigo, fec_desde, fec_hasta);
        console.log('Lista de horas extras ===', horas_extras);
        let array = horas_extras.map((obj) => {
            (obj.tiempo_autorizado === 0) ? obj.tiempo_autorizado = obj.num_hora : obj.tiempo_autorizado = obj.tiempo_autorizado;
            return obj;
        });
        // console.log('Lista de array ===', array);
        let nuevo = [];
        array.forEach(obj => {
            let respuesta = DiasIterados(obj.fec_inicio, obj.fec_final, obj.tiempo_autorizado, obj.id_empl_cargo, obj.codigo);
            respuesta.forEach(ele => {
                nuevo.push(ele);
            });
        });
        // console.log('Lista de Nuevo ===', nuevo);    
        return nuevo;
    });
};
exports.Empleado_HoraExtra_ModelarDatos = Empleado_HoraExtra_ModelarDatos;
function EmpleadoHorasExtrasGrafica(codigo, fec_desde, fec_hasta) {
    return __awaiter(this, void 0, void 0, function* () {
        let arrayUno = yield EmpleadoHorasExtrasSolicitadasGrafica(codigo, fec_desde, fec_hasta);
        let arrayDos = yield EmpleadoPlanificacionHorasExtrasSolicitadasGrafica(codigo, fec_desde, fec_hasta);
        // let arrayUnido  = [...new Set(arrayUno.concat(arrayDos))];  
        let arrayUnido = arrayUno.concat(arrayDos);
        let set = new Set(arrayUnido.map(obj => { return JSON.stringify(obj); }));
        arrayUnido = Array.from(set).map(obj => { return JSON.parse(obj); });
        for (let j = 0; j < arrayUnido.length; j++) {
            let numMin;
            let i = numMin = j;
            for (++i; i < arrayUnido.length; i++) {
                (arrayUnido[i].fec_inicio < arrayUnido[numMin].fec_inicio) && (numMin = i);
            }
            [arrayUnido[j], arrayUnido[numMin]] = [arrayUnido[numMin], arrayUnido[j]];
        }
        return arrayUnido;
    });
}
function EmpleadoHorasExtrasSolicitadasGrafica(codigo, fec_desde, fec_hasta) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query('SELECT h.fec_inicio, h.fec_final, h.descripcion, h.num_hora, h.tiempo_autorizado, h.codigo, h.id_empl_cargo ' +
            'FROM hora_extr_pedidos AS h WHERE h.fec_inicio between $1 and $2 AND h.estado = 3 ' + // estado = 3 significa q las horas extras fueron autorizadas
            'AND h.fec_final between $1 and $2 AND h.codigo = $3 ORDER BY h.fec_inicio', [fec_desde, fec_hasta, codigo])
            .then(result => {
            return Promise.all(result.rows.map((obj) => __awaiter(this, void 0, void 0, function* () {
                var f1 = new Date(obj.fec_inicio);
                var f2 = new Date(obj.fec_final);
                f1.setUTCHours(f1.getUTCHours() - 5);
                f2.setUTCHours(f2.getUTCHours() - 5);
                const hora_inicio = (0, exports.HHMMtoSegundos)(f1.toJSON().split('T')[1].split('.')[0]) / 3600;
                const hora_final = (0, exports.HHMMtoSegundos)(f2.toJSON().split('T')[1].split('.')[0]) / 3600;
                f1.setUTCHours(f1.getUTCHours() - 5);
                f2.setUTCHours(f2.getUTCHours() - 5);
                return {
                    id_empl_cargo: obj.id_empl_cargo,
                    hora_inicio: hora_inicio,
                    hora_final: hora_final,
                    fec_inicio: new Date(f1.toJSON().split('.')[0]),
                    fec_final: new Date(f2.toJSON().split('.')[0]),
                    descripcion: obj.descripcion,
                    num_hora: (0, exports.HHMMtoSegundos)(obj.num_hora) / 3600,
                    tiempo_autorizado: (0, exports.HHMMtoSegundos)(obj.tiempo_autorizado) / 3600,
                    codigo: obj.codigo
                };
            })));
        });
    });
}
function EmpleadoPlanificacionHorasExtrasSolicitadasGrafica(codigo, fec_desde, fec_hasta) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query('SELECT h.fecha_desde, h.hora_inicio, h.fecha_hasta, h.hora_fin, h.descripcion, h.horas_totales, ph.tiempo_autorizado, ph.codigo, ph.id_empl_cargo ' +
            'FROM plan_hora_extra_empleado AS ph, plan_hora_extra AS h WHERE ph.id_plan_hora = h.id AND ph.estado = 3 ' + //estado = 3 para horas extras autorizadas
            'AND h.fecha_desde between $1 and $2 AND h.fecha_hasta between $1 and $2 AND ph.codigo = $3 ORDER BY h.fecha_desde', [fec_desde, fec_hasta, codigo])
            .then(result => {
            return Promise.all(result.rows.map((obj) => __awaiter(this, void 0, void 0, function* () {
                var f1 = new Date(obj.fecha_desde.toJSON().split('T')[0] + 'T' + obj.hora_inicio);
                var f2 = new Date(obj.fecha_hasta.toJSON().split('T')[0] + 'T' + obj.hora_fin);
                f1.setUTCHours(f1.getUTCHours() - 5);
                f2.setUTCHours(f2.getUTCHours() - 5);
                const hora_inicio = (0, exports.HHMMtoSegundos)(f1.toJSON().split('T')[1].split('.')[0]) / 3600;
                const hora_final = (0, exports.HHMMtoSegundos)(f2.toJSON().split('T')[1].split('.')[0]) / 3600;
                f1.setUTCHours(f1.getUTCHours() - 5);
                f2.setUTCHours(f2.getUTCHours() - 5);
                return {
                    id_empl_cargo: obj.id_empl_cargo,
                    hora_inicio: hora_inicio,
                    hora_final: hora_final,
                    fec_inicio: new Date(f1.toJSON().split('.')[0]),
                    fec_final: new Date(f2.toJSON().split('.')[0]),
                    descripcion: obj.descripcion,
                    num_hora: (0, exports.HHMMtoSegundos)(obj.horas_totales) / 3600,
                    tiempo_autorizado: (0, exports.HHMMtoSegundos)(obj.tiempo_autorizado) / 3600,
                    codigo: obj.codigo
                };
            })));
        });
    });
}
const Empleado_Vacaciones_ModelarDatos = function (codigo, fec_desde, fec_hasta) {
    return __awaiter(this, void 0, void 0, function* () {
        let vacaciones = yield database_1.default.query('SELECT CAST(fec_inicio AS VARCHAR), CAST(fec_final AS VARCHAR) FROM vacaciones WHERE codigo = $1 AND fec_inicio between $2 and $3 AND estado = 3 ', [codigo, fec_desde, fec_hasta]).then(result => { return result.rows; });
        // console.log('Lista de vacaciones ===', vacaciones);
        let aux_array = [];
        vacaciones.forEach(obj => {
            var fec_aux = new Date(obj.fec_inicio);
            var fecha1 = (0, moment_1.default)(obj.fec_inicio.split(" ")[0]);
            var fecha2 = (0, moment_1.default)(obj.fec_final.split(" ")[0]);
            var diasHorario = fecha2.diff(fecha1, 'days') + 1;
            for (let i = 0; i < diasHorario; i++) {
                let horario_res = {
                    fecha: fec_aux.toJSON().split('T')[0],
                    n_dia: 1
                };
                aux_array.push(horario_res);
                fec_aux.setDate(fec_aux.getDate() + 1);
            }
        });
        // console.log('Lista array fechas: ',aux_array);    
        return aux_array;
    });
};
exports.Empleado_Vacaciones_ModelarDatos = Empleado_Vacaciones_ModelarDatos;
const Empleado_Permisos_ModelarDatos = function (codigo, fec_desde, fec_hasta) {
    return __awaiter(this, void 0, void 0, function* () {
        let permisos = yield database_1.default.query('SELECT CAST(fec_inicio AS VARCHAR), CAST(fec_final AS VARCHAR), hora_numero, dia FROM permisos WHERE codigo = $1 AND fec_inicio between $2 and $3 AND estado = 3 ', [codigo, fec_desde, fec_hasta]).then(result => { return result.rows; });
        // console.log('Lista de permisos ===', permisos);
        let aux_array = [];
        permisos.forEach(obj => {
            var fec_aux = new Date(obj.fec_inicio);
            var fecha1 = (0, moment_1.default)(obj.fec_inicio.split(" ")[0]);
            var fecha2 = (0, moment_1.default)(obj.fec_final.split(" ")[0]);
            var diasHorario = fecha2.diff(fecha1, 'days') + 1;
            for (let i = 0; i < diasHorario; i++) {
                let horario_res = {
                    fecha: fec_aux.toJSON().split('T')[0],
                    tiempo: (obj.dia + ((0, exports.HHMMtoSegundos)(obj.hora_numero) / 3600)) / diasHorario,
                };
                aux_array.push(horario_res);
                fec_aux.setDate(fec_aux.getDate() + 1);
            }
        });
        // console.log('Lista array fechas: ',aux_array);    
        return aux_array;
    });
};
exports.Empleado_Permisos_ModelarDatos = Empleado_Permisos_ModelarDatos;
const Empleado_Atrasos_ModelarDatos = function (codigo, fec_desde, fec_hasta) {
    return __awaiter(this, void 0, void 0, function* () {
        let timbres = yield database_1.default.query('SELECT CAST(fec_hora_timbre AS VARCHAR), id_empleado FROM timbres WHERE CAST(fec_hora_timbre AS VARCHAR) between $1 || \'%\' AND $2 || \'%\' AND accion in (\'EoS\',\'E\') AND id_empleado = $3 ORDER BY fec_hora_timbre ASC ', [fec_desde, fec_hasta, codigo])
            .then(res => {
            return res.rows;
        });
        // console.log('Lista de timbres ===', timbres);
        let array = yield Promise.all(timbres.map((obj) => __awaiter(this, void 0, void 0, function* () {
            return yield (0, exports.ModelarAtrasos)(obj, fec_desde.toJSON().split('T')[0], fec_hasta.toJSON().split('T')[0]);
        })));
        // console.log('ARRAY ===', array);
        return array;
    });
};
exports.Empleado_Atrasos_ModelarDatos = Empleado_Atrasos_ModelarDatos;
const Empleado_Atrasos_ModelarDatos_SinAcciones = function (codigo, fec_desde, fec_hasta) {
    return __awaiter(this, void 0, void 0, function* () {
        const orden = 1;
        const horarioEntrada = yield database_1.default.query('SELECT dt.hora, dt.minu_espera, CAST(eh.fec_inicio AS VARCHAR), CAST(eh.fec_final AS VARCHAR), ' +
            'eh.lunes, eh.martes, eh.miercoles, eh.jueves, eh.viernes, eh.sabado, eh.domingo ' +
            'FROM empl_horarios AS eh, cg_horarios AS ch, deta_horarios AS dt ' +
            'WHERE dt.orden = $1 AND eh.fec_inicio BETWEEN $2 AND $3 AND eh.fec_final BETWEEN $2 AND $3 ' +
            'AND eh.id_horarios = ch.id AND ch.id = dt.id_horario AND eh.codigo = $4', [orden, fec_desde, fec_hasta, codigo])
            .then(result => { return result.rows; });
        if (horarioEntrada.length === 0)
            return [0];
        // console.log(horarioEntrada);
        let nuevo = [];
        let aux = yield Promise.all(horarioEntrada.map((obj) => __awaiter(this, void 0, void 0, function* () {
            let fechas = (0, exports.ModelarFechas)(obj.fec_inicio, obj.fec_final, obj);
            const hora_seg = (0, exports.HHMMtoSegundos)(obj.hora) + (obj.minu_espera * 60);
            let timbres = yield Promise.all(fechas.map((o) => __awaiter(this, void 0, void 0, function* () {
                var f_inicio = o.fecha + ' ' + (0, exports.SegundosToHHMM)(hora_seg);
                var f_final = o.fecha + ' ' + (0, exports.SegundosToHHMM)(hora_seg + (0, exports.HHMMtoSegundos)('02:00:00'));
                // console.log( f_inicio, ' || ', f_final, ' || ', codigo);
                const query = 'SELECT CAST(fec_hora_timbre AS VARCHAR) from timbres where fec_hora_timbre >= TO_TIMESTAMP(\'' + f_inicio + '\'' + ', \'YYYY-MM-DD HH24:MI:SS\') ' +
                    'and fec_hora_timbre <= TO_TIMESTAMP(\'' + f_final + '\'' + ', \'YYYY-MM-DD HH24:MI:SS\') and id_empleado = ' + codigo + ' order by fec_hora_timbre';
                // console.log(query);
                return yield database_1.default.query(query)
                    .then(res => {
                    if (res.rowCount === 0) {
                        return 0;
                    }
                    else {
                        const h_timbre = res.rows[0].fec_hora_timbre.split(' ')[1];
                        const t_tim = (0, exports.HHMMtoSegundos)(h_timbre);
                        return {
                            fecha: res.rows[0].fec_hora_timbre.split(' ')[0],
                            tiempo_atraso: (t_tim - hora_seg) / 3600
                        };
                    }
                });
            })));
            return timbres;
        })));
        aux.forEach(obj => {
            if (obj.length > 0) {
                obj.forEach((o) => {
                    if (o.tiempo_atraso > 0) {
                        nuevo.push(o);
                    }
                });
            }
        });
        return nuevo;
    });
};
exports.Empleado_Atrasos_ModelarDatos_SinAcciones = Empleado_Atrasos_ModelarDatos_SinAcciones;
const SegundosToHHMM = function (dato) {
    // console.log('Hora decimal a HHMM ======>',dato);
    var h = Math.floor(dato / 3600);
    var m = Math.floor((dato % 3600) / 60);
    var s = dato % 60;
    if (h <= -1) {
        return '00:00:00';
    }
    let hora = (h >= 10) ? h : '0' + h;
    let min = (m >= 10) ? m : '0' + m;
    let seg = (s >= 10) ? s : '0' + s;
    return hora + ':' + min + ':' + seg;
};
exports.SegundosToHHMM = SegundosToHHMM;
const ModelarFechas = function (desde, hasta, horario) {
    let fechasRango = {
        inicio: desde,
        final: hasta
    };
    let objeto = DiasConEstado(horario, fechasRango);
    // console.log('Objeto JSON: ', objeto);
    return objeto.filter(obj => { return (obj.estado === false); }).map(obj => { return { fecha: obj.fecha }; });
};
exports.ModelarFechas = ModelarFechas;
/**
 * Mezcla el horario y las fechas para obtener los dias con su estado: TRUE=dia libre || FALSE=dia laborable
 * @param horario Es el horario del empleado
 * @param rango Rango de fecha de inicio y final
 * @returns Un Array de objetos.
 */
function DiasConEstado(horario, rango) {
    var fec_aux = new Date(rango.inicio);
    var fecha1 = (0, moment_1.default)(rango.inicio);
    var fecha2 = (0, moment_1.default)(rango.final);
    var diasHorario = fecha2.diff(fecha1, 'days');
    let respuesta = [];
    for (let i = 0; i <= diasHorario; i++) {
        let horario_res = fechaIterada(fec_aux, horario);
        respuesta.push(horario_res);
        fec_aux.setDate(fec_aux.getDate() + 1);
    }
    return respuesta;
}
/**
 * Funcion se utiliza en un Ciclo For de un rango de fechas.
 * @param fechaIterada Dia de un ciclo for
 * @param horario Es el horario del empleado
 * @returns Retorna objeto de fecha con su estado true si el dia es libre y false si el dia trabaja.
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
const BuscarTimbresSinAccionesReporte = function (fecha, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query('SELECT CAST(fec_hora_timbre AS VARCHAR) FROM timbres WHERE CAST(fec_hora_timbre AS VARCHAR) like $1 || \'%\' AND id_empleado = $2 ORDER BY fec_hora_timbre ASC ', [fecha, codigo])
            .then(res => {
            return res.rows;
        });
    });
};
function compareFechas(a, b) {
    var uno = new Date(a.fecha);
    var dos = new Date(b.fecha);
    if (uno < dos)
        return -1;
    if (uno > dos)
        return 1;
    return 0;
}
function compareOrden(a, b) {
    if (a.orden < b.orden)
        return -1;
    if (a.orden > b.orden)
        return 1;
    return 0;
}
