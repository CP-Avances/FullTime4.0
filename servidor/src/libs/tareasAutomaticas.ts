import cron, { ScheduledTask } from "node-cron";
import pool from "../database";
import { atrasosDiarios, atrasosDiariosIndividual, atrasosSemanal } from "./sendAtraso";

class TareasAutomaticas {
  private parametroAtrasosDiarios: string;
  private parametroHoraAtrasosDiarios: string;
  private parametroHoraAtrasosIndividuales: string;

  private parametroAtrasosSemanal: string;
  private parametroDiaAtrasosSemanal: string;
  private parametroHoraAtrasosSemanal: string;

  private tareaAtrasosDiarios: ScheduledTask | null = null;
  private tareaAtrasosSemanal: ScheduledTask | null = null;
  private tareaAtrasosIndividuales: ScheduledTask | null = null;

  constructor() {
    this.parametroAtrasosDiarios = "";
    this.parametroHoraAtrasosDiarios = "";
    this.parametroHoraAtrasosIndividuales = "";
    this.parametroAtrasosSemanal = "";
    this.parametroDiaAtrasosSemanal = "";
    this.parametroHoraAtrasosSemanal = "";
  }

  public async iniciarTareasAutomaticas() {
    console.log("Iniciando tareas automáticas...");
    this.programarEnvioAtrasosDiarios();
    this.programarEnvioAtrasosIndividuales();
    this.programarEnvioAtrasosSemanales();
  }

  public detenerTareasAutomaticas() {
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
  private async programarEnvioAtrasosDiarios() {
    try {
      // PARAMETRO 10 INDICA SI ESTA ACTIVO EL ENVIO DE ATRASOS DIARIOS
      this.parametroAtrasosDiarios = await this.consultarDetalleParametros(10);
      // PARAMETRO 11 INDICA LA HORA EN QUE SE ENVIAN LOS ATRASOS DIARIOS
      this.parametroHoraAtrasosDiarios = await this.consultarDetalleParametros(11);
      
      if (!this.parametroAtrasosDiarios || this.parametroAtrasosDiarios != 'Si') return;
      if (!this.parametroHoraAtrasosDiarios) return;

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

        this.tareaAtrasosDiarios = cron.schedule(horaCron, async () => {
          try {
            // Aquí va la lógica para enviar los atrasos diarios
            console.log("Enviando atrasos diarios...");
            // Llama a la función que maneja el envío de atrasos diarios
            atrasosDiarios();
          } catch (error) {
            throw new Error("Error al enviar atrasos diarios");
          }
        });

      } else {
        console.error("Hora inválida para cron:", this.parametroHoraAtrasosDiarios);
        throw new Error("Hora inválida para cron");
      }

    } catch (error) {
      console.error("Error al programar el envío de atrasos diarios:", error);
    }
  }

  /*
    * Método para actualizar la tarea de envío de atrasos diarios.
    * Este método detiene la tarea actual y programa una nueva.
  */
  public async actualizarEnvioAtrasosDiarios() {
    if (this.tareaAtrasosDiarios) {
      this.tareaAtrasosDiarios.stop();
      this.tareaAtrasosDiarios = null;
    }

    this.programarEnvioAtrasosDiarios();
  }

