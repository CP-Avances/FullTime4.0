import PROCESO_CONTROLADOR from '../../../controlador/modulos/acciones-personal/catProcesoControlador';
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

class ProcesoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // METODO DE CONSULTA DE PROCESOS    **USADO
        this.router.get('/', TokenValidation, PROCESO_CONTROLADOR.ListarProcesos);
        // METODO PARA REGISTRAR UN PROCESO   **USADO
        this.router.post('/', TokenValidation, PROCESO_CONTROLADOR.RegistrarProceso);
        // METODO PARA ELIMINAR REGISTRO   **USADO
        this.router.delete('/eliminar/:id', TokenValidation, PROCESO_CONTROLADOR.EliminarProceso);
        // METODO PARA OBTENER EL ID DEL PROCESO SUPERIOR   **USADO
        this.router.get('/busqueda/:nombre', TokenValidation, PROCESO_CONTROLADOR.ObtenerIdByNombre);
        // METODO PARA ACTUALIZAR UN PROCESO    **USADO
        this.router.put('/', TokenValidation, PROCESO_CONTROLADOR.ActualizarProceso);
        // METODO PARA LEER DATOS DE PLANTILLA    **USADO
        this.router.post('/upload/revision', [TokenValidation, upload.single('uploads')], PROCESO_CONTROLADOR.RevisarDatos);
        // METODO PARA GUARDAR DATOS DE PLANTILLA    **USADO
        this.router.post('/cargar_plantilla', TokenValidation, PROCESO_CONTROLADOR.CargarPlantilla);

        // METODO DE REGISTRO DE EMPLEADO - PROCESOS    **USADO
        this.router.post('/registrarProcesos', TokenValidation, PROCESO_CONTROLADOR.RegistrarProcesos);
        // METODO PARA ACTUALIZAR EL PROCESO   **USADO
        this.router.post('/actualizacionProceso', TokenValidation, PROCESO_CONTROLADOR.EditarRegistroProcesoEmple);
        // METODO PARA LEER DATOS DE PLANTILLA    **USADO
        this.router.post('/upload/revision_empleadoProceso', [TokenValidation, upload.single('uploads')], PROCESO_CONTROLADOR.RevisarPantillaEmpleadoProce);
        // METODO PARA GUARDAR DATOS DE PLANTILLA   **USADO
        this.router.post('/cargar_plantilla/registro_empleadoProceso', TokenValidation, PROCESO_CONTROLADOR.RegistrarEmpleadoProceso);
        // METODO PARA ELIMINAR PROCESOS DE MANERA MULTIPLE   **USADO
        this.router.post('/eliminarProcesoMultiple', TokenValidation, PROCESO_CONTROLADOR.EliminarProcesoMultiple);







        this.router.get('/:id', TokenValidation, PROCESO_CONTROLADOR.getOne);






    }
}

const PROCESO_RUTAS = new ProcesoRutas();

export default PROCESO_RUTAS.router;