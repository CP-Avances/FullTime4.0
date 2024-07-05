import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class PeriodoVacacionesService {
  constructor(
    private http: HttpClient,
  ) { }

  // BUSCAR ID PERIODO DE VACACIONES
  BuscarIDPerVacaciones(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/perVacacion/buscar/${id}`);
  }

  CrearPerVacaciones(datos: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/perVacacion`, datos);
  }

  ObtenerPeriodoVacaciones(codigo: string | number) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/perVacacion/infoPeriodo/${codigo}`);
  }
  
  ActualizarPeriodoV(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/perVacacion`, datos);
  }

}
