"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuloReportesValidation = void 0;
const ModuloReportesValidation = (req, res, next) => {
    const { reportes } = req.modulos;
    console.log('******************** validacion de modulo de reportes', reportes);
    if (!reportes)
        return res.status(401).jsonp({
            access: false,
            message: 'Ups! Al parecer no tienes activado en tu plan el módulo de reportes. Te gustaría activarlo? Comunícate con nosotros',
            url: 'www.casapazmino.com.ec'
        });
    console.log('******************** si tiene acceso modulo de reportes', reportes);
    next();
};
exports.ModuloReportesValidation = ModuloReportesValidation;
