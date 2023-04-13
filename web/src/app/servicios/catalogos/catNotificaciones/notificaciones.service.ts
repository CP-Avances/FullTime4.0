import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {

  constructor(
    private http: HttpClient
  ) { }

  // catalogo de notificaciones
  getNotificacionesRest() {
    return this.http.get(`${environment.url}/notificaciones`);
  }

  getNotiByDepaRest(id_depa: number) {
    return this.http.get(`${environment.url}/notificaciones/depa/${id_depa}`);
  }

  postNotificacionesRest(data: any) {
    return this.http.post(`${environment.url}/notificaciones`, data).pipe(
      catchError(data));
  }

  BuscarNotificacionPermiso(id: number) {
    return this.http.get(`${environment.url}/notificaciones/notificacionPermiso/${id}`);
  }

  ObtenerInformacionRest() {
    console.log('entro');
    return this.http.get(`${environment.url}/notificaciones/listar/final`);
  }
}
