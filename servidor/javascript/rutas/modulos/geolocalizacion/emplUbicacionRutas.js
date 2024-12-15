"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../../libs/verificarToken");
const emplUbicacionControlador_1 = __importDefault(require("../../../controlador/modulos/geolocalizacion/emplUbicacionControlador"));
class UbicacionRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        /** *********************************************************************************************** **
         ** **                     CONSULTAS DE COORDENADAS DE UBICACION DEL USUARIO                     ** **
         ** *********************************************************************************************** **/
        // LISTAR COORDENADAS DE UBICACION DEL USUARIO    **USADO
        this.router.get('/coordenadas-usuario/:id_empl', verificarToken_1.TokenValidation, emplUbicacionControlador_1.default.ListarRegistroUsuario);
        // METODO PARA REGISTRAR COORDENADAS DEL USUARIO    **USADO
        this.router.post('/coordenadas-usuario', verificarToken_1.TokenValidation, emplUbicacionControlador_1.default.RegistrarCoordenadasUsuario);
        // METODO PARA LISTAR DATOS DE UBICACIONES       **USADO
        this.router.get('/coordenadas-usuarios/general/:id_ubicacion', emplUbicacionControlador_1.default.ListarRegistroUsuarioU);
        // METODO PARA ELIMINAR REGISTROS   **USADO
        this.router.delete('/eliminar-coordenadas-usuario', verificarToken_1.TokenValidation, emplUbicacionControlador_1.default.EliminarCoordenadasUsuario);
        /** *********************************************************************************************** **
         ** **           RUTAS DE ACCESO A CONSULTAS DE COORDENADAS DE UBICACIÓN GENERALES               ** **
         ** *********************************************************************************************** **/
        // METODO PARA REGISTRAR UNA UBICACION   **USADO
        this.router.post('/', verificarToken_1.TokenValidation, emplUbicacionControlador_1.default.RegistrarCoordenadas);
        // METODO PARA ACTUALIZAR COORDENADAS DE UBICACION    **USADO
        this.router.put('/', verificarToken_1.TokenValidation, emplUbicacionControlador_1.default.ActualizarCoordenadas);
        // METODO PARA LISTAR COORDENADAS   **USADO
        this.router.get('/', verificarToken_1.TokenValidation, emplUbicacionControlador_1.default.ListarCoordenadas);
        // METODO PARA BUSCAR UNA UBICACIONES CON EXCEPCION    **USADO
        this.router.get('/especifico/:id', verificarToken_1.TokenValidation, emplUbicacionControlador_1.default.ListarCoordenadasDefinidas);
        // METODO PARA LISTAR DATOS DE UNA UBICACION ESPECIFICA  **USADO
        this.router.get('/determinada/:id', emplUbicacionControlador_1.default.ListarUnaCoordenada);
        // METODO PARA ELIMINAR REGISTROS    **USADO
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, emplUbicacionControlador_1.default.EliminarCoordenadas);
    }
}
const UBICACION_RUTAS = new UbicacionRutas();
exports.default = UBICACION_RUTAS.router;
