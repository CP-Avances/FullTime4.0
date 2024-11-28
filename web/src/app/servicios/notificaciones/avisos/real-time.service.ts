import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})

export class RealTimeService {

  constructor(
    private http: HttpClient,
    private socket: Socket
  ) {
  }

  // METODO PARA RECIBIR NOTIFICACION DE AVISOS EN TIEMPO REAL    **USADO
  RecibirNuevosAvisos(data: any) {
    this.socket.emit('nuevo_aviso', data);
  }

  // METODO DE BUSQUEDA DE CONFIGURACION DE RECEPCION DE NOTIFICACIONES    **USADO
  ObtenerConfiguracionEmpleado(id_empleado: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/noti-real-time/config/${id_empleado}`);
  }
  // METODO DE BUSQUEDA DE CONFIGURACION DE RECEPCION DE NOTIFICACIONES    **USADO
  ObtenerConfiguracionEmpleadoMultiple(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/noti-real-time/config-multiple`, datos);
  }


  // METODO PARA INGRESAR NOTIFICACIONES DE PERMISOS
  IngresarNotificacionEmpleado(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/noti-real-time`, datos);
  }

  ObtenerUnaNotificacion(id: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/noti-real-time/one/${id}`);
  }

  ObtenerNotificacionesAllReceives(id_empleado: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/noti-real-time/all-receives/${id_empleado}`);
  }


  ActualizarVistaNotificacion(id_realtime: number, data: any) {
    data.append('visto', true);
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/noti-real-time/vista/${id_realtime}`, data);
  }

  EliminarNotificaciones(Seleccionados: any) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/noti-real-time/eliminar-multiples/avisos`, Seleccionados); //Eliminacion de datos seleccionados.
  }

  /** ************************************************************************************ **
   ** **                        METODOS PARA CONFIGURAR_ALERTAS                         ** **
   ** ************************************************************************************ **/

  // METODO PARA REGISTRAR CONFIGURACION DE RECEPCION DE NOTIFICACIONES     **USADO
  IngresarConfigNotiEmpleado(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/noti-real-time/config`, datos);
  }

  // METODO PARA REGISTRAR CONFIGURACION DE RECEPCION DE NOTIFICACIONES     **USADO
  IngresarConfigNotiEmpleadoMultiple(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/noti-real-time/config-multiple-crear`, datos);
  }


  // METODO PARA ACTUALIZAR CONFIGURACION DE RECEPCION DE NOTIFICACIONES     **USADO
  ActualizarConfigNotiEmpl(id_empleado: number, datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/noti-real-time/config/noti-put/${id_empleado}`, datos);
  }

  // METODO PARA ACTUALIZAR CONFIGURACION DE RECEPCION DE NOTIFICACIONES     **USADO
  ActualizarConfigNotiEmplMultiple(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/noti-real-time/config/noti-put-multiple`, datos);
  }

  // METODO PARA BUSCAR NOTIFICACIONES RECIBIDAS POR UN USUARIO
  ObtenerNotasUsuario(id_empleado: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/noti-real-time/receives/${id_empleado}`);
  }

  // METODO PARA ENVIO DE CORREO MULTIPLE
  EnviarCorreoMultiple(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/noti-real-time/mail-multiple`, datos);
  }

  /** ************************************************************************************ **
   ** **                 METODOS DE CONSULTA DE DATOS DE COMUNICADOS                    ** **
   ** ************************************************************************************ **/

  // METODO PARA ENVIO DE CORREO DE COMUNICADOS    **USADO
  EnviarCorreoComunicado(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/noti-real-time/mail-comunicado`, datos);
  }

  // METODO PARA ENVIO DE NOTIFICACION DE COMUNICADOS   **USADO
  EnviarMensajeGeneral(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/noti-real-time/noti-comunicado/`, data);
  }

}