  /*
    * Método para programar el envío de atrasos individuales.
    * Este método consulta los parámetros necesarios y programa una tarea cron
    * para enviar los atrasos individuales a la hora especificada.
  */
  private async programarEnvioAtrasosIndividuales() {

    try {
      // PARAMETRO 34 INDICA LA HORA EN QUE SE ENVIAN LOS ATRASOS INDIVIDUALES
      this.parametroHoraAtrasosIndividuales = await this.consultarDetalleParametros(34);
  
      if (!this.parametroHoraAtrasosIndividuales) return;

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
        this.tareaAtrasosIndividuales = cron.schedule(horaCron, async () => {
          try {
            // Aquí va la lógica para enviar los atrasos individuales
            console.log("Enviando atrasos individuales...");
            // Llama a la función que maneja el envío de atrasos individuales
            atrasosDiariosIndividual();
          }
          catch (error) {
            throw new Error("Error al enviar atrasos individuales");
          }
        });
      } else {
        console.error("Hora inválida para cron:", this.parametroHoraAtrasosIndividuales);
        throw new Error("Hora inválida para cron");
      }
      
    } catch (error) {
      console.error("Error al programar el envío de atrasos individuales:", error);
    }
  }

  /*
    * Método para actualizar la tarea de envío de atrasos individuales.
    * Este método detiene la tarea actual y programa una nueva.
  */
  public async actualizarEnvioAtrasosIndividuales() {
    if (this.tareaAtrasosIndividuales) {
      this.tareaAtrasosIndividuales.stop();
      this.tareaAtrasosIndividuales = null;
    }
    this.programarEnvioAtrasosIndividuales();
  }

  /*
    * Método para programar el envío de atrasos semanales.
    * Este método consulta los parámetros necesarios y programa una tarea cron
    * para enviar los atrasos semanales a la hora y día especificados.
  */
  private async programarEnvioAtrasosSemanales() {
    try {
      // PARAMETRO 13 INDICA INDICA SI ESTA ACTIVO EL ENVIO ATRASOS SEMANALES
      this.parametroAtrasosSemanal = await this.consultarDetalleParametros(13);
      // PARAMETRO 14 INDICA LA HORA EN QUE SE ENVIAN LOS ATRASOS SEMANALES
      this.parametroHoraAtrasosSemanal = await this.consultarDetalleParametros(14);
      // PARAMETRO 15 INDICA EL DIA EN QUE SE ENVIAN LOS ATRASOS SEMANALES
      this.parametroDiaAtrasosSemanal = await this.consultarDetalleParametros(15);

      if (!this.parametroAtrasosSemanal || this.parametroAtrasosSemanal != 'Si') return;
      if (!this.parametroHoraAtrasosSemanal || !this.parametroDiaAtrasosSemanal) return;
      
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
        this.tareaAtrasosSemanal = cron.schedule(horaCron, async () => {
          try {
            // Aquí va la lógica para enviar los atrasos semanales
            console.log("Enviando atrasos semanales...");
            // Llama a la función que maneja el envío de atrasos semanales
            atrasosSemanal();
          } catch (error) {
            throw new Error("Error al enviar atrasos semanales");
          }
        });
      }
      else {
        console.error("Hora o día inválido para cron:", this.parametroHoraAtrasosSemanal, this.parametroDiaAtrasosSemanal);
        throw new Error("Hora o día inválido para cron");
      }
      
    } catch (error) {
      console.error("Error al programar el envío de atrasos semanales:", error);
    }
  }

  /*
    * Método para actualizar la tarea de envío de atrasos semanales.
    * Este método detiene la tarea actual y programa una nueva.
  */
  public async actualizarEnvioAtrasosSemanales() {
    if (this.tareaAtrasosDiarios) {
      this.tareaAtrasosDiarios.stop();
      this.tareaAtrasosDiarios = null;
    }

    this.programarEnvioAtrasosSemanales();
  }

  /*
    * Método para consultar el detalle de los parámetros.
    * Este método realiza una consulta a la base de datos para obtener la descripción
    * del parámetro especificado por su ID.
  */
  private async consultarDetalleParametros(idParametro: number) {
  try {
      const sql = `SELECT descripcion FROM ep_detalle_parametro WHERE id_parametro = $1`;
      const rows = await pool.query(sql, [idParametro]);
      
      return rows.rows[0]?.descripcion || null;
  } catch (error) {
    console.error("Error al consultar detalle de parámetros:", error);
  }
  }
}

export const tareasAutomaticas = new TareasAutomaticas();
export default tareasAutomaticas;