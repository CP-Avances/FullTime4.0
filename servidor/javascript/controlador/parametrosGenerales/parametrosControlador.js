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
const database_1 = __importDefault(require("../../database"));
class ParametrosControlador {
    // METODO PARA LISTAR PARAMETROS GENERALES
    ListarParametros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const PARAMETRO = yield database_1.default.query(`
            SELECT tp.id, tp.descripcion
            FROM ep_parametro AS tp
            `);
            if (PARAMETRO.rowCount > 0) {
                return res.jsonp(PARAMETRO.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    // METODO PARA ELIMINAR TIPO PARAMETRO GENERAL
    EliminarTipoParametro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                yield database_1.default.query(`
                DELETE FROM ep_parametro WHERE id = $1
                `, [id]);
                res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (_a) {
                res.jsonp({ message: 'false' });
            }
        });
    }
    // METODO PARA ACTUALIZAR TIPO PARAMETRO GENERAL
    ActualizarTipoParametro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { descripcion, id } = req.body;
            yield database_1.default.query(`
            UPDATE ep_parametro SET descripcion = $1 WHERE id = $2
            `, [descripcion, id]);
            res.jsonp({ message: 'Registro exitoso.' });
        });
    }
    // METODO PARA LISTAR UN PARAMETRO GENERALES
    ListarUnParametro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const PARAMETRO = yield database_1.default.query(`
            SELECT * FROM ep_parametro WHERE id = $1
            `, [id]);
            if (PARAMETRO.rowCount > 0) {
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
            if (PARAMETRO.rowCount > 0) {
                return res.jsonp(PARAMETRO.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // METODO PARA ELIMINAR DETALLE TIPO PARAMETRO GENERAL
    EliminarDetalleParametro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                yield database_1.default.query(`
                DELETE FROM detalle_tipo_parametro WHERE id = $1
                `, [id]);
                res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (_a) {
                res.jsonp({ message: 'false' });
            }
        });
    }
    // METODO PARA INGRESAR DETALLE TIPO PARAMETRO GENERAL
    IngresarDetalleParametro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_tipo, descripcion } = req.body;
            yield database_1.default.query(`
            INSERT INTO ep_detalle_parametro
            (id_parametro, descripcion) VALUES ($1, $2)
            `, [id_tipo, descripcion]);
            res.jsonp({ message: 'Registro exitoso.' });
        });
    }
    // METODO PARA ACTUALIZAR DETALLE TIPO PARAMETRO GENERAL
    ActualizarDetalleParametro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, descripcion } = req.body;
            yield database_1.default.query(`
            UPDATE ep_detalle_parametro SET descripcion = $1 WHERE id = $2
            `, [descripcion, id]);
            res.jsonp({ message: 'Registro exitoso.' });
        });
    }
    // METODO PARA INGRESAR TIPO PARAMETRO GENERAL
    IngresarTipoParametro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { descripcion } = req.body;
            const response = yield database_1.default.query(`
            INSERT INTO ep_parametro (descripcion) VALUES ($1) RETURNING *
            `, [descripcion]);
            const [parametro] = response.rows;
            if (parametro) {
                return res.status(200).jsonp({ message: 'OK', respuesta: parametro });
            }
            else {
                return res.status(404).jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA COMPARAR COORDENADAS
    CompararCoordenadas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { lat1, lng1, lat2, lng2, valor } = req.body;
                const VALIDACION = yield database_1.default.query(`
                SELECT CASE ( SELECT 1 WHERE 
                ($1::DOUBLE PRECISION  BETWEEN $3::DOUBLE PRECISION - $5 AND $3::DOUBLE PRECISION + $5) AND 
                ($2::DOUBLE PRECISION  BETWEEN $4::DOUBLE PRECISION - $5 AND $4::DOUBLE PRECISION + $5)) 
                IS null WHEN true THEN \'vacio\' ELSE \'ok\' END AS verificar
                `, [lat1, lng1, lat2, lng2, valor]);
                return res.jsonp(VALIDACION.rows);
            }
            catch (error) {
                return res.status(500)
                    .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
            }
        });
    }
}
exports.PARAMETROS_CONTROLADOR = new ParametrosControlador();
exports.default = exports.PARAMETROS_CONTROLADOR;
