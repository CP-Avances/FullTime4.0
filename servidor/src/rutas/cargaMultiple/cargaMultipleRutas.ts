import { Router } from 'express';
import CARGA_MULTIPLE_CONTROLADOR from '../../controlador/cargaMultiple/cargaMultipleControlador';
import { TokenValidation } from '../../libs/verificarToken'

const multipart = require('connect-multiparty');

const multipartMiddleware = multipart({
    uploadDir: './plantillas',
});

class DetallePlanHorarioRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.post('/upload', TokenValidation, multipartMiddleware, CARGA_MULTIPLE_CONTROLADOR.CargaMultiple);
        this.router.post('/horarioFijo/upload', TokenValidation, multipartMiddleware, CARGA_MULTIPLE_CONTROLADOR.CargarHorarioMultiplesEmpleados);
    }
}

const DETALLE_PLAN_HORARIO_RUTAS = new DetallePlanHorarioRutas();

export default DETALLE_PLAN_HORARIO_RUTAS.router;