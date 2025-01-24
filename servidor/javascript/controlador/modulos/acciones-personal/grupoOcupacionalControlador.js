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
exports.GRUPO_OCUPACIONAL_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../../database"));
class GrupoOcupacionalControlador {
    // METODO PARA BUSCAR LISTA DE GRADOS
    listaGrupoOcupacional(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const GRUPO_OCUPACIONAL = yield database_1.default.query(`
      SELECT gp.id, gp.descripcion, gp.numero_partida FROM map_cat_grupo_ocupacional AS gp 
      ORDER BY gp.id DESC
      `);
            res.jsonp(GRUPO_OCUPACIONAL.rows);
        });
    }
}
exports.GRUPO_OCUPACIONAL_CONTROLADOR = new GrupoOcupacionalControlador();
exports.default = exports.GRUPO_OCUPACIONAL_CONTROLADOR;
