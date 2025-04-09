import {Router} from 'express'
import REPORTE_HORA_EXTRA_CONTROLADOR from '../../controlador/reportes/reporteHoraExtraControlador'
import { TokenValidation } from '../../libs/verificarToken'

class ReporteHoraExtraRutas {

    public router: Router = Router();

    constructor(){
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/:id_empleado/:desde/:hasta', TokenValidation, REPORTE_HORA_EXTRA_CONTROLADOR.ReporteHorasExtras);
    }

}

const REPORTE_HORA_EXTRA_RUTAS = new ReporteHoraExtraRutas()

export default REPORTE_HORA_EXTRA_RUTAS.router;