import { TokenValidation } from '../../libs/verificarToken'
import { Router } from 'express';
import DATOS_GENERALES_CONTROLADOR from '../../controlador/datosGenerales/datosGeneralesControlador';

class CiudadRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA CONSULTAR DATOS DE USUARIOS ACTIVOS E INACTIVOS    **USADO
        this.router.get('/informacion-data-general/:estado', TokenValidation, DATOS_GENERALES_CONTROLADOR.BuscarDataGeneral);

        // METODO PARA CONSULTAR DATOS DE USUARIOS ACTIVOS E INACTIVOS    **USADO
        this.router.get('/informacion-data-general-rol/:estado', TokenValidation, DATOS_GENERALES_CONTROLADOR.BuscarDataGeneralRol);

        // LISTA DE DATOS ACTIVOS O INACTIVOS QUE RECIBEN COMUNICADOS  **USADO
        this.router.get('/datos_generales_comunicados/:estado', TokenValidation, DATOS_GENERALES_CONTROLADOR.DatosGeneralesComunicados);

        // METODO DE BUSQUEDA DE INFORMACION ACTUAL DEL EMPLEADO    **USADO
        this.router.get('/datos-actuales/:empleado_id', TokenValidation, DATOS_GENERALES_CONTROLADOR.DatosActuales);

        // METODO DE ACCESO A CONSULTA DE DATOS DE COLABORADORES ASIGNADOS UBICACION   **USADO
        this.router.post('/informacion-general-ubicacion/:estado', TokenValidation, DATOS_GENERALES_CONTROLADOR.DatosGeneralesUbicacion);

        // METODO PARA LISTAR ID ACTUALES DE USUARIOS    **USADO
        this.router.get('/info_actual_id', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarIdDatosActualesEmpleado);

        // METODO PARA CONSULTAR DATOS DE USUARIOS ACTIVOS E INACTIVOS CON REGIMEN LABORAL   **USADO
        this.router.get('/informacion-data-regimen/:estado', TokenValidation, DATOS_GENERALES_CONTROLADOR.BuscarDataGeneralPeriodos);

    }
}

const DATOS_GENERALES_RUTAS = new CiudadRutas();

export default DATOS_GENERALES_RUTAS.router;