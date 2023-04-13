"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const procesoControlador_1 = __importDefault(require("../../controlador/Catalogos/procesoControlador"));
class ProcesoRutas {
    constructor() {
        this.router = express_1.Router();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', procesoControlador_1.default.list);
        this.router.get('/busqueda/:nombre', procesoControlador_1.default.getIdByNombre);
        this.router.get('/:id', procesoControlador_1.default.getOne);
        this.router.post('/', procesoControlador_1.default.create);
    }
}
const PROCESO_RUTAS = new ProcesoRutas();
exports.default = PROCESO_RUTAS.router;
