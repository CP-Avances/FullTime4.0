"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rolesControlador_1 = __importDefault(require("../../controlador/roles/rolesControlador"));
class MenuRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA LISTAR LAS OPCIONES DE MENU 
        this.router.get('/menuRoles', rolesControlador_1.default.ListarMenuRoles);
    }
}
const MENU_RUTAS = new MenuRutas();
exports.default = MENU_RUTAS.router;
