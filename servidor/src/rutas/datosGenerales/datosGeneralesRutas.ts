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

        // METODO DE BUSQUEDA DE INFORMACION ACTUAL DEL EMPLEADO
        this.router.get('/datos-actuales/:empleado_id', TokenValidation, DATOS_GENERALES_CONTROLADOR.DatosActuales);
        // METODO DE ACCESO A CONSULTA DE DATOS DE COLABORADORES ACTIVOS E INACTIVOS
        this.router.get('/informacion-general/:estado', TokenValidation, DATOS_GENERALES_CONTROLADOR.DatosGenerales);
        // METODO DE ACCESO A CONSULTA DE DATOS DE CRAGOS DE COLABORADORES ACTIVOS E INACTIVOS
        this.router.get('/informacion-general-cargo/:estado', TokenValidation, DATOS_GENERALES_CONTROLADOR.DatosGeneralesCargo);
        // METODO PARA LISTAR INFORMACION ACTUAL DEL USUARIO
        this.router.get('/info_actual', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarDatosActualesEmpleado);
        // METODO DE BUSQUEDA DE DATOS DE USUARIO QUE APRUEBA SOLICITUDES
        this.router.get('/empleadoAutoriza/:empleado_id', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarDatosEmpleadoAutoriza);
        // METODO PARA BUSCAR JEFES DE DEPARTAMENTOS
        this.router.post('/buscar-jefes', [TokenValidation, ModuloPermisosValidation], DATOS_GENERALES_CONTROLADOR.BuscarJefes);
        // METODO DE BUSQUEDA DE INFORMACION DE CONFIGURACIONES DE NOTIFICACIONES
        this.router.get('/info-configuracion/:id_empleado', TokenValidation, DATOS_GENERALES_CONTROLADOR.BuscarConfigEmpleado);
        // LISTA DE DATOS (SUCURSALES-DEPARTAMENTOS-EMPLEADOS) ACTIVOS O INACTIVOS QUE TIENEN CONFIGURADO COMUNICADOS
        this.router.get('/datos_generales_comunicados/:estado', TokenValidation, DATOS_GENERALES_CONTROLADOR.DatosGeneralesComunicados);
        // LISTA DATOS (CARGOS-EMPLEADOS) ACTIVOS O INACTIVOS QUE TIENEN CONFIGURADO COMUNICADOS
        this.router.get('/datos_cargos_comunicados/:estado', TokenValidation, DATOS_GENERALES_CONTROLADOR.DatosCargoComunicados);
        // METODO DE ACCESO A CONSULTA DE DATOS DE COLABORADORES ASIGNADOS UBICACION
        this.router.post('/informacion-general-ubicacion/:estado', TokenValidation, DATOS_GENERALES_CONTROLADOR.DatosGeneralesUbicacion);
        // METODO DE ACCESO A CONSULTA DE DATOS DE CRAGOS Y COLABORADORES ASIGNADOS A UBICACIONES
        this.router.post('/informacion-general-ubicacion-cargo/:estado', TokenValidation, DATOS_GENERALES_CONTROLADOR.DatosGeneralesCargoUbicacion);


    }
}

const DATOS_GENERALES_RUTAS = new CiudadRutas();

export default DATOS_GENERALES_RUTAS.router;