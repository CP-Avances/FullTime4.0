import TIPO_COMIDAS_CONTROLADOR from '../../../controlador/modulos/alimentacion/catTipoComidasControlador';
import { TokenValidation } from '../../../libs/verificarToken';
import { Router } from 'express';

class TipoComidasRuta {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, TIPO_COMIDAS_CONTROLADOR.ListarTipoComidas);
        // METODO PARA LISTAR TIPOS DE COMIDAS Y SU DETALLE      **USADO
        this.router.get('/listar-detalle', TokenValidation, TIPO_COMIDAS_CONTROLADOR.ListarDetallesComida);
        this.router.get('/:id', TokenValidation, TIPO_COMIDAS_CONTROLADOR.ListarUnTipoComida);
        this.router.get('/buscar/menu/:id', TokenValidation, TIPO_COMIDAS_CONTROLADOR.VerUnMenu);
        this.router.post('/', TokenValidation, TIPO_COMIDAS_CONTROLADOR.CrearTipoComidas);
        this.router.put('/', TokenValidation, TIPO_COMIDAS_CONTROLADOR.ActualizarComida);
        this.router.delete('/eliminar/:id', TokenValidation, TIPO_COMIDAS_CONTROLADOR.EliminarRegistros);
        // this.router.get('/registro/ultimo', TokenValidation, TIPO_COMIDAS_CONTROLADOR.VerUltimoRegistro);

        // Consultar datos de tabla detalle_comida
        this.router.post('/detalle/menu', TokenValidation, TIPO_COMIDAS_CONTROLADOR.CrearDetalleMenu);
        this.router.get('/detalle/menu/:id', TokenValidation, TIPO_COMIDAS_CONTROLADOR.VerUnDetalleMenu);
        this.router.put('/detalle/menu', TokenValidation, TIPO_COMIDAS_CONTROLADOR.ActualizarDetalleMenu);
        this.router.delete('/detalle/menu/eliminar/:id', TokenValidation, TIPO_COMIDAS_CONTROLADOR.EliminarDetalle);

    }
}

const TIPO_COMIDAS_RUTA = new TipoComidasRuta();

export default TIPO_COMIDAS_RUTA.router;