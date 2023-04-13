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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
class LicenciasControlador {
    GuardarBloqueLicencias(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log(req.body);
            try {
                fs_1.default.readFile('licencia.conf.json', 'utf8', function (err, data) {
                    // console.log('* Mensaje de error: ', err);
                    // console.log('* Mensaje de data: ', data);
                    if (err) {
                        fs_1.default.appendFile('licencia.conf.json', JSON.stringify([]), function (err) {
                            console.log('entro al appendFile', err === null || err === void 0 ? void 0 : err.message);
                            if (err)
                                throw err;
                            // console.log('Archivo de LICENCIAS creado!');
                            fs_1.default.readFile('licencia.conf.json', 'utf8', function (err1, data2) {
                                let block_licencias_inicio = JSON.parse(data2);
                                block_licencias_inicio.push(req.body);
                                fs_1.default.writeFile('licencia.conf.json', JSON.stringify(block_licencias_inicio), function (err) {
                                    if (err)
                                        throw err;
                                    // console.log('Archivo licencias actualizado data2!');
                                });
                                return res.status(200).json({ message: 'licencia almacenada en Api' });
                            });
                        });
                    }
                    if (data) {
                        let block_licencias = JSON.parse(data);
                        block_licencias.push(req.body);
                        fs_1.default.writeFile('licencia.conf.json', JSON.stringify(block_licencias), function (err) {
                            if (err)
                                throw err;
                            // console.log('Archivo licencias actualizado data!');
                            return res.status(200).json({ message: 'licencia almacenada en Api' });
                        });
                    }
                });
            }
            catch (error) {
                return res.status(404).json({ message: error.toString() });
            }
        });
    }
}
const validarConexion = (req, res, next) => {
    // console.log(req.headers);
    if (!req.headers.authorization)
        return res.status(401).jsonp({ message: "No puede solicitar, permiso denegado" });
    const { user, password } = JSON.parse(req.headers.authorization);
    if (user === process.env.USER_APP_ADMIN && password === process.env.PASSWORD_APP_ADMIN) {
        next();
    }
    else {
        return res.status(401).jsonp({ message: "No puede solicitar, permiso denegado" });
    }
};
const LICENCIAS = new LicenciasControlador();
class LicenciaRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.post('/createFile', validarConexion, LICENCIAS.GuardarBloqueLicencias);
    }
}
const LICENCIAS_RUTAS = new LicenciaRutas();
exports.default = LICENCIAS_RUTAS.router;
