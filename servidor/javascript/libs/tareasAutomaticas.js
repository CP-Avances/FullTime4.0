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
exports.tareasAutomaticas = exports.TAREAS = exports.IDParametros = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const database_1 = __importDefault(require("../database"));
const sendAtraso_1 = require("./sendAtraso");
const sendFaltas_1 = require("./sendFaltas");
const sendSalidasAnticipadas_1 = require("./sendSalidasAnticipadas");
// ENUMERACION DE IDS DE PARAMETROS
var IDParametros;
(function (IDParametros) {
    /** *************************************************************************************** **
     **                                PARAMETROS DE ATRASOS                                 ** **
     ** *************************************************************************************** **/
    IDParametros[IDParametros["ENVIA_ATRASOS_DIARIO"] = 10] = "ENVIA_ATRASOS_DIARIO";
    IDParametros[IDParametros["HORA_ATRASOS_DIARIO"] = 11] = "HORA_ATRASOS_DIARIO";
    IDParametros[IDParametros["ENVIA_ATRASOS_SEMANAL"] = 13] = "ENVIA_ATRASOS_SEMANAL";
    IDParametros[IDParametros["HORA_ATRASOS_SEMANAL"] = 14] = "HORA_ATRASOS_SEMANAL";
    IDParametros[IDParametros["DIA_ATRASOS_SEMANAL"] = 15] = "DIA_ATRASOS_SEMANAL";
    IDParametros[IDParametros["HORA_ATRASOS_INDIVIDUAL"] = 34] = "HORA_ATRASOS_INDIVIDUAL";
    /** *************************************************************************************** **
     **                                PARAMETROS DE FALTAS                                  ** **
     ** *************************************************************************************** **/
    IDParametros[IDParametros["ENVIA_FALTAS_DIARIO"] = 17] = "ENVIA_FALTAS_DIARIO";
    IDParametros[IDParametros["HORA_FALTAS_DIARIO"] = 18] = "HORA_FALTAS_DIARIO";
    IDParametros[IDParametros["ENVIA_FALTAS_SEMANAL"] = 20] = "ENVIA_FALTAS_SEMANAL";
    IDParametros[IDParametros["HORA_FALTAS_SEMANAL"] = 21] = "HORA_FALTAS_SEMANAL";
    IDParametros[IDParametros["DIA_FALTAS_SEMANAL"] = 22] = "DIA_FALTAS_SEMANAL";
    IDParametros[IDParametros["HORA_FALTAS_INDIVIDUAL"] = 33] = "HORA_FALTAS_INDIVIDUAL";
    /** *************************************************************************************** **
     **                       PARAMETROS DE SALIDAS ANTICIPADAS                              ** **
     ** *************************************************************************************** **/
    IDParametros[IDParametros["ENVIA_SALIDASA_DIARIO"] = 26] = "ENVIA_SALIDASA_DIARIO";
    IDParametros[IDParametros["HORA_SALIDASA_DIARIO"] = 27] = "HORA_SALIDASA_DIARIO";
    IDParametros[IDParametros["ENVIA_SALIDASA_SEMANAL"] = 29] = "ENVIA_SALIDASA_SEMANAL";
    IDParametros[IDParametros["HORA_SALIDASA_SEMANAL"] = 30] = "HORA_SALIDASA_SEMANAL";
    IDParametros[IDParametros["DIA_SALIDASA_SEMANAL"] = 31] = "DIA_SALIDASA_SEMANAL";
    IDParametros[IDParametros["HORA_SALIDASA_INDIVIDUAL"] = 35] = "HORA_SALIDASA_INDIVIDUAL";
})(IDParametros || (exports.IDParametros = IDParametros = {}));
const dias = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
];
// FUNCION PARA DAR FORMATO AL CRON (PROGRAMADOR DE TAREAS)
function toCron(horaRegistrada, nombreDia) {
    const [hora, minuto = "0"] = horaRegistrada.split(":");
    const horaCron = +hora, minutosCron = +minuto;
    if (horaCron < 0 || horaCron > 23 || minutosCron < 0 || minutosCron > 59)
        return null;
    if (nombreDia) {
        const diaIndex = dias.indexOf(nombreDia);
        if (diaIndex === -1)
            return null;
        return `${minutosCron} ${horaCron} * * ${diaIndex}`;
    }
    return `${minutosCron} ${horaCron} * * *`;
}
// DECLARACION DE LAS TAREAS AUTOMATICAS
exports.TAREAS = [
    {
        clave: "ATRASOS_DIARIO",
        envioId: IDParametros.ENVIA_ATRASOS_DIARIO,
        horaId: IDParametros.HORA_ATRASOS_DIARIO,
        task: sendAtraso_1.atrasosDiarios,
    },
    {
        clave: "ATRASOS_INDIVIDUAL",
        horaId: IDParametros.HORA_ATRASOS_INDIVIDUAL,
        task: sendAtraso_1.atrasosDiariosIndividual,
    },
    {
        clave: "ATRASOS_SEMANAL",
        envioId: IDParametros.ENVIA_ATRASOS_SEMANAL,
        horaId: IDParametros.HORA_ATRASOS_SEMANAL,
        diaId: IDParametros.DIA_ATRASOS_SEMANAL,
        task: sendAtraso_1.atrasosSemanal,
    },
    {
        clave: "FALTAS_DIARIO",
        envioId: IDParametros.ENVIA_FALTAS_DIARIO,
        horaId: IDParametros.HORA_FALTAS_DIARIO,
        task: sendFaltas_1.faltasDiarios,
    },
    {
        clave: "FALTAS_INDIVIDUAL",
        horaId: IDParametros.HORA_FALTAS_INDIVIDUAL,
        task: sendFaltas_1.faltasDiariosIndividual,
    },
    {
        clave: "FALTAS_SEMANAL",
        envioId: IDParametros.ENVIA_FALTAS_SEMANAL,
        horaId: IDParametros.HORA_FALTAS_SEMANAL,
        diaId: IDParametros.DIA_FALTAS_SEMANAL,
        task: sendFaltas_1.faltasSemanal,
    },
    {
        clave: "SALIDASA_DIARIO",
        envioId: IDParametros.ENVIA_SALIDASA_DIARIO,
        horaId: IDParametros.HORA_SALIDASA_DIARIO,
        task: sendSalidasAnticipadas_1.salidasAnticipadasDiarios,
    },
    {
        clave: "SALIDASA_INDIVIDUAL",
        horaId: IDParametros.HORA_SALIDASA_INDIVIDUAL,
        task: sendSalidasAnticipadas_1.salidasADiariosIndividual,
    },
    {
        clave: "SALIDASA_SEMANAL",
        envioId: IDParametros.ENVIA_SALIDASA_SEMANAL,
        horaId: IDParametros.HORA_SALIDASA_SEMANAL,
        diaId: IDParametros.DIA_SALIDASA_SEMANAL,
        task: sendSalidasAnticipadas_1.salidasAnticipadasSemanal,
    },
];
// CLASE PRINCIPAL DE TAREAS
class TareasAutomaticas {
    constructor() {
        this.tareas = new Map();
    }
    param(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const res = yield database_1.default.query("SELECT descripcion FROM ep_detalle_parametro WHERE id_parametro=$1 LIMIT 1", [id]);
            return (_b = (_a = res.rows[0]) === null || _a === void 0 ? void 0 : _a.descripcion) !== null && _b !== void 0 ? _b : null;
        });
    }
    // METODO PARA INICIRA TAREA
    IniciarTarea() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Configurando tareas automáticas...");
            for (const j of exports.TAREAS)
                yield this.ProgramarTareas(j);
        });
    }
    // METOOD PARA DETENER TODAS LAS TAREAS
    DetenerTareasALL() {
        for (const t of this.tareas.values())
            t.stop();
        this.tareas.clear();
    }
    // METODO PARA DETENER UNA TAREA
    DetenerTarea(clave) {
        const tarea = this.tareas.get(clave);
        if (tarea) {
            tarea.stop();
            this.tareas.delete(clave);
            console.log(`Tarea detenida: ${clave}`);
        }
    }
    // METODO PARA EJECUTAR PROGRAMACION DE TAREAS
    EjecutarProgramacionTareas(cfg) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ProgramarTareas(cfg);
        });
    }
    // METODO PARA PROGRAMAR TAREAS
    ProgramarTareas(configurar) {
        return __awaiter(this, void 0, void 0, function* () {
            if (configurar.envioId && (yield this.param(configurar.envioId)) !== "Si")
                return;
            const tiempoRegistrado = yield this.param(configurar.horaId);
            if (!tiempoRegistrado)
                return;
            const diaRegistrado = configurar.diaId ? yield this.param(configurar.diaId) : undefined;
            const diaEnvio = diaRegistrado !== null && diaRegistrado !== void 0 ? diaRegistrado : undefined;
            const expr = toCron(tiempoRegistrado, diaEnvio);
            if (!expr || !node_cron_1.default.validate(expr)) {
                console.error(`Cron inválido para ${configurar.clave}: ${expr}`);
                return;
            }
            console.log(`${configurar.clave} → ${expr}`);
            const tarea = node_cron_1.default.schedule(expr, () => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield configurar.task();
                }
                catch (e) {
                    console.error(`Error ejecutando ${configurar.clave}:`, e);
                }
            }));
            this.tareas.set(configurar.clave, tarea);
        });
    }
}
exports.tareasAutomaticas = new TareasAutomaticas();
exports.default = exports.tareasAutomaticas;
