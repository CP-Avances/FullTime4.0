import { Router } from 'express';
import { upload } from '../../middlewares/uploadMiddleware';
import { TokenValidation } from '../../libs/verificarToken';
import TIMBRES_CONTROLADOR from '../../controlador/timbres/timbresControlador';

class TimbresRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA BUSCAR MARCACIONES   **USADO
        this.router.get('/', TokenValidation, TIMBRES_CONTROLADOR.ObtenerTimbres);
        // METODO PARA REGISTRAR TIMBRES PERSONALES    **USADO
        this.router.post('/', TokenValidation, TIMBRES_CONTROLADOR.CrearTimbreWeb);
        // METODO PARA REGISTRAR TIMBRE ADMINISTRADOR    **USADO
        this.router.post('/admin/', TokenValidation, TIMBRES_CONTROLADOR.CrearTimbreWebAdmin);
        // METODO PARA BUSCAR EL TIMBRE DE EMPLEADO POR FECHA   **USADO
        this.router.get('/timbresfechaemple', TokenValidation, TIMBRES_CONTROLADOR.ObtenertimbreFechaEmple);
        // METODO PARA ACTUALIZAR EL TIMBRE DEL EMPLEADO    **USADO
        this.router.put('/timbre/editar', TokenValidation, TIMBRES_CONTROLADOR.EditarTimbreEmpleadoFecha);
        // METODO PARA BUSCAR TIMBRES (ASISTENCIA)   **USADO
        this.router.post('/buscar/timbres-asistencia', TokenValidation, TIMBRES_CONTROLADOR.BuscarTimbresAsistencia);
        // METODO PARA BUSCAR TIMBRES - PLANIFICACION HORARIA   **USADO
        this.router.post('/buscar/timbres-planificacion', TokenValidation, TIMBRES_CONTROLADOR.BuscarTimbresPlanificacion);
        // METODO PARA BUSCAR TIMBRES DEL USUARIO   **USADO
        this.router.get('/ver/timbres/:id', TokenValidation, TIMBRES_CONTROLADOR.ObtenerTimbresEmpleado);


        /** ********************************************************************************** **
         ** **                 CONSULTAS DE OPCIONES DE MARCACIONES                         ** **
         ** ********************************************************************************** **/
        // METODO PARA BUSCAR OPCIONES DE MARCACION   **USADO
        this.router.post('/listar-opciones-timbre', TokenValidation, TIMBRES_CONTROLADOR.BuscarOpcionesTimbre);
        // METODO PARA BUSCAR OPCIONES DE MARCACION DE MULTIPLES USUARIOS  **USADO
        this.router.post('/listar-varias-opciones-timbre', TokenValidation, TIMBRES_CONTROLADOR.BuscarMultipleOpcionesTimbre);
        // METODO PARA REGISTRAR OPCIONES DE MARCACION   **USADO
        this.router.post('/opciones-timbre', TokenValidation, TIMBRES_CONTROLADOR.IngresarOpcionTimbre);
        // METODO PARA ACTUALIZAR OPCIONES DE MARCACION   **USADO
        this.router.put('/actualizar-opciones-timbre', TokenValidation, TIMBRES_CONTROLADOR.ActualizarOpcionTimbre);
        // METODO PARA ELIMINAR REGISTRO   **USADO
        this.router.delete('/eliminar-opcion-marcacion', TokenValidation, TIMBRES_CONTROLADOR.EliminarRegistros);


        /** ********************************************************************************** **
         ** **                 CONSULTAS DE OPCIONES DE MARCACIONES                         ** **
         ** ********************************************************************************** **/
        // METODO PARA BUSCAR OPCIONES DE MARCACION DE  USUARIOS  **USADO
        this.router.post('/listar-varias-opciones-timbre-web', TokenValidation, TIMBRES_CONTROLADOR.BuscarMultipleOpcionesTimbreWeb);
        // METODO PARA BUSCAR OPCIONES DE MARCACION DE MULTIPLES USUARIOS  **USADO
        this.router.post('/listar-varias-opciones-timbre-web-multiple', TokenValidation, TIMBRES_CONTROLADOR.BuscarMultipleOpcionesTimbreWebMultiple);
        // METODO PARA REGISTRAR OPCIONES DE MARCACION   **USADO
        this.router.post('/opciones-timbre-web', TokenValidation, TIMBRES_CONTROLADOR.IngresarOpcionTimbreWeb);
        // METODO PARA ACTUALIZAR OPCIONES DE MARCACION   **USADO
        this.router.put('/actualizar-opciones-timbre-web', TokenValidation, TIMBRES_CONTROLADOR.ActualizarOpcionTimbreWeb);
        // METODO PARA ELIMINAR REGISTRO   **USADO
        this.router.delete('/eliminar-opcion-marcacion-web', TokenValidation, TIMBRES_CONTROLADOR.EliminarRegistrosWeb);


        /** ********************************************************************************** **
         ** **              TRATAMIENTO DE AVISOS QUE EMITE EL SISTEMA                      ** **
         ** ********************************************************************************** **/
        // RUTA DE BUSQUEDA DE UNA NOTIFICACION ESPECIFICA    **USADO
        this.router.get('/aviso-individual/:id', TokenValidation, TIMBRES_CONTROLADOR.ObtenerUnAviso);
        // METODO UTILIZADO PARA ACTUALIZAR ESTADO DE LA NOTIFICACION   ** USADO
        this.router.put('/noti-timbres/vista/:id_noti_timbre', TokenValidation, TIMBRES_CONTROLADOR.ActualizarVista);
        // LISTA DE AVISOS    **USADO
        this.router.get('/noti-timbres/avisos/:id_empleado', TokenValidation, TIMBRES_CONTROLADOR.ObtenerAvisosTimbresEmpleado);
        // METODO PARA ELIMINAR NOTIFICACIONES DE AVISOS    **USADO
        this.router.put('/eliminar-multiples/avisos', TokenValidation, TIMBRES_CONTROLADOR.EliminarMultiplesAvisos);



        /** *************************************************************************************************************** **
         ** **                 M E T O D O S    U S A D O S     E N    L A    A P L I C A C I O N    M O V I L           ** **
         ** *************************************************************************************************************** **/
        this.router.post('/timbre', TokenValidation, upload.single("imagen"), TIMBRES_CONTROLADOR.crearTimbre);
        this.router.post('/timbreSinConexion', TokenValidation, upload.single("imagen"), TIMBRES_CONTROLADOR.crearTimbreDesconectado);
        this.router.post('/timbre/admin', TokenValidation, TIMBRES_CONTROLADOR.crearTimbreJustificadoAdmin);
        this.router.post('/filtroTimbre', TokenValidation, TIMBRES_CONTROLADOR.FiltrarTimbre);
        this.router.get('/timbreEmpleado/:idUsuario', TokenValidation, TIMBRES_CONTROLADOR.getTimbreByCodigo);









        // METODO DE BUSQUEDA DE AVISOS GENERALES
        this.router.get('/avisos-generales/:id_empleado', TokenValidation, TIMBRES_CONTROLADOR.ObtenerAvisosColaborador);


    }
}

const TIMBRES_RUTAS = new TimbresRutas();

export default TIMBRES_RUTAS.router;