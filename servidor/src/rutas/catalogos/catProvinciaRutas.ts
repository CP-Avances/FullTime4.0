import { Router } from 'express';
import PROVINCIA_CONTROLADOR from '../../controlador/catalogos/catProvinciaControlador';
import { TokenValidation } from '../../libs/verificarToken';

class ProvinciaRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // LISTAR PAISES DE ACUERDO AL CONTINENTE
        this.router.get('/pais/:continente', TokenValidation, PROVINCIA_CONTROLADOR.ListarPaises);
        // LISTAR CONTINENTES
        this.router.get('/continentes', TokenValidation, PROVINCIA_CONTROLADOR.ListarContinentes);
        // BUSCAR PROVINCIAS POR PAIS
        this.router.get('/:id_pais', TokenValidation, PROVINCIA_CONTROLADOR.BuscarProvinciaPais);
        // METODO PARA BUSCAR PROVINCIAS
        this.router.get('/', TokenValidation, PROVINCIA_CONTROLADOR.ListarProvincia);
        // METODO PARA ELIMINAR REGISTROS
        this.router.delete('/eliminar/:id', TokenValidation, PROVINCIA_CONTROLADOR.EliminarProvincia);
        // METODO PARA REGISTRAR PROVINCIA
        this.router.post('/', TokenValidation, PROVINCIA_CONTROLADOR.CrearProvincia);
        // METODO PARA BUSCAR DATOS DE UNA PROVINCIA
        this.router.get('/buscar/:id', TokenValidation, PROVINCIA_CONTROLADOR.ObtenerProvincia);
        // METODO PARA BUSCAR DATOS DE UN PAIS
        this.router.get('/buscar/pais/:id', TokenValidation, PROVINCIA_CONTROLADOR.ObtenerPais);




        this.router.get('/paises', TokenValidation, PROVINCIA_CONTROLADOR.ListarTodoPais);
        this.router.get('/nombreProvincia/:nombre', TokenValidation, PROVINCIA_CONTROLADOR.ObtenerIdProvincia);





    }
}

const PROVINCIA_RUTAS = new ProvinciaRutas();

export default PROVINCIA_RUTAS.router;