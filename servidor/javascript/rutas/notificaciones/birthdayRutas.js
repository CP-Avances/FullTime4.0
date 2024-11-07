"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const birthdayControlador_1 = __importDefault(require("../../controlador/notificaciones/birthdayControlador"));
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
const verificarToken_1 = require("../../libs/verificarToken");
const luxon_1 = require("luxon");
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, (0, accesoCarpetas_1.ObtenerRutaBirthday)());
    },
    filename: function (req, file, cb) {
        // FECHA DEL SISTEMA
        var fecha = luxon_1.DateTime.now();
        var anio = fecha.toFormat('yyyy');
        var mes = fecha.toFormat('MM');
        var dia = fecha.toFormat('dd');
        let documento = anio + '_' + mes + '_' + dia + '_' + file.originalname;
        cb(null, documento);
    }
});
const upload = (0, multer_1.default)({ storage: storage });
class BirthdayRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO PARA CONSULTAR MENSAJE DE CUMPLEAÑOS    **USADO
        this.router.get('/:id_empresa', verificarToken_1.TokenValidation, birthdayControlador_1.default.MensajeEmpresa);
        // METODO PARA REGISTRAR MENSAJE DE CUMPLEAÑOS   **USADO
        this.router.post('/', verificarToken_1.TokenValidation, birthdayControlador_1.default.CrearMensajeBirthday);
        // METODO PARA SUBIR IMAGEN DE CUMPLEAÑOS   **USADO
        this.router.put('/:id_empresa/uploadImage', [verificarToken_1.TokenValidation, upload.single('uploads')], birthdayControlador_1.default.CrearImagenCumpleanios);
        // METODO PARA DESCARGAR IMAGEN DE CUMPLEAÑOS    **USADO FRONT
        this.router.get('/img/:imagen', birthdayControlador_1.default.ObtenerImagen);
        // METODO PARA ACTUALIZAR MENSAJE DE CUMPLEAÑOS   **USADO
        this.router.put('/editar/:id', verificarToken_1.TokenValidation, birthdayControlador_1.default.EditarMensajeBirthday);
    }
}
const BIRTHDAY_RUTAS = new BirthdayRutas();
exports.default = BIRTHDAY_RUTAS.router;
