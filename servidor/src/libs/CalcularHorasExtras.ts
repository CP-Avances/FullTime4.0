import { HHMMtoSegundos } from './SubMetodosGraficas';
import pool from '../database';

export const CalcularHoraExtra = async function (id_empleado: number, fec_desde: Date, fec_hasta: Date) {
    console.log(id_empleado, fec_desde, fec_hasta);
    let codigo: number;
    try {
        let [code]: any = await pool.query(
            `
            SELECT codigo FROM eu_empleados WHERE id = $1
            `
            , [id_empleado]).then(result => { return result.rows });

        if (code === undefined) return { mensaje: 'El empleado no tiene un codigo asignado.' };
        codigo = parseInt(code.codigo);
        console.log('Codigo: ', codigo);

        let ids = await CargoContratoByFecha(id_empleado, fec_desde, fec_hasta);
        console.log('Contrato y cargo', ids);
        if (ids[0].message) {
            return ids[0]
        }

        let cg_horas_extras = await CatalogoHorasExtras();
        console.log('Catalgo Horas Extras', cg_horas_extras);

        let horas_extras = await Promise.all(ids.map(async (obj) => {
            return await ListaHorasExtras(cg_horas_extras, codigo, obj.id_cargo, fec_desde, fec_hasta, parseInt(obj.sueldo), obj.hora_trabaja)
        }));

        // let feriados = await Promise.all(ids.map(async(obj) => {
        //     return await FeriadosPorIdCargo(obj.id_cargo, fec_desde, fec_hasta)
        // }))

        console.log('Lista de horas extras ===', horas_extras[0]);
        // console.log('Lista de feriados ===', feriados[0]);

        let ArrayDatos = {
            info: ids,
            detalle: horas_extras[0].map((obj: any) => {
                console.log('ver datos ', obj)
                return {
                    fec_inicio: obj.fec_inicio,
                    fec_final: obj.fec_final,
                    descripcion: obj.descripcion,
                    total_horas: obj.tiempo_autorizado || obj.num_hora,
                    porcentaje: obj.valores_calculos[0].reca_porcentaje,
                    valor_recargo: obj.calculos[0].valor_recargo,
                    valor_hora_total: obj.calculos[0].valor_hora_total,
                    valor_pago: obj.calculos[0].valor_pago
                }
            }),
            total: {
                total_pago_hx: SumaValorPagoEmpleado(horas_extras[0]),
                total_sueldo: SumaValorPagoEmpleado(horas_extras[0]) + parseInt(ids[0].sueldo)
            }
        }

        return ArrayDatos
    } catch (error) {
        console.log(error);
        return error
    }
}


function SumaValorPagoEmpleado(horas_extras: any[]) {
    let sumador: number = 0;
    horas_extras.forEach((obj: any) => {
        console.log('Valor pago', obj.calculos[0].valor_pago);
        sumador = sumador + obj.calculos[0].valor_pago
    });

    return sumador
}

async function ListaHorasExtras(cg_horas_extras: any, codigo: number, id_cargo: number, fec_desde: Date, fec_hasta: Date, sueldo: number, horas_trabaja: number) {
    let arrayUno = await HorasExtrasSolicitadas(codigo, id_cargo, fec_desde, fec_hasta)
    let arrayDos = await PlanificacionHorasExtrasSolicitadas(codigo, id_cargo, fec_desde, fec_hasta)
    console.log('array uno ===', arrayUno); console.log('array dos ===', arrayDos);
    let arrayUnido = arrayUno.concat(arrayDos)

    for (let j = 0; j < arrayUnido.length; j++) {
        let numMin;
        let i = numMin = j;
        for (++i; i < arrayUnido.length; i++) {
            (arrayUnido[i].fec_inicio < arrayUnido[numMin].fec_inicio) && (numMin = i);
        }
        [arrayUnido[j], arrayUnido[numMin]] = [arrayUnido[numMin], arrayUnido[j]]
    }

    // console.log('***************** array unido *****************');

    const valor_dia = sueldo / 30;
    const valor_hora = valor_dia / horas_trabaja;

    arrayUnido.forEach((obj: any) => {
        obj.valores_calculos = cg_horas_extras.filter((res: any) => {
            if (obj.nocturno === true) {
                return res;
            }
            if (obj.dia_semana >= 1 && obj.dia_semana <= 5 && res.tipo_dia == 'N') {
                if (res.hora_inicio <= obj.hora_inicio && res.hora_final >= obj.hora_final) {
                    return res;
                }
            }
        })
    });

    /** TIPO DE FUNCION
     *  1. calcular horas jornada nocturna 25%;
     *  2. calcular horas suplementarias de 50% y 100%;
     *  3. calcular horas extraordinarias;
     */
    arrayUnido.forEach((obj: any) => {
        obj.calculos = obj.valores_calculos.map((res: any) => {
            if (res.tipo_funcion === 1) {
                // console.log('funcion 1');

                return 0
            } else if (res.tipo_funcion === 2) {
                // console.log('funcion 2');
                return HorasSuplementarias(valor_dia, valor_hora, obj.tiempo_autorizado || obj.num_hora, res.reca_porcentaje)
            } else if (res.tipo_funcion === 3) {
                // console.log('funcion 3');
                return 0
            }
        }) || 0;
    })
    return arrayUnido
}

