import { Router } from 'express';
import { TokenValidation } from '../../libs/verificarToken'
import SALIDAS_ANTICIPADAS_CONTROLADOR from '../../controlador/reportes/salidaAntesControlador';

class SalidasAnticipadasRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // CONSULTA DE TIMBRES DE SALIDAS ACCION S
        this.router.put('/timbre-accions/:desde/:hasta', TokenValidation, SALIDAS_ANTICIPADAS_CONTROLADOR.BuscarTimbres_AccionS);

    }
}

const SALIDAS_ANTICIPADAS_RUTAS = new SalidasAnticipadasRutas();

export default SALIDAS_ANTICIPADAS_RUTAS.router;
