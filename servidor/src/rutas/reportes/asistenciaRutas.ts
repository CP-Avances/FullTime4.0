import {Router} from 'express'
import ASISTENCIA_CONTROLADOR from '../../controlador/reportes/asistenciaControlador'
import { TokenValidation } from '../../libs/verificarToken'

class AsistenciaRutas {

    public router: Router = Router();

    constructor(){
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/:id_empleado/:desde/:hasta', TokenValidation, ASISTENCIA_CONTROLADOR.ObtenerHorasTrabajadas);
        this.router.get('/lista-empleados/:id_empresa', TokenValidation, ASISTENCIA_CONTROLADOR.ObtenerListaEmpresa)
    }

}

const ASISTENCIA_RUTAS = new AsistenciaRutas()

export default ASISTENCIA_RUTAS.router;