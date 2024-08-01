import { ModuloPermisosValidation } from '../../libs/Modulos/verificarPermisos'
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

        // METODO PARA CONSULTAR DATOS DE USUARIOS ACTIVOS E INACTIVOS 
        this.router.get('/informacion-data-general-rol/:estado', TokenValidation, DATOS_GENERALES_CONTROLADOR.BuscarDataGeneralRol);


        // METODO PARA BUSCAR INFORMACION DE UN USUARIO ADMNISTRADOR - JEFE
        this.router.post('/datos-actuales-usuario-rol', TokenValidation, DATOS_GENERALES_CONTROLADOR.BuscarInformacionUserRol);


        // LISTA DE DATOS ACTIVOS O INACTIVOS QUE RECIBEN COMUNICADOS  **USADO
        this.router.get('/datos_generales_comunicados/:estado', TokenValidation, DATOS_GENERALES_CONTROLADOR.DatosGeneralesComunicados);












        // METODO DE BUSQUEDA DE INFORMACION ACTUAL DEL EMPLEADO    **USADO
        this.router.get('/datos-actuales/:empleado_id', TokenValidation, DATOS_GENERALES_CONTROLADOR.DatosActuales);
        // METODO DE ACCESO A CONSULTA DE DATOS DE COLABORADORES ACTIVOS E INACTIVOS
        this.router.post('/informacion-general/:estado', TokenValidation, DATOS_GENERALES_CONTROLADOR.DatosGenerales);
        // METODO DE ACCESO A CONSULTA DE DATOS DE CRAGOS DE COLABORADORES ACTIVOS E INACTIVOS
        this.router.post('/informacion-general-cargo/:estado', TokenValidation, DATOS_GENERALES_CONTROLADOR.DatosGeneralesCargo);
        // METODO PARA LISTAR INFORMACION ACTUAL DEL USUARIO  
        this.router.get('/info_actual', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarDatosActualesEmpleado);
        // METODO PARA LISTAR ID ACTUALES DE USUARIOS    **USADO
        this.router.get('/info_actual_id', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarIdDatosActualesEmpleado);
        // METODO DE BUSQUEDA DE DATOS DE USUARIO QUE APRUEBA SOLICITUDES    **USADO
        this.router.get('/empleadoAutoriza/:empleado_id', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarDatosEmpleadoAutoriza);
        // METODO PARA BUSCAR JEFES DE DEPARTAMENTOS
        this.router.post('/buscar-jefes', [TokenValidation, ModuloPermisosValidation], DATOS_GENERALES_CONTROLADOR.BuscarJefes);
        // METODO DE BUSQUEDA DE INFORMACION DE CONFIGURACIONES DE NOTIFICACIONES
        this.router.get('/info-configuracion/:id_empleado', TokenValidation, DATOS_GENERALES_CONTROLADOR.BuscarConfigEmpleado);


        // METODO DE ACCESO A CONSULTA DE DATOS DE COLABORADORES ASIGNADOS UBICACION   **USADO
        this.router.post('/informacion-general-ubicacion/:estado', TokenValidation, DATOS_GENERALES_CONTROLADOR.DatosGeneralesUbicacion);

        // METODO PARA BUSCAR USUARIOS DE UNA SUCURSAL
        this.router.post('/datos-actuales-sucursal', TokenValidation, DATOS_GENERALES_CONTROLADOR.BuscarUsuariosSucursal);



    }
}

const DATOS_GENERALES_RUTAS = new CiudadRutas();

export default DATOS_GENERALES_RUTAS.router;