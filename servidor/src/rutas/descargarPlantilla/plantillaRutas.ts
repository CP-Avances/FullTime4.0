import { Router } from 'express';
import PLANTILLA_CONTROLADOR from '../../controlador/descargarPlantilla/plantillaControlador';
const multipart = require('connect-multiparty');  

class PlantillaRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/documento/:docs', PLANTILLA_CONTROLADOR.DescargarPlantilla);

    }
}

const PLANTILLA_RUTAS = new PlantillaRutas();

export default PLANTILLA_RUTAS.router;