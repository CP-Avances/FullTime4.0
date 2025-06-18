import EMPLEADO_PROCESO_CONTROLADOR from '../../../controlador/modulos/acciones-personal/empleProcesoControlador';
import { TokenValidation } from '../../../libs/verificarToken';
import { Router } from 'express';

class DepartamentoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // METODO PARA OBTENER PROCESOS DEL USUARIO   **USADO
        this.router.get('/infoProceso/:id_empleado', TokenValidation, EMPLEADO_PROCESO_CONTROLADOR.BuscarProcesoUsuario);
        // METODO PARA ELIMINAR REGISTRO   **USADO
        this.router.delete('/eliminar/:id', TokenValidation, EMPLEADO_PROCESO_CONTROLADOR.EliminarRegistros);
    }
}

const EMPLEADO_PROCESO_RUTAS = new DepartamentoRutas();

export default EMPLEADO_PROCESO_RUTAS.router;