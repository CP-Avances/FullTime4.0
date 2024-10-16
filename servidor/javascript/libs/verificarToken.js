"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenValidation = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs_1 = __importDefault(require("fs"));
const accesoCarpetas_1 = require("./accesoCarpetas");
const TokenValidation = (req, res, next) => {
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
        // SI EL TOKEN NO ESTA VACIO
        // SE EXTRAE LOS DATOS DEL TOKEN 
        const payload = jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET || 'llaveSecreta');
        // CUANDO SE EXTRAE LOS DATOS SE GUARDA EN UNA PROPIEDAD REQ.USERID PARA Q LAS DEMAS FUNCIONES PUEDAN UTILIZAR ESE ID 
        if (!payload._web_access)
            return res.status(401).send('No tiene acceso a los recursos de la aplicacion.');
        let archivo_licencia = (0, accesoCarpetas_1.ObtenerRutaLicencia)();
        fs_1.default.readFile(archivo_licencia, 'utf8', function (err, data) {
            const FileLicencias = JSON.parse(data);
            if (err)
                return res.status(401).send('No existe registro de licencias.');
            const ok_licencias = FileLicencias.filter((o) => {
                return o.public_key === payload._licencia;
            }).map((o) => {
                o.fec_activacion = new Date(o.fec_activacion),
                    o.fec_desactivacion = new Date(o.fec_desactivacion);
                return o;
            });
            if (ok_licencias.length === 0)
                return res.status(401).send('La licencia no existe.');
            const hoy = new Date();
            const { fec_activacion, fec_desactivacion } = ok_licencias[0];
            if (hoy <= fec_desactivacion && hoy >= fec_activacion) {
                req.userId = payload._id;
                req.userIdEmpleado = payload._id_empleado;
                req.id_empresa = payload._empresa,
                    req.userRol = payload.rol;
                req.userIdCargo = payload.cargo;
                req.userCodigo = payload.codigo;
                req.acciones_timbres = payload._acc_tim;
                req.modulos = payload.modulos;
                next();
            }
            else {
                return res.status(401).send('Ups!!! La licencia a expirado.');
            }
        });
    }
    catch (error) {
        return res.status(401).send(error.message);
    }
};
exports.TokenValidation = TokenValidation;
