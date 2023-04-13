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
exports.VerCarpeta = exports.DescargarArchivo = exports.ListarHorarios = exports.ListarPermisos = exports.ListarContratos = exports.ListarDocumentos = exports.listaCarpetas = void 0;
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
                            nombre: doc.doc_nombre
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
        let archivos = [];
        const ruta = path_1.default.resolve(nombre_carpeta);
        let Lista_Archivos = fs_1.default.readdirSync(ruta);
        console.log('contratos.. ', Lista_Archivos);
        // CONSULTA DE BUSQUEDA DE DOCUMENTOS
        let documentos = yield database_1.default.query(`
        SELECT * FROM empl_contratos WHERE documento NOTNULL ORDER BY id
        `).then(result => { return result.rows; });
        console.log('contratos base .. ', documentos);
        if (documentos.length != 0) {
            documentos.forEach((doc) => {
                Lista_Archivos.forEach((obj) => {
                    if (doc.documento === obj) {
                        let datos = {
                            id: doc.id,
                            file: obj,
                            extencion: obj.split('.')[1],
                            nombre: doc.doc_nombre
                        };
                        archivos = archivos.concat(datos);
                    }
                });
            });
        }
        return archivos;
    });
};
exports.ListarContratos = ListarContratos;
// LISTAR ARCHIVOS DE PERMISOS
const ListarPermisos = function (nombre_carpeta) {
    return __awaiter(this, void 0, void 0, function* () {
        let archivos = [];
        const ruta = path_1.default.resolve(nombre_carpeta);
        let Lista_Archivos = fs_1.default.readdirSync(ruta);
        console.log('permisos.. ', Lista_Archivos);
        // CONSULTA DE BUSQUEDA DE DOCUMENTOS
        let documentos = yield database_1.default.query(`
        SELECT * FROM permisos WHERE documento NOTNULL ORDER BY id
        `).then(result => { return result.rows; });
        console.log('permisos base .. ', documentos);
        if (documentos.length != 0) {
            documentos.forEach((doc) => {
                Lista_Archivos.forEach((obj) => {
                    if (doc.documento === obj) {
                        let datos = {
                            id: doc.id,
                            file: obj,
                            extencion: obj.split('.')[1],
                            nombre: doc.docu_nombre
                        };
                        archivos = archivos.concat(datos);
                    }
                });
            });
        }
        return archivos;
    });
};
exports.ListarPermisos = ListarPermisos;
// LISTAR ARCHIVOS DE PERMISOS
const ListarHorarios = function (nombre_carpeta) {
    return __awaiter(this, void 0, void 0, function* () {
        let archivos = [];
        const ruta = path_1.default.resolve(nombre_carpeta);
        let Lista_Archivos = fs_1.default.readdirSync(ruta);
        console.log('horarios.. ', Lista_Archivos);
        // CONSULTA DE BUSQUEDA DE DOCUMENTOS
        let documentos = yield database_1.default.query(`
        SELECT * FROM cg_horarios WHERE documento NOTNULL ORDER BY id
        `).then(result => { return result.rows; });
        console.log('horarios base .. ', documentos);
        if (documentos.length != 0) {
            documentos.forEach((doc) => {
                Lista_Archivos.forEach((obj) => {
                    if (doc.documento === obj) {
                        let datos = {
                            id: doc.id,
                            file: obj,
                            extencion: obj.split('.')[1],
                            nombre: doc.doc_nombre
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
    const ruta = path_1.default.resolve(dir);
    return ruta + '\\' + filename;
};
exports.DescargarArchivo = DescargarArchivo;
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
