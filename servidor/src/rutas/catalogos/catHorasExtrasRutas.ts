import { Router } from 'express';
import horasExtrasControlador from '../../controlador/catalogos/catHorasExtrasControlador';
import { TokenValidation } from '../../libs/verificarToken';
import { ModuloHoraExtraValidation } from '../../libs/Modulos/verificarHoraExtra'

class HorasExtrasRutas {
    public router: Router = Router();

    constructor() {

        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', [TokenValidation, ModuloHoraExtraValidation], horasExtrasControlador.ListarHorasExtras);
        this.router.get('/:id', [TokenValidation, ModuloHoraExtraValidation], horasExtrasControlador.ObtenerUnaHoraExtra);
        this.router.post('/', [TokenValidation, ModuloHoraExtraValidation], horasExtrasControlador.CrearHoraExtra);
        this.router.delete('/eliminar/:id', [TokenValidation, ModuloHoraExtraValidation], horasExtrasControlador.EliminarRegistros);
        this.router.put('/', [TokenValidation, ModuloHoraExtraValidation], horasExtrasControlador.ActualizarHoraExtra);
    }
}

const HORA_EXTRA_RUTA = new HorasExtrasRutas();

export default HORA_EXTRA_RUTA.router;