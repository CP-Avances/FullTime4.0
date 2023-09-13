import { Router } from 'express';

import REPORTES_CONTROLADOR from '../../controlador/reportes/reportesControlador';
import { TokenValidation } from '../../libs/verificarToken';

class CiudadRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/horasExtrasReales', TokenValidation, REPORTES_CONTROLADOR.ListarDatosContractoA);
        this.router.get('/horasExtrasReales/:empleado_id', TokenValidation, REPORTES_CONTROLADOR.ListarDatosCargoA);
        this.router.post('/horasExtrasReales/entradaSalida/:id_empleado', TokenValidation, REPORTES_CONTROLADOR.ListarEntradaSalidaEmpleado);
        this.router.post('/horasExtrasReales/listaPedidos/:id_usua_solicita', TokenValidation, REPORTES_CONTROLADOR.ListarPedidosEmpleado);
        this.router.post('/horasExtrasReales/entradaSalida/total/timbres', TokenValidation, REPORTES_CONTROLADOR.ListarEntradaSalidaTodos);
        this.router.post('/horasExtrasReales/listaPedidos/total/solicitudes', TokenValidation, REPORTES_CONTROLADOR.ListarPedidosTodos);
        this.router.post('/reporteTimbres/listaTimbres/:id_empleado', TokenValidation, REPORTES_CONTROLADOR.ListarTimbres);
        this.router.get('/reportePermisos/horarios/:codigo', TokenValidation, REPORTES_CONTROLADOR.ListarPermisoHorarioEmpleado);
        this.router.get('/reportePermisos/planificacion/:id_empleado', TokenValidation, REPORTES_CONTROLADOR.ListarPermisoPlanificaEmpleado);
        this.router.get('/reportePermisos/autorizaciones/:id_empleado', TokenValidation, REPORTES_CONTROLADOR.ListarPermisoAutorizaEmpleado);
        this.router.post('/reporteAtrasos/horarios/:id_empleado', TokenValidation, REPORTES_CONTROLADOR.ListarAtrasosHorarioEmpleado);
        this.router.post('/reporteAtrasos/planificacion/:id_empleado', TokenValidation, REPORTES_CONTROLADOR.ListarAtrasosPlanificaEmpleado);
        this.router.post('/reporteEntradaSalida/horarios/:id_empleado', TokenValidation, REPORTES_CONTROLADOR.ListarEntradaSalidaHorarioEmpleado);
        this.router.post('/reporteEntradaSalida/planificacion/:codigo', TokenValidation, REPORTES_CONTROLADOR.ListarEntradaSalidaPlanificaEmpleado);
        this.router.post('/reportePermisos/fechas/horarios/:codigo', TokenValidation, REPORTES_CONTROLADOR.ListarPermisoHorarioEmpleadoFechas);
        this.router.post('/reportePermisos/fechas/planificacion/:id_empleado', TokenValidation, REPORTES_CONTROLADOR.ListarPermisoPlanificaEmpleadoFechas);
    
        this.router.post('/reporteTimbres/buscarPlan/:codigo', TokenValidation, REPORTES_CONTROLADOR.BuscarPlan);
    }
}

const REPORTES_RUTAS = new CiudadRutas();

export default REPORTES_RUTAS.router;