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

  ReporteVacunasMultiples(data: any) {
    console.log('recibiendo data', data)
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado-vacunas-multiples/vacunas-multiples/`, data);
  }

  ReporteVacunasMultiplesCargoRegimen(data: any) {
    console.log('recibiendo data', data)
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado-vacunas-multiples/vacunas-multiples-cargos-regimen/`, data);
  }

}
