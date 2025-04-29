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
exports.ReportePeriVacaciones = exports.vacacionesByIdUser = void 0;
const luxon_1 = require("luxon");
const database_1 = __importDefault(require("../database"));
function DescuentoDiasHorMin(hora_trabaja, num_dia_vacaciones) {
    var dProporcional = parseFloat(num_dia_vacaciones) * (30 / 22);
    var d = parseInt(dProporcional.toString());
    var aux_h = (dProporcional - d) * (hora_trabaja / 1);
    var h = parseInt(aux_h.toString());
    var aux_m = (aux_h - h) * (60 / 1);
    var m = parseInt(aux_m.toString());
    return {
        dias: d,
        horas: h,
        min: m
    };
}
function SaldoDiasHorMin(hora_trabaja, num_dia_vacaciones) {
    var dProporcional = parseFloat(num_dia_vacaciones);
    var d = parseInt(dProporcional.toString());
    var aux_h = (dProporcional - d) * (hora_trabaja / 1);
    var h = parseInt(aux_h.toString());
    var aux_m = (aux_h - h) * (60 / 1);
    var m = parseInt(aux_m.toString());
    return {
        dias: d,
        horas: h,
        min: m
    };
}
function diasTotal(array, i, f) {
    var diasFaltante = array[i.getMonth()];
    var y = diasFaltante - i.getDate();
    var x = f.getDate() + y + 1; // mas 1 empezando del dia que toma vacaciones
    return x;
}
function CalcularDiasVacacion(inicio, final) {
    if (final.getDate() > inicio.getDate() && final.getMonth() === inicio.getMonth() && final.getFullYear() === inicio.getFullYear()) {
        // console.log('Calulo normal');
        let numDias = final.getDate() - inicio.getDate();
        return numDias + 1;
    }
    else if (final.getDate() < inicio.getDate() && final.getMonth() > inicio.getMonth() && final.getFullYear() === inicio.getFullYear()) {
        if (((final.getFullYear() % 4 == 0) && (final.getFullYear() % 100 != 0)) || (final.getFullYear() % 400 == 0)) {
            // console.log('Este año es bisiesto', final.getFullYear());            
            var DiasCadaMes = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            return diasTotal(DiasCadaMes, inicio, final);
        }
        else {
            // console.log('No bisiesto');
            var DiasCadaMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            return diasTotal(DiasCadaMes, inicio, final);
        }
    }
    else if (final.getFullYear() > inicio.getFullYear()) {
        // console.log('Años diferentes');
        var DiasCadaMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        return diasTotal(DiasCadaMes, inicio, final);
    }
}
/**
 *
 * @param contador Verifica la primera entrada
 * @param acumulado Acumulación de dias en la primera entrada, luego en las siguientes entradas es la acumulación del saldo anterior
 * @param descuen son el número de dias de la solicitud de vacaciones * (30/22)
 */
