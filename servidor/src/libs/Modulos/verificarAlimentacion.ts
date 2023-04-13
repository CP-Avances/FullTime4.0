import { NextFunction, Request, Response } from 'express';

export const ModuloAlimentacionValidation = (req: Request, res: Response, next: NextFunction) => {

    const { alimentacion } = req.modulos;

    console.log('******************** validacion de modulo de alimentacion', alimentacion);

    if (!alimentacion) return res.status(401).jsonp({
        access: false,
        message: 'Ups! Al parecer no tienes activado en tu plan el módulo de alimentación. Te gustaría activarlo? Comunícate con nosotros',
        url: 'www.casapazmino.com.ec'
    })

    console.log('******************** si tiene acceso modulo de alimentacion', alimentacion);
    next()
}