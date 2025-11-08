import GRADO_CONTROLADOR from '../../../controlador/modulos/acciones-personal/gradoControlador';
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

class GradoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // METODO DE CONSULTA DE GRADOS   **USADO
        this.router.get('/', TokenValidation, GRADO_CONTROLADOR.ListaGrados);
        // METODO PARA OBTENER GRADO DEL USUARIO   **USADO
        this.router.get('/infoGrado/:id_empleado', TokenValidation, GRADO_CONTROLADOR.GradoByEmple)
        // METODO PARA INGRESAR REGISTRO  **USADO
        this.router.post('/', TokenValidation, GRADO_CONTROLADOR.IngresarGrados);
        // METODO PARA EDITAR REGISTRO  **USADO
        this.router.put('/update', TokenValidation, GRADO_CONTROLADOR.EditarGrados);
        // METODO PARA ElIMINAR REGISTRO  **USADO
        this.router.delete('/delete', TokenValidation, GRADO_CONTROLADOR.EliminarGrados);
        // METODO PARA ELIMINAR EL GRADO POR EMPLEADO **USADO
        this.router.delete('/deleteGradoEmple/:id', TokenValidation, GRADO_CONTROLADOR.EliminarEmpleGrado);
        // METODO PARA LEER DATOS DE PLANTILLA    **USADO
        this.router.post('/upload/revision', [TokenValidation, upload.single('uploads')], GRADO_CONTROLADOR.RevisarDatos);
        // METODO PARA GUARDAR DATOS DE PLANTILLA    **USADO
        this.router.post('/cargar_plantilla', TokenValidation, GRADO_CONTROLADOR.CargarPlantilla);
        // METODO PARA GUARDAR PROCESOS MACIVOS POR INTERFAZ  **USADO
        this.router.post('/registrarGrados', TokenValidation, GRADO_CONTROLADOR.RegistrarGrados);
        // METODO PARA LEER DATOS DE PLANTILLA    **USADO
        this.router.post('/upload/revision_empleadoGrado', [TokenValidation, upload.single('uploads')], GRADO_CONTROLADOR.RevisarPantillaEmpleadoGrado);
        // METODO PARA GUARDAR DATOS DE PLANTILLA   **USADO
        this.router.post('/cargar_plantilla/registro_empleadoGrado', TokenValidation, GRADO_CONTROLADOR.RegistrarEmpleadoGrado);
        // METODO PARA ACTUALIZAR EL GRADO   **USADO
        this.router.post('/actualizacionGrado', TokenValidation, GRADO_CONTROLADOR.EditarRegistroGradoEmple);
        // METODO PARA ELIMINAR GRUPOS DE MANERA MULTIPLE   **USADO
        this.router.post('/eliminarGradoMultiple', TokenValidation, GRADO_CONTROLADOR.EliminarGradoMultiple);

    }
}

const GRADO_RUTAS = new GradoRutas();

export default GRADO_RUTAS.router;