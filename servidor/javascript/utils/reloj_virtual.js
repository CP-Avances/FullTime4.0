"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
class RelojVirtualControlador {
    ShowLogoApp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const name = req.params.logo;
            let filePath = `servidor\\logos\\${name}`;
            res.sendFile(__dirname.split("servidor")[0] + filePath);
        });
    }
}
const RELOG_VIRTUAL = new RelojVirtualControlador();
class RelojVirutalRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/logo-app/:logo', RELOG_VIRTUAL.ShowLogoApp);
    }
}
const RELOJ_VIRTUAL_RUTAS = new RelojVirutalRutas();
exports.default = RELOJ_VIRTUAL_RUTAS.router;
