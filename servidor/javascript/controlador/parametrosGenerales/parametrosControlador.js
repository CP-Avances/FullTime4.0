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
exports.PARAMETROS_CONTROLADOR = void 0;
const auditoriaControlador_1 = __importDefault(require("../auditoria/auditoriaControlador"));
const database_1 = __importDefault(require("../../database"));
const settingsMail_1 = require("../../libs/settingsMail");
class ParametrosControlador {
    // METODO PARA LISTAR PARAMETROS GENERALES  **USADO
    ListarParametros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const PARAMETRO = yield database_1.default.query(`
            SELECT tp.id, tp.descripcion
            FROM ep_parametro AS tp
            `);
            if (PARAMETRO.rowCount != 0) {
                return res.jsonp(PARAMETRO.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    // METODO PARA LISTAR UN PARAMETRO GENERALES **USADO
    ListarUnParametro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const PARAMETRO = yield database_1.default.query(`
            SELECT * FROM ep_parametro WHERE id = $1
            `, [id]);
            if (PARAMETRO.rowCount != 0) {
                return res.jsonp(PARAMETRO.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    // METODO PARA LISTAR DETALLE DE PARAMETROS GENERALES
    VerDetalleParametro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const PARAMETRO = yield database_1.default.query(`
            SELECT tp.id AS id_tipo, tp.descripcion AS tipo, dtp.id AS id_detalle, dtp.descripcion
            FROM ep_parametro AS tp, ep_detalle_parametro AS dtp
            WHERE tp.id = dtp.id_parametro AND tp.id = $1
            `, [id]);
            if (PARAMETRO.rowCount != 0) {
                return res.jsonp(PARAMETRO.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // METODO PARA ELIMINAR DETALLE TIPO PARAMETRO GENERAL  **USADO
    EliminarDetalleParametro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_name, ip } = req.body;
                const id = req.params.id;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // OBTENER DATOSORIGINALES
                const consulta = yield database_1.default.query(`SELECT * FROM ep_detalle_parametro WHERE id = $1`, [id]);
                const [datosOriginales] = consulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ep_detalle_parametro',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al eliminar detalle tipo parametro con id ${id}`
                    });
                    //FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                yield database_1.default.query(`
                DELETE FROM ep_detalle_parametro WHERE id = $1
                `, [id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ep_detalle_parametro',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: '',
                    ip,
                    observacion: null
                });
                //FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (_a) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.jsonp({ message: 'false' });
            }
        });
    }
    // METODO PARA INGRESAR DETALLE TIPO PARAMETRO GENERAL  **USADO
    IngresarDetalleParametro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_tipo, descripcion, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                yield database_1.default.query(`
                INSERT INTO ep_detalle_parametro
                (id_parametro, descripcion) VALUES ($1, $2)
                `, [id_tipo, descripcion]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ep_detalle_parametro',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify({ id_tipo, descripcion }),
                    ip,
                    observacion: null
                });
                //FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                res.jsonp({ message: 'Registro exitoso.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA ACTUALIZAR DETALLE TIPO PARAMETRO GENERAL  **USADO
    ActualizarDetalleParametro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, descripcion, user_name, ip } = req.body;
                // INICIAR TRANSACCION
                yield database_1.default.query('BEGIN');
                // OBTENER DATOSORIGINALES
                const consulta = yield database_1.default.query(`SELECT * FROM ep_detalle_parametro WHERE id = $1`, [id]);
                const [datosOriginales] = consulta.rows;
                if (!datosOriginales) {
                    yield auditoriaControlador_1.default.InsertarAuditoria({
                        tabla: 'ep_detalle_parametro',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar detalle tipo parametro con id ${id}`
                    });
                    //FINALIZAR TRANSACCION
                    yield database_1.default.query('COMMIT');
                    return res.status(404).jsonp({ message: 'Registro no encontrado.' });
                }
                const datosNuevos = yield database_1.default.query(`
                UPDATE ep_detalle_parametro SET descripcion = $1 WHERE id = $2 RETURNING *
                `, [descripcion, id]);
                // AUDITORIA
                yield auditoriaControlador_1.default.InsertarAuditoria({
                    tabla: 'ep_detalle_parametro',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(datosNuevos.rows[0]),
                    ip,
                    observacion: null
                });
                //FINALIZAR TRANSACCION
                yield database_1.default.query('COMMIT');
                return res.jsonp({ message: 'Registro exitoso.' });
            }
            catch (error) {
                // REVERTIR TRANSACCION
                yield database_1.default.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA COMPARAR COORDENADAS    **USADO
    CompararCoordenadas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { lat1, lng1, lat2, lng2, valor } = req.body;
                if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2) || isNaN(valor)) {
                    return res.status(400).jsonp({ message: 'error' });
                }
                const RADIO_TIERRA = 6371; // RADIO DE LA TIERRA EN KILOMETROS
                const VALIDACION = yield database_1.default.query(`
                SELECT CASE 
                    WHEN (
                        ${RADIO_TIERRA} * ACOS(
                            COS(RADIANS($1)) * COS(RADIANS($3)) * COS(RADIANS($4) - RADIANS($2)) + 
                            SIN(RADIANS($1)) * SIN(RADIANS($3))
                        ) * 1000 -- Convertir a metros
                        ) <= $5 THEN 'ok'
                    ELSE 'vacio'
                    END AS verificar
                `, [lat1, lng1, lat2, lng2, valor]);
                console.log("ver datos body de  CompararCoordenadas: ", req.body);
                return res.jsonp(VALIDACION.rows);
            }
            catch (error) {
                console.log('error --> ', error);
                return res.status(500)
                    .jsonp({ message: 'error_500' });
            }
        });
    }
    //--------------------------------- METODO DE APP MOVIL ---------------------------------------------------------------------------------------- 
    BuscarFechasHoras(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let formato_fecha = yield (0, settingsMail_1.BuscarFecha)();
                let formato_hora = yield (0, settingsMail_1.BuscarHora)();
                let formatos = {
                    fecha: formato_fecha.fecha,
                    hora: formato_hora.hora
                };
                return res.jsonp(formatos);
            }
            catch (error) {
                console.log(error);
                return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
            }
        });
    }
    ;
}
exports.PARAMETROS_CONTROLADOR = new ParametrosControlador();
exports.default = exports.PARAMETROS_CONTROLADOR;
