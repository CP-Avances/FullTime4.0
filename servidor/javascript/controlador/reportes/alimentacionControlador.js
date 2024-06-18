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
exports.ALIMENTACION_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../database"));
class AlimentacionControlador {
    ListarPlanificadosConsumidos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fec_inicio, fec_final } = req.body;
            const DATOS = yield database_1.default.query(`
            SELECT tc.nombre AS comida_tipo, ctc.id_comida AS id_comida, 
                ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, 
                (COUNT(dm.nombre) * dm.valor) AS total 
            FROM e_cat_tipo_comida AS tc, ma_horario_comidas AS ctc, ma_detalle_comida AS dm, ma_detalle_plan_comida AS pc, 
                ma_empleado_plan_comida_general AS pce 
            WHERE tc.id = ctc.id_comida AND dm.id_horario_comida = ctc.id AND pc.id_detalle_comida = dm.id 
                AND pc.extra = false AND pce.consumido = true AND pce.id_detalle_plan = pc.id AND 
                pce.fecha BETWEEN $1 AND $2 
            GROUP BY tc.nombre, ctc.id_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion
            `, [fec_inicio, fec_final]);
            if (DATOS.rowCount != 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    ListarSolicitadosConsumidos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fec_inicio, fec_final } = req.body;
            const DATOS = yield database_1.default.query(`
            SELECT tc.nombre AS comida_tipo, ctc.id_comida AS id_comida, 
                ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, 
                (COUNT(dm.nombre) * dm.valor) AS total 
            FROM e_cat_tipo_comida AS tc, ma_horario_comidas AS ctc, ma_detalle_comida AS dm, ma_solicitud_comida AS sc, 
                ma_empleado_plan_comida_general AS pce 
            WHERE tc.id = ctc.id_comida AND dm.id_horario_comida = ctc.id AND sc.id_detalle_comida = dm.id 
                AND sc.extra = false AND pce.consumido = true AND sc.fecha_comida BETWEEN $1 AND $2 AND 
                pce.id_solicitud_comida = sc.id 
            GROUP BY tc.nombre, ctc.id_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion
            `, [fec_inicio, fec_final]);
            if (DATOS.rowCount != 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'error' });
            }
        });
    }
    ListarExtrasPlanConsumidos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fec_inicio, fec_final } = req.body;
            const DATOS = yield database_1.default.query(`
            SELECT tc.nombre AS comida_tipo, ctc.id_comida AS id_comida, 
                ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, 
                (COUNT(dm.nombre) * dm.valor) AS total 
            FROM e_cat_tipo_comida AS tc, ma_horario_comidas AS ctc, ma_detalle_comida AS dm, ma_detalle_plan_comida AS pc, 
                ma_empleado_plan_comida_general AS pce 
            WHERE tc.id = ctc.id_comida AND dm.id_horario_comida = ctc.id AND pc.id_detalle_comida = dm.id 
                AND pc.extra = true AND pce.consumido = true AND pce.id_detalle_plan = pc.id AND 
                pc.fecha BETWEEN $1 AND $2 
            GROUP BY tc.nombre, ctc.id_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion
            `, [fec_inicio, fec_final]);
            if (DATOS.rowCount != 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'error' });
            }
        });
    }
    ListarExtrasSolConsumidos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fec_inicio, fec_final } = req.body;
            const DATOS = yield database_1.default.query(`
            SELECT tc.nombre AS comida_tipo, ctc.id_comida AS id_comida, 
                ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad,
                (COUNT(dm.nombre) * dm.valor) AS total 
            FROM e_cat_tipo_comida AS tc, ma_horario_comidas AS ctc, ma_detalle_comida AS dm, ma_solicitud_comida AS sc, 
                ma_empleado_plan_comida_general AS pce 
            WHERE tc.id = ctc.id_comida AND dm.id_horario_comida = ctc.id AND sc.id_detalle_comida = dm.id 
                AND sc.extra = true AND pce.consumido = true AND sc.fecha_comida BETWEEN $1 AND $2 AND 
                pce.id_solicitud_comida = sc.id 
            GROUP BY tc.nombre, ctc.id_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion
            `, [fec_inicio, fec_final]);
            if (DATOS.rowCount != 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'error' });
            }
        });
    }
    DetallarPlanificadosConsumidos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fec_inicio, fec_final } = req.body;
            const DATOS = yield database_1.default.query(`
            SELECT e.nombre, e.apellido, e.cedula, e.codigo, 
                tc.nombre AS comida_tipo, ctc.id_comida AS id_comida, 
                ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, 
                (COUNT(dm.nombre) * dm.valor) AS total 
            FROM e_cat_tipo_comida AS tc, ma_horario_comidas AS ctc, ma_detalle_comida AS dm, ma_detalle_plan_comida AS pc, 
                eu_empleados AS e, ma_empleado_plan_comida_general AS pce 
            WHERE tc.id = ctc.id_comida AND dm.id_horario_comida = ctc.id AND pc.id_detalle_comida = dm.id 
                AND pc.extra = false AND pce.consumido = true AND e.id = pce.id_empleado AND 
                pc.id = pce.id_detalle_plan AND pc.fecha BETWEEN $1 AND $2 
            GROUP BY tc.nombre, ctc.id_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion, e.nombre, 
                e.apellido, e.cedula, e.codigo ORDER BY e.apellido ASC
            `, [fec_inicio, fec_final]);
            if (DATOS.rowCount != 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    DetallarSolicitudConsumidos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fec_inicio, fec_final } = req.body;
            const DATOS = yield database_1.default.query(`
            SELECT e.nombre, e.apellido, e.cedula, e.codigo,
                tc.nombre AS comida_tipo, ctc.id_comida AS id_comida, 
                ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, 
                (COUNT(dm.nombre) * dm.valor) AS total 
            FROM e_cat_tipo_comida AS tc, ma_horario_comidas AS ctc, ma_detalle_comida AS dm, ma_solicitud_comida AS sc, 
                ma_empleado_plan_comida_general AS pce, eu_empleados AS e 
            WHERE tc.id = ctc.id_comida AND dm.id_horario_comida = ctc.id AND sc.id_detalle_comida = dm.id 
                AND sc.extra = false AND pce.consumido = true AND e.id = sc.id_empleado AND 
                sc.fecha_comida BETWEEN $1 AND $2  AND pce.id_solicitud_comida = sc.id 
            GROUP BY tc.nombre, ctc.id_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion, e.nombre, 
                e.apellido, e.cedula, e.codigo 
            ORDER BY e.apellido ASC
            `, [fec_inicio, fec_final]);
            if (DATOS.rowCount != 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    DetallarExtrasPlanConsumidos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fec_inicio, fec_final } = req.body;
            const DATOS = yield database_1.default.query(`
            SELECT e.nombre, e.apellido, e.cedula, e.codigo, 
                tc.nombre AS comida_tipo, ctc.id_comida AS id_comida, 
                ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, 
                (COUNT(dm.nombre) * dm.valor) AS total 
            FROM e_cat_tipo_comida AS tc, ma_horario_comidas AS ctc, ma_detalle_comida AS dm, ma_detalle_plan_comida AS pc, 
                eu_empleados AS e, ma_empleado_plan_comida_general AS pce 
            WHERE tc.id = ctc.id_comida AND dm.id_horario_comida = ctc.id AND pc.id_detalle_comida = dm.id 
                AND pc.extra = true AND pce.consumido = true AND e.id = pce.id_empleado AND 
                pc.id = pce.id_detalle_plan AND pc.fecha BETWEEN $1 AND $2 
            GROUP BY tc.nombre, ctc.id_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion, e.nombre, 
                e.apellido, e.cedula, e.codigo 
            ORDER BY e.apellido ASC
            `, [fec_inicio, fec_final]);
            if (DATOS.rowCount != 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'error' });
            }
        });
    }
    DetallarExtrasSolConsumidos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fec_inicio, fec_final } = req.body;
            const DATOS = yield database_1.default.query(`
            SELECT e.nombre, e.apellido, e.cedula, e.codigo,
                tc.nombre AS comida_tipo, ctc.id_comida AS id_comida, 
                ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, 
                (COUNT(dm.nombre) * dm.valor) AS total 
            FROM e_cat_tipo_comida AS tc, ma_horario_comidas AS ctc, ma_detalle_comida AS dm, ma_solicitud_comida AS sc, 
                ma_empleado_plan_comida_general AS pce, eu_empleados AS e 
            WHERE tc.id = ctc.id_comida AND dm.id_horario_comida = ctc.id AND sc.id_detalle_comida = dm.id 
                AND sc.extra = true AND pce.consumido = true AND e.id = sc.id_empleado AND 
                sc.fecha_comida BETWEEN $1 AND $2  AND pce.id_solicitud_comida = sc.id 
            GROUP BY tc.nombre, ctc.id_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion, e.nombre, 
                e.apellido, e.cedula, e.codigo 
            ORDER BY e.apellido ASC
            `, [fec_inicio, fec_final]);
            if (DATOS.rowCount != 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'error' });
            }
        });
    }
    DetallarServiciosInvitados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fec_inicio, fec_final } = req.body;
            const DATOS = yield database_1.default.query(`
            SELECT ci.nombre_invitado, ci.apellido_invitado, ci.cedula_invitado,
                tc.nombre AS comida_tipo, ctc.id_comida AS id_comida, ci.ticket, 
                ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, 
                (COUNT(dm.nombre) * dm.valor) AS total 
            FROM e_cat_tipo_comida AS tc, ma_horario_comidas AS ctc, ma_detalle_comida AS dm, ma_invitados_comida AS ci 
            WHERE tc.id = ctc.id_comida AND dm.id_horario_comida = ctc.id AND ci.id_detalle_comida = dm.id 
                AND ci.fecha BETWEEN $1 AND $2 
            GROUP BY tc.nombre, ctc.id_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion, 
                ci.nombre_invitado, ci.apellido_invitado, ci.cedula_invitado, ci.ticket
            `, [fec_inicio, fec_final]);
            if (DATOS.rowCount != 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'error' });
            }
        });
    }
    ReporteTimbresAlimentacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('datos recibidos', req.body);
            let { desde, hasta } = req.params;
            let datos = req.body;
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.departamentos = yield Promise.all(obj.departamentos.map((ele) => __awaiter(this, void 0, void 0, function* () {
                    ele.empleado = yield Promise.all(ele.empleado.map((o) => __awaiter(this, void 0, void 0, function* () {
                        const listaTimbres = yield BuscarAlimentacion(desde, hasta, o.codigo);
                        o.timbres = yield agruparTimbres(listaTimbres);
                        console.log('timbres:-------------------- ', o);
                        return o;
                    })));
                    return ele;
                })));
                return obj;
            })));
            let nuevo = n.map((obj) => {
                obj.departamentos = obj.departamentos.map((e) => {
                    e.empleado = e.empleado.filter((v) => { return v.timbres.length > 0; });
                    return e;
                }).filter((e) => { return e.empleado.length > 0; });
                return obj;
            }).filter(obj => { return obj.departamentos.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No se ha encontrado registro de faltas.' });
            return res.status(200).jsonp(nuevo);
        });
    }
    ReporteTimbresAlimentacionRegimenCargo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('datos recibidos', req.body);
            let { desde, hasta } = req.params;
            let datos = req.body;
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.empleados = yield Promise.all(obj.empleados.map((o) => __awaiter(this, void 0, void 0, function* () {
                    const listaTimbres = yield BuscarAlimentacion(desde, hasta, o.codigo);
                    o.timbres = yield agruparTimbres(listaTimbres);
                    console.log('Timbres: ', o);
                    return o;
                })));
                return obj;
            })));
            let nuevo = n.map((e) => {
                e.empleados = e.empleados.filter((t) => { return t.timbres.length > 0; });
                return e;
            }).filter(e => { return e.empleados.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No se ha encontrado registro de faltas.' });
            return res.status(200).jsonp(nuevo);
        });
    }
}
exports.ALIMENTACION_CONTROLADOR = new AlimentacionControlador();
exports.default = exports.ALIMENTACION_CONTROLADOR;
const BuscarAlimentacion = function (fec_inicio, fec_final, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query(`
        SELECT CAST(fecha_horario AS VARCHAR), CAST(fecha_hora_horario AS VARCHAR), CAST(fecha_hora_timbre AS VARCHAR),
            codigo, estado_timbre, tipo_accion AS accion, minutos_alimentacion 
        FROM eu_asistencia_general 
        WHERE CAST(fecha_hora_horario AS VARCHAR) BETWEEN $1 || \'%\' 
            AND ($2::timestamp + \'1 DAY\') || \'%\' AND codigo = $3 
            AND tipo_accion IN (\'I/A\', \'F/A\') 
        ORDER BY codigo, fecha_hora_horario ASC
        `, [fec_inicio, fec_final, codigo])
            .then(res => {
            return res.rows;
        });
    });
};
const agruparTimbres = function (listaTimbres) {
    return __awaiter(this, void 0, void 0, function* () {
        const timbresAgrupados = [];
        for (let i = 0; i < listaTimbres.length; i += 2) {
            timbresAgrupados.push({
                inicioAlimentacion: listaTimbres[i],
                finAlimentacion: i + 1 < listaTimbres.length ? listaTimbres[i + 1] : null
            });
        }
        return timbresAgrupados;
    });
};
