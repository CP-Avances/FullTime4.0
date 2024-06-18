import * as CryptoJS from 'crypto-js';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const privateKeyPath = path.join(__dirname, 'private_key.pem');

export class RsaKeysService {

    //Codificacion de Base64 a UTF8
    private key = CryptoJS.enc.Utf8.parse('CaPaz@bundancia3');
    private iv = CryptoJS.enc.Utf8.parse('1792095468001478');
    private salt = CryptoJS.enc.Utf8.parse('Opis_sasPresidenci@20951');
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
        //const buffer = Buffer.from(ciphertext, 'hex');
    }

    /*
    private desencriptarLogin(passwordEncrypted: string): string {
        return CryptoJS.AES.decrypt(passwordEncrypted, this.keyLogin, { iv: this.iv}).toString(CryptoJS.enc.Utf8);
    }
    */

    public desencriptarLlave(password: string): string{
        //const buffer = Buffer.from(password, 'base64');
        //const decrypted = crypto.privateDecrypt(process.env.PRIVATE_KEY as string, buffer);
        //return decrypted.toString('utf8');
        return CryptoJS.AES.decrypt(password, process.env.PRIVATE_KEY as string).toString();
    }
}

export const FUNCIONES_LLAVES = new RsaKeysService();
export default FUNCIONES_LLAVES;