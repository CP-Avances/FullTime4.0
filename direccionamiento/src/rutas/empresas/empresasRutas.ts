import { Router } from 'express';
import EMPRESAS_CONTROLADOR from '../../controlador/empresas/empresasControlador';

class EmpresasRutas {
    public router: Router = Router();

    constructor(){
        this.configuracion();
    }

    configuracion(): void {
        this.router.post('/', EMPRESAS_CONTROLADOR.ObtenerEmpresas);
    }
}

const EMPRESAS_RUTAS = new EmpresasRutas();
export default EMPRESAS_RUTAS.router;