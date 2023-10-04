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
const vacunasControlador_1 = __importDefault(require("../../../controlador/empleado/empleadoVacuna/vacunasControlador"));
const vacunasControlador_2 = require("../../../controlador/empleado/empleadoVacuna/vacunasControlador");
const verificarToken_1 = require("../../../libs/verificarToken");
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const database_1 = __importDefault(require("../../../database"));
const moment_1 = __importDefault(require("moment"));
moment_1.default.locale('es');
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = req.params.id_empleado;
            var ruta = yield (0, vacunasControlador_2.ObtenerRutaVacuna)(id);
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
class VacunaRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA LISTAR REGISTROS DE UN USUARIO
        this.router.get('/:id_empleado', verificarToken_1.TokenValidation, vacunasControlador_1.default.ListarUnRegistro);
        // METODO DE BUSQUEDA DE TIPOS DE VACUNA REGISTRADOS
        this.router.get('/lista/tipo_vacuna', verificarToken_1.TokenValidation, vacunasControlador_1.default.ListarTipoVacuna);
        // METODO REGISTRO DE VACUNACIÓN
        this.router.post('/', verificarToken_1.TokenValidation, vacunasControlador_1.default.CrearRegistro);
        // METODO PARA GUARDAR DOCUMENTO 
        this.router.put('/:id/documento/:id_empleado', [verificarToken_1.TokenValidation, upload.single('uploads')], vacunasControlador_1.default.GuardarDocumento);
        // METODO ACTUALIZACION DE REGISTROS DE VACUNACION
        this.router.put('/:id', verificarToken_1.TokenValidation, vacunasControlador_1.default.ActualizarRegistro);
        // ELIMINAR DOCUMENTO DE VACUNAS DEL SERVIDOR
        this.router.put('/eliminar_carnet/servidor', [verificarToken_1.TokenValidation], vacunasControlador_1.default.EliminarDocumentoServidor);
        // ELIMINAR DOCUMENTO DE VACUNAS
        this.router.put('/eliminar_carnet/base_servidor', [verificarToken_1.TokenValidation], vacunasControlador_1.default.EliminarDocumento);
        // METODO DE ELIMINACION DE REGISTRO DE VACUNA
        this.router.delete('/eliminar/:id/:documento', verificarToken_1.TokenValidation, vacunasControlador_1.default.EliminarRegistro);
        // METODO REGISTRO DE TIPO DE VACUNA
        this.router.post('/tipo_vacuna', verificarToken_1.TokenValidation, vacunasControlador_1.default.CrearTipoVacuna);
        // METODO PARA BUSCAR UN DOCUMENTO
        this.router.get('/documentos/:docs', vacunasControlador_1.default.ObtenerDocumento);
        // METODO PARA LEER TODOS LOS REGISTROS DE VACUNACION
        this.router.get('/', verificarToken_1.TokenValidation, vacunasControlador_1.default.ListarRegistro);
    }
}
const VACUNA_RUTAS = new VacunaRutas();
exports.default = VACUNA_RUTAS.router;
