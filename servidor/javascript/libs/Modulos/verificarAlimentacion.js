"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuloAlimentacionValidation = void 0;
const ModuloAlimentacionValidation = (req, res, next) => {
    const { alimentacion } = req.modulos;
    console.log('******************** validacion de modulo de alimentacion', alimentacion);
    if (!alimentacion)
        return res.status(401).jsonp({
            access: false,
            message: 'Ups! Al parecer no tienes activado en tu plan el módulo de alimentación. Te gustaría activarlo? Comunícate con nosotros',
            url: 'www.casapazmino.com.ec'
        });
    console.log('******************** si tiene acceso modulo de alimentacion', alimentacion);
    next();
};
exports.ModuloAlimentacionValidation = ModuloAlimentacionValidation;
