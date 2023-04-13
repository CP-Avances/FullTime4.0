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
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const notificacion = yield database_1.default.query('SELECT * FROM cg_notificaciones');
            res.json(notificacion.rows);
        });
    }
    getOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const unaNotificacion = yield database_1.default.query('SELECT * FROM cg_notificaciones WHERE id = $1', [id]);
            if (unaNotificacion.rowCount > 0) {
                return res.json(unaNotificacion.rows);
            }
            res.status(404).json({ text: 'Notificacion no encontrada' });
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tipo, nivel, id_departamento, id_tipo_permiso } = req.body;
            yield database_1.default.query('INSERT INTO cg_notificaciones ( tipo, nivel, id_departamento, id_tipo_permiso ) VALUES ($1, $2, $3, $4)', [tipo, nivel, id_departamento, id_tipo_permiso]);
            console.log(req.body);
            res.json({ message: 'Notificacion guardada' });
        });
    }
}
const NOTIFICACIONES_CONTROLADOR = new NotificacionesControlador();
exports.default = NOTIFICACIONES_CONTROLADOR;
