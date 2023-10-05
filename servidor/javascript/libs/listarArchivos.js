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
exports.VerCarpeta = exports.DescargarArchivoIndividuales = exports.DescargarArchivo = exports.ListarHorarios = exports.ListarDocumentosIndividuales = exports.ListarPermisos = exports.ListarContratos = exports.ListarDocumentos = exports.listaCarpetas = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = __importDefault(require("../database"));
const listaCarpetas = function (nombre_carpeta) {
    const ruta = path_1.default.resolve(nombre_carpeta);
    let Lista_Archivos = fs_1.default.readdirSync(ruta);
    return Lista_Archivos.map((obj) => {
        return {
            file: obj,
            extencion: obj.split('.')[1]
        };
    });
};
exports.listaCarpetas = listaCarpetas;
// LISTAR ARCHIVOS DE DOCUMENTACION
const ListarDocumentos = function (nombre_carpeta) {
    return __awaiter(this, void 0, void 0, function* () {
        let archivos = [];
        const ruta = path_1.default.resolve(nombre_carpeta);
        let Lista_Archivos = fs_1.default.readdirSync(ruta);
        // CONSULTA DE BUSQUEDA DE DOCUMENTOS
        let documentos = yield database_1.default.query(`
        SELECT * FROM documentacion ORDER BY id
        `).then(result => { return result.rows; });
        if (documentos.length != 0) {
            documentos.forEach((doc) => {
                Lista_Archivos.forEach((obj) => {
                    if (doc.documento === obj) {
                        let datos = {
                            id: doc.id,
                            file: obj,
                            extencion: obj.split('.')[1],
                            nombre: doc.documento
                        };
                        archivos = archivos.concat(datos);
                    }
                });
            });
        }
        return archivos;
    });
};
exports.ListarDocumentos = ListarDocumentos;
// LISTAR ARCHIVOS DE CONTRATOS
const ListarContratos = function (nombre_carpeta) {
    return __awaiter(this, void 0, void 0, function* () {
        const ruta = path_1.default.resolve(nombre_carpeta);
        let Lista_Archivos = fs_1.default.readdirSync(ruta);
        return Lista_Archivos;
    });
};
exports.ListarContratos = ListarContratos;
// LISTAR ARCHIVOS DE PERMISOS
const ListarPermisos = function (nombre_carpeta) {
    return __awaiter(this, void 0, void 0, function* () {
        const ruta = path_1.default.resolve(nombre_carpeta);
        let Lista_Archivos = fs_1.default.readdirSync(ruta);
        return Lista_Archivos;
    });
};
exports.ListarPermisos = ListarPermisos;
// LISTAR ARCHIVOS DE PERMISOS
const ListarDocumentosIndividuales = function (nombre_carpeta, tipo) {
    return __awaiter(this, void 0, void 0, function* () {
        let archivos = [];
        let separador = path_1.default.sep;
        let direccion = tipo + separador + nombre_carpeta;
        const ruta = path_1.default.resolve(direccion);
        let Lista_Archivos = fs_1.default.readdirSync(ruta);
        Lista_Archivos.forEach((obj) => {
            let datos = {
                file: obj,
                extencion: obj.split('.')[1],
                nombre: obj
            };
            archivos = archivos.concat(datos);
        });
        return archivos;
    });
};
exports.ListarDocumentosIndividuales = ListarDocumentosIndividuales;
// LISTAR ARCHIVOS DE PERMISOS
const ListarHorarios = function (nombre_carpeta) {
    return __awaiter(this, void 0, void 0, function* () {
        let archivos = [];
        const ruta = path_1.default.resolve(nombre_carpeta);
        let Lista_Archivos = fs_1.default.readdirSync(ruta);
        // CONSULTA DE BUSQUEDA DE DOCUMENTOS
        let documentos = yield database_1.default.query(`
        SELECT * FROM cg_horarios WHERE documento NOTNULL ORDER BY id
        `).then(result => { return result.rows; });
        if (documentos.length != 0) {
            documentos.forEach((doc) => {
                Lista_Archivos.forEach((obj) => {
                    if (doc.documento === obj) {
                        let datos = {
                            id: doc.id,
                            file: obj,
                            extencion: obj.split('.')[1],
                            nombre: doc.documento
                        };
                        archivos = archivos.concat(datos);
                    }
                });
            });
        }
        return archivos;
    });
};
exports.ListarHorarios = ListarHorarios;
const DescargarArchivo = function (dir, filename) {
    let separador = path_1.default.sep;
    const ruta = path_1.default.resolve(dir);
    return ruta + separador + filename;
};
exports.DescargarArchivo = DescargarArchivo;
const DescargarArchivoIndividuales = function (dir, filename, tipo) {
    let separador = path_1.default.sep;
    const ruta = path_1.default.resolve(dir);
    return ruta + separador + tipo + separador + filename;
};
exports.DescargarArchivoIndividuales = DescargarArchivoIndividuales;
// LISTAR ARCHIVOS DE CONTRATOS
const VerCarpeta = function () {
    return __awaiter(this, void 0, void 0, function* () {
        let carpeta = 'casa_pazmino';
        // CONSULTA DE BUSQUEDA DE DOCUMENTOS
        let documentos = yield database_1.default.query(`
         SELECT * FROM documentacion ORDER BY id
         `).then(result => { return result.rows; });
        if (documentos.length != 0) {
            documentos.forEach((doc) => {
            });
        }
        return carpeta;
    });
};
exports.VerCarpeta = VerCarpeta;
