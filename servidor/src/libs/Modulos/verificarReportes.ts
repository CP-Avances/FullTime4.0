import { NextFunction, Request, Response } from 'express';

export const ModuloReportesValidation = (req: Request, res: Response, next: NextFunction) => {

    const { reportes } = req.modulos;
    if (!reportes) return res.status(401).jsonp({
        access: false,
        title: `Ups! al parecer no tienes activado en tu plan el Módulo de Reportes. \n`,
        message: '¿Te gustaría activarlo? Comunícate con nosotros.',
        url: 'www.casapazmino.com.ec'
    })
    next()
}