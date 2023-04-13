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
exports.GenerarHoraExtraCalulo = exports.CalcularHoraExtra = void 0;
const database_1 = __importDefault(require("../database"));
const SubMetodosGraficas_1 = require("./SubMetodosGraficas");
const DIAS_MES = 30;
const CalcularHoraExtra = function (id_empleado, fec_desde, fec_hasta) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(id_empleado, fec_desde, fec_hasta);
        let codigo;
        try {
            let [code] = yield database_1.default.query('SELECT codigo FROM empleados WHERE id = $1', [id_empleado]).then(result => { return result.rows; });
            if (code === undefined)
                return { mensaje: 'El empleado no tiene un codigo asignado.' };
            codigo = parseInt(code.codigo);
            console.log('Codigo: ', codigo);
            let ids = yield CargoContratoByFecha(id_empleado, fec_desde, fec_hasta);
            console.log('Contrato y cargo', ids);
            if (ids[0].message) {
                return ids[0];
            }
            let cg_horas_extras = yield CatalogoHorasExtras();
            console.log('Catalgo Horas Extras', cg_horas_extras);
            let horas_extras = yield Promise.all(ids.map((obj) => __awaiter(this, void 0, void 0, function* () {
                return yield ListaHorasExtras(cg_horas_extras, codigo, obj.id_cargo, fec_desde, fec_hasta, parseInt(obj.sueldo), obj.hora_trabaja);
            })));
            // let feriados = await Promise.all(ids.map(async(obj) => {
            //     return await FeriadosPorIdCargo(obj.id_cargo, fec_desde, fec_hasta)
            // }))
            console.log('Lista de horas extras ===', horas_extras[0]);
            // console.log('Lista de feriados ===', feriados[0]);
            let ArrayDatos = {
                info: ids,
                detalle: horas_extras[0].map((obj) => {
                    return {
                        fec_inicio: obj.fec_inicio,
                        fec_final: obj.fec_final,
                        descripcion: obj.descripcion,
                        total_horas: obj.tiempo_autorizado || obj.num_hora,
                        porcentaje: obj.valores_calculos[0].reca_porcentaje,
                        valor_recargo: obj.calculos[0].valor_recargo,
                        valor_hora_total: obj.calculos[0].valor_hora_total,
                        valor_pago: obj.calculos[0].valor_pago
                    };
                }),
                total: {
                    total_pago_hx: SumaValorPagoEmpleado(horas_extras[0]),
                    total_sueldo: SumaValorPagoEmpleado(horas_extras[0]) + parseInt(ids[0].sueldo)
                }
            };
            return ArrayDatos;
        }
        catch (error) {
            console.log(error);
            return error;
        }
    });
};
exports.CalcularHoraExtra = CalcularHoraExtra;
function FeriadosPorIdCargo(id_cargo, fec_desde, fec_hasta) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query('SELECT f.fecha, f.fec_recuperacion, f.descripcion FROM empl_cargos AS ec, sucursales AS s, ciudades AS c, ' +
            'ciud_feriados AS cf, cg_feriados AS f WHERE ec.id = $1 AND ec.id_sucursal = s.id AND s.id_ciudad = c.id AND ' +
            'cf.id_ciudad = s.id AND f.id = cf.id_feriado AND f.fecha between $2 and $3', [id_cargo, fec_desde, fec_hasta])
            .then((result) => { return result.rows; });
    });
}
function SumaValorPagoEmpleado(horas_extras) {
    let sumador = 0;
    horas_extras.forEach(obj => {
        console.log('Valor pago', obj.calculos[0].valor_pago);
        sumador = sumador + obj.calculos[0].valor_pago;
    });
    return sumador;
}
function ListaHorasExtras(cg_horas_extras, codigo, id_cargo, fec_desde, fec_hasta, sueldo, horas_trabaja) {
    return __awaiter(this, void 0, void 0, function* () {
        let arrayUno = yield HorasExtrasSolicitadas(codigo, id_cargo, fec_desde, fec_hasta);
        let arrayDos = yield PlanificacionHorasExtrasSolicitadas(codigo, id_cargo, fec_desde, fec_hasta);
        console.log('array uno ===', arrayUno);
        console.log('array dos ===', arrayDos);
        let arrayUnido = arrayUno.concat(arrayDos);
        for (let j = 0; j < arrayUnido.length; j++) {
            let numMin;
            let i = numMin = j;
            for (++i; i < arrayUnido.length; i++) {
                (arrayUnido[i].fec_inicio < arrayUnido[numMin].fec_inicio) && (numMin = i);
            }
            [arrayUnido[j], arrayUnido[numMin]] = [arrayUnido[numMin], arrayUnido[j]];
        }
        // console.log('***************** array unido *****************');
        const valor_dia = sueldo / 30;
        const valor_hora = valor_dia / horas_trabaja;
        arrayUnido.forEach((obj) => {
            obj.valores_calculos = cg_horas_extras.filter((res) => {
                if (obj.nocturno === true) {
                    return res;
                }
                if (obj.dia_semana >= 1 && obj.dia_semana <= 5 && res.tipo_dia == 'N') {
                    if (res.hora_inicio <= obj.hora_inicio && res.hora_final >= obj.hora_final) {
                        return res;
                    }
                }
            });
        });
        /** TIPO DE FUNCION
         *  1. calcular horas jornada nocturna 25%;
         *  2. calcular horas suplementarias de 50% y 100%;
         *  3. calcular horas extraordinarias;
         */
        arrayUnido.forEach((obj) => {
            obj.calculos = obj.valores_calculos.map((res) => {
                if (res.tipo_funcion === 1) {
                    // console.log('funcion 1');
                    return 0;
                }
                else if (res.tipo_funcion === 2) {
                    // console.log('funcion 2');
                    return HorasSuplementarias(valor_dia, valor_hora, obj.tiempo_autorizado || obj.num_hora, res.reca_porcentaje);
                }
                else if (res.tipo_funcion === 3) {
                    // console.log('funcion 3');
                    return 0;
                }
            }) || 0;
        });
        return arrayUnido;
    });
}
function HorasSuplementarias(valor_dia, valor_hora, num_hora, porcentaje) {
    const vr = porcentaje * valor_hora;
    const vht = valor_hora + vr;
    console.log(num_hora);
    const vp = vht * num_hora;
    console.log(vr, vht, vp);
    return {
        valor_dia: valor_dia,
        valor_hora: valor_hora,
        valor_recargo: vr,
        valor_hora_total: vht,
        valor_pago: vp
    };
}
function HorasExtrasSolicitadas(id_empleado, id_cargo, fec_desde, fec_hasta) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query('SELECT h.fec_inicio, h.fec_final, h.descripcion, h.num_hora, h.tiempo_autorizado ' +
            'FROM hora_extr_pedidos AS h WHERE h.id_empl_cargo = $1 AND h.fec_inicio between $2 and $3 ' +
            'AND h.fec_final between $2 and $3 ORDER BY h.fec_inicio', [id_cargo, fec_desde, fec_hasta])
            .then((result) => {
            return Promise.all(result.rows.map((obj) => __awaiter(this, void 0, void 0, function* () {
                var f1 = new Date(obj.fec_inicio);
                var f2 = new Date(obj.fec_final);
                f1.setUTCHours(f1.getUTCHours() - 5);
                f2.setUTCHours(f2.getUTCHours() - 5);
                const hora_inicio = (0, SubMetodosGraficas_1.HHMMtoSegundos)(f1.toJSON().split('T')[1].split('.')[0]);
                const hora_final = (0, SubMetodosGraficas_1.HHMMtoSegundos)(f2.toJSON().split('T')[1].split('.')[0]);
                const dia = f1.getUTCDay();
                f1.setUTCHours(f1.getUTCHours() - 5);
                f2.setUTCHours(f2.getUTCHours() - 5);
                return {
                    dia_semana: dia,
                    hora_inicio: hora_inicio,
                    hora_final: hora_final,
                    fec_inicio: new Date(f1.toJSON().split('.')[0]),
                    fec_final: new Date(f2.toJSON().split('.')[0]),
                    descripcion: obj.descripcion,
                    num_hora: (0, SubMetodosGraficas_1.HHMMtoSegundos)(obj.num_hora),
                    tiempo_autorizado: (0, SubMetodosGraficas_1.HHMMtoSegundos)(obj.tiempo_autorizado),
                    valores_calculos: new Array,
                    calculos: new Array,
                    nocturno: false,
                    timbres: yield ObtenerTimbres(id_empleado, f1.toJSON().split('T')[0] + 'T00:00:00', f2.toJSON().split('T')[0] + 'T23:59:59')
                };
            })));
        });
    });
}
function PlanificacionHorasExtrasSolicitadas(id_empleado, id_cargo, fec_desde, fec_hasta) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query('SELECT h.fecha_desde, h.hora_inicio, h.fecha_hasta, h.hora_fin, h.descripcion, h.horas_totales, ph.tiempo_autorizado ' +
            'FROM plan_hora_extra_empleado AS ph, plan_hora_extra AS h WHERE ph.id_empl_cargo = $1 AND ph.id_plan_hora = h.id ' +
            'AND h.fecha_desde between $2 and $3 AND h.fecha_hasta between $2 and $3 ORDER BY h.fecha_desde', [id_cargo, fec_desde, fec_hasta])
            .then((result) => {
            return Promise.all(result.rows.map((obj) => __awaiter(this, void 0, void 0, function* () {
                var f1 = new Date(obj.fecha_desde.toJSON().split('T')[0] + 'T' + obj.hora_inicio);
                var f2 = new Date(obj.fecha_hasta.toJSON().split('T')[0] + 'T' + obj.hora_fin);
                f1.setUTCHours(f1.getUTCHours() - 5);
                f2.setUTCHours(f2.getUTCHours() - 5);
                const hora_inicio = (0, SubMetodosGraficas_1.HHMMtoSegundos)(f1.toJSON().split('T')[1].split('.')[0]);
                const hora_final = (0, SubMetodosGraficas_1.HHMMtoSegundos)(f2.toJSON().split('T')[1].split('.')[0]);
                const dia = f1.getUTCDay();
                f1.setUTCHours(f1.getUTCHours() - 5);
                f2.setUTCHours(f2.getUTCHours() - 5);
                return {
                    dia_semana: dia,
                    hora_inicio: hora_inicio,
                    hora_final: hora_final,
                    fec_inicio: new Date(f1.toJSON().split('.')[0]),
                    fec_final: new Date(f2.toJSON().split('.')[0]),
                    descripcion: obj.descripcion,
                    num_hora: (0, SubMetodosGraficas_1.HHMMtoSegundos)(obj.horas_totales),
                    tiempo_autorizado: obj.tiempo_autorizado,
                    valores_calculos: [],
                    calculos: [],
                    nocturno: false,
                    timbres: yield ObtenerTimbres(id_empleado, f1.toJSON().split('T')[0] + 'T00:00:00', f2.toJSON().split('T')[0] + 'T23:59:59')
                };
            })));
        });
    });
}
function ObtenerTimbres(id_empleado, fec_desde, fec_hasta) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log('$$$$$$$$$$$$', fec_desde, fec_hasta);
        return yield database_1.default.query('SELECT fec_hora_timbre, accion FROM timbres WHERE id_empleado = $1 AND accion  in (\'EoS\', \'E\', \'S\') AND fec_hora_timbre BETWEEN $2 AND $3 ORDER BY fec_hora_timbre', [id_empleado, fec_desde, fec_hasta])
            .then((result) => {
            return result.rows.map((obj) => {
                var f1 = new Date(obj.fec_hora_timbre.toJSON().split('.')[0]);
                f1.setUTCHours(f1.getUTCHours() - 15);
                obj.fec_hora_timbre = new Date(f1.toJSON().split('.')[0]);
                console.log(obj);
                return obj;
            });
        });
    });
}
function CargoContratoByFecha(id_empleado, fec_desde, fec_hasta) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const cargo_contrato = yield database_1.default.query('SELECT (e.nombre || \' \' || e.apellido) as nombre, e.codigo, e.cedula, ca.id AS id_cargo, ca.fec_inicio, ca.fec_final, co.id AS id_contrato, ca.sueldo, ca.hora_trabaja FROM empleados AS e, empl_contratos AS co, empl_cargos AS ca ' +
                'WHERE e.id = co.id_empleado AND co.id_empleado = $1 AND ca.id_empl_contrato = co.id OR ca.fec_inicio BETWEEN $2 AND $3 OR ca.fec_final BETWEEN $2 AND $3 ', [id_empleado, fec_desde, fec_hasta])
                .then((result) => {
                return result.rows;
            });
            console.log(cargo_contrato);
            if (cargo_contrato.length === 0)
                return [{ message: 'No tiene contratos ni cargos asignados' }];
            return cargo_contrato;
            // let datos_limpios = cargo_contrato.filter(obj => {
            //     console.log('Objeto sin filtrar UNO:',obj);
            //     return (obj.fec_inicio <= fec_desde && obj.fec_final >= fec_desde )
            // }).filter(obj => {
            //     console.log('Objeto sin filtrar DOS:',obj);
            //     return (obj.fec_inicio <= fec_hasta && obj.fec_final >= fec_hasta )
            // }).map(obj => {
            //     console.log('limpio: ',obj);
            //     return obj
            // })
            // if (datos_limpios.length === 0) return [{message: 'No tiene contratos ni cargos asignados en la fecha de consulta.'}]
            // console.log('*******************');
            // console.log(datos_limpios);
            // console.log('*******************');
            // return datos_limpios
        }
        catch (error) {
            return [{ message: error }];
        }
    });
}
/**
 * HE: HORAS EXTRAS
 * RN: RECARGO NOCTURNO
 * LoF: LIBRE o FERIADO
 * N: NORMAL
 */
