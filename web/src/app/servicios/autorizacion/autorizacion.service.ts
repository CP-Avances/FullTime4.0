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
    return this.http.get<any>(`${environment.url}/autorizaciones/by-permiso/${id_permiso}`);
  }

  // ACTUALIZACION DE APROBACION
  ActualizarAprobacion(id: number, datos: any) {
    return this.http.put(`${environment.url}/autorizaciones/${id}/estado-aprobacion`, datos);
  }

  getUnaAutorizacionByVacacionRest(id_vacacion: number) {
    return this.http.get<any>(`${environment.url}/autorizaciones/by-vacacion/${id_vacacion}`);
  }

  getUnaAutorizacionByHoraExtraRest(id_hora_extra: number) {
    return this.http.get<any>(`${environment.url}/autorizaciones/by-hora-extra/${id_hora_extra}`);
  }

  postAutorizacionesRest(data: any) {
    return this.http.post(`${environment.url}/autorizaciones`, data);
  }

  PutEstadoAutoPermisoMultiple(datos: any) {
    return this.http.put(`${environment.url}/autorizaciones/estado-permiso/multiple`, datos);
  }

  // TODO: BUSCAR RUTA HASTA EL CONTROLADOR
  PutEstadoAutoHoraExtra(id: number, datos: any) {
    return this.http.put(`${environment.url}/autorizaciones/${id}/estado-hora-extra`, datos);
  }

}
