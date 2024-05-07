"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// SECCIÓN DE LIBRERIAS
const empleadoControlador_1 = __importDefault(require("../../../controlador/empleado/empleadoRegistro/empleadoControlador"));
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
const verificarToken_1 = require("../../../libs/verificarToken");
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const database_1 = __importDefault(require("../../../database"));
const moment_1 = __importDefault(require("moment"));
moment_1.default.locale('es');
const multipart = require('connect-multiparty');
const multipartMiddlewarePlantilla = multipart({
    uploadDir: './plantillas',
});
/** ************************************************************************************** **
 ** **                   METODO PARA OBTENER CARPETA IMAGENES DE USUARIO                   **
 ** ************************************************************************************** **/
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = req.params.id_empleado;
            var ruta = yield (0, accesoCarpetas_1.ObtenerRutaUsuario)(id);
            cb(null, ruta);
        });
    },
    filename: function (req, file, cb) {
        return __awaiter(this, void 0, void 0, function* () {
            // FECHA DEL SISTEMA
            var fecha = (0, moment_1.default)();
            var anio = fecha.format('YYYY');
            var mes = fecha.format('MM');
            var dia = fecha.format('DD');
            // DATOS DOCUMENTO
            let id = req.params.id_empleado;
            const usuario = yield database_1.default.query(`
            SELECT codigo FROM empleados WHERE id = $1
            `, [id]);
            let documento = usuario.rows[0].codigo + '_' + anio + '_' + mes + '_' + dia + '_' + file.originalname;
            cb(null, documento);
        });
    }
});
const upload = (0, multer_1.default)({ storage: storage });
/** ************************************************************************************** **
 ** **                   METODO PARA OBTENER CARPETA IMAGENES DE USUARIO                   **
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
        // METODO DE BUSQUEDA DE CONFIGURACION DE CODIGO DE USUARIOS
        this.router.get('/encontrarDato/codigo', verificarToken_1.TokenValidation, empleadoControlador_1.default.ObtenerCodigo);
        // METODO PARA REGISTRAR CODIGO DE USUARIO
        this.router.post('/crearCodigo', verificarToken_1.TokenValidation, empleadoControlador_1.default.CrearCodigo);
        // METODO DE BUSQUEDA DEL ULTIMO CODIGO DE EMPLEADO REGISTRADO EN EL SISTEMA
        this.router.get('/encontrarDato/codigo/empleado', verificarToken_1.TokenValidation, empleadoControlador_1.default.ObtenerMAXCodigo);
        // METODO PARA ACTUALIZAR CODIGO VALOR TOTAL
        this.router.put('/cambiarValores', verificarToken_1.TokenValidation, empleadoControlador_1.default.ActualizarCodigoTotal);
        // METODO DE ACTUALIZACION DE CODIGO
        this.router.put('/cambiarCodigo', verificarToken_1.TokenValidation, empleadoControlador_1.default.ActualizarCodigo);
        /** **************************************************************************************** **
         ** **                            MANEJO DE DATOS DE EMPLEADOS                            ** **
         ** **************************************************************************************** **/
        // LISTAR DATOS DE UN USUARIO  --**VERIFICADO
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
        // METODO PARA CARGAR IMAGEN DEL USUARIO
        this.router.put('/:id_empleado/uploadImage', [verificarToken_1.TokenValidation, upload.single('image')], empleadoControlador_1.default.CrearImagenEmpleado);
        // METODO PARA ACTUALIZAR UBICACION DE DOMICILIO
        this.router.put('/geolocalizacion/:id', verificarToken_1.TokenValidation, empleadoControlador_1.default.GeolocalizacionCrokis);
        /** **************************************************************************************** **
         ** **                       MANEJO DE DATOS DE TITULO PROFESIONAL                        ** **
         ** **************************************************************************************** **/
        // METODO PARA BUSCAR TITULO DEL USUARIO
        this.router.get('/emplTitulos/:id_empleado', verificarToken_1.TokenValidation, empleadoControlador_1.default.ObtenerTitulosEmpleado);
        // METODO PARA REGISTRAR TITULO PROFESIONAL
        this.router.post('/emplTitulos/', verificarToken_1.TokenValidation, empleadoControlador_1.default.CrearEmpleadoTitulos);
        // METODO PARA ACTUALIZAR REGISTRO
        this.router.put('/:id_empleado_titulo/titulo', verificarToken_1.TokenValidation, empleadoControlador_1.default.EditarTituloEmpleado);
        // METODO PARA ELIMINAR TITULO 
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
        // INFORMACIÓN DE LA IMAGEN
        this.router.get('/img/codificado/:id/:imagen', empleadoControlador_1.default.getImagenBase64);
        // RUTAS DE ACCESO A LA CARGA DE DATOS DE FORMA AUTOMÁTICA 
        this.router.post('/verificar/automatico/plantillaExcel/', [verificarToken_1.TokenValidation, upload_plantilla.single('uploads')], empleadoControlador_1.default.VerificarPlantilla_Automatica);
        //this.router.post('/verificar/datos/automatico/plantillaExcel/', [TokenValidation, multipartMiddlewarePlantilla], EMPLEADO_CONTROLADOR.VerificarPlantilla_DatosAutomatico);
        this.router.post('/cargar_automatico/plantillaExcel/', verificarToken_1.TokenValidation, empleadoControlador_1.default.CargarPlantilla_Automatico);
        // RUTAS DE ACCESO A LA CARGA DE DATOS DE FORMA MANUAL 
        this.router.post('/verificar/manual/plantillaExcel/', [verificarToken_1.TokenValidation, upload_plantilla.single('uploads')], empleadoControlador_1.default.VerificarPlantilla_Manual);
        //this.router.post('/verificar/datos/manual/plantillaExcel/', [TokenValidation, multipartMiddlewarePlantilla], EMPLEADO_CONTROLADOR.VerificarPlantilla_DatosManual);
        this.router.post('/cargar_manual/plantillaExcel/', verificarToken_1.TokenValidation, empleadoControlador_1.default.CargarPlantilla_Manual);
    }
}
const EMPLEADO_RUTAS = new EmpleadoRutas();
exports.default = EMPLEADO_RUTAS.router;
