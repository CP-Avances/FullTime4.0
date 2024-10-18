import { TokenValidation } from '../../../libs/verificarToken';
import { Router } from 'express';

import nacionalidadControlador from '../../../controlador/empleado/empleadoRegistro/nacionalidadControlador';

class NacionalidadRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // METODO PARA LISTAR NACIONALIDADES   **USADO
        this.router.get('/', TokenValidation, nacionalidadControlador.ListarNacionalidades);
    }
}

const nacionalidadRutas = new NacionalidadRutas();

export default nacionalidadRutas.router;