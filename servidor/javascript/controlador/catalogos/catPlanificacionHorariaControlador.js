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
            console.log(plantillaPlanificacionHorariaFiltrada);
            let plantillaPlanificacionHorariaEstructurada = plantillaPlanificacionHorariaFiltrada.map((data) => {
                let nuevoObjeto = { USUARIO: data.USUARIO, DIAS: {} };
                for (let propiedad in data) {
                    if (propiedad !== 'USUARIO') {
                        nuevoObjeto.DIAS[propiedad] = { HORARIOS: data[propiedad].split(',') };
                    }
                }
                return nuevoObjeto;
            });
            for (const [index, data] of plantillaPlanificacionHorariaEstructurada.entries()) {
                let { USUARIO } = data;
                if (!USUARIO) {
                    data.OBSERVACION = 'Datos no registrados: USUARIO';
                    continue;
                }
                // VERIFICAR USUARIO DUPLICADO
                if (plantillaPlanificacionHorariaFiltrada.filter((data) => data.USUARIO === USUARIO).length > 1) {
                    data.OBSERVACION = 'Registro duplicado dentro de la plantilla';
                    continue;
                }
                // VERIFICAR EXISTENCIA DE USUARIO
                if (!VerificarUsuario(USUARIO, usuarios)) {
                    data.OBSERVACION = 'Usuario no valido';
                    continue;
                }
                // VERIFICAR HORARIOS
                for (const [dia, { HORARIOS }] of Object.entries(data.DIAS)) {
                    let horariosNoValidos = [];
                    for (const HORARIO of HORARIOS) {
                        if (!(yield VerificarHorario(HORARIO))) {
                            horariosNoValidos.push(HORARIO);
                            data.DIAS.HORARIOS[HORARIO].OBSERVACION = 'Horario no valido';
                        }
                        else {
                            data.DIAS.HORARIOS[HORARIO].OBSERVACION = 'OK';
                        }
                    }
                    data.DIAS[dia].OBSERVACION = horariosNoValidos.length > 0 ? `Horarios no validos: ${horariosNoValidos.join(', ')}` : 'OK';
                }
            }
            res.json({ plantillaPlanificacionHoraria: plantillaPlanificacionHorariaEstructurada });
        });
    }
    //METODO PARA CARGAR LA PLANIFICACION HORARIA
    CargarPlanificacionHoraria(formData) {
        return null;
    }
}
// FUNCION PARA VERIFICAR EXISTENCIA DE USUARIO EN LA LISTA DE USUARIOS
function VerificarUsuario(cedula, usuarios) {
    let usuarioEncontrado = usuarios.find((usuario) => usuario.cedula === cedula);
    return usuarioEncontrado && usuarioEncontrado.id_cargo ? true : false;
}
// FUNCION PARA VERIFICAR EXISTENCIA DE HORARIO EN LA BASE DE DATOS
function VerificarHorario(codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        // SELECT * FROM cg_horarios ORDER BY codigo ASC
        const horario = yield database_1.default.query('SELECT hora_trabajo FROM cg_horarios WHERE LOWER(codigo) = $1', [codigo.toLowerCase()]);
        // SI EXISTE HORARIO VERIFICAR SI horario.hora_trabajo este en formato hh:mm:ss
        const existe = horario.rowCount > 0;
        if (existe) {
            const formatoHora = /^\d{2}:[0-5][0-9]:[0-5][0-9]$/;
            return formatoHora.test(horario.rows[0].hora_trabajo);
        }
        return existe;
    });
}
exports.PLANIFICACION_HORARIA_CONTROLADOR = new PlanificacionHorariaControlador();
exports.default = exports.PLANIFICACION_HORARIA_CONTROLADOR;
