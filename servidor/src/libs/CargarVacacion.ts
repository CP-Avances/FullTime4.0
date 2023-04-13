import pool from '../database'

export const RestarPeriodoVacacionAutorizada = async function (id_vacacion: number) {

    let vacacion = await ConsultarVacacion(id_vacacion);

    let num_dias = ContabilizarDiasVacacion(vacacion.fec_inicio, vacacion.fec_final) || 0;

    var hora_trabaja = await HorasTrabaja(vacacion.id_peri_vacacion);

    let periodo = await ConsultarPerido(vacacion.id_peri_vacacion);

    // var dProporcional = num_dias * (30/22);
    var dProporcional = num_dias;

    let d_h_m = DecimalToDiasHorMin(hora_trabaja, dProporcional);

    let dias_decimal = DDHHMMtoDiasDecimal(hora_trabaja, periodo.dias, periodo.horas, periodo.min)

    // var total = (dias_decimal * (30/22)) - dProporcional;
    var total = dias_decimal - dProporcional;

    let total_DHM = DecimalToDiasHorMin(hora_trabaja, total);

    console.log(vacacion);
    console.log(num_dias);
    console.log(hora_trabaja);
    console.log(periodo);
    console.log(dProporcional);
    console.log(d_h_m);
    console.log('Total ===>', total);
    console.log(total_DHM);

    await pool.query('UPDATE peri_vacaciones SET dia_vacacion = $1, horas_vacaciones = $2, min_vacaciones = $3 WHERE id = $4', [total_DHM.dias, total_DHM.horas, total_DHM.min, vacacion.id_peri_vacacion])

}

async function ConsultarVacacion(id_vacacion: number) {
    return await pool.query('SELECT fec_inicio, fec_final, id_peri_vacacion FROM vacaciones WHERE id = $1', [id_vacacion])
        .then(result => {
            return result.rows[0]
        })
}

async function ConsultarPerido(id_peri_vacacion: number) {
    return await pool.query(
        `SELECT dia_vacacion AS dias, horas_vacaciones AS horas, min_vacaciones AS min 
        FROM peri_vacaciones WHERE id = $1`, [id_peri_vacacion])
        .then(result => {
            return result.rows[0]
        })
}

async function HorasTrabaja(id_periodo: number) {
    return await pool.query('SELECT ca.hora_trabaja ' +
        'FROM peri_vacaciones AS pv, empl_contratos AS co, empl_cargos AS ca ' +
        'WHERE pv.id = $1 AND pv.id_empl_contrato = co.id AND co.id = ca.id_empl_contrato',
        [id_periodo]).then(result => {
            return result.rows[0].hora_trabaja
        })
}

function DecimalToDiasHorMin(hora_trabaja: number, tiempo_decimal: number) {

    var d = parseInt(tiempo_decimal.toString())
    var aux_h = (tiempo_decimal - d) * (hora_trabaja / 1);
    var h = parseInt(aux_h.toString());
    var aux_m = (aux_h - h) * (60 / 1);
    var m = parseInt(aux_m.toString());

    return {
        dias: d,
        horas: h,
        min: m
    }
}

function DDHHMMtoDiasDecimal(hora_trabaja: number, dias: number, horas: number, min: number) {
    var h = horas / hora_trabaja; //horas a Dias
    var m = (min / 60) * (1 / hora_trabaja); //minutos a Dias
    // console.log(h, '>>>>>', m);
    return dias + h + m
}

function diasTotal(array: any, i: Date, f: Date) {
    var diasFaltante = array[i.getMonth()];
    var y = diasFaltante - i.getDate();
    var x = f.getDate() + y + 1; // mas 1 empezando del dia que toma vacaciones
    return x
}

function ContabilizarDiasVacacion(inicio: Date, final: Date) {

    if (final.getDate() > inicio.getDate() && final.getMonth() === inicio.getMonth() && final.getFullYear() === inicio.getFullYear()) {
        // console.log('Calulo normal');
        let numDias = final.getDate() - inicio.getDate();
        return numDias + 1;

    } else if (final.getDate() < inicio.getDate() && final.getMonth() > inicio.getMonth() && final.getFullYear() === inicio.getFullYear()) {

        if (((final.getFullYear() % 4 == 0) && (final.getFullYear() % 100 != 0)) || (final.getFullYear() % 400 == 0)) {
            // console.log('Este año es bisiesto', final.getFullYear());            
            var DiasCadaMes = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
            return diasTotal(DiasCadaMes, inicio, final);
        } else {
            // console.log('No bisiesto');
            var DiasCadaMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
            return diasTotal(DiasCadaMes, inicio, final);
        }

    } else if (final.getFullYear() > inicio.getFullYear()) {
        // console.log('Años diferentes');
        var DiasCadaMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        return diasTotal(DiasCadaMes, inicio, final);
    }

}