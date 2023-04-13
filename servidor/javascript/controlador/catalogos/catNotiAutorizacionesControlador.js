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
exports.notificacionesAutorizacionesControlador = void 0;
const database_1 = __importDefault(require("../../database"));
class NotificacionesAutorizacionesControlador {
    ListarNotiAutorizaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const NOTI_AUTORIZACIONES = yield database_1.default.query('SELECT * FROM cg_noti_autorizaciones');
            if (NOTI_AUTORIZACIONES.rowCount > 0) {
                return res.jsonp(NOTI_AUTORIZACIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarPorNotificacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_notificacion;
            const NOTI_AUTORIZACIONES = yield database_1.default.query('SELECT n.id, n.orden, n.id_empl_cargo, ec.cargo, e.nombre, e.apellido FROM cg_noti_autorizaciones AS n, empl_cargos AS ec, empl_contratos AS c, empleados AS e WHERE n.id_notificacion = $1 AND ec.id = n.id_empl_cargo AND ec.id_empl_contrato = c.id AND c.id_empleado = e.id ', [id]);
            if (NOTI_AUTORIZACIONES.rowCount > 0) {
                return res.jsonp(NOTI_AUTORIZACIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ObtenerUnaNotiAutorizacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const NOTI_AUTORIZACIONES = yield database_1.default.query('SELECT * FROM cg_noti_autorizaciones WHERE id = $1', [id]);
            if (NOTI_AUTORIZACIONES.rowCount > 0) {
                return res.jsonp(NOTI_AUTORIZACIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    CrearNotiAutorizacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_notificacion, id_empl_cargo, orden } = req.body;
            yield database_1.default.query('INSERT INTO cg_noti_autorizaciones ( id_notificacion, id_empl_cargo, orden ) VALUES ($1, $2, $3)', [id_notificacion, id_empl_cargo, orden]);
            res.jsonp({ message: 'Hora extra guardada' });
        });
    }
}
exports.notificacionesAutorizacionesControlador = new NotificacionesAutorizacionesControlador();
exports.default = exports.notificacionesAutorizacionesControlador;
