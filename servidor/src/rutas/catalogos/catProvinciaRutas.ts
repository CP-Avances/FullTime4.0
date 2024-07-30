import { Router } from 'express';
import PROVINCIA_CONTROLADOR from '../../controlador/catalogos/catProvinciaControlador';
import { TokenValidation } from '../../libs/verificarToken';

class ProvinciaRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // LISTAR PAISES DE ACUERDO AL CONTINENTE  **USADO
        this.router.get('/pais/:continente', TokenValidation, PROVINCIA_CONTROLADOR.ListarPaises);
        // LISTAR CONTINENTES   **USADO
        this.router.get('/continentes', TokenValidation, PROVINCIA_CONTROLADOR.ListarContinentes);
        // BUSCAR PROVINCIAS POR PAIS  **USADO
        this.router.get('/:id_pais', TokenValidation, PROVINCIA_CONTROLADOR.BuscarProvinciaPais);
        // METODO PARA BUSCAR PROVINCIAS  **USADO
        this.router.get('/', TokenValidation, PROVINCIA_CONTROLADOR.ListarProvincia);
        // METODO PARA ELIMINAR REGISTROS  **USADO
        this.router.delete('/eliminar/:id', TokenValidation, PROVINCIA_CONTROLADOR.EliminarProvincia);
        // METODO PARA REGISTRAR PROVINCIA  **USADO
        this.router.post('/', TokenValidation, PROVINCIA_CONTROLADOR.CrearProvincia);
        // METODO PARA BUSCAR DATOS DE UNA PROVINCIA
        this.router.get('/buscar/:id', TokenValidation, PROVINCIA_CONTROLADOR.ObtenerProvincia);
        // METODO PARA BUSCAR DATOS DE UN PAIS     *USADO
        this.router.get('/buscar/pais/:id', TokenValidation, PROVINCIA_CONTROLADOR.ObtenerPais);





    }
}

const PROVINCIA_RUTAS = new ProvinciaRutas();

export default PROVINCIA_RUTAS.router;