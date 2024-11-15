import { Router } from 'express';
import { TokenValidation } from '../../libs/verificarToken'
import TIMBRES_CONTROLADOR from '../../controlador/timbres/timbresControlador';

class TimbresRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA ELIMINAR NOTIFICACIONES DE AVISOS  --**VERIFICADO
        this.router.put('/eliminar-multiples/avisos', TokenValidation, TIMBRES_CONTROLADOR.EliminarMultiplesAvisos);


        // METODO PARA BUSCAR TIMBRES (ASISTENCIA)   **USADO
        this.router.post('/buscar/timbres-asistencia', TokenValidation, TIMBRES_CONTROLADOR.BuscarTimbresAsistencia);





        // METODO PARA BUSCAR MARCACIONES   **USADO
        this.router.get('/', TokenValidation, TIMBRES_CONTROLADOR.ObtenerTimbres);
        // METODO PARA BUSCAR EL TIMBRE DE EMPLEADO POR FECHA   **USADO
        this.router.get('/timbresfechaemple', TokenValidation, TIMBRES_CONTROLADOR.ObtenertimbreFechaEmple);
        // METODO PARA REGISTRAR TIMBRES PERSONALES    **USADO
        this.router.post('/', TokenValidation, TIMBRES_CONTROLADOR.CrearTimbreWeb);
        // METODO PARA REGISTRAR TIMBRE ADMINISTRADOR    **USADO
        this.router.post('/admin/', TokenValidation, TIMBRES_CONTROLADOR.CrearTimbreWebAdmin);
        // METODO PARA ACTUALIZAR EL TIMBRE DEL EMPLEADO    **USADO
        this.router.put('/timbre/editar', TokenValidation, TIMBRES_CONTROLADOR.EditarTimbreEmpleadoFecha);
        // METODO PARA BUSCAR TIMBRES - PLANIFICACION HORARIA   **USADO
        this.router.post('/buscar/timbres-planificacion', TokenValidation, TIMBRES_CONTROLADOR.BuscarTimbresPlanificacion);

        // METODO PARA REGISTRAR OPCIONES DE MARCACION   **USADO
        this.router.post('/opciones-timbre', TokenValidation, TIMBRES_CONTROLADOR.IngresarOpcionTimbre);
        // METODO PARA ACTUALIZAR OPCIONES DE MARCACION   **USADO
        this.router.put('/actualizar-opciones-timbre', TokenValidation, TIMBRES_CONTROLADOR.ActualizarOpcionTimbre);
        // METODO PARA BUSCAR OPCIONES DE MARCACION   **USADO
        this.router.post('/listar-opciones-timbre', TokenValidation, TIMBRES_CONTROLADOR.BuscarOpcionesTimbre);
        // METODO PARA BUSCAR OPCIONES DE MARCACION DE MULTIPLES USUARIOS  **USADO
        this.router.post('/listar-varias-opciones-timbre', TokenValidation, TIMBRES_CONTROLADOR.BuscarMultipleOpcionesTimbre);
        // METODO PARA ELIMINAR REGISTRO   **USADO
        this.router.post('/eliminar-opcion-marcacion', TokenValidation, TIMBRES_CONTROLADOR.EliminarRegistros);

        // METODO PARA REGISTRAR OPCIONES DE MARCACION   **USADO
        this.router.post('/opciones-timbre-web', TokenValidation, TIMBRES_CONTROLADOR.IngresarOpcionTimbreWeb);
        // METODO PARA ACTUALIZAR OPCIONES DE MARCACION   **USADO
        this.router.put('/actualizar-opciones-timbre-web', TokenValidation, TIMBRES_CONTROLADOR.ActualizarOpcionTimbreWeb);
        // METODO PARA BUSCAR OPCIONES DE MARCACION DE  USUARIOS  **USADO
        this.router.post('/listar-varias-opciones-timbre-web', TokenValidation, TIMBRES_CONTROLADOR.BuscarMultipleOpcionesTimbreWeb);
        // METODO PARA BUSCAR OPCIONES DE MARCACION DE MULTIPLES USUARIOS  **USADO
        this.router.post('/listar-varias-opciones-timbre-web-multiple', TokenValidation, TIMBRES_CONTROLADOR.BuscarMultipleOpcionesTimbreWebMultiple);
        // METODO PARA ELIMINAR REGISTRO   **USADO
        this.router.post('/eliminar-opcion-marcacion-web', TokenValidation, TIMBRES_CONTROLADOR.EliminarRegistrosWeb);


        // METODO DE BUSQUEDA DE AVISOS GENERALES
        this.router.get('/avisos-generales/:id_empleado', TokenValidation, TIMBRES_CONTROLADOR.ObtenerAvisosColaborador);
        // RUTA DE BUSQUEDA DE UNA NOTIFICACION ESPECIFICA
        this.router.get('/aviso-individual/:id', TokenValidation, TIMBRES_CONTROLADOR.ObtenerUnAviso);
        this.router.get('/noti-timbres/avisos/:id_empleado', TokenValidation, TIMBRES_CONTROLADOR.ObtenerAvisosTimbresEmpleado);
        this.router.put('/noti-timbres/vista/:id_noti_timbre', TokenValidation, TIMBRES_CONTROLADOR.ActualizarVista);
        // METODO PARA BUSCAR TIMBRES DEL USUARIO   **USADO
        this.router.get('/ver/timbres/:id', TokenValidation, TIMBRES_CONTROLADOR.ObtenerTimbresEmpleado);
        //------------------------ METODOS PARA APP MOVIL ---------------------------------------------------------------
        this.router.post('/timbre', TokenValidation, TIMBRES_CONTROLADOR.crearTimbre);
        this.router.post('/timbreSinConexion', TokenValidation, TIMBRES_CONTROLADOR.crearTimbreDesconectado);
        this.router.post('/timbre/admin', TokenValidation, TIMBRES_CONTROLADOR.crearTimbreJustificadoAdmin);
        this.router.post('/filtroTimbre', TokenValidation, TIMBRES_CONTROLADOR.FiltrarTimbre);
        this.router.get('/timbreEmpleado/:idUsuario', TokenValidation, TIMBRES_CONTROLADOR.getTimbreByCodigo);
    }
}

const TIMBRES_RUTAS = new TimbresRutas();

export default TIMBRES_RUTAS.router;