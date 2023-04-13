"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catTipoPermisosControlador_1 = __importDefault(require("../../controlador/Catalogos/catTipoPermisosControlador"));
class TipoPermisosRutas {
    constructor() {
        this.router = express_1.Router();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', catTipoPermisosControlador_1.default.list);
        this.router.get('/:id', catTipoPermisosControlador_1.default.getOne);
        this.router.post('/', catTipoPermisosControlador_1.default.create);
    }
}
const tipoPermisosRutas = new TipoPermisosRutas();
exports.default = tipoPermisosRutas.router;