function CarcularSaldoDecimal(contador, acumulado, descuen) {
    if (contador === 0) {
        let x = acumulado - descuen;
        // console.log(acumulado);
        // console.log('saldo Decimal',x);
        // console.log("================");
        return x;
    }
    else {
        let x = acumulado - descuen;
        // console.log(acumulado);
        // console.log('saldo Decimal',x);
        // console.log("================");
        return x;
    }
}
function ObtenerPeriodosEmpleado(id_empl, diasObliga, fec_final_Rango, hora_trabaja) {
    return __awaiter(this, void 0, void 0, function* () {
        let primerPeriodoInicio = yield database_1.default.query(`
        SELECT pv.fecha_inicio 
        FROM eu_empleado_contratos e, mv_periodo_vacacion pv, eu_empleado_cargos AS ca 
        WHERE e.id_empleado = $1 AND ca.id = pv.id_empleado_cargo AND ca.id_contrato = e.id
        ORDER BY e.fecha_ingreso DESC, pv.fecha_inicio LIMIT 1
        `, [id_empl])
            .then((result) => {
            return result.rows[0].fec_inicio.toJSON().split('T')[0];
        });
        let arrayPeriodos = yield database_1.default.query(`
        SELECT pv.id as id_peri_vac, pv.fecha_inicio, pv.fecha_final, pv.dia_vacacion, pv.horas_vacaciones, 
            pv.minutos_vacaciones, pv.dia_antiguedad 
            FROM eu_empleado_contratos e, mv_periodo_vacacion pv, eu_empleado_cargos AS ca 
        WHERE e.id_empleado = $1 AND ca.id = pv.id_empleado_cargo AND ca.id_contrato = e.id
            AND CAST(pv.fecha_final as VARCHAR) BETWEEN $2 || \'%\' AND $3 || \'%\' 
        ORDER BY e.fec_ingreso DESC, pv.fecha_inicio
        `, [id_empl, primerPeriodoInicio, fec_final_Rango])
            .then((result) => {
            return result.rows;
        });
        // console.log(arrayPeriodos);
        let acumulado = arrayPeriodos.map((obj) => {
            // return CalcularDiasAcumulados(diasObliga.dia_obli, obj.fec_inicio, obj.fec_final)
            return DiasHorMinToDecimal(obj.dia_vacacion, obj.horas_vacaciones, obj.minutos_vacaciones, hora_trabaja);
        });
        console.log(acumulado);
        let valorAcumulado = 0;
        acumulado.forEach((obj) => {
            valorAcumulado = obj + valorAcumulado;
        });
        // console.log(valorAcumulado);
        let Inicio_Ultimo_Periodo = arrayPeriodos.map((obj) => {
            return obj.fecha_inicio;
        });
        // console.log('Inicio Periodos ====> ',Inicio_Ultimo_Periodo);
        let aniosInicio = arrayPeriodos.map((obj) => {
            return obj.fecha_inicio.getFullYear();
        });
        let aniosFinal = arrayPeriodos.map((obj) => {
            return obj.fecha_final.getFullYear();
        });
        var nuevo = [...new Set(aniosInicio.concat(aniosFinal))];
        // console.log(nuevo);
        let aniosLaborados = nuevo[nuevo.length - 1] - nuevo[0];
        let obj_antiguedad = ObtenerDiasAdicionales(aniosLaborados); // APLICA SOLO A CODIGO DE TRABAJO
        return {
            fecha_ingreso: Inicio_Ultimo_Periodo[0],
            acumulado: valorAcumulado,
            anios_labo: obj_antiguedad.anio,
            dia_adicional: obj_antiguedad.adicional,
            inicio_Ultimo_Periodo: Inicio_Ultimo_Periodo[Inicio_Ultimo_Periodo.length - 1]
        };
    });
}
function ObtenerDiasAdicionales(aniosLaborados) {
    let objeto = [
        { anio: 5, adicional: 0 },
        { anio: 6, adicional: 1 },
        { anio: 7, adicional: 2 },
        { anio: 8, adicional: 3 },
        { anio: 9, adicional: 4 },
        { anio: 10, adicional: 5 },
        { anio: 11, adicional: 6 },
        { anio: 12, adicional: 7 },
        { anio: 13, adicional: 8 },
        { anio: 14, adicional: 9 },
        { anio: 15, adicional: 10 },
        { anio: 16, adicional: 11 },
        { anio: 17, adicional: 12 },
        { anio: 18, adicional: 13 },
        { anio: 19, adicional: 14 },
        { anio: 10, adicional: 15 },
    ];
    let resultado;
    resultado = {
        anio: 0, adicional: 0
    };
    objeto.forEach((ele) => {
        if (aniosLaborados === ele.anio) {
            resultado = ele;
        }
    });
    return resultado;
}
/**
 * METODO para pedir el periodo del presente año hasta la fecha actual de solicitud
 * @param id_empl Id de empleado que solicita el cardex
 * @param ant Fecha del año anterior solo el año Ejm: 2015
 * @param pre Fecha del año presente solo el año Ejm: 2016
 */
