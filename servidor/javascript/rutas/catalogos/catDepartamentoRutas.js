"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catDepartamentoControlador_1 = __importDefault(require("../../controlador/catalogos/catDepartamentoControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
const multer_1 = __importDefault(require("multer"));
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)());
    },
    filename: function (req, file, cb) {
        // FECHA DEL SISTEMA
        //var fecha = moment();
        //var anio = fecha.format('YYYY');
        //var mes = fecha.format('MM');
        //var dia = fecha.format('DD');
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
        this.router.get('/busqueda-cargo/:id_cargo', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.BuscarDepartamentoPorCargo);
        this.router.get('/buscar/regimen-departamento/:id', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ListarDepartamentosRegimen);
        this.router.post('/upload/revision', [verificarToken_1.TokenValidation, upload.single('uploads')], catDepartamentoControlador_1.default.RevisarDatos);
        this.router.post('/cargar_plantilla/', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.CargarPlantilla);
        this.router.post('/upload/revisionNivel', [verificarToken_1.TokenValidation, upload.single('uploads')], catDepartamentoControlador_1.default.RevisarDatosNivel);
        this.router.post('/cargar_plantillaNivel/', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.CargarPlantillaNivelesDep);
    }
}
const DEPARTAMENTO_RUTAS = new DepartamentoRutas();
exports.default = DEPARTAMENTO_RUTAS.router;
