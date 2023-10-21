import { Router } from 'express';
import FERIADOS_CONTROLADOR from '../../controlador/catalogos/catFeriadosControlador';
import { TokenValidation } from '../../libs/verificarToken';

const multipart = require('connect-multiparty');

const multipartMiddleware = multipart({
    uploadDir: './plantillas',
});

class FeriadosRuta {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA LISTAR FERIADOS
        this.router.get('/', TokenValidation, FERIADOS_CONTROLADOR.ListarFeriados);
        // METODO PARA ELIMINAR REGISTRO
        this.router.delete('/delete/:id', TokenValidation, FERIADOS_CONTROLADOR.EliminarFeriado);
        // METODO PARA CREAR REGISTRO DE FERIADO
        this.router.post('/', TokenValidation, FERIADOS_CONTROLADOR.CrearFeriados);
        // METODO PARA BUSCAR FERIADOS EXCEPTO REGISTRO EDITADO
        this.router.get('/listar/:id', TokenValidation, FERIADOS_CONTROLADOR.ListarFeriadosActualiza);
        // METODO PARA ACTUALIZAR REGISTRO
        this.router.put('/', TokenValidation, FERIADOS_CONTROLADOR.ActualizarFeriado);
        // METODO PARA BUSCAR INFORMACION DE UN FERIADO
        this.router.get('/:id', TokenValidation, FERIADOS_CONTROLADOR.ObtenerUnFeriado);
        // METODO PARA BUSCAR FERIADOS POR CIUDAD Y RANGO DE FECHAS  --**VERIFICADO
        this.router.post('/listar-feriados/ciudad', TokenValidation, FERIADOS_CONTROLADOR.FeriadosCiudad);
        // METODO PARA BUSCAR FECHASDE RECUPERACION DE FERIADOS POR CIUDAD Y RANGO DE FECHAS  --**VERIFICADO
        this.router.post('/listar-feriados-recuperar/ciudad', TokenValidation, FERIADOS_CONTROLADOR.FeriadosRecuperacionCiudad);




        this.router.post('/upload/revision', [TokenValidation, multipartMiddleware], FERIADOS_CONTROLADOR.RevisarDatos);
        this.router.post('/upload/revision_data', [TokenValidation, multipartMiddleware], FERIADOS_CONTROLADOR.RevisarDatos_Duplicados);
        this.router.post('/upload', [TokenValidation, multipartMiddleware], FERIADOS_CONTROLADOR.CrearFeriadoPlantilla);



    }
}

const FERIADOS_RUTA = new FeriadosRuta();

export default FERIADOS_RUTA.router;