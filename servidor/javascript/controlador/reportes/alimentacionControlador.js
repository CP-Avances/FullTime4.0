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
            const DATOS = yield database_1.default.query('SELECT tc.nombre AS comida_tipo, ctc.tipo_comida AS id_comida, ' +
                'ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, ' +
                '(COUNT(dm.nombre) * dm.valor) AS total ' +
                'FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm, plan_comidas AS pc, ' +
                'plan_comida_empleado AS pce ' +
                'WHERE tc.id = ctc.tipo_comida AND dm.id_menu = ctc.id AND pc.id_comida = dm.id ' +
                'AND pc.extra = false AND pce.consumido = true AND pce.id_plan_comida = pc.id AND ' +
                'pce.fecha BETWEEN $1 AND $2 ' +
                'GROUP BY tc.nombre, ctc.tipo_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion', [fec_inicio, fec_final]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarSolicitadosConsumidos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fec_inicio, fec_final } = req.body;
            const DATOS = yield database_1.default.query('SELECT tc.nombre AS comida_tipo, ctc.tipo_comida AS id_comida, ' +
                'ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, ' +
                '(COUNT(dm.nombre) * dm.valor) AS total ' +
                'FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm, solicita_comidas AS sc, ' +
                'plan_comida_empleado AS pce ' +
                'WHERE tc.id = ctc.tipo_comida AND dm.id_menu = ctc.id AND sc.id_comida = dm.id ' +
                'AND sc.extra = false AND pce.consumido = true AND sc.fec_comida BETWEEN $1 AND $2 AND ' +
                'pce.id_sol_comida = sc.id ' +
                'GROUP BY tc.nombre, ctc.tipo_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion', [fec_inicio, fec_final]);
            if (DATOS.rowCount > 0) {
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
            const DATOS = yield database_1.default.query('SELECT tc.nombre AS comida_tipo, ctc.tipo_comida AS id_comida, ' +
                'ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, ' +
                '(COUNT(dm.nombre) * dm.valor) AS total ' +
                'FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm, plan_comidas AS pc, ' +
                'plan_comida_empleado AS pce ' +
                'WHERE tc.id = ctc.tipo_comida AND dm.id_menu = ctc.id AND pc.id_comida = dm.id ' +
                'AND pc.extra = true AND pce.consumido = true AND pce.id_plan_comida = pc.id AND ' +
                'pc.fecha BETWEEN $1 AND $2 ' +
                'GROUP BY tc.nombre, ctc.tipo_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion', [fec_inicio, fec_final]);
            if (DATOS.rowCount > 0) {
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
            const DATOS = yield database_1.default.query('SELECT tc.nombre AS comida_tipo, ctc.tipo_comida AS id_comida, ' +
                'ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, ' +
                '(COUNT(dm.nombre) * dm.valor) AS total ' +
                'FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm, solicita_comidas AS sc, ' +
                'plan_comida_empleado AS pce ' +
                'WHERE tc.id = ctc.tipo_comida AND dm.id_menu = ctc.id AND sc.id_comida = dm.id ' +
                'AND sc.extra = true AND pce.consumido = true AND sc.fec_comida BETWEEN $1 AND $2 AND ' +
                'pce.id_sol_comida = sc.id ' +
                'GROUP BY tc.nombre, ctc.tipo_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion', [fec_inicio, fec_final]);
            if (DATOS.rowCount > 0) {
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
            const DATOS = yield database_1.default.query('SELECT e.nombre, e.apellido, e.cedula, e.codigo, ' +
                'tc.nombre AS comida_tipo, ctc.tipo_comida AS id_comida, ' +
                'ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, ' +
                '(COUNT(dm.nombre) * dm.valor) AS total ' +
                'FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm, plan_comidas AS pc, ' +
                'empleados AS e, plan_comida_empleado AS pce ' +
                'WHERE tc.id = ctc.tipo_comida AND dm.id_menu = ctc.id AND pc.id_comida = dm.id ' +
                'AND pc.extra = false AND pce.consumido = true AND e.id = pce.id_empleado AND ' +
                'pc.id = pce.id_plan_comida AND pc.fecha BETWEEN $1 AND $2 ' +
                'GROUP BY tc.nombre, ctc.tipo_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion, e.nombre, ' +
                'e.apellido, e.cedula, e.codigo ORDER BY e.apellido ASC', [fec_inicio, fec_final]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    DetallarSolicitudConsumidos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fec_inicio, fec_final } = req.body;
            const DATOS = yield database_1.default.query('SELECT e.nombre, e.apellido, e.cedula, e.codigo, ' +
                'tc.nombre AS comida_tipo, ctc.tipo_comida AS id_comida, ' +
                'ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, ' +
                '(COUNT(dm.nombre) * dm.valor) AS total ' +
                'FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm, solicita_comidas AS sc, ' +
                'plan_comida_empleado AS pce, empleados AS e ' +
                'WHERE tc.id = ctc.tipo_comida AND dm.id_menu = ctc.id AND sc.id_comida = dm.id ' +
                'AND sc.extra = false AND pce.consumido = true AND e.id = sc.id_empleado AND ' +
                'sc.fec_comida BETWEEN $1 AND $2  AND pce.id_sol_comida = sc.id ' +
                'GROUP BY tc.nombre, ctc.tipo_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion, e.nombre, ' +
                'e.apellido, e.cedula, e.codigo ORDER BY e.apellido ASC', [fec_inicio, fec_final]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    DetallarExtrasPlanConsumidos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fec_inicio, fec_final } = req.body;
            const DATOS = yield database_1.default.query('SELECT e.nombre, e.apellido, e.cedula, e.codigo, ' +
                'tc.nombre AS comida_tipo, ctc.tipo_comida AS id_comida, ' +
                'ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, ' +
                '(COUNT(dm.nombre) * dm.valor) AS total ' +
                'FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm, plan_comidas AS pc, ' +
                'empleados AS e, plan_comida_empleado AS pce ' +
                'WHERE tc.id = ctc.tipo_comida AND dm.id_menu = ctc.id AND pc.id_comida = dm.id ' +
                'AND pc.extra = true AND pce.consumido = true AND e.id = pce.id_empleado AND ' +
                'pc.id = pce.id_plan_comida AND pc.fecha BETWEEN $1 AND $2 ' +
                'GROUP BY tc.nombre, ctc.tipo_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion, e.nombre, ' +
                'e.apellido, e.cedula, e.codigo ORDER BY e.apellido ASC', [fec_inicio, fec_final]);
            if (DATOS.rowCount > 0) {
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
            const DATOS = yield database_1.default.query('SELECT e.nombre, e.apellido, e.cedula, e.codigo, ' +
                'tc.nombre AS comida_tipo, ctc.tipo_comida AS id_comida, ' +
                'ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, ' +
                '(COUNT(dm.nombre) * dm.valor) AS total ' +
                'FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm, solicita_comidas AS sc, ' +
                'plan_comida_empleado AS pce, empleados AS e ' +
                'WHERE tc.id = ctc.tipo_comida AND dm.id_menu = ctc.id AND sc.id_comida = dm.id ' +
                'AND sc.extra = true AND pce.consumido = true AND e.id = sc.id_empleado AND ' +
                'sc.fec_comida BETWEEN $1 AND $2  AND pce.id_sol_comida = sc.id ' +
                'GROUP BY tc.nombre, ctc.tipo_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion, e.nombre, ' +
                'e.apellido, e.cedula, e.codigo ORDER BY e.apellido ASC', [fec_inicio, fec_final]);
            if (DATOS.rowCount > 0) {
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
            const DATOS = yield database_1.default.query('SELECT ci.nombre_invitado, ci.apellido_invitado, ci.cedula_invitado, ' +
                'tc.nombre AS comida_tipo, ctc.tipo_comida AS id_comida, ci.ticket, ' +
                'ctc.nombre AS menu, dm.nombre AS plato, dm.valor, dm.observacion, COUNT(dm.nombre) AS cantidad, ' +
                '(COUNT(dm.nombre) * dm.valor) AS total ' +
                'FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm, comida_invitados AS ci ' +
                'WHERE tc.id = ctc.tipo_comida AND dm.id_menu = ctc.id AND ci.id_detalle_menu = dm.id ' +
                'AND ci.fecha BETWEEN $1 AND $2 ' +
                'GROUP BY tc.nombre, ctc.tipo_comida, ctc.nombre, dm.nombre, dm.valor, dm.observacion, ' +
                'ci.nombre_invitado, ci.apellido_invitado, ci.cedula_invitado, ci.ticket', [fec_inicio, fec_final]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'error' });
            }
        });
    }
}
exports.ALIMENTACION_CONTROLADOR = new AlimentacionControlador();
exports.default = exports.ALIMENTACION_CONTROLADOR;
