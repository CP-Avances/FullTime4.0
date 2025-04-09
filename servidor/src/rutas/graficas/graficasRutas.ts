import { Router } from 'express';
import { TokenValidation } from '../../libs/verificarToken'
import GRAFICAS_CONTROLADOR from '../../controlador/graficas/graficasControlador';

class GraficasRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // ADMINISTRADOR
        this.router.get('/admin/hora-extra/micro', TokenValidation, GRAFICAS_CONTROLADOR.AdminHorasExtrasMicro);
        this.router.get('/admin/hora-extra/macro/:desde/:hasta', TokenValidation, GRAFICAS_CONTROLADOR.AdminHorasExtrasMacro);
        
        this.router.get('/admin/marcaciones-emp/micro', TokenValidation, GRAFICAS_CONTROLADOR.AdminMarcacionesEmpleadoMicro);
        this.router.get('/admin/marcaciones-emp/macro/:desde/:hasta', TokenValidation, GRAFICAS_CONTROLADOR.AdminMarcacionesEmpleadoMacro);
        

        // EMPLEADOS
        this.router.get('/user/hora-extra/micro', TokenValidation, GRAFICAS_CONTROLADOR.EmpleadoHorasExtrasMicro);
        this.router.get('/user/hora-extra/macro/:desde/:hasta', TokenValidation, GRAFICAS_CONTROLADOR.EmpleadoHorasExtrasMacro);
        
        this.router.get('/user/vacaciones/micro', TokenValidation, GRAFICAS_CONTROLADOR.EmpleadoVacacionesMicro);
        this.router.get('/user/vacaciones/macro/:desde/:hasta', TokenValidation, GRAFICAS_CONTROLADOR.EmpleadoVacacionesMacro);
        
        this.router.get('/user/permisos/micro', TokenValidation, GRAFICAS_CONTROLADOR.EmpleadoPermisosMicro);
        this.router.get('/user/permisos/macro/:desde/:hasta', TokenValidation, GRAFICAS_CONTROLADOR.EmpleadoPermisosMacro);
        
    }
}

const GRAFICAS_RUTAS = new GraficasRutas();

export default GRAFICAS_RUTAS.router;
