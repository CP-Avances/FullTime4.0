import * as CryptoJS from 'crypto-js';
// IMPORTACION FRASE PARA ENCRIPTAR, SEMILLA IV PARA ENCRIPTAR VECTOR DE INICIALIZACION, SEMILLA SALT FRASE PARA ENCRIPTAR DE DERIVACION LIMITADA
import { frasecontrasenia, ivcontrasenia, saltcontrasenia } from './frase-contrasenia'; 

class RsaKeysService {

    // CODIFICACION DE BASE64 A UTF8
    private key = CryptoJS.enc.Utf8.parse(frasecontrasenia);
    private iv = CryptoJS.enc.Utf8.parse(ivcontrasenia);
    private salt = CryptoJS.enc.Utf8.parse(saltcontrasenia);
    // GENERACION DE KEY DE DERIVACION ENCRIPTADA PARA PASSWORDS
    private keyLogin = CryptoJS.enc.Utf8.parse(CryptoJS.PBKDF2(this.key, this.salt, { keySize: 8, iterations: 1000 }).toString());

    constructor() {
    }

    public encriptarDatos(password: string): string{
        // ENCRIPTACION SIN KEY ENCRIPTADA, MAS EFICIENTE PARA DATOS QUE NO SEAN PASSWORDS
        return CryptoJS.AES.encrypt(password, this.key, {iv: this.iv}).toString();
    }

    public desencriptarDatos(passwordEncrypted: string): string{
        // DESENCRIPTACION SIN KEY ENCRIPTADA, MAS EFICIENTE PARA DATOS QUE NO SEAN PASSWORDS
        return CryptoJS.AES.decrypt(passwordEncrypted, this.key, { iv: this.iv }).toString(CryptoJS.enc.Utf8);
    }

    public encriptarLogin(password: string): string{
        // ENCRIPTACION CON KEY ENCRIPTADA PARA PASSWORDS
        return CryptoJS.AES.encrypt(password, this.keyLogin, { iv: this.iv}).toString();
    }
    
}

export const FUNCIONES_LLAVES = new RsaKeysService();
export default FUNCIONES_LLAVES;