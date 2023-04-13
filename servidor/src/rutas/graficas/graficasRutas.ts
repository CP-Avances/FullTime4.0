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
        
        this.router.get('/admin/retrasos/micro', TokenValidation, GRAFICAS_CONTROLADOR.AdminAtrasosMicro);
        this.router.get('/admin/retrasos/macro/:desde/:hasta', TokenValidation, GRAFICAS_CONTROLADOR.AdminAtrasosMacro);
        
        this.router.get('/admin/asistencia/micro', TokenValidation, GRAFICAS_CONTROLADOR.AdminAsistenciaMicro);
        this.router.get('/admin/asistencia/macro/:desde/:hasta', TokenValidation, GRAFICAS_CONTROLADOR.AdminAsistenciaMacro);
        
        this.router.get('/admin/jornada-vs-hora-extra/micro', TokenValidation, GRAFICAS_CONTROLADOR.AdminJornadaHorasExtrasMicro);
        this.router.get('/admin/jornada-vs-hora-extra/macro/:desde/:hasta', TokenValidation, GRAFICAS_CONTROLADOR.AdminJornadaHorasExtrasMacro);
        
        this.router.get('/admin/tiempo-jornada-vs-hora-ext/micro', TokenValidation, GRAFICAS_CONTROLADOR.AdminTiempoJornadaHorasExtrasMicro);
        this.router.get('/admin/tiempo-jornada-vs-hora-ext/macro/:desde/:hasta', TokenValidation, GRAFICAS_CONTROLADOR.AdminTiempoJornadaHorasExtrasMacro);

        this.router.get('/admin/inasistencia/micro', TokenValidation, GRAFICAS_CONTROLADOR.AdminInasistenciaMicro);
        this.router.get('/admin/inasistencia/macro/:desde/:hasta', TokenValidation, GRAFICAS_CONTROLADOR.AdminInasistenciaMacro);
        
        this.router.get('/admin/marcaciones-emp/micro', TokenValidation, GRAFICAS_CONTROLADOR.AdminMarcacionesEmpleadoMicro);
        this.router.get('/admin/marcaciones-emp/macro/:desde/:hasta', TokenValidation, GRAFICAS_CONTROLADOR.AdminMarcacionesEmpleadoMacro);
        
        this.router.get('/admin/salidas-anticipadas/micro', TokenValidation, GRAFICAS_CONTROLADOR.AdminSalidasAnticipadasMicro);
        this.router.get('/admin/salidas-anticipadas/macro/:desde/:hasta', TokenValidation, GRAFICAS_CONTROLADOR.AdminSalidasAnticipadasMacro);
        
        // EMPLEADOS
        this.router.get('/user/hora-extra/micro', TokenValidation, GRAFICAS_CONTROLADOR.EmpleadoHorasExtrasMicro);
        this.router.get('/user/hora-extra/macro/:desde/:hasta', TokenValidation, GRAFICAS_CONTROLADOR.EmpleadoHorasExtrasMacro);
        
        this.router.get('/user/vacaciones/micro', TokenValidation, GRAFICAS_CONTROLADOR.EmpleadoVacacionesMicro);
        this.router.get('/user/vacaciones/macro/:desde/:hasta', TokenValidation, GRAFICAS_CONTROLADOR.EmpleadoVacacionesMacro);
        
        this.router.get('/user/permisos/micro', TokenValidation, GRAFICAS_CONTROLADOR.EmpleadoPermisosMicro);
        this.router.get('/user/permisos/macro/:desde/:hasta', TokenValidation, GRAFICAS_CONTROLADOR.EmpleadoPermisosMacro);
        
        this.router.get('/user/atrasos/micro', TokenValidation, GRAFICAS_CONTROLADOR.EmpleadoAtrasosMicro);
        this.router.get('/user/atrasos/macro/:desde/:hasta', TokenValidation, GRAFICAS_CONTROLADOR.EmpleadoAtrasosMacro);
        
    }
}

const GRAFICAS_RUTAS = new GraficasRutas();

export default GRAFICAS_RUTAS.router;
