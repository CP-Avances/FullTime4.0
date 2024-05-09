import * as CryptoJS from 'crypto-js';
import { frasecontrasenia } from './frase-contrasenia';//Importacion frase para encriptar
import { ivcontrasenia } from './frase-contrasenia';//Importacion semilla iv para encriptar vector de inicializacion
import { saltcontrasenia } from './frase-contrasenia'//Importacion semilla salt frase para encriptar de derivacion limitada

class RsaKeysService {

    //Codificacion de Base64 a UTF8
    private key = CryptoJS.enc.Utf8.parse(frasecontrasenia);
    private iv = CryptoJS.enc.Utf8.parse(ivcontrasenia);
    private salt = CryptoJS.enc.Utf8.parse(saltcontrasenia);
    //Generacion de key de derivacion encriptada para passwords
    private keyLogin = CryptoJS.enc.Utf8.parse(CryptoJS.PBKDF2(this.key, this.salt, { keySize: 8, iterations: 1000 }).toString());

    constructor() {
    }

    public encriptarDatos(password: string): string{
        //Encriptacion sin key encriptada, mas eficiente para datos que no sean passwords
        return CryptoJS.AES.encrypt(password, this.key, {iv: this.iv}).toString();
    }

    public desencriptarDatos(passwordEncrypted: string): string{
        //Desencriptacion sin key encriptada, mas eficiente para datos que no sean passwords
        return CryptoJS.AES.decrypt(passwordEncrypted, this.key, { iv: this.iv }).toString(CryptoJS.enc.Utf8);
    }

    public encriptarLogin(password: string): string{
        //Encriptacion con key encriptada para passwords
        return CryptoJS.AES.encrypt(password, this.keyLogin, { iv: this.iv}).toString();
    }

    /*
    private desencriptarLogin(passwordEncrypted: string): string {
        return CryptoJS.AES.decrypt(passwordEncrypted, this.keyLogin, { iv: this.iv}).toString(CryptoJS.enc.Utf8);
    }
    */

}

export const FUNCIONES_LLAVES = new RsaKeysService();
export default FUNCIONES_LLAVES;