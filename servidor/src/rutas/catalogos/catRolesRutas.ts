import { Router } from 'express';
import ROLES_CONTROLADOR from '../../controlador/catalogos/catRolesControlador';
import { TokenValidation } from '../../libs/verificarToken';

class PruebasRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA LISTAR ROLES DEL SISTEMA **USADO
        this.router.get('/', TokenValidation, ROLES_CONTROLADOR.ListarRoles);
        // METODO PARA ELIMINAR REGISTRO  **USADO
        this.router.delete('/eliminar/:id', TokenValidation, ROLES_CONTROLADOR.EliminarRol);
        // METODO PARA REGISTRAR ROL
        this.router.post('/', TokenValidation, ROLES_CONTROLADOR.CrearRol);

        this.router.put('/updateUsers', TokenValidation, ROLES_CONTROLADOR.UpdateRoles);

        this.router.get('/listausuariosroles', TokenValidation, ROLES_CONTROLADOR.ListarRolesUsuario);


        this.router.get('/:id', TokenValidation, ROLES_CONTROLADOR.ObtnenerUnRol);
        // METODO PARA LISTAR ROLES EXCEPTO EL QUE SE EDITA  **USADO
        this.router.get('/actualiza/:id', TokenValidation, ROLES_CONTROLADOR.ListarRolesActualiza);
        // METODO PARA ACTUALIZAR ROLES **USADO
        this.router.put('/', TokenValidation, ROLES_CONTROLADOR.ActualizarRol);
    

    }
}

const ROLES_RUTAS = new PruebasRutas();

export default ROLES_RUTAS.router;