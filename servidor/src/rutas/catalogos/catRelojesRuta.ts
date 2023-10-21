import { Router } from 'express';
import RELOJES_CONTROLADOR from '../../controlador/catalogos/catRelojesControlador';
import { TokenValidation } from '../../libs/verificarToken';

const multipart = require('connect-multiparty');

const multipartMiddlewarePlantilla = multipart({
    uploadDir: './plantillas',
});

class RelojesRuta {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA BUSCAR DISPOSITIVOS
        this.router.get('/', TokenValidation, RELOJES_CONTROLADOR.ListarRelojes);
        // METODO PARA ELIMINAR REGISTROS
        this.router.delete('/eliminar/:id', TokenValidation, RELOJES_CONTROLADOR.EliminarRegistros);
        // METODO PARA REGISTRAR DISPOSITIVO
        this.router.post('/', TokenValidation, RELOJES_CONTROLADOR.CrearRelojes);
        // METODO PARA VER DATOS DE UN DISPOSITIVO
        this.router.get('/:id', TokenValidation, RELOJES_CONTROLADOR.ListarUnReloj);
        // METODO PARA ACTUALIZAR REGISTRO
        this.router.put('/', TokenValidation, RELOJES_CONTROLADOR.ActualizarReloj);
        // METODO PARA BUSCAR DATOS GENERALES DE DISPOSITIVOS
        this.router.get('/datosReloj/:id', TokenValidation, RELOJES_CONTROLADOR.ListarDatosUnReloj);


        this.router.post('/plantillaExcel/', [TokenValidation, multipartMiddlewarePlantilla], RELOJES_CONTROLADOR.CargaPlantillaRelojes);
        // METODO para verificar datos de plantilla antes de subirlos
        this.router.post('/verificar_datos/plantillaExcel/', [TokenValidation, multipartMiddlewarePlantilla], RELOJES_CONTROLADOR.VerificarDatos);
        this.router.post('/verificar_plantilla/plantillaExcel/', [TokenValidation, multipartMiddlewarePlantilla], RELOJES_CONTROLADOR.VerificarPlantilla);
        this.router.post('/plantillaExcel/', [TokenValidation, multipartMiddlewarePlantilla], RELOJES_CONTROLADOR.CargaPlantillaRelojes);
    }
}

const RELOJES_RUTA = new RelojesRuta();

export default RELOJES_RUTA.router;