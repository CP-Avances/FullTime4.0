import { Router } from 'express';
import PROCESO_CONTROLADOR from '../../../controlador/modulos/acciones-personal/catProcesoControlador';
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

class ProcesoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // METODO PARA CONSULTAR PROCESOS
        this.router.get('/', TokenValidation, PROCESO_CONTROLADOR.ListarProcesos);
        this.router.get('/busqueda/:nombre', TokenValidation, PROCESO_CONTROLADOR.getIdByNombre);
        this.router.get('/:id', TokenValidation, PROCESO_CONTROLADOR.getOne);
        this.router.post('/', TokenValidation, PROCESO_CONTROLADOR.create);
        this.router.put('/', TokenValidation, PROCESO_CONTROLADOR.ActualizarProceso);
        // METODO PARA ELIMINAR REGISTRO   **USADO
        this.router.delete('/eliminar/:id', TokenValidation, PROCESO_CONTROLADOR.EliminarProceso);
        // METODO PARA LEER DATOS DE PLANTILLA    **USADO
        this.router.post('/upload/revision', [TokenValidation, upload.single('uploads')], PROCESO_CONTROLADOR.RevisarDatos);
        // METODO PARA GUARDAR DATOS DE PLANTILLA    **USADO
        this.router.post('/cargar_plantilla/', TokenValidation,PROCESO_CONTROLADOR.CargarPlantilla);
    }
}

const PROCESO_RUTAS = new ProcesoRutas();

export default PROCESO_RUTAS.router;