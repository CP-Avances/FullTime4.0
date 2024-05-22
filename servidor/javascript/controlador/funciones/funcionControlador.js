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
exports.FUNCIONES_CONTROLADOR = void 0;
const auditoriaControlador_1 = __importDefault(require("../auditoria/auditoriaControlador"));
const database_1 = __importDefault(require("../../database"));
class FuncionesControlador {
    // METODO PARA LISTAR FUNCIONES DEL SISTEMA
    ConsultarFunciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const FUNCIONES = yield database_1.default.query(`
            SELECT * FROM e_funciones
            `);
            if (FUNCIONES.rowCount > 0) {
                return res.jsonp(FUNCIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    RegistrarFunciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, hora_extra, accion_personal, alimentacion, permisos, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                yield database_1.default.query(`
                INSERT INTO e_funciones (id, hora_extra, accion_personal, alimentacion, permisos)
                VALUES ($1, $2, $3, $4, $5)
                `, [id, hora_extra, accion_personal, alimentacion, permisos]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'e_funciones',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{ id: ${id}, hora_extra: ${hora_extra}, accion_personal: ${accion_personal}, alimentacion: ${alimentacion}, permisos: ${permisos} }`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.jsonp({ message: 'Funciones Registradas' });
            }
            catch (error) {
                // REVERTIR TRNASACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'Error al registrar funciones' });
            }
        });
    }
    EditarFunciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { hora_extra, accion_personal, alimentacion, permisos, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // CONSULTAR DATOSORIGINALES
                const FUNCIONES = yield database_1.default.query('SELECT * FROM funciones WHERE id = $1', [id]);
                const datosOriginales = FUNCIONES.rows[0];
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'funciones',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar funciones con id ${id}`
                    });
                    // FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'error' });
                }
                yield database_1.default.query(`
                UPDATE e_funciones SET hora_extra = $2, accion_personal = $3, alimentacion = $4, ' +
                    permisos = $5 WHERE id = $1
                `, [id, hora_extra, accion_personal, alimentacion, permisos]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'funciones',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: `{ id: ${id}, hora_extra: ${hora_extra}, accion_personal: ${accion_personal}, alimentacion: ${alimentacion}, permisos: ${permisos} }`,
                    ip,
                    observacion: null
                });
                // FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Funciones Actualizados' });
            }
            catch (error) {
                // REVERTIR TRNASACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'Error al actualizar funciones' });
            }
        });
    }
}
exports.FUNCIONES_CONTROLADOR = new FuncionesControlador();
exports.default = exports.FUNCIONES_CONTROLADOR;
