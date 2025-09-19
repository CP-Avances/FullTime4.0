import { SocketService } from 'src/app/servicios/socket/socket.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})

export class RealTimeService {

  socket: Socket | null = null;

  constructor(
    private http: HttpClient,
    private socketService: SocketService,
  ) {
    this.socket = this.socketService.getSocket();
  }

  // METODO PARA RECIBIR NOTIFICACION DE AVISOS EN TIEMPO REAL    **USADO**
  RecibirNuevosAvisos(data: any) {
    if (!this.socket) return;
    this.socket.emit('nuevo_aviso', data);
  }


  /** ************************************************************************************ **
   ** **                        METODOS PARA CONFIGURAR_ALERTAS                         ** **
   ** ************************************************************************************ **/

  // METODO PARA REGISTRAR CONFIGURACION DE RECEPCION DE NOTIFICACIONES     **USADO**
  IngresarConfigNotiEmpleado(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/noti-real-time/config`, datos);
  }

  // METODO PARA REGISTRAR CONFIGURACION DE RECEPCION DE NOTIFICACIONES     **USADO**
  IngresarConfigNotiEmpleadoMultiple(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/noti-real-time/config-multiple-crear`, datos);
  }

  // METODO PARA ACTUALIZAR CONFIGURACION DE RECEPCION DE NOTIFICACIONES     **USADO**
  ActualizarConfigNotiEmpl(id_empleado: number, datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/noti-real-time/config/noti-put/${id_empleado}`, datos);
  }

  // METODO PARA ACTUALIZAR CONFIGURACION DE RECEPCION DE NOTIFICACIONES     **USADO**
  ActualizarConfigNotiEmplMultiple(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/noti-real-time/config/noti-put-multiple`, datos);
  }

  // METODO DE BUSQUEDA DE CONFIGURACION DE RECEPCION DE NOTIFICACIONES - MODULOS    **USADO**
  ObtenerConfiguracionEmpleado(id_empleado: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/noti-real-time/config/${id_empleado}`);
  }

  // METODO DE BUSQUEDA DE CONFIGURACION DE RECEPCION DE NOTIFICACIONES    **USADO**
  ObtenerConfiguracionEmpleadoMultiple(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/noti-real-time/config-multiple`, datos);
  }

  // METODO PARA BUSCAR NOTIFICACIONES - MODULOS RECIBIDAS POR UN USUARIO    **USADO**
  ObtenerNotasUsuario(id_empleado: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/noti-real-time/receives/${id_empleado}`);
  }

  // METODO DE BUSQUEDA DE TODAS LAS NOTIFICACCIONES - MODULOS --VERIFICAR **USADO**
  ObtenerNotificacionesAllReceives(id_empleado: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/noti-real-time/all-receives/${id_empleado}`);
  }

  // METODO PARA ACTUALIZAR ESTADO DE LAS NOTIFICACIONES - MODULOS    **USADO**
  ActualizarVistaNotificacion(id_realtime: number, data: any) {
    data.append('visto', true);
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/noti-real-time/vista/${id_realtime}`, data);
  }

  // METODO PARA ELIMINAR VARIAS NOTIFICACIONES  --VERIFICAR   **USADO**
  EliminarNotificaciones(Seleccionados: any) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/noti-real-time/eliminar-multiples/avisos`, Seleccionados); //Eliminacion de datos seleccionados.
  }

  // METODO PARA OBTENER UNA NOTIFICACION - MODULOS   **USADO**
  ObtenerUnaNotificacion(id: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/noti-real-time/one/${id}`);
  }


  /** ************************************************************************************ **
   ** **                 METODOS DE CONSULTA DE DATOS DE COMUNICADOS                    ** **
   ** ************************************************************************************ **/

  // METODO PARA ENVIO DE CORREO DE COMUNICADOS    **USADO**
  EnviarCorreoComunicado(datos: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/noti-real-time/mail-comunicado`, datos);
  }

  // METODO PARA ENVIO DE NOTIFICACION DE COMUNICADOS   **USADO**
  EnviarMensajeGeneralMultiple(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/noti-real-time/noti-comunicado-multiple/`, data);
  }


}
