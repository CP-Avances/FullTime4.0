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
const database_1 = __importDefault(require("../../database"));
class AutorizacionesControlador {
    // METODO PARA BUSCAR AUTORIZACIONES DE PERMISOS
    ObtenerAutorizacionPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_permiso;
            const AUTORIZACIONES = yield database_1.default.query(`
            SELECT * FROM ecm_autorizaciones WHERE id_permiso = $1
            `, [id]);
            if (AUTORIZACIONES.rowCount > 0) {
                return res.jsonp(AUTORIZACIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    ObtenerAutorizacionByVacacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_vacacion;
            const AUTORIZACIONES = yield database_1.default.query(`
            SELECT * FROM ecm_autorizaciones WHERE id_vacacion = $1
            `, [id]);
            if (AUTORIZACIONES.rowCount > 0) {
                return res.jsonp(AUTORIZACIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    ObtenerAutorizacionByHoraExtra(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_hora_extra;
            const AUTORIZACIONES = yield database_1.default.query(`
            SELECT * FROM ecm_autorizaciones WHERE id_hora_extra = $1
            `, [id]);
            if (AUTORIZACIONES.rowCount > 0) {
                return res.jsonp(AUTORIZACIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    CrearAutorizacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { orden, estado, id_departamento, id_permiso, id_vacacion, id_hora_extra, id_plan_hora_extra, id_documento } = req.body;
            yield database_1.default.query(`
            INSERT INTO ecm_autorizaciones (orden, estado, id_departamento, 
                id_permiso, id_vacacion, id_hora_extra, id_plan_hora_extra, id_autoriza_estado) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [orden, estado, id_departamento, id_permiso, id_vacacion, id_hora_extra,
                id_plan_hora_extra, id_documento]);
            res.jsonp({ message: 'Autorización guardada.' });
        });
    }
    ActualizarEstadoAutorizacionPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_documento, estado, id_permiso } = req.body;
            yield database_1.default.query(`
            UPDATE ecm_autorizaciones SET estado = $1, id_autoriza_estado = $2 WHERE id_permiso = $3
            `, [estado, id_documento, id_permiso]);
            res.jsonp({ message: 'Autorización guardada.' });
        });
    }
    /** ***************************************************************************************************** **
     ** **                METODO DE CAMBIO DE ESTADO DE APROBACIONES DE SOLICITUDES                        ** **
     ** ***************************************************************************************************** **/
    // METODO DE APROBACION DE SOLICITUD DE PERMISO
    ActualizarEstadoSolicitudes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const { id_documento, estado } = req.body;
            yield database_1.default.query(`
            UPDATE ecm_autorizaciones SET estado = $1, id_autoriza_estado = $2 
            WHERE id = $3
            `, [estado, id_documento, id]);
            res.jsonp({ message: 'Registro exitoso.' });
        });
    }
}
exports.AUTORIZACION_CONTROLADOR = new AutorizacionesControlador();
exports.default = exports.AUTORIZACION_CONTROLADOR;
