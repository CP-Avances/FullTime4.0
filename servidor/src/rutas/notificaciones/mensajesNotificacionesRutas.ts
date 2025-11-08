import MENSAJES_NOTIFICACIONES_CONTROLADOR from '../../controlador/notificaciones/mensajesNotificacionesControlador';
import { ObtenerRutaMensajeNotificacion } from '../../libs/accesoCarpetas';
import { TokenValidation } from '../../libs/verificarToken';
import { DateTime } from 'luxon';
import { Router } from 'express';
import multer from 'multer';

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, ObtenerRutaMensajeNotificacion())
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

class MensajesNotificacionesRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA CONSULTAR MENSAJES DE NOTIIFCACIONES    **USADO
        this.router.get('/:id_empresa', TokenValidation, MENSAJES_NOTIFICACIONES_CONTROLADOR.MensajeEmpresa);
        // METODO PARA REGISTRAR MENSAJE DE NOTIFICACIONES   **USADO
        this.router.post('/', TokenValidation, MENSAJES_NOTIFICACIONES_CONTROLADOR.CrearMensajeNotificacion);
        // METODO PARA SUBIR IMAGEN DE NOTIFICACIONES   **USADO
        this.router.put('/:id_empresa/uploadImage', [TokenValidation, upload.single('uploads')], MENSAJES_NOTIFICACIONES_CONTROLADOR.CrearImagenNotificacion);
        // METODO PARA DESCARGAR IMAGEN DE NOTIFICACIONES    **USADO FRONT
        this.router.get('/img/:imagen', MENSAJES_NOTIFICACIONES_CONTROLADOR.ObtenerImagen);
        // METODO PARA ACTUALIZAR MENSAJE DE NOTIFICACIONES  **USADO
        this.router.put('/editar/:id', TokenValidation, MENSAJES_NOTIFICACIONES_CONTROLADOR.EditarMensajeBirthday);
    }
}

const MENSAJES_NOTIFICACIONES_RUTAS = new MensajesNotificacionesRutas();

export default MENSAJES_NOTIFICACIONES_RUTAS.router;