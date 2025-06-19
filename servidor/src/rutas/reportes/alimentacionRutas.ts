import { Router } from 'express';

import ALIMENTACION_CONTROLADOR from '../../controlador/reportes/alimentacionControlador';
import { ModuloAlimentacionValidation } from '../../libs/Modulos/verificarAlimentacion';
import { TokenValidation } from '../../libs/verificarToken';

class AlimentacionRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.post('/planificados', [TokenValidation, ModuloAlimentacionValidation], ALIMENTACION_CONTROLADOR.ListarPlanificadosConsumidos);
        this.router.post('/solicitados', [TokenValidation, ModuloAlimentacionValidation], ALIMENTACION_CONTROLADOR.ListarSolicitadosConsumidos);
        this.router.post('/extras/plan', [TokenValidation, ModuloAlimentacionValidation], ALIMENTACION_CONTROLADOR.ListarExtrasPlanConsumidos);
        this.router.post('/extras/solicita', [TokenValidation, ModuloAlimentacionValidation], ALIMENTACION_CONTROLADOR.ListarExtrasSolConsumidos);

        // DETALLE DE SERVICIO DE ALIMENTACIÓN
        this.router.post('/planificados/detalle', [TokenValidation, ModuloAlimentacionValidation], ALIMENTACION_CONTROLADOR.DetallarPlanificadosConsumidos);
        this.router.post('/solicitados/detalle', [TokenValidation, ModuloAlimentacionValidation], ALIMENTACION_CONTROLADOR.DetallarSolicitudConsumidos);
        this.router.post('/extras/detalle/plan', [TokenValidation, ModuloAlimentacionValidation], ALIMENTACION_CONTROLADOR.DetallarExtrasPlanConsumidos);
        this.router.post('/extras/detalle/solicita', [TokenValidation, ModuloAlimentacionValidation], ALIMENTACION_CONTROLADOR.DetallarExtrasSolConsumidos);

        // DETALLES SERVICIOS DE ALIMENTACIÓN DE INVITADOS
        this.router.post('/servicios/invitados', [TokenValidation, ModuloAlimentacionValidation], ALIMENTACION_CONTROLADOR.DetallarServiciosInvitados);

        // TIMBRES DE ALIMENTACION   **USADO
        this.router.post('/timbres-alimentacion/:desde/:hasta', [TokenValidation], ALIMENTACION_CONTROLADOR.ReporteTimbresAlimentacion);
    }
}

const ALIMENTACION_RUTAS = new AlimentacionRutas();

export default ALIMENTACION_RUTAS.router;