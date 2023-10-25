import { Router } from 'express';
import { TokenValidation } from '../../libs/verificarToken'
import SALIDAS_ANTICIPADAS_CONTROLADOR from '../../controlador/reportes/salidaAntesControlador';

class SalidasAnticipadasRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // CONSULTA DE TIMBRES CON SALIDAS ANTICIPADAS
        this.router.put('/timbre-salida-anticipada/:desde/:hasta', TokenValidation, SALIDAS_ANTICIPADAS_CONTROLADOR.ReporteSalidasAnticipadas);
        
        // CONSULTA DE TIMBRES CON SALIDAS ANTICIPADAS PARA REGIMEN CARGO
        this.router.put('/timbre-salida-anticipada-regimen-cargo/:desde/:hasta', TokenValidation, SALIDAS_ANTICIPADAS_CONTROLADOR.ReporteSalidasAnticipadasRegimenCargo);

    }
}

const SALIDAS_ANTICIPADAS_RUTAS = new SalidasAnticipadasRutas();

export default SALIDAS_ANTICIPADAS_RUTAS.router;
