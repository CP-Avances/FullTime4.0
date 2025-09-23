"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const catDepartamentoControlador_1 = __importDefault(require("../../../controlador/configuracion/localizacion/catDepartamentoControlador"));
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
const verificarToken_1 = require("../../../libs/verificarToken");
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)());
    },
    filename: function (req, file, cb) {
        let documento = file.originalname;
        cb(null, documento);
    }
});
const upload = (0, multer_1.default)({ storage: storage });
class DepartamentoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // REGISTRAR DEPARTAMENTO   **USADO
        this.router.post('/', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.CrearDepartamento);
        // BUSCAR DEPARTAMENTOS POR ID SUCURSAL  **USADO
        this.router.get('/sucursal-departamento/:id_sucursal', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ObtenerDepartamentosSucursal);
        // BUSCAR DEPARTAMENTOS POR ID SUCURSAL Y EXCLUIR DEPARTAMENTO ACTUALIZADO   **USADO
        this.router.get('/sucursal-departamento-edicion/:id_sucursal/:id', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ObtenerDepartamentosSucursal_);
        // BUSCAR DEPARTAMENTO POR ID   **USADO
        this.router.get('/infodepartamento/:id', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ObtenerDepartamento);
        // ACTUALIZAR DEPARTAMENTO    **USADO
        this.router.put('/:id', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ActualizarDepartamento);
        // METODO PARA LISTAR INFORMACION DE DEPARTAMENTOS POR ID DE SUCURSAL  **USADO
        this.router.get('/buscar/datosDepartamento/:id_sucursal', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ListarDepartamentosSucursal);
        // LISTAR DEPARTAMENTOS  **USADO
        this.router.get('/listarDepartamentos', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ListarDepartamentos);
        // METODO PARA ELIMINAR REGISTRO  **USADO
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.EliminarRegistros);
        // REGISTRAR NIVELDEPARTAMENTO  **USADO
        this.router.post('/crearnivel', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.CrearNivelDepa);
        // BUSCAR NIVEL DEPARTAMENTO POR ID_DEPARTAMENTO Y ID_SUCURSAL   **USADO
        this.router.get('/infoniveldepa/:id_departamento/:id_establecimiento', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ObtenerNivelesDepa);
        // ACTUALIZAR NIVEL DEPARTAMENTO TABLA NIVEL_JERARQUICO  **USADO
        this.router.put('/nivelactualizar/:id', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ActualizarNivelDepa);
        // METODO PARA ELIMINAR REGISTRO NIVEL DEPARTAMENTO    **USADO
        this.router.delete('/eliminarniveldepa/:id', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.EliminarRegistroNivelDepa);
        // ACTUALIZAR NOMBRE DE DEPARTAMENTOS EN NIVELES DE APROBACION  **USADO
        this.router.post('/actualizarNombrenivel', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ActualizarNombreNivel);
        // METODO PARA REVISAR DATOS DE PLANTILLA DE DEPARTAMENTOS   **USADO
        this.router.post('/upload/revision', [verificarToken_1.TokenValidation, upload.single('uploads')], catDepartamentoControlador_1.default.RevisarDatos);
        // METODO PARA SUBIR EL ARCHIVO DE DEPARTAMENTOS AL SISTEMA   **USADO
        this.router.post('/cargar_plantilla/', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.CargarPlantilla);
        // METODO PARA VALIDAR DATOS DE PLANTILLA DE NIVELES DE DEPARTAMENTO   **USADO
        this.router.post('/upload/revisionNivel', [verificarToken_1.TokenValidation, upload.single('uploads')], catDepartamentoControlador_1.default.RevisarDatosNivel);
        // METODO PARA REGISTRAR DATOS DE PLANTILLA DE NIVELES DE DEPARTAMENTO  **USADO
        this.router.post('/cargar_plantillaNivel/', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.CargarPlantillaNivelesDep);
        // ACTUALIZAR DEPARTAMENTOS DE USUARIOS DE MANERA MASIVA   **USADO
        this.router.put('/actualizarUserDepa', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ActualizarDepartamentosUsuario);
    }
}
const DEPARTAMENTO_RUTAS = new DepartamentoRutas();
exports.default = DEPARTAMENTO_RUTAS.router;
