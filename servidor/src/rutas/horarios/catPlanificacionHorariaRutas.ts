import { TokenValidation } from '../../libs/verificarToken';
import { Router } from 'express';
import multer from 'multer';

import PLANIFICACION_HORARIA_CONTROLADOR from '../../controlador/horarios/catPlanificacionHorariaControlador';
import { ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';

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


class PlanificacionHorariaRutas{
    public router: Router = Router();

    constructor(){
        this.configuracion();
    }

    configuracion(): void {
        // VERIFICAR DATOS DE LA PLANIFICACION HORARIA   **USADO
        this.router.post('/verificarDatos', [TokenValidation, upload.single('uploads')], PLANIFICACION_HORARIA_CONTROLADOR.VerificarDatosPlanificacionHoraria);
        // CARGAR PLANIFICACION HORARIA   **USADO
        this.router.post('/registrarPlanificacion', [TokenValidation, upload.single('uploads')], PLANIFICACION_HORARIA_CONTROLADOR.RegistrarPlanificacionHoraria);
    }
}

const PLANIFICACION_HORARIA_RUTAS = new PlanificacionHorariaRutas();

export default PLANIFICACION_HORARIA_RUTAS.router;