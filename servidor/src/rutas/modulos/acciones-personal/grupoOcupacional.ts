import { Router } from 'express';
import GRUPO_OCUPACIONAL_CONTROLADOR from '../../../controlador/modulos/acciones-personal/grupoOcupacionalControlador';
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

class GrupoOcupacionalRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // METODO PARA CONSULTAR GRUPO OCUPACIONAL
        this.router.get('/', TokenValidation, GRUPO_OCUPACIONAL_CONTROLADOR.listaGrupoOcupacional);
        this.router.post('/', TokenValidation, GRUPO_OCUPACIONAL_CONTROLADOR.IngresarGrupoOcupacional);
        this.router.put('/update', TokenValidation, GRUPO_OCUPACIONAL_CONTROLADOR.EditarGrupoOcupacional);
        this.router.delete('/delete', TokenValidation, GRUPO_OCUPACIONAL_CONTROLADOR.EliminarGrupoOcupacional)
    }
}

const GRUPO_OCUPACIONAL_RUTAS = new GrupoOcupacionalRutas();

export default GRUPO_OCUPACIONAL_RUTAS.router;