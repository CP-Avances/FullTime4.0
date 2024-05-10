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
exports.AUDITORIA_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../database"));
class AuditoriaControlador {
    BuscarDatosAuditoria(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tabla, desde, hasta } = req.body;
            const DATOS = yield database_1.default.query('SELECT schema_name, table_name, user_name, action_tstamp, ' +
                'action, original_data, new_data, ip FROM audit.auditoria WHERE table_name = $1 ' +
                'AND action_tstamp::date BETWEEN $2 AND $3 ORDER BY action_tstamp::date DESC', [tabla, desde, hasta]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    // INSERTAR REGISTRO DE AUDITORIA
    InsertarAuditoria(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { tabla, usuario, accion, datosOriginales, datosNuevos, ip, observacion } = data;
                console.log(data);
                yield database_1.default.query('INSERT INTO audit.auditoria (schema_name, table_name, user_name, action_tstamp, ' +
                    'action, original_data, new_data, ip, observacion) VALUES ($1, $2, $3, now(), $4, $5, $6, $7, $8)', ['public', tabla, usuario, accion, datosOriginales, datosNuevos, ip, observacion]);
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.AUDITORIA_CONTROLADOR = new AuditoriaControlador();
exports.default = exports.AUDITORIA_CONTROLADOR;
