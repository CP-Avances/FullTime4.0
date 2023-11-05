import { Router } from 'express';
import { TokenValidation } from '../../libs/verificarToken';
import FALTAS_CONTROLADOR from '../../controlador/reportes/reportesFaltasControlador';

class FaltasRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // CONSULTA DE TIMBRES CON SALIDAS ANTICIPADAS
        this.router.put('/faltas/:desde/:hasta', TokenValidation, FALTAS_CONTROLADOR.ReporteFaltas);
        
        // CONSULTA DE TIMBRES CON SALIDAS ANTICIPADAS PARA REGIMEN CARGO
        this.router.put('/faltas-regimen-cargo/:desde/:hasta', TokenValidation, FALTAS_CONTROLADOR.ReporteFaltasRegimenCargo);

    }
}

const FALTAS_RUTAS = new FaltasRutas();

export default FALTAS_RUTAS.router;