import { Router } from 'express';
import AUDITORIA_CONTROLADOR from '../../controlador/reportes/auditoriaControlador';
import { TokenValidation } from '../../libs/verificarToken'

class AuditoriaRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }
    configuracion(): void {
        this.router.post('/auditarportablaempaquetados', TokenValidation, AUDITORIA_CONTROLADOR.BuscarDatosAuditoriaporTablasEmpaquetados);
    }
}

const AUDITORIA_RUTAS = new AuditoriaRutas();

export default AUDITORIA_RUTAS.router;