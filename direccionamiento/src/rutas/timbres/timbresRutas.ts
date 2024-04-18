import { Router } from 'express';
import TIMBRES_CONTROLADOR from '../../controlador/timbres/timbresControlador';

class TimbresRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/ver/timbres', TIMBRES_CONTROLADOR.ObtenerTimbres);
    }
}

const TIMBRES_RUTAS = new TimbresRutas();

export default TIMBRES_RUTAS.router;