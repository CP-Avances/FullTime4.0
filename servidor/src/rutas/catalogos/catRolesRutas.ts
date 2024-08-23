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
        // METODO PARA ACTUALIZAR ROLES DE MANERA MASIVA  **USADO
        this.router.put('/updateUsers', TokenValidation, ROLES_CONTROLADOR.ActualizarRolUusuario);
        // METODO PARA LISTAR ROLES  **USADO
        this.router.get('/listausuariosroles', TokenValidation, ROLES_CONTROLADOR.ListarRolesUsuario);

       // METODO PARA LISTAR INFORMACION DEL ROL **USADO
        this.router.get('/:id', TokenValidation, ROLES_CONTROLADOR.ObtenerUnRol);
        // METODO PARA LISTAR ROLES EXCEPTO EL QUE SE EDITA  **USADO
        this.router.get('/actualiza/:id', TokenValidation, ROLES_CONTROLADOR.ListarRolesActualiza);
        // METODO PARA ACTUALIZAR ROLES **USADO
        this.router.put('/', TokenValidation, ROLES_CONTROLADOR.ActualizarRol);


    }
}

const ROLES_RUTAS = new PruebasRutas();

export default ROLES_RUTAS.router;