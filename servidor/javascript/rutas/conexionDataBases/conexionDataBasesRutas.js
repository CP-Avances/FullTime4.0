"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const verificarToken_1 = require("../../libs/verificarToken");
const express_1 = require("express");
const conexionDataBasesControlador_1 = __importDefault(require("../../controlador/conexionDataBases/conexionDataBasesControlador"));
class ConexionDataBasesRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA OPTENER EL NOMBRE DE LA BASE DE DATOS
        this.router.get('/dataBase/:nombre', verificarToken_1.TokenValidation, conexionDataBasesControlador_1.default.setDatabaseName);
    }
}
const CONEXION_DATABASES_RUTAS = new ConexionDataBasesRutas();
exports.default = CONEXION_DATABASES_RUTAS.router;
