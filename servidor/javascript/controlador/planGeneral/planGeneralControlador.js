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
            var errores = 0;
            var iterar = 0;
            var cont = 0;
            errores = 0;
            iterar = 0;
            cont = 0;
            for (var i = 0; i < req.body.length; i++) {
                database_1.default.query(`
                INSERT INTO plan_general (fec_hora_horario, tolerancia, estado_timbre, id_det_horario,
                    fec_horario, id_empl_cargo, tipo_entr_salida, codigo, id_horario, tipo_dia, salida_otro_dia,
                    min_antes, min_despues) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *
                `, [req.body[i].fec_hora_horario, req.body[i].tolerancia, req.body[i].estado_timbre,
                    req.body[i].id_det_horario, req.body[i].fec_horario, req.body[i].id_empl_cargo,
                    req.body[i].tipo_entr_salida, req.body[i].codigo, req.body[i].id_horario, req.body[i].tipo_dia,
                    req.body[i].salida_otro_dia, req.body[i].min_antes, req.body[i].min_despues], (error) => {
                    iterar = iterar + 1;
                    try {
                        if (error) {
                            errores = errores + 1;
                            console.log("contador errores" + errores);
                            if (iterar === req.body.length && errores > 0) {
                                return res.status(200).jsonp({ message: 'error' });
                            }
                        }
                        else {
                            cont = cont + 1;
                            //console.log("Rows " + JSON.stringify(results.rows));
                            console.log("contador " + cont);
                            if (iterar === req.body.length && cont === req.body.length) {
                                return res.status(200).jsonp({ message: 'OK' });
                            }
                            else if (iterar === req.body.length && cont != req.body.length) {
                                return res.status(200).jsonp({ message: 'error' });
                            }
                        }
                    }
                    catch (error) {
                        return res.status(500).jsonp({ message: 'Se ha producido un error en el proceso.' });
                    }
                });
            }
        });
    }
    // METODO PARA BUSCAR ID POR FECHAS PLAN GENERAL
    BuscarFechas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fec_inicio, fec_final, id_horario, codigo } = req.body;
            console.log('imgresa con ', req.body);
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
            var errores = 0;
            var iterar = 0;
            var cont = 0;
            errores = 0;
            iterar = 0;
            cont = 0;
            console.log('entra ', req.body.length);
            for (var i = 0; i < req.body.length; i++) {
                database_1.default.query(`
                DELETE FROM plan_general WHERE id = $1
                `, [req.body[i].id], (error) => {
                    iterar = iterar + 1;
                    try {
                        if (error) {
                            errores = errores + 1;
                            console.log("contador errores" + errores);
                            if (iterar === req.body.length && errores > 0) {
                                return res.status(200).jsonp({ message: 'error' });
                            }
                        }
                        else {
                            cont = cont + 1;
                            //console.log("Rows " + JSON.stringify(results.rows));
                            console.log("contador " + cont);
                            if (iterar === req.body.length && cont === req.body.length) {
                                return res.status(200).jsonp({ message: 'OK' });
                            }
                            else if (iterar === req.body.length && cont != req.body.length) {
                                return res.status(200).jsonp({ message: 'error' });
                            }
                        }
                    }
                    catch (error) {
                        return res.status(500).jsonp({ message: 'Se ha producido un error en el proceso.' });
                    }
                });
            }
        });
    }
    // METODO PARA BUSCAR PLANIFICACION EN UN RANGO DE FECHAS
    BuscarHorarioFechas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fecha_inicio, fecha_final, codigo } = req.body;
                const HORARIO = yield database_1.default.query(`
                SELECT DISTINCT (fec_horario), tipo_dia
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
