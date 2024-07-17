import { Router } from 'express';
import { TokenValidation } from '../../../libs/verificarToken';
import PERIODO_VACACION_CONTROLADOR from '../../../controlador/empleado/empleadoPeriodoVacacion/periodoVacacionControlador';

class DepartamentoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA BUSCAR PERIODO DE VACACIONES
        this.router.get('/buscar/:id_empleado', TokenValidation, PERIODO_VACACION_CONTROLADOR.EncontrarIdPerVacaciones);
        this.router.get('/infoPeriodo/:id_empleado', TokenValidation, PERIODO_VACACION_CONTROLADOR.EncontrarPerVacaciones);
        this.router.post('/', TokenValidation, PERIODO_VACACION_CONTROLADOR.CrearPerVacaciones);
        this.router.put('/', TokenValidation, PERIODO_VACACION_CONTROLADOR.ActualizarPeriodo);

    }
}

const PERIODO_VACACION__RUTAS = new DepartamentoRutas();

export default PERIODO_VACACION__RUTAS.router;