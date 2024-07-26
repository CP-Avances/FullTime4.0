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
exports.RestarPeriodoVacacionAutorizada = void 0;
const database_1 = __importDefault(require("../database"));
const auditoriaControlador_1 = __importDefault(require("../controlador/auditoria/auditoriaControlador"));
const RestarPeriodoVacacionAutorizada = function (id_vacacion, user_name, ip) {
    return __awaiter(this, void 0, void 0, function* () {
        let vacacion = yield ConsultarVacacion(id_vacacion);
        let num_dias = ContabilizarDiasVacacion(vacacion.fec_inicio, vacacion.fec_final) || 0;
        var hora_trabaja = yield HorasTrabaja(vacacion.id_peri_vacacion);
        let periodo = yield ConsultarPerido(vacacion.id_peri_vacacion);
        // var dProporcional = num_dias * (30/22);
        var dProporcional = num_dias;
        let d_h_m = DecimalToDiasHorMin(hora_trabaja, dProporcional);
        let dias_decimal = DDHHMMtoDiasDecimal(hora_trabaja, periodo.dias, periodo.horas, periodo.min);
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
        try {
            // INICIAR TRANSACCION
            yield database_1.default.query('BEGIN');
            // CONSULTAR DATOSORIGINALES
            const consulta = yield database_1.default.query(`SELECT * FROM mv_periodo_vacacion WHERE id = $1`, [vacacion.id_peri_vacacion]);
            const [datosOriginales] = consulta.rows;
            if (!datosOriginales) {
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'mv_periodo_vacacion',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip,
                    observacion: `Error al actualizar periodo de vacaciones con id ${vacacion.id_peri_vacacion}. Registro no encontrado`
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return;
            }
            const response = yield database_1.default.query(`
            UPDATE mv_periodo_vacacion SET dia_vacacion = $1, horas_vacaciones = $2, minutos_vacaciones = $3 WHERE id = $4 RETURNING *
            `, [total_DHM.dias, total_DHM.horas, total_DHM.min, vacacion.id_peri_vacacion]);
            // AUDITORIA
            yield auditoriaControlador_1.default.InsertarAuditoria({
                tabla: 'mv_periodo_vacacion',
                usuario: user_name,
                accion: 'U',
                datosOriginales: JSON.stringify(datosOriginales),
                datosNuevos: JSON.stringify(response.rows),
                ip,
                observacion: null
            });
            // FINALIZAR TRANSACCION
            yield database_1.default.query('COMMIT');
            return;
        }
        catch (error) {
            // REVERTIR TRANSACCION
            yield database_1.default.query('ROLLBACK');
            throw error;
        }
    });
};
exports.RestarPeriodoVacacionAutorizada = RestarPeriodoVacacionAutorizada;
function ConsultarVacacion(id_vacacion) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query(`
        SELECT fecha_inicio, fecha_final, id_periodo_vacacion 
        FROM mv_solicitud_vacacion WHERE id = $1
        `, [id_vacacion])
            .then(result => {
            return result.rows[0];
        });
    });
}
function ConsultarPerido(id_peri_vacacion) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query(`
        SELECT dia_vacacion AS dias, horas_vacaciones AS horas, minutos_vacaciones AS min 
        FROM mv_periodo_vacacion WHERE id = $1
        `, [id_peri_vacacion])
            .then(result => {
            return result.rows[0];
        });
    });
}
function HorasTrabaja(id_periodo) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query(`
        SELECT ca.hora_trabaja 
        FROM mv_periodo_vacacion AS pv, eu_empleado_contratos AS co, eu_empleado_cargos AS ca 
        WHERE pv.id = $1 AND pv.id_empleado_cargo = ca.id AND co.id = ca.id_contrato
        `, [id_periodo]).then(result => {
            return result.rows[0].hora_trabaja;
        });
    });
}
function DecimalToDiasHorMin(hora_trabaja, tiempo_decimal) {
    var d = parseInt(tiempo_decimal.toString());
    var aux_h = (tiempo_decimal - d) * (hora_trabaja / 1);
    var h = parseInt(aux_h.toString());
    var aux_m = (aux_h - h) * (60 / 1);
    var m = parseInt(aux_m.toString());
    return {
        dias: d,
        horas: h,
        min: m
    };
}
function DDHHMMtoDiasDecimal(hora_trabaja, dias, horas, min) {
    var h = horas / hora_trabaja; //horas a Dias
    var m = (min / 60) * (1 / hora_trabaja); //minutos a Dias
    // console.log(h, '>>>>>', m);
    return dias + h + m;
}
function diasTotal(array, i, f) {
    var diasFaltante = array[i.getMonth()];
    var y = diasFaltante - i.getDate();
    var x = f.getDate() + y + 1; // mas 1 empezando del dia que toma vacaciones
    return x;
}
function ContabilizarDiasVacacion(inicio, final) {
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
