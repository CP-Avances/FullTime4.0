import { Router } from 'express';
import ROLES_CONTROLADOR from '../../controlador/catalogos/catRolesControlador';
import { TokenValidation } from '../../libs/verificarToken';

class PruebasRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA LISTAR ROLES DEL SISTEMA
        this.router.get('/', TokenValidation, ROLES_CONTROLADOR.ListarRoles);
        // METODO PARA ELIMINAR REGISTRO
        this.router.delete('/eliminar/:id', TokenValidation, ROLES_CONTROLADOR.EliminarRol);
        // METODO PARA REGISTRAR ROL
        this.router.post('/', TokenValidation, ROLES_CONTROLADOR.CrearRol);

        this.router.get('/listausuariosroles', TokenValidation, ROLES_CONTROLADOR.ListarRolesUsuario);

        
        this.router.get('/:id', TokenValidation, ROLES_CONTROLADOR.ObtnenerUnRol);
        this.router.get('/actualiza/:id', TokenValidation, ROLES_CONTROLADOR.ListarRolesActualiza);

        this.router.put('/', TokenValidation, ROLES_CONTROLADOR.ActualizarRol);

    }
}

const ROLES_RUTAS = new PruebasRutas();

export default ROLES_RUTAS.router;