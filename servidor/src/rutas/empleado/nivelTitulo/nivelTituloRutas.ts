import { Router } from 'express';
import NIVEL_TITULO_CONTROLADOR from '../../../controlador/empleado/nivelTitulo/nivelTituloControlador';
import { TokenValidation } from '../../../libs/verificarToken';

import multer from 'multer';
import { ObtenerRutaLeerPlantillas } from '../../../libs/accesoCarpetas';

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

class NivelTituloRutas {
    public router: Router = Router();

    constructor() {

        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA BUSCAR LISTA DE NIVELES DE TITULO   **USADO
        this.router.get('/', TokenValidation, NIVEL_TITULO_CONTROLADOR.ListarNivel);
        // METODO PARA ELIMINAR REGISTROS   **USADO
        this.router.delete('/eliminar/:id', TokenValidation, NIVEL_TITULO_CONTROLADOR.EliminarNivelTitulo);
        // METODO PARA REGISTRAR NIVEL DE TITULO   **USADO
        this.router.post('/', TokenValidation, NIVEL_TITULO_CONTROLADOR.CrearNivel);
        // METODO PARA ACTUALIZAR REGISTRO DE NIVEL   **USADO
        this.router.put('/', TokenValidation, NIVEL_TITULO_CONTROLADOR.ActualizarNivelTitulo);
        // METODO PARA BUSCAR NIVEL POR SU NOMBRE   **USADO
        this.router.get('/buscar/:nombre', TokenValidation, NIVEL_TITULO_CONTROLADOR.ObtenerNivelNombre);
        // METODO PARA VALIDAR DATOS DE PLANTILLA   **USADO
        this.router.post('/upload/revision', [TokenValidation, upload.single('uploads')], NIVEL_TITULO_CONTROLADOR.RevisarDatos);
        // METODO PARA REGISTRAR NIVELES DE TITULO DE LA PLANTILLA   **USADO
        this.router.post('/registrarNiveles', TokenValidation, NIVEL_TITULO_CONTROLADOR.RegistrarNivelesPlantilla);

    }
}

const NIVEL_TITULO_RUTAS = new NivelTituloRutas();

export default NIVEL_TITULO_RUTAS.router;