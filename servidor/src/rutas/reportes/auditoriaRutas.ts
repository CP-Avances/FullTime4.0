import { Router } from 'express';
import AUDITORIA_CONTROLADOR from '../../controlador/reportes/auditoriaControlador';
import { TokenValidation } from '../../libs/verificarToken'

class AuditoriaRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }
    configuracion(): void {
        this.router.post('/auditar', TokenValidation, AUDITORIA_CONTROLADOR.BuscarDatosAuditoria);
        this.router.post('/auditarportabla', TokenValidation, AUDITORIA_CONTROLADOR.BuscarDatosAuditoriaporTablas);
        this.router.post('/auditarportablaempaquetados', TokenValidation, AUDITORIA_CONTROLADOR.BuscarDatosAuditoriaporTablasEmpaquetados);
    }
}

const AUDITORIA_RUTAS = new AuditoriaRutas();

export default AUDITORIA_RUTAS.router;