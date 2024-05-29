import {Router} from 'express'
import ASISTENCIA_CONTROLADOR from '../../controlador/reportes/asistenciaControlador'
import { TokenValidation } from '../../libs/verificarToken'

class AsistenciaRutas {

    public router: Router = Router();

    constructor(){
        this.configuracion();
    }

    configuracion(): void {
    }

}

const ASISTENCIA_RUTAS = new AsistenciaRutas()

export default ASISTENCIA_RUTAS.router;