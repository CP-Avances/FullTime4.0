"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const catFeriadosControlador_1 = __importDefault(require("../../controlador/horarios/catFeriadosControlador"));
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
const verificarToken_1 = require("../../libs/verificarToken");
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
class FeriadosRuta {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA LISTAR FERIADOS   **USADO
        this.router.get('/', verificarToken_1.TokenValidation, catFeriadosControlador_1.default.ListarFeriados);
        // METODO PARA ELIMINAR REGISTRO   **USADO
        this.router.delete('/delete/:id', verificarToken_1.TokenValidation, catFeriadosControlador_1.default.EliminarFeriado);
        // METODO PARA CREAR REGISTRO DE FERIADO   **USADO
        this.router.post('/', verificarToken_1.TokenValidation, catFeriadosControlador_1.default.CrearFeriados);
        // METODO PARA BUSCAR FERIADOS EXCEPTO REGISTRO EDITADO  **USADO
        this.router.get('/listar/:id', verificarToken_1.TokenValidation, catFeriadosControlador_1.default.ListarFeriadosActualiza);
        // METODO PARA ACTUALIZAR REGISTRO    **USADO
        this.router.put('/', verificarToken_1.TokenValidation, catFeriadosControlador_1.default.ActualizarFeriado);
        // METODO PARA BUSCAR INFORMACION DE UN FERIADO   **USADO
        this.router.get('/:id', verificarToken_1.TokenValidation, catFeriadosControlador_1.default.ObtenerUnFeriado);
        // METODO PARA BUSCAR FERIADOS POR CIUDAD Y RANGO DE FECHAS  **USADO
        this.router.post('/listar-feriados/ciudad', verificarToken_1.TokenValidation, catFeriadosControlador_1.default.FeriadosCiudad);
        this.router.post('/listar-feriados/ciudad2', verificarToken_1.TokenValidation, catFeriadosControlador_1.default.FeriadosCiudad2);
        // METODO PARA BUSCAR FECHASDE RECUPERACION DE FERIADOS POR CIUDAD Y RANGO DE FECHAS  **USADO
        this.router.post('/listar-feriados-recuperar/ciudad', verificarToken_1.TokenValidation, catFeriadosControlador_1.default.FeriadosRecuperacionCiudad);
        // METODO PARA BUSCAR FECHASDE RECUPERACION DE FERIADOS POR CIUDAD Y RANGO DE FECHAS  **USADO
        this.router.post('/listar-feriados-recuperar/ciudad2', verificarToken_1.TokenValidation, catFeriadosControlador_1.default.FeriadosRecuperacionCiudad2);
        // METODO PARA VALIDAR DATOS DE PLANTILLA   **USADO
        this.router.post('/upload/revision', [verificarToken_1.TokenValidation, upload.single('uploads')], catFeriadosControlador_1.default.RevisarDatos);
        // METODO PARA REGISTRAR DATOS DE FERIADOS DE PLANTILLA   **USADO
        this.router.post('/upload/crearFeriado', [verificarToken_1.TokenValidation, upload.single('uploads')], catFeriadosControlador_1.default.RegistrarFeriado);
        // METODO PARA REGISTRAR DATOS DE FERIADOS CIUDADES DE PLANTILLA   **USADO
        this.router.post('/upload/crearFeriadoCiudad', [verificarToken_1.TokenValidation, upload.single('uploads')], catFeriadosControlador_1.default.RegistrarFeriado_Ciudad);
        /** ************************************************************************************* **
         ** **                         METODO DE APLICACION MOVIL                              ** **
         ** ************************************************************************************* **/
        // METODO PARA LEER FERIADOS   **USADO
        this.router.get('/cg-feriados', verificarToken_1.TokenValidation, catFeriadosControlador_1.default.LeerFeriados);
    }
}
const FERIADOS_RUTA = new FeriadosRuta();
exports.default = FERIADOS_RUTA.router;