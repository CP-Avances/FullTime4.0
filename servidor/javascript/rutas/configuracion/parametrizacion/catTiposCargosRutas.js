"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const catTipoCargos_Controlador_1 = __importDefault(require("../../../controlador/configuracion/parametrizacion/catTipoCargos.Controlador"));
const accesoCarpetas_1 = require("../../../libs/accesoCarpetas");
const verificarToken_1 = require("../../../libs/verificarToken");
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
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
class TiposCargosRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA BUSCAR TIPO CARGO POR SU NOMBRE   **USADO
        this.router.post('/buscar/tipo_cargo/nombre', verificarToken_1.TokenValidation, catTipoCargos_Controlador_1.default.BuscarTipoCargoNombre);
        // METODO PARA LISTAR TIPO CARGOS   **USADO
        this.router.get('/', verificarToken_1.TokenValidation, catTipoCargos_Controlador_1.default.ListaTipoCargos);
        // METODO PARA REGISTRAR TIPO CARGO    **USADO
        this.router.post('/crearCargo', verificarToken_1.TokenValidation, catTipoCargos_Controlador_1.default.CrearCargo);
        // METODO PARA EDITAR TIPO CARGO   **USADO
        this.router.put('/', verificarToken_1.TokenValidation, catTipoCargos_Controlador_1.default.EditarCargo);
        // METODO PARA ELIMINAR TIPO CARGO    **USADO
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catTipoCargos_Controlador_1.default.EliminarRegistro);
        // METODO PARA LEER DATOS DE PLANTILLA   **USADO
        this.router.post('/upload/revision', [verificarToken_1.TokenValidation, upload.single('uploads')], catTipoCargos_Controlador_1.default.VerificarPlantillaTipoCargos);
        // METODO PARA GUARDAR DATOS DE PLANTILLA    **USADO
        this.router.post('/cargar_plantilla/', verificarToken_1.TokenValidation, catTipoCargos_Controlador_1.default.CargarPlantilla);
    }
}
const TIPOS_CARGOS_RUTAS = new TiposCargosRutas();
exports.default = TIPOS_CARGOS_RUTAS.router;
