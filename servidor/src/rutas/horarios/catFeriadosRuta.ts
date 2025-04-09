import FERIADOS_CONTROLADOR from '../../controlador/horarios/catFeriadosControlador';
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
})

const upload = multer({ storage: storage });

class FeriadosRuta {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA LISTAR FERIADOS   **USADO
        this.router.get('/', TokenValidation, FERIADOS_CONTROLADOR.ListarFeriados);
        // METODO PARA ELIMINAR REGISTRO   **USADO
        this.router.delete('/delete/:id', TokenValidation, FERIADOS_CONTROLADOR.EliminarFeriado);
        // METODO PARA CREAR REGISTRO DE FERIADO   **USADO
        this.router.post('/', TokenValidation, FERIADOS_CONTROLADOR.CrearFeriados);
        // METODO PARA BUSCAR FERIADOS EXCEPTO REGISTRO EDITADO  **USADO
        this.router.get('/listar/:id', TokenValidation, FERIADOS_CONTROLADOR.ListarFeriadosActualiza);
        // METODO PARA ACTUALIZAR REGISTRO    **USADO
        this.router.put('/', TokenValidation, FERIADOS_CONTROLADOR.ActualizarFeriado);
        // METODO PARA BUSCAR INFORMACION DE UN FERIADO   **USADO
        this.router.get('/:id', TokenValidation, FERIADOS_CONTROLADOR.ObtenerUnFeriado);
        // METODO PARA BUSCAR FERIADOS POR CIUDAD Y RANGO DE FECHAS  **USADO
        this.router.post('/listar-feriados/ciudad', TokenValidation, FERIADOS_CONTROLADOR.FeriadosCiudad);
        this.router.post('/listar-feriados/ciudad2', TokenValidation, FERIADOS_CONTROLADOR.FeriadosCiudadMultiplesEmpleados);

        // METODO PARA BUSCAR FECHASDE RECUPERACION DE FERIADOS POR CIUDAD Y RANGO DE FECHAS  **USADO
        this.router.post('/listar-feriados-recuperar/ciudad', TokenValidation, FERIADOS_CONTROLADOR.FeriadosRecuperacionCiudad);

        // METODO PARA BUSCAR FECHASDE RECUPERACION DE FERIADOS POR CIUDAD Y RANGO DE FECHAS  **USADO
        this.router.post('/listar-feriados-recuperar/ciudad2', TokenValidation, FERIADOS_CONTROLADOR.FeriadosRecuperacionCiudadMultiplesEmpleados);
        // METODO PARA VALIDAR DATOS DE PLANTILLA   **USADO
        this.router.post('/upload/revision', [TokenValidation, upload.single('uploads')], FERIADOS_CONTROLADOR.RevisarDatos);
        // METODO PARA REGISTRAR DATOS DE FERIADOS DE PLANTILLA   **USADO
        this.router.post('/upload/crearFeriado', [TokenValidation, upload.single('uploads')], FERIADOS_CONTROLADOR.RegistrarFeriado);
        // METODO PARA REGISTRAR DATOS DE FERIADOS CIUDADES DE PLANTILLA   **USADO
        this.router.post('/upload/crearFeriadoCiudad', [TokenValidation, upload.single('uploads')], FERIADOS_CONTROLADOR.RegistrarFeriado_Ciudad);



        /** ************************************************************************************* **
         ** **                         METODO DE APLICACION MOVIL                              ** **
         ** ************************************************************************************* **/
        // METODO PARA LEER FERIADOS   **USADO
        this.router.get('/cg-feriados', TokenValidation, FERIADOS_CONTROLADOR.LeerFeriados)
    }
}

const FERIADOS_RUTA = new FeriadosRuta();

export default FERIADOS_RUTA.router;