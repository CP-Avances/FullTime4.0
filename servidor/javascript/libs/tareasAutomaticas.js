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
exports.tareasAutomaticas = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const database_1 = __importDefault(require("../database"));
const sendAtraso_1 = require("./sendAtraso");
class TareasAutomaticas {
    constructor() {
        this.tareaAtrasosDiarios = null;
        this.tareaAtrasosSemanal = null;
        this.tareaAtrasosIndividuales = null;
        this.parametroAtrasosDiarios = "";
        this.parametroHoraAtrasosDiarios = "";
        this.parametroHoraAtrasosIndividuales = "";
        this.parametroAtrasosSemanal = "";
        this.parametroDiaAtrasosSemanal = "";
        this.parametroHoraAtrasosSemanal = "";
    }
    iniciarTareasAutomaticas() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Iniciando tareas automáticas...");
            this.programarEnvioAtrasosDiarios();
            this.programarEnvioAtrasosIndividuales();
            this.programarEnvioAtrasosSemanales();
        });
    }
    detenerTareasAutomaticas() {
        if (this.tareaAtrasosDiarios) {
            this.tareaAtrasosDiarios.stop();
        }
        if (this.tareaAtrasosIndividuales) {
            this.tareaAtrasosIndividuales.stop();
        }
        if (this.tareaAtrasosSemanal) {
            this.tareaAtrasosSemanal.stop();
        }
    }
    /*
      * Método para programar el envío de atrasos diarios.
      * Este método consulta los parámetros necesarios y programa una tarea cron
      * para enviar los atrasos diarios a la hora especificada.
    */
    programarEnvioAtrasosDiarios() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // PARAMETRO 10 INDICA SI ESTA ACTIVO EL ENVIO DE ATRASOS DIARIOS
                this.parametroAtrasosDiarios = yield this.consultarDetalleParametros(10);
                // PARAMETRO 11 INDICA LA HORA EN QUE SE ENVIAN LOS ATRASOS DIARIOS
                this.parametroHoraAtrasosDiarios = yield this.consultarDetalleParametros(11);
                if (!this.parametroAtrasosDiarios || this.parametroAtrasosDiarios != 'Si')
                    return;
                if (!this.parametroHoraAtrasosDiarios)
                    return;
                let horaCron = null;
                const partes = this.parametroHoraAtrasosDiarios.split(":");
                const hora = parseInt(partes[0], 10);
                const minutos = partes[1] !== undefined ? parseInt(partes[1], 10) : 0;
                const horaValida = !isNaN(hora) && hora >= 0 && hora <= 23;
                const minutosValido = !isNaN(minutos) && minutos >= 0 && minutos <= 59;
                if (horaValida && minutosValido) {
                    horaCron = `${minutos} ${hora} * * *`;
                    if (this.tareaAtrasosDiarios) {
                        this.tareaAtrasosDiarios.stop();
                    }
                    console.log("Programando tarea de atrasos diarios:", horaCron);
                    this.tareaAtrasosDiarios = node_cron_1.default.schedule(horaCron, () => __awaiter(this, void 0, void 0, function* () {
                        try {
                            // Aquí va la lógica para enviar los atrasos diarios
                            console.log("Enviando atrasos diarios...");
                            // Llama a la función que maneja el envío de atrasos diarios
                            (0, sendAtraso_1.atrasosDiarios)();
                        }
                        catch (error) {
                            throw new Error("Error al enviar atrasos diarios");
                        }
                    }));
                }
                else {
                    console.error("Hora inválida para cron:", this.parametroHoraAtrasosDiarios);
                    throw new Error("Hora inválida para cron");
                }
            }
            catch (error) {
                console.error("Error al programar el envío de atrasos diarios:", error);
            }
        });
    }
    /*
      * Método para actualizar la tarea de envío de atrasos diarios.
      * Este método detiene la tarea actual y programa una nueva.
    */
    actualizarEnvioAtrasosDiarios() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.tareaAtrasosDiarios) {
                this.tareaAtrasosDiarios.stop();
                this.tareaAtrasosDiarios = null;
            }
            this.programarEnvioAtrasosDiarios();
        });
    }
    /*
      * Método para programar el envío de atrasos individuales.
      * Este método consulta los parámetros necesarios y programa una tarea cron
      * para enviar los atrasos individuales a la hora especificada.
    */
    programarEnvioAtrasosIndividuales() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // PARAMETRO 34 INDICA LA HORA EN QUE SE ENVIAN LOS ATRASOS INDIVIDUALES
                this.parametroHoraAtrasosIndividuales = yield this.consultarDetalleParametros(34);
                if (!this.parametroHoraAtrasosIndividuales)
                    return;
                let horaCron = null;
                const partes = this.parametroHoraAtrasosIndividuales.split(":");
                const hora = parseInt(partes[0], 10);
                const minutos = partes[1] !== undefined ? parseInt(partes[1], 10) : 0;
                const horaValida = !isNaN(hora) && hora >= 0 && hora <= 23;
                const minutosValido = !isNaN(minutos) && minutos >= 0 && minutos <= 59;
                if (horaValida && minutosValido) {
                    horaCron = `${minutos} ${hora} * * *`;
                    if (this.tareaAtrasosIndividuales) {
                        this.tareaAtrasosIndividuales.stop();
                    }
                    console.log("Programando tarea de atrasos individuales:", horaCron);
                    this.tareaAtrasosIndividuales = node_cron_1.default.schedule(horaCron, () => __awaiter(this, void 0, void 0, function* () {
                        try {
                            // Aquí va la lógica para enviar los atrasos individuales
                            console.log("Enviando atrasos individuales...");
                            // Llama a la función que maneja el envío de atrasos individuales
                            (0, sendAtraso_1.atrasosDiariosIndividual)();
                        }
                        catch (error) {
                            throw new Error("Error al enviar atrasos individuales");
                        }
                    }));
                }
                else {
                    console.error("Hora inválida para cron:", this.parametroHoraAtrasosIndividuales);
                    throw new Error("Hora inválida para cron");
                }
            }
            catch (error) {
                console.error("Error al programar el envío de atrasos individuales:", error);
            }
        });
    }
    /*
      * Método para actualizar la tarea de envío de atrasos individuales.
      * Este método detiene la tarea actual y programa una nueva.
    */
    actualizarEnvioAtrasosIndividuales() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.tareaAtrasosIndividuales) {
                this.tareaAtrasosIndividuales.stop();
                this.tareaAtrasosIndividuales = null;
            }
            this.programarEnvioAtrasosIndividuales();
        });
    }
    /*
      * Método para programar el envío de atrasos semanales.
      * Este método consulta los parámetros necesarios y programa una tarea cron
      * para enviar los atrasos semanales a la hora y día especificados.
    */
    programarEnvioAtrasosSemanales() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // PARAMETRO 13 INDICA INDICA SI ESTA ACTIVO EL ENVIO ATRASOS SEMANALES
                this.parametroAtrasosSemanal = yield this.consultarDetalleParametros(13);
                // PARAMETRO 14 INDICA LA HORA EN QUE SE ENVIAN LOS ATRASOS SEMANALES
                this.parametroHoraAtrasosSemanal = yield this.consultarDetalleParametros(14);
                // PARAMETRO 15 INDICA EL DIA EN QUE SE ENVIAN LOS ATRASOS SEMANALES
                this.parametroDiaAtrasosSemanal = yield this.consultarDetalleParametros(15);
                if (!this.parametroAtrasosSemanal || this.parametroAtrasosSemanal != 'Si')
                    return;
                if (!this.parametroHoraAtrasosSemanal || !this.parametroDiaAtrasosSemanal)
                    return;
                let horaCron = null;
                const partes = this.parametroHoraAtrasosSemanal.split(":");
                const hora = parseInt(partes[0], 10);
                const minutos = partes[1] !== undefined ? parseInt(partes[1], 10) : 0;
                const horaValida = !isNaN(hora) && hora >= 0 && hora <= 23;
                const minutosValido = !isNaN(minutos) && minutos >= 0 && minutos <= 59;
                const diasSemana = [
                    "Domingo",
                    "Lunes",
                    "Martes",
                    "Miércoles",
                    "Jueves",
                    "Viernes",
                    "Sábado"
                ];
                const diaValido = diasSemana.includes(this.parametroDiaAtrasosSemanal);
                // CONVERTIR EL DÍA A SU ÍNDICE CORRESPONDIENTE (0-6)
                const diaIndex = diasSemana.indexOf(this.parametroDiaAtrasosSemanal);
                // VALIDAR QUE EL DÍA ESTÉ EN EL RANGO CORRECTO
                const diaValidoRango = diaIndex >= 0 && diaIndex <= 6;
                if (horaValida && minutosValido && diaValido && diaValidoRango) {
                    horaCron = `${minutos} ${hora} * * ${diaIndex}`;
                    if (this.tareaAtrasosSemanal) {
                        this.tareaAtrasosSemanal.stop();
                    }
                    console.log("Programando tarea de atrasos semanales:", horaCron);
                    this.tareaAtrasosSemanal = node_cron_1.default.schedule(horaCron, () => __awaiter(this, void 0, void 0, function* () {
                        try {
                            // Aquí va la lógica para enviar los atrasos semanales
                            console.log("Enviando atrasos semanales...");
                            // Llama a la función que maneja el envío de atrasos semanales
                            (0, sendAtraso_1.atrasosSemanal)();
                        }
                        catch (error) {
                            throw new Error("Error al enviar atrasos semanales");
                        }
                    }));
                }
                else {
                    console.error("Hora o día inválido para cron:", this.parametroHoraAtrasosSemanal, this.parametroDiaAtrasosSemanal);
                    throw new Error("Hora o día inválido para cron");
                }
            }
            catch (error) {
                console.error("Error al programar el envío de atrasos semanales:", error);
            }
        });
    }
    /*
      * Método para actualizar la tarea de envío de atrasos semanales.
      * Este método detiene la tarea actual y programa una nueva.
    */
    actualizarEnvioAtrasosSemanales() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.tareaAtrasosDiarios) {
                this.tareaAtrasosDiarios.stop();
                this.tareaAtrasosDiarios = null;
            }
            this.programarEnvioAtrasosSemanales();
        });
    }
    /*
      * Método para consultar el detalle de los parámetros.
      * Este método realiza una consulta a la base de datos para obtener la descripción
      * del parámetro especificado por su ID.
    */
    consultarDetalleParametros(idParametro) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const sql = `SELECT descripcion FROM ep_detalle_parametro WHERE id_parametro = $1`;
                const rows = yield database_1.default.query(sql, [idParametro]);
                return ((_a = rows.rows[0]) === null || _a === void 0 ? void 0 : _a.descripcion) || null;
            }
            catch (error) {
                console.error("Error al consultar detalle de parámetros:", error);
            }
        });
    }
}
exports.tareasAutomaticas = new TareasAutomaticas();
exports.default = exports.tareasAutomaticas;
