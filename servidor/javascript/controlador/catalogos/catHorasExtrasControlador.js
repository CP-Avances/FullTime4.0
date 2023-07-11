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
const fs_1 = __importDefault(require("fs"));
const database_1 = __importDefault(require("../../database"));
const builder = require('xmlbuilder');
class HorasExtrasControlador {
    ListarHorasExtras(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const HORAS_EXTRAS = yield database_1.default.query('SELECT * FROM cg_hora_extras');
            if (HORAS_EXTRAS.rowCount > 0) {
                return res.jsonp(HORAS_EXTRAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ObtenerUnaHoraExtra(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const HORAS_EXTRAS = yield database_1.default.query('SELECT * FROM cg_hora_extras WHERE id = $1', [id]);
            if (HORAS_EXTRAS.rowCount > 0) {
                return res.jsonp(HORAS_EXTRAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    CrearHoraExtra(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { descripcion, tipo_descuento, reca_porcentaje, hora_inicio, hora_final, hora_jornada, tipo_dia, codigo, incl_almuerzo, tipo_funcion } = req.body;
            const response = yield database_1.default.query(`
      INSERT INTO cg_hora_extras ( descripcion, tipo_descuento, reca_porcentaje, hora_inicio, hora_final, hora_jornada, 
        tipo_dia, codigo, incl_almuerzo, tipo_funcion ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
      `, [descripcion, tipo_descuento, reca_porcentaje, hora_inicio, hora_final, hora_jornada, tipo_dia, codigo, incl_almuerzo, tipo_funcion]);
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
            yield database_1.default.query('DELETE FROM cg_hora_extras WHERE id = $1', [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    FileXML(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var xml = builder.create('root').ele(req.body).end({ pretty: true });
            console.log(req.body.userName);
            let filename = "HorasExtras-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() + '.xml';
            fs_1.default.writeFile(`xmlDownload/${filename}`, xml, function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log("Archivo guardado");
            });
            res.jsonp({ text: 'XML creado', name: filename });
        });
    }
    downloadXML(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const name = req.params.nameXML;
            let filePath = `servidor\\xmlDownload\\${name}`;
            res.sendFile(__dirname.split("servidor")[0] + filePath);
        });
    }
    ActualizarHoraExtra(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { descripcion, tipo_descuento, reca_porcentaje, hora_inicio, hora_final, hora_jornada, tipo_dia, codigo, incl_almuerzo, tipo_funcion, id } = req.body;
            yield database_1.default.query('UPDATE cg_hora_extras SET descripcion = $1, tipo_descuento = $2, reca_porcentaje = $3, hora_inicio = $4, hora_final = $5, hora_jornada = $6, tipo_dia = $7, codigo = $8, incl_almuerzo = $9, tipo_funcion = $10 WHERE id = $11', [descripcion, tipo_descuento, reca_porcentaje, hora_inicio, hora_final, hora_jornada, tipo_dia, codigo, incl_almuerzo, tipo_funcion, id]);
            res.jsonp({ message: 'Hora extra actualizada' });
        });
    }
}
exports.horaExtraControlador = new HorasExtrasControlador();
exports.default = exports.horaExtraControlador;
