import { Router } from 'express';
import NIVEL_TITULO_CONTROLADOR from '../../controlador/nivelTitulo/nivelTituloControlador';
import { TokenValidation } from '../../libs/verificarToken'

class NivelTituloRutas {
    public router: Router = Router();

    constructor() {

        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA BUSCAR LISTA DE NIVELES DE TITULO
        this.router.get('/', TokenValidation, NIVEL_TITULO_CONTROLADOR.ListarNivel);
        // METODO PARA ELIMINAR REGISTROS
        this.router.delete('/eliminar/:id', TokenValidation, NIVEL_TITULO_CONTROLADOR.EliminarNivelTitulo);
        // METODO PARA REGISTRAR NIVEL DE TITULO
        this.router.post('/', TokenValidation, NIVEL_TITULO_CONTROLADOR.CrearNivel);
        // METODO PARA ACTUALIZAR REGISTRO DE NIVEL
        this.router.put('/', TokenValidation, NIVEL_TITULO_CONTROLADOR.ActualizarNivelTitulo);
        // METODO PARA BUSCAR NIVEL POR SU NOMBRE
        this.router.get('/buscar/:nombre', TokenValidation, NIVEL_TITULO_CONTROLADOR.ObtenerNivelNombre);



        this.router.get('/:id', TokenValidation, NIVEL_TITULO_CONTROLADOR.getOne);





    }
}

const NIVEL_TITULO_RUTAS = new NivelTituloRutas();

export default NIVEL_TITULO_RUTAS.router;