function PeriodoVacacionContrato(id_empl, ant, pre) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query(`
        SELECT e.id as id_contrato, pv.id as id_peri_vac, e.id_regimen, 
            pv.fecha_inicio, pv.fecha_final, pv.dia_vacacion, pv.horas_vacaciones, pv.minutos_vacaciones, 
            pv.dia_antiguedad 
        FROM eu_empleado_contratos e, mv_periodo_vacacion pv, eu_empleado_cargos AS ca 
        WHERE e.id_empleado = $1 AND ca.id = pv.id_empleado_cargo AND ca.id_contrato = e.id
            AND CAST(pv.fecha_inicio as VARCHAR) like $2 || \'%\' 
            AND CAST(pv.fecha_final as VARCHAR) LIKE $3 || \'%\' 
        ORDER BY e.fec_ingreso DESC
        `, [id_empl, ant, pre])
            .then((result) => {
            return result.rows[0];
        });
    });
}
/**
 * METODO para obtener las vacaciones de un determinado perido con un rango de fechas
 * @param id_peri_vac Id del preriodo de vacaciones
 * @param fec_inicio Fecha inicio del periodo
 * @param fec_final Fecha finaliza el periodo
 */
function Vacaciones(id_peri_vac, fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query(`
        SELECT v.fecha_inicio, v.fecha_final, v.fecha_ingreso, v.dia_libre, v.dia_laborable 
        FROM mv_solicitud_vacacion v WHERE v.id_periodo_vacacion = $1 AND v.estado = 3 
            AND CAST(v.fecha_inicio as VARCHAR) BETWEEN $2 || \'%\' AND $3 || \'%\' 
        ORDER BY v.fecha_inicio ASC
        `, [id_peri_vac, fec_inicio, fec_final])
            .then((result) => {
            return result.rows;
        });
    });
}
/**
 * METODO para obtener permisos de acuerdo a un periodo en especifico y un rango de fechas
 * @param id_peri_vac Id del periodo de vacaciones
 * @param fec_inicio Fecha de inicio del periodo
 * @param fec_final Fecha de finalizacion del periodo
 */
function Permisos(id_peri_vac, fec_inicio, fec_final) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query(`
        SELECT p.descripcion, p.fecha_inicio, p.fecha_final, p.dias_permiso, p.dia_libre, p.horas_permiso 
        FROM mp_solicitud_permiso p 
        WHERE p.id_periodo_vacacion = $1  AND p.estado = 3 
            AND CAST(p.fecha_final as VARCHAR) BETWEEN $2 || \'%\' AND $3 || \'%\'
        `, [id_peri_vac, fec_inicio, fec_final])
            .then((result) => {
            return result.rows;
        });
    });
}
/**
 * METODO para obtener el sueldo y horas de trabajo de un empleado en especifico de acuerdo a su ultimo contrato y cargo.
 * @param id_empleado Id del empleado que solicita
 */
function SueldoHorasTrabaja(id_empleado) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query(`
        SELECT ca.sueldo, ca.hora_trabaja 
        FROM eu_empleado_contratos co, eu_empleado_cargos ca 
        WHERE co.id_empleado = $1 AND co.id = ca.id_contrato 
        ORDER BY ca.fecha_inicio DESC LIMIT 1
        `, [id_empleado])
            .then((result) => {
            return result.rows;
        });
    });
}
/**
 * METODO para obtener los dias obligatorios de vacación y el máximo de dias que puede acumular el empleado según el regimen laboral que usa.
 * @param id_regimen Id del regimen laboral
 */
