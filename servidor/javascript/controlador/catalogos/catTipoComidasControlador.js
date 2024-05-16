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
class TipoComidasControlador {
    ListarTipoComidas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const TIPO_COMIDAS = yield database_1.default.query(`
            SELECT ctc.id, ctc.nombre, ctc.id_comida, ctc.hora_inicio, 
                ctc.hora_fin, tc.nombre AS tipo 
            FROM ma_horario_comidas AS ctc, ma_cat_comidas AS tc
            WHERE ctc.id_comida = tc.id
            ORDER BY tc.nombre ASC, ctc.id ASC
            `);
            if (TIPO_COMIDAS.rowCount > 0) {
                return res.jsonp(TIPO_COMIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    ListarTipoComidasDetalles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const TIPO_COMIDAS = yield database_1.default.query(`
            SELECT ctc.id, ctc.nombre, ctc.id_comida, ctc.hora_inicio, 
                ctc.hora_fin, tc.nombre AS tipo, dm.nombre AS nombre_plato, dm.valor, dm.observacion 
            FROM ma_horario_comidas AS ctc, ma_cat_comidas AS tc, ma_detalle_comida AS dm 
            WHERE ctc.id_comida = tc.id AND dm.id_horario_comida = ctc.id 
            ORDER BY tc.nombre ASC, ctc.id ASC
            `);
            if (TIPO_COMIDAS.rowCount > 0) {
                return res.jsonp(TIPO_COMIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    VerUnMenu(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const TIPO_COMIDAS = yield database_1.default.query(`
            SELECT ctc.id, ctc.nombre, ctc.id_comida, ctc.hora_inicio, ctc.hora_fin, tc.nombre AS tipo 
            FROM ma_horario_comidas AS ctc, ma_cat_comidas AS tc 
            WHERE ctc.id_comida = tc.id AND ctc.id = $1
            `, [id]);
            if (TIPO_COMIDAS.rowCount > 0) {
                return res.jsonp(TIPO_COMIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    ListarUnTipoComida(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const TIPO_COMIDAS = yield database_1.default.query(`
            SELECT ctc.id, ctc.nombre, ctc.id_comida, ctc.hora_inicio,
                ctc.hora_fin, tc.nombre AS tipo 
            FROM ma_horario_comidas AS ctc, ma_cat_comidas AS tc 
            WHERE ctc.id_comida = tc.id AND tc.id = $1 
            ORDER BY tc.nombre ASC
            `, [id]);
            if (TIPO_COMIDAS.rowCount > 0) {
                return res.jsonp(TIPO_COMIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    CrearTipoComidas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, tipo_comida, hora_inicio, hora_fin } = req.body;
            const response = yield database_1.default.query(`
            INSERT INTO ma_horario_comidas (nombre, id_comida, hora_inicio, hora_fin)
            VALUES ($1, $2, $3, $4) RETURNING *
            `, [nombre, tipo_comida, hora_inicio, hora_fin]);
            const [tipos_comida] = response.rows;
            if (!tipos_comida) {
                return res.status(404).jsonp({ message: 'error' });
            }
            else {
                return res.status(200).jsonp({ message: 'OK', info: tipos_comida });
            }
        });
    }
    ActualizarComida(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, tipo_comida, hora_inicio, hora_fin, id } = req.body;
            yield database_1.default.query(`
            UPDATE ma_horario_comidas SET nombre = $1, id_comida = $2, hora_inicio = $3, hora_fin = $4
            WHERE id = $5
            `, [nombre, tipo_comida, hora_inicio, hora_fin, id]);
            res.jsonp({ message: 'Registro actualizado exitosamente.' });
        });
    }
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                yield database_1.default.query(`
            DELETE FROM ma_horario_comidas WHERE id = $1
            `, [id]);
                res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    VerUltimoRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const TIPO_COMIDAS = yield database_1.default.query(`
            SELECT MAX (id) FROM ma_horario_comidas
            `);
            if (TIPO_COMIDAS.rowCount > 0) {
                return res.jsonp(TIPO_COMIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros,' });
            }
        });
    }
    // Registro de detalle de menú - desglose de platos
    CrearDetalleMenu(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, valor, observacion, id_menu } = req.body;
            yield database_1.default.query(`
            INSERT INTO ma_detalle_comida (nombre, valor, observacion, id_horario_comida)
            VALUES ($1, $2, $3, $4)
            `, [nombre, valor, observacion, id_menu]);
            res.jsonp({ message: 'Registro guardado.' });
        });
    }
    VerUnDetalleMenu(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const TIPO_COMIDAS = yield database_1.default.query(`
            SELECT tc.id AS id_servicio, tc.nombre AS servicio, 
                menu.id AS id_menu, menu.nombre AS menu, dm.id AS id_detalle, dm.nombre AS plato, dm.valor, 
                dm.observacion, menu.hora_inicio, menu.hora_fin 
            FROM ma_cat_comidas AS tc, ma_horario_comidas AS menu, ma_detalle_comida AS dm 
            WHERE tc.id = menu.id_comida AND dm.id_horario_comida = menu.id AND menu.id = $1
            `, [id]);
            if (TIPO_COMIDAS.rowCount > 0) {
                return res.jsonp(TIPO_COMIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    ActualizarDetalleMenu(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, valor, observacion, id } = req.body;
            yield database_1.default.query(`
            UPDATE ma_detalle_comida SET nombre = $1, valor = $2, observacion = $3
            WHERE id = $4
            `, [nombre, valor, observacion, id]);
            res.jsonp({ message: 'Registro actualizado.' });
        });
    }
    EliminarDetalle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield database_1.default.query(`
            DELETE FROM ma_detalle_comida WHERE id = $1
            `, [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
}
const TIPO_COMIDAS_CONTROLADOR = new TipoComidasControlador();
exports.default = TIPO_COMIDAS_CONTROLADOR;
