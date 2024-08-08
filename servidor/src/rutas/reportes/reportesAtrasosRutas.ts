import { Router } from 'express';
import { TokenValidation } from '../../libs/verificarToken'
import REPORTES_ATRASOS_CONTROLADOR from '../../controlador/reportes/reportesAtrasosControlador';

class ReportesAtrasosRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO DE BUSQUEDA DE DATOS DE ATRASOS LISTA
        this.router.post('/atrasos-empleados/:desde/:hasta', TokenValidation, REPORTES_ATRASOS_CONTROLADOR.ReporteAtrasos);

    }
}

const REPORTES_ATRASOS_RUTAS = new ReportesAtrasosRutas();

export default REPORTES_ATRASOS_RUTAS.router;