import { Router } from 'express';
import { TokenValidation } from '../../libs/verificarToken'
import ENROLADO_RELOJ_CONTROLADOR from '../../controlador/enroladoReloj/enroladoRelojControlador';

class CiudadRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.post('/insertar', TokenValidation, ENROLADO_RELOJ_CONTROLADOR.AsignarRelojEnrolado);
        this.router.post('/buscar', TokenValidation, ENROLADO_RELOJ_CONTROLADOR.ObtenerIdReloj);
        this.router.get('/nombresReloj/:enroladoid', TokenValidation, ENROLADO_RELOJ_CONTROLADOR.EncontrarEnroladosReloj);
        this.router.put('/', TokenValidation, ENROLADO_RELOJ_CONTROLADOR.ActualizarRelojEnrolado);
        this.router.delete('/eliminar/:id', TokenValidation, ENROLADO_RELOJ_CONTROLADOR.EliminarRelojEnrolado);
    }
}

const ENROLADO_RELOJ_RUTAS = new CiudadRutas();

export default ENROLADO_RELOJ_RUTAS.router;