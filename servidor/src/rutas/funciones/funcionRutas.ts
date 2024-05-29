import { Router } from 'express';
import FUNCIONES_CONTROLADOR from '../../controlador/funciones/funcionControlador';
import { TokenValidation } from '../../libs/verificarToken'

class DoumentosRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // METODO PARA LISTAR FUNCIONES DEL SISTEMA
        this.router.get('/funcionalidad', FUNCIONES_CONTROLADOR.ConsultarFunciones);
    }
}

const FUNCIONES_RUTAS = new DoumentosRutas();

export default FUNCIONES_RUTAS.router;