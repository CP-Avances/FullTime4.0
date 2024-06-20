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
exports.CIUDAD_FERIADO_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../database"));
class CiudadFeriadoControlador {
    // METODO PARA BUSCAR CIUDADES - PROVINCIA POR NOMBRE
    FiltrarCiudadesProvincia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.params;
            const CIUDAD_FERIADO = yield database_1.default.query(`
            SELECT c.id, c.descripcion, p.nombre, p.id AS id_prov
            FROM e_ciudades c, e_provincias p 
            WHERE c.id_provincia = p.id AND p.nombre = $1
            `, [nombre]);
            if (CIUDAD_FERIADO.rowCount != 0) {
                return res.jsonp(CIUDAD_FERIADO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    // METODO PARA BUSCAR NOMBRES DE CIUDADES
    EncontrarCiudadesFeriado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { idferiado } = req.params;
            const CIUDAD_FERIADO = yield database_1.default.query(`
            SELECT fe.id AS idferiado, fe.descripcion AS nombreferiado, cfe.id AS idciudad_asignada,
                c.id AS idciudad, c.descripcion AS nombreciudad
            FROM ef_cat_feriados fe, ef_ciudad_feriado cfe, e_ciudades c
            WHERE fe.id = cfe.id_feriado AND c.id = cfe.id_ciudad AND fe.id = $1
            `, [idferiado]);
            if (CIUDAD_FERIADO.rowCount != 0) {
                return res.jsonp(CIUDAD_FERIADO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTRO
    EliminarCiudadFeriado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield database_1.default.query(`
            DELETE FROM ef_ciudad_feriado WHERE id = $1
            `, [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    // METODO PARA BUSCAR ID DE CIUDADES
    ObtenerIdCiudades(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_feriado, id_ciudad } = req.body;
            const CIUDAD_FERIADO = yield database_1.default.query(`
            SELECT * FROM ef_ciudad_feriado WHERE id_feriado = $1 AND id_ciudad = $2
            `, [id_feriado, id_ciudad]);
            if (CIUDAD_FERIADO.rowCount != 0) {
                return res.jsonp(CIUDAD_FERIADO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
    // METODO PARA ASIGNAR CIUDADES A FERIADO
    AsignarCiudadFeriado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_feriado, id_ciudad } = req.body;
                const response = yield database_1.default.query(`
                INSERT INTO ef_ciudad_feriado (id_feriado, id_ciudad) VALUES ($1, $2) RETURNING *
                `, [id_feriado, id_ciudad]);
                const [feriado] = response.rows;
                if (feriado) {
                    return res.status(200).jsonp({ message: 'OK', reloj: feriado });
                }
                else {
                    return res.status(404).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                return res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA ACTUALIZAR REGISTRO
    ActualizarCiudadFeriado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_feriado, id_ciudad, id } = req.body;
            yield database_1.default.query(`
            UPDATE ef_ciudad_feriado SET id_feriado = $1, id_ciudad = $2 WHERE id = $3
            `, [id_feriado, id_ciudad, id]);
            res.jsonp({ message: 'Registro actualizado.' });
        });
    }
    ObtenerFeriadosCiudad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id_ciudad = req.params.id_ciudad;
            const CIUDAD_FERIADO = yield database_1.default.query(`
            SELECT * FROM ef_ciudad_feriado WHERE id_ciudad = $1
            `, [id_ciudad]);
            if (CIUDAD_FERIADO.rowCount != 0) {
                return res.jsonp(CIUDAD_FERIADO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        });
    }
}
exports.CIUDAD_FERIADO_CONTROLADOR = new CiudadFeriadoControlador();
exports.default = exports.CIUDAD_FERIADO_CONTROLADOR;
