import MODALIDADLABORAL_CONTROLADOR from '../../../controlador/configuracion/parametrizacion/catModalidadLaboralControlador';
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
})

const upload = multer({ storage: storage });

class ModalidaLaboralRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // METODO PARA LISTAR MODALIDAD LABORAL
        this.router.get('/', TokenValidation, MODALIDADLABORAL_CONTROLADOR.ListaModalidadLaboral);
        // METODO PARA REGISTRAR MODALIDAD LABORAL     **USADO
        this.router.post('/crearModalidad', TokenValidation, MODALIDADLABORAL_CONTROLADOR.CrearModalidadLaboral);
        // METODO PARA EDITAR MODALIDAD LABORAL   **USADO
        this.router.put('/', TokenValidation, MODALIDADLABORAL_CONTROLADOR.EditarModalidadLaboral);
        // METODO PARA ELIMINAR REGISTRO   **USADO
        this.router.delete('/eliminar/:id', TokenValidation, MODALIDADLABORAL_CONTROLADOR.EliminarRegistro);
        // METODO PARA LEER DATOS DE PLANTILLA    **USADO
        this.router.post('/upload/revision', [TokenValidation, upload.single('uploads')], MODALIDADLABORAL_CONTROLADOR.VerfificarPlantillaModalidadLaboral);
        // METODO PARA GUARDAR DATOS DE PLANTILLA   **USADO
        this.router.post('/cargar_plantilla/', TokenValidation, MODALIDADLABORAL_CONTROLADOR.CargarPlantilla);

    }
}

const MODALIDAD_LABORAL_RUTAS = new ModalidaLaboralRutas();

export default MODALIDAD_LABORAL_RUTAS.router;