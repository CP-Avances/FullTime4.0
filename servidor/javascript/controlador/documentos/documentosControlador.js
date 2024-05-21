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
exports.DOCUMENTOS_CONTROLADOR = exports.carpeta = void 0;
const listarArchivos_1 = require("../../libs/listarArchivos");
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
const fs_1 = __importDefault(require("fs"));
const database_1 = __importDefault(require("../../database"));
const path_1 = __importDefault(require("path"));
const moment_1 = __importDefault(require("moment"));
class DocumentosControlador {
    // METODO PARA MOSTRAR LISTA DE CARPETAS DEL SERVIDOR
    Carpetas(req, res) {
        let carpetas = [
            { nombre: 'Contratos', filename: 'contratos' },
            { nombre: 'Respaldos Horarios', filename: 'horarios' },
            { nombre: 'Respaldos Permisos', filename: 'permisos' },
            { nombre: 'Documentacion', filename: 'documentacion' }
        ];
        res.jsonp(carpetas);
    }
    // METODO PARA LISTAR DOCUMENTOS 
    ListarCarpetaDocumentos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let nombre = req.params.nom_carpeta;
            res.jsonp(yield (0, listarArchivos_1.ListarDocumentos)(nombre));
        });
    }
    // METODO PARA LISTAR ARCHIVOS DE LA CARPETA CONTRATOS
    ListarCarpetaContratos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let nombre = req.params.nom_carpeta;
            res.jsonp(yield (0, listarArchivos_1.ListarContratos)(nombre));
        });
    }
    // METODO PARA LISTAR ARCHIVOS DE LA CARPETA PERMISOS
    ListarCarpetaPermisos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let nombre = req.params.nom_carpeta;
            res.jsonp(yield (0, listarArchivos_1.ListarPermisos)(nombre));
        });
    }
    // METODO PARA LISTAR ARCHIVOS DE LA CARPETA PERMISOS
    ListarArchivosIndividuales(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let nombre = req.params.nom_carpeta;
            let tipo = req.params.tipo;
            res.jsonp(yield (0, listarArchivos_1.ListarDocumentosIndividuales)(nombre, tipo));
        });
    }
    // METODO PARA LISTAR ARCHIVOS DE LA CARPETA HORARIOS
    ListarCarpetaHorarios(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let nombre = req.params.nom_carpeta;
            res.jsonp(yield (0, listarArchivos_1.ListarHorarios)(nombre));
        });
    }
    // METODO LISTAR ARCHIVOS DE CARPETAS
    ListarArchivosCarpeta(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let nombre = req.params.nom_carpeta;
            res.jsonp(yield (0, listarArchivos_1.listaCarpetas)(nombre));
        });
    }
    // METODO PARA DESCARGAR ARCHIVOS
    DownLoadFile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let nombre = req.params.nom_carpeta;
            let filename = req.params.filename;
            const path_ = (0, listarArchivos_1.DescargarArchivo)(nombre, filename);
            fs_1.default.access(path_, fs_1.default.constants.F_OK, (err) => {
                if (err) {
                }
                else {
                    res.sendFile(path_1.default.resolve(path_));
                }
            });
        });
    }
    // METODO PARA DESCARGAR ARCHIVOS INDIVIDUALES
    DescargarArchivos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let nombre = req.params.nom_carpeta;
            let filename = req.params.filename;
            let tipo = req.params.tipo;
            const path_ = (0, listarArchivos_1.DescargarArchivoIndividuales)(nombre, filename, tipo);
            fs_1.default.access(path_, fs_1.default.constants.F_OK, (err) => {
                if (err) {
                }
                else {
                    res.sendFile(path_1.default.resolve(path_));
                }
            });
        });
    }
    // METODO PARA ELIMINAR REGISTROS DE DOCUMENTACION
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { id, documento } = req.params;
                yield database_1.default.query(`
                DELETE FROM e_documentacion WHERE id = $1
                `, [id]);
                let separador = path_1.default.sep;
                let ruta = (0, accesoCarpetas_1.ObtenerRutaDocumento)() + separador + documento;
                // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                fs_1.default.access(ruta, fs_1.default.constants.F_OK, (err) => {
                    if (err) {
                    }
                    else {
                        // ELIMINAR DEL SERVIDOR
                        fs_1.default.unlinkSync(ruta);
                    }
                });
                res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA REGISTRAR UN DOCUMENTO    --**VERIFICADO
    CrearDocumento(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // FECHA DEL SISTEMA
            var fecha = (0, moment_1.default)();
            var anio = fecha.format('YYYY');
            var mes = fecha.format('MM');
            var dia = fecha.format('DD');
            let documento = anio + '_' + mes + '_' + dia + '_' + ((_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname);
            yield database_1.default.query(`
            INSERT INTO e_documentacion (documento) VALUES ($1)
            `, [documento]);
            res.jsonp({ message: 'Registro guardado.' });
        });
    }
}
exports.DOCUMENTOS_CONTROLADOR = new DocumentosControlador();
exports.default = exports.DOCUMENTOS_CONTROLADOR;
