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
exports.UBICACION_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../../database"));
class UbicacionControlador {
    /** ************************************************************************************************ **
     ** **        REGISTRO TABLA CATALOGO DE UBICACIONES - COORDENADAS (cg_ubicaciones)               ** **
     ** ************************************************************************************************ **/
    // CREAR REGISTRO DE COORDENADAS GENERALES DE UBICACIÓN
    RegistrarCoordenadas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { latitud, longitud, descripcion } = req.body;
            const response = yield database_1.default.query(`
            INSERT INTO mg_cat_ubicaciones (latitud, longitud, descripcion)
            VALUES ($1, $2, $3) RETURNING *
            `, [latitud, longitud, descripcion]);
            const [coordenadas] = response.rows;
            if (coordenadas) {
                return res.status(200).jsonp({ message: 'OK', respuesta: coordenadas });
            }
            else {
                return res.status(404).jsonp({ message: 'error' });
            }
        });
    }
    // ACTUALIZAR REGISTRO DE COORDENADAS GENERALES DE UBICACIÓN
    ActualizarCoordenadas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { latitud, longitud, descripcion, id } = req.body;
            yield database_1.default.query(`
            UPDATE mg_cat_ubicaciones SET latitud = $1, longitud = $2, descripcion = $3
            WHERE id = $4
            `, [latitud, longitud, descripcion, id]);
            res.jsonp({ message: 'Registro guardado.' });
        });
    }
    // LISTAR TODOS LOS REGISTROS DE COORDENADAS GENERALES DE UBICACIÓN
    ListarCoordenadas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const UBICACIONES = yield database_1.default.query(`
            SELECT * FROM mg_cat_ubicaciones
            `);
            if (UBICACIONES.rowCount > 0) {
                return res.jsonp(UBICACIONES.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // LISTAR TODOS LOS REGISTROS DE COORDENADAS GENERALES DE UBICACIÓN CON EXCEPCIONES
    ListarCoordenadasDefinidas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const UBICACIONES = yield database_1.default.query(`
            SELECT * FROM mg_cat_ubicaciones WHERE NOT id = $1
            `, [id]);
            if (UBICACIONES.rowCount > 0) {
                return res.jsonp(UBICACIONES.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // LISTAR TODOS LOS REGISTROS DE COORDENADAS GENERALES DE UBICACIÓN
    ListarUnaCoordenada(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const UBICACIONES = yield database_1.default.query(`
            SELECT * FROM mg_cat_ubicaciones WHERE id = $1
            `, [id]);
            if (UBICACIONES.rowCount > 0) {
                return res.jsonp(UBICACIONES.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // BUSCAR ÚLTIMO REGISTRO DE COORDENADAS GENERALES DE UBICACIÓN
    BuscarUltimoRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const UBICACIONES = yield database_1.default.query(`
            SELECT MAX(id) AS id FROM mg_cat_ubicaciones
            `);
            if (UBICACIONES.rowCount > 0) {
                return res.jsonp(UBICACIONES.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // ELIMINAR REGISTRO DE COORDENADAS GENERALES DE UBICACIÓN
    EliminarCoordenadas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                yield database_1.default.query(`
                DELETE FROM mg_cat_ubicaciones WHERE id = $1
                `, [id]);
                res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (_a) {
                res.jsonp({ message: 'false' });
            }
        });
    }
    /** **************************************************************************************** **
     ** **        COORDENADAS DE UBICACION ASIGNADAS A UN USUARIO (empl_ubicacion)            ** **
     ** **************************************************************************************** **/
    // LISTAR REGISTROS DE COORDENADAS GENERALES DE UBICACION DE UN USUARIO
    ListarRegistroUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empl } = req.params;
            const UBICACIONES = yield database_1.default.query(`
            SELECT eu.id AS id_emplu, eu.codigo, eu.id_ubicacion, eu.id_empleado, cu.latitud, cu.longitud, 
                cu.descripcion 
            FROM mg_empleado_ubicacion AS eu, mg_cat_ubicaciones AS cu 
            WHERE eu.id_ubicacion = cu.id AND eu.id_empleado = $1
            `, [id_empl]);
            if (UBICACIONES.rowCount > 0) {
                return res.jsonp(UBICACIONES.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // ASIGNAR COORDENADAS GENERALES DE UBICACIÓN A LOS USUARIOS
    RegistrarCoordenadasUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { codigo, id_empl, id_ubicacion } = req.body;
            yield database_1.default.query(`
            INSERT INTO mg_empleado_ubicacion (codigo, id_empleado, id_ubicacion) 
            VALUES ($1, $2, $3)
            `, [codigo, id_empl, id_ubicacion]);
            res.jsonp({ message: 'Registro guardado.' });
        });
    }
    // LISTAR REGISTROS DE COORDENADAS GENERALES DE UNA UBICACIÓN 
    ListarRegistroUsuarioU(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id_ubicacion = req.params.id_ubicacion;
            const UBICACIONES = yield database_1.default.query(`
            SELECT eu.id AS id_emplu, eu.codigo, eu.id_ubicacion, eu.id_empleado, cu.latitud, cu.longitud, 
                cu.descripcion, e.nombre, e.apellido 
            FROM mg_empleado_ubicacion AS eu, mg_cat_ubicaciones AS cu, eu_empleados AS e 
            WHERE eu.id_ubicacion = cu.id AND e.codigo = eu.codigo AND cu.id = $1
            `, [id_ubicacion]);
            if (UBICACIONES.rowCount > 0) {
                return res.jsonp(UBICACIONES.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // ELIMINAR REGISTRO DE COORDENADAS GENERALES DE UBICACIÓN
    EliminarCoordenadasUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            yield database_1.default.query(`
            DELETE FROM mg_empleado_ubicacion WHERE id = $1
            `, [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
}
exports.UBICACION_CONTROLADOR = new UbicacionControlador();
exports.default = exports.UBICACION_CONTROLADOR;
