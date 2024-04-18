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
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/horasExtras`, data);
  }

  ListarHorasExtras() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/horasExtras`);
  }

  EliminarRegistro(id: number) {
    return this.http.delete(`${(localStorage.getItem('empresaURL') as string)}/horasExtras/eliminar/${id}`);
  }

  CrearXML(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/horasExtras/xmlDownload`, data);
  }

  ObtenerUnaHoraExtra(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/horasExtras/${id}`);
  }

  ActualizarDatos(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/horasExtras`, datos);
  }
}
