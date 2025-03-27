import { Router } from 'express';
import ESTADO_CIVIL_CONTROLADOR from '../../../controlador/empleado/empleadoEstadoCivil/catEstadoCivilControlador';

import { TokenValidation } from '../../../libs/verificarToken';

class EstadoCivilRutas {
    public router: Router = Router();
    constructor() {
        this.configuracion();
    }
    configuracion(): void {

        this.router.get('/', TokenValidation, ESTADO_CIVIL_CONTROLADOR.ListarEstadosCivil);
        // METODO PARA BUSCAR GENERO   **USADO
        this.router.get('/buscar/:estado', TokenValidation, ESTADO_CIVIL_CONTROLADOR.ObtenerEstadoCivil);
        // METODO PARA CREAR GENERO   **USADO
        this.router.post('/', TokenValidation, ESTADO_CIVIL_CONTROLADOR.CrearEstadoCivil);
        // METODO PARA EDITAR GENERO   **USADO
        this.router.put('/', TokenValidation, ESTADO_CIVIL_CONTROLADOR.ActualizarEstadoCivil);
        // METODO PARA ELIMINAR REGISTROS   **USADO
        this.router.delete('/eliminar/:id', TokenValidation, ESTADO_CIVIL_CONTROLADOR.EliminarEstadoCivil);
      
    }
}

const ESTADO_CIVIL_RUTAS = new EstadoCivilRutas();

export default ESTADO_CIVIL_RUTAS.router;