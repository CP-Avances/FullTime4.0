"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../../libs/verificarToken");
const sucursalControlador_1 = __importDefault(require("../../../controlador/configuracion/localizacion/sucursalControlador"));
const multer_1 = __importDefault(require("multer"));
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)());
    },
    filename: function (req, file, cb) {
        let documento = file.originalname;
        cb(null, documento);
    }
});
const upload = (0, multer_1.default)({ storage: storage });
class SucursalRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // CREAR REGISTRO DE ESTABLECIMIENTO  **USADO
        this.router.post('/', verificarToken_1.TokenValidation, sucursalControlador_1.default.CrearSucursal);
        // BUSCAR REGISTROS DE ESTABLECIMIENTO POR SU NOMBRE  **USADO
        this.router.post('/nombre-sucursal', verificarToken_1.TokenValidation, sucursalControlador_1.default.BuscarNombreSucursal);
        // ACTUALIZAR REGISTRO DE ESTABLECIMIENTO  **USADO
        this.router.put('/', verificarToken_1.TokenValidation, sucursalControlador_1.default.ActualizarSucursal);
        // LISTA DE SUCURSALES POR ID DE EMPRESA  **USADO
        this.router.get('/empresa-sucursal/:id_empresa', verificarToken_1.TokenValidation, sucursalControlador_1.default.ObtenerSucursalEmpresa);
        // LISTAR SUCURSALES **USADO
        this.router.get('/', verificarToken_1.TokenValidation, sucursalControlador_1.default.ListarSucursales);
        // ELIMINAR REGISTRO **USADO
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, sucursalControlador_1.default.EliminarRegistros);
        // METODO PARA BUSCAR DATOS DE UNA SUCURSAL  **USADO
        this.router.get('/unaSucursal/:id', verificarToken_1.TokenValidation, sucursalControlador_1.default.ObtenerUnaSucursal);
        // METODO PARA VERIIFCAR DATOS DE LA PLANTILLA  **USADO
        this.router.post('/upload/revision', [verificarToken_1.TokenValidation, upload.single('uploads')], sucursalControlador_1.default.RevisarDatos);
        // METODO PARA REGISTRAR SUCURSALES DE PLANTILLA   **USADO
        this.router.post('/registraSucursales', verificarToken_1.TokenValidation, sucursalControlador_1.default.RegistrarSucursales);
    }
}
const SUCURSAL_RUTAS = new SucursalRutas();
exports.default = SUCURSAL_RUTAS.router;