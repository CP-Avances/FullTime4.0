import { Router } from 'express';
import FERIADOS_CONTROLADOR from '../../controlador/catalogos/catFeriadosControlador';
import { TokenValidation } from '../../libs/verificarToken';

import multer from 'multer';
import moment from 'moment';
import { ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';


const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, ObtenerRutaLeerPlantillas())
    },
    filename: function (req, file, cb) {
        // FECHA DEL SISTEMA
        //var fecha = moment();
        //var anio = fecha.format('YYYY');
        //var mes = fecha.format('MM');
        //var dia = fecha.format('DD');
        let documento = file.originalname;
        cb(null, documento);
    }
})

const storage1 = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, ObtenerRutaLeerPlantillas())
    },
    filename: function (req, file, cb) {
        // FECHA DEL SISTEMA
        //var fecha = moment();
        //var anio = fecha.format('YYYY');
        //var mes = fecha.format('MM');
        //var dia = fecha.format('DD');
        let documento = file.originalname;
        cb(null, documento);
    }
})

const upload = multer({ storage: storage });
const upload1 = multer({ storage: storage1 });

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
        // METODO PARA BUSCAR FECHASDE RECUPERACION DE FERIADOS POR CIUDAD Y RANGO DE FECHAS  **USADO
        this.router.post('/listar-feriados-recuperar/ciudad', TokenValidation, FERIADOS_CONTROLADOR.FeriadosRecuperacionCiudad);
        // METODO PARA VALIDAR DATOS DE PLANTILLA   **USADO
        this.router.post('/upload/revision', [TokenValidation, upload.single('uploads')], FERIADOS_CONTROLADOR.RevisarDatos);
        // METODO PARA REGISTRAR DATOS DE FERIADOS DE PLANTILLA   **USADO
        this.router.post('/upload/crearFeriado', [TokenValidation, upload1.single('uploads')], FERIADOS_CONTROLADOR.RegistrarFeriado);
        // METODO PARA REGISTRAR DATOS DE FERIADOS CIUDADES DE PLANTILLA   **USADO
        this.router.post('/upload/crearFeriadoCiudad', [TokenValidation, upload1.single('uploads')], FERIADOS_CONTROLADOR.RegistrarFeriado_Ciudad);

    }
}

const FERIADOS_RUTA = new FeriadosRuta();

export default FERIADOS_RUTA.router;