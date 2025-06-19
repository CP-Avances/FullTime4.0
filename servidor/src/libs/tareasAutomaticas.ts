import cron, { ScheduledTask } from "node-cron";
import pool from "../database";

import {
  atrasosDiarios,
  atrasosDiariosIndividual,
  atrasosSemanal,
} from "./sendAtraso";

import {
  faltasDiarios,
  faltasDiariosIndividual,
  faltasSemanal,
} from "./sendFaltas";
import { salidasADiariosIndividual, salidasAnticipadasDiarios, salidasAnticipadasSemanal } from "./sendSalidasAnticipadas";

import { cumpleanios } from "./sendBirthday";
import { aniversario } from "./sendAniversario";

// ENUMERACION DE IDS DE PARAMETROS
export enum IDParametros {

  /** *************************************************************************************** **
   **                                PARAMETROS DE ATRASOS                                 ** ** 
   ** *************************************************************************************** **/

  ENVIA_ATRASOS_DIARIO = 10,         // PARAMETRO ENVIO DE ATRASOS DIARIO
  HORA_ATRASOS_DIARIO = 11,          // PARAMETRO HORA DE ENVIO DE ATRASOS DIARIO JEFES
  ENVIA_ATRASOS_SEMANAL = 13,        // PARAMETRO ENVIO DE ATRASOS SEMANAL
  HORA_ATRASOS_SEMANAL = 14,         // PARAMETRO HORA DE ENVIO DE ATRASOS SEMANAL
  DIA_ATRASOS_SEMANAL = 15,          // PARAMETRO DIA DE ENVIO DE ATRASOS SEMANAL
  HORA_ATRASOS_INDIVIDUAL = 34,      // PARAMETRO HORA DE ENVIO DE ATRASOS INDIVIDUAL

  /** *************************************************************************************** **
   **                                PARAMETROS DE FALTAS                                  ** ** 
   ** *************************************************************************************** **/

  ENVIA_FALTAS_DIARIO = 17,          // PARAMETRO ENVIO DE FALTAS DIARIO
  HORA_FALTAS_DIARIO = 18,           // PARAMETRO HORA DE ENVIO DE FALTAS DIARIO JEFES
  ENVIA_FALTAS_SEMANAL = 20,         // PARAMETRO ENVIO DE FALTAS SEMANAL
  HORA_FALTAS_SEMANAL = 21,          // PARAMETRO HORA DE ENVIO DE FALTAS SEMANAL
  DIA_FALTAS_SEMANAL = 22,           // PARAMETRO DIA DE ENVIO DE FALTAS SEMANAL
  HORA_FALTAS_INDIVIDUAL = 33,       // PARAMETRO HORA DE ENVIO DE FALTAS INDIVIDUAL

  /** *************************************************************************************** **
   **                       PARAMETROS DE SALIDAS ANTICIPADAS                              ** ** 
   ** *************************************************************************************** **/

  ENVIA_SALIDASA_DIARIO = 26,          // PARAMETRO ENVIO DE SALIDAS ANTICIPADAS DIARIO
  HORA_SALIDASA_DIARIO = 27,           // PARAMETRO HORA DE ENVIO DE SALIDAS ANTICIPADAS DIARIO JEFES
  ENVIA_SALIDASA_SEMANAL = 29,         // PARAMETRO ENVIO DE SALIDAS ANTICIPADAS SEMANAL
  HORA_SALIDASA_SEMANAL = 30,          // PARAMETRO HORA DE ENVIO DE SALIDAS ANTICIPADAS SEMANAL
  DIA_SALIDASA_SEMANAL = 31,           // PARAMETRO DIA DE ENVIO DE SALIDAS ANTICIPADAS SEMANAL
  HORA_SALIDASA_INDIVIDUAL = 35,       // PARAMETRO HORA DE ENVIO DE SALIDAS ANTICIPADAS INDIVIDUAL


  /** *************************************************************************************** **
   **                           PARAMETROS DE CUMPLEANIOS                                  ** ** 
   ** *************************************************************************************** **/
  ENVIA_CUMPLEANIOS = 8,          // PARAMETRO ENVIO DE CUMPLEANIOS
  HORA_CUMPLEANIOS = 9,           // PARAMETRO HORA DE ENVIO DE CUMPLEANIOS

  /** *************************************************************************************** **
   **                           PARAMETROS DE ANIVERSARIO                                 ** ** 
   ** *************************************************************************************** **/
  ENVIA_ANIVERSARIO = 24,          // PARAMETRO ENVIO DE ANIVERSARIO
  HORA_ANIVERSARIO = 25,           // PARAMETRO HORA DE ENVIO DE ANIVERSARIO
}

// TIPO DE CONFIGURACION PARA CADA TAREA
export type configurarTarea = {
  clave: string;
  envioId?: IDParametros;
  horaId: IDParametros;
  diaId?: IDParametros;
  task: () => Promise<void>;
};

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
function toCron(horaRegistrada: string, nombreDia?: string): string | null {
  const [hora, minuto = "0"] = horaRegistrada.split(":");

  const horaCron = +hora,
    minutosCron = +minuto;

  if (horaCron < 0 || horaCron > 23 || minutosCron < 0 || minutosCron > 59) return null;

  if (nombreDia) {
    const diaIndex = dias.indexOf(nombreDia);
    if (diaIndex === -1) return null;
    return `${minutosCron} ${horaCron} * * ${diaIndex}`;
  }
  return `${minutosCron} ${horaCron} * * *`;
}

