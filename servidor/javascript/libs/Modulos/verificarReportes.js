"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuloReportesValidation = void 0;
const ModuloReportesValidation = (req, res, next) => {
    const { reportes } = req.modulos;
    console.log('******************** validacion de modulo de reportes', reportes);
    if (!reportes)
        return res.status(401).jsonp({
            access: false,
            title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Reportes. \n`,
            message: '¿Te gustaría activarlo? Comunícate con nosotros.',
            url: 'www.casapazmino.com.ec'
        });
    console.log('******************** si tiene acceso modulo de reportes', reportes);
    next();
};
exports.ModuloReportesValidation = ModuloReportesValidation;
