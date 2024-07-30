"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const verificarPermisos_1 = require("../../libs/Modulos/verificarPermisos");
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
        // METODO PARA CONSULTAR DATOS DE USUARIOS ACTIVOS E INACTIVOS 
        this.router.get('/informacion-data-general-rol/:estado', verificarToken_1.TokenValidation, datosGeneralesControlador_1.default.BuscarDataGeneralRol);
        // METODO PARA BUSCAR INFORMACION DE UN USUARIO ADMNISTRADOR - JEFE
        this.router.post('/datos-actuales-usuario-rol', verificarToken_1.TokenValidation, datosGeneralesControlador_1.default.BuscarInformacionUserRol);
        // LISTA DE DATOS ACTIVOS O INACTIVOS QUE TIENEN CONFIGURADO COMUNICADOS SUPERADMIN
        this.router.get('/datos_generales_comunicados-superior/:estado', verificarToken_1.TokenValidation, datosGeneralesControlador_1.default.DatosGeneralesComunicados_SUPERADMIN);
        // LISTA DE DATOS ACTIVOS O INACTIVOS QUE TIENEN CONFIGURADO COMUNICADOS ADMIN
        this.router.post('/datos_generales_comunicados-general/:estado', verificarToken_1.TokenValidation, datosGeneralesControlador_1.default.DatosGeneralesComunicados_ADMIN);
        // LISTA DE DATOS ACTIVOS O INACTIVOS QUE TIENEN CONFIGURADO COMUNICADOS JEFE
        this.router.post('/datos_generales_comunicados-jefe/:estado', verificarToken_1.TokenValidation, datosGeneralesControlador_1.default.DatosGeneralesComunicados_JEFE);
        // METODO DE BUSQUEDA DE INFORMACION ACTUAL DEL EMPLEADO    **USADO
        this.router.get('/datos-actuales/:empleado_id', verificarToken_1.TokenValidation, datosGeneralesControlador_1.default.DatosActuales);
        // METODO DE ACCESO A CONSULTA DE DATOS DE COLABORADORES ACTIVOS E INACTIVOS
        this.router.post('/informacion-general/:estado', verificarToken_1.TokenValidation, datosGeneralesControlador_1.default.DatosGenerales);
        // METODO DE ACCESO A CONSULTA DE DATOS DE CRAGOS DE COLABORADORES ACTIVOS E INACTIVOS
        this.router.post('/informacion-general-cargo/:estado', verificarToken_1.TokenValidation, datosGeneralesControlador_1.default.DatosGeneralesCargo);
        // METODO PARA LISTAR INFORMACION ACTUAL DEL USUARIO
        this.router.get('/info_actual', verificarToken_1.TokenValidation, datosGeneralesControlador_1.default.ListarDatosActualesEmpleado);
        // METODO PARA LISTAR ID ACTUALES DE USUARIOS    **USADO
        this.router.get('/info_actual_id', verificarToken_1.TokenValidation, datosGeneralesControlador_1.default.ListarIdDatosActualesEmpleado);
        // METODO DE BUSQUEDA DE DATOS DE USUARIO QUE APRUEBA SOLICITUDES    **USADO
        this.router.get('/empleadoAutoriza/:empleado_id', verificarToken_1.TokenValidation, datosGeneralesControlador_1.default.ListarDatosEmpleadoAutoriza);
        // METODO PARA BUSCAR JEFES DE DEPARTAMENTOS
        this.router.post('/buscar-jefes', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], datosGeneralesControlador_1.default.BuscarJefes);
        // METODO DE BUSQUEDA DE INFORMACION DE CONFIGURACIONES DE NOTIFICACIONES
        this.router.get('/info-configuracion/:id_empleado', verificarToken_1.TokenValidation, datosGeneralesControlador_1.default.BuscarConfigEmpleado);
        // METODO DE ACCESO A CONSULTA DE DATOS DE COLABORADORES ASIGNADOS UBICACION
        this.router.post('/informacion-general-ubicacion/:estado', verificarToken_1.TokenValidation, datosGeneralesControlador_1.default.DatosGeneralesUbicacion);
        // METODO DE ACCESO A CONSULTA DE DATOS DE CRAGOS Y COLABORADORES ASIGNADOS A UBICACIONES
        this.router.post('/informacion-general-ubicacion-cargo/:estado', verificarToken_1.TokenValidation, datosGeneralesControlador_1.default.DatosGeneralesCargoUbicacion);
        // METODO PARA BUSCAR USUARIOS DE UNA SUCURSAL
        this.router.post('/datos-actuales-sucursal', verificarToken_1.TokenValidation, datosGeneralesControlador_1.default.BuscarUsuariosSucursal);
    }
}
const DATOS_GENERALES_RUTAS = new CiudadRutas();
exports.default = DATOS_GENERALES_RUTAS.router;