function HorasSuplementarias(valor_dia: number, valor_hora: number, num_hora: number, porcentaje: any) {
    const vr = porcentaje * valor_hora
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
    }
}

async function HorasExtrasSolicitadas(id_empleado: number, id_cargo: number, fec_desde: Date, fec_hasta: Date) {
    return await pool.query(
        `
        SELECT h.fecha_inicio, h.fecha_final, h.descripcion, h.horas_solicitud, h.tiempo_autorizado 
        FROM mhe_solicitud_hora_extra AS h 
        WHERE h.id_empleado_cargo = $1 AND h.fecha_inicio BETWEEN $2 AND $3 
            AND h.fecha_final BETWEEN $2 AND $3 
        ORDER BY h.fecha_inicio ASC
        `
        , [id_cargo, fec_desde, fec_hasta])
        .then((result: any) => {
            return Promise.all(result.rows.map(async (obj: any) => {
                var f1 = new Date(obj.fec_inicio)
                var f2 = new Date(obj.fec_final)
                f1.setUTCHours(f1.getUTCHours() - 5);
                f2.setUTCHours(f2.getUTCHours() - 5);
                const hora_inicio = HHMMtoSegundos(f1.toJSON().split('T')[1].split('.')[0]);
                const hora_final = HHMMtoSegundos(f2.toJSON().split('T')[1].split('.')[0]);
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
                    num_hora: HHMMtoSegundos(obj.num_hora),
                    tiempo_autorizado: HHMMtoSegundos(obj.tiempo_autorizado),
                    valores_calculos: new Array,
                    calculos: new Array,
                    nocturno: false,
                    timbres: await ObtenerTimbres(id_empleado, f1.toJSON().split('T')[0] + 'T00:00:00', f2.toJSON().split('T')[0] + 'T23:59:59')
                }
            }))
        });
}

async function PlanificacionHorasExtrasSolicitadas(id_empleado: number, id_cargo: number, fec_desde: Date, fec_hasta: Date) {
    return await pool.query(
        `
        SELECT h.fecha_desde, h.hora_inicio, h.fecha_hasta, h.hora_fin, h.descripcion, h.horas_totales, ph.tiempo_autorizado  
        FROM mhe_empleado_plan_hora_extra AS ph, mhe_detalle_plan_hora_extra AS h 
        WHERE ph.id_empleado_cargo = $1 AND ph.id_detalle_plan = h.id 
            AND h.fecha_desde BETWEEN $2 AND $3 AND h.fecha_hasta BETWEEN $2 AND $3 
        ORDER BY h.fecha_desde ASC
        `
        , [id_cargo, fec_desde, fec_hasta])
        .then((result: any) => {
            return Promise.all(result.rows.map(async (obj: any) => {
                var f1 = new Date(obj.fecha_desde.toJSON().split('T')[0] + 'T' + obj.hora_inicio);
                var f2 = new Date(obj.fecha_hasta.toJSON().split('T')[0] + 'T' + obj.hora_fin);
                f1.setUTCHours(f1.getUTCHours() - 5);
                f2.setUTCHours(f2.getUTCHours() - 5);
                const hora_inicio = HHMMtoSegundos(f1.toJSON().split('T')[1].split('.')[0]);
                const hora_final = HHMMtoSegundos(f2.toJSON().split('T')[1].split('.')[0]);
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
                    num_hora: HHMMtoSegundos(obj.horas_totales),
                    tiempo_autorizado: obj.tiempo_autorizado,
                    valores_calculos: [],
                    calculos: [],
                    nocturno: false,
                    timbres: await ObtenerTimbres(id_empleado, f1.toJSON().split('T')[0] + 'T00:00:00', f2.toJSON().split('T')[0] + 'T23:59:59')
                }
            }))
        })
}

