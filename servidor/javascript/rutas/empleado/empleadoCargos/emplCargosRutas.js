"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../../libs/verificarToken");
const emplCargosControlador_1 = __importDefault(require("../../../controlador/empleado/empleadoCargos/emplCargosControlador"));
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
        this.router.get('/empleadosAutorizan/:id', verificarToken_1.TokenValidation, emplCargosControlador_1.default.ListarEmpleadoAutoriza);
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
    }
}
const EMPLEADO_CARGO_RUTAS = new EmpleadosCargpsRutas();
exports.default = EMPLEADO_CARGO_RUTAS.router;
