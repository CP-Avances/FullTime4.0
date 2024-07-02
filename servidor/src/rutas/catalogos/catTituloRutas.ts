import { Router } from 'express';
import TITULO_CONTROLADOR from '../../controlador/catalogos/catTituloControlador';
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

class TituloRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA LISTAR TITULOS
        this.router.get('/', TokenValidation, TITULO_CONTROLADOR.ListarTitulos);
        // METODO PARA BUSCAR TITULOS POR SU NOMBRE
        this.router.post('/titulo-nombre', TokenValidation, TITULO_CONTROLADOR.ObtenerTituloNombre);
        // METODO PARA ELIMINAR REGISTRO
        this.router.delete('/eliminar/:id', TokenValidation, TITULO_CONTROLADOR.EliminarRegistros);
        // METODO PARA ACTUALIZAR REGISTRO DE TITULO
        this.router.put('/', TokenValidation, TITULO_CONTROLADOR.ActualizarTitulo);
        this.router.post('/', TokenValidation, TITULO_CONTROLADOR.create);
        this.router.post('/upload/revision', [TokenValidation, upload.single('uploads')], TITULO_CONTROLADOR.RevisarDatos);

        // METODO PARA REGISTRAR TITULOS DE LA PLANTILLA
        this.router.post('/registrarTitulos', TokenValidation, TITULO_CONTROLADOR.RegistrarTitulosPlantilla);
    }
}

const TITULO_RUTAS = new TituloRutas();

export default TITULO_RUTAS.router;