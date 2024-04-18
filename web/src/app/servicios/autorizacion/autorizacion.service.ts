import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Socket } from 'ngx-socket-io';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class AutorizacionService {

  constructor(
    private http: HttpClient,
    private socket: Socket
  ) { }


  // METODO PARA BUSCAR APROBACIONES DE PERMISO
  BuscarAutorizacionPermiso(id_permiso: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/autorizaciones/by-permiso/${id_permiso}`);
  }




  // realtime
  EnviarNotificacionRealTimeEstado(data: any) {
    this.socket.emit('nueva_notificacion', data);
  }


  // ACTUALIZACION DE APROBACION
  ActualizarAprobacion(id: number, datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/autorizaciones/${id}/estado-aprobacion`, datos);
  }


  // catalogo de notificaciones
  getAutorizacionesRest() {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/autorizaciones`);
  }


  getUnaAutorizacionByVacacionRest(id_vacacion: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/autorizaciones/by-vacacion/${id_vacacion}`);
  }

  getUnaAutorizacionByHoraExtraRest(id_hora_extra: number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/autorizaciones/by-hora-extra/${id_hora_extra}`);
  }

  postAutorizacionesRest(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/autorizaciones`, data);
  }


  PutEstadoAutoPermisoMultiple(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/autorizaciones/estado-permiso/multiple`, datos);
  }

  PutEstadoAutoHoraExtra(id: number, datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/autorizaciones/${id}/estado-hora-extra`, datos);
  }

  PutEstadoAutoPlanHoraExtra(id: number, datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/autorizaciones/${id}/estado-plan-hora-extra`, datos);
  }
}
