"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../../libs/verificarToken");
const emplCargosControlador_1 = __importDefault(require("../../../controlador/empleado/empleadoCargos/emplCargosControlador"));
const multer_1 = __importDefault(require("multer"));
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
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
class EmpleadosCargpsRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA EDITAR ESTADO DEL CARGO   **USADO
        this.router.post('/estado-cargo', verificarToken_1.TokenValidation, emplCargosControlador_1.default.EditarEstadoCargo);
        // METODO PARA BUSCAR CARGOS ACTIVOS   **USADO
        this.router.post('/cargo-activo', verificarToken_1.TokenValidation, emplCargosControlador_1.default.BuscarCargosActivos);
        // METODO PARA CREAR CARGOS DEL USUARIO    **USADO
        this.router.post('/', verificarToken_1.TokenValidation, emplCargosControlador_1.default.Crear);
        // METODO DE BUSQUEDA DE DATOS DE CARGO DEL USUARIO MEDIANTE ID DEL CARGO    **USADO
        this.router.get('/:id', verificarToken_1.TokenValidation, emplCargosControlador_1.default.ObtenerCargoID);
        // METODO PARA ACTUALIZAR REGISTRO    **USADO
        this.router.put('/:id_empl_contrato/:id/actualizar', verificarToken_1.TokenValidation, emplCargosControlador_1.default.EditarCargo);
        // METODO DE CONSULTA DE DATOS DE CARGO POR ID CONTRATO   **USADO
        this.router.get('/cargoInfo/:id_empl_contrato', verificarToken_1.TokenValidation, emplCargosControlador_1.default.EncontrarCargoIDContrato);
        // METODO PARA BUSCAR CARGOS POR FECHA    **USADO
        this.router.post('/fecha_cargo', verificarToken_1.TokenValidation, emplCargosControlador_1.default.BuscarCargosFecha);
        // METODO PARA BUSCAR CARGOS POR FECHA EDICION    **USADO
        this.router.post('/fecha_cargo/editar', verificarToken_1.TokenValidation, emplCargosControlador_1.default.BuscarCargosFechaEditar);
        this.router.get('/buscar/:id_empleado', verificarToken_1.TokenValidation, emplCargosControlador_1.default.EncontrarIdCargo);
        // METODO PARA ELIMINAR EL CARGO REGISTRADO DE LA TABLA EU_EMPLEADOS_CARGOS      **USADO
        this.router.post('/eliminarCargo', [verificarToken_1.TokenValidation], emplCargosControlador_1.default.EliminarCargo);
        /** ****************************************************************************************** **
         ** **                    METODOS DE CONSULTA DE TIPOS DE CARGOS                            ** **
         ** ****************************************************************************************** **/
        // METODO DE BUSQUEDA DE TIPO DE CARGOS    **USADO
        this.router.get('/listar/tiposCargo', verificarToken_1.TokenValidation, emplCargosControlador_1.default.ListarTiposCargo);
        // METODO PARA REGISTRAR TIPO DE CARGO    **USADO
        this.router.post('/tipo_cargo', verificarToken_1.TokenValidation, emplCargosControlador_1.default.CrearTipoCargo);
        // Crear tipo cargo
        this.router.get('/buscar/cargo-departamento/:id', verificarToken_1.TokenValidation, emplCargosControlador_1.default.BuscarTipoDepartamento);
        this.router.get('/buscar/cargo-sucursal/:id', verificarToken_1.TokenValidation, emplCargosControlador_1.default.BuscarTipoSucursal);
        this.router.get('/buscar/cargo-regimen/:id', verificarToken_1.TokenValidation, emplCargosControlador_1.default.BuscarTipoRegimen);
        /** ********************************************************************************************* **
         ** **            METODO PAARA LA LECTURA DEL REGISTRO MULTIPLE DE CARGOS                   ** **
         ** ********************************************************************************************* **/
        // METODO PARA VERIFICAR DATOS DE PLANTILLA DE CARGOS  **USADO
        this.router.post('/upload/revision', [verificarToken_1.TokenValidation, upload_plantilla.single('uploads')], emplCargosControlador_1.default.RevisarDatos);
        // METODO PARA CARGAR DATOS DE PLANTILLA DE CARGOS   **USADO
        this.router.post('/cargar_plantilla/', verificarToken_1.TokenValidation, emplCargosControlador_1.default.CargarPlantilla_cargos);
    }
}
const EMPLEADO_CARGO_RUTAS = new EmpleadosCargpsRutas();
exports.default = EMPLEADO_CARGO_RUTAS.router;
