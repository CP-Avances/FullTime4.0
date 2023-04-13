"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenValidation = void 0;
exports.TokenValidation = (req, res, next) => {
    // verifica si en la peticion existe la cabecera autorizacion 
    if (!req.headers.authorization) {
        return res.status(401).send('No puede solicitar, permiso denegado');
    }
    // si existe pasa a la siguiente
    // para verificar si el token esta vacio
    const token = req.headers.authorization.split(' ')[1];
    if (token === 'null') {
        return res.status(401).send('No continen token de autenticación');
    }
    next();
};
