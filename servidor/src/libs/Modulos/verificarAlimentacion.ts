import { NextFunction, Request, Response } from 'express';

export const ModuloAlimentacionValidation = (req: Request, res: Response, next: NextFunction) => {

    const { alimentacion } = req.modulos;
    if (!alimentacion) return res.status(401).jsonp({
        access: false,
        title: `Ups! al parecer no tienes activado en tu plan el Módulo de Alimentación. \n`,
        message: '¿Te gustaría activarlo? Comunícate con nosotros.',
        url: 'www.casapazmino.com.ec'
    })
    next()
}