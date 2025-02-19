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
       
    }
}

const GENERO_RUTAS = new GeneroRutas();

export default GENERO_RUTAS.router;