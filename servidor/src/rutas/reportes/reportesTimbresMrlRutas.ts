import { Router } from 'express';
import { TokenValidation } from '../../libs/verificarToken';
import REPORTES_TIMBRES_MRL_CONTROLADOR from '../../controlador/reportes/reportesTimbresMrlControlador';
class ReportesTimbresMrlRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // REPORTES DE TIMBRES MRL
        this.router.put('/timbres/:desde/:hasta', TokenValidation, REPORTES_TIMBRES_MRL_CONTROLADOR.ReporteTimbresMrl);
        this.router.put('/timbres-regimen-cargo/:desde/:hasta', TokenValidation, REPORTES_TIMBRES_MRL_CONTROLADOR.ReporteTimbresMrlRegimenCargo);

    }
}

const REPORTES_TIMBRES_MRL_RUTAS = new ReportesTimbresMrlRutas();

export default REPORTES_TIMBRES_MRL_RUTAS.router;