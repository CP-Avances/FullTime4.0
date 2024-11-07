import BIRTHDAY_CONTROLADOR from '../../controlador/notificaciones/birthdayControlador';
import { ObtenerRutaBirthday } from '../../libs/accesoCarpetas';
import { TokenValidation } from '../../libs/verificarToken';
import { DateTime } from 'luxon';
import { Router } from 'express';
import multer from 'multer';

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, ObtenerRutaBirthday())
    },
    filename: function (req, file, cb) {
        // FECHA DEL SISTEMA
        var fecha = DateTime.now();
        var anio = fecha.toFormat('yyyy');
        var mes = fecha.toFormat('MM');
        var dia = fecha.toFormat('dd');
        let documento = anio + '_' + mes + '_' + dia + '_' + file.originalname;
        cb(null, documento);
    }
})

const upload = multer({ storage: storage });

class BirthdayRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA CONSULTAR MENSAJE DE CUMPLEAÑOS    **USADO
        this.router.get('/:id_empresa', TokenValidation, BIRTHDAY_CONTROLADOR.MensajeEmpresa);
        // METODO PARA REGISTRAR MENSAJE DE CUMPLEAÑOS   **USADO
        this.router.post('/', TokenValidation, BIRTHDAY_CONTROLADOR.CrearMensajeBirthday);
        // METODO PARA SUBIR IMAGEN DE CUMPLEAÑOS   **USADO
        this.router.put('/:id_empresa/uploadImage', [TokenValidation, upload.single('uploads')], BIRTHDAY_CONTROLADOR.CrearImagenCumpleanios);
        // METODO PARA DESCARGAR IMAGEN DE CUMPLEAÑOS    **USADO FRONT
        this.router.get('/img/:imagen', BIRTHDAY_CONTROLADOR.ObtenerImagen);
        // METODO PARA ACTUALIZAR MENSAJE DE CUMPLEAÑOS   **USADO
        this.router.put('/editar/:id', TokenValidation, BIRTHDAY_CONTROLADOR.EditarMensajeBirthday);
    }
}

const BIRTHDAY_RUTAS = new BirthdayRutas();

export default BIRTHDAY_RUTAS.router;