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


        //METODO PARA BUSCAR TODAS LAS PAGINAS QUE TIENE EL ROL
        this.router.post('/menu/todaspaginasrol', TokenValidation, rolPermisosControlador.ObtenerPaginasRol);


        // METODO PARA REGISTRAR ASIGNACION DE PAGINAS  
        this.router.post('/menu/paginas/insertar', TokenValidation, rolPermisosControlador.AsignarPaginaRol);



        // METODO PARA ELIMINAR LAS PAGINAS  
        this.router.post('/menu/paginas/eliminar', TokenValidation, rolPermisosControlador.EliminarPaginaRol);


        // METODO PARA BUSCAR LAS ACCIONES DE LAS PAGINAS
        this.router.post('/menu/paginas/acciones', TokenValidation, rolPermisosControlador.ObtenerAccionesPaginas);
    }
}

const rolPermisosRutas = new RolPermisosRutas();

export default rolPermisosRutas.router;