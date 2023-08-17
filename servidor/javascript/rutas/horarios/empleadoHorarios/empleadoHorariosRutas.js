"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const empleadoHorariosControlador_1 = __importDefault(require("../../../controlador/horarios/empleadoHorarios/empleadoHorariosControlador"));
const verificarToken_1 = require("../../../libs/verificarToken");
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './plantillas',
});
class EmpleadoHorariosRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO DE BUSQUEDA DE HORARIOS DE UN USUARIO
        this.router.get('/horarioCodigo/:codigo', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.ListarHorarioUsuario);
        // METODO PARA REGISTRAR HORARIO DE USUARIO
        this.router.post('/', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.CrearEmpleadoHorarios);
        // METODO PARA ACTUALIZAR HORARIO DE USUARIO
        this.router.put('/', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.ActualizarEmpleadoHorarios);
        // METODO PARA BUSCAR HORARIOS EXISTENTES DEL USUARIO EN FECHAS DETERMINADAS  --**VERIFICADO
        this.router.post('/horarios-existentes/:codigo', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.VerificarHorariosExistentes);
        // METODO PARA BUSCAR HORARIOS EXISTENTES DEL USUARIO EN FECHAS DETERMINADAS ACTUALIZACION
        this.router.post('/horarios-existentes-edicion/:empl_id', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.VerificarHorariosExistentesEdicion);
        // METODO PARA OBTENER HORARIO DEL USUARIO POR DIAS
        this.router.post('/horario-dias', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.ObtenerHorarioDias);
        // METODO PARA OBTENER HORARIO DEL USUARIO POR HORAS EN EL MISMO DIA
        this.router.post('/horario-horas-mismo-dia', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.ObtenerHorarioHorasMD);
        // METODO PARA OBTENER HORARIO DEL USUARIO POR HORAS EN DIAS DIFERENTES
        this.router.post('/horario-horas-dias-diferentes', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.ObtenerHorarioHorasDD);
        // METODO PARA OBTENER MINUTOS DE ALIMENTACION - HORARIO DEL USUARIO OPCION HORAS EN EL MISMO DIA
        this.router.post('/horario-comida-horas-mismo-dia', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.ObtenerComidaHorarioHorasMD);
        // METODO PARA OBTENER MINUTOS DE ALIMENTACION - HORARIO DEL USUARIO OPCION HORAS EN DIAS DIFERENTES
        this.router.post('/horario-comida-horas-dias-diferentes', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.ObtenerComidaHorarioHorasDD);
        // METODO PARA VERIFICAR SI EXISTE PLANIFICACION   --**VERIFICADO
        this.router.post('/validarFechas/:codigo', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.VerificarFechasHorario);
        this.router.get('/', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.ListarEmpleadoHorarios);
        this.router.post('/cargaMultiple', [verificarToken_1.TokenValidation, multipartMiddleware], empleadoHorariosControlador_1.default.CargarMultiplesHorariosEmpleadosPlantilla);
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.EliminarRegistros);
        this.router.post('/fechas_horario/:id_empleado', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.ObtenerHorariosEmpleadoFechas);
        this.router.post('/validarFechas/horarioEmpleado/:id/empleado/:codigo', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.VerificarFechasHorarioEdicion);
        this.router.post('/busqueda-horarios/:codigo', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.BuscarHorariosFechas);
        // Verificar datos de la plantilla del horario de un empleado
        this.router.post('/revisarData/:id', [verificarToken_1.TokenValidation, multipartMiddleware], empleadoHorariosControlador_1.default.VerificarDatos_PlantillaEmpleado_Horario);
        this.router.post('/verificarPlantilla/upload', [verificarToken_1.TokenValidation, multipartMiddleware], empleadoHorariosControlador_1.default.VerificarPlantilla_HorarioEmpleado);
        this.router.post('/plan_general/upload/:id/:codigo', [verificarToken_1.TokenValidation, multipartMiddleware], empleadoHorariosControlador_1.default.CrearPlanificacionGeneral);
        this.router.post('/upload/:id/:codigo', [verificarToken_1.TokenValidation, multipartMiddleware], empleadoHorariosControlador_1.default.CrearHorarioEmpleadoPlantilla);
    }
}
const EMPLEADO_HORARIOS_RUTAS = new EmpleadoHorariosRutas();
exports.default = EMPLEADO_HORARIOS_RUTAS.router;
