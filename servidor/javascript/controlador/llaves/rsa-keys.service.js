"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FUNCIONES_LLAVES = void 0;
const CryptoJS = __importStar(require("crypto-js"));
// IMPORTACION FRASE PARA ENCRIPTAR, SEMILLA IV PARA ENCRIPTAR VECTOR DE INICIALIZACION, SEMILLA SALT FRASE PARA ENCRIPTAR DE DERIVACION LIMITADA
const frase_contrasenia_1 = require("./frase-contrasenia");
class RsaKeysService {
    constructor() {
        // CODIFICACION DE BASE64 A UTF8
        this.key = CryptoJS.enc.Utf8.parse(frase_contrasenia_1.frasecontrasenia);
        this.iv = CryptoJS.enc.Utf8.parse(frase_contrasenia_1.ivcontrasenia);
        this.salt = CryptoJS.enc.Utf8.parse(frase_contrasenia_1.saltcontrasenia);
        // GENERACION DE KEY DE DERIVACION ENCRIPTADA PARA PASSWORDS
        this.keyLogin = CryptoJS.enc.Utf8.parse(CryptoJS.PBKDF2(this.key, this.salt, { keySize: 8, iterations: 1000 }).toString());
    }
    encriptarDatos(password) {
        // ENCRIPTACION SIN KEY ENCRIPTADA, MAS EFICIENTE PARA DATOS QUE NO SEAN PASSWORDS
        return CryptoJS.AES.encrypt(password, this.key, { iv: this.iv }).toString();
    }
    desencriptarDatos(passwordEncrypted) {
        // DESENCRIPTACION SIN KEY ENCRIPTADA, MAS EFICIENTE PARA DATOS QUE NO SEAN PASSWORDS
        return CryptoJS.AES.decrypt(passwordEncrypted, this.key, { iv: this.iv }).toString(CryptoJS.enc.Utf8);
    }
    encriptarLogin(password) {
        // ENCRIPTACION CON KEY ENCRIPTADA PARA PASSWORDS
        return CryptoJS.AES.encrypt(password, this.keyLogin, { iv: this.iv }).toString();
    }
}
exports.FUNCIONES_LLAVES = new RsaKeysService();
exports.default = exports.FUNCIONES_LLAVES;
