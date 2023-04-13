import { Router } from 'express';
import LOGIN_CONTROLADOR from '../../controlador/login/loginControlador';

class LoginRuta {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // VALIDAR CREDENCIALES DE ACCESO AL SISTEMA
        this.router.post('/', LOGIN_CONTROLADOR.ValidarCredenciales);

        // METODO PARA ENVIAR CORREO PARA CAMBIAR CONTRASEÑA
        this.router.post('/recuperar-contrasenia/', LOGIN_CONTROLADOR.EnviarCorreoContrasena);

        // METODO PARA CAMBIAR CONTRASEÑA
        this.router.post('/cambiar-contrasenia/', LOGIN_CONTROLADOR.CambiarContrasenia);



        this.router.post('/auditar', LOGIN_CONTROLADOR.Auditar);

    }

}

const LOGIN_RUTA = new LoginRuta();

export default LOGIN_RUTA.router;