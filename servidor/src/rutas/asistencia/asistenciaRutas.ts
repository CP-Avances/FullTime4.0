import { Router } from 'express';
import ASISTENCIA_CONTROLADOR from '../../controlador/asistencia/asistenciaControlador';
import { TokenValidation } from '../../libs/verificarToken'

class AsistenciaRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        this.router.post('/buscar-asistencia', TokenValidation, ASISTENCIA_CONTROLADOR.BuscarAsistencia);
    }
}

const ASISTENCIA_USUARIOS_RUTAS = new AsistenciaRutas();

export default ASISTENCIA_USUARIOS_RUTAS.router;