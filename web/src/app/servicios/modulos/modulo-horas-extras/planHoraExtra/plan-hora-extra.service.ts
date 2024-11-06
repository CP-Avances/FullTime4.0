import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class PlanHoraExtraService {

  constructor(
    private http: HttpClient,
  ) { }


  AutorizarTiempoHoraExtra(id: number, hora: any) {
    return this.http.put<any>(`${environment.url}/planificacionHoraExtra/tiempo-autorizado/${id}`, hora);
  }

  ConsultarPlanHoraExtra() {
    return this.http.get(`${environment.url}/planificacionHoraExtra`);
  }

  ConsultarPlanHoraExtraObservacion() {
    return this.http.get(`${environment.url}/planificacionHoraExtra/justificar`);
  }

  ConsultarPlanHoraExtraAutorizada() {
    return this.http.get(`${environment.url}/planificacionHoraExtra/autorizacion`);
  }


  EditarEstado(id: number, datos: any) {
    return this.http.put<any>(`${environment.url}/planificacionHoraExtra/estado/${id}`, datos);
  }


  /** *************************************************************************************************** **
   ** **                    METODOS QUE MANEJAN PLANIFICACION DE HORAS EXTRAS                          ** **
   ** *************************************************************************************************** **/

  // CREAR PLANIFICACION DE HORA EXTRA
  CrearPlanificacionHoraExtra(data: any) {
    return this.http.post<any>(`${environment.url}/planificacionHoraExtra`, data);
  }
  // CONSULTA DE DATOS DE PLANIFICACION DE HORAS EXTRAS
  ConsultarPlanificaciones() {
    return this.http.get(`${environment.url}/planificacionHoraExtra/planificaciones`);
  }
  // CREAR PLANIFICACION DE HORA EXTRA POR USUARIO
  CrearPlanHoraExtraEmpleado(data: any) {
    return this.http.post<any>(`${environment.url}/planificacionHoraExtra/hora_extra_empleado`, data);
  }
  // BUSQUEDA DE DATOS DE PLANIFICACION POR ID DE PLANIFICACION
  BuscarPlanEmpleados(id_plan_hora: number) {
    return this.http.get(`${environment.url}/planificacionHoraExtra/plan_empleado/${id_plan_hora}`);
  }
  // METODO PARA ELIMINAR PLANIFICACION DE HORA EXTRA
  EliminarRegistro(id: number, datos: any) {
    const url = `${environment.url}/planificacionHoraExtra/eliminar/${id}`;
    const httpOptions = {
      body: datos
    };
    return this.http.request('delete', url, httpOptions);
  }
  // ELIMINAR PLANIFICACION DE HORA EXTRA DE UN USUARIO   **USADO
  EliminarPlanEmpleado(id: number, id_empleado: number, datos: any) {
    const url = `${environment.url}/planificacionHoraExtra/eliminar/plan-hora/${id}/${id_empleado}`;
    const httpOptions = {
      body: datos
    };
    return this.http.request('delete', url, httpOptions);
  }

  // BUSQUEDA DE DATOS DE PLANIFICACION POR ID DE USUARIO    ** USADO
  ListarPlanificacionUsuario(id_empleado: number) {
    return this.http.get(`${environment.url}/planificacionHoraExtra/listar-plan/${id_empleado}`);
  }

   // METODO PARA CREAR ARCHIVO XML
   CrearXML(data: any) {
    return this.http.post(`${environment.url}/planificacionHoraExtra/xmlDownload`, data);
  }


  /** *************************************************************************************************** **
   ** *                 ENVIO DE CORREO ELECTRONICO DE PLANIFICACION DE HORAS EXTRAS                    * **
   ****************************************************************************************************** **/

  // CREACIÓN DE PLANIFICACION DE HORAS EXTRAS    **USADO
  EnviarCorreoPlanificacion(data: any) {
    return this.http.post<any>(`${environment.url}/planificacionHoraExtra/send/correo-planifica/`, data);
  }


  /** *************************************************************************************************** **
   ** *                 ENVIO DE NOTIFICACIONES DE PLANIFICACION DE HORAS EXTRAS                    * **
   ****************************************************************************************************** **/

  // CREACION DE PLANIFICACION DE HORAS EXTRAS   **USADO
  EnviarNotiPlanificacion(data: any) {
    return this.http.post<any>(`${environment.url}/planificacionHoraExtra/send/noti-planifica`, data);
  }

  BuscarDatosAutorizacion(id_hora_extra: number) {
    return this.http.get(`${environment.url}/planificacionHoraExtra/datosAutorizacion/${id_hora_extra}`);
  }


}
