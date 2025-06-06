import { Router } from 'express';
import ROLPERMISOSCONTROLADOR from '../../../controlador/configuracion/parametrizacion/catRolPermisosControlador';
import { TokenValidation } from '../../../libs/verificarToken';

class RolPermisosRutas {
    public router: Router = Router();
    constructor() {
        this.configuracion();
    }
    configuracion(): void {

        // METODO PARA ENLISTAR PAGINAS QUE NO SEAN MODULOS  **USADO
        this.router.get('/menu/paginas/:tipo', TokenValidation, ROLPERMISOSCONTROLADOR.ListarMenuRoles);

        // METODO PARA ENLISTAR PAGINAS SEAN MODULOS  **USADO
        this.router.get('/menu/modulos/:tipo', TokenValidation, ROLPERMISOSCONTROLADOR.ListarMenuModulosRoles);

        // METODO PARA ENLISTAR PAGINAS QUE SON MODULOS, CLASIFICANDOLAS POR EL NOMBRE DEL MODULO  **USADO
        this.router.post('/menu/paginasmodulos', TokenValidation, ROLPERMISOSCONTROLADOR.ListarModuloPorNombre);

        // METODO PARA BUSCAR SI EXISTEN PAGINAS CON EL ID DEL ROL REGISTRADA CUANDO NO TIENE ACCION  **USADO
        this.router.post('/menu/paginas/ide', TokenValidation, ROLPERMISOSCONTROLADOR.ObtenerIdPaginas);

        // METODO PARA BUSCAR LAS PAGINAS POR ID_ROL Y POR SU ACCION  **USADO
        this.router.post('/menu/paginas/ideaccion', TokenValidation, ROLPERMISOSCONTROLADOR.ObtenerIdPaginasConAcciones);

        // METODO PARA BUSCAR TODAS LAS PAGINAS QUE TIENE EL ROL  **USADO
        this.router.post('/menu/todaspaginasrol', TokenValidation, ROLPERMISOSCONTROLADOR.ObtenerPaginasRol);

        //METODO PARA BUSCAR TODAS LAS PAGINAS QUE TIENE EL ROL CON EL MENU LATERAL
        this.router.post('/menu/todaspaginasmenurol', TokenValidation, ROLPERMISOSCONTROLADOR.ObtenerPaginasMenuRol);

        // METODO PARA ASIGNAR FUNCIONES AL ROL  **USADO
        this.router.post('/menu/paginas/insertar', TokenValidation, ROLPERMISOSCONTROLADOR.AsignarPaginaRol);

        // METODO PARA ASIGNAR ACCIONES AL ROL
        this.router.post('/menu/paginas/acciones/insertar', TokenValidation, ROLPERMISOSCONTROLADOR.AsignarAccionesRol);

        // METODO PARA ELIMINAR REGISTRO  **USADO
        this.router.post('/menu/paginas/eliminar', TokenValidation, ROLPERMISOSCONTROLADOR.EliminarPaginaRol);

        // METODO PARA BUSCAR LAS ACCIONES POR CADA PAGINA  **USADO
        this.router.post('/menu/paginas/acciones', TokenValidation, ROLPERMISOSCONTROLADOR.ObtenerAccionesPaginas);

        // METODO PARA ENLISTAR ACCIONES SEGUN LA PAGINA  **USADO
        this.router.post('/menu/paginas/accionesexistentes', TokenValidation, ROLPERMISOSCONTROLADOR.ObtenerAccionesPaginasExistentes);

        // METODO PARA OBTENER TODAS LAS ACCIONES  **USADO
        this.router.get('/menu/paginas/acciones/todas', TokenValidation, ROLPERMISOSCONTROLADOR.ListarAcciones);

        // METODO PARA LISTAR FUNCIONES DE ROLES   **USADO
        this.router.get('/buscar-funciones', TokenValidation, ROLPERMISOSCONTROLADOR.BuscarFuncionesRoles);

    }
}

const rolPermisosRutas = new RolPermisosRutas();
export default rolPermisosRutas.router;