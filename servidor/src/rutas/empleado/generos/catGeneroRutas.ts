import { Router } from 'express';
import GENERO_CONTROLADOR from '../../../controlador/empleado/empleadoGeneros/catGeneroControlador';
import { TokenValidation } from '../../../libs/verificarToken';

class GeneroRutas {
    public router: Router = Router();
    constructor() {
        this.configuracion();
    }
    configuracion(): void {
        // METODO PARA LISTAR TITULOS   ** USADO
        this.router.get('/', TokenValidation, GENERO_CONTROLADOR.ListarGeneros);
        // METODO PARA BUSCAR GENERO   **USADO
        this.router.get('/buscar/:genero', TokenValidation, GENERO_CONTROLADOR.ObtenerGenero);
        // METODO PARA CREAR GENERO   **USADO
        this.router.post('/', TokenValidation, GENERO_CONTROLADOR.CrearGenero);
        // METODO PARA EDITAR GENERO   **USADO
        this.router.put('/', TokenValidation, GENERO_CONTROLADOR.ActualizarGenero);

    }
}

const GENERO_RUTAS = new GeneroRutas();

export default GENERO_RUTAS.router;