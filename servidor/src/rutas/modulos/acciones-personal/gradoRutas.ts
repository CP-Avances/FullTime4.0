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
    }
}

const GRADO_RUTAS = new GradoRutas();

export default GRADO_RUTAS.router;