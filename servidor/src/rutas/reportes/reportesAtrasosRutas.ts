import { Router } from 'express';
import { TokenValidation } from '../../libs/verificarToken'
import REPORTES_ATRASOS_CONTROLADOR from '../../controlador/reportes/reportesAtrasosControlador';

class ReportesAtrasosRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO DE BUSQUEDA DE DATOS DE ATRASOS LISTA sucursales[regimenes[departamentos[cargos[empleados]]]]
        this.router.put('/atrasos-empleados/:desde/:hasta', TokenValidation, REPORTES_ATRASOS_CONTROLADOR.ReporteAtrasos);

        // METODO DE BUSQUEDA DE DATOS DE ATRASOS LISTA sucursales[empleados]]
        this.router.put('/atrasos-empleados-regimen-cargo/:desde/:hasta', TokenValidation, REPORTES_ATRASOS_CONTROLADOR.ReporteAtrasosRegimenCargo);
    }
}

const REPORTES_ATRASOS_RUTAS = new ReportesAtrasosRutas();

export default REPORTES_ATRASOS_RUTAS.router;