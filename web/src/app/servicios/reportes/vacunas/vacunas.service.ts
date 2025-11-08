import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VacunasService {

  constructor(
    private http: HttpClient
  ) { }

  // METODO DE BUSQUEDA DE DATOS DE VACUNAS    **USADO**
  ReporteVacunasMultiples(data: any) {
    return this.http.post<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado-vacunas-multiples/vacunas-multiples/`, data);
  }

}
