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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FUNCIONES_LLAVES = void 0;
const CryptoJS = __importStar(require("crypto-js"));
const frase_contrasenia_1 = require("./frase-contrasenia"); //Importacion frase para encriptar, semilla iv para encriptar vector de inicializacion, semilla salt frase para encriptar de derivacion limitada
class RsaKeysService {
    constructor() {
        //Codificacion de Base64 a UTF8
        this.key = CryptoJS.enc.Utf8.parse(frase_contrasenia_1.frasecontrasenia);
        this.iv = CryptoJS.enc.Utf8.parse(frase_contrasenia_1.ivcontrasenia);
        this.salt = CryptoJS.enc.Utf8.parse(frase_contrasenia_1.saltcontrasenia);
        //Generacion de key de derivacion encriptada para passwords
        this.keyLogin = CryptoJS.enc.Utf8.parse(CryptoJS.PBKDF2(this.key, this.salt, { keySize: 8, iterations: 1000 }).toString());
    }
    encriptarDatos(password) {
        //Encriptacion sin key encriptada, mas eficiente para datos que no sean passwords
        return CryptoJS.AES.encrypt(password, this.key, { iv: this.iv }).toString();
    }
    desencriptarDatos(passwordEncrypted) {
        //Desencriptacion sin key encriptada, mas eficiente para datos que no sean passwords
        return CryptoJS.AES.decrypt(passwordEncrypted, this.key, { iv: this.iv }).toString(CryptoJS.enc.Utf8);
    }
    encriptarLogin(password) {
        //Encriptacion con key encriptada para passwords
        return CryptoJS.AES.encrypt(password, this.keyLogin, { iv: this.iv }).toString();
    }
    desencriptarLogin(passwordEncrypted) {
        return CryptoJS.AES.decrypt(passwordEncrypted, this.keyLogin, { iv: this.iv }).toString(CryptoJS.enc.Utf8);
    }
}
exports.FUNCIONES_LLAVES = new RsaKeysService();
exports.default = exports.FUNCIONES_LLAVES;
