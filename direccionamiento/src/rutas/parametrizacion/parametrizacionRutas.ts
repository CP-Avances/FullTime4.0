import { Router } from 'express';
import PARAMETRIZACION_CONTROLADOR from '../../controlador/parametrizacion/parametrizacionControlador';

class ParametrizacionRutas {
    public router: Router = Router();

    constructor(){
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/:id', PARAMETRIZACION_CONTROLADOR.ObtenerParametrizacion);
    }
}

const PARAMETRIZACION_RUTAS = new ParametrizacionRutas();
export default PARAMETRIZACION_RUTAS.router;