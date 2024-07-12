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
exports.ModelarFechas = exports.SegundosToHHMM = exports.Empleado_Permisos_ModelarDatos = exports.Empleado_Vacaciones_ModelarDatos = exports.Empleado_HoraExtra_ModelarDatos = exports.BuscarTimbresEntradas = exports.SumarValoresArray = exports.HHMMtoSegundos = exports.HoraExtra_ModelarDatos = exports.BuscarHorasExtras = exports.BuscarPermisosJustificados = exports.BuscarTimbresByCodigo_Fecha = exports.BuscarTimbresByFecha = void 0;
const database_1 = __importDefault(require("../database"));
const moment_1 = __importDefault(require("moment"));
const BuscarTimbresByFecha = function (fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query(`
        SELECT fecha_hora_timbre 
        FROM eu_timbres 
        WHERE CAST(fecha_hora_timbre AS VARCHAR) BETWEEN $1 || \'%\' AND $2 || \'%\' 
        ORDER BY fecha_hora_timbre ASC
        `, [fec_inicio, fec_final])
            .then(res => {
            return res.rows;
        });
    });
};
exports.BuscarTimbresByFecha = BuscarTimbresByFecha;
const BuscarTimbresByCodigo_Fecha = function (codigo, horario) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield Promise.all(horario.map((obj) => __awaiter(this, void 0, void 0, function* () {
            return {
                fecha: obj.fecha,
                timbresTotal: yield database_1.default.query(`
                SELECT fecha_hora_timbre 
                FROM eu_timbres 
                WHERE CAST(fecha_hora_timbre AS VARCHAR) LIKE $1 || \'%\' AND codigo = $2 
                ORDER BY fecha_hora_timbre ASC
                `, [obj.fecha, codigo])
                    .then(res => {
                    return res.rowCount;
                })
            };
        })));
    });
};
exports.BuscarTimbresByCodigo_Fecha = BuscarTimbresByCodigo_Fecha;
const BuscarPermisosJustificados = function (id_empleado, fecha) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query(`
        SELECT fecha_inicio, descripcion 
        FROM mp_solicitud_permiso 
        WHERE id_empleado = $1 AND fecha_inicio::TIMESTAMP::DATE <= $2 AND fecha_final::TIMESTAMP::DATE >= $2 AND estado = 3
        `, [id_empleado, fecha + ''])
            .then(result => {
            return result.rowCount;
        });
    });
};
exports.BuscarPermisosJustificados = BuscarPermisosJustificados;
const BuscarHorasExtras = function (fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query(`
        SELECT fecha_hora_timbre 
        FROM eu_timbres 
        WHERE CAST(fecha_hora_timbre AS VARCHAR) between $1 || \'%\' AND $2 || \'%\' 
        ORDER BY fecha_hora_timbre ASC
        `, [fec_inicio, fec_final])
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
        array.forEach((obj) => {
            let respuesta = DiasIterados(obj.fec_inicio, obj.fec_final, obj.tiempo_autorizado, obj.id_empl_cargo, obj.codigo);
            respuesta.forEach((ele) => {
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
        let set = new Set(arrayUnido.map((obj) => { return JSON.stringify(obj); }));
        arrayUnido = Array.from(set).map((obj) => { return JSON.parse(obj); });
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
        return yield database_1.default.query(
        // estado = 3 significa q las horas extras fueron autorizadas
        `
        SELECT CAST(h.fecha_inicio AS VARCHAR), CAST(h.fecha_final AS VARCHAR), h.descripcion, h.horas_solicitud, 
            h.tiempo_autorizado, e.codigo, h.id_empleado_cargo 
        FROM mhe_solicitud_hora_extra AS h, eu_empleados AS e 
        WHERE h.fecha_inicio BETWEEN $1 and $2 AND h.estado = 3   
            AND h.fecha_final BETWEEN $1 and $2 ORDER BY h.fecha_inicio AND e.id = h.id_empleado_solicita
        `, [fec_desde, fec_hasta])
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
        return yield database_1.default.query(
        //estado = 3 para horas extras autorizadas
        `
        SELECT CAST(h.fecha_desde AS VARCHAR), CAST(h.hora_inicio AS VARCHAR), h.fecha_hasta, h.hora_fin, h.descripcion,
            h.horas_totales, ph.tiempo_autorizado, ph.codigo, ph.id_empleado_cargo 
        FROM mhe_empleado_plan_hora_extra AS ph, mhe_detalle_plan_hora_extra AS h 
        WHERE ph.id_detalle_plan = h.id AND ph.estado = 3 
            AND h.fecha_desde BETWEEN $1 and $2 AND h.fecha_hasta BETWEEN $1 and $2 
        ORDER BY h.fecha_desde
        `, [fec_desde, fec_hasta])
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
        return yield database_1.default.query(`
        SELECT CAST(fecha_hora_timbre AS VARCHAR), id_empleado 
        FROM eu_timbres 
        WHERE CAST(fecha_hora_timbre AS VARCHAR) BETWEEN $1 || \'%\' AND $2 || \'%\' 
            AND accion in (\'EoS\', \'E\') 
        ORDER BY fecha_hora_timbre ASC 
        `, [fec_inicio, fec_final])
            .then(res => {
            return res.rows;
        });
    });
};
exports.BuscarTimbresEntradas = BuscarTimbresEntradas;
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
        array.forEach((obj) => {
            let respuesta = DiasIterados(obj.fec_inicio, obj.fec_final, obj.tiempo_autorizado, obj.id_empl_cargo, obj.codigo);
            respuesta.forEach((ele) => {
                nuevo.push(ele);
            });
        });
        // console.log('Lista de Nuevo ===', nuevo);    
        return nuevo;
    });
};
exports.Empleado_HoraExtra_ModelarDatos = Empleado_HoraExtra_ModelarDatos;
function EmpleadoHorasExtrasGrafica(id, fec_desde, fec_hasta) {
    return __awaiter(this, void 0, void 0, function* () {
        let arrayUno = yield EmpleadoHorasExtrasSolicitadasGrafica(id, fec_desde, fec_hasta);
        let arrayDos = yield EmpleadoPlanificacionHorasExtrasSolicitadasGrafica(id, fec_desde, fec_hasta);
        // let arrayUnido  = [...new Set(arrayUno.concat(arrayDos))];  
        let arrayUnido = arrayUno.concat(arrayDos);
        let set = new Set(arrayUnido.map((obj) => { return JSON.stringify(obj); }));
        arrayUnido = Array.from(set).map((obj) => { return JSON.parse(obj); });
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
        return yield database_1.default.query(
        // estado = 3 significa q las horas extras fueron autorizadas
        `
        SELECT h.fecha_inicio, h.fecha_final, h.descripcion, h.horas_solicitud, h.tiempo_autorizado, e.codigo,
            h.id_empleado_cargo 
        FROM mhe_solicitud_hora_extra AS h, eu_empleados AS e 
        WHERE h.fecha_inicio between $1 and $2 AND h.estado = 3
            AND h.fecha_final between $1 and $2 AND h.id_empleado_solicita = $3 AND e.id = h.id_empleado_solicita
        ORDER BY h.fecha_inicio
        `, [fec_desde, fec_hasta, codigo])
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
function EmpleadoPlanificacionHorasExtrasSolicitadasGrafica(id_empleado, fec_desde, fec_hasta) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query(
        //estado = 3 para horas extras autorizadas
        `
        SELECT h.fecha_desde, h.hora_inicio, h.fecha_hasta, h.hora_fin, h.descripcion, h.horas_totales, 
            ph.tiempo_autorizado, ph.codigo, ph.id_empleado_cargo, e.codigo 
        FROM mhe_empleado_plan_hora_extra AS ph, mhe_detalle_plan_hora_extra AS h, eu_empleados AS e 
        WHERE ph.id_detalle_plan = h.id AND ph.estado = 3 AND h.fecha_desde BETWEEN $1 AND $2 
            AND h.fecha_hasta BETWEEN $1 and $2 AND ph.id_empleado_realiza = $3 AND e.id = ph.id_empleado_realiza 
        ORDER BY h.fecha_desde
        `, [fec_desde, fec_hasta, id_empleado])
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
const Empleado_Vacaciones_ModelarDatos = function (id_empleado, fec_desde, fec_hasta) {
    return __awaiter(this, void 0, void 0, function* () {
        let vacaciones = yield database_1.default.query(`
        SELECT CAST(fecha_inicio AS VARCHAR), CAST(fecha_final AS VARCHAR) 
        FROM mv_solicitud_vacacion WHERE id_empleado = $1 AND fecha_inicio BETWEEN $2 AND $3 AND estado = 3
        `, [id_empleado, fec_desde, fec_hasta]).then(result => { return result.rows; });
        // console.log('Lista de vacaciones ===', vacaciones);
        let aux_array = [];
        vacaciones.forEach((obj) => {
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
const Empleado_Permisos_ModelarDatos = function (id_empleado, fec_desde, fec_hasta) {
    return __awaiter(this, void 0, void 0, function* () {
        let permisos = yield database_1.default.query(`
        SELECT CAST(fecha_inicio AS VARCHAR), CAST(fecha_final AS VARCHAR), horas_permiso, dias_permiso 
        FROM mp_solicitud_permiso WHERE id_empleado = $1 AND fec_inicio BETWEEN $2 and $3 AND estado = 3
        `, [id_empleado, fec_desde, fec_hasta]).then(result => { return result.rows; });
        // console.log('Lista de permisos ===', permisos);
        let aux_array = [];
        permisos.forEach((obj) => {
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
    return objeto.filter(obj => { return (obj.estado === false); }).map((obj) => { return { fecha: obj.fecha }; });
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
