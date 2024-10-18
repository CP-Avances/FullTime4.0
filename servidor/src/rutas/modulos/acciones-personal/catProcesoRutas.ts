import { Router } from 'express';
import PROCESO_CONTROLADOR from '../../../controlador/modulos/acciones-personal/catProcesoControlador';
import { TokenValidation } from '../../../libs/verificarToken';

class ProcesoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // METODO PARA CONSULTAR PROCESOS
        this.router.get('/', TokenValidation, PROCESO_CONTROLADOR.ListarProcesos);
        this.router.get('/busqueda/:nombre', TokenValidation, PROCESO_CONTROLADOR.getIdByNombre);
        this.router.get('/:id', TokenValidation, PROCESO_CONTROLADOR.getOne);
        this.router.post('/', TokenValidation, PROCESO_CONTROLADOR.create);
        this.router.put('/', TokenValidation, PROCESO_CONTROLADOR.ActualizarProceso);
        // METODO PARA ELIMINAR REGISTRO   **USADO
        this.router.delete('/eliminar/:id', TokenValidation, PROCESO_CONTROLADOR.EliminarProceso);
    }
}

const PROCESO_RUTAS = new ProcesoRutas();

export default PROCESO_RUTAS.router;