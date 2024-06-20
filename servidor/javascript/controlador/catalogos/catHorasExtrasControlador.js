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
exports.horaExtraControlador = void 0;
const database_1 = __importDefault(require("../../database"));
class HorasExtrasControlador {
    ListarHorasExtras(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const HORAS_EXTRAS = yield database_1.default.query(`
      SELECT * FROM mhe_configurar_hora_extra
      `);
            if (HORAS_EXTRAS.rowCount != 0) {
                return res.jsonp(HORAS_EXTRAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    ObtenerUnaHoraExtra(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const HORAS_EXTRAS = yield database_1.default.query(`
      SELECT * FROM mhe_configurar_hora_extra WHERE id = $1
      `, [id]);
            if (HORAS_EXTRAS.rowCount != 0) {
                return res.jsonp(HORAS_EXTRAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    CrearHoraExtra(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { descripcion, tipo_descuento, reca_porcentaje, hora_inicio, hora_final, hora_jornada, tipo_dia, codigo, incl_almuerzo, tipo_funcion } = req.body;
            const response = yield database_1.default.query(`
      INSERT INTO mhe_configurar_hora_extra ( descripcion, tipo_descuento, recargo_porcentaje, hora_inicio, hora_final, 
        hora_jornada, tipo_dia, codigo, minutos_comida, tipo_funcion ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
      `, [descripcion, tipo_descuento, reca_porcentaje, hora_inicio, hora_final, hora_jornada, tipo_dia, codigo, incl_almuerzo,
                tipo_funcion]);
            const [HORA] = response.rows;
            if (HORA) {
                return res.status(200).jsonp(HORA);
            }
            else {
                return res.status(404).jsonp({ message: "error" });
            }
        });
    }
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield database_1.default.query(`
      DELETE FROM mhe_configurar_hora_extra WHERE id = $1
      `, [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    ActualizarHoraExtra(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { descripcion, tipo_descuento, reca_porcentaje, hora_inicio, hora_final, hora_jornada, tipo_dia, codigo, incl_almuerzo, tipo_funcion, id } = req.body;
            yield database_1.default.query(`
      UPDATE mhe_configurar_hora_extra SET descripcion = $1, tipo_descuento = $2, recargo_porcentaje = $3, hora_inicio = $4, 
        hora_final = $5, hora_jornada = $6, tipo_dia = $7, codigo = $8, minutos_comida = $9, tipo_funcion = $10 
      WHERE id = $11
      `, [descripcion, tipo_descuento, reca_porcentaje, hora_inicio, hora_final, hora_jornada, tipo_dia, codigo,
                incl_almuerzo, tipo_funcion, id]);
            res.jsonp({ message: 'Hora extra actualizada.' });
        });
    }
}
exports.horaExtraControlador = new HorasExtrasControlador();
exports.default = exports.horaExtraControlador;
