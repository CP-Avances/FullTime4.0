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



        /** INICIO RUTAS PARA ACCEDER A CONSULTAS PARA FILTRAR INFORMACIÓN */
        this.router.get('/filtros/sucursal/:id', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarEmpleadoSucursal);
        this.router.get('/filtros/sucursal/departamento/:id_sucursal/:id_departamento', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarEmpleadoSucuDepa);
        this.router.get('/filtros/sucursal/departamento-cargo/:id_sucursal/:id_departamento/:id_cargo', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarEmpleadoSucuDepaCargo);
        this.router.get('/filtros/sucursal/departamento-regimen/:id_sucursal/:id_departamento/:id_regimen', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarEmpleadoSucuDepaRegimen);
        this.router.get('/filtros/sucursal/departamento-regimen-cargo/:id_sucursal/:id_departamento/:id_regimen/:id_cargo', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarEmpleadoSucuDepaRegimenCargo);
        this.router.get('/filtros/sucursal/regimen/:id_sucursal/:id_regimen', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarEmpleadoSucuRegimen);
        this.router.get('/filtros/sucursal/regimen-cargo/:id_sucursal/:id_regimen/:id_cargo', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarEmpleadoSucuRegimenCargo);
        this.router.get('/filtros/sucursal/cargo/:id_sucursal/:id_cargo', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarEmpleadoSucuCargo);
        this.router.get('/filtros/departamento/:id', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarEmpleadoDepartamento);
        this.router.get('/filtros/departamento/cargo/:id_departamento/:id_cargo', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarEmpleadoDepaCargo);
        this.router.get('/filtros/departamento/regimen/:id_departamento/:id_regimen', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarEmpleadoDepaRegimen);
        this.router.get('/filtros/departamento/regimen-cargo/:id_departamento/:id_regimen/:id_cargo', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarEmpleadoDepaRegimenCargo);
        this.router.get('/filtros/regimen/:id', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarEmpleadoRegimen);
        this.router.get('/filtros/regimen-cargo/:id_regimen/:id_cargo', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarEmpleadoRegimenCargo);
        this.router.get('/filtros/cargo/:id', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarEmpleadoCargo);
        /** FIN RUTAS PARA ACCEDER A CONSULTAS PARA FILTRAR INFORMACIÓN */

    }
}

const DATOS_GENERALES_RUTAS = new CiudadRutas();

export default DATOS_GENERALES_RUTAS.router;