// SECCION DE LIBRERIAS
import EMPLEADO_CONTROLADOR from '../../../controlador/empleado/empleadoRegistro/empleadoControlador';
import { ObtenerRutaLeerPlantillas } from '../../../libs/accesoCarpetas';
import { TokenValidation } from '../../../libs/verificarToken';
import { Router } from 'express';
import multer from 'multer';


/** ************************************************************************************** **
 ** **                   METODO PARA OBTENER CARPETA DE PLANTILLAS                         **   
 ** ************************************************************************************** **/

const storage_plantilla = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, ObtenerRutaLeerPlantillas())
    },
    filename: function (req, file, cb) {
        let documento = file.originalname;

        cb(null, documento);
    }
})

const upload_plantilla = multer({ storage: storage_plantilla });


class EmpleadoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        /** ** ********************************************************************************************** **
         ** ** **                         MANEJO DE CODIGOS DE USUARIOS                                    ** **
         ** ** ********************************************************************************************** **/

        // METODO DE BUSQUEDA DE CONFIGURACION DE CODIGO DE USUARIOS   **USADO
        this.router.get('/encontrarDato/codigo', TokenValidation, EMPLEADO_CONTROLADOR.ObtenerCodigo);
        // METODO PARA REGISTRAR CODIGO DE USUARIO    **USADO
        this.router.post('/crearCodigo', TokenValidation, EMPLEADO_CONTROLADOR.CrearCodigo);
        // METODO DE BUSQUEDA DEL ULTIMO CODIGO DE EMPLEADO REGISTRADO EN EL SISTEMA   **USADO
        this.router.get('/encontrarDato/codigo/empleado', TokenValidation, EMPLEADO_CONTROLADOR.ObtenerMAXCodigo);
        // METODO PARA ACTUALIZAR CODIGO VALOR TOTAL   **USADO
        this.router.put('/cambiarValores', TokenValidation, EMPLEADO_CONTROLADOR.ActualizarCodigoTotal);
        // METODO DE ACTUALIZACION DE CODIGO   **USADO
        this.router.put('/cambiarCodigo', TokenValidation, EMPLEADO_CONTROLADOR.ActualizarCodigo);


        /** **************************************************************************************** **
         ** **                            MANEJO DE DATOS DE EMPLEADOS                            ** ** 
         ** **************************************************************************************** **/

        // LISTAR DATOS DE UN USUARIO  **USANDO
        this.router.get('/:id', TokenValidation, EMPLEADO_CONTROLADOR.BuscarEmpleado);
        // LISTAR EMPLEADOS REGISTRADOS
        this.router.get('/buscador/empleado', TokenValidation, EMPLEADO_CONTROLADOR.ListarBusquedaEmpleados);
        // REGISTRO DE EMPLEADOS   **USADO
        this.router.post('/', TokenValidation, EMPLEADO_CONTROLADOR.InsertarEmpleado);
        // EDICION DE EMPLEADOS   **USUARIO
        this.router.put('/:id/usuario', TokenValidation, EMPLEADO_CONTROLADOR.EditarEmpleado);
        // METODO PARA LISTAR EMPLEADOS ACTIVOS   **USADO
        this.router.get('/', TokenValidation, EMPLEADO_CONTROLADOR.Listar);
        // METODO PARA LISTAR EMPLEADOS INACTIVOS   **USADO
        this.router.get('/desactivados/empleados', TokenValidation, EMPLEADO_CONTROLADOR.ListarEmpleadosDesactivados);
        // METODO PARA DESACTIVAR EMPLEADOS    **USADO
        this.router.put('/desactivar/masivo', TokenValidation, EMPLEADO_CONTROLADOR.DesactivarMultiplesEmpleados);
        // METODO PARA ACTIVAR EMPLEADOS   **USADO
        this.router.put('/activar/masivo', TokenValidation, EMPLEADO_CONTROLADOR.ActivarMultiplesEmpleados);
        // METODO PARA CARGAR IMAGEN DEL USUARIO   **USADO
        this.router.put('/:id_empleado/uploadImage', [TokenValidation, upload_plantilla.single('image')], EMPLEADO_CONTROLADOR.CrearImagenEmpleado);
        // METODO PARA ACTUALIZAR UBICACION DE DOMICILIO   **USADO
        this.router.put('/geolocalizacion/:id', TokenValidation, EMPLEADO_CONTROLADOR.GeolocalizacionCrokis);
        // METODO PARA ELIMINAR EMPLEADOS   **USADO
        this.router.delete('/eliminar', TokenValidation, EMPLEADO_CONTROLADOR.EliminarEmpleado);




        /** **************************************************************************************** **
         ** **                       MANEJO DE DATOS DE TITULO PROFESIONAL                        ** ** 
         ** **************************************************************************************** **/

        // METODO PARA BUSCAR TITULO DEL USUARIO   **USADO
        this.router.get('/emplTitulos/:id_empleado', TokenValidation, EMPLEADO_CONTROLADOR.ObtenerTitulosEmpleado);
        // METODO PARA REGISTRAR TITULO PROFESIONAL   **USADO
        this.router.post('/emplTitulos/', TokenValidation, EMPLEADO_CONTROLADOR.CrearEmpleadoTitulos);
        // METODO PARA BUSCAR TITULO ESPECIFICO DEL EMPLEADO   **USADO
        this.router.post('/emplTitulos/usuario', TokenValidation, EMPLEADO_CONTROLADOR.ObtenerTituloEspecifico);
        // METODO PARA ACTUALIZAR REGISTRO   **USADO
        this.router.put('/:id_empleado_titulo/titulo', TokenValidation, EMPLEADO_CONTROLADOR.EditarTituloEmpleado);
        // METODO PARA ELIMINAR TITULO   **USADO
        this.router.delete('/eliminar/titulo/:id_empleado_titulo', TokenValidation, EMPLEADO_CONTROLADOR.EliminarTituloEmpleado);


        /** ********************************************************************************************* **
         ** **               CONSULTAS DE GEOLOCALIZACION DEL USUARIO                                  ** ** 
         ** ********************************************************************************************* **/

        // METODO PARA CONSULTAR COORDENADAS DEL DOMICILIO DEL USUARIO    **USADO
        this.router.get('/ubicacion/:id', TokenValidation, EMPLEADO_CONTROLADOR.BuscarCoordenadas);
        this.router.post('/buscar/informacion', TokenValidation, EMPLEADO_CONTROLADOR.BuscarEmpleadoNombre);


        // INFORMACION DE LA IMAGEN
        this.router.get('/img/:id/:imagen', EMPLEADO_CONTROLADOR.BuscarImagen);

        // INFORMACION DE LA IMAGEN FORMATO CODIFICADO **USADO
        this.router.get('/img/codificado/:id/:imagen', EMPLEADO_CONTROLADOR.CodificarImagenBase64);

        // RUTAS DE ACCESO A LA CARGA DE DATOS DE FORMA AUTOMATICA     **USADO
        this.router.post('/verificar/automatico/plantillaExcel/', [TokenValidation, upload_plantilla.single('uploads')], EMPLEADO_CONTROLADOR.VerificarPlantilla_Automatica);
        // METODO PARA REGISTRAR DATOS DE PLANTILLA CODIGO AUTOMATICO   **USADO
        this.router.post('/cargar_automatico/plantillaExcel/', TokenValidation, EMPLEADO_CONTROLADOR.CargarPlantilla_Automatico);

        // RUTAS DE ACCESO A LA CARGA DE DATOS DE FORMA MANUAL   **USADO
        this.router.post('/verificar/manual/plantillaExcel/', [TokenValidation, upload_plantilla.single('uploads')], EMPLEADO_CONTROLADOR.VerificarPlantilla_Manual);
        // METODO PARA REGISTRAR DATOS DE LA PLANTILLA CODIGO MANUAL   **USADO
        this.router.post('/cargar_manual/plantillaExcel/', TokenValidation, EMPLEADO_CONTROLADOR.CargarPlantilla_Manual);


        /** **************************************************************************************** **
         ** **                CREACION DE CARPETAS DE LOS EMPLEADOS SELECCIONADOS                 ** ** 
         ** **************************************************************************************** **/
        // METODO PARA CREAR CARPETAS DE ALMACENAMIENTO    **USADO
        this.router.post('/crear_carpetas/', TokenValidation, EMPLEADO_CONTROLADOR.CrearCarpetasEmpleado);

        //--------------------------------------------------------------- METODO APP MOVIL -------------------------------------------------------------------
        this.router.get('/horarios/horariosEmpleado', TokenValidation, EMPLEADO_CONTROLADOR.getHorariosEmpleadoByCodigo);
        this.router.get('/todosempleados/lista', TokenValidation, EMPLEADO_CONTROLADOR.getListaEmpleados);
        this.router.get('/horariosempleado/planificacionHorarioEmplCodigo',TokenValidation, EMPLEADO_CONTROLADOR.getPlanificacionMesesCodigoEmple);
    
        this.router.post('/infoContratoCargos/', TokenValidation, EMPLEADO_CONTROLADOR.getContratosCargos)
    
    }        


}

const EMPLEADO_RUTAS = new EmpleadoRutas();

export default EMPLEADO_RUTAS.router;