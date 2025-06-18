import { Router } from 'express';
import PLANTILLA_CONTROLADOR from '../../controlador/documentos/plantillaControlador';

class PlantillaRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // METODO PARA DECARGAR LA PLANTILLA DE REGISTRO DE DATOS   **USADO
        this.router.get('/documento/:docs', PLANTILLA_CONTROLADOR.DescargarPlantilla);

    }
}

const PLANTILLA_RUTAS = new PlantillaRutas();

export default PLANTILLA_RUTAS.router;