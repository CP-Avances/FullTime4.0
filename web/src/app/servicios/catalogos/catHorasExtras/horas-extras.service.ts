import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class HorasExtrasService {

  constructor(
    private http: HttpClient
  ) { }

  // catalogo de horas extras

  postHoraExtraRest(data: any) {
    return this.http.post<any>(`${environment.url}/horasExtras`, data);
  }

  ListarHorasExtras() {
    return this.http.get(`${environment.url}/horasExtras`);
  }

  EliminarRegistro(id: number) {
    return this.http.delete(`${environment.url}/horasExtras/eliminar/${id}`);
  }

  CrearXML(data: any) {
    return this.http.post(`${environment.url}/horasExtras/xmlDownload`, data);
  }

  ObtenerUnaHoraExtra(id: number) {
    return this.http.get(`${environment.url}/horasExtras/${id}`);
  }

  ActualizarDatos(datos: any) {
    return this.http.put(`${environment.url}/horasExtras`, datos);
  }
}
