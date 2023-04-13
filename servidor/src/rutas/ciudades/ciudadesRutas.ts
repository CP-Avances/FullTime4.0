import { Router } from 'express';
import { TokenValidation } from '../../libs/verificarToken';
import CIUDAD_CONTROLADOR from '../../controlador/ciudad/ciudadControlador';

class CiudadRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // BUSCAR INFORMACION DE LA CIUDAD
        this.router.get('/informacion-ciudad/:id_ciudad', TokenValidation, CIUDAD_CONTROLADOR.ListarInformacionCiudad);
        // BUSQUEDA DE LISTA DE CIUDADES
        this.router.get('/listaCiudad', TokenValidation, CIUDAD_CONTROLADOR.ListarCiudades);
        // LISTAR CIUDADES POR PROVINCIA
        this.router.get('/ciudad-provincia/:id_provincia', TokenValidation, CIUDAD_CONTROLADOR.ListarCiudadesProvincia);
        // REGISTRAR CIUDAD
        this.router.post('/', TokenValidation, CIUDAD_CONTROLADOR.CrearCiudad);
        // LISTAR NOMBRE DE CIUDADES-PROVINCIA
        this.router.get('/', TokenValidation, CIUDAD_CONTROLADOR.ListarNombreCiudad);
        // METODO PARA ELIMINAR REGISTRO
        this.router.delete('/eliminar/:id', TokenValidation, CIUDAD_CONTROLADOR.EliminarCiudad);
        // METODO PARA CREAR ARCHIVO XML
        this.router.post('/xmlDownload/', TokenValidation, CIUDAD_CONTROLADOR.FileXML);
        // METODO PARA DESCARGAR ARCHIVO XML
        this.router.get('/download/:nameXML', CIUDAD_CONTROLADOR.downloadXML);
        // METODO PARA BUSCAR DATOS DE UNA CIUDAD
        this.router.get('/:id', TokenValidation, CIUDAD_CONTROLADOR.ConsultarUnaCiudad);

    }
}

const CIUDAD_RUTAS = new CiudadRutas();

export default CIUDAD_RUTAS.router;