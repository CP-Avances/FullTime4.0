"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const verificarToken_1 = require("../../libs/verificarToken");
const express_1 = require("express");
const datosGeneralesControlador_1 = __importDefault(require("../../controlador/datosGenerales/datosGeneralesControlador"));
class CiudadRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA CONSULTAR DATOS DE USUARIOS ACTIVOS E INACTIVOS    **USADO
        this.router.get('/informacion-data-general/:estado', verificarToken_1.TokenValidation, datosGeneralesControlador_1.default.BuscarDataGeneral);
        // METODO PARA CONSULTAR DATOS DE USUARIOS ACTIVOS E INACTIVOS    **USADO
        this.router.get('/informacion-data-general-rol/:estado', verificarToken_1.TokenValidation, datosGeneralesControlador_1.default.BuscarDataGeneralRol);
        // LISTA DE DATOS ACTIVOS O INACTIVOS QUE RECIBEN COMUNICADOS  **USADO
        this.router.get('/datos_generales_comunicados/:estado', verificarToken_1.TokenValidation, datosGeneralesControlador_1.default.DatosGeneralesComunicados);
        // METODO DE BUSQUEDA DE INFORMACION ACTUAL DEL EMPLEADO    **USADO
        this.router.get('/datos-actuales/:empleado_id', verificarToken_1.TokenValidation, datosGeneralesControlador_1.default.DatosActuales);
        // METODO DE ACCESO A CONSULTA DE DATOS DE COLABORADORES ASIGNADOS UBICACION   **USADO
        this.router.post('/informacion-general-ubicacion/:estado', verificarToken_1.TokenValidation, datosGeneralesControlador_1.default.DatosGeneralesUbicacion);
        // METODO PARA LISTAR ID ACTUALES DE USUARIOS    **USADO
        this.router.get('/info_actual_id', verificarToken_1.TokenValidation, datosGeneralesControlador_1.default.ListarIdDatosActualesEmpleado);
        // METODO PARA CONSULTAR DATOS DE USUARIOS ACTIVOS E INACTIVOS CON REGIMEN LABORAL   **USADO
        this.router.get('/informacion-data-regimen/:estado', verificarToken_1.TokenValidation, datosGeneralesControlador_1.default.BuscarDataGeneralPeriodos);
    }
}
const DATOS_GENERALES_RUTAS = new CiudadRutas();
exports.default = DATOS_GENERALES_RUTAS.router;
