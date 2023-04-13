"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuloHoraExtraValidation = void 0;
exports.ModuloHoraExtraValidation = (req, res, next) => {
    const { hora_extra } = req.modulos;
    console.log('******************** validacion de modulo de Hora Extra', hora_extra);
    if (!hora_extra)
        return res.status(401).jsonp({ message: 'No tiene acceso a los recursos del módulo de horas extras' });
    console.log('******************** si tiene acceso modulo de Hora Extra', hora_extra);
    next();
};
