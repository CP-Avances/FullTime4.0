import { Router } from 'express';
import DISCPACIDAD_CONTROLADOR from '../../controlador/catalogos/catDiscapacidadControlador'
import { TokenValidation } from '../../libs/verificarToken';
import multer from 'multer';
import { ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, ObtenerRutaLeerPlantillas())
    },
    filename: function (req, file, cb) {
        let documento = file.originalname;
        cb(null, documento);
    }
})

const upload = multer({ storage: storage });

class DiscapacidadRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, DISCPACIDAD_CONTROLADOR.listaDiscapacidad);
        this.router.post('/crearDiscapacidad', TokenValidation, DISCPACIDAD_CONTROLADOR.CrearDiscapacidad);
        this.router.put('/', TokenValidation, DISCPACIDAD_CONTROLADOR.EditarDiscapacidad);
        this.router.delete('/eliminar/:id', TokenValidation, DISCPACIDAD_CONTROLADOR.eliminarRegistro);
    }
}

const DISCAPACIDADES_RUTAS = new DiscapacidadRutas();

export default DISCAPACIDADES_RUTAS.router;