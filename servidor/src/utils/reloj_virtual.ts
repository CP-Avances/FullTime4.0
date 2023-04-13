import { Request, Response, Router, NextFunction } from 'express';
import fs from 'fs';

class RelojVirtualControlador {

    public async ShowLogoApp(req: Request, res: Response): Promise<any> {
        const name = req.params.logo;
        let filePath = `servidor\\logos\\${name}`
        res.sendFile(__dirname.split("servidor")[0] + filePath);
    }

}

const RELOG_VIRTUAL = new RelojVirtualControlador();

class RelojVirutalRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/logo-app/:logo', RELOG_VIRTUAL.ShowLogoApp);
    }
}

const RELOJ_VIRTUAL_RUTAS = new RelojVirutalRutas();

export default RELOJ_VIRTUAL_RUTAS.router;