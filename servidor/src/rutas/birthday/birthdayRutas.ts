import { TokenValidation } from '../../libs/verificarToken';
import { Router } from 'express';
import multer from 'multer';
import path from 'path';

import BIRTHDAY_CONTROLADOR from '../../controlador/birthday/birthdayControlador';

// METODO DE BUSQUEDA DE RUTAS DE ALMACENAMIENTO
const ObtenerRuta = function () {
    var ruta = '';
    let separador = path.sep;
    for (var i = 0; i < __dirname.split(separador).length - 3; i++) {
        if (ruta === '') {
            ruta = __dirname.split(separador)[i];
        }
        else {
            ruta = ruta + separador + __dirname.split(separador)[i];
        }
    }
    return ruta + separador + 'cumpleanios';
}

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, ObtenerRuta())
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage });

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
        // METODO PARA SUBIR IMAGEN DE CUMPLEAÑOS   --**VERIFICADO
        this.router.put('/:id_empresa/uploadImage', [TokenValidation, upload.single('uploads')], BIRTHDAY_CONTROLADOR.CrearImagenEmpleado);
        // METODO PARA DESCARGAR IMAGEN DE CUMPLEAÑOS
        this.router.get('/img/:imagen', BIRTHDAY_CONTROLADOR.getImagen);
        // METODO PARA ACTUALIZAR MENSAJE DE CUMPLEAÑOS
        this.router.put('/editar/:id_mensaje', TokenValidation, BIRTHDAY_CONTROLADOR.EditarMensajeBirthday);
    }
}

const BIRTHDAY_RUTAS = new BirthdayRutas();

export default BIRTHDAY_RUTAS.router;