import DISCPACIDAD_CONTROLADOR from '../../controlador/catalogos/catDiscapacidadControlador';
import { TokenValidation } from '../../libs/verificarToken';
import { Router } from 'express';

class DiscapacidadRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // METODO PARA LISTAR TIPOS DE DISCAPACIDAD
        this.router.get('/', TokenValidation, DISCPACIDAD_CONTROLADOR.ListarDiscapacidad);
        // METODO PARA REGISTRAR UN TIPO DE DISCAPACIDDA
        this.router.post('/crearDiscapacidad', TokenValidation, DISCPACIDAD_CONTROLADOR.CrearDiscapacidad);
        // METODO PARA EDITAR UN TIPO DE DISCAPACIDAD
        this.router.put('/', TokenValidation, DISCPACIDAD_CONTROLADOR.EditarDiscapacidad);
        // METODO PARA ELIMINAR UN TIPO DE DISCAPACIDAD
        this.router.delete('/eliminar/:id', TokenValidation, DISCPACIDAD_CONTROLADOR.eliminarRegistro);
    }
}

const DISCAPACIDADES_RUTAS = new DiscapacidadRutas();

export default DISCAPACIDADES_RUTAS.router;