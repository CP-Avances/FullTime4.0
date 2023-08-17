"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const documentosControlador_1 = __importDefault(require("../../controlador/documentos/documentosControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './documentacion',
});
// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO
const ObtenerRuta = function () {
    var ruta = '';
    let separador = path_1.default.sep;
    for (var i = 0; i < __dirname.split(separador).length - 3; i++) {
        if (ruta === '') {
            ruta = __dirname.split(separador)[i];
        }
        else {
            ruta = ruta + separador + __dirname.split(separador)[i];
        }
    }
    return ruta + separador + 'documentacion';
};
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, ObtenerRuta());
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = (0, multer_1.default)({ storage: storage });
class DoumentosRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA REGISTRAR DOCUMENTOS   --**VERIFICADO
        this.router.post('/registrar/:doc_nombre', verificarToken_1.TokenValidation, upload.single('uploads'), documentosControlador_1.default.CrearDocumento);
        // METODO PARA LISTAR CARPETAS
        this.router.get('/carpetas/', documentosControlador_1.default.Carpetas);
        // METODO PARA LISTAR ARCHIVOS DE CARPETAS
        this.router.get('/lista-carpetas/:nom_carpeta', documentosControlador_1.default.ListarArchivosCarpeta);
        // METODO PARA LISTAR DOCUMENTOS DE DOCUMENTACION  --**VERIFICADO
        this.router.get('/documentacion/:nom_carpeta', documentosControlador_1.default.ListarCarpetaDocumentos);
        // METODO PARA LISTAR DOCUMENTOS DE CONTRATOS
        this.router.get('/lista-contratos/:nom_carpeta', documentosControlador_1.default.ListarCarpetaContratos);
        // METODO PARA LISTAR DOCUMENTOS DE PERMISOS
        this.router.get('/lista-permisos/:nom_carpeta', documentosControlador_1.default.ListarCarpetaPermisos);
        // METODO PARA LISTAR DOCUMENTOS DE HORARIOS
        this.router.get('/lista-horarios/:nom_carpeta', documentosControlador_1.default.ListarCarpetaHorarios);
        // METODO PARA DESCARGAR ARCHIVOS
        this.router.get('/download/files/:nom_carpeta/:filename', documentosControlador_1.default.DownLoadFile);
        // METODO PARA ELIMINAR ARCHIVOS
        this.router.delete('/eliminar/:id/:documento', verificarToken_1.TokenValidation, documentosControlador_1.default.EliminarRegistros);
    }
}
const DOCUMENTOS_RUTAS = new DoumentosRutas();
exports.default = DOCUMENTOS_RUTAS.router;
