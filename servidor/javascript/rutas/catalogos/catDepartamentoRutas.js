"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catDepartamentoControlador_1 = __importDefault(require("../../controlador/catalogos/catDepartamentoControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
class DepartamentoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // REGISTRAR DEPARTAMENTO
        this.router.post('/', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.CrearDepartamento);
        // BUSCAR DEPARTAMENTOS POR ID SUCURSAL
        this.router.get('/sucursal-departamento/:id_sucursal', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ObtenerDepartamentosSucursal);
        // BUSCAR DEPARTAMENTO POR ID
        this.router.get('/infodepartamento/:id', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ObtenerDepartamento);
        // BUSCAR DEPARTAMENTOS POR ID SUCURSAL Y EXCLUIR DEPARTAMENTO ACTUALIZADO
        this.router.get('/sucursal-departamento-edicion/:id_sucursal/:id', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ObtenerDepartamentosSucursal_);
        // ACTUALIZAR DEPARTAMENTO  --**VERIFICADO
        this.router.put('/:id', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ActualizarDepartamento);
        // LISTAR DEPARTAMENTOS    --**VERIFICADO
        this.router.get('/', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ListarDepartamentos);
        // LISTAR DEPARTAMENTOS
        this.router.get('/listarDepartamentos', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ListarDepartamentos);
        // METODO PARA LISTAR INFORMACION DE DEPARTAMENTOS POR ID DE SUCURSAL
        this.router.get('/buscar/datosDepartamento/:id_sucursal', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ListarDepartamentosSucursal);
        // METODO PARA ELIMINAR REGISTRO
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.EliminarRegistros);
        // METODO PARA CREAR ARCHIVO XML
        this.router.post('/xmlDownload/', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.FileXML);
        // METODO PARA DESCARGAR ARCHIVO XML
        this.router.get('/download/:nameXML', catDepartamentoControlador_1.default.downloadXML);
        // REGISTRAR NIVELDEPARTAMENTO   --**VERIFICADO
        this.router.post('/crearnivel', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.CrearNivelDepa);
        // BUSCAR NIVEL DEPARTAMENTO POR ID_DEPARTAMENTO Y ID_SUCURSAL   --**VERIFICADO
        this.router.get('/infoniveldepa/:id_departamento/:id_establecimiento', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ObtenerNivelesDepa);
        // METODO PARA ELIMINAR REGISTRO NIVEL DEPARTAMENTO    --**VERIFICADO
        this.router.delete('/eliminarniveldepa/:id', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.EliminarRegistroNivelDepa);
        // ACTUALIZAR NIVEL DEPARTAMENTO TABLA NIVEL_JERARQUICO  --**VERIFICADO
        this.router.put('/nivelactualizar/:id', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ActualizarNivelDepa);
        // ACTUALIZAR NOMBRE DE DEPARTAMENTOS EN NIVELES DE APROBACION   --**VERIFICADO
        this.router.post('/actualizarNombrenivel', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ActualizarNombreNivel);
        this.router.get('/nombreDepartamento', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ListarNombreDepartamentos);
        this.router.get('/idDepartamento/:nombre', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ListarIdDepartamentoNombre);
        this.router.get('/:id', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ObtenerUnDepartamento);
        this.router.get('/busqueda/:nombre', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ObtenerIdDepartamento);
        this.router.get('/busqueda-cargo/:id_cargo', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.BuscarDepartamentoPorCargo);
        this.router.get('/buscar/regimen-departamento/:id', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ListarDepartamentosRegimen);
    }
}
const DEPARTAMENTO_RUTAS = new DepartamentoRutas();
exports.default = DEPARTAMENTO_RUTAS.router;
