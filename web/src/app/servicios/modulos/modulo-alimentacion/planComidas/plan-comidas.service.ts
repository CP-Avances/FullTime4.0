
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PlanComidasService {

  constructor(
    private http: HttpClient,
  ) { }

  // METODO PARA CONSULTAR SOLICITUD DE COMIDAS POR ID DE EMPLEADO     **USADO
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

  // METODO PARA CONSULTAR PLANIFICACION DE COMIDAS POR ID DE EMPLEADO   **USADO
  ObtenerPlanComidaPorIdEmpleado(id_empleado: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/planComidas/infoComida/plan/${id_empleado}`)
  }

  ObtenerPlanComidaPorIdPlan(id: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/planComidas/comida-empleado/plan/${id}`)
  }

  // METODO PARA CONSULTAR SERVICIOS DE ALIMENTACION CONSUMIDOS     **USADO
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
  EliminarSolicitud(id: number, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/planComidas/eliminar/sol-comida/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
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
  EliminarComidaAprobada(id: number, fecha: any, id_empleado: number, datos: any) {
    const {user_name, ip} = datos;

    const data = { user_name, ip,};

    const url = `${(localStorage.getItem('empresaURL') as string)}/planComidas/eliminar/plan-comida/${id}/${fecha}/${id_empleado}`;
    const httpOtions = {
      body: data
    };
    return this.http.request('delete', url, httpOtions);
  }
  // ELIMINAR REGISTRO DE PLANIFICACION
  EliminarRegistro(id: number, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/planComidas/eliminar/registro/${id}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }
  // ELIMINAR PLANIFICACION DE ALIMENTACION DE UN USUARIO   **USADO
  EliminarPlanComida(id: number, id_empleado: number, datos: any) {
    const url = `${(localStorage.getItem('empresaURL') as string)}/planComidas/eliminar/plan-comida/${id}/${id_empleado}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
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

  // ALERTAS DE NOTIFICACION DE SOLICITUD Y PLANIFICACION DE SERVICIO DE ALIMENTACION   **USADO
  EnviarMensajePlanComida(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/planComidas/send/planifica/`, data);
  }
  // ENVIAR CORREO DESDE APLICACION WEB
  EnviarCorreo(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/planComidas/mail-noti`, datos);
  }
  // ENVIAR CORREO DE PLANIFICACION DE ALIMENTACION   **USADO
  EnviarCorreoPlan(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/planComidas/mail-plan-comida`, datos);
  }

}
