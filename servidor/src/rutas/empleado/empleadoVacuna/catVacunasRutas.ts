import TIPO_VACUNAS_CONTROLADOR from '../../../controlador/empleado/empleadoVacuna/catVacunasControlador'
import { ObtenerRutaLeerPlantillas } from '../../../libs/accesoCarpetas';
import { TokenValidation } from '../../../libs/verificarToken';
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

class VacunasRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // METODO PARA CREAR TIPO VACUNAS  **USADO
        this.router.post('/crearVacuna', TokenValidation, TIPO_VACUNAS_CONTROLADOR.CrearVacuna);
        // METODO PARA LISTAR TIPO VACUNAS    **USADO
        this.router.get('/', TokenValidation, TIPO_VACUNAS_CONTROLADOR.ListaVacuna);
        // METODO PARA EDITAR TIPO VACUNAS   **USADO
        this.router.put('/', TokenValidation, TIPO_VACUNAS_CONTROLADOR.EditarVacuna);
        // METODO PARA ELIMINAR REGISTRO    **USADO
        this.router.delete('/eliminar/:id', TokenValidation, TIPO_VACUNAS_CONTROLADOR.EliminarRegistro);
        // METODO PARA LEER DATOS DE PLANTILLA    **USADO
        this.router.post('/upload/revision', [TokenValidation, upload.single('uploads')], TIPO_VACUNAS_CONTROLADOR.RevisarDatos);
        // METODO PARA GUARDAR DATOS DE PLANTILLA    **USADO
        this.router.post('/cargar_plantilla/', TokenValidation,TIPO_VACUNAS_CONTROLADOR.CargarPlantilla);
    }
}

const TIPO_VACUNAS_RUTAS = new VacunasRutas();

export default TIPO_VACUNAS_RUTAS.router;