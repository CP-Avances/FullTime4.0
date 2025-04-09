import { TokenValidation } from '../../../libs/verificarToken';
import { Router } from 'express';

import NACIONALIDAD_CONTROLADOR from '../../../controlador/empleado/empleadoRegistro/nacionalidadControlador';

class NacionalidadRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // METODO PARA LISTAR NACIONALIDADES   **USADO
        this.router.get('/', TokenValidation, NACIONALIDAD_CONTROLADOR.ListarNacionalidades);
    
          // METODO PARA BUSCAR GENERO   **USADO
          this.router.get('/buscar/:nacionalidad', TokenValidation, NACIONALIDAD_CONTROLADOR.ObtenerNacionalidad);
          // METODO PARA CREAR GENERO   **USADO
          this.router.post('/', TokenValidation, NACIONALIDAD_CONTROLADOR.CrearNacionalidad);
          // METODO PARA EDITAR GENERO   **USADO
          this.router.put('/', TokenValidation, NACIONALIDAD_CONTROLADOR.ActualizarNacionalidad);
          // METODO PARA ELIMINAR REGISTROS   **USADO
          this.router.delete('/eliminar/:id', TokenValidation, NACIONALIDAD_CONTROLADOR.EliminarNacionalidad);
        
    }
}

const nacionalidadRutas = new NacionalidadRutas();

export default nacionalidadRutas.router;