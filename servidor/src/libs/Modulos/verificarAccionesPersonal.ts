import { NextFunction, Request, Response } from 'express';

export const ModuloAccionesPersonalValidation = (req: Request, res: Response, next: NextFunction) => {

    const { accion_personal } = req.modulos;
    if (!accion_personal) return res.status(401).jsonp({
        access: false,
        title: `Ups! al parecer no tienes activado en tu plan el Módulo de Acciones de Personal. \n`,
        message: '¿Te gustaría activarlo? Comunícate con nosotros.',
        url: 'www.casapazmino.com.ec'
    })
    next()
}