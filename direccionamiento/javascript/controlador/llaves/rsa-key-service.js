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
exports.FUNCIONES_LLAVES = exports.RsaKeysService = void 0;
const CryptoJS = __importStar(require("crypto-js"));
const path = __importStar(require("path"));
const privateKeyPath = path.join(__dirname, 'private_key.pem');
class RsaKeysService {
    constructor() {
        //Codificacion de Base64 a UTF8
        this.key = CryptoJS.enc.Utf8.parse('CaPaz@bundancia3');
        this.iv = CryptoJS.enc.Utf8.parse('1792095468001478');
        this.salt = CryptoJS.enc.Utf8.parse('Opis_sasPresidenci@20951');
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
        //const buffer = Buffer.from(ciphertext, 'hex');
    }
    /*
    private desencriptarLogin(passwordEncrypted: string): string {
        return CryptoJS.AES.decrypt(passwordEncrypted, this.keyLogin, { iv: this.iv}).toString(CryptoJS.enc.Utf8);
    }
    */
    desencriptarLlave(password) {
        //const buffer = Buffer.from(password, 'base64');
        //const decrypted = crypto.privateDecrypt(process.env.PRIVATE_KEY as string, buffer);
        //return decrypted.toString('utf8');
        return CryptoJS.AES.decrypt(password, process.env.PRIVATE_KEY).toString();
    }
}
exports.RsaKeysService = RsaKeysService;
exports.FUNCIONES_LLAVES = new RsaKeysService();
exports.default = exports.FUNCIONES_LLAVES;
