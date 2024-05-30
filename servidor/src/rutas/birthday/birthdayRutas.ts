import BIRTHDAY_CONTROLADOR from '../../controlador/birthday/birthdayControlador';
import { TokenValidation } from '../../libs/verificarToken';
import { ObtenerRutaBirthday } from '../../libs/accesoCarpetas';
import { Router } from 'express';
import multer from 'multer';
import moment from 'moment';


const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, ObtenerRutaBirthday())
    },
    filename: function (req, file, cb) {
        // FECHA DEL SISTEMA
        var fecha = moment();
        var anio = fecha.format('YYYY');
        var mes = fecha.format('MM');
        var dia = fecha.format('DD');
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

        // METODO PARA CONSULTAR MENSAJE DE CUMPLEAÑOS
        this.router.get('/:id_empresa', TokenValidation, BIRTHDAY_CONTROLADOR.MensajeEmpresa);
        // METODO PARA REGISTRAR MENSAJE DE CUMPLEAÑOS
        this.router.post('/', TokenValidation, BIRTHDAY_CONTROLADOR.CrearMensajeBirthday);
        // METODO PARA SUBIR IMAGEN DE CUMPLEAÑOS   --**VERIFICADO
        this.router.put('/:id_empresa/uploadImage', [TokenValidation, upload.single('uploads')], BIRTHDAY_CONTROLADOR.CrearImagenEmpleado);
        // METODO PARA DESCARGAR IMAGEN DE CUMPLEAÑOS
        this.router.get('/img/:imagen', BIRTHDAY_CONTROLADOR.getImagen);
        // METODO PARA ACTUALIZAR MENSAJE DE CUMPLEAÑOS
        this.router.put('/editar/:id', TokenValidation, BIRTHDAY_CONTROLADOR.EditarMensajeBirthday);
    }
}

const BIRTHDAY_RUTAS = new BirthdayRutas();

export default BIRTHDAY_RUTAS.router;