function CatalogoHorasExtras() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query('SELECT id, descripcion, tipo_descuento, reca_porcentaje, hora_inicio, hora_final, hora_jornada, tipo_dia, tipo_funcion FROM cg_hora_extras').then((result) => {
            return result.rows.map((obj) => {
                obj.hora_inicio = (0, SubMetodosGraficas_1.HHMMtoSegundos)(obj.hora_inicio);
                obj.hora_final = (0, SubMetodosGraficas_1.HHMMtoSegundos)(obj.hora_final);
                (obj.tipo_descuento === 1) ? obj.tipo_descuento = 'HE' : obj.tipo_descuento = 'RN';
                obj.reca_porcentaje = parseInt(obj.reca_porcentaje) / 100;
                (obj.hora_jornada === 1) ? obj.hora_jornada = 'Diurna' : obj.hora_jornada = 'Nocturna';
                (obj.tipo_dia === 1 || obj.tipo_dia === 2) ? obj.tipo_dia = 'LoF' : obj.tipo_dia = 'N';
                return obj;
            });
        });
    });
}
/**************************************************************************
 *        /\                     _______________  _________
 *       /  \       |          |        |        |         |
 *      /    \      |          |        |        |         |
 *     /      \     |          |        |        |         |
 *    /--------\    |          |        |        |         |
 *   /          \   |          |        |        |         |
 *  /            \  |          |        |        |         |
 * /              \ |__________|        |        |_________|
 ***************************************************************************/
const GenerarHoraExtraCalulo = function (id_hora_extr_pedido) {
    return __awaiter(this, void 0, void 0, function* () {
        // let hora_extra_pedida = await pool.query('SELECT fec_inicio, fec_final')
    });
};
exports.GenerarHoraExtraCalulo = GenerarHoraExtraCalulo;
