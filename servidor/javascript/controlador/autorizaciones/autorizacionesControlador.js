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
exports.AUTORIZACION_CONTROLADOR = void 0;
const auditoriaControlador_1 = require("../reportes/auditoriaControlador");
const database_1 = __importDefault(require("../../database"));
class AutorizacionesControlador {
    CrearAutorizacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { orden, estado, id_departamento, id_permiso, id_vacacion, id_hora_extra, id_plan_hora_extra, id_documento, user_name, ip, ip_local } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                const autorizacion = yield database_1.default.query(`
                INSERT INTO ecm_autorizaciones (orden, estado, id_departamento, 
                    id_permiso, id_vacacion, id_hora_extra, id_plan_hora_extra, id_autoriza_estado) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
                `, [orden, estado, id_departamento, id_permiso, id_vacacion, id_hora_extra,
                    id_plan_hora_extra, id_documento]);
                const [datosNuevos] = autorizacion.rows;
                // REGISTRAR AUDITORIA
                yield auditoriaControlador_1.AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'ecm_autorizaciones',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(datosNuevos),
                    ip: ip,
                    ip_local: ip_local,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Autorizacion guardado.' });
            }
            catch (error) {
                // CANCELAR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ text: 'error' });
            }
        });
    }
}
exports.AUTORIZACION_CONTROLADOR = new AutorizacionesControlador();
exports.default = exports.AUTORIZACION_CONTROLADOR;
