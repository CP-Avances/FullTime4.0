import { NextFunction, Request, Response } from 'express';

export const ModuloPermisosValidation = (req: Request, res: Response, next: NextFunction) => {

    const { permisos } = req.modulos;
    console.log('******************** validacion de modulo de permisos', permisos);
    
    if (!permisos) return res.status(401).jsonp({
        access: false, 
        message: 'Ups! Al parecer no tienes activado en tu plan el módulo de permisos. Te gustaría activarlo? Comunícate con nosotros', 
        url: 'www.casapazmino.com.ec'
    })
    
    console.log('******************** si tiene acceso modulo de permisos', permisos);
    next()
}