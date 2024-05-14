import { Router } from 'express';
import VACUNAS_CONTROLADOR from '../../controlador/catalogos/catVacunasControlador'
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

class VacunasRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, VACUNAS_CONTROLADOR.listaVacuna);
        this.router.post('/crearVacunas', TokenValidation, VACUNAS_CONTROLADOR.CrearVacuna);
        this.router.put('/', TokenValidation, VACUNAS_CONTROLADOR.EditarVacuna);
        this.router.delete('/eliminar/:id', TokenValidation, VACUNAS_CONTROLADOR.eliminarRegistro);
    }
}

const VACUNAS_RUTAS = new VacunasRutas();

export default VACUNAS_RUTAS.router;