import TIPO_VACUNAS_CONTROLADOR from '../../controlador/catalogos/catVacunasControlador'
import { TokenValidation } from '../../libs/verificarToken';
import { Router } from 'express';

class VacunasRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // METODO PARA LISTAR TIPO VACUNAS
        this.router.get('/', TokenValidation, TIPO_VACUNAS_CONTROLADOR.ListaVacuna);
        // METODO PARA EDITAR TIPO VACUNAS
        this.router.put('/', TokenValidation, TIPO_VACUNAS_CONTROLADOR.EditarVacuna);
        // METODO PARA ELIMINAR REGISTRO
        this.router.delete('/eliminar/:id', TokenValidation, TIPO_VACUNAS_CONTROLADOR.EliminarRegistro);
    }
}

const TIPO_VACUNAS_RUTAS = new VacunasRutas();

export default TIPO_VACUNAS_RUTAS.router;