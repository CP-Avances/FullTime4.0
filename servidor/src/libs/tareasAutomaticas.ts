import cron, { ScheduledTask } from "node-cron";
import pool from "../database";
import { atrasosDiarios, atrasosDiariosIndividual } from "./sendAtraso";

class TareasAutomaticas {
  private parametroAtrasosDiarios: string;
  private parametroHoraAtrasosDiarios: string;
  private parametroHoraAtrasosIndividuales: string;

  private tareaAtrasosDiarios: ScheduledTask | null = null;
  private tareaAtrasosIndividuales: ScheduledTask | null = null;

  constructor() {
    this.parametroAtrasosDiarios = "";
    this.parametroHoraAtrasosDiarios = "";
    this.parametroHoraAtrasosIndividuales = "";
  }

  public async iniciarTareasAutomaticas() {
    console.log("Iniciando tareas automáticas...");
    this.programarEnvioAtrasosDiarios();
    this.programarEnvioAtrasosIndividuales();
  }

  public detenerTareasAutomaticas() {
    if (this.tareaAtrasosDiarios) {
      this.tareaAtrasosDiarios.stop();
    }
    if (this.tareaAtrasosIndividuales) {
      this.tareaAtrasosIndividuales.stop();
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
      const minutos = partes[1] !== undefined ? parseInt(partes[1], 10) : "*";

      const horaValida = !isNaN(hora) && hora >= 0 && hora <= 23;
      const minutosValido = minutos === "*" || (!isNaN(minutos) && minutos >= 0 && minutos <= 59);

      if (horaValida && minutosValido) {
        horaCron = `${minutos} ${hora} * * *`;

        if (this.tareaAtrasosDiarios) {
          this.tareaAtrasosDiarios.stop();
        }

        console.log("Programando tarea de atrasos diarios a la hora:", horaCron);

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

        console.log("Programando tarea de atrasos individuales a la hora:", horaCron);
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