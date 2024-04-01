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
                        nuevoObjeto.DIAS[propiedad] = { HORARIOS: data[propiedad].split(',').map((horario) => ({ CODIGO: horario })) };
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
                data.DIAS = yield VerificarHorarios(data.DIAS);
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
function VerificarHorarios(dias) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("DIAS", dias);
        for (const [dia, { HORARIOS }] of Object.entries(dias)) {
            let horariosValidos = [];
            let horariosNoValidos = [];
            console.log("HORARIOS", HORARIOS);
            for (let i = 0; i < HORARIOS.length; i++) {
                const HORARIO = HORARIOS[i];
                const horarioVerificado = yield VerificarHorario(HORARIO.CODIGO);
                if (!horarioVerificado[0]) {
                    horariosNoValidos.push(HORARIO);
                    HORARIO.OBSERVACION = 'Horario no valido';
                    // AÑADIR OBSERVACION A HORARIO
                    dias[dia].HORARIOS[i].OBSERVACION = 'Horario no valido';
                }
                else {
                    dias[dia].HORARIOS[i].OBSERVACION = 'OK';
                    horariosValidos.push(horarioVerificado[1]);
                }
            }
            dias[dia].OBSERVACION = horariosNoValidos.length > 0 ? `Horarios no validos: ${horariosNoValidos.join(', ')}` : 'OK';
            if (horariosValidos.length > 0) {
                dias[dia].OBSERVACION = (yield VerificarSobreposicionHorariosPlantilla(horariosValidos)) ? 'Rango de horario similares' : 'OK';
            }
        }
        return dias;
    });
}
// FUNCION PARA VERIFICAR EXISTENCIA DE HORARIO EN LA BASE DE DATOS
function VerificarHorario(CODIGO) {
    return __awaiter(this, void 0, void 0, function* () {
        const horario = yield database_1.default.query('SELECT * FROM cg_horarios WHERE LOWER(codigo) = $1', [CODIGO.toLowerCase()]);
        // SI EXISTE HORARIO VERIFICAR SI horario.hora_trabajo este en formato hh:mm:ss
        const existe = horario.rowCount > 0;
        if (existe) {
            const formatoHora = /^\d{2}:[0-5][0-9]:[0-5][0-9]$/;
            return [formatoHora.test(horario.rows[0].hora_trabajo), horario.rows[0]];
        }
        return [existe, null];
    });
}
function VerificarSobreposicionHorariosPlantilla(horarios) {
    return __awaiter(this, void 0, void 0, function* () {
        const detallesHorarios = yield database_1.default.query(`SELECT * FROM deta_horarios WHERE id_horario IN (${horarios.map((horario) => horario.id).join(',')})`);
        // AÑADIR A LOS HORARIOS LOS DETALLES DE HORARIOS
        horarios.forEach((horario) => {
            horario.detalles = detallesHorarios.rows.filter((detalle) => detalle.id_horario === horario.id);
            horario.entrada = horario.detalles.find((detalle) => detalle.tipo_accion === 'E');
            horario.salida = horario.detalles.find((detalle) => detalle.tipo_accion === 'S');
            // Convertir las horas a minutos desde la medianoche
            horario.entrada.minutos = ConvertirHoraAMinutos(horario.entrada.hora);
            horario.salida.minutos = ConvertirHoraAMinutos(horario.salida.hora);
        });
        console.log("horarios", horarios);
        // VERIFICAR SOBREPOSICIÓN DE HORARIOS
        for (let i = 0; i < horarios.length; i++) {
            for (let j = i + 1; j < horarios.length; j++) {
                const horario1 = horarios[i];
                const horario2 = horarios[j];
                // Si la salida del horario1 es al día siguiente, consideramos que la salida es mayor que la entrada
                // const salida1 = horario1.salida.segundo_dia ? horario1.salida.minutos + 24 * 60 : horario1.salida.minutos;
                // const salida2 = horario2.salida.segundo_dia ? horario2.salida.minutos + 24 * 60 : horario2.salida.minutos;
                // verificar salida al tercer y segundo dia
                const salida1 = horario1.salida.tercer_dia ? horario1.salida.minutos + 48 * 60 : (horario1.salida.segundo_dia ? horario1.salida.minutos + 24 * 60 : horario1.salida.minutos);
                const salida2 = horario2.salida.tercer_dia ? horario2.salida.minutos + 48 * 60 : (horario2.salida.segundo_dia ? horario2.salida.minutos + 24 * 60 : horario2.salida.minutos);
                // Verificar si los horarios se Sobreponen
                if ((horario2.entrada.minutos >= horario1.entrada.minutos && horario2.entrada.minutos <= salida1) ||
                    (salida2 <= salida1 && salida2 >= horario1.entrada.minutos)) {
                    return true; // Existe una sobreposición
                }
            }
        }
        return false; // No existe ninguna sobreposición
    });
}
// Función para convertir una hora en formato "hh:mm:ss" a minutos desde la medianoche
function ConvertirHoraAMinutos(hora) {
    const partes = hora.split(':');
    const horas = parseInt(partes[0]);
    const minutos = parseInt(partes[1]);
    return horas * 60 + minutos;
}
exports.PLANIFICACION_HORARIA_CONTROLADOR = new PlanificacionHorariaControlador();
exports.default = exports.PLANIFICACION_HORARIA_CONTROLADOR;
