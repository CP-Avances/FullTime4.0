import { Router } from 'express';
import BIRTHDAY_CONTROLADOR from '../../controlador/birthday/birthdayControlador';
import { TokenValidation } from '../../libs/verificarToken'
const multipart = require('connect-multiparty');

const multipartMiddleware = multipart({
    uploadDir: './cumpleanios',
});

class BirthdayRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA CONSULTAR MENSAJE DE CUMPLEAÑOS
        this.router.get('/:id_empresa', TokenValidation, BIRTHDAY_CONTROLADOR.MensajeEmpresa);
        // METODO PARA REGISTRAR MENSAJE DE CUMPLEAÑOS
        this.router.post('/', TokenValidation, BIRTHDAY_CONTROLADOR.CrearMensajeBirthday);
        // METODO PARA SUBIR IMAGEN DE CUMPLEAÑOS
        this.router.put('/:id_empresa/uploadImage', [TokenValidation, multipartMiddleware], BIRTHDAY_CONTROLADOR.CrearImagenEmpleado);
        // METODO PARA DESCARGAR IMAGEN DE CUMPLEAÑOS
        this.router.get('/img/:imagen', BIRTHDAY_CONTROLADOR.getImagen);
        // METODO PARA ACTUALIZAR MENSAJE DE CUMPLEAÑOS
        this.router.put('/editar/:id_mensaje', TokenValidation, BIRTHDAY_CONTROLADOR.EditarMensajeBirthday);
    }
}

const BIRTHDAY_RUTAS = new BirthdayRutas();

export default BIRTHDAY_RUTAS.router;