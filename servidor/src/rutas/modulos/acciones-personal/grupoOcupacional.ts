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
        this.router.get('/infoGrupo/:id_empleado',TokenValidation, GRUPO_OCUPACIONAL_CONTROLADOR.GrupoOcupacionalByEmple)
        this.router.post('/', TokenValidation, GRUPO_OCUPACIONAL_CONTROLADOR.IngresarGrupoOcupacional);
        this.router.put('/update', TokenValidation, GRUPO_OCUPACIONAL_CONTROLADOR.EditarGrupoOcupacional);
        this.router.delete('/delete', TokenValidation, GRUPO_OCUPACIONAL_CONTROLADOR.EliminarGrupoOcupacional);
        // METODO PARA ELIMINAR EL GRUPO OCUPACIONAL POR EMPLEADO **USADO
        this.router.delete('/deleteGrupoOcupacional/:id', TokenValidation, GRUPO_OCUPACIONAL_CONTROLADOR.EliminarEmpleGrupoOcupacional);
        // METODO PARA LEER DATOS DE PLANTILLA    **USADO
        this.router.post('/upload/revision', [TokenValidation, upload.single('uploads')], GRUPO_OCUPACIONAL_CONTROLADOR.RevisarDatos);
        // METODO PARA GUARDAR DATOS DE PLANTILLA    **USADO
        this.router.post('/cargar_plantilla', TokenValidation, GRUPO_OCUPACIONAL_CONTROLADOR.CargarPlantilla);
        // METODO PARA GUARDAR GRUPO MACIVOS POR INTERFAZ
        this.router.post('/registrarGrupo', TokenValidation, GRUPO_OCUPACIONAL_CONTROLADOR.RegistrarGrupo);
        // METODO PARA LEER DATOS DE PLANTILLA    **USADO
        this.router.post('/upload/revision_empleadoGrupoOcupacional', [TokenValidation, upload.single('uploads')], GRUPO_OCUPACIONAL_CONTROLADOR.RevisarPantillaEmpleadoGrupoOcu);
        // METODO PARA GUARDAR DATOS DE PLANTILLA   **USADO
        this.router.post('/cargar_plantilla/registro_empleadoGrupoOcupacional', TokenValidation, GRUPO_OCUPACIONAL_CONTROLADOR.RegistrarEmpleadoGrupoOcu);

    }
}

const GRUPO_OCUPACIONAL_RUTAS = new GrupoOcupacionalRutas();

export default GRUPO_OCUPACIONAL_RUTAS.router;