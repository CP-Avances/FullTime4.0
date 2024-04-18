"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexControlador = void 0;
class IndexControlador {
    index(req, res) {
        res.jsonp({ text: 'Probando funciones' });
    }
}
exports.indexControlador = new IndexControlador();
