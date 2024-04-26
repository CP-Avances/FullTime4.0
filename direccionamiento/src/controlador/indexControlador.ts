import { Request, Response } from 'express';

class IndexControlador {
    public index(req: Request, res: Response) {
        res.jsonp({ text: 'Probando funciones' });
    }
}

export const indexControlador = new IndexControlador();