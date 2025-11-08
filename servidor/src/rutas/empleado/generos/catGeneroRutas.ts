import { Router } from 'express';
import { TokenValidation } from '../../../libs/verificarToken';
import GENERO_CONTROLADOR from '../../../controlador/empleado/empleadoGeneros/catGeneroControlador';

class GeneroRutas {
    public router: Router = Router();
    constructor() {
        this.configuracion();
    }
    configuracion(): void {

        // METODO PARA LISTAR GENEROS   ** USADO
        this.router.get('/', TokenValidation, GENERO_CONTROLADOR.ListarGeneros);
        // METODO PARA BUSCAR GENEROS POR SU NOMBRE   **USADO
        this.router.get('/buscar/:genero', TokenValidation, GENERO_CONTROLADOR.ObtenerGenero);
        // METODO PARA CREAR GENERO   **USADO
        this.router.post('/', TokenValidation, GENERO_CONTROLADOR.CrearGenero);
        // METODO PARA ACTUALIZAR REGISTRO DE GENERO   **USADO
        this.router.put('/', TokenValidation, GENERO_CONTROLADOR.ActualizarGenero);
        // METODO PARA ELIMINAR REGISTROS   **USADO
        this.router.delete('/eliminar/:id', TokenValidation, GENERO_CONTROLADOR.EliminarGenero);


    }
}

const GENERO_RUTAS = new GeneroRutas();

export default GENERO_RUTAS.router;