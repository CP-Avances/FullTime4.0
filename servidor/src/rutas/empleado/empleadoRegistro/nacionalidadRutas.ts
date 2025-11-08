import NACIONALIDAD_CONTROLADOR from '../../../controlador/empleado/empleadoRegistro/nacionalidadControlador';
import { TokenValidation } from '../../../libs/verificarToken';
import { Router } from 'express';

class NacionalidadRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // METODO PARA LISTAR NACIONALIDAD   **USADO
        this.router.get('/', TokenValidation, NACIONALIDAD_CONTROLADOR.ListarNacionalidades);
        // METODO PARA REGISTRAR NACIONALIDAD   **USADO
        this.router.post('/', TokenValidation, NACIONALIDAD_CONTROLADOR.CrearNacionalidad);
        // METODO PARA ACTUALIZAR REGISTRO DE NACIONALIDAD   **USADO
        this.router.put('/', TokenValidation, NACIONALIDAD_CONTROLADOR.ActualizarNacionalidad);
        // METODO PARA ELIMINAR REGISTROS   **USADO
        this.router.delete('/eliminar/:id', TokenValidation, NACIONALIDAD_CONTROLADOR.EliminarNacionalidad);

    }
}

const nacionalidadRutas = new NacionalidadRutas();

export default nacionalidadRutas.router;