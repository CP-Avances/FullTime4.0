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
exports.PLANIFICACION_HORARIA_CONTROLADOR = void 0;
const path_1 = __importDefault(require("path"));
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
const xlsx_1 = __importDefault(require("xlsx"));
const database_1 = __importDefault(require("../../database"));
class PlanificacionHorariaControlador {
    //METODO PARA VERIFICAR LOS DATOS DE LA PLANTILLA DE PLANIFICACION HORARIA
    VerificarDatosPlanificacionHoraria(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
            const usuarios = JSON.parse(req.body.usuarios);
            console.log(usuarios);
            let separador = path_1.default.sep;
            let ruta = (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)() + separador + documento;
            const workbook = xlsx_1.default.readFile(ruta);
            const sheet_name_list = workbook.SheetNames;
            const plantillaPlanificacionHoraria = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            const plantillaPlanificacionHorariaFiltrada = plantillaPlanificacionHoraria.filter((data) => {
                return Object.keys(data).length > 1;
            });
            for (const [index, data] of plantillaPlanificacionHorariaFiltrada.entries()) {
                let { USUARIO } = data;
                if (!USUARIO) {
                    data.OBSERVACION = 'Datos no registrados: USUARIO';
                    continue;
                }
                // VERIFICAR EXISTENCIA DE USUARIO
                if (!(yield VerificarUsuario(USUARIO))) {
                    data.OBSERVACION = 'Usuario no registrado en la base de datos';
                    continue;
                }
                // VERIFICAR USUARIO DUPLICADO
                if (plantillaPlanificacionHorariaFiltrada.filter((data) => data.USUARIO === USUARIO).length > 1) {
                    data.OBSERVACION = 'Registro duplicado dentro de la plantilla';
                    continue;
                }
            }
            res.json({ plantillaPlanificacionHoraria: plantillaPlanificacionHorariaFiltrada });
        });
    }
    //METODO PARA CARGAR LA PLANIFICACION HORARIA
    CargarPlanificacionHoraria(formData) {
        return null;
    }
}
// FUNCION PARA VERIFICAR EXISTENCIA DE USUARIO EN LA BASE DE DATOS
function VerificarUsuario(usuario) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield database_1.default.query('SELECT * FROM USUARIOS WHERE USUARIO = ?', [usuario]);
        return result.rowCount > 0;
    });
}
exports.PLANIFICACION_HORARIA_CONTROLADOR = new PlanificacionHorariaControlador();
exports.default = exports.PLANIFICACION_HORARIA_CONTROLADOR;
