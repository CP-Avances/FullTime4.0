import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class VacunasService {

  constructor(
    private http: HttpClient
  ) { }

  // METODO DE BUSQUEDA DE DATOS DE VACUNAS
  ReporteVacunasMultiples(data: any) {
    return this.http.post<any>(`${environment.url}/empleado-vacunas-multiples/vacunas-multiples/`, data);
  }

}
