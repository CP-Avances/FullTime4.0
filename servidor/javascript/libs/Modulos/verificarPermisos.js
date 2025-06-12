"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuloPermisosValidation = void 0;
const ModuloPermisosValidation = (req, res, next) => {
    const { permisos } = req.modulos;
    console.log('******************** validacion de modulo de permisos', permisos);
    if (!permisos)
        return res.status(401).jsonp({
            access: false,
            title: `Ups! al parecer no tienes activado en tu plan el Módulo de Permisos. \n`,
            message: '¿Te gustaría activarlo? Comunícate con nosotros.',
            url: 'www.casapazmino.com.ec'
        });
    console.log('******************** si tiene acceso modulo de permisos', permisos);
    next();
};
exports.ModuloPermisosValidation = ModuloPermisosValidation;
