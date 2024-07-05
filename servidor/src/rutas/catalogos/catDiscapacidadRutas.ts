import DISCPACIDAD_CONTROLADOR from '../../controlador/catalogos/catDiscapacidadControlador';
import { ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';
import { TokenValidation } from '../../libs/verificarToken';
import { Router } from 'express';
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

class DiscapacidadRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // METODO PARA LISTAR TIPOS DE DISCAPACIDAD
        this.router.get('/', TokenValidation, DISCPACIDAD_CONTROLADOR.ListarDiscapacidad);
        // METODO PARA REGISTRAR UN TIPO DE DISCAPACIDDA
        this.router.post('/crearDiscapacidad', TokenValidation, DISCPACIDAD_CONTROLADOR.CrearDiscapacidad);
        // METODO PARA EDITAR UN TIPO DE DISCAPACIDAD
        this.router.put('/', TokenValidation, DISCPACIDAD_CONTROLADOR.EditarDiscapacidad);
        // METODO PARA ELIMINAR UN TIPO DE DISCAPACIDAD
        this.router.delete('/eliminar/:id', TokenValidation, DISCPACIDAD_CONTROLADOR.EliminarRegistro);
        // METODO PARA LEER DATOS DE PLANTILLA
        this.router.post('/upload/revision', [TokenValidation, upload.single('uploads')], DISCPACIDAD_CONTROLADOR.RevisarDatos);
        // METODO PARA GUARDAR DATOS DE PLANTILLA
        this.router.post('/cargar_plantilla/', TokenValidation,DISCPACIDAD_CONTROLADOR.CargarPlantilla);
    }
}

const DISCAPACIDADES_RUTAS = new DiscapacidadRutas();

export default DISCAPACIDADES_RUTAS.router;