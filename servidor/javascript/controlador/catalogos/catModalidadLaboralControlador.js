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
exports.modalidaLaboralControlador = void 0;
const accesoCarpetas_1 = require("../../libs/accesoCarpetas");
const path_1 = __importDefault(require("path"));
const xlsx_1 = __importDefault(require("xlsx"));
const builder = require('xmlbuilder');
class ModalidaLaboralControlador {
    /** Lectura de los datos de la platilla Modalidad_cargo */
    VerfificarPlantillaModalidadLaboral(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const documento = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname;
            let separador = path_1.default.sep;
            let ruta = (0, accesoCarpetas_1.ObtenerRutaLeerPlantillas)() + separador + documento;
            const workbook = xlsx_1.default.readFile(ruta);
            const sheet_name_list = workbook.SheetNames;
            const plantilla_modalidad_laboral = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            const plantilla_cargo = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[1]]);
            console.log('plantilla_modalidad_laboral: ', plantilla_modalidad_laboral);
            console.log('plantilla_cargo: ', plantilla_cargo);
        });
    }
    /** Registrar plantilla Modalidad_cargo **/
    CargarPlantilla(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.modalidaLaboralControlador = new ModalidaLaboralControlador();
exports.default = exports.modalidaLaboralControlador;
