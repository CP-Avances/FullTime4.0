import { Router } from 'express';
import { TokenValidation } from '../../libs/verificarToken'
import VACACIONES_REPORTE_CONTROLADOR from '../../controlador/reportes/solicitudVacacionControlador';

class SolicitudVacacionesRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // REPORTE DE SOLICITUDES DE VACACIONES
        this.router.put('/vacaciones-solicitudes/:desde/:hasta', TokenValidation, VACACIONES_REPORTE_CONTROLADOR.ReporteVacacionesMultiple);

    }
}

const VACACIONES_REPORTE_RUTAS = new SolicitudVacacionesRutas();

export default VACACIONES_REPORTE_RUTAS.router;
