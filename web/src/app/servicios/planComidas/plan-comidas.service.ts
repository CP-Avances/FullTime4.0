import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class PlanComidasService {

  constructor(
    private http: HttpClient,
  ) { }


  ObtenerSolComidaPorIdEmpleado(id_empleado: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/planComidas/infoComida/${id_empleado}`)
  }

  ObtenerSolComidaAprobado() {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/planComidas/infoComida/estado/aprobado`)
  }

  ObtenerSolComidaNegado() {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/planComidas/infoComida/estado/negado`)
  }

  ObtenerSolComidaExpirada() {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/planComidas/infoComida/estado/expirada`)
  }

  /** BUSCAR JEFES */
  obtenerJefes(id_departamento: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/planComidas/enviar/notificacion/${id_departamento}`)
  }

  ObtenerUltimaPlanificacion() {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/planComidas/fin_registro`)
  }

  ObtenerPlanComidaPorIdEmpleado(id_empleado: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/planComidas/infoComida/plan/${id_empleado}`)
  }

  ObtenerPlanComidaPorIdPlan(id: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/planComidas/comida-empleado/plan/${id}`)
  }


  ActualizarDatos(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/planComidas`, datos);
  }



  EncontrarPlanComidaEmpleadoConsumido(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/planComidas/empleado/plan/consumido`, datos);
  }

  BuscarDuplicadosFechas(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/planComidas/duplicidad/plan`, datos);
  }

  BuscarDuplicadosSolicitudFechas(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/planComidas/duplicidad/solicitud`, datos);
  }

  BuscarDuplicadosFechasActualizar(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/planComidas/duplicidad/actualizar/plan`, datos);
  }

  BuscarDuplicadosSolFechasActualizar(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/planComidas/duplicidad/actualizar/sol`, datos);
  }



  // SERVICIO PARA OBTENER DATOS DE LA TABLA TIPO_COMIDA 
  CrearTipoComidas(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/planComidas/tipo_comida`, datos);
  }

  ObtenerTipoComidas() {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/planComidas/tipo_comida`)
  }

  ObtenerUltimoTipoComidas() {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/planComidas/tipo_comida/ultimo`)
  }



  ObtenerPlanComidas() {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/planComidas`)
  }



  /** ********************************************************************************************* **
   ** **              METODOS DE MANEJO DE SOLICTUDES DE SERVICIO DE ALIMENTACION                ** **
   ** ********************************************************************************************* **/

  // CREAR SOLICITUD DE ALIMENTACION
  CrearSolicitudComida(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/planComidas/solicitud`, datos);
  }
  // EDITAR SOLICITUD DE SERVICIO DE ALIMENTACION
  ActualizarSolicitudComida(datos: any) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/planComidas/actualizar-solicitud`, datos);
  }
  // EDITAR ESTADO DE SOLICITUD DE COMIDA
  AprobarComida(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/planComidas/solicitud-comida/estado`, datos);
  }
  // ELIMINAR REGISTRO DE SOLICITUD DE SERVICIO DE ALIMENTACION
  EliminarSolicitud(id: number) {
    return this.http.delete(`${(localStorage.getItem('empresaURL') as string)}/planComidas/eliminar/sol-comida/${id}`);
  }


  /** ********************************************************************************************** **
   ** **               METODO DE MANEJO DE PLANIFICACIONES DE ALIMENTACION                        ** ** 
   ** ********************************************************************************************** **/

  // CREAR PLANIIFCACIÓN DE SERVICIO DE ALIMENTACION
  CrearPlanComidas(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/planComidas/`, datos);
  }
  // CREAR ALIMENTACION APROBADA
  CrearComidaAprobada(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/planComidas/empleado/solicitud`, datos);
  }
  // ELIMINAR PLANIFICACION DE ALIMENTACION
  EliminarComidaAprobada(id: number, fecha: any, id_empleado: number) {
    return this.http.delete(`${(localStorage.getItem('empresaURL') as string)}/planComidas/eliminar/plan-solicitud/${id}/${fecha}/${id_empleado}`);
  }
  // ELIMINAR REGISTRO DE PLANIFICACION
  EliminarRegistro(id: number) {
    return this.http.delete(`${(localStorage.getItem('empresaURL') as string)}/planComidas/eliminar/${id}`);
  }
  // ELIMINAR PLANIFICACIÓN DE ALIMENTACIÓN DE UN USUARIO
  EliminarPlanComida(id: number, id_empleado: number) {
    return this.http.delete(`${(localStorage.getItem('empresaURL') as string)}/planComidas/eliminar/plan-comida/${id}/${id_empleado}`);
  }
  // CREAR PLANIFICACION DE SERVICIO DE ALIMENTACION PARA EMPLEADO
  CrearPlanComidasEmpleado(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/planComidas/empleado/plan`, datos);
  }

   // METODO PARA CREAR ARCHIVO XML
   CrearXML(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/planComidas/xmlDownload`, data);
  }


  /** *********************************************************************************************** **
   ** **              METODO DE ENVIO DE NOTIFICACIONES DE SERVICIOS DE ALIMENTACION               ** **
   ** *********************************************************************************************** **/

  // ALERTAS DE NOTIFICACIÓN DE SOLICITUD Y PLANIFICACIÓN DE SERVICIO DE ALIMENTACIÓN
  EnviarMensajePlanComida(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/planComidas/send/planifica/`, data);
  }
  // ENVIAR CORREO DESDE APLICACION WEB
  EnviarCorreo(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/planComidas/mail-noti`, datos);
  }
  // ENVIAR CORREO DE PLANIFICACION DE ALIMENTACION
  EnviarCorreoPlan(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/planComidas/mail-plan-comida`, datos);
  }

}
