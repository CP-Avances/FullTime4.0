"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../libs/verificarToken");
const graficasControlador_1 = __importDefault(require("../../controlador/graficas/graficasControlador"));
class GraficasRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // ADMINISTRADOR
        this.router.get('/admin/hora-extra/micro', verificarToken_1.TokenValidation, graficasControlador_1.default.AdminHorasExtrasMicro);
        this.router.get('/admin/hora-extra/macro/:desde/:hasta', verificarToken_1.TokenValidation, graficasControlador_1.default.AdminHorasExtrasMacro);
        this.router.get('/admin/marcaciones-emp/micro', verificarToken_1.TokenValidation, graficasControlador_1.default.AdminMarcacionesEmpleadoMicro);
        this.router.get('/admin/marcaciones-emp/macro/:desde/:hasta', verificarToken_1.TokenValidation, graficasControlador_1.default.AdminMarcacionesEmpleadoMacro);
        // EMPLEADOS
        this.router.get('/user/hora-extra/micro', verificarToken_1.TokenValidation, graficasControlador_1.default.EmpleadoHorasExtrasMicro);
        this.router.get('/user/hora-extra/macro/:desde/:hasta', verificarToken_1.TokenValidation, graficasControlador_1.default.EmpleadoHorasExtrasMacro);
        this.router.get('/user/vacaciones/micro', verificarToken_1.TokenValidation, graficasControlador_1.default.EmpleadoVacacionesMicro);
        this.router.get('/user/vacaciones/macro/:desde/:hasta', verificarToken_1.TokenValidation, graficasControlador_1.default.EmpleadoVacacionesMacro);
        this.router.get('/user/permisos/micro', verificarToken_1.TokenValidation, graficasControlador_1.default.EmpleadoPermisosMicro);
        this.router.get('/user/permisos/macro/:desde/:hasta', verificarToken_1.TokenValidation, graficasControlador_1.default.EmpleadoPermisosMacro);
    }
}
const GRAFICAS_RUTAS = new GraficasRutas();
exports.default = GRAFICAS_RUTAS.router;
