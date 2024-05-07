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
        // METODO PARA CREAR CARGOS DEL USUARIO
        this.router.post('/', verificarToken_1.TokenValidation, emplCargosControlador_1.default.Crear);
        // METODO DE BUSQUEDA DE DATOS DE CARGO DEL USUARIO MEDIANTE ID DEL CARGO
        this.router.get('/:id', verificarToken_1.TokenValidation, emplCargosControlador_1.default.ObtenerCargoID);
        // METODO PARA ACTUALIZAR REGISTRO
        this.router.put('/:id_empl_contrato/:id/actualizar', verificarToken_1.TokenValidation, emplCargosControlador_1.default.EditarCargo);
        // METODO DE CONSULTA DE DATOS DE CARGO POR ID CONTRATO
        this.router.get('/cargoInfo/:id_empl_contrato', verificarToken_1.TokenValidation, emplCargosControlador_1.default.EncontrarCargoIDContrato);
        this.router.get('/', verificarToken_1.TokenValidation, emplCargosControlador_1.default.list);
        this.router.get('/lista-empleados/', verificarToken_1.TokenValidation, emplCargosControlador_1.default.ListarCargoEmpleado);
        this.router.get('/buscar/:id_empleado', verificarToken_1.TokenValidation, emplCargosControlador_1.default.EncontrarIdCargo);
        this.router.get('/buscar/cargoActual/:id_empleado', verificarToken_1.TokenValidation, emplCargosControlador_1.default.EncontrarIdCargoActual);
        /** ****************************************************************************************** **
         ** **                    METODOS DE CONSULTA DE TIPOS DE CARGOS                            ** **
         ** ****************************************************************************************** **/
        // METODO DE BUSQUEDA DE TIPO DE CARGOS
        this.router.get('/listar/tiposCargo', verificarToken_1.TokenValidation, emplCargosControlador_1.default.ListarTiposCargo);
        // METODO PARA REGISTRAR TIPO DE CARGO
        this.router.post('/tipo_cargo', verificarToken_1.TokenValidation, emplCargosControlador_1.default.CrearTipoCargo);
        // Crear tipo cargo
        this.router.get('/buscar/ultimoTipo/nombreCargo/:id', verificarToken_1.TokenValidation, emplCargosControlador_1.default.BuscarUnTipo);
        this.router.get('/buscar/cargo-departamento/:id', verificarToken_1.TokenValidation, emplCargosControlador_1.default.BuscarTipoDepartamento);
        this.router.get('/buscar/cargo-sucursal/:id', verificarToken_1.TokenValidation, emplCargosControlador_1.default.BuscarTipoSucursal);
        this.router.get('/buscar/cargo-regimen/:id', verificarToken_1.TokenValidation, emplCargosControlador_1.default.BuscarTipoRegimen);
        /** ********************************************************************************************* **
         ** **            METODO PAARA LA LECTURA DEL REGISTRO MULTIPLE DE CARGOS                   ** **
         ** ********************************************************************************************* **/
        this.router.post('/upload/revision', [verificarToken_1.TokenValidation, upload_plantilla.single('uploads')], emplCargosControlador_1.default.RevisarDatos);
        this.router.post('/cargar_plantilla/', verificarToken_1.TokenValidation, emplCargosControlador_1.default.CargarPlantilla_cargos);
    }
}
const EMPLEADO_CARGO_RUTAS = new EmpleadosCargpsRutas();
exports.default = EMPLEADO_CARGO_RUTAS.router;
