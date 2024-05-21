import { Router } from 'express';
import AUTORIZACIONES_CONTROLADOR from '../../controlador/autorizaciones/autorizacionesControlador';
import { TokenValidation } from '../../libs/verificarToken'

class DepartamentoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        this.router.get('/by-permiso/:id_permiso', TokenValidation, AUTORIZACIONES_CONTROLADOR.ObtenerAutorizacionPermiso);
        this.router.get('/by-vacacion/:id_vacacion', TokenValidation, AUTORIZACIONES_CONTROLADOR.ObtenerAutorizacionByVacacion);
        this.router.get('/by-hora-extra/:id_hora_extra', AUTORIZACIONES_CONTROLADOR.ObtenerAutorizacionByHoraExtra);
        this.router.post('/', TokenValidation, AUTORIZACIONES_CONTROLADOR.CrearAutorizacion);
        this.router.put('/estado-permiso/multiple', TokenValidation, AUTORIZACIONES_CONTROLADOR.ActualizarEstadoAutorizacionPermiso);
        // ACTUALIZAR ESTADO DE APROBACION DE SOLICITUDES
        this.router.put('/:id/estado-aprobacion', TokenValidation, AUTORIZACIONES_CONTROLADOR.ActualizarEstadoSolicitudes);

    }
}

const AUTORIZA_DEPARTAMENTO_RUTAS = new DepartamentoRutas();

export default AUTORIZA_DEPARTAMENTO_RUTAS.router;