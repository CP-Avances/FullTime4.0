"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tituloControlador_1 = __importDefault(require("../../controlador/Catalogos/tituloControlador"));
class TituloRutas {
    constructor() {
        this.router = express_1.Router();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', tituloControlador_1.default.list);
        this.router.get('/:id', tituloControlador_1.default.getOne);
        this.router.post('/', tituloControlador_1.default.create);
    }
}
const tituloRutas = new TituloRutas();
exports.default = tituloRutas.router;
