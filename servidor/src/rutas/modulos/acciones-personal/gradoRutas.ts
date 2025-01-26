import { Router } from 'express';
import GRADO_CONTROLADOR from '../../../controlador/modulos/acciones-personal/gradoControlador';
import { ObtenerRutaLeerPlantillas } from '../../../libs/accesoCarpetas';
import { TokenValidation } from '../../../libs/verificarToken';
import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, ObtenerRutaLeerPlantillas())
    },
    filename: function (req, file, cb) {
        let documento = file.originalname;
        cb(null, documento);
    }
});

const upload = multer({ storage: storage });

class GradoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // METODO PARA CONSULTAR GRADOS
        this.router.get('/', TokenValidation, GRADO_CONTROLADOR.listaGrados);
        this.router.post('/', TokenValidation, GRADO_CONTROLADOR.IngresarGrados);
        this.router.put('/update', TokenValidation, GRADO_CONTROLADOR.EditarGrados);
        this.router.delete('/delete',TokenValidation, GRADO_CONTROLADOR.EliminarGrados)
        // METODO PARA LEER DATOS DE PLANTILLA    **USADO
        this.router.post('/upload/revision', [TokenValidation, upload.single('uploads')], GRADO_CONTROLADOR.RevisarDatos);
        // METODO PARA GUARDAR DATOS DE PLANTILLA    **USADO
        //this.router.post('/cargar_plantilla', TokenValidation, GRADO_CONTROLADOR.CargarPlantilla);
    }
}

const GRADO_RUTAS = new GradoRutas();

export default GRADO_RUTAS.router;