async function ObtenerTimbres(id_empleado: number, fec_desde: string, fec_hasta: string) {
    // console.log('$$$$$$$$$$$$', fec_desde, fec_hasta);
    return await pool.query(
        `
        SELECT fecha_hora_timbre, accion FROM eu_timbres 
        WHERE codigo = $1 AND accion  in (\'EoS\', \'E\', \'S\') AND fecha_hora_timbre BETWEEN $2 AND $3 
        ORDER BY fecha_hora_timbre
        `
        , [id_empleado, fec_desde, fec_hasta])
        .then((result: any) => {
            return result.rows.map((obj: any) => {
                var f1 = new Date(obj.fecha_hora_timbre.toJSON().split('.')[0])
                f1.setUTCHours(f1.getUTCHours() - 15);
                obj.fecha_hora_timbre = new Date(f1.toJSON().split('.')[0]);
                console.log(obj);
                return obj
            })
        })
}

async function CargoContratoByFecha(id_empleado: number, fec_desde: Date, fec_hasta: Date): Promise<any[]> {
    try {
        const cargo_contrato = await pool.query(
            `
            SELECT (e.nombre || \' \' || e.apellido) as nombre, e.codigo, e.cedula, ca.id AS id_cargo, ca.fecha_inicio, 
                ca.fecha_final, co.id AS id_contrato, ca.sueldo, ca.hora_trabaja 
            FROM eu_empleados AS e, eu_empleado_contratos AS co, eu_empleado_cargos AS ca 
            WHERE e.id = co.id_empleado AND co.id_empleado = $1 
                AND ca.id_contrato = co.id OR ca.fecha_inicio BETWEEN $2 AND $3 OR ca.fecha_final BETWEEN $2 AND $3 
            `
            , [id_empleado, fec_desde, fec_hasta])
            .then((result: any) => {
                return result.rows;
            });
        console.log(cargo_contrato);

        if (cargo_contrato.length === 0) return [{ message: 'No tiene contratos ni cargos asignados.' }];
        return cargo_contrato

    } catch (error) {
        return [{ message: error }]
    }
}

/**
 * HE: HORAS EXTRAS
 * RN: RECARGO NOCTURNO
 * LoF: LIBRE o FERIADO
 * N: NORMAL 
 */
async function CatalogoHorasExtras() {
    return await pool.query(
        `
        SELECT id, descripcion, tipo_descuento, recargo_porcentaje, hora_inicio, hora_final, hora_jornada, tipo_dia, 
            tipo_funcion 
        FROM mhe_configurar_hora_extra
        `
    ).then((result: any) => {
        return result.rows.map((obj: any) => {
            obj.hora_inicio = HHMMtoSegundos(obj.hora_inicio);
            obj.hora_final = HHMMtoSegundos(obj.hora_final);
            (obj.tipo_descuento === 1) ? obj.tipo_descuento = 'HE' : obj.tipo_descuento = 'RN';
            obj.reca_porcentaje = parseInt(obj.reca_porcentaje) / 100;
            (obj.hora_jornada === 1) ? obj.hora_jornada = 'Diurna' : obj.hora_jornada = 'Nocturna';
            (obj.tipo_dia === 1 || obj.tipo_dia === 2) ? obj.tipo_dia = 'LoF' : obj.tipo_dia = 'N'
            return obj
        })
    })
}


