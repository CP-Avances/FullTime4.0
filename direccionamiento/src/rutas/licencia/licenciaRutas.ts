import { Router } from 'express';
import LICENCIA_CONTROLADOR from '../../controlador/licencia/licenciaControlador';

class LicenciaRutas {
    public router: Router = Router();

    constructor(){
        this.configuracion();
    }

    configuracion(): void {
        this.router.post('/', LICENCIA_CONTROLADOR.ObtenerLicencia);   
    }
}

const LICENCIA_RUTAS = new LicenciaRutas();
export default LICENCIA_RUTAS.router;