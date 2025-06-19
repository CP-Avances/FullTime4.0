import { Router } from 'express';

import REPORTES_CONTROLADOR from '../../controlador/reportes/reportesControlador';
import { TokenValidation } from '../../libs/verificarToken';

class CiudadRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.post('/horasExtrasReales/entradaSalida/:id_empleado', TokenValidation, REPORTES_CONTROLADOR.ListarEntradaSalidaEmpleado);
        this.router.post('/horasExtrasReales/listaPedidos/:id_usua_solicita', TokenValidation, REPORTES_CONTROLADOR.ListarPedidosEmpleado);
        this.router.post('/horasExtrasReales/entradaSalida/total/timbres', TokenValidation, REPORTES_CONTROLADOR.ListarEntradaSalidaTodos);
        this.router.post('/horasExtrasReales/listaPedidos/total/solicitudes', TokenValidation, REPORTES_CONTROLADOR.ListarPedidosTodos);
        this.router.get('/reportePermisos/horarios/:codigo', TokenValidation, REPORTES_CONTROLADOR.ListarPermisoHorarioEmpleado);


    }
}

const REPORTES_RUTAS = new CiudadRutas();

export default REPORTES_RUTAS.router;