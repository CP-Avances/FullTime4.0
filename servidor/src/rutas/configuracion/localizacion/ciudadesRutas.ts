import { Router } from 'express';
import { TokenValidation } from '../../../libs/verificarToken';
import CIUDAD_CONTROLADOR from '../../../controlador/configuracion/localizacion/ciudadControlador';

class CiudadRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // BUSCAR INFORMACION DE LA CIUDAD  **USADO
        this.router.get('/informacion-ciudad/:id_ciudad', TokenValidation, CIUDAD_CONTROLADOR.ListarInformacionCiudad);
        // BUSQUEDA DE LISTA DE CIUDADES   **USADO
        this.router.get('/listaCiudad', TokenValidation, CIUDAD_CONTROLADOR.ListarCiudades);
        // LISTAR CIUDADES POR PROVINCIA  ** USADO
        this.router.get('/ciudad-provincia/:id_provincia', TokenValidation, CIUDAD_CONTROLADOR.ListarCiudadesProvincia);
        // REGISTRAR CIUDAD  **USADO
        this.router.post('/', TokenValidation, CIUDAD_CONTROLADOR.CrearCiudad);
        // LISTAR NOMBRE DE CIUDADES-PROVINCIA  **USADO
        this.router.get('/', TokenValidation, CIUDAD_CONTROLADOR.ListarNombreCiudad);
        // METODO PARA ELIMINAR REGISTRO  **USADO
        this.router.delete('/eliminar/:id', TokenValidation, CIUDAD_CONTROLADOR.EliminarCiudad);
        // METODO PARA BUSCAR DATOS DE UNA CIUDAD   **USADO
        this.router.get('/:id', TokenValidation, CIUDAD_CONTROLADOR.ConsultarUnaCiudad);
    }
}

const CIUDAD_RUTAS = new CiudadRutas();

export default CIUDAD_RUTAS.router;