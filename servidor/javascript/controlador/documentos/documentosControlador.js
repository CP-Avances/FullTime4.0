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
const database_1 = __importDefault(require("../../database"));
const fs_1 = __importDefault(require("fs"));
class DocumentosControlador {
    // METODO PARA MOSTRAR LISTA DE CARPETAS DEL SERVIDOR
    Carpetas(req, res) {
        let carpetas = [
            { nombre: 'Contratos', filename: 'contratos' },
            { nombre: 'Respaldos Horarios', filename: 'horarios' },
            { nombre: 'Respaldos Permisos', filename: 'permisos' },
            { nombre: 'Documentacion', filename: 'documentacion' }
        ];
        res.status(200).jsonp(carpetas);
    }
    // METODO PARA LISTAR DOCUMENTOS 
    ListarCarpetaDocumentos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let nombre = req.params.nom_carpeta;
            res.status(200).jsonp(yield (0, listarArchivos_1.ListarDocumentos)(nombre));
        });
    }
    // METODO PARA LISTAR ARCHIVOS DE LA CARPETA CONTRATOS
    ListarCarpetaContratos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let nombre = req.params.nom_carpeta;
            res.status(200).jsonp(yield (0, listarArchivos_1.ListarContratos)(nombre));
        });
    }
    // METODO PARA LISTAR ARCHIVOS DE LA CARPETA PERMISOS
    ListarCarpetaPermisos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let nombre = req.params.nom_carpeta;
            res.status(200).jsonp(yield (0, listarArchivos_1.ListarPermisos)(nombre));
        });
    }
    // METODO PARA LISTAR ARCHIVOS DE LA CARPETA HORARIOS
    ListarCarpetaHorarios(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let nombre = req.params.nom_carpeta;
            res.status(200).jsonp(yield (0, listarArchivos_1.ListarHorarios)(nombre));
        });
    }
    // METODO LISTAR ARCHIVOS DE CARPETAS
    ListarArchivosCarpeta(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let nombre = req.params.nom_carpeta;
            res.status(200).jsonp(yield (0, listarArchivos_1.listaCarpetas)(nombre));
        });
    }
    // METODO PARA DESCARGAR ARCHIVOS
    DownLoadFile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let nombre = req.params.nom_carpeta;
            let filename = req.params.filename;
            const path = (0, listarArchivos_1.DescargarArchivo)(nombre, filename);
            res.status(200).sendFile(path);
        });
    }
    // METODO PARA ELIMINAR REGISTROS DE DOCUMENTACION
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { id, documento } = req.params;
            yield database_1.default.query(`
                DELETE FROM documentacion WHERE id = $1
                `, [id]);
            let filePath = `servidor\\documentacion\\${documento}`;
            let direccionCompleta = __dirname.split("servidor")[0] + filePath;
            fs_1.default.unlinkSync(direccionCompleta);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    // METODO PARA REGISTRAR UN DOCUMENTO
    CrearDocumento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = req.files;
            let documento = list.uploads[0].path.split("\\")[1];
            console.log('ver path ... ', list.uploads[0].path);
            let { doc_nombre } = req.params;
            yield database_1.default.query(`
            INSERT INTO documentacion (documento, doc_nombre) VALUES ($1, $2)
            `, [documento, doc_nombre]);
            res.jsonp({ message: 'Registro guardado.' });
        });
    }
}
exports.DOCUMENTOS_CONTROLADOR = new DocumentosControlador();
exports.default = exports.DOCUMENTOS_CONTROLADOR;
