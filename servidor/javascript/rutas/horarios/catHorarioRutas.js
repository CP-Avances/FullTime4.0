"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const luxon_1 = require("luxon");
const catHorarioControlador_1 = __importDefault(require("../../controlador/horarios/catHorarioControlador"));
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
const verificarToken_1 = require("../../libs/verificarToken");
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
// MANEJO DE PLANTILLAS DE DATOS
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
// MANEJO DE ARCHIVOS DE HORARIOS
const storage_horario = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, (0, accesoCarpetas_1.ObtenerRutaHorarios)());
    },
    filename: function (req, file, cb) {
        // FECHA DEL SISTEMA
        var fecha = luxon_1.DateTime.now();
        var anio = fecha.toFormat('yyyy');
        var mes = fecha.toFormat('MM');
        var dia = fecha.toFormat('dd');
        let { id, codigo } = req.params;
        cb(null, id + '_' + codigo + '_' + anio + '_' + mes + '_' + dia + '_' + file.originalname);
    }
});
const upload_horario = (0, multer_1.default)({ storage: storage_horario });
class HorarioRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // REGISTRAR HORARIO    **USADO
        this.router.post('/', verificarToken_1.TokenValidation, catHorarioControlador_1.default.CrearHorario);
        // BUSCAR HORARIO POR SU NOMBRE   **USADO
        this.router.post('/buscar-horario/nombre', verificarToken_1.TokenValidation, catHorarioControlador_1.default.BuscarHorarioNombre);
        // CARGAR ARCHIVO DE RESPALDO    **USADO
        this.router.put('/:id/documento/:archivo/verificar/:codigo', [verificarToken_1.TokenValidation, upload_horario.single('uploads')], catHorarioControlador_1.default.GuardarDocumentoHorario);
        // ACTUALIZAR DATOS DE HORARIO    **USADO
        this.router.put('/editar/:id', verificarToken_1.TokenValidation, catHorarioControlador_1.default.EditarHorario);
        // ELIMINAR DOCUMENTO DE HORARIO BASE DE DATOS - SERVIDOR    **USADO
        this.router.put('/eliminar_horario/base_servidor', [verificarToken_1.TokenValidation], catHorarioControlador_1.default.EliminarDocumento);
        // ELIMINAR DOCUMENTO DE HORARIOS DEL SERVIDOR   **USADO
        this.router.put('/eliminar_horario/servidor', [verificarToken_1.TokenValidation], catHorarioControlador_1.default.EliminarDocumentoServidor);
        // BUSCAR LISTA DE CATALOGO HORARIOS   **USADO
        this.router.get('/', verificarToken_1.TokenValidation, catHorarioControlador_1.default.ListarHorarios);
        // OBTENER VISTA DE DOCUMENTOS   **USADO
        this.router.get('/documentos/:docs', catHorarioControlador_1.default.ObtenerDocumento);
        // BUSCAR HORARIOS SIN CONSIDERAR UNO EN ESPECIFICO (METODO DE EDICION)   **USADO
        this.router.post('/buscar_horario/edicion', verificarToken_1.TokenValidation, catHorarioControlador_1.default.BuscarHorarioNombre_);
        // METODO PARA ELIMINAR REGISTRO    **USADO
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catHorarioControlador_1.default.EliminarRegistros);
        // METODO PARA BUSCAR DATOS DE UN HORARIO   **USADO
        this.router.get('/:id', verificarToken_1.TokenValidation, catHorarioControlador_1.default.ObtenerUnHorario);
        // METODO PARA ACTUALIZAR HORAS TRABAJADAS   **USADO
        this.router.put('/update-horas-trabaja/:id', verificarToken_1.TokenValidation, catHorarioControlador_1.default.EditarHorasTrabaja);
        // VERIFICAR DATOS DE LA PLANTILLA DE CATÁLOGO HORARIO Y LUEGO SUBIR AL SISTEMA   **USADO
        this.router.post('/cargarHorario/verificarDatos/upload', [verificarToken_1.TokenValidation, upload.single('uploads')], catHorarioControlador_1.default.VerificarDatos);
        // REGISTRAR DATOS DE PLANTILLA EN EL SISTEMA   **USADO
        this.router.post('/cargarHorario/upload', [verificarToken_1.TokenValidation, upload.single('uploads')], catHorarioControlador_1.default.CargarHorarioPlantilla);
    }
}
const HORARIO_RUTAS = new HorarioRutas();
exports.default = HORARIO_RUTAS.router;
