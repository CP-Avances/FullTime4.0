"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuloHoraExtraValidation = void 0;
const ModuloHoraExtraValidation = (req, res, next) => {
    const { hora_extra } = req.modulos;
    console.log('******************** validacion de modulo de Hora Extra', hora_extra);
    if (!hora_extra)
        return res.status(401).jsonp({
            access: false,
            message: 'Ups! Al parecer no tienes activado en tu plan el módulo de horas extras. Te gustaría activarlo? Comunícate con nosotros',
            url: 'www.casapazmino.com.ec'
        });
    console.log('******************** si tiene acceso modulo de Hora Extra', hora_extra);
    next();
};
exports.ModuloHoraExtraValidation = ModuloHoraExtraValidation;