// DECLARACION DE LAS TAREAS AUTOMATICAS
export const TAREAS: configurarTarea[] = [
  {
    clave: "ATRASOS_DIARIO",
    envioId: IDParametros.ENVIA_ATRASOS_DIARIO,
    horaId: IDParametros.HORA_ATRASOS_DIARIO,
    task: atrasosDiarios,
  },
  {
    clave: "ATRASOS_INDIVIDUAL",
    horaId: IDParametros.HORA_ATRASOS_INDIVIDUAL,
    task: atrasosDiariosIndividual,
  },
  {
    clave: "ATRASOS_SEMANAL",
    envioId: IDParametros.ENVIA_ATRASOS_SEMANAL,
    horaId: IDParametros.HORA_ATRASOS_SEMANAL,
    diaId: IDParametros.DIA_ATRASOS_SEMANAL,
    task: atrasosSemanal,
  },
  {
    clave: "FALTAS_DIARIO",
    envioId: IDParametros.ENVIA_FALTAS_DIARIO,
    horaId: IDParametros.HORA_FALTAS_DIARIO,
    task: faltasDiarios,
  },
  {
    clave: "FALTAS_INDIVIDUAL",
    horaId: IDParametros.HORA_FALTAS_INDIVIDUAL,
    task: faltasDiariosIndividual,
  },
  {
    clave: "FALTAS_SEMANAL",
    envioId: IDParametros.ENVIA_FALTAS_SEMANAL,
    horaId: IDParametros.HORA_FALTAS_SEMANAL,
    diaId: IDParametros.DIA_FALTAS_SEMANAL,
    task: faltasSemanal,
  },
  {
    clave: "SALIDASA_DIARIO",
    envioId: IDParametros.ENVIA_SALIDASA_DIARIO,
    horaId: IDParametros.HORA_SALIDASA_DIARIO,
    task: salidasAnticipadasDiarios,
  },
  {
    clave: "SALIDASA_INDIVIDUAL",
    horaId: IDParametros.HORA_SALIDASA_INDIVIDUAL,
    task: salidasADiariosIndividual,
  },
  {
    clave: "SALIDASA_SEMANAL",
    envioId: IDParametros.ENVIA_SALIDASA_SEMANAL,
    horaId: IDParametros.HORA_SALIDASA_SEMANAL,
    diaId: IDParametros.DIA_SALIDASA_SEMANAL,
    task: salidasAnticipadasSemanal,
  },
  {
    clave: "CUMPLEANIOS",
    envioId: IDParametros.ENVIA_CUMPLEANIOS,
    horaId: IDParametros.HORA_CUMPLEANIOS,
    task: cumpleanios,
  },
  {
    clave: "ANIVERSARIO",
    envioId: IDParametros.ENVIA_ANIVERSARIO,
    horaId: IDParametros.HORA_ANIVERSARIO,
    task: aniversario,
  },
];


// CLASE PRINCIPAL DE TAREAS
class TareasAutomaticas {
  private tareas = new Map<string, ScheduledTask>();

  private async param(id: IDParametros): Promise<string | null> {
    const res = await pool.query<{ descripcion: string }>(
      "SELECT descripcion FROM ep_detalle_parametro WHERE id_parametro=$1 LIMIT 1",
      [id]
    );
    return res.rows[0]?.descripcion ?? null;
  }

  // METODO PARA INICIRA TAREA
  public async IniciarTarea(): Promise<void> {
    console.log("Configurando tareas automáticas...");
    for (const j of TAREAS) await this.ProgramarTareas(j);
  }

  // METOOD PARA DETENER TODAS LAS TAREAS
  public DetenerTareasALL(): void {
    for (const t of this.tareas.values()) t.stop();
    this.tareas.clear();
  }

  // METODO PARA DETENER UNA TAREA
  public DetenerTarea(clave: string): void {
    const tarea = this.tareas.get(clave);
    if (tarea) {
      tarea.stop();
      this.tareas.delete(clave);
      console.log(`Tarea detenida: ${clave}`);
    }
  }

  // METODO PARA EJECUTAR PROGRAMACION DE TAREAS
  public async EjecutarProgramacionTareas(cfg: configurarTarea): Promise<void> {
    await this.ProgramarTareas(cfg);
  }

  // METODO PARA PROGRAMAR TAREAS
  private async ProgramarTareas(configurar: configurarTarea): Promise<void> {
    if (configurar.envioId && (await this.param(configurar.envioId)) !== "Si") return;

    const tiempoRegistrado = await this.param(configurar.horaId);
    if (!tiempoRegistrado) return;

    const diaRegistrado = configurar.diaId ? await this.param(configurar.diaId) : undefined;
    const diaEnvio = diaRegistrado ?? undefined;

    const expr = toCron(tiempoRegistrado, diaEnvio);
    if (!expr || !cron.validate(expr)) {
      console.error(`Cron inválido para ${configurar.clave}: ${expr}`);
      return;
    }

    console.log(`${configurar.clave} → ${expr}`);
    const tarea = cron.schedule(expr, async () => {
      try {
        await configurar.task();
      } catch (e) {
        console.error(`Error ejecutando ${configurar.clave}:`, e);
      }
    });

    this.tareas.set(configurar.clave, tarea);
  }
}

export const tareasAutomaticas = new TareasAutomaticas();
export default tareasAutomaticas;
