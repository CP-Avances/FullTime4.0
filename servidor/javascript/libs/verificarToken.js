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
exports.TokenValidation = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../database"));
const TokenValidation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // VERIFICA SI EN LA PETICION EXISTE LA CABECERA AUTORIZACION 
    if (!req.headers.authorization) {
        return res.status(401).send('No puede solicitar, permiso denegado.');
    }
    // SI EXISTE PASA A LA SIGUIENTE VALIDACION
    // VERIFICACION SI EL TOKEN ESTA VACIO
    const token = req.headers.authorization.split(' ')[1];
    if (token === 'null') {
        return res.status(401).send('No contienen token de autenticación.');
    }
    try {
        //next();
        // SI EL TOKEN NO ESTA VACIO
        // SE EXTRAE LOS DATOS DEL TOKEN 
        const payload = jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET || 'llaveSecreta');
        // CUANDO SE EXTRAE LOS DATOS SE GUARDA EN UNA PROPIEDAD REQ.USERID PARA Q LAS DEMAS FUNCIONES PUEDAN UTILIZAR ESE ID 
        if (!payload._web_access)
            return res.status(401).send('No tiene acceso a los recursos de la aplicacion.');
        const EMPRESA = yield database_1.default.query(`
            SELECT public_key, id AS id_empresa FROM e_empresa
            `);
        const { public_key, id_empresa } = EMPRESA.rows[0];
        const licenciaData = yield fetch(`${process.env.DIRECCIONAMIENTO}/licencia`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ public_key: public_key })
        });
        if (!licenciaData.ok) {
            return res.status(401).send('No existe registro de licencias.');
        }
        const dataLic = yield licenciaData.json();
        const fec_activacion = new Date(dataLic[0].fecha_activacion);
        const fec_desactivacion = new Date(dataLic[0].fecha_desactivacion);
        const hoy = new Date();
        if (hoy <= fec_desactivacion && hoy >= fec_activacion) {
            req.userId = payload._id;
            req.userIdEmpleado = payload._id_empleado;
            req.id_empresa = payload._empresa,
                req.userRol = payload.rol;
            req.userIdCargo = payload.cargo;
            req.userCodigo = payload.codigo;
            req.acciones_timbres = payload._acc_tim;
            //req.modulos = payload.modulos;
            next();
        }
        else {
            return res.status(401).send('Ups! La licencia a expirado.');
        }
    }
    catch (error) {
        return res.status(401).send(error.message);
    }
});
exports.TokenValidation = TokenValidation;
