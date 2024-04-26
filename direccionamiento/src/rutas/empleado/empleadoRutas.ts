import { Router } from 'express';
import EMPLEADO_CONTROLADOR from '../../controlador/empleado/empleadoControlador';

class EmpleadoRutas {
    public router: Router = Router();

    constructor(){
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/buscador/empleado', EMPLEADO_CONTROLADOR.ObtenerEmpleado);
    }
}

const EMPLEADO_RUTAS = new EmpleadoRutas();
export default EMPLEADO_RUTAS.router;