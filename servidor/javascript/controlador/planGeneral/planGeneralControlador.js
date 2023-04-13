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
exports.PLAN_GENERAL_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../database"));
class PlanGeneralControlador {
    // METODO PARA REGISTRAR PLAN GENERAL
    CrearPlanificacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fec_hora_horario, maxi_min_espera, estado, id_det_horario, fec_horario, id_empl_cargo, tipo_entr_salida, codigo, id_horario, tipo, salida_otro_dia } = req.body;
            try {
                const [result] = yield database_1.default.query(`
                INSERT INTO plan_general (fec_hora_horario, maxi_min_espera, estado, id_det_horario,
                fec_horario, id_empl_cargo, tipo_entr_salida, codigo, id_horario, tipo, salida_otro_dia) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *
                `, [fec_hora_horario, maxi_min_espera, estado, id_det_horario, fec_horario, id_empl_cargo,
                    tipo_entr_salida, codigo, id_horario, tipo, salida_otro_dia])
                    .then((result) => { return result.rows; });
                if (result === undefined)
                    return res.status(404).jsonp({ message: 'error' });
                return res.jsonp({ message: 'Registro guardado.' });
            }
            catch (error) {
                return res.status(500).jsonp({ message: 'Registros no encontrados.' });
            }
        });
    }
    // METODO PARA BUSCAR ID POR FECHAS PLAN GENERAL
    BuscarFechas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fec_inicio, fec_final, id_horario, codigo } = req.body;
            const FECHAS = yield database_1.default.query(`
            SELECT id FROM plan_general WHERE 
            (fec_horario BETWEEN $1 AND $2) AND id_horario = $3 AND codigo = $4
            `, [fec_inicio, fec_final, id_horario, codigo]);
            if (FECHAS.rowCount > 0) {
                return res.jsonp(FECHAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTROS
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield database_1.default.query(`
            DELETE FROM plan_general WHERE id = $1
            `, [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    // METODO PARA BUSCAR PLANIFICACION EN UN RANGO DE FECHAS
    BuscarHorarioFechas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fecha_inicio, fecha_final, codigo } = req.body;
                const HORARIO = yield database_1.default.query(`
                SELECT DISTINCT (fec_horario), tipo
                FROM plan_general 
                WHERE codigo::varchar = $3 AND fec_horario BETWEEN $1 AND $2
                ORDER BY fec_horario ASC
                `, [fecha_inicio, fecha_final, codigo]);
                if (HORARIO.rowCount > 0) {
                    return res.jsonp(HORARIO.rows);
                }
                else {
                    res.status(404).jsonp({ text: 'Registros no encontrados.' });
                }
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    BuscarFecha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fec_inicio, id_horario, codigo } = req.body;
            const FECHAS = yield database_1.default.query('SELECT id FROM plan_general WHERE fec_horario = $1 AND ' +
                'id_horario = $2 AND codigo = $3', [fec_inicio, id_horario, codigo]);
            if (FECHAS.rowCount > 0) {
                return res.jsonp(FECHAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
}
exports.PLAN_GENERAL_CONTROLADOR = new PlanGeneralControlador();
exports.default = exports.PLAN_GENERAL_CONTROLADOR;
