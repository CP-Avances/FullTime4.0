import { Router } from 'express';
import LOGIN_CONTROLADOR from '../../controlador/login/loginControlador';

class LoginRuta {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // VALIDAR CREDENCIALES DE ACCESO AL SISTEMA    **USADO
        this.router.post('/', LOGIN_CONTROLADOR.ValidarCredenciales);

        // METODO PARA ENVIAR CORREO PARA CAMBIAR CONTRASEÑA    **USADO
        this.router.post('/recuperar-contrasenia/', LOGIN_CONTROLADOR.EnviarCorreoContrasena);

        // METODO PARA CAMBIAR CONTRASEÑA
        this.router.post('/cambiar-contrasenia/', LOGIN_CONTROLADOR.CambiarContrasenia);

        // METODO PARA AUDITAR INICIO DE SESION    **USADO
        this.router.post('/registrar_acceso/', LOGIN_CONTROLADOR.RegistrarAuditoriaLogin);

    }

}

const LOGIN_RUTA = new LoginRuta();

export default LOGIN_RUTA.router;