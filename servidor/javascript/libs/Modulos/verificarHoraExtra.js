"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuloHoraExtraValidation = void 0;
const ModuloHoraExtraValidation = (req, res, next) => {
    const { hora_extra } = req.modulos;
    if (!hora_extra)
        return res.status(401).jsonp({
            access: false,
            title: `Ups! al parecer no tienes activado en tu plan el Módulo de Horas Extras. \n`,
            message: '¿Te gustaría activarlo? Comunícate con nosotros.',
            url: 'www.casapazmino.com.ec'
        });
    next();
};
exports.ModuloHoraExtraValidation = ModuloHoraExtraValidation;
