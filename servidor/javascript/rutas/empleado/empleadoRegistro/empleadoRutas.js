"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// SECCION DE LIBRERIAS
const empleadoControlador_1 = __importDefault(require("../../../controlador/empleado/empleadoRegistro/empleadoControlador"));
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
const verificarToken_1 = require("../../../libs/verificarToken");
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const moment_1 = __importDefault(require("moment"));
moment_1.default.locale('es');
/** ************************************************************************************** **
 ** **                   METODO PARA OBTENER CARPETA DE PLANTILLAS                         **
 ** ************************************************************************************** **/
const storage_plantilla = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)());
    },
    filename: function (req, file, cb) {
        let documento = file.originalname;
        cb(null, documento);
    }
});
const upload_plantilla = (0, multer_1.default)({ storage: storage_plantilla });
class EmpleadoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        /** ** ********************************************************************************************** **
         ** ** **                         MANEJO DE CODIGOS DE USUARIOS                                    ** **
         ** ** ********************************************************************************************** **/
        // METODO DE BUSQUEDA DE CONFIGURACION DE CODIGO DE USUARIOS   **USADO
        this.router.get('/encontrarDato/codigo', verificarToken_1.TokenValidation, empleadoControlador_1.default.ObtenerCodigo);
        // METODO PARA REGISTRAR CODIGO DE USUARIO    **USADO
        this.router.post('/crearCodigo', verificarToken_1.TokenValidation, empleadoControlador_1.default.CrearCodigo);
        // METODO DE BUSQUEDA DEL ULTIMO CODIGO DE EMPLEADO REGISTRADO EN EL SISTEMA   **USADO
        this.router.get('/encontrarDato/codigo/empleado', verificarToken_1.TokenValidation, empleadoControlador_1.default.ObtenerMAXCodigo);
        // METODO PARA ACTUALIZAR CODIGO VALOR TOTAL   **USADO
        this.router.put('/cambiarValores', verificarToken_1.TokenValidation, empleadoControlador_1.default.ActualizarCodigoTotal);
        // METODO DE ACTUALIZACION DE CODIGO
        this.router.put('/cambiarCodigo', verificarToken_1.TokenValidation, empleadoControlador_1.default.ActualizarCodigo);
        /** **************************************************************************************** **
         ** **                            MANEJO DE DATOS DE EMPLEADOS                            ** **
         ** **************************************************************************************** **/
        // LISTAR DATOS DE UN USUARIO  **USANDO
        this.router.get('/:id', verificarToken_1.TokenValidation, empleadoControlador_1.default.BuscarEmpleado);
        // LISTAR EMPLEADOS REGISTRADOS
        this.router.get('/buscador/empleado', verificarToken_1.TokenValidation, empleadoControlador_1.default.ListarBusquedaEmpleados);
        // REGISTRO DE EMPLEADOS
        this.router.post('/', verificarToken_1.TokenValidation, empleadoControlador_1.default.InsertarEmpleado);
        // EDICION DE EMPLEADOS
        this.router.put('/:id/usuario', verificarToken_1.TokenValidation, empleadoControlador_1.default.EditarEmpleado);
        // METODO PARA LISTAR EMPLEADOS ACTIVOS
        this.router.get('/', verificarToken_1.TokenValidation, empleadoControlador_1.default.Listar);
        // METODO PARA LISTAR EMPLEADOS INACTIVOS
        this.router.get('/desactivados/empleados', verificarToken_1.TokenValidation, empleadoControlador_1.default.ListarEmpleadosDesactivados);
        // METODO PARA DESACTIVAR EMPLEADOS
        this.router.put('/desactivar/masivo', verificarToken_1.TokenValidation, empleadoControlador_1.default.DesactivarMultiplesEmpleados);
        // METODO PARA ACTIVAR EMPLEADOS
        this.router.put('/activar/masivo', verificarToken_1.TokenValidation, empleadoControlador_1.default.ActivarMultiplesEmpleados);
        // METODO PARA REACTIVAR EMPLEADOS
        this.router.put('/re-activar/masivo', verificarToken_1.TokenValidation, empleadoControlador_1.default.ReactivarMultiplesEmpleados);
        // METODO PARA CARGAR IMAGEN DEL USUARIO   **USADO
        this.router.put('/:id_empleado/uploadImage', [verificarToken_1.TokenValidation, upload_plantilla.single('image')], empleadoControlador_1.default.CrearImagenEmpleado);
        // METODO PARA ACTUALIZAR UBICACION DE DOMICILIO   **USADO
        this.router.put('/geolocalizacion/:id', verificarToken_1.TokenValidation, empleadoControlador_1.default.GeolocalizacionCrokis);
        // METODO PARA ELIMINAR EMPLEADOS
        this.router.delete('/eliminar', verificarToken_1.TokenValidation, empleadoControlador_1.default.EliminarEmpleado);
        /** **************************************************************************************** **
         ** **                       MANEJO DE DATOS DE TITULO PROFESIONAL                        ** **
         ** **************************************************************************************** **/
        // METODO PARA BUSCAR TITULO DEL USUARIO   **USADO
        this.router.get('/emplTitulos/:id_empleado', verificarToken_1.TokenValidation, empleadoControlador_1.default.ObtenerTitulosEmpleado);
        // METODO PARA REGISTRAR TITULO PROFESIONAL
        this.router.post('/emplTitulos/', verificarToken_1.TokenValidation, empleadoControlador_1.default.CrearEmpleadoTitulos);
        // METODO PARA BUSCAR TITULO ESPECIFICO DEL EMPLEADO
        this.router.post('/emplTitulos/usuario', verificarToken_1.TokenValidation, empleadoControlador_1.default.ObtenerTituloEspecifico);
        // METODO PARA ACTUALIZAR REGISTRO
        this.router.put('/:id_empleado_titulo/titulo', verificarToken_1.TokenValidation, empleadoControlador_1.default.EditarTituloEmpleado);
        // METODO PARA ELIMINAR TITULO   **USADO
        this.router.delete('/eliminar/titulo/:id_empleado_titulo', verificarToken_1.TokenValidation, empleadoControlador_1.default.EliminarTituloEmpleado);
        /** ********************************************************************************************* **
         ** **               CONSULTAS DE GEOLOCALIZACION DEL USUARIO                                  ** **
         ** ********************************************************************************************* **/
        // METODO PARA CONSULTAR COORDENADAS DEL DOMICILIO DEL USUARIO
        this.router.get('/ubicacion/:id', verificarToken_1.TokenValidation, empleadoControlador_1.default.BuscarCoordenadas);
        this.router.post('/buscar/informacion', verificarToken_1.TokenValidation, empleadoControlador_1.default.BuscarEmpleadoNombre);
        // INFORMACIÓN TÍTULO PROFESIONALES
        this.router.post('/buscarDepartamento', verificarToken_1.TokenValidation, empleadoControlador_1.default.ObtenerDepartamentoEmpleado);
        // INFORMACIÓN DE LA IMAGEN
        this.router.get('/img/:id/:imagen', empleadoControlador_1.default.BuscarImagen);
        // INFORMACION DE LA IMAGEN FORMATO CODIFICADO **USADO
        this.router.get('/img/codificado/:id/:imagen', empleadoControlador_1.default.CodificarImagenBase64);
        // RUTAS DE ACCESO A LA CARGA DE DATOS DE FORMA AUTOMÁTICA 
        this.router.post('/verificar/automatico/plantillaExcel/', [verificarToken_1.TokenValidation, upload_plantilla.single('uploads')], empleadoControlador_1.default.VerificarPlantilla_Automatica);
        //this.router.post('/verificar/datos/automatico/plantillaExcel/', [TokenValidation, multipartMiddlewarePlantilla], EMPLEADO_CONTROLADOR.VerificarPlantilla_DatosAutomatico);
        this.router.post('/cargar_automatico/plantillaExcel/', verificarToken_1.TokenValidation, empleadoControlador_1.default.CargarPlantilla_Automatico);
        // RUTAS DE ACCESO A LA CARGA DE DATOS DE FORMA MANUAL 
        this.router.post('/verificar/manual/plantillaExcel/', [verificarToken_1.TokenValidation, upload_plantilla.single('uploads')], empleadoControlador_1.default.VerificarPlantilla_Manual);
        //this.router.post('/verificar/datos/manual/plantillaExcel/', [TokenValidation, multipartMiddlewarePlantilla], EMPLEADO_CONTROLADOR.VerificarPlantilla_DatosManual);
        this.router.post('/cargar_manual/plantillaExcel/', verificarToken_1.TokenValidation, empleadoControlador_1.default.CargarPlantilla_Manual);
        /** **************************************************************************************** **
         ** **                CREACION DE CARPETAS DE LOS EMPLEADOS SELECCIONADOS                 ** **
         ** **************************************************************************************** **/
        this.router.post('/crear_carpetas/', verificarToken_1.TokenValidation, empleadoControlador_1.default.CrearCarpetasEmpleado);
    }
}
const EMPLEADO_RUTAS = new EmpleadoRutas();
exports.default = EMPLEADO_RUTAS.router;
