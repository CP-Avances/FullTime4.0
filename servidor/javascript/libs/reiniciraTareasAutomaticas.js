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
Object.defineProperty(exports, "__esModule", { value: true });
exports.reiniciarTareasAutomaticas = reiniciarTareasAutomaticas;
const tareasAutomaticas_1 = require("./tareasAutomaticas");
// REINICIA DINAMICAMENTE LAS TAREAS QUE USAN EL PARAMETRO AFECTADO.
function reiniciarTareasAutomaticas(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const id_parametro = parseInt(id, 10);
        if (isNaN(id_parametro))
            return;
        console.log(`Reiniciando tareas automáticas para el parámetro con id: ${id_parametro}`);
        for (const tarea of tareasAutomaticas_1.TAREAS) {
            if (tarea.envioId === id_parametro ||
                tarea.horaId === id_parametro ||
                tarea.diaId === id_parametro) {
                tareasAutomaticas_1.tareasAutomaticas.DetenerTarea(tarea.clave);
                yield tareasAutomaticas_1.tareasAutomaticas.EjecutarProgramacionTareas(tarea);
            }
        }
    });
}
