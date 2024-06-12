"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catRelojesControlador_1 = __importDefault(require("../../controlador/catalogos/catRelojesControlador"));
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
const verificarToken_1 = require("../../libs/verificarToken");
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
class RelojesRuta {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA BUSCAR DISPOSITIVOS
        this.router.get('/', verificarToken_1.TokenValidation, catRelojesControlador_1.default.ListarRelojes);
        // METODO PARA ELIMINAR REGISTROS
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catRelojesControlador_1.default.EliminarRegistros);
        // METODO PARA REGISTRAR DISPOSITIVO
        this.router.post('/', verificarToken_1.TokenValidation, catRelojesControlador_1.default.CrearRelojes);
        // METODO PARA VER DATOS DE UN DISPOSITIVO
        this.router.get('/:id', verificarToken_1.TokenValidation, catRelojesControlador_1.default.ListarUnReloj);
        // METODO PARA ACTUALIZAR REGISTRO
        this.router.put('/', verificarToken_1.TokenValidation, catRelojesControlador_1.default.ActualizarReloj);
        // METODO PARA BUSCAR DATOS GENERALES DE DISPOSITIVOS
        this.router.get('/datosReloj/:id', verificarToken_1.TokenValidation, catRelojesControlador_1.default.ListarDatosUnReloj);
        //this.router.post('/plantillaExcel/', [TokenValidation, multipartMiddlewarePlantilla], RELOJES_CONTROLADOR.CargaPlantillaRelojes);
        // METODO PARA LEER Y CARGAR DATOS DE PLANTILLA
        this.router.post('/upload/revision', [verificarToken_1.TokenValidation, upload.single('uploads')], catRelojesControlador_1.default.VerificarPlantilla);
        this.router.post('/plantillaExcel/', verificarToken_1.TokenValidation, catRelojesControlador_1.default.CargaPlantillaRelojes);
    }
}
const RELOJES_RUTA = new RelojesRuta();
exports.default = RELOJES_RUTA.router;
