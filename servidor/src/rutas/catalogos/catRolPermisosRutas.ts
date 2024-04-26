import { Router } from 'express';
import rolPermisosControlador from '../../controlador/catalogos/catRolPermisosControlador';
import { TokenValidation } from '../../libs/verificarToken';

class RolPermisosRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, rolPermisosControlador.list);
        this.router.get('/:id', TokenValidation, rolPermisosControlador.getOne);
        this.router.post('/', TokenValidation, rolPermisosControlador.create);
        this.router.post('/denegado/', TokenValidation, rolPermisosControlador.createPermisoDenegado);
        this.router.get('/denegado/:id', TokenValidation, rolPermisosControlador.getPermisosUsuario);

        // MENU ENLISTAR
        this.router.get('/menu/paginas', TokenValidation, rolPermisosControlador.ListarMenuRoles);

        // METODO PARA BUSCAR LAS PAGINAS POR ID_ROL

        this.router.post('/menu/paginas/ide', TokenValidation, rolPermisosControlador.ObtenerIdPaginas);


        this.router.post('/menu/paginas/ideaccion', TokenValidation, rolPermisosControlador.ObtenerIdPaginasConAcciones);

        //METODO PARA BUSCAR TODAS LAS PAGINAS QUE TIENE EL ROL
        this.router.post('/menu/todaspaginasrol', TokenValidation, rolPermisosControlador.ObtenerPaginasRol);

        //METODO PARA BUSCAR TODAS LAS PAGINAS QUE TIENE EL ROL CON EL MENU LATERAL
        this.router.post('/menu/todaspaginasmenurol', TokenValidation, rolPermisosControlador.ObtenerPaginasMenuRol);


        // METODO PARA REGISTRAR ASIGNACION DE PAGINAS  
        this.router.post('/menu/paginas/insertar', TokenValidation, rolPermisosControlador.AsignarPaginaRol);



        // METODO PARA ELIMINAR LAS PAGINAS  
        this.router.post('/menu/paginas/eliminar', TokenValidation, rolPermisosControlador.EliminarPaginaRol);
        this.router.post('/menu/paginas/eliminarsinaccion', TokenValidation, rolPermisosControlador.EliminarPaginaRolSinAccion);



        // METODO PARA BUSCAR LAS ACCIONES DE LAS PAGINAS
        this.router.post('/menu/paginas/acciones', TokenValidation, rolPermisosControlador.ObtenerAccionesPaginas);


        // METODO PARA BUSCAR LAS ACCIONES DE LAS PAGINAS
        this.router.post('/menu/paginas/acciones/id', TokenValidation, rolPermisosControlador.ObtenerAccionPorId);


        // METODO PARA OBTENER TODAS LAS ACCIONES
        this.router.get('/menu/paginas/acciones/todas', TokenValidation, rolPermisosControlador.ListarAcciones);
    }
}

const rolPermisosRutas = new RolPermisosRutas();

export default rolPermisosRutas.router;