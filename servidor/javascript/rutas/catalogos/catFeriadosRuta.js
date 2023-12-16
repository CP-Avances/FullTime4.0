"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catFeriadosControlador_1 = __importDefault(require("../../controlador/catalogos/catFeriadosControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
const multer_1 = __importDefault(require("multer"));
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)());
    },
    filename: function (req, file, cb) {
        // FECHA DEL SISTEMA
        //var fecha = moment();
        //var anio = fecha.format('YYYY');
        //var mes = fecha.format('MM');
        //var dia = fecha.format('DD');
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
        // METODO PARA LISTAR FERIADOS
        this.router.get('/', verificarToken_1.TokenValidation, catFeriadosControlador_1.default.ListarFeriados);
        // METODO PARA ELIMINAR REGISTRO
        this.router.delete('/delete/:id', verificarToken_1.TokenValidation, catFeriadosControlador_1.default.EliminarFeriado);
        // METODO PARA CREAR REGISTRO DE FERIADO
        this.router.post('/', verificarToken_1.TokenValidation, catFeriadosControlador_1.default.CrearFeriados);
        // METODO PARA BUSCAR FERIADOS EXCEPTO REGISTRO EDITADO
        this.router.get('/listar/:id', verificarToken_1.TokenValidation, catFeriadosControlador_1.default.ListarFeriadosActualiza);
        // METODO PARA ACTUALIZAR REGISTRO
        this.router.put('/', verificarToken_1.TokenValidation, catFeriadosControlador_1.default.ActualizarFeriado);
        // METODO PARA BUSCAR INFORMACION DE UN FERIADO
        this.router.get('/:id', verificarToken_1.TokenValidation, catFeriadosControlador_1.default.ObtenerUnFeriado);
        // METODO PARA BUSCAR FERIADOS POR CIUDAD Y RANGO DE FECHAS  --**VERIFICADO
        this.router.post('/listar-feriados/ciudad', verificarToken_1.TokenValidation, catFeriadosControlador_1.default.FeriadosCiudad);
        // METODO PARA BUSCAR FECHASDE RECUPERACION DE FERIADOS POR CIUDAD Y RANGO DE FECHAS  --**VERIFICADO
        this.router.post('/listar-feriados-recuperar/ciudad', verificarToken_1.TokenValidation, catFeriadosControlador_1.default.FeriadosRecuperacionCiudad);
        this.router.post('/upload/revision', [verificarToken_1.TokenValidation, upload.single('uploads')], catFeriadosControlador_1.default.RevisarDatos);
        this.router.post('/upload/revision_data', [verificarToken_1.TokenValidation, upload.single('uploads')], catFeriadosControlador_1.default.RevisarDatos_Duplicados);
        this.router.post('/upload', [verificarToken_1.TokenValidation, upload.single('uploads')], catFeriadosControlador_1.default.CrearFeriadoPlantilla);
    }
}
const FERIADOS_RUTA = new FeriadosRuta();
exports.default = FERIADOS_RUTA.router;