function diasObligaByRegimen(id_regimen) {
    return __awaiter(this, void 0, void 0, function* () {
        let data = yield database_1.default.query(`
        SELECT vacacion_dias_laboral, vacacion_dias_libres, dias_maximo_acumulacion 
        FROM ere_cat_regimenes WHERE id = $1
        `, [id_regimen])
            .then((result) => {
            return result.rows[0];
        });
        var x = data.dia_anio_vacacion + data.dia_libr_anio_vacacion;
        return { dia_obli: x, max_acumulado: data.max_dia_acumulacion };
    });
}
const vacacionesByIdUser = function (id_empleado, desde, hasta) {
    return __awaiter(this, void 0, void 0, function* () {
        // busco ID del ultimo contrato y su regimen del usuario
        var f = new Date();
        var f_presente = new Date();
        f.setUTCHours(f.getHours());
        f_presente.setUTCHours(f_presente.getHours());
        const dataPeri = yield PeriodoVacacionContrato(id_empleado, desde.split("-")[0], hasta.split("-")[0]); //LISTO
        console.log(dataPeri);
        if (dataPeri === undefined)
            return { message: 'No tiene periodos de vacaciones' };
        const diasObliga = yield diasObligaByRegimen(dataPeri.id_regimen); //LISTO
        if (diasObliga === undefined)
            return { message: 'No tiene dias obligatorios' };
        console.log('REGIMEN ======>', diasObliga);
        const vacaciones = yield Vacaciones(dataPeri.id_peri_vac, dataPeri.fec_inicio, dataPeri.fec_final); //LISTO
        if (vacaciones === undefined)
            return { message: 'No tiene vacaciones pedidas' };
        console.log('VACACIONES ##################', vacaciones);
        const permisos = yield Permisos(dataPeri.id_peri_vac, dataPeri.fec_inicio, dataPeri.fec_final); //LISTO
        if (vacaciones === undefined)
            return { message: 'No tiene permisos pedidas' };
        console.log('PERMISOS ##################', permisos);
        const sueldoHora = yield SueldoHorasTrabaja(id_empleado); //LISTO
        if (sueldoHora.length === 0)
            return { message: 'No tiene asignado horas de trabajo o sueldo' };
        console.log(sueldoHora);
        let hora_trabaja = sueldoHora[0].hora_trabaja;
        console.log(dataPeri.fec_final.toJSON().split('T')[0]);
        const acumulado = yield ObtenerPeriodosEmpleado(id_empleado, diasObliga, dataPeri.fec_final.toJSON().split('T')[0], hora_trabaja); //LISTO
        console.log(acumulado);
        /* VALORES DE PRUEBA */
        // acumulado.acumulado = 40.91;
        // let hora_trabaja = 6;
        // const acumulado = { acumulado: 40.91, anios_labo: 6, dia_adicional: 1 } as IAcumulado;
        let nuevoArray = UnirVacacionesPermiso(vacaciones, permisos); //LISTO
        // console.log(nuevoArray);
        let arrayDetalleKardex = ArrayTotalDetalleKardex(nuevoArray, hora_trabaja, acumulado, id_empleado); //LISTO
        // ComprobarCalculo(hora_trabaja, 24, 3, 16);
        return arrayDetalleKardex;
    });
};
exports.vacacionesByIdUser = vacacionesByIdUser;
function ArrayTotalDetalleKardex(arrayTotal, hora_trabaja, IAcumulado, id_empleado) {
    return __awaiter(this, void 0, void 0, function* () {
        let arrayDetalleKardex = [];
        let arrayProporcional = {
            periodo: [],
            antiguedad: []
        };
        let arrayLiquidacion = [];
        let contador = 0;
        let saldoDecimal = 0;
        arrayTotal.forEach((obj) => {
            let dkardex = {
                periodo: '',
                detalle: '',
                desde: '',
                hasta: '',
                descuento: {
                    dias: 0,
                    horas: 0,
                    min: 0
                },
                saldo: {
                    dias: 0,
                    horas: 0,
                    min: 0
                }
            };
            dkardex.periodo = JSON.stringify(obj.fec_final).slice(1, 5);
            dkardex.detalle = obj.descripcion;
            dkardex.desde = JSON.stringify(obj.fec_inicio).slice(1, -1);
            dkardex.hasta = JSON.stringify(obj.fec_final).slice(1, -1);
            let num_dia_vacaciones = CalcularDiasVacacion(obj.fec_inicio, obj.fec_final) || 0;
            let descuen;
            let proporcional_descuento;
            if (num_dia_vacaciones === 0) {
                var hora = parseInt(obj.hora_numero.split(':')[0]);
                var min = parseInt(obj.hora_numero.split(':')[1]);
                var dia = (hora / hora_trabaja) + (min * (1 / 60) * (1 / hora_trabaja));
                proporcional_descuento = dia * (30 / 22);
                descuen = DescuentoDiasHorMin(hora_trabaja, dia);
            }
            else {
                proporcional_descuento = num_dia_vacaciones * (30 / 22);
                descuen = DescuentoDiasHorMin(hora_trabaja, num_dia_vacaciones);
            }
            let saldo = { dias: 0, horas: 0, min: 0 };
            if (contador === 0) {
                saldoDecimal = CarcularSaldoDecimal(contador, IAcumulado.acumulado, proporcional_descuento);
                saldo = SaldoDiasHorMin(hora_trabaja, saldoDecimal);
            }
            else {
                saldoDecimal = CarcularSaldoDecimal(contador, saldoDecimal, proporcional_descuento);
                saldo = SaldoDiasHorMin(hora_trabaja, saldoDecimal);
            }
            if (contador === arrayTotal.length - 1) { // recepta el ultimo saldo
                console.log(IAcumulado);
                let DPeriodo = DetallePeriodoMetodo(IAcumulado.inicio_Ultimo_Periodo);
                let DAntiguedad = DetalleAntiguedadMetodo(IAcumulado.dia_adicional);
                let DLiquidacion = DetalleLiquidacionMetodo(saldoDecimal, DPeriodo.valor, DAntiguedad.valor);
                console.log(DPeriodo);
                console.log(DAntiguedad);
                console.log(DLiquidacion);
                arrayProporcional.periodo.push(DPeriodo);
                arrayProporcional.antiguedad.push(DAntiguedad);
                arrayLiquidacion.push(DLiquidacion);
                console.log('===========');
                console.log(saldoDecimal);
            }
            contador = contador + 1;
            dkardex.descuento = descuen;
            dkardex.saldo = saldo;
            dkardex;
            arrayDetalleKardex.push(dkardex);
        });
        // ObtenerInformacionEmpleado(IAcumulado, id_empleado)
        let empleado = yield ObtenerInformacionEmpleado(IAcumulado, id_empleado);
        // console.log(empleado);
        let KardexJsop = {
            empleado: [empleado],
            detalle: arrayDetalleKardex,
            proporcional: arrayProporcional,
            liquidacion: arrayLiquidacion
        };
        return KardexJsop;
    });
}
function UnirVacacionesPermiso(vacaciones, permisos) {
    let arrayUnico = [];
    vacaciones.forEach((element) => {
        element.fec_inicio.setUTCHours(0);
        element.fec_final.setUTCHours(0);
        let camposIguales = {
            fec_inicio: element.fec_inicio,
            fec_final: element.fec_final,
            descripcion: 'Solicitud Vacaciones',
            dia_laborable: element.dia_laborable,
            dia_libre: element.dia_libre,
            hora_numero: '00:00:00'
        };
        arrayUnico.push(camposIguales);
    });
    permisos.forEach((element) => {
        element.fec_inicio.setUTCHours(0);
        element.fec_final.setUTCHours(0);
        let camposIguales = {
            fec_inicio: element.fec_inicio,
            fec_final: element.fec_final,
            descripcion: 'Solicitud Permiso',
            // descripcion: element.descripcion,
            dia_laborable: element.dia,
            dia_libre: element.dia_libre,
            hora_numero: element.hora_numero
        };
        arrayUnico.push(camposIguales);
    });
    for (let j = 0; j < arrayUnico.length; j++) {
        let numMin;
        let i = numMin = j;
        for (++i; i < arrayUnico.length; i++) {
            (arrayUnico[i].fec_inicio < arrayUnico[numMin].fec_inicio) && (numMin = i);
        }
        [arrayUnico[j], arrayUnico[numMin]] = [arrayUnico[numMin], arrayUnico[j]];
    }
    return arrayUnico;
}
function ObtenerInformacionEmpleado(IAcumulado, id_empl) {
    return __awaiter(this, void 0, void 0, function* () {
        let ObjetoEmpleado = {
            nombre: '',
            ciudad: '',
            identificacion: '',
            codigo: '',
            fec_ingreso: IAcumulado.fecha_ingreso,
            fec_carga: IAcumulado.inicio_Ultimo_Periodo,
            acumulado: IAcumulado.acumulado,
            estado: 'Inactivo'
        };
        let data = yield database_1.default.query(`
        SELECT e.nombre, e.apellido, e.identificacion, e.codigo, e.estado, c.descripcion 
        FROM eu_empleados AS e, eu_empleado_contratos AS co, eu_empleado_cargos AS ca, e_sucursales AS s, e_ciudades AS c 
        WHERE e.id = $1 AND e.id = co.id_empleado AND ca.id_contrato = co.id AND s.id = ca.id_sucursal 
            AND s.id_ciudad = c.id 
        ORDER BY co.fecha_ingreso DESC LIMIT 1
        `, [id_empl])
            .then((result) => {
            return result.rows[0];
        });
        ObjetoEmpleado.nombre = data.nombre + ' ' + data.apellido;
        ObjetoEmpleado.ciudad = data.descripcion;
        ObjetoEmpleado.identificacion = data.identificacion;
        ObjetoEmpleado.codigo = data.codigo;
        if (data.estado === 1) {
            ObjetoEmpleado.estado = 'Activo';
        }
        return ObjetoEmpleado;
    });
}
/**
 * Metodo para llenar el campo de Periodo en el Kardex
 * @param I_Periodo Fecha inicial del ultimo periodo
 */
function DetallePeriodoMetodo(I_Periodo) {
    var f = new Date();
    var aux_f = new Date(I_Periodo.toJSON().split('T')[0]);
    // console.log('ANTES ========================>',aux_f);
    aux_f.setFullYear(aux_f.getFullYear() + 1);
    // console.log('DESPUES ========================>',aux_f);
    let diasLaborados;
    let valor;
    if (f < aux_f) {
        // console.log('Periodo Actual');
        const fecha1 = luxon_1.DateTime.fromISO(I_Periodo.toJSON().split("T")[0]);
        const fecha2 = luxon_1.DateTime.fromISO(f.toJSON().split("T")[0]);
        const diasLaborados = fecha2.diff(fecha1, 'days').as('days');
        valor = (diasLaborados * 15) / 365;
    }
    else {
        // console.log('Periodo Anterior');
        valor = 0;
    }
    let respuesta = TransformaDiasHorMin(valor);
    return respuesta;
}
function DetalleAntiguedadMetodo(dia_adicional) {
    return TransformaDiasHorMin(dia_adicional);
}
/**
 *
 * @param saldo
 * @param periodo
 * @param antiguedad
 */
function DetalleLiquidacionMetodo(saldo, periodo, antiguedad) {
    return TransformaDiasHorMin(saldo + periodo + antiguedad);
}
function TransformaDiasHorMin(valor_decimal) {
    var d = parseInt(valor_decimal.toString().split(".")[0]);
    var aux_dia = valor_decimal - d;
    var aux_hor = aux_dia * 24;
    var h = parseInt(aux_hor.toString().split(".")[0]);
    var aux_min = (aux_hor - h) * 60;
    var m = parseInt(aux_min.toString().split(".")[0]);
    return {
        dias: d,
        horas: h,
        min: m,
        valor: valor_decimal
    };
}
function DiasHorMinToDecimal(dias, horas, min, hora_trabaja) {
    var hToD = horas / hora_trabaja;
    var mToD = min * (1 / 60) * (1 / hora_trabaja);
    let decimal = dias + hToD + mToD;
    return decimal;
}
function ComprobarCalculo(hora_trabaja, dias, hora, min) {
    var h = hora / hora_trabaja;
    var m = (min / 60) * (1 / hora_trabaja);
    // console.log(dias + h + m);
    // console.log(dias + h + m + 10.5833);
    return dias + h + m;
}
/**
 * *****************************************************************************
 * METODO PARA LOS REPORTES DE PERIODO DE VACACIONES
 *
 * *****************************************************************************
 */
const ReportePeriVacaciones = function (id_empleado) {
    return __awaiter(this, void 0, void 0, function* () {
        let periodos = yield PeriodosVacacionesEmpleado(id_empleado);
        if (periodos.length === 0)
            return { message: 'No tiene ningun periodo asignado' };
        console.log(periodos);
        return { message: 'Ups! algo salio mal en el proceso.' };
    });
};
exports.ReportePeriVacaciones = ReportePeriVacaciones;
function PeriodosVacacionesEmpleado(id_empleado) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query(`
        SELECT pv.descripcion, pv.dia_vacacion, pv.dia_antiguedad, pv.estado, pv.fecha_inicio, pv.fecha_final, 
            pv.dia_perdido, pv.horas_vacaciones, pv.minutos_vacaciones 
        FROM eu_empleado_contratos AS co, mv_periodo_vacacion AS pv, eu_empleado_cargos AS ca 
        WHERE co.id_empleado = $1 AND ca.id = pv.id_empleado_cargo AND ca.id_contrato = co.id
        ORDER BY pv.fecha_inicio ASC
        `, [id_empleado])
            .then((result) => {
            return result.rows;
        });
    });
}
