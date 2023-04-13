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
exports.NOTIFICACIONES_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../database"));
class NotificacionesControlador {
    ListarPermisosEnviados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { envia } = req.params;
            const DATOS = yield database_1.default.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
                'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_permiso, e.nombre, e.apellido, e.cedula, ' +
                'ctp.descripcion AS permiso, p.fec_inicio, p.fec_final ' +
                'FROM realtime_noti AS rn, empleados AS e, permisos AS p, cg_tipo_permisos AS ctp ' +
                'WHERE id_permiso IS NOT null AND e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND ' +
                'p.id = rn.id_permiso AND p.id_tipo_permiso = ctp.id ORDER BY rn.id DESC', [envia]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarPermisosRecibidos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { recibe } = req.params;
            const DATOS = yield database_1.default.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
                'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_permiso, e.nombre, e.apellido, e.cedula, ' +
                'ctp.descripcion AS permiso, p.fec_inicio, p.fec_final ' +
                'FROM realtime_noti AS rn, empleados AS e, permisos AS p, cg_tipo_permisos AS ctp ' +
                'WHERE id_permiso IS NOT null AND e.id = rn.id_send_empl AND rn.id_receives_empl = $1 AND ' +
                'p.id = rn.id_permiso AND p.id_tipo_permiso = ctp.id ORDER BY rn.id DESC', [recibe]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarSolicitudHoraExtraEnviadas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { envia } = req.params;
            const DATOS = yield database_1.default.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
                'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_hora_extra, e.nombre, e.apellido, e.cedula, ' +
                'h.fec_inicio, h.fec_final, h.descripcion, h.num_hora, h.tiempo_autorizado ' +
                'FROM realtime_noti AS rn, empleados AS e, hora_extr_pedidos AS h ' +
                'WHERE rn.id_hora_extra IS NOT null AND e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND ' +
                'h.id = rn.id_hora_extra ORDER BY rn.id DESC', [envia]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarSolicitudHoraExtraRecibidas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { recibe } = req.params;
            const DATOS = yield database_1.default.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
                'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_hora_extra, e.nombre, e.apellido, e.cedula, ' +
                'h.fec_inicio, h.fec_final, h.descripcion, h.num_hora, h.tiempo_autorizado ' +
                'FROM realtime_noti AS rn, empleados AS e, hora_extr_pedidos AS h ' +
                'WHERE rn.id_hora_extra IS NOT null AND e.id = rn.id_send_empl AND rn.id_receives_empl = $1 AND ' +
                'h.id = rn.id_hora_extra ORDER BY rn.id DESC', [recibe]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarVacacionesEnviadas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { envia } = req.params;
            const DATOS = yield database_1.default.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
                'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_vacaciones, e.nombre, e.apellido, e.cedula, ' +
                'v.fec_inicio, v.fec_final, v.fec_ingreso ' +
                'FROM realtime_noti AS rn, empleados AS e, vacaciones AS v ' +
                'WHERE rn.id_vacaciones IS NOT null AND e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND ' +
                'v.id = rn.id_vacaciones ORDER BY rn.id DESC', [envia]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarVacacionesRecibidas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { recibe } = req.params;
            const DATOS = yield database_1.default.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
                'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_vacaciones, e.nombre, e.apellido, e.cedula, ' +
                'v.fec_inicio, v.fec_final, v.fec_ingreso ' +
                'FROM realtime_noti AS rn, empleados AS e, vacaciones AS v ' +
                'WHERE rn.id_vacaciones IS NOT null AND e.id = rn.id_send_empl AND rn.id_receives_empl = $1 AND ' +
                'v.id = rn.id_vacaciones ORDER BY rn.id DESC', [recibe]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarPlanificaComidaEnviadas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { envia } = req.params;
            const DATOS = yield database_1.default.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
                'rn.create_at, e.nombre, e.apellido, e.cedula, ' +
                'rn.descripcion ' +
                'FROM realtime_timbres AS rn, empleados AS e ' +
                'WHERE e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND rn.descripcion like \'Alimentación Planificada%\' ' +
                'ORDER BY rn.id DESC', [envia]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarPlanificacionesEliminadas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { envia } = req.params;
            const DATOS = yield database_1.default.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
                'rn.create_at, e.nombre, e.apellido, e.cedula, ' +
                'rn.descripcion ' +
                'FROM realtime_timbres AS rn, empleados AS e ' +
                'WHERE e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND rn.descripcion like \'Planificación de Alimentación Eliminada.\' ' +
                'ORDER BY rn.id DESC', [envia]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    // LISTAR USUARIOS
    ListarUsuariosPermisosEnviados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { envia } = req.params;
            const DATOS = yield database_1.default.query('SELECT DISTINCT rn.id_receives_empl AS id_empleado, rn.id_send_empl, ' +
                'e.nombre, e.apellido, e.cedula ' +
                'FROM realtime_noti AS rn, empleados AS e ' +
                'WHERE id_permiso IS NOT null AND e.id = rn.id_receives_empl AND rn.id_send_empl = $1 ' +
                'ORDER BY e.nombre ASC', [envia]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarUsuariosPermisosRecibidos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { recibe } = req.params;
            const DATOS = yield database_1.default.query('SELECT DISTINCT rn.id_send_empl AS id_empleado, rn.id_receives_empl, ' +
                'e.nombre, e.apellido, e.cedula ' +
                'FROM realtime_noti AS rn, empleados AS e ' +
                'WHERE id_permiso IS NOT null AND e.id = rn.id_send_empl AND rn.id_receives_empl = $1 ' +
                'ORDER BY e.nombre ASC', [recibe]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarUsuariosExtrasEnviados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { envia } = req.params;
            const DATOS = yield database_1.default.query('SELECT DISTINCT rn.id_receives_empl AS id_empleado, rn.id_send_empl, ' +
                'e.nombre, e.apellido, e.cedula ' +
                'FROM realtime_noti AS rn, empleados AS e ' +
                'WHERE rn.id_hora_extra IS NOT null AND e.id = rn.id_receives_empl AND rn.id_send_empl = $1 ' +
                'ORDER BY e.nombre ASC', [envia]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarUsuariosExtrasRecibidos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { recibe } = req.params;
            const DATOS = yield database_1.default.query('SELECT DISTINCT rn.id_send_empl AS id_empleado, rn.id_receives_empl, ' +
                'e.nombre, e.apellido, e.cedula ' +
                'FROM realtime_noti AS rn, empleados AS e ' +
                'WHERE rn.id_hora_extra IS NOT null AND e.id = rn.id_send_empl AND rn.id_receives_empl = $1 ' +
                'ORDER BY e.nombre ASC', [recibe]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarUsuariosVacacionesEnviadas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { envia } = req.params;
            const DATOS = yield database_1.default.query('SELECT DISTINCT rn.id_receives_empl AS id_empleado, rn.id_send_empl, ' +
                'e.nombre, e.apellido, e.cedula ' +
                'FROM realtime_noti AS rn, empleados AS e ' +
                'WHERE rn.id_vacaciones IS NOT null AND e.id = rn.id_receives_empl AND rn.id_send_empl = $1 ' +
                'ORDER BY e.nombre ASC', [envia]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarUsuariosVacacionesRecibidas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { recibe } = req.params;
            const DATOS = yield database_1.default.query('SELECT DISTINCT rn.id_send_empl AS id_empleado, rn.id_receives_empl, ' +
                'e.nombre, e.apellido, e.cedula ' +
                'FROM realtime_noti AS rn, empleados AS e ' +
                'WHERE rn.id_vacaciones IS NOT null AND e.id = rn.id_send_empl AND rn.id_receives_empl = $1 ' +
                'ORDER BY e.nombre ASC', [recibe]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarUsuariosComidasEnviadas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { envia } = req.params;
            const DATOS = yield database_1.default.query('SELECT DISTINCT rn.id_receives_empl AS id_empleado, rn.id_send_empl, ' +
                'e.nombre, e.apellido, e.cedula ' +
                'FROM realtime_timbres AS rn, empleados AS e ' +
                'WHERE e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND rn.descripcion like \'Alimentación Planificada%\' ' +
                'ORDER BY e.nombre ASC', [envia]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarUsuariosComidasRecibidas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { recibe } = req.params;
            const DATOS = yield database_1.default.query('SELECT DISTINCT rn.id_send_empl AS id_empleado, rn.id_receives_empl, ' +
                'e.nombre, e.apellido, e.cedula ' +
                'FROM realtime_timbres AS rn, empleados AS e ' +
                'WHERE e.id = rn.id_send_empl AND rn.id_receives_empl = $1 AND rn.descripcion like \'Solicitó Alimentación%\' ' +
                'ORDER BY e.nombre ASC', [recibe]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    // NOTIFICACIONES TOTALES DE USUARIOS
    ListarPermisosEnviados_Usuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { envia, id_empleado } = req.params;
            const DATOS = yield database_1.default.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
                'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_permiso, e.nombre, e.apellido, e.cedula, ' +
                'ctp.descripcion AS permiso, p.fec_inicio, p.fec_final ' +
                'FROM realtime_noti AS rn, empleados AS e, permisos AS p, cg_tipo_permisos AS ctp ' +
                'WHERE id_permiso IS NOT null AND e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND ' +
                'rn.id_receives_empl = $2 AND ' +
                'p.id = rn.id_permiso AND p.id_tipo_permiso = ctp.id ORDER BY rn.id DESC', [envia, id_empleado]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarPermisosRecibidos_Usuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { recibe, id_empleado } = req.params;
            const DATOS = yield database_1.default.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
                'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_permiso, e.nombre, e.apellido, e.cedula, ' +
                'ctp.descripcion AS permiso, p.fec_inicio, p.fec_final ' +
                'FROM realtime_noti AS rn, empleados AS e, permisos AS p, cg_tipo_permisos AS ctp ' +
                'WHERE id_permiso IS NOT null AND e.id = rn.id_send_empl AND rn.id_receives_empl = $1 AND ' +
                'rn.id_send_empl = $2 AND ' +
                'p.id = rn.id_permiso AND p.id_tipo_permiso = ctp.id ORDER BY rn.id DESC', [recibe, id_empleado]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarSolicitudHoraExtraEnviadas_Usuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { envia, id_empleado } = req.params;
            const DATOS = yield database_1.default.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
                'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_hora_extra, e.nombre, e.apellido, e.cedula, ' +
                'h.fec_inicio, h.fec_final, h.descripcion, h.num_hora, h.tiempo_autorizado ' +
                'FROM realtime_noti AS rn, empleados AS e, hora_extr_pedidos AS h ' +
                'WHERE rn.id_hora_extra IS NOT null AND e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND ' +
                'rn.id_receives_empl = $2 AND ' +
                'h.id = rn.id_hora_extra ORDER BY rn.id DESC', [envia, id_empleado]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarSolicitudHoraExtraRecibidas_Usuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { recibe, id_empleado } = req.params;
            const DATOS = yield database_1.default.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
                'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_hora_extra, e.nombre, e.apellido, e.cedula, ' +
                'h.fec_inicio, h.fec_final, h.descripcion, h.num_hora, h.tiempo_autorizado ' +
                'FROM realtime_noti AS rn, empleados AS e, hora_extr_pedidos AS h ' +
                'WHERE rn.id_hora_extra IS NOT null AND e.id = rn.id_send_empl AND rn.id_receives_empl = $1 AND ' +
                'rn.id_send_empl = $2 AND ' +
                'h.id = rn.id_hora_extra ORDER BY rn.id DESC', [recibe, id_empleado]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarVacacionesEnviadas_Usuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { envia, id_empleado } = req.params;
            const DATOS = yield database_1.default.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
                'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_vacaciones, e.nombre, e.apellido, e.cedula, ' +
                'v.fec_inicio, v.fec_final, v.fec_ingreso ' +
                'FROM realtime_noti AS rn, empleados AS e, vacaciones AS v ' +
                'WHERE rn.id_vacaciones IS NOT null AND e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND ' +
                'rn.id_receives_empl = $2 AND ' +
                'v.id = rn.id_vacaciones ORDER BY rn.id DESC', [envia, id_empleado]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarVacacionesRecibidas_Usuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { recibe, id_empleado } = req.params;
            const DATOS = yield database_1.default.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
                'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_vacaciones, e.nombre, e.apellido, e.cedula, ' +
                'v.fec_inicio, v.fec_final, v.fec_ingreso ' +
                'FROM realtime_noti AS rn, empleados AS e, vacaciones AS v ' +
                'WHERE rn.id_vacaciones IS NOT null AND e.id = rn.id_send_empl AND rn.id_receives_empl = $1 AND ' +
                'rn.id_send_empl = $2 AND ' +
                'v.id = rn.id_vacaciones ORDER BY rn.id DESC', [recibe, id_empleado]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarPlanificaComidaEnviadas_Usuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { envia, id_empleado } = req.params;
            const DATOS = yield database_1.default.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
                'rn.create_at, e.nombre, e.apellido, e.cedula, ' +
                'rn.descripcion ' +
                'FROM realtime_timbres AS rn, empleados AS e ' +
                'WHERE e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND rn.descripcion like \'Alimentación Planificada%\' ' +
                'AND rn.id_receives_empl = $2 ' +
                'ORDER BY rn.id DESC', [envia, id_empleado]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    // NOTIFICACIONES TOTALES DE USUARIOS FECHAS
    ListarPermisosEnviados_UsuarioFecha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { envia, id_empleado, fec_inicio, fec_final } = req.params;
            const DATOS = yield database_1.default.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
                'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_permiso, e.nombre, e.apellido, e.cedula, ' +
                'ctp.descripcion AS permiso, p.fec_inicio, p.fec_final ' +
                'FROM realtime_noti AS rn, empleados AS e, permisos AS p, cg_tipo_permisos AS ctp ' +
                'WHERE id_permiso IS NOT null AND e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND ' +
                'rn.id_receives_empl = $2 AND rn.create_at BETWEEN $3 AND $4 AND ' +
                'p.id = rn.id_permiso AND p.id_tipo_permiso = ctp.id ORDER BY rn.id DESC', [envia, id_empleado, fec_inicio, fec_final]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarPermisosRecibidos_UsuarioFecha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { recibe, id_empleado, fec_inicio, fec_final } = req.params;
            const DATOS = yield database_1.default.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
                'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_permiso, e.nombre, e.apellido, e.cedula, ' +
                'ctp.descripcion AS permiso, p.fec_inicio, p.fec_final ' +
                'FROM realtime_noti AS rn, empleados AS e, permisos AS p, cg_tipo_permisos AS ctp ' +
                'WHERE id_permiso IS NOT null AND e.id = rn.id_send_empl AND rn.id_receives_empl = $1 AND ' +
                'rn.id_send_empl = $2 AND rn.create_at BETWEEN $3 AND $4 AND ' +
                'p.id = rn.id_permiso AND p.id_tipo_permiso = ctp.id ORDER BY rn.id DESC', [recibe, id_empleado, fec_inicio, fec_final]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarSolicitudHoraExtraEnviadas_UsuarioFecha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { envia, id_empleado, fec_inicio, fec_final } = req.params;
            const DATOS = yield database_1.default.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
                'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_hora_extra, e.nombre, e.apellido, e.cedula, ' +
                'h.fec_inicio, h.fec_final, h.descripcion, h.num_hora, h.tiempo_autorizado ' +
                'FROM realtime_noti AS rn, empleados AS e, hora_extr_pedidos AS h ' +
                'WHERE rn.id_hora_extra IS NOT null AND e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND ' +
                'rn.id_receives_empl = $2 AND rn.create_at BETWEEN $3 AND $4 AND ' +
                'h.id = rn.id_hora_extra ORDER BY rn.id DESC', [envia, id_empleado, fec_inicio, fec_final]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarSolicitudHoraExtraRecibidas_UsuarioFecha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { recibe, id_empleado, fec_inicio, fec_final } = req.params;
            const DATOS = yield database_1.default.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
                'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_hora_extra, e.nombre, e.apellido, e.cedula, ' +
                'h.fec_inicio, h.fec_final, h.descripcion, h.num_hora, h.tiempo_autorizado ' +
                'FROM realtime_noti AS rn, empleados AS e, hora_extr_pedidos AS h ' +
                'WHERE rn.id_hora_extra IS NOT null AND e.id = rn.id_send_empl AND rn.id_receives_empl = $1 AND ' +
                'rn.id_send_empl = $2 AND rn.create_at BETWEEN $3 AND $4 AND ' +
                'h.id = rn.id_hora_extra ORDER BY rn.id DESC', [recibe, id_empleado, fec_inicio, fec_final]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarVacacionesEnviadas_UsuarioFecha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { envia, id_empleado, fec_inicio, fec_final } = req.params;
            const DATOS = yield database_1.default.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
                'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_vacaciones, e.nombre, e.apellido, e.cedula, ' +
                'v.fec_inicio, v.fec_final, v.fec_ingreso ' +
                'FROM realtime_noti AS rn, empleados AS e, vacaciones AS v ' +
                'WHERE rn.id_vacaciones IS NOT null AND e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND ' +
                'rn.id_receives_empl = $2 AND rn.create_at BETWEEN $3 AND $4 AND ' +
                'v.id = rn.id_vacaciones ORDER BY rn.id DESC', [envia, id_empleado, fec_inicio, fec_final]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarVacacionesRecibidas_UsuarioFecha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { recibe, id_empleado, fec_inicio, fec_final } = req.params;
            const DATOS = yield database_1.default.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
                'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_vacaciones, e.nombre, e.apellido, e.cedula, ' +
                'v.fec_inicio, v.fec_final, v.fec_ingreso ' +
                'FROM realtime_noti AS rn, empleados AS e, vacaciones AS v ' +
                'WHERE rn.id_vacaciones IS NOT null AND e.id = rn.id_send_empl AND rn.id_receives_empl = $1 AND ' +
                'rn.id_send_empl = $2 AND rn.create_at BETWEEN $3 AND $4 AND ' +
                'v.id = rn.id_vacaciones ORDER BY rn.id DESC', [recibe, id_empleado, fec_inicio, fec_final]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarPlanificaComidaEnviadas_UsuarioFecha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { envia, id_empleado, fec_inicio, fec_final } = req.params;
            const DATOS = yield database_1.default.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
                'rn.create_at, e.nombre, e.apellido, e.cedula, ' +
                'rn.descripcion ' +
                'FROM realtime_timbres AS rn, empleados AS e ' +
                'WHERE e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND rn.descripcion like \'Alimentación Planificada%\' ' +
                'AND rn.id_receives_empl = $2 AND rn.create_at BETWEEN $3 AND $4 ' +
                'ORDER BY rn.id DESC', [envia, id_empleado, fec_inicio, fec_final]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    // TODAS LAS NOTIFICACIONES CON FECHA
    ListarPermisosEnviados_Fecha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { envia } = req.params;
            const DATOS = yield database_1.default.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
                'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_permiso, e.nombre, e.apellido, e.cedula, ' +
                'ctp.descripcion AS permiso, p.fec_inicio, p.fec_final ' +
                'FROM realtime_noti AS rn, empleados AS e, permisos AS p, cg_tipo_permisos AS ctp ' +
                'WHERE id_permiso IS NOT null AND e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND ' +
                'p.id = rn.id_permiso AND p.id_tipo_permiso = ctp.id AND rn.create_at BETWEEN $2 AND $3 ORDER BY rn.id DESC', [envia]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarPermisosRecibidos_Fecha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { recibe } = req.params;
            const DATOS = yield database_1.default.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
                'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_permiso, e.nombre, e.apellido, e.cedula, ' +
                'ctp.descripcion AS permiso, p.fec_inicio, p.fec_final ' +
                'FROM realtime_noti AS rn, empleados AS e, permisos AS p, cg_tipo_permisos AS ctp ' +
                'WHERE id_permiso IS NOT null AND e.id = rn.id_send_empl AND rn.id_receives_empl = $1 AND ' +
                'p.id = rn.id_permiso AND p.id_tipo_permiso = ctp.id ORDER BY rn.id DESC', [recibe]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarSolicitudHoraExtraEnviadas_Fecha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { envia } = req.params;
            const DATOS = yield database_1.default.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
                'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_hora_extra, e.nombre, e.apellido, e.cedula, ' +
                'h.fec_inicio, h.fec_final, h.descripcion, h.num_hora, h.tiempo_autorizado ' +
                'FROM realtime_noti AS rn, empleados AS e, hora_extr_pedidos AS h ' +
                'WHERE rn.id_hora_extra IS NOT null AND e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND ' +
                'h.id = rn.id_hora_extra ORDER BY rn.id DESC', [envia]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarSolicitudHoraExtraRecibidas_Fecha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { recibe } = req.params;
            const DATOS = yield database_1.default.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
                'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_hora_extra, e.nombre, e.apellido, e.cedula, ' +
                'h.fec_inicio, h.fec_final, h.descripcion, h.num_hora, h.tiempo_autorizado ' +
                'FROM realtime_noti AS rn, empleados AS e, hora_extr_pedidos AS h ' +
                'WHERE rn.id_hora_extra IS NOT null AND e.id = rn.id_send_empl AND rn.id_receives_empl = $1 AND ' +
                'h.id = rn.id_hora_extra ORDER BY rn.id DESC', [recibe]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarVacacionesEnviadas_Fecha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { envia } = req.params;
            const DATOS = yield database_1.default.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
                'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_vacaciones, e.nombre, e.apellido, e.cedula, ' +
                'v.fec_inicio, v.fec_final, v.fec_ingreso ' +
                'FROM realtime_noti AS rn, empleados AS e, vacaciones AS v ' +
                'WHERE rn.id_vacaciones IS NOT null AND e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND ' +
                'v.id = rn.id_vacaciones ORDER BY rn.id DESC', [envia]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarVacacionesRecibidas_Fecha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { recibe } = req.params;
            const DATOS = yield database_1.default.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
                'rn.id_receives_depa, rn.estado, rn.create_at, rn.id_vacaciones, e.nombre, e.apellido, e.cedula, ' +
                'v.fec_inicio, v.fec_final, v.fec_ingreso ' +
                'FROM realtime_noti AS rn, empleados AS e, vacaciones AS v ' +
                'WHERE rn.id_vacaciones IS NOT null AND e.id = rn.id_send_empl AND rn.id_receives_empl = $1 AND ' +
                'v.id = rn.id_vacaciones ORDER BY rn.id DESC', [recibe]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarPlanificaComidaEnviadas_Fecha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { envia } = req.params;
            const DATOS = yield database_1.default.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
                'rn.create_at, e.nombre, e.apellido, e.cedula, ' +
                'rn.descripcion ' +
                'FROM realtime_timbres AS rn, empleados AS e ' +
                'WHERE e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND rn.descripcion like \'Alimentación Planificada%\' ' +
                'ORDER BY rn.id DESC', [envia]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarPlanificacionesEliminadas_Fecha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { envia } = req.params;
            const DATOS = yield database_1.default.query('SELECT rn.id, rn.id_send_empl, rn.id_receives_empl, ' +
                'rn.create_at, e.nombre, e.apellido, e.cedula, ' +
                'rn.descripcion ' +
                'FROM realtime_timbres AS rn, empleados AS e ' +
                'WHERE e.id = rn.id_receives_empl AND rn.id_send_empl = $1 AND rn.descripcion like \'Planificación de Alimentación Eliminada.\' ' +
                'ORDER BY rn.id DESC', [envia]);
            if (DATOS.rowCount > 0) {
                return res.jsonp(DATOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
}
exports.NOTIFICACIONES_CONTROLADOR = new NotificacionesControlador();
exports.default = exports.NOTIFICACIONES_CONTROLADOR;
