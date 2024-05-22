"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../../libs/verificarToken");
const discapacidadControlador_1 = __importDefault(require("../../../controlador/empleado/empleadoDiscapacidad/discapacidadControlador"));
class DiscapacidadRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA BUSCAR DATOS DISCAPACIDAD USUARIO
        this.router.get('/:id_empleado', verificarToken_1.TokenValidation, discapacidadControlador_1.default.BuscarDiscapacidadUsuario);
        // METODO PARA REGISTRAR DISCAPACIDAD
        this.router.post('/', verificarToken_1.TokenValidation, discapacidadControlador_1.default.RegistrarDiscapacidad);
        // METODO PARA ACTUALIZAR DATOS DISCAPACIDAD
        this.router.put('/:id_empleado', verificarToken_1.TokenValidation, discapacidadControlador_1.default.ActualizarDiscapacidad);
        // METODO PARA ELIMINAR REGISTRO
        this.router.delete('/eliminar/:id_empleado', verificarToken_1.TokenValidation, discapacidadControlador_1.default.EliminarDiscapacidad);
        /** *************************************************************************************** **
         ** **                METODO PARA MANEJO DE DATOS DE TIPO DISCAPACIDAD                   ** **
         ** *************************************************************************************** **/
        // METODO PARA REGISTRAR TIPO DE DISCAPACIDAD
        this.router.post('/buscarTipo', verificarToken_1.TokenValidation, discapacidadControlador_1.default.RegistrarTipo);
        // METODO PARA BUSCAR LISTA DE TIPOS DE DISCAPACIDAD
        this.router.get('/buscarTipo/tipo', verificarToken_1.TokenValidation, discapacidadControlador_1.default.ListarTipo);
        // METODO PARA BUSCAR DISCAPACIDAD POR SU NOMBRE
        this.router.post('/buscarTipo/nombre', verificarToken_1.TokenValidation, discapacidadControlador_1.default.BuscarDiscapacidadNombre);
        this.router.get('/', verificarToken_1.TokenValidation, discapacidadControlador_1.default.list);
    }
}
const DISCAPACIDAD_RUTAS = new DiscapacidadRutas();
exports.default = DISCAPACIDAD_RUTAS.router;
