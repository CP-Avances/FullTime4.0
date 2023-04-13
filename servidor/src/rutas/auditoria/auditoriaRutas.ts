import { Router } from 'express';
import AUDITORIA_CONTROLADOR from '../../controlador/auditoria/auditoriaControlador';
import { TokenValidation } from '../../libs/verificarToken'

class AuditoriaRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.post('/auditar', TokenValidation, AUDITORIA_CONTROLADOR.BuscarDatosAuditoria);
    }
}

const AUDITORIA_RUTAS = new AuditoriaRutas();

export default AUDITORIA_RUTAS.router;