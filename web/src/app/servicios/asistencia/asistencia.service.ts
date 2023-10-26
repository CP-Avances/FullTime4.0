import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {

  constructor(
    private http: HttpClient,
  ) { }

  ConsultarAsistencia(data: any) {
    return this.http.post<any>(`${environment.url}/asistencia-usuarios/buscar-asistencia`, data);
  }

}
