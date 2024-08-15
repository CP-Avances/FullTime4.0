import { Router } from 'express';
import { TokenValidation } from '../../../libs/verificarToken';
import DISCAPACIDAD_CONTROLADOR from '../../../controlador/empleado/empleadoDiscapacidad/discapacidadControlador';

class DiscapacidadRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA BUSCAR DATOS DISCAPACIDAD USUARIO   **USADO
        this.router.get('/:id_empleado', TokenValidation, DISCAPACIDAD_CONTROLADOR.BuscarDiscapacidadUsuario);
        // METODO PARA REGISTRAR DISCAPACIDAD    **USADO
        this.router.post('/', TokenValidation, DISCAPACIDAD_CONTROLADOR.RegistrarDiscapacidad);
        // METODO PARA ACTUALIZAR DATOS DISCAPACIDAD   **USADO
        this.router.put('/:id_empleado', TokenValidation, DISCAPACIDAD_CONTROLADOR.ActualizarDiscapacidad);
        // METODO PARA ELIMINAR REGISTRO   **USADO
        this.router.delete('/eliminar/:id_empleado', TokenValidation, DISCAPACIDAD_CONTROLADOR.EliminarDiscapacidad);


        /** *************************************************************************************** **
         ** **                METODO PARA MANEJO DE DATOS DE TIPO DISCAPACIDAD                   ** ** 
         ** *************************************************************************************** **/

        // METODO PARA REGISTRAR TIPO DE DISCAPACIDAD
        this.router.post('/buscarTipo', TokenValidation, DISCAPACIDAD_CONTROLADOR.RegistrarTipo);
        // METODO PARA BUSCAR LISTA DE TIPOS DE DISCAPACIDAD   **USADO
        this.router.get('/buscarTipo/tipo', TokenValidation, DISCAPACIDAD_CONTROLADOR.ListarTipo);
        // METODO PARA BUSCAR DISCAPACIDAD POR SU NOMBRE   **USADO
        this.router.post('/buscarTipo/nombre', TokenValidation, DISCAPACIDAD_CONTROLADOR.BuscarDiscapacidadNombre);
        this.router.get('/', TokenValidation, DISCAPACIDAD_CONTROLADOR.list);
        
    }
}

const DISCAPACIDAD_RUTAS = new DiscapacidadRutas();

export default DISCAPACIDAD_RUTAS.router;