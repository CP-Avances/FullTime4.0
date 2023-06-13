import { Router } from 'express';
import DETALLE_CATALOGO_HORARIO_CONTROLADOR from '../../../controlador/horarios/detalleCatHorario/detalleCatHorarioControlador';
import { TokenValidation } from '../../../libs/verificarToken'
const multipart = require('connect-multiparty');

const multipartMiddleware = multipart({
    uploadDir: './plantillas',
});

class PermisosRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // METODO PARA BUSCAR DETALLES DE UN HORARIO  --**VERIFICADO
        this.router.get('/:id_horario', TokenValidation, DETALLE_CATALOGO_HORARIO_CONTROLADOR.ListarUnDetalleHorario);
        // METODO PARA ELIMINAR REGISTRO
        this.router.delete('/eliminar/:id', TokenValidation, DETALLE_CATALOGO_HORARIO_CONTROLADOR.EliminarRegistros);
        // METODO PARA REGISTRAR DETALLES
        this.router.post('/', TokenValidation, DETALLE_CATALOGO_HORARIO_CONTROLADOR.CrearDetalleHorarios);
        // METODO PARA ACTUALIZAR REGISTRO
        this.router.put('/', TokenValidation, DETALLE_CATALOGO_HORARIO_CONTROLADOR.ActualizarDetalleHorarios);




        // VERIFICAR LOS DATOS DE LA PLANTILLA DE DETALLES DE HORARIO Y SUBIRLOS AL SISTEMA
        this.router.post('/verificarDatos/upload', [TokenValidation, multipartMiddleware], DETALLE_CATALOGO_HORARIO_CONTROLADOR.VerificarDatosDetalles);
        this.router.post('/upload', [TokenValidation, multipartMiddleware], DETALLE_CATALOGO_HORARIO_CONTROLADOR.CrearDetallePlantilla);
    }
}

const DETALLE_CATALOGO_HORARIO_RUTAS = new PermisosRutas();

export default DETALLE_CATALOGO_HORARIO_RUTAS.router;