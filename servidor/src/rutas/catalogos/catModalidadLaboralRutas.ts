import { Router } from 'express';
import MODALIDADLABORAL_CONTROLADOR from '../../controlador/catalogos/catModalidadLaboralControlador'
import { TokenValidation } from '../../libs/verificarToken';
import multer from 'multer';
import { ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, ObtenerRutaLeerPlantillas())
    },
    filename: function (req, file, cb) {
        // FECHA DEL SISTEMA
        //var fecha = moment();
        //var anio = fecha.format('YYYY');
        //var mes = fecha.format('MM');
        //var dia = fecha.format('DD');
        let documento = file.originalname;

        cb(null, documento);
    }
})

const upload = multer({ storage: storage });

class ModalidaLaboralRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, MODALIDADLABORAL_CONTROLADOR.listaModalidadLaboral);
        this.router.post('/crearModalidad', TokenValidation, MODALIDADLABORAL_CONTROLADOR.CrearMadalidadLaboral);
        this.router.delete('/eliminar/:id', TokenValidation, MODALIDADLABORAL_CONTROLADOR.eliminarRegistro);
        this.router.post('/upload/revision', [TokenValidation, upload.single('uploads')], MODALIDADLABORAL_CONTROLADOR.VerfificarPlantillaModalidadLaboral);
        this.router.post('/cargar_plantilla/', TokenValidation, MODALIDADLABORAL_CONTROLADOR.CargarPlantilla);
    
    }
}

const MODALIDAD_LABORAL_RUTAS = new ModalidaLaboralRutas();

export default MODALIDAD_LABORAL_RUTAS.router;