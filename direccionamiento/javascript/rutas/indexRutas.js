"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const indexControlador_1 = require("../controlador/indexControlador");
class IndexRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', indexControlador_1.indexControlador.index);
    }
}
const indexRutas = new IndexRutas();
exports.default = indexRutas.router;
