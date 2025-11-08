import { Router } from 'express';

import ALIMENTACION_CONTROLADOR from '../../controlador/reportes/alimentacionControlador';
import { ModuloAlimentacionValidation } from '../../libs/Modulos/verificarAlimentacion';
import { TokenValidation } from '../../libs/verificarToken';

class AlimentacionRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // TIMBRES DE ALIMENTACION   **USADO
        this.router.post('/timbres-alimentacion/:desde/:hasta', [TokenValidation], ALIMENTACION_CONTROLADOR.ReporteTimbresAlimentacion);
    }
}

const ALIMENTACION_RUTAS = new AlimentacionRutas();

export default ALIMENTACION_RUTAS.router;