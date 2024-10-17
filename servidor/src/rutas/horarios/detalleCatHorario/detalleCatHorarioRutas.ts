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
        // METODO PARA BUSCAR DETALLES DE UN HORARIO  **USADO
        this.router.get('/:id_horario', TokenValidation, DETALLE_CATALOGO_HORARIO_CONTROLADOR.ListarUnDetalleHorario);
        this.router.post('/todos_horario', TokenValidation, DETALLE_CATALOGO_HORARIO_CONTROLADOR.ListarUnDetalleTodosHorarios);

        // METODO PARA BUSCAR DETALLES DE VARIOS HORARIOS    **USADO
        this.router.post('/lista', TokenValidation, DETALLE_CATALOGO_HORARIO_CONTROLADOR.ListarDetalleHorarios);
        // METODO PARA ELIMINAR REGISTRO   **USADO
        this.router.delete('/eliminar/:id', TokenValidation, DETALLE_CATALOGO_HORARIO_CONTROLADOR.EliminarRegistros);
        // METODO PARA REGISTRAR DETALLES   **USADO
        this.router.post('/', TokenValidation, DETALLE_CATALOGO_HORARIO_CONTROLADOR.CrearDetalleHorarios);
        // METODO PARA ACTUALIZAR REGISTRO    **USADO
        this.router.put('/', TokenValidation, DETALLE_CATALOGO_HORARIO_CONTROLADOR.ActualizarDetalleHorarios);

    }
}

const DETALLE_CATALOGO_HORARIO_RUTAS = new PermisosRutas();

export default DETALLE_CATALOGO_HORARIO_RUTAS.router;