import { Router } from 'express';
import { TokenValidation } from '../../../libs/verificarToken';
import PERIODO_VACACION_CONTROLADOR from '../../../controlador/modulos/vacaciones/periodoVacacionControlador';

class DepartamentoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA CREAR PERIODO DE VACACIONES   **USADO
        this.router.post('/', TokenValidation, PERIODO_VACACION_CONTROLADOR.CrearPerVacaciones);

        // METODO PARA ACTUALIZAR PERIODO DE VACACIONES   **USADO
        this.router.put('/', TokenValidation, PERIODO_VACACION_CONTROLADOR.ActualizarPeriodo);

        // METODO PARA CONSULTAR DATOS DE PERIODO DE VACACION    **USADO
        this.router.get('/infoPeriodo/:id_empleado', TokenValidation, PERIODO_VACACION_CONTROLADOR.EncontrarPerVacaciones);

        // METODO PARA BUSCAR PERIODO DE VACACIONES   **USADO
        this.router.get('/buscar/:id_empleado', TokenValidation, PERIODO_VACACION_CONTROLADOR.EncontrarIdPerVacaciones);



    }
}

const PERIODO_VACACION__RUTAS = new DepartamentoRutas();

export default PERIODO_VACACION__RUTAS.router;