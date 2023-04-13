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
const database_1 = __importDefault(require("../../database"));
class NotificacionesControlador {
    ListarNotificaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const NOTIFICACIONES = yield database_1.default.query('SELECT cn.tipo, cn.nivel, cn.id, cd.nombre, ctp.descripcion, cd.id AS departamento, ctp.id AS tipo_permiso FROM cg_notificaciones AS cn, cg_departamentos AS cd, cg_tipo_permisos AS ctp WHERE cn.id_departamento = cd.id AND cn.id_tipo_permiso = ctp.id AND NOT cd.nombre = \'Ninguno\' ORDER BY cd.nombre ASC');
            if (NOTIFICACIONES.rowCount > 0) {
                return res.jsonp(NOTIFICACIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarNotiByDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id_depa = req.params.id_depa;
            const NOTIFICACIONES = yield database_1.default.query('SELECT cn.tipo, cn.nivel, cn.id, cd.nombre, ctp.descripcion, cd.id AS departamento, ctp.id AS tipo_permiso FROM cg_notificaciones AS cn, cg_departamentos AS cd, cg_tipo_permisos AS ctp WHERE cn.id_departamento = cd.id AND cn.id_tipo_permiso = ctp.id AND NOT cd.nombre = \'Ninguno\' AND cn.id_departamento = $1  ORDER BY cd.nombre ASC', [id_depa]);
            if (NOTIFICACIONES.rowCount > 0) {
                return res.jsonp(NOTIFICACIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    NotificacionLista(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const NOTIFICACIONES = yield database_1.default.query('SELECT e.id AS empresa, e.nombre AS nom_emp, s.id AS sucursal, s.nombre AS nom_suc, d.id AS departamento, d.nombre AS nom_depa, d.nivel FROM cg_empresa AS e, sucursales AS s, cg_departamentos AS d WHERE e.id = s.id_empresa AND s.id = d.id_sucursal');
            if (NOTIFICACIONES.rowCount > 0) {
                return res.jsonp(NOTIFICACIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ObtenerUnaNotificacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const NOTIFICACIONES = yield database_1.default.query('SELECT * FROM cg_notificaciones WHERE id = $1', [id]);
            if (NOTIFICACIONES.rowCount > 0) {
                return res.jsonp(NOTIFICACIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    CrearNotificacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { tipo, nivel, id_departamento, id_tipo_permiso } = req.body;
                yield database_1.default.query('INSERT INTO cg_notificaciones ( tipo, nivel, id_departamento, id_tipo_permiso ) VALUES ($1, $2, $3, $4)', [tipo, nivel, id_departamento, id_tipo_permiso]);
                res.jsonp({ message: 'Notificación guardada' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    ObtenerNotificacionPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_tipo_permiso } = req.params;
            const NOTIFICACIONES = yield database_1.default.query('SELECT * FROM cg_notificaciones WHERE id_tipo_permiso = $1', [id_tipo_permiso]);
            if (NOTIFICACIONES.rowCount > 0) {
                return res.jsonp(NOTIFICACIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
}
const NOTIFICACIONES_CONTROLADOR = new NotificacionesControlador();
exports.default = NOTIFICACIONES_CONTROLADOR;
