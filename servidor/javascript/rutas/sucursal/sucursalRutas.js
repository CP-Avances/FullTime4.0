"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../libs/verificarToken");
const sucursalControlador_1 = __importDefault(require("../../controlador/sucursal/sucursalControlador"));
class SucursalRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // CREAR REGISTRO DE ESTABLECIMIENTO
        this.router.post('/', verificarToken_1.TokenValidation, sucursalControlador_1.default.CrearSucursal);
        // BUSCAR REGISTROS DE ESTABLECIMIENTO POR SU NOMBRE
        this.router.post('/nombre-sucursal', verificarToken_1.TokenValidation, sucursalControlador_1.default.BuscarNombreSucursal);
        // ACTUALIZAR REGISTRO DE ESTABLECIMIENTO
        this.router.put('/', verificarToken_1.TokenValidation, sucursalControlador_1.default.ActualizarSucursal);
        // LISTA DE SUCURSALES POR ID DE EMPRESA
        this.router.get('/empresa-sucursal/:id_empresa', verificarToken_1.TokenValidation, sucursalControlador_1.default.ObtenerSucursalEmpresa);
        // LISTAR SUCURSALES
        this.router.get('/', verificarToken_1.TokenValidation, sucursalControlador_1.default.ListarSucursales);
        // ELIMINAR REGISTRO
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, sucursalControlador_1.default.EliminarRegistros);
        // METODO PARA BUSCAR DATOS DE UNA SUCURSAL
        this.router.get('/unaSucursal/:id', verificarToken_1.TokenValidation, sucursalControlador_1.default.ObtenerUnaSucursal);
    }
}
const SUCURSAL_RUTAS = new SucursalRutas();
exports.default = SUCURSAL_RUTAS.router;
