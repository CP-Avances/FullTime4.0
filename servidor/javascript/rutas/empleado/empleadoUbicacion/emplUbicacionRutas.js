"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../../libs/verificarToken");
const emplUbicacionControlador_1 = __importDefault(require("../../../controlador/empleado/empleadoUbicacion/emplUbicacionControlador"));
// ALMACENAMIENTO DEL CERTIFICADO DE VACUNACIÓN EN CARPETA
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './carnetVacuna',
});
class UbicacionRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        /** *********************************************************************************************** **
         ** **                     CONSULTAS DE COORDENADAS DE UBICACION DEL USUARIO                     ** **
         ** *********************************************************************************************** **/
        // LISTAR COORDENADAS DE UBICACION DEL USUARIO
        this.router.get('/coordenadas-usuario/:id_empl', verificarToken_1.TokenValidation, emplUbicacionControlador_1.default.ListarRegistroUsuario);
        this.router.post('/coordenadas-usuario', verificarToken_1.TokenValidation, emplUbicacionControlador_1.default.RegistrarCoordenadasUsuario);
        this.router.get('/coordenadas-usuarios/general/:id_ubicacion', emplUbicacionControlador_1.default.ListarRegistroUsuarioU);
        this.router.delete('/eliminar-coordenadas-usuario/:id', verificarToken_1.TokenValidation, emplUbicacionControlador_1.default.EliminarCoordenadasUsuario);
        /** *********************************************************************************************** **
         ** **           RUTAS DE ACCESO A CONSULTAS DE COORDENADAS DE UBICACIÓN GENERALES               ** **
         ** *********************************************************************************************** **/
        this.router.post('/', verificarToken_1.TokenValidation, emplUbicacionControlador_1.default.RegistrarCoordenadas);
        this.router.put('/', verificarToken_1.TokenValidation, emplUbicacionControlador_1.default.ActualizarCoordenadas);
        this.router.get('/', verificarToken_1.TokenValidation, emplUbicacionControlador_1.default.ListarCoordenadas);
        this.router.get('/especifico/:id', verificarToken_1.TokenValidation, emplUbicacionControlador_1.default.ListarCoordenadasDefinidas);
        this.router.get('/determinada/:id', emplUbicacionControlador_1.default.ListarUnaCoordenada);
        this.router.get('/ultimo-registro', emplUbicacionControlador_1.default.BuscarUltimoRegistro);
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, emplUbicacionControlador_1.default.EliminarCoordenadas);
    }
}
const UBICACION_RUTAS = new UbicacionRutas();
exports.default = UBICACION_RUTAS.router;
