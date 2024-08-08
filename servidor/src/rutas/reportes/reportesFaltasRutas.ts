import { Router } from 'express';
import { TokenValidation } from '../../libs/verificarToken';
import FALTAS_CONTROLADOR from '../../controlador/reportes/reportesFaltasControlador';

class FaltasRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO DE BUSQUEDA DE DATOS DE FALTAS
        this.router.post('/faltas/:desde/:hasta', TokenValidation, FALTAS_CONTROLADOR.ReporteFaltas);

    }
}

const FALTAS_RUTAS = new FaltasRutas();

export default FALTAS_RUTAS.router;