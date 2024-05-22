import { Router } from 'express';
import ACCION_PERSONAL_CONTROLADOR from '../../controlador/accionPersonal/accionPersonalControlador';
import { TokenValidation } from '../../libs/verificarToken'
import { ModuloAccionesPersonalValidation } from '../../libs/Modulos/verificarAccionesPersonal';

class DepartamentoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        /** TABLA TIPO_ACCION_PERSONAL */
        this.router.get('/', TokenValidation, ACCION_PERSONAL_CONTROLADOR.ListarTipoAccionPersonal);
        this.router.post('/', TokenValidation, ACCION_PERSONAL_CONTROLADOR.CrearTipoAccionPersonal);
        this.router.get('/tipo/accion/:id', TokenValidation, ACCION_PERSONAL_CONTROLADOR.EncontrarTipoAccionPersonalId);
        this.router.put('/', TokenValidation, ACCION_PERSONAL_CONTROLADOR.ActualizarTipoAccionPersonal);
        this.router.delete('/eliminar/:id', TokenValidation, ACCION_PERSONAL_CONTROLADOR.EliminarTipoAccionPersonal);
        this.router.get('/editar/accion/tipo/:id', TokenValidation, ACCION_PERSONAL_CONTROLADOR.ListarTipoAccionEdicion);

        /** TABLA TIPO_ACCION */
        this.router.get('/accion/tipo', TokenValidation, ACCION_PERSONAL_CONTROLADOR.ListarTipoAccion);
        this.router.post('/accion/tipo', TokenValidation, ACCION_PERSONAL_CONTROLADOR.CrearTipoAccion);
        this.router.get('/ultimo/accion/tipo', TokenValidation, ACCION_PERSONAL_CONTROLADOR.EncontrarUltimoTipoAccion);

        /** TABLA CARGO_PROPUESTO */
        this.router.get('/cargo', TokenValidation, ACCION_PERSONAL_CONTROLADOR.ListarCargoPropuestos);
        this.router.post('/cargo', TokenValidation, ACCION_PERSONAL_CONTROLADOR.CrearCargoPropuesto);
        this.router.get('/tipo/cargo', TokenValidation, ACCION_PERSONAL_CONTROLADOR.EncontrarUltimoCargoP);
        this.router.get('/cargo/:id', TokenValidation, ACCION_PERSONAL_CONTROLADOR.ListarUnCargoPropuestos);

        /** TABLA CONTEXTO LEGAL */
        this.router.get('/decreto', TokenValidation, ACCION_PERSONAL_CONTROLADOR.ListarDecretos);
        this.router.get('/decreto/:id', TokenValidation, ACCION_PERSONAL_CONTROLADOR.ListarUnDecreto);
        this.router.post('/decreto', TokenValidation, ACCION_PERSONAL_CONTROLADOR.CrearDecreto);
        this.router.get('/tipo/decreto', TokenValidation, ACCION_PERSONAL_CONTROLADOR.EncontrarUltimoDecreto);

        /** TABLA PEDIDO_ACCION_EMPLEADO */
        this.router.post('/pedido/accion', TokenValidation, ACCION_PERSONAL_CONTROLADOR.CrearPedidoAccionPersonal);
        this.router.put('/pedido/accion/editar', TokenValidation, ACCION_PERSONAL_CONTROLADOR.ActualizarPedidoAccionPersonal);

        // VER LOGO DE MINISTERIO TRABAJO
        this.router.get('/logo/ministerio/codificado', TokenValidation, ACCION_PERSONAL_CONTROLADOR.verLogoMinisterio);

        // CONSULTAS PEDIDOS ACCIONES DE PERSONAL
        this.router.get('/pedidos/accion', TokenValidation, ACCION_PERSONAL_CONTROLADOR.ListarPedidoAccion);
        this.router.get('/pedidos/datos/:id', TokenValidation, ACCION_PERSONAL_CONTROLADOR.EncontrarDatosEmpleados);
        this.router.get('/pedidos/ciudad/:id', TokenValidation, ACCION_PERSONAL_CONTROLADOR.EncontrarDatosCiudades);
        this.router.get('/pedido/informacion/:id', TokenValidation, ACCION_PERSONAL_CONTROLADOR.EncontrarPedidoAccion);
        this.router.get('/lista/procesos/:id', TokenValidation, ACCION_PERSONAL_CONTROLADOR.EncontrarProcesosRecursivos);

    }
}

const ACCION_PERSONAL_RUTAS = new DepartamentoRutas();

export default ACCION_PERSONAL_RUTAS.router;