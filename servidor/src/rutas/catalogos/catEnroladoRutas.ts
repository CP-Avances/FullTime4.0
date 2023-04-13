import { Router, NextFunction, Request, Response } from 'express';
import ENROLADOS_CONTROLADOR from '../../controlador/catalogos/catEnroladoControlador';
import { TokenValidation } from '../../libs/verificarToken';

const multipart = require('connect-multiparty');  

const multipartMiddlewarePlantilla = multipart({  
    uploadDir: './plantillas',
});

class EnroladoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, ENROLADOS_CONTROLADOR.ListarEnrolados);
        this.router.get('/:id', TokenValidation, ENROLADOS_CONTROLADOR.ObtenerUnEnrolado);
        this.router.post('/', TokenValidation, ENROLADOS_CONTROLADOR.CrearEnrolado);
        this.router.post('/plantillaExcel/', [TokenValidation, multipartMiddlewarePlantilla], ENROLADOS_CONTROLADOR.CargaPlantillaEnrolado);
        this.router.get('/busqueda/:id_usuario', TokenValidation, ENROLADOS_CONTROLADOR.ObtenerRegistroEnrolado);
        this.router.get('/buscar/ultimoId', TokenValidation, ENROLADOS_CONTROLADOR.ObtenerUltimoId);
        this.router.put('/', TokenValidation, ENROLADOS_CONTROLADOR.ActualizarEnrolado);
        this.router.delete('/eliminar/:id', TokenValidation, ENROLADOS_CONTROLADOR.EliminarEnrolado);
        this.router.post('/xmlDownload/', TokenValidation, ENROLADOS_CONTROLADOR.FileXML);
        this.router.get('/download/:nameXML', ENROLADOS_CONTROLADOR.downloadXML);
        this.router.get('/cargarDatos/:usuario', TokenValidation, ENROLADOS_CONTROLADOR.ObtenerDatosEmpleado);
    }

}

const ENROLADO_RUTAS = new EnroladoRutas();

export default ENROLADO_RUTAS.router;