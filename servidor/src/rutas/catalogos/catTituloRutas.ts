import { Router } from 'express';
import TITULO_CONTROLADOR from '../../controlador/catalogos/catTituloControlador';
import { TokenValidation } from '../../libs/verificarToken';

class TituloRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA LISTAR TITULOS
        this.router.get('/', TokenValidation, TITULO_CONTROLADOR.ListarTitulos);
        // METODO PARA ELIMINAR REGISTRO
        this.router.delete('/eliminar/:id', TokenValidation, TITULO_CONTROLADOR.EliminarRegistros);
        // METODO PARA CREAR ARCHIVO XML
        this.router.post('/xmlDownload/', TokenValidation, TITULO_CONTROLADOR.FileXML);
        // METODO PARA DESCARGAR ARCHIVO XML
        this.router.get('/download/:nameXML', TITULO_CONTROLADOR.downloadXML);
        // METODO PARA ACTUALIZAR REGISTRO DE TITULO
        this.router.put('/', TokenValidation, TITULO_CONTROLADOR.ActualizarTitulo);


        this.router.get('/:id', TokenValidation, TITULO_CONTROLADOR.getOne);
        this.router.post('/', TokenValidation, TITULO_CONTROLADOR.create);



    }
}

const TITULO_RUTAS = new TituloRutas();

export default TITULO_RUTAS.router;