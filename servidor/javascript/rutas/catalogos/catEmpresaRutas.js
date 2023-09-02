"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const verificarToken_1 = require("../../libs/verificarToken");
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const catEmpresaControlador_1 = __importDefault(require("../../controlador/catalogos/catEmpresaControlador"));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'logos');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = (0, multer_1.default)({ storage: storage });
class DepartamentoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // CADENA DE NAVEGACION
        this.router.get('/navegar', catEmpresaControlador_1.default.BuscarCadena);
        // BUSQUEDA DE LOGO 
        this.router.get('/logo/codificado/:id_empresa', verificarToken_1.TokenValidation, catEmpresaControlador_1.default.getImagenBase64);
        // METODO PARA EDITAR LOGO DE EMPRESA
        this.router.put('/logo/:id_empresa/uploadImage', [verificarToken_1.TokenValidation, upload.single('image')], catEmpresaControlador_1.default.ActualizarLogoEmpresa);
        // BUSCAR DATOS GENERALES DE EMPRESA
        this.router.get('/buscar/datos/:id', verificarToken_1.TokenValidation, catEmpresaControlador_1.default.ListarEmpresaId);
        // ACTUALIZAR DATOS DE EMPRESA
        this.router.put('/', verificarToken_1.TokenValidation, catEmpresaControlador_1.default.ActualizarEmpresa);
        // ACTUALIZAR DATOS DE COLORES DE REPORTES
        this.router.put('/colores', [verificarToken_1.TokenValidation], catEmpresaControlador_1.default.ActualizarColores);
        // ACTUALIZAR DATOS DE MARCA DE AGUA DE REPORTE
        this.router.put('/reporte/marca', verificarToken_1.TokenValidation, catEmpresaControlador_1.default.ActualizarMarcaAgua);
        // METODO PARA ACTUALIZAR NIVEL DE SEGURIDAD DE EMPRESA
        this.router.put('/doble/seguridad', verificarToken_1.TokenValidation, catEmpresaControlador_1.default.ActualizarSeguridad);
        // METODO PARA ACTUALIZAR LOGO CABECERA DE CORREO
        this.router.put('/cabecera/:id_empresa/uploadImage', [verificarToken_1.TokenValidation, upload.single('image')], catEmpresaControlador_1.default.ActualizarCabeceraCorreo);
        // METODO PARA BUSCAR LOGO CABECERA DE CORREO
        this.router.get('/cabecera/codificado/:id_empresa', verificarToken_1.TokenValidation, catEmpresaControlador_1.default.VerCabeceraCorreo);
        // METODO PARA ACTUALIZAR LOGO PIE DE FIRMA CORREO
        this.router.put('/pie-firma/:id_empresa/uploadImage', [verificarToken_1.TokenValidation, upload.single('image')], catEmpresaControlador_1.default.ActualizarPieCorreo);
        // METODO PARA BUSCAR LOGO PIE DE FIRMA DE CORREO
        this.router.get('/pie-firma/codificado/:id_empresa', verificarToken_1.TokenValidation, catEmpresaControlador_1.default.VerPieCorreo);
        // METODO PARA ACTUALIZAR DATOS DE CORREO
        this.router.put('/credenciales/:id_empresa', verificarToken_1.TokenValidation, catEmpresaControlador_1.default.EditarPassword);
        // METODO PARA ACTUALIZAR USO DE ACCIONES
        this.router.put('/acciones-timbre', verificarToken_1.TokenValidation, catEmpresaControlador_1.default.ActualizarAccionesTimbres);
        this.router.get('/', verificarToken_1.TokenValidation, catEmpresaControlador_1.default.ListarEmpresa);
        this.router.get('/buscar/:nombre', verificarToken_1.TokenValidation, catEmpresaControlador_1.default.ListarUnaEmpresa);
        this.router.post('/', verificarToken_1.TokenValidation, catEmpresaControlador_1.default.CrearEmpresa);
        this.router.post('/xmlDownload/', verificarToken_1.TokenValidation, catEmpresaControlador_1.default.FileXML);
        this.router.get('/download/:nameXML', catEmpresaControlador_1.default.downloadXML);
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catEmpresaControlador_1.default.EliminarRegistros);
        // CONSULTA USADA EN MÓDULO DE ALMUERZOS
        this.router.get('/logo/codificados/:id_empresa', catEmpresaControlador_1.default.getImagenBase64);
    }
}
const EMPRESA_RUTAS = new DepartamentoRutas();
exports.default = EMPRESA_RUTAS.router;
