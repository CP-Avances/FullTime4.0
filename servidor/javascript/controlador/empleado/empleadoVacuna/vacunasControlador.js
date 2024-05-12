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
exports.VACUNAS_CONTROLADOR = void 0;
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
const moment_1 = __importDefault(require("moment"));
const database_1 = __importDefault(require("../../../database"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class VacunasControlador {
    // LISTAR REGISTROS DE VACUNACIÓN DEL EMPLEADO POR SU ID
    ListarUnRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const VACUNA = yield database_1.default.query(`
            SELECT ev.id, ev.id_empleado, ev.id_vacuna, ev.carnet, ev.fecha, tv.nombre, ev.descripcion
            FROM eu_empleado_vacunas AS ev, e_cat_vacuna AS tv 
            WHERE ev.id_vacuna = tv.id AND ev.id_empleado = $1
            ORDER BY ev.id DESC
            `, [id_empleado]);
            if (VACUNA.rowCount > 0) {
                return res.jsonp(VACUNA.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // LISTAR REGISTRO TIPO DE VACUNA
    ListarTipoVacuna(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const VACUNA = yield database_1.default.query(`
            SELECT * FROM e_cat_vacuna
            `);
            if (VACUNA.rowCount > 0) {
                return res.jsonp(VACUNA.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // METODO PARA BUSCAR VACUNA POR FECHA Y TIPO
    BuscarVacunaFechaTipo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado, id_vacuna, fecha } = req.body;
            const VACUNA = yield database_1.default.query(`
            SELECT * FROM eu_empleado_vacunas WHERE fecha = $1 AND id_vacuna = $2 AND id_empleado = $3
            `, [fecha, id_vacuna, id_empleado]);
            if (VACUNA.rowCount > 0) {
                return res.jsonp(VACUNA.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // CREAR REGISTRO DE VACUNACION
    CrearRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado, descripcion, fecha, id_tipo_vacuna } = req.body;
            const response = yield database_1.default.query(`
            INSERT INTO eu_empleado_vacunas (id_empleado, descripcion, fecha, id_vacuna) 
            VALUES ($1, $2, $3, $4) RETURNING *
            `, [id_empleado, descripcion, fecha, id_tipo_vacuna]);
            const [vacuna] = response.rows;
            if (vacuna) {
                return res.status(200).jsonp(vacuna);
            }
            else {
                return res.status(404).jsonp({ message: 'error' });
            }
        });
    }
    // REGISTRO DE CERTIFICADO O CARNET DE VACUNACION
    GuardarDocumento(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // FECHA DEL SISTEMA
            var fecha = (0, moment_1.default)();
            var anio = fecha.format('YYYY');
            var mes = fecha.format('MM');
            var dia = fecha.format('DD');
            let id = req.params.id;
            let id_empleado = req.params.id_empleado;
            const response = yield database_1.default.query(`
            SELECT codigo FROM eu_empleados WHERE id = $1
            `, [id_empleado]);
            const [vacuna] = response.rows;
            let documento = vacuna.codigo + '_' + anio + '_' + mes + '_' + dia + '_' + ((_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname);
            yield database_1.default.query(`
            UPDATE eu_empleado_vacunas SET carnet = $2 WHERE id = $1
            `, [id, documento]);
            res.jsonp({ message: 'Registro guardado.' });
        });
    }
    // ACTUALIZAR REGISTRO DE VACUNACION
    ActualizarRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { id_empleado, descripcion, fecha, id_tipo_vacuna } = req.body;
            yield database_1.default.query(`
            UPDATE eu_empleado_vacunas SET id_empleado = $1, descripcion = $2, fecha = $3, id_vacuna = $4 
            WHERE id = $5
            `, [id_empleado, descripcion, fecha, id_tipo_vacuna, id]);
            res.jsonp({ message: 'Registro actualizado.' });
        });
    }
    // ELIMINAR DOCUMENTO CARNET DE VACUNACION DEL SERVIDOR
    EliminarDocumentoServidor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { documento, id } = req.body;
            let separador = path_1.default.sep;
            if (documento != 'null' && documento != '' && documento != null) {
                let ruta = (yield (0, accesoCarpetas_1.ObtenerRutaVacuna)(id)) + separador + documento;
                // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                    if (err) {
                    }
                    else {
                        // ELIMINAR DEL SERVIDOR
                        fs_1.default.unlinkSync(ruta);
                    }
                });
            }
            res.jsonp({ message: 'Documento actualizado.' });
        });
    }
    // ELIMINAR DOCUMENTO CARNET DE VACUNACION
    EliminarDocumento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let separador = path_1.default.sep;
            let { documento, id } = req.body;
            const response = yield database_1.default.query(`
            UPDATE eu_empleado_vacunas SET carnet = null WHERE id = $1 RETURNING *
            `, [id]);
            const [vacuna] = response.rows;
            if (documento != 'null' && documento != '' && documento != null) {
                let ruta = (yield (0, accesoCarpetas_1.ObtenerRutaVacuna)(vacuna.id_empleado)) + separador + documento;
                // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                    if (err) {
                    }
                    else {
                        // ELIMINAR DEL SERVIDOR
                        fs_1.default.unlinkSync(ruta);
                    }
                });
            }
            res.jsonp({ message: 'Documento eliminado.' });
        });
    }
    // ELIMINAR REGISTRO DE VACUNACION
    EliminarRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let separador = path_1.default.sep;
            const { id, documento } = req.params;
            const response = yield database_1.default.query(`
            DELETE FROM eu_empleado_vacunas WHERE id = $1 RETURNING *
            `, [id]);
            const [vacuna] = response.rows;
            if (documento != 'null' && documento != '' && documento != null) {
                let ruta = (yield (0, accesoCarpetas_1.ObtenerRutaVacuna)(vacuna.id_empleado)) + separador + documento;
                // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                    if (err) {
                    }
                    else {
                        // ELIMINAR DEL SERVIDOR
                        fs_1.default.unlinkSync(ruta);
                    }
                });
            }
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    // CREAR REGISTRO DE TIPO DE VACUNA
    CrearTipoVacuna(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre } = req.body;
                const response = yield database_1.default.query(`
                INSERT INTO e_cat_vacuna (nombre) VALUES ($1) RETURNING *
                `, [nombre]);
                const [vacunas] = response.rows;
                if (vacunas) {
                    return res.status(200).jsonp(vacunas);
                }
                else {
                    return res.status(404).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // CREAR REGISTRO DE TIPO DE VACUNA
    BuscarVacunaNombre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre } = req.body;
                const VACUNA = yield database_1.default.query(`
                SELECT * FROM e_cat_vacuna WHERE UPPER(nombre) = $1
                `, [nombre]);
                if (VACUNA.rowCount > 0) {
                    return res.jsonp({ message: 'ok', info: VACUNA.rows });
                }
                else {
                    return res.jsonp({ message: 'vacio' });
                }
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // OBTENER CERTIFICADO DE VACUNACION
    ObtenerDocumento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const docs = req.params.docs;
            const id = req.params.id;
            // TRATAMIENTO DE RUTAS
            let separador = path_1.default.sep;
            let ruta = (yield (0, accesoCarpetas_1.ObtenerRutaVacuna)(id)) + separador + docs;
            fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                if (err) {
                }
                else {
                    res.sendFile(path_1.default.resolve(ruta));
                }
            });
        });
    }
    // LISTAR TODOS LOS REGISTROS DE VACUNACIÓN
    ListarRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const VACUNA = yield database_1.default.query(`
            SELECT ev.id, ev.id_empleado, ev.id_vacuna, ev.carnet, ev.fecha, tv.nombre, ev.descripcion
            FROM eu_empleado_vacunas AS ev, e_cat_vacuna AS tv 
            WHERE ev.id_vacuna = tv.id
            ORDER BY ev.id DESC
            `);
            if (VACUNA.rowCount > 0) {
                return res.jsonp(VACUNA.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
}
exports.VACUNAS_CONTROLADOR = new VacunasControlador();
exports.default = exports.VACUNAS_CONTROLADOR;
