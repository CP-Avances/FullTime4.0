import { Router } from 'express';
import AUTORIZA_DEPARTAMENTO_CONTROLADOR from '../../../controlador/configuracion/localizacion/autorizaDepartamentoControlador';

class DepartamentoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO DE BUSQUEDA DE USUARIO QUE AUTORIZA   **USADO
        this.router.get('/autoriza/:id_empleado', AUTORIZA_DEPARTAMENTO_CONTROLADOR.EncontrarAutorizacionEmple);
        // METODO PARA REGISTRAR AUTORIZA
        this.router.post('/', AUTORIZA_DEPARTAMENTO_CONTROLADOR.CrearAutorizaDepartamento);
        // METODO PARA ACTUALIZAR REGISTRO
        this.router.put('/actualizar', AUTORIZA_DEPARTAMENTO_CONTROLADOR.ActualizarAutorizaDepartamento);
        // METODO PARA ELIMINAR REGISTROS    **USADO
        this.router.delete('/eliminar/:id', AUTORIZA_DEPARTAMENTO_CONTROLADOR.EliminarAutorizacionDepartamento);
        // METODO PARA LISTAR USUARIOS QUE APRUEBAN EN UN DEPARTAMENTO   **USADO
        this.router.get('/listaempleadosAutorizan/:id_depa', AUTORIZA_DEPARTAMENTO_CONTROLADOR.ObtenerListaEmpleadosAutorizan);
    }
}

const AUTORIZA_DEPARTAMENTO_RUTAS = new DepartamentoRutas();

export default AUTORIZA_DEPARTAMENTO_RUTAS.router;