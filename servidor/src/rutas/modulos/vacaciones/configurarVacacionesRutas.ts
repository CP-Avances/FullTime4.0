import { Router } from 'express';
import { TokenValidation } from '../../../libs/verificarToken';
import CONFIGURAR_VACACIONES_CONTROLADOR from '../../../controlador/modulos/vacaciones/configurarVacaciones';

class DepartamentoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA CREAR CONFIGURACION DE VACACIONES   **USADO
        this.router.post('/', TokenValidation, CONFIGURAR_VACACIONES_CONTROLADOR.RegistrarConfiguracion);

        // METODO PARA ACTUALIZAR CONFIGURACION DE VACACIONES   **USADO
        this.router.put('/', TokenValidation, CONFIGURAR_VACACIONES_CONTROLADOR.ActualizarConfiguracion);

        // METODO PARA CONSULTAR DATOS DE CONFIGURACION DE VACACIONES    **USADO
        this.router.get('/vacaciones-configuracion', TokenValidation, CONFIGURAR_VACACIONES_CONTROLADOR.ListarConfiguraciones);

        // METODO PARA BUSCAR PERIODO DE VACACIONES   **USADO
        this.router.get('/buscar-configuracion/:id', TokenValidation, CONFIGURAR_VACACIONES_CONTROLADOR.ConsultarUnaConfiguracion);

        // METODO PARA ELIMINAR REGISTROS
        this.router.post('/eliminar-configuracion', TokenValidation, CONFIGURAR_VACACIONES_CONTROLADOR.EliminarConfiguracion);

    }
}

const CONFIGURAR_VACACIONES_RUTAS = new DepartamentoRutas();

export default CONFIGURAR_VACACIONES_RUTAS.router;