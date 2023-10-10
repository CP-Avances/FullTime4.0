"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuloAlimentacionValidation = void 0;
const ModuloAlimentacionValidation = (req, res, next) => {
    const { alimentacion } = req.modulos;
    console.log('******************** validacion de modulo de alimentacion', alimentacion);
    if (!alimentacion)
        return res.status(401).jsonp({
            access: false,
            title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Alimentación. \n`,
            message: '¿Te gustaría activarlo? Comunícate con nosotros.',
            url: 'www.casapazmino.com.ec'
        });
    console.log('******************** si tiene acceso modulo de alimentacion', alimentacion);
    next();
};
exports.ModuloAlimentacionValidation = ModuloAlimentacionValidation;
