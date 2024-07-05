import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VacunasService {

  constructor(
    private http: HttpClient
  ) { }

  // METODO DE BUSQUEDA DE DATOS DE VACUNAS LISTA sucursales[regimenes[departamentos[cargos[empleados]]]]
  ReporteVacunasMultiples(data: any) {
    console.log('recibiendo data', data)
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado-vacunas-multiples/vacunas-multiples/`, data);
  }

  // METODO DE BUSQUEDA DE DATOS DE VACUNAS LISTA sucursales[empleados]]
  ReporteVacunasMultiplesCargoRegimen(data: any) {
    console.log('recibiendo data', data)
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/empleado-vacunas-multiples/vacunas-multiples-cargos-regimen/`, data);
  }

}
