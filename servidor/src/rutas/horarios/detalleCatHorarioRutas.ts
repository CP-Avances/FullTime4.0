import DETALLE_CATALOGO_HORARIO_CONTROLADOR from '../../controlador/horarios/detalleCatHorarioControlador';
import { TokenValidation } from '../../libs/verificarToken';
import { Router } from 'express';


class PermisosRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // METODO PARA BUSCAR DETALLES DE UN HORARIO  **USADO
        this.router.get('/:id_horario', TokenValidation, DETALLE_CATALOGO_HORARIO_CONTROLADOR.ListarUnDetalleHorario);
        // METODO PARA BUSCAR DETALLES DE LOS HORARIOS EN EL ARREGLO COMO PARAMETRO   **USADO
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