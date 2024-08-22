import { Router } from 'express';
import rolPermisosControlador from '../../controlador/catalogos/catRolPermisosControlador';
import { TokenValidation } from '../../libs/verificarToken';

class RolPermisosRutas {
    public router: Router = Router();
    constructor() {
        this.configuracion();
    }
    configuracion(): void {

        // METODO PARA ENLISTAR PAGINAS QUE NO SEAN MODULOS  **USADO
        this.router.get('/menu/paginas/:tipo', TokenValidation, rolPermisosControlador.ListarMenuRoles);

        // METODO PARA ENLISTAR PAGINAS SEAN MODULOS  **USADO
        this.router.get('/menu/modulos/:tipo', TokenValidation, rolPermisosControlador.ListarMenuModulosRoles);

        // METODO PARA ENLISTAR PAGINAS QUE SON MODULOS, CLASIFICANDOLAS POR EL NOMBRE DEL MODULO  **USADO
        this.router.post('/menu/paginasmodulos', TokenValidation, rolPermisosControlador.ListarModuloPorNombre);

        // METODO PARA BUSCAR SI EXISTEN PAGINAS CON EL ID DEL ROL REGISTRADA CUANDO NO TIENE ACCION  **USADO
        this.router.post('/menu/paginas/ide', TokenValidation, rolPermisosControlador.ObtenerIdPaginas);

        // METODO PARA BUSCAR LAS PAGINAS POR ID_ROL Y POR SU ACCION  **USADO
        this.router.post('/menu/paginas/ideaccion', TokenValidation, rolPermisosControlador.ObtenerIdPaginasConAcciones);

        // METODO PARA BUSCAR TODAS LAS PAGINAS QUE TIENE EL ROL  **USADO
        this.router.post('/menu/todaspaginasrol', TokenValidation, rolPermisosControlador.ObtenerPaginasRol);

        // METODO PARA ASIGNAR FUNCIONES AL ROL  **USADO
        this.router.post('/menu/paginas/insertar', TokenValidation, rolPermisosControlador.AsignarPaginaRol);

        // METODO PARA ELIMINAR REGISTRO  **USADO
        this.router.post('/menu/paginas/eliminar', TokenValidation, rolPermisosControlador.EliminarPaginaRol);

        // METODO PARA BUSCAR LAS ACCIONES POR CADA PAGINA  **USADO
        this.router.post('/menu/paginas/acciones', TokenValidation, rolPermisosControlador.ObtenerAccionesPaginas);

        // METODO PARA ENLISTAR ACCIONES SEGUN LA PAGINA  **USADO
        this.router.post('/menu/paginas/accionesexistentes', TokenValidation, rolPermisosControlador.ObtenerAccionesPaginasExistentes);

        // METODO PARA OBTENER TODAS LAS ACCIONES  **USADO
        this.router.get('/menu/paginas/acciones/todas', TokenValidation, rolPermisosControlador.ListarAcciones);
    }
}

const rolPermisosRutas = new RolPermisosRutas();
export default rolPermisosRutas.router;