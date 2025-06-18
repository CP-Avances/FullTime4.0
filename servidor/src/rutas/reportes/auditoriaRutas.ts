import AUDITORIA_CONTROLADOR from '../../controlador/reportes/auditoriaControlador';
import { TokenValidation } from '../../libs/verificarToken'
import { Router } from 'express';

class AuditoriaRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }
    configuracion(): void {
        // METODO PARA CONSULTAR DATOS EMPAQUETADOS - AUDITORIA     **USADO
        this.router.post('/auditarportablaempaquetados', TokenValidation, AUDITORIA_CONTROLADOR.BuscarDatosAuditoriaporTablasEmpaquetados);

        // METODO DE CONSULTA DE AUDITORIA DE INICIO DE SESION
        this.router.post('/auditarAccesos', TokenValidation, AUDITORIA_CONTROLADOR.BuscarDatosAuditoriaAcceso);
    }
}

const AUDITORIA_RUTAS = new AuditoriaRutas();

export default AUDITORIA_RUTAS.router;