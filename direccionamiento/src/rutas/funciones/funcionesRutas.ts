import { Router } from 'express';
import FUNCIONES_CONTROLADOR from '../../controlador/funciones/funcionesControlador';

class FuncionesRutas {
    public router: Router = Router();

    constructor(){
        this.configuracion();
    }

    configuracion(): void {
        this.router.post('/administracion/funcionalidad', FUNCIONES_CONTROLADOR.ObtenerFunciones);   
    }
}

const FUNCIONES_RUTAS = new FuncionesRutas();
export default FUNCIONES_RUTAS